/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-06 14:45:00 PT (live WISE / WMS-BAM APIs)
 *   Sources (all read with item-time-zone America/Los_Angeles; WISE returns the
 *   dock/task/receipt/order timestamps as naive facility wall-clock values, so
 *   the strings below are already PT and no UTC->PT shift is applied):
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors, 23/23 rows
 *       returned (fresh dockStatus, spaceStatus, occupiedCustomerIds, entryId,
 *       updatedTime)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide totalCount 14); matched on dockName to
 *       the 23 Bay-4 docks -> 3 at Bay 4 doors (DOCK52, DOCK54, DOCK55)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide totalCount 16), same per-door
 *       dockName match -> 4 at Bay 4 doors (DOCK50, DOCK59, DOCK67, DOCK69)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To inside the 11/6 PT business day -> totalCount 10
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDatePeriod inside the 11/6 PT business day -> totalCount 40
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA CLOSED/FORCE_CLOSED
 *       load tasks for assigneeUserId 89 (ARNULFO MUNGUIA), endTime
 *       2026-10-30 00:00:00 - now, sorted endTime DESC
 *       -> 41 transactions (Arnulfo Assigned Activity stream), 37 at Bay-4 doors
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders at status
 *       PLANNED, no date filter -> totalCount 180 (planned-orders fallback)
 *     - /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/
 *       search-by-paging - CLOSED/FORCE_CLOSED tasks with endTime inside the 11/6 PT
 *       day -> 14 load + 9 receive closures, used for the door turnover notes below
 *   NOTE: door state is read from wms-location/search (dockStatus + spaceStatus),
 *   the same two status fields the dashboard already uses.
 *   NOTE: the load/receive task searches were filtered by customerIds only and
 *   matched to Bay-4 doors on the returned dockName field (dockId is also present
 *   but is a numeric location id, not the DOCKnn name).
 *   NOTE: the query shape used here is byte-identical to the prior refresh. This
 *   pull ran at 14:45 PT, i.e. mid-afternoon on 11/6, so the 11/6 schedule
 *   denominators (10 inbounds / 40 outbounds) are still partial-day populations.
 *
 *   CONTEXT - 11/6 PT is a Friday. 10 GURUNANDA receipts carry an appointment on
 *   11/6; TWO of them carry a receivedStartTime (RN-5011376, 9:27:32a PT on
 *   DOCK65, and RN-5011383, 12:16:58p PT) = 20.0%. 40 GURUNANDA orders carry
 *   scheduleDate 11/6; 9 are at status SHIPPED (the loaded proxy defined by the
 *   prior refreshes) = 22.5%. No order on that day sits at status LOADED, PACKED
 *   is 1, PICKED 10, PLANNED 18, IMPORTED 1, COMMIT_FAILED 1.
 *
 *   Key changes from the prior refresh (11/6 ~11:47a PT -> 11/6 ~2:45p PT):
 *     - DOOR STATUS: 17/23 occupied (was 19), 2 reserved (DOCK59, DOCK67; was 1),
 *       4 available (DOCK61, DOCK63, DOCK65, DOCK68; was DOCK61, DOCK63, DOCK68).
 *       Raw dockStatus=OCCUPIED is 12/23; 5 more doors (DOCK51, DOCK53, DOCK56,
 *       DOCK57, DOCK58) are space-occupied only with dockStatus AVAILABLE.
 *       DOCK59 flipped occupied -> reserved, DOCK65 flipped occupied -> available
 *       when its receive task closed, DOCK67 stayed reserved. DOCK51 and DOCK58
 *       cleared their tasks but keep space OCCUPIED.
 *     - TASK TURNOVER: three of the eight 11:47a tasks closed this afternoon -
 *       DOCK65 TASK-5414129 (Fatima Ponce, closed 12:41:01p PT; its receipt
 *       RN-5011376 was the 11:47a pull's only received 11/6 appointment),
 *       DOCK51 TASK-5413721 (closed 1:20:36p PT under ARNULFO MUNGUIA - it was
 *       carried by JESUS ESPINOZA at the 11:47a pull) and DOCK58 TASK-5413982
 *       (DANIEL BELTRAN, 1:23:45p). TWO new tasks were opened in their place:
 *       DOCK52 TASK-5414481 (ARNULFO MUNGUIA, NEW, 12:27:19p) and DOCK54
 *       TASK-5414475 (ARNULFO MUNGUIA, NEW, 12:20:42p). Carried over unchanged:
 *       DOCK55 TASK-5414119 (ARNULFO MUNGUIA, IN_PROGRESS), DOCK59 TASK-5414270
 *       (A1SG, NEW), DOCK67 TASK-5414174 (GONZALO RANGEL, NEW), DOCK69
 *       TASK-5381972 (Jorge Antonio Franco, NEW) and the stale DOCK50
 *       TASK-5090739. Net: 8 active Bay-4 tasks -> 7.
 *     - STALE ANOMALY: unchanged. TASK-5090739 (DOCK50, RECEIVE started
 *       10/21/25 1:21:14p PT) is still returned by the active-status query
 *       although its endTime is 10/22/25 10:42:01a PT. Its linked receipt
 *       RN-5002143 is already CLOSED (re-verified this pull).
 *     - Task "Guru live out / in assign to Arnulfo" still resolves to ARNULFO
 *       MUNGUIA GURUNANDA Bay 4 work. No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo"; the stream is read as the
 *       assignee's task assignment transactions and none is invented here.
 *       His assigned-activity pull (closed load tasks, endTime from 2026-10-30 00:00:00 PT)
 *       returns 41 transactions (37 at Bay-4 doors), 7 of them closed today
 *       (11/6 PT). The newest is DOCK51 TASK-5413721 (closed 11/6 1:20:36p PT,
 *       3 loads, seal 1303554, trailer 53402CT) - the Bay-4 pre-load he was
 *       running at the 11:47a pull has now closed. He also holds TWO new open
 *       Bay-4 tasks: DOCK52 TASK-5414481 and DOCK54 TASK-5414475, plus the still
 *       live DOCK55 TASK-5414119 - so all three of his Bay-4 tasks are his.
 *     - "% scheduled inbounds received" (11/6 PT day): 2 of 10 = 20.0%.
 *     - "% scheduled outbounds loaded" (11/6 PT day): 9 of 40 = 22.5% (SHIPPED proxy).
 *     - Inbound/outbound mix: 4 RECEIVE / 3 LOAD of 7 active Bay-4 tasks.
 *     - Door occupancy duration is available only where a task with a startTime
 *       sits on the door (1 of 7 tasks, DOCK55); WMS has no occupancy-start field
 *       for task-less doors (16 of 23) and for NEW tasks that never started
 *       (5 tasks), so none is derived. DOCK50's started task is stale and is not
 *       given an open-ended duration either.
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
// NOT re-pulled in the 11/6 2:45p PT refresh (out of scope of the request). The
// array is left empty rather than carrying a stale result; Section 1 renders live
// from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 180 at the 11/6 ~2:45p PT pull (was 164).
export const plannedGurunandaOrderCount = 180;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/6 ~2:45p PT
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
    duration: "RECEIVE STARTED 10/21/25 1:21:14p PT and still returned as IN_PROGRESS although endTime is 10/22/25 10:42:01a PT (TASK-5090739, daira gonzalez, RN-5002143 which is itself already CLOSED) - stale status, so no open-ended duration is derived · dock OCCUPIED, space OCCUPIED, entry ET-1179714 (row updated 11/5 8:57p PT)",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1179748 (row updated 11/6 1:22p PT). The 3-load PRE_LOAD task that ran here, TASK-5413721, closed 11/6 1:20:36p PT under ARNULFO MUNGUIA (JESUS ESPINOZA carried it at the 11:47a pull), so the space is still flagged occupied with no task holding it · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414481"],
    duration: "LOAD NEW, not started (created 11/6 12:27:19p PT, TASK-5414481, ARNULFO MUNGUIA, ET-1180063, PRE_LOAD, 1 load (WINDOW_CHECKIN_DONE), LOAD-5043964 / 50145575 - DN-3441573; trailer 53173) - no startTime, so no duration basis · dock OCCUPIED, space OCCUPIED, entry ET-1180063 (row updated 11/6 12:27p PT). The two PRE_LOAD tasks that ran here overnight closed this morning - TASK-5413780 at 10:30:05a PT and TASK-5413720 at 10:33:00a PT, both under ARNULFO MUNGUIA",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1180029 (row updated 11/6 1:19p PT). The 1-load task that ran here, TASK-5414247, closed 11/6 11:36:31a PT under DANIEL BELTRAN (after the overnight TASK-5413406 closed 9:58:16a PT under ARNULFO MUNGUIA) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414475"],
    duration: "LOAD NEW, not started (created 11/6 12:20:42p PT, TASK-5414475, ARNULFO MUNGUIA, ET-1180061, PRE_LOAD, 3 loads (WINDOW_CHECKIN_DONE), LOAD-5043883 / 50139566 - DN-3443406; LOAD-5043821 / 50138673 - DN-3441492; LOAD-5043905 / 50140528 - DN-3443800; trailer 53443) - no startTime, so no duration basis · dock OCCUPIED, space OCCUPIED, entry ET-1180061 (row updated 11/6 12:20p PT). The 8-load task that ran here overnight, TASK-5413285, closed 11/6 9:11:40a PT under ARNULFO MUNGUIA",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414119"],
    duration: "LOAD 3h08m since 11/6 11:36:13a PT (TASK-5414119, ARNULFO MUNGUIA, ET-1179938, PRE_LOAD, 1 load (LOADING 1), LOAD-5043878 / 50139520 LOADING - DN-3443366; trailer 53284, dock check-in 11/6 11:36:17a PT) · dock OCCUPIED, space OCCUPIED, entry ET-1179938 (row updated 11/6 11:36a PT)",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1179912 (row updated 11/6 9:57a PT). The 1-load task that ran here, TASK-5414020, closed 11/6 9:57:23a PT under DANIEL BELTRAN · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1179934 (row updated 11/6 9:25a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1179901 (row updated 11/6 1:23p PT). The 4-load LIVE_LOAD task that ran here, TASK-5413982, closed 11/6 1:23:45p PT under DANIEL BELTRAN, so the space is still flagged occupied with no task holding it · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Reserved",
    assignee: "A1SG (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414270"],
    duration: "RECEIVE NEW, not started (created 11/6 10:51:19a PT, TASK-5414270, A1SG, ET-1179989, receipt RN-195229 / PO9518, container LEAFCHEM11062026, appointment 11/6 10:00a PT) - no startTime, so no duration basis · dock RESERVED, space OCCUPIED, entry ET-1180038 (row updated 11/6 12:00p PT). This door was OCCUPIED at the 11:47a pull; its earlier 1-load task TASK-5413966 closed 8:59:43a PT under DANIEL BELTRAN",
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
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1179831 (row updated 11/6 8:23a PT) · the overnight receive task TASK-5413838 (Fatima Ponce, RN-5011401) closed 11/6 8:23:27a PT and the dock cleared",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1176452 (row updated 11/5 6:20a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1179941 (row updated 11/6 12:40p PT) · the receive task TASK-5414129 (Fatima Ponce, RN-5011376, receivedStartTime 11/6 9:27:32a PT) closed 11/6 12:41:01p PT and the dock cleared - it was OCCUPIED at the 11:47a pull",
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
    status: "Reserved",
    assignee: "GONZALO RANGEL (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414174"],
    duration: "RECEIVE NEW, not started (created 11/6 9:43:54a PT, TASK-5414174, GONZALO RANGEL, ET-1179952, receipt RN-5011408 / PO TGHU6885258, seal SYA4543644, container TGHU6885258, appointment 11/6 10:00a PT) - no startTime, so no duration basis · dock RESERVED, space EMPTY, entry ET-1179892 (row updated 11/6 9:43a PT), i.e. the open NEW task has never held the door",
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
    duration: "RECEIVE NEW, not started (created 9/30 10:46:50a PT, TASK-5381972, Jorge Antonio Franco, ET-1162686, receipt RN-5010583 / PO9139-2, container Jpack09242026) - no startTime, so no duration basis · dock OCCUPIED, space EMPTY, entry ET-1171953 (row updated 11/6 9:53a PT), i.e. the open NEW task is not holding the door",
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

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 17
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 2
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 7
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 1
const available = doors.filter((d) => d.status === "Available").length; // 4

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors Occupied",
    value: `17/23`,
    numerator: 17,
    denominator: TOTAL_DOORS,
    percentage: Math.round((17 / TOTAL_DOORS) * 100),
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
// DOCK59, DOCK67.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, Nov 6 2026 ~2:45p PT).
// 7 active-status tasks at Bay 4 doors: 3 LOAD + 4 RECEIVE.
// ARNULFO MUNGUIA: 3 LOAD (DOCK52 TASK-5414481, DOCK54 TASK-5414475, DOCK55 TASK-5414119)
// A1SG: 1 RECEIVE (DOCK59 TASK-5414270, status NEW; name is the WMS
//   assigneeUserName verbatim)
// GONZALO RANGEL: 1 RECEIVE (DOCK67 TASK-5414174, status NEW)
// Jorge Antonio Franco: 1 RECEIVE (DOCK69 TASK-5381972, status NEW)
// daira gonzalez: 1 RECEIVE (DOCK50 TASK-5090739, status IN_PROGRESS, stale)
// All assigned names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 3 },
  { name: "A1SG", taskCount: 1 },
  { name: "GONZALO RANGEL", taskCount: 1 },
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

// Mix: 4 RECEIVE + 3 LOAD = 7 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 4, total: 7 },
  { label: "Outbound (LOAD)", count: 3, total: 7 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 3, total: 7 },
  { label: "Inbound", count: 4, total: 7 },
];

// --- Schedule Data (2026-11-06, Friday) ---
// % scheduled inbounds received TODAY: 10 GURUNANDA receipts carry an
//   appointmentTime inside the 11/6 PT business day (query window
//   appointmentTimeFrom "2026-11-06 00:00:00" -> appointmentTimeTo
//   "2026-11-06 23:59:59" returned totalCount 10). TWO of those receipts
//   carry a receivedStartTime = 20.0%:
//     - RN-5011376, appointment 9:00a PT, receivedStartTime 9:27:32a PT,
//       received on DOCK65 (receive task TASK-5414129 has since closed 12:41:01p PT)
//     - RN-5011383, appointment 9:00a PT, receivedStartTime 12:16:58p PT,
//       receipt status CLOSED (receive task TASK-5414458 closed 12:22:34p PT on DOCK16)
//   The remaining eight are still at status IMPORTED: RN-5011408 10:00a,
//   RN-5011407 10:00a, RN-195229 10:00a, RN-5011403 7:00a, RN-5011335 11:00p,
//   plus the three WILL CALL receipts created this afternoon with a
//   12:00a appointment (RN-195277 1:52p, RN-195278 2:07p, RN-195279 2:33p).
// % scheduled outbounds loaded TODAY: 40 GURUNANDA orders carry a scheduleDate
//   inside the 11/6 PT day (scheduleDatePeriod ["2026-11-06 00:00:00",
//   "2026-11-06 23:59:59"] returned totalCount 40). 9 of those orders are at
//   status SHIPPED (the "loaded" proxy defined by the prior refreshes) = 22.5%.
//   Remaining statuses on that day: PLANNED 18, PICKED 10, IMPORTED 1,
//   PACKED 1, COMMIT_FAILED 1. No order on 11/6 is at status LOADED.
//   NOTE: pulled at 14:45 PT, mid-afternoon, so both denominators are partial-day
//   populations and must not be read as a full-day service level.
export const scheduleAvailable = true;              // inbound denominator is 10 on 11/6
export const outboundScheduleAvailable = true;      // outbound denominator is 40 on 11/6
export const scheduledInboundOrders = 10;           // receipts with appointmentTime in the 11/6 PT day
export const scheduledOutboundOrders = 40;          // orders with scheduleDate in the 11/6 PT day
export const scheduledInboundReceived = 2;          // receipts with receivedStartTime in that set
export const scheduledOutboundLoaded = 9;           // orders at status SHIPPED in that set
export const pctScheduledInboundReceived = 20.0;    // 2 of 10 = 20.0%
export const pctScheduledOutboundLoaded = 22.5;     // 9 of 40 = 22.5%
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
// active task at this pull and 5 of the 7 tasks are NEW/not started, so a duration
// exists for only 1 door (DOCK55, 3h08m). DOCK50's started RECEIVE task is stale
// (endTime 10/22/25) and is deliberately left without an open-ended duration.
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Nov 6 2026 ~2:45p PT)
// 7 tasks total: 3 LOAD + 4 RECEIVE. All GURUNANDA, LLC.
// One is a data anomaly (TASK-5090739 on DOCK50 stale since 10/21/25).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA (userId 89) has 41 CLOSED GURUNANDA load transactions with endTime
// inside the 2026-10-30 00:00:00 - 2026-11-06 14:45 PT window (37 of them at Bay-4
// doors, spread over DOCK50 3, DOCK51 6, DOCK52 6, DOCK53 6, DOCK54 6, DOCK55 5,
// DOCK56 1, DOCK57 1, DOCK59 1, DOCK60 2; the other 4 are on DOCK5 2 and DOCK7 2);
// 7 of the transactions closed today (11/6 PT).
// The newest is DOCK51 TASK-5413721
// (started 11/5 4:21:50p PT, closed 11/6 1:20:36p PT; 3 loads,
// DN-3441639 / DN-3441103 / DN-3441056, seal 1303554, trailer 53402CT).
// He ALSO holds three open Bay-4 tasks at this pull: DOCK52 TASK-5414481 and
// DOCK54 TASK-5414475 (both NEW PRE_LOAD) and DOCK55 TASK-5414119
// (IN_PROGRESS, 1 load LOADING, DN-3443366).
export const assignments: TaskRecord[] = [
  // ----- INBOUND / RECEIVE (4) -----
  {
    taskId: "TASK-5414270",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/6 10:51:19a PT (A1SG; ET-1179989, RN-195229, PO9518, container LEAFCHEM11062026, appointment 11/6 10:00a PT) - task has no startTime",
    assignee: "A1SG",
    door: "DOCK59",
  },
  {
    taskId: "TASK-5414174",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/6 9:43:54a PT (GONZALO RANGEL; ET-1179952, RN-5011408, PO TGHU6885258, seal SYA4543644, container TGHU6885258, appointment 11/6 10:00a PT) - task has no startTime",
    assignee: "GONZALO RANGEL",
    door: "DOCK67",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/30 10:46:50a PT (Jorge Antonio Franco; ET-1162686, RN-5010583, PO9139-2, container Jpack09242026, no appointment) - task has no startTime",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 10/21/25 1:21:14p PT; status still IN_PROGRESS although endTime is 10/22/25 10:42:01a PT; daira gonzalez, ET-1027622, RN-5002143 which is itself already CLOSED)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },

  // ----- OUTBOUND / LOAD (3) -----
  {
    taskId: "TASK-5414481",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/6 12:27:19p PT (ARNULFO MUNGUIA; ET-1180063, PRE_LOAD, 1 load (WINDOW_CHECKIN_DONE), LOAD-5043964 / 50145575 - DN-3441573; trailer 53173) - task has no startTime",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5414475",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/6 12:20:42p PT (ARNULFO MUNGUIA; ET-1180061, PRE_LOAD, 3 loads (WINDOW_CHECKIN_DONE), LOAD-5043883 / 50139566 - DN-3443406; LOAD-5043821 / 50138673 - DN-3441492; LOAD-5043905 / 50140528 - DN-3443800; trailer 53443) - task has no startTime",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5414119",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 3h08m since 11/6 11:36:13a PT (ARNULFO MUNGUIA; ET-1179938, PRE_LOAD, 1 load (LOADING 1), LOAD-5043878 / 50139520 LOADING - DN-3443366; trailer 53284, dock check-in 11/6 11:36:17a PT)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK55",
  },
];
