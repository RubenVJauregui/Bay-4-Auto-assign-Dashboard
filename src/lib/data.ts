/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-06 11:47:00 PT (live WISE / WMS-BAM APIs)
 *   Sources (all read with item-time-zone America/Los_Angeles; WISE returns the
 *   dock/task/receipt/order timestamps as naive facility wall-clock values, so
 *   the strings below are already PT and no UTC->PT shift is applied):
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors, 23/23 rows
 *       returned (fresh dockStatus, spaceStatus, occupiedCustomerIds, entryId,
 *       updatedTime)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide totalCount 14); matched on dockName to
 *       the 23 Bay-4 docks -> 3 at Bay 4 doors (DOCK51, DOCK55, DOCK58)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide totalCount 19), same per-door
 *       dockName match -> 5 at Bay 4 doors (DOCK50, DOCK59, DOCK65, DOCK67, DOCK69)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To inside the 11/6 PT business day -> totalCount 7
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDatePeriod inside the 11/6 PT business day -> totalCount 33
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA CLOSED/FORCE_CLOSED
 *       load tasks for assigneeUserId 89 (ARNULFO MUNGUIA), endTime
 *       2026-10-30 00:00:00 - now, sorted endTime DESC
 *       -> 40 transactions (Arnulfo Assigned Activity stream), 36 at Bay-4 doors
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders at status
 *       PLANNED, no date filter -> totalCount 164 (planned-orders fallback)
 *   NOTE: door state is read from wms-location/search (dockStatus + spaceStatus),
 *   the same two status fields the dashboard already uses.
 *   NOTE: the load/receive task searches were filtered by customerIds only and
 *   matched to Bay-4 doors on the returned dockName field (dockId is also present
 *   but is a numeric location id, not the DOCKnn name).
 *   NOTE: the query shape used here is byte-identical to the prior refresh. This
 *   pull ran at 11:47 PT, i.e. mid-day on 11/6, so the 11/6 schedule
 *   denominators (7 inbounds / 33 outbounds) are still partial-day populations.
 *
 *   CONTEXT - 11/6 PT is a Friday. 7 GURUNANDA receipts carry an appointment on
 *   11/6; exactly ONE of them has a receivedStartTime (RN-5011376, 9:27:32a PT,
 *   received on DOCK65) = 14.3%. 33 GURUNANDA orders carry scheduleDate 11/6;
 *   4 are at status SHIPPED (the loaded proxy defined by the prior refreshes)
 *   = 12.1%. One further order sits at status LOADED, i.e. loaded but not yet
 *   shipped; it is NOT counted in the SHIPPED proxy, so the loaded-inclusive
 *   figure would be 5 of 33 = 15.2%.
 *
 *   Key changes from the prior refresh (11/6 ~7:11a PT -> 11/6 ~11:47a PT):
 *     - DOOR STATUS: 19/23 occupied (was 18), 1 reserved (DOCK67; was 2 -
 *       DOCK59 and DOCK65), 3 available (DOCK61, DOCK63, DOCK68; was DOCK61,
 *       DOCK67, DOCK68). Raw dockStatus=OCCUPIED is 14/23; 5 more doors
 *       (DOCK52, DOCK53, DOCK54, DOCK56, DOCK57) are space-occupied only with
 *       dockStatus AVAILABLE. DOCK59 and DOCK65 flipped reserved -> occupied;
 *       DOCK67 flipped available -> reserved; DOCK63 cleared to available when
 *       its overnight receive task closed.
 *     - TASK TURNOVER: five of the eight 7:11a tasks closed during the morning -
 *       DOCK52 TASK-5413720 (closed 10:33:00a PT), DOCK52 TASK-5413780
 *       (10:30:05a), DOCK53 TASK-5413406 (9:58:16a), DOCK54 TASK-5413285
 *       (9:11:40a) - all four closed under ARNULFO MUNGUIA - and DOCK63
 *       TASK-5413838 (DANIELA GONZALEZ). Four new tasks were opened:
 *       DOCK55 TASK-5414119 (ARNULFO MUNGUIA, 11:36:13a), DOCK58 TASK-5413982
 *       (DANIEL BELTRAN, 11:38:02a), DOCK59 TASK-5414270 (A1SG, NEW, 10:51:19a)
 *       and DOCK67 TASK-5414174 (GONZALO RANGEL, NEW, 9:43:54a). Only DOCK51
 *       TASK-5413721 (JESUS ESPINOZA), DOCK69 TASK-5381972 (Jorge Antonio
 *       Franco, NEW since 9/30) and the stale DOCK50 task carried over.
 *     - STALE ANOMALY: unchanged. TASK-5090739 (DOCK50, RECEIVE started
 *       10/21/25 1:21:14p PT) is still returned by the active-status query
 *       although its endTime is 10/22/25 10:42:01a PT. Its linked receipt
 *       RN-5002143 is already CLOSED.
 *     - Task "Guru live out / in assign to Arnulfo" still resolves to ARNULFO
 *       MUNGUIA GURUNANDA Bay 4 work. No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo"; the stream is read as the
 *       assignee's task assignment transactions and none is invented here.
 *       His assigned-activity pull (closed load tasks, endTime from 2026-10-30 00:00:00 PT)
 *       returns 40 transactions (36 at Bay-4 doors), 4 of them closed today
 *       (11/6 PT). The newest is DOCK5 TASK-5413814 (closed 11/6 11:40:36a PT,
 *       seal 1378487; not a Bay-4 door). He now ALSO holds a live Bay-4 task:
 *       DOCK55 TASK-5414119, started 11/6 11:36:13a PT.
 *     - "% scheduled inbounds received" (11/6 PT day): 1 of 7 = 14.3%.
 *     - "% scheduled outbounds loaded" (11/6 PT day): 4 of 33 = 12.1% (SHIPPED proxy).
 *     - Inbound/outbound mix: 5 RECEIVE / 3 LOAD of 8 active Bay-4 tasks.
 *     - Door occupancy duration is available only where a task with a startTime
 *       sits on the door (5 of 8 tasks); WMS has no occupancy-start field for
 *       task-less doors (15 of 23) and for NEW tasks that never started
 *       (3 tasks), so none is derived.
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
// NOT re-pulled in the 11/6 11:47a PT refresh (out of scope of the request). The
// array is left empty rather than carrying a stale result; Section 1 renders live
// from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 164 at the 11/6 ~11:47a PT pull (was 171).
export const plannedGurunandaOrderCount = 164;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/6 ~11:47a PT
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
    assignee: "JESUS ESPINOZA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5413721"],
    duration: "LOAD 19h26m since 11/5 4:21:50p PT (TASK-5413721, JESUS ESPINOZA, ET-1179748, PRE_LOAD, seal 1303554, 3 loads (LOADING 3), LOAD-5043824 / 50138679 LOADING - DN-3441639; LOAD-5043771 / 50135000 LOADING - DN-3441103; LOAD-5043768 / 50134943 LOADING - DN-3441056; trailer 53402CT, dock check-in 11/5 4:21:54p PT) · dock OCCUPIED, space OCCUPIED, entry ET-1179748 (row updated 11/5 8:57p PT)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1179787 (row updated 11/6 10:33a PT). The two PRE_LOAD tasks that ran here overnight closed this morning under ARNULFO MUNGUIA - TASK-5413780 at 11/6 10:30:05a PT and TASK-5413720 at 11/6 10:33:00a PT - so the space is still flagged occupied with no task holding it · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1179976 (row updated 11/6 11:37a PT). The PRE_LOAD task that ran here overnight, TASK-5413406, closed 11/6 9:58:16a PT under ARNULFO MUNGUIA · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1179604 (row updated 11/6 9:54a PT). The PRE_LOAD task that ran here overnight, TASK-5413285, closed 11/6 9:11:40a PT under ARNULFO MUNGUIA · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414119"],
    duration: "LOAD 11m since 11/6 11:36:13a PT (TASK-5414119, ARNULFO MUNGUIA, ET-1179938, PRE_LOAD, 1 load (LOADING 1), LOAD-5043878 / 50139520 LOADING - DN-3443366; trailer 53284, dock check-in 11/6 11:36:17a PT) · dock OCCUPIED, space OCCUPIED, entry ET-1179938 (row updated 11/6 11:36a PT)",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1179912 (row updated 11/6 9:57a PT) · no occupancy-start field in WMS",
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
    assignee: "DANIEL BELTRAN (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5413982"],
    duration: "LOAD 10m since 11/6 11:38:02a PT (TASK-5413982, DANIEL BELTRAN, ET-1179901, LIVE_LOAD, 4 loads (LOADING 4), LOAD-5043760 / 30285409 LOADING - DN-3430776; LOAD-5043759 / 30284085 LOADING - DN-3429302; LOAD-5043758 / 30283809 LOADING - DN-3429301; LOAD-5043757 / 30283403 LOADING - DN-3429298; trailer ALT05336, dock check-in 11/6 11:38:26a PT) · dock OCCUPIED, space OCCUPIED, entry ET-1179901 (row updated 11/6 11:38a PT)",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: "A1SG (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414270"],
    duration: "RECEIVE NEW, not started (created 11/6 10:51:19a PT, TASK-5414270, A1SG, ET-1179989, receipt RN-195229 / PO9518, container LEAFCHEM11062026, appointment 11/6 10:00a PT) - no startTime, so no duration basis · dock OCCUPIED, space OCCUPIED, entry ET-1179892 (row updated 11/6 11:16a PT). This door was RESERVED at the 7:11a pull",
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
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1179831 (row updated 11/6 8:23a PT) · the overnight receive task TASK-5413838 (DANIELA GONZALEZ, RN-5011401) has closed and the dock cleared",
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
    status: "Occupied",
    assignee: "Fatima Ponce (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414129"],
    duration: "RECEIVE 2h20m since 11/6 9:27:32a PT (TASK-5414129, Fatima Ponce, ET-1179941, RN-5011376, PO 9445, container CORRU110626UNIS, appointment 11/6 9:00a PT, receivedStartTime 11/6 9:27:32a PT - the only 11/6 appointment actually received so far; dock check-in 11/6 9:27:34a PT) · dock OCCUPIED, space EMPTY, entry ET-1179941 (row updated 11/6 9:27a PT). This door was RESERVED at the 7:11a pull",
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
    duration: "RECEIVE NEW, not started (created 11/6 9:43:54a PT, TASK-5414174, GONZALO RANGEL, ET-1179952, receipt RN-5011408 / PO TGHU6885258, seal SYA4543644, container TGHU6885258, appointment 11/6 10:00a PT) - no startTime, so no duration basis · dock RESERVED, space EMPTY, entry ET-1179892 (row updated 11/6 9:43a PT) - note the door row carries the same entryId as DOCK59, so the reservation and the truck entry are recorded against both rows",
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

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 19
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 1
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 8
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 1
const available = doors.filter((d) => d.status === "Available").length; // 3

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors Occupied",
    value: `19/23`,
    numerator: 19,
    denominator: TOTAL_DOORS,
    percentage: Math.round((19 / TOTAL_DOORS) * 100),
  },
  {
    label: "Doors w/ Active Tasks",
    value: `8`,
    numerator: 8,
    denominator: TOTAL_DOORS,
    percentage: Math.round((8 / TOTAL_DOORS) * 100),
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
// DOCK67.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, Nov 6 2026 ~11:47a PT).
// 8 active-status tasks at Bay 4 doors: 3 LOAD + 5 RECEIVE.
// ARNULFO MUNGUIA: 1 LOAD (DOCK55 TASK-5414119)
// DANIEL BELTRAN: 1 LOAD (DOCK58 TASK-5413982)
// JESUS ESPINOZA: 1 LOAD (DOCK51 TASK-5413721)
// A1SG: 1 RECEIVE (DOCK59 TASK-5414270, status NEW; name is the WMS
//   assigneeUserName verbatim)
// GONZALO RANGEL: 1 RECEIVE (DOCK67 TASK-5414174, status NEW)
// Fatima Ponce: 1 RECEIVE (DOCK65 TASK-5414129, status IN_PROGRESS)
// Jorge Antonio Franco: 1 RECEIVE (DOCK69 TASK-5381972, status NEW)
// daira gonzalez: 1 RECEIVE (DOCK50 TASK-5090739, status IN_PROGRESS, stale)
// All assigned names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 1 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "JESUS ESPINOZA", taskCount: 1 },
  { name: "A1SG", taskCount: 1 },
  { name: "GONZALO RANGEL", taskCount: 1 },
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

// Mix: 5 RECEIVE + 3 LOAD = 8 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 5, total: 8 },
  { label: "Outbound (LOAD)", count: 3, total: 8 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 3, total: 8 },
  { label: "Inbound", count: 5, total: 8 },
];

// --- Schedule Data (2026-11-06, Friday) ---
// % scheduled inbounds received TODAY: 7 GURUNANDA receipts carry an
//   appointmentTime inside the 11/6 PT business day (query window
//   appointmentTimeFrom "2026-11-06 00:00:00" -> appointmentTimeTo
//   "2026-11-06 23:59:59" returned totalCount 7). Exactly ONE of those receipts
//   carries a receivedStartTime = 14.3% (RN-5011376, appointment 9:00a PT,
//   receivedStartTime 9:27:32a PT, received on DOCK65). The remaining six are
//   still at status IMPORTED (RN-5011408 10:00a, RN-5011407 10:00a,
//   RN-195229 10:00a, RN-5011403 7:00a, RN-5011383 9:00a, RN-5011335 11:00p).
// % scheduled outbounds loaded TODAY: 33 GURUNANDA orders carry a scheduleDate
//   inside the 11/6 PT day (scheduleDatePeriod ["2026-11-06 00:00:00",
//   "2026-11-06 23:59:59"] returned totalCount 33). 4 of those orders are at
//   status SHIPPED (the "loaded" proxy defined by the prior refreshes) = 12.1%.
//   Remaining statuses on that day: PICKED 12, PLANNED 8, IMPORTED 5, LOADED 1,
//   PACKED 1, LOADING 1, COMMIT_FAILED 1.
//   The single LOADED order is loaded but not yet shipped and is not counted in
//   the SHIPPED proxy; loaded-inclusive would be 5 of 33 = 15.2%.
//   NOTE: pulled at 11:47 PT, mid-day, so both denominators are partial-day
//   populations and must not be read as a full-day service level.
export const scheduleAvailable = true;              // inbound denominator is 7 on 11/6
export const outboundScheduleAvailable = true;      // outbound denominator is 33 on 11/6
export const scheduledInboundOrders = 7;            // receipts with appointmentTime in the 11/6 PT day
export const scheduledOutboundOrders = 33;          // orders with scheduleDate in the 11/6 PT day
export const scheduledInboundReceived = 1;          // receipts with receivedStartTime in that set
export const scheduledOutboundLoaded = 4;           // orders at status SHIPPED in that set
export const pctScheduledInboundReceived = 14.3;    // 1 of 7 = 14.3%
export const pctScheduledOutboundLoaded = 12.1;     // 4 of 33 = 12.1%
// Facility-wide appointment context - unavailable (GURUNANDA-scoped queries only;
// no all-customer facility-wide appointment totals were pulled for this refresh).
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime where a task exists on the
// door and has actually started; unavailable for task-less doors and for NEW tasks
// with no startTime (no occupancy-start field in WMS, and the dock-door-status
// dashboard endpoint returns an empty Duration column). 15 of 23 doors carry no
// active task at this pull and 3 of the 8 tasks are NEW/not started, so durations
// exist for only 5 doors (DOCK50 stale-pair, DOCK51, DOCK55, DOCK58, DOCK65).
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Nov 6 2026 ~11:47a PT)
// 8 tasks total: 3 LOAD + 5 RECEIVE. All GURUNANDA, LLC.
// One is a data anomaly (TASK-5090739 on DOCK50 stale since 10/21/25).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA (userId 89) has 40 CLOSED GURUNANDA load transactions with endTime
// inside the 2026-10-30 00:00:00 - 2026-11-06 11:47 PT window (36 of them at Bay-4
// doors, spread over DOCK50 3, DOCK51 5, DOCK52 6, DOCK53 6, DOCK54 6, DOCK55 5,
// DOCK56 1, DOCK57 1, DOCK59 1, DOCK60 2; the other 4 are on DOCK5 and DOCK7);
// 4 of the Bay-4 transactions closed today (11/6 PT) and 11 closed on 11/4.
// The newest is DOCK5 TASK-5413814
// (started 11/5 8:54:21p PT, closed 11/6 11:40:36a PT; 1 load, DN-3441104, seal 1378487).
// He ALSO holds one open Bay-4 task at this pull: DOCK55 TASK-5414119
// (PRE_LOAD, 1 load LOADING, DN-3443366, started 11/6 11:36:13a PT).
export const assignments: TaskRecord[] = [
  // ----- INBOUND / RECEIVE (5) -----
  {
    taskId: "TASK-5414129",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 2h20m since 11/6 9:27:32a PT (Fatima Ponce; ET-1179941, RN-5011376, PO 9445, container CORRU110626UNIS, appointment 11/6 9:00a PT, receivedStartTime 11/6 9:27:32a PT; dock check-in 11/6 9:27:34a PT)",
    assignee: "Fatima Ponce",
    door: "DOCK65",
  },
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
    taskId: "TASK-5414119",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 11m since 11/6 11:36:13a PT (ARNULFO MUNGUIA; ET-1179938, PRE_LOAD, 1 load (LOADING 1), LOAD-5043878 / 50139520 LOADING - DN-3443366; trailer 53284, dock check-in 11/6 11:36:17a PT)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5413982",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 10m since 11/6 11:38:02a PT (DANIEL BELTRAN; ET-1179901, LIVE_LOAD, 4 loads (LOADING 4), LOAD-5043760 / 30285409 LOADING - DN-3430776; LOAD-5043759 / 30284085 LOADING - DN-3429302; LOAD-5043758 / 30283809 LOADING - DN-3429301; LOAD-5043757 / 30283403 LOADING - DN-3429298; trailer ALT05336, dock check-in 11/6 11:38:26a PT)",
    assignee: "DANIEL BELTRAN",
    door: "DOCK58",
  },
  {
    taskId: "TASK-5413721",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 19h26m since 11/5 4:21:50p PT (JESUS ESPINOZA; ET-1179748, PRE_LOAD, seal 1303554, 3 loads (LOADING 3), LOAD-5043824 / 50138679 LOADING - DN-3441639; LOAD-5043771 / 50135000 LOADING - DN-3441103; LOAD-5043768 / 50134943 LOADING - DN-3441056; trailer 53402CT, dock check-in 11/5 4:21:54p PT)",
    assignee: "JESUS ESPINOZA",
    door: "DOCK51",
  },
];