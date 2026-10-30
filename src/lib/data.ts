/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-10-30 3:24p PT (live WISE / WMS-BAM APIs)
 *   Sources (all read with item-time-zone America/Los_Angeles; DB timestamps
 *   arrive in UTC and are shown below converted to facility-local PT, UTC-7/PDT):
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors, 23/23 rows
 *       returned (fresh dockStatus, spaceStatus, occupiedCustomerIds, entryId,
 *       updatedTime)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide totalCount 14); matched on dockId to
 *       the 23 Bay-4 docks -> 6 at Bay 4 doors (DOCK50, 51, 53, 54 x2, 55)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide totalCount 17), same per-door
 *       dockId match -> 3 at Bay 4 doors (DOCK50, 68, 69)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To inside the 10/30 PT business day -> totalCount 9;
 *       2 of the 9 carry a receivedStartTime (RN-5011276, RN-5011215)
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDatePeriod inside the 10/30 PT business day -> totalCount 35;
 *       same window + statuses ["SHIPPED"] -> totalCount 3
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA load tasks with
 *       statuses CLOSED/FORCE_CLOSED and endTime inside the 10/30 PT day ->
 *       totalCount 10 (facility-wide; newest e.g. TASK-5408600 DOCK38
 *       JOSE MORALES closed 2:37:04p PT)
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA CLOSED/FORCE_CLOSED
 *       load tasks for assigneeUserId 89 (ARNULFO MUNGUIA), endTime 10/23-10/30 PT,
 *       sorted endTime DESC -> totalCount 28 (Arnulfo Assigned Activity stream)
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders at status
 *       PLANNED, no date filter -> totalCount 254 (planned-orders fallback)
 *   NOTE: door state is read from wms-location/search (dockStatus + spaceStatus),
 *   the same two status fields the dashboard already uses.
 *   NOTE: the scheduled-inbound/outbound windows are the facility-local PT day,
 *   expressed against the API's UTC timestamps (2026-10-30 07:00:00 ->
 *   2026-10-31 06:59:59), because the API compares the stored UTC values.
 *
 *   Key changes from the prior refresh (10/29 ~12:50p PT -> 10/30 ~3:24p PT):
 *     - Bay 4 GURUNANDA active tasks: 9 (6 LOAD + 3 RECEIVE) on 7 doors
 *       (DOCK50, DOCK51, DOCK53, DOCK54 x2, DOCK55, DOCK68, DOCK69) - up from
 *       5 tasks on 4 doors. New since the 10/29 pull: TASK-5408659 (DOCK55
 *       LIVE_LOAD, DANIEL BELTRAN), TASK-5408621 (DOCK53 PRE_LOAD, ARNULFO
 *       MUNGUIA), TASK-5408598 (DOCK51 PRE_LOAD, JOSE ROSAS), TASK-5408610
 *       (DOCK68 RECEIVE, Jorge Antonio Franco). TASK-5407533 (DOCK71) is no
 *       longer active, so DOCK71 now shows no active task.
 *     - Task "Guru live out / in assign to Arnulfo" still resolves to ARNULFO
 *       MUNGUIA GURUNANDA Bay 4 work. No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo"; the stream is read as the
 *       assignee's task assignment transactions and none is invented here.
 *       His assigned-activity pull (closed load tasks, 10/23-10/30 PT) returns 28
 *       transactions; the newest is DOCK52 TASK-5407620 (PRE_LOAD, ET-1177215,
 *       loads LOAD-5043123 SHIPPED / 50102885 - DN-3427342 and LOAD-5043121
 *       SHIPPED / 50102883 - DN-3427341, seal 1379201, equipment 53558;
 *       started 10/29 1:32:16p PT, closed 10/30 2:04:24p PT = 24h32m).
 *     - Bay 4 doors occupied (rule below): 15/23, 2 reserved (DOCK57, DOCK59),
 *       6 available (DOCK61, 63, 64, 65, 67, 68). Raw dockStatus=OCCUPIED = 10/23;
 *       the extra occupied doors are space-occupied doors whose dockStatus reads
 *       AVAILABLE (DOCK52, 55, 56, 58, 60). DOCK68 carries an open NEW receive
 *       task but reads dock AVAILABLE + space EMPTY, so the door rule classes it
 *       Available; the task is counted in "Doors w/ Active Tasks" instead.
 *     - Stale anomalies STILL OPEN: TASK-5338695 (DOCK54, LOAD started 8/7/26
 *       4:29:29p PT, ~84.0 days; status still IN_PROGRESS although its endTime is
 *       8/10/26 9:27:26a PT) and TASK-5090739 (DOCK50, RECEIVE started 10/21/25
 *       1:21:14p PT, ~374.1 days; status still IN_PROGRESS although its endTime is
 *       10/22/25 10:42:01a PT).
 *     - "% scheduled inbounds received" (10/30 PT day): 2 of 9 = 22.2%
 *       (RN-5011276 receivedStart 1:23:19p PT and CLOSED 2:18:19p PT; RN-5011215
 *       receivedStart 10/29 1:23:30p PT against a 10/30 12:00p appointment). The
 *       other 7 - RN-194861, RN-194850, RN-194849, RN-194848, RN-5011280,
 *       RN-5011277, RN-194782 - are still IMPORTED with no receivedStartTime.
 *     - "% scheduled outbounds loaded" (10/30 PT day): 3 of 35 = 8.6%
 *       (SHIPPED is the "loaded" proxy used by the prior refresh). The 32
 *       non-SHIPPED orders were not broken out by status in this pull.
 *     - Inbound/outbound mix: 3 RECEIVE / 6 LOAD of 9 active Bay-4 tasks.
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
// NOT re-pulled in the 10/30 3:24p PT refresh (out of scope of the request). The
// array is left empty rather than carrying a stale result; Section 1 renders live
// from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 254 at the 10/30 ~3:24p PT pull.
export const plannedGurunandaOrderCount = 254;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 10/30 ~3:24p PT
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
    taskIds: ["TASK-5407659", "TASK-5090739"],
    duration: "LOAD 24h26m since 10/29 2:57:40p PT (TASK-5407659, ARNULFO MUNGUIA, ET-1177235, PRE_LOAD, 3 loads all LOADED - LOAD-5043122 / 50102884, LOAD-5043120 / 50102882, LOAD-5043119 / 50102881; equipment 53277, seal A522206, dock check-in 2:57:42p PT) — plus one STALE RECEIVE started 10/21/25 1:21:14p PT, ~374.1 days; task status still IN_PROGRESS although its endTime is 10/22/25 10:42:01a PT (TASK-5090739, daira gonzalez, ET-1027622, RN-5002143 CLOSED) · dock and space occupied, occupiedCustomerIds ORG-655875, entry ET-1177235 (row updated 10/29 9:00:09p PT)",
    anomaly: true, // TASK-5090739 started 10/21/25 and is still IN_PROGRESS
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "JOSE ROSAS (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5408598"],
    duration: "LOAD 1h56m since 10/30 1:27:35p PT (TASK-5408598, JOSE ROSAS, ET-1177829, PRE_LOAD, LOAD-5043274 LOADED / 50103252, LOAD-5042860 LOADING / 50099666, LOAD-5043265 LOADED / 50103243; equipment 53188, dock check-in 1:27:52p PT) · dock and space occupied (row updated 10/30 1:27:54p PT)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (ARNULFO MUNGUIA's TASK-5407620 closed here 10/30 2:04:24p PT, PRE_LOAD, 2 loads SHIPPED) · dock AVAILABLE, space occupied, entry ET-1177215 (row updated 10/30 2:04:36p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5408621"],
    duration: "LOAD 1h26m since 10/30 1:57:33p PT (TASK-5408621, ARNULFO MUNGUIA, ET-1177849, PRE_LOAD, 4 loads all LOADING - LOAD-5043237 / 50103218, LOAD-5043235 / 50103216, LOAD-5043234 / 50103215, LOAD-5043106 / 50102868; equipment 53678, dock check-in 1:57:41p PT) — ARNULFO MUNGUIA's TASK-5408409 also closed here earlier today at 12:33:27p PT · dock and space occupied (row updated 10/30 1:57:41p PT)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5407435", "TASK-5338695"],
    duration: "LOAD 27h28m since 10/29 11:55:54a PT (TASK-5407435, ARNULFO MUNGUIA, ET-1177123, PRE_LOAD, load LOAD-5043125 LOADED / 50102887 - DN-3427324, LOAD-5043124 LOADED / 50102886 - DN-3427325; equipment 53603, seal 1379250, dock check-in 11:56:03a PT) — plus one STALE LOAD started 8/7/26 4:29:29p PT, ~84.0 days, task still IN_PROGRESS although its endTime is 8/10/26 9:27:26a PT (TASK-5338695, ARNULFO MUNGUIA, LOAD-5035487 SHIPPED / DN-3278524) · dock and space occupied (row updated 10/29 8:59:15p PT)",
    anomaly: true, // TASK-5338695 started 8/7/26 but is still IN_PROGRESS
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "DANIEL BELTRAN (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5408659"],
    duration: "LOAD 1h00m since 10/30 2:23:08p PT (TASK-5408659, DANIEL BELTRAN, ET-1177862, LIVE_LOAD, load LOAD-5043070 LOADED / 47657123991 // SP BOL - DN-3426367; seal 1379254, equipment SPGA1336, driver GURPAL SINGH, dock check-in 2:23:11p PT) — ARNULFO MUNGUIA's TASK-5408476 also closed here today at 1:58:53p PT · dock AVAILABLE, space occupied (row updated 10/30 2:38:27p PT)",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied, entry ET-1177729 (row updated 10/30 3:20:58p PT) · no occupancy-start field in WMS",
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
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space occupied, entry ET-1177560 (row updated 10/30 1:41:21p PT) · no occupancy-start field in WMS",
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
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1177293 (row updated 10/30 5:39:11a PT) · no occupancy-start field in WMS",
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
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1176517 (row updated 10/30 5:07:19a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1173309 (row updated 10/29 8:57:28p PT) · no occupancy-start field in WMS",
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
    duration: "RECEIVE NEW · created 10/30 1:41:18p PT (TASK-5408610, Jorge Antonio Franco, ET-1177841, RN-5011280 IMPORTED / PO9427, appointment 11:00a PT + RN-5011277 IMPORTED / PO9428, appointment 10:00a PT; trailer 181416 53', BOL CORRU103026UNIS, in yard 1:41:17p PT) - task has no startTime, so no duration basis · dock AVAILABLE, space EMPTY (row updated 10/30 2:28:20p PT), i.e. the open NEW task is not holding the door",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW · created 9/30 10:46:50a PT (TASK-5381972, Jorge Antonio Franco, ET-1162686, RN-5010583 IMPORTED / PO9139-2) - task has no startTime, so no duration basis · dock and space occupied (row updated 10/29 8:56:57p PT)",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1172826 (row updated 10/29 8:56:40p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task (TASK-5407533, Jorge Antonio Franco, RN-5011235, is no longer active since the 10/29 pull) · dock occupied, space empty, entry ET-1176765 (row updated 10/29 8:56:24p PT) · no occupancy-start field in WMS",
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

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 15
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 2
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 7
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

// Doors carrying dockStatus RESERVED at this pull: DOCK57, DOCK59.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockId to the 23 Bay-4 docks, Oct 30 2026 ~3:24p PT).
// 9 active-status tasks at Bay 4 doors: 6 LOAD + 3 RECEIVE.
// ARNULFO MUNGUIA: 4 LOAD (DOCK50 TASK-5407659, DOCK53 TASK-5408621,
//   DOCK54 TASK-5407435, DOCK54 TASK-5338695 stale)
// Jorge Antonio Franco: 2 RECEIVE (DOCK68 TASK-5408610 NEW, DOCK69 TASK-5381972 NEW)
// JOSE ROSAS: 1 LOAD (DOCK51 TASK-5408598, IN_PROGRESS)
// DANIEL BELTRAN: 1 LOAD (DOCK55 TASK-5408659, LIVE_LOAD)
// daira gonzalez: 1 RECEIVE (DOCK50 TASK-5090739, STALE)
// All assigned names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 4 },
  { name: "Jorge Antonio Franco", taskCount: 2 },
  { name: "JOSE ROSAS", taskCount: 1 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
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

// Mix: 3 RECEIVE + 6 LOAD = 9 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 3, total: 9 },
  { label: "Outbound (LOAD)", count: 6, total: 9 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 6, total: 9 },
  { label: "Inbound", count: 3, total: 9 },
];

// --- Schedule Data (2026-10-30, Friday) ---
// % scheduled inbounds received TODAY: 9 GURUNANDA receipts carry an
//   appointmentTime inside the 10/30 PT business day (query window
//   2026-10-30 07:00:00 -> 2026-10-31 06:59:59 UTC returned totalCount 9).
//   Status re-checked on the same 9 rows: 2 carry a receivedStartTime
//   (RN-5011276 at 1:23:19p PT, now CLOSED; RN-5011215 at 10/29 1:23:30p PT,
//   IN_PROGRESS) and 7 are still IMPORTED with no receivedStartTime
//   (RN-194861, RN-194850, RN-194849, RN-194848, RN-5011280, RN-5011277,
//   RN-194782), so received = 2 of 9 = 22.2%.
// % scheduled outbounds loaded TODAY: 35 GURUNANDA orders carry a scheduleDate
//   inside the 10/30 PT day (same window returned totalCount 35); 3 of them
//   carry status SHIPPED (same date filter + status SHIPPED returned
//   totalCount 3), so loaded = 3 of 35 = 8.6%. The remaining 32 orders were not
//   broken out by status in this pull (SHIPPED is the "loaded" proxy defined by
//   the prior refresh).
export const scheduleAvailable = true;              // inbound denominator is 9
export const outboundScheduleAvailable = true;      // outbound denominator is 35
export const scheduledInboundOrders = 9;            // receipts with appointmentTime in the 10/30 PT day
export const scheduledOutboundOrders = 35;          // orders with scheduleDate in the 10/30 PT day
export const scheduledInboundReceived = 2;          // receipts with receivedStartTime today
export const scheduledOutboundLoaded = 3;           // orders at status SHIPPED today
export const pctScheduledInboundReceived = 22.2;    // 2 of 9 = 22.22% -> 22.2%
export const pctScheduledOutboundLoaded = 8.6;      // 3 of 35 = 8.57% -> 8.6%
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

// All Bay 4 active task records (DOCK50-DOCK72, Oct 30 2026 ~3:24p PT)
// 9 tasks total: 6 LOAD + 3 RECEIVE. All GURUNANDA, LLC.
// Two are stale-anomaly tasks (TASK-5338695 on DOCK54, TASK-5090739 on DOCK50).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA (userId 89) has 28 CLOSED GURUNANDA load transactions inside
// 10/23-10/30 PT; the newest is DOCK52 TASK-5407620 (PRE_LOAD, ET-1177215,
// loads LOAD-5043123 SHIPPED / 50102885 - DN-3427342 and LOAD-5043121 SHIPPED /
// 50102883 - DN-3427341, seal 1379201, equipment 53558; started 10/29 1:32:16p PT,
// closed 10/30 2:04:24p PT = 24h32m). Also closed today: TASK-5408476 (DOCK55,
// 12:58:53p PT) and TASK-5408409 (DOCK53, 12:33:27p PT), plus TASK-5407881
// (DOCK53, 9:28:46a PT, 10 loads all SHIPPED). None of the closed tasks is part
// of the active list below. His open Bay-4 work is 3 live LOAD tasks on
// DOCK50/DOCK53/DOCK54 plus the stale TASK-5338695 (DOCK54).
export const assignments: TaskRecord[] = [
  // ----- OUTBOUND / LOAD (6) -----
  {
    taskId: "TASK-5408659",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~1h00m since 10/30 2:23:08p PT (DANIEL BELTRAN; ET-1177862, LIVE_LOAD, load LOAD-5043070 LOADED / 47657123991 // SP BOL - DN-3426367; seal 1379254, equipment SPGA1336, driver GURPAL SINGH, dock check-in 2:23:11p PT)",
    assignee: "DANIEL BELTRAN",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5408621",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~1h26m since 10/30 1:57:33p PT (ARNULFO MUNGUIA; ET-1177849, PRE_LOAD, 4 loads all LOADING - LOAD-5043237 / 50103218 - DN-3428441, LOAD-5043235 / 50103216 - DN-3428479, LOAD-5043234 / 50103215 - DN-3428600, LOAD-5043106 / 50102868 - DN-3427844; equipment 53678, dock check-in 1:57:41p PT)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5408598",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~1h56m since 10/30 1:27:35p PT (JOSE ROSAS; ET-1177829, PRE_LOAD, LOAD-5043274 LOADED / 50103252 - DN-3428439, LOAD-5042860 LOADING / 50099666 - DN-3424791, LOAD-5043265 LOADED / 50103243 - DN-3429034; equipment 53188, dock check-in 1:27:52p PT)",
    assignee: "JOSE ROSAS",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5407659",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~24h26m since 10/29 2:57:40p PT (ARNULFO MUNGUIA; ET-1177235, PRE_LOAD, 3 loads all LOADED - LOAD-5043122 / 50102884 - DN-3427340, LOAD-5043120 / 50102882 - DN-3427344, LOAD-5043119 / 50102881 - DN-3427345; equipment 53277, seal A522206, dock check-in 2:57:42p PT)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5407435",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~27h28m since 10/29 11:55:54a PT (ARNULFO MUNGUIA; ET-1177123, PRE_LOAD, load LOAD-5043125 LOADED / 50102887 - DN-3427324, LOAD-5043124 LOADED / 50102886 - DN-3427325; equipment 53603, seal 1379250, dock check-in 11:56:03a PT)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5338695",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 8/7/26 4:29:29p PT, ~84.0 days; status still IN_PROGRESS although endTime is 8/10/26 9:27:26a PT; ARNULFO MUNGUIA, ET-1135033, PRE_LOAD, LOAD-5035487 SHIPPED / DN-3278524)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },

  // ----- INBOUND / RECEIVE (3) -----
  {
    taskId: "TASK-5408610",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 10/30 1:41:18p PT (Jorge Antonio Franco; ET-1177841, RN-5011280 IMPORTED / PO9427, appointment 11:00a PT + RN-5011277 IMPORTED / PO9428, appointment 10:00a PT; trailer 181416 53', BOL CORRU103026UNIS, in yard 1:41:17p PT) - task has no startTime",
    assignee: "Jorge Antonio Franco",
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
    pieces: "IN_PROGRESS · STALE (started 10/21/25 1:21:14p PT, ~374.1 days; status still IN_PROGRESS although endTime is 10/22/25 10:42:01a PT; daira gonzalez, ET-1027622, RN-5002143 CLOSED)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
];
