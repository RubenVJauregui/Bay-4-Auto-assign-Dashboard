/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-08 18:40:00 PT (live WISE / WMS-BAM APIs)
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
 *       appointmentTimeFrom/To inside the 11/8 PT business day -> totalCount 0
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDatePeriod inside the 11/8 PT business day -> totalCount 0
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA CLOSED/FORCE_CLOSED
 *       load tasks for assigneeUserId 89 (ARNULFO MUNGUIA), endTime
 *       2026-10-31 00:00:00 - now, sorted endTime DESC
 *       -> 36 transactions (Arnulfo Assigned Activity stream), 32 at Bay-4 doors
 *     - /wms-bam/outbound/load-task/search-by-paging - facility-wide CLOSED/
 *       FORCE_CLOSED load tasks with endTimeFrom 2026-11-07 00:00:00 -> totalCount
 *       0, and with endTimeFrom 2026-11-08 00:00:00 -> totalCount 0, so no load
 *       task has closed anywhere in the facility on 11/7 or 11/8 PT. Read
 *       facility-wide (all customers) and sorted endTime DESC, the newest load
 *       closure is 11/6 6:19:43p PT (DOCK32 TASK-5414723, ORG-738412).
 *     - /wms-bam/inbound/receive-task/search-by-paging - GURUNANDA CLOSED/
 *       FORCE_CLOSED receive tasks sorted endTime DESC. NOTE: this endpoint
 *       ignores endTimeFrom (an endTimeFrom 2026-11-07 query still returns the
 *       full 3019-row history), so the stream was read from the top of the DESC
 *       sort instead: the newest GURUNANDA receive closure is 11/6 5:09:25p PT
 *       (DOCK58 TASK-5414761, DANIELA GONZALEZ), i.e. 0 receive closures inside
 *       the 11/7 or 11/8 PT days.
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders at status
 *       PLANNED, no date filter -> totalCount 160 (planned-orders fallback)
 *     - /wms-bam/inbound/receipt/search-by-paging - receiptIds lookup for the seven
 *       receipts held by live Bay-4 tasks, to re-confirm status/appointment/PO/
 *       container/seal rather than carry those fields forward unverified
 *   NOTE: door state is read from wms-location/search (dockStatus + spaceStatus),
 *   the same two status fields the dashboard already uses.
 *   NOTE: the load/receive task searches were filtered by customerIds only and
 *   matched to Bay-4 doors on the returned dockName field (dockId is also present
 *   but is a numeric location id, not the DOCKnn name).
 *   NOTE: the query shape used here is byte-identical to the prior refresh. This
 *   pull ran at 18:40 PT on Sunday 11/8, ~8h00m after the 11/8 10:40 PT pull.
 *   WISE still contains no weekend activity: the newest closed load task is 11/6
 *   6:19:43p PT and the newest closed GURUNANDA receive task is 11/6 5:09:25p PT.
 *   The percentage queries were re-validated against days that DO carry volume
 *   (11/5: 8 receipts / 42 orders; 11/6: 10 receipts / 44 orders; 11/9: 1 receipt
 *   / 105 orders; 11/10: 0 receipts / 21 orders) so the 11/8 zero is a real zero,
 *   not a broken filter.
 *
 *   CONTEXT - 11/8 PT is a Sunday and NO GURUNANDA volume is scheduled on it:
 *   0 receipts carry an 11/8 appointmentTime and 0 orders carry an 11/8
 *   scheduleDate, so both schedule percentages have a zero denominator and are
 *   reported as NOT APPLICABLE here (scheduleAvailable / outboundScheduleAvailable
 *   are false) rather than as 0%. 11/7 (Saturday) likewise closed with 0 receipts
 *   and 0 orders scheduled. For reference, the prior business day (11/6, Friday)
 *   finished with 10 receipts / 4 received (40.0%) and 44 orders / 9 SHIPPED
 *   (20.5%); the next scheduled day (11/9, Monday) currently carries 105 orders
 *   and 1 receipt with an appointment. None of those figures is substituted into
 *   the 11/8 metrics below.
 *
 *   Key changes from the prior refresh (11/8 ~10:40a PT -> 11/8 ~6:40p PT):
 *     - DOOR STATUS: effectively UNCHANGED. 20/23 occupied, 2 reserved (DOCK59,
 *       DOCK67), 1 available (DOCK70). Raw dockStatus=OCCUPIED is 19/23; DOCK57
 *       is space-occupied only with dockStatus AVAILABLE. Every door keeps the
 *       same entryId and the same updatedTime stamp as the 7:40a and 10:40a PT
 *       pulls - no door row has been re-stamped since 11/7 6:26p PT, so there has
 *       been no dock traffic at all in the last ~24h. One raw-field correction:
 *       DOCK58 now reads dockStatus OCCUPIED (prior note recorded AVAILABLE) while
 *       spaceStatus is OCCUPIED and the row timestamp is unchanged at 11/7 6:25p
 *       PT; the current raw value is reported verbatim. Occupancy totals are
 *       unaffected because DOCK58 was already counted as occupied on spaceStatus.
 *     - TASK TURNOVER: NONE. The same 10 active Bay-4 tasks are present with the
 *       same task IDs, statuses, startTimes, doors and assignees
 *       (3 LOAD + 7 RECEIVE). Arnulfo's three open load tasks (DOCK52
 *       TASK-5414481, DOCK54 TASK-5414475, DOCK55 TASK-5414119) are untouched and
 *       Daniela's three receive tasks (DOCK61 TASK-5414777, DOCK62 TASK-5414773,
 *       DOCK63 TASK-5414772) are still IN_PROGRESS. No Bay-4 task was created,
 *       assigned or closed since the 10:40a PT pull.
 *     - STALE ANOMALIES: still TWO, both the same shape (active status with an
 *       endTime already set). (1) Unchanged: TASK-5090739 (DOCK50, RECEIVE
 *       started 10/21/25 1:21:14p PT) is still returned by the active-status
 *       query although its endTime is 10/22/25 10:42:01a PT; its linked receipt
 *       RN-5002143 was re-read and is still CLOSED. (2) Unchanged: TASK-5414481
 *       (DOCK52, LOAD) reads IN_PROGRESS although endTime is 11/6 3:31:51p PT and
 *       its only load LOAD-5043964 is already LOADED; it is left flagged, not
 *       given an open-ended duration.
 *     - LOAD PROGRESS: unchanged since the prior pull. DOCK54 TASK-5414475 still
 *       shows 3 of 4 loads LOADED (LOAD-5043906 / 50140530 still
 *       WINDOW_CHECKIN_DONE) and DOCK55 TASK-5414119 still shows 1 of 3 loads
 *       LOADED (LOAD-5043892 / 50139610 and LOAD-5043907 / 50140532 still
 *       WINDOW_CHECKIN_DONE). Those load statuses are reported verbatim.
 *     - Task "Guru live out / in assign to Arnulfo" still resolves to ARNULFO
 *       MUNGUIA GURUNANDA Bay 4 work. No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo"; the stream is read as the
 *       assignee's task assignment transactions and none is invented here.
 *       His assigned-activity pull (closed load tasks, endTime from 2026-10-31
 *       00:00:00 PT) returns the SAME 36 transactions (32 at Bay-4 doors), 0 of
 *       them closed today (11/8 PT), 0 closed on 11/7 PT and 8 closed on 11/6 PT.
 *       The newest is still DOCK54 TASK-5376769 (started 9/24/25 2:50:27p PT,
 *       closed 11/6 5:00:51p PT, 2 loads both SHIPPED, DN-3364395 / DN-3360300,
 *       seal 24800361). He still holds all three of his open Bay-4 load tasks
 *       listed above.
 *     - "% scheduled inbounds received" (11/8 PT day): NOT APPLICABLE - 0 GURUNANDA
 *       receipts carry a 11/8 appointment.
 *     - "% scheduled outbounds loaded" (11/8 PT day): NOT APPLICABLE - 0 GURUNANDA
 *       orders carry a 11/8 scheduleDate.
 *     - Inbound/outbound mix: 7 RECEIVE / 3 LOAD of 10 active Bay-4 tasks
 *       (unchanged).
 *     - Total doors occupied: 20 of 23 (unchanged).
 *     - Planned GURUNANDA orders (fallback): 160 (unchanged for the last five
 *       pulls).
 *     - Door occupancy duration is available only where a task with a startTime
 *       sits on the door and has not already ended: still 5 of 10 tasks (DOCK54,
 *       DOCK55, DOCK61, DOCK62, DOCK63). The substantive change in this refresh is
 *       that those five open durations advanced by ~8h00m:
 *       DOCK54 42h55m -> 50h56m, DOCK55 47h02m -> 55h03m, DOCK61 37h48m ->
 *       48h48m, DOCK62 37h31m -> 48h31m, DOCK63 38h56m -> 49h56m (measured from
 *       each task startTime to 11/8 18:40 PT). WMS has no occupancy-start field
 *       for task-less doors (13 of 23) and for NEW tasks that never started
 *       (3 tasks), so none is derived. DOCK50's and DOCK52's started tasks are
 *       stale and are not given open-ended durations either.
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
// NOT re-pulled in the 11/8 6:40p PT refresh (out of scope of the request). The
// array is left empty rather than carrying a stale result; Section 1 renders live
// from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 160 at the 11/8 ~6:40p PT pull (unchanged
// across the last four pulls).
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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/8 ~6:40p PT
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
    duration: "LOAD 50h56m since 11/6 3:43:10p PT (TASK-5414475, ARNULFO MUNGUIA, ET-1180061, PRE_LOAD, 4 loads: LOAD-5043905 / 50140528 LOADED, LOAD-5043883 / 50139566 LOADED, LOAD-5043821 / 50138673 LOADED, LOAD-5043906 / 50140530 WINDOW_CHECKIN_DONE; seal 24800363) · dock OCCUPIED, space OCCUPIED, entry ET-1180061 (row updated 11/7 12:38a PT). The long-running 2-load task that preceded it here, TASK-5376769 (started 9/24/25), closed 11/6 5:00:51p PT under ARNULFO MUNGUIA",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414119"],
    duration: "LOAD 55h03m since 11/6 11:36:13a PT (TASK-5414119, ARNULFO MUNGUIA, ET-1179938, PRE_LOAD, 3 loads: LOAD-5043892 / 50139610 WINDOW_CHECKIN_DONE, LOAD-5043878 / 50139520 LOADED - DN-3443366, LOAD-5043907 / 50140532 WINDOW_CHECKIN_DONE; seal 24800386) · dock OCCUPIED, space OCCUPIED, entry ET-1179938 (row updated 11/7 12:37a PT)",
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
    duration: "No active task · dock OCCUPIED, space OCCUPIED, entry ET-1180159 (row updated 11/7 6:25p PT). The receive task that ran here, TASK-5414761 (DANIELA GONZALEZ), closed 11/6 5:09:25p PT, so the space is still flagged occupied with no task holding it; the 4-load LIVE_LOAD task TASK-5413982 (DANIEL BELTRAN) had closed 11/6 1:23:45p PT · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Reserved",
    assignee: "A1SG (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414270"],
    duration: "RECEIVE NEW, not started (created 11/6 10:51:19a PT, TASK-5414270, A1SG, ET-1179989, receipt RN-195229 / PO9518, container LEAFCHEM11062026, appointment 11/6 10:00a PT, receipt status IMPORTED) - no startTime, so no duration basis · dock RESERVED, space OCCUPIED, entry ET-1180038 (row updated 11/6 12:00p PT). Its earlier 1-load task TASK-5413966 closed 11/6 8:59:43a PT under DANIEL BELTRAN",
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
    duration: "RECEIVE 48h48m since 11/6 5:51:46p PT (TASK-5414777, DANIELA GONZALEZ, ET-1180178, receipt RN-5011407 - the 10:00a PT 11/6 appointment PO/container OOCU5406647, seal NL028439, receipt still IN_PROGRESS and not yet fully received) · dock OCCUPIED, space EMPTY, entry ET-1180178 (row updated 11/7 6:25p PT)",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414773"],
    duration: "RECEIVE 48h31m since 11/6 6:08:57p PT (TASK-5414773, DANIELA GONZALEZ, ET-1180167, receipt RN-5011402 - appointment 11/5 7:00p PT, PO/container OOLU9244746, seal NL028043, receivedStartTime 11/6 6:08:57p PT) · dock OCCUPIED, space EMPTY, entry ET-1180167 (row updated 11/7 6:25p PT)",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414772"],
    duration: "RECEIVE 49h56m since 11/6 4:43:57p PT (TASK-5414772, DANIELA GONZALEZ, ET-1180165, receipt RN-5011413 - PO/container FFAU4957077, no appointmentTime on the receipt, receivedStartTime 11/6 4:43:57p PT) · dock OCCUPIED, space EMPTY, entry ET-1180165 (row updated 11/7 6:26p PT). The overnight receive task that ran here, TASK-5413838 (Fatima Ponce, RN-5011401), closed 11/6 8:23:27a PT",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1176452 (row updated 11/7 6:26p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1179941 (row updated 11/7 12:36a PT). This door was AVAILABLE at the 11/6 2:45p PT pull after TASK-5414129 closed 11/6 12:41:01p PT; the door flag is OCCUPIED again with no task on it · no occupancy-start field in WMS",
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
    duration: "RECEIVE NEW, not started (created 11/6 9:43:54a PT, TASK-5414174, GONZALO RANGEL, ET-1179952, receipt RN-5011408 / PO TGHU6885258, seal SYA4543644, container TGHU6885258, appointment 11/6 10:00a PT, receipt status OPEN) - no startTime, so no duration basis · dock RESERVED, space EMPTY, entry ET-1179892 (row updated 11/6 9:43a PT), i.e. the open NEW task has never held the door",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1177841 (row updated 11/7 12:36a PT). This door was AVAILABLE at the 11/6 2:45p PT pull; the door flag is OCCUPIED again with no task on it · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW, not started (created 9/30 10:46:50a PT, TASK-5381972, Jorge Antonio Franco, ET-1162686, receipt RN-5010583 / PO9139-2, container Jpack09242026, no appointment, receipt status IMPORTED) - no startTime, so no duration basis · dock OCCUPIED, space EMPTY, entry ET-1171953 (row updated 11/7 12:36a PT), i.e. the open NEW task is not holding the door",
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
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, Nov 8 2026 ~6:40p PT).
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

// --- Schedule Data (2026-11-08, Sunday) ---
// NOT APPLICABLE TODAY: there is no GURUNANDA schedule on 11/8 PT.
//   % scheduled inbounds received TODAY: 0 GURUNANDA receipts carry an
//   appointmentTime inside the 11/8 PT business day (query window
//   appointmentTimeFrom "2026-11-08 00:00:00" -> appointmentTimeTo
//   "2026-11-08 23:59:59" returned totalCount 0), so the denominator is zero and
//   the percentage is undefined. It is reported as N/A (scheduleAvailable=false)
//   rather than as 0%.
//   % scheduled outbounds loaded TODAY: 0 GURUNANDA orders carry a scheduleDate
//   inside the 11/8 PT day (scheduleDatePeriod ["2026-11-08 00:00:00",
//   "2026-11-08 23:59:59"] returned totalCount 0) - same zero-denominator case,
//   reported as N/A (outboundScheduleAvailable=false).
//   CONTEXT ONLY (not substituted into today's metrics): the prior business day
//   11/6 (Friday) closed with 10 receipts of which 4 carry a receivedStartTime
//   (RN-5011407 5:51:46p, RN-5011403 4:04:04p, RN-5011383 12:16:58p, RN-5011376
//   9:27:32a) = 40.0%, and 44 orders of which 9 are at status SHIPPED = 20.5%
//   (remaining 11/6 statuses: PLANNED 22, PICKED 9, COMMIT_FAILED 2, PACKED 1,
//   PARTIAL_SHIPPED 1). Those two denominators were re-pulled live at this
//   refresh and still reconcile to 4/10 and 9/44. 11/7 (Saturday) also closed
//   with 0 GURUNANDA receipts and 0 GURUNANDA orders scheduled. The next
//   scheduled day, 11/9 (Monday), currently carries 105 orders and 1 receipt with
//   an appointment; 11/10 (Tuesday) carries 21 orders and 0 receipts.
export const scheduleAvailable = false;             // no GURUNANDA receipts scheduled on 11/8
export const outboundScheduleAvailable = false;     // no GURUNANDA orders scheduled on 11/8
export const scheduledInboundOrders = 0;            // receipts with appointmentTime in the 11/8 PT day
export const scheduledOutboundOrders = 0;           // orders with scheduleDate in the 11/8 PT day
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
// doors (DOCK54 50h56m, DOCK55 55h03m, DOCK61 48h48m, DOCK62 48h31m, DOCK63
// 49h56m, all measured to 11/8 18:40 PT).
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Nov 8 2026 ~6:40p PT)
// 10 tasks total: 3 LOAD + 7 RECEIVE. All GURUNANDA, LLC.
// Two are data anomalies (TASK-5090739 on DOCK50 stale since 10/21/25, and
// TASK-5414481 on DOCK52 still IN_PROGRESS with an endTime of 11/6 3:31:51p PT).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA (userId 89) has 36 CLOSED GURUNANDA load transactions with endTime
// inside the 2026-10-31 00:00:00 - 2026-11-08 18:40 PT window (32 of them at Bay-4
// doors, spread over DOCK54 6, DOCK51 6, DOCK52 5, DOCK53 4, DOCK55 4, DOCK50 2,
// DOCK60 2, DOCK56 1, DOCK57 1, DOCK59 1; the other 4 are on DOCK5 2 and DOCK7 2);
// 0 of the transactions closed today (11/8 PT), 0 closed on 11/7 PT and 8 closed
// on 11/6 PT.
// The newest is DOCK54 TASK-5376769
// (started 9/24/25 2:50:27p PT, closed 11/6 5:00:51p PT; 2 loads LOAD-5039954 /
// DN-3364395 and LOAD-5039534 / DN-3360300, both SHIPPED; seal 24800361).
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
    pieces: "IN_PROGRESS · 48h48m since 11/6 5:51:46p PT (DANIELA GONZALEZ; ET-1180178, receipt RN-5011407 - the 11/6 10:00a PT appointment PO/container OOCU5406647, seal NL028439, still IN_PROGRESS and not yet fully received)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK61",
  },
  {
    taskId: "TASK-5414773",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 48h31m since 11/6 6:08:57p PT (DANIELA GONZALEZ; ET-1180167, receipt RN-5011402 - appointment 11/5 7:00p PT, PO/container OOLU9244746, seal NL028043)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK62",
  },
  {
    taskId: "TASK-5414772",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 49h56m since 11/6 4:43:57p PT (DANIELA GONZALEZ; ET-1180165, receipt RN-5011413 - PO/container FFAU4957077, no appointmentTime on the receipt)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK63",
  },
  {
    taskId: "TASK-5414270",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/6 10:51:19a PT (A1SG; ET-1179989, RN-195229, PO9518, container LEAFCHEM11062026, appointment 11/6 10:00a PT, receipt status IMPORTED) - task has no startTime",
    assignee: "A1SG",
    door: "DOCK59",
  },
  {
    taskId: "TASK-5414174",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/6 9:43:54a PT (GONZALO RANGEL; ET-1179952, RN-5011408, PO TGHU6885258, seal SYA4543644, container TGHU6885258, appointment 11/6 10:00a PT, receipt status OPEN) - task has no startTime",
    assignee: "GONZALO RANGEL",
    door: "DOCK67",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/30 10:46:50a PT (Jorge Antonio Franco; ET-1162686, RN-5010583, PO9139-2, container Jpack09242026, no appointment, receipt status IMPORTED) - task has no startTime",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 10/21/25 1:21:14p PT; status still IN_PROGRESS although endTime is 10/22/25 10:42:01a PT; daira gonzalez, ET-1027622, RN-5002143 which is itself already CLOSED, PO/container EGSU8032696)",
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
    pieces: "IN_PROGRESS · 50h56m since 11/6 3:43:10p PT (ARNULFO MUNGUIA; ET-1180061, PRE_LOAD, 4 loads: LOAD-5043905 / 50140528 LOADED - DN-3443800; LOAD-5043883 / 50139566 LOADED - DN-3443406; LOAD-5043821 / 50138673 LOADED - DN-3441492; LOAD-5043906 / 50140530 WINDOW_CHECKIN_DONE - DN-3443740; seal 24800363)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5414119",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 55h03m since 11/6 11:36:13a PT (ARNULFO MUNGUIA; ET-1179938, PRE_LOAD, 3 loads: LOAD-5043892 / 50139610 WINDOW_CHECKIN_DONE - DN-3443274; LOAD-5043878 / 50139520 LOADED - DN-3443366; LOAD-5043907 / 50140532 WINDOW_CHECKIN_DONE - DN-3443725; seal 24800386)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK55",
  },
];
