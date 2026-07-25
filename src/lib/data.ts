/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed 2026-07-25 ~19:55 UTC (live WMS APIs)
 *   Sources:
 *     - /wms/location/{id} — door occupancy for DOCK50-DOCK72 (spaceStatus/dockStatus)
 *     - /wms-bam/tasks/search-by-conditional — all tasks at Bay 4 dockIds
 *     - Customer: ORG-655875 = GURUNANDA, LLC
 *     - Location API occupancy: 16 doors space=OCCUPIED, 8 dock=OCCUPIED, 7 AVAILABLE
 *     - Total tasks at Bay 4 doors: 24 (11 LOAD + 13 RECEIVE)
 *     - Active tasks (IN_PROGRESS): 4 (2 LOAD + 2 RECEIVE)
 *     - CLOSED: 18, FORCE_CLOSED: 2
 *     - 13 anomaly doors: space OCCUPIED but no active LOAD/RECEIVE task
 *     - Appointment API: UNAVAILABLE (all parameter combinations return "No query condition found")
 *     - "Guru live out / in assign to Arnulfo": TASK-5326740 (LOAD, ARNULFO MUNGUIA, DOCK52)
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
  // OCCUPIED — doors with active LOAD/RECEIVE tasks (4 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "GABINO CARRASCO / DANIELA GONZALEZ",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5326788", "TASK-5326242"],
    duration: "ACTIVE",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5326740"],
    duration: "ACTIVE",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "EFREN SALVADOR",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5326026"],
    duration: "ACTIVE",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC / ORG-585450",
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // AVAILABLE — location empty + available (7 doors)
  // ═══════════════════════════════════════════════════════════════
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK65", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK66", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK67", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK68", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK69", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK71", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length;
const anomalyDoors = doors.filter((d) => d.anomaly).length;
const available = doors.filter((d) => d.status === "Available").length;

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors Occupied",
    value: `${occupied}/23`,
    numerator: occupied,
    denominator: TOTAL_DOORS,
    percentage: Math.round((occupied / TOTAL_DOORS) * 100),
  },
  {
    label: "Doors w/ Active Tasks",
    value: `${doorsWithTasks}`,
    numerator: doorsWithTasks,
    denominator: TOTAL_DOORS,
    percentage: Math.round((doorsWithTasks / TOTAL_DOORS) * 100),
  },
  {
    label: "Doors Available",
    value: `${available}`,
    numerator: available,
    denominator: TOTAL_DOORS,
    percentage: Math.round((available / TOTAL_DOORS) * 100),
  },
  {
    label: "Anomalies",
    value: `${anomalyDoors}`,
    numerator: anomalyDoors,
    denominator: TOTAL_DOORS,
    percentage: Math.round((anomalyDoors / TOTAL_DOORS) * 100),
  },
];

// Active assignee task counts — all Bay 4 tasks (IN_PROGRESS + CLOSED + FORCE_CLOSED)
// Source: /wms-bam/tasks/search-by-conditional (Jul 25 2026 ~19:55 UTC)
// 24 Bay 4 tasks total: 11 LOAD + 13 RECEIVE across DOCK50-DOCK72
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "DANIELA GONZALEZ", taskCount: 9 },
  { name: "ARNULFO MUNGUIA", taskCount: 5 },
  { name: "DANIEL BELTRAN", taskCount: 4 },
  { name: "FATIMA PONCE", taskCount: 3 },
  { name: "EFREN SALVADOR", taskCount: 1 },
  { name: "GABINO CARRASCO", taskCount: 1 },
  { name: "EDUARDO MEJIA", taskCount: 1 },
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

// Mix: 2 LOAD active + 2 RECEIVE active = 4 active dock-related tasks at Bay 4 doors
// All tasks: 11 LOAD + 13 RECEIVE = 24 total
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound (LOAD)", count: 11, total: 24 },
  { label: "Inbound (RECEIVE)", count: 13, total: 24 },
];

// Active inbound/outbound mix at Bay 4 doors
// 2 LOAD IN_PROGRESS + 2 RECEIVE IN_PROGRESS = 4 active
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 2, total: 4 },
  { label: "Inbound", count: 2, total: 4 },
];

// Schedule: Appointment API returned "No query condition found" for all parameter
// combinations. % scheduled inbounds received and % scheduled outbounds loaded UNAVAILABLE.
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

// All Bay 4 task records (DOCK50-DOCK72, July 25, 2026 ~19:55 UTC)
// 24 tasks total: 11 LOAD + 13 RECEIVE
// Active (IN_PROGRESS): 2 LOAD + 2 RECEIVE
// "Guru live out / in assign to Arnulfo": TASK-5326740 (LOAD, ARNULFO MUNGUIA, DOCK52)
export const assignments: TaskRecord[] = [
  // ────── OUTBOUND / LOAD — IN_PROGRESS (2) ──────
  {
    taskId: "TASK-5326788",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS",
    assignee: "GABINO CARRASCO",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5326740",
    dns: "LOAD — Guru → Arnulfo",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },

  // ────── OUTBOUND / LOAD — CLOSED (9) ──────
  {
    taskId: "TASK-5326500",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED",
    assignee: "EDUARDO MEJIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5326279",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED",
    assignee: "DANIEL BELTRAN",
    door: "DOCK61",
  },
  {
    taskId: "TASK-5326233",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5326207",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5326174",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED",
    assignee: "DANIEL BELTRAN",
    door: "DOCK60",
  },
  {
    taskId: "TASK-5326162",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5326081",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED",
    assignee: "DANIEL BELTRAN",
    door: "DOCK57",
  },
  {
    taskId: "TASK-5325679",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5325458",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED",
    assignee: "DANIEL BELTRAN",
    door: "DOCK54",
  },

  // ────── INBOUND / RECEIVE — IN_PROGRESS (2) ──────
  {
    taskId: "TASK-5326242",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · RN-5008977",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5326026",
    dns: "RECEIVE",
    customer: "AS EVER ENTERPRISES, LLC",
    pieces: "IN_PROGRESS · RN-189095/RN-189096",
    assignee: "EFREN SALVADOR",
    door: "DOCK55",
  },

  // ────── INBOUND / RECEIVE — CLOSED (9) ──────
  {
    taskId: "TASK-5326721",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED · RN-5008979",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5326351",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED · RN-5008976",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK67",
  },
  {
    taskId: "TASK-5325736",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED · RN-5009003",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK66",
  },
  {
    taskId: "TASK-5325095",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED · RN-5009058",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5325089",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED · RN-5008961",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK67",
  },
  {
    taskId: "TASK-5324879",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED · RN-189234",
    assignee: "FATIMA PONCE",
    door: "DOCK59",
  },
  {
    taskId: "TASK-5324745",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED · RN-5008966",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK60",
  },
  {
    taskId: "TASK-5324730",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED · RN-5008960",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5324728",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED · RN-5008959",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK62",
  },

  // ────── INBOUND / RECEIVE — FORCE_CLOSED (2) ──────
  {
    taskId: "TASK-5326143",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "FORCE_CLOSED · RN-5009086",
    assignee: "FATIMA PONCE",
    door: "DOCK66",
  },
  {
    taskId: "TASK-5325737",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "FORCE_CLOSED · RN-5008969",
    assignee: "FATIMA PONCE",
    door: "DOCK61",
  },
];
