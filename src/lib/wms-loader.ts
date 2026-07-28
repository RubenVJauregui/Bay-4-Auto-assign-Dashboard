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
  recommendedAssignee: AssigneeRecommendation | null;
}

export interface AssigneeRecommendation {
  userId: string;
  name: string;
  reason:
    | "Current pick task assignment"
    | "30-day historical pick-task leader"
    | "Current load task assignment"
    | "Current receive task assignment"
    | "Current receive pre-assignment"
    | "30-day load history leader"
    | "30-day receive history leader";
  confidence: "high" | "medium";
}

type EquipmentDirection = "load" | "receive";

export interface InYardEquipmentRow {
  equipmentNo: string;
  entryTicket: string;
  checkInPdt: string;
  timeInYard: string;
  customer: string;
  equipmentType: "TRAILER";
  equipmentOperationStatus: string;
  locationId: string;
  locationName: string;
  entryIds: string[];
  loadIds: string[];
  receiptIds: string[];
  orderIds: string[];
  direction: EquipmentDirection | null;
  recommendedAssignee: AssigneeRecommendation | null;
}

export interface InYardEquipmentResult {
  success: boolean;
  error: string;
  rows: InYardEquipmentRow[];
}

export interface PlannedOrdersResult {
  success: boolean;
  error: string;
  totalCount: number;
  rows: PlannedOrderRow[];
}

interface HistoricalLeader {
  userId: string;
  name: string;
  count: number;
}

interface HistoricalEvidence {
  overall: HistoricalLeader | null;
  byProfile: Map<string, HistoricalLeader>;
}

function responseRows(response: Record<string, unknown>): Record<string, unknown>[] {
  const responseData = response.data;
  if (Array.isArray(responseData)) return responseData as Record<string, unknown>[];
  if (!responseData || typeof responseData !== "object") return [];

  const data = responseData as Record<string, unknown>;
  const rows = data.list ?? data.records;
  return Array.isArray(rows) ? rows as Record<string, unknown>[] : [];
}

function isSuccessfulResponse(response: Record<string, unknown>): boolean {
  return String(response.code) === "0";
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(stringValue).filter(Boolean);
}

function uniqueValues(...groups: string[][]): string[] {
  return Array.from(new Set(groups.flat().filter(Boolean)));
}

function taskOrderIds(task: Record<string, unknown>): string[] {
  const ids = new Set<string>();

  if (Array.isArray(task.orderIds)) {
    task.orderIds.forEach((orderId) => {
      const normalizedId = stringValue(orderId);
      if (normalizedId) ids.add(normalizedId);
    });
  }

  if (Array.isArray(task.pickItemLines)) {
    task.pickItemLines.forEach((line) => {
      if (!line || typeof line !== "object") return;
      const normalizedId = stringValue((line as Record<string, unknown>).orderId);
      if (normalizedId) ids.add(normalizedId);
    });
  }

  if (Array.isArray(task.loads)) {
    task.loads.forEach((load) => {
      if (!load || typeof load !== "object") return;
      const orderIds = (load as Record<string, unknown>).orderIds;
      stringArray(orderIds).forEach((orderId) => ids.add(orderId));
    });
  }

  return Array.from(ids);
}

function taskProfile(task: Record<string, unknown>): string {
  const pickType = stringValue(task.pickType);
  const pickMethod = stringValue(task.pickMethod);
  return pickType && pickMethod ? `${pickType}::${pickMethod}` : "";
}

function collectDisplayNames(tasks: Record<string, unknown>[]): Map<string, string> {
  const namesByUserId = new Map<string, string>();

  tasks.forEach((task) => {
    const assignments = [
      [stringValue(task.assigneeUserId), stringValue(task.assigneeUserName)],
      [stringValue(task.preAssigneeUserId), stringValue(task.preAssigneeUserName)],
    ];

    assignments.forEach(([userId, name]) => {
      if (userId && name) namesByUserId.set(userId, name);
    });
  });

  return namesByUserId;
}

function taskAssignment(
  task: Record<string, unknown>,
  namesByUserId: Map<string, string>,
): { userId: string; name: string } | null {
  const assigneeUserId = stringValue(task.assigneeUserId);
  const assigneeUserName = stringValue(task.assigneeUserName) || namesByUserId.get(assigneeUserId) || "";
  if (assigneeUserId || assigneeUserName) {
    return { userId: assigneeUserId, name: assigneeUserName || assigneeUserId };
  }

  const preAssigneeUserId = stringValue(task.preAssigneeUserId);
  const preAssigneeUserName = stringValue(task.preAssigneeUserName) || namesByUserId.get(preAssigneeUserId) || "";
  if (preAssigneeUserId || preAssigneeUserName) {
    return { userId: preAssigneeUserId, name: preAssigneeUserName || preAssigneeUserId };
  }

  return null;
}

function incrementLeaderCount(
  counts: Map<string, HistoricalLeader>,
  assignment: { userId: string; name: string },
) {
  const key = assignment.userId || assignment.name.toLocaleUpperCase();
  const current = counts.get(key);
  counts.set(key, {
    userId: assignment.userId,
    name: assignment.name,
    count: (current?.count ?? 0) + 1,
  });
}

function topLeader(counts: Map<string, HistoricalLeader>): HistoricalLeader | null {
  return Array.from(counts.values()).sort((left, right) =>
    right.count - left.count || left.name.localeCompare(right.name),
  )[0] ?? null;
}

function historicalLeader(
  tasks: Record<string, unknown>[],
  namesByUserId: Map<string, string>,
): HistoricalLeader | null {
  const counts = new Map<string, HistoricalLeader>();
  tasks.forEach((task) => {
    const assignment = taskAssignment(task, namesByUserId);
    if (assignment) incrementLeaderCount(counts, assignment);
  });
  return topLeader(counts);
}

function buildHistoricalEvidence(
  historicalTasks: Record<string, unknown>[],
  namesByUserId: Map<string, string>,
): HistoricalEvidence {
  const overallCounts = new Map<string, HistoricalLeader>();
  const profileCounts = new Map<string, Map<string, HistoricalLeader>>();

  historicalTasks.forEach((task) => {
    const assignment = taskAssignment(task, namesByUserId);
    if (!assignment) return;

    incrementLeaderCount(overallCounts, assignment);
    const profile = taskProfile(task);
    if (!profile) return;

    const counts = profileCounts.get(profile) ?? new Map<string, HistoricalLeader>();
    incrementLeaderCount(counts, assignment);
    profileCounts.set(profile, counts);
  });

  return {
    overall: topLeader(overallCounts),
    byProfile: new Map(
      Array.from(profileCounts.entries()).flatMap(([profile, counts]) => {
        const leader = topLeader(counts);
        return leader ? [[profile, leader] as const] : [];
      }),
    ),
  };
}

function recommendationForOrder(
  orderId: string,
  currentTasks: Record<string, unknown>[],
  namesByUserId: Map<string, string>,
  historicalEvidence: HistoricalEvidence,
): AssigneeRecommendation | null {
  const orderTasks = currentTasks.filter((task) => taskOrderIds(task).includes(orderId));

  for (const task of orderTasks) {
    const assignment = taskAssignment(task, namesByUserId);
    if (assignment) {
      return {
        ...assignment,
        reason: "Current pick task assignment",
        confidence: "high",
      };
    }
  }

  const matchingLeaders = orderTasks
    .map(taskProfile)
    .filter(Boolean)
    .map((profile) => historicalEvidence.byProfile.get(profile))
    .filter((leader): leader is HistoricalLeader => Boolean(leader))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
  const historicalLeader = matchingLeaders[0] ?? historicalEvidence.overall;

  if (!historicalLeader) return null;

  return {
    userId: historicalLeader.userId,
    name: historicalLeader.name,
    reason: "30-day historical pick-task leader",
    confidence: "medium",
  };
}

function equipmentDirection(equipment: Record<string, unknown>): EquipmentDirection | null {
  const operationStatus = stringValue(equipment.equipmentOperationStatus).toLocaleUpperCase();
  const receiptIds = uniqueValues(
    stringArray(equipment.receiptIds),
    [stringValue(equipment.receiptId)],
  );
  const loadIds = uniqueValues(
    stringArray(equipment.loadIds),
    [stringValue(equipment.loadId)],
  );

  if (receiptIds.length > 0 || /OFFLOAD|INBOUND|RECEIVE/.test(operationStatus)) return "receive";
  if (loadIds.length > 0 || /(^|_)(TO_LOAD|LOADING|LOAD_WAITING|OUTBOUND)($|_)/.test(operationStatus)) return "load";
  return null;
}

function taskMatchesEquipment(
  task: Record<string, unknown>,
  equipment: InYardEquipmentRow,
  direction: EquipmentDirection,
): boolean {
  const taskEntryId = stringValue(task.entryId);
  if (taskEntryId && equipment.entryIds.includes(taskEntryId)) return true;

  const taskIds = direction === "load"
    ? uniqueValues(
      stringArray(task.loadIds),
      Array.isArray(task.loads)
        ? task.loads.map((load) => load && typeof load === "object" ? stringValue((load as Record<string, unknown>).id) : "")
        : [],
    )
    : stringArray(task.receiptIds);
  const equipmentIds = direction === "load" ? equipment.loadIds : equipment.receiptIds;
  if (taskIds.some((taskId) => equipmentIds.includes(taskId))) return true;

  return direction === "load" && taskOrderIds(task).some((orderId) => equipment.orderIds.includes(orderId));
}

function currentAssignee(
  task: Record<string, unknown>,
  namesByUserId: Map<string, string>,
): { userId: string; name: string } | null {
  const userId = stringValue(task.assigneeUserId);
  const name = stringValue(task.assigneeUserName) || namesByUserId.get(userId) || "";
  return userId || name ? { userId, name: name || userId } : null;
}

function preAssignee(
  task: Record<string, unknown>,
  namesByUserId: Map<string, string>,
): { userId: string; name: string } | null {
  const userId = stringValue(task.preAssigneeUserId);
  const name = stringValue(task.preAssigneeUserName) || namesByUserId.get(userId) || "";
  return userId || name ? { userId, name: name || userId } : null;
}

function recommendationForEquipment(
  equipment: InYardEquipmentRow,
  currentLoadTasks: Record<string, unknown>[],
  currentReceiveTasks: Record<string, unknown>[],
  namesByUserId: Map<string, string>,
  loadHistoryLeader: HistoricalLeader | null,
  receiveHistoryLeader: HistoricalLeader | null,
): AssigneeRecommendation | null {
  if (equipment.direction === "load") {
    const matchingTasks = currentLoadTasks.filter((task) => taskMatchesEquipment(task, equipment, "load"));
    for (const task of matchingTasks) {
      const assignment = currentAssignee(task, namesByUserId);
      if (assignment) {
        return { ...assignment, reason: "Current load task assignment", confidence: "high" };
      }
    }

    return loadHistoryLeader ? {
      userId: loadHistoryLeader.userId,
      name: loadHistoryLeader.name,
      reason: "30-day load history leader",
      confidence: "medium",
    } : null;
  }

  if (equipment.direction === "receive") {
    const matchingTasks = currentReceiveTasks.filter((task) => taskMatchesEquipment(task, equipment, "receive"));
    for (const task of matchingTasks) {
      const assignment = currentAssignee(task, namesByUserId);
      if (assignment) {
        return { ...assignment, reason: "Current receive task assignment", confidence: "high" };
      }

      const preAssignment = preAssignee(task, namesByUserId);
      if (preAssignment) {
        return { ...preAssignment, reason: "Current receive pre-assignment", confidence: "high" };
      }
    }

    return receiveHistoryLeader ? {
      userId: receiveHistoryLeader.userId,
      name: receiveHistoryLeader.name,
      reason: "30-day receive history leader",
      confidence: "medium",
    } : null;
  }

  return null;
}

function taskRequestFilters(rows: InYardEquipmentRow[], direction: EquipmentDirection) {
  const directionRows = rows.filter((row) => row.direction === direction);
  const filters: Record<string, unknown> = {};
  const entryIds = uniqueValues(...directionRows.map((row) => row.entryIds));
  if (entryIds.length > 0) filters.entryIds = entryIds;

  if (direction === "load") {
    const loadIds = uniqueValues(...directionRows.map((row) => row.loadIds));
    const orderIds = uniqueValues(...directionRows.map((row) => row.orderIds));
    if (loadIds.length > 0) filters.loadIds = loadIds;
    if (orderIds.length > 0) filters.orderIds = orderIds;
  } else {
    const receiptIds = uniqueValues(...directionRows.map((row) => row.receiptIds));
    if (receiptIds.length > 0) filters.receiptIds = receiptIds;
  }

  return filters;
}

async function taskSearchRows(
  path: string,
  body: Record<string, unknown>,
  token: string,
): Promise<Record<string, unknown>[]> {
  try {
    const response = await wmsPost(path, body, token);
    return isSuccessfulResponse(response) ? responseRows(response) : [];
  } catch {
    return [];
  }
}

export async function loadInYardFullEquipment(): Promise<InYardEquipmentResult> {
  const result: InYardEquipmentResult = { success: false, error: "", rows: [] };
  const token = await getAccessToken();
  if (!token) {
    result.error = "Unable to authenticate with WISE";
    return result;
  }

  try {
    const equipmentResponse = await wmsPost("wms-bam/yard/equipment/search", {
      statuses: ["FULL"],
    }, token);

    if (!isSuccessfulResponse(equipmentResponse)) {
      result.error = equipmentResponse.msg || `WMS returned code ${equipmentResponse.code}`;
      return result;
    }

    const equipmentByKey = new Map<string, InYardEquipmentRow>();
    responseRows(equipmentResponse)
      .filter((equipment) => stringValue(equipment.customerId) === CUSTOMER_ID)
      .filter((equipment) => stringValue(equipment.equipmentType).toLocaleUpperCase() === "TRAILER")
      .filter((equipment) => stringValue(equipment.equipmentStatus).toLocaleUpperCase() === "FULL")
      .forEach((equipment) => {
        const equipmentNo = stringValue(equipment.equipmentNo);
        const entryIds = uniqueValues([
          stringValue(equipment.checkInEntry),
          stringValue(equipment.lastEntryId),
          stringValue(equipment.entryId),
        ]);
        const entryTicket = entryIds[0] || "";
        if (!equipmentNo) return;

        equipmentByKey.set(`${equipmentNo}::${entryTicket}`, {
          equipmentNo,
          entryTicket,
          checkInPdt: formatAppointmentPT(stringValue(equipment.gateCheckInTime)),
          timeInYard: stringValue(equipment.inYardTime),
          customer: stringValue(equipment.customerName) || "GURUNANDA, LLC",
          equipmentType: "TRAILER",
          equipmentOperationStatus: stringValue(equipment.equipmentOperationStatus),
          locationId: stringValue(equipment.locationId),
          locationName: stringValue(equipment.locationName),
          entryIds,
          loadIds: uniqueValues(stringArray(equipment.loadIds), [stringValue(equipment.loadId)]),
          receiptIds: uniqueValues(stringArray(equipment.receiptIds), [stringValue(equipment.receiptId)]),
          orderIds: uniqueValues(stringArray(equipment.orderIds), [stringValue(equipment.orderId)]),
          direction: equipmentDirection(equipment),
          recommendedAssignee: null,
        });
      });

    result.rows = Array.from(equipmentByKey.values());
    if (result.rows.length === 0) {
      result.success = true;
      return result;
    }

    const needsLoadEvidence = result.rows.some((row) => row.direction === "load");
    const needsReceiveEvidence = result.rows.some((row) => row.direction === "receive");
    const endTimeFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endTimeTo = new Date().toISOString();
    const activeStatuses = ["NEW", "IN_PROGRESS", "EXCEPTION"];
    const closedStatuses = ["CLOSED", "FORCE_CLOSED"];

    const [currentLoadTasks, currentReceiveTasks, historicalLoadTasks, historicalReceiveTasks] = await Promise.all([
      needsLoadEvidence ? taskSearchRows("wms-bam/outbound/load-task/search-by-paging", {
        customerIds: [CUSTOMER_ID],
        statuses: activeStatuses,
        ...taskRequestFilters(result.rows, "load"),
        currentPage: 1,
        pageSize: 200,
      }, token) : Promise.resolve([]),
      needsReceiveEvidence ? taskSearchRows("wms-bam/inbound/receive-task/search-by-paging", {
        customerIds: [CUSTOMER_ID],
        statuses: activeStatuses,
        ...taskRequestFilters(result.rows, "receive"),
        currentPage: 1,
        pageSize: 200,
      }, token) : Promise.resolve([]),
      needsLoadEvidence ? taskSearchRows("wms-bam/outbound/load-task/search-by-paging", {
        customerIds: [CUSTOMER_ID],
        statuses: closedStatuses,
        endTimeFrom,
        currentPage: 1,
        pageSize: 500,
      }, token) : Promise.resolve([]),
      needsReceiveEvidence ? taskSearchRows("wms-bam/inbound/receive-task/search-by-paging", {
        customerIds: [CUSTOMER_ID],
        statuses: closedStatuses,
        endTimePeriod: [endTimeFrom, endTimeTo],
        currentPage: 1,
        pageSize: 500,
      }, token) : Promise.resolve([]),
    ]);

    const namesByUserId = collectDisplayNames([
      ...currentLoadTasks,
      ...currentReceiveTasks,
      ...historicalLoadTasks,
      ...historicalReceiveTasks,
    ]);
    const loadHistoryLeader = historicalLeader(historicalLoadTasks, namesByUserId);
    const receiveHistoryLeader = historicalLeader(historicalReceiveTasks, namesByUserId);
    result.rows = result.rows.map((row) => ({
      ...row,
      recommendedAssignee: recommendationForEquipment(
        row,
        currentLoadTasks,
        currentReceiveTasks,
        namesByUserId,
        loadHistoryLeader,
        receiveHistoryLeader,
      ),
    }));
    result.success = true;
  } catch (err: unknown) {
    result.error = err instanceof Error ? err.message : "Failed to fetch in-yard equipment";
  }

  return result;
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
      customerId: CUSTOMER_ID,
      status: "PLANNED",
      currentPage: 1,
      pageSize: 30,
      sortingFields: [{ field: "createdTime", orderBy: "DESC" }],
    };

    const orderRes = await wmsPost("wms-bam/outbound/order/search-by-paging", body, token);

    if (isSuccessfulResponse(orderRes)) {
      const data = responseRows(orderRes);
      result.totalCount = orderRes.data?.totalCount ?? orderRes.totalCount ?? data.length;
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
        recommendedAssignee: null,
      }));

      const orderIds = result.rows.map((order) => order.id).filter(Boolean);
      if (orderIds.length > 0) {
        const endTimeFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const [currentTasksResult, historicalTasksResult] = await Promise.allSettled([
          wmsPost("wms-bam/outbound/pick-task/search-by-paging", {
            customerId: CUSTOMER_ID,
            orderIds,
            currentPage: 1,
            pageSize: 200,
          }, token),
          wmsPost("wms-bam/outbound/pick-task/search-by-paging", {
            customerId: CUSTOMER_ID,
            statuses: ["CLOSED", "FORCE_CLOSED"],
            endTimeFrom,
            currentPage: 1,
            pageSize: 500,
          }, token),
        ]);

        const currentTaskResponse = currentTasksResult.status === "fulfilled" && isSuccessfulResponse(currentTasksResult.value)
          ? currentTasksResult.value
          : null;
        const historicalTaskResponse = historicalTasksResult.status === "fulfilled" && isSuccessfulResponse(historicalTasksResult.value)
          ? historicalTasksResult.value
          : null;
        const currentTasks = currentTaskResponse ? responseRows(currentTaskResponse) : [];
        const historicalTasks = historicalTaskResponse ? responseRows(historicalTaskResponse) : [];
        const namesByUserId = collectDisplayNames([...currentTasks, ...historicalTasks]);
        const historicalEvidence = buildHistoricalEvidence(historicalTasks, namesByUserId);

        result.rows = result.rows.map((order) => ({
          ...order,
          recommendedAssignee: recommendationForOrder(
            order.id,
            currentTasks,
            namesByUserId,
            historicalEvidence,
          ),
        }));
      }

      result.success = true;
    } else {
      result.error = orderRes.msg || `WMS returned code ${orderRes.code}`;
    }
  } catch (err: unknown) {
    result.error = err instanceof Error ? err.message : "Failed to fetch orders";
  }

  return result;
}
