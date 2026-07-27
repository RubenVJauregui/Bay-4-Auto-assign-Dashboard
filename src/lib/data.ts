/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed 2026-07-27 ~15:06 PT (live WMS APIs)
 *   Sources:
 *     - /wms-bam/wms-location/search — exactlyNames for all 23 doors
 *       (fresh updatedTime, spaceStatus, dockStatus, entryId, occupiedCustomerIds per door)
 *     - /wms-bam/tasks/search-by-conditional — IN_PROGRESS + NEW tasks, filtered
 *       by Bay 4 dock IDs (552,554,556,559,560,563-580,587)
 *     - /wms-bam/yard/equipment/search — FULL TRAILERS only
 *     - /wms-bam/outbound/order/search-by-paging — GURUNANDA PLANNED orders
 *
 *   Key changes from prior refresh:
 *     - DOCK51 now occupied (was OCCUPIED before), updatedTime 21:06 PT
 *     - DOCK53 has fresh task TASK-5327790 (ARNULFO MUNGUIA, LOAD, ~22:02 PT)
 *     - DOCK54 has fresh RECEIVE task TASK-5327701 (RUFINO MUNGUIA/JORGE FRANCO)
 *     - DOCK51 has TASK-5327661 (DANIEL BELTRAN, LOAD, ~21:06 PT)
 *     - TASK-5327790 on DOCK53 just started (ARNULFO MUNGUIA)
 *     - TASK-5090739 (DOCK50, daira gonzalez, RECEIVE) STILL STALE (~Oct 2025)
 *     - 3 LOAD + 3 RECEIVE = 6 total Bay 4 tasks
 *     - In-yard full TRAILERS: 3 unique after dedup (facility-wide search)
 *     - Planned GURUNANDA orders: 87 total
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

// Section 1 — In-Yard FULL Equipment (TRAILER-only display)
// Fresh from /wms-bam/yard/equipment/search (Jul 27 2026 ~15:06 PT).
// Filtered to equipmentType=TRAILER, equipmentStatus=FULL, deduplicated.
// Gate check-in times unavailable from yard equipment search API.
export const inYardFullEquipment: InYardEquipmentRecord[] = [
  {
    equipmentNo: "180574",
    entryTicket: "ET-1129096",
    checkInPdt: "07/27/2026, 14:15",
    timeInYard: "0 Days 0 Hours 51 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "M4821030",
    entryTicket: "ET-1128990",
    checkInPdt: "07/27/2026, 11:46",
    timeInYard: "0 Days 3 Hours 20 Minutes",
    customer: "KEHE ENTERPRISES (ORG-655338)",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "SNLU143592",
    entryTicket: "ET-1128987",
    checkInPdt: "—",
    timeInYard: "—",
    customer: "ORG-800009",
    equipmentType: "TRAILER",
  },
];

// Planned Orders count: WMS outbound orders for GURUNANDA (ORG-655875) with status PLANNED.
// Fresh from /wms-bam/outbound/order/search-by-paging (Jul 27 2026 ~15:06 PT).
export const plannedGurunandaOrderCount = 87;

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
  // OCCUPIED — doors with active IN_PROGRESS tasks (4 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA / daira gonzalez",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5327401", "TASK-5090739"],
    duration: "~5h / ~9mo (stale)",
    anomaly: true, // TASK-5090739 started Oct 21 2025 — stale ~9 months
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "DANIEL BELTRAN / RUFINO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5327661", "TASK-5327467"],
    duration: "~1h active / NEW",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5327790"],
    duration: "just started",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "RUFINO MUNGUIA / JORGE ANTONIO FRANCO",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5327701"],
    duration: "~30min",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // OCCUPIED — space-level occupied, no active IN_PROGRESS task (12 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "since Jul 27 12:27 (~3.5h)",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "since Jul 24 13:10 (~74h)",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "since Jul 27 14:05 (~1h)",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "since Jul 27 13:26 (~1.5h)",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "since Jul 27 09:54 (~5h)",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "since Jul 26 17:11 (~22h)",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "since Jul 24 11:35 (~75h)",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "since Jul 27 09:48 (~5h)",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "since Jul 23 20:59 (~90h)",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "since Jul 27 09:48 (~5h)",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC / ORG-585450",
    taskIds: [],
    duration: "since Jul 27 13:56 (~1h)",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "since Jul 27 11:16 (~4h)",
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

// Bay 4 active + recent task counts by assignee
// Source: /wms-bam/tasks/search-by-conditional (Jul 27 2026 ~15:06 PT)
// Filtered for Bay 4 dock IDs, RECEIVE + LOAD, IN_PROGRESS + NEW
// 6 tasks total: 3 LOAD + 3 RECEIVE
// Active (IN_PROGRESS): 3 LOAD + 2 RECEIVE
// NEW: 1 RECEIVE
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 2 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "RUFINO MUNGUIA", taskCount: 1 },
  { name: "JORGE ANTONIO FRANCO", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
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

// Mix: 3 LOAD + 3 RECEIVE = 6 active Bay 4 tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 3, total: 6 },
  { label: "Outbound (LOAD)", count: 3, total: 6 },
];

// Active inbound/outbound mix at Bay 4 doors (IN_PROGRESS only)
// 3 LOAD + 2 RECEIVE IN_PROGRESS = 5 active tasks across 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 3, total: 5 },
  { label: "Inbound", count: 2, total: 5 },
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

// Door occupancy duration: available from task startTime and space updatedTime
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Jul 27 2026 ~15:06 PT)
// 6 tasks total: 3 LOAD + 3 RECEIVE
// Active (IN_PROGRESS): 3 LOAD + 2 RECEIVE across DOCK50, DOCK51, DOCK53, DOCK54
// NEW: 1 RECEIVE at DOCK51
export const assignments: TaskRecord[] = [
  // ────── OUTBOUND / LOAD — IN_PROGRESS (3) ──────
  {
    taskId: "TASK-5327401",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~5h",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5327790",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · just started",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5327661",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~1h",
    assignee: "DANIEL BELTRAN",
    door: "DOCK51",
  },

  // ────── INBOUND / RECEIVE — IN_PROGRESS (2) ──────
  {
    taskId: "TASK-5327701",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~30min",
    assignee: "JORGE ANTONIO FRANCO",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~9mo · STALE",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },

  // ────── INBOUND / RECEIVE — NEW (1) ──────
  {
    taskId: "TASK-5327467",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · not started",
    assignee: "RUFINO MUNGUIA",
    door: "DOCK51",
  },
];
