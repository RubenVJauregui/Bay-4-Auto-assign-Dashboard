/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed 2026-07-13 ~15:07 PDT (live WISE/WMS APIs)
 *   Sources:
 *     - /wms-bam/outbound/load-task/search — active load tasks (status IN_PROGRESS + NEW)
 *     - /wms-bam/inbound/receive-task/search — active receive tasks (status IN_PROGRESS + NEW)
 *     - Assignee mapping resolved per-task via load-task + receive-task APIs
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
  // OCCUPIED — doors with IN_PROGRESS tasks (4 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "daira gonzalez / ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5090739", "TASK-5315009"],
    duration: "~265d",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA / Nanci Viviana Rosas",
    customer: "GURUNANDA, LLC / KARAKA, LLC",
    taskIds: ["TASK-5314679", "TASK-5312023"],
    duration: "~3.8d",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "DANIEL BELTRAN",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5314973"],
    duration: "<1d",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA / RUFINO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5315021", "TASK-5314912"],
    duration: "<1d",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // RESERVED — doors with only NEW tasks (3 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK55",
    status: "Reserved",
    assignee: "Nanci Viviana Rosas",
    customer: "KARAKA, LLC",
    taskIds: ["TASK-5314391"],
    duration: "<1d",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Reserved",
    assignee: "RUFINO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5314517"],
    duration: "<1d",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Reserved",
    assignee: "RUFINO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5314897"],
    duration: "<1d",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // AVAILABLE — no active tasks (16 doors)
  // ═══════════════════════════════════════════════════════════════
  { door: "DOCK52", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK54", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK58", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
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
    label: "In Progress (Occupied)",
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
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 3 },
  { name: "RUFINO MUNGUIA", taskCount: 3 },
  { name: "Nanci Viviana Rosas", taskCount: 2 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
];

// All-time assignment counts — preserved from prior baseline
export const allTimeAssigneeSummaries: AssigneeSummary[] = [
  { name: "Arnulfo Munguia (89)", taskCount: 110 },
  { name: "Daniel Beltran", taskCount: 90 },
  { name: "Caren Cubides", taskCount: 3 },
  { name: "Daniela Gonzalez", taskCount: 1 },
  { name: "Fatima Ponce", taskCount: 1 },
  { name: "Nanci Viviana Rosas", taskCount: 1 },
  { name: "Rufino Munguia", taskCount: 1 },
];

// Mix: 5 LOAD (outbound) + 5 RECEIVE (inbound) = 10 active tasks at Bay 4 doors
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 5, total: 10 },
  { label: "Inbound", count: 5, total: 10 },
];

export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 5, total: 10 },
  { label: "Inbound", count: 5, total: 10 },
];

// Schedule: Appointment API returned 400 for all parameter combinations.
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

// Active task records from fresh WISE data (July 13, 2026 ~15:07 PDT)
// 10 active tasks: 5 LOAD (outbound) + 5 RECEIVE (inbound)
export const assignments: TaskRecord[] = [
  // ────── OUTBOUND / LOAD — IN_PROGRESS (3) ──────
  {
    taskId: "TASK-5314679",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS (<1d)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5314973",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS (<1d)",
    assignee: "DANIEL BELTRAN",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5315021",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS (<1d)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK56",
  },

  // ────── OUTBOUND / LOAD — NEW (2) ──────
  {
    taskId: "TASK-5315009",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW (<1d)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5314391",
    dns: "LOAD",
    customer: "KARAKA, LLC",
    pieces: "NEW (<1d)",
    assignee: "Nanci Viviana Rosas",
    door: "DOCK55",
  },

  // ────── INBOUND / RECEIVE — IN_PROGRESS (2) ──────
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS (~265d)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5312023",
    dns: "RECEIVE",
    customer: "KARAKA, LLC",
    pieces: "IN_PROGRESS (~3.8d)",
    assignee: "Nanci Viviana Rosas",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5314912",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS (<1d)",
    assignee: "RUFINO MUNGUIA",
    door: "DOCK56",
  },

  // ────── INBOUND / RECEIVE — NEW (2) ──────
  {
    taskId: "TASK-5314517",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW (<1d)",
    assignee: "RUFINO MUNGUIA",
    door: "DOCK57",
  },
  {
    taskId: "TASK-5314897",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW (<1d)",
    assignee: "RUFINO MUNGUIA",
    door: "DOCK59",
  },
];
