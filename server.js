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
const CUSTOMER_ID = process.env.CUSTOMER_ID || '';

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
  if (!checkInTime) return '-';
  const diff = Date.now() - new Date(checkInTime).getTime();
  if (diff < 0) return '-';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${days} Days ${hours} Hours ${minutes} Minutes`;
}

function formatPT(isoDate) {
  if (!isoDate) return '-';
  return new Date(isoDate).toLocaleString('en-US', {
    timeZone: TIMEZONE,
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

app.get('/api/dashboard', async (req, res) => {
  const token = await getAccessToken();
  if (!token) {
    return res.json({
      success: false,
      inYardRows: [],
      orderRows: [],
      shippingRows: [],
      error: 'Unable to authenticate with WISE',
    });
  }

  const results = { success: true, inYardRows: [], orderRows: [], shippingRows: [] };

  // Section 1: In-Yard FULL Equipment (entry tickets in yard, filtered to GURUNANDA customer)
  try {
    const body = {
      currentPage: 1,
      pageSize: 50,
      statuses: ['GATE_CHECKED_IN', 'WINDOW_CHECKED_IN', 'DOCK_CHECKED_IN', 'DROPPING_OFF_DELIVERY', 'WAITING'],
      sortingFields: [{ field: 'checkInStartTime', orderBy: 'DESC' }],
    };
    if (CUSTOMER_ID) {
      body.inboundCustomerIds = [CUSTOMER_ID];
    }
    const entryRes = await wmsPost('wms-bam/yms/entry-ticket/search', body, token);
    if (entryRes.code === 0) {
      const entries = Array.isArray(entryRes.data) ? entryRes.data : (entryRes.data?.records || []);
      results.inYardRows = entries.map(e => ({
        trailer: e.taskEquipmentId || e.vehicleId || e.entryId || '-',
        rn: `${e.taskEquipmentId || e.vehicleId || '-'} | ${e.inboundReceiptId || e.receiveTaskId || e.entryId || '-'}`,
        checkIn: formatPT(e.checkInStartTime || e.windowCheckInTime || e.createdTime),
        timeInYard: computeTimeInYard(e.checkInStartTime || e.windowCheckInTime || e.createdTime),
        customer: 'GURUNANDA, LLC',
        location: e.dropOffLocationId || e.pickUpLocationId || '-',
        assignee: '-',
      }));
    }
  } catch (err) {
    console.error('Entry ticket fetch error:', err.message);
  }

  // Section 2: PLANNED Outbound Orders (filtered to GURUNANDA customer)
  try {
    const body = {
      currentPage: 1,
      pageSize: 200,
      statuses: ['PLANNED'],
      sortingFields: [{ field: 'createdTime', orderBy: 'DESC' }],
    };
    if (CUSTOMER_ID) {
      body.customerId = CUSTOMER_ID;
    }
    const orderRes = await wmsPost('wms-bam/outbound/order/raw-search', body, token);
    if (orderRes.code === 0 && Array.isArray(orderRes.data)) {
      results.orderRows = orderRes.data.map(o => ({
        id: o.referenceNo || o.id || '-',
        customer: 'GURUNANDA, LLC',
        status: 'Planned',
        baseQty: o.itemLineTotalQty || o.totalWeight || 0,
        orderType: o.orderType || 'Regular',
        reference: o.poNo || o.referenceNo || '-',
        retailerName: o.retailerId || 'Gurunanda',
        shipToName: o.shipToAddress?.name || o.shipToAddress?.storeName || o.destination || '-',
        scheduleDate: o.appointmentTime || o.scheduleDate || o.createdTime || '-',
        createdTime: o.createdTime || '-',
      }));
    }
  } catch (err) {
    console.error('Order fetch error:', err.message);
  }

  // Section 3: Outbound Shipping (loads filtered to GURUNANDA customer)
  try {
    const body = {
      currentPage: 1,
      pageSize: 50,
      statuses: ['NEW', 'LOADING'],
      searchCount: true,
      sortingFields: [{ field: 'createdTime', orderBy: 'DESC' }],
    };
    if (CUSTOMER_ID) {
      body.customerIds = [CUSTOMER_ID];
    }
    const loadRes = await wmsPost('wms-bam/outbound/load/search-by-paging', body, token);
    const loadData = loadRes.code === 0 ? (Array.isArray(loadRes.data) ? loadRes.data : loadRes.data?.records || []) : [];
    results.shippingRows = loadData.map(l => ({
      id: l.loadNo || l.id || '-',
      customer: 'GURUNANDA, LLC',
      dnStatus: l.status === 'LOADING' ? 'PICKED' : (l.status || 'NEW'),
      loadStatus: l.status || 'NEW',
      dock: l.dockId || '-',
      et: l.trailerNo || l.equipmentNo || '-',
      assignee: '-',
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
