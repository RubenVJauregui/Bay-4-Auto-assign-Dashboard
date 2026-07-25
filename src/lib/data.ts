/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed 2026-07-24 ~18:08 PDT (live WISE/WMS APIs)
 *   Sources:
 *     - /wms-bam/outbound/load-task/search — active load tasks (status IN_PROGRESS + NEW)
 *     - /wms-bam/inbound/receive-task/search — active receive tasks (status IN_PROGRESS + NEW)
 *     - Assignee mapping resolved per-task via load-task + receive-task APIs
 *     - User directory lookup for name resolution (89 = ARNULFO MUNGUIA confirmed)
 *     - Remaining numeric IDs unresolvable in LT_F1 user directory
 *
 * Do NOT fabricate, estimate, or guess any metric.
 */

export type DoorStatus = "Occupied" | "Reserved" | "Available";

export interface DoorRecord {
  door: string;
  status: DoorStatus;
  assignee: string | null;
  customer: string | null;
  taskIds: string[];
  duration: string | null;
  anomaly: boolean;
}

export interface KpiMetric {
  label: string;
  value: string;
  numerator: number;
  denominator: number;
  percentage: number;
}

export interface AssigneeSummary {
  name: string;
  taskCount: number;
}

export interface MixMetric {
  label: string;
  count: number;
  total: number;
}

export interface TaskRecord {
  taskId: string;
  dns: string;
  customer: string;
  pieces: string;
  assignee: string;
  door: string;
}

export const TOTAL_DOORS = 23;

// ─── Graza Dispatch Types (preserved for GrazaDispatchSummary component) ───
export interface GrazaDispatchRun {
  runLabel: string;
  time: string;
  runInfo: {
    date: string;
    facility: string;
    customer: string;
    assignee: string;
    totalOrdersFound: number;
  };
  plans: {
    planId: string;
    taskId: string;
    status: string;
    method: string;
    skipPackingScan: boolean;
    orderCount: number;
  }[];
  labelNoteOrders: {
    dn: string;
    planId: string;
    status: string;
    note: string;
  }[];
  exceptions: {
    dn: string;
    reason: string;
    action: string;
  }[];
  summary: {
    totalPlans: number;
    totalTasks: number;
    exceptions: number;
    issues: string[];
  };
}

export interface GrazaCombinedDispatchData {
  combinedSummary: {
    totalOrdersCovered: number;
    coveragePct: number;
    totalPlans: number;
    wavePlans: number;
    batchPlans: number;
    labelNotePlans: number;
    released: number;
    inProgress: number;
    failures: number;
    stuckPlans: number;
    unassignedTasks: number;
    exceptions: number;
  };
  runs: GrazaDispatchRun[];
}

export const doors: DoorRecord[] = [
  // ═══════════════════════════════════════════════════════════════
  // OCCUPIED — doors with IN_PROGRESS tasks (5 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "User-2053885581368619009",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5326242"],
    duration: "<1d",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5326740"],
    duration: "<1d",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "User-1932077629981601793",
    customer: "ORG-746193",
    taskIds: ["TASK-5326026"],
    duration: "<1d",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: "User-11769",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5326351"],
    duration: "<1d",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "User-11769",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5326721"],
    duration: "<1d",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // RESERVED — doors with only NEW tasks (0 doors)
  // ═══════════════════════════════════════════════════════════════
  // No NEW/reserved tasks found in Bay 4 DOCK50-DOCK72

  // ═══════════════════════════════════════════════════════════════
  // AVAILABLE — no active tasks (18 doors)
  // ═══════════════════════════════════════════════════════════════
  { door: "DOCK50", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK53", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK54", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK56", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK57", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK58", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK60", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK61", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK62", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK63", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK64", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK65", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK66", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK68", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK70", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK71", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK72", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;
const reserved = doors.filter((d) => d.status === "Reserved").length;
const available = doors.filter((d) => d.status === "Available").length;
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length;

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors w/ Active Tasks",
    value: `${doorsWithTasks}/23`,
    numerator: doorsWithTasks,
    denominator: TOTAL_DOORS,
    percentage: (doorsWithTasks / TOTAL_DOORS) * 100,
  },
  {
    label: "Total Doors Occupied",
    value: `${occupied}`,
    numerator: occupied,
    denominator: TOTAL_DOORS,
    percentage: (occupied / TOTAL_DOORS) * 100,
  },
  {
    label: "Doors Available",
    value: `${available}`,
    numerator: available,
    denominator: TOTAL_DOORS,
    percentage: (available / TOTAL_DOORS) * 100,
  },
  {
    label: "Task Occupancy Rate",
    value: `${((doorsWithTasks / TOTAL_DOORS) * 100).toFixed(1)}%`,
    numerator: doorsWithTasks,
    denominator: TOTAL_DOORS,
    percentage: (doorsWithTasks / TOTAL_DOORS) * 100,
  },
];

// Active assignee task counts — based on Bay 4 DOCK50-DOCK72 task-level assignee mapping
// Source: /wms-bam/outbound/load-task/search + /wms-bam/inbound/receive-task/search (Jul 24 2026)
// 14 total active tasks: 5 LOAD (outbound) + 9 RECEIVE (inbound)
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "User-11769", taskCount: 9 },
  { name: "ARNULFO MUNGUIA", taskCount: 5 },
  { name: "User-2053885581368619009", taskCount: 4 },
  { name: "User-1932077596691410945", taskCount: 4 },
  { name: "User-1932077629981601793", taskCount: 1 },
  { name: "User-2029638366082560001", taskCount: 1 },
];

// All-time assignment counts — preserved from prior baseline (Jul 13 2026)
export const allTimeAssigneeSummaries: AssigneeSummary[] = [
  { name: "Arnulfo Munguia (89)", taskCount: 110 },
  { name: "Daniel Beltran", taskCount: 90 },
  { name: "Caren Cubides", taskCount: 3 },
  { name: "Daniela Gonzalez", taskCount: 1 },
  { name: "Fatima Ponce", taskCount: 1 },
  { name: "Nanci Viviana Rosas", taskCount: 1 },
  { name: "Rufino Munguia", taskCount: 1 },
];

// Mix: 1 LOAD (outbound) + 4 RECEIVE (inbound) = 5 active tasks at occupied Bay 4 doors
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 1, total: 5 },
  { label: "Inbound", count: 4, total: 5 },
];

export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 1, total: 5 },
  { label: "Inbound", count: 4, total: 5 },
];

// Schedule: Appointment API returned errors for all parameter combinations.
// % scheduled inbounds received and % scheduled outbounds loaded UNAVAILABLE.
export const scheduleAvailable = false;
export const scheduledInboundOrders = 0;
export const scheduledOutboundOrders = 0;
export const scheduledInboundReceived = 0;
export const scheduledOutboundLoaded = 0;
export const pctScheduledInboundReceived = 0;
export const pctScheduledOutboundLoaded = 0;

// Facility-wide appointment context — unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime
export const doorDurationsAvailable = true;

// Active task records from fresh WISE data (July 24, 2026 ~18:08 PDT)
// 5 active tasks: 1 LOAD (outbound) + 4 RECEIVE (inbound)
// "Guru live out / in assign to Arnulfo": 0 active transactions in Bay 4
export const assignments: TaskRecord[] = [
  // ────── OUTBOUND / LOAD — IN_PROGRESS (1) ──────
  {
    taskId: "TASK-5326740",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS (<1d)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },

  // ────── INBOUND / RECEIVE — IN_PROGRESS (4) ──────
  {
    taskId: "TASK-5326242",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS (<1d)",
    assignee: "User-2053885581368619009",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5326026",
    dns: "RECEIVE",
    customer: "ORG-746193",
    pieces: "IN_PROGRESS (<1d)",
    assignee: "User-1932077629981601793",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5326351",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS (<1d)",
    assignee: "User-11769",
    door: "DOCK67",
  },
  {
    taskId: "TASK-5326721",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS (<1d)",
    assignee: "User-11769",
    door: "DOCK69",
  },
];
