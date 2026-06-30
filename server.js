import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dns from 'dns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dns.setDefaultResultOrder?.('ipv4first');

const app = express();
const PORT = process.env.PORT || 3000;

const WMS_API_BASE_URL = process.env.WMS_API_BASE_URL || 'https://unis.item.com/api';
const WISE_SERVICE_USERNAME = process.env.WISE_SERVICE_USERNAME || '';
const WISE_SERVICE_PASSWORD = process.env.WISE_SERVICE_PASSWORD || '';
const TENANT_ID = process.env.TENANT_ID || 'LT';
const FACILITY_ID = process.env.FACILITY_ID || 'LT_F1';
const TIMEZONE = process.env.TIMEZONE || 'America/Los_Angeles';
const CUSTOMER_ID = process.env.CUSTOMER_ID || 'ORG-655875';

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  if (!WISE_SERVICE_USERNAME || !WISE_SERVICE_PASSWORD) return null;

  try {
    const res = await fetch(`${WMS_API_BASE_URL}/wms-bam/auth/login-by-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': TENANT_ID,
        'x-facility-id': FACILITY_ID,
        'item-time-zone': TIMEZONE,
      },
      body: JSON.stringify({
        username: WISE_SERVICE_USERNAME,
        password: WISE_SERVICE_PASSWORD,
        tenantId: TENANT_ID,
      }),
    });
    const data = await res.json();
    const payload = data?.data || data;
    const token =
      payload?.accessToken ||
      payload?.access_token ||
      payload?.token ||
      payload?.idToken ||
      payload?.id_token ||
      payload?.jwt;
    if (res.ok && token) {
      cachedToken = token;
      tokenExpiry = Date.now() + ((payload?.expiresIn || payload?.expires_in || 3600) - 60) * 1000;
      return cachedToken;
    }
    console.error('WMS login failed:', data?.message || data?.msg || data?.code || res.status);
    return null;
  } catch (err) {
    console.error('WMS login error:', err.message, err.cause?.code || '');
    return null;
  }
}

function wmsHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'x-tenant-id': TENANT_ID,
    'x-facility-id': FACILITY_ID,
    'item-time-zone': TIMEZONE,
  };
}

async function wmsPost(path, body, token) {
  const res = await fetch(`${WMS_API_BASE_URL}/${path}`, {
    method: 'POST',
    headers: wmsHeaders(token),
    body: JSON.stringify(body),
  });
  return res.json();
}

function computeTimeInYard(checkInTime) {
  if (!checkInTime) return '';
  const diff = Date.now() - new Date(checkInTime).getTime();
  if (diff < 0) return '';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${days}d ${hours}h ${minutes}m`;
}

function formatPT(isoDate) {
  if (!isoDate) return '';
  try {
    return new Date(isoDate).toLocaleString('en-US', {
      timeZone: TIMEZONE,
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch { return ''; }
}

function friendlyRetailer(val) {
  if (!val) return 'Gurunanda';
  if (val.startsWith('ORG-')) return 'Gurunanda';
  return val;
}

app.get('/api/dashboard', async (req, res) => {
  const results = { success: true, inYardRows: [], orderRows: [], shippingRows: [] };

  const token = await getAccessToken();
  if (!token) {
    return res.json({ ...results, success: false, error: 'Unable to authenticate with WISE' });
  }

  // --- Section 1: In-Yard FULL Equipment via POST /wms-bam/yard/equipment/search ---
  try {
    const equipBody = {
      currentPage: 1,
      pageSize: 100,
      locationTypes: ['SPOT', 'DOCK'],
      statuses: ['FULL'],
      sortingFields: [{ field: 'gateCheckInTime', orderBy: 'DESC' }],
    };
    const equipRes = await wmsPost('wms-bam/yard/equipment/search', equipBody, token);
    let equipRows = [];
    if (equipRes.code === 0) {
      equipRows = Array.isArray(equipRes.data) ? equipRes.data : (equipRes.data?.records || []);
    }
    // Server-side filter to GURUNANDA customer since endpoint doesn't reliably support customerId
    if (CUSTOMER_ID) {
      equipRows = equipRows.filter(e => e.customerId === CUSTOMER_ID || e.customerName?.toUpperCase().includes('GURUNANDA'));
    }

    // Collect entry IDs for assignee lookup
    const entryIds = equipRows.map(e => e.checkInEntry || e.lastEntryId).filter(Boolean);

    // Optional: lookup assignees via load-task if we have entry IDs
    let assigneeMap = {};
    if (entryIds.length > 0) {
      try {
        const ltBody = {
          currentPage: 1,
          pageSize: 100,
          customerIds: [CUSTOMER_ID],
          entryIds: entryIds.slice(0, 50),
        };
        const ltRes = await wmsPost('wms-bam/outbound/load-task/search-by-paging', ltBody, token);
        const ltData = ltRes.code === 0 ? (Array.isArray(ltRes.data) ? ltRes.data : ltRes.data?.records || []) : [];
        for (const lt of ltData) {
          const eid = lt.entryId || lt.entryTicketId;
          if (eid) {
            assigneeMap[eid] = { assignee: lt.assigneeUserName || '', dock: lt.dockName || lt.dockId || '' };
          }
        }
      } catch {}
    }

    results.inYardRows = equipRows.map(e => {
      const entryId = e.checkInEntry || e.lastEntryId || '';
      const ltInfo = assigneeMap[entryId] || {};
      return {
        equipmentNo: e.equipmentNo || '',
        equipmentType: e.equipmentType || '',
        entryTicket: entryId,
        checkIn: formatPT(e.gateCheckInTime),
        gateCheckInTime: e.gateCheckInTime || '',
        timeInYard: computeTimeInYard(e.gateCheckInTime),
        customer: 'GURUNANDA, LLC',
        location: e.locationName || e.locationId || '',
        status: e.equipmentStatus || e.equipmentOperationStatus || '',
        carrierName: e.carrierName || '',
        loadIds: e.loadIds || [],
        receiptIds: e.receiptIds || [],
        assignee: ltInfo.assignee || '',
        dock: ltInfo.dock || '',
      };
    });
  } catch (err) {
    console.error('Yard equipment fetch error:', err.message);
  }

  // --- Section 2: PLANNED Outbound Orders ---
  try {
    const body = {
      currentPage: 1,
      pageSize: 100,
      statuses: ['PLANNED'],
      sortingFields: [{ field: 'createdTime', orderBy: 'DESC' }],
    };
    if (CUSTOMER_ID) body.customerId = CUSTOMER_ID;
    const orderRes = await wmsPost('wms-bam/outbound/order/raw-search', body, token);
    if (orderRes.code === 0 && Array.isArray(orderRes.data)) {
      results.orderRows = orderRes.data.slice(0, 100).map(o => ({
        id: o.referenceNo || o.id || '',
        customer: 'GURUNANDA, LLC',
        status: 'Planned',
        baseQty: o.itemLineTotalQty || o.totalWeight || 0,
        orderType: o.orderType || 'Regular',
        reference: o.poNo || o.referenceNo || '',
        retailerName: friendlyRetailer(o.retailerId),
        shipToName: o.shipToAddress?.name || o.shipToAddress?.storeName || o.destination || '',
        scheduleDate: o.appointmentTime || o.scheduleDate || o.createdTime || '',
        createdTime: o.createdTime || '',
      }));
    }
  } catch (err) {
    console.error('Order fetch error:', err.message);
  }

  // --- Section 3: Outbound Shipping via POST /wms-bam/outbound/load/search-by-paging ---
  try {
    const body = {
      currentPage: 1,
      pageSize: 50,
      statuses: ['NEW', 'WINDOW_CHECKIN_DONE', 'LOADING', 'LOADED'],
      searchCount: true,
      sortingFields: [{ field: 'createdTime', orderBy: 'DESC' }],
    };
    if (CUSTOMER_ID) body.customerIds = [CUSTOMER_ID];
    const loadRes = await wmsPost('wms-bam/outbound/load/search-by-paging', body, token);
    const loadData = loadRes.code === 0 ? (Array.isArray(loadRes.data) ? loadRes.data : loadRes.data?.records || []) : [];
    results.shippingRows = loadData.map(l => ({
      id: l.loadNo || l.id || '',
      customer: 'GURUNANDA, LLC',
      loadStatus: l.status || '',
      loadType: l.loadType || '',
      carrierName: l.carrierName || l.carrierId || '',
      proNo: l.proNo || '',
      trailerNo: l.trailerNo || l.equipmentNo || '',
      masterBolNo: l.masterBolNo || '',
      appointmentTime: formatPT(l.appointmentTime),
      dock: l.dockId || '',
      shipTo: l.destination || '',
      createdTime: l.createdTime || '',
      assignee: '',
    }));
  } catch (err) {
    console.error('Load fetch error:', err.message);
  }

  res.json(results);
});

app.use(express.static(join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Bay 4 Dashboard server running on port ${PORT}`);
});
