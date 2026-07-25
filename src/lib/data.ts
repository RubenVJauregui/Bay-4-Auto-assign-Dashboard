/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed 2026-07-25 ~13:33 UTC (live WISE/WMS APIs)
 *   Sources:
 *     - /wms-bam/outbound/load-task/search — active load tasks (status IN_PROGRESS + NEW)
 *     - /wms-bam/inbound/receive-task/search — active receive tasks (status IN_PROGRESS + NEW)
 *     - Assignee names resolved from task APIs (assigneeUserName field)
 *     - Customer names resolved from task APIs (customerName field)
 *     - Duration computed from task startTime to now (2026-07-25 06:32 PDT)
 *     - Appointment API: UNAVAILABLE (no valid query conditions)
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
  // OCCUPIED — doors with IN_PROGRESS tasks (3 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5326242", "TASK-5326788"],
    duration: "13h 22m",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5326740"],
    duration: "7h 15m",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "EFREN SALVADOR",
    customer: "AS EVER ENTERPRISES, LLC",
    taskIds: ["TASK-5326026"],
    duration: "15h 21m",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // RESERVED — doors with only NEW tasks (0 doors)
  // ═══════════════════════════════════════════════════════════════
  // No NEW/reserved tasks found in Bay 4 DOCK50-DOCK72

  // ═══════════════════════════════════════════════════════════════
  // AVAILABLE — no active tasks (20 doors)
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
  { door: "DOCK67", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK68", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK69", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
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

// Active assignee task counts — Bay 4 DOCK50-DOCK72 only
// Source: /wms-bam/outbound/load-task/search + /wms-bam/inbound/receive-task/search (Jul 25 2026 ~13:33 UTC)
// 4 active tasks: 2 LOAD (outbound) + 2 RECEIVE (inbound)
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "DANIELA GONZALEZ", taskCount: 1 },
  { name: "GABINO CARRASCO", taskCount: 1 },
  { name: "ARNULFO MUNGUIA", taskCount: 1 },
  { name: "EFREN SALVADOR", taskCount: 1 },
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

// Mix: 2 LOAD (outbound) + 2 RECEIVE (inbound) = 4 active tasks at occupied Bay 4 doors
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 2, total: 4 },
  { label: "Inbound", count: 2, total: 4 },
];

export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 2, total: 4 },
  { label: "Inbound", count: 2, total: 4 },
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

// Active task records from fresh WISE data (July 25, 2026 ~13:33 UTC)
// 4 active tasks: 2 LOAD (outbound) + 2 RECEIVE (inbound)
// "Guru live out / in assign to Arnulfo": 1 active — TASK-5326740 at DOCK52 (LOAD, ARNULFO MUNGUIA, GURUNANDA)
export const assignments: TaskRecord[] = [
  // ────── OUTBOUND / LOAD — IN_PROGRESS (2) ──────
  {
    taskId: "TASK-5326740",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS (7h 15m)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5326788",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS (2h 6m)",
    assignee: "GABINO CARRASCO",
    door: "DOCK51",
  },

  // ────── INBOUND / RECEIVE — IN_PROGRESS (2) ──────
  {
    taskId: "TASK-5326242",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS (13h 22m)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5326026",
    dns: "RECEIVE",
    customer: "AS EVER ENTERPRISES, LLC",
    pieces: "IN_PROGRESS (15h 21m)",
    assignee: "EFREN SALVADOR",
    door: "DOCK55",
  },
];
