/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed 2026-09-04 ~2:31 PT (live WMS APIs)
 *   Sources:
 *     - /wms-bam/wms-location/search — exactlyNames for all 23 doors
 *       (fresh dockStatus, spaceStatus, occupiedCustomerIds per door)
 *     - /wms-bam/outbound/load-task/search-by-paging — NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide; 8 at Bay 4 doors)
 *     - /wms-bam/inbound/receive-task/search-by-paging — NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide; 3 at Bay 4 doors)
 *     - /wms-bam/yard/equipment/search — FULL TRAILERS for GURUNANDA only
 *     - /wms-bam/outbound/order/search-by-paging — GURUNANDA orders,
 *       scheduleDate = 2026-09-04 (18 scheduled: 6 SHIPPED / 8 PLANNED / 3 PICKED / 1 IMPORTED)
 *     - /wms-bam/inbound/receipt/search-by-paging — GURUNANDA receipts,
 *       appointmentTime = 2026-09-04 (9 scheduled: 2 CLOSED / 1 IN_PROGRESS / 6 IMPORTED)
 *
 *   Key changes from prior refresh (~12:30p PT → ~2:31p PT, same day):
 *     - Active Bay 4 GURUNANDA tasks: 7 → 11 (8 LOAD + 3 RECEIVE) on 9 doors
 *     - Bay 4 doors occupied: 19/23 (same total; composition changed — DOCK59
 *       RESERVED → dock occupied; DOCK67 space freed to fully Available)
 *     - "Guru live out": 4 GURUNANDA LOAD tasks on ARNULFO MUNGUIA
 *       (DOCK50 TASK-5360206 since 9/3 3:59p PT; DOCK51 TASK-5359541 since 9/3 10:28a PT;
 *        DOCK54 TASK-5360934 NEW since 1:17p PT; DOCK54 TASK-5338695 STALE — load SHIPPED 8/10)
 *     - "Guru live in": NO active RECEIVE task for Arnulfo at Bay 4. Bay-4 receives are
 *       RUFINO MUNGUIA (DOCK53 NEW), ASTRID NOEMI AGUILAR (DOCK63 IN_PROGRESS),
 *       daira gonzalez (DOCK50 STALE ~10.5 months).
 *     - New Bay 4 tasks since 12:30p: LOAD TASK-5360934 (DOCK54), TASK-5361104 (DOCK57),
 *       TASK-5361093 (DOCK58), TASK-5361043 (DOCK60); RECEIVE TASK-5360939 (DOCK53),
 *       TASK-5360958 (DOCK63). Closed since 12:30p: LOAD TASK-5360894 (DOCK56),
 *       TASK-5360897 (DOCK57).
 *     - In-yard FULL GURUNANDA trailers: 2 (LE0986 FULL_AFTER_LOADED ET-1149072 — flipped
 *       inbound → outbound after DOCK52 devan; W84599 FULL_AFTER_LOADED ET-1148952).
 *       Containers excluded (TRAILER-only display).
 *     - Planned GURUNANDA orders: all-time PLANNED 189; scheduleDate 9/4 PLANNED 8.
 *     - % scheduled outbounds loaded (9/4): 6 SHIPPED / 18 scheduled = 33.3%
 *       (status mix: 6 SHIPPED / 8 PLANNED / 3 PICKED / 1 IMPORTED).
 *     - % scheduled inbounds received (9/4): 2 CLOSED / 9 scheduled = 22.2%
 *       (status mix: 2 CLOSED / 1 IN_PROGRESS / 6 IMPORTED).
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
// Fresh from /wms-bam/yard/equipment/search (Sep 4 2026 ~2:31 PT).
// Filtered to equipmentType=TRAILER, equipmentStatus=FULL, customer ORG-655875.
// RESULT: 2 FULL GURUNANDA trailers. LE0986 (ET-1149072) is now FULL_AFTER_LOADED —
// outbound loads LOAD-5037766/67/68 (DN-5241841/1851/1856) — after being devanned at
// DOCK52 earlier (its EMPTY inbound row ET-1149038 is excluded). W84599 (ET-1148952)
// remains FULL_AFTER_LOADED (loaded outbound trailer; no current location set).
// GURUNANDA FULL CONTAINERs in yard: none. Other customers' FULL containers excluded.
export const inYardFullEquipment: InYardEquipmentRecord[] = [
  {
    equipmentNo: "LE0986",
    entryTicket: "ET-1149072",
    checkInPdt: "09/04/2026, 12:35 PM",
    timeInYard: "0 Days 1 Hours 55 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "W84599",
    entryTicket: "ET-1148952",
    checkInPdt: "09/04/2026, 10:33 AM",
    timeInYard: "0 Days 3 Hours 58 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875).
// All-time PLANNED: 189. Today's (2026-09-04) scheduleDate PLANNED: 8.
// Fallback value used when the live loader is unavailable.
export const plannedGurunandaOrderCount = 8;

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
  // OCCUPIED — doors with active GURUNANDA Bay-4 tasks (8 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA / daira gonzalez",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5360206", "TASK-5090739"],
    duration: "LOAD ~22.5h since 9/3 3:59p PT · RECEIVE STALE ~10.5mo",
    anomaly: true, // TASK-5090739 (RECEIVE) started Oct 21 2025 — RN-5002143 closed 10/22/25, task never closed
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5359541"],
    duration: "~28h since 9/3 10:28a PT (load LOADED, task open)",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "RUFINO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5360939"],
    duration: "RECEIVE NEW since 12:34p PT (RN-191921, ctn 53722) · dock holds loaded trailer W84599",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5360934", "TASK-5338695"],
    duration: "LOAD ~1h10m since 1:17p PT (Guru pro pre-load) · TASK-5338695 STALE ~25d (load SHIPPED 8/10)",
    anomaly: true, // TASK-5338695 ended Aug 10 (load SHIPPED) but status never closed
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: "SEBASTIAN GONZALEZ",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5361104"],
    duration: "LOAD NEW 2:01p PT (live 77711039 Target Midway, trailer 715569)",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: "SEBASTIAN GONZALEZ",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5361093"],
    duration: "LOAD ~7m since 2:20p PT (live 30140086 Dollar Tree)",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: "DANIEL BELTRAN",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5361043"],
    duration: "LOAD ~29m since 1:57p PT (live 77711037 Target Shafter, trailer 155477)",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: "ASTRID NOEMI AGUILAR",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5360958"],
    duration: "RECEIVE ~23m since 2:03p PT (RN-5010094, ctn SEGU6910809)",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // OCCUPIED — space-level occupied / queued task, no docked trailer (5 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, space occupied (LE0986 devanned ~1:03–1:07p PT)",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, space occupied (LOAD TASK-5360894 closed since 12:30p)",
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
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "Space staging (receive TASK-5360230 closed 12:28p PT) · no current task",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // OCCUPIED — dock-level occupied, no active GURUNANDA task (6 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "Dock occupied (was RESERVED at 12:30p refresh) · no active task · space empty",
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
  // AVAILABLE — both dock and space available (4 doors)
  // ═══════════════════════════════════════════════════════════════
  { door: "DOCK62", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK65", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  // DOCK67: physically free (dock + space empty). LOAD TASK-5359531 (appt 9/8 9:00a) still
  // open but the truck is NOT on site, so the door counts as available.
  {
    door: "DOCK67",
    status: "Available",
    assignee: "JEROME ARANDA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5359531"],
    duration: "Physically available — LOAD TASK-5359531 (appt 9/8 9:00a) not on dock",
    anomaly: false,
  },
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
// (Sep 4 2026 ~2:31 PT). 11 active-status tasks at Bay 4 doors: 8 LOAD + 3 RECEIVE.
// ARNULFO MUNGUIA: 4 LOAD (DOCK50, DOCK51, DOCK54 x2 — incl. stale TASK-5338695)
// SEBASTIAN GONZALEZ: 2 LOAD (DOCK57 NEW, DOCK58 IN_PROGRESS)
// DANIEL BELTRAN: 1 LOAD (DOCK60 IN_PROGRESS)
// JEROME ARANDA: 1 LOAD (DOCK67 NEW, appt 9/8 — truck not on dock)
// RUFINO MUNGUIA: 1 RECEIVE (DOCK53 NEW)
// ASTRID NOEMI AGUILAR: 1 RECEIVE (DOCK63 IN_PROGRESS)
// daira gonzalez: 1 RECEIVE (DOCK50, STALE ~10.5mo)
// All assignee names resolved from WMS task payloads (assigneeUserName); no Assignee-<id> labels remain.
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 4 },
  { name: "SEBASTIAN GONZALEZ", taskCount: 2 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "JEROME ARANDA", taskCount: 1 },
  { name: "RUFINO MUNGUIA", taskCount: 1 },
  { name: "ASTRID NOEMI AGUILAR", taskCount: 1 },
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

// Mix: 8 LOAD + 3 RECEIVE = 11 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 3, total: 11 },
  { label: "Outbound (LOAD)", count: 8, total: 11 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 8, total: 11 },
  { label: "Inbound", count: 3, total: 11 },
];

// ─── Schedule Data (2026-09-04) ───
// % scheduled inbounds received TODAY: 2 CLOSED of 9 scheduled (appointmentTime = 9/4) = 22.2%
//   (2 CLOSED / 1 IN_PROGRESS / 6 IMPORTED — RN-5009438 & RN-5009963 closed ~1:06–1:07p PT)
// % scheduled outbounds loaded TODAY: 6 SHIPPED of 18 scheduled (scheduleDate = 9/4) = 33.3%
//   (status mix: 6 SHIPPED / 8 PLANNED / 3 PICKED / 1 IMPORTED)
// All-time PLANNED (GURUNANDA): 189
export const scheduleAvailable = true;
export const scheduledInboundOrders = 9;      // receipts with appointmentTime = 2026-09-04
export const scheduledOutboundOrders = 18;    // orders with scheduleDate = 2026-09-04
export const scheduledInboundReceived = 2;    // CLOSED/FORCE_CLOSED among scheduled set
export const scheduledOutboundLoaded = 6;     // SHIPPED among scheduled set
export const pctScheduledInboundReceived = 22; // 2 / 9 = 22.2%
export const pctScheduledOutboundLoaded = 33;  // 6 / 18 = 33.3%

// Facility-wide appointment context — unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime and space updatedTime
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Sep 4 2026 ~2:31 PT)
// 11 tasks total: 8 LOAD + 3 RECEIVE
// All GURUNANDA, LLC. Two are stale-anomaly tasks (TASK-5338695, TASK-5090739).
export const assignments: TaskRecord[] = [
  // ────── OUTBOUND / LOAD (8) ──────
  {
    taskId: "TASK-5360206",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~22.5h",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5359541",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~28h",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5360934",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~1h10m · NEW today (Guru pro pre-load)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5338695",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE ~25d",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5361104",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW 2:01p PT · live 77711039 Target Midway",
    assignee: "SEBASTIAN GONZALEZ",
    door: "DOCK57",
  },
  {
    taskId: "TASK-5361093",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~7m · live 30140086 Dollar Tree",
    assignee: "SEBASTIAN GONZALEZ",
    door: "DOCK58",
  },
  {
    taskId: "TASK-5361043",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~29m · live 77711037 Target Shafter",
    assignee: "DANIEL BELTRAN",
    door: "DOCK60",
  },
  {
    taskId: "TASK-5359531",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · appt 9/8 9:00a · truck not on dock",
    assignee: "JEROME ARANDA",
    door: "DOCK67",
  },

  // ────── INBOUND / RECEIVE (3) ──────
  {
    taskId: "TASK-5360939",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW 12:34p PT · RN-191921, ctn 53722",
    assignee: "RUFINO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5360958",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~23m · RN-5010094, ctn SEGU6910809",
    assignee: "ASTRID NOEMI AGUILAR",
    door: "DOCK63",
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~10.5mo · STALE",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
];
