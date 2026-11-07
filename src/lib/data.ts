/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-07 07:18:00 PT (live WISE / WMS-BAM APIs)
 *   Sources (all read with item-time-zone America/Los_Angeles; WISE returns the
 *   dock/task/receipt/order timestamps as naive facility wall-clock values, so
 *   the strings below are already PT and no UTC->PT shift is applied):
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors, 23/23 rows
 *       returned (fresh dockStatus, spaceStatus, occupiedCustomerIds, entryId,
 *       updatedTime)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide totalCount 13); matched on dockName to
 *       the 23 Bay-4 docks -> 3 at Bay 4 doors (DOCK52, DOCK54, DOCK55)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide totalCount 19), same per-door
 *       dockName match -> 7 at Bay 4 doors (DOCK50, DOCK59, DOCK61, DOCK62,
 *       DOCK63, DOCK67, DOCK69)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To inside the 11/7 PT business day -> totalCount 0
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDatePeriod inside the 11/7 PT business day -> totalCount 0
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA CLOSED/FORCE_CLOSED
 *       load tasks for assigneeUserId 89 (ARNULFO MUNGUIA), endTime
 *       2026-10-31 00:00:00 - now, sorted endTime DESC
 *       -> 36 transactions (Arnulfo Assigned Activity stream), 32 at Bay-4 doors
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders at status
 *       PLANNED, no date filter -> totalCount 160 (planned-orders fallback)
 *     - /wms-bam/inbound/receipt/search-by-paging + /wms-bam/outbound/order/
 *       search-by-paging on the PRIOR business day (11/6 PT) -> 10 receipts /
 *       44 orders, used only as documented context for the empty 11/7 schedule
 *     - /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/
 *       search-by-paging - CLOSED/FORCE_CLOSED tasks with endTime after the prior
 *       published pull (2026-11-06 14:45 PT) and inside the 11/7 PT day
 *       -> 2 load closures (1 at Bay 4) + 1 receive closure (1 at Bay 4) since
 *       11/6 2:45p PT, and ZERO load or receive closures inside the 11/7 PT day
 *   NOTE: door state is read from wms-location/search (dockStatus + spaceStatus),
 *   the same two status fields the dashboard already uses.
 *   NOTE: the load/receive task searches were filtered by customerIds only and
 *   matched to Bay-4 doors on the returned dockName field (dockId is also present
 *   but is a numeric location id, not the DOCKnn name).
 *   NOTE: the query shape used here is byte-identical to the prior refresh. This
 *   pull ran at 07:18 PT on a Saturday, before any 11/7 work started, so WISE
 *   contains no 11/7 activity yet: the newest closed load task is 11/6 5:00:51p PT
 *   and the newest closed receive task is 11/6 5:09:25p PT.
 *
 *   CONTEXT - 11/7 PT is a Saturday and NO GURUNANDA volume is scheduled on it:
 *   0 receipts carry an 11/7 appointmentTime and 0 orders carry an 11/7
 *   scheduleDate, so both schedule percentages have a zero denominator and are
 *   reported as NOT APPLICABLE here (scheduleAvailable / outboundScheduleAvailable
 *   are false) rather than as 0%. For reference, the prior business day (11/6,
 *   Friday) finished with 10 receipts / 4 received (40.0%) and 44 orders / 9
 *   SHIPPED (20.5%); the next scheduled day (11/9, Monday) currently carries 105
 *   orders and 1 receipt with an appointment. None of those figures is substituted
 *   into the 11/7 metrics below.
 *
 *   Key changes from the prior refresh (11/6 ~2:45p PT -> 11/7 ~7:18a PT):
 *     - DOOR STATUS: 20/23 occupied (was 17), 2 reserved (DOCK59, DOCK67; was 2),
 *       1 available (DOCK70; was DOCK61, DOCK63, DOCK65, DOCK68). Raw
 *       dockStatus=OCCUPIED is 18/23; DOCK57 and DOCK58 are space-occupied only
 *       with dockStatus AVAILABLE. The DOCK50-DOCK56, DOCK60, DOCK65, DOCK66,
 *       DOCK68, DOCK69, DOCK71 and DOCK72 rows were re-stamped 11/7 00:36-00:39 PT
 *       by the nightly location sweep; DOCK57/58/61/62/63/64 still carry their
 *       11/5-11/6 stamps.
 *     - TASK TURNOVER: all seven Bay-4 tasks present at the 11/6 2:45p PT pull are
 *       still on their doors, but three NEW receive tasks opened on Bay-4 doors
 *       during the evening of 11/6, all under DANIELA GONZALEZ: DOCK63
 *       TASK-5414772 (created 4:29:09p, started 4:43:57p), DOCK61 TASK-5414777
 *       (created 5:51:05p, started 5:51:46p) and DOCK62 TASK-5414773 (created
 *       4:32:33p, started 6:08:57p). Two closures since 2:45p touched Bay-4
 *       doors, neither of them one of the seven: DOCK54 TASK-5376769 (ARNULFO
 *       MUNGUIA, a 2-load task started 9/24/25, closed 5:00:51p) and the DOCK58
 *       receive task TASK-5414761 (DANIELA GONZALEZ, closed 5:09:25p). DOCK52's
 *       TASK-5414481 also moved NEW -> IN_PROGRESS (started 2:55:07p) and carries
 *       a task endTime of 3:31:51p. Net: 7 active Bay-4 tasks -> 10
 *       (3 LOAD + 7 RECEIVE).
 *     - STALE ANOMALIES: TWO now, both the same shape (active status with an
 *       endTime already set). (1) Unchanged: TASK-5090739 (DOCK50, RECEIVE
 *       started 10/21/25 1:21:14p PT) is still returned by the active-status
 *       query although its endTime is 10/22/25 10:42:01a PT; its linked receipt
 *       RN-5002143 is already CLOSED. (2) NEW: TASK-5414481 (DOCK52, LOAD) reads
 *       IN_PROGRESS although endTime is 11/6 3:31:51p PT and its only load
 *       LOAD-5043964 is already LOADED/SHIPPED-bound; it is left flagged, not
 *       given an open-ended duration.
 *     - Task "Guru live out / in assign to Arnulfo" still resolves to ARNULFO
 *       MUNGUIA GURUNANDA Bay 4 work. No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo"; the stream is read as the
 *       assignee's task assignment transactions and none is invented here.
 *       His assigned-activity pull (closed load tasks, endTime from 2026-10-31 00:00:00 PT)
 *       returns 36 transactions (32 at Bay-4 doors), 0 of them closed today
 *       (11/7 PT) and 8 closed on 11/6 PT. The newest is DOCK54 TASK-5376769
 *       (started 9/24/25, closed 11/6 5:00:51p PT, 2 loads, seal 24800361). He
 *       still holds all three of his open Bay-4 load tasks: DOCK52 TASK-5414481,
 *       DOCK54 TASK-5414475 and DOCK55 TASK-5414119.
 *     - "% scheduled inbounds received" (11/7 PT day): NOT APPLICABLE - 0 GURUNANDA
 *       receipts carry a 11/7 appointment.
 *     - "% scheduled outbounds loaded" (11/7 PT day): NOT APPLICABLE - 0 GURUNANDA
 *       orders carry a 11/7 scheduleDate.
 *     - Inbound/outbound mix: 7 RECEIVE / 3 LOAD of 10 active Bay-4 tasks.
 *     - Door occupancy duration is available only where a task with a startTime
 *       sits on the door and has not already ended: 5 of 10 tasks (DOCK54, DOCK55,
 *       DOCK61, DOCK62, DOCK63). WMS has no occupancy-start field for task-less
 *       doors (13 of 23) and for NEW tasks that never started (3 tasks), so none
 *       is derived. DOCK50's and DOCK52's started tasks are stale and are not
 *       given open-ended durations either.
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
// NOT re-pulled in the 11/7 7:18a PT refresh (out of scope of the request). The
// array is left empty rather than carrying a stale result; Section 1 renders live
// from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 160 at the 11/7 ~7:18a PT pull (was 180).
export const plannedGurunandaOrderCount = 160;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/7 ~7:18a PT
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
    duration: "RECEIVE STARTED 10/21/25 1:21:14p PT and still returned as IN_PROGRESS although endTime is 10/22/25 10:42:01a PT (TASK-5090739, daira gonzalez, RN-5002143 which is itself already CLOSED) - stale status, so no open-ended duration is derived · dock OCCUPIED, space OCCUPIED, entry ET-1179714 (row updated 11/7 12:39a PT)",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, entry ET-1179748 (row updated 11/7 12:38a PT). The 3-load PRE_LOAD task that ran here, TASK-5413721, closed 11/6 1:20:36p PT under ARNULFO MUNGUIA, so the space is still flagged occupied with no task holding it · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD - STALE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414481"],
    duration: "LOAD 37m since 11/6 2:55:07p PT to its task endTime 3:31:51p PT, although TASK-5414481 still reads IN_PROGRESS with its only load LOAD-5043964 / 50145575 already LOADED (ARNULFO MUNGUIA, ET-1180063, PRE_LOAD, DN-3441573; seal 25079925, seal set 11/6 3:31p PT) - closed-out-but-still-open task, so no open-ended duration is derived · dock OCCUPIED, space EMPTY, entry ET-1180063 (row updated 11/7 12:38a PT). The two PRE_LOAD tasks that ran here earlier, TASK-5413780 (10:30:05a) and TASK-5413720 (10:33:00a), closed 11/6 under ARNULFO MUNGUIA",
    anomaly: true,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, entry ET-1180029 (row updated 11/7 12:38a PT). The 1-load task that ran here, TASK-5414247, closed 11/6 11:36:31a PT under DANIEL BELTRAN · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414475"],
    duration: "LOAD 15h34m since 11/6 3:43:10p PT (TASK-5414475, ARNULFO MUNGUIA, ET-1180061, PRE_LOAD, 4 loads: LOAD-5043905 / 50140528 LOADED, LOAD-5043883 / 50139566 LOADED, LOAD-5043821 / 50138673 LOADED, LOAD-5043906 / 50140530 WINDOW_CHECKIN_DONE; seal 24800363) · dock OCCUPIED, space OCCUPIED, entry ET-1180061 (row updated 11/7 12:38a PT). The long-running 2-load task that preceded it here, TASK-5376769 (started 9/24/25), closed 11/6 5:00:51p PT under ARNULFO MUNGUIA",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414119"],
    duration: "LOAD 19h41m since 11/6 11:36:13a PT (TASK-5414119, ARNULFO MUNGUIA, ET-1179938, PRE_LOAD, 3 loads: LOAD-5043892 / 50139610 WINDOW_CHECKIN_DONE, LOAD-5043878 / 50139520 LOADED - DN-3443366, LOAD-5043907 / 50140532 WINDOW_CHECKIN_DONE; seal 24800386) · dock OCCUPIED, space OCCUPIED, entry ET-1179938 (row updated 11/7 12:37a PT)",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, entry ET-1179912 (row updated 11/7 12:37a PT). The 1-load task that ran here, TASK-5414020, closed 11/6 9:57:23a PT under DANIEL BELTRAN · no occupancy-start field in WMS",
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
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1180159 (row updated 11/6 5:09p PT). The receive task that ran here, TASK-5414761 (DANIELA GONZALEZ), closed 11/6 5:09:25p PT, so the space is still flagged occupied with no task holding it; the 4-load LIVE_LOAD task TASK-5413982 (DANIEL BELTRAN) had closed 11/6 1:23:45p PT · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Reserved",
    assignee: "A1SG (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414270"],
    duration: "RECEIVE NEW, not started (created 11/6 10:51:19a PT, TASK-5414270, A1SG, ET-1179989, receipt RN-195229 / PO9518, container LEAFCHEM11062026, appointment 11/6 10:00a PT) - no startTime, so no duration basis · dock RESERVED, space OCCUPIED, entry ET-1180038 (row updated 11/6 12:00p PT). Still the same task the dormant reservation carried at the prior pull; its earlier 1-load task TASK-5413966 closed 11/6 8:59:43a PT under DANIEL BELTRAN",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, entry ET-1179653 (row updated 11/7 12:37a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414777"],
    duration: "RECEIVE 13h26m since 11/6 5:51:46p PT (TASK-5414777, DANIELA GONZALEZ, ET-1180178, receipt RN-5011407 - the 10:00a PT 11/6 appointment that was still IMPORTED at the prior pull and is now received) · dock OCCUPIED, space EMPTY, entry ET-1180178 (row updated 11/6 5:51p PT)",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414773"],
    duration: "RECEIVE 13h09m since 11/6 6:08:57p PT (TASK-5414773, DANIELA GONZALEZ, ET-1180167, receipt RN-5011402) · dock OCCUPIED, space EMPTY, entry ET-1180167 (row updated 11/6 6:08p PT)",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414772"],
    duration: "RECEIVE 14h34m since 11/6 4:43:57p PT (TASK-5414772, DANIELA GONZALEZ, ET-1180165, receipt RN-5011413) · dock OCCUPIED, space EMPTY, entry ET-1180165 (row updated 11/6 4:43p PT). The overnight receive task that ran here, TASK-5413838 (Fatima Ponce, RN-5011401), closed 11/6 8:23:27a PT",
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
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1179941 (row updated 11/7 12:36a PT). This door was AVAILABLE at the prior pull after TASK-5414129 closed 11/6 12:41:01p PT; the door flag is OCCUPIED again with no task on it · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1173309 (row updated 11/7 12:36a PT) · no occupancy-start field in WMS",
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
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1177841 (row updated 11/7 12:36a PT). This door was AVAILABLE at the prior pull; the door flag is OCCUPIED again with no task on it · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW, not started (created 9/30 10:46:50a PT, TASK-5381972, Jorge Antonio Franco, ET-1162686, receipt RN-5010583 / PO9139-2, container Jpack09242026) - no startTime, so no duration basis · dock OCCUPIED, space EMPTY, entry ET-1171953 (row updated 11/7 12:36a PT), i.e. the open NEW task is not holding the door",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1172826 (row updated 11/6 3:43p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1176765 (row updated 11/7 12:36a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1176051 (row updated 11/7 12:36a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 20
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 2
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 10
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 2
const available = doors.filter((d) => d.status === "Available").length; // 1

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors Occupied",
    value: `20/23`,
    numerator: 20,
    denominator: TOTAL_DOORS,
    percentage: Math.round((20 / TOTAL_DOORS) * 100),
  },
  {
    label: "Doors w/ Active Tasks",
    value: `10`,
    numerator: 10,
    denominator: TOTAL_DOORS,
    percentage: Math.round((10 / TOTAL_DOORS) * 100),
  },
  {
    label: "Doors Available",
    value: `1`,
    numerator: 1,
    denominator: TOTAL_DOORS,
    percentage: Math.round((1 / TOTAL_DOORS) * 100),
  },
  {
    label: "Anomalies",
    value: `2`,
    numerator: 2,
    denominator: TOTAL_DOORS,
    percentage: Math.round((2 / TOTAL_DOORS) * 100),
  },
];

// Doors that carried dockStatus RESERVED at this pull:
// DOCK59, DOCK67.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, Nov 7 2026 ~7:18a PT).
// 10 active-status tasks at Bay 4 doors: 3 LOAD + 7 RECEIVE.
// ARNULFO MUNGUIA: 3 LOAD (DOCK52 TASK-5414481, DOCK54 TASK-5414475,
//   DOCK55 TASK-5414119)
// DANIELA GONZALEZ: 3 RECEIVE (DOCK61 TASK-5414777, DOCK62 TASK-5414773,
//   DOCK63 TASK-5414772 - all IN_PROGRESS)
// A1SG: 1 RECEIVE (DOCK59 TASK-5414270, status NEW; name is the WMS
//   assigneeUserName verbatim)
// GONZALO RANGEL: 1 RECEIVE (DOCK67 TASK-5414174, status NEW)
// Jorge Antonio Franco: 1 RECEIVE (DOCK69 TASK-5381972, status NEW)
// daira gonzalez: 1 RECEIVE (DOCK50 TASK-5090739, status IN_PROGRESS, stale)
// All assigned names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 3 },
  { name: "DANIELA GONZALEZ", taskCount: 3 },
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

// Mix: 7 RECEIVE + 3 LOAD = 10 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 7, total: 10 },
  { label: "Outbound (LOAD)", count: 3, total: 10 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 3, total: 10 },
  { label: "Inbound", count: 7, total: 10 },
];

// --- Schedule Data (2026-11-07, Saturday) ---
// NOT APPLICABLE TODAY: there is no GURUNANDA schedule on 11/7 PT.
//   % scheduled inbounds received TODAY: 0 GURUNANDA receipts carry an
//   appointmentTime inside the 11/7 PT business day (query window
//   appointmentTimeFrom "2026-11-07 00:00:00" -> appointmentTimeTo
//   "2026-11-07 23:59:59" returned totalCount 0), so the denominator is zero and
//   the percentage is undefined. It is reported as N/A (scheduleAvailable=false)
//   rather than as 0%.
//   % scheduled outbounds loaded TODAY: 0 GURUNANDA orders carry a scheduleDate
//   inside the 11/7 PT day (scheduleDatePeriod ["2026-11-07 00:00:00",
//   "2026-11-07 23:59:59"] returned totalCount 0) - same zero-denominator case,
//   reported as N/A (outboundScheduleAvailable=false).
//   CONTEXT ONLY (not substituted into today's metrics): the prior business day
//   11/6 (Friday) closed with 10 receipts of which 4 carry a receivedStartTime
//   (RN-5011407 5:51:46p, RN-5011403 4:04:04p, RN-5011383 12:16:58p, RN-5011376
//   9:27:32a) = 40.0%, and 44 orders of which 9 are at status SHIPPED = 20.5%
//   (remaining 11/6 statuses: PLANNED 22, PICKED 9, COMMIT_FAILED 2, PACKED 1,
//   PARTIAL_SHIPPED 1). The next scheduled day, 11/9 (Monday), currently carries
//   105 orders and 1 receipt with an appointment.
export const scheduleAvailable = false;             // no GURUNANDA receipts scheduled on 11/7
export const outboundScheduleAvailable = false;     // no GURUNANDA orders scheduled on 11/7
export const scheduledInboundOrders = 0;            // receipts with appointmentTime in the 11/7 PT day
export const scheduledOutboundOrders = 0;           // orders with scheduleDate in the 11/7 PT day
export const scheduledInboundReceived = 0;          // receipts with receivedStartTime in that (empty) set
export const scheduledOutboundLoaded = 0;           // orders at status SHIPPED in that (empty) set
export const pctScheduledInboundReceived = 0;       // 0 of 0 - undefined, surfaced as N/A via scheduleAvailable
export const pctScheduledOutboundLoaded = 0;        // 0 of 0 - undefined, surfaced as N/A via outboundScheduleAvailable
// Facility-wide appointment context - unavailable (GURUNANDA-scoped queries only;
// no all-customer facility-wide appointment totals were pulled for this refresh).
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime where a task exists on the
// door and has actually started and has not already ended; unavailable for
// task-less doors and for NEW tasks with no startTime (no occupancy-start field in
// WMS, and the dock-door-status dashboard endpoint returns an empty Duration
// column). 13 of 23 doors carry no active task at this pull, 3 of the 10 tasks are
// NEW/not started and 2 are stale (DOCK50, DOCK52), so a duration exists for 5
// doors (DOCK54 15h34m, DOCK55 19h41m, DOCK61 13h26m, DOCK62 13h09m, DOCK63
// 14h34m).
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Nov 7 2026 ~7:18a PT)
// 10 tasks total: 3 LOAD + 7 RECEIVE. All GURUNANDA, LLC.
// Two are data anomalies (TASK-5090739 on DOCK50 stale since 10/21/25, and
// TASK-5414481 on DOCK52 still IN_PROGRESS with an endTime of 11/6 3:31:51p PT).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA (userId 89) has 36 CLOSED GURUNANDA load transactions with endTime
// inside the 2026-10-31 00:00:00 - 2026-11-07 07:18 PT window (32 of them at Bay-4
// doors, spread over DOCK54 6, DOCK51 6, DOCK52 5, DOCK53 4, DOCK55 4, DOCK50 2,
// DOCK60 2, DOCK56 1, DOCK57 1, DOCK59 1; the other 4 are on DOCK5 2 and DOCK7 2);
// 0 of the transactions closed today (11/7 PT) and 8 closed on 11/6 PT.
// The newest is DOCK54 TASK-5376769
// (started 9/24/25 2:50:27p PT, closed 11/6 5:00:51p PT; 2 loads,
// DN-3364395 / DN-3360300, seal 24800361).
// He ALSO holds three open Bay-4 tasks at this pull, all three of his are his:
// DOCK52 TASK-5414481 (IN_PROGRESS/LOADED but stale-ended), DOCK54 TASK-5414475
// (IN_PROGRESS, 3 of 4 loads LOADED) and DOCK55 TASK-5414119 (IN_PROGRESS, 1 of
// 3 loads LOADED - DN-3443366).
export const assignments: TaskRecord[] = [
  // ----- INBOUND / RECEIVE (7) -----
  {
    taskId: "TASK-5414777",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 13h26m since 11/6 5:51:46p PT (DANIELA GONZALEZ; ET-1180178, receipt RN-5011407 - 11/6 10:00a PT appointment, the first of the day's IMPORTED appointments to be received)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK61",
  },
  {
    taskId: "TASK-5414773",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 13h09m since 11/6 6:08:57p PT (DANIELA GONZALEZ; ET-1180167, receipt RN-5011402)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK62",
  },
  {
    taskId: "TASK-5414772",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 14h34m since 11/6 4:43:57p PT (DANIELA GONZALEZ; ET-1180165, receipt RN-5011413)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK63",
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
    taskId: "TASK-5414481",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STARTED 11/6 2:55:07p PT, task endTime 11/6 3:31:51p PT (37m) but status still IN_PROGRESS (ARNULFO MUNGUIA; ET-1180063, PRE_LOAD, 1 load LOAD-5043964 / 50145575 LOADED - DN-3441573; seal 25079925)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5414475",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 15h34m since 11/6 3:43:10p PT (ARNULFO MUNGUIA; ET-1180061, PRE_LOAD, 4 loads: LOAD-5043905 / 50140528 LOADED - DN-3443800; LOAD-5043883 / 50139566 LOADED - DN-3443406; LOAD-5043821 / 50138673 LOADED - DN-3441492; LOAD-5043906 / 50140530 WINDOW_CHECKIN_DONE - DN-3443740; seal 24800363)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5414119",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 19h41m since 11/6 11:36:13a PT (ARNULFO MUNGUIA; ET-1179938, PRE_LOAD, 3 loads: LOAD-5043892 / 50139610 WINDOW_CHECKIN_DONE - DN-3443274; LOAD-5043878 / 50139520 LOADED - DN-3443366; LOAD-5043907 / 50140532 WINDOW_CHECKIN_DONE - DN-3443725; seal 24800386)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK55",
  },
];
