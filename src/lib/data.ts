/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-05 16:57:00 PT (live WISE / WMS-BAM APIs)
 *   Sources (all read with item-time-zone America/Los_Angeles; the API returns
 *   dock/task/receipt/order timestamps as facility-local PT wall-clock values, so
 *   PT windows below are written as plain PT wall-clock strings):
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors, 23/23 rows
 *       returned (fresh dockStatus, spaceStatus, occupiedCustomerIds, entryId,
 *       updatedTime)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide totalCount 15); matched on dockName to
 *       the 23 Bay-4 docks -> 4 at Bay 4 doors (DOCK51, DOCK52, DOCK53, DOCK54)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide totalCount 13), same per-door
 *       dockName match -> 2 at Bay 4 doors (DOCK69, DOCK50)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To inside the 11/5 PT business day -> totalCount 8
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDatePeriod inside the 11/5 PT business day -> totalCount 40
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA CLOSED/FORCE_CLOSED
 *       load tasks for assigneeUserId 89 (ARNULFO MUNGUIA), endTime
 *       2026-10-29 00:00:00 - now PT, sorted endTime DESC
 *       -> 38 transactions (Arnulfo Assigned Activity stream), 36 at Bay-4 doors
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders at status
 *       PLANNED, no date filter -> totalCount 200 (planned-orders fallback)
 *   NOTE: door state is read from wms-location/search (dockStatus + spaceStatus),
 *   the same two status fields the dashboard already uses.
 *   NOTE: the load/receive task searches were filtered by customer only and matched
 *   to Bay-4 doors on the returned dockName field (dockId is also present but is a
 *   numeric location id, not the DOCKnn name).
 *   NOTE: the query shape used here is byte-identical to the prior refresh. As a
 *   control, the 11/5 PT order query re-reads today's scheduleDate set, and the
 *   same pull on the prior business day still returns that day's counts, so the
 *   numbers below are comparable with the 11/4 pull.
 *
 *   CONTEXT - 11/5 PT is a Thursday. 8 GURUNANDA receipts carry an appointment on
 *   11/5; 1 of them carries a receivedStartTime = 12.5% received.
 *   40 GURUNANDA orders carry scheduleDate 11/5; 16 are at status SHIPPED (the
 *   loaded proxy defined by the prior refreshes) = 40.0%.
 *
 *   Key changes from the prior refresh (11/5 ~4:30p PT -> 11/5 ~4:57p PT):
 *     - DOOR STATUS: unchanged, re-read door-by-door and re-confirmed. Still
 *       16/23 occupied, 3 reserved (DOCK50, DOCK59, DOCK65), 4 available
 *       (DOCK62, DOCK69, DOCK70, DOCK71). Raw dockStatus=OCCUPIED is still
 *       14/23; the 2 remaining occupied doors (DOCK56, DOCK57) are
 *       space-occupied only with dockStatus AVAILABLE. Every door's
 *       updatedTime and entryId came back identical to the 4:30p pull, i.e.
 *       no door changed state in the ~27 minutes between the two pulls.
 *     - TASK TURNOVER: none. The same 6 active tasks (4 LOAD + 2 RECEIVE)
 *       sit on the same 6 doors (DOCK50, DOCK51, DOCK52, DOCK53, DOCK54,
 *       DOCK69) with the same assignees. Only the elapsed LOAD durations
 *       advanced (DOCK51 0h08m -> 0h35m, DOCK52 0h48m -> 1h15m,
 *       DOCK53 2h48m -> 3h15m, DOCK54 5h01m -> 5h28m).
 *     - STALE ANOMALY: unchanged. TASK-5090739 (DOCK50, RECEIVE started
 *       10/21/25 1:21:14p PT) is still returned by the active-status query although
 *       its endTime is 10/22/25 10:42:01a PT.
 *     - Task "Guru live out / in assign to Arnulfo" still resolves to ARNULFO
 *       MUNGUIA GURUNANDA Bay 4 work. No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo"; the stream is read as the
 *       assignee's task assignment transactions and none is invented here.
 *       His assigned-activity pull (closed load tasks, endTime from 2026-10-29 00:00:00 PT)
 *       returns 38 transactions (36 at Bay-4 doors); the newest is
 *       DOCK7 TASK-5412682 (closed 11/5 11:17:30a PT, seal A50746; not a
 *       Bay-4 door).
 *       3 of his Bay-4 LOAD tasks are open right now
 *       (DOCK51 TASK-5413721, DOCK53 TASK-5413406, DOCK54 TASK-5413285).
 *     - "% scheduled inbounds received" (11/5 PT day): 1 of 8 = 12.5% - computable
 *       this pull.
 *     - "% scheduled outbounds loaded" (11/5 PT day): 16 of 40 = 40.0% (SHIPPED proxy).
 *     - Inbound/outbound mix: 2 RECEIVE / 4 LOAD of 6 active Bay-4 tasks.
 *     - Door occupancy duration is available only where a task with a startTime
 *       sits on the door; WMS has no occupancy-start field for task-less doors
 *       (and for NEW tasks that never started), so none is derived.
 *
 *   NOTE: the in-yard FULL equipment array was NOT re-pulled in this refresh
 *   (out of scope of the request); Section 1 renders live from the WMS loader, so
 *   the dashboard still shows current data. The all-time assignee baseline was
 *   also not re-pulled.
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
// NOT re-pulled in the 11/5 4:57p PT refresh (out of scope of the request). The
// array is left empty rather than carrying a stale result; Section 1 renders live
// from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 200 at the 11/5 ~4:57p PT pull (was 202).
export const plannedGurunandaOrderCount = 200;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/5 ~4:57p PT
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
    duration: "RECEIVE STARTED 10/21/25 1:21:14p PT and still returned as IN_PROGRESS although endTime is 10/22/25 10:42:01a PT (TASK-5090739, daira gonzalez, RN-5002143) - stale status, so no open-ended duration is derived · dock RESERVED, space OCCUPIED, entry ET-1179714 (row updated 11/5 2:18p PT)",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5413721"],
    duration: "LOAD 0h35m since 11/5 4:21:50p PT (TASK-5413721, ARNULFO MUNGUIA, ET-1179748, PRE_LOAD, 3 loads (LOADING 3), LOAD-5043824 / 50138679 LOADING - DN-3441639; LOAD-5043771 / 50135000 LOADING - DN-3441103; LOAD-5043768 / 50134943 LOADING - DN-3441056; trailer 53402CT, dock check-in 11/5 4:21p PT) · dock OCCUPIED, space OCCUPIED, entry ET-1179748 (row updated 11/5 4:21p PT)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "JESUS ESPINOZA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5413720"],
    duration: "LOAD 1h15m since 11/5 3:41:35p PT (TASK-5413720, JESUS ESPINOZA, ET-1179746, PRE_LOAD, 1 load (LOADING 1), LOAD-5043775 / 50135014 LOADING - DN-3441149; trailer 53198, dock check-in 11/5 3:43p PT) · dock OCCUPIED, space EMPTY, entry ET-1179746 (row updated 11/5 3:43p PT)",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5413406"],
    duration: "LOAD 3h15m since 11/5 1:41:34p PT (TASK-5413406, ARNULFO MUNGUIA, ET-1179654, PRE_LOAD, 7 loads (LOADED 5, WINDOW_CHECKIN_DONE 2), LOAD-5043764 / 50134930 LOADED - DN-3439870; LOAD-5043776 / 50135015 WINDOW_CHECKIN_DONE - DN-3441203; LOAD-5043822 / 50138675 WINDOW_CHECKIN_DONE - DN-3441503; LOAD-5043813 / 50137757 LOADED - DN-3441217; LOAD-5043814 / 50137784 LOADED - DN-3441218; LOAD-5043815 / 50137825 LOADED - DN-3441235; LOAD-5043819 / 50138668 LOADED - DN-3441280; trailer 53120RL, dock check-in 11/5 1:41p PT) · dock OCCUPIED, space OCCUPIED, entry ET-1179654 (row updated 11/5 4:17p PT)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5413285"],
    duration: "LOAD 5h28m since 11/5 11:28:46a PT (TASK-5413285, ARNULFO MUNGUIA, ET-1179604, PRE_LOAD, seal AMZ051228885, 8 loads (LOADED 5, WINDOW_CHECKIN_DONE 3), LOAD-5043772 / 50135004 LOADED - DN-3441105; LOAD-5043774 / 50135012 LOADED - DN-3441110; LOAD-5043820 / 50138670 WINDOW_CHECKIN_DONE - DN-3441410; LOAD-5043765 / 50134932 LOADED - DN-3440783; LOAD-5043766 / 50134935 LOADED - DN-3440863; LOAD-5043767 / 50134939 LOADED - DN-3440947; LOAD-5043911 / 50140544 WINDOW_CHECKIN_DONE - DN-3441401; LOAD-5043823 / 50138677 WINDOW_CHECKIN_DONE - DN-3441632; trailer 53142, dock check-in 11/5 11:28a PT) · dock OCCUPIED, space OCCUPIED, entry ET-1179604 (row updated 11/5 4:21p PT)",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1179693 (row updated 11/5 4:07p PT) · no occupancy-start field in WMS",
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
    duration: "No active task · dock OCCUPIED, space OCCUPIED, entry ET-1179568 (row updated 11/5 3:21p PT) · no occupancy-start field in WMS",
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
    duration: "No active task · dock OCCUPIED, space OCCUPIED, entry ET-1179653 (row updated 11/5 3:21p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1179378 (row updated 11/5 6:13a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1179383 (row updated 11/5 6:12a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1179388 (row updated 11/5 4:04p PT) · no occupancy-start field in WMS",
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
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1173309 (row updated 11/4 8:54p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1177613 (row updated 11/4 8:54p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1177841 (row updated 11/4 8:54p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Available",
    assignee: "Jorge Antonio Franco (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW, not started (created 9/30 10:46:50a PT, TASK-5381972, Jorge Antonio Franco, ET-1162686, receipts RN-5010583) - no startTime, so no duration basis · dock AVAILABLE, space EMPTY, entry ET-1171953 (row updated 10/30 3:46p PT), i.e. the open NEW task is not holding the door",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1172826 (row updated 11/5 6:13a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1176765 (row updated 11/3 3:47p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1176051 (row updated 11/4 8:54p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 16
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 3
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 6
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 1
const available = doors.filter((d) => d.status === "Available").length; // 4

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors Occupied",
    value: `16/23`,
    numerator: 16,
    denominator: TOTAL_DOORS,
    percentage: Math.round((16 / TOTAL_DOORS) * 100),
  },
  {
    label: "Doors w/ Active Tasks",
    value: `6`,
    numerator: 6,
    denominator: TOTAL_DOORS,
    percentage: Math.round((6 / TOTAL_DOORS) * 100),
  },
  {
    label: "Doors Available",
    value: `4`,
    numerator: 4,
    denominator: TOTAL_DOORS,
    percentage: Math.round((4 / TOTAL_DOORS) * 100),
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
// DOCK50, DOCK59, DOCK65.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, Nov 5 2026 ~4:57p PT).
// 6 active-status tasks at Bay 4 doors: 4 LOAD + 2 RECEIVE.
// ARNULFO MUNGUIA: 3 LOAD (DOCK51 TASK-5413721, DOCK53 TASK-5413406, DOCK54 TASK-5413285)
// JESUS ESPINOZA: 1 LOAD (DOCK52 TASK-5413720)
// Jorge Antonio Franco: 1 RECEIVE (DOCK69 TASK-5381972, status NEW)
// daira gonzalez: 1 RECEIVE (DOCK50 TASK-5090739, status IN_PROGRESS, stale)
// All assigned names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 3 },
  { name: "JESUS ESPINOZA", taskCount: 1 },
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

// Mix: 2 RECEIVE + 4 LOAD = 6 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 2, total: 6 },
  { label: "Outbound (LOAD)", count: 4, total: 6 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 6 },
  { label: "Inbound", count: 2, total: 6 },
];

// --- Schedule Data (2026-11-05, Thursday) ---
// % scheduled inbounds received TODAY: 8 GURUNANDA receipts carry an
//   appointmentTime inside the 11/5 PT business day (query window
//   appointmentTimeFrom "2026-11-05 00:00:00" -> appointmentTimeTo
//   "2026-11-05 23:59:59" returned totalCount 8). 1 of those receipts carries a
//   receivedStartTime (TQL) = 12.5%.
// % scheduled outbounds loaded TODAY: 40 GURUNANDA orders carry a scheduleDate
//   inside the 11/5 PT day (scheduleDatePeriod ["2026-11-05 00:00:00",
//   "2026-11-05 23:59:59"] returned totalCount 40). 16 of those orders are at
//   status SHIPPED (the "loaded" proxy defined by the prior refreshes) = 40.0%.
//   Remaining statuses on that day: COMMIT_FAILED 2, PICKED 14, PICKING 2, PLANNED 6.
export const scheduleAvailable = true;              // inbound denominator is 8 on 11/5
export const outboundScheduleAvailable = true;      // outbound denominator is 40 on 11/5
export const scheduledInboundOrders = 8;            // receipts with appointmentTime in the 11/5 PT day
export const scheduledOutboundOrders = 40;          // orders with scheduleDate in the 11/5 PT day
export const scheduledInboundReceived = 1;          // receipts with receivedStartTime in that set
export const scheduledOutboundLoaded = 16;         // orders at status SHIPPED in that set
export const pctScheduledInboundReceived = 12.5;    // 1 of 8 = 12.5%
export const pctScheduledOutboundLoaded = 40.0;      // 16 of 40 = 40.0%
// Facility-wide appointment context - unavailable (GURUNANDA-scoped queries only;
// no all-customer facility-wide appointment totals were pulled for this refresh).
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime where a task exists on the
// door and has actually started; unavailable for task-less doors and for NEW tasks
// with no startTime (no occupancy-start field in WMS, and the dock-door-status
// dashboard endpoint returns an empty Duration column). 17 of 23 doors carry no
// active task at this pull, so no duration is derived for them.
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Nov 5 2026 ~4:57p PT)
// 6 tasks total: 4 LOAD + 2 RECEIVE. All GURUNANDA, LLC.
// One is a data anomaly (TASK-5090739 on DOCK50 stale since 10/21/25).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA (userId 89) has 38 CLOSED GURUNANDA load transactions with endTime
// inside the 2026-10-29 00:00:00 - 2026-11-05 16:57 PT window; the newest is DOCK7
// TASK-5412682 (started 11/4 11:26:03p PT, closed 11/5 11:17:30a PT;
// 1 load SHIPPED, seal A50746).
// His open Bay-4 work is 3 live LOAD tasks
// (DOCK51 TASK-5413721, DOCK53 TASK-5413406, DOCK54 TASK-5413285).
export const assignments: TaskRecord[] = [
  // ----- OUTBOUND / LOAD (4) -----
  {
    taskId: "TASK-5413721",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 0h35m since 11/5 4:21:50p PT (ARNULFO MUNGUIA; ET-1179748, PRE_LOAD, 3 loads (LOADING 3), LOAD-5043824 / 50138679 LOADING - DN-3441639; LOAD-5043771 / 50135000 LOADING - DN-3441103; LOAD-5043768 / 50134943 LOADING - DN-3441056; trailer 53402CT, dock check-in 11/5 4:21p PT)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5413720",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 1h15m since 11/5 3:41:35p PT (JESUS ESPINOZA; ET-1179746, PRE_LOAD, 1 load (LOADING 1), LOAD-5043775 / 50135014 LOADING - DN-3441149; trailer 53198, dock check-in 11/5 3:43p PT)",
    assignee: "JESUS ESPINOZA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5413406",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 3h15m since 11/5 1:41:34p PT (ARNULFO MUNGUIA; ET-1179654, PRE_LOAD, 7 loads (LOADED 5, WINDOW_CHECKIN_DONE 2), LOAD-5043764 / 50134930 LOADED - DN-3439870; LOAD-5043776 / 50135015 WINDOW_CHECKIN_DONE - DN-3441203; LOAD-5043822 / 50138675 WINDOW_CHECKIN_DONE - DN-3441503; LOAD-5043813 / 50137757 LOADED - DN-3441217; LOAD-5043814 / 50137784 LOADED - DN-3441218; LOAD-5043815 / 50137825 LOADED - DN-3441235; LOAD-5043819 / 50138668 LOADED - DN-3441280; trailer 53120RL, dock check-in 11/5 1:41p PT)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5413285",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 5h28m since 11/5 11:28:46a PT (ARNULFO MUNGUIA; ET-1179604, PRE_LOAD, seal AMZ051228885, 8 loads (LOADED 5, WINDOW_CHECKIN_DONE 3), LOAD-5043772 / 50135004 LOADED - DN-3441105; LOAD-5043774 / 50135012 LOADED - DN-3441110; LOAD-5043820 / 50138670 WINDOW_CHECKIN_DONE - DN-3441410; LOAD-5043765 / 50134932 LOADED - DN-3440783; LOAD-5043766 / 50134935 LOADED - DN-3440863; LOAD-5043767 / 50134939 LOADED - DN-3440947; LOAD-5043911 / 50140544 WINDOW_CHECKIN_DONE - DN-3441401; LOAD-5043823 / 50138677 WINDOW_CHECKIN_DONE - DN-3441632; trailer 53142, dock check-in 11/5 11:28a PT)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },

  // ----- INBOUND / RECEIVE (2) -----
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
