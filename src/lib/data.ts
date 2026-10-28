/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-10-28 ~6:29a PT (live WISE / WMS-BAM APIs)
 *   Sources (all read with item-time-zone America/Los_Angeles; DB timestamps
 *   arrive in UTC and are shown below converted to facility-local PT):
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors, 23/23 rows
 *       returned (fresh dockStatus, spaceStatus, occupiedCustomerIds, entryId,
 *       updatedTime; newest door row touched 10/28 6:08:36a PT)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide totalCount 10; 3 at Bay 4 doors)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide totalCount 12; 3 at Bay 4 doors)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To = 2026-10-28 -> totalCount 4 (all IMPORTED)
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDateFrom/To = 2026-10-28 -> totalCount 85; re-run per status:
 *       35 PLANNED, 44 PICKED, 3 SHIPPED (3 in other statuses)
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA load tasks with
 *       statuses CLOSED/FORCE_CLOSED and endTime inside 2026-10-28 -> totalCount 1
 *       (TASK-5405468, DOCK37, PEDRO AVILA - not a Bay 4 door)
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA CLOSED/FORCE_CLOSED
 *       load tasks for assigneeUserId 89 (ARNULFO MUNGUIA), endTime 10/21-10/28 ->
 *       totalCount 27 (source for the Arnulfo Assigned Activity stream)
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders at status
 *       PLANNED, no date filter -> totalCount 323 (planned-orders fallback)
 *   NOTE: door state is read from wms-location/search (dockStatus + spaceStatus),
 *   the same two status fields the dashboard already uses.
 *
 *   Key changes from the prior refresh (10/27 ~1:34p PT -> 10/28 ~6:29a PT):
 *     - Bay 4 GURUNANDA active tasks: 6 (3 LOAD + 3 RECEIVE) on 5 doors
 *       (DOCK50, DOCK53, DOCK54 x2, DOCK65, DOCK69) - up from 5 tasks on 4 doors.
 *       New since 1:34p: TASK-5405497 (DOCK53 PRE_LOAD, EDUARDO MEJIA, started
 *       4:17:10p PT) and TASK-5405484 (DOCK65 RECEIVE, DANIELA GONZALEZ, started
 *       4:16:27p PT). Closed since 1:34p: TASK-5405119 (DOCK56, BARTOLO RAMIREZ).
 *     - Task "Guru live out / in assign to Arnulfo" still resolves to ARNULFO
 *       MUNGUIA GURUNANDA Bay 4 work. No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo"; the stream is read as the
 *       assignee's task assignment transactions and none is invented here.
 *       His assigned-activity pull (closed load tasks, 10/21-10/28) returns 27
 *       transactions; the newest is DOCK52 TASK-5404258 (PRE_LOAD, ET-1175417,
 *       loads LOAD-5042723 / LOAD-5042722 both SHIPPED, seal A51935; started
 *       10/26 6:48:07p PT, closed 10/27 8:48:49a PT = 14h01m). No transaction of
 *       his has closed yet on 10/28 at this pull. His open GURUNANDA Bay-4 work is
 *       one live task TASK-5405048 (DOCK54, started 10/27 12:25:36p PT) plus the
 *       stale TASK-5338695 (DOCK54).
 *     - Bay 4 doors occupied (rule below): 18/23 - 4 available (DOCK64, DOCK68,
 *       DOCK69, DOCK71), 1 reserved (DOCK51). Raw dockStatus=OCCUPIED = 13/23;
 *       the extra occupied doors are space-occupied doors whose dockStatus reads
 *       AVAILABLE (DOCK55, DOCK56, DOCK57, DOCK59, DOCK72). Composition shifted
 *       vs the prior pull: DOCK58 and DOCK65 are now occupied, DOCK64 and DOCK69
 *       are now free; DOCK65 is no longer reserved.
 *     - Stale anomalies STILL OPEN: TASK-5338695 (DOCK54, LOAD started 8/7/26
 *       4:29:29p PT, ~81.6 days; status still IN_PROGRESS although its endTime is
 *       8/10/26 9:27:26a PT) and TASK-5090739 (DOCK50, RECEIVE started 10/21/25
 *       1:21:14p PT, ~371.7 days; status still IN_PROGRESS although its endTime is
 *       10/22/25 10:42:01a PT).
 *     - "% scheduled inbounds received" (10/28): 0 of 4 = 0.0%
 *       (all 4 receipts are still IMPORTED with no receivedStartTime or
 *       receivedTime at this pull).
 *     - "% scheduled outbounds loaded" (10/28): 3 of 85 = 3.5%
 *       (status split for the same day: 35 PLANNED, 44 PICKED, 3 SHIPPED,
 *       3 other; SHIPPED is the "loaded" proxy used by the prior refresh).
 *     - Inbound/outbound mix: 3 RECEIVE / 3 LOAD of 6 active Bay-4 tasks.
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
// NOT re-pulled in the 10/28 6:29a PT refresh (out of scope of the request). The
// array is left empty rather than carrying a stale result; Section 1 renders live
// from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 323 at the 10/28 ~6:29a PT pull.
export const plannedGurunandaOrderCount = 323;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 10/28 ~6:29a PT
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
    duration: "RECEIVE STALE started 10/21/25 1:21:14p PT, ~371.7 days; task status still IN_PROGRESS although its endTime is 10/22/25 10:42:01a PT (TASK-5090739, daira gonzalez, ET-1027622, RN-5002143 CLOSED) · dock and space occupied, occupiedCustomerIds ORG-655875, entry ET-1175902 (row updated 10/27 9:03:39p PT)",
    anomaly: true, // TASK-5090739 started 10/21/25 and is still IN_PROGRESS
  },
  {
    door: "DOCK51",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space empty, entry ET-1175848 (row updated 10/27 12:03:16p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (TASK-5404258 closed 10/27 8:48:49a PT, ARNULFO MUNGUIA, 2 loads SHIPPED) · dock and space occupied, entry ET-1175943 (row updated 10/27 9:03:24p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "EDUARDO MEJIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5405497"],
    duration: "LOAD ~14h12m since 10/27 4:17:10p PT (TASK-5405497, EDUARDO MEJIA, ET-1176014, PRE_LOAD, 4 loads LOAD-5042855 / LOAD-5042864 / LOAD-5042853 / LOAD-5042862 all LOADED, equipment 53678) · dock and space occupied (row updated 10/27 10:59:09p PT)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD x2)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5405048", "TASK-5338695"],
    duration: "LOAD ~18h03m since 10/27 12:25:36p PT (TASK-5405048, ARNULFO MUNGUIA, ET-1175790, PRE_LOAD, 11 loads all LOADED, equipment 53402CT, seal 1303526) — plus one STALE LOAD started 8/7/26 4:29:29p PT, ~81.6 days, task still IN_PROGRESS although its endTime is 8/10/26 9:27:26a PT (TASK-5338695, LOAD-5035487 SHIPPED) · dock and space occupied (row updated 10/27 9:03:02p PT)",
    anomaly: true, // TASK-5338695 started 8/7/26 but is still IN_PROGRESS
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied, entry ET-1175943 (row updated 10/27 3:04:48p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (TASK-5405119 closed since the 1:34p PT pull, BARTOLO RAMIREZ, 4 loads LOADED) · dock AVAILABLE, space occupied, entry ET-1175933 (row updated 10/27 3:07:49p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied, entry ET-1175764 (row updated 10/27 11:15:29a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1174121 (row updated 10/28 6:08:36a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied, entry ET-1174986 (row updated 10/27 9:02:51p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied, occupiedCustomerIds ORG-655875, entry ET-1175605 (row updated 10/27 9:02:51p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied, entry ET-1173482 (row updated 10/27 9:02:36p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1174077 (row updated 10/27 9:02:22p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1174051 (row updated 10/27 9:02:13p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available, entry ET-1176012 (row updated 10/27 9:36:26p PT)",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5405484"],
    duration: "RECEIVE ~14h13m since 10/27 4:16:27p PT (TASK-5405484, DANIELA GONZALEZ, ET-1176004, RN-5011141 IN_PROGRESS, container OOCU8395973 / PO OOCU8395973, seal CW053744; dock check-in 10/27 4:16:32p PT) · dock occupied, space empty (row updated 10/27 9:01:52p PT)",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1173309 (row updated 10/27 9:01:41p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1175341 (row updated 10/27 9:01:26p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available, entry ET-1174584 (row updated 10/27 9:59:49a PT)",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Available",
    assignee: "Jorge Antonio Franco (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW · created 9/30 10:46:50a PT (TASK-5381972, Jorge Antonio Franco, ET-1162686, RN-5010583 IMPORTED / PO9139-2) - task has no startTime, so no duration basis · dock and space free - available (row updated 10/28 6:08:33a PT), i.e. the open NEW task is not holding the door",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1172826 (row updated 10/27 9:00:49p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available, entry ET-1176139 (row updated 10/27 10:25:31p PT)",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied, entry ET-1176051 (row updated 10/27 6:49:11p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 18
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 1
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 5
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 2
const available = doors.filter((d) => d.status === "Available").length; // 4

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

// Doors carrying dockStatus RESERVED at this pull: DOCK51.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (Oct 28 2026 ~6:29a PT). 6 active-status tasks at Bay 4 doors: 3 LOAD + 3 RECEIVE.
// ARNULFO MUNGUIA: 2 LOAD (DOCK54 TASK-5405048 IN_PROGRESS + DOCK54 TASK-5338695 stale)
// EDUARDO MEJIA: 1 LOAD (DOCK53 TASK-5405497, PRE_LOAD, IN_PROGRESS)
// DANIELA GONZALEZ: 1 RECEIVE (DOCK65 TASK-5405484, IN_PROGRESS)
// Jorge Antonio Franco: 1 RECEIVE (DOCK69 TASK-5381972, NEW)
// daira gonzalez: 1 RECEIVE (DOCK50 TASK-5090739, STALE)
// All assigned names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 2 },
  { name: "EDUARDO MEJIA", taskCount: 1 },
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

// Mix: 3 RECEIVE + 3 LOAD = 6 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 3, total: 6 },
  { label: "Outbound (LOAD)", count: 3, total: 6 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 3, total: 6 },
  { label: "Inbound", count: 3, total: 6 },
];

// --- Schedule Data (2026-10-28, Wednesday) ---
// % scheduled inbounds received TODAY: 4 GURUNANDA receipts carry
//   appointmentTime = 2026-10-28 (appointmentTimeFrom/To query returned totalCount 4).
//   Status re-checked in the same pull: 4 IMPORTED and 0 received.
//   None of the 4 carries receivedStartTime or receivedTime, so received = 0 and
//   the metric is 0 of 4 = 0.0%.
//   (RN-5011147 11:00p, RN-5011145 11:00p, RN-5011142 11:00p, RN-194619 8:00p)
// % scheduled outbounds loaded TODAY: 85 GURUNANDA orders carry scheduleDate = 2026-10-28
//   (scheduleDateFrom/To query returned totalCount 85); 3 of them carry status SHIPPED
//   (same date filter + status SHIPPED returned totalCount 3), so loaded = 3 of 85
//   = 3.5%. Remaining order statuses: 35 PLANNED, 44 PICKED, 3 other (SHIPPED is the
//   "loaded" proxy defined by the prior refresh).
export const scheduleAvailable = true;              // inbound denominator is 4
export const outboundScheduleAvailable = true;      // outbound denominator is 85
export const scheduledInboundOrders = 4;            // receipts with appointmentTime = 2026-10-28
export const scheduledOutboundOrders = 85;          // orders with scheduleDate = 2026-10-28
export const scheduledInboundReceived = 0;          // 0 receipts have been received today
export const scheduledOutboundLoaded = 3;           // orders at status SHIPPED today
export const pctScheduledInboundReceived = 0.0;     // 0 of 4 = 0.00%
export const pctScheduledOutboundLoaded = 3.5;      // 3 of 85 = 3.53% -> 3.5%
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

// All Bay 4 active task records (DOCK50-DOCK72, Oct 28 2026 ~6:29a PT)
// 6 tasks total: 3 LOAD + 3 RECEIVE. All GURUNANDA, LLC.
// Two are stale-anomaly tasks (TASK-5338695 on DOCK54, TASK-5090739 on DOCK50).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA (userId 89) has 27 CLOSED GURUNANDA load transactions inside
// 10/21-10/28; the newest is DOCK52 TASK-5404258 (PRE_LOAD, ET-1175417, loads
// LOAD-5042723 DN-3420191 and LOAD-5042722 DN-3420194 both SHIPPED, seal A51935;
// started 10/26 6:48:07p PT, closed 10/27 8:48:49a PT = 14h01m). No transaction of
// his has closed yet on 10/28 at this pull (the facility's only closed load task
// today is TASK-5405468, DOCK37, PEDRO AVILA). Neither closed task is part of the
// active list below. His open Bay-4 work is TASK-5405048 (DOCK54, started
// 10/27 12:25:36p PT) plus the stale TASK-5338695 (DOCK54).
export const assignments: TaskRecord[] = [
  // ----- OUTBOUND / LOAD (3) -----
  {
    taskId: "TASK-5405497",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~14h12m since 10/27 4:17:10p PT (EDUARDO MEJIA; ET-1176014, PRE_LOAD, 4 loads all LOADED - LOAD-5042855, LOAD-5042864, LOAD-5042853, LOAD-5042862; equipment 53678)",
    assignee: "EDUARDO MEJIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5405048",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~18h03m since 10/27 12:25:36p PT (ARNULFO MUNGUIA; ET-1175790, PRE_LOAD, 11 loads all LOADED - LOAD-5042863, LOAD-5042861, LOAD-5042859, LOAD-5042858, LOAD-5042857, LOAD-5042852, LOAD-5042851, LOAD-5042734, LOAD-5042733, LOAD-5042732, LOAD-5042721; equipment 53402CT, seal 1303526)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5338695",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 8/7/26 4:29:29p PT, ~81.6 days; status still IN_PROGRESS although endTime is 8/10/26 9:27:26a PT; ARNULFO MUNGUIA, ET-1135033, PRE_LOAD, LOAD-5035487 SHIPPED)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },

  // ----- INBOUND / RECEIVE (3) -----
  {
    taskId: "TASK-5405484",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~14h13m since 10/27 4:16:27p PT (DANIELA GONZALEZ; ET-1176004, RN-5011141 IN_PROGRESS, container OOCU8395973 / PO OOCU8395973, seal CW053744, dock check-in 4:16:32p PT)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK65",
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
    pieces: "IN_PROGRESS · STALE (started 10/21/25 1:21:14p PT, ~371.7 days; status still IN_PROGRESS although endTime is 10/22/25 10:42:01a PT; daira gonzalez, ET-1027622, RN-5002143 CLOSED)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
];
