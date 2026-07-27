/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed 2026-07-25 ~23:50 UTC (live WMS APIs)
 *   Sources:
 *     - /wms/location/search — keyword DOCK5/DOCK6/DOCK7 for all 23 doors
 *       (fresh updatedTime, spaceStatus, dockStatus, entryId per door)
 *     - /wms-bam/tasks/search-by-conditional — all tasks at Bay 4 dockIds
 *     - Task detail lookups for active IN_PROGRESS tasks
 *     - Customer: ORG-655875 = GURUNANDA, LLC
 *       Customer: ORG-746193 = AS EVER ENTERPRISES, LLC
 *       Customer: ORG-585450 (co-occupant at DOCK70)
 *     - Total tasks at Bay 4 doors: 24 (13 RECEIVE + 11 LOAD)
 *     - Active tasks (IN_PROGRESS): 4 across 3 doors (DOCK51, DOCK52, DOCK55)
 *     - Space-level occupancy: 16/23 doors physically occupied
 *     - "Guru live out / in assign to Arnulfo": TASK-5326740 (LOAD, GURUNANDA,
 *       ARNULFO MUNGUIA on DOCK52, IN_PROGRESS since Jul 24 23:17 UTC)
 *     - Appointment API: UNAVAILABLE (all parameter combinations return 400)
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

export interface InYardEquipmentRecord {
  equipmentNo: string;
  entryTicket: string;
  checkInPdt: string;
  timeInYard: string;
  customer: string;
  equipmentType: "TRAILER";
}

export const TOTAL_DOORS = 23;

// Section 1 — In-Yard FULL Equipment (trailer-only display)
// Mapping: Equipment # = equipmentNo; Entry Ticket = checkInEntry / lastEntryId.
// User-confirmed Section 1 target row from WMS/Yard context.
export const inYardFullEquipment: InYardEquipmentRecord[] = [
  {
    equipmentNo: "MATU2617276",
    entryTicket: "ET-1128323",
    checkInPdt: "07/24/2026, 16:40:51",
    timeInYard: "2 Days 15 Hours 14 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
];

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
  // OCCUPIED — doors with active IN_PROGRESS tasks (3 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "GABINO CARRASCO / DANIELA GONZALEZ",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5326788", "TASK-5326242"],
    duration: "~19h / ~31h",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5326740"],
    duration: "~24h",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "EFREN SALVADOR",
    customer: "AS EVER ENTERPRISES, LLC",
    taskIds: ["TASK-5326026"],
    duration: "~27h",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // OCCUPIED — space-level occupied, no active task (13 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "since Jul 23 21:01 (44h)",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "since Jul 24 14:58 (26h)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "since Jul 24 15:59 (25h)",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "since Jul 23 11:59 (53h)",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "since Jul 24 08:48 (32h)",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "since Jul 22 12:14 (76h)",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "since Jul 24 10:26 (30h)",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "since Jul 24 11:35 (29h)",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "since Jul 23 06:56 (58h)",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "since Jul 23 20:59 (44h)",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "since Jul 21 21:06 (92h)",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "since Jul 23 20:57 (44h)",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "since Jul 23 20:57 (44h)",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // AVAILABLE — space-level empty (7 doors)
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
    label: "In Yard Full Trailers",
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

// Bay 4 task counts by assignee — all 24 tasks in DOCK50-DOCK72
// Source: /wms-bam/tasks/search-by-conditional (Jul 25 2026 ~23:50 UTC)
// 13 RECEIVE + 11 LOAD; 4 IN_PROGRESS + 20 CLOSED/FORCE_CLOSED
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

// Mix: 13 RECEIVE + 11 LOAD = 24 total (54% inbound / 46% outbound)
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 13, total: 24 },
  { label: "Outbound (LOAD)", count: 11, total: 24 },
];

// Active inbound/outbound mix at Bay 4 doors (IN_PROGRESS only)
// 2 RECEIVE + 2 LOAD IN_PROGRESS = 4 active tasks across 3 doors
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

// Door occupancy duration: available from task startTime (active tasks) and space updatedTime
export const doorDurationsAvailable = true;

// All Bay 4 task records (DOCK50-DOCK72, July 25, 2026 ~23:08 UTC)
// 24 tasks total: 13 RECEIVE + 11 LOAD
// Active (IN_PROGRESS): 2 RECEIVE + 2 LOAD across DOCK51, DOCK52, DOCK55
// "Guru live out / in assign to Arnulfo": 0 Bay 4 dock tasks match. Closest: TASK-5326740 (LOAD, ARNULFO, DOCK52)
export const assignments: TaskRecord[] = [
  // ────── OUTBOUND / LOAD — IN_PROGRESS (2) ──────
  {
    taskId: "TASK-5326788",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~19h",
    assignee: "GABINO CARRASCO",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5326740",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~24h · LOADING",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },

  // ────── INBOUND / RECEIVE — IN_PROGRESS (2) ──────
  {
    taskId: "TASK-5326242",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~30h · RN-5008977",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5326026",
    dns: "RECEIVE",
    customer: "AS EVER ENTERPRISES, LLC",
    pieces: "IN_PROGRESS · ~27h · RN-189095/96",
    assignee: "EFREN SALVADOR",
    door: "DOCK55",
  },

  // ────── OUTBOUND / LOAD — CLOSED (9) ──────
  {
    taskId: "TASK-5326500",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED · LOAD-5034423/24",
    assignee: "EDUARDO MEJIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5326279",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED · LOAD-5034194",
    assignee: "DANIEL BELTRAN",
    door: "DOCK61",
  },
  {
    taskId: "TASK-5326233",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED · LOAD-5034324",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5326207",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED · LOAD-5034425/08",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5326174",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED · LOAD-5034323",
    assignee: "DANIEL BELTRAN",
    door: "DOCK60",
  },
  {
    taskId: "TASK-5326162",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED · 8 LOADs",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5326081",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED · LOAD-5034322",
    assignee: "DANIEL BELTRAN",
    door: "DOCK57",
  },
  {
    taskId: "TASK-5325679",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED · 4 LOADs",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5325458",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "CLOSED · LOAD-5033866",
    assignee: "DANIEL BELTRAN",
    door: "DOCK54",
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
