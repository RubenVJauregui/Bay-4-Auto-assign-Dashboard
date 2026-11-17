/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-17 07:37a PT (live WISE / WMS-BAM APIs)
 *   Every value below was re-read live at ONE reference
 *   (2026-11-17T15:37:45Z = 07:37:45a PT). No value in this file is carried over
 *   from an earlier snapshot. Source counts quoted below were read across the
 *   15:37:39-15:37:49Z (07:37:39-07:37:49a PT) pull window. Reads were made in
 *   WISE raw-UTC mode (no item-time-zone header) - see QUERY MODE WARNING below
 *   before re-running any of these queries.
 *
 *   TIMESTAMP SEMANTICS - single authority for this file, verified again at this
 *   pull: WISE/WMS-BAM returns task, receipt, order and appointment timestamps as
 *   UTC strings with NO offset. They are NOT facility wall-clock. Render PT with a
 *   real zone conversion: PST = UTC-8 (on/after 2026-11-01), PDT = UTC-7 (before
 *   2026-11-01). Evidence read at this pull: TASK-5422898 createdTime
 *   2026-11-17T15:35:40 = 11/17 07:35:40a PT; RN-5011522 appointmentTime
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
 *   agree exactly: the raw-UTC PT-day window above returned 1 receipt
 *   (RN-5011522) and the PT-header calendar window 2026-11-17 00:00:00 ->
 *   23:59:59 returned the same single receipt. Do NOT swap in the naive raw-UTC
 *   calendar day: that window (2026-11-17 00:00:00 -> 23:59:59 with no timezone
 *   header) returns 7 receipts, 6 of which are evening 11/16-PT appointments
 *   (01:30Z, 04:00Z, 05:00Z, 07:00Z = 11/16 5:30p / 8:00p / 9:00p / 11:00p PT)
 *   that belong to the previous business day. Pick one mode and its matching
 *   window.
 *   Durations are measured to the 2026-11-17 07:37:45a PT pull reference.
 *
 *   SOURCES USED AT THIS PULL:
 *     - POST /wms-bam/wms-location/search, body {exactlyNames:[DOCK50..DOCK72]}
 *       -> code 0, 23/23 rows (name, id, category=DOCK, type=DOCK,
 *       status=USABLE on all 23, dockStatus, spaceStatus, occupiedCustomerIds,
 *       entryId, updatedTime). Door rows are used for "Door Utilization".
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer
 *       filter) -> totalCount 45, all 45 read (34 IN_PROGRESS, 11 NEW); exactly 5
 *       of them sit on a Bay-4 dockName, all 5 GURUNANDA (4 IN_PROGRESS PRE_LOAD,
 *       1 NEW LIVE_LOAD). No facility load task carries a null dockName.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer
 *       filter) -> totalCount 84, all 84 read (54 IN_PROGRESS, 30 NEW); 6 of them
 *       sit on a Bay-4 dockName (all GURUNANDA). 8 of the 84 carry no dockName at
 *       all (not yet docked) and none of them is a Bay-4 door.
 *     - POST /wms-bam/inbound/receipt/search-by-paging
 *       {customerId: ORG-655875, appointmentTimeFrom "2026-11-17 08:00:00",
 *       appointmentTimeTo "2026-11-18 07:59:59"} -> totalCount 1, read: RN-5011522
 *       at status IMPORTED, appointment 11/17 10:00a PT, PO 9416, container
 *       TQL11172026, carrier ORG-825, in-yard null, receivedStartTime null.
 *       One scheduled receipt and zero started receipts = 0 of 1 received.
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, scheduleDatePeriod ["2026-11-17 08:00:00",
 *       "2026-11-18 07:59:59"]} -> totalCount 15, all 15 read; statuses PICKED 11,
 *       PLANNED 3, PICKING 1, SHIPPED 0 -> 0 of 15 loaded. scheduleDate is
 *       date-only and stored at 08:00:00 UTC, so this window and the naive
 *       calendar-day window return the identical 15 (re-tested at this pull);
 *       the window choice only changes results for receipt appointmentTime.
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], endTimeFrom "2026-10-31 00:00:00",
 *       endTimeTo "2026-11-18 23:59:59" -> totalCount 719 (all customers), all
 *       719 read (oldest endTime in the window is 10/31 00:11:13Z). The
 *       ARNULFO MUNGUIA / GURUNANDA subset is measured by a dedicated query
 *       instead (customerId ORG-655875 + assigneeUserIds [89,
 *       1948070158297014318] + the same endTime window) -> totalCount 83, all 83
 *       read, 73 of them at Bay-4 doors (his "Assigned Activity" stream).
 *       The newest load closure ANYWHERE in the facility is still 11/16
 *       5:11:48p PT (TASK-5422402, DOCK150, HUGO TEXCA, ORG-34557) - no load task
 *       has closed yet in the 11/17 PT day. Newest at a Bay-4 door: 11/16
 *       3:17:16p PT (TASK-5422412, DOCK59, DANIEL BELTRAN, seal A52687, 1 load
 *       SHIPPED).
 *       NOTE: orderBy/sort are not supported on this endpoint (they null out
 *       totalCount); sort client-side after reading.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], sorted endTime DESC -> totalCount
 *       17,809; the newest 2,000 were read (newest closure 11/17 12:06:03a PT).
 *       Two Bay-4 receive closures happened after the previous snapshot, both on
 *       11/16 evening PT, both GURUNANDA at DOCK63: TASK-5422517 (CLOSED
 *       8:31:52p, JESUS ESPINOZA) and TASK-5422753 (CLOSED 11:38:25p, JESUS
 *       ESPINOZA). No Bay-4 receive task has closed in the 11/17 PT day yet.
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, status: PLANNED} -> totalCount 203.
 *     - POST /wms-bam/yard/equipment/search {statuses:["FULL"]} -> 10 rows
 *       facility-wide, of which 0 are GURUNANDA ORG-655875 TRAILER rows reading
 *       equipmentStatus FULL (the FULL set is a GRAZA "up" vehicle, a VITA COCO
 *       container, 3 Euromarket containers, a YERBA MADRE trailer, a GURUNANDA
 *       container FULL_TO_OFFLOAD, a GURUNANDA TRAILER reading EMPTY with
 *       LOAD_WAITING, a GURUNANDA VEHICLE reading EMPTY and 1 unclassified
 *       vehicle), which is why the live "In Yard Full Trailers" KPI reads 0.
 *     - Task-name keyword RE-TESTED at this pull: the load-task `keyword` filter
 *       is still a NO-OP. "Guru live out / in assign to Arnulfo", "Guru live out"
 *       and a nonsense string ("zzzz-no-such-task-zzzz") all return the same
 *       facility total, 22,640. All 11 active Bay-4 tasks carry projectId null,
 *       so there is no named task group to resolve. The "Guru live out / in
 *       assign to Arnulfo" stream is therefore reported as ARNULFO MUNGUIA's
 *       task-assignment transactions on the GURUNANDA live-out/live-in work, and
 *       nothing is invented.
 *
 *   SCOPE NOTE (read before comparing to an earlier snapshot):
 *     The line-level metrics on this dashboard are GURUNANDA-scoped (the same
 *     customer scope the dashboard has always published). At THIS pull that
 *     distinction is inert: all 11 active Bay-4 tasks across all customers are
 *     GURUNANDA (ORG-655875), so the GURUNANDA cards and the physical tallies
 *     agree exactly. The 2 KARAKA, LLC receive tasks that physically occupied
 *     DOCK54 at the previous snapshot (TASK-5421959 and TASK-5419478, both
 *     ARNULFO MUNGUIA) both closed on 11/16 afternoon PT (3:28:53p and 3:04:11p).
 *     bay4AllCustomerActiveTaskCount / ...ReceiveCount / ...LoadCount are
 *     exported anyway so a future non-GURUNANDA divergence stays explicit.
 *
 *   Key state at this pull:
 *     - DOOR STATUS: occupied 17, reserved 3, available 3 (17+3+3 = 23). Only
 *       DOCK63, DOCK67 and DOCK72 are fully free (dock AVAILABLE + space EMPTY).
 *       Raw dockStatus: OCCUPIED 13, AVAILABLE 7, RESERVED 3. Raw spaceStatus:
 *       OCCUPIED 11, EMPTY 12. The three RESERVED doors are DOCK50 (spaceStatus
 *       OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1182531),
 *       DOCK52 (spaceStatus OCCUPIED, occupiedCustomerIds none, entry
 *       ET-1182866 - its row was updated 07:35:43a PT, the newest door-row
 *       update at this pull, 2 seconds after the NEW DOCK52 load task
 *       TASK-5422898 was created) and DOCK65 (spaceStatus EMPTY). A reservation
 *       is a held door, so it is reported in its own "Reserved" bucket rather
 *       than folded into "Occupied"; 20 of the 23 doors are therefore not fully
 *       free at this pull. Compare 11/16 12:40p PT: occupied 16, reserved 3,
 *       available 4.
 *     - ACTIVE TASKS: 11 tasks - 6 RECEIVE / 5 LOAD - at 9 distinct doors
 *       (DOCK50 ×2, DOCK51, DOCK52 ×2, DOCK53, DOCK54, DOCK58, DOCK61, DOCK69,
 *       DOCK71). There is no longer any scope divergence: all 11 are GURUNANDA.
 *       Compare 11/16 12:40p PT: 5 GURUNANDA tasks (4 RECEIVE / 1 LOAD) at 4
 *       doors, 7 physical across all customers at 5 doors.
 *     - ASSIGNMENTS BY ASSIGNEE (GURUNANDA, the dashboard cards): EDUARDO MEJIA
 *       2 (LOAD DOCK51, LOAD DOCK52), ARNULFO MUNGUIA 2 (LOAD DOCK53, LOAD
 *       DOCK54), A1SG 1 (LOAD DOCK52), JESUS ESPINOZA 1 (RECEIVE DOCK61), Fatima
 *       ponce 1 (RECEIVE DOCK71), Luis Alberto Paredes 1 (RECEIVE DOCK58),
 *       Gonzalo Rangel 1 (RECEIVE DOCK50), Jorge Antonio Franco 1 (RECEIVE
 *       DOCK69), daira gonzalez 1 (RECEIVE DOCK50, stale) = 11.
 *       "A1SG" is the assigneeUserName WISE returns verbatim on TASK-5422898
 *       (assigneeUserId 1910160202361942018, assigned 07:35:40a PT). It is
 *       reproduced exactly as WISE reports it - it is not normalised, expanded,
 *       or guessed to be a person or a shared login.
 *     - LOAD PROGRESS: 4 Bay-4 load tasks are IN_PROGRESS / PRE_LOAD and all 4
 *       have every one of their loads at status LOADED with a sealNo recorded;
 *       none is yet CLOSED. The newest one is DOCK52 TASK-5422898 (NEW,
 *       LIVE_LOAD, created and assigned 07:35:40a PT, 1 load LOAD-5044488 still
 *       at WINDOW_CHECKIN_DONE, no sealNo yet, carrier ORG-471466, load
 *       appointment 11/12 11:00a PT).
 *     - ANOMALIES: 1, unchanged. TASK-5090739 (DOCK50, RECEIVE, started
 *       2025-10-21 1:21:14p PDT) is still returned by the active-status query
 *       although its endTime is 2025-10-22 10:42:01a PDT and its linked receipt
 *       RN-5002143 is CLOSED. Flagged, not given an open-ended duration.
 *     - Task "Guru live out / in assign to Arnulfo": 83 CLOSED load transactions
 *       with endTime from 2026-10-31 00:00:00 UTC (82 under assigneeUserId 89 +
 *       1 under a second Arnulfo identity, assigneeUserId 1948070158297014318,
 *       name rendered "arnulfo munguia"), 73 at Bay-4 doors, 10 off Bay 4
 *       (DOCK4 2, DOCK5 2, DOCK7 2, DOCK6 1, DOCK9 1, DOCK10 1, DOCK45 1).
 *       Per-day counts by endTime (PT), ALL scopes: 11/16 7, 11/13 8, 11/12 12,
 *       11/11 4, 11/10 10, 11/9 6, 11/6 8, 11/5 4, 11/4 11, 11/3 6, 11/2 7, with
 *       no closures at all on 11/1, 11/7, 11/8, 11/14, 11/15, 11/16-after-noon
 *       or 11/17. His stream is therefore UNCHANGED from the previous snapshot -
 *       re-read and re-verified, not carried over: no new Arnulfo closure has
 *       landed since 11/16 11:40:39a PT. Newest overall: TASK-5421016 at DOCK10
 *       (started 11/13 6:49:05p PT, closed 11/16 11:40:39a PT). Newest at a Bay-4
 *       door: DOCK56 TASK-5421056 (started 11/14 9:53:54p PT, closed 11/16
 *       11:02:48a PT, 2 loads both SHIPPED, seal 25010981). Zero closures in the
 *       11/17 PT day so far.
 *     - % scheduled inbounds received (11/17 PT): 0 of 1 = 0.0%. Computable -
 *       the denominator is non-zero - and genuinely zero: the single GURUNANDA
 *       receipt appointed for today (RN-5011522, 10:00a PT) has not started
 *       receiving.
 *     - % scheduled outbounds loaded (11/17 PT): 0 of 15 = 0.0%. Computable and
 *       genuinely zero: all 15 scheduled GURUNANDA orders are still pre-ship
 *       (PICKED 11, PLANNED 3, PICKING 1) at 07:37a PT.
 *     - Inbound/outbound mix: 6 RECEIVE / 5 LOAD of 11 active GURUNANDA tasks.
 *     - Total doors occupied: 17 of 23 (plus 3 reserved, 3 available).
 *     - Planned GURUNANDA orders: live count 203 at this pull.
 *     - Door occupancy duration: available where an active task has a startTime
 *       and has not ended - 6 tasks on 6 doors at this pull (DOCK51 9h06m,
 *       DOCK52 17h24m, DOCK53 17h50m, DOCK54 9h50m, DOCK61 15h27m, DOCK71
 *       15h36m), all measured to 11/17 07:37:45a PT. WMS has no occupancy-start
 *       field for task-less doors (14 of 23), for the 4 NEW GURUNANDA tasks
 *       (DOCK50 TASK-5418313, DOCK58 TASK-5420461, DOCK69 TASK-5381972, DOCK52
 *       TASK-5422898) or for the one stale task (DOCK50 TASK-5090739).
 *     - Facility-wide schedule context for the 11/17 PT day (no customerId
 *       filter, same UTC-derived PT-day window): receipts scheduled 35, of which
 *       1 carries a receivedStartTime; orders scheduled 1,109 by totalCount, of
 *       which 12 are SHIPPED.
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
// equipmentStatus FULL (the one GURUNANDA trailer in the set, DHTS53669, reads
// EMPTY / LOAD_WAITING; the GURUNANDA container TGBU8860431 is FULL_TO_OFFLOAD
// but is a CONTAINER), so the KPI legitimately reads 0. The static array stays
// empty rather than duplicating the live loader's result; Section 1 renders live
// from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 203 at the 11/17 07:37a PT pull (it read 164
// at 11/16 12:40p PT).
export const plannedGurunandaOrderCount = 203;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/17 07:37a PT
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
// Reserved doors: DOCK50, DOCK52, DOCK65 (DOCK50 and DOCK52 also read
// spaceStatus OCCUPIED; DOCK65 reads spaceStatus EMPTY). Fully free doors:
// DOCK63, DOCK67, DOCK72 - so 20 of 23 doors are not fully free.
// Raw tallies at this pull: dockStatus OCCUPIED 13 / AVAILABLE 7 / RESERVED 3;
// spaceStatus OCCUPIED 11 / EMPTY 12.
//
// BAY 4 ALL-CUSTOMER PHYSICAL TALLY (see SCOPE NOTE in the file header):
// active (NEW / IN_PROGRESS / EXCEPTION) tasks whose dockName is one of these
// 23 doors = 11 (RECEIVE 6, LOAD 5) on 9 doors. At this pull that equals the
// GURUNANDA-only tally exactly - all 11 tasks are ORG-655875.
// =====================================================================
export const bay4AllCustomerActiveTaskCount = 11;
export const bay4AllCustomerActiveReceiveCount = 6;
export const bay4AllCustomerActiveLoadCount = 5;

export const doors: DoorRecord[] = [
  {
    door: "DOCK50",
    status: "Reserved",
    assignee: "Gonzalo Rangel (RECEIVE NEW) + daira gonzalez (RECEIVE - STALE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5418313", "TASK-5090739"],
    duration: "RECEIVE NEW, not started (created 11/11 11:24:50a PT, TASK-5418313, Gonzalo Rangel, entry ET-1181371, receipt RN-195495 at status IMPORTED, PO RMA0276 / reference 'Po # 979126', appointment 11/11 12:00a PT, in-yard 11/11 11:24:50a PT, carrier ORG-825, container not recorded) - no startTime, so no duration basis · the door's second task, TASK-5090739 (daira gonzalez), is STALE: started 2025-10-21 1:21:14p PDT and its endTime is 2025-10-22 10:42:01a PDT (RN-5002143 status CLOSED, container EGSU8032696, reference EGLV149507056809) · dock RESERVED, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1182531 (row updated 11/16 11:04:57a PT) · the last load task to close here was TASK-5421917 (BYRON PALADINES, ORG-55783 - not GURUNANDA, 11/16 10:32:09a PT, 1 load SHIPPED, seal 25076956); the last receive task to close was TASK-5416210 (DANIELA GONZALEZ, KARAKA, LLC ORG-585450, 11/9 4:55:40p PT, FORCE_CLOSED)",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "EDUARDO MEJIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5422751"],
    duration: "LOAD 9h06m since 11/16 10:31:35p PT (TASK-5422751, EDUARDO MEJIA, IN_PROGRESS, PRE_LOAD, task created 11/16 9:45:35p PT, checked in 10:31:38p PT, updated 11:08:42p PT, seal 1304011 recorded, 3 loads LOAD-5044610 / LOAD-5044616 / LOAD-5044617 ALL at status LOADED, carrier ORG-659165 LTL, entry ET-1182803) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1182803 (row updated 11/16 10:31:38p PT) · the last load task to close here was TASK-5420549 (ARNULFO MUNGUIA, 11/13 1:56:58p PT, 1 load SHIPPED, seal 25010987); the last receive task to close here was TASK-5420402 (Fatima ponce, 11/13 10:42:38a PT, GURUNANDA, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Reserved",
    assignee: "EDUARDO MEJIA (LOAD IN_PROGRESS) + A1SG (LOAD NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5422898", "TASK-5422342"],
    duration: "TWO open LOAD tasks here, both GURUNANDA, both EDUARDO MEJIA's side of the bay · LOAD 17h24m since 11/16 2:13:32p PT (TASK-5422342, IN_PROGRESS, PRE_LOAD, created 11/16 2:02:29p PT, checked in 4:26:33p PT - i.e. the task started 2h13m BEFORE its gate check-in - updated 11/16 10:20:19p PT, seal 1304019, 4 loads LOAD-5044618 / LOAD-5044614 / LOAD-5044612 / LOAD-5044526 ALL at status LOADED, entry ET-1182676) · LOAD NEW, not started (TASK-5422898, created AND assigned 11/17 7:35:40a PT - the newest Bay-4 task at this pull - assigneeUserName 'A1SG' reproduced verbatim from WISE, assigneeUserId 1910160202361942018, LIVE_LOAD, 1 load LOAD-5044488 still at status WINDOW_CHECKIN_DONE with load appointment 11/12 11:00a PT, carrier ORG-471466 FTL, shipTo 'Target Oconomowoc DC # 0557', no sealNo yet, entry ET-1182866) · dock RESERVED, space OCCUPIED, occupiedCustomerIds none, entry ET-1182866 (row updated 11/17 7:35:43a PT - the newest door-row update at this pull, 3 seconds after TASK-5422898 was created) · the last load task to close here was TASK-5420648 (ARNULFO MUNGUIA, 11/16 9:18:06a PT, 8 loads all SHIPPED, seal A52688); the last receive task to close here was TASK-5417998 (Nanci Viviana Rosas, KARAKA, LLC, 11/11 2:39:35p PT)",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5422317"],
    duration: "LOAD 17h50m since 11/16 1:47:31p PT (TASK-5422317, ARNULFO MUNGUIA, IN_PROGRESS, PRE_LOAD, created 11/16 1:46:45p PT, checked in 1:47:36p PT, updated 4:25:12p PT, seal 1304046, 2 loads LOAD-5044525 (pro 50168600) / LOAD-5044619 BOTH at status LOADED, carrier ORG-659165 LTL, entry ET-1182659) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [], entry ET-1182659 (row updated 11/16 1:47:36p PT) · no load task of any customer has closed at this door since the one that is still open; the newest receive closure here is TASK-5407284 (ARNULFO MUNGUIA, KARAKA, LLC, 10/29 11:01:54a PDT)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5422749"],
    duration: "LOAD 9h50m since 11/16 9:46:53p PT (TASK-5422749, ARNULFO MUNGUIA, IN_PROGRESS, PRE_LOAD, created 11/16 9:41:55p PT, checked in 9:46:55p PT, updated 11:02:57p PT, seal 25010983, 2 loads LOAD-5044611 (shipTo 'Gurunanda BP') / LOAD-5044615 BOTH at status LOADED, carrier ORG-659165 LTL, entry ET-1182801) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [], entry ET-1182801 (row updated 11/16 11:02:59p PT) · the door is now GURUNANDA-only again: the 2 KARAKA, LLC receive tasks that occupied it at the previous snapshot both closed 11/16 afternoon PT - TASK-5421959 (CANDY MENDEZ, CLOSED 3:28:53p PT) and TASK-5419478 (ARNULFO MUNGUIA, CLOSED 3:04:11p PT) · the last load task to close here was TASK-5422351 (DANIEL BELTRAN, 11/16 3:08:02p PT, 1 load SHIPPED, seal 1304047)",
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
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [], entry ET-1182391 (row updated 11/16 12:08:43p PT; DOCK55 carries the same entry ET-1182391) · the last load task to close here was TASK-5421056 (ARNULFO MUNGUIA, 11/16 11:02:48a PT, 2 loads both SHIPPED, seal 25010981 - also the newest Bay-4 entry in Arnulfo's Assigned Activity stream); the last receive task to close here was TASK-5418081 (Nanci Viviana Rosas, KARAKA, LLC, 11/11 12:11:56p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [], entry ET-1182416 (row updated 11/16 1:31:41p PT) · the load task that was open here at the previous snapshot, TASK-5421821 (DANIEL BELTRAN, LIVE_LOAD), CLOSED 11/16 1:31:01p PT with its 1 load SHIPPED and seal 1304044 recorded - 40 seconds before this door row's own update · the newest receive closure here is TASK-5414098 (Nanci Viviana Rosas, KARAKA, LLC, 11/9 2:14:50p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: "Luis Alberto Paredes (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5420461"],
    duration: "RECEIVE NEW, not started (created 11/13 10:13:50a PT, TASK-5420461, Luis Alberto Paredes, entry ET-1182030, receipt RN-5011507 at status IMPORTED, PO PO9419, appointment 11/13 10:00a PT, in-yard 11/13 10:13:27a PT, container Leafchem11132026, carrier ORG-825) - no startTime, so no duration basis · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1182700 (row updated 11/17 6:20:19a PT; DOCK59 carries the same entry ET-1182700) · the last load task to close here was TASK-5420377 (BARTOLO RAMIREZ, 11/13 12:10:57p PT, 1 load SHIPPED, seal 1304053); the last receive task to close here was TASK-5414761 (DANIELA GONZALEZ, 11/6 5:09:25p PT, GURUNANDA)",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [], entry ET-1182700 (row updated 11/16 3:17:37p PT; DOCK58 carries the same entry ET-1182700) · the newest Bay-4 load closure at this pull happened here: TASK-5422412 (DANIEL BELTRAN, 11/16 3:17:16p PT, 1 load SHIPPED, seal A52687) - 21 seconds after the door row's own update · the receive task that held it, TASK-5417811 (CANDY MENDEZ, GURUNANDA), was FORCE_CLOSED 11/11 12:09:52p PT · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1179653 (row updated 11/17 6:10:35a PT) · the last load task to close here was TASK-5413376 (JULIO CESAR ALVARADO, 11/5 2:50:10p PT, 5 loads all SHIPPED, seal 1378416); the newest receive closure here is TASK-5402543 (DANIELA GONZALEZ, 10/23 7:21:53p PT, GURUNANDA) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: "JESUS ESPINOZA (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5422524"],
    duration: "RECEIVE 15h27m since 11/16 4:10:04p PT (TASK-5422524, JESUS ESPINOZA, IN_PROGRESS, created 11/16 3:55:28p PT, updated 11/16 4:21:59p PT, no dockCheckOutTime yet, entry ET-1182732, 1 receipt RN-5011599 at status IN_PROGRESS, PO/container ZCSU7568630, reference S00811293, appointment 11/16 10:30a PT, in-yard 11/16 3:55:28p PT, carrier ORG-825) · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1182732 (row updated 11/16 4:21:59p PT) · the receive task that held it before, TASK-5421037 (GURUNANDA), CLOSED 11/16 10:27:57a PT under CANDY MENDEZ · the last load task to close here was TASK-5420400 (BARTOLO RAMIREZ, 11/13 10:56:09a PT, 1 load SHIPPED, seal 1304052)",
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
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1182804 (row updated 11/16 11:38:22p PT) · this door took BOTH of the Bay-4 receive closures that landed after the previous snapshot: TASK-5422517 (JESUS ESPINOZA, CLOSED 11/16 8:31:52p PT) and TASK-5422753 (JESUS ESPINOZA, CLOSED 11/16 11:38:25p PT - 3 seconds after this door row's own update, and the newest Bay-4 receive closure at this pull); the earlier one, TASK-5419965 (Fatima ponce), was FORCE_CLOSED 11/16 10:47:28a PT · no load task of any customer has closed at this door inside the 2026-10-31 - now window · fully free",
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
    duration: "RECEIVE NEW, not started (created 9/30 10:46:50a PDT, TASK-5381972, Jorge Antonio Franco, entry ET-1162686, receipt RN-5010583 at status IMPORTED, PO9139-2, container Jpack09242026, no appointment on the receipt, in-yard 9/30 10:46:48a PDT, carrier ORG-825; task note reads 'DOCK   69 ET-1162686') - no startTime, so no duration basis · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1171953 (row updated 11/12 8:59:19p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - now window; the newest receive closure here is TASK-5398554 (DANIELA GONZALEZ, 10/20 6:56:09p PDT, GURUNANDA)",
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
    duration: "RECEIVE 15h36m since 11/16 4:01:40p PT (TASK-5422515, Fatima ponce, IN_PROGRESS, created 11/16 3:51:17p PT, updated 11/17 7:17:33a PT - the most recent task update on any active Bay-4 task - no dockCheckOutTime yet, entry ET-1182729, 1 receipt RN-5011579 at status IN_PROGRESS, PO/container MATU2536317, reference B00420742, appointment 11/13 1:45p PT, in-yard 11/16 3:51:17p PT, carrier ORG-825) · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1182729 (row updated 11/16 4:36:13p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - now window; the newest receive closure here is TASK-5406898 (DANIELA GONZALEZ, 10/28 8:41:53p PDT, GURUNANDA)",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1176051 (row updated 11/11 6:13:28p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - now window; the newest receive closure here is TASK-5405554 (DANIELA GONZALEZ, 10/27 6:45:00p PDT, GURUNANDA) · fully free",
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

// Doors that carried dockStatus RESERVED at this pull: 3 (DOCK50, DOCK52,
// DOCK65). They are held/reserved rather than free, and DOCK50 + DOCK52 also
// read spaceStatus OCCUPIED, so "not fully free" doors total 20 of 23.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee - GURUNANDA scope (the dashboard cards).
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, Nov 17
// 2026 07:37a PT).
// 11 active-status tasks at Bay-4 doors: 5 LOAD + 6 RECEIVE, at 9 distinct doors
// (DOCK50, DOCK51, DOCK52, DOCK53, DOCK54, DOCK58, DOCK61, DOCK69, DOCK71).
// EDUARDO MEJIA (2029638366082560001): 2 LOAD (DOCK51 TASK-5422751 IN_PROGRESS,
//   DOCK52 TASK-5422342 IN_PROGRESS)
// ARNULFO MUNGUIA (89): 2 LOAD (DOCK53 TASK-5422317 IN_PROGRESS, DOCK54
//   TASK-5422749 IN_PROGRESS)
// A1SG (1910160202361942018): 1 LOAD (DOCK52 TASK-5422898, NEW, LIVE_LOAD)
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
// the all-customer tally also reads 11 (see bay4AllCustomerActiveTaskCount).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "EDUARDO MEJIA", taskCount: 2 },
  { name: "ARNULFO MUNGUIA", taskCount: 2 },
  { name: "A1SG", taskCount: 1 },
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

// Mix: 6 RECEIVE + 5 LOAD = 11 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 6, total: 11 },
  { label: "Outbound (LOAD)", count: 5, total: 11 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 5, total: 11 },
  { label: "Inbound", count: 6, total: 11 },
];

// --- Schedule Data (2026-11-17, Tuesday) ---
// Both percentages use the SAME UTC-derived 11/17 PT business-day window,
// 2026-11-17 08:00:00 -> 2026-11-18 07:59:59 (see TIMESTAMP SEMANTICS in the
// file header; this window is the only one used anywhere in this file):
//   % scheduled inbounds received TODAY: exactly 1 GURUNANDA receipt carries an
//   appointmentTime inside that window (totalCount 1, read: RN-5011522 at status
//   IMPORTED, appointment 11/17 10:00a PT, PO 9416, container TQL11172026,
//   carrier ORG-825, in-yard null) and ZERO of them carry a receivedStartTime
//   = 0 / 1 = 0.0%. Genuinely zero, not "not computable": the denominator is 1.
//   % scheduled outbounds loaded TODAY: 15 GURUNANDA orders carry a scheduleDate
//   inside that window (scheduleDatePeriod ["2026-11-17 08:00:00",
//   "2026-11-18 07:59:59"], totalCount 15, all 15 read) of which 0 are at status
//   SHIPPED (the other 15 are PICKED 11, PLANNED 3, PICKING 1) = 0 / 15 = 0.0%.
//   Genuinely zero at a 07:37a PT pull: nothing on today's outbound schedule has
//   shipped yet (the facility-wide 11/17 PT-day order set has only 12 SHIPPED
//   out of 1,109, and no load task anywhere in the facility has closed today).
//   Both numerators are real counts of a non-empty denominator, so neither card
//   is a "no schedule" state (compare the 11/14-11/15 weekend snapshots, which
//   published both percentages as NOT COMPUTABLE because GURUNANDA had zero
//   scheduled receipts and zero scheduled orders on those days).
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
// scheduled, of which 1 carries a receivedStartTime; 1,109 orders scheduled by
// totalCount, of which 12 are SHIPPED.
export const facilityWideReceiptsCreated = 35;
export const facilityWideReceiptsReceived = 1;
export const facilityWideLoadsCreated = 1109;
export const facilityWideLoadsShipped = 12;

// Door occupancy duration: available from task startTime where a task exists on
// the door, has actually started and has not already ended; unavailable for
// task-less doors and for NEW tasks with no startTime (WMS has no
// occupancy-start field, and the dock-door-status dashboard endpoint returns an
// empty Duration column). 14 of 23 doors carry no active task at this pull, 4 of
// the 11 active tasks are NEW/not started (DOCK50 TASK-5418313, DOCK58
// TASK-5420461, DOCK69 TASK-5381972, DOCK52 TASK-5422898) and 1 is stale
// (DOCK50 TASK-5090739), so a duration exists for 6 tasks on 6 doors (DOCK51
// 9h06m, DOCK52 17h24m, DOCK53 17h50m, DOCK54 9h50m, DOCK61 15h27m and DOCK71
// 15h36m, all measured to 11/17 07:37:45a PT).
export const doorDurationsAvailable = true;

// All Bay 4 active GURUNANDA task records (DOCK50-DOCK72, Nov 17 2026 07:37a PT)
// 11 tasks total: 5 LOAD + 6 RECEIVE. One is a data anomaly (TASK-5090739 on
// DOCK50, stale since 2025-10-21). All 11 tasks on these doors are GURUNANDA at
// this pull, so this array is the complete physical picture as well as the
// customer-scoped one.
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA has 83 CLOSED GURUNANDA load transactions with endTime inside
// the 2026-10-31 00:00:00 UTC - now window (82 under assigneeUserId 89 plus 1
// under a second Arnulfo identity, assigneeUserId 1948070158297014318, name
// rendered "arnulfo munguia"; 73 of them at Bay-4 doors - DOCK51 12, DOCK53 11,
// DOCK54 11, DOCK52 11, DOCK55 8, DOCK56 7, DOCK50 7, DOCK57 3, DOCK60 2,
// DOCK59 1; the other 10 are on DOCK4 2, DOCK5 2, DOCK7 2, DOCK6 1, DOCK9 1,
// DOCK10 1 and DOCK45 1); per-day counts by endTime (PT): 11/16 7, 11/13 8,
// 11/12 12, 11/11 4, 11/10 10, 11/9 6, 11/6 8, 11/5 4, 11/4 11, 11/3 6 and
// 11/2 7, with no closures on 11/17, 11/15, 11/14, 11/8, 11/7 or 11/1.
// The newest overall is DOCK10 TASK-5421016 (started 11/13 6:49:05p PT, closed
// 11/16 11:40:39a PT); the newest at a Bay-4 door is DOCK56 TASK-5421056
// (started 11/14 9:53:54p PT, closed 11/16 11:02:48a PT; 2 loads both SHIPPED;
// seal 25010981). Zero new transactions have landed in the 11/17 PT day so far.
// He currently holds 2 open GURUNANDA LOAD tasks, both PRE_LOAD: DOCK53
// TASK-5422317 (started 11/16 1:47:31p PT, 2 loads both LOADED, seal 1304046)
// and DOCK54 TASK-5422749 (started 11/16 9:46:53p PT, 2 loads both LOADED,
// seal 25010983).
export const assignments: TaskRecord[] = [
  // ----- INBOUND / RECEIVE (6) -----
  {
    taskId: "TASK-5422524",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 15h27m since 11/16 4:10:04p PT (JESUS ESPINOZA, task created 11/16 3:55:28p PT, updated 11/16 4:21:59p PT, no dockCheckOutTime; entry ET-1182732, RN-5011599 at status IN_PROGRESS, PO/container ZCSU7568630, reference S00811293, appointment 11/16 10:30a PT, in-yard 11/16 3:55:28p PT, carrier ORG-825)",
    assignee: "JESUS ESPINOZA",
    door: "DOCK61",
  },
  {
    taskId: "TASK-5422515",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 15h36m since 11/16 4:01:40p PT (Fatima ponce, task created 11/16 3:51:17p PT, updated 11/17 7:17:33a PT - the most recent update on any active Bay-4 task - no dockCheckOutTime; entry ET-1182729, RN-5011579 at status IN_PROGRESS, PO/container MATU2536317, reference B00420742, appointment 11/13 1:45p PT, in-yard 11/16 3:51:17p PT, carrier ORG-825)",
    assignee: "Fatima ponce",
    door: "DOCK71",
  },
  {
    taskId: "TASK-5420461",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/13 10:13:50a PT (Luis Alberto Paredes; entry ET-1182030, RN-5011507 at status IMPORTED, PO PO9419, appointment 11/13 10:00a PT, in-yard 11/13 10:13:27a PT, container Leafchem11132026, carrier ORG-825) - task has no startTime",
    assignee: "Luis Alberto Paredes",
    door: "DOCK58",
  },
  {
    taskId: "TASK-5418313",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/11 11:24:50a PT (Gonzalo Rangel; entry ET-1181371, RN-195495 at status IMPORTED, PO RMA0276 / reference 'Po # 979126', appointment 11/11 12:00a PT, in-yard 11/11 11:24:50a PT, container not recorded, carrier ORG-825) - task has no startTime",
    assignee: "Gonzalo Rangel",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/30 10:46:50a PDT (Jorge Antonio Franco; entry ET-1162686, RN-5010583 at status IMPORTED, PO9139-2, container Jpack09242026, no appointment on the receipt, in-yard 9/30 10:46:48a PDT, carrier ORG-825; task note 'DOCK   69 ET-1162686') - task has no startTime",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 2025-10-21 1:21:14p PDT; status still IN_PROGRESS although endTime is 2025-10-22 10:42:01a PDT; daira gonzalez, entry ET-1027622, RN-5002143 which is itself already CLOSED, container EGSU8032696, reference EGLV149507056809, carrier ORG-34911)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },

  // ----- OUTBOUND / LOAD (5) -----
  {
    taskId: "TASK-5422317",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 17h50m since 11/16 1:47:31p PT (ARNULFO MUNGUIA, task created 11/16 1:46:45p PT, checked in 1:47:36p PT, updated 4:25:12p PT; PRE_LOAD, seal 1304046, 2 loads LOAD-5044525 (pro 50168600) and LOAD-5044619 BOTH at status LOADED, carrier ORG-659165 LTL, entry ET-1182659)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5422342",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 17h24m since 11/16 2:13:32p PT (EDUARDO MEJIA, task created 11/16 2:02:29p PT, checked in 4:26:33p PT - after the task start - updated 11/16 10:20:19p PT; PRE_LOAD, seal 1304019, 4 loads LOAD-5044618, LOAD-5044614, LOAD-5044612 and LOAD-5044526 ALL at status LOADED, carrier ORG-659165 LTL, entry ET-1182676)",
    assignee: "EDUARDO MEJIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5422749",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 9h50m since 11/16 9:46:53p PT (ARNULFO MUNGUIA, task created 11/16 9:41:55p PT, checked in 9:46:55p PT, updated 11/16 11:02:57p PT; PRE_LOAD, seal 25010983, 2 loads LOAD-5044611 (shipTo 'Gurunanda BP') and LOAD-5044615 BOTH at status LOADED, carrier ORG-659165 LTL, entry ET-1182801)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5422751",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 9h06m since 11/16 10:31:35p PT (EDUARDO MEJIA, task created 11/16 9:45:35p PT, checked in 10:31:38p PT, updated 11/16 11:08:42p PT; PRE_LOAD, seal 1304011, 3 loads LOAD-5044610, LOAD-5044616 and LOAD-5044617 ALL at status LOADED, carrier ORG-659165 LTL, entry ET-1182803)",
    assignee: "EDUARDO MEJIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5422898",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created and assigned 11/17 7:35:40a PT - the newest Bay-4 task at this pull (assigneeUserName 'A1SG' reproduced verbatim from WISE, assigneeUserId 1910160202361942018; LIVE_LOAD, 1 load LOAD-5044488 still at status WINDOW_CHECKIN_DONE, loadNo '79404928 // SP BOL', load appointment 11/12 11:00a PT, carrier ORG-471466 FTL, shipTo 'Target Oconomowoc DC # 0557', no sealNo yet, no startTime, entry ET-1182866)",
    assignee: "A1SG",
    door: "DOCK52",
  },
];
