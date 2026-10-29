/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-10-29 ~12:50p PT (live WISE / WMS-BAM APIs)
 *   Sources (all read with item-time-zone America/Los_Angeles; DB timestamps
 *   arrive in UTC and are shown below converted to facility-local PT):
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors, 23/23 rows
 *       returned (fresh dockStatus, spaceStatus, occupiedCustomerIds, entryId,
 *       updatedTime; newest door row touched 10/29 12:39:37p PT)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide totalCount 12); per-door dockId
 *       queries across all 23 Bay-4 docks -> 2 at Bay 4 doors (both DOCK54)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks, same per-door dockId sweep -> 3 at Bay 4 doors
 *       (DOCK50, DOCK69, DOCK71)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTime inside the 10/29 PT business day -> totalCount 7
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDate inside the 10/29 PT business day -> totalCount 55; re-run
 *       per status: 12 SHIPPED, 31 PICKED, 5 PLANNED, 7 other
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA load tasks with
 *       statuses CLOSED/FORCE_CLOSED and endTime inside the 10/29 PT day ->
 *       totalCount 9 (facility-wide; e.g. TASK-5407346 DOCK57 DANIEL BELTRAN
 *       closed 11:37:33a PT). None of the 9 is a Bay-4 door still holding a door.
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA CLOSED/FORCE_CLOSED
 *       load tasks for assigneeUserId 89 (ARNULFO MUNGUIA), endTime 10/22-10/29 PT ->
 *       totalCount 28 (source for the Arnulfo Assigned Activity stream)
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders at status
 *       PLANNED, no date filter -> totalCount 265 (planned-orders fallback)
 *   NOTE: door state is read from wms-location/search (dockStatus + spaceStatus),
 *   the same two status fields the dashboard already uses.
 *   NOTE: the scheduled-inbound/outbound windows are the facility-local PT day,
 *   expressed against the API's UTC timestamps (2026-10-29 07:00:00 ->
 *   2026-10-30 06:59:59), because the API compares the stored UTC values.
 *
 *   Key changes from the prior refresh (10/28 ~6:29a PT -> 10/29 ~12:50p PT):
 *     - Bay 4 GURUNANDA active tasks: 5 (2 LOAD + 3 RECEIVE) on 4 doors
 *       (DOCK54 x2, DOCK50, DOCK69, DOCK71) - down from 6 tasks on 5 doors.
 *       Closed since the 6:29a pull: TASK-5405497 (DOCK53, EDUARDO MEJIA,
 *       4 loads all LOADED) and TASK-5405484 (DOCK65, DANIELA GONZALEZ,
 *       RN-5011141). New since then: TASK-5407435 (DOCK54 PRE_LOAD, DANIEL
 *       BELTRAN, started 11:55:54a PT) and TASK-5407533 (DOCK71 RECEIVE,
 *       Jorge Antonio Franco, created 12:39:36p PT).
 *     - Task "Guru live out / in assign to Arnulfo" still resolves to ARNULFO
 *       MUNGUIA GURUNANDA Bay 4 work. No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo"; the stream is read as the
 *       assignee's task assignment transactions and none is invented here.
 *       His assigned-activity pull (closed load tasks, 10/22-10/29 PT) returns 28
 *       transactions; the newest is DOCK51 TASK-5406010 (PRE_LOAD, ET-1176332,
 *       load LOAD-5042950 SHIPPED / DN-3426377 / loadNo 50100436, seal 1303528,
 *       equipment TV53726; started 10/28 9:25:29a PT, closed 10/29 10:00:14a PT =
 *       24h35m). Two more of his closed today: TASK-5406438 (DOCK50, 7 loads all
 *       SHIPPED, closed 9:33:02a PT) and TASK-5406871 (DOCK53, LOAD-5042985
 *       SHIPPED, closed 8:58:11a PT). His open Bay-4 work is the stale
 *       TASK-5338695 (DOCK54); TASK-5405048 (DOCK54) is no longer active.
 *     - Bay 4 doors occupied (rule below): 22/23 - 0 available, 1 reserved
 *       (DOCK56). Raw dockStatus=OCCUPIED = 13/23; the extra occupied doors are
 *       space-occupied doors whose dockStatus reads AVAILABLE (DOCK50, DOCK51,
 *       DOCK52, DOCK53, DOCK55, DOCK57, DOCK59, DOCK60, DOCK61). Composition
 *       shifted vs the prior pull: DOCK51 is now space-occupied, DOCK56 is the
 *       reserved door, DOCK64 and DOCK69 read dock-occupied, and DOCK58/62/63/
 *       65/66/67/68/70/71/72 hold a dock but empty space.
 *     - Stale anomalies STILL OPEN: TASK-5338695 (DOCK54, LOAD started 8/7/26
 *       4:29:29p PT, ~82.9 days; status still IN_PROGRESS although its endTime is
 *       8/10/26 9:27:26a PT) and TASK-5090739 (DOCK50, RECEIVE started 10/21/25
 *       1:21:14p PT, ~373.0 days; status still IN_PROGRESS although its endTime is
 *       10/22/25 10:42:01a PT).
 *     - "% scheduled inbounds received" (10/29 PT day): 2 of 7 = 28.6%
 *       (RN-5011216 receivedStart 11:43:10a PT and RN-5011210 receivedStart
 *       12:04:26p PT; the other 5 receipts - RN-194780, RN-194779, RN-5011243,
 *       RN-5011235, RN-194178 - are still IMPORTED with no receivedStartTime).
 *     - "% scheduled outbounds loaded" (10/29 PT day): 12 of 55 = 21.8%
 *       (status split for the same day: 12 SHIPPED, 31 PICKED, 5 PLANNED,
 *       7 other; SHIPPED is the "loaded" proxy used by the prior refresh).
 *     - Inbound/outbound mix: 3 RECEIVE / 2 LOAD of 5 active Bay-4 tasks.
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
// NOT re-pulled in the 10/29 12:50p PT refresh (out of scope of the request). The
// array is left empty rather than carrying a stale result; Section 1 renders live
// from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 265 at the 10/29 ~12:50p PT pull.
export const plannedGurunandaOrderCount = 265;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 10/29 ~12:50p PT
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
    assignee: "daira gonzalez (RECEIVE - STALE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5090739"],
    duration: "RECEIVE STALE started 10/21/25 1:21:14p PT, ~373.0 days; task status still IN_PROGRESS although its endTime is 10/22/25 10:42:01a PT (TASK-5090739, daira gonzalez, ET-1027622, RN-5002143 CLOSED) · dock AVAILABLE, space occupied, occupiedCustomerIds ORG-655875, entry ET-1176489 (row updated 10/29 9:42:49a PT)",
    anomaly: true, // TASK-5090739 started 10/21/25 and is still IN_PROGRESS
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (ARNULFO MUNGUIA's TASK-5406010 closed here 10/29 10:00:14a PT, PRE_LOAD, 1 load SHIPPED) · dock AVAILABLE, space occupied, entry ET-1176332 (row updated 10/29 10:00:46a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied, entry ET-1176885 (row updated 10/29 9:58:03a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (ARNULFO MUNGUIA's TASK-5406871 closed here 10/29 8:58:11a PT, PRE_LOAD, LOAD-5042985 SHIPPED) · dock AVAILABLE, space occupied, entry ET-1177044 (row updated 10/29 10:28:08a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "DANIEL BELTRAN (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5407435", "TASK-5338695"],
    duration: "LOAD ~55m since 10/29 11:55:54a PT (TASK-5407435, DANIEL BELTRAN, ET-1177123, PRE_LOAD, load LOAD-5043125 LOADING / 50102887, LOAD-5043124 LOADED / 50102886, equipment 53603, dock check-in 11:56:03a PT) — plus one STALE LOAD started 8/7/26 4:29:29p PT, ~82.9 days, task still IN_PROGRESS although its endTime is 8/10/26 9:27:26a PT (TASK-5338695, ARNULFO MUNGUIA, LOAD-5035487 SHIPPED / DN-3278524) · dock and space occupied (row updated 10/29 11:56:03a PT)",
    anomaly: true, // TASK-5338695 started 8/7/26 but is still IN_PROGRESS
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied, entry ET-1176575 (row updated 10/29 11:45:23a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space occupied, entry ET-1177057 (row updated 10/29 9:57:09a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (TASK-5407346 closed here 10/29 11:37:33a PT, DANIEL BELTRAN, 1 load SHIPPED) · dock AVAILABLE, space occupied, entry ET-1177083 (row updated 10/29 11:37:39a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1174121 (row updated 10/28 8:57:54p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied, entry ET-1176947 (row updated 10/29 9:49:37a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied, occupiedCustomerIds ORG-655875, entry ET-1177026 (row updated 10/29 11:13:39a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied, entry ET-1173482 (row updated 10/28 8:58:42p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1174077 (row updated 10/28 8:57:37p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1174051 (row updated 10/28 8:57:27p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied, entry ET-1176745 (row updated 10/29 11:17:46a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (TASK-5405484, DANIELA GONZALEZ, RN-5011141, closed since the 6:29a PT pull) · dock occupied, space empty, entry ET-1176517 (row updated 10/28 8:56:57p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1173309 (row updated 10/28 8:56:35p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1175341 (row updated 10/28 8:56:26p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1174584 (row updated 10/28 8:56:14p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW · created 9/30 10:46:50a PT (TASK-5381972, Jorge Antonio Franco, ET-1162686, RN-5010583 IMPORTED / PO9139-2) - task has no startTime, so no duration basis · dock occupied, space empty (row updated 10/29 7:07:43a PT), i.e. the open NEW task is not holding the door",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1172826 (row updated 10/28 8:55:44p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5407533"],
    duration: "RECEIVE NEW · created 10/29 12:39:36p PT (TASK-5407533, Jorge Antonio Franco, ET-1177182, RN-5011235 IMPORTED / PO 9448, appointment 10:00a PT, trailer 181466 53', in yard 12:37:37p PT) - task has no startTime, so no duration basis · dock occupied, space empty (row updated 10/29 12:39:37p PT)",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1176051 (row updated 10/28 8:55:31p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 22
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 1
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 4
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 2
const available = doors.filter((d) => d.status === "Available").length; // 0

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

// Doors carrying dockStatus RESERVED at this pull: DOCK56.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (per-door dockId sweep for all 23 Bay-4 docks, Oct 29 2026 ~12:50p PT).
// 5 active-status tasks at Bay 4 doors: 2 LOAD + 3 RECEIVE.
// DANIEL BELTRAN: 1 LOAD (DOCK54 TASK-5407435, PRE_LOAD, IN_PROGRESS)
// ARNULFO MUNGUIA: 1 LOAD (DOCK54 TASK-5338695 stale)
// Jorge Antonio Franco: 2 RECEIVE (DOCK69 TASK-5381972 NEW, DOCK71 TASK-5407533 NEW)
// daira gonzalez: 1 RECEIVE (DOCK50 TASK-5090739, STALE)
// All assigned names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "Jorge Antonio Franco", taskCount: 2 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "ARNULFO MUNGUIA", taskCount: 1 },
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

// Mix: 3 RECEIVE + 2 LOAD = 5 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 3, total: 5 },
  { label: "Outbound (LOAD)", count: 2, total: 5 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 2, total: 5 },
  { label: "Inbound", count: 3, total: 5 },
];

// --- Schedule Data (2026-10-29, Thursday) ---
// % scheduled inbounds received TODAY: 7 GURUNANDA receipts carry an
//   appointmentTime inside the 10/29 PT business day (query window
//   2026-10-29 07:00:00 -> 2026-10-30 06:59:59 UTC returned totalCount 7).
//   Status re-checked on the same 7 rows: 2 in progress with receivedStartTime
//   (RN-5011216 at 11:43:10a PT, RN-5011210 at 12:04:26p PT) and 5 still
//   IMPORTED with no receivedStartTime (RN-194780, RN-194779, RN-5011243,
//   RN-5011235, RN-194178), so received = 2 of 7 = 28.6%.
// % scheduled outbounds loaded TODAY: 55 GURUNANDA orders carry a scheduleDate
//   inside the 10/29 PT day (same window returned totalCount 55); 12 of them
//   carry status SHIPPED (same date filter + status SHIPPED returned
//   totalCount 12), so loaded = 12 of 55 = 21.8%. Remaining order statuses:
//   31 PICKED, 5 PLANNED, 7 other (SHIPPED is the "loaded" proxy defined by the
//   prior refresh).
export const scheduleAvailable = true;              // inbound denominator is 7
export const outboundScheduleAvailable = true;      // outbound denominator is 55
export const scheduledInboundOrders = 7;            // receipts with appointmentTime in the 10/29 PT day
export const scheduledOutboundOrders = 55;          // orders with scheduleDate in the 10/29 PT day
export const scheduledInboundReceived = 2;          // receipts with receivedStartTime today
export const scheduledOutboundLoaded = 12;          // orders at status SHIPPED today
export const pctScheduledInboundReceived = 28.6;    // 2 of 7 = 28.57% -> 28.6%
export const pctScheduledOutboundLoaded = 21.8;     // 12 of 55 = 21.82% -> 21.8%
// Facility-wide appointment context - unavailable (GURUNANDA-scoped query only;
// no all-customer facility-wide appointment totals were pulled for this refresh).
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime where a task exists on the
// door and has actually started; unavailable for task-less doors and for NEW tasks
// with no startTime (no occupancy-start field in WMS, and the dock-door-status
// dashboard endpoint returns an empty Duration column).
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Oct 29 2026 ~12:50p PT)
// 5 tasks total: 2 LOAD + 3 RECEIVE. All GURUNANDA, LLC.
// Two are stale-anomaly tasks (TASK-5338695 on DOCK54, TASK-5090739 on DOCK50).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA (userId 89) has 28 CLOSED GURUNANDA load transactions inside
// 10/22-10/29 PT; the newest is DOCK51 TASK-5406010 (PRE_LOAD, ET-1176332, load
// LOAD-5042950 DN-3426377 SHIPPED / loadNo 50100436, seal 1303528, equipment
// TV53726; started 10/28 9:25:29a PT, closed 10/29 10:00:14a PT = 24h35m).
// Also closed today: TASK-5406438 (DOCK50, 7 loads all SHIPPED, closed
// 9:33:02a PT) and TASK-5406871 (DOCK53, LOAD-5042985 SHIPPED, closed
// 8:58:11a PT). None of the closed tasks is part of the active list below. His
// only open Bay-4 work is the stale TASK-5338695 (DOCK54).
export const assignments: TaskRecord[] = [
  // ----- OUTBOUND / LOAD (2) -----
  {
    taskId: "TASK-5407435",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~55m since 10/29 11:55:54a PT (DANIEL BELTRAN; ET-1177123, PRE_LOAD, load LOAD-5043125 LOADING / 50102887 - DN-3427324, LOAD-5043124 LOADED / 50102886 - DN-3427325; equipment 53603, dock check-in 11:56:03a PT)",
    assignee: "DANIEL BELTRAN",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5338695",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 8/7/26 4:29:29p PT, ~82.9 days; status still IN_PROGRESS although endTime is 8/10/26 9:27:26a PT; ARNULFO MUNGUIA, ET-1135033, PRE_LOAD, LOAD-5035487 SHIPPED / DN-3278524)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },

  // ----- INBOUND / RECEIVE (3) -----
  {
    taskId: "TASK-5407533",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 10/29 12:39:36p PT (Jorge Antonio Franco; ET-1177182, RN-5011235 IMPORTED / PO 9448, appointment 10:00a PT, trailer 181466 53', in yard 12:37:37p PT, BOL CORRU102926UNIS) - task has no startTime",
    assignee: "Jorge Antonio Franco",
    door: "DOCK71",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/30 10:46:50a PT (Jorge Antonio Franco; ET-1162686, RN-5010583 IMPORTED / PO9139-2) - task has no startTime",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 10/21/25 1:21:14p PT, ~373.0 days; status still IN_PROGRESS although endTime is 10/22/25 10:42:01a PT; daira gonzalez, ET-1027622, RN-5002143 CLOSED)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
];
