/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-10-16 ~3:45p PT (live WISE / WMS-BAM APIs)
 *   Sources:
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors
 *       (fresh dockStatus, spaceStatus, occupiedCustomerIds, updatedTime per door)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide 15; 6 at Bay 4 doors)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide 19; 6 at Bay 4 doors)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts,
 *       appointmentTimeFrom/To = 2026-10-16 -> 7 scheduled (7 rows returned).
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders,
 *       scheduleDatePeriod = 2026-10-16 -> 109 scheduled (109 rows returned).
 *   NOTE: /wms-bam/dashboard/dock-door-status/search-by-paging is not used; door
 *   state is read from wms-location/search (dockStatus + spaceStatus), the same
 *   two status fields the dashboard already uses.
 *
 *   Key changes from the prior refresh (9/26 ~7:56a PT -> 10/16 ~3:45p PT):
 *     - Bay 4 GURUNANDA active tasks: 12 (6 LOAD + 6 RECEIVE) on 8 doors
 *       (DOCK50, DOCK52, DOCK54, DOCK55, DOCK57, DOCK62, DOCK65, DOCK69).
 *     - Task "Guru live out / in assign to Arnulfo" resolves to ARNULFO MUNGUIA
 *       GURUNANDA Bay-4 load work: 3 LOAD tasks at this pull - TASK-5396650
 *       (DOCK54), TASK-5395520 (DOCK52) and the stale TASK-5338695 (DOCK54).
 *       No WMS record is literally named "Guru live out / in assign to Arnulfo",
 *       and Arnulfo holds no Bay-4 RECEIVE task at this pull.
 *     - Bay 4 doors occupied: 18/23 (derived) - plus 2 RESERVED (DOCK50, DOCK51)
 *       and 3 available (DOCK63, DOCK67, DOCK70). Raw dockStatus=OCCUPIED = 13/23.
 *     - Stale anomalies STILL OPEN: TASK-5338695 (DOCK54, LOAD started 8/7/26),
 *       TASK-5090739 (DOCK50, RECEIVE started 10/21/25) - IN_PROGRESS past end time.
 *     - "% scheduled inbounds received" (10/16): COMPUTABLE - 1 received of
 *       7 scheduled = 14.3% (received = receipt has receivedTime / status CLOSED).
 *     - "% scheduled outbounds loaded" (10/16): COMPUTABLE - 64 loaded of
 *       109 scheduled = 58.7% (loaded = order status LOADED or SHIPPED).
 *     - Inbound/outbound mix: 6 RECEIVE / 6 LOAD of 12 active Bay-4 tasks.
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
// NOT re-pulled in the 10/16 refresh (out of scope of the request). The array is
// left empty rather than carrying a stale result; Section 1 renders live from the
// WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875).
// FALLBACK ONLY - not re-pulled in the 10/16 refresh. Last live totalCount was 209
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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 10/16 ~3:45p PT
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
    status: "Reserved",
    assignee: "daira gonzalez (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5090739"],
    duration: "RECEIVE STALE started 10/21/25 1:21p PT, never closed (TASK-5090739, ET-1027622, RN-5002143 CLOSED) · dock RESERVED, space occupied (row updated 10/16 1:01p PT)",
    anomaly: true, // TASK-5090739 started 10/21/25; receipt closed but task never closed
  },
  {
    door: "DOCK51",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space occupied (row updated 10/16 2:36p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "SEBASTIAN GONZALEZ (LOAD) / ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5395520", "TASK-5396564"],
    duration: "LOAD ~27.3h since 10/15 12:27p PT (TASK-5395520, ARNULFO MUNGUIA, ET-1170320, 4 loads) · LOAD ~0.9h since 10/16 2:52p PT (TASK-5396564, SEBASTIAN GONZALEZ, ET-1171063, 5 loads)",
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
    duration: "LOAD STALE started 8/7/26 4:29p PT, never closed (TASK-5338695, ET-1135033, 1 load) · LOAD ~0.5h since 10/16 3:15p PT (TASK-5396650, ET-1171109, 2 loads)",
    anomaly: true, // TASK-5338695 started 8/7/26 but is still IN_PROGRESS
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "DANIEL BELTRAN (LOAD) / JEROME ARANDA (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5396432", "TASK-5396612"],
    duration: "LOAD ~0.9h since 10/16 2:49p PT (TASK-5396612, DANIEL BELTRAN, ET-1171087, 1 load) · RECEIVE ~3.5h since 10/16 12:16p PT (TASK-5396432, JEROME ARANDA, RN-194171 IN_PROGRESS)",
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
    duration: "LOAD ~41.1h since 10/14 10:40p PT (TASK-5394996, JESUS ESPINOZA, ET-1169956, 1 load)",
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
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied (row updated 10/16 11:16a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: "JORGE ARMANDO DUENAS (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5393820"],
    duration: "RECEIVE ~71.7h since 10/13 4:01p PT (TASK-5393820, JORGE ARMANDO DUENAS, RN-5010896 IN_PROGRESS) · dock occupied, space empty",
    anomaly: false,
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
    duration: "No active task · dock occupied, space empty (row updated 10/15 8:59p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5394671"],
    duration: "RECEIVE ~50.3h since 10/14 1:27p PT (TASK-5394671, Jorge Antonio Franco, RN-5010808 IN_PROGRESS) · dock occupied, space empty",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/15 8:59p PT) · no occupancy-start field in WMS",
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
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/15 8:58p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE) / Jorge Antonio Franco (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972", "TASK-5395821"],
    duration: "RECEIVE NEW · created 10/15 9:47p PT (TASK-5395821, DANIELA GONZALEZ, RN-5010923) - task has no startTime, so no duration basis · RECEIVE NEW · created 9/30 10:46a PT (TASK-5381972, Jorge Antonio Franco, RN-5010583) - task has no startTime, so no duration basis · dock occupied, space empty",
    anomaly: false,
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
    duration: "No active task · dock occupied, space empty (row updated 10/15 8:58p PT) · no occupancy-start field in WMS",
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

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 18
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 2
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 8
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 2
const available = doors.filter((d) => d.status === "Available").length; // 3

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

// Reserved doors are surfaced via the DoorGrid legend (DOCK50, DOCK51).
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (Oct 16 2026 ~3:45p PT). 12 active-status tasks at Bay 4 doors: 6 LOAD + 6 RECEIVE.
// ARNULFO MUNGUIA: 3 LOAD (DOCK52, DOCK54 x2 - DOCK54 TASK-5338695 is stale)
// Jorge Antonio Franco: 2 RECEIVE (DOCK65, DOCK69)
// DANIEL BELTRAN: 1 LOAD (DOCK55)
// SEBASTIAN GONZALEZ: 1 LOAD (DOCK52)
// JESUS ESPINOZA: 1 LOAD (DOCK57)
// JEROME ARANDA: 1 RECEIVE (DOCK55)
// DANIELA GONZALEZ: 1 RECEIVE (DOCK69)
// JORGE ARMANDO DUENAS: 1 RECEIVE (DOCK62)
// daira gonzalez: 1 RECEIVE (DOCK50, STALE)
// All assignee names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 3 },
  { name: "Jorge Antonio Franco", taskCount: 2 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "DANIELA GONZALEZ", taskCount: 1 },
  { name: "JEROME ARANDA", taskCount: 1 },
  { name: "JESUS ESPINOZA", taskCount: 1 },
  { name: "JORGE ARMANDO DUENAS", taskCount: 1 },
  { name: "SEBASTIAN GONZALEZ", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
];

// All-time assignment counts - preserved from prior baseline (Jul 13 2026).
// NOT re-pulled in this refresh (out of scope of the 10/16 request); carried
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

// Mix: 6 LOAD + 6 RECEIVE = 12 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 6, total: 12 },
  { label: "Outbound (LOAD)", count: 6, total: 12 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 6, total: 12 },
  { label: "Inbound", count: 6, total: 12 },
];

// --- Schedule Data (2026-10-16, Friday) ---
// % scheduled inbounds received TODAY: COMPUTABLE - 7 GURUNANDA receipts carry
//   appointmentTime = 2026-10-16 (appointmentTimeFrom/To query). 1 has been
//   received (received = receipt-level receivedTime set / status CLOSED:
//   RN-5010939 CLOSED, receivedTime 10/16 2:06p PT). Of the other 6: RN-194171 is
//   IN_PROGRESS (receivedStartTime 10/16 12:16p PT but no receivedTime) and 5 are
//   IMPORTED (not started). If in-progress reception is counted as received the
//   numerator would be 2/7 = 28.6%; the stricter completed-receipt rule (1/7) is used.
// % scheduled outbounds loaded TODAY: COMPUTABLE - 109 GURUNANDA orders carry
//   scheduleDate = 2026-10-16 (scheduleDatePeriod query). 64 have been loaded
//   (loaded = order status LOADED or SHIPPED: 15 LOADED + 49 SHIPPED). The
//   remaining 45 are PICKED (34), PLANNED (9) or PACKED (2). loadedTime is not
//   populated on these records, so current status is the evidence used.
export const scheduleAvailable = true;              // inbound denominator is 7 -> computable
export const outboundScheduleAvailable = true;      // outbound denominator is 109 -> computable
export const scheduledInboundOrders = 7;            // receipts with appointmentTime = 2026-10-16
export const scheduledOutboundOrders = 109;         // orders with scheduleDate = 2026-10-16
export const scheduledInboundReceived = 1;          // receipts received (receivedTime / CLOSED)
export const scheduledOutboundLoaded = 64;          // orders with status LOADED or SHIPPED
export const pctScheduledInboundReceived = 14.3;    // 1 / 7
export const pctScheduledOutboundLoaded = 58.7;     // 64 / 109

// Facility-wide appointment context - unavailable (GURUNANDA-scoped query only;
// no all-customer facility-wide appointment totals were pulled for this refresh).
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime where a task exists on the
// door; unavailable for task-less doors (no occupancy-start field in WMS)
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Oct 16 2026 ~3:45p PT)
// 12 tasks total: 6 LOAD + 6 RECEIVE. All GURUNANDA, LLC.
// Two are stale-anomaly tasks (TASK-5338695, TASK-5090739).
export const assignments: TaskRecord[] = [
  // ------ OUTBOUND / LOAD (6) ------
  {
    taskId: "TASK-5395520",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~27.3h since 10/15 12:27p PT (ARNULFO MUNGUIA; ET-1170320, 4 loads)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5396564",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~0.9h since 10/16 2:52p PT (SEBASTIAN GONZALEZ; ET-1171063, 5 loads)",
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
    pieces: "IN_PROGRESS · ~0.5h since 10/16 3:15p PT (ARNULFO MUNGUIA; ET-1171109, 2 loads)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5396612",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~0.9h since 10/16 2:49p PT (DANIEL BELTRAN; ET-1171087, 1 load)",
    assignee: "DANIEL BELTRAN",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5394996",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~41.1h since 10/14 10:40p PT (JESUS ESPINOZA; ET-1169956, 1 load)",
    assignee: "JESUS ESPINOZA",
    door: "DOCK57",
  },

  // ------ INBOUND / RECEIVE (6) ------
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 10/21/25 1:21p PT but never closed; daira gonzalez, RN-5002143 CLOSED)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5396432",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~3.5h since 10/16 12:16p PT (JEROME ARANDA; RN-194171 IN_PROGRESS)",
    assignee: "JEROME ARANDA",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5393820",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~71.7h since 10/13 4:01p PT (JORGE ARMANDO DUENAS; RN-5010896 IN_PROGRESS)",
    assignee: "JORGE ARMANDO DUENAS",
    door: "DOCK62",
  },
  {
    taskId: "TASK-5394671",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~50.3h since 10/14 1:27p PT (Jorge Antonio Franco; RN-5010808 IN_PROGRESS)",
    assignee: "Jorge Antonio Franco",
    door: "DOCK65",
  },
  {
    taskId: "TASK-5395821",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 10/15 9:47p PT (DANIELA GONZALEZ; RN-5010923; task has no startTime)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/30 10:46a PT (Jorge Antonio Franco; RN-5010583; task has no startTime)",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
];
