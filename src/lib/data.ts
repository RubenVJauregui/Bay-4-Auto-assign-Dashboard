/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-01 4:40p PT (live WISE / WMS-BAM APIs)
 *   Sources (all read with item-time-zone America/Los_Angeles; the API returns
 *   dock/task/receipt/order timestamps as facility-local PT wall-clock values and
 *   compares date filters against those same values, so PT day windows below are
 *   written as plain PT wall-clock strings):
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors, 23/23 rows
 *       returned (fresh dockStatus, spaceStatus, occupiedCustomerIds, entryId,
 *       updatedTime)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide totalCount 15); matched on dockId to
 *       the 23 Bay-4 docks -> 7 at Bay 4 doors (DOCK51, 52, 53, 54 x2, 55 x2)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide totalCount 17), same per-door
 *       dockId match -> 4 at Bay 4 doors (DOCK50, 62, 68, 69)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To inside the 11/1 PT business day -> totalCount 0
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDatePeriod inside the 11/1 PT business day -> totalCount 1
 *       (DN-3427811 / TO-T&T-0008, status PLANNED, appointmentTime 10/28 11:00a PT)
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA CLOSED/FORCE_CLOSED
 *       load tasks for assigneeUserId 89 (ARNULFO MUNGUIA), endTime
 *       10/25 00:00:00 - 11/1 16:40:00 PT, sorted endTime DESC -> totalCount 22
 *       (Arnulfo Assigned Activity stream)
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders at status
 *       PLANNED, no date filter -> totalCount 246 (planned-orders fallback)
 *   NOTE: door state is read from wms-location/search (dockStatus + spaceStatus),
 *   the same two status fields the dashboard already uses.
 *
 *   CONTEXT - 11/1 PT is a Sunday. No GURUNANDA receipt carries an appointment on
 *   11/1 (0 receipts -> inbound % not computable), and exactly one GURUNANDA order
 *   carries scheduleDate 11/1 (DN-3427811, still PLANNED), so 0 of 1 outbound
 *   scheduled orders has loaded = 0.0%. For reference, the last scheduled business
 *   day (10/30 PT) re-read at this pull returns 9 receipts with an appointmentTime
 *   that day, 2 of which carry a receivedStartTime (RN-5011276 CLOSED 9:23:19a,
 *   RN-5011215 IN_PROGRESS) = 22.2%; and 39 orders scheduled that day, 3 at status
 *   SHIPPED = 7.7%.
 *
 *   Key changes from the prior refresh (10/31 ~4:50p PT -> 11/1 ~4:40p PT):
 *     - NO door-status flips this pull: all 23 wms-location rows are unchanged
 *       from the 10/31 pull (no row updatedTime is later than 10/30 11:40:39p PT),
 *       so Door Utilization stands at 16/23 occupied, 1 reserved (DOCK57),
 *       6 available (DOCK61, 63, 64, 67, 68, 71). Raw dockStatus=OCCUPIED is
 *       11/23; the extra 5 occupied doors are space-occupied doors whose
 *       dockStatus reads AVAILABLE (DOCK50, 56, 58, 60, 69).
 *     - NO Bay 4 GURUNANDA task opened or closed since the 10/31 pull: still
 *       11 active tasks (7 LOAD + 4 RECEIVE) on the same 9 doors (DOCK50,
 *       DOCK51, DOCK52, DOCK53, DOCK54 x2, DOCK55 x2, DOCK62, DOCK68, DOCK69).
 *       Only the elapsed occupancy durations advanced (recomputed to 11/1 4:40p PT).
 *     - Task "Guru live out / in assign to Arnulfo" still resolves to ARNULFO
 *       MUNGUIA GURUNANDA Bay 4 work. No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo"; the stream is read as the
 *       assignee's task assignment transactions and none is invented here.
 *       His assigned-activity pull (closed load tasks, endTime 10/25-11/1 PT)
 *       returns 22 transactions - unchanged - and the newest is still DOCK54
 *       TASK-5407435 (PRE_LOAD, ET-1177123, loads LOAD-5043125 SHIPPED /
 *       50102887 - DN-3427324 and LOAD-5043124 SHIPPED / 50102886 - DN-3427325,
 *       seal 1379250, equipment 53603; started 10/29 11:55:54a PT, closed 10/30
 *       3:52:49p PT = 27h57m). No Arnulfo task has closed since 10/30 3:52:49p PT.
 *     - Stale anomalies STILL OPEN: TASK-5338695 (DOCK54, LOAD started 8/7/26
 *       4:29:29p PT, 86d00h10m; status still IN_PROGRESS although its endTime is
 *       8/10/26 9:27:26a PT) and TASK-5090739 (DOCK50, RECEIVE started 10/21/25
 *       1:21:14p PT, 376d03h18m; status still IN_PROGRESS although its endTime is
 *       10/22/25 10:42:01a PT).
 *     - "% scheduled inbounds received" (11/1 PT day): 0 of 0 - no GURUNANDA
 *       receipt carries an appointmentTime on 11/1, so the percentage is not
 *       computable (shown as "-"), not 0.0%.
 *     - "% scheduled outbounds loaded" (11/1 PT day): 0 of 1 - the single order
 *       scheduled for 11/1 (DN-3427811) is still PLANNED, so 0.0% (SHIPPED proxy).
 *     - Inbound/outbound mix: 4 RECEIVE / 7 LOAD of 11 active Bay-4 tasks.
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
// NOT re-pulled in the 11/1 4:40p PT refresh (out of scope of the request). The
// array is left empty rather than carrying a stale result; Section 1 renders live
// from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 246 at the 11/1 ~4:40p PT pull (unchanged).
export const plannedGurunandaOrderCount = 246;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/1 ~4:40p PT
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
    duration: "RECEIVE 376d03h18m since 10/21/25 1:21:14p PT — STALE: task status still IN_PROGRESS although its endTime is 10/22/25 10:42:01a PT (TASK-5090739, daira gonzalez, ET-1027622, RN-5002143 CLOSED) · no live task since ARNULFO MUNGUIA's TASK-5407659 closed here 10/30 3:35:54p PT (3 loads SHIPPED) · dock AVAILABLE, space occupied, occupiedCustomerIds ORG-655875, entry ET-1177235 (row updated 10/30 3:36:54p PT)",
    anomaly: true, // TASK-5090739 started 10/21/25 and is still IN_PROGRESS
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "JOSE ROSAS (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5408598"],
    duration: "LOAD 2d03h12m since 10/30 1:27:35p PT (TASK-5408598, JOSE ROSAS, ET-1177829, PRE_LOAD, 3 loads all LOADED - LOAD-5043274 / 50103252 - DN-3428439, LOAD-5042860 / 50099666 - DN-3424791, LOAD-5043265 / 50103243 - DN-3429034; equipment 53188, dock check-in 1:27:52p PT) · dock and space occupied (row updated 10/30 10:39:48p PT)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "JOSE ROSAS (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5408738"],
    duration: "LOAD 2d00h53m since 10/30 3:46:12p PT (TASK-5408738, JOSE ROSAS, ET-1177903, PRE_LOAD, load LOAD-5043114 LOADING / 50102877 - DN-3427797; equipment 53567, dock check-in 3:46:16p PT) · dock and space occupied (row updated 10/30 10:39:29p PT)",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5408621"],
    duration: "LOAD 2d02h42m since 10/30 1:57:33p PT (TASK-5408621, ARNULFO MUNGUIA, ET-1177849, PRE_LOAD, seal 24800339, 4 loads all LOADED - LOAD-5043237 / 50103218 - DN-3428441, LOAD-5043235 / 50103216 - DN-3428479, LOAD-5043234 / 50103215 - DN-3428600, LOAD-5043106 / 50102868 - DN-3427844; equipment 53678, dock check-in 1:57:41p PT) · dock and space occupied (row updated 10/30 10:39:10p PT)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5408735", "TASK-5338695"],
    duration: "LOAD 2d01h01m since 10/30 3:38:44p PT (TASK-5408735, ARNULFO MUNGUIA, ET-1177898, PRE_LOAD, seal 24800338, 12 loads - 11 LOADED + LOAD-5043233 WINDOW_CHECKIN_DONE / 50103214 - DN-3428674; load nos 50103211, 50102879, 50102878, 50102874, 50102873, 50102872, 50102869, 50103246, 50103217, 50103214, 50103213, 50102875, equipment 53377, trailer in yard 6:19:36p PT, dock check-in 3:38:54p PT) — plus one STALE LOAD started 8/7/26 4:29:29p PT, 86d00h10m, task still IN_PROGRESS although its endTime is 8/10/26 9:27:26a PT (TASK-5338695, ARNULFO MUNGUIA, ET-1135033, LOAD-5035487 SHIPPED / DN-3278524) · dock and space occupied (row updated 10/30 10:38:56p PT)",
    anomaly: true, // TASK-5338695 started 8/7/26 but is still IN_PROGRESS
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD x2)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5408904", "TASK-5408911"],
    duration: "LOAD 1d17h26m since 10/30 11:13:01p PT (TASK-5408904, ARNULFO MUNGUIA, ET-1178033, PRE_LOAD, seal 24800337, load LOAD-5043118 LOADED / 50102880 - DN-3427381, equipment 53402CT, dock check-in 11:14:38p PT) — plus LOAD 1d16h59m since 10/30 11:40:37p PT (TASK-5408911, ARNULFO MUNGUIA, ET-1178036, PRE_LOAD, 2 loads LOADED - LOAD-5043109 / 50102871 - DN-3427837, LOAD-5043108 / 50102870 - DN-3427838, equipment 53668, dock check-in 11:40:39p PT) · dock and space occupied (row updated 10/30 11:40:39p PT)",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied, entry ET-1177729 (row updated 10/30 11:14:38p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space occupied, entry ET-1177638 (row updated 10/30 9:28:14a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied, entry ET-1174121 (row updated 10/30 5:39:09a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied, entry ET-1177560 (row updated 10/30 10:38:06p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied, occupiedCustomerIds ORG-655875, entry ET-1177628 (row updated 10/30 10:48:11a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1177638 (row updated 10/30 11:06:59a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5408123"],
    duration: "RECEIVE 2d00h55m since 10/30 3:44:56p PT (TASK-5408123, DANIELA GONZALEZ, ET-1177432, RN-5011243 IN_PROGRESS / PO CSNU7748988 with receivedStartTime 3:44:56p PT, appointment 10/29 12:00p PT, driver GUOMING CHEN; dock check-in 3:45:01p PT) · dock occupied, space empty (row updated 10/30 3:45:01p PT)",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1177294 (row updated 10/30 10:17:13a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1176452 (row updated 10/29 9:08:11p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1176517 (row updated 10/30 10:37:43p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1173309 (row updated 10/30 10:37:29p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1177613 (row updated 10/30 12:45:31p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Available",
    assignee: "Jorge Antonio Franco (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5408610"],
    duration: "RECEIVE NEW · created 10/30 1:41:18p PT (TASK-5408610, Jorge Antonio Franco, ET-1177841, RN-5011280 IMPORTED / PO9427, appointment 10/30 11:00a PT + RN-5011277 IMPORTED / PO9428, appointment 10/30 10:00a PT; trailer 181416, driver SALVA MERCA) - task has no startTime, so no duration basis · dock AVAILABLE, space EMPTY, entry ET-1174584 (row updated 10/30 2:28:20p PT), i.e. the open NEW task is not holding the door · note: the door-location row still carries the older entry ET-1174584 while the open receive task carries ET-1177841",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW · created 9/30 10:46:50a PT (TASK-5381972, Jorge Antonio Franco, ET-1162686, RN-5010583 IMPORTED / PO9139-2; driver ULYSSES PEREZ) - task has no startTime, so no duration basis · dock AVAILABLE, space occupied, entry ET-1171953 (row updated 10/30 3:46:16p PT)",
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
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1176765 (row updated 10/30 10:38:20p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1176051 (row updated 10/30 10:37:03p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 16
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 1
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 9
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

// Doors carrying dockStatus RESERVED at this pull: DOCK57.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockId to the 23 Bay-4 docks, Nov 1 2026 ~4:40p PT).
// 11 active-status tasks at Bay 4 doors: 7 LOAD + 4 RECEIVE.
// ARNULFO MUNGUIA: 5 LOAD (DOCK53 TASK-5408621, DOCK54 TASK-5408735, DOCK54
//   TASK-5338695 stale, DOCK55 TASK-5408904, DOCK55 TASK-5408911)
// JOSE ROSAS: 2 LOAD (DOCK51 TASK-5408598, DOCK52 TASK-5408738)
// Jorge Antonio Franco: 2 RECEIVE (DOCK68 TASK-5408610 NEW, DOCK69 TASK-5381972 NEW)
// daira gonzalez: 1 RECEIVE (DOCK50 TASK-5090739, STALE)
// DANIELA GONZALEZ: 1 RECEIVE (DOCK62 TASK-5408123, IN_PROGRESS)
// All assigned names resolved from WMS task payloads (assigneeUserName).
// daira gonzalez (userId 1948070158297014492) and DANIELA GONZALEZ (userId 11769)
// are two different WMS users and are kept separate.
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 5 },
  { name: "JOSE ROSAS", taskCount: 2 },
  { name: "Jorge Antonio Franco", taskCount: 2 },
  { name: "daira gonzalez", taskCount: 1 },
  { name: "DANIELA GONZALEZ", taskCount: 1 },
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

// Mix: 4 RECEIVE + 7 LOAD = 11 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 4, total: 11 },
  { label: "Outbound (LOAD)", count: 7, total: 11 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 7, total: 11 },
  { label: "Inbound", count: 4, total: 11 },
];

// --- Schedule Data (2026-11-01, Sunday) ---
// % scheduled inbounds received TODAY: 0 GURUNANDA receipts carry an
//   appointmentTime inside the 11/1 PT business day (query window
//   appointmentTimeFrom "2026-11-01 00:00:00" -> appointmentTimeTo
//   "2026-11-01 23:59:59" returned totalCount 0), so nothing was scheduled and
//   nothing could be received. The percentage is not computable; it is NOT
//   reported as 0.0%.
// % scheduled outbounds loaded TODAY: 1 GURUNANDA order carries a scheduleDate
//   inside the 11/1 PT day (scheduleDatePeriod ["2026-11-01 00:00:00",
//   "2026-11-01 23:59:59"] returned totalCount 1): DN-3427811 / TO-T&T-0008 at
//   status PLANNED. 0 of those 1 orders is at status SHIPPED (the "loaded" proxy
//   defined by the prior refresh), so the percentage is 0.0%.
// Last scheduled business day (10/30 PT), re-read at this pull for context only:
//   9 receipts with an appointmentTime that day, 2 carrying a receivedStartTime
//   (RN-5011276 CLOSED receivedStart 9:23:19a, RN-5011215 IN_PROGRESS receivedStart
//   10/29 1:23:30p) = 22.2%; 39 orders scheduled that day, 3 at status SHIPPED
//   = 7.7%.
export const scheduleAvailable = false;             // inbound denominator is 0 on 11/1
export const outboundScheduleAvailable = true;      // outbound denominator is 1 on 11/1
export const scheduledInboundOrders = 0;            // receipts with appointmentTime in the 11/1 PT day
export const scheduledOutboundOrders = 1;           // orders with scheduleDate in the 11/1 PT day
export const scheduledInboundReceived = 0;          // receipts with receivedStartTime in that set
export const scheduledOutboundLoaded = 0;           // orders at status SHIPPED in that set
export const pctScheduledInboundReceived = 0;       // not computable (0 of 0) on 11/1
export const pctScheduledOutboundLoaded = 0;        // 0 of 1 scheduled orders SHIPPED on 11/1
// Facility-wide appointment context - unavailable (GURUNANDA-scoped queries only;
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

// All Bay 4 active task records (DOCK50-DOCK72, Nov 1 2026 ~4:40p PT)
// 11 tasks total: 7 LOAD + 4 RECEIVE. All GURUNANDA, LLC.
// Two are stale-anomaly tasks (TASK-5338695 on DOCK54, TASK-5090739 on DOCK50).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA (userId 89) has 22 CLOSED GURUNANDA load transactions with endTime
// inside 10/25-11/1 PT (re-pulled at 4:40p PT: still 22, no new closure); the
// newest is DOCK54 TASK-5407435 (PRE_LOAD, ET-1177123, loads LOAD-5043125 SHIPPED /
// 50102887 - DN-3427324 and LOAD-5043124 SHIPPED / 50102886 - DN-3427325, seal
// 1379250, equipment 53603; started 10/29 11:55:54a PT, closed 10/30 3:52:49p PT
// = 27h57m). His open Bay-4 work is 4 live LOAD tasks on DOCK53/DOCK54/DOCK55 x2
// plus the stale TASK-5338695 (DOCK54).
export const assignments: TaskRecord[] = [
  // ----- OUTBOUND / LOAD (7) -----
  {
    taskId: "TASK-5408738",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 2d00h53m since 10/30 3:46:12p PT (JOSE ROSAS; ET-1177903, PRE_LOAD, load LOAD-5043114 LOADING / 50102877 - DN-3427797; equipment 53567, dock check-in 3:46:16p PT)",
    assignee: "JOSE ROSAS",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5408621",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 2d02h42m since 10/30 1:57:33p PT (ARNULFO MUNGUIA; ET-1177849, PRE_LOAD, seal 24800339, 4 loads all LOADED - LOAD-5043237 / 50103218 - DN-3428441, LOAD-5043235 / 50103216 - DN-3428479, LOAD-5043234 / 50103215 - DN-3428600, LOAD-5043106 / 50102868 - DN-3427844; equipment 53678, dock check-in 1:57:41p PT)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5408598",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 2d03h12m since 10/30 1:27:35p PT (JOSE ROSAS; ET-1177829, PRE_LOAD, 3 loads all LOADED - LOAD-5043274 / 50103252 - DN-3428439, LOAD-5042860 / 50099666 - DN-3424791, LOAD-5043265 / 50103243 - DN-3429034; equipment 53188, dock check-in 1:27:52p PT)",
    assignee: "JOSE ROSAS",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5408735",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 2d01h01m since 10/30 3:38:44p PT (ARNULFO MUNGUIA; ET-1177898, PRE_LOAD, seal 24800338, 12 loads - 11 LOADED + LOAD-5043233 WINDOW_CHECKIN_DONE / 50103214 - DN-3428674; load nos 50103211, 50102879, 50102878, 50102874, 50102873, 50102872, 50102869, 50103246, 50103217, 50103214, 50103213, 50102875, equipment 53377, trailer in yard 6:19:36p PT, dock check-in 3:38:54p PT)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5408904",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 1d17h26m since 10/30 11:13:01p PT (ARNULFO MUNGUIA; ET-1178033, PRE_LOAD, seal 24800337, load LOAD-5043118 LOADED / 50102880 - DN-3427381; equipment 53402CT, dock check-in 11:14:38p PT)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5408911",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 1d16h59m since 10/30 11:40:37p PT (ARNULFO MUNGUIA; ET-1178036, PRE_LOAD, 2 loads LOADED - LOAD-5043109 / 50102871 - DN-3427837, LOAD-5043108 / 50102870 - DN-3427838; equipment 53668, dock check-in 11:40:39p PT)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5338695",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 8/7/26 4:29:29p PT, 86d00h10m; status still IN_PROGRESS although endTime is 8/10/26 9:27:26a PT; ARNULFO MUNGUIA, ET-1135033, PRE_LOAD, LOAD-5035487 SHIPPED / DN-3278524)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },

  // ----- INBOUND / RECEIVE (4) -----
  {
    taskId: "TASK-5408123",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 2d00h55m since 10/30 3:44:56p PT (DANIELA GONZALEZ; ET-1177432, RN-5011243 IN_PROGRESS / PO CSNU7748988, appointment 10/29 12:00p PT, receivedStartTime 3:44:56p PT, driver GUOMING CHEN, dock check-in 3:45:01p PT)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK62",
  },
  {
    taskId: "TASK-5408610",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 10/30 1:41:18p PT (Jorge Antonio Franco; ET-1177841, RN-5011280 IMPORTED / PO9427, appointment 10/30 11:00a PT + RN-5011277 IMPORTED / PO9428, appointment 10/30 10:00a PT; trailer 181416, driver SALVA MERCA) - task has no startTime",
    assignee: "Jorge Antonio Franco",
    door: "DOCK68",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/30 10:46:50a PT (Jorge Antonio Franco; ET-1162686, RN-5010583 IMPORTED / PO9139-2; driver ULYSSES PEREZ) - task has no startTime",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 10/21/25 1:21:14p PT, 376d03h18m; status still IN_PROGRESS although endTime is 10/22/25 10:42:01a PT; daira gonzalez, ET-1027622, RN-5002143 CLOSED)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
];
