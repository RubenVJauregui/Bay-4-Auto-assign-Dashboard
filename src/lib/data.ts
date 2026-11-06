/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-06 07:11:00 PT (live WISE / WMS-BAM APIs)
 *   Sources (all read with item-time-zone America/Los_Angeles; the API returns
 *   dock/task/receipt/order timestamps as UTC ISO values, converted here to the
 *   facility-local PT wall clock, which is PST/UTC-8 on this date):
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors, 23/23 rows
 *       returned (fresh dockStatus, spaceStatus, occupiedCustomerIds, entryId,
 *       updatedTime)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide totalCount 16); matched on dockName to
 *       the 23 Bay-4 docks -> 5 at Bay 4 doors (DOCK51, DOCK52 x2, DOCK53, DOCK54)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide totalCount 14), same per-door
 *       dockName match -> 3 at Bay 4 doors (DOCK50, DOCK63, DOCK69)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To inside the 11/6 PT business day -> totalCount 7
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDatePeriod inside the 11/6 PT business day -> totalCount 26
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA CLOSED/FORCE_CLOSED
 *       load tasks for assigneeUserId 89 (ARNULFO MUNGUIA), endTime
 *       2026-10-30 00:00:00 - now PT, sorted endTime DESC
 *       -> 34 transactions (Arnulfo Assigned Activity stream), 32 at Bay-4 doors
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders at status
 *       PLANNED, no date filter -> totalCount 171 (planned-orders fallback)
 *   NOTE: door state is read from wms-location/search (dockStatus + spaceStatus),
 *   the same two status fields the dashboard already uses.
 *   NOTE: the load/receive task searches were filtered by customer only and matched
 *   to Bay-4 doors on the returned dockName field (dockId is also present but is a
 *   numeric location id, not the DOCKnn name).
 *   NOTE: the query shape used here is byte-identical to the prior refresh, except
 *   that the Arnulfo window slid forward one day (endTime from 2026-10-30) so the
 *   ~7-day rolling window is preserved. As a control, the 11/6 PT order query
 *   re-reads today's scheduleDate set, so the numbers below are comparable with
 *   the 11/5 pull.
 *   NOTE: this pull ran at 07:11 PT, early in the 11/6 business day. The 11/6
 *   schedule denominators (7 inbounds / 26 outbounds) are therefore partial-day
 *   populations and must not be read as a full-day service level.
 *
 *   CONTEXT - 11/6 PT is a Friday. 7 GURUNANDA receipts carry an appointment on
 *   11/6; NONE of them carries a receivedStartTime = 0.0% received.
 *   26 GURUNANDA orders carry scheduleDate 11/6; 2 are at status SHIPPED (the
 *   loaded proxy defined by the prior refreshes) = 7.7%. One further order
 *   (DN-3441056) sits at status LOADED, i.e. loaded but not yet shipped; it is
 *   NOT counted in the SHIPPED proxy, so the loaded-inclusive figure would be
 *   3 of 26 = 11.5%.
 *
 *   Key changes from the prior refresh (11/5 ~4:57p PT -> 11/6 ~7:11a PT):
 *     - DOOR STATUS: 18/23 occupied (was 16), 2 reserved (DOCK59, DOCK65; was 3),
 *       3 available (DOCK61, DOCK67, DOCK68; was 4). Raw dockStatus=OCCUPIED is
 *       15/23; 3 more doors (DOCK56, DOCK57, DOCK58) are space-occupied with
 *       dockStatus AVAILABLE. Ten doors took a status write between 8:54p and
 *       9:08p PT on 11/5; DOCK63 last changed at 10:42p PT (the DOCK63 receive
 *       task check-in).
 *     - TASK TURNOVER: the 11/5 tasks on DOCK51/DOCK53/DOCK54 have been
 *       REASSIGNED. ARNULFO MUNGUIA no longer holds any live Bay-4 task;
 *       DOCK51, DOCK52 and DOCK54 are now JESUS ESPINOZA, DOCK53 is now
 *       JORGE ARMANDO DUENAS. DOCK52 now carries TWO active load tasks
 *       (TASK-5413720 and TASK-5413780). A new DOCK63 receive task
 *       (TASK-5413838, DANIELA GONZALEZ) started 10:42p PT on 11/5.
 *     - STALE ANOMALY: unchanged. TASK-5090739 (DOCK50, RECEIVE started
 *       10/21/25 1:21:14p PT) is still returned by the active-status query
 *       although its endTime is 10/22/25 10:42:01a PT.
 *     - Task "Guru live out / in assign to Arnulfo" still resolves to ARNULFO
 *       MUNGUIA GURUNANDA Bay 4 work. No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo"; the stream is read as the
 *       assignee's task assignment transactions and none is invented here.
 *       His assigned-activity pull (closed load tasks, endTime from 2026-10-30 00:00:00 PT)
 *       returns 34 transactions (32 at Bay-4 doors); the newest is still
 *       DOCK7 TASK-5412682 (closed 11/5 11:17:30a PT, seal A50746; not a
 *       Bay-4 door). 18 of the 32 Bay-4 transactions closed on 11/4-11/5.
 *     - "% scheduled inbounds received" (11/6 PT day): 0 of 7 = 0.0% - computable
 *       this pull. (The one receipt actually being received this morning,
 *       RN-5011401 on DOCK63, carries no appointmentTime, so it is outside the
 *       scheduled-appointment denominator.)
 *     - "% scheduled outbounds loaded" (11/6 PT day): 2 of 26 = 7.7% (SHIPPED proxy).
 *     - Inbound/outbound mix: 3 RECEIVE / 5 LOAD of 8 active Bay-4 tasks.
 *     - Door occupancy duration is available only where a task with a startTime
 *       sits on the door; WMS has no occupancy-start field for task-less doors
 *       (and for NEW tasks that never started), so none is derived.
 *
 *   NOTE: the in-yard FULL equipment array and the all-time assignee baseline
 *   were NOT re-pulled in this refresh (out of scope of the request); Section 1
 *   and the planned-orders section render live from the WMS loader.
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
// NOT re-pulled in the 11/6 7:11a PT refresh (out of scope of the request). The
// array is left empty rather than carrying a stale result; Section 1 renders live
// from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 171 at the 11/6 ~7:11a PT pull (was 200).
export const plannedGurunandaOrderCount = 171;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/6 ~7:11a PT
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
    assignee: "daira gonzalez (RECEIVE - STALE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5090739"],
    duration: "RECEIVE STARTED 10/21/25 1:21:14p PT and still returned as IN_PROGRESS although endTime is 10/22/25 10:42:01a PT (TASK-5090739, daira gonzalez, RN-5002143) - stale status, so no open-ended duration is derived · dock RESERVED, space OCCUPIED, entry ET-1179714 (row updated 11/5 8:57p PT)",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "JESUS ESPINOZA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5413721"],
    duration: "LOAD 14h49m since 11/5 4:21:50p PT (TASK-5413721, JESUS ESPINOZA, ET-1179748, PRE_LOAD, 3 loads (LOADING 3), LOAD-5043824 / 50138679 LOADING - DN-3441639; LOAD-5043771 / 50135000 LOADING - DN-3441103; LOAD-5043768 / 50134943 LOADING - DN-3441056; trailer 53402CT, dock check-in 11/5 4:21p PT) · dock OCCUPIED, space OCCUPIED, entry ET-1179748 (row updated 11/5 8:57p PT)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "JESUS ESPINOZA (LOAD) - 2 active tasks",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5413720", "TASK-5413780"],
    duration: "TWO open LOAD tasks on one door. (1) LOAD 15h29m since 11/5 3:41:35p PT (TASK-5413720, JESUS ESPINOZA, ET-1179746, PRE_LOAD, 1 load (LOADING 1), LOAD-5043775 / 50135014 LOADING - DN-3441149; trailer 53198, dock check-in 11/5 3:43p PT). (2) LOAD 13h04m since 11/5 6:06:28p PT (TASK-5413780, JESUS ESPINOZA, ET-1179787, PRE_LOAD, 1 load (LOADING 1), LOAD-5043887 / 50139598 LOADING - DN-3443505; trailer 53198, dock check-in 11/5 6:06p PT) · dock OCCUPIED, space EMPTY, entry ET-1179787 (row updated 11/5 8:57p PT)",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "JORGE ARMANDO DUENAS (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5413406"],
    duration: "LOAD 17h29m since 11/5 1:41:34p PT (TASK-5413406, JORGE ARMANDO DUENAS, ET-1179654, PRE_LOAD, 7 loads (LOADED 5, LOADING 2), LOAD-5043764 / 50134930 LOADED - DN-3439870; LOAD-5043776 / 50135015 LOADING - DN-3441203; LOAD-5043822 / 50138675 LOADING - DN-3441503; LOAD-5043813 / 50137757 LOADED - DN-3441217; LOAD-5043814 / 50137784 LOADED - DN-3441218; LOAD-5043815 / 50137825 LOADED - DN-3441235; LOAD-5043819 / 50138668 LOADED - DN-3441280; trailer 53120RL, dock check-in 11/5 1:41p PT) · dock OCCUPIED, space OCCUPIED, entry ET-1179654 (row updated 11/5 8:57p PT)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "JESUS ESPINOZA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5413285"],
    duration: "LOAD 19h42m since 11/5 11:28:46a PT (TASK-5413285, JESUS ESPINOZA, ET-1179604, PRE_LOAD, seal AMZ051228885, 8 loads (LOADED 5, LOADING 2, WINDOW_CHECKIN_DONE 1), LOAD-5043772 / 50135004 LOADED - DN-3441105; LOAD-5043774 / 50135012 LOADED - DN-3441110; LOAD-5043820 / 50138670 LOADING - DN-3441410; LOAD-5043765 / 50134932 LOADED - DN-3440783; LOAD-5043766 / 50134935 LOADED - DN-3440863; LOAD-5043767 / 50134939 LOADED - DN-3440947; LOAD-5043911 / 50140544 LOADING - DN-3441401; LOAD-5043823 / 50138677 WINDOW_CHECKIN_DONE - DN-3441632; trailer 53142, dock check-in 11/5 11:28a PT) · dock OCCUPIED, space OCCUPIED, entry ET-1179604 (row updated 11/5 8:57p PT)",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1179693 (row updated 11/5 8:56p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1179625 (row updated 11/5 2:45p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1179632 (row updated 11/5 1:47p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1179568 (row updated 11/5 8:55p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space OCCUPIED, entry ET-1179632 (row updated 11/5 11:16a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, entry ET-1179653 (row updated 11/5 8:55p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1179378 (row updated 11/5 8:55p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1179383 (row updated 11/5 8:56p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5413838"],
    duration: "RECEIVE 8h28m since 11/5 10:42:20p PT (TASK-5413838, DANIELA GONZALEZ, ET-1179831, RN-5011401, PO TIIU6317194, container TIIU6317194, seal NL028425, receivedStartTime 11/5 10:42:20p PT, no appointment - this receipt is therefore NOT part of the 11/6 scheduled-inbound denominator; dock check-in 11/5 10:42:22p PT) · dock OCCUPIED, space EMPTY, entry ET-1179831 (row updated 11/5 10:42p PT)",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, entry ET-1176452 (row updated 11/5 6:20a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space EMPTY, entry ET-1179688 (row updated 11/5 1:46p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1173309 (row updated 11/5 8:55p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1177613 (row updated 11/5 8:54p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1177841 (row updated 11/5 9:08p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW, not started (created 9/30 10:46:50a PT, TASK-5381972, Jorge Antonio Franco, ET-1162686, receipts RN-5010583) - no startTime, so no duration basis · dock OCCUPIED, space EMPTY, entry ET-1171953 (row updated 11/5 8:55p PT), i.e. the open NEW task is not holding the door",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1172826 (row updated 11/5 8:55p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1176765 (row updated 11/5 8:55p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1176051 (row updated 11/5 8:54p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 18
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 2
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 7
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 1
const available = doors.filter((d) => d.status === "Available").length; // 3

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors Occupied",
    value: `18/23`,
    numerator: 18,
    denominator: TOTAL_DOORS,
    percentage: Math.round((18 / TOTAL_DOORS) * 100),
  },
  {
    label: "Doors w/ Active Tasks",
    value: `7`,
    numerator: 7,
    denominator: TOTAL_DOORS,
    percentage: Math.round((7 / TOTAL_DOORS) * 100),
  },
  {
    label: "Doors Available",
    value: `3`,
    numerator: 3,
    denominator: TOTAL_DOORS,
    percentage: Math.round((3 / TOTAL_DOORS) * 100),
  },
  {
    label: "Anomalies",
    value: `1`,
    numerator: 1,
    denominator: TOTAL_DOORS,
    percentage: Math.round((1 / TOTAL_DOORS) * 100),
  },
];

// Doors that carried dockStatus RESERVED at this pull:
// DOCK59, DOCK65.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, Nov 6 2026 ~7:11a PT).
// 8 active-status tasks at Bay 4 doors: 5 LOAD + 3 RECEIVE.
// JESUS ESPINOZA: 4 LOAD (DOCK51 TASK-5413721, DOCK52 TASK-5413720,
//   DOCK52 TASK-5413780, DOCK54 TASK-5413285)
// JORGE ARMANDO DUENAS: 1 LOAD (DOCK53 TASK-5413406)
// DANIELA GONZALEZ: 1 RECEIVE (DOCK63 TASK-5413838, status IN_PROGRESS)
// Jorge Antonio Franco: 1 RECEIVE (DOCK69 TASK-5381972, status NEW)
// daira gonzalez: 1 RECEIVE (DOCK50 TASK-5090739, status IN_PROGRESS, stale)
// All assigned names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "JESUS ESPINOZA", taskCount: 4 },
  { name: "JORGE ARMANDO DUENAS", taskCount: 1 },
  { name: "DANIELA GONZALEZ", taskCount: 1 },
  { name: "Jorge Antonio Franco", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
];

// All-time assignment counts - preserved from prior baseline (Jul 13 2026).
// NOT re-pulled in this refresh (out of scope of the request); carried
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

// Mix: 3 RECEIVE + 5 LOAD = 8 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 3, total: 8 },
  { label: "Outbound (LOAD)", count: 5, total: 8 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 5, total: 8 },
  { label: "Inbound", count: 3, total: 8 },
];

// --- Schedule Data (2026-11-06, Friday) ---
// % scheduled inbounds received TODAY: 7 GURUNANDA receipts carry an
//   appointmentTime inside the 11/6 PT business day (query window
//   appointmentTimeFrom "2026-11-06 00:00:00" -> appointmentTimeTo
//   "2026-11-06 23:59:59" returned totalCount 7). NONE of those receipts carries a
//   receivedStartTime = 0.0%. The DOCK63 receipt being received this morning
//   (RN-5011401) has no appointmentTime, so it is outside this denominator.
// % scheduled outbounds loaded TODAY: 26 GURUNANDA orders carry a scheduleDate
//   inside the 11/6 PT day (scheduleDatePeriod ["2026-11-06 00:00:00",
//   "2026-11-06 23:59:59"] returned totalCount 26). 2 of those orders are at
//   status SHIPPED (the "loaded" proxy defined by the prior refreshes) = 7.7%.
//   Remaining statuses on that day: PICKED 16, PLANNED 6, LOADED 1, COMMIT_FAILED 1.
//   The single LOADED order (DN-3441056) is loaded but not yet shipped and is not
//   counted in the SHIPPED proxy; loaded-inclusive would be 3 of 26 = 11.5%.
//   NOTE: pulled at 07:11 PT, so both denominators are partial-day populations.
export const scheduleAvailable = true;              // inbound denominator is 7 on 11/6
export const outboundScheduleAvailable = true;      // outbound denominator is 26 on 11/6
export const scheduledInboundOrders = 7;            // receipts with appointmentTime in the 11/6 PT day
export const scheduledOutboundOrders = 26;          // orders with scheduleDate in the 11/6 PT day
export const scheduledInboundReceived = 0;          // receipts with receivedStartTime in that set
export const scheduledOutboundLoaded = 2;           // orders at status SHIPPED in that set
export const pctScheduledInboundReceived = 0.0;     // 0 of 7 = 0.0%
export const pctScheduledOutboundLoaded = 7.7;      // 2 of 26 = 7.7%
// Facility-wide appointment context - unavailable (GURUNANDA-scoped queries only;
// no all-customer facility-wide appointment totals were pulled for this refresh).
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime where a task exists on the
// door and has actually started; unavailable for task-less doors and for NEW tasks
// with no startTime (no occupancy-start field in WMS, and the dock-door-status
// dashboard endpoint returns an empty Duration column). 16 of 23 doors carry no
// active task at this pull, so no duration is derived for them.
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Nov 6 2026 ~7:11a PT)
// 8 tasks total: 5 LOAD + 3 RECEIVE. All GURUNANDA, LLC.
// One is a data anomaly (TASK-5090739 on DOCK50 stale since 10/21/25).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA (userId 89) has 34 CLOSED GURUNANDA load transactions with endTime
// inside the 2026-10-30 00:00:00 - 2026-11-06 07:11 PT window (32 of them at Bay-4
// doors); the newest is DOCK7 TASK-5412682
// (started 11/4 11:26:03p PT, closed 11/5 11:17:30a PT; 1 load SHIPPED, seal A50746).
// He currently holds NO open Bay-4 task: the three he held on 11/5 were reassigned
// this morning (DOCK51, DOCK52, DOCK54 -> JESUS ESPINOZA; DOCK53 -> JORGE ARMANDO
// DUENAS) - reassignment times 11/6 2:30a and 4:51a PT.
export const assignments: TaskRecord[] = [
  // ----- OUTBOUND / LOAD (5) -----
  {
    taskId: "TASK-5413721",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 14h49m since 11/5 4:21:50p PT (JESUS ESPINOZA; ET-1179748, PRE_LOAD, 3 loads (LOADING 3), LOAD-5043824 / 50138679 LOADING - DN-3441639; LOAD-5043771 / 50135000 LOADING - DN-3441103; LOAD-5043768 / 50134943 LOADING - DN-3441056; trailer 53402CT, dock check-in 11/5 4:21p PT)",
    assignee: "JESUS ESPINOZA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5413720",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 15h29m since 11/5 3:41:35p PT (JESUS ESPINOZA; ET-1179746, PRE_LOAD, 1 load (LOADING 1), LOAD-5043775 / 50135014 LOADING - DN-3441149; trailer 53198, dock check-in 11/5 3:43p PT)",
    assignee: "JESUS ESPINOZA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5413780",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 13h04m since 11/5 6:06:28p PT (JESUS ESPINOZA; ET-1179787, PRE_LOAD, 1 load (LOADING 1), LOAD-5043887 / 50139598 LOADING - DN-3443505; trailer 53198, dock check-in 11/5 6:06p PT) - SECOND open task on DOCK52",
    assignee: "JESUS ESPINOZA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5413406",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 17h29m since 11/5 1:41:34p PT (JORGE ARMANDO DUENAS; ET-1179654, PRE_LOAD, 7 loads (LOADED 5, LOADING 2), LOAD-5043764 / 50134930 LOADED - DN-3439870; LOAD-5043776 / 50135015 LOADING - DN-3441203; LOAD-5043822 / 50138675 LOADING - DN-3441503; LOAD-5043813 / 50137757 LOADED - DN-3441217; LOAD-5043814 / 50137784 LOADED - DN-3441218; LOAD-5043815 / 50137825 LOADED - DN-3441235; LOAD-5043819 / 50138668 LOADED - DN-3441280; trailer 53120RL, dock check-in 11/5 1:41p PT)",
    assignee: "JORGE ARMANDO DUENAS",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5413285",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 19h42m since 11/5 11:28:46a PT (JESUS ESPINOZA; ET-1179604, PRE_LOAD, seal AMZ051228885, 8 loads (LOADED 5, LOADING 2, WINDOW_CHECKIN_DONE 1), LOAD-5043772 / 50135004 LOADED - DN-3441105; LOAD-5043774 / 50135012 LOADED - DN-3441110; LOAD-5043820 / 50138670 LOADING - DN-3441410; LOAD-5043765 / 50134932 LOADED - DN-3440783; LOAD-5043766 / 50134935 LOADED - DN-3440863; LOAD-5043767 / 50134939 LOADED - DN-3440947; LOAD-5043911 / 50140544 LOADING - DN-3441401; LOAD-5043823 / 50138677 WINDOW_CHECKIN_DONE - DN-3441632; trailer 53142, dock check-in 11/5 11:28a PT)",
    assignee: "JESUS ESPINOZA",
    door: "DOCK54",
  },

  // ----- INBOUND / RECEIVE (3) -----
  {
    taskId: "TASK-5413838",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 8h28m since 11/5 10:42:20p PT (DANIELA GONZALEZ; ET-1179831, RN-5011401, PO TIIU6317194, container TIIU6317194, seal NL028425, receivedStartTime 11/5 10:42:20p PT, no appointment; dock check-in 11/5 10:42:22p PT)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK63",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/30 10:46:50a PT (Jorge Antonio Franco; ET-1162686, RN-5010583, no appointment) - task has no startTime",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 10/21/25 1:21:14p PT; status still IN_PROGRESS although endTime is 10/22/25 10:42:01a PT; daira gonzalez, ET-1027622, RN-5002143)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
];
