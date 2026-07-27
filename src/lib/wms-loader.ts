const WMS_API_BASE_URL = process.env.WMS_API_BASE_URL || "https://unis.item.com/api";
const WISE_SERVICE_USERNAME = process.env.WISE_SERVICE_USERNAME || "";
const WISE_SERVICE_PASSWORD = process.env.WISE_SERVICE_PASSWORD || "";
const TENANT_ID = process.env.TENANT_ID || "LT";
const FACILITY_ID = process.env.FACILITY_ID || "LT_F1";
const TIMEZONE = process.env.TIMEZONE || "America/Los_Angeles";
const CUSTOMER_ID = process.env.CUSTOMER_ID || "ORG-655875";

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string | null> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  if (!WISE_SERVICE_USERNAME || !WISE_SERVICE_PASSWORD) return null;

  try {
    const res = await fetch(`${WMS_API_BASE_URL}/wms-bam/auth/login-by-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": TENANT_ID,
        "x-facility-id": FACILITY_ID,
        "item-time-zone": TIMEZONE,
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
    console.error("WMS login failed:", data?.message || data?.msg || res.status);
    return null;
  } catch (err: unknown) {
    console.error("WMS login error:", err instanceof Error ? err.message : err);
    return null;
  }
}

function wmsHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "x-tenant-id": TENANT_ID,
    "x-facility-id": FACILITY_ID,
    "item-time-zone": TIMEZONE,
  };
}

async function wmsPost(path: string, body: Record<string, unknown>, token: string) {
  const res = await fetch(`${WMS_API_BASE_URL}/${path}`, {
    method: "POST",
    headers: wmsHeaders(token),
    body: JSON.stringify(body),
  });
  return res.json();
}

function formatAppointmentPT(isoDate: string | null): string {
  if (!isoDate) return "";
  try {
    return new Date(isoDate).toLocaleString("en-US", {
      timeZone: TIMEZONE,
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export interface PlannedOrderRow {
  id: string;
  referenceNo: string;
  customer: string;
  status: string;
  orderType: string;
  baseQty: number;
  poNo: string;
  shipToName: string;
  appointmentTime: string;
  createdTime: string;
}

export interface PlannedOrdersResult {
  success: boolean;
  error: string;
  totalCount: number;
  rows: PlannedOrderRow[];
}

export async function loadPlannedOrders(): Promise<PlannedOrdersResult> {
  const result: PlannedOrdersResult = { success: false, error: "", totalCount: 0, rows: [] };

  const token = await getAccessToken();
  if (!token) {
    result.error = "Unable to authenticate with WISE";
    return result;
  }

  try {
    const body: Record<string, unknown> = {
      currentPage: 1,
      pageSize: 200,
      statuses: ["PLANNED"],
      sortingFields: [{ field: "createdTime", orderBy: "DESC" }],
    };
    if (CUSTOMER_ID) body.customerId = CUSTOMER_ID;

    const orderRes = await wmsPost("wms-bam/outbound/order/raw-search", body, token);

    if (orderRes.code === 0) {
      const data = Array.isArray(orderRes.data) ? orderRes.data : (orderRes.data?.records || []);
      result.totalCount = orderRes.data?.totalCount || orderRes.totalCount || data.length;
      result.rows = data.map((o: Record<string, unknown>) => ({
        id: String(o.id || ""),
        referenceNo: String(o.referenceNo || o.soNo || ""),
        customer: "GURUNANDA, LLC",
        status: "Planned",
        orderType: String(o.orderType || "Regular"),
        baseQty: Number(o.itemLineTotalQty || o.totalWeight || 0),
        poNo: String(o.poNo || o.referenceNo || ""),
        shipToName: (o.shipToAddress as Record<string, string>)?.name || (o.shipToAddress as Record<string, string>)?.storeName || String(o.destination || ""),
        appointmentTime: formatAppointmentPT(String(o.appointmentTime || o.scheduleDate || o.createdTime || "")),
        createdTime: String(o.createdTime || ""),
      }));
      result.success = true;
    } else {
      result.error = orderRes.msg || `WMS returned code ${orderRes.code}`;
    }
  } catch (err: unknown) {
    result.error = err instanceof Error ? err.message : "Failed to fetch orders";
  }

  return result;
}
