/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-17 09:49a PT (live WISE / WMS-BAM APIs)
 *   Every value below was re-read live at ONE reference
 *   (2026-11-17T17:49:16Z = 09:49:16a PT). No value in this file is carried over
 *   from an earlier snapshot. Source counts quoted below were read across the
 *   17:49:16-17:50:00Z (09:49:16-09:50:00a PT) pull window. Reads were made in
 *   WISE raw-UTC mode (no item-time-zone header) - see QUERY MODE WARNING below
 *   before re-running any of these queries.
 *
 *   TIMESTAMP SEMANTICS - single authority for this file, verified again at this
 *   pull: WISE/WMS-BAM returns task, receipt, order and appointment timestamps as
 *   UTC strings with NO offset. They are NOT facility wall-clock. Render PT with a
 *   real zone conversion: PST = UTC-8 (on/after 2026-11-01), PDT = UTC-7 (before
 *   2026-11-01). Evidence read at this pull: TASK-5423064 createdTime
 *   2026-11-17T17:26:30 = 11/17 09:26:30a PT; TASK-5423105 createdTime
 *   2026-11-17T17:47:29 = 11/17 09:47:29a PT; RN-5011522 appointmentTime
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
 *   9:00p / 11:00p PT) that belong to the previous business day. Pick one mode and
 *   its matching window.
 *   Durations are measured to the 2026-11-17 09:49:16a PT pull reference.
 *
 *   SOURCES USED AT THIS PULL:
 *     - POST /wms-bam/wms-location/search, body {exactlyNames:[DOCK50..DOCK72]}
 *       -> code 0, 23/23 rows (name, id, category=DOCK, type=DOCK,
 *       status=USABLE on all 23, dockStatus, spaceStatus, occupiedCustomerIds,
 *       entryId, updatedTime). Door rows are used for "Door Utilization".
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer
 *       filter) -> totalCount 51, all 51 read (41 IN_PROGRESS, 10 NEW); exactly 6
 *       of them sit on a Bay-4 dockName, all 6 GURUNANDA (4 IN_PROGRESS PRE_LOAD,
 *       1 IN_PROGRESS LIVE_LOAD, 1 NEW LIVE_LOAD). No facility load task carries a
 *       null dockName.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer
 *       filter) -> totalCount 94, all 94 read (60 IN_PROGRESS, 34 NEW); 6 of them
 *       sit on a Bay-4 dockName (all GURUNANDA). 8 of the 94 carry no dockName at
 *       all (not yet docked) and none of them is a Bay-4 door.
 *     - POST /wms-bam/inbound/receipt/search-by-paging
 *       {customerId: ORG-655875, appointmentTimeFrom "2026-11-17 08:00:00",
 *       appointmentTimeTo "2026-11-18 07:59:59"} -> totalCount 3, all read:
 *       RN-195785 (IMPORTED, PO9389, appt 11/17 12:00a PT, ref 125-24123772,
 *       carrier ORG-825, in-yard null, no container), RN-195778 (IMPORTED, PO
 *       GN11172026UNIS-1330, container 53678, appt 11/17 12:00a PT, carrier
 *       ORG-825, in-yard null) and RN-5011522 (IMPORTED, PO Po 9416, container
 *       TQL11172026, appt 11/17 10:00a PT, carrier ORG-825, in-yard null). Three
 *       scheduled receipts and zero started receipts = 0 of 3 received.
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, scheduleDatePeriod ["2026-11-17 08:00:00",
 *       "2026-11-18 07:59:59"]} -> totalCount 16, all 16 read; statuses PICKED 11,
 *       PLANNED 3, IMPORTED 1, PICKING 1, SHIPPED 0 -> 0 of 16 loaded. scheduleDate
 *       is date-only and stored at 08:00:00 UTC, so this window and the naive
 *       calendar-day window return the identical 16 (re-tested at this pull); the
 *       window choice only changes results for receipt appointmentTime.
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], endTimeFrom "2026-10-31 00:00:00",
 *       endTimeTo "2026-11-18 23:59:59" -> totalCount 732 (all customers), all
 *       732 read (oldest endTime in the window is 10/31 00:11:13Z). The
 *       ARNULFO MUNGUIA / GURUNANDA subset is measured by a dedicated query
 *       instead (customerId ORG-655875 + assigneeUserIds [89,
 *       1948070158297014318] + the same endTime window) -> totalCount 85, all 85
 *       read, 74 of them at Bay-4 doors (his "Assigned Activity" stream).
 *       The newest load closure ANYWHERE in the facility is 11/17 9:43:51a PT
 *       (TASK-5422984, DOCK154, ARMANDO MARTINEZ-PALAFOX, ORG-34557, seal A52062,
 *       1 load SHIPPED). Three load tasks closed at Bay-4 doors in the 11/17 PT
 *       day: DOCK52 TASK-5422342 (9:00:56a), DOCK55 TASK-5422941 (9:03:47a) and
 *       DOCK56 TASK-5422898 (9:43:33a).
 *       NOTE: orderBy/sort are not supported on this endpoint (they null out
 *       totalCount); sort client-side after reading.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], sorted endTime DESC -> totalCount
 *       17,816; the newest 3,000 were read (oldest endTime in the read set is
 *       2026-08-27 02:24:46Z; newest closure 11/17 9:44:06a PT, TASK-5422908,
 *       DOCK15, Fatima ponce). No Bay-4 receive task has closed in the 11/17 PT
 *       day yet; the newest Bay-4 receive closure is still DOCK63 TASK-5422753
 *       (11/16 11:38:25p PT, JESUS ESPINOZA).
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, status: PLANNED} -> totalCount 187.
 *     - POST /wms-bam/yard/equipment/search {statuses:["FULL"]} -> 10 rows
 *       facility-wide, of which 0 are GURUNANDA ORG-655875 TRAILER rows reading
 *       equipmentStatus FULL (the ONLY GURUNANDA row in the set, vehicle 05125J3,
 *       reads EMPTY / EMPTY_TO_LOAD; the rest are ORGAIN trailers/vehicles,
 *       2 Euromarket containers, 2 unclassified vehicles and 1 unclassified
 *       trailer), which is why the live "In Yard Full Trailers" KPI reads 0.
 *     - Task-name keyword RE-TESTED at this pull: the load-task `keyword` filter
 *       is still a NO-OP. "Guru live out / in assign to Arnulfo", "Guru live out"
 *       and a nonsense string ("zzzz-no-such-task-zzzz") all return the same
 *       facility total, 733. All 12 active Bay-4 tasks carry projectId null, so
 *       there is no named task group to resolve. The "Guru live out / in assign
 *       to Arnulfo" stream is therefore reported as ARNULFO MUNGUIA's
 *       task-assignment transactions on the GURUNANDA live-out/live-in work, and
 *       nothing is invented.
 *
 *   SCOPE NOTE (read before comparing to an earlier snapshot):
 *     The line-level metrics on this dashboard are GURUNANDA-scoped (the same
 *     customer scope the dashboard has always published). At THIS pull that
 *     distinction is inert: all 12 active Bay-4 tasks across all customers are
 *     GURUNANDA (ORG-655875), so the GURUNANDA cards and the physical tallies
 *     agree exactly. bay4AllCustomerActiveTaskCount / ...ReceiveCount /
 *     ...LoadCount are exported anyway so a future non-GURUNANDA divergence stays
 *     explicit.
 *
 *   Key state at this pull:
 *     - DOOR STATUS: occupied 18, reserved 2, available 3 (18+2+3 = 23). Only
 *       DOCK63, DOCK67 and DOCK72 are fully free (dock AVAILABLE + space EMPTY).
 *       Raw dockStatus: OCCUPIED 14, AVAILABLE 7, RESERVED 2. Raw spaceStatus:
 *       OCCUPIED 12, EMPTY 11. The two RESERVED doors are DOCK54 (spaceStatus
 *       OCCUPIED, occupiedCustomerIds [], entry ET-1182990 - its row was updated
 *       09:47:30a PT, 1 second after the NEW DOCK54 load task TASK-5423105 was
 *       created) and DOCK65 (spaceStatus EMPTY). A reservation is a held door, so
 *       it is reported in its own "Reserved" bucket rather than folded into
 *       "Occupied"; 20 of the 23 doors are therefore not fully free at this pull.
 *       Compare 11/17 07:37a PT: occupied 17, reserved 3, available 3.
 *     - ACTIVE TASKS: 12 tasks - 6 RECEIVE / 6 LOAD - at 9 distinct doors
 *       (DOCK50 x3, DOCK54 x2, DOCK51, DOCK53, DOCK57, DOCK58, DOCK61, DOCK69,
 *       DOCK71). There is no scope divergence: all 12 are GURUNANDA. Compare
 *       11/17 07:37a PT: 11 tasks (6 RECEIVE / 5 LOAD) at 9 doors.
 *     - ASSIGNMENTS BY ASSIGNEE (GURUNANDA, the dashboard cards): ARNULFO
 *       MUNGUIA 3 (LOAD DOCK50, LOAD DOCK53, LOAD DOCK54), then 1 each - A1SG
 *       (LOAD DOCK54), DANIEL BELTRAN (LOAD DOCK57), EDUARDO MEJIA (LOAD DOCK51),
 *       JESUS ESPINOZA (RECEIVE DOCK61), Fatima ponce (RECEIVE DOCK71), Luis
 *       Alberto Paredes (RECEIVE DOCK58), Gonzalo Rangel (RECEIVE DOCK50), Jorge
 *       Antonio Franco (RECEIVE DOCK69), daira gonzalez (RECEIVE DOCK50, stale)
 *       = 12.
 *       "A1SG" is the assigneeUserName WISE returns verbatim on TASK-5423105
 *       (assigneeUserId 1910160202361942018, assigned 09:47:29a PT). It is
 *       reproduced exactly as WISE reports it - it is not normalised, expanded,
 *       or guessed to be a person or a shared login.
 *     - LOAD PROGRESS: 4 Bay-4 load tasks are IN_PROGRESS / PRE_LOAD (DOCK50,
 *       DOCK51, DOCK53, DOCK54) and 3 of those 4 already have every one of their
 *       loads at status LOADED with a sealNo recorded (DOCK51 TASK-5422751,
 *       DOCK53 TASK-5422317, DOCK54 TASK-5422749); none is yet CLOSED. The two
 *       tasks still moving product are DOCK50 TASK-5423064 (PRE_LOAD, started
 *       9:29:00a PT, 6 loads all LOADING, no seal yet) and DOCK57 TASK-5423006
 *       (LIVE_LOAD, started 9:46:24a PT, 2 loads LOADING, no seal yet). Two Bay-4
 *       load tasks closed inside the last hour: DOCK52 TASK-5422342 at 9:00:56a
 *       (4 loads all SHIPPED, seal 1304019) and DOCK56 TASK-5422898 at 9:43:33a
 *       (1 load SHIPPED, seal 1379064) - the latter is the task that was NEW at
 *       DOCK52 under "A1SG" at the 07:37a pull and was reassigned to DANIEL
 *       BELTRAN before closing. The newest open task is DOCK54 TASK-5423105
 *       (NEW, LIVE_LOAD, created and assigned 09:47:29a PT, 1 load LOAD-5044599
 *       still at WINDOW_CHECKIN_DONE, shipTo "Ross Stores Inc / DD's Discount",
 *       load appointment 11/17 8:00a PT, carrier ORG-613903).
 *     - ANOMALIES: 1, unchanged. TASK-5090739 (DOCK50, RECEIVE, started
 *       2025-10-21 12:21:14p PDT) is still returned by the active-status query
 *       although its endTime is 2025-10-22 10:42:01a PDT and its linked receipt
 *       RN-5002143 is CLOSED. Flagged, not given an open-ended duration.
 *     - Task "Guru live out / in assign to Arnulfo": 85 CLOSED load transactions
 *       with endTime from 2026-10-31 00:00:00 UTC (84 under assigneeUserId 89 +
 *       1 under a second Arnulfo identity, assigneeUserId 1948070158297014318,
 *       name rendered "arnulfo munguia"), 74 at Bay-4 doors, 11 off Bay 4
 *       (DOCK4 3, DOCK7 2, DOCK5 2, DOCK10 1, DOCK9 1, DOCK6 1, DOCK45 1).
 *       Per-day counts by endTime (PT), ALL scopes: 11/17 2, 11/16 7, 11/13 8,
 *       11/12 12, 11/11 4, 11/10 10, 11/9 6, 11/6 8, 11/5 4, 11/4 11, 11/3 6,
 *       11/2 7, with no closures at all on 11/15, 11/14, 11/8, 11/7 or 11/1.
 *       TWO new closures landed since the 07:37a snapshot, both today: DOCK52
 *       TASK-5422342 (started 11/16 2:13:32p PT, closed 11/17 9:00:56a PT, 4
 *       loads all SHIPPED, seal 1304019 - the oldest open load task at the
 *       previous pull) and DOCK4 TASK-5422675 (started 11/16 5:55:00p PT, closed
 *       11/17 9:28:10a PT, 1 load SHIPPED, seal 25010982, off Bay 4). Newest
 *       overall: DOCK4 TASK-5422675 at 11/17 9:28:10a PT. Newest at a Bay-4 door:
 *       DOCK52 TASK-5422342 at 11/17 9:00:56a PT.
 *     - % scheduled inbounds received (11/17 PT): 0 of 3 = 0.0%. Computable -
 *       the denominator is non-zero - and genuinely zero: none of the three
 *       GURUNANDA receipts appointed for today (RN-195785 and RN-195778 at 12:00a
 *       PT, RN-5011522 at 10:00a PT) has a receivedStartTime.
 *     - % scheduled outbounds loaded (11/17 PT): 0 of 16 = 0.0%. Computable and
 *       genuinely zero: all 16 scheduled GURUNANDA orders are still pre-ship
 *       (PICKED 11, PLANNED 3, IMPORTED 1, PICKING 1) at 09:49a PT.
 *     - Inbound/outbound mix: 6 RECEIVE / 6 LOAD of 12 active GURUNANDA tasks.
 *     - Total doors occupied: 18 of 23 (plus 2 reserved, 3 available).
 *     - Planned GURUNANDA orders: live count 187 at this pull.
 *     - Door occupancy duration: available where an active task has a startTime
 *       and has not ended - 7 tasks on 7 doors at this pull (DOCK50 0h20m,
 *       DOCK51 11h17m, DOCK53 20h01m, DOCK54 12h02m, DOCK57 0h02m, DOCK61
 *       17h39m, DOCK71 17h47m), all measured to 11/17 09:49:16a PT. WMS has no
 *       occupancy-start field for task-less doors (13 of 23), for the 4 NEW
 *       GURUNANDA tasks (DOCK54 TASK-5423105, DOCK58 TASK-5420461, DOCK50
 *       TASK-5418313, DOCK69 TASK-5381972) or for the one stale task (DOCK50
 *       TASK-5090739).
 *     - Facility-wide schedule context for the 11/17 PT day (no customerId
 *       filter, same UTC-derived PT-day window): receipts scheduled 37, of which
 *       3 carry a receivedStartTime; orders scheduled 1,388 by totalCount, of
 *       which 10 are SHIPPED.
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
// The live yard query was re-read at this pull: {statuses:["FULL"]} returned 10
// facility rows and NONE of them is a GURUNANDA ORG-655875 TRAILER row with
// equipmentStatus FULL (the only GURUNANDA row in the set is vehicle 05125J3,
// which reads EMPTY / EMPTY_TO_LOAD), so the KPI legitimately reads 0. The
// static array stays empty rather than duplicating the live loader's result;
// Section 1 renders live from the WMS loader, so the dashboard still shows
// current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 187 at the 11/17 09:49a PT pull (it read 203
// at 11/17 07:37a PT).
export const plannedGurunandaOrderCount = 187;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/17 09:49a PT
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
// Reserved doors: DOCK54, DOCK65 (DOCK54 also reads spaceStatus OCCUPIED;
// DOCK65 reads spaceStatus EMPTY). Four further doors are dock AVAILABLE but
// still carry space OCCUPIED (DOCK52, DOCK55, DOCK56, DOCK59), so they count as
// Occupied. Fully free doors: DOCK63, DOCK67, DOCK72 - so 20 of 23 doors are
// not fully free.
// Raw tallies at this pull: dockStatus OCCUPIED 14 / AVAILABLE 7 / RESERVED 2;
// spaceStatus OCCUPIED 12 / EMPTY 11.
//
// BAY 4 ALL-CUSTOMER PHYSICAL TALLY (see SCOPE NOTE in the file header):
// active (NEW / IN_PROGRESS / EXCEPTION) tasks whose dockName is one of these
// 23 doors = 12 (RECEIVE 6, LOAD 6) on 9 doors. At this pull that equals the
// GURUNANDA-only tally exactly - all 12 tasks are ORG-655875.
// =====================================================================
export const bay4AllCustomerActiveTaskCount = 12;
export const bay4AllCustomerActiveReceiveCount = 6;
export const bay4AllCustomerActiveLoadCount = 6;

export const doors: DoorRecord[] = [
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD) + Gonzalo Rangel (RECEIVE NEW) + daira gonzalez (RECEIVE - STALE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5423064", "TASK-5418313", "TASK-5090739"],
    duration: "LOAD 0h20m since 11/17 9:29:00a PT (TASK-5423064, ARNULFO MUNGUIA, IN_PROGRESS, PRE_LOAD, created 9:26:30a PT, checked in 9:29:03a PT, 6 loads LOAD-5044668 / LOAD-5044664 / LOAD-5044624 / LOAD-5044621 / LOAD-5044609 / LOAD-5044607 ALL at status LOADING (pro 50100550 / 50100521 / 50100551 / 50100552 / 50100553 / 50100554), carrier ORG-659165 LTL, no sealNo yet, entry ET-1182966) · the door's second task is RECEIVE NEW, not started (TASK-5418313, Gonzalo Rangel, created 11/11 11:24:50a PT, entry ET-1181371, receipt RN-195495 at status IMPORTED, PO RMA0276 / reference 'Po # 979126', appointment 11/11 12:00a PT, in-yard 11/11 11:24:50a PT, carrier ORG-825, driver Christian Silva, container not recorded) - no startTime, so no duration basis · the third, TASK-5090739 (daira gonzalez), is STALE: started 2025-10-21 12:21:14p PDT and its endTime is 2025-10-22 10:42:01a PDT (RN-5002143 status CLOSED, container EGSU8032696, reference EGLV149507056809) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1182966 (row updated 11/17 9:29:03a PT) · the last load task to close here was TASK-5421917 (BYRON PALADINES, ORG-55783 - not GURUNANDA, 11/16 10:32:09a PT, 1 load SHIPPED, seal 25076956); the last receive task to close was TASK-5416210 (DANIELA GONZALEZ, KARAKA, LLC ORG-585450, 11/9 4:55:40p PT, FORCE_CLOSED)",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "EDUARDO MEJIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5422751"],
    duration: "LOAD 11h17m since 11/16 10:31:35p PT (TASK-5422751, EDUARDO MEJIA, IN_PROGRESS, PRE_LOAD, task created 11/16 9:45:35p PT, checked in 10:31:38p PT, updated 11:08:42p PT, seal 1304011 recorded, 3 loads LOAD-5044610 (DN-3460325) / LOAD-5044616 (DN-3460001) / LOAD-5044617 (DN-3459963) ALL at status LOADED, carrier ORG-659165 LTL, entry ET-1182803) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1182803 (row updated 11/16 10:31:38p PT) · the last load task to close here was TASK-5420549 (ARNULFO MUNGUIA, 11/13 1:56:58p PT, 1 load SHIPPED, seal 25010987); the last receive task to close here was TASK-5420402 (Fatima ponce, 11/13 10:42:38a PT, GURUNANDA, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1182866 (row updated 11/17 9:01:06a PT; DOCK56 carries the same entry ET-1182866) · the load task that held this door at the previous snapshot, TASK-5422342 (ARNULFO MUNGUIA, PRE_LOAD), CLOSED 11/17 9:00:56a PT with all 4 loads SHIPPED and seal 1304019 - 10 seconds before this door row's own update · the NEW task that was created here at 07:35a PT under 'A1SG' (TASK-5422898, LIVE_LOAD) was reassigned to DANIEL BELTRAN and closed at DOCK56 at 9:43:33a PT · the last receive task to close here was TASK-5417998 (Nanci Viviana Rosas, KARAKA, LLC, 11/11 2:39:35p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5422317"],
    duration: "LOAD 20h01m since 11/16 1:47:31p PT (TASK-5422317, ARNULFO MUNGUIA, IN_PROGRESS, PRE_LOAD, created 11/16 1:46:45p PT, checked in 1:47:36p PT, updated 4:25:12p PT, seal 1304046, 2 loads LOAD-5044525 (pro 50168600) / LOAD-5044619 BOTH at status LOADED, carrier ORG-659165 LTL, entry ET-1182659) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [], entry ET-1182659 (row updated 11/16 1:47:36p PT) · no load task of any customer has closed at this door since the one that is still open; the newest receive closure here is TASK-5407284 (ARNULFO MUNGUIA, KARAKA, LLC, 10/29 11:01:54a PDT)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Reserved",
    assignee: "ARNULFO MUNGUIA (LOAD IN_PROGRESS) + A1SG (LOAD NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5422749", "TASK-5423105"],
    duration: "TWO open LOAD tasks here, both GURUNANDA · LOAD 12h02m since 11/16 9:46:53p PT (TASK-5422749, ARNULFO MUNGUIA, IN_PROGRESS, PRE_LOAD, created 11/16 9:41:55p PT, checked in 9:46:55p PT, updated 11:02:57p PT, seal 25010983, 2 loads LOAD-5044611 (shipTo 'Gurunanda BP') / LOAD-5044615 BOTH at status LOADED, carrier ORG-659165 LTL, entry ET-1182801) · LOAD NEW, not started (TASK-5423105, created AND assigned 11/17 9:47:29a PT - the newest Bay-4 task at this pull - assigneeUserName 'A1SG' reproduced verbatim from WISE, assigneeUserId 1910160202361942018, LIVE_LOAD, 1 load LOAD-5044599 'CS02531444 UNIS BOL' still at status WINDOW_CHECKIN_DONE with load appointment 11/17 8:00a PT, carrier ORG-613903 LTL, shipTo 'Ross Stores Inc / DD's Discount', no sealNo yet, entry ET-1182990) · dock RESERVED, space OCCUPIED, occupiedCustomerIds [], entry ET-1182990 (row updated 11/17 9:47:30a PT - 1 second after TASK-5423105 was created) · the last load task to close here was TASK-5422351 (DANIEL BELTRAN, 11/16 3:08:02p PT, 1 load SHIPPED, seal 1304047); the last receive task to close here was TASK-5421959 (CANDY MENDEZ, KARAKA, LLC, 11/16 3:28:53p PT)",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1182881 (row updated 11/17 9:04:00a PT) · the load task that held this door, TASK-5422941 (DANIEL BELTRAN, ORG-655875), CLOSED 11/17 9:03:47a PT with 1 load SHIPPED and seal 291905 recorded - 13 seconds before this door row's own update · the last receive task to close here was TASK-5421731 (Nanci Viviana Rosas, KARAKA, LLC, 11/16 10:13:39a PT, FORCE_CLOSED) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [], entry ET-1182866 (row updated 11/17 9:44:16a PT; DOCK52 carries the same entry ET-1182866) · the newest Bay-4 load closure at this pull happened here: TASK-5422898 (DANIEL BELTRAN, ORG-655875, 11/17 9:43:33a PT, 1 load SHIPPED, seal 1379064) - 43 seconds after the door row's own update; that task was the NEW DOCK52 / 'A1SG' task at the 07:37a snapshot · the last receive task to close here was TASK-5418081 (Nanci Viviana Rosas, KARAKA, LLC, 11/11 12:11:56p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: "DANIEL BELTRAN (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5423006"],
    duration: "LOAD 0h02m since 11/17 9:46:24a PT (TASK-5423006, DANIEL BELTRAN, IN_PROGRESS, LIVE_LOAD, created 11/17 8:54:10a PT, checked in 9:46:33a PT, 2 loads LOAD-5043948 '47847466101 // SP BOL' (pro 5043948) / LOAD-5043944 '47847498291 // SP BOL' (pro 5043944) BOTH at status LOADING, carrier ORG-5960 LTL, shipTo 'Amazon.com Services, Inc.', load appointment 11/12 11:00a PT, no sealNo yet, task note 'DOCK   57 ET-1182938', entry ET-1182938) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [], entry ET-1182938 (row updated 11/17 9:46:33a PT) · the last load task to close here was TASK-5421821 (DANIEL BELTRAN, 11/16 1:31:01p PT, 1 load SHIPPED, seal 1304044); the newest receive closure here is TASK-5414098 (Nanci Viviana Rosas, KARAKA, LLC, 11/9 2:14:50p PT)",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: "Luis Alberto Paredes (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5420461"],
    duration: "RECEIVE NEW, not started (created 11/13 10:13:50a PT, TASK-5420461, Luis Alberto Paredes, entry ET-1182030, receipt RN-5011507 at status IMPORTED, PO PO9419, appointment 11/13 10:00a PT, in-yard 11/13 10:13:27a PT, container Leafchem11132026, carrier ORG-825, driver DANIEL RIOS) - no startTime, so no duration basis · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1182700 (row updated 11/17 6:20:19a PT; DOCK59 carries the same entry ET-1182700) · the last load task to close here was TASK-5420377 (BARTOLO RAMIREZ, 11/13 12:10:57p PT, 1 load SHIPPED, seal 1304053); the last receive task to close here was TASK-5414761 (DANIELA GONZALEZ, 11/6 5:09:25p PT, GURUNANDA)",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [], entry ET-1182700 (row updated 11/16 3:17:37p PT; DOCK58 carries the same entry ET-1182700) · the newest Bay-4 load closure before today happened here: TASK-5422412 (DANIEL BELTRAN, 11/16 3:17:16p PT, 1 load SHIPPED, seal A52687) - 21 seconds after the door row's own update · the receive task that held it, TASK-5417811 (CANDY MENDEZ, GURUNANDA), was FORCE_CLOSED 11/11 12:09:52p PT · no occupancy-start field in WMS",
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
    duration: "RECEIVE 17h39m since 11/16 4:10:04p PT (TASK-5422524, JESUS ESPINOZA, IN_PROGRESS, created 11/16 3:55:28p PT, dock check-in 11/16 4:21:59p PT, updated 11/16 4:21:59p PT, no dockCheckOutTime yet, entry ET-1182732, 1 receipt RN-5011599 at status IN_PROGRESS, PO/container ZCSU7568630, reference S00811293, appointment 11/16 10:30a PT, in-yard 11/16 3:55:28p PT, carrier ORG-825) · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1182732 (row updated 11/16 4:21:59p PT) · the receive task that held it before, TASK-5421037 (GURUNANDA), CLOSED 11/16 10:27:57a PT under CANDY MENDEZ · the last load task to close here was TASK-5420400 (BARTOLO RAMIREZ, 11/13 10:56:09a PT, 1 load SHIPPED, seal 1304052)",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds [], entry ET-1181858 (row updated 11/15 2:12:40p PT) · the last receive task to close here was TASK-5419984 (DANIELA GONZALEZ, 11/12 8:25:21p PT, GURUNANDA); no load task of any customer has closed at this door inside the 2026-10-31 - now window · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1182804 (row updated 11/16 11:38:22p PT) · the newest Bay-4 receive closure on record happened here: TASK-5422753 (JESUS ESPINOZA, CLOSED 11/16 11:38:25p PT - 3 seconds after this door row's own update); the earlier one, TASK-5419965 (Fatima ponce), was FORCE_CLOSED 11/16 10:47:28a PT · no load task of any customer has closed at this door inside the 2026-10-31 - now window · fully free",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1182176 (row updated 11/16 6:15:25a PT) · the last receive task to close here was TASK-5420980 (DANIELA GONZALEZ, 11/13 9:32:35p PT, GURUNANDA); no load task of any customer has closed at this door inside the 2026-10-31 - now window · no occupancy-start field in WMS",
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
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds [], entry ET-1182734 (row updated 11/16 7:17:01p PT) · the last receive task to close here was TASK-5422534 (DANIELA GONZALEZ, 11/16 7:17:17p PT, GURUNANDA - 16 seconds after this door row's own update); no load task of any customer has closed at this door inside the 2026-10-31 - now window · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds [], entry ET-1181521 (row updated 11/13 8:14:15p PT) · the last receive task to close here was TASK-5418827 (Fatima ponce, 11/12 9:38:33a PT, GURUNANDA); no load task of any customer has closed at this door inside the 2026-10-31 - now window · fully free",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds [], entry ET-1177841 (row updated 11/12 8:59:43p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - now window; the newest receive closure here is TASK-5408610 (Fatima ponce, 11/2 3:06:46p PT, GURUNANDA) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW, not started (created 9/30 10:46:50a PDT, TASK-5381972, Jorge Antonio Franco, entry ET-1162686, receipt RN-5010583 at status IMPORTED, PO9139-2, container Jpack09242026, no appointment on the receipt, in-yard 9/30 10:46:48a PDT, carrier ORG-825, driver ULYSSES PEREZ; task note reads 'DOCK   69 ET-1162686') - no startTime, so no duration basis · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1171953 (row updated 11/12 8:59:19p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - now window; the newest receive closure here is TASK-5398554 (DANIELA GONZALEZ, 10/20 6:56:09p PDT, GURUNANDA)",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1172826 (row updated 11/16 6:20:32a PT) · no load task of any customer has closed at this door inside the 2026-10-31 - now window; the newest receive closure here is TASK-5399423 (Fatima ponce, 10/21 9:42:23a PDT, GURUNANDA) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: "Fatima ponce (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5422515"],
    duration: "RECEIVE 17h47m since 11/16 4:01:40p PT (TASK-5422515, Fatima ponce, IN_PROGRESS, created 11/16 3:51:17p PT, dock check-in 11/16 4:36:13p PT, updated 11/17 7:17:33a PT - the most recent task update on any active Bay-4 task - no dockCheckOutTime yet, entry ET-1182729, 1 receipt RN-5011579 at status IN_PROGRESS, PO/container MATU2536317, reference B00420742, appointment 11/13 1:45p PT, in-yard 11/16 3:51:17p PT, carrier ORG-825) · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1182729 (row updated 11/16 4:36:13p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - now window; the newest receive closure here is TASK-5406898 (DANIELA GONZALEZ, 10/28 7:41:53p PDT, GURUNANDA)",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1176051 (row updated 11/11 6:13:28p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - now window; the newest receive closure here is TASK-5405554 (DANIELA GONZALEZ, 10/27 5:45:00p PDT, GURUNANDA) · fully free",
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

// Doors that carried dockStatus RESERVED at this pull: 2 (DOCK54, DOCK65).
// They are held/reserved rather than free, and DOCK54 also reads spaceStatus
// OCCUPIED, so "not fully free" doors total 20 of 23.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee - GURUNANDA scope (the dashboard cards).
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, Nov 17
// 2026 09:49a PT).
// 12 active-status tasks at Bay-4 doors: 6 LOAD + 6 RECEIVE, at 9 distinct doors
// (DOCK50, DOCK51, DOCK53, DOCK54, DOCK57, DOCK58, DOCK61, DOCK69, DOCK71).
// ARNULFO MUNGUIA (89): 3 LOAD (DOCK50 TASK-5423064 IN_PROGRESS PRE_LOAD, DOCK53
//   TASK-5422317 IN_PROGRESS PRE_LOAD, DOCK54 TASK-5422749 IN_PROGRESS PRE_LOAD)
// A1SG (1910160202361942018): 1 LOAD (DOCK54 TASK-5423105, NEW, LIVE_LOAD)
// DANIEL BELTRAN (1932077596691410945): 1 LOAD (DOCK57 TASK-5423006,
//   IN_PROGRESS, LIVE_LOAD)
// EDUARDO MEJIA (2029638366082560001): 1 LOAD (DOCK51 TASK-5422751, IN_PROGRESS,
//   PRE_LOAD)
// JESUS ESPINOZA (1948070158297014342): 1 RECEIVE (DOCK61 TASK-5422524,
//   IN_PROGRESS)
// Fatima ponce (2053885581368619009): 1 RECEIVE (DOCK71 TASK-5422515,
//   IN_PROGRESS)
// Luis Alberto Paredes (2000828853478171162): 1 RECEIVE (DOCK58 TASK-5420461, NEW)
// Gonzalo Rangel (2000828853478170980): 1 RECEIVE (DOCK50 TASK-5418313, NEW)
// Jorge Antonio Franco (2060441422549078018): 1 RECEIVE (DOCK69 TASK-5381972, NEW)
// daira gonzalez (1948070158297014492): 1 RECEIVE (DOCK50 TASK-5090739,
//   IN_PROGRESS, stale)
// All names/ids resolved verbatim from the WMS task payloads (assigneeUserName /
// assigneeUserId); no name was normalised or guessed. Adding the non-GURUNANDA
// tasks would change nothing at this pull - there are none on Bay-4 doors - so
// the all-customer tally also reads 12 (see bay4AllCustomerActiveTaskCount).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 3 },
  { name: "A1SG", taskCount: 1 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "EDUARDO MEJIA", taskCount: 1 },
  { name: "JESUS ESPINOZA", taskCount: 1 },
  { name: "Fatima ponce", taskCount: 1 },
  { name: "Luis Alberto Paredes", taskCount: 1 },
  { name: "Gonzalo Rangel", taskCount: 1 },
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

// Mix: 6 RECEIVE + 6 LOAD = 12 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 6, total: 12 },
  { label: "Outbound (LOAD)", count: 6, total: 12 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 6, total: 12 },
  { label: "Inbound", count: 6, total: 12 },
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
//   % scheduled outbounds loaded TODAY: 16 GURUNANDA orders carry a scheduleDate
//   inside that window (scheduleDatePeriod ["2026-11-17 08:00:00",
//   "2026-11-18 07:59:59"], totalCount 16, all 16 read) of which 0 are at status
//   SHIPPED (the other 16 are PICKED 11, PLANNED 3, IMPORTED 1, PICKING 1) =
//   0 / 16 = 0.0%.
//   Genuinely zero at a 09:49a PT pull: nothing on today's outbound schedule has
//   shipped yet (the facility-wide 11/17 PT-day order set has only 10 SHIPPED out
//   of 1,388, and the three Bay-4 load closures today all belong to other
//   customers or to earlier GURUNANDA tasks that were not on today's schedule).
//   Both numerators are real counts of a non-empty denominator, so neither card
//   is a "no schedule" state (compare the 11/14-11/15 weekend snapshots, which
//   published both percentages as NOT COMPUTABLE because GURUNANDA had zero
//   scheduled receipts and zero scheduled orders on those days).
export const scheduleAvailable = true;              // 3 GURUNANDA receipts scheduled on 11/17
export const outboundScheduleAvailable = true;      // 16 GURUNANDA orders scheduled on 11/17
export const scheduledInboundOrders = 3;            // receipts with appointmentTime in the 11/17 PT day
export const scheduledOutboundOrders = 16;          // orders with scheduleDate in the 11/17 PT day
export const scheduledInboundReceived = 0;          // receipts with receivedStartTime in that set
export const scheduledOutboundLoaded = 0;           // orders at status SHIPPED in that set
export const pctScheduledInboundReceived = 0.0;     // 0 of 3
export const pctScheduledOutboundLoaded = 0.0;      // 0 of 16
// Facility-wide schedule context for the 11/17 PT day, all customers (same two
// endpoints, no customerId filter, same UTC-derived PT-day window): 37 receipts
// scheduled, of which 3 carry a receivedStartTime; 1,388 orders scheduled by
// totalCount, of which 10 are SHIPPED.
export const facilityWideReceiptsCreated = 37;
export const facilityWideReceiptsReceived = 3;
export const facilityWideLoadsCreated = 1388;
export const facilityWideLoadsShipped = 10;

// Door occupancy duration: available from task startTime where a task exists on
// the door, has actually started and has not already ended; unavailable for
// task-less doors and for NEW tasks with no startTime (WMS has no
// occupancy-start field, and the dock-door-status dashboard endpoint returns an
// empty Duration column). 13 of 23 doors carry no active task at this pull, 4 of
// the 12 active tasks are NEW/not started (DOCK54 TASK-5423105, DOCK58
// TASK-5420461, DOCK50 TASK-5418313, DOCK69 TASK-5381972) and 1 is stale
// (DOCK50 TASK-5090739), so a duration exists for 7 tasks on 7 doors (DOCK50
// 0h20m, DOCK51 11h17m, DOCK53 20h01m, DOCK54 12h02m, DOCK57 0h02m, DOCK61
// 17h39m and DOCK71 17h47m, all measured to 11/17 09:49:16a PT).
export const doorDurationsAvailable = true;

// All Bay 4 active GURUNANDA task records (DOCK50-DOCK72, Nov 17 2026 09:49a PT)
// 12 tasks total: 6 LOAD + 6 RECEIVE. One is a data anomaly (TASK-5090739 on
// DOCK50, stale since 2025-10-21). All 12 tasks on these doors are GURUNANDA at
// this pull, so this array is the complete physical picture as well as the
// customer-scoped one.
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA has 85 CLOSED GURUNANDA load transactions with endTime inside
// the 2026-10-31 00:00:00 UTC - now window (84 under assigneeUserId 89 plus 1
// under a second Arnulfo identity, assigneeUserId 1948070158297014318, name
// rendered "arnulfo munguia"; 74 of them at Bay-4 doors - DOCK51 12, DOCK52 12,
// DOCK53 11, DOCK54 11, DOCK55 8, DOCK56 7, DOCK50 7, DOCK57 3, DOCK60 2,
// DOCK59 1; the other 11 are on DOCK4 3, DOCK7 2, DOCK5 2, DOCK10 1, DOCK9 1,
// DOCK6 1 and DOCK45 1); per-day counts by endTime (PT): 11/17 2, 11/16 7,
// 11/13 8, 11/12 12, 11/11 4, 11/10 10, 11/9 6, 11/6 8, 11/5 4, 11/4 11 and
// 11/3 6, 11/2 7, with no closures on 11/15, 11/14, 11/8, 11/7 or 11/1.
// Two transactions are new since the 07:37a snapshot: DOCK52 TASK-5422342
// (started 11/16 2:13:32p PT, closed 11/17 9:00:56a PT; 4 loads all SHIPPED;
// seal 1304019) and DOCK4 TASK-5422675 (started 11/16 5:55:00p PT, closed 11/17
// 9:28:10a PT; 1 load SHIPPED; seal 25010982).
// The newest overall is DOCK4 TASK-5422675 (closed 11/17 9:28:10a PT); the
// newest at a Bay-4 door is DOCK52 TASK-5422342 (closed 11/17 9:00:56a PT).
// He currently holds 3 open GURUNANDA LOAD tasks, all PRE_LOAD: DOCK50
// TASK-5423064 (started 11/17 9:29:00a PT, 6 loads LOADING, no seal yet),
// DOCK53 TASK-5422317 (started 11/16 1:47:31p PT, 2 loads both LOADED, seal
// 1304046) and DOCK54 TASK-5422749 (started 11/16 9:46:53p PT, 2 loads both
// LOADED, seal 25010983).
export const assignments: TaskRecord[] = [
  // ----- INBOUND / RECEIVE (6) -----
  {
    taskId: "TASK-5422524",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 17h39m since 11/16 4:10:04p PT (JESUS ESPINOZA, task created 11/16 3:55:28p PT, dock check-in 11/16 4:21:59p PT, updated 11/16 4:21:59p PT, no dockCheckOutTime; entry ET-1182732, RN-5011599 at status IN_PROGRESS, PO/container ZCSU7568630, reference S00811293, appointment 11/16 10:30a PT, in-yard 11/16 3:55:28p PT, carrier ORG-825)",
    assignee: "JESUS ESPINOZA",
    door: "DOCK61",
  },
  {
    taskId: "TASK-5422515",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 17h47m since 11/16 4:01:40p PT (Fatima ponce, task created 11/16 3:51:17p PT, updated 11/17 7:17:33a PT - the most recent update on any active Bay-4 task - no dockCheckOutTime; entry ET-1182729, RN-5011579 at status IN_PROGRESS, PO/container MATU2536317, reference B00420742, appointment 11/13 1:45p PT, in-yard 11/16 3:51:17p PT, carrier ORG-825)",
    assignee: "Fatima ponce",
    door: "DOCK71",
  },
  {
    taskId: "TASK-5420461",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/13 10:13:50a PT (Luis Alberto Paredes; entry ET-1182030, RN-5011507 at status IMPORTED, PO PO9419, appointment 11/13 10:00a PT, in-yard 11/13 10:13:27a PT, container Leafchem11132026, carrier ORG-825, driver DANIEL RIOS) - task has no startTime",
    assignee: "Luis Alberto Paredes",
    door: "DOCK58",
  },
  {
    taskId: "TASK-5418313",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/11 11:24:50a PT (Gonzalo Rangel; entry ET-1181371, RN-195495 at status IMPORTED, PO RMA0276 / reference 'Po # 979126', appointment 11/11 12:00a PT, in-yard 11/11 11:24:50a PT, container not recorded, carrier ORG-825, driver Christian Silva) - task has no startTime",
    assignee: "Gonzalo Rangel",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/30 10:46:50a PDT (Jorge Antonio Franco; entry ET-1162686, RN-5010583 at status IMPORTED, PO9139-2, container Jpack09242026, no appointment on the receipt, in-yard 9/30 10:46:48a PDT, carrier ORG-825, driver ULYSSES PEREZ; task note 'DOCK   69 ET-1162686') - task has no startTime",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 2025-10-21 12:21:14p PDT; status still IN_PROGRESS although endTime is 2025-10-22 10:42:01a PDT; daira gonzalez, entry ET-1027622, RN-5002143 which is itself already CLOSED, container EGSU8032696, reference EGLV149507056809, carrier ORG-34911)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },

  // ----- OUTBOUND / LOAD (6) -----
  {
    taskId: "TASK-5423064",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 0h20m since 11/17 9:29:00a PT (ARNULFO MUNGUIA, task created 11/17 9:26:30a PT, checked in 9:29:03a PT, updated 9:29:03a PT; PRE_LOAD, no sealNo yet, 6 loads LOAD-5044668 (DN-3466584, pro 50100550), LOAD-5044664 (DN-3465520, pro 50100521), LOAD-5044624 (DN-3460431, pro 50100551), LOAD-5044621 (DN-3459670, pro 50100552), LOAD-5044609 (DN-3460409, pro 50100553) and LOAD-5044607 (DN-3460416, pro 50100554) ALL at status LOADING, carrier ORG-659165 LTL, entry ET-1182966)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5422317",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 20h01m since 11/16 1:47:31p PT (ARNULFO MUNGUIA, task created 11/16 1:46:45p PT, checked in 1:47:36p PT, updated 4:25:12p PT; PRE_LOAD, seal 1304046, 2 loads LOAD-5044525 (pro 50168600) and LOAD-5044619 BOTH at status LOADED, carrier ORG-659165 LTL, entry ET-1182659)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5422749",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 12h02m since 11/16 9:46:53p PT (ARNULFO MUNGUIA, task created 11/16 9:41:55p PT, checked in 9:46:55p PT, updated 11/16 11:02:57p PT; PRE_LOAD, seal 25010983, 2 loads LOAD-5044611 (shipTo 'Gurunanda BP') and LOAD-5044615 BOTH at status LOADED, carrier ORG-659165 LTL, entry ET-1182801)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5422751",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 11h17m since 11/16 10:31:35p PT (EDUARDO MEJIA, task created 11/16 9:45:35p PT, checked in 10:31:38p PT, updated 11/16 11:08:42p PT; PRE_LOAD, seal 1304011, 3 loads LOAD-5044610, LOAD-5044616 and LOAD-5044617 ALL at status LOADED, carrier ORG-659165 LTL, entry ET-1182803)",
    assignee: "EDUARDO MEJIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5423006",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 0h02m since 11/17 9:46:24a PT (DANIEL BELTRAN, task created 11/17 8:54:10a PT, checked in 9:46:33a PT; LIVE_LOAD, no sealNo yet, 2 loads LOAD-5043948 (loadNo '47847466101 // SP BOL', pro 5043948) and LOAD-5043944 (loadNo '47847498291 // SP BOL', pro 5043944) BOTH at status LOADING, carrier ORG-5960 LTL, shipTo 'Amazon.com Services, Inc.', load appointment 11/12 11:00a PT, entry ET-1182938)",
    assignee: "DANIEL BELTRAN",
    door: "DOCK57",
  },
  {
    taskId: "TASK-5423105",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created and assigned 11/17 9:47:29a PT - the newest Bay-4 task at this pull (assigneeUserName 'A1SG' reproduced verbatim from WISE, assigneeUserId 1910160202361942018; LIVE_LOAD, 1 load LOAD-5044599 (loadNo 'CS02531444 UNIS BOL') still at status WINDOW_CHECKIN_DONE, load appointment 11/17 8:00a PT, carrier ORG-613903 LTL, shipTo 'Ross Stores Inc / DD's Discount', no sealNo yet, no startTime, entry ET-1182990)",
    assignee: "A1SG",
    door: "DOCK54",
  },
];
