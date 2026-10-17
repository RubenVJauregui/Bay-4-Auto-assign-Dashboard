/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-10-17 ~12:41p PT (live WISE / WMS-BAM APIs)
 *   Sources:
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors
 *       (fresh dockStatus, spaceStatus, occupiedCustomerIds, updatedTime per door)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide 15; 5 at Bay 4 doors)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide 17; 6 at Bay 4 doors)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To = 2026-10-17 -> 0 scheduled (0 rows returned).
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDateFrom/To = 2026-10-17 -> 0 scheduled (0 rows returned).
 *   NOTE: /wms-bam/dashboard/dock-door-status/search-by-paging is not used; door
 *   state is read from wms-location/search (dockStatus + spaceStatus), the same
 *   two status fields the dashboard already uses.
 *
 *   Key changes from the prior refresh (10/16 ~3:45p PT -> 10/17 ~12:41p PT):
 *     - Bay 4 GURUNANDA active tasks: 11 (5 LOAD + 6 RECEIVE) on 9 doors
 *       (DOCK50, DOCK52, DOCK54, DOCK55, DOCK57, DOCK61, DOCK62, DOCK65, DOCK69).
 *       DOCK69/DOCK61 receive work replaced the closed 10/16 DOCK69 task
 *       TASK-5395821; DOCK69's remaining task is a NEW task with no startTime.
 *     - Task "Guru live out / in assign to Arnulfo" resolves to ARNULFO MUNGUIA
 *       GURUNANDA Bay-4 work: 3 LOAD tasks (DOCK52 TASK-5395520, DOCK54
 *       TASK-5396650, plus the stale DOCK54 TASK-5338695). No WMS record is
 *       literally named "Guru live out / in assign to Arnulfo", and Arnulfo
 *       holds no Bay-4 RECEIVE task at this pull.
 *     - Bay 4 doors occupied: 16/23 (rule below) - 7 available
 *       (DOCK62, DOCK63, DOCK66, DOCK67, DOCK68, DOCK69, DOCK70), 0 reserved.
 *       Raw dockStatus=OCCUPIED = 11/23; the extra 5 are space-occupied doors
 *       whose dockStatus reads AVAILABLE (DOCK53, DOCK55, DOCK56, DOCK57, DOCK58).
 *     - Stale anomalies STILL OPEN: TASK-5338695 (DOCK54, LOAD started
 *       8/7/26 4:29p PT, ~70.8 days) and TASK-5090739 (DOCK50, RECEIVE
 *       started 10/21/25 1:21p PT, ~361 days) - both IN_PROGRESS past end time.
 *     - Door/task mismatch flagged: DOCK62 and DOCK69 carry active receive
 *       tasks while the location record reports dock AVAILABLE + space EMPTY.
 *     - "% scheduled inbounds received" (10/17): NOT COMPUTABLE - 0 GURUNANDA
 *       receipts carry appointmentTime = 2026-10-17, so the denominator is 0.
 *     - "% scheduled outbounds loaded" (10/17): NOT COMPUTABLE - 0 GURUNANDA
 *       orders carry scheduleDate = 2026-10-17, so the denominator is 0.
 *     - Inbound/outbound mix: 6 RECEIVE / 5 LOAD of 11 active Bay-4 tasks.
 *     - Door occupancy duration is available only where a task with a startTime
 *       sits on the door; WMS has no occupancy-start field for task-less doors,
 *       so none is derived for them.
 *
 *   NOTE: the in-yard FULL equipment array, the planned-order fallback count and
 *   the all-time assignment baseline below were NOT re-pulled in this refresh
 *   (out of scope of the request); they remain the previously carried values.
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
// NOT re-pulled in the 10/17 refresh (out of scope of the request). The array is
// left empty rather than carrying a stale result; Section 1 renders live from the
// WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875).
// FALLBACK ONLY - not re-pulled in the 10/17 refresh. Last live totalCount was 209
// at the 9/11 pull. The dashboard shows the live loader count when it succeeds.
export const plannedGurunandaOrderCount = 209;

// --- Graza Dispatch Types (preserved for GrazaDispatchSummary component) ---
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


// =====================================================================
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 10/17 ~12:41p PT
//
// Door status rule (kept identical to the dashboard's 3-value enum):
//   Reserved  = dockStatus RESERVED
//   Occupied  = dockStatus OCCUPIED OR spaceStatus OCCUPIED (not fully free)
//   Available = dockStatus AVAILABLE AND spaceStatus EMPTY
// Raw field values are preserved per door so the mapping can be re-checked.
// =====================================================================
export const doors: DoorRecord[] = [
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "daira gonzalez (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5090739"],
    duration: "RECEIVE STALE started 10/21/25 1:21p PT, never closed (TASK-5090739, ET-1027622, RN-5002143) · dock and space occupied, occupiedCustomerIds ORG-655875 (row updated 10/17 12:08a PT)",
    anomaly: true, // TASK-5090739 started 10/21/25 and is still IN_PROGRESS
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (row updated 10/17 12:08a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD) / SEBASTIAN GONZALEZ (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5395520", "TASK-5396564"],
    duration: "LOAD ~48.2h since 10/15 12:27p PT (TASK-5395520, ARNULFO MUNGUIA, ET-1170320, 4 loads) · LOAD ~21.8h since 10/16 2:52p PT (TASK-5396564, SEBASTIAN GONZALEZ, ET-1171063, 5 loads)",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied (row updated 10/16 2:44p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD x2 - one STALE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5338695", "TASK-5396650"],
    duration: "LOAD STALE started 8/7/26 4:29p PT, never closed (TASK-5338695, ET-1135033, 1 load) · LOAD ~21.4h since 10/16 3:15p PT (TASK-5396650, ET-1171109, 2 loads)",
    anomaly: true, // TASK-5338695 started 8/7/26 but is still IN_PROGRESS (~70.8 days)
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "JEROME ARANDA (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5396432"],
    duration: "RECEIVE ~24.4h since 10/16 12:16p PT (TASK-5396432, JEROME ARANDA, ET-1171001, RN-194171 IN_PROGRESS) · dock AVAILABLE, space occupied",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied (row updated 10/16 12:28p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: "JESUS ESPINOZA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5394996"],
    duration: "LOAD ~62.0h since 10/14 10:40p PT (TASK-5394996, JESUS ESPINOZA, ET-1169956, 1 load) · dock AVAILABLE, space occupied",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied (row updated 10/16 11:56a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/16 8:54a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "No active task · dock and space occupied (row updated 10/15 9:00p PT) · occupiedCustomerIds ORG-655875 · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5395968"],
    duration: "RECEIVE ~20.7h since 10/16 3:58p PT (TASK-5395968, DANIELA GONZALEZ, ET-1170596, RN-5010938 IN_PROGRESS) · dock and space occupied",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Available",
    assignee: "JORGE ARMANDO DUENAS (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5393820"],
    duration: "RECEIVE ~92.7h since 10/13 4:01p PT (TASK-5393820, JORGE ARMANDO DUENAS, ET-1169016, RN-5010896 IN_PROGRESS) · location row reports dock AVAILABLE, space EMPTY (updated 10/16 5:08p PT)",
    anomaly: true, // active receive task on a door whose location row is free
  },
  {
    door: "DOCK63",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available (row updated 10/16 10:11a PT)",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/17 12:07a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5394671"],
    duration: "RECEIVE ~71.2h since 10/14 1:27p PT (TASK-5394671, Jorge Antonio Franco, ET-1169661, RN-5010808 IN_PROGRESS) · dock occupied, space empty",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available (row updated 10/16 10:57p PT)",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available (row updated 10/16 9:29a PT)",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available (row updated 10/17 12:13a PT)",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Available",
    assignee: "Jorge Antonio Franco (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW · created 9/30 10:46a PT (TASK-5381972, Jorge Antonio Franco, ET-1162686, RN-5010583) - task has no startTime, so no duration basis · location row reports dock AVAILABLE, space EMPTY (updated 10/16 6:23p PT)",
    anomaly: true, // active receive task on a door whose location row is free
  },
  {
    door: "DOCK70",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available (row updated 10/16 8:54a PT)",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/17 12:05a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/15 8:57p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 16
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 0
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 9
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 4
const available = doors.filter((d) => d.status === "Available").length; // 7

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

// No door is RESERVED at this pull; reservedDoorCount stays exported for the DoorGrid legend.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (Oct 17 2026 ~12:41p PT). 11 active-status tasks at Bay 4 doors: 5 LOAD + 6 RECEIVE.
// ARNULFO MUNGUIA: 3 LOAD (DOCK52 TASK-5395520; DOCK54 TASK-5396650 + stale TASK-5338695)
// Jorge Antonio Franco: 2 RECEIVE (DOCK65, DOCK69)
// DANIELA GONZALEZ: 1 RECEIVE (DOCK61)
// JEROME ARANDA: 1 RECEIVE (DOCK55)
// JESUS ESPINOZA: 1 LOAD (DOCK57)
// JORGE ARMANDO DUENAS: 1 RECEIVE (DOCK62)
// SEBASTIAN GONZALEZ: 1 LOAD (DOCK52)
// daira gonzalez: 1 RECEIVE (DOCK50, STALE)
// All assigned names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 3 },
  { name: "Jorge Antonio Franco", taskCount: 2 },
  { name: "DANIELA GONZALEZ", taskCount: 1 },
  { name: "JEROME ARANDA", taskCount: 1 },
  { name: "JESUS ESPINOZA", taskCount: 1 },
  { name: "JORGE ARMANDO DUENAS", taskCount: 1 },
  { name: "SEBASTIAN GONZALEZ", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
];

// All-time assignment counts - preserved from prior baseline (Jul 13 2026).
// NOT re-pulled in this refresh (out of scope of the 10/17 request); carried
// forward unchanged rather than estimated.
export const allTimeAssigneeSummaries: AssigneeSummary[] = [
  { name: "Arnulfo Munguia (89)", taskCount: 110 },
  { name: "Daniel Beltran", taskCount: 90 },
  { name: "Caren Cubides", taskCount: 3 },
  { name: "Daniela Gonzalez", taskCount: 1 },
  { name: "Fatima Ponce", taskCount: 1 },
  { name: "Nanci Viviana Rosas", taskCount: 1 },
  { name: "Rufino Munguia", taskCount: 1 },
];

// Mix: 5 LOAD + 6 RECEIVE = 11 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 6, total: 11 },
  { label: "Outbound (LOAD)", count: 5, total: 11 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 5, total: 11 },
  { label: "Inbound", count: 6, total: 11 },
];

// --- Schedule Data (2026-10-17, Saturday) ---
// % scheduled inbounds received TODAY: NOT COMPUTABLE - 0 GURUNANDA receipts carry
//   appointmentTime = 2026-10-17 (appointmentTimeFrom/To query returned 0 rows), so the
//   denominator is 0 and no percentage is asserted. Prior operating day 10/16 had 7
//   scheduled receipts (1 received) but that is not today's figure and is not carried.
// % scheduled outbounds loaded TODAY: NOT COMPUTABLE - 0 GURUNANDA orders carry
//   scheduleDate = 2026-10-17 (scheduleDateFrom/To query returned 0 rows), so the
//   denominator is 0 and no percentage is asserted.
export const scheduleAvailable = false;             // inbound denominator is 0 -> not computable
export const outboundScheduleAvailable = false;     // outbound denominator is 0 -> not computable
export const scheduledInboundOrders = 0;            // receipts with appointmentTime = 2026-10-17
export const scheduledOutboundOrders = 0;           // orders with scheduleDate = 2026-10-17
export const scheduledInboundReceived = 0;          // no scheduled receipts to evaluate
export const scheduledOutboundLoaded = 0;           // no scheduled orders to evaluate
export const pctScheduledInboundReceived = 0;       // n/a - denominator 0
export const pctScheduledOutboundLoaded = 0;        // n/a - denominator 0

// Facility-wide appointment context - unavailable (GURUNANDA-scoped query only;
// no all-customer facility-wide appointment totals were pulled for this refresh).
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime where a task exists on the
// door; unavailable for task-less doors (no occupancy-start field in WMS)
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Oct 17 2026 ~12:41p PT)
// 11 tasks total: 5 LOAD + 6 RECEIVE. All GURUNANDA, LLC.
// Two are stale-anomaly tasks (TASK-5338695 on DOCK54, TASK-5090739 on DOCK50).
export const assignments: TaskRecord[] = [
  // ----- OUTBOUND / LOAD (5) -----
  {
    taskId: "TASK-5395520",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~48.2h since 10/15 12:27p PT (ARNULFO MUNGUIA; ET-1170320, 4 loads)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5396564",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~21.8h since 10/16 2:52p PT (SEBASTIAN GONZALEZ; ET-1171063, 5 loads)",
    assignee: "SEBASTIAN GONZALEZ",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5338695",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 8/7/26 4:29p PT but never closed; ARNULFO MUNGUIA, ET-1135033, 1 load)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5396650",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~21.4h since 10/16 3:15p PT (ARNULFO MUNGUIA; ET-1171109, 2 loads)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5394996",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~62.0h since 10/14 10:40p PT (JESUS ESPINOZA; ET-1169956, 1 load)",
    assignee: "JESUS ESPINOZA",
    door: "DOCK57",
  },

  // ----- INBOUND / RECEIVE (6) -----
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 10/21/25 1:21p PT but never closed; daira gonzalez, ET-1027622, RN-5002143)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5396432",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~24.4h since 10/16 12:16p PT (JEROME ARANDA; ET-1171001, RN-194171 IN_PROGRESS)",
    assignee: "JEROME ARANDA",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5395968",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~20.7h since 10/16 3:58p PT (DANIELA GONZALEZ; ET-1170596, RN-5010938 IN_PROGRESS)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK61",
  },
  {
    taskId: "TASK-5393820",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~92.7h since 10/13 4:01p PT (JORGE ARMANDO DUENAS; ET-1169016, RN-5010896 IN_PROGRESS)",
    assignee: "JORGE ARMANDO DUENAS",
    door: "DOCK62",
  },
  {
    taskId: "TASK-5394671",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~71.2h since 10/14 1:27p PT (Jorge Antonio Franco; ET-1169661, RN-5010808 IN_PROGRESS)",
    assignee: "Jorge Antonio Franco",
    door: "DOCK65",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/30 10:46a PT (Jorge Antonio Franco; ET-1162686, RN-5010583) - task has no startTime",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
];
