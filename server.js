import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const IAM_BASE_URL = process.env.IAM_BASE_URL || 'https://iam.item.pub';
const WMS_API_BASE_URL = process.env.WMS_API_BASE_URL || 'https://wms-api.item.pub';
const WISE_SERVICE_USERNAME = process.env.WISE_SERVICE_USERNAME || '';
const WISE_SERVICE_PASSWORD = process.env.WISE_SERVICE_PASSWORD || '';
const TENANT_ID = process.env.TENANT_ID || 'LT';
const FACILITY_ID = process.env.FACILITY_ID || 'LT_F1';
const TIMEZONE = process.env.TIMEZONE || 'America/Los_Angeles';

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
    console.error('WMS password login failed:', data?.message || data?.msg || data?.code || res.status);
    return null;
  } catch (err) {
    console.error('WMS password login error:', err.message);
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

  try {
    const entryRes = await wmsPost('wms-bam/yms/entry-ticket/search', {
      currentPage: 1,
      pageSize: 20,
      statuses: ['IN_YARD'],
    }, token);
    if (entryRes.code === 0 && Array.isArray(entryRes.data)) {
      results.inYardRows = entryRes.data.map(e => ({
        trailer: e.trailerNo || e.equipmentNo || e.id?.slice(0, 8) || '-',
        rn: `${e.trailerNo || '-'} | ${e.receiptNo || e.referenceNo || '-'}`,
        checkIn: e.checkInTime ? new Date(e.checkInTime).toLocaleString('en-US', { timeZone: TIMEZONE, month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-',
        timeInYard: e.timeInYard || '-',
        customer: e.customerName || e.customerId || 'GURUNANDA, LLC',
        location: e.locationId || e.yardLocation || '-',
        assignee: e.assignee || '-',
      }));
    }
  } catch (err) {
    console.error('Entry ticket fetch error:', err.message);
  }

  try {
    const orderRes = await wmsPost('wms-bam/outbound/order/raw-search', {
      currentPage: 1,
      pageSize: 100,
      statuses: ['PLANNED'],
      sortingFields: [{ field: 'createdTime', orderBy: 'DESC' }],
    }, token);
    if (orderRes.code === 0 && Array.isArray(orderRes.data)) {
      results.orderRows = orderRes.data.map(o => ({
        id: o.referenceNo || o.id?.slice(0, 12) || '-',
        customer: o.customerId || 'GURUNANDA, LLC',
        status: o.status || 'Planned',
        baseQty: o.itemLineTotalQty || o.totalPallets || 0,
        orderType: o.orderType || 'Regular',
        reference: o.poNo || o.referenceNo || '-',
        shipToName: o.shipToAddress?.name || o.destination || '-',
        scheduleDate: o.scheduleDate || o.appointmentTime || '-',
        createdTime: o.createdTime || '-',
      }));
    }
  } catch (err) {
    console.error('Order fetch error:', err.message);
  }

  try {
    const loadRes = await wmsPost('wms-bam/outbound/load/search-by-paging', {
      currentPage: 1,
      pageSize: 20,
      statuses: ['NEW', 'LOADING'],
      sortingFields: [{ field: 'createdTime', orderBy: 'DESC' }],
    }, token);
    const loadData = loadRes.code === 0 ? (Array.isArray(loadRes.data) ? loadRes.data : loadRes.data?.records || []) : [];
    results.shippingRows = loadData.map(l => ({
      id: l.loadNo || l.id?.slice(0, 12) || '-',
      customer: l.customerId || 'GURUNANDA, LLC',
      dnStatus: l.status === 'LOADING' ? 'PICKED' : l.status || 'NEW',
      loadStatus: l.status || 'NEW',
      dock: l.dockId || '-',
      et: l.trailerNo || l.equipmentNo || '-',
      assignee: l.assignee || '-',
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
