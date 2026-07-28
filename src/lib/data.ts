/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed 2026-07-28 ~06:50 PT (live WMS APIs)
 *   Sources:
 *     - /wms-bam/location/search — exactlyNames for all 23 doors
 *       (fresh dockStatus, spaceStatus, customer per door)
 *     - /wms-bam/tasks/search-by-conditional — IN_PROGRESS tasks,
 *       filtered by Bay 4 dock IDs (552,554,556,559,560,563-580,587)
 *     - /wms-bam/yard/equipment/search — FULL TRAILERS only
 *     - /wms-bam/outbound/order/search-by-paging — GURUNANDA PLANNED orders
 *     - /wms-bam/user/search-by-paging — assignee name resolution
 *
 *   Key changes from prior refresh (Jul 27 → Jul 28):
 *     - In-yard FULL trailers: 3 → 0 (only 1 CONTAINER FBLU0243220 at DOCK57)
 *     - Planned GURUNANDA orders: 87 → 152 (today's scheduleDate)
 *     - DOCK51 and DOCK65 no longer have active tasks in prior set
 *     - DOCK52 now has active LOAD task TASK-5327826 (ARNULFO MUNGUIA, since Jul 27 23:13)
 *     - DOCK65 now has active RECEIVE task TASK-5327955 (since Jul 28 00:59)
 *     - Active Bay 4 tasks: 6 → 6 (different set — 3 RECEIVE + 3 LOAD)
 *     - Guru/Arnulfo: 3 active LOAD tasks for ARNULFO MUNGUIA (GURUNANDA outbounds)
 *       "Guru live out" = GURUNANDA LOAD. No active "live in" RECEIVE for Arnulfo.
 *     - % scheduled outbounds loaded today: 0 / 152 planned = 0%
 *     - % scheduled inbounds received today: 1 received / scheduled UNAVAILABLE
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

// ─── Section 1 — In-Yard FULL Equipment (TRAILER-only display) ───
// Fresh from /wms-bam/yard/equipment/search (Jul 28 2026 ~06:50 PT).
// Filtered to equipmentType=TRAILER, equipmentStatus=FULL, deduplicated.
// RESULT: 0 full trailers in yard. 1 CONTAINER (FBLU0243220 at DOCK57) excluded.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders count: WMS outbound orders for GURUNANDA (ORG-655875)
// with status PLANNED and scheduleDate=TODAY (2026-07-28).
// Fresh from /wms-bam/outbound/order/search-by-paging (Jul 28 2026 ~06:50 PT).
// All-time PLANNED: 161. Today's scheduleDate PLANNED: 152.
export const plannedGurunandaOrderCount = 152;

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
  // OCCUPIED — doors with active IN_PROGRESS tasks (5 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA / daira gonzalez",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5327401", "TASK-5090739"],
    duration: "~14h active / ~9mo (stale)",
    anomaly: true, // TASK-5090739 started Oct 21 2025 — stale ~9 months
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5327826"],
    duration: "~8h active",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5327790"],
    duration: "~9h active",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "RUFINO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5327701"],
    duration: "~9h active",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: "Assignee-11769",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5327955"],
    duration: "~6h active",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // OCCUPIED — space-level occupied, no active IN_PROGRESS task (12 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "No active task",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "No active task",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: "CONTAINER FBLU0243220",
    taskIds: [],
    duration: "No active task",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "No active task",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "No active task",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC / ORG-585450",
    taskIds: [],
    duration: "No active task",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // OCCUPIED — dock-only (space EMPTY), no active task (4 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "Dock reserved · space empty",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "Dock reserved · space empty",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "Dock reserved · space empty",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "Dock reserved · space empty",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // AVAILABLE — both dock and space available (2 doors)
  // ═══════════════════════════════════════════════════════════════
  { door: "DOCK67", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK69", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
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

// Bay 4 active task counts by assignee
// Source: /wms-bam/tasks/search-by-conditional (Jul 28 2026 ~06:50 PT)
// 6 active tasks total: 3 LOAD + 3 RECEIVE
// ARNULFO MUNGUIA: 3 LOAD (DOCK50, DOCK52, DOCK53)
// daira gonzalez: 1 RECEIVE (DOCK50, stale ~9mo)
// RUFINO MUNGUIA: 1 RECEIVE (DOCK54) — userId 686, name from prior data
// Assignee-11769: 1 RECEIVE (DOCK65) — userId 11769, name not resolved
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 3 },
  { name: "daira gonzalez", taskCount: 1 },
  { name: "RUFINO MUNGUIA", taskCount: 1 },
  { name: "Assignee-11769", taskCount: 1 },
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

// Mix: 3 RECEIVE + 3 LOAD = 6 active Bay 4 tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 3, total: 6 },
  { label: "Outbound (LOAD)", count: 3, total: 6 },
];

// Active inbound/outbound mix at Bay 4 doors (IN_PROGRESS only)
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 3, total: 6 },
  { label: "Inbound", count: 3, total: 6 },
];

// ─── Schedule Data ───
// % scheduled inbounds received TODAY: 1 received (updatedTime today), scheduled UNAVAILABLE
// All-time: 2,357 received of 2,619 = 90.0%
// % scheduled outbounds loaded TODAY: 0 loaded / 152 planned = 0%
// All-time: 6 loaded / 161 planned = 3.7%
export const scheduleAvailable = true;
export const scheduledInboundOrders = 0;       // UNAVAILABLE — cannot filter by today's schedule date
export const scheduledOutboundOrders = 152;     // Today's PLANNED (scheduleDate=2026-07-28)
export const scheduledInboundReceived = 1;      // Received/CLOSED today
export const scheduledOutboundLoaded = 0;       // Loaded today
export const pctScheduledInboundReceived = 0;   // Cannot compute without scheduled denominator
export const pctScheduledOutboundLoaded = 0;    // 0 / 152 = 0%

// Facility-wide appointment context — unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime and space updatedTime
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Jul 28 2026 ~06:50 PT)
// 6 tasks total: 3 LOAD + 3 RECEIVE
// All IN_PROGRESS, all GURUNANDA, LLC
export const assignments: TaskRecord[] = [
  // ────── OUTBOUND / LOAD — IN_PROGRESS (3) ──────
  {
    taskId: "TASK-5327401",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~14h",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5327826",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~8h",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5327790",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~9h",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },

  // ────── INBOUND / RECEIVE — IN_PROGRESS (3) ──────
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~9mo · STALE",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5327701",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~9h",
    assignee: "RUFINO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5327955",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~6h",
    assignee: "Assignee-11769",
    door: "DOCK65",
  },
];
