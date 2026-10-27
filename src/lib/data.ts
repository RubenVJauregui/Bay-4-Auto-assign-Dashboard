/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-10-27 ~1:34p PT (live WISE / WMS-BAM APIs)
 *   Sources (all read with item-time-zone America/Los_Angeles, so all times
 *   below are facility-local PT):
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors, 23/23 rows
 *       returned (fresh dockStatus, spaceStatus, occupiedCustomerIds, entryId,
 *       updatedTime; newest door row touched 1:28:30p PT)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide totalCount 10; 3 at Bay 4 doors)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide totalCount 12; 2 at Bay 4 doors)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To = 2026-10-27 -> totalCount 5 (all IMPORTED)
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDateFrom/To = 2026-10-27 -> totalCount 44; re-run per status:
 *       33 PLANNED, 5 PICKED, 2 SHIPPED (4 in other statuses)
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA load tasks with
 *       statuses CLOSED/FORCE_CLOSED and endTime inside 2026-10-27 -> totalCount 8
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders at status
 *       PLANNED, no date filter -> totalCount 305 (planned-orders fallback)
 *   NOTE: door state is read from wms-location/search (dockStatus + spaceStatus),
 *   the same two status fields the dashboard already uses.
 *
 *   Key changes from the prior refresh (10/27 ~8:58a PT -> 10/27 ~1:34p PT):
 *     - Bay 4 GURUNANDA active tasks: 5 (3 LOAD + 2 RECEIVE) on 4 doors
 *       (DOCK50, DOCK54 x2, DOCK56, DOCK69) - down from 7 tasks on 7 doors.
 *       New since 8:58a: TASK-5405119 (DOCK56 LIVE_LOAD, BARTOLO RAMIREZ,
 *       started 12:07:20p) and TASK-5405048 (DOCK54 PRE_LOAD, ARNULFO MUNGUIA,
 *       started 12:25:36p, 11 loads). Closed since 8:58a: TASK-5404713 (DOCK60),
 *       TASK-5404749 (DOCK55, task later re-labelled DOCK161), TASK-5402525
 *       (DOCK51), TASK-5401002 (DOCK68 RECEIVE, Fatima Ponce).
 *     - Task "Guru live out / in assign to Arnulfo" still resolves to ARNULFO
 *       MUNGUIA GURUNANDA Bay 4 work. His Assigned Activity for today is now TWO
 *       closed transactions: DOCK52 TASK-5404258 (PRE_LOAD, ET-1175417, loads
 *       LOAD-5042723 / LOAD-5042722 both SHIPPED, seal A51935; started 10/26
 *       6:48:07p, closed 10/27 8:48:49a = 14.0h) and DOCK51 TASK-5402525
 *       (PRE_LOAD, ET-1174529, LOAD-5042648 SHIPPED, seal 1303556; started
 *       10/23 3:42:02p, closed 10/27 9:49:24a = 87.1h). His open GURUNANDA Bay-4
 *       work is one live task TASK-5405048 (DOCK54) plus the stale TASK-5338695
 *       (DOCK54). No WMS record is literally named "Guru live out / in assign to
 *       Arnulfo" and none is invented here; the stream is read as the assignee's
 *       task assignment transactions.
 *     - Bay 4 doors occupied (rule below): 18/23 - 3 available
 *       (DOCK58, DOCK68, DOCK71), 2 reserved (DOCK51, DOCK65).
 *       Raw dockStatus=OCCUPIED = 13/23; the extra occupied doors are
 *       space-occupied doors whose dockStatus reads AVAILABLE (DOCK50, DOCK52,
 *       DOCK55, DOCK57, DOCK60). DOCK51 is dock RESERVED with space occupied and
 *       is counted as Reserved, matching the rule order below.
 *     - Stale anomalies STILL OPEN: TASK-5338695 (DOCK54, LOAD started 8/7/26
 *       4:29:29p, ~80.8 days; status still IN_PROGRESS although its endTime is
 *       8/10/26 9:27:26a) and TASK-5090739 (DOCK50, RECEIVE started 10/21/25
 *       1:21:14p, ~371.0 days; status still IN_PROGRESS although its endTime is
 *       10/22/25 10:42:01a). TASK-5402525 is no longer an anomaly - it was
 *       closed at 9:49:24a today.
 *     - "% scheduled inbounds received" (10/27): 0 of 5 = 0.0%
 *       (all 5 receipts are still IMPORTED with no receivedStartTime or
 *       receivedTime at this pull).
 *     - "% scheduled outbounds loaded" (10/27): 2 of 44 = 4.5%
 *       (status split for the same day: 33 PLANNED, 5 PICKED, 2 SHIPPED,
 *       4 other; SHIPPED is the "loaded" proxy used by the prior refresh).
 *     - Inbound/outbound mix: 2 RECEIVE / 3 LOAD of 5 active Bay-4 tasks.
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
// NOT re-pulled in the 10/27 1:34p PT refresh (out of scope of the request). The
// array is left empty rather than carrying a stale result; Section 1 renders live
// from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 305 at the 10/27 ~1:34p PT pull.
export const plannedGurunandaOrderCount = 305;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 10/27 ~1:34p PT
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
    duration: "RECEIVE STALE started 10/21/25 1:21:14p PT, ~371.0 days; task status still IN_PROGRESS although its endTime is 10/22/25 10:42:01a PT (TASK-5090739, daira gonzalez, ET-1027622, RN-5002143 CLOSED) · dock AVAILABLE, space occupied, occupiedCustomerIds ORG-655875, entry ET-1175902 (row updated 10/27 1:28:30p PT)",
    anomaly: true, // TASK-5090739 started 10/21/25 and is still IN_PROGRESS
  },
  {
    door: "DOCK51",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (TASK-5402525 closed today 9:49:24a PT after 87.1h, ARNULFO MUNGUIA, LOAD-5042648 SHIPPED) · dock RESERVED, space occupied, entry ET-1175848 (row updated 10/27 12:03:16p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (TASK-5404847 closed 10:26:49a PT, DANIEL BELTRAN, LOAD-5042618; TASK-5404258 closed 8:48:49a PT, ARNULFO MUNGUIA, 2 loads SHIPPED) · dock AVAILABLE, space occupied, entry ET-1175768 (row updated 10/27 12:22:12p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied, entry ET-1175174 (row updated 10/26 10:41:00p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD x2)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5405048", "TASK-5338695"],
    duration: "LOAD ~1h08m since 10/27 12:25:36p PT (TASK-5405048, ARNULFO MUNGUIA, ET-1175790, PRE_LOAD, 11 loads all LOADING) — plus one STALE LOAD started 8/7/26 4:29:29p PT, ~80.8 days, task still IN_PROGRESS although its endTime is 8/10/26 9:27:26a PT (TASK-5338695, LOAD-5035487 SHIPPED) · dock and space occupied (row updated 10/27 12:25:54p PT)",
    anomaly: true, // TASK-5338695 started 8/7/26 but is still IN_PROGRESS
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (TASK-5404749 closed 10:51:04a PT, 3 loads SHIPPED; the task row is now labelled DOCK161) · dock AVAILABLE, space occupied, entry ET-1172338 (row updated 10/27 11:27:45a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: "BARTOLO RAMIREZ (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5405119"],
    duration: "LOAD ~1h27m since 10/27 12:07:20p PT (TASK-5405119, BARTOLO RAMIREZ, ET-1175848, LIVE_LOAD, 4 loads all LOADED, equipment HV2306032, seal 1303568) · dock and space occupied (row updated 10/27 12:08:16p PT)",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (TASK-5404994 closed 11:15:11a PT, DANIEL BELTRAN, LOAD-5042715 SHIPPED) · dock AVAILABLE, space occupied, entry ET-1175764 (row updated 10/27 11:15:29a PT) · no occupancy-start field in WMS",
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
    duration: "No active task · dock and space occupied, entry ET-1174986 (row updated 10/27 6:10:30a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (TASK-5404713 closed 9:18:26a PT, DANIEL BELTRAN, LOAD-5042521 SHIPPED) · dock AVAILABLE, space occupied, occupiedCustomerIds ORG-655875, entry ET-1175605 (row updated 10/27 9:19:04a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied, entry ET-1173482 (row updated 10/26 10:39:41p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1174077 (row updated 10/26 10:39:22p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1174051 (row updated 10/26 10:38:52p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1166789 (row updated 10/22 8:57:03p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space empty, entry ET-1175799 (row updated 10/27 11:20:41a PT)",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1173309 (row updated 10/26 10:38:30p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied, entry ET-1175341 (row updated 10/27 6:09:37a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (TASK-5401002 RECEIVE closed since the 8:58a pull) · dock and space free - available, entry ET-1174584 (row updated 10/27 9:59:49a PT)",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW · created 9/30 10:46:50a PT (TASK-5381972, Jorge Antonio Franco, ET-1162686, RN-5010583 IMPORTED / PO9139-2) - task has no startTime, so no duration basis · dock occupied, space empty (row updated 10/22 8:56:43p PT)",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1172826 (row updated 10/26 10:37:06p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available, entry ET-1164309 (row updated 10/27 6:09:35a PT)",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied, entry ET-1173435 (row updated 10/26 10:36:23p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 18
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 2
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 4
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

// Doors carrying dockStatus RESERVED at this pull: DOCK51, DOCK65.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (Oct 27 2026 ~1:34p PT). 5 active-status tasks at Bay 4 doors: 3 LOAD + 2 RECEIVE.
// ARNULFO MUNGUIA: 2 LOAD (DOCK54 TASK-5405048 IN_PROGRESS + DOCK54 TASK-5338695 stale)
// BARTOLO RAMIREZ: 1 LOAD (DOCK56 TASK-5405119, LIVE_LOAD, IN_PROGRESS)
// Jorge Antonio Franco: 1 RECEIVE (DOCK69 TASK-5381972, NEW)
// daira gonzalez: 1 RECEIVE (DOCK50 TASK-5090739, STALE)
// All assigned names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 2 },
  { name: "BARTOLO RAMIREZ", taskCount: 1 },
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

// Mix: 2 RECEIVE + 3 LOAD = 5 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 2, total: 5 },
  { label: "Outbound (LOAD)", count: 3, total: 5 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 3, total: 5 },
  { label: "Inbound", count: 2, total: 5 },
];

// --- Schedule Data (2026-10-27, Tuesday) ---
// % scheduled inbounds received TODAY: 5 GURUNANDA receipts carry
//   appointmentTime = 2026-10-27 (appointmentTimeFrom/To query returned totalCount 5).
//   Status split re-checked in the same pull: 5 IMPORTED and 0 received.
//   None of the 5 carries receivedStartTime or receivedTime, so received = 0 and
//   the metric is 0 of 5 = 0.0%.
//   (RN-194673 date-only 12:00a slot, RN-5011144 10:00a, RN-5011141 1:00a,
//   RN-5011140 1:00p, RN-5011137 1:00p)
// % scheduled outbounds loaded TODAY: 44 GURUNANDA orders carry scheduleDate = 2026-10-27
//   (scheduleDateFrom/To query returned totalCount 44); 2 of them carry status SHIPPED
//   (same date filter + status SHIPPED returned totalCount 2), so loaded = 2 of 44
//   = 4.5%. Remaining order statuses: 33 PLANNED, 5 PICKED, 4 other (SHIPPED is the
//   "loaded" proxy defined by the prior refresh).
export const scheduleAvailable = true;              // inbound denominator is 5
export const outboundScheduleAvailable = true;      // outbound denominator is 44
export const scheduledInboundOrders = 5;            // receipts with appointmentTime = 2026-10-27
export const scheduledOutboundOrders = 44;          // orders with scheduleDate = 2026-10-27
export const scheduledInboundReceived = 0;          // 0 receipts have been received today
export const scheduledOutboundLoaded = 2;           // orders at status SHIPPED today
export const pctScheduledInboundReceived = 0.0;     // 0 of 5 = 0.00%
export const pctScheduledOutboundLoaded = 4.5;      // 2 of 44 = 4.55% -> 4.5%
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

// All Bay 4 active task records (DOCK50-DOCK72, Oct 27 2026 ~1:34p PT)
// 5 tasks total: 3 LOAD + 2 RECEIVE. All GURUNANDA, LLC.
// Two are stale-anomaly tasks (TASK-5338695 on DOCK54, TASK-5090739 on DOCK50).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA (userId 89) closed 2 GURUNANDA load transactions today -
// DOCK52 TASK-5404258 (PRE_LOAD, ET-1175417, loads LOAD-5042723 DN-3420191 and
// LOAD-5042722 DN-3420194 both SHIPPED, seal A51935; started 10/26 6:48:07p PT,
// closed 10/27 8:48:49a PT = 14.0h) and DOCK51 TASK-5402525 (PRE_LOAD,
// ET-1174529, LOAD-5042648 DN-3419784 SHIPPED, seal 1303556; started 10/23
// 3:42:02p PT, closed 10/27 9:49:24a PT = 87.1h). Neither closed task is part of
// the active list below. His open Bay-4 work is TASK-5405048 (DOCK54, started
// 12:25:36p PT) plus the stale TASK-5338695 (DOCK54).
export const assignments: TaskRecord[] = [
  // ----- OUTBOUND / LOAD (3) -----
  {
    taskId: "TASK-5405119",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~1h27m since 10/27 12:07:20p PT (BARTOLO RAMIREZ; ET-1175848, LIVE_LOAD, 4 loads all LOADED - LOAD-5042305, LOAD-5042301, LOAD-5042306, LOAD-5042302; equipment HV2306032, seal 1303568)",
    assignee: "BARTOLO RAMIREZ",
    door: "DOCK56",
  },
  {
    taskId: "TASK-5405048",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~1h08m since 10/27 12:25:36p PT (ARNULFO MUNGUIA; ET-1175790, PRE_LOAD, 11 loads all LOADING - LOAD-5042863, LOAD-5042861, LOAD-5042859, LOAD-5042858, LOAD-5042857, LOAD-5042852, LOAD-5042851, LOAD-5042734, LOAD-5042733, LOAD-5042732, LOAD-5042721; equipment 53402CT)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5338695",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 8/7/26 4:29:29p PT, ~80.8 days; status still IN_PROGRESS although endTime is 8/10/26 9:27:26a PT; ARNULFO MUNGUIA, ET-1135033, PRE_LOAD, LOAD-5035487 SHIPPED)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },

  // ----- INBOUND / RECEIVE (2) -----
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
    pieces: "IN_PROGRESS · STALE (started 10/21/25 1:21:14p PT, ~371.0 days; status still IN_PROGRESS although endTime is 10/22/25 10:42:01a PT; daira gonzalez, ET-1027622, RN-5002143 CLOSED)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
];
