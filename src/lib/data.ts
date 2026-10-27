/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-10-27 ~8:58a PT (live WISE / WMS-BAM APIs)
 *   Sources (all read with item-time-zone America/Los_Angeles, so all times
 *   below are facility-local PT):
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors
 *       (fresh dockStatus, spaceStatus, occupiedCustomerIds, entryId, updatedTime)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide totalCount 11; 4 at Bay 4 doors)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide totalCount 14; 3 at Bay 4 doors)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To = 2026-10-27 -> totalCount 4 (all IMPORTED)
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDateFrom/To = 2026-10-27 -> totalCount 42; re-run per status:
 *       33 PLANNED, 7 PICKED, 2 SHIPPED (0 PICKING, 0 LOADING, 0 LOADED)
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA load tasks with
 *       statuses CLOSED/FORCE_CLOSED and endTime inside 2026-10-27 -> totalCount 1
 *       (TASK-5404258, DOCK52, ARNULFO MUNGUIA, closed 8:48:49a PT)
 *     - /wms-bam/dashboard/dock-door-status/search-by-paging - read for
 *       cross-check only (per-door Status + Task ID); its "Duration" column is
 *       empty for all 23 Bay 4 doors, so door durations are still derived from
 *       task startTime.
 *   NOTE: door state is read from wms-location/search (dockStatus + spaceStatus),
 *   the same two status fields the dashboard already uses.
 *
 *   Key changes from the prior refresh (10/22 ~4:01p PT -> 10/27 ~8:58a PT):
 *     - Bay 4 GURUNANDA active tasks: 7 (4 LOAD + 3 RECEIVE) on 7 doors
 *       (DOCK50, DOCK51, DOCK54, DOCK55, DOCK60, DOCK68, DOCK69).
 *       New since 10/22: TASK-5404713 (DOCK60 LIVE_LOAD, DANIEL BELTRAN,
 *       started 8:33:58a), TASK-5404749 (DOCK55 LIVE_LOAD, JEROME ARANDA, NEW
 *       at 8:44:44a). Gone from the active Bay-4 population (closed):
 *       TASK-5401241, TASK-5401111, TASK-5401012, TASK-5400354.
 *       TASK-5401002 (DOCK68 RECEIVE) is still open but now sits with
 *       Fatima Ponce instead of RUFINO MUNGUIA.
 *     - Task "Guru live out / in assign to Arnulfo" again resolves to ARNULFO
 *       MUNGUIA GURUNANDA Bay 4 work. His Assigned Activity for today is one
 *       closed transaction: DOCK52 TASK-5404258 (PRE_LOAD, ET-1175417, loads
 *       LOAD-5042723 / LOAD-5042722 both SHIPPED, seal A51935; started 10/26
 *       6:48:07p PT, closed 10/27 8:48:49a PT = 14.0h). His only remaining open
 *       GURUNANDA Bay-4 tasks are the two stale loads TASK-5402525 (DOCK51) and
 *       TASK-5338695 (DOCK54). Today's only in-progress live load at Bay 4 is
 *       DANIEL BELTRAN's DOCK60 TASK-5404713. No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo" and none is invented here; the
 *       stream is read as the assignee's task assignment transactions.
 *     - Bay 4 doors occupied (rule below): 20/23 - 3 available
 *       (DOCK58, DOCK65, DOCK71), 0 reserved.
 *       Raw dockStatus=OCCUPIED = 17/23; the extra occupied doors are
 *       space-occupied doors whose dockStatus reads AVAILABLE (DOCK52, DOCK55,
 *       DOCK56). No door carries dockStatus RESERVED at this pull.
 *     - Stale anomalies STILL OPEN: TASK-5338695 (DOCK54, LOAD started 8/7/26
 *       4:29:29p PT, ~80.7 days; status still IN_PROGRESS although its endTime is
 *       8/10/26 9:27:26a PT), TASK-5090739 (DOCK50, RECEIVE started 10/21/25
 *       1:21:14p PT, ~370.8 days; status still IN_PROGRESS although its endTime is
 *       10/22/25 10:42:01a PT), and a NEW one: TASK-5402525 (DOCK51, LOAD started
 *       10/23/26 3:42:02p PT, endTime 10/26/26 11:16:54a PT and its only load
 *       LOAD-5042648 is SHIPPED, yet the task is still IN_PROGRESS).
 *     - "% scheduled inbounds received" (10/27): 0 of 4 = 0.0%
 *       (all 4 receipts are still IMPORTED with no receivedStartTime or
 *       receivedTime at this pull).
 *     - "% scheduled outbounds loaded" (10/27): 2 of 42 = 4.8%
 *       (status split for the same day: 33 PLANNED, 7 PICKED, 2 SHIPPED).
 *     - Inbound/outbound mix: 3 RECEIVE / 4 LOAD of 7 active Bay-4 tasks.
 *     - Door occupancy duration is available only where a task with a startTime
 *       sits on the door; WMS has no occupancy-start field for task-less doors
 *       (and for the two NEW tasks that never started), so none is derived.
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
// NOT re-pulled in the 10/27 refresh (out of scope of the request). The array is
// left empty rather than carrying a stale result; Section 1 renders live from the
// WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 326 at the 10/27 ~8:58a PT pull.
export const plannedGurunandaOrderCount = 326;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 10/27 ~8:58a PT
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
    duration: "RECEIVE STALE started 10/21/25 1:21:14p PT, ~370.8 days; task status still IN_PROGRESS although its endTime is 10/22/25 10:42:01a PT (TASK-5090739, daira gonzalez, ET-1027622, RN-5002143 CLOSED) · dock and space occupied, occupiedCustomerIds ORG-655875 (row updated 10/26 10:41:50p PT)",
    anomaly: true, // TASK-5090739 started 10/21/25 and is still IN_PROGRESS
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD - STALE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5402525"],
    duration: "LOAD started 10/23/26 3:42:02p PT, ~3.7 days (89h) and still IN_PROGRESS although its endTime is 10/26/26 11:16:54a PT and its only load is SHIPPED (TASK-5402525, ARNULFO MUNGUIA, ET-1174529, PRE_LOAD, LOAD-5042648 SHIPPED, seal 1303556) · dock and space occupied (row updated 10/26 10:41:32p PT)",
    anomaly: true, // endTime passed and load shipped, but task still IN_PROGRESS
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (TASK-5404258 closed 10/27 8:48:49a PT after 14.0h, ARNULFO MUNGUIA, 2 loads SHIPPED) · dock AVAILABLE, space occupied (row updated 10/27 8:53:41a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (row updated 10/26 10:41:00p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD - STALE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5338695"],
    duration: "LOAD STALE started 8/7/26 4:29:29p PT, ~80.7 days (1936h); task status still IN_PROGRESS although its endTime is 8/10/26 9:27:26a PT (TASK-5338695, ARNULFO MUNGUIA, ET-1135033, PRE_LOAD, LOAD-5035487 SHIPPED, seal 25079976) · dock and space occupied (row updated 10/26 10:40:39p PT)",
    anomaly: true, // TASK-5338695 started 8/7/26 but is still IN_PROGRESS
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "JEROME ARANDA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5404749"],
    duration: "LOAD NEW created 10/27 8:44:44a PT (TASK-5404749, JEROME ARANDA, ET-1175656, LIVE_LOAD, 3 loads all WINDOW_CHECKIN_DONE) - task has no startTime, so no duration basis · dock AVAILABLE, space occupied (row updated 10/27 8:48:17a PT)",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied (row updated 10/26 2:09:46p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (row updated 10/26 9:24:51a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available (row updated 10/26 3:58:53p PT)",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/27 6:10:30a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: "DANIEL BELTRAN (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5404713"],
    duration: "LOAD ~25m since 10/27 8:33:58a PT (TASK-5404713, DANIEL BELTRAN, ET-1175605, LIVE_LOAD, LOAD-5042521 LOADING, 10 orders, equipment CFT-030) · dock and space occupied, occupiedCustomerIds ORG-655875 (row updated 10/27 8:34:22a PT)",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (row updated 10/26 10:39:41p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (row updated 10/26 10:39:22p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/26 10:38:52p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/22 8:57:03p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available (row updated 10/26 1:26:03p PT)",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/26 10:38:30p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/27 6:09:37a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: "Fatima Ponce (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5401002"],
    duration: "RECEIVE ~4.9 days (117h) since 10/22 12:22:18p PT (TASK-5401002, Fatima Ponce, ET-1173817, RN-194449 IN_PROGRESS / GN10212026UNIS-1290) · dock occupied, space empty (row updated 10/26 10:37:33p PT)",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW · created 9/30 10:46:50a PT (TASK-5381972, Jorge Antonio Franco, ET-1162686, RN-5010583 IMPORTED / PO9139-2) - task has no startTime, so no duration basis · dock and space occupied (row updated 10/22 8:56:43p PT)",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/26 10:37:06p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available (row updated 10/27 6:09:35a PT)",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (row updated 10/26 10:36:23p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 20
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 0
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 7
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 3
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

// No door carries dockStatus RESERVED at this pull; reservedDoorCount stays
// exported for the DoorGrid legend.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (Oct 27 2026 ~8:58a PT). 7 active-status tasks at Bay 4 doors: 4 LOAD + 3 RECEIVE.
// DANIEL BELTRAN: 1 LOAD (DOCK60 TASK-5404713, LIVE_LOAD, IN_PROGRESS)
// JEROME ARANDA: 1 LOAD (DOCK55 TASK-5404749, LIVE_LOAD, NEW)
// ARNULFO MUNGUIA: 2 LOAD (DOCK51 TASK-5402525 and DOCK54 TASK-5338695, both stale)
// Fatima Ponce: 1 RECEIVE (DOCK68 TASK-5401002)
// Jorge Antonio Franco: 1 RECEIVE (DOCK69 TASK-5381972, NEW)
// daira gonzalez: 1 RECEIVE (DOCK50 TASK-5090739, STALE)
// All assigned names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 2 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "JEROME ARANDA", taskCount: 1 },
  { name: "Fatima Ponce", taskCount: 1 },
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

// Mix: 3 RECEIVE + 4 LOAD = 7 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 3, total: 7 },
  { label: "Outbound (LOAD)", count: 4, total: 7 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 7 },
  { label: "Inbound", count: 3, total: 7 },
];

// --- Schedule Data (2026-10-27, Tuesday) ---
// % scheduled inbounds received TODAY: 4 GURUNANDA receipts carry
//   appointmentTime = 2026-10-27 (appointmentTimeFrom/To query returned totalCount 4).
//   Status split re-checked in the same pull: 4 IMPORTED, 0 IN_PROGRESS and
//   0 CLOSED. None of the 4 carries receivedStartTime or receivedTime, so
//   received = 0 and the metric is 0 of 4 = 0.0%.
//   (RN-5011144 10:00a, RN-5011141 1:00a, RN-5011140 1:00p, RN-5011137 1:00p)
// % scheduled outbounds loaded TODAY: 42 GURUNANDA orders carry scheduleDate = 2026-10-27
//   (scheduleDateFrom/To query returned totalCount 42); 2 of them carry status SHIPPED
//   (same date filter + status SHIPPED returned totalCount 2), so loaded = 2 of 42
//   = 4.8%. Remaining order statuses: 33 PLANNED, 7 PICKED (0 PICKING, 0 LOADING,
//   0 LOADED).
export const scheduleAvailable = true;              // inbound denominator is 4
export const outboundScheduleAvailable = true;      // outbound denominator is 42
export const scheduledInboundOrders = 4;            // receipts with appointmentTime = 2026-10-27
export const scheduledOutboundOrders = 42;          // orders with scheduleDate = 2026-10-27
export const scheduledInboundReceived = 0;          // 0 receipts have been received today
export const scheduledOutboundLoaded = 2;           // orders at status SHIPPED today
export const pctScheduledInboundReceived = 0.0;     // 0 of 4 = 0.00%
export const pctScheduledOutboundLoaded = 4.8;      // 2 of 42 = 4.76% -> 4.8%
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

// All Bay 4 active task records (DOCK50-DOCK72, Oct 27 2026 ~8:58a PT)
// 7 tasks total: 4 LOAD + 3 RECEIVE. All GURUNANDA, LLC.
// Three are stale-anomaly tasks (TASK-5402525 on DOCK51, TASK-5338695 on DOCK54,
// TASK-5090739 on DOCK50).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA (userId 89) closed 1 GURUNANDA load transaction today -
// DOCK52 TASK-5404258 (PRE_LOAD, ET-1175417, loads LOAD-5042723 DN-3420191 and
// LOAD-5042722 DN-3420194 both SHIPPED, seal A51935; started 10/26 6:48:07p PT,
// closed 10/27 8:48:49a PT = 14.0h; that closed task is not part of the active
// list below). His only remaining open Bay-4 tasks are the two stale loads
// TASK-5402525 (DOCK51) and TASK-5338695 (DOCK54). Today's only in-progress live
// load at Bay 4 is DANIEL BELTRAN's TASK-5404713 (DOCK60).
export const assignments: TaskRecord[] = [
  // ----- OUTBOUND / LOAD (4) -----
  {
    taskId: "TASK-5404713",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~25m since 10/27 8:33:58a PT (DANIEL BELTRAN; ET-1175605, LIVE_LOAD, LOAD-5042521 LOADING, 10 orders, equipment CFT-030)",
    assignee: "DANIEL BELTRAN",
    door: "DOCK60",
  },
  {
    taskId: "TASK-5404749",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 10/27 8:44:44a PT (JEROME ARANDA; ET-1175656, LIVE_LOAD, 3 loads all WINDOW_CHECKIN_DONE - LOAD-5042260, LOAD-5042303, LOAD-5042307), task has no startTime",
    assignee: "JEROME ARANDA",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5402525",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 10/23/26 3:42:02p PT, ~3.7 days; endTime is 10/26/26 11:16:54a PT and its only load LOAD-5042648 is SHIPPED, yet status is still IN_PROGRESS; ARNULFO MUNGUIA, ET-1174529, PRE_LOAD, seal 1303556)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5338695",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 8/7/26 4:29:29p PT, ~80.7 days; status still IN_PROGRESS although endTime is 8/10/26 9:27:26a PT; ARNULFO MUNGUIA, ET-1135033, PRE_LOAD, LOAD-5035487 SHIPPED)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },

  // ----- INBOUND / RECEIVE (3) -----
  {
    taskId: "TASK-5401002",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~4.9 days since 10/22 12:22:18p PT (Fatima Ponce; ET-1173817, RN-194449 IN_PROGRESS, GN10212026UNIS-1290)",
    assignee: "Fatima Ponce",
    door: "DOCK68",
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
    pieces: "IN_PROGRESS · STALE (started 10/21/25 1:21:14p PT, ~370.8 days; status still IN_PROGRESS although endTime is 10/22/25 10:42:01a PT; daira gonzalez, ET-1027622, RN-5002143 CLOSED)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
];
