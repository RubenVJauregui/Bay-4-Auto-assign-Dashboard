/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 11/23 11:35:47AM PT (live WISE / WMS-BAM APIs)
 *   Reference 2026-11-23T19:35:47.609508+00:00 = 11/23 11:35:47AM PT.
 *   Every value below was re-read live in ONE pass at that reference. The 23 door
 *   rows, the active load/receive task sets, the two schedule denominators, the
 *   closed-task sets and the planned-order count all come from that single pass.
 *   Nothing here is carried over from an earlier snapshot except the all-time
 *   assignee baseline, which is explicitly labelled as carried forward.
 *   Live WISE counts drift between passes, so treat this file as a point-in-time
 *   snapshot at the reference above, not a rolling average.
 *
 *   TIMESTAMP SEMANTICS - unchanged from prior pulls, re-verified here:
 *   WISE/WMS-BAM returns task, receipt, order and appointment timestamps as UTC
 *   strings with NO offset. They are NOT facility wall-clock. Render PT with a
 *   real zone conversion (PST = UTC-8 on/after 2026-11-01).
 *   Evidence at this pull: DOCK52 TASK-5427874 startTime 2026-11-23T17:22:37 =
 *   11/23 9:22:37a PT; DOCK51 TASK-5427835 checkInTime 2026-11-23T16:42:12 =
 *   11/23 8:42:12a PT; DOCK51 TASK-5426987 endTime 2026-11-23T19:32:12 =
 *   11/23 11:32:12a PT.
 *   QUERY MODE - this pull used the raw-UTC mode (no item-time-zone header), the
 *   same mode as every prior snapshot, so windows stay comparable pull to pull.
 *   Durations are measured to the 11/23 11:35:47AM PT pull reference.
 *
 *   SOURCES USED AT THIS PULL:
 *     - POST /wms-bam/wms-location/search, body {exactlyNames:[DOCK50..DOCK72]}
 *       -> code 0, 23/23 rows (category DOCK, type DOCK, status USABLE on all 23,
 *       dockStatus, spaceStatus, occupiedCustomerIds, entryId, updatedTime).
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer filter)
 *       -> totalCount 64, all read; 3 of them sit on a Bay-4 dockName.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer filter)
 *       -> totalCount 114, all read; 12 of them sit on a Bay-4 dockName.
 *     - POST /wms-bam/inbound/receipt/search-by-paging
 *       {customerId: ORG-655875, appointmentTimeFrom "2026-11-23 08:00:00",
 *       appointmentTimeTo "2026-11-24 07:59:59"} -> totalCount 9, 9 rows read.
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, scheduleDatePeriod ["2026-11-23 08:00:00",
 *       "2026-11-24 07:59:59"]} -> totalCount 92, 92 rows read.
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], endTimeFrom "2026-10-31 00:00:00"
 *       -> totalCount 1024, all 1024 read. Per-door "last load task
 *       to close here" is read from this set. The ARNULFO MUNGUIA / GURUNANDA subset is
 *       measured on the same set (customerId ORG-655875 + assigneeUserIds [89,
 *       1948070158297014318]) -> 122 transactions, 104 of them at Bay-4 doors.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], endTimePeriod ["2026-10-01 00:00:00", now]
 *       -> totalCount 1881, all 1881 read, which contains every per-door
 *       "last receive task to close here" value below. NOTE: this endpoint rejects
 *       `sortingFields` (HTTP 400 "Invalid format: Request body format error") and
 *       ignores `endTimeFrom` (it returns the full 1881 either way), so the
 *       window above is `endTimePeriod`, which IS applied.
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, status: PLANNED} -> totalCount 243.
 *     - Task-name keyword RE-TESTED at this pull: the load-task `keyword` filter is
 *       STILL A NO-OP. "Guru live out / in assign to Arnulfo" and a nonsense string
 *       ("zzzz-no-such-task-zzzz") both returned the identical facility total,
 *       22971 / 22971 (and 63 / 63 with statuses [NEW, IN_PROGRESS, EXCEPTION]).
 *       No plan or task group named "Guru live out / in
 *       assign to Arnulfo" can be resolved through keyword search, and all active Bay-4
 *       tasks carry projectId null, so there is no named task group to resolve. The
 *       "Guru live out / in assign to Arnulfo" stream is therefore reported as ARNULFO
 *       MUNGUIA's task-assignment transactions on the GURUNANDA live-out/live-in work,
 *       and nothing is invented.
 *
 *   SCOPE NOTE:
 *     The line-level metrics on this dashboard are GURUNANDA-scoped (the customer scope
 *     this dashboard has always published). At this pull 15 active tasks sit on Bay-4 doors
 *     across all customers (12 RECEIVE / 3 LOAD) while the GURUNANDA scope reads 9
 *     (6 RECEIVE / 3 LOAD). The extras are non-GURUNANDA receive tasks: ORG-585450 TASK-5426910 IN_PROGRESS (ARNULFO MUNGUIA) at DOCK50; ORG-585450 TASK-5427835 IN_PROGRESS (ARNULFO MUNGUIA) at DOCK51; ORG-585450 TASK-5427874 IN_PROGRESS (ARNULFO MUNGUIA) at DOCK52; ORG-585450 TASK-5425183 IN_PROGRESS (ARNULFO MUNGUIA) at DOCK54; ORG-585450 TASK-5426702 IN_PROGRESS (ARNULFO MUNGUIA) at DOCK54; ORG-585450 TASK-5426441 IN_PROGRESS (ARNULFO MUNGUIA) at DOCK57.
 *     bay4AllCustomerActiveTaskCount / ...ReceiveCount / ...LoadCount export the physical
 *     numbers so the divergence stays explicit. Door status itself is physical (a door is
 *     occupied no matter which customer is on it).
 *
 *   Key state at this pull:
 *     - DOOR STATUS: occupied 15, reserved 4, available 4 (15+4+4 = 23). Fully free doors: DOCK63, DOCK66, DOCK68, DOCK69.
 *       Raw dockStatus: AVAILABLE 7, OCCUPIED 12, RESERVED 4. Raw
 *       spaceStatus: OCCUPIED 11, EMPTY 12. Reserved doors: DOCK50, DOCK52, DOCK56, DOCK59.
 *       3 doors read dock AVAILABLE but space OCCUPIED and are therefore counted as Occupied:
 *       DOCK51, DOCK53, DOCK55.
 *     - ACTIVE TASKS: 15 tasks across all customers - 12 RECEIVE / 3 LOAD - at 9 distinct doors
 *       (DOCK50, DOCK51, DOCK52, DOCK54, DOCK55, DOCK57, DOCK59, DOCK67, DOCK69). GURUNANDA-scoped: 9 tasks
 *       (6 RECEIVE / 3 LOAD) at 7 doors.
 *     - ASSIGNMENTS BY ASSIGNEE (GURUNANDA, the dashboard cards):
 *       A1SG 1
 *       ARNULFO MUNGUIA 1
 *       CANDY MENDEZ 1
 *       CANDY MENDEZ 1
 *       DANIEL BELTRAN 1
 *       Fatima Ponce 1
 *       Jorge Antonio Franco 1
 *       daira gonzalez 1
 *       jorge franco 1
 *       = 9.
 *       Names are reproduced exactly as WISE returns them in assigneeUserName; every count is
 *       a distinct assigneeUserId value and two assignees are NOT merged. WISE returns TWO
 *       different "CANDY MENDEZ" user ids (10200, 1932077636141408257), so that
 *       name appears twice with 1 task each; "jorge franco" (1948070158297014498) and
 *       "Jorge Antonio Franco" (2060441422549078018) are likewise two distinct users. All-customer
 *       adds ARNULFO MUNGUIA on 6 non-GURUNANDA receive tasks -> 15 tasks, ARNULFO MUNGUIA 7.
 *     - ANOMALIES: 2. DOCK50 TASK-5090739 (RECEIVE, IN_PROGRESS) has startTime 10/21 1:21:14p PT and endTime 10/22 10:42:01a PT (started in 2025 - the task has been 'active' since then and its linked receipt is CLOSED); DOCK55 TASK-5426833 (RECEIVE, IN_PROGRESS) has startTime 11/23 9:31:33a PT and endTime 11/23 10:32:11a PT;
 *       flagged, not given an open-ended duration.
 *     - Task "Guru live out / in assign to Arnulfo": 122 CLOSED GURUNANDA load transactions with endTime
 *       from 2026-10-31 00:00:00 UTC, 104 at Bay-4 doors, 18 off Bay 4
 *       (DOCK10 4, DOCK4 4, DOCK45 1, DOCK5 2, DOCK6 1, DOCK7 2, DOCK8 2, DOCK9 2).
 *       Bay-4 breakdown: DOCK52 19, DOCK51 16, DOCK53 16, DOCK54 16, DOCK50 9, DOCK55 9, DOCK56 9, DOCK57 5, DOCK58 2, DOCK60 2, DOCK59 1.
 *       Per-day counts by endTime (UTC date): 11/23 6, 11/20 6, 11/19 9, 11/18 9, 11/17 9, 11/16 7, 11/14 1, 11/13 7, 11/12 12, 11/11 4, 11/10 10, 11/09 6, 11/07 1, 11/06 7, 11/05 4, 11/04 12, 11/03 5, 11/02 7.
 *       Newest transaction: DOCK51 TASK-5426987, started 11/20 4:06:22p PT,
 *       closed 11/23 11:32:12a PT, 1 load, seal 1378854. It is the newest at a Bay-4 door.
 *       He currently holds 7 open Bay-4 tasks
 *       (DOCK50 TASK-5426910 RECEIVE, DOCK51 TASK-5427835 RECEIVE, DOCK52 TASK-5427874 RECEIVE, DOCK52 TASK-5425811 LOAD, DOCK54 TASK-5425183 RECEIVE, DOCK54 TASK-5426702 RECEIVE, DOCK57 TASK-5426441 RECEIVE).
 *     - % scheduled inbounds received (11/23 PT): 0 of 9 (0.0%). 9 GURUNANDA receipts carry an
 *       appointmentTime inside the 11/23 PT day and none of them carries a receivedStartTime
 *       (all 9 still sit at status IMPORTED), so the read is a real 0 of 9.
 *       Cross-check on the neighbouring days: 0 receipts for 11/22 PT,
 *       2 for 11/24 PT.
 *     - % scheduled outbounds loaded (11/23 PT): 18 of 92 (19.6%, SHIPPED proxy). 92 GURUNANDA orders carry a
 *       scheduleDate inside the 11/23 PT day: SHIPPED 18, LOADED 0,
 *       status mix PICKED 46, PLANNED 23, SHIPPED 18, IMPORTED 4, COMMIT_FAILED 1.
 *       The prior-day check: 0 orders for 11/22 PT (Sunday), 38 for 11/24 PT.
 *     - Inbound/outbound mix: 6 RECEIVE / 3 LOAD of 9 active GURUNANDA tasks
 *       (12 RECEIVE / 3 LOAD of 15 physical tasks across all customers).
 *     - Total doors occupied: 15 of 23 (plus 4 reserved, 4 available).
 *     - Planned GURUNANDA orders: live count 243 at this pull.
 *     - Door occupancy duration: available where an active task has a startTime and has not
 *       ended - 10 tasks at this pull (DOCK54 RECEIVE 98h17m + RECEIVE 70h16m + LOAD 0h34m, DOCK55 RECEIVE 0h51m, DOCK52 RECEIVE 2h13m + LOAD 92h39m, DOCK51 RECEIVE 2h53m, DOCK50 RECEIVE 66h54m, DOCK57 RECEIVE 73h23m, DOCK67 RECEIVE 74h57m), all measured to the
 *       11/23 11:35:47AM PT reference. WMS has no occupancy-start field for task-less doors
 *       (14 of 23), for the 2 NEW Bay-4 RECEIVE
 *       tasks with no startTime, or for the 1 NEW Bay-4 LOAD task with no startTime, so no duration is
 *       asserted for those.
 *     - Facility-wide schedule context for the 11/23 PT day (no customerId filter, same
 *       window): receipts scheduled 47, of which 15 carry a receivedStartTime; orders scheduled
 *       5491, of which 1539 are SHIPPED.
 *
 *   NOTE: the in-yard FULL equipment array and the all-time assignee baseline are outside
 *   the scope of this request and were NOT re-stated from WISE into this file; the array
 *   renders live from the WMS loader, and the all-time baseline is carried forward
 *   unchanged rather than estimated.
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
// it succeeds. Live totalCount was 243 at the 11:35:47AM PT pull.
export const plannedGurunandaOrderCount = 243;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/23 11:35:47AM PT
//
// All 23 rows come from one /wms-bam/wms-location/search call
// (exactlyNames DOCK50..DOCK72); every row is category DOCK, type DOCK,
// status USABLE. Door status rule (unchanged, keeps the dashboard's 3-value
// enum):
//   Reserved  = dockStatus RESERVED (door is held/reserved, so it is not free)
//   Occupied  = dockStatus OCCUPIED OR spaceStatus OCCUPIED (not fully free)
//   Available = dockStatus AVAILABLE AND spaceStatus EMPTY
// Raw field values are preserved per door so the mapping can be re-checked.
// Totals: Occupied 15, Reserved 4, Available 4 = 23.
// 4 doors read RESERVED at this pull (DOCK50, DOCK52, DOCK56, DOCK59).
// 3 doors are dock AVAILABLE but still carry space OCCUPIED
// (DOCK51, DOCK53, DOCK55), so they count as Occupied.
// Fully free doors: DOCK63, DOCK66, DOCK68, DOCK69.
// Raw tallies at this pull: dockStatus AVAILABLE 7 / OCCUPIED 12 /
// RESERVED 4; spaceStatus OCCUPIED 11 / EMPTY 12.
//
// BAY 4 ALL-CUSTOMER PHYSICAL TALLY (see SCOPE NOTE in the file header):
// active (NEW / IN_PROGRESS / EXCEPTION) tasks whose dockName is one of these
// 23 doors = 15 (RECEIVE 12, LOAD 3) on 9 doors. 6 of the receive tasks are
// KARAKA, LLC (ORG-585450), so the GURUNANDA-only tally is 9
// (RECEIVE 6, LOAD 3) on 7 doors.
// =====================================================================
export const bay4AllCustomerActiveTaskCount = 15;
export const bay4AllCustomerActiveReceiveCount = 12;
export const bay4AllCustomerActiveLoadCount = 3;

export const doors: DoorRecord[] = [
  {
    door: "DOCK50",
    status: "Reserved",
    assignee: "daira gonzalez (RECEIVE IN_PROGRESS) + ARNULFO MUNGUIA (RECEIVE IN_PROGRESS)",
    customer: "GURUNANDA, LLC + KARAKA, LLC",
    taskIds: ["TASK-5090739", "TASK-5426910"],
    duration: "On this door: RECEIVE ENDED 10/22 10:42:01a PT while status is IN_PROGRESS - STALE/anomaly, no open-ended duration asserted · TASK-5090739 · daira gonzalez (assigneeUserId 1948070158297014492) · IN_PROGRESS · DOCK · task created 10/20 10:38:05p PT · started 10/21 1:21:14p PT · checked in 10/22 10:41:46a PT · updated 10/22 3:25:42p PT · 1 receipt: RN-5002143 at status CLOSED · PO EGSU8032696 · container EGSU8032696 · reference EGLV149507056809 · appointment 10/20 10:00:00a PT · receivedStart none · entry ET-1027622 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK50 · Also on this door: RECEIVE 66h54m since 11/20 4:40:57p PT · TASK-5426910 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/20 2:43:28p PT · started 11/20 4:40:57p PT · checked in 11/20 4:40:59p PT · updated 11/20 4:41:49p PT · 1 receipt: RN-195393 at status IN_PROGRESS · PO POBOK0512 · container UNKNOWN - LCL · reference SPR44475617 · appointment 11/17 10:00:00a PT · receivedStart 11/20 4:40:57p PT · entry ET-1184618 · customer ORG-585450 (KARAKA, LLC) · door DOCK50 · dock RESERVED, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1184832 · row updated 11/23 5:13:02a PT · last load task to close here: 11/19 2:11:15p PT TASK-5425197 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 2 loads) · last receive task to close here: 11/09 4:55:40p PT TASK-5416210 (DANIELA GONZALEZ, customer ORG-585450, FORCE_CLOSED)",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (RECEIVE IN_PROGRESS)",
    customer: "KARAKA, LLC",
    taskIds: ["TASK-5427835"],
    duration: "On this door: RECEIVE 2h53m since 11/23 8:42:10a PT · TASK-5427835 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/23 8:12:48a PT · started 11/23 8:42:10a PT · checked in 11/23 8:42:12a PT · updated 11/23 8:44:17a PT · 1 receipt: RN-195022 at status IN_PROGRESS · PO POKRK3100 · container CSGU6627792 · reference M26_NB37 · appointment 11/23 9:00:00a PT · receivedStart 11/23 8:42:10a PT · entry ET-1184864 · task note \"DOCK 51   ET-1184864\" · customer ORG-585450 (KARAKA, LLC) · door DOCK51 · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1184864 · row updated 11/23 11:32:20a PT · last load task to close here: 11/23 11:32:12a PT TASK-5426987 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 11/13 10:42:38a PT TASK-5420402 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Reserved",
    assignee: "ARNULFO MUNGUIA (RECEIVE IN_PROGRESS) + A1SG (RECEIVE NEW) + ARNULFO MUNGUIA (LOAD IN_PROGRESS)",
    customer: "KARAKA, LLC + GURUNANDA, LLC",
    taskIds: ["TASK-5427874", "TASK-5428115", "TASK-5425811"],
    duration: "On this door: RECEIVE 2h13m since 11/23 9:22:37a PT · TASK-5427874 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/23 8:48:29a PT · started 11/23 9:22:37a PT · checked in 11/23 9:23:27a PT · updated 11/23 9:24:34a PT · 1 receipt: RN-195903 at status IN_PROGRESS · PO POBOK0605 · container UNKNOWN - LCL · reference 24765041 · appointment 11/23 9:00:00a PT · receivedStart 11/23 9:22:37a PT · entry ET-1184881 · task note \"DOCK 52   ET-1184881\" · customer ORG-585450 (KARAKA, LLC) · door DOCK52 · Also on this door: RECEIVE not started · TASK-5428115 · A1SG (assigneeUserId 1910160202361942018) · NEW · DOCK · task created 11/23 11:31:48a PT · started no startTime · not checked in at dock · updated 11/23 11:31:48a PT · 1 receipt: RN-195920 at status IMPORTED · PO PO8331-1 · container TQL11192026 · reference TQL · appointment 11/20 11:00:00a PT · receivedStart none · entry ET-1184993 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK52 · Also on this door: LOAD 92h39m since 11/19 2:56:29p PT · TASK-5425811 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/19 2:39:50p PT · started 11/19 2:56:29p PT · checked in 11/19 2:56:52p PT · updated 11/20 11:45:43a PT · seal 1378810 · 1 load: LOAD-5044981 (50101956, DN-3472288) at status LOADED · entry ET-1184121 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK52 · dock RESERVED, space OCCUPIED, occupiedCustomerIds none, entry ET-1184881 · row updated 11/23 11:31:52a PT · last load task to close here: 11/23 10:56:11a PT TASK-5427049 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 2 loads) · last receive task to close here: 11/11 2:39:35p PT TASK-5417998 (Nanci Viviana Rosas, customer ORG-585450, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1184916 · row updated 11/23 10:26:32a PT · last load task to close here: 11/23 10:26:23a PT TASK-5427911 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 3 loads) · last receive task to close here: 10/29 11:01:54a PT TASK-5407284 (ARNULFO MUNGUIA, customer ORG-585450, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (RECEIVE IN_PROGRESS) + ARNULFO MUNGUIA (RECEIVE IN_PROGRESS) + DANIEL BELTRAN (LOAD IN_PROGRESS)",
    customer: "KARAKA, LLC + GURUNANDA, LLC",
    taskIds: ["TASK-5425183", "TASK-5426702", "TASK-5428051"],
    duration: "On this door: RECEIVE 98h17m since 11/19 9:18:25a PT · TASK-5425183 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/19 9:09:19a PT · started 11/19 9:18:25a PT · checked in 11/19 9:18:27a PT · updated 11/19 9:18:27a PT · 2 receipts: RN-194358 at status IN_PROGRESS · PO POILO2103 · container HOUU9907931 · reference M26_SHA45 · appointment 11/19 9:00:00a PT · receivedStart 11/19 9:18:25a PT; RN-194359 at status IN_PROGRESS · PO POKRK3028 · container HOUU9907931 · reference M26_SHA45 · appointment 11/19 9:00:00a PT · receivedStart 11/19 9:18:25a PT · entry ET-1183546 · customer ORG-585450 (KARAKA, LLC) · door DOCK54 · Also on this door: RECEIVE 70h16m since 11/20 1:19:04p PT · TASK-5426702 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/20 12:04:46p PT · started 11/20 1:19:04p PT · checked in 11/20 1:19:13p PT · updated 11/20 1:32:15p PT · 2 receipts: RN-195735 at status IN_PROGRESS · PO POBOK0573_ship_1 · container UNKNOWN - LCL · reference 24734515 · appointment 11/20 2:00:00p PT · receivedStart 11/20 1:19:04p PT; RN-195733 at status IN_PROGRESS · PO POBOK0444 · container UNKNOWN - LCL · reference 24734515 · appointment 11/20 2:00:00p PT · receivedStart 11/20 1:19:04p PT · entry ET-1184507 · customer ORG-585450 (KARAKA, LLC) · door DOCK54 · Also on this door: LOAD 0h34m since 11/23 11:01:04a PT · TASK-5428051 · DANIEL BELTRAN (assigneeUserId 1932077596691410945) · IN_PROGRESS · PRE_LOAD · task created 11/23 11:00:30a PT · started 11/23 11:01:04a PT · checked in 11/23 11:01:11a PT · updated 11/23 11:01:12a PT · 4 loads: LOAD-5045193 (50102168, DN-3477823) at status LOADING; LOAD-5045191 (50102164, DN-3477993) at status LOADED; LOAD-5045190 (50102162, DN-3477994) at status LOADED; LOAD-5045189 (50102160, DN-3478017) at status LOADING · entry ET-1184975 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK54 · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1184975 · row updated 11/23 11:01:36a PT · last load task to close here: 11/23 9:37:43a PT TASK-5427068 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 11/19 6:26:40p PT TASK-5425254 (ARNULFO MUNGUIA, customer ORG-585450, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "CANDY MENDEZ (RECEIVE IN_PROGRESS) + Fatima Ponce (RECEIVE IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5426833", "TASK-5425381"],
    duration: "On this door: RECEIVE ENDED 11/23 10:32:11a PT while status is IN_PROGRESS - STALE/anomaly, no open-ended duration asserted · TASK-5426833 · CANDY MENDEZ (assigneeUserId 10200) · IN_PROGRESS · DOCK · task created 11/20 1:30:45p PT · started 11/23 9:31:33a PT · checked in 11/23 9:31:36a PT · updated 11/23 10:38:41a PT · 1 receipt: RN-195922 at status IN_PROGRESS · PO FUS11192026UNIS-107 · container none · reference 1185149-1 · appointment 11/20 8:00:00a PT · receivedStart 11/23 9:31:33a PT · entry ET-1184562 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK55 · Also on this door: RECEIVE 0h51m since 11/23 10:44:15a PT · TASK-5425381 · Fatima Ponce (assigneeUserId 2053885581368619009) · IN_PROGRESS · DOCK · task created 11/19 10:41:33a PT · started 11/23 10:44:15a PT · not checked in at dock · updated 11/23 10:44:15a PT · 1 receipt: RN-5011671 at status IN_PROGRESS · PO PO9466 · container Leafchem11192026 · reference none · appointment 11/19 10:00:00a PT · receivedStart 11/23 10:44:15a PT · entry ET-1183963 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK55 · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1184562 · row updated 11/23 10:38:41a PT · last load task to close here: 11/20 2:06:03p PT TASK-5426568 (DANIEL BELTRAN, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 11/20 5:02:18p PT TASK-5425838 (ARNULFO MUNGUIA, customer ORG-585450, CLOSED)",
    anomaly: true,
  },
  {
    door: "DOCK56",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space OCCUPIED, occupiedCustomerIds none, entry ET-1184987 · row updated 11/23 11:23:13a PT · last load task to close here: 11/20 10:58:58a PT TASK-5426242 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 2 loads) · last receive task to close here: 11/11 12:11:56p PT TASK-5418081 (Nanci Viviana Rosas, customer ORG-585450, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (RECEIVE IN_PROGRESS)",
    customer: "KARAKA, LLC",
    taskIds: ["TASK-5426441"],
    duration: "On this door: RECEIVE 73h23m since 11/20 10:11:49a PT · TASK-5426441 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/20 10:06:52a PT · started 11/20 10:11:49a PT · checked in 11/20 10:11:51a PT · updated 11/20 10:14:50a PT · 1 receipt: RN-194652 at status IN_PROGRESS · PO POILO2101_ship_1 · container TXGU7467952 · reference Diana_LCL_YT91 · appointment 11/20 10:00:00a PT · receivedStart 11/20 10:11:49a PT · entry ET-1183830 · task note \"DOCK   57   ET-1183830\" · customer ORG-585450 (KARAKA, LLC) · door DOCK57 · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1184457 · row updated 11/21 5:30:26p PT · last load task to close here: 11/20 12:33:18p PT TASK-5426533 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 11/20 12:40:53p PT TASK-5425944 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1184478 · row updated 11/21 1:00:31a PT · last load task to close here: 11/20 3:16:48p PT TASK-5426582 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 3 loads) · last receive task to close here: 11/20 12:18:57p PT TASK-5425943 (CANDY MENDEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Reserved",
    assignee: "CANDY MENDEZ (LOAD NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5428022"],
    duration: "On this door: LOAD not started · TASK-5428022 · CANDY MENDEZ (assigneeUserId 1932077636141408257) · NEW · LIVE_LOAD · task created 11/23 10:43:18a PT · started no startTime · not checked in at dock · updated 11/23 10:43:18a PT · 1 load: LOAD-5045164 (PO671734 UNIS BOL, DN-3474635) at status WINDOW_CHECKIN_DONE · entry ET-1184953 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK59 · dock RESERVED, space EMPTY, occupiedCustomerIds none, entry ET-1184953 · row updated 11/23 10:43:21a PT · last load task to close here: 11/16 3:17:16p PT TASK-5422412 (DANIEL BELTRAN, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 11/20 8:09:54a PT TASK-5424859 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1179653 · row updated 11/21 12:59:53a PT · last load task to close here: 11/05 2:50:10p PT TASK-5413376 (JULIO CESAR ALVARADO, customer ORG-655875, CLOSED, 5 loads) · last receive task to close here: 10/23 7:21:53p PT TASK-5402543 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1184658 · row updated 11/23 10:18:08a PT · last load task to close here: 11/13 10:56:09a PT TASK-5420400 (BARTOLO RAMIREZ, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 11/20 8:21:45p PT TASK-5427010 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1184249 · row updated 11/21 5:32:13p PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/20 8:07:23p PT TASK-5425962 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1184657 · row updated 11/23 10:31:16a PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/23 10:31:29a PT TASK-5427009 (Fatima Ponce, customer ORG-655875, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1182176 · row updated 11/21 5:32:50p PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/13 9:32:35p PT TASK-5420980 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1179941 · row updated 11/21 12:59:34a PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/10 11:38:02a PT TASK-5413519 (Nanci Viviana Rosas, customer ORG-585450, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1184169 · row updated 11/23 9:51:24a PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/23 9:50:02a PT TASK-5425867 (CANDY MENDEZ, customer ORG-655875, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: "jorge franco (RECEIVE IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5426207"],
    duration: "On this door: RECEIVE 74h57m since 11/20 8:38:40a PT · TASK-5426207 · jorge franco (assigneeUserId 1948070158297014498) · IN_PROGRESS · DOCK · task created 11/20 8:32:20a PT · started 11/20 8:38:40a PT · checked in 11/20 8:39:31a PT · updated 11/20 8:39:31a PT · 1 receipt: RN-5011708 at status IN_PROGRESS · PO 9493 · container CORRU112026UNIS · reference none · appointment 11/20 10:00:00a PT · receivedStart 11/20 8:38:40a PT · entry ET-1184314 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK67 · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1184314 · row updated 11/21 5:33:53p PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/18 8:21:46a PT TASK-5423799 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1184494 · row updated 11/23 6:05:48a PT · last load task to close here: 11/20 12:57:47p PT TASK-5426700 (DANIEL BELTRAN, customer ORG-655875, CLOSED, 2 loads) · last receive task to close here: 11/02 3:06:46p PT TASK-5408610 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Available",
    assignee: "Jorge Antonio Franco (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "On this door: RECEIVE not started · TASK-5381972 · Jorge Antonio Franco (assigneeUserId 2060441422549078018) · NEW · DOCK · task created 09/30 10:46:50a PT · started no startTime · not checked in at dock · updated 09/30 10:48:35a PT · 1 receipt: RN-5010583 at status IMPORTED · PO PO9139-2 · container Jpack09242026 · reference none · appointment none · receivedStart none · entry ET-1162686 · task note \"DOCK   69 ET-1162686\" · customer ORG-655875 (GURUNANDA, LLC) · door DOCK69 · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1183276 · row updated 11/23 11:01:36a PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/17 7:25:08p PT TASK-5423772 (JESUS ESPINOZA, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1172826 · row updated 11/21 12:58:57a PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 10/21 9:42:23a PT TASK-5399423 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1182729 · row updated 11/21 12:58:47a PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/17 12:58:36p PT TASK-5422515 (CANDY MENDEZ, customer ORG-655875, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1176051 · row updated 11/21 12:58:38a PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 10/27 6:45:00p PT TASK-5405554 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 15
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 4
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 9
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 2
const available = doors.filter((d) => d.status === "Available").length; // 4

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors Occupied",
    value: "15/23",
    numerator: 15,
    denominator: 23,
    percentage: 65,
  },
  {
    label: "Doors w/ Active Tasks",
    value: "9",
    numerator: 9,
    denominator: 23,
    percentage: 39,
  },
  {
    label: "Doors Available",
    value: "4",
    numerator: 4,
    denominator: 23,
    percentage: 17,
  },
  {
    label: "Anomalies",
    value: "2",
    numerator: 2,
    denominator: 23,
    percentage: 9,
  },
];

// Doors that carried dockStatus RESERVED at this pull: 4 (DOCK50, DOCK52, DOCK56, DOCK59). A
// reserved door is held rather than free, so 15 read Occupied and 19 of 23 are not fully free.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee - GURUNANDA scope (the dashboard cards).
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, 11/23 11:35:47AM PT).
// 9 active-status GURUNANDA tasks at Bay-4 doors: 3 LOAD + 6 RECEIVE, at 7 distinct doors
// (DOCK50, DOCK52, DOCK54, DOCK55, DOCK59, DOCK67, DOCK69).
//       A1SG (1): TASK-5428115 RECEIVE NEW (DOCK52)
//       ARNULFO MUNGUIA (1): TASK-5425811 LOAD IN_PROGRESS (DOCK52)
//       CANDY MENDEZ (1): TASK-5426833 RECEIVE IN_PROGRESS (DOCK55)
//       CANDY MENDEZ (1): TASK-5428022 LOAD NEW (DOCK59)
//       DANIEL BELTRAN (1): TASK-5428051 LOAD IN_PROGRESS (DOCK54)
//       Fatima Ponce (1): TASK-5425381 RECEIVE IN_PROGRESS (DOCK55)
//       Jorge Antonio Franco (1): TASK-5381972 RECEIVE NEW (DOCK69)
//       daira gonzalez (1): TASK-5090739 RECEIVE IN_PROGRESS (DOCK50)
//       jorge franco (1): TASK-5426207 RECEIVE IN_PROGRESS (DOCK67)
// All names/ids are resolved verbatim from the WMS task payloads
// (assigneeUserName / assigneeUserId); no name was normalised or guessed.
// Adding the non-GURUNANDA tasks would make ARNULFO MUNGUIA 7 and the total
// 15 (see bay4AllCustomerActiveTaskCount) - they are KARAKA, LLC receive tasks.
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "A1SG", taskCount: 1 },
  { name: "ARNULFO MUNGUIA", taskCount: 1 },
  { name: "CANDY MENDEZ", taskCount: 1 },
  { name: "CANDY MENDEZ", taskCount: 1 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "Fatima Ponce", taskCount: 1 },
  { name: "Jorge Antonio Franco", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
  { name: "jorge franco", taskCount: 1 },
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

// Mix: 6 RECEIVE + 3 LOAD = 9 active Bay-4 GURUNANDA tasks. The physical
// all-customer mix is 12 RECEIVE + 3 LOAD = 15 (the 6 extra receive tasks are
// KARAKA, LLC on DOCK50, DOCK51, DOCK52, DOCK54, DOCK57).
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 6, total: 9 },
  { label: "Outbound (LOAD)", count: 3, total: 9 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 3, total: 9 },
  { label: "Inbound", count: 6, total: 9 },
];

// --- Schedule Data (11/23 11:35:47AM PT) ---
// Both percentages use the SAME UTC-derived 11/23 PT business-day window,
// 2026-11-23 08:00:00 -> 2026-11-24 07:59:59 (see TIMESTAMP SEMANTICS in the
// file header; this window is the only one used anywhere in this file):
//   % scheduled inbounds received TODAY: 9 GURUNANDA receipts carry an appointmentTime
//   inside that window (totalCount 9, 9 rows read) and NONE of them carries a
//   receivedStartTime - all 9 are still at status IMPORTED - so the card reads
//   0 of 9 = 0.0%. The denominator is non-zero, so this is a computed
//   value, not a "not computable" state. Cross-checked on the neighbouring days:
//   0 receipts for the 11/22 PT day, 2 for the 11/24 PT day.
//   % scheduled outbounds loaded TODAY: 92 GURUNANDA orders carry a scheduleDate
//   inside that window (scheduleDatePeriod ["2026-11-23 08:00:00", "2026-11-24 07:59:59"],
//   totalCount 92, 92 rows read) of which 18 are SHIPPED = 19.6%.
//   SHIPPED is the "loaded" proxy defined by the prior refreshes; it is kept for
//   comparability. Status mix of the 92 scheduled orders:
//   PICKED 46, PLANNED 23, SHIPPED 18, IMPORTED 4, COMMIT_FAILED 1.
//   Cross-checked on the neighbouring days: 0 orders for the 11/22 PT day,
//   38 for the 11/24 PT day.
export const scheduleAvailable = true;              // 9 GURUNANDA receipts scheduled on 11/23 - denominator non-zero
export const outboundScheduleAvailable = true;      // 92 GURUNANDA orders scheduled on 11/23 - denominator non-zero
export const scheduledInboundOrders = 9;            // receipts with appointmentTime in the 11/23 PT day
export const scheduledOutboundOrders = 92;           // orders with scheduleDate in the 11/23 PT day
export const scheduledInboundReceived = 0;            // receipts in that window carrying a receivedStartTime
export const scheduledOutboundLoaded = 18;           // orders in that window at status SHIPPED
export const pctScheduledInboundReceived = 0.0;       // 0 of 9
export const pctScheduledOutboundLoaded = 19.6;        // 18 of 92 (SHIPPED proxy)
// Facility-wide schedule context for the 11/23 PT day, all customers (same two
// endpoints, no customerId filter, same UTC-derived PT-day window):
// 47 receipts scheduled, of which 15 carry a receivedStartTime; 5491 orders scheduled by
// totalCount, of which 1539 are SHIPPED.
export const facilityWideReceiptsCreated = 47;
export const facilityWideReceiptsReceived = 15;
export const facilityWideLoadsCreated = 5491;
export const facilityWideLoadsShipped = 1539;

// Door occupancy duration: available from task startTime where a task exists on
// the door, has actually started and has not already ended; unavailable for
// task-less doors and for NEW tasks with no startTime (WMS has no
// occupancy-start field).
// 14 of 23 doors carry no active task at this pull
// and 5 of the 15 active tasks have no open-ended duration basis (3 NEW tasks with no startTime
// plus the 2 stale tasks that already carry an endTime), so a duration exists for 10 tasks on 7 doors
// (DOCK54 RECEIVE 98h17m + RECEIVE 70h16m + LOAD 0h34m, DOCK55 RECEIVE 0h51m, DOCK52 RECEIVE 2h13m + LOAD 92h39m, DOCK51 RECEIVE 2h53m, DOCK50 RECEIVE 66h54m, DOCK57 RECEIVE 73h23m, DOCK67 RECEIVE 74h57m, all measured to the
// 11/23 11:35:47AM PT reference).
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, 11/23 11:35:47AM PT)
// 15 tasks total: 3 LOAD + 12 RECEIVE (9 GURUNANDA + 6 KARAKA, LLC). 2 are
// data anomalies (TASK-5090739, TASK-5426833).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// ARNULFO MUNGUIA has 122 CLOSED GURUNANDA load transactions with endTime inside
// the 2026-10-31 00:00:00 UTC - now window, 104 of them at Bay-4 doors:
// DOCK52 19, DOCK51 16, DOCK53 16, DOCK54 16, DOCK50 9, DOCK55 9, DOCK56 9, DOCK57 5, DOCK58 2, DOCK60 2, DOCK59 1;
// the other 18 are off Bay 4 (DOCK10 4, DOCK4 4, DOCK45 1, DOCK5 2, DOCK6 1, DOCK7 2, DOCK8 2, DOCK9 2); per-day counts by endTime (UTC date):
// 11/23 6, 11/20 6, 11/19 9, 11/18 9, 11/17 9, 11/16 7, 11/14 1, 11/13 7, 11/12 12, 11/11 4, 11/10 10, 11/09 6, 11/07 1, 11/06 7, 11/05 4, 11/04 12, 11/03 5, 11/02 7.
// The newest transaction is DOCK51 TASK-5426987 (closed 11/23 11:32:12a PT) - also the
// newest at a Bay-4 door.
// He currently holds 7 open Bay-4 tasks: DOCK50 TASK-5426910 (RECEIVE); DOCK51 TASK-5427835 (RECEIVE); DOCK52 TASK-5427874 (RECEIVE); DOCK52 TASK-5425811 (LOAD); DOCK54 TASK-5425183 (RECEIVE); DOCK54 TASK-5426702 (RECEIVE); DOCK57 TASK-5426441 (RECEIVE).
export const assignments: TaskRecord[] = [
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE ENDED 10/22 10:42:01a PT while status is IN_PROGRESS - STALE/anomaly, no open-ended duration asserted · TASK-5090739 · daira gonzalez (assigneeUserId 1948070158297014492) · IN_PROGRESS · DOCK · task created 10/20 10:38:05p PT · started 10/21 1:21:14p PT · checked in 10/22 10:41:46a PT · updated 10/22 3:25:42p PT · 1 receipt: RN-5002143 at status CLOSED · PO EGSU8032696 · container EGSU8032696 · reference EGLV149507056809 · appointment 10/20 10:00:00a PT · receivedStart none · entry ET-1027622 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK50",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5426910",
    dns: "RECEIVE",
    customer: "KARAKA, LLC",
    pieces: "RECEIVE 66h54m since 11/20 4:40:57p PT · TASK-5426910 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/20 2:43:28p PT · started 11/20 4:40:57p PT · checked in 11/20 4:40:59p PT · updated 11/20 4:41:49p PT · 1 receipt: RN-195393 at status IN_PROGRESS · PO POBOK0512 · container UNKNOWN - LCL · reference SPR44475617 · appointment 11/17 10:00:00a PT · receivedStart 11/20 4:40:57p PT · entry ET-1184618 · customer ORG-585450 (KARAKA, LLC) · door DOCK50",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5427835",
    dns: "RECEIVE",
    customer: "KARAKA, LLC",
    pieces: "RECEIVE 2h53m since 11/23 8:42:10a PT · TASK-5427835 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/23 8:12:48a PT · started 11/23 8:42:10a PT · checked in 11/23 8:42:12a PT · updated 11/23 8:44:17a PT · 1 receipt: RN-195022 at status IN_PROGRESS · PO POKRK3100 · container CSGU6627792 · reference M26_NB37 · appointment 11/23 9:00:00a PT · receivedStart 11/23 8:42:10a PT · entry ET-1184864 · task note \"DOCK 51   ET-1184864\" · customer ORG-585450 (KARAKA, LLC) · door DOCK51",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5427874",
    dns: "RECEIVE",
    customer: "KARAKA, LLC",
    pieces: "RECEIVE 2h13m since 11/23 9:22:37a PT · TASK-5427874 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/23 8:48:29a PT · started 11/23 9:22:37a PT · checked in 11/23 9:23:27a PT · updated 11/23 9:24:34a PT · 1 receipt: RN-195903 at status IN_PROGRESS · PO POBOK0605 · container UNKNOWN - LCL · reference 24765041 · appointment 11/23 9:00:00a PT · receivedStart 11/23 9:22:37a PT · entry ET-1184881 · task note \"DOCK 52   ET-1184881\" · customer ORG-585450 (KARAKA, LLC) · door DOCK52",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5428115",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE not started · TASK-5428115 · A1SG (assigneeUserId 1910160202361942018) · NEW · DOCK · task created 11/23 11:31:48a PT · started no startTime · not checked in at dock · updated 11/23 11:31:48a PT · 1 receipt: RN-195920 at status IMPORTED · PO PO8331-1 · container TQL11192026 · reference TQL · appointment 11/20 11:00:00a PT · receivedStart none · entry ET-1184993 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK52",
    assignee: "A1SG",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5425811",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "LOAD 92h39m since 11/19 2:56:29p PT · TASK-5425811 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/19 2:39:50p PT · started 11/19 2:56:29p PT · checked in 11/19 2:56:52p PT · updated 11/20 11:45:43a PT · seal 1378810 · 1 load: LOAD-5044981 (50101956, DN-3472288) at status LOADED · entry ET-1184121 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK52",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5425183",
    dns: "RECEIVE",
    customer: "KARAKA, LLC",
    pieces: "RECEIVE 98h17m since 11/19 9:18:25a PT · TASK-5425183 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/19 9:09:19a PT · started 11/19 9:18:25a PT · checked in 11/19 9:18:27a PT · updated 11/19 9:18:27a PT · 2 receipts: RN-194358 at status IN_PROGRESS · PO POILO2103 · container HOUU9907931 · reference M26_SHA45 · appointment 11/19 9:00:00a PT · receivedStart 11/19 9:18:25a PT; RN-194359 at status IN_PROGRESS · PO POKRK3028 · container HOUU9907931 · reference M26_SHA45 · appointment 11/19 9:00:00a PT · receivedStart 11/19 9:18:25a PT · entry ET-1183546 · customer ORG-585450 (KARAKA, LLC) · door DOCK54",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5426702",
    dns: "RECEIVE",
    customer: "KARAKA, LLC",
    pieces: "RECEIVE 70h16m since 11/20 1:19:04p PT · TASK-5426702 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/20 12:04:46p PT · started 11/20 1:19:04p PT · checked in 11/20 1:19:13p PT · updated 11/20 1:32:15p PT · 2 receipts: RN-195735 at status IN_PROGRESS · PO POBOK0573_ship_1 · container UNKNOWN - LCL · reference 24734515 · appointment 11/20 2:00:00p PT · receivedStart 11/20 1:19:04p PT; RN-195733 at status IN_PROGRESS · PO POBOK0444 · container UNKNOWN - LCL · reference 24734515 · appointment 11/20 2:00:00p PT · receivedStart 11/20 1:19:04p PT · entry ET-1184507 · customer ORG-585450 (KARAKA, LLC) · door DOCK54",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5428051",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "LOAD 0h34m since 11/23 11:01:04a PT · TASK-5428051 · DANIEL BELTRAN (assigneeUserId 1932077596691410945) · IN_PROGRESS · PRE_LOAD · task created 11/23 11:00:30a PT · started 11/23 11:01:04a PT · checked in 11/23 11:01:11a PT · updated 11/23 11:01:12a PT · 4 loads: LOAD-5045193 (50102168, DN-3477823) at status LOADING; LOAD-5045191 (50102164, DN-3477993) at status LOADED; LOAD-5045190 (50102162, DN-3477994) at status LOADED; LOAD-5045189 (50102160, DN-3478017) at status LOADING · entry ET-1184975 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK54",
    assignee: "DANIEL BELTRAN",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5426833",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE ENDED 11/23 10:32:11a PT while status is IN_PROGRESS - STALE/anomaly, no open-ended duration asserted · TASK-5426833 · CANDY MENDEZ (assigneeUserId 10200) · IN_PROGRESS · DOCK · task created 11/20 1:30:45p PT · started 11/23 9:31:33a PT · checked in 11/23 9:31:36a PT · updated 11/23 10:38:41a PT · 1 receipt: RN-195922 at status IN_PROGRESS · PO FUS11192026UNIS-107 · container none · reference 1185149-1 · appointment 11/20 8:00:00a PT · receivedStart 11/23 9:31:33a PT · entry ET-1184562 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK55",
    assignee: "CANDY MENDEZ",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5425381",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE 0h51m since 11/23 10:44:15a PT · TASK-5425381 · Fatima Ponce (assigneeUserId 2053885581368619009) · IN_PROGRESS · DOCK · task created 11/19 10:41:33a PT · started 11/23 10:44:15a PT · not checked in at dock · updated 11/23 10:44:15a PT · 1 receipt: RN-5011671 at status IN_PROGRESS · PO PO9466 · container Leafchem11192026 · reference none · appointment 11/19 10:00:00a PT · receivedStart 11/23 10:44:15a PT · entry ET-1183963 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK55",
    assignee: "Fatima Ponce",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5426441",
    dns: "RECEIVE",
    customer: "KARAKA, LLC",
    pieces: "RECEIVE 73h23m since 11/20 10:11:49a PT · TASK-5426441 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/20 10:06:52a PT · started 11/20 10:11:49a PT · checked in 11/20 10:11:51a PT · updated 11/20 10:14:50a PT · 1 receipt: RN-194652 at status IN_PROGRESS · PO POILO2101_ship_1 · container TXGU7467952 · reference Diana_LCL_YT91 · appointment 11/20 10:00:00a PT · receivedStart 11/20 10:11:49a PT · entry ET-1183830 · task note \"DOCK   57   ET-1183830\" · customer ORG-585450 (KARAKA, LLC) · door DOCK57",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK57",
  },
  {
    taskId: "TASK-5428022",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "LOAD not started · TASK-5428022 · CANDY MENDEZ (assigneeUserId 1932077636141408257) · NEW · LIVE_LOAD · task created 11/23 10:43:18a PT · started no startTime · not checked in at dock · updated 11/23 10:43:18a PT · 1 load: LOAD-5045164 (PO671734 UNIS BOL, DN-3474635) at status WINDOW_CHECKIN_DONE · entry ET-1184953 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK59",
    assignee: "CANDY MENDEZ",
    door: "DOCK59",
  },
  {
    taskId: "TASK-5426207",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE 74h57m since 11/20 8:38:40a PT · TASK-5426207 · jorge franco (assigneeUserId 1948070158297014498) · IN_PROGRESS · DOCK · task created 11/20 8:32:20a PT · started 11/20 8:38:40a PT · checked in 11/20 8:39:31a PT · updated 11/20 8:39:31a PT · 1 receipt: RN-5011708 at status IN_PROGRESS · PO 9493 · container CORRU112026UNIS · reference none · appointment 11/20 10:00:00a PT · receivedStart 11/20 8:38:40a PT · entry ET-1184314 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK67",
    assignee: "jorge franco",
    door: "DOCK67",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE not started · TASK-5381972 · Jorge Antonio Franco (assigneeUserId 2060441422549078018) · NEW · DOCK · task created 09/30 10:46:50a PT · started no startTime · not checked in at dock · updated 09/30 10:48:35a PT · 1 receipt: RN-5010583 at status IMPORTED · PO PO9139-2 · container Jpack09242026 · reference none · appointment none · receivedStart none · entry ET-1162686 · task note \"DOCK   69 ET-1162686\" · customer ORG-655875 (GURUNANDA, LLC) · door DOCK69",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
];
