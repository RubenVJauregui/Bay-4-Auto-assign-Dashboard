/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-19 09:44a PT (live WISE / WMS-BAM APIs)
 *   Every value below was re-read live at ONE reference
 *   (2026-11-19T17:44:04Z = 09:44:04a PT; the 23 door rows were read at
 *   17:43:31Z, 33 seconds earlier). No value in this file is carried over from
 *   an earlier snapshot except the all-time assignee baseline, which is
 *   explicitly labelled as carried forward.
 *
 *   TIMESTAMP SEMANTICS - single authority for this file, verified again at this
 *   pull: WISE/WMS-BAM returns task, receipt, order and appointment timestamps as
 *   UTC strings with NO offset. They are NOT facility wall-clock. Render PT with a
 *   real zone conversion: PST = UTC-8 (on/after 2026-11-01), PDT = UTC-7 (before
 *   2026-11-01). Evidence read at this pull: ARNULFO MUNGUIA's DOCK52 load task
 *   TASK-5424857 startTime 2026-11-19T02:15:29 = 11/18 6:15:29p PT; the DOCK57
 *   receive task TASK-5424364 startTime 2026-11-19T16:46:03 = 11/19 8:46:03a PT;
 *   GURUNANDA receipt RN-5011671 appointmentTime 2026-11-19T18:00:00 = 11/19
 *   10:00a PT; and the closed DOCK53 receive task TASK-5407284 endTime
 *   2026-10-29T18:01:54 = 10/29 11:01:54a PDT, which a flat UTC-8 read would
 *   wrongly render as 10:01:54a.
 *   Consequently "the 11/19 PT business day" used for the two schedule
 *   percentages is the UTC window 2026-11-19 08:00:00 -> 2026-11-20 07:59:59,
 *   and that is the ONLY window used in this file.
 *   QUERY MODE WARNING - the pull behind these numbers was made WITHOUT the
 *   item-time-zone header, i.e. the raw-UTC mode documented above. The app's own
 *   loader (src/lib/wms-loader.ts) DOES send item-time-zone America/Los_Angeles.
 *   Both modes were run side by side at this pull for the receipt denominator and
 *   agree exactly: the raw-UTC PT-day window above returned 6 GURUNANDA receipts
 *   and the PT-header calendar window 2026-11-19 00:00:00 -> 23:59:59 returned
 *   the same 6 receipts (RN-5011691, RN-5011687, RN-5011686, RN-195848,
 *   RN-5011671, RN-5011655). Do NOT swap in the naive raw-UTC calendar day: that
 *   window (2026-11-19 00:00:00 -> 23:59:59 with no timezone header) returns 7
 *   receipts, and the 7th (RN-5011695, appointment 2026-11-19T00:30:00Z =
 *   11/18 4:30p PT) belongs to the previous business day.
 *   Pick one mode and its matching window. For the outbound schedule both windows
 *   were re-tested at this pull and return the identical 43 orders -
 *   scheduleDate is date-only and stored at 08:00:00 UTC - so the window choice
 *   only changes results for receipt appointmentTime.
 *   Durations are measured to the 2026-11-19 09:44:04a PT pull reference.
 *
 *   SOURCES USED AT THIS PULL:
 *     - POST /wms-bam/wms-location/search, body {exactlyNames:[DOCK50..DOCK72]}
 *       -> code 0, 23/23 rows (name, id, category=DOCK, type=DOCK,
 *       status=USABLE on all 23, dockStatus, spaceStatus, occupiedCustomerIds,
 *       entryId, updatedTime). Door rows are used for "Door Utilization".
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer
 *       filter) -> totalCount 85, all 85 read; exactly 6 of them sit on a Bay-4
 *       dockName (4 IN_PROGRESS + 2 NEW, all GURUNANDA). No facility load task in
 *       the active set carries a null dockName.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer
 *       filter) -> totalCount 95, all 95 read; 8 of them sit on a Bay-4 dockName
 *       (6 GURUNANDA + 2 KARAKA, LLC / ORG-585450).
 *     - POST /wms-bam/inbound/receipt/search-by-paging
 *       {customerId: ORG-655875, appointmentTimeFrom "2026-11-19 08:00:00",
 *       appointmentTimeTo "2026-11-20 07:59:59"} -> totalCount 6, all read:
 *       RN-5011691 (IMPORTED, PO CSGU9025103, ref B00420878, container
 *       CSGU9025103, appt 11/19 11:00:00a PT, in-yard not recorded, receivedStartTime none, carrier ORG-825)
 *       RN-5011687 (IMPORTED, PO FBIU5016100, ref B00420884, container
 *       FBIU5016100, appt 11/19 1:00:00p PT, in-yard not recorded, receivedStartTime none, carrier ORG-825)
 *       RN-5011686 (IMPORTED, PO OERU4055269, ref B00420882, container
 *       OERU4055269, appt 11/19 11:00:00a PT, in-yard not recorded, receivedStartTime none, carrier ORG-825)
 *       RN-195848 (IMPORTED, PO FUS11162026UNIS-106, ref 1183007-1, container not recorded,
 *       appt 11/19 1:00:00p PT, in-yard not recorded, receivedStartTime none, carrier ORG-825)
 *       RN-5011671 (IMPORTED, PO PO9466, ref none, container Leafchem11192026,
 *       appt 11/19 10:00:00a PT, in-yard not recorded, receivedStartTime none, carrier ORG-825)
 *       RN-5011655 (IMPORTED, PO PO9477, ref none, container Leafchem11192026,
 *       appt 11/19 10:00:00a PT, in-yard not recorded, receivedStartTime none, carrier ORG-825)
 *       6 scheduled receipts and 0 started receipts = 0 of 6 received.
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, scheduleDatePeriod ["2026-11-19 08:00:00",
 *       "2026-11-20 07:59:59"]} -> totalCount 43, all 43 read; statuses PICKED 38,
 *       PLANNED 2, LOADED 1, PICKING 1, CANCELLED 1, SHIPPED 0
 *       -> 0 of 43 loaded on the SHIPPED proxy (1 of 43 = 2.3% if LOADED counts).
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], endTimeFrom "2026-10-31 00:00:00"
 *       -> totalCount 850 (all customers), all 850 read. Per-door "last load task
 *       to close here" is read from this set. The ARNULFO MUNGUIA /
 *       GURUNANDA subset is measured by a dedicated filter on the same set
 *       (customerId ORG-655875 + assigneeUserIds [89,
 *       1948070158297014318]) -> 102 transactions, 85 of them at Bay-4 doors
 *       (his "Assigned Activity" stream; see below).
 *       The newest load closure ANYWHERE in the facility is 11/19 9:40:37a PT
 *       (TASK-5425138, DOCK11, JOSE ROSAS, ORG-34818, seal 1304722, 1 load
 *       SHIPPED). 5 load tasks closed inside the 11/19 PT day facility-wide, of
 *       which exactly 1 is at a Bay-4 door: DOCK54 TASK-5424515 (9:01:10a PT).
 *       NOTE: orderBy/sort are not supported on this endpoint (they null out
 *       totalCount); the endpoint returns newest endTime first. dockNames/dockIds
 *       filters are a NO-OP (they return the facility total) so door scoping is
 *       done client-side.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], newest first -> totalCount 17,913; the
 *       newest 4,000 were read (oldest endTime in the read set is
 *       2026-07-30 21:05:17Z), which contains 423 Bay-4 receive closures and
 *       therefore every per-door "last receive task to close here" value below.
 *       The endTimeFrom filter is NOT applied to receive tasks at this pull
 *       (the same total is returned with and without it) - the read window above
 *       is what was actually inspected, so no receive closure older than
 *       2026-07-30 is claimed.
 *       The newest receive closure facility-wide is 11/19 9:41:58a PT
 *       (TASK-5425143, DOCK17). The newest at a Bay-4 door is DOCK66 TASK-5424855
 *       (11/18 8:59:49p PT, DANIELA GONZALEZ).
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, status: PLANNED} -> totalCount 189.
 *     - Task-name keyword RE-TESTED at this pull: the load-task `keyword` filter
 *       is still a NO-OP. "Guru live out / in assign to Arnulfo", "Guru live out"
 *       and a nonsense string ("zzzz-no-such-task-zzzz") all return the same
 *       facility total, 22,813. The order-plan endpoint is also a no-op but at
 *       this pull it returned 0 rows for the phrase (an earlier pull returned the
 *       full plan count), so no plan or task group named "Guru live out / in
 *       assign to Arnulfo" can be resolved through keyword search either. All 14
 *       active Bay-4 tasks carry projectId null, so there is no named task group
 *       to resolve. The "Guru live out / in assign to Arnulfo" stream is therefore
 *       reported as ARNULFO MUNGUIA's task-assignment transactions on the
 *       GURUNANDA live-out/live-in work, and nothing is invented.
 *
 *   SCOPE NOTE (read before comparing to an earlier snapshot):
 *     The line-level metrics on this dashboard are GURUNANDA-scoped (the same
 *     customer scope the dashboard has always published). At THIS pull that
 *     distinction is NOT inert for the first time: two of the 14 active Bay-4
 *     tasks are KARAKA, LLC (ORG-585450) receive tasks on DOCK54
 *     (TASK-5425254 NEW and TASK-5425183 IN_PROGRESS, both assigned to ARNULFO
 *     MUNGUIA). So the GURUNANDA cards read 12 active tasks (6 RECEIVE / 6 LOAD)
 *     while the physical Bay-4 tally reads 14 (8 RECEIVE / 6 LOAD).
 *     bay4AllCustomerActiveTaskCount / ...ReceiveCount / ...LoadCount export the
 *     physical numbers so the divergence stays explicit. Door status itself is
 *     physical (a door is occupied no matter which customer is on it).
 *
 *   Key state at this pull:
 *     - DOOR STATUS: occupied 18, reserved 1, available 4 (18+1+4 = 23). Only
 *       DOCK59, DOCK61, DOCK62 and DOCK72 are fully free (dock AVAILABLE + space
 *       EMPTY). Raw dockStatus: OCCUPIED 16, AVAILABLE 6, RESERVED 1. Raw
 *       spaceStatus: OCCUPIED 8, EMPTY 15. The single RESERVED door is DOCK57
 *       (spaceStatus EMPTY) - it carries the NEW-then-started GURUNANDA receive
 *       task TASK-5424364 (Fatima Ponce) whose receipt RN-5011522 began receiving
 *       at 8:46:03a PT. Two doors read dock AVAILABLE but space OCCUPIED and are
 *       therefore counted as Occupied: DOCK56 (entry ET-1182993, row updated
 *       11/17 10:52:35a PT) and DOCK58 (entry ET-1183240, row updated 11/19
 *       7:37:43a PT). A reservation is a held door, so it is reported in its own
 *       "Reserved" bucket rather than folded into "Occupied"; 19 of the 23 doors
 *       are therefore not fully free at this pull.
 *       Compare 11/17 09:59a PT: occupied 17, reserved 3, available 3.
 *     - ACTIVE TASKS: 14 tasks across all customers - 8 RECEIVE / 6 LOAD -
 *       at 10 distinct doors (DOCK50, DOCK51, DOCK52,
 *       DOCK53, DOCK54, DOCK55, DOCK57, DOCK59, DOCK62, DOCK69). GURUNANDA-scoped:
 *       12 tasks (6 RECEIVE / 6 LOAD) at 9 doors (all of the above except
 *       DOCK54, which currently hosts only the two KARAKA receive tasks).
 *       Compare 11/17 09:59a PT: 13 tasks (6 RECEIVE / 7 LOAD) at 9 doors.
 *     - ASSIGNMENTS BY ASSIGNEE (GURUNANDA, the dashboard cards):
 *       ARNULFO MUNGUIA 6
 *       DANIELA GONZALEZ 1
 *       Fatima Ponce 1
 *       Gonzalo Rangel 1
 *       Jorge Antonio Franco 1
 *       JORGE ARMANDO DUENAS 1
 *       daira gonzalez 1 = 12.
 *       Names are reproduced exactly as WISE returns them in assigneeUserName
 *       ("Fatima Ponce" now renders capitalised while "daira gonzalez" stays
 *       lower-case; the earlier "A1SG" and "CANDY MENDEZ" assignees no longer hold
 *       an active Bay-4 task). All-customer adds the same ARNULFO MUNGUIA on two
 *       KARAKA receive tasks -> 14 tasks, ARNULFO MUNGUIA 8.
 *     - LOAD PROGRESS: 4 Bay-4 load tasks are IN_PROGRESS (all GURUNANDA, all
 *       PRE_LOAD, all with a seal already recorded) and 2 are NEW:
 *       DOCK51 TASK-5424518 (seal 25010953, 2 loads both LOADED),
 *       DOCK52 TASK-5424857 (seal 25010930, 1 load LOADED),
 *       DOCK53 TASK-5424769 (seal 25010932, 4 of 5 loads LOADED, LOAD-5044880
 *       still LOADING),
 *       DOCK55 TASK-5424856 (seal 25010939, 3 loads all LOADED);
 *       NEW and not started: DOCK52 TASK-5425263 (1 load still at
 *       WINDOW_CHECKIN_DONE) and DOCK50 TASK-5425197 (2 loads at
 *       WINDOW_CHECKIN_DONE). The newest Bay-4 task at this pull is
 *       TASK-5425263, created 11/19 9:42:23a PT (43 seconds after the door row for
 *       DOCK52 was written, 9:42:24a PT).
 *     - RECEIVE PROGRESS: 5 receive tasks are IN_PROGRESS - DOCK54 KARAKA
 *       TASK-5425183 (started 9:18:25a PT, receipts RN-194359 / RN-194358 both
 *       IN_PROGRESS with receivedStart 9:18:25a PT), DOCK57 GURUNANDA
 *       TASK-5424364 (Fatima Ponce, started 8:46:03a PT, RN-5011522 IN_PROGRESS),
 *       DOCK59 GURUNANDA TASK-5424859 (DANIELA GONZALEZ, started 11/18 7:22:12p PT,
 *       RN-5011593 IN_PROGRESS), DOCK62 GURUNANDA TASK-5424885 (JORGE ARMANDO
 *       DUENAS, started 11/18 8:53:28p PT, RN-5011650 IN_PROGRESS) and the stale
 *       DOCK50 task below. 3 receive tasks are NEW and not started: DOCK54 KARAKA
 *       TASK-5425254 (RN-195629 / RN-195627 both IMPORTED), DOCK50 GURUNANDA
 *       TASK-5418313 (Gonzalo Rangel, RN-195495 IMPORTED) and DOCK69 GURUNANDA
 *       TASK-5381972 (Jorge Antonio Franco, RN-5010583 IMPORTED).
 *     - ANOMALIES: 1, unchanged. TASK-5090739 (DOCK50, RECEIVE, started
 *       2025-10-21 12:21:14p PDT) is still returned by the active-status query
 *       although its endTime is 2025-10-22 9:42:01a PDT and its linked receipt
 *       RN-5002143 is CLOSED. Flagged, not given an open-ended duration.
 *     - Task "Guru live out / in assign to Arnulfo": 102 CLOSED GURUNANDA load
 *       transactions with endTime from 2026-10-31 00:00:00 UTC (101 under
 *       assigneeUserId 89 + 1 under a second Arnulfo identity, assigneeUserId
 *       1948070158297014318, name rendered "arnulfo munguia"), 85 at Bay-4 doors,
 *       17 off Bay 4 (DOCK4 4 / DOCK10 3 / DOCK5 2 / DOCK6 1 / DOCK7 2 / DOCK8 2 /
 *       DOCK9 2 / DOCK45 1). Bay-4 breakdown: DOCK54 14 / DOCK52 14 / DOCK53 13 /
 *       DOCK51 13 / DOCK50 8 / DOCK55 8 / DOCK56 8 / DOCK57 4 / DOCK60 2 /
 *       DOCK59 1.
 *       Per-day counts by endTime (PT), ALL scopes: 11/19 1, 11/18 8, 11/17 10,
 *       11/16 7, 11/13 8, 11/12 12, 11/11 4, 11/10 10, 11/9 6, 11/6 8, 11/5 4,
 *       11/4 11, 11/3 6, 11/2 7, with no closures at all on 11/1, 11/7, 11/8,
 *       11/14 or 11/15 (and none yet after 11/19 9:01:10a PT).
 *       Newest transaction: DOCK54 TASK-5424515, started 11/19 8:19:00a PT,
 *       closed 11/19 9:01:10a PT, 5 loads all SHIPPED, seal 1379074. It is also
 *       the newest at a Bay-4 door and the only Arnulfo closure in the 11/19 PT
 *       day so far. He is currently holding 6 open GURUNANDA LOAD tasks
 *       (DOCK50 TASK-5425197 NEW, DOCK52 TASK-5425263 NEW, DOCK52 TASK-5424857,
 *       DOCK53 TASK-5424769, DOCK55 TASK-5424856, DOCK51 TASK-5424518 - the last
 *       four IN_PROGRESS) plus the 2 KARAKA receive tasks on DOCK54.
 *     - % scheduled inbounds received (11/19 PT): 0 of 6 = 0.0%. Computable -
 *       the denominator is non-zero - and genuinely zero: none of the six
 *       GURUNANDA receipts appointed for today (10:00a, 10:00a, 11:00a, 11:00a,
 *       1:00p, 1:00p PT) has a receivedStartTime at 09:44a PT.
 *     - % scheduled outbounds loaded (11/19 PT): 0 of 43 = 0.0% on the SHIPPED
 *       proxy this dashboard has always used (see the note on the constant). One
 *       order (DN-3466978) is at status LOADED, so a loaded-inclusive read would
 *       be 1 of 43 = 2.3%; the remaining 42 are PICKED 38, PLANNED 2, PICKING 1,
 *       CANCELLED 1.
 *     - Inbound/outbound mix: 6 RECEIVE / 6 LOAD of 12 active GURUNANDA tasks
 *       (8 RECEIVE / 6 LOAD of 14 physical tasks across all customers).
 *     - Total doors occupied: 18 of 23 (plus 1 reserved, 4 available).
 *     - Planned GURUNANDA orders: live count 189 at this pull.
 *     - Door occupancy duration: available where an active task has a startTime
 *       and has not ended - 8 tasks on 8 doors at this pull (DOCK51 LOAD 21h30m,
 *       DOCK52 LOAD 15h29m, DOCK53 LOAD 18h04m, DOCK54 RECEIVE 0h26m, DOCK55 LOAD
 *       13h38m, DOCK57 RECEIVE 0h58m, DOCK59 RECEIVE 14h22m, DOCK62 RECEIVE
 *       12h51m), all measured to 11/19 09:44:04a PT. WMS has no occupancy-start
 *       field for task-less doors (13 of 23), for the 5 NEW Bay-4 tasks, or for
 *       the one stale task (DOCK50 TASK-5090739), so 6 of the 14 active tasks have
 *       no duration basis.
 *     - Facility-wide schedule context for the 11/19 PT day (no customerId
 *       filter, same UTC-derived PT-day window): receipts scheduled 44, of which
 *       8 carry a receivedStartTime; orders scheduled 992 by totalCount, of which
 *       301 are SHIPPED.
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

// --- Section 1 - In-Yard FULL Equipment (TRAILER-only display) ---
// Outside the scope of this refresh: that KPI renders live from the WMS loader
// (loadInYardFullEquipment in src/lib/wms-loader.ts), so the static array stays
// empty rather than duplicating or estimating the live result.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 189 at the 11/19 09:44a PT pull.
export const plannedGurunandaOrderCount = 189;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/19 09:44a PT
//
// All 23 rows come from one /wms-bam/wms-location/search call
// (exactlyNames DOCK50..DOCK72); every row is category DOCK, type DOCK,
// status USABLE. Door status rule (unchanged, keeps the dashboard's 3-value
// enum):
//   Reserved  = dockStatus RESERVED (door is held/reserved, so it is not free)
//   Occupied  = dockStatus OCCUPIED OR spaceStatus OCCUPIED (not fully free)
//   Available = dockStatus AVAILABLE AND spaceStatus EMPTY
// Raw field values are preserved per door so the mapping can be re-checked.
// Totals: Occupied 18, Reserved 1, Available 4 = 23.
// Reserved door: DOCK57 (space EMPTY).
// Two further doors are dock AVAILABLE but still carry space OCCUPIED
// (DOCK56, DOCK58), so they count as Occupied. Fully free doors: DOCK59,
// DOCK61, DOCK62, DOCK72 - so 19 of 23 doors are not fully free.
// Raw tallies at this pull: dockStatus OCCUPIED 16 / AVAILABLE 6 / RESERVED 1;
// spaceStatus OCCUPIED 8 / EMPTY 15.
//
// BAY 4 ALL-CUSTOMER PHYSICAL TALLY (see SCOPE NOTE in the file header):
// active (NEW / IN_PROGRESS / EXCEPTION) tasks whose dockName is one of these
// 23 doors = 14 (RECEIVE 8, LOAD 6) on 10 doors. Two of the 8 receive tasks are
// KARAKA, LLC (ORG-585450) on DOCK54, so the GURUNANDA-only tally is 12
// (RECEIVE 6, LOAD 6) on 9 doors.
// =====================================================================
export const bay4AllCustomerActiveTaskCount = 14;
export const bay4AllCustomerActiveReceiveCount = 8;
export const bay4AllCustomerActiveLoadCount = 6;

export const doors: DoorRecord[] = [
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD NEW) + Gonzalo Rangel (RECEIVE NEW) + daira gonzalez (RECEIVE IN_PROGRESS - STALE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5425197","TASK-5418313","TASK-5090739"],
    duration: "No duration basis on this door (no started task on it) · on this door: LOAD TASK-5425197 · ARNULFO MUNGUIA (assigneeUserId 89) · NEW · PRE_LOAD · task created 11/19 9:17:23a PT · no startTime · not checked in at dock · updated 11/19 9:17:23a PT · no sealNo yet · 2 loads LOAD-5044721 (50100569, DN-3467109) WINDOW_CHECKIN_DONE; LOAD-5044718 (50100568, DN-3467063) WINDOW_CHECKIN_DONE · carrier ORG-659165 · entry ET-1183909 · RECEIVE TASK-5418313 · Gonzalo Rangel (assigneeUserId 2000828853478170980) · NEW · DOCK · task created 11/11 11:24:50a PT · no startTime · not checked in at dock · updated 11/11 11:24:50a PT · no dockCheckOutTime · 1 receipt RN-195495 at status IMPORTED · PO RMA0276 · container not recorded · reference Po # 979126 · appointment 11/11 12:00:00a PT · receivedStart none · carrier ORG-825 · in-yard 11/11 11:24:50a PT · entry ET-1181371 · RECEIVE TASK-5090739 · daira gonzalez (assigneeUserId 1948070158297014492) · IN_PROGRESS · DOCK · task created 10/20 9:38:05p PT · started 10/21 12:21:14p PT · dock check-in 10/22 9:41:46a PT · updated 10/22 2:25:42p PT · updatedBy employee876322 · no dockCheckOutTime · 1 receipt RN-5002143 at status CLOSED · PO EGSU8032696 · container EGSU8032696 · reference EGLV149507056809 · appointment 10/20 9:00:00a PT · receivedStart none · carrier ORG-34911 · in-yard 10/20 9:38:05p PT · entry ET-1027622 · STALE: status still IN_PROGRESS although endTime is 10/22 9:42:01a PT - not given an open-ended duration · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1183909 (row updated 11/19 9:17:29a PT) · last load task to close here: TASK-5423064 (ARNULFO MUNGUIA, customer ORG-655875, 11/18 1:33:54p PT, CLOSED, 7 loads all SHIPPED, seal 25010951) · last receive task to close here: TASK-5416210 (DANIELA GONZALEZ, customer ORG-585450, 11/9 4:55:40p PT, FORCE_CLOSED)",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5424518"],
    duration: "LOAD 21h30m since 11/18 12:14:25p PT (TASK-5424518 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/18 12:05:04p PT · started 11/18 12:14:25p PT · checked in 11/18 12:14:30p PT · updated 11/18 6:05:14p PT · updatedBy amunguia · seal 25010953 · 2 loads LOAD-5044883 (50100824, DN-3469486) LOADED; LOAD-5044722 (50100563, DN-3467108) LOADED · carrier ORG-659165 · entry ET-1183575) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1183575 (row updated 11/18 2:28:35p PT) · last load task to close here: TASK-5422751 (ARNULFO MUNGUIA, customer ORG-655875, 11/17 2:34:31p PT, CLOSED, 3 loads all SHIPPED, seal 1304011) · last receive task to close here: TASK-5420402 (Fatima Ponce, customer ORG-655875, 11/13 10:42:38a PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD NEW) + ARNULFO MUNGUIA (LOAD IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5425263","TASK-5424857"],
    duration: "LOAD 15h29m since 11/18 6:15:29p PT (TASK-5424857 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/18 4:50:59p PT · started 11/18 6:15:29p PT · checked in 11/18 6:15:31p PT · updated 11/18 7:20:49p PT · updatedBy amunguia · seal 25010930 · 1 load LOAD-5044886 (50100830, DN-3469097) LOADED · carrier ORG-659165 · entry ET-1183748) · also on this door: LOAD TASK-5425263 · ARNULFO MUNGUIA (assigneeUserId 89) · NEW · PRE_LOAD · task created 11/19 9:42:23a PT · no startTime · not checked in at dock · updated 11/19 9:42:23a PT · no sealNo yet · 1 load LOAD-5044887 (50100832, DN-3469096) WINDOW_CHECKIN_DONE · carrier ORG-659165 · entry ET-1183931 · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1183931 (row updated 11/19 9:42:24a PT) · last load task to close here: TASK-5424116 (ARNULFO MUNGUIA, customer ORG-655875, 11/18 10:54:28a PT, CLOSED, 1 load SHIPPED, seal 1378820) · last receive task to close here: TASK-5417998 (Nanci Viviana Rosas, customer ORG-585450, 11/11 2:39:35p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5424769"],
    duration: "LOAD 18h04m since 11/18 3:39:49p PT (TASK-5424769 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/18 3:39:34p PT · started 11/18 3:39:49p PT · checked in 11/18 3:39:55p PT · updated 11/19 9:46:18a PT · seal 25010932 · 4 loads LOAD-5044884 (50100826, DN-3469342) LOADED; LOAD-5044995 (50101981, DN-3472511) LOADED; LOAD-5044885 (50100828, DN-3469312) LOADED; LOAD-5044671 (50100556, DN-3466640) LOADED · carrier ORG-659165 · entry ET-1183728) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1183728 (row updated 11/18 10:20:42p PT) · last load task to close here: TASK-5423278 (ARNULFO MUNGUIA, customer ORG-655875, 11/18 12:11:42p PT, CLOSED, 3 loads all SHIPPED, seal 25010998) · last receive task to close here: TASK-5407284 (ARNULFO MUNGUIA, customer ORG-585450, 10/29 10:01:54a PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (RECEIVE NEW) + ARNULFO MUNGUIA (RECEIVE IN_PROGRESS)",
    customer: "KARAKA, LLC",
    taskIds: ["TASK-5425254","TASK-5425183"],
    duration: "RECEIVE 0h26m since 11/19 9:18:25a PT (TASK-5425183 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/19 9:09:19a PT · started 11/19 9:18:25a PT · dock check-in 11/19 9:18:27a PT · updated 11/19 9:18:27a PT · updatedBy amunguia · no dockCheckOutTime · 2 receipts RN-194359 at status IN_PROGRESS · PO POKRK3028 · container HOUU9907931 · reference M26_SHA45 · appointment 11/19 9:00:00a PT · receivedStart 11/19 9:18:25a PT · carrier ORG-825 · in-yard 11/19 9:09:20a PT; RN-194358 at status IN_PROGRESS · PO POILO2103 · container HOUU9907931 · reference M26_SHA45 · appointment 11/19 9:00:00a PT · receivedStart 11/19 9:18:25a PT · carrier ORG-825 · in-yard 11/19 9:09:20a PT · entry ET-1183546) · also on this door: RECEIVE TASK-5425254 · ARNULFO MUNGUIA (assigneeUserId 89) · NEW · DOCK · task created 11/19 9:38:46a PT · no startTime · not checked in at dock · updated 11/19 9:41:41a PT · no dockCheckOutTime · 2 receipts RN-195629 at status IMPORTED · PO POBOK0433 · container UNKNOWN - LCL · reference 24721747 · appointment 11/19 9:00:00a PT · receivedStart none · carrier ORG-798955 · in-yard 11/19 9:38:43a PT; RN-195627 at status IMPORTED · PO POBOK0454 · container UNKNOWN - LCL · reference 24721725 · appointment 11/19 8:00:00a PT · receivedStart none · carrier ORG-798955 · in-yard 11/19 9:38:43a PT · task note 'dock 54' · entry ET-1183928 · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1183546 (row updated 11/19 9:41:42a PT) · last load task to close here: TASK-5424515 (ARNULFO MUNGUIA, customer ORG-655875, 11/19 9:01:10a PT, CLOSED, 5 loads all SHIPPED, seal 1379074) · last receive task to close here: TASK-5421959 (CANDY MENDEZ, customer ORG-585450, 11/16 3:28:53p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5424856"],
    duration: "LOAD 13h38m since 11/18 8:05:40p PT (TASK-5424856 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/18 4:49:53p PT · started 11/18 8:05:40p PT · checked in 11/18 8:05:48p PT · updated 11/18 9:13:56p PT · updatedBy amunguia · seal 25010939 · 3 loads LOAD-5044882 (50100822, DN-3469545) LOADED; LOAD-5044724 (50101934, DN-3467190) LOADED; LOAD-5044715 (50101942, DN-3466978) LOADED · carrier ORG-659165 · entry ET-1183747) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1183747 (row updated 11/18 8:56:13p PT) · last load task to close here: TASK-5424341 (DANIEL BELTRAN, customer ORG-655875, 11/18 11:52:14a PT, CLOSED, 5 loads all SHIPPED, seal 1378822) · last receive task to close here: TASK-5421731 (Nanci Viviana Rosas, customer ORG-585450, 11/16 10:13:39a PT, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1182993 (row updated 11/17 10:52:35a PT) · last load task to close here: TASK-5423116 (ARNULFO MUNGUIA, customer ORG-655875, 11/17 10:52:27a PT, CLOSED, 2 loads all SHIPPED, seal 25010990) · last receive task to close here: TASK-5418081 (Nanci Viviana Rosas, customer ORG-585450, 11/11 12:11:56p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Reserved",
    assignee: "Fatima Ponce (RECEIVE IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5424364"],
    duration: "RECEIVE 0h58m since 11/19 8:46:03a PT (TASK-5424364 · Fatima Ponce (assigneeUserId 2053885581368619009) · IN_PROGRESS · DOCK · task created 11/18 10:52:05a PT · started 11/19 8:46:03a PT · not checked in at dock · updated 11/19 8:46:03a PT · updatedBy employee884363 · no dockCheckOutTime · 1 receipt RN-5011522 at status IN_PROGRESS · PO PO 9416 · container TQL11172026 · reference none · appointment 11/17 10:00:00a PT · receivedStart 11/19 8:46:03a PT · carrier ORG-825 · in-yard 11/18 10:52:03a PT · entry ET-1183535) · dock RESERVED, space EMPTY, occupiedCustomerIds none, entry ET-1183079 (row updated 11/18 10:52:06a PT) · last load task to close here: TASK-5423711 (ARNULFO MUNGUIA, customer ORG-655875, 11/17 5:13:20p PT, CLOSED, 1 load SHIPPED, seal 25010991) · last receive task to close here: TASK-5414098 (Nanci Viviana Rosas, customer ORG-585450, 11/9 2:14:50p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1183240 (row updated 11/19 7:37:43a PT) · last load task to close here: TASK-5420377 (BARTOLO RAMIREZ, customer ORG-655875, 11/13 12:10:57p PT, CLOSED, 1 load SHIPPED, seal 1304053) · last receive task to close here: TASK-5423720 (DANIELA GONZALEZ, customer ORG-655875, 11/17 8:40:26p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Available",
    assignee: "DANIELA GONZALEZ (RECEIVE IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5424859"],
    duration: "RECEIVE 14h22m since 11/18 7:22:12p PT (TASK-5424859 · DANIELA GONZALEZ (assigneeUserId 11769) · IN_PROGRESS · DOCK · task created 11/18 4:58:23p PT · started 11/18 7:22:12p PT · dock check-in 11/18 7:22:14p PT · updated 11/18 7:22:14p PT · updatedBy dagonzalez · no dockCheckOutTime · 1 receipt RN-5011593 at status IN_PROGRESS · PO FSCU9305680 · container FSCU9305680 · reference B00419374 · appointment 11/17 6:00:00p PT · receivedStart 11/18 7:22:12p PT · carrier ORG-825 · in-yard 11/18 4:58:23p PT · entry ET-1183752) · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1183752 (row updated 11/19 6:13:58a PT) · last load task to close here: TASK-5422412 (DANIEL BELTRAN, customer ORG-655875, 11/16 3:17:16p PT, CLOSED, 1 load SHIPPED, seal A52687) · last receive task to close here: TASK-5417811 (CANDY MENDEZ, customer ORG-655875, 11/11 12:09:52p PT, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1179653 (row updated 11/18 8:55:46p PT) · last load task to close here: TASK-5413376 (JULIO CESAR ALVARADO, customer ORG-655875, 11/5 2:50:10p PT, CLOSED, 5 loads all SHIPPED, seal 1378416) · last receive task to close here: TASK-5402543 (DANIELA GONZALEZ, customer ORG-655875, 10/23 6:21:53p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1183310 (row updated 11/18 9:41:20p PT) · last load task to close here: TASK-5420400 (BARTOLO RAMIREZ, customer ORG-655875, 11/13 10:56:09a PT, CLOSED, 1 load SHIPPED, seal 1304052) · last receive task to close here: TASK-5423792 (DANIELA GONZALEZ, customer ORG-655875, 11/18 6:26:13p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Available",
    assignee: "JORGE ARMANDO DUENAS (RECEIVE IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5424885"],
    duration: "RECEIVE 12h51m since 11/18 8:53:28p PT (TASK-5424885 · JORGE ARMANDO DUENAS (assigneeUserId 2000827634009450022) · IN_PROGRESS · DOCK · task created 11/18 8:52:54p PT · started 11/18 8:53:28p PT · dock check-in 11/18 8:54:15p PT · updated 11/18 8:54:15p PT · updatedBy employee882504 · no dockCheckOutTime · 1 receipt RN-5011650 at status IN_PROGRESS · PO TIIU4584139 · container TIIU4584139 · reference B00418999 · appointment 11/17 3:00:00p PT · receivedStart 11/18 8:53:28p PT · carrier ORG-825 · in-yard 11/18 8:52:55p PT · entry ET-1183780) · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1183780 (row updated 11/19 6:35:35a PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5423783 (DANIELA GONZALEZ, customer ORG-655875, 11/17 10:32:40p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1182804 (row updated 11/19 6:29:55a PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5422753 (JESUS ESPINOZA, customer ORG-655875, 11/16 11:38:25p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1182176 (row updated 11/18 8:55:08p PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5420980 (DANIELA GONZALEZ, customer ORG-655875, 11/13 9:32:35p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1179941 (row updated 11/18 8:54:58p PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5413519 (Nanci Viviana Rosas, customer ORG-585450, 11/10 11:38:02a PT, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1183746 (row updated 11/19 6:35:37a PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5424855 (DANIELA GONZALEZ, customer ORG-655875, 11/18 8:59:49p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1182617 (row updated 11/19 6:14:01a PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5423799 (Fatima Ponce, customer ORG-655875, 11/18 8:21:46a PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1177841 (row updated 11/18 8:54:21p PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5408610 (Fatima Ponce, customer ORG-655875, 11/2 3:06:46p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "No duration basis on this door (no started task on it) · on this door: RECEIVE TASK-5381972 · Jorge Antonio Franco (assigneeUserId 2060441422549078018) · NEW · DOCK · task created 9/30 9:46:50a PT · no startTime · not checked in at dock · updated 9/30 9:48:35a PT · no dockCheckOutTime · 1 receipt RN-5010583 at status IMPORTED · PO PO9139-2 · container Jpack09242026 · reference none · appointment none on the receipt · receivedStart none · carrier ORG-825 · in-yard 9/30 9:46:48a PT · task note 'DOCK   69 ET-1162686' · entry ET-1162686 · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1183276 (row updated 11/19 6:11:06a PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5423772 (JESUS ESPINOZA, customer ORG-655875, 11/17 7:25:08p PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1172826 (row updated 11/18 8:53:55p PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5399423 (Fatima Ponce, customer ORG-655875, 10/21 8:42:23a PT, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1182729 (row updated 11/17 12:58:23p PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5422515 (CANDY MENDEZ, customer ORG-655875, 11/17 12:58:36p PT, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1176051 (row updated 11/18 8:52:00p PT) · no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: TASK-5405554 (DANIELA GONZALEZ, customer ORG-655875, 10/27 5:45:00p PT, CLOSED)",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 18
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 1
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 10
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 1
const available = doors.filter((d) => d.status === "Available").length; // 4

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors Occupied",
    value: `${occupied}/${TOTAL_DOORS}`,
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

// Doors that carried dockStatus RESERVED at this pull: 1 (DOCK57). It is
// held/reserved rather than free, so "not fully free" doors total 19 of 23.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee - GURUNANDA scope (the dashboard cards).
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, Nov 19
// 2026 09:44a PT).
// 12 active-status GURUNANDA tasks at Bay-4 doors: 6 LOAD + 6 RECEIVE, at 9
// distinct doors (DOCK50, DOCK51, DOCK52, DOCK53, DOCK55, DOCK57, DOCK59, DOCK62,
// DOCK69).
// ARNULFO MUNGUIA (6): LOAD TASK-5424518 IN_PROGRESS, LOAD TASK-5424857
//   IN_PROGRESS, LOAD TASK-5424769 IN_PROGRESS, LOAD TASK-5424856 IN_PROGRESS,
//   LOAD TASK-5425263 NEW, LOAD TASK-5425197 NEW
// DANIELA GONZALEZ (1): RECEIVE TASK-5424859 IN_PROGRESS
// Fatima Ponce (1): RECEIVE TASK-5424364 IN_PROGRESS
// Gonzalo Rangel (1): RECEIVE TASK-5418313 NEW
// Jorge Antonio Franco (1): RECEIVE TASK-5381972 NEW
// JORGE ARMANDO DUENAS (1): RECEIVE TASK-5424885 IN_PROGRESS
// daira gonzalez (1): RECEIVE TASK-5090739 IN_PROGRESS (stale, see header)
// All names/ids are resolved verbatim from the WMS task payloads
// (assigneeUserName / assigneeUserId); no name was normalised or guessed.
// Adding the two non-GURUNANDA tasks would make ARNULFO MUNGUIA 8 and the total
// 14 (see bay4AllCustomerActiveTaskCount) - they are KARAKA, LLC receive tasks on
// DOCK54, TASK-5425254 NEW and TASK-5425183 IN_PROGRESS.
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 6 },
  { name: "DANIELA GONZALEZ", taskCount: 1 },
  { name: "Fatima Ponce", taskCount: 1 },
  { name: "Gonzalo Rangel", taskCount: 1 },
  { name: "Jorge Antonio Franco", taskCount: 1 },
  { name: "JORGE ARMANDO DUENAS", taskCount: 1 },
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

// Mix: 6 RECEIVE + 6 LOAD = 12 active Bay-4 GURUNANDA tasks. The physical
// all-customer mix is 8 RECEIVE + 6 LOAD = 14 (the two extra receive tasks are
// KARAKA, LLC on DOCK54).
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 6, total: 12 },
  { label: "Outbound (LOAD)", count: 6, total: 12 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 6, total: 12 },
  { label: "Inbound", count: 6, total: 12 },
];

// --- Schedule Data (2026-11-19, Thursday) ---
// Both percentages use the SAME UTC-derived 11/19 PT business-day window,
// 2026-11-19 08:00:00 -> 2026-11-20 07:59:59 (see TIMESTAMP SEMANTICS in the
// file header; this window is the only one used anywhere in this file):
//   % scheduled inbounds received TODAY: exactly 6 GURUNANDA receipts carry an
//   appointmentTime inside that window (totalCount 6, all read: RN-5011691,
//   RN-5011687, RN-5011686, RN-195848, RN-5011671, RN-5011655 - all at status
//   IMPORTED) and ZERO of them carry a receivedStartTime = 0 / 6 = 0.0%.
//   Genuinely zero, not "not computable": the denominator is 6.
//   % scheduled outbounds loaded TODAY: 43 GURUNANDA orders carry a scheduleDate
//   inside that window (scheduleDatePeriod ["2026-11-19 08:00:00",
//   "2026-11-20 07:59:59"], totalCount 43, all 43 read) of which 0 are at status
//   SHIPPED (the other 43 are PICKED 38, PLANNED 2, LOADED 1, PICKING 1,
//   CANCELLED 1) = 0 / 43 = 0.0%.
//   SHIPPED is the "loaded" proxy defined by the prior refreshes and kept here so
//   the trend stays comparable; a LOADED-inclusive read would be 1 of 43 = 2.3%
//   (DN-3466978 is the one order already at status LOADED).
//   Both numerators are real counts of a non-empty denominator, so neither card
//   is a "no schedule" state (compare the 11/14-11/15 weekend snapshots, which
//   published both percentages as NOT COMPUTABLE because GURUNANDA had zero
//   scheduled receipts and zero scheduled orders on those days).
export const scheduleAvailable = true;              // 6 GURUNANDA receipts scheduled on 11/19
export const outboundScheduleAvailable = true;      // 43 GURUNANDA orders scheduled on 11/19
export const scheduledInboundOrders = 6;            // receipts with appointmentTime in the 11/19 PT day
export const scheduledOutboundOrders = 43;          // orders with scheduleDate in the 11/19 PT day
export const scheduledInboundReceived = 0;          // receipts with receivedStartTime in that set
export const scheduledOutboundLoaded = 0;           // orders at status SHIPPED in that set
export const pctScheduledInboundReceived = 0.0;     // 0 of 6
export const pctScheduledOutboundLoaded = 0.0;     // 0 of 43
// Facility-wide schedule context for the 11/19 PT day, all customers (same two
// endpoints, no customerId filter, same UTC-derived PT-day window): 44 receipts
// scheduled, of which 8 carry a receivedStartTime; 992 orders scheduled by
// totalCount, of which 301 are SHIPPED.
export const facilityWideReceiptsCreated = 44;
export const facilityWideReceiptsReceived = 8;
export const facilityWideLoadsCreated = 992;
export const facilityWideLoadsShipped = 301;

// Door occupancy duration: available from task startTime where a task exists on
// the door, has actually started and has not already ended; unavailable for
// task-less doors and for NEW tasks with no startTime (WMS has no
// occupancy-start field, and the dock-door-status dashboard endpoint returns an
// empty Duration column). 13 of 23 doors carry no active task at this pull and
// 6 of the 14 active tasks have no startTime (the 5 NEW tasks - DOCK52
// TASK-5425263, DOCK50 TASK-5425197, DOCK54 TASK-5425254, DOCK50 TASK-5418313,
// DOCK69 TASK-5381972 - plus the stale DOCK50 TASK-5090739), so a duration exists
// for 8 tasks on 8 doors (DOCK51 LOAD 21h30m, DOCK52 LOAD 15h29m, DOCK53 LOAD
// 18h04m, DOCK54 RECEIVE 0h26m, DOCK55 LOAD 13h38m, DOCK57 RECEIVE 0h58m, DOCK59
// RECEIVE 14h22m, DOCK62 RECEIVE 12h51m, all measured to 11/19 09:44:04a PT).
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Nov 19 2026 09:44a PT)
// 14 tasks total: 6 LOAD + 8 RECEIVE (12 GURUNANDA + 2 KARAKA, LLC). One is a
// data anomaly (TASK-5090739 on DOCK50, stale since 2025-10-21).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA has 102 CLOSED GURUNANDA load transactions with endTime inside
// the 2026-10-31 00:00:00 UTC - now window (101 under assigneeUserId 89 plus 1
// under a second Arnulfo identity, assigneeUserId 1948070158297014318, name
// rendered "arnulfo munguia"; 85 of them at Bay-4 doors - DOCK54 14 / DOCK52 14 /
// DOCK53 13 / DOCK51 13 / DOCK50 8 / DOCK55 8 / DOCK56 8 / DOCK57 4 / DOCK60 2 /
// DOCK59 1; the other 17 are on DOCK4 4 / DOCK10 3 / DOCK5 2 / DOCK6 1 / DOCK7 2 /
// DOCK8 2 / DOCK9 2 / DOCK45 1); per-day counts by endTime (PT): 11/19 1, 11/18 8,
// 11/17 10, 11/16 7, 11/13 8, 11/12 12, 11/11 4, 11/10 10, 11/9 6, 11/6 8, 11/5 4,
// 11/4 11, 11/3 6, 11/2 7, with no closures on 11/1, 11/7, 11/8, 11/14, 11/15.
// The newest transaction is DOCK54 TASK-5424515 (closed 11/19 9:01:10a PT, 5 loads
// all SHIPPED, seal 1379074) - also the newest at a Bay-4 door.
// He currently holds 6 open GURUNANDA LOAD tasks: DOCK50 TASK-5425197 (NEW, 2
// loads at WINDOW_CHECKIN_DONE), DOCK52 TASK-5425263 (NEW, 1 load at
// WINDOW_CHECKIN_DONE), DOCK52 TASK-5424857 (IN_PROGRESS, seal 25010930),
// DOCK53 TASK-5424769 (IN_PROGRESS, seal 25010932), DOCK55 TASK-5424856
// (IN_PROGRESS, seal 25010939) and DOCK51 TASK-5424518 (IN_PROGRESS, seal
// 25010953), plus the 2 KARAKA receive tasks on DOCK54.
export const assignments: TaskRecord[] = [
  {
    taskId: "TASK-5425263",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · no startTime · ARNULFO MUNGUIA (assigneeUserId 89; assigneeUserName reproduced verbatim from WISE) · task created 11/19 9:42:23a PT · not checked in at dock · updated 11/19 9:42:23a PT · PRE_LOAD · no sealNo yet · 1 load LOAD-5044887 (50100832, DN-3469096) at status WINDOW_CHECKIN_DONE · carrier ORG-659165 · customer ORG-655875 (GURUNANDA, LLC) · entry ET-1183931 · door DOCK52",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5425254",
    dns: "RECEIVE",
    customer: "KARAKA, LLC",
    pieces: "NEW · no startTime · ARNULFO MUNGUIA (assigneeUserId 89; assigneeUserName reproduced verbatim from WISE) · task created 11/19 9:38:46a PT · not checked in at dock · updated 11/19 9:41:41a PT · no dockCheckOutTime · 2 receipts RN-195629 at status IMPORTED · PO POBOK0433 · container UNKNOWN - LCL · reference 24721747 · appointment 11/19 9:00:00a PT · receivedStart none · carrier ORG-798955; RN-195627 at status IMPORTED · PO POBOK0454 · container UNKNOWN - LCL · reference 24721725 · appointment 11/19 8:00:00a PT · receivedStart none · carrier ORG-798955 · task note 'dock 54' · customer ORG-585450 (KARAKA, LLC) · entry ET-1183928 · door DOCK54",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5425197",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · no startTime · ARNULFO MUNGUIA (assigneeUserId 89; assigneeUserName reproduced verbatim from WISE) · task created 11/19 9:17:23a PT · not checked in at dock · updated 11/19 9:17:23a PT · PRE_LOAD · no sealNo yet · 2 loads LOAD-5044721 (50100569, DN-3467109) at status WINDOW_CHECKIN_DONE; LOAD-5044718 (50100568, DN-3467063) at status WINDOW_CHECKIN_DONE · carrier ORG-659165 · customer ORG-655875 (GURUNANDA, LLC) · entry ET-1183909 · door DOCK50",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5425183",
    dns: "RECEIVE",
    customer: "KARAKA, LLC",
    pieces: "IN_PROGRESS · 0h26m since 11/19 9:18:25a PT · ARNULFO MUNGUIA (assigneeUserId 89; assigneeUserName reproduced verbatim from WISE) · task created 11/19 9:09:19a PT · dock check-in 11/19 9:18:27a PT · updated 11/19 9:18:27a PT · no dockCheckOutTime · 2 receipts RN-194359 at status IN_PROGRESS · PO POKRK3028 · container HOUU9907931 · reference M26_SHA45 · appointment 11/19 9:00:00a PT · receivedStart 11/19 9:18:25a PT · carrier ORG-825; RN-194358 at status IN_PROGRESS · PO POILO2103 · container HOUU9907931 · reference M26_SHA45 · appointment 11/19 9:00:00a PT · receivedStart 11/19 9:18:25a PT · carrier ORG-825 · customer ORG-585450 (KARAKA, LLC) · entry ET-1183546 · door DOCK54",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5424885",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 12h51m since 11/18 8:53:28p PT · JORGE ARMANDO DUENAS (assigneeUserId 2000827634009450022; assigneeUserName reproduced verbatim from WISE) · task created 11/18 8:52:54p PT · dock check-in 11/18 8:54:15p PT · updated 11/18 8:54:15p PT · no dockCheckOutTime · 1 receipt RN-5011650 at status IN_PROGRESS · PO TIIU4584139 · container TIIU4584139 · reference B00418999 · appointment 11/17 3:00:00p PT · receivedStart 11/18 8:53:28p PT · carrier ORG-825 · customer ORG-655875 (GURUNANDA, LLC) · entry ET-1183780 · door DOCK62",
    assignee: "JORGE ARMANDO DUENAS",
    door: "DOCK62",
  },
  {
    taskId: "TASK-5424859",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 14h22m since 11/18 7:22:12p PT · DANIELA GONZALEZ (assigneeUserId 11769; assigneeUserName reproduced verbatim from WISE) · task created 11/18 4:58:23p PT · dock check-in 11/18 7:22:14p PT · updated 11/18 7:22:14p PT · no dockCheckOutTime · 1 receipt RN-5011593 at status IN_PROGRESS · PO FSCU9305680 · container FSCU9305680 · reference B00419374 · appointment 11/17 6:00:00p PT · receivedStart 11/18 7:22:12p PT · carrier ORG-825 · customer ORG-655875 (GURUNANDA, LLC) · entry ET-1183752 · door DOCK59",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK59",
  },
  {
    taskId: "TASK-5424857",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 15h29m since 11/18 6:15:29p PT · ARNULFO MUNGUIA (assigneeUserId 89; assigneeUserName reproduced verbatim from WISE) · task created 11/18 4:50:59p PT · dock check-in 11/18 6:15:31p PT · updated 11/18 7:20:49p PT · PRE_LOAD · seal 25010930 · 1 load LOAD-5044886 (50100830, DN-3469097) at status LOADED · carrier ORG-659165 · customer ORG-655875 (GURUNANDA, LLC) · entry ET-1183748 · door DOCK52",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5424856",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 13h38m since 11/18 8:05:40p PT · ARNULFO MUNGUIA (assigneeUserId 89; assigneeUserName reproduced verbatim from WISE) · task created 11/18 4:49:53p PT · dock check-in 11/18 8:05:48p PT · updated 11/18 9:13:56p PT · PRE_LOAD · seal 25010939 · 3 loads LOAD-5044882 (50100822, DN-3469545) at status LOADED; LOAD-5044724 (50101934, DN-3467190) at status LOADED; LOAD-5044715 (50101942, DN-3466978) at status LOADED · carrier ORG-659165 · customer ORG-655875 (GURUNANDA, LLC) · entry ET-1183747 · door DOCK55",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5424769",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 18h04m since 11/18 3:39:49p PT · ARNULFO MUNGUIA (assigneeUserId 89; assigneeUserName reproduced verbatim from WISE) · task created 11/18 3:39:34p PT · dock check-in 11/18 3:39:55p PT · updated 11/19 9:46:18a PT · PRE_LOAD · seal 25010932 · 4 loads LOAD-5044884 (50100826, DN-3469342) at status LOADED; LOAD-5044995 (50101981, DN-3472511) at status LOADED; LOAD-5044885 (50100828, DN-3469312) at status LOADED; LOAD-5044671 (50100556, DN-3466640) at status LOADED · carrier ORG-659165 · customer ORG-655875 (GURUNANDA, LLC) · entry ET-1183728 · door DOCK53",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5424518",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 21h30m since 11/18 12:14:25p PT · ARNULFO MUNGUIA (assigneeUserId 89; assigneeUserName reproduced verbatim from WISE) · task created 11/18 12:05:04p PT · dock check-in 11/18 12:14:30p PT · updated 11/18 6:05:14p PT · PRE_LOAD · seal 25010953 · 2 loads LOAD-5044883 (50100824, DN-3469486) at status LOADED; LOAD-5044722 (50100563, DN-3467108) at status LOADED · carrier ORG-659165 · customer ORG-655875 (GURUNANDA, LLC) · entry ET-1183575 · door DOCK51",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5424364",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 0h58m since 11/19 8:46:03a PT · Fatima Ponce (assigneeUserId 2053885581368619009; assigneeUserName reproduced verbatim from WISE) · task created 11/18 10:52:05a PT · not checked in at dock · updated 11/19 8:46:03a PT · no dockCheckOutTime · 1 receipt RN-5011522 at status IN_PROGRESS · PO PO 9416 · container TQL11172026 · reference none · appointment 11/17 10:00:00a PT · receivedStart 11/19 8:46:03a PT · carrier ORG-825 · customer ORG-655875 (GURUNANDA, LLC) · entry ET-1183535 · door DOCK57",
    assignee: "Fatima Ponce",
    door: "DOCK57",
  },
  {
    taskId: "TASK-5418313",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · no startTime · Gonzalo Rangel (assigneeUserId 2000828853478170980; assigneeUserName reproduced verbatim from WISE) · task created 11/11 11:24:50a PT · not checked in at dock · updated 11/11 11:24:50a PT · no dockCheckOutTime · 1 receipt RN-195495 at status IMPORTED · PO RMA0276 · container not recorded · reference Po # 979126 · appointment 11/11 12:00:00a PT · receivedStart none · carrier ORG-825 · customer ORG-655875 (GURUNANDA, LLC) · entry ET-1181371 · door DOCK50",
    assignee: "Gonzalo Rangel",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · no startTime · Jorge Antonio Franco (assigneeUserId 2060441422549078018; assigneeUserName reproduced verbatim from WISE) · task created 9/30 9:46:50a PT · not checked in at dock · updated 9/30 9:48:35a PT · no dockCheckOutTime · 1 receipt RN-5010583 at status IMPORTED · PO PO9139-2 · container Jpack09242026 · reference none · appointment none · receivedStart none · carrier ORG-825 · task note 'DOCK   69 ET-1162686' · customer ORG-655875 (GURUNANDA, LLC) · entry ET-1162686 · door DOCK69",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · no startTime · daira gonzalez (assigneeUserId 1948070158297014492; assigneeUserName reproduced verbatim from WISE) · task created 10/20 9:38:05p PT · dock check-in 10/22 9:41:46a PT · updated 10/22 2:25:42p PT · no dockCheckOutTime · 1 receipt RN-5002143 at status CLOSED · PO EGSU8032696 · container EGSU8032696 · reference EGLV149507056809 · appointment 10/20 9:00:00a PT · receivedStart none · carrier ORG-34911 · customer ORG-655875 (GURUNANDA, LLC) · entry ET-1027622 · door DOCK50 · STALE: status still IN_PROGRESS although endTime is 10/22 9:42:01a PT and its linked receipt RN-5002143 is CLOSED",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
];
