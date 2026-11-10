/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-09 16:05:00 PT (live WISE / WMS-BAM APIs)
 *   Sources (all read with item-time-zone America/Los_Angeles; WISE returns the
 *   dock/task/receipt/order timestamps as naive facility wall-clock values, so
 *   the strings below are already PT and no UTC->PT shift is applied):
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors, 23/23 rows
 *       returned (fresh dockStatus, spaceStatus, occupiedCustomerIds, entryId,
 *       updatedTime)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide totalCount 13); matched on dockName to
 *       the 23 Bay-4 docks -> 5 at Bay 4 doors (DOCK50, DOCK52 x2, DOCK53 x2)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide totalCount 16), same per-door
 *       dockName match -> 5 at Bay 4 doors (DOCK50, DOCK59, DOCK61, DOCK67,
 *       DOCK69)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To inside the 11/9 PT business day -> totalCount 4
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDatePeriod inside the 11/9 PT business day -> totalCount 122
 *     - /wms-bam/outbound/load/search-by-paging - the 14 loads held by the live
 *       Bay-4 load tasks (status + orderIds/DN per load)
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA CLOSED/FORCE_CLOSED
 *       load tasks, endTimeFrom 2026-10-31 00:00:00, sorted endTime DESC
 *       -> 106 rows; 42 of them are assigneeUserId 89 (ARNULFO MUNGUIA), 38 at
 *       Bay-4 doors (Arnulfo Assigned Activity stream)
 *     - /wms-bam/outbound/load-task/search-by-paging - facility-wide (all
 *       customers) CLOSED/FORCE_CLOSED load tasks with endTimeFrom 2026-11-09
 *       00:00:00 -> totalCount 54, of which 10 closed at Bay-4 doors; newest
 *       facility-wide closure is 11/9 3:58:06p PT (DOCK32 TASK-5416033)
 *     - /wms-bam/inbound/receive-task/search-by-paging - CLOSED/FORCE_CLOSED
 *       receive tasks sorted endTime DESC (all customers; facility-wide) -> 40
 *       closures dated 11/9 PT, of which 5 at Bay-4 doors (DOCK55, DOCK57,
 *       DOCK59, DOCK62, DOCK63)
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders at status
 *       PLANNED, no date filter -> totalCount 157 (planned-orders fallback)
 *   NOTE: door state is read from wms-location/search (dockStatus + spaceStatus),
 *   the same two status fields the dashboard already uses.
 *   NOTE: the load/receive task searches were filtered by customerIds only and
 *   matched to Bay-4 doors on the returned dockName field (dockId is also present
 *   but is a numeric location id, not the DOCKnn name).
 *   NOTE: the query shapes used here are byte-identical to the prior refresh,
 *   except that the receipt/order day windows moved from 11/8 to 11/9. This pull
 *   ran at 16:05 PT on Monday 11/9, ~21h25m after the 11/8 6:40p PT pull. WISE now
 *   carries a full Monday of activity at Bay 4: 10 tasks are open, 10 Bay-4 load
 *   tasks and 5 Bay-4 receive tasks have closed today, and both percentage
 *   denominators are non-zero for the first time in three pulls. The percentage
 *   queries were re-validated against the neighbouring days (11/6: 10 receipts /
 *   44 orders; 11/8: 0 receipts / 0 orders; 11/9: 4 receipts / 122 orders;
 *   11/10: 1 receipt / 22 orders) so the 11/9 figures are real, not a broken
 *   filter.
 *
 *   CONTEXT - 11/9 PT is a Monday and GURUNANDA volume IS scheduled on it, so both
 *   schedule percentages are published as real numbers this pull (they were N/A
 *   on the 11/7 and 11/8 weekend pulls, where the denominators were zero):
 *   % scheduled inbounds received = 2 / 4 = 50.0% (RN-195343 received 11/9
 *   12:35:42p PT; RN-5011412 carries a receivedStartTime of 11/6 11:33:28a PT and
 *   is now FORCE_CLOSED; RN-5011484 and RN-195352 have no receivedStartTime yet).
 *   % scheduled outbounds loaded = 30 / 122 = 24.6% (orders at status SHIPPED -
 *   the same definition the prior pulls used; remaining 11/9 statuses: PLANNED 41,
 *   PICKED 34, COMMIT_FAILED 13, PICKING 2, IMPORTED 2).
 *
 *   Key changes from the prior refresh (11/8 ~6:40p PT -> 11/9 ~4:05p PT):
 *     - DOOR STATUS: a large turnaround. 15/23 occupied, 1 reserved (DOCK67),
 *       7 available (DOCK51, DOCK62, DOCK63, DOCK64, DOCK65, DOCK69, DOCK70).
 *       Raw dockStatus is OCCUPIED 11, AVAILABLE 11, RESERVED 1; DOCK54, DOCK55,
 *       DOCK57 and DOCK58 are space-occupied only with dockStatus AVAILABLE, so
 *       the dashboard's Occupied count (15) exceeds the raw dockStatus count (11).
 *       Seven doors that were occupied at the prior pull are now fully free
 *       (DOCK51, DOCK62, DOCK63, DOCK64, DOCK65, DOCK69, DOCK70) and 19 of 23 door
 *       rows were re-stamped today, so the dock is genuinely working again after
 *       the dead 11/7-11/8 weekend.
 *     - TASK TURNOVER: near-complete. Of the 10 tasks open at the prior pull only
 *       four are still open (DOCK50 TASK-5090739 STALE, DOCK52 TASK-5414481
 *       STALE, DOCK61 TASK-5414777, plus nothing else); the other six closed
 *       today. Six new Bay-4 tasks were created today: DOCK50 TASK-5415615,
 *       DOCK52 TASK-5416137, DOCK53 TASK-5415952, DOCK53 TASK-5416134,
 *       DOCK59 TASK-5415038 (all load except the last). Net active count is still
 *       10 but the mix moved from 3 LOAD / 7 RECEIVE to 5 LOAD / 5 RECEIVE.
 *     - ASSIGNMENTS BY ASSIGNEE: ARNULFO MUNGUIA 4 (DOCK50, DOCK52 x2, DOCK53),
 *       DANIELA GONZALEZ 2, DANIEL BELTRAN 1 (first Bay-4 task for him in this
 *       stream), GONZALO RANGEL 1, Jorge Antonio Franco 1, daira gonzalez 1.
 *     - STALE ANOMALIES: still TWO, both the same shape (active status with an
 *       endTime already set) and both unchanged. (1) TASK-5090739 (DOCK50,
 *       RECEIVE started 10/21/25 1:21:14p PT) is still returned by the
 *       active-status query although its endTime is 10/22/25 10:42:01a PT and its
 *       linked receipt RN-5002143 is CLOSED. (2) TASK-5414481 (DOCK52, LOAD)
 *       reads IN_PROGRESS although endTime is 11/6 3:31:51p PT and its only load
 *       LOAD-5043964 is already LOADED; it is left flagged, not given an
 *       open-ended duration.
 *     - LOAD PROGRESS: DOCK53 TASK-5416134 (DANIEL BELTRAN) shows 3 of 5 loads
 *       LOADED and 2 LOADING; DOCK53 TASK-5415952 (ARNULFO) shows all 4 loads
 *       LOADED but the task is still IN_PROGRESS; DOCK50 TASK-5415615 shows its
 *       only load LOADED and the task still IN_PROGRESS; DOCK52 TASK-5416137 is
 *       NEW with all 3 loads at WINDOW_CHECKIN_DONE. Statuses are verbatim.
 *     - Task "Guru live out / in assign to Arnulfo" still resolves to ARNULFO
 *       MUNGUIA GURUNANDA Bay 4 work. No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo"; the stream is read as the
 *       assignee's task assignment transactions and none is invented here.
 *       His assigned-activity pull (closed load tasks, endTime from 2026-10-31
 *       00:00:00 PT) grew from 36 to 42 transactions (32 -> 38 at Bay-4 doors),
 *       with 6 closing today (11/9 PT), 0 on 11/8, 0 on 11/7, 8 on 11/6, 4 on
 *       11/5, 11 on 11/4, 6 on 11/3 and 7 on 11/2. The newest is DOCK51
 *       TASK-5415078 (started 11/9 7:01:59a PT, closed 11/9 12:35:18p PT, 1 load
 *       LOAD-5043886 / 50139593 SHIPPED, seal 24800335). He still holds four open
 *       Bay-4 load tasks (DOCK50, DOCK52 x2, DOCK53).
 *     - "% scheduled inbounds received" (11/9 PT day): 2 of 4 = 50.0% (first
 *       published value since 11/6; the 11/7 and 11/8 weekend days had no
 *       scheduled receipts at all).
 *     - "% scheduled outbounds loaded" (11/9 PT day): 30 of 122 = 24.6%
 *       (status SHIPPED).
 *     - Inbound/outbound mix: 5 RECEIVE / 5 LOAD of 10 active Bay-4 tasks
 *       (was 7 / 3).
 *     - Total doors occupied: 15 of 23 (was 20 of 23).
 *     - Planned GURUNANDA orders (fallback): 157 (was 160 and flat for five
 *       pulls - the planned pool finally moved).
 *     - Door occupancy duration is available only where a task with a startTime
 *       sits on the door and has not already ended: now 4 of 10 tasks, because
 *       most of the long-running weekend tasks closed today. The four open
 *       durations are short and fresh: DOCK50 TASK-5415615 1h15m (from 11/9
 *       2:49:04p PT), DOCK53 TASK-5415952 2h02m (from 11/9 2:02:53p PT), DOCK53
 *       TASK-5416134 26m (from 11/9 3:38:07p PT) and DOCK61 TASK-5414777 70h13m
 *       (from 11/6 5:51:46p PT). WMS has no occupancy-start field for task-less
 *       doors (16 of 23) and for NEW tasks that never started (4 tasks), so none
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
// NOT re-pulled in the 11/9 4:05p PT refresh (out of scope of the request). The
// array is left empty rather than carrying a stale result; Section 1 renders live
// from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 157 at the 11/9 ~4:05p PT pull (down from 160,
// which had been flat across the five prior pulls).
export const plannedGurunandaOrderCount = 157;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/9 ~4:05p PT
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
    assignee: "ARNULFO MUNGUIA (LOAD) + daira gonzalez (RECEIVE - STALE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5415615", "TASK-5090739"],
    duration: "LOAD 1h15m since 11/9 2:49:04p PT (TASK-5415615, ARNULFO MUNGUIA, ET-1180453, 1 load LOAD-5044020 / 50154436 LOADED - DN-3445469, seal 1378465, equipment 53567) · dock OCCUPIED, space OCCUPIED, entry ET-1180453 (row updated 11/9 2:49p PT). A second, STALE receive task sits on the same door: TASK-5090739 started 10/21/25 1:21:14p PT and is still returned as IN_PROGRESS although its endTime is 10/22/25 10:42:01a PT (RN-5002143 is itself CLOSED), so no open-ended duration is derived for it · the 2-load task that closed here today, TASK-5415346, ran 11/9 9:05:04a -> 10:34:35a PT under ARNULFO MUNGUIA (seal 24800348)",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1180295 (row updated 11/9 12:35p PT, i.e. re-stamped as the door freed up). The 1-load task that ran here, TASK-5415078, closed 11/9 12:35:18p PT under ARNULFO MUNGUIA (started 7:01:59a PT, LOAD-5043886 / 50139593 SHIPPED, seal 24800335) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD x2)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5416137", "TASK-5414481"],
    duration: "Two open load tasks. (1) TASK-5416137 is NEW, created 11/9 3:29:46p PT - no startTime, so no duration basis (ARNULFO MUNGUIA, ET-1180586, 3 loads all WINDOW_CHECKIN_DONE: LOAD-5044014 / 50153915 DN-3445430, LOAD-5044015 / 50153935 DN-3445277, LOAD-5043977 / 50145602 DN-3445257, equipment 53104). (2) TASK-5414481 is STALE: started 11/6 2:55:07p PT with a task endTime of 11/6 3:31:51p PT (37m) yet still reads IN_PROGRESS and its only load LOAD-5043964 / 50145575 is already LOADED (DN-3441573, seal 25079925), so no open-ended duration is derived · dock OCCUPIED, space EMPTY, entry ET-1180586 (row updated 11/9 3:29p PT)",
    anomaly: true,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "DANIEL BELTRAN (LOAD) + ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5416134", "TASK-5415952"],
    duration: "Two open load tasks on one door. (1) TASK-5416134, DANIEL BELTRAN: 26m since 11/9 3:38:07p PT (ET-1180577, equipment 53779, 5 loads - LOAD-5043908 / 50140534 LOADED DN-3443615, LOAD-5043951 / 50145471 LOADED DN-3445050, LOAD-5043947 / 50145467 LOADED DN-3445064, LOAD-5043979 / 50145606 LOADING DN-3445237, LOAD-5043946 / 50145465 LOADING DN-3445070). (2) TASK-5415952, ARNULFO MUNGUIA: 2h02m since 11/9 2:02:53p PT (ET-1180529, equipment 53188, 4 loads all LOADED - LOAD-5043955 / 50145481 DN-3444841, LOAD-5043954 / 50145477 DN-3444894, LOAD-5043952 / 50145473 DN-3444996, LOAD-5043949 / 50145469 DN-3445057) · dock OCCUPIED, space OCCUPIED, entry ET-1180577 (row updated 11/9 3:38p PT). Two more load tasks already closed here today: TASK-5415699 (11/9 12:09:36p -> 12:28:15p, DANIEL BELTRAN, seal 1378467) and TASK-5415147 (11/9 7:45:15a -> 9:47:09a, ARNULFO MUNGUIA, seal 25079929)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1180481 (row updated 11/9 2:05p PT). The long-running 4-load task that held this door all weekend, TASK-5414475, finally closed 11/9 11:10:39a PT under ARNULFO MUNGUIA (started 11/6 3:43:10p PT; all 4 loads SHIPPED - LOAD-5043905 / 50140528, LOAD-5043883 / 50139566, LOAD-5043821 / 50138673, LOAD-5043906 / 50140530; seal 24800363), so the space is still flagged occupied with no task holding it · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1180399 (row updated 11/9 2:57p PT). The 3-load task that held this door since 11/6, TASK-5414119, closed 11/9 9:11:59a PT under ARNULFO MUNGUIA (all 3 loads SHIPPED - LOAD-5043892 / 50139610, LOAD-5043878 / 50139520, LOAD-5043907 / 50140532; seal 24800386); the receive task TASK-5415451 (Viridiana Martinez, RN-195168) closed here later at 2:58:06p PT · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, entry ET-1180360 (row updated 11/9 1:17p PT). Two load tasks closed here today: TASK-5415753 (11/9 1:07:19p -> 2:05:19p, DANIEL BELTRAN, seal 1378466) and TASK-5415392 (11/9 9:14:02a -> 11:42:57a, ARNULFO MUNGUIA, 3 loads SHIPPED, seal 24800347) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1180355 (row updated 11/9 10:29a PT). The 1-load task that ran here, TASK-5415353, closed 11/9 10:28:04a PT under DANIEL BELTRAN (seal 1378464); the receive task TASK-5414098 (Nanci Viviana Rosas, RN-194689) closed here at 2:14:50p PT, so the space is still flagged occupied with no task holding it · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1180413 (row updated 11/9 3:13p PT). The 1-load task that ran here, TASK-5415494, closed 11/9 11:09:43a PT under DANIEL BELTRAN (started 10:48:09a PT, seal 1378468) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5415038"],
    duration: "RECEIVE NEW, not started (created 11/9 6:19:04a PT, TASK-5415038, DANIELA GONZALEZ, ET-1180224, receipt RN-5011335 / PO-container CAJU5264362, seal NL026213, appointment 11/6 11:00p PT, receipt status IMPORTED) - no startTime, so no duration basis · dock OCCUPIED, space OCCUPIED, entry ET-1179989 (row updated 11/9 2:35p PT), i.e. the open NEW task is not what re-stamped the door. The receive task that held this door, TASK-5414270 (Fatima Ponce, RN-195229), closed 11/9 8:52:14a PT",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, entry ET-1179653 (row updated 11/7 12:37a PT), occupiedCustomerIds [ORG-655875] · no Bay-4 load or receive task closed at this door today (11/9 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414777"],
    duration: "RECEIVE 70h13m since 11/6 5:51:46p PT (TASK-5414777, DANIELA GONZALEZ, ET-1180178, receipt RN-5011407 - the 11/6 10:00a PT appointment PO-container OOCU5406647, seal NL028439, receipt still IN_PROGRESS and not yet fully received, receivedStartTime 11/6 5:51:46p PT) · dock OCCUPIED, space EMPTY, entry ET-1180178 (row updated 11/7 6:25p PT - unchanged since the weekend)",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1180167 (row updated 11/9 1:53p PT, re-stamped as the door freed up). The receive task that held it, TASK-5414773 (Fatima Ponce, RN-5011402 - appointment 11/5 7:00p PT, PO-container OOLU9244746, seal NL028043), closed 11/9 1:52:21p PT after starting 11/6 6:08:57p PT · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1180165 (row updated 11/9 10:12a PT, re-stamped as the door freed up). The receive task that held it, TASK-5414772 (Fatima Ponce, RN-5011413 - PO-container FFAU4957077, no appointmentTime on the receipt), closed 11/9 9:56:00a PT after starting 11/6 4:43:57p PT · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1176452 (row updated 11/9 7:36a PT) · no Bay-4 load or receive task closed at this door today (11/9 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1179941 (row updated 11/9 3:38p PT) · no Bay-4 load or receive task closed at this door today (11/9 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1173309 (row updated 11/7 12:36a PT) · no Bay-4 load or receive task closed at this door today (11/9 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Reserved",
    assignee: "GONZALO RANGEL (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5414174"],
    duration: "RECEIVE NEW, not started (created 11/6 9:43:54a PT, TASK-5414174, GONZALO RANGEL, ET-1179952, receipt RN-5011408 / PO-container TGHU6885258, seal SYA4543644, appointment 11/6 10:00a PT, receipt status OPEN) - no startTime, so no duration basis · dock RESERVED, space EMPTY, entry ET-1179892 (row updated 11/6 9:43a PT), i.e. the open NEW task has never held the door",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1177841 (row updated 11/7 12:36a PT) · no Bay-4 load or receive task closed at this door today (11/9 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Available",
    assignee: "Jorge Antonio Franco (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW, not started (created 9/30 10:46:50a PT, TASK-5381972, Jorge Antonio Franco, ET-1162686, receipt RN-5010583 / PO9139-2, container Jpack09242026, no appointment, receipt status IMPORTED) - no startTime, so no duration basis · dock AVAILABLE, space EMPTY, entry ET-1171953 (row updated 11/9 2:03p PT), i.e. the door is fully free and the open NEW task is not holding it",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1172826 (row updated 11/6 3:43p PT) · no Bay-4 load or receive task closed at this door today (11/9 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1176765 (row updated 11/7 12:36a PT) · no Bay-4 load or receive task closed at this door today (11/9 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1176051 (row updated 11/7 12:36a PT) · no Bay-4 load or receive task closed at this door today (11/9 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 15
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 1
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 7
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 2
const available = doors.filter((d) => d.status === "Available").length; // 7

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors Occupied",
    value: `15/23`,
    numerator: 15,
    denominator: TOTAL_DOORS,
    percentage: Math.round((15 / TOTAL_DOORS) * 100),
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
    value: `7`,
    numerator: 7,
    denominator: TOTAL_DOORS,
    percentage: Math.round((7 / TOTAL_DOORS) * 100),
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
// DOCK67.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, Nov 9 2026 ~4:05p PT).
// 10 active-status tasks at Bay 4 doors: 5 LOAD + 5 RECEIVE.
// ARNULFO MUNGUIA: 4 LOAD (DOCK50 TASK-5415615, DOCK52 TASK-5416137,
//   DOCK52 TASK-5414481 stale, DOCK53 TASK-5415952)
// DANIELA GONZALEZ: 2 RECEIVE (DOCK59 TASK-5415038 status NEW,
//   DOCK61 TASK-5414777 status IN_PROGRESS)
// DANIEL BELTRAN: 1 LOAD (DOCK53 TASK-5416134, status IN_PROGRESS)
// GONZALO RANGEL: 1 RECEIVE (DOCK67 TASK-5414174, status NEW)
// Jorge Antonio Franco: 1 RECEIVE (DOCK69 TASK-5381972, status NEW)
// daira gonzalez: 1 RECEIVE (DOCK50 TASK-5090739, status IN_PROGRESS, stale)
// All assigned names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 4 },
  { name: "DANIELA GONZALEZ", taskCount: 2 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
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

// Mix: 5 RECEIVE + 5 LOAD = 10 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 5, total: 10 },
  { label: "Outbound (LOAD)", count: 5, total: 10 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 5, total: 10 },
  { label: "Inbound", count: 5, total: 10 },
];

// --- Schedule Data (2026-11-09, Monday) ---
// GURUNANDA volume IS scheduled on 11/9 PT, so both percentages are real values
// this pull (the 11/7 and 11/8 weekend pulls had zero denominators and reported
// N/A).
//   % scheduled inbounds received TODAY: 4 GURUNANDA receipts carry an
//   appointmentTime inside the 11/9 PT business day (query window
//   appointmentTimeFrom "2026-11-09 00:00:00" -> appointmentTimeTo
//   "2026-11-09 23:59:59", totalCount 4), of which 2 carry a receivedStartTime
//   = 2 / 4 = 50.0%. The two counted are RN-195343 (received 11/9 12:35:42p PT)
//   and RN-5011412 (receivedStartTime 11/6 11:33:28a PT, now FORCE_CLOSED); the
//   two not yet received are RN-5011484 (appointment 5:00p PT) and RN-195352
//   (appointment 12:00a PT).
//   % scheduled outbounds loaded TODAY: 122 GURUNANDA orders carry a scheduleDate
//   inside the 11/9 PT day (scheduleDatePeriod ["2026-11-09 00:00:00",
//   "2026-11-09 23:59:59"], totalCount 122), of which 30 are at status SHIPPED
//   = 30 / 122 = 24.6%. Remaining 11/9 order statuses: PLANNED 41, PICKED 34,
//   COMMIT_FAILED 13, PICKING 2, IMPORTED 2.
//   CONTEXT ONLY (not substituted into today's metrics): 11/8 (Sunday) carried 0
//   receipts and 0 orders scheduled; 11/6 (Friday) now reads 10 receipts of which
//   7 carry a receivedStartTime (70.0%) and 44 orders of which 11 are SHIPPED
//   (25.0%) - those two days were re-read live at this refresh as a query sanity
//   check. 11/10 (Tuesday) currently carries 1 receipt with an appointment and 22
//   orders scheduled.
export const scheduleAvailable = true;              // GURUNANDA receipts scheduled on 11/9
export const outboundScheduleAvailable = true;      // GURUNANDA orders scheduled on 11/9
export const scheduledInboundOrders = 4;            // receipts with appointmentTime in the 11/9 PT day
export const scheduledOutboundOrders = 122;         // orders with scheduleDate in the 11/9 PT day
export const scheduledInboundReceived = 2;          // receipts with receivedStartTime in that set
export const scheduledOutboundLoaded = 30;          // orders at status SHIPPED in that set
export const pctScheduledInboundReceived = 50.0;    // 2 of 4
export const pctScheduledOutboundLoaded = 24.6;     // 30 of 122 (24.59%)
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
// column). 16 of 23 doors carry no active task at this pull, 4 of the 10 tasks are
// NEW/not started and 2 are stale (DOCK50's receive task, DOCK52's load task), so
// a duration exists for 4 tasks on 3 doors (DOCK50 1h15m, DOCK53 2h02m and 26m,
// DOCK61 70h13m - all measured to 11/9 16:05 PT). DOCK53 carries two of them
// because both its load tasks have started and neither has ended.
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Nov 9 2026 ~4:05p PT)
// 10 tasks total: 5 LOAD + 5 RECEIVE. All GURUNANDA, LLC.
// Two are data anomalies (TASK-5090739 on DOCK50 stale since 10/21/25, and
// TASK-5414481 on DOCK52 still IN_PROGRESS with an endTime of 11/6 3:31:51p PT).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA (userId 89) has 42 CLOSED GURUNANDA load transactions with endTime
// inside the 2026-10-31 00:00:00 - 2026-11-09 16:05 PT window (38 of them at Bay-4
// doors, spread over DOCK51 7, DOCK54 7, DOCK53 5, DOCK55 5, DOCK52 5, DOCK50 3,
// DOCK56 2, DOCK60 2, DOCK59 1, DOCK57 1; the other 4 are on DOCK5 2 and DOCK7 2);
// 6 of the transactions closed today (11/9 PT), 0 closed on 11/8 PT, 0 on 11/7 PT,
// 8 on 11/6 PT, 4 on 11/5 PT, 11 on 11/4 PT, 6 on 11/3 PT and 7 on 11/2 PT.
// The newest is DOCK51 TASK-5415078
// (started 11/9 7:01:59a PT, closed 11/9 12:35:18p PT; 1 load LOAD-5043886 /
// 50139593 SHIPPED; seal 24800335). The six that closed today are DOCK51
// TASK-5415078, DOCK56 TASK-5415392 (3 loads SHIPPED, seal 24800347), DOCK54
// TASK-5414475 (4 loads SHIPPED, seal 24800363), DOCK50 TASK-5415346 (2 loads
// SHIPPED, seal 24800348), DOCK53 TASK-5415147 (1 load SHIPPED, seal 25079929) and
// DOCK55 TASK-5414119 (3 loads SHIPPED, seal 24800386).
// He ALSO holds four open Bay-4 load tasks at this pull, all four his:
// DOCK50 TASK-5415615 (IN_PROGRESS, 1 load LOADED), DOCK52 TASK-5416137 (NEW,
// 3 loads WINDOW_CHECKIN_DONE), DOCK52 TASK-5414481 (IN_PROGRESS but stale-ended)
// and DOCK53 TASK-5415952 (IN_PROGRESS, 4 loads LOADED).
export const assignments: TaskRecord[] = [
  // ----- INBOUND / RECEIVE (5) -----
  {
    taskId: "TASK-5415038",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/9 6:19:04a PT (DANIELA GONZALEZ; ET-1180224, RN-5011335, PO-container CAJU5264362, seal NL026213, appointment 11/6 11:00p PT, receipt status IMPORTED) - task has no startTime",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK59",
  },
  {
    taskId: "TASK-5414777",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 70h13m since 11/6 5:51:46p PT (DANIELA GONZALEZ; ET-1180178, receipt RN-5011407 - the 11/6 10:00a PT appointment PO-container OOCU5406647, seal NL028439, receivedStartTime 11/6 5:51:46p PT, receipt still IN_PROGRESS and not yet fully received)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK61",
  },
  {
    taskId: "TASK-5414174",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/6 9:43:54a PT (GONZALO RANGEL; ET-1179952, RN-5011408, PO-container TGHU6885258, seal SYA4543644, appointment 11/6 10:00a PT, receipt status OPEN) - task has no startTime",
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
    pieces: "IN_PROGRESS · STALE (started 10/21/25 1:21:14p PT; status still IN_PROGRESS although endTime is 10/22/25 10:42:01a PT; daira gonzalez, ET-1027622, RN-5002143 which is itself already CLOSED, PO-container EGSU8032696)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },

  // ----- OUTBOUND / LOAD (5) -----
  {
    taskId: "TASK-5415615",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 1h15m since 11/9 2:49:04p PT (ARNULFO MUNGUIA; ET-1180453, 1 load LOAD-5044020 / 50154436 LOADED - DN-3445469; seal 1378465; equipment 53567, LTL, pro 50154993)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5416137",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/9 3:29:46p PT (ARNULFO MUNGUIA; ET-1180586, 3 loads all WINDOW_CHECKIN_DONE - LOAD-5044014 / 50153915 DN-3445430, LOAD-5044015 / 50153935 DN-3445277, LOAD-5043977 / 50145602 DN-3445257; equipment 53104) - task has no startTime",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5414481",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STARTED 11/6 2:55:07p PT, task endTime 11/6 3:31:51p PT (37m) but status still IN_PROGRESS (ARNULFO MUNGUIA; ET-1180063, 1 load LOAD-5043964 / 50145575 LOADED - DN-3441573; seal 25079925)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5415952",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 2h02m since 11/9 2:02:53p PT (ARNULFO MUNGUIA; ET-1180529, equipment 53188, 4 loads all LOADED - LOAD-5043955 / 50145481 DN-3444841, LOAD-5043954 / 50145477 DN-3444894, LOAD-5043952 / 50145473 DN-3444996, LOAD-5043949 / 50145469 DN-3445057)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5416134",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 26m since 11/9 3:38:07p PT (DANIEL BELTRAN; ET-1180577, equipment 53779, 5 loads: LOAD-5043908 / 50140534 LOADED - DN-3443615, LOAD-5043951 / 50145471 LOADED - DN-3445050, LOAD-5043947 / 50145467 LOADED - DN-3445064, LOAD-5043979 / 50145606 LOADING - DN-3445237, LOAD-5043946 / 50145465 LOADING - DN-3445070)",
    assignee: "DANIEL BELTRAN",
    door: "DOCK53",
  },
];
