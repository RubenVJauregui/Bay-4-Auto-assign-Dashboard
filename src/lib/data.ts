/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-17 09:59a PT (live WISE / WMS-BAM APIs)
 *   Every value below was re-read live at ONE reference
 *   (2026-11-17T17:59:15Z = 09:59:15a PT). No value in this file is carried over
 *   from an earlier snapshot. Source counts quoted below were read across the
 *   17:59:15-18:00:00Z (09:59:15-10:00:00a PT) pull window. Reads were made in
 *   WISE raw-UTC mode (no item-time-zone header) - see QUERY MODE WARNING below
 *   before re-running any of these queries.
 *
 *   TIMESTAMP SEMANTICS - single authority for this file, verified again at this
 *   pull: WISE/WMS-BAM returns task, receipt, order and appointment timestamps as
 *   UTC strings with NO offset. They are NOT facility wall-clock. Render PT with a
 *   real zone conversion: PST = UTC-8 (on/after 2026-11-01), PDT = UTC-7 (before
 *   2026-11-01). Evidence read at this pull: TASK-5423116 createdTime
 *   2026-11-17T17:54:06 = 11/17 09:54:06a PT; TASK-5423064 createdTime
 *   2026-11-17T17:26:30 = 11/17 09:26:30a PT; RN-5011522 appointmentTime
 *   2026-11-17T18:00:00 = 11/17 10:00a PT; the closed DOCK53 receive task
 *   TASK-5407284 endTime 2026-10-29T18:01:54 = 10/29 11:01:54a PDT, which a flat
 *   UTC-8 read would wrongly render as 10:01:54a.
 *   Consequently "the 11/17 PT business day" used for the two schedule
 *   percentages is the UTC window 2026-11-17 08:00:00 -> 2026-11-18 07:59:59,
 *   and that is the ONLY window used in this file.
 *   QUERY MODE WARNING - the pull behind these numbers was made WITHOUT the
 *   item-time-zone header, i.e. the raw-UTC mode documented above. The app's own
 *   loader (src/lib/wms-loader.ts) DOES send item-time-zone America/Los_Angeles.
 *   Both modes were run side by side at this pull for the receipt denominator and
 *   agree exactly: the raw-UTC PT-day window above returned 3 receipts
 *   (RN-195785, RN-195778, RN-5011522) and the PT-header calendar window
 *   2026-11-17 00:00:00 -> 23:59:59 returned the same 3 receipts. Do NOT swap in
 *   the naive raw-UTC calendar day: that window (2026-11-17 00:00:00 ->
 *   23:59:59 with no timezone header) returns 9 receipts, 6 of which are evening
 *   11/16-PT appointments (RN-5011609 01:30Z, RN-5011532 and RN-5011523 04:00Z,
 *   RN-5011608 05:00Z, RN-5011531 and RN-5011516 07:00Z = 11/16 5:30p / 8:00p /
 *   9:00p / 11:00p PT) that belong to the previous business day; that wrong window
 *   would also report 2 of its 9 as already received (both are 11/16-PT arrivals).
 *   Pick one mode and its matching window. For the outbound schedule both windows
 *   were re-tested at this pull and return the identical 18 orders -
 *   scheduleDate is date-only and stored at 08:00:00 UTC - so the window choice
 *   only changes results for receipt appointmentTime.
 *   Durations are measured to the 2026-11-17 09:59:15a PT pull reference.
 *
 *   SOURCES USED AT THIS PULL:
 *     - POST /wms-bam/wms-location/search, body {exactlyNames:[DOCK50..DOCK72]}
 *       -> code 0, 23/23 rows (name, id, category=DOCK, type=DOCK,
 *       status=USABLE on all 23, dockStatus, spaceStatus, occupiedCustomerIds,
 *       entryId, updatedTime). Door rows are used for "Door Utilization".
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer
 *       filter) -> totalCount 51, all 51 read; exactly 7
 *       of them sit on a Bay-4 dockName (IN_PROGRESS + NEW across
 *       7 tasks, all GURUNANDA). No facility load task carries a null dockName.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer
 *       filter) -> totalCount 93, all 93 read; 6 of them
 *       sit on a Bay-4 dockName (all GURUNANDA). 8 of the 93 carry no dockName
 *       at all (not yet docked) and none of them is a Bay-4 door.
 *     - POST /wms-bam/inbound/receipt/search-by-paging
 *       {customerId: ORG-655875, appointmentTimeFrom "2026-11-17 08:00:00",
 *       appointmentTimeTo "2026-11-18 07:59:59"} -> totalCount 3, all read:
 *       RN-195785 (IMPORTED, PO PO9389, appt 11/17 12:00:00a PT, ref 125-24123772, container not recorded, in-yard none, receivedStartTime none, carrier ORG-825)
 *       RN-195778 (IMPORTED, PO GN11172026UNIS-1330, appt 11/17 12:00:00a PT, ref GN11172026UNIS-1330, container 53678, in-yard none, receivedStartTime none, carrier ORG-825)
 *       RN-5011522 (IMPORTED, PO PO 9416, appt 11/17 10:00:00a PT, ref none, container TQL11172026, in-yard none, receivedStartTime none, carrier ORG-825)
 *       3 scheduled receipts and 0 started receipts = 0 of 3 received.
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, scheduleDatePeriod ["2026-11-17 08:00:00",
 *       "2026-11-18 07:59:59"]} -> totalCount 18, all 18 read; statuses PICKED 11,
 *       PLANNED 3, IMPORTED 3, PICKING 1, SHIPPED 0
 *       -> 0 of 18 loaded.
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], endTimeFrom "2026-10-31 00:00:00",
 *       endTimeTo "2026-11-18 23:59:59" -> totalCount 733 (all customers), all
 *       733 read (oldest endTime in the window is 2026-10-31 00:11:13Z). The
 *       ARNULFO MUNGUIA / GURUNANDA subset is measured by a dedicated query
 *       instead (customerId ORG-655875 + assigneeUserIds [89,
 *       1948070158297014318] + the same endTime window) -> totalCount 85, all 85
 *       read, 74 of them at Bay-4 doors (his "Assigned Activity" stream).
 *       The newest load closure ANYWHERE in the facility is 11/17 9:48:48a PT
 *       (TASK-5422998, DOCK161, VICTOR LOPEZ, ORG-800009, seal 25076442,
 *       1 load SHIPPED). Three load tasks closed at Bay-4 doors in the 11/17 PT
 *       day: DOCK52 TASK-5422342 (9:00:56a), DOCK55 TASK-5422941 (9:03:47a) and
 *       DOCK56 TASK-5422898 (9:43:33a) - the same three as the 09:49a pull.
 *       NOTE: orderBy/sort are not supported on this endpoint (they null out
 *       totalCount); sort client-side after reading.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], sorted endTime DESC -> totalCount
 *       17818; the newest 3,000 were read (oldest endTime in the read set is
 *       2026-08-27 02:24:46Z; newest closure 11/17 9:57:37a PT, TASK-5422903,
 *       DOCK16, Fatima ponce). No Bay-4 receive task has closed in the 11/17 PT
 *       day yet; the newest Bay-4 receive closure is still DOCK63 TASK-5422753
 *       (11/16 11:38:25p PT, JESUS ESPINOZA).
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, status: PLANNED} -> totalCount 186.
 *     - Task-name keyword RE-TESTED at this pull: the load-task `keyword` filter
 *       is still a NO-OP. "Guru live out / in assign to Arnulfo", "Guru live out"
 *       and a nonsense string ("zzzz-no-such-task-zzzz") all return the same
 *       facility total, 22,660. The order-plan endpoint behaves the same way
 *       (106,016 for both the real phrase and a nonsense string), so no plan or
 *       task group named "Guru live out / in assign to Arnulfo" can be resolved
 *       through keyword search. All 13 active Bay-4 tasks carry projectId null, so
 *       there is no named task group to resolve either. The "Guru live out / in
 *       assign to Arnulfo" stream is therefore reported as ARNULFO MUNGUIA's
 *       task-assignment transactions on the GURUNANDA live-out/live-in work, and
 *       nothing is invented.
 *
 *   SCOPE NOTE (read before comparing to an earlier snapshot):
 *     The line-level metrics on this dashboard are GURUNANDA-scoped (the same
 *     customer scope the dashboard has always published). At THIS pull that
 *     distinction is inert: all 13 active Bay-4 tasks across all customers are
 *     GURUNANDA (ORG-655875), so the GURUNANDA cards and the physical tallies
 *     agree exactly. bay4AllCustomerActiveTaskCount / ...ReceiveCount /
 *     ...LoadCount are exported anyway so a future non-GURUNANDA divergence stays
 *     explicit.
 *
 *   Key state at this pull:
 *     - DOOR STATUS: occupied 17, reserved 3, available 3 (17+3+3 = 23). Only
 *       DOCK63, DOCK67 and DOCK72 are fully free (dock AVAILABLE + space EMPTY).
 *       Raw dockStatus: OCCUPIED 13, AVAILABLE 7, RESERVED 3. Raw spaceStatus:
 *       OCCUPIED 12, EMPTY 11. The three RESERVED doors are DOCK53, DOCK54 and
 *       DOCK65 (DOCK53 spaceStatus OCCUPIED, its row updated 09:54:09a PT - 3
 *       seconds after the NEW DOCK53 load task TASK-5423116 was created at 09:54:06a;
 *       DOCK54 spaceStatus OCCUPIED, entry ET-1182990, updated 09:47:30a PT, 1 second
 *       after the NEW DOCK54 load task TASK-5423105 was created; DOCK65 spaceStatus
 *       EMPTY). A reservation is a held door, so it is reported in its own
 *       "Reserved" bucket rather than folded into "Occupied"; 20 of the 23 doors are
 *       therefore not fully free at this pull.
 *       Compare 11/17 09:49a PT: occupied 18, reserved 2, available 3. The single
 *       change is DOCK53 flipping OCCUPIED -> RESERVED when TASK-5423116 landed on
 *       the door it already hosted an open task on.
 *     - ACTIVE TASKS: 13 tasks - 6 RECEIVE / 7 LOAD - at 9 distinct doors
 *       (DOCK50, DOCK51, DOCK53, DOCK54, DOCK57, DOCK58, DOCK61, DOCK69, DOCK71). There is no scope divergence: all 13 are GURUNANDA.
 *       Compare 11/17 09:49a PT: 12 tasks (6 RECEIVE / 6 LOAD) at 9 doors.
 *     - ASSIGNMENTS BY ASSIGNEE (GURUNANDA, the dashboard cards):
 *       ARNULFO MUNGUIA 3
 *       A1SG 1
 *       CANDY MENDEZ 1
 *       DANIEL BELTRAN 1
 *       EDUARDO MEJIA 1
 *       Fatima ponce 1
 *       Gonzalo Rangel 1
 *       JESUS ESPINOZA 1
 *       Jorge Antonio Franco 1
 *       Luis Alberto Paredes 1
 *       daira gonzalez 1 = 13.
 *       "A1SG" is the assigneeUserName WISE returns verbatim on TASK-5423105
 *       (assigneeUserId 1910160202361942018, assigned 09:47:29a PT). It is
 *       reproduced exactly as WISE reports it - it is not normalised, expanded,
 *       or guessed to be a person or a shared login. Same for "CANDY MENDEZ",
 *       the live assignee of the new DOCK53 task TASK-5423116 (assigneeUserId
 *       1932077636141408257, assigned 09:54:06a PT).
 *     - LOAD PROGRESS: 5 Bay-4 load tasks are IN_PROGRESS (1 LIVE_LOAD, 4 PRE_LOAD), of which two still have product moving:
 *       DOCK50 TASK-5423064 (PRE_LOAD, started 9:29:00a PT, 6 loads all LOADING, no
 *       seal yet) and DOCK57 TASK-5423006 (LIVE_LOAD, started 9:46:24a PT, 2 loads
 *       LOADING, no seal yet). Three IN_PROGRESS tasks already have every load at
 *       status LOADED with a sealNo recorded and are awaiting closure: DOCK51
 *       TASK-5422751 (seal 1304011), DOCK53 TASK-5422317 (seal 1304046) and DOCK54
 *       TASK-5422749 (seal 25010983); none is CLOSED yet. Two Bay-4 load tasks are
 *       NEW and not started: DOCK54 TASK-5423105 ("A1SG", 1 load still at
 *       WINDOW_CHECKIN_DONE) and DOCK53 TASK-5423116 (CANDY MENDEZ, 2 loads at
 *       WINDOW_CHECKIN_DONE) - the latter is the newest Bay-4 task at this pull,
 *       created 09:54:06a PT. Two Bay-4 load tasks closed inside the last hour:
 *       DOCK55 TASK-5422941 (9:03:47a, 1 load SHIPPED, seal 291905) and DOCK56
 *       TASK-5422898 (9:43:33a, 1 load SHIPPED, seal 1379064).
 *     - ANOMALIES: 1, unchanged. TASK-5090739 (DOCK50, RECEIVE, started
 *       2025-10-21 12:21:14p PDT) is still returned by the active-status query
 *       although its endTime is 2025-10-22 9:42:01a PDT and its linked receipt
 *       RN-5002143 is CLOSED. Flagged, not given an open-ended duration.
 *     - Task "Guru live out / in assign to Arnulfo": 85 CLOSED load transactions
 *       with endTime from 2026-10-31 00:00:00 UTC (84 under assigneeUserId 89 +
 *       1 under a second Arnulfo identity, assigneeUserId 1948070158297014318,
 *       name rendered "arnulfo munguia"), 74 at Bay-4 doors, 11 off Bay 4
 *       (DOCK4 3 / DOCK5 2 / DOCK7 2 / DOCK10 1 / DOCK45 1 / DOCK6 1 / DOCK9 1).
 *       Per-day counts by endTime (PT), ALL scopes: 11/17 2, 11/16 7, 11/13 8, 11/12 12, 11/11 4, 11/10 10, 11/9 6, 11/6 8, 11/5 4, 11/4 11, 11/3 6, 11/2 7,
 *       with no closures at all on 11/1, 11/7, 11/8, 11/14 or 11/15.
 *       No new closure has landed since the 09:49a snapshot: the newest is still
 *       DOCK4 TASK-5422675 (started 11/16 5:55:00p PT, closed 11/17 9:28:10a PT,
 *       1 load SHIPPED, seal 25010982, off Bay 4). Newest at a
 *       Bay-4 door: DOCK52 TASK-5422342 at 11/17 9:00:56a PT.
 *     - % scheduled inbounds received (11/17 PT): 0 of 3 = 0.0%. Computable -
 *       the denominator is non-zero - and genuinely zero: none of the three
 *       GURUNANDA receipts appointed for today (RN-195785 and RN-195778 at 12:00a
 *       PT, RN-5011522 at 10:00a PT) has a receivedStartTime.
 *     - % scheduled outbounds loaded (11/17 PT): 0 of 18 = 0.0%. Computable and
 *       genuinely zero: all 18 scheduled GURUNANDA orders are still pre-ship
 *       (PICKED 11, PLANNED 3, IMPORTED 3, PICKING 1) at 09:59a PT.
 *     - Inbound/outbound mix: 6 RECEIVE / 7 LOAD of 13 active GURUNANDA tasks.
 *     - Total doors occupied: 17 of 23 (plus 3 reserved, 3 available).
 *     - Planned GURUNANDA orders: live count 186 at this pull.
 *     - Door occupancy duration: available where an active task has a startTime
 *       and has not ended - 7 tasks on 7 doors at this pull (DOCK50 LOAD 0h30m, DOCK51 LOAD 11h27m, DOCK53 LOAD 20h11m, DOCK54 LOAD 12h12m, DOCK57 LOAD 0h12m, DOCK61 RECEIVE 17h49m, DOCK71 RECEIVE 17h57m), all measured
 *       to 11/17 09:59:15a PT. WMS has no
 *       occupancy-start field for task-less doors (14 of 23), for the 5 NEW
 *       GURUNANDA tasks (DOCK53 TASK-5423116, DOCK54 TASK-5423105, DOCK58
 *       TASK-5420461, DOCK50 TASK-5418313, DOCK69 TASK-5381972) or for the one stale
 *       task (DOCK50 TASK-5090739).
 *     - Facility-wide schedule context for the 11/17 PT day (no customerId
 *       filter, same UTC-derived PT-day window): receipts scheduled 37, of which
 *       5 carry a receivedStartTime; orders scheduled 1396 by totalCount, of
 *       which 26 are SHIPPED.
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
// Outside the scope of this refresh: that KPI renders live from the WMS loader
// (loadInYardFullEquipment in src/lib/wms-loader.ts), so the static array stays
// empty rather than duplicating or estimating the live result.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 186 at the 11/17 09:59a PT pull (it read 187
// at 11/17 09:49a PT).
export const plannedGurunandaOrderCount = 186;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/17 09:59a PT
//
// All 23 rows come from one /wms-bam/wms-location/search call
// (exactlyNames DOCK50..DOCK72); every row is category DOCK, type DOCK,
// status USABLE. Door status rule (unchanged, keeps the dashboard's 3-value
// enum):
//   Reserved  = dockStatus RESERVED (door is held/reserved, so it is not free)
//   Occupied  = dockStatus OCCUPIED OR spaceStatus OCCUPIED (not fully free)
//   Available = dockStatus AVAILABLE AND spaceStatus EMPTY
// Raw field values are preserved per door so the mapping can be re-checked.
// Totals: Occupied 17, Reserved 3, Available 3 = 23.
// Reserved doors: DOCK53, DOCK54, DOCK65 (all three read spaceStatus OCCUPIED).
// Three further doors are dock AVAILABLE but still carry space OCCUPIED
// (DOCK52, DOCK55, DOCK56, DOCK59), so they count as
// Occupied. Fully free doors: DOCK63, DOCK67, DOCK72 - so 20 of 23 doors are
// not fully free.
// Raw tallies at this pull: dockStatus OCCUPIED 13 / AVAILABLE 7 / RESERVED 3;
// spaceStatus OCCUPIED 12 / EMPTY 11.
//
// BAY 4 ALL-CUSTOMER PHYSICAL TALLY (see SCOPE NOTE in the file header):
// active (NEW / IN_PROGRESS / EXCEPTION) tasks whose dockName is one of these
// 23 doors = 13 (RECEIVE 6, LOAD 7) on 9 doors. At this pull that equals the
// GURUNANDA-only tally exactly - all 13 tasks are ORG-655875.
// =====================================================================
export const bay4AllCustomerActiveTaskCount = 13;
export const bay4AllCustomerActiveReceiveCount = 6;
export const bay4AllCustomerActiveLoadCount = 7;

export const doors: DoorRecord[] = [
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD) + daira gonzalez (RECEIVE - STALE) + Gonzalo Rangel (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5423064", "TASK-5090739", "TASK-5418313"],
    duration: "LOAD 0h30m since 11/17 9:29:00a PT (TASK-5423064 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/17 9:26:30a PT · started 11/17 9:29:00a PT · checked in 11/17 9:29:03a PT · updated 11/17 9:29:03a PT · no sealNo yet · 6 loads LOAD-5044668 (DN-3466584, pro 50100550) LOADING; LOAD-5044664 (DN-3465520, pro 50100521) LOADING; LOAD-5044624 (DN-3460431, pro 50100551) LOADING; LOAD-5044621 (DN-3459670, pro 50100552) LOADING; LOAD-5044609 (DN-3460409, pro 50100553) LOADING; LOAD-5044607 (DN-3460416, pro 50100554) LOADING · carrier ORG-659165 · shipTo Gurunanda LLC · entry ET-1182966) · TASK-5090739 (daira gonzalez) is STALE: started 10/21 12:21:14p PT and its endTime is 10/22 9:42:01a PT (receipt RN-5002143 status CLOSED, container EGSU8032696, reference EGLV149507056809, carrier ORG-34911) - not given an open-ended duration · also on this door: RECEIVE TASK-5418313 · Gonzalo Rangel (assigneeUserId 2000828853478170980) · NEW · task created 11/11 11:24:50a PT · updated 11/11 11:24:50a PT · no dockCheckOutTime · RN-195495 at status IMPORTED · PO RMA0276 · reference Po # 979126 · appointment 11/11 12:00:00a PT · in-yard 11/11 11:24:50a PT · carrier ORG-825 · entry ET-1181371 - no startTime, so no duration basis · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1182966 (row updated 11/17 9:29:03a PT) · last load task to close here: TASK-5421917 (BYRON PALADINES, customer ORG-55783, 11/16 10:32:09a PT, CLOSED, 1 load SHIPPED, seal 25076956) · last receive task to close here: TASK-5416210 (DANIELA GONZALEZ, customer ORG-585450, 11/9 4:55:40p PT, FORCE_CLOSED)",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "EDUARDO MEJIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5422751"],
    duration: "LOAD 11h27m since 11/16 10:31:35p PT (TASK-5422751 · EDUARDO MEJIA (assigneeUserId 2029638366082560001) · IN_PROGRESS · PRE_LOAD · task created 11/16 9:45:35p PT · started 11/16 10:31:35p PT · checked in 11/16 10:31:38p PT · updated 11/16 11:08:42p PT · seal 1304011 · 3 loads LOAD-5044610 (DN-3460325) LOADED; LOAD-5044616 (DN-3460001) LOADED; LOAD-5044617 (DN-3459963) LOADED · carrier ORG-659165 · shipTo Gurunanda LLC · entry ET-1182803) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1182803 (row updated 11/16 10:31:38p PT) · last load task to close here: TASK-5420549 (ARNULFO MUNGUIA, customer ORG-655875, 11/13 1:56:58p PT, CLOSED, 1 load SHIPPED, seal 25010987) · last receive task to close here: TASK-5420402 (Fatima ponce, customer ORG-655875, 11/13 10:42:38a PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1182866 (row updated 11/17 9:01:06a PT) · last load task to close here: TASK-5422342 (ARNULFO MUNGUIA, customer ORG-655875, 11/17 9:00:56a PT, CLOSED, 4 loads all SHIPPED, seal 1304019) · last receive task to close here: TASK-5417998 (Nanci Viviana Rosas, customer ORG-585450, 11/11 2:39:35p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Reserved",
    assignee: "ARNULFO MUNGUIA (LOAD) + CANDY MENDEZ (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5422317", "TASK-5423116"],
    duration: "LOAD 20h11m since 11/16 1:47:31p PT (TASK-5422317 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/16 1:46:45p PT · started 11/16 1:47:31p PT · checked in 11/16 1:47:36p PT · updated 11/16 4:25:12p PT · seal 1304046 · 2 loads LOAD-5044525 (DN-3458071, pro 50168600) LOADED; LOAD-5044619 (DN-3459672) LOADED · carrier ORG-659165 · shipTo Gurunanda LLC · entry ET-1182659) · also on this door: LOAD TASK-5423116 · CANDY MENDEZ (assigneeUserId 1932077636141408257) · NEW · LIVE_LOAD · task created 11/17 9:54:06a PT · updated 11/17 9:54:06a PT · no sealNo yet · 2 loads LOAD-5044327 (47985047771 // SP BOL) WINDOW_CHECKIN_DONE; LOAD-5044328 (47985083861 // SP BOL) WINDOW_CHECKIN_DONE · carrier ORG-5960 · shipTo GYR2 / LGB8 · load appointment 11/17 8:00:00a PT · entry ET-1182993 - no startTime, so no duration basis · dock RESERVED, space OCCUPIED, occupiedCustomerIds none, entry ET-1182993 (row updated 11/17 9:54:09a PT) · last load task to close here: TASK-5421041 (ARNULFO MUNGUIA, customer ORG-655875, 11/16 9:59:10a PT, CLOSED, 2 loads all SHIPPED, seal 25010984) · last receive task to close here: TASK-5407284 (ARNULFO MUNGUIA, customer ORG-585450, 10/29 10:01:54a PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Reserved",
    assignee: "ARNULFO MUNGUIA (LOAD) + A1SG (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5422749", "TASK-5423105"],
    duration: "LOAD 12h12m since 11/16 9:46:53p PT (TASK-5422749 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/16 9:41:55p PT · started 11/16 9:46:53p PT · checked in 11/16 9:46:55p PT · updated 11/16 11:02:57p PT · seal 25010983 · 2 loads LOAD-5044611 (DN-3460321) LOADED; LOAD-5044615 (DN-3460034) LOADED · carrier ORG-659165 · shipTo Gurunanda BP / Gurunanda LLC · entry ET-1182801) · also on this door: LOAD TASK-5423105 · A1SG (assigneeUserId 1910160202361942018) · NEW · LIVE_LOAD · task created 11/17 9:47:29a PT · updated 11/17 9:47:29a PT · no sealNo yet · 1 load LOAD-5044599 (CS02531444 UNIS BOL) WINDOW_CHECKIN_DONE · carrier ORG-613903 · shipTo Ross Stores Inc / DD's Discount · load appointment 11/17 8:00:00a PT · entry ET-1182990 - no startTime, so no duration basis · dock RESERVED, space OCCUPIED, occupiedCustomerIds none, entry ET-1182990 (row updated 11/17 9:47:30a PT) · last load task to close here: TASK-5422351 (DANIEL BELTRAN, customer ORG-655875, 11/16 3:08:02p PT, CLOSED, 1 load SHIPPED, seal 1304047) · last receive task to close here: TASK-5421959 (CANDY MENDEZ, customer ORG-585450, 11/16 3:28:53p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1182881 (row updated 11/17 9:04:00a PT) · last load task to close here: TASK-5422941 (DANIEL BELTRAN, customer ORG-655875, 11/17 9:03:47a PT, CLOSED, 1 load SHIPPED, seal 291905) · last receive task to close here: TASK-5421731 (Nanci Viviana Rosas, customer ORG-585450, 11/16 10:13:39a PT, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1182866 (row updated 11/17 9:44:16a PT) · last load task to close here: TASK-5422898 (DANIEL BELTRAN, customer ORG-655875, 11/17 9:43:33a PT, CLOSED, 1 load SHIPPED, seal 1379064) · last receive task to close here: TASK-5418081 (Nanci Viviana Rosas, customer ORG-585450, 11/11 12:11:56p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: "DANIEL BELTRAN (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5423006"],
    duration: "LOAD 0h12m since 11/17 9:46:24a PT (TASK-5423006 · DANIEL BELTRAN (assigneeUserId 1932077596691410945) · IN_PROGRESS · LIVE_LOAD · task created 11/17 8:54:10a PT · started 11/17 9:46:24a PT · checked in 11/17 9:46:33a PT · updated 11/17 9:46:33a PT · no sealNo yet · 2 loads LOAD-5043948 (47847466101 // SP BOL, pro 5043948) LOADING; LOAD-5043944 (47847498291 // SP BOL, pro 5043944) LOADING · carrier ORG-5960 · shipTo Amazon.com Services, Inc. · load appointment 11/12 11:00:00a PT · entry ET-1182938) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1182938 (row updated 11/17 9:46:33a PT) · last load task to close here: TASK-5421821 (DANIEL BELTRAN, customer ORG-655875, 11/16 1:31:01p PT, CLOSED, 1 load SHIPPED, seal 1304044) · last receive task to close here: TASK-5414098 (Nanci Viviana Rosas, customer ORG-585450, 11/9 2:14:50p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: "Luis Alberto Paredes (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5420461"],
    duration: "RECEIVE TASK-5420461 · Luis Alberto Paredes (assigneeUserId 2000828853478171162) · NEW · task created 11/13 10:13:50a PT · updated 11/13 10:13:50a PT · no dockCheckOutTime · RN-5011507 at status IMPORTED · PO PO9419 · container Leafchem11132026 · reference PO9419 · appointment 11/13 10:00:00a PT · in-yard 11/13 10:13:27a PT · carrier ORG-825 · entry ET-1182030 · no duration basis on this door · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1182700 (row updated 11/17 6:20:19a PT) · last load task to close here: TASK-5420377 (BARTOLO RAMIREZ, customer ORG-655875, 11/13 12:10:57p PT, CLOSED, 1 load SHIPPED, seal 1304053) · last receive task to close here: TASK-5414761 (DANIELA GONZALEZ, customer ORG-655875, 11/6 5:09:25p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1182700 (row updated 11/16 3:17:37p PT) · last load task to close here: TASK-5422412 (DANIEL BELTRAN, customer ORG-655875, 11/16 3:17:16p PT, CLOSED, 1 load SHIPPED, seal A52687) · last receive task to close here: TASK-5417811 (CANDY MENDEZ, customer ORG-655875, 11/11 12:09:52p PT, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1179653 (row updated 11/17 6:10:35a PT) · last load task to close here: TASK-5413376 (JULIO CESAR ALVARADO, customer ORG-655875, 11/5 2:50:10p PT, CLOSED, 5 loads all SHIPPED, seal 1378416) · last receive task to close here: TASK-5402543 (DANIELA GONZALEZ, customer ORG-655875, 10/23 6:21:53p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: "JESUS ESPINOZA (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5422524"],
    duration: "RECEIVE 17h49m since 11/16 4:10:04p PT (TASK-5422524 · JESUS ESPINOZA (assigneeUserId 1948070158297014342) · IN_PROGRESS · task created 11/16 3:55:28p PT · started 11/16 4:10:04p PT · dock check-in 11/16 4:21:59p PT · updated 11/16 4:21:59p PT · no dockCheckOutTime · RN-5011599 at status IN_PROGRESS · PO ZCSU7568630 · container ZCSU7568630 · reference S00811293 · appointment 11/16 10:30:00a PT · receivedStart 11/16 4:10:04p PT · in-yard 11/16 3:55:28p PT · carrier ORG-825 · entry ET-1182732) · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1182732 (row updated 11/16 4:21:59p PT) · last load task to close here: TASK-5420400 (BARTOLO RAMIREZ, customer ORG-655875, 11/13 10:56:09a PT, CLOSED, 1 load SHIPPED, seal 1304052) · last receive task to close here: TASK-5421037 (CANDY MENDEZ, customer ORG-655875, 11/16 10:27:57a PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1181858 (row updated 11/15 2:12:40p PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5419984 (DANIELA GONZALEZ, customer ORG-655875, 11/12 8:25:21p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task - fully free · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1182804 (row updated 11/16 11:38:22p PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5422753 (JESUS ESPINOZA, customer ORG-655875, 11/16 11:38:25p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1182176 (row updated 11/16 6:15:25a PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5420980 (DANIELA GONZALEZ, customer ORG-655875, 11/13 9:32:35p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space EMPTY, occupiedCustomerIds none, entry ET-1179941 (row updated 11/16 10:24:09a PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5413519 (Nanci Viviana Rosas, customer ORG-585450, 11/10 11:38:02a PT, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1182734 (row updated 11/16 7:17:01p PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5422534 (DANIELA GONZALEZ, customer ORG-655875, 11/16 7:17:17p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task - fully free · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1181521 (row updated 11/13 8:14:15p PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5418827 (Fatima ponce, customer ORG-655875, 11/12 9:38:33a PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1177841 (row updated 11/12 8:59:43p PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5408610 (Fatima ponce, customer ORG-655875, 11/2 3:06:46p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE TASK-5381972 · Jorge Antonio Franco (assigneeUserId 2060441422549078018) · NEW · task created 9/30 9:46:50a PT · updated 9/30 9:48:35a PT · no dockCheckOutTime · RN-5010583 at status IMPORTED · PO PO9139-2 · container Jpack09242026 · no appointment on the receipt · in-yard 9/30 9:46:48a PT · carrier ORG-825 · entry ET-1162686 · task note 'DOCK 69 ET-1162686' · no duration basis on this door · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1171953 (row updated 11/12 8:59:19p PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5398554 (DANIELA GONZALEZ, customer ORG-655875, 10/20 5:56:09p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1172826 (row updated 11/16 6:20:32a PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5399423 (Fatima ponce, customer ORG-655875, 10/21 8:42:23a PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: "Fatima ponce (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5422515"],
    duration: "RECEIVE 17h57m since 11/16 4:01:40p PT (TASK-5422515 · Fatima ponce (assigneeUserId 2053885581368619009) · IN_PROGRESS · task created 11/16 3:51:17p PT · started 11/16 4:01:40p PT · dock check-in 11/16 4:36:13p PT · updated 11/17 7:17:33a PT · no dockCheckOutTime · RN-5011579 at status IN_PROGRESS · PO MATU2536317 · container MATU2536317 · reference B00420742 · appointment 11/13 1:45:00p PT · receivedStart 11/16 4:01:40p PT · in-yard 11/16 3:51:17p PT · carrier ORG-825 · entry ET-1182729) · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1182729 (row updated 11/16 4:36:13p PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5406898 (DANIELA GONZALEZ, customer ORG-655875, 10/28 7:41:53p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task - fully free · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1176051 (row updated 11/11 6:13:28p PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5405554 (DANIELA GONZALEZ, customer ORG-655875, 10/27 5:45:00p PT, CLOSED)",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 17
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 3
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 9
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 1
const available = doors.filter((d) => d.status === "Available").length; // 3

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

// Doors that carried dockStatus RESERVED at this pull: 3 (DOCK53, DOCK54, DOCK65).
// They are held/reserved rather than free, and all three also read spaceStatus
// OCCUPIED, so "not fully free" doors total 20 of 23.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee - GURUNANDA scope (the dashboard cards).
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, Nov 17
// 2026 09:59a PT).
// 13 active-status tasks at Bay-4 doors: 7 LOAD + 6 RECEIVE, at 9 distinct doors
// (DOCK50, DOCK51, DOCK53, DOCK54, DOCK57, DOCK58, DOCK61, DOCK69, DOCK71).
// ARNULFO MUNGUIA (3): LOAD TASK-5423064 IN_PROGRESS PRE_LOAD, LOAD TASK-5422749 IN_PROGRESS PRE_LOAD, LOAD TASK-5422317 IN_PROGRESS PRE_LOAD
// A1SG (1): LOAD TASK-5423105 NEW LIVE_LOAD
// CANDY MENDEZ (1): LOAD TASK-5423116 NEW LIVE_LOAD
// DANIEL BELTRAN (1): LOAD TASK-5423006 IN_PROGRESS LIVE_LOAD
// EDUARDO MEJIA (1): LOAD TASK-5422751 IN_PROGRESS PRE_LOAD
// Fatima ponce (1): RECEIVE TASK-5422515 IN_PROGRESS
// Gonzalo Rangel (1): RECEIVE TASK-5418313 NEW
// JESUS ESPINOZA (1): RECEIVE TASK-5422524 IN_PROGRESS
// Jorge Antonio Franco (1): RECEIVE TASK-5381972 NEW
// Luis Alberto Paredes (1): RECEIVE TASK-5420461 NEW
// daira gonzalez (1): RECEIVE TASK-5090739 IN_PROGRESS
// All names/ids resolved verbatim from the WMS task payloads (assigneeUserName /
// assigneeUserId); no name was normalised or guessed. Adding the non-GURUNANDA
// tasks would change nothing at this pull - there are none on Bay-4 doors - so
// the all-customer tally also reads 13 (see bay4AllCustomerActiveTaskCount).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 3 },
  { name: "A1SG", taskCount: 1 },
  { name: "CANDY MENDEZ", taskCount: 1 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "EDUARDO MEJIA", taskCount: 1 },
  { name: "Fatima ponce", taskCount: 1 },
  { name: "Gonzalo Rangel", taskCount: 1 },
  { name: "JESUS ESPINOZA", taskCount: 1 },
  { name: "Jorge Antonio Franco", taskCount: 1 },
  { name: "Luis Alberto Paredes", taskCount: 1 },
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

// Mix: 6 RECEIVE + 7 LOAD = 13 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 6, total: 13 },
  { label: "Outbound (LOAD)", count: 7, total: 13 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 7, total: 13 },
  { label: "Inbound", count: 6, total: 13 },
];

// --- Schedule Data (2026-11-17, Tuesday) ---
// Both percentages use the SAME UTC-derived 11/17 PT business-day window,
// 2026-11-17 08:00:00 -> 2026-11-18 07:59:59 (see TIMESTAMP SEMANTICS in the
// file header; this window is the only one used anywhere in this file):
//   % scheduled inbounds received TODAY: exactly 3 GURUNANDA receipts carry an
//   appointmentTime inside that window (totalCount 3, all read: RN-195785 at
//   status IMPORTED, PO9389, appointment 11/17 12:00a PT, ref 125-24123772;
//   RN-195778 at status IMPORTED, PO GN11172026UNIS-1330, container 53678,
//   appointment 11/17 12:00a PT; RN-5011522 at status IMPORTED, PO Po 9416,
//   container TQL11172026, appointment 11/17 10:00a PT) and ZERO of them carry a
//   receivedStartTime = 0 / 3 = 0.0%. Genuinely zero, not "not computable": the
//   denominator is 3.
//   % scheduled outbounds loaded TODAY: 18 GURUNANDA orders carry a scheduleDate
//   inside that window (scheduleDatePeriod ["2026-11-17 08:00:00",
//   "2026-11-18 07:59:59"], totalCount 18, all 18 read) of which 0 are at status
//   SHIPPED (the other 18 are PICKED 11, PLANNED 3, IMPORTED 3, PICKING 1) =
//   0 / 18 = 0.0%.
//   Genuinely zero at a 09:59a PT pull: nothing on today's outbound schedule has
//   shipped yet (the facility-wide 11/17 PT-day order set has only 26 SHIPPED out
//   of 1396, and the three Bay-4 load closures today all belong to earlier
//   GURUNANDA tasks that were not on today's schedule).
//   Both numerators are real counts of a non-empty denominator, so neither card
//   is a "no schedule" state (compare the 11/14-11/15 weekend snapshots, which
//   published both percentages as NOT COMPUTABLE because GURUNANDA had zero
//   scheduled receipts and zero scheduled orders on those days).
export const scheduleAvailable = true;              // 3 GURUNANDA receipts scheduled on 11/17
export const outboundScheduleAvailable = true;      // 18 GURUNANDA orders scheduled on 11/17
export const scheduledInboundOrders = 3;            // receipts with appointmentTime in the 11/17 PT day
export const scheduledOutboundOrders = 18;          // orders with scheduleDate in the 11/17 PT day
export const scheduledInboundReceived = 0;          // receipts with receivedStartTime in that set
export const scheduledOutboundLoaded = 0;           // orders at status SHIPPED in that set
export const pctScheduledInboundReceived = 0.0;     // 0 of 3
export const pctScheduledOutboundLoaded = 0.0;     // 0 of 18
// Facility-wide schedule context for the 11/17 PT day, all customers (same two
// endpoints, no customerId filter, same UTC-derived PT-day window): 37 receipts
// scheduled, of which 5 carry a receivedStartTime; 1396 orders scheduled by
// totalCount, of which 26 are SHIPPED.
export const facilityWideReceiptsCreated = 37;
export const facilityWideReceiptsReceived = 5;
export const facilityWideLoadsCreated = 1396;
export const facilityWideLoadsShipped = 26;

// Door occupancy duration: available from task startTime where a task exists on
// the door, has actually started and has not already ended; unavailable for
// task-less doors and for NEW tasks with no startTime (WMS has no
// occupancy-start field, and the dock-door-status dashboard endpoint returns an
// empty Duration column). 14 of 23 doors carry no active task at this pull,
// 5 of the 13 active tasks are NEW/not started (DOCK53 TASK-5423116,
// DOCK54 TASK-5423105, DOCK58 TASK-5420461, DOCK50 TASK-5418313, DOCK69 TASK-5381972)
// and 1 is stale (DOCK50 TASK-5090739), so a duration exists for 7 tasks on
// 7 doors (DOCK50 LOAD 0h30m, DOCK51 LOAD 11h27m, DOCK53 LOAD 20h11m, DOCK54 LOAD 12h12m, DOCK57 LOAD 0h12m, DOCK61 RECEIVE 17h49m, DOCK71 RECEIVE 17h57m, all measured to 11/17 09:59:15a PT).
export const doorDurationsAvailable = true;

// All Bay 4 active GURUNANDA task records (DOCK50-DOCK72, Nov 17 2026 09:59a PT)
// 13 tasks total: 7 LOAD + 6 RECEIVE. One is a data anomaly (TASK-5090739 on
// DOCK50, stale since 2025-10-21). All 13 tasks on these doors are GURUNANDA at
// this pull, so this array is the complete physical picture as well as the
// customer-scoped one.
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA has 85 CLOSED GURUNANDA load transactions with endTime inside
// the 2026-10-31 00:00:00 UTC - now window (84 under assigneeUserId 89 plus 1
// under a second Arnulfo identity, assigneeUserId 1948070158297014318, name
// rendered "arnulfo munguia"; 74 of them at Bay-4 doors - DOCK51 12 / DOCK52 12 / DOCK53 11 / DOCK54 11 / DOCK55 8 / DOCK50 7 / DOCK56 7 / DOCK57 3 / DOCK60 2 / DOCK59 1;
// the other 11 are on DOCK4 3 / DOCK5 2 / DOCK7 2 / DOCK10 1 / DOCK45 1 / DOCK6 1 / DOCK9 1); per-day counts by
// endTime (PT): 11/17 2, 11/16 7, 11/13 8, 11/12 12, 11/11 4, 11/10 10, 11/9 6, 11/6 8, 11/5 4, 11/4 11, 11/3 6, 11/2 7, with no closures on
// 11/1, 11/7, 11/8, 11/14, 11/15.
// No new transaction has landed since the 09:49a snapshot. The newest overall is
// DOCK4 TASK-5422675 (closed 11/17 9:28:10a PT); the newest at a Bay-4 door is
// DOCK52 TASK-5422342 (closed 11/17 9:00:56a PT).
// He currently holds 3 open GURUNANDA LOAD tasks, all PRE_LOAD: DOCK50
// TASK-5423064 (started 11/17 9:29:00a PT, 6 loads LOADING, no seal yet),
// DOCK53 TASK-5422317 (started 11/16 1:47:31p PT, 2 loads both LOADED, seal
// 1304046) and DOCK54 TASK-5422749 (started 11/16 9:46:53p PT, 2 loads both
// LOADED, seal 25010983).
export const assignments: TaskRecord[] = [
  {
    taskId: "TASK-5422524",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 17h49m since 11/16 4:10:04p PT (JESUS ESPINOZA, task created 11/16 3:55:28p PT, dock check-in 11/16 4:21:59p PT, updated 11/16 4:21:59p PT, no dockCheckOutTime; entry ET-1182732, RN-5011599 at status IN_PROGRESS, PO ZCSU7568630, container ZCSU7568630, reference S00811293, appointment 11/16 10:30:00a PT, in-yard 11/16 3:55:28p PT, carrier ORG-825)",
    assignee: "JESUS ESPINOZA",
    door: "DOCK61",
  },
  {
    taskId: "TASK-5422515",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 17h57m since 11/16 4:01:40p PT (Fatima ponce, task created 11/16 3:51:17p PT, dock check-in 11/16 4:36:13p PT, updated 11/17 7:17:33a PT, no dockCheckOutTime; entry ET-1182729, RN-5011579 at status IN_PROGRESS, PO MATU2536317, container MATU2536317, reference B00420742, appointment 11/13 1:45:00p PT, in-yard 11/16 3:51:17p PT, carrier ORG-825)",
    assignee: "Fatima ponce",
    door: "DOCK71",
  },
  {
    taskId: "TASK-5420461",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/13 10:13:50a PT (Luis Alberto Paredes; entry ET-1182030, RN-5011507 at status IMPORTED, PO PO9419, appointment 11/13 10:00:00a PT, in-yard 11/13 10:13:27a PT, container Leafchem11132026, carrier ORG-825) - task has no startTime",
    assignee: "Luis Alberto Paredes",
    door: "DOCK58",
  },
  {
    taskId: "TASK-5418313",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/11 11:24:50a PT (Gonzalo Rangel; entry ET-1181371, RN-195495 at status IMPORTED, PO RMA0276, appointment 11/11 12:00:00a PT, in-yard 11/11 11:24:50a PT, container not recorded, carrier ORG-825) - task has no startTime",
    assignee: "Gonzalo Rangel",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/30 9:46:50a PT (Jorge Antonio Franco; entry ET-1162686, RN-5010583 at status IMPORTED, PO PO9139-2, appointment none on the receipt, in-yard 9/30 9:46:48a PT, container Jpack09242026, carrier ORG-825, task note 'DOCK 69 ET-1162686') - task has no startTime",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 10/21 12:21:14p PT; status still IN_PROGRESS although endTime is 10/22 9:42:01a PT; daira gonzalez, entry ET-1027622, RN-5002143 which is itself already CLOSED, container EGSU8032696, reference EGLV149507056809, carrier ORG-34911)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5423116",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/17 9:54:06a PT (CANDY MENDEZ (assigneeUserId 1932077636141408257; assigneeUserName reproduced verbatim from WISE), LIVE_LOAD, 2 loads LOAD-5044327 (47985047771 // SP BOL) at status WINDOW_CHECKIN_DONE, LOAD-5044328 (47985083861 // SP BOL) at status WINDOW_CHECKIN_DONE, carrier ORG-5960, shipTo GYR2 / LGB8, load appointment 11/17 8:00:00a PT, no sealNo yet, no startTime, entry ET-1182993)",
    assignee: "CANDY MENDEZ",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5423105",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/17 9:47:29a PT (A1SG (assigneeUserId 1910160202361942018; assigneeUserName reproduced verbatim from WISE), LIVE_LOAD, 1 load LOAD-5044599 (CS02531444 UNIS BOL) at status WINDOW_CHECKIN_DONE, carrier ORG-613903, shipTo Ross Stores Inc / DD's Discount, load appointment 11/17 8:00:00a PT, no sealNo yet, no startTime, entry ET-1182990)",
    assignee: "A1SG",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5423064",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 0h30m since 11/17 9:29:00a PT (ARNULFO MUNGUIA, task created 11/17 9:26:30a PT, checked in 11/17 9:29:03a PT, updated 11/17 9:29:03a PT, PRE_LOAD, no sealNo yet, 6 loads LOAD-5044668 (DN-3466584, pro 50100550) at status LOADING, LOAD-5044664 (DN-3465520, pro 50100521) at status LOADING, LOAD-5044624 (DN-3460431, pro 50100551) at status LOADING, LOAD-5044621 (DN-3459670, pro 50100552) at status LOADING, LOAD-5044609 (DN-3460409, pro 50100553) at status LOADING, LOAD-5044607 (DN-3460416, pro 50100554) at status LOADING, carrier ORG-659165, shipTo Gurunanda LLC, entry ET-1182966)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5423006",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 0h12m since 11/17 9:46:24a PT (DANIEL BELTRAN, task created 11/17 8:54:10a PT, checked in 11/17 9:46:33a PT, updated 11/17 9:46:33a PT, LIVE_LOAD, no sealNo yet, 2 loads LOAD-5043948 (47847466101 // SP BOL, pro 5043948) at status LOADING, LOAD-5043944 (47847498291 // SP BOL, pro 5043944) at status LOADING, carrier ORG-5960, shipTo Amazon.com Services, Inc., load appointment 11/12 11:00:00a PT, entry ET-1182938)",
    assignee: "DANIEL BELTRAN",
    door: "DOCK57",
  },
  {
    taskId: "TASK-5422751",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 11h27m since 11/16 10:31:35p PT (EDUARDO MEJIA, task created 11/16 9:45:35p PT, checked in 11/16 10:31:38p PT, updated 11/16 11:08:42p PT, PRE_LOAD, seal 1304011, 3 loads LOAD-5044610 (DN-3460325) at status LOADED, LOAD-5044616 (DN-3460001) at status LOADED, LOAD-5044617 (DN-3459963) at status LOADED, carrier ORG-659165, shipTo Gurunanda LLC, entry ET-1182803)",
    assignee: "EDUARDO MEJIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5422749",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 12h12m since 11/16 9:46:53p PT (ARNULFO MUNGUIA, task created 11/16 9:41:55p PT, checked in 11/16 9:46:55p PT, updated 11/16 11:02:57p PT, PRE_LOAD, seal 25010983, 2 loads LOAD-5044611 (DN-3460321) at status LOADED, LOAD-5044615 (DN-3460034) at status LOADED, carrier ORG-659165, shipTo Gurunanda BP / Gurunanda LLC, entry ET-1182801)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5422317",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 20h11m since 11/16 1:47:31p PT (ARNULFO MUNGUIA, task created 11/16 1:46:45p PT, checked in 11/16 1:47:36p PT, updated 11/16 4:25:12p PT, PRE_LOAD, seal 1304046, 2 loads LOAD-5044525 (DN-3458071, pro 50168600) at status LOADED, LOAD-5044619 (DN-3459672) at status LOADED, carrier ORG-659165, shipTo Gurunanda LLC, entry ET-1182659)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },
];
