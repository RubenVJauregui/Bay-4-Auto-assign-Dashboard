/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed 2026-09-04 ~12:30 PT (live WMS APIs)
 *   Sources:
 *     - /wms-bam/wms-location/search — exactlyNames for all 23 doors
 *       (fresh dockStatus, spaceStatus, occupiedCustomerIds per door)
 *     - /wms-bam/outbound/load-task/search-by-paging — NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide 13; 6 at Bay 4 doors)
 *     - /wms-bam/inbound/receive-task/search-by-paging — NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide 11; 1 at Bay 4 door)
 *     - /wms-bam/yard/equipment/search — FULL TRAILERS for GURUNANDA only
 *     - /wms-bam/outbound/order/search-by-paging — GURUNANDA orders,
 *       scheduleDate = 2026-09-04 (12 scheduled: 3 SHIPPED / 6 PICKED / 2 PLANNED / 1 IMPORTED)
 *     - /wms-bam/inbound/receipt/search-by-paging — GURUNANDA receipts,
 *       appointmentTime = 2026-09-04 (9 scheduled: 8 IMPORTED / 1 IN_PROGRESS, 0 CLOSED)
 *
 *   Key changes from prior refresh (Jul 28 → Sep 4):
 *     - Active Bay 4 tasks: 6 → 7 (6 LOAD + 1 RECEIVE; includes 2 stale-anomaly tasks)
 *     - Bay 4 doors occupied: 21/23 → 19/23 (DOCK62/DOCK65/DOCK68 fully available;
 *       DOCK59 dock RESERVED/space empty)
 *     - "Guru live out": 3 GURUNANDA LOAD tasks on ARNULFO MUNGUIA
 *       (DOCK50 TASK-5360206 since 9/3 3:59p PT; DOCK51 TASK-5359541 since 9/3 10:28a PT;
 *       DOCK54 TASK-5338695 STALE — load SHIPPED 8/10, task never closed)
 *     - "Guru live in": NO active RECEIVE task for Arnulfo at Bay 4.
 *       Only Bay-4 RECEIVE = TASK-5090739 (daira gonzalez, DOCK50, STALE ~10.5 months).
 *       DOCK72 receive TASK-5360230 (Fatima Del Rosario Ponce) CLOSED 9/4 12:28p PT.
 *     - New Bay 4 LOAD tasks today: TASK-5360897 (DOCK57, Daniel Beltran, NEW),
 *       TASK-5360894 (DOCK56, Daniel Beltran, IN_PROGRESS since 12:12p PT).
 *     - In-yard FULL GURUNANDA trailers: 0 → 2 (LE0986 FULL inbound at DOCK36;
 *       W84599 FULL_AFTER_LOADED, no location set). Containers excluded (TRAILER-only display).
 *     - Planned GURUNANDA orders: all-time PLANNED 166; scheduleDate 9/4 PLANNED 2.
 *     - % scheduled outbounds loaded (9/4): 3 SHIPPED / 12 scheduled = 25%
 *       (DN-3312118 shipped today; DN-3285465 & DN-3298864 shipped ahead of schedule).
 *     - % scheduled inbounds received (9/4): 0 CLOSED / 9 scheduled = 0%
 *       (RN-5009438 IN_PROGRESS — devanned, not closed).
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
// Fresh from /wms-bam/yard/equipment/search (Sep 4 2026 ~12:30 PT).
// Filtered to equipmentType=TRAILER, equipmentStatus=FULL, customer ORG-655875.
// RESULT: 2 FULL GURUNANDA trailers. LE0986 is at DOCK36 (OFFLOAD_WAITING —
// inbound will-call trailer, receive task TASK-5360889 NEW, not Bay 4).
// W84599 is FULL_AFTER_LOADED (loaded outbound trailer; no current location set).
// GURUNANDA FULL CONTAINERs in yard: none. Other customers' FULL containers excluded.
export const inYardFullEquipment: InYardEquipmentRecord[] = [
  {
    equipmentNo: "LE0986",
    entryTicket: "ET-1149038",
    checkInPdt: "09/04/2026, 11:58 AM",
    timeInYard: "0 Days 0 Hours 31 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "W84599",
    entryTicket: "ET-1148952",
    checkInPdt: "09/04/2026, 10:33 AM",
    timeInYard: "0 Days 1 Hours 57 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875).
// All-time PLANNED: 166. Today's (2026-09-04) scheduleDate PLANNED: 2.
// Fallback value used when the live loader is unavailable.
export const plannedGurunandaOrderCount = 2;

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
  // OCCUPIED — doors with active GURUNANDA Bay-4 tasks (5 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA / daira gonzalez",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5360206", "TASK-5090739"],
    duration: "LOAD ~20.5h since 9/3 3:59p PT · RECEIVE STALE ~10.5mo",
    anomaly: true, // TASK-5090739 (RECEIVE) started Oct 21 2025 — stale ~10.5 months
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5359541"],
    duration: "~26h since 9/3 10:28a PT (load LOADED, task open)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5338695"],
    duration: "STALE ~4wk · load SHIPPED 8/10, task stuck IN_PROGRESS",
    anomaly: true, // TASK-5338695 ended Aug 10 (load SHIPPED) but status never closed
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: "DANIEL BELTRAN",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5360894"],
    duration: "~20m since 12:12p PT · LOADING (trailer U5376)",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: "DANIEL BELTRAN",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5360897"],
    duration: "NEW 12:03p PT · trailer 5380 LOAD_WAITING",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // OCCUPIED — space-level occupied / queued task, no docked trailer (3 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, space occupied",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, space occupied",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, space occupied",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, space occupied",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, space occupied",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: "JEROME ARANDA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5359531"],
    duration: "Task NEW 9/3 9:26a PT (appt 9/8) · dock free, space occupied",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "Receive TASK-5360230 closed 12:28p PT (RN-5009459 devanned) · space staging",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // OCCUPIED — dock-level occupied, no active GURUNANDA task (9 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "No active task (customer tag GURUNANDA)",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
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
    duration: "No active task (customer tag GURUNANDA)",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task / no equipment row",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // RESERVED — dock reserved, space empty (1 door)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK59",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "Dock reserved · space empty",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // AVAILABLE — both dock and space available (3 doors)
  // ═══════════════════════════════════════════════════════════════
  { door: "DOCK62", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK65", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK68", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
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
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (Sep 4 2026 ~12:30 PT). 7 active-status tasks at Bay 4 doors: 6 LOAD + 1 RECEIVE.
// ARNULFO MUNGUIA: 3 LOAD (DOCK50, DOCK51, DOCK54-stale)
// DANIEL BELTRAN: 2 LOAD (DOCK57 NEW, DOCK56 IN_PROGRESS)
// JEROME ARANDA: 1 LOAD (DOCK67 NEW, appt 9/8)
// daira gonzalez: 1 RECEIVE (DOCK50, STALE ~10.5mo)
// All assignee names resolved from WMS task payloads (assigneeUserName); no Assignee-<id> labels remain.
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 3 },
  { name: "DANIEL BELTRAN", taskCount: 2 },
  { name: "JEROME ARANDA", taskCount: 1 },
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

// Mix: 6 LOAD + 1 RECEIVE = 7 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 1, total: 7 },
  { label: "Outbound (LOAD)", count: 6, total: 7 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 6, total: 7 },
  { label: "Inbound", count: 1, total: 7 },
];

// ─── Schedule Data (2026-09-04) ───
// % scheduled inbounds received TODAY: 0 CLOSED of 9 scheduled (appointmentTime = 9/4) = 0.0%
//   (8 IMPORTED, 1 IN_PROGRESS — RN-5009438 devanned but not closed)
// % scheduled outbounds loaded TODAY: 3 SHIPPED of 12 scheduled (scheduleDate = 9/4) = 25.0%
//   (status mix: 3 SHIPPED / 6 PICKED / 2 PLANNED / 1 IMPORTED)
// All-time PLANNED (GURUNANDA): 166
export const scheduleAvailable = true;
export const scheduledInboundOrders = 9;      // receipts with appointmentTime = 2026-09-04
export const scheduledOutboundOrders = 12;    // orders with scheduleDate = 2026-09-04
export const scheduledInboundReceived = 0;    // CLOSED/FORCE_CLOSED among scheduled set
export const scheduledOutboundLoaded = 3;     // SHIPPED among scheduled set
export const pctScheduledInboundReceived = 0; // 0 / 9 = 0%
export const pctScheduledOutboundLoaded = 25; // 3 / 12 = 25%

// Facility-wide appointment context — unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime and space updatedTime
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Sep 4 2026 ~12:30 PT)
// 7 tasks total: 6 LOAD + 1 RECEIVE
// All GURUNANDA, LLC. Two are stale-anomaly tasks (TASK-5338695, TASK-5090739).
export const assignments: TaskRecord[] = [
  // ────── OUTBOUND / LOAD (6) ──────
  {
    taskId: "TASK-5360206",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~20.5h",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5359541",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~26h",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5338695",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE ~4wk",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5360894",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~20m",
    assignee: "DANIEL BELTRAN",
    door: "DOCK56",
  },
  {
    taskId: "TASK-5360897",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · trailer LOAD_WAITING",
    assignee: "DANIEL BELTRAN",
    door: "DOCK57",
  },
  {
    taskId: "TASK-5359531",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · appt 9/8",
    assignee: "JEROME ARANDA",
    door: "DOCK67",
  },

  // ────── INBOUND / RECEIVE (1) ──────
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~10.5mo · STALE",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
];
