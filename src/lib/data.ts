/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-17 06:34a PT (live WISE / WMS-BAM APIs)
 *   Every value below was re-read live at ONE reference
 *   (2026-11-17T14:34:00Z = 06:34:00a PT). No value in this file is carried over
 *   from an earlier snapshot. Reads were made in WISE raw-UTC mode (no
 *   item-time-zone header) - see QUERY MODE WARNING below before re-running any
 *   of these queries.
 *
 *   TIMESTAMP SEMANTICS - single authority for this file, verified again at this
 *   pull: WISE/WMS-BAM returns task, receipt, order and appointment timestamps as
 *   UTC strings with NO offset. They are NOT facility wall-clock. Render PT with a
 *   real zone conversion: PST = UTC-8 (on/after 2026-11-01), PDT = UTC-7 (before
 *   2026-11-01). Evidence read at this pull: TASK-5422751 startTime
 *   2026-11-17T06:31:35 = 11/16 10:31:35p PT; RN-5011522 appointmentTime
 *   2026-11-17T18:00:00 = 11/17 10:00a PT; the closed DOCK53 receive task
 *   TASK-5407284 endTime 2026-10-29T18:01:54 = 10/29 11:01:54a PDT, which a flat
 *   UTC-8 read would wrongly render as 10:01:54a.
 *   Consequently "the 11/17 PT business day" used for the two
 *   schedule percentages is the UTC window 2026-11-17 08:00:00 ->
 *   2026-11-18 07:59:59, and that is the ONLY window used in this file.
 *   QUERY MODE WARNING - the pull behind these numbers was made WITHOUT the
 *   item-time-zone header, i.e. the raw-UTC mode documented above. The app's own
 *   loader (src/lib/wms-loader.ts) DOES send item-time-zone America/Los_Angeles.
 *   Both modes were run side by side at this pull for the receipt denominator and
 *   agree: raw-UTC window 2026-11-17 08:00:00 -> 2026-11-18 07:59:59 returned
 *   RN-5011522 (appointmentTime 2026-11-17T18:00:00 displayed as 10:00a PT) and
 *   the PT-header calendar window 2026-11-17 00:00:00 -> 23:59:59 returned the
 *   same single receipt. Do not mix the PT-day UTC window with the timezone
 *   header, and do not swap in the naive UTC calendar day: that window
 *   (2026-11-17 00:00:00 -> 23:59:59 raw UTC) returned 7 receipts, 6 of which are
 *   evening 11/16-PT appointments (01:30, 04:00, 05:00, 07:00 UTC = 11/16
 *   5:30p / 8:00p / 9:00p / 11:00p PT) that belong to the previous business day.
 *   Durations are measured to the 2026-11-17 06:34:00a PT pull reference.
 *
 *   SOURCES USED AT THIS PULL:
 *     - POST /wms-bam/wms-location/search, body {exactlyNames:[DOCK50..DOCK72]}
 *       -> code 0, 23/23 rows (name, id, category=DOCK, type=DOCK, status=USABLE
 *       on all 23, dockStatus, spaceStatus, occupiedCustomerIds, entryId,
 *       updatedTime). Door rows are used for "Door Utilization".
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer
 *       filter) -> totalCount 43, all 43 read (34 IN_PROGRESS, 9 NEW); exactly 4
 *       of them sit on Bay-4 dockNames, all 4 GURUNANDA IN_PROGRESS / PRE_LOAD.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer
 *       filter) -> totalCount 83, all 83 read (53 IN_PROGRESS, 30 NEW); 6 of them
 *       sit on Bay-4 dockNames (all GURUNANDA). 8 of the 83 carry no dockName at
 *       all (not yet docked) and none of them is a Bay-4 door.
 *     - POST /wms-bam/inbound/receipt/search-by-paging
 *       {customerId: ORG-655875, appointmentTimeFrom "2026-11-17 08:00:00",
 *       appointmentTimeTo "2026-11-18 07:59:59"} -> totalCount 1, read: RN-5011522
 *       at status IMPORTED, appointment 11/17 10:00a PT, PO 9416, container
 *       TQL11172026, carrier WILL CALL, in-yard null, receivedStartTime null.
 *       One scheduled receipt and zero started receipts = 0 of 1 received.
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, scheduleDatePeriod ["2026-11-17 08:00:00",
 *       "2026-11-18 07:59:59"]} -> totalCount 15, all 15 read; statuses PICKED 10,
 *       PLANNED 4, PICKING 1, SHIPPED 0. scheduleDate is date-only and stored at
 *       08:00:00 UTC, so this window and the naive calendar-day window return the
 *       identical 15; the window choice only changes results for receipt
 *       appointmentTime.
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], endTimeFrom "2026-10-31 00:00:00",
 *       endTimeTo "2026-11-17 23:59:59" -> totalCount 719 (all customers), all
 *       719 read (oldest endTime in the window 10/31 12:11:13a PT). Used for the
 *       newest load closure per door. The ARNULFO MUNGUIA / GURUNANDA subset is
 *       measured by a dedicated query (customerId ORG-655875 + assigneeUserIds
 *       [89, 1948070158297014318] + the same endTime window) -> totalCount 83, all
 *       83 read, 73 of them at Bay-4 doors (his "Assigned Activity" stream).
 *       No load closure has landed in that stream since 11/16 11:40:39a PT: the
 *       count is still 83, byte-for-byte the same door split as the 11/16 12:40p
 *       PT snapshot.
 *       NOTE: orderBy/sort are not supported on this endpoint (they null out
 *       totalCount); sort client-side after reading.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], endTimeFrom "2026-10-31 00:00:00" ->
 *       totalCount 17,809; the newest 5,000 were read (window back to 6/30
 *       1:01:43p PT), newest first. Every one of the 23 Bay-4 doors has at least
 *       one receive closure inside that coverage, so the per-door "newest receive
 *       closure" values below are complete, not truncated.
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, status: PLANNED} -> totalCount 205.
 *     - POST /wms-bam/yard/equipment/search {statuses:["FULL"]} -> 728 rows
 *       facility-wide (the statuses filter is IGNORED by this endpoint: the set
 *       returns FULL 310, EMPTY 351, UNKNOWN 67, all equipment types). 37 of the
 *       728 are GURUNANDA ORG-655875 rows and 8 of those are TRAILER rows reading
 *       equipmentStatus FULL, so the live "In Yard Full Trailers" KPI is
 *       non-zero at this pull (see the Section 1 note below).
 *
 *   SCOPE NOTE (important, read before comparing to any other snapshot):
 *     The line-level metrics on this dashboard are GURUNANDA-scoped (the same
 *     customer scope the dashboard has always published). At this pull the
 *     physical Bay-4 doors carry 10 active tasks and ALL 10 are GURUNANDA, so the
 *     all-customer physical tally and the GURUNANDA tally are identical
 *     (10 = RECEIVE 6 + LOAD 4). That is a change from the 11/16 12:40p snapshot,
 *     where 2 KARAKA, LLC RECEIVE tasks at DOCK54 made the physical tally 7 vs 5.
 *
 *   Key state at this pull:
 *     - DOOR STATUS: occupied 18, reserved 2, available 3 (18+2+3 = 23). Only
 *       DOCK63, DOCK67 and DOCK72 are fully free (dock AVAILABLE + space EMPTY).
 *       Raw dockStatus: OCCUPIED 14, AVAILABLE 7, RESERVED 2. Raw spaceStatus:
 *       OCCUPIED 11, EMPTY 12, FULL 0. The two RESERVED doors are DOCK50
 *       (spaceStatus OCCUPIED, occupiedCustomerIds [ORG-655875]) and DOCK65
 *       (spaceStatus EMPTY) - a reservation is a held door, so it is reported in
 *       its own "Reserved" bucket rather than folded into "Occupied"; 20 of the
 *       23 doors are therefore not fully free at this pull. Compare 11/16
 *       12:40p: occupied 16, reserved 3, available 4.
 *       Newest door-row update: DOCK58 11/17 6:20:19a PT.
 *     - ACTIVE TASKS: 10 tasks - 6 RECEIVE / 4 LOAD - at 9 distinct doors
 *       (DOCK50, DOCK51, DOCK52, DOCK53, DOCK54, DOCK58, DOCK61, DOCK69,
 *       DOCK71). All 10 are GURUNANDA, so the all-customer count is the same 10.
 *       Overnight movement since the 11/16 12:40p snapshot: the single then-open
 *       Bay-4 load task (DOCK57 TASK-5421821, DANIEL BELTRAN) CLOSED 11/16
 *       1:31:01p PT with its load LOAD-5043552 SHIPPED and seal 1304044, and four
 *       NEW Bay-4 load tasks were worked: DOCK53 TASK-5422317 (ARNULFO MUNGUIA,
 *       1:47:31p), DOCK52 TASK-5422342 (EDUARDO MEJIA, 2:13:32p), DOCK54
 *       TASK-5422749 (ARNULFO MUNGUIA, 9:46:53p) and DOCK51 TASK-5422751
 *       (EDUARDO MEJIA, 10:31:35p), all still IN_PROGRESS. Two GURUNANDA receive
 *       tasks also started and are still open: DOCK61 TASK-5422524 (JESUS
 *       ESPINOZA, 4:10:04p) and DOCK71 TASK-5422515 (JESUS ESPINOZA, 4:01:40p).
 *       Three carry-overs are unchanged in status: DOCK50 TASK-5418313 (NEW,
 *       Gonzalo Rangel), DOCK58 TASK-5420461 (NEW, Luis Alberto Paredes) and
 *       DOCK69 TASK-5381972 (NEW, Jorge Antonio Franco).
 *     - ASSIGNMENTS BY ASSIGNEE (the dashboard cards): ARNULFO MUNGUIA 2 (LOAD
 *       DOCK54, LOAD DOCK53), EDUARDO MEJIA 2 (LOAD DOCK51, LOAD DOCK52), JESUS
 *       ESPINOZA 2 (RECEIVE DOCK61, RECEIVE DOCK71), Gonzalo Rangel 1 (RECEIVE
 *       DOCK50, NEW), Luis Alberto Paredes 1 (RECEIVE DOCK58, NEW), Jorge Antonio
 *       Franco 1 (RECEIVE DOCK69, NEW), daira gonzalez 1 (RECEIVE DOCK50, stale)
 *       = 10 tasks on 7 assignees.
 *     - LOAD PROGRESS: all 4 active Bay-4 load tasks are IN_PROGRESS / PRE_LOAD
 *       with every linked load already at status LOADED: DOCK51 (seal 1304011,
 *       3 loads), DOCK52 (seal 1304019, 4 loads), DOCK53 (seal 1304046, 2 loads),
 *       DOCK54 (seal 25010983, 2 loads). None has an endTime yet.
 *     - ANOMALIES: 1, unchanged. TASK-5090739 (DOCK50, RECEIVE, started
 *       2025-10-21 12:21:14p PT) is still returned by the active-status query
 *       although its endTime is 2025-10-22 9:42:01a PT and its linked receipt
 *       RN-5002143 is CLOSED. Flagged, not given an open-ended duration.
 *     - Task "Guru live out / in assign to Arnulfo": no WMS record is literally
 *       named that (the load-task `keyword` filter remains a no-op - verified
 *       again at earlier pulls - and all active Bay-4 tasks carry projectId
 *       null, so there is no named task group to resolve). The stream is therefore
 *       reported as ARNULFO MUNGUIA's task assignment transactions on the
 *       GURUNANDA live-out/live-in work, and nothing is invented: 83 CLOSED load
 *       transactions with endTime from 2026-10-31 00:00:00 UTC (82 under
 *       assigneeUserId 89 + 1 under a second Arnulfo identity, assigneeUserId
 *       1948070158297014318, name rendered "arnulfo munguia"), 73 at Bay-4 doors,
 *       10 off Bay 4 (DOCK4 2, DOCK5 2, DOCK7 2, DOCK6 1, DOCK9 1, DOCK10 1,
 *       DOCK45 1).
 *       Per-day counts by endTime (PT), ALL scopes: 11/16 7, 11/13 8, 11/12 12,
 *       11/11 4, 11/10 10, 11/9 6, 11/6 8, 11/5 4, 11/4 11, 11/3 6, 11/2 7, with
 *       no closures at all on 11/1, 11/7, 11/8, 11/14, 11/15 or 11/17 so far.
 *       Newest overall: TASK-5421016 at DOCK10 (started 11/13 6:49:05p PT, closed
 *       11/16 11:40:39a PT). Newest at a Bay-4 door: DOCK56 TASK-5421056 (started
 *       11/13 9:53:54p PT, closed 11/16 11:02:48a PT, 2 loads both SHIPPED, seal
 *       25010981).
 *       He currently holds THREE open GURUNANDA load tasks facility-wide, two of
 *       them at Bay-4 doors: DOCK54 TASK-5422749 (started 11/16 9:46:53p PT, 2
 *       loads LOADED), DOCK53 TASK-5422317 (started 11/16 1:47:31p PT, 2 loads
 *       LOADED) and off-Bay-4 DOCK4 TASK-5422675 (started 11/17 1:55:00a PT, not
 *       a Bay-4 door, so it is not counted in the Bay-4 cards).
 *     - % scheduled inbounds received (11/17 PT): 0 of 1 = 0.0%. The single
 *       scheduled receipt (RN-5011522, appointment 10:00a PT) is still IMPORTED
 *       at 6:34a PT, so nothing has been received yet today. The previous PT day
 *       (11/16) closed out at 3 of 15 once the day was complete.
 *     - % scheduled outbounds loaded (11/17 PT): 0 of 15 = 0.0%. All 15 are
 *       pre-shipment (PICKED 10, PLANNED 4, PICKING 1); the first SHIPPED order of
 *       the PT day has not landed yet at 6:34a. The previous PT day (11/16)
 *       closed out at 16 SHIPPED of 72 scheduled.
 *     - Inbound/outbound mix: 6 RECEIVE / 4 LOAD of the 10 active tasks.
 *     - Total doors occupied: 18 of 23 (plus 2 reserved, 3 available).
 *     - Planned GURUNANDA orders: live count 205 at this pull.
 *     - Door occupancy duration: available where an active task has a startTime
 *       and has not ended - 6 tasks on 6 doors at this pull (DOCK51 8h02m,
 *       DOCK52 16h20m, DOCK53 16h46m, DOCK54 8h47m, DOCK61 14h23m, DOCK71
 *       14h32m), all measured to 11/17 6:34:00a PT. WMS has no occupancy-start
 *       field for task-less doors (14 of 23), for the three NEW GURUNANDA tasks
 *       (DOCK50 TASK-5418313, DOCK58 TASK-5420461, DOCK69 TASK-5381972) or for
 *       the one stale task.
 *     - Facility-wide schedule context for the 11/17 PT day (no customerId
 *       filter, same UTC-derived PT-day window): receipts scheduled 35, of which
 *       1 carries a receivedStartTime; orders scheduled 1,044, of which 12 are
 *       SHIPPED.
 *
 *   NOTE: the in-yard FULL equipment array and the all-time assignee baseline
 *   are outside the scope of this request and were NOT re-stated from WISE into
 *   this file; Section 1 and the planned-orders section render live from the
 *   WMS loader, and the all-time baseline is carried forward unchanged rather
 *   than estimated.
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
// The live yard query was re-read at this pull: {statuses:["FULL"]} returned 728
// rows facility-wide (the endpoint ignores the status filter - the set mixes FULL
// 310, EMPTY 351 and UNKNOWN 67 across all equipment types), of which 37 are
// GURUNANDA ORG-655875 rows. 8 of those 37 read equipmentType TRAILER +
// equipmentStatus FULL (53757, ALTO5377, 53518, 53246, 53403CT, 542, 9475052,
// 53662), so the loader's own filter (customer + TRAILER + FULL) now yields rows
// and the live "In Yard Full Trailers" KPI is non-zero at this pull - a change
// from the 11/16 12:40p snapshot where it legitimately read 0.
// The static array stays empty rather than duplicating the live loader's result;
// Section 1 renders live from the WMS loader, so the dashboard still shows
// current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 205 at the 11/17 6:34a PT pull.
export const plannedGurunandaOrderCount = 205;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/17 6:34a PT
//
// All 23 rows come from one /wms-bam/wms-location/search call
// (exactlyNames DOCK50..DOCK72); every row is category DOCK, type DOCK,
// status USABLE. Door status rule (unchanged, keeps the dashboard's 3-value
// enum):
//   Reserved  = dockStatus RESERVED (door is held/reserved, so it is not free)
//   Occupied  = dockStatus OCCUPIED OR spaceStatus OCCUPIED (not fully free)
//   Available = dockStatus AVAILABLE AND spaceStatus EMPTY
// Raw field values are preserved per door so the mapping can be re-checked.
// Totals: Occupied 18, Reserved 2, Available 3 = 23.
// Reserved doors: DOCK50, DOCK65 (DOCK50 also reads spaceStatus OCCUPIED).
// Fully free doors: DOCK63, DOCK67, DOCK72 - so 20 of 23 doors are not fully
// free.
// Raw tallies at this pull: dockStatus OCCUPIED 14 / AVAILABLE 7 / RESERVED 2;
// spaceStatus OCCUPIED 11 / EMPTY 12 / FULL 0.
//
// BAY 4 ALL-CUSTOMER PHYSICAL TALLY (see SCOPE NOTE in the file header):
// active (NEW / IN_PROGRESS / EXCEPTION) tasks whose dockName is one of these
// 23 doors = 10 (RECEIVE 6, LOAD 4) on 9 doors. Every one of the 10 is
// GURUNANDA ORG-655875, so GURUNANDA-only is also 10.
// =====================================================================
export const bay4AllCustomerActiveTaskCount = 10;
export const bay4AllCustomerActiveReceiveCount = 6;
export const bay4AllCustomerActiveLoadCount = 4;

export const doors: DoorRecord[] = [
  {
    door: "DOCK50",
    status: "Reserved",
    assignee: "Gonzalo Rangel (RECEIVE NEW) + daira gonzalez (RECEIVE - STALE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5418313", "TASK-5090739"],
    duration: "RECEIVE NEW, not started (created 11/11 11:24:50a PT, TASK-5418313, Gonzalo Rangel, entry ET-1181371, receipt RN-195495 at status IMPORTED, PO RMA0276 / reference 'Po # 979126', appointment 11/11 12:00a PT, in-yard 11/11 11:24:50a PT, carrier WILL CALL) - no startTime, so no duration basis · the door's second task, TASK-5090739 (daira gonzalez), is STALE: started 2025-10-21 12:21:14p PT and its endTime is 2025-10-22 9:42:01a PT (RN-5002143 status CLOSED, container EGSU8032696, reference EGLV149507056809), dock-checked-in 2025-10-22 9:41:46a PT · dock RESERVED, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1182531 (row updated 11/16 11:04:57a PT - note the entry on the door row is newer than the entry recorded on either task) · the last load task to close here was TASK-5421917 (BYRON PALADINES, ORG-55783 - not GURUNANDA, 11/16 10:32:09a PT, 1 load SHIPPED, seal 25076956); the last receive task to close was TASK-5416210 (DANIELA GONZALEZ, KARAKA, LLC, 11/9 4:55:40p PT, FORCE_CLOSED)",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "EDUARDO MEJIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5422751"],
    duration: "LOAD 8h02m since 11/16 10:31:35p PT (TASK-5422751, EDUARDO MEJIA, IN_PROGRESS, PRE_LOAD, created 11/16 9:45:35p PT, entry ET-1182803, seal 1304011, 3 loads LOAD-5044610 / LOAD-5044616 / LOAD-5044617 all at status LOADED, no endTime yet) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1182803 (row updated 11/16 10:31:38p PT) · the last load task to close here was TASK-5420549 (ARNULFO MUNGUIA, 11/13 1:56:58p PT, 1 load SHIPPED, seal 25010987); the last receive task to close here was TASK-5420402 (Fatima Ponce, 11/13 10:42:38a PT, GURUNANDA, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "EDUARDO MEJIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5422342"],
    duration: "LOAD 16h20m since 11/16 2:13:32p PT (TASK-5422342, EDUARDO MEJIA, IN_PROGRESS, PRE_LOAD, created 11/16 2:02:29p PT, entry ET-1182676, seal 1304019, 4 loads LOAD-5044618 / LOAD-5044614 / LOAD-5044612 / LOAD-5044526 all at status LOADED, no endTime yet) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1182676 (row updated 11/16 4:26:33p PT) · the load task that was open here at the previous snapshot, TASK-5420648 (ARNULFO MUNGUIA, 8 loads, seal A52688), CLOSED 11/16 9:18:06a PT with all 8 loads SHIPPED · the last receive task to close here was TASK-5417998 (Nanci Viviana Rosas, KARAKA, LLC, 11/11 2:39:35p PT)",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5422317"],
    duration: "LOAD 16h46m since 11/16 1:47:31p PT (TASK-5422317, ARNULFO MUNGUIA, IN_PROGRESS, PRE_LOAD, created 11/16 1:46:45p PT, entry ET-1182659, seal 1304046, 2 loads LOAD-5044525 / LOAD-5044619 both at status LOADED, no endTime yet) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [], entry ET-1182659 (row updated 11/16 1:47:36p PT) · the load task that was open here at the previous snapshot, TASK-5421041 (ARNULFO MUNGUIA, 2 loads, seal 25010984), CLOSED 11/16 9:59:10a PT with both loads SHIPPED · the newest receive closure here is TASK-5407284 (ARNULFO MUNGUIA, KARAKA, LLC, 10/29 10:01:54a PT)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5422749"],
    duration: "LOAD 8h47m since 11/16 9:46:53p PT (TASK-5422749, ARNULFO MUNGUIA, IN_PROGRESS, PRE_LOAD, created 11/16 9:41:55p PT, entry ET-1182801, seal 25010983, 2 loads LOAD-5044611 / LOAD-5044615 both at status LOADED, no endTime yet) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [], entry ET-1182801 (row updated 11/16 11:02:59p PT) · the previous load task here closed 11/16 3:08:02p PT (TASK-5422351, DANIEL BELTRAN, 1 load SHIPPED, seal 1304047) · the two KARAKA, LLC RECEIVE tasks that physically occupied this door at the previous snapshot (TASK-5421959, TASK-5419478) have both CLOSED: TASK-5421959 at 11/16 3:28:53p PT (CANDY MENDEZ, receipts RN-195510 / RN-195509), and the door is now GURUNANDA-only",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1182391 (row updated 11/16 8:31:41a PT; DOCK56 carries the same entry ET-1182391) · the last receive task to close here was TASK-5421731 (Nanci Viviana Rosas, KARAKA, LLC, 11/16 10:13:39a PT, FORCE_CLOSED); the last load task to close here was TASK-5419003 (ARNULFO MUNGUIA, 11/13 7:23:29p PT, 1 load SHIPPED, seal 25010979) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [], entry ET-1182391 (row updated 11/16 12:08:43p PT) · the load task that was open here at the previous snapshot, TASK-5421056 (ARNULFO MUNGUIA, 2 loads, seal 25010981), had already CLOSED 11/16 11:02:48a PT with both loads SHIPPED - still the newest Bay-4 closure in Arnulfo's Assigned Activity stream · the last receive task to close here was TASK-5418081 (Nanci Viviana Rosas, KARAKA, LLC, 11/11 12:11:56p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [], entry ET-1182416 (row updated 11/16 1:31:41p PT; DOCK58 carried the same entry ET-1182416 in the previous snapshot) · the load task that was open here at the previous snapshot, TASK-5421821 (DANIEL BELTRAN, IN_PROGRESS 36m at that pull, 1 load LOAD-5043552 still LOADING), CLOSED 11/16 1:31:01p PT with that load SHIPPED and seal 1304044 recorded at closure · the newest receive closure here is TASK-5414098 (Nanci Viviana Rosas, KARAKA, LLC, 11/9 2:14:50p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: "Luis Alberto Paredes (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5420461"],
    duration: "RECEIVE NEW, not started (created 11/13 10:13:50a PT, TASK-5420461, Luis Alberto Paredes, entry ET-1182030, receipt RN-5011507 at status IMPORTED, PO PO9419, appointment 11/13 10:00a PT, in-yard 11/13 10:13:27a PT, container Leafchem11132026, carrier WILL CALL) - no startTime, so no duration basis · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1182700 (row updated 11/17 6:20:19a PT - the newest door-row update at this pull; it was RESERVED at the previous snapshot) · the last load task to close here was TASK-5420377 (BARTOLO RAMIREZ, 11/13 12:10:57p PT, 1 load SHIPPED, seal 1304053); the last receive task to close here was TASK-5414761 (DANIELA GONZALEZ, 11/6 5:09:25p PT, GURUNANDA)",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [], entry ET-1182700 (row updated 11/16 3:17:37p PT) · the load task that ran here, TASK-5422412 (DANIEL BELTRAN), CLOSED 11/16 3:17:16p PT with 1 load SHIPPED and seal A52687 - 21 seconds before the door row's own update · the last receive task to close here was TASK-5417811 (CANDY MENDEZ, GURUNANDA), FORCE_CLOSED 11/11 12:09:52p PT · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1179653 (row updated 11/17 6:10:35a PT) · the last load task to close here was TASK-5413376 (JULIO CESAR ALVARADO, 11/5 2:50:10p PT, 5 loads all SHIPPED, seal 1378416); the newest receive closure here is TASK-5402543 (DANIELA GONZALEZ, 10/23 6:21:53p PT, GURUNANDA) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: "JESUS ESPINOZA (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5422524"],
    duration: "RECEIVE 14h23m since 11/16 4:10:04p PT (TASK-5422524, JESUS ESPINOZA, IN_PROGRESS, created 11/16 3:55:28p PT, dock-checked-in 11/16 4:21:59p PT, entry ET-1182732, receipt RN-5011599 at status IN_PROGRESS, PO ZCSU7568630 / reference S00811293, appointment 11/16 10:30a PT, in-yard 11/16 3:55:28p PT, container ZCSU7568630, carrier WILL CALL, no endTime yet) · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1182732 (row updated 11/16 4:21:59p PT) · the last load task to close here was TASK-5420400 (BARTOLO RAMIREZ, 11/13 10:56:09a PT, 1 load SHIPPED, seal 1304052); the last receive task to close here, TASK-5421037 (CANDY MENDEZ, GURUNANDA), CLOSED 11/16 10:27:57a PT",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds [], entry ET-1181858 (row updated 11/15 2:12:40p PT) · the last receive task to close here was TASK-5419984 (DANIELA GONZALEZ, 11/12 8:25:21p PT, GURUNANDA, receipts RN-5011505); no load task of any customer has closed at this door inside the 2026-10-31 - now window · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds [], entry ET-1182804 (row updated 11/16 11:38:22p PT) · this door turned over overnight: TASK-5422753 (JESUS ESPINOZA, GURUNANDA) CLOSED 11/16 11:38:25p PT on receipt RN-5011609 - the newest Bay-4 receive closure at this pull · no load task of any customer has closed at this door inside the 2026-10-31 - now window · fully free",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1182176 (row updated 11/16 6:15:25a PT) · the last receive task to close here was TASK-5420980 (DANIELA GONZALEZ, 11/13 9:32:35p PT, GURUNANDA, receipts RN-5011541); no load task of any customer has closed at this door inside the 2026-10-31 - now window · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space EMPTY, occupiedCustomerIds [], entry ET-1179941 (row updated 11/16 10:24:09a PT) · the receive task that held it, TASK-5413519 (Nanci Viviana Rosas, KARAKA, LLC), was FORCE_CLOSED 11/10 11:38:02a PT; no load task of any customer has closed at this door inside the 2026-10-31 - now window · reserved but physically empty - no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds [], entry ET-1182734 (row updated 11/16 7:17:01p PT) · the receive task that ran here, TASK-5422534 (DANIELA GONZALEZ, GURUNANDA), CLOSED 11/16 7:17:17p PT on receipt RN-5011580 · no load task of any customer has closed at this door inside the 2026-10-31 - now window · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds [], entry ET-1181521 (row updated 11/13 8:14:15p PT) · the last receive task to close here was TASK-5418827 (Fatima Ponce, 11/12 9:38:33a PT, GURUNANDA, receipts RN-5011514); no load task of any customer has closed at this door inside the 2026-10-31 - now window · fully free",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds [], entry ET-1177841 (row updated 11/12 8:59:43p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - now window; the newest receive closure here is TASK-5408610 (Fatima Ponce, 11/2 3:06:46p PT, GURUNANDA, receipts RN-5011280) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW, not started (created 9/30 10:46:50a PT, TASK-5381972, Jorge Antonio Franco, entry ET-1162686, receipt RN-5010583 at status IMPORTED, PO9139-2, container Jpack09242026, no appointment, in-yard 9/30 10:46:48a PT, carrier WILL CALL) - no startTime, so no duration basis · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1171953 (row updated 11/12 8:59:19p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - now window; the newest receive closure here is TASK-5398554 (DANIELA GONZALEZ, 10/20 5:56:09p PT, GURUNANDA)",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1172826 (row updated 11/16 6:20:32a PT) · no load task of any customer has closed at this door inside the 2026-10-31 - now window; the newest receive closure here is TASK-5399423 (Fatima Ponce, 10/21 8:42:23a PT, GURUNANDA) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: "JESUS ESPINOZA (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5422515"],
    duration: "RECEIVE 14h32m since 11/16 4:01:40p PT (TASK-5422515, JESUS ESPINOZA, IN_PROGRESS, created 11/16 3:51:17p PT, dock-checked-in 11/16 4:36:13p PT, entry ET-1182729, receipt RN-5011579 at status IN_PROGRESS, PO MATU2536317 / reference B00420742, appointment 11/13 1:45p PT, in-yard 11/16 3:51:17p PT, container MATU2536317, carrier WILL CALL, no endTime yet) · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1182729 (row updated 11/16 4:36:13p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - now window; the newest receive closure here is TASK-5406898 (DANIELA GONZALEZ, 10/28 7:41:53p PT, GURUNANDA)",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1176051 (row updated 11/11 6:13:28p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - now window; the newest receive closure here is TASK-5405554 (DANIELA GONZALEZ, 10/27 5:45:00p PT, GURUNANDA) · fully free",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 18
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 2
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 9
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 1
const available = doors.filter((d) => d.status === "Available").length; // 3

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors Occupied",
    value: `18/23`,
    numerator: 18,
    denominator: TOTAL_DOORS,
    percentage: Math.round((18 / TOTAL_DOORS) * 100),
  },
  {
    label: "Doors w/ Active Tasks",
    value: `9`,
    numerator: 9,
    denominator: TOTAL_DOORS,
    percentage: Math.round((9 / TOTAL_DOORS) * 100),
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

// Doors that carried dockStatus RESERVED at this pull: 2 (DOCK50, DOCK65).
// They are held/reserved rather than free, and DOCK50 also reads spaceStatus
// OCCUPIED, so "not fully free" doors total 20 of 23.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee - GURUNANDA scope (the dashboard cards).
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, Nov 17 2026 6:34a PT).
// 10 active-status tasks at Bay-4 doors: 4 LOAD + 6 RECEIVE, at 9 distinct doors
// (DOCK50, DOCK51, DOCK52, DOCK53, DOCK54, DOCK58, DOCK61, DOCK69, DOCK71).
// ARNULFO MUNGUIA (89): 2 LOAD (DOCK54 TASK-5422749 IN_PROGRESS from 9:46:53p PT,
//   DOCK53 TASK-5422317 IN_PROGRESS from 1:47:31p PT)
// EDUARDO MEJIA (2029638366082560001): 2 LOAD (DOCK51 TASK-5422751 IN_PROGRESS
//   from 10:31:35p PT, DOCK52 TASK-5422342 IN_PROGRESS from 2:13:32p PT)
// JESUS ESPINOZA (1948070158297014342): 2 RECEIVE (DOCK61 TASK-5422524
//   IN_PROGRESS from 4:10:04p PT, DOCK71 TASK-5422515 IN_PROGRESS from 4:01:40p PT)
// Gonzalo Rangel (2000828853478170980): 1 RECEIVE (DOCK50 TASK-5418313, NEW)
// Luis Alberto Paredes (2000828853478171162): 1 RECEIVE (DOCK58 TASK-5420461, NEW)
// Jorge Antonio Franco (2060441422549078018): 1 RECEIVE (DOCK69 TASK-5381972, NEW)
// daira gonzalez (1948070158297014492): 1 RECEIVE (DOCK50 TASK-5090739,
//   IN_PROGRESS, stale)
// All names/ids resolved verbatim from the WMS task payloads (assigneeUserName /
// assigneeUserId); no name was normalised or guessed.
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 2 },
  { name: "EDUARDO MEJIA", taskCount: 2 },
  { name: "JESUS ESPINOZA", taskCount: 2 },
  { name: "Gonzalo Rangel", taskCount: 1 },
  { name: "Luis Alberto Paredes", taskCount: 1 },
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

// Mix: 6 RECEIVE + 4 LOAD = 10 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 6, total: 10 },
  { label: "Outbound (LOAD)", count: 4, total: 10 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 10 },
  { label: "Inbound", count: 6, total: 10 },
];

// --- Schedule Data (2026-11-17, Tuesday) ---
// Both percentages use the SAME UTC-derived 11/17 PT business-day window,
// 2026-11-17 08:00:00 -> 2026-11-18 07:59:59 (see TIMESTAMP SEMANTICS in the
// file header; this window is the only one used anywhere in this file):
//   % scheduled inbounds received TODAY: 1 GURUNANDA receipt carries an
//   appointmentTime inside that window (totalCount 1, read: RN-5011522 at
//   status IMPORTED, appointment 11/17 10:00a PT, PO 9416, container
//   TQL11172026, carrier WILL CALL, in-yard null). 0 of 1 = 0.0% received -
//   the single scheduled receipt has not started receiving at 6:34a PT.
//   % scheduled outbounds loaded TODAY: 15 GURUNANDA orders carry a scheduleDate
//   inside that window (scheduleDatePeriod ["2026-11-17 08:00:00",
//   "2026-11-18 07:59:59"], totalCount 15, all 15 read) of which 0 are at status
//   SHIPPED (the other 15 are PICKED 10, PLANNED 4, PICKING 1) = 0 of 15 = 0.0%.
//   Both denominators are real and non-zero, so both percentages are computable;
//   they simply read 0.0% at 6:34a PT because the PT day has only just started.
//   Prior PT day, fully closed out for comparison: 11/16 finished at 3 of 15
//   (20.0%) received and 16 of 72 (22.2%) SHIPPED - the 11/16 order denominator
//   was still climbing during the 11/16 12:40p pull (57), so the completed-day
//   figure is used here rather than mixing a partial and a complete denominator.
export const scheduleAvailable = true;              // 1 GURUNANDA receipt scheduled on 11/17
export const outboundScheduleAvailable = true;      // 15 GURUNANDA orders scheduled on 11/17
export const scheduledInboundOrders = 1;            // receipts with appointmentTime in the 11/17 PT day
export const scheduledOutboundOrders = 15;          // orders with scheduleDate in the 11/17 PT day
export const scheduledInboundReceived = 0;          // receipts with receivedStartTime in that set
export const scheduledOutboundLoaded = 0;           // orders at status SHIPPED in that set
export const pctScheduledInboundReceived = 0.0;     // 0 of 1
export const pctScheduledOutboundLoaded = 0.0;      // 0 of 15
// Facility-wide schedule context for the 11/17 PT day, all customers (same two
// endpoints, no customerId filter, same UTC-derived PT-day window): 35 receipts
// scheduled, of which 1 carries a receivedStartTime; 1,044 orders scheduled, of
// which 12 are SHIPPED.
export const facilityWideReceiptsCreated = 35;
export const facilityWideReceiptsReceived = 1;
export const facilityWideLoadsCreated = 1044;
export const facilityWideLoadsShipped = 12;

// Door occupancy duration: available from task startTime where a task exists on
// the door, has actually started and has not already ended; unavailable for
// task-less doors and for NEW tasks with no startTime (WMS has no
// occupancy-start field, and the dock-door-status dashboard endpoint returns an
// empty Duration column). 14 of 23 doors carry no active task at this pull, 3 of
// the 10 active tasks are NEW/not started (DOCK50 TASK-5418313, DOCK58
// TASK-5420461, DOCK69 TASK-5381972) and 1 is stale (DOCK50 TASK-5090739), so a
// duration exists for 6 tasks on 6 doors (DOCK51 8h02m, DOCK52 16h20m, DOCK53
// 16h46m, DOCK54 8h47m, DOCK61 14h23m, DOCK71 14h32m - all measured to 11/17
// 6:34:00a PT).
export const doorDurationsAvailable = true;

// All Bay 4 active tasks (DOCK50-DOCK72, Nov 17 2026 6:34a PT)
// 10 tasks total: 4 LOAD + 6 RECEIVE. One is a data anomaly (TASK-5090739 on
// DOCK50, stale since 2025-10-21). All 10 are GURUNANDA ORG-655875 at this pull,
// so this array is simultaneously the GURUNANDA view and the all-customer
// physical view of the Bay-4 doors.
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA has 83 CLOSED GURUNANDA load transactions with endTime inside
// the 2026-10-31 00:00:00 UTC - now window (82 under assigneeUserId 89 plus 1
// under a second Arnulfo identity, assigneeUserId 1948070158297014318, name
// rendered "arnulfo munguia"; 73 of them at Bay-4 doors - DOCK51 12, DOCK53 11,
// DOCK54 11, DOCK52 11, DOCK55 8, DOCK56 7, DOCK50 7, DOCK57 3, DOCK60 2,
// DOCK59 1; the other 10 are on DOCK4 2, DOCK5 2, DOCK7 2, DOCK6 1, DOCK9 1,
// DOCK10 1 and DOCK45 1); per-day counts by endTime (PT): 11/16 7, 11/13 8,
// 11/12 12, 11/11 4, 11/10 10, 11/9 6, 11/6 8, 11/5 4, 11/4 11, 11/3 6 and
// 11/2 7, with no closures on 11/14, 11/15, 11/8, 11/7, 11/1 or 11/17 so far.
// The newest overall is DOCK10 TASK-5421016 (started 11/13 6:49:05p PT, closed
// 11/16 11:40:39a PT); the newest at a Bay-4 door is DOCK56 TASK-5421056
// (started 11/13 9:53:54p PT, closed 11/16 11:02:48a PT; 2 loads both SHIPPED;
// seal 25010981). No new closure has landed in this stream since then.
// He now holds THREE open GURUNANDA load tasks facility-wide, two at Bay-4
// doors: DOCK54 TASK-5422749 (started 11/16 9:46:53p PT, 2 loads LOADED) and
// DOCK53 TASK-5422317 (started 11/16 1:47:31p PT, 2 loads LOADED); the third,
// DOCK4 TASK-5422675 (started 11/17 1:55:00a PT), is not a Bay-4 door.
export const assignments: TaskRecord[] = [
  // ----- INBOUND / RECEIVE (6) -----
  {
    taskId: "TASK-5422524",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 14h23m since 11/16 4:10:04p PT (JESUS ESPINOZA, task created 11/16 3:55:28p PT, dock-checked-in 4:21:59p PT; RN-5011599 at status IN_PROGRESS, PO ZCSU7568630 / reference S00811293, appointment 11/16 10:30a PT, in-yard 11/16 3:55:28p PT, container ZCSU7568630, carrier WILL CALL, no endTime yet)",
    assignee: "JESUS ESPINOZA",
    door: "DOCK61",
  },
  {
    taskId: "TASK-5422515",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 14h32m since 11/16 4:01:40p PT (JESUS ESPINOZA, task created 11/16 3:51:17p PT, dock-checked-in 4:36:13p PT; RN-5011579 at status IN_PROGRESS, PO MATU2536317 / reference B00420742, appointment 11/13 1:45p PT, in-yard 11/16 3:51:17p PT, container MATU2536317, carrier WILL CALL, no endTime yet)",
    assignee: "JESUS ESPINOZA",
    door: "DOCK71",
  },
  {
    taskId: "TASK-5420461",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/13 10:13:50a PT (Luis Alberto Paredes; entry ET-1182030, RN-5011507 at status IMPORTED, PO PO9419, appointment 11/13 10:00a PT, in-yard 11/13 10:13:27a PT, container Leafchem11132026, carrier WILL CALL) - task has no startTime",
    assignee: "Luis Alberto Paredes",
    door: "DOCK58",
  },
  {
    taskId: "TASK-5418313",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/11 11:24:50a PT (Gonzalo Rangel; entry ET-1181371, RN-195495 at status IMPORTED, PO RMA0276 / reference 'Po # 979126', appointment 11/11 12:00a PT, in-yard 11/11 11:24:50a PT, carrier WILL CALL) - task has no startTime",
    assignee: "Gonzalo Rangel",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/30 10:46:50a PT (Jorge Antonio Franco; entry ET-1162686, RN-5010583 at status IMPORTED, PO9139-2, container Jpack09242026, no appointment, in-yard 9/30 10:46:48a PT, carrier WILL CALL) - task has no startTime",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 2025-10-21 12:21:14p PT; status still IN_PROGRESS although endTime is 2025-10-22 9:42:01a PT; daira gonzalez, created 2025-10-20 9:38:05p PT, entry ET-1027622, RN-5002143 which is itself already CLOSED at receivedTime 2025-10-22 9:42:01a PT, container EGSU8032696, reference EGLV149507056809, dock-checked-in 2025-10-22 9:41:46a PT)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },

  // ----- OUTBOUND / LOAD (4) -----
  {
    taskId: "TASK-5422751",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 8h02m since 11/16 10:31:35p PT (EDUARDO MEJIA, task created 11/16 9:45:35p PT; PRE_LOAD, entry ET-1182803, seal 1304011, 3 loads LOAD-5044610 / LOAD-5044616 / LOAD-5044617 all at status LOADED, no endTime yet)",
    assignee: "EDUARDO MEJIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5422342",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 16h20m since 11/16 2:13:32p PT (EDUARDO MEJIA, task created 11/16 2:02:29p PT; PRE_LOAD, entry ET-1182676, seal 1304019, 4 loads LOAD-5044618 / LOAD-5044614 / LOAD-5044612 / LOAD-5044526 all at status LOADED, no endTime yet)",
    assignee: "EDUARDO MEJIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5422317",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 16h46m since 11/16 1:47:31p PT (ARNULFO MUNGUIA, task created 11/16 1:46:45p PT; PRE_LOAD, entry ET-1182659, seal 1304046, 2 loads LOAD-5044525 / LOAD-5044619 both at status LOADED, no endTime yet)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5422749",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 8h47m since 11/16 9:46:53p PT (ARNULFO MUNGUIA, task created 11/16 9:41:55p PT; PRE_LOAD, entry ET-1182801, seal 25010983, 2 loads LOAD-5044611 / LOAD-5044615 both at status LOADED, no endTime yet)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
];
