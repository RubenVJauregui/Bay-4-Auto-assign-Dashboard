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

const CONTAINER_FEED_URL = process.env.CONTAINER_FEED_URL || 'https://contenedores-priti-dashboard-03b000.coolify.item.pub/container-feed.json';

function isEffectivelyClosed(row) {
  const combined = ((row.receiptStatus || '') + ' ' + (row.note || '')).toUpperCase();
  const recClosed = combined.includes('RN CLOSED') || combined.includes('RN FORCE_CLOSED') ||
    (row.receiptStatus || '').toUpperCase().startsWith('CLOSED') ||
    (row.receiptStatus || '').toUpperCase().startsWith('FORCE_CLOSED');
  const putClosed = (row.putawayTaskStatus || '').toUpperCase().startsWith('CLOSED') ||
    (row.putawayTaskStatus || '').toUpperCase().startsWith('FORCE_CLOSED');
  const recTaskClosed = (row.receivingTaskStatus || '').toUpperCase().startsWith('CLOSED') ||
    (row.receivingTaskStatus || '').toUpperCase().startsWith('FORCE_CLOSED');
  if (recTaskClosed && putClosed) return true;
  if (recClosed && putClosed) return true;
  return false;
}

function isExcludedRow(row) {
  if ((row.color || '').toLowerCase() === 'excluded') return true;
  if (JSON.stringify(row).includes('EXCLUIDO')) return true;
  const receipt = (row.receipt || '').toUpperCase();
  if (receipt.includes('(CLOSED)') || receipt.includes('(FORCE_CLOSED)')) return true;
  if (isEffectivelyClosed(row)) return true;
  return false;
}

function getConditionLabel(row) {
  const colorLower = (row.color || '').toLowerCase();
  if (colorLower === 'yellow') return 'Alerta operativa';
  const inYard = row.inYard === true || (typeof row.inYard === 'string' && row.inYard.toLowerCase().startsWith('s'));
  const hasRN = !!(row.receipt);
  if (inYard && hasRN) return 'Arrived with RN';
  if (inYard && !hasRN) return 'Arrived without RN';
  return 'Not arrived';
}

function isInYard(row) {
  return row.inYard === true || (typeof row.inYard === 'string' && row.inYard.toLowerCase().startsWith('s'));
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
  const results = { success: true, inYardRows: [], orderRows: [], shippingRows: [], containerMessage: '' };

  // Section 1: Container feed from Priti dashboard (no WMS auth required)
  try {
    const feedRes = await fetch(CONTAINER_FEED_URL, { cache: 'no-store' });
    const feedData = await feedRes.json();
    const allRows = feedData.rows || [];
    const message = feedData.message || '';
    const filtered = allRows.filter(r => !isExcludedRow(r));
    results.inYardRows = filtered.map(r => ({
      container: r.container || r.containerNo || '',
      appointmentTime: r.appointmentTime || r.appointment || '',
      inYard: isInYard(r),
      condition: getConditionLabel(r),
      conditionColor: (r.color || '').toLowerCase() === 'yellow' ? 'yellow' : (isInYard(r) ? 'green' : 'default'),
      entryET: r.entryTicket || r.et || r.entry || '',
      status: r.status || r.receiptStatus || '',
      assignee: r.assignee || r.assigned || '',
      receipt: r.receipt || r.rn || '',
      note: r.note || '',
    }));
    if (filtered.length === 0 && message) {
      results.containerMessage = message;
    }
  } catch (err) {
    console.error('Container feed fetch error:', err.message);
    results.containerMessage = 'Container feed unavailable';
  }

  // Sections 2 & 3 require WMS auth
  const token = await getAccessToken();
  if (!token) {
    return res.json(results);
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
