/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-04 2:11p PT (live WISE / WMS-BAM APIs)
 *   Sources (all read with item-time-zone America/Los_Angeles; the API returns
 *   dock/task/receipt/order timestamps as facility-local PT wall-clock values, so
 *   PT windows below are written as plain PT wall-clock strings):
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors, 23/23 rows
 *       returned (fresh dockStatus, spaceStatus, occupiedCustomerIds, entryId,
 *       updatedTime)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide totalCount 12); matched on dockName to
 *       the 23 Bay-4 docks -> 4 at Bay 4 doors (DOCK51, DOCK54, DOCK57, DOCK58)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide totalCount 13), same per-door
 *       dockName match -> 2 at Bay 4 doors (DOCK50 STALE, DOCK69 NEW)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To inside the 11/4 PT business day -> totalCount 7
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDatePeriod inside the 11/4 PT business day -> totalCount 80
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA CLOSED/FORCE_CLOSED
 *       load tasks for assigneeUserId 89 (ARNULFO MUNGUIA), endTime
 *       10/28 00:00:00 - 11/4 14:11:00 PT, sorted endTime DESC -> 35 transactions
 *       (Arnulfo Assigned Activity stream)
 *     - /wms-bam/yard/equipment/search - GURUNANDA yard equipment (77 rows) used to
 *       resolve the trailer sitting on each active Bay-4 load task via lastEntryId
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders at status
 *       PLANNED, no date filter -> totalCount 197 (planned-orders fallback)
 *   NOTE: door state is read from wms-location/search (dockStatus + spaceStatus),
 *   the same two status fields the dashboard already uses.
 *   NOTE: the load/receive task searches were filtered by customer only and matched
 *   to Bay-4 doors on the returned dockName field (dockId is also present but is a
 *   numeric location id, not the DOCKnn name).
 *   NOTE: the query shape used here is byte-identical to the prior refresh. As a
 *   control, the 11/3 PT day still re-reads as 12 receipts and 33 orders, i.e. the
 *   documented numbers of the 11/3 pull, so today's 7 / 80 are comparable.
 *
 *   CONTEXT - 11/4 PT is a Wednesday. 7 GURUNANDA receipts carry an appointment on
 *   11/4; 1 of them (RN-195144) carries a receivedStartTime = 14.3% received.
 *   80 GURUNANDA orders carry scheduleDate 11/4; 6 are at status SHIPPED (the
 *   loaded proxy defined by the prior refreshes) = 7.5%.
 *
 *   Key changes from the prior refresh (11/3 ~5:40p PT -> 11/4 ~2:11p PT):
 *     - DOOR STATUS: 17/23 occupied, 0 reserved, 6 available (DOCK61, DOCK62,
 *       DOCK63, DOCK65, DOCK69, DOCK71). Raw dockStatus=OCCUPIED is 10/23
 *       (DOCK50, 51, 52, 54, 57, 66, 67, 68, 70, 72); the other 7 occupied doors
 *       are space-occupied only (DOCK53, 55, 56, 58, 59, 60, 64).
 *       DOCK57 left the RESERVED state it held for months and now carries a live
 *       LOAD task; DOCK62/DOCK63/DOCK69 flipped occupied -> available while
 *       DOCK67/DOCK72 flipped available -> occupied since the 11/3 pull.
 *     - TASK TURNOVER: none of the 12 tasks on the 11/3 pull is still active. 6
 *       active tasks (4 LOAD + 2 RECEIVE) now sit on 6 doors (DOCK50, 51, 54, 57,
 *       58, 69). New assignees on the board: DANIEL BELTRAN (1 LOAD, DOCK57) and
 *       JULIO CESAR Alvarado (1 LOAD, DOCK58).
 *     - STALE ANOMALY: TASK-5090739 (DOCK50, RECEIVE started 10/21/25 1:21:14p PT,
 *       379d00h49m) is still returned by the active-status query although its
 *       endTime is 10/22/25 10:42:01a PT. New secondary anomaly: TASK-5411782
 *       (DOCK58) is returned as IN_PROGRESS although its endTime is already set to
 *       11/4 9:31:23a PT and its only load is SHIPPED - flagged, not closed.
 *     - Task "Guru live out / in assign to Arnulfo" still resolves to ARNULFO
 *       MUNGUIA GURUNANDA Bay 4 work. No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo"; the stream is read as the
 *       assignee's task assignment transactions and none is invented here.
 *       His assigned-activity pull (closed load tasks, endTime 10/28-11/4 PT)
 *       now returns 35 transactions (was 26 for 10/27-11/3); the newest is
 *       DOCK60 TASK-5412210 (LIVE_LOAD, ET-1179245, 3 loads all SHIPPED -
 *       LOAD-5042754 / DN-3415500, LOAD-5042755 / DN-3415492, LOAD-5042756 /
 *       DN-3415490, seal 24800388; started 11/4 1:36:57p PT, closed 11/4
 *       2:06:48p PT = 29m). All 35 returned transactions are closed; the former
 *       88-day anomaly TASK-5338695 closed 11/3 and no longer appears. His open
 *       Bay-4 work is 2 live LOAD tasks (DOCK51 TASK-5412283, DOCK54 TASK-5411230).
 *     - "% scheduled inbounds received" (11/4 PT day): 1 of 7 = 14.3% - computable
 *       this pull.
 *     - "% scheduled outbounds loaded" (11/4 PT day): 6 of 80 = 7.5% (SHIPPED proxy).
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
// NOT re-pulled in the 11/4 2:11p PT refresh (out of scope of the request). The
// array is left empty rather than carrying a stale result; Section 1 renders live
// from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 197 at the 11/4 ~2:11p PT pull (was 242).
export const plannedGurunandaOrderCount = 197;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/4 ~2:11p PT
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
    duration: "STALE RECEIVE 379d00h49m since 10/21/25 1:21:14p PT, task still IN_PROGRESS although its endTime is 10/22/25 10:42:01a PT (TASK-5090739, daira gonzalez, ET-1027622, RN-5002143 CLOSED / PO EGSU8032696) - no live load/receive task on this door at this pull · dock and space occupied, occupiedCustomerIds ORG-655875, entry ET-1178822 (row updated 11/4 12:16:26p PT)",
    anomaly: true, // TASK-5090739 started 10/21/25 and is still returned as IN_PROGRESS
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5412283"],
    duration: "LOAD 4m since 11/4 2:07:09p PT (TASK-5412283, ARNULFO MUNGUIA, ET-1179265, PRE_LOAD, 4 loads all LOADING - LOAD-5043763 / 50134929 - DN-3439612, LOAD-5043762 / 50134925 - DN-3439307, LOAD-5043590 / 50125394 - DN-3438608, LOAD-5043347 / 50103276 - DN-3430322; equipment 53188, dock check-in 2:07:15p PT) · dock and space occupied, entry ET-1179265 (row updated 11/4 2:07:16p PT)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (TASK-5410268 closed after 1d17h30m on 11/4 9:47:28a PT, ARNULFO MUNGUIA, 6 loads all SHIPPED) · dock and space occupied, entry ET-1179137 (row updated 11/4 11:22:52a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (TASK-5411377 closed 11/4 9:27:32a PT and TASK-5410206 closed 11/4 10:42:40a PT, both ARNULFO MUNGUIA) · dock AVAILABLE, space occupied, entry ET-1178832 (row updated 11/4 10:55:13a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5411230"],
    duration: "LOAD 23h56m since 11/3 2:14:12p PT (TASK-5411230, ARNULFO MUNGUIA, ET-1178768, PRE_LOAD, seal 1304731, 2 loads all LOADED - LOAD-5042582 / 50095747 - DN-3419026 + LOAD-5043518 / 50116373 - DN-3437001; equipment 53104, dock check-in 11/3 2:14:27p PT) · dock and space occupied, entry ET-1178768 (row updated 11/3 8:56:09p PT)",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (TASK-5411426 closed after 16h54m on 11/4 11:25:31a PT, ARNULFO MUNGUIA, 2 loads SHIPPED) · dock AVAILABLE, space occupied, entry ET-1178849 (row updated 11/4 11:33:38a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (TASK-5411438 closed after 17h53m on 11/4 10:11:39a PT, ARNULFO MUNGUIA, 1 load SHIPPED) · dock AVAILABLE, space occupied, entry ET-1178856 (row updated 11/4 10:29:16a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: "DANIEL BELTRAN (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5412291"],
    duration: "LOAD 39m since 11/4 1:31:51p PT (TASK-5412291, DANIEL BELTRAN, ET-1179299, LIVE_LOAD, seal 1378470, 1 load LOADED - LOAD-5043337 / IBR5769467370287305478 SP BOL - DN-3429414 + DN-3430823; equipment 108, dock check-in 1:32:08p PT) · dock and space occupied, entry ET-1179299 (row updated 11/4 1:32:09p PT) · first active task on this door since it left RESERVED",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: "JULIO CESAR Alvarado (LOAD - status not closed)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5411782"],
    duration: "LOAD 49m 11/4 8:41:44a PT - 9:31:23a PT (TASK-5411782, JULIO CESAR Alvarado, ET-1179007, LIVE_LOAD, seal 1378450, load LOAD-5043339 SHIPPED / 5043339 - DN-3429354, appointment 11/4 8:30a PT, dock check-in 8:41:49a PT) - WMS still returns status IN_PROGRESS although endTime is set, so no open-ended duration is derived · dock AVAILABLE, space occupied, entry ET-1179143 (row updated 11/4 1:30:45p PT)",
    anomaly: true, // status IN_PROGRESS although endTime 11/4 9:31:23a PT is already set
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (TASK-5410201 closed after 1d22h50m on 11/4 1:44:05p PT, ARNULFO MUNGUIA, 2 loads SHIPPED) · dock AVAILABLE, space occupied, entry ET-1178361 (row updated 11/4 1:44:18p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (TASK-5412210 closed after 29m on 11/4 2:06:48p PT, ARNULFO MUNGUIA, 3 loads all SHIPPED) · dock AVAILABLE, space occupied, occupiedCustomerIds ORG-655875, entry ET-1179245 (row updated 11/4 2:06:59p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1179072 (row updated 11/4 9:51:35a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1178894 (row updated 11/3 9:54:47p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (the receive task that held this door at the 11/3 pull, TASK-5411421, is no longer active) · dock AVAILABLE, space EMPTY, entry ET-1178846 (row updated 11/3 9:23:21p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied, entry ET-1176452 (row updated 10/29 9:08:11p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1176517 (row updated 11/2 12:18:23p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1173309 (row updated 11/4 6:18:47a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1177613 (row updated 11/4 6:17:36a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1177841 (row updated 11/3 8:54:15p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Available",
    assignee: "Jorge Antonio Franco (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW · created 9/30 10:46:50a PT (TASK-5381972, Jorge Antonio Franco, ET-1162686, RN-5010583 IMPORTED / PO9139-2, no appointment, trailer in yard 9/30 10:46:48a PT) - task has no startTime, so no duration basis · dock AVAILABLE, space EMPTY, entry ET-1171953 (row updated 10/30 3:46:16p PT), i.e. the open NEW task is not holding the door",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1172826 (row updated 10/30 10:37:15p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1176765 (row updated 11/3 3:47:28p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1176051 (row updated 11/3 8:53:59p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 17
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 0
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 6
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 2
const available = doors.filter((d) => d.status === "Available").length; // 6

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

// No Bay-4 door carried dockStatus RESERVED at this pull (DOCK57, reserved for
// months, is now OCCUPIED with a live LOAD task).
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, Nov 4 2026 ~2:11p PT).
// 6 active-status tasks at Bay 4 doors: 4 LOAD + 2 RECEIVE.
// ARNULFO MUNGUIA: 2 LOAD (DOCK51 TASK-5412283, DOCK54 TASK-5411230)
// DANIEL BELTRAN: 1 LOAD (DOCK57 TASK-5412291)
// JULIO CESAR Alvarado: 1 LOAD (DOCK58 TASK-5411782, status IN_PROGRESS with endTime set)
// Jorge Antonio Franco: 1 RECEIVE (DOCK69 TASK-5381972 NEW)
// daira gonzalez: 1 RECEIVE (DOCK50 TASK-5090739, STALE)
// All assigned names resolved from WMS task payloads (assigneeUserName).
// daira gonzalez (userId 1948070158297014492) and DANIELA GONZALEZ (userId 11769)
// are two different WMS users and are kept separate.
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 2 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "JULIO CESAR Alvarado", taskCount: 1 },
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

// --- Schedule Data (2026-11-04, Wednesday) ---
// % scheduled inbounds received TODAY: 7 GURUNANDA receipts carry an
//   appointmentTime inside the 11/4 PT business day (query window
//   appointmentTimeFrom "2026-11-04 00:00:00" -> appointmentTimeTo
//   "2026-11-04 23:59:59" returned totalCount 7). 1 of those receipts carries a
//   receivedStartTime (RN-195144 IN_PROGRESS, receivedStartTime 11/4 8:40:19a PT)
//   = 14.3%.
// % scheduled outbounds loaded TODAY: 80 GURUNANDA orders carry a scheduleDate
//   inside the 11/4 PT day (scheduleDatePeriod ["2026-11-04 00:00:00",
//   "2026-11-04 23:59:59"] returned totalCount 80). 6 of those orders are at
//   status SHIPPED (the "loaded" proxy defined by the prior refreshes:
//   DN-3437103, DN-3437101, DN-3437102, DN-3429357, DN-3428871, DN-3428874)
//   = 7.5%. Remaining statuses on that day: 42 PLANNED, 29 PICKED, 2 PACKED,
//   1 PICKING.
export const scheduleAvailable = true;              // inbound denominator is 7 on 11/4
export const outboundScheduleAvailable = true;      // outbound denominator is 80 on 11/4
export const scheduledInboundOrders = 7;            // receipts with appointmentTime in the 11/4 PT day
export const scheduledOutboundOrders = 80;          // orders with scheduleDate in the 11/4 PT day
export const scheduledInboundReceived = 1;          // receipts with receivedStartTime in that set
export const scheduledOutboundLoaded = 6;           // orders at status SHIPPED in that set
export const pctScheduledInboundReceived = 14.3;    // 1 of 7 = 14.3%
export const pctScheduledOutboundLoaded = 7.5;      // 6 of 80 = 7.5%
// Facility-wide appointment context - unavailable (GURUNANDA-scoped queries only;
// no all-customer facility-wide appointment totals were pulled for this refresh).
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime where a task exists on the
// door and has actually started; unavailable for task-less doors and for NEW tasks
// with no startTime (no occupancy-start field in WMS, and the dock-door-status
// dashboard endpoint returns an empty Duration column). 11 of 23 doors carry no
// active task at this pull, so no duration is derived for them.
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Nov 4 2026 ~2:11p PT)
// 6 tasks total: 4 LOAD + 2 RECEIVE. All GURUNANDA, LLC.
// Two are data anomalies (TASK-5090739 on DOCK50 stale since 10/21/25;
// TASK-5411782 on DOCK58 still IN_PROGRESS although its endTime is set).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA (userId 89) has 35 CLOSED GURUNANDA load transactions with endTime
// inside 10/28-11/4 PT (re-pulled at 2:11p PT); the newest is DOCK60 TASK-5412210
// (LIVE_LOAD, ET-1179245, 3 loads all SHIPPED - LOAD-5042754 / DN-3415500,
// LOAD-5042755 / DN-3415492, LOAD-5042756 / DN-3415490, seal 24800388; started
// 11/4 1:36:57p PT, closed 11/4 2:06:48p PT = 29m). The formerly stale
// TASK-5338695 (DOCK54, 88d01h10m) closed 11/3 10:00:11a PT and is outside this
// window. His open Bay-4 work is 2 live LOAD tasks (DOCK51 TASK-5412283,
// DOCK54 TASK-5411230).
export const assignments: TaskRecord[] = [
  // ----- OUTBOUND / LOAD (4) -----
  {
    taskId: "TASK-5412291",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 39m since 11/4 1:31:51p PT (DANIEL BELTRAN; ET-1179299, LIVE_LOAD, seal 1378470, load LOAD-5043337 LOADED / IBR5769467370287305478 SP BOL - DN-3429414 + DN-3430823; equipment 108, dock check-in 1:32:08p PT)",
    assignee: "DANIEL BELTRAN",
    door: "DOCK57",
  },
  {
    taskId: "TASK-5412283",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 4m since 11/4 2:07:09p PT (ARNULFO MUNGUIA; ET-1179265, PRE_LOAD, 4 loads all LOADING - LOAD-5043763 / 50134929 - DN-3439612, LOAD-5043762 / 50134925 - DN-3439307, LOAD-5043590 / 50125394 - DN-3438608, LOAD-5043347 / 50103276 - DN-3430322; equipment 53188, dock check-in 2:07:15p PT)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5411782",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE STATUS (ran 11/4 8:41:44a - 9:31:23a PT = 49m; status still IN_PROGRESS although endTime is set; JULIO CESAR Alvarado, ET-1179007, LIVE_LOAD, seal 1378450, load LOAD-5043339 SHIPPED / 5043339 - DN-3429354, appointment 11/4 8:30a PT)",
    assignee: "JULIO CESAR Alvarado",
    door: "DOCK58",
  },
  {
    taskId: "TASK-5411230",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 23h56m since 11/3 2:14:12p PT (ARNULFO MUNGUIA; ET-1178768, PRE_LOAD, seal 1304731, 2 loads all LOADED - LOAD-5042582 / 50095747 - DN-3419026 + LOAD-5043518 / 50116373 - DN-3437001; equipment 53104, dock check-in 11/3 2:14:27p PT)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },

  // ----- INBOUND / RECEIVE (2) -----
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/30 10:46:50a PT (Jorge Antonio Franco; ET-1162686, RN-5010583 IMPORTED / PO9139-2, no appointment, trailer in yard 9/30 10:46:48a PT) - task has no startTime",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 10/21/25 1:21:14p PT, 379d00h49m; status still IN_PROGRESS although endTime is 10/22/25 10:42:01a PT; daira gonzalez, ET-1027622, RN-5002143 CLOSED / PO EGSU8032696)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
];
