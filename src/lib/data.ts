/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 11/27 3:41:57p PT (live WISE / WMS-BAM APIs)
 *   Reference 2026-11-27T23:41:57+00:00 = 11/27 3:41:57p PT.
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
 *   Evidence at this pull: DOCK51 TASK-5430698 startTime 2026-11-25T23:17:42 =
 *   11/25 3:17:42p PT; DOCK64 TASK-5431033 startTime 2026-11-26T01:52:58 =
 *   11/25 5:52:58p PT; DOCK54 TASK-5432096 startTime 2026-11-27T21:45:39 =
 *   11/27 1:45:39p PT.
 *   QUERY MODE - this pull used the raw-UTC mode (no item-time-zone header), the
 *   same mode as every prior snapshot, so windows stay comparable pull to pull.
 *   Durations are measured to the 11/27 3:41:57p PT pull reference.
 *
 *   SOURCES USED AT THIS PULL:
 *     - POST /wms-bam/wms-location/search, body {exactlyNames:[DOCK50..DOCK72]}
 *       -> code 0, 23/23 rows (category DOCK, type DOCK, status USABLE on all 23,
 *       dockStatus, spaceStatus, occupiedCustomerIds, entryId, updatedTime).
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer filter)
 *       -> totalCount 67, all read; 4 of them sit on a Bay-4 dockName.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer filter)
 *       -> totalCount 71, all read; 5 of them sit on a Bay-4 dockName.
 *     - POST /wms-bam/inbound/receipt/search-by-paging
 *       {customerId: ORG-655875, appointmentTimeFrom "2026-11-27 08:00:00",
 *       appointmentTimeTo "2026-11-28 07:59:59"} -> totalCount 0, 0 rows read.
 *       Cross-checked with customerIds [ORG-655875] -> same 0.
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, scheduleDatePeriod ["2026-11-27 08:00:00",
 *       "2026-11-28 07:59:59"]} -> totalCount 19, 19 rows read
 *       (cross-checked with customerIds [ORG-655875] -> same 19).
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], endTimeFrom "2026-10-31 00:00:00"
 *       -> totalCount 1230, all 1230 read. Per-door "last load task
 *       to close here" is read from this set. The ARNULFO MUNGUIA / GURUNANDA subset is
 *       measured on the same set (customerId ORG-655875 + assigneeUserId in [89,
 *       1948070158297014318]) -> 139 transactions, 121 of them at Bay-4 doors.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], endTimePeriod ["2026-10-01 00:00:00", now]
 *       -> totalCount 2067, all 2067 read, which contains every per-door
 *       "last receive task to close here" value below. NOTE: this endpoint rejects
 *       `sortingFields` (HTTP 400 "Invalid format: Request body format error") and
 *       ignores `endTimeFrom` (it returns the full set either way), so the
 *       window above is `endTimePeriod`, which IS applied.
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, status: PLANNED} -> totalCount 190.
 *     - POST /wms-bam/yard/equipment/search {statuses: ["FULL"]} -> 1096 unique
 *       equipment rows; GURUNANDA TRAILER / equipmentStatus FULL = 19.
 *       That KPI still renders live from the WMS loader; the static array below stays empty.
 *     - Task-name keyword RE-TESTED at this pull: the load-task `keyword` filter is
 *       STILL A NO-OP. "Guru live out / in assign to Arnulfo", a nonsense string
 *       ("zzzz-no-such-task-zzzz") and no filter at all all returned the identical
 *       facility total, 23184 / 23184 / 23184. No plan or task group named "Guru live out / in
 *       assign to Arnulfo" can be resolved through keyword search, and all
 *       9 active Bay-4 tasks carry projectId null, so there is no named task group to
 *       resolve. The "Guru live out / in assign to Arnulfo" stream is therefore reported as
 *       ARNULFO MUNGUIA's task-assignment transactions on the GURUNANDA live-out/live-in work,
 *       and nothing is invented.
 *
 *   SCOPE NOTE:
 *     The line-level metrics on this dashboard are GURUNANDA-scoped (the customer scope
 *     this dashboard has always published). At this pull 9 active tasks sit on Bay-4 doors
 *     across all customers (5 RECEIVE / 4 LOAD) while the GURUNANDA scope reads 7
 *     (3 RECEIVE / 4 LOAD). The extra 2 are non-GURUNANDA receive tasks:
 *     ORG-585450 DOCK57 TASK-5431923 IN_PROGRESS (DANIEL BELTRAN) and
 *     ORG-585450 DOCK65 TASK-5429183 IN_PROGRESS (julian rios).
 *     bay4AllCustomerActiveTaskCount / ...ReceiveCount / ...LoadCount export the physical
 *     numbers so the divergence stays explicit. Door status itself is physical (a door is
 *     occupied no matter which customer is on it).
 *
 *   Key state at this pull:
 *     - DOOR STATUS: occupied 20, reserved 1, available 2 (20+1+2 = 23). Fully free doors: DOCK62, DOCK67.
 *       Raw dockStatus: OCCUPIED 19, RESERVED 1, AVAILABLE 3. Raw
 *       spaceStatus: OCCUPIED 10, EMPTY 13. Reserved door: DOCK56 (dockStatus RESERVED).
 *       1 door reads dock AVAILABLE but space OCCUPIED (DOCK57), so it is counted as Occupied and 20 of 23 are not fully free.
 *     - ACTIVE TASKS: 9 tasks across all customers - 5 RECEIVE / 4 LOAD - at 9 distinct doors
 *       (DOCK50, DOCK51, DOCK52, DOCK53, DOCK54, DOCK57, DOCK64, DOCK65, DOCK69). GURUNANDA-scoped: 7 tasks
 *       (3 RECEIVE / 4 LOAD) at 7 doors.
 *     - ASSIGNMENTS BY ASSIGNEE (GURUNANDA, the dashboard cards):
 *       ARNULFO MUNGUIA 2
 *       DANIEL BELTRAN 1
 *       DANIELA GONZALEZ 1
 *       EDUARDO MEJIA 1
 *       Jorge Antonio Franco 1
 *       daira gonzalez 1
 *      = 7.
 *       Names are reproduced exactly as WISE returns them in assigneeUserName; every count is
 *       a distinct assigneeUserId value and no two assignees are merged.
 *     - ANOMALIES: 1. DOCK50 TASK-5090739 - the task carries an endTime (10/22 9:42:01a PT) while its
 *       status is still IN_PROGRESS (stale open task), so it is flagged rather than given an
 *       open-ended duration.
 *     - Task "Guru live out / in assign to Arnulfo": 139 CLOSED GURUNANDA load transactions with endTime
 *       from 2026-10-31 00:00:00 UTC, 121 at Bay-4 doors, 18 off Bay 4
 *       (DOCK10 4, DOCK4 4, DOCK9 2, DOCK8 2, DOCK7 2, DOCK5 2, DOCK6 1, DOCK45 1).
 *       Bay-4 breakdown: DOCK52 23, DOCK54 20, DOCK53 18, DOCK51 18, DOCK50 11, DOCK55 10, DOCK56 9, DOCK57 6, DOCK58 2, DOCK60 2, DOCK69 1, DOCK59 1.
 *       Per-day counts by endTime (UTC date): 11/02 7, 11/03 5, 11/04 12, 11/05 2, 11/06 5, 11/07 1, 11/09 6, 11/10 9, 11/11 4, 11/12 10, 11/13 7, 11/14 1, 11/16 4, 11/17 5, 11/18 6, 11/19 8, 11/20 6, 11/23 7, 11/24 10, 11/25 6.
 *       Newest transaction: DOCK54 TASK-5430590, started 11/25 12:13:06p PT,
 *       closed 11/25 2:20:30p PT, 2 loads, seal 25010920.
 *       He currently holds 2 open Bay-4 tasks (DOCK53 TASK-5430988 IN_PROGRESS, DOCK51 TASK-5430698 IN_PROGRESS).
 *     - % scheduled inbounds received (11/27 PT): 0 of 0. NO GURUNANDA receipt carries an
 *       appointmentTime inside the 11/27 PT day (totalCount 0), so the denominator is zero and the metric is
 *       NOT COMPUTABLE rather than 0%. The facility-wide read for the same window returns
 *       27 receipts (5 of them already received) and none of them belongs to ORG-655875,
 *       so the zero is a real customer-scope result and not a filter artifact.
 *       Cross-check on the neighbouring days: 0 receipts scheduled for 11/26 PT,
 *       0 for 11/28 PT.
 *     - % scheduled outbounds loaded (11/27 PT): 3 of 19 (15.8%, SHIPPED proxy). 19 GURUNANDA orders carry a
 *       scheduleDate inside the 11/27 PT day: PLANNED 13, SHIPPED 3, PICKED 2, COMMIT_FAILED 1.
 *       The prior-day check: 1 order for 11/26 PT, 0 for 11/28 PT.
 *     - Inbound/outbound mix: 3 RECEIVE / 4 LOAD of 7 active GURUNANDA tasks
 *       (5 RECEIVE / 4 LOAD of 9 physical tasks across all customers).
 *     - Total doors occupied: 20 of 23 (plus 1 reserved, 2 available).
 *     - Planned GURUNANDA orders: live count 190 at this pull.
 *     - Door occupancy duration: available where an active task has a startTime and has not
 *       ended - 7 tasks at this pull (DOCK51 48h24m, DOCK52 48h04m, DOCK53 45h13m, DOCK54 1h56m, DOCK57 5h29m, DOCK64 45h48m, DOCK65 57h21m), all measured to the
 *       11/27 3:41:57p PT reference. WMS has no occupancy-start field for task-less doors
 *       (14 of 23) or for the 1 NEW Bay-4 task with no startTime, so no duration is
 *       asserted for those.
 *     - Facility-wide schedule context for the 11/27 PT day (no customerId filter, same
 *       window): receipts scheduled 27 (5 with a receivedStartTime); orders scheduled
 *       3095, of which 859 are SHIPPED (status tally read at 3:44p PT).
 *
 *   NOTE: the in-yard FULL equipment array and the all-time assignee baseline are outside
 *   the scope of this request and were NOT re-stated from WISE into this file; the array
 *   renders live from the WMS loader (live value at this pull: 19 GURUNANDA FULL trailers), and the
 *   all-time baseline is carried forward unchanged rather than estimated.
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
// it succeeds. Live totalCount was 190 at the 11/27 3:41:57p PT pull.
export const plannedGurunandaOrderCount = 190;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/27 3:41:57p PT
//
// All 23 rows come from one /wms-bam/wms-location/search call
// (exactlyNames DOCK50..DOCK72); every row is category DOCK, type DOCK,
// status USABLE. Door status rule (unchanged, keeps the dashboard's 3-value
// enum):
//   Reserved  = dockStatus RESERVED (door is held/reserved, so it is not free)
//   Occupied  = dockStatus OCCUPIED OR spaceStatus OCCUPIED (not fully free)
//   Available = dockStatus AVAILABLE AND spaceStatus EMPTY
// Raw field values are preserved per door so the mapping can be re-checked.
// Totals: Occupied 20, Reserved 1, Available 2 = 23.
// 1 door reads RESERVED at this pull (DOCK56).
// 1 door is dock AVAILABLE but still carries space OCCUPIED (DOCK57), so it counts as Occupied.
// Fully free doors: DOCK62, DOCK67.
// Raw tallies at this pull: dockStatus OCCUPIED 19 / RESERVED 1 / AVAILABLE 3;
// spaceStatus OCCUPIED 10 / EMPTY 13.
//
// BAY 4 ALL-CUSTOMER PHYSICAL TALLY (see SCOPE NOTE in the file header):
// active (NEW / IN_PROGRESS / EXCEPTION) tasks whose dockName is one of these
// 23 doors = 9 (RECEIVE 5, LOAD 4) on 9 doors. 2 of the receive tasks
// belong to KARAKA, LLC (ORG-585450) at DOCK57 and DOCK65, so the
// GURUNANDA-only tally is 7 (RECEIVE 3, LOAD 4) on 7 doors.
// =====================================================================
export const bay4AllCustomerActiveTaskCount = 9;
export const bay4AllCustomerActiveReceiveCount = 5;
export const bay4AllCustomerActiveLoadCount = 4;

export const doors: DoorRecord[] = [
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "daira gonzalez (RECEIVE IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5090739"],
    duration: "On this door: RECEIVE ENDED 10/22 10:42:01a PT while status is IN_PROGRESS - STALE/anomaly, no open-ended duration asserted · TASK-5090739 · daira gonzalez (assigneeUserId 1948070158297014492) · IN_PROGRESS · DOCK · task created 10/20 10:38:05p PT · started 10/21 1:21:14p PT · checked in 10/22 10:41:46a PT · updated 10/22 3:25:42p PT · 1 receipt: RN-5002143 at status CLOSED · PO EGSU8032696 · container EGSU8032696 · reference EGLV149507056809 · appointment 10/20 10:00:00a PT · receivedStart none · entry ET-1027622 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK50 · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1185958 · row updated 11/25 9:00:42p PT · last load task to close here: 11/25 8:42:36a PT TASK-5429651 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED) · last receive task to close here: 11/25 12:25:48p PT TASK-5426910 (Nanci Viviana Rosas, customer ORG-585450, CLOSED)",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5430698"],
    duration: "On this door: LOAD 48h24m since 11/25 3:17:42p PT · TASK-5430698 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/25 11:40:37a PT · started 11/25 3:17:42p PT · checked in 11/25 3:17:47p PT · updated 11/25 4:24:10p PT · 9 loads: LOAD-5045462 (DN-3493773, DN-3493773) at status LOADED; LOAD-5045460 (DN-3494271, DN-3494271) at status LOADED; LOAD-5045390 (50102329, DN-3488905) at status LOADED; LOAD-5045385 (50102318, DN-3489440) at status LOADED; LOAD-5045384 (50102316, DN-3489457) at status LOADED; LOAD-5045382 (50102312, DN-3491599) at status LOADED; LOAD-5045379 (50102306, DN-3493377) at status LOADED; LOAD-5045297 (50102231, DN-3488764) at status LOADED; LOAD-5045183 (50102146, DN-3478329) at status LOADED · entry ET-1185940 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK51 · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1185940 · row updated 11/25 9:00:30p PT · last load task to close here: 11/24 9:39:28a PT TASK-5428182 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED) · last receive task to close here: 11/23 4:13:23p PT TASK-5427835 (ARNULFO MUNGUIA, customer ORG-585450, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "EDUARDO MEJIA (LOAD IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5430997"],
    duration: "On this door: LOAD 48h04m since 11/25 3:37:04p PT · TASK-5430997 · EDUARDO MEJIA (assigneeUserId 2029638366082560001) · IN_PROGRESS · PRE_LOAD · task created 11/25 3:09:54p PT · started 11/25 3:37:04p PT · checked in 11/25 3:37:06p PT · updated 11/25 10:59:16p PT · 2 loads: LOAD-5045380 (50102308, DN-3492351) at status LOADED; LOAD-5045381 (50102310, DN-3492347) at status LOADED · seal 1304686 · entry ET-1186054 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK52 · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1186054 · row updated 11/25 10:22:11p PT · last load task to close here: 11/25 10:33:40a PT TASK-5429652 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED) · last receive task to close here: 11/23 2:30:59p PT TASK-5428115 (Fatima Ponce, customer ORG-655875, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5430988"],
    duration: "On this door: LOAD 45h13m since 11/25 6:28:56p PT · TASK-5430988 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/25 3:02:42p PT · started 11/25 6:28:56p PT · checked in 11/25 6:29:03p PT · updated 11/27 2:28:28p PT · 2 loads: LOAD-5045383 (50102314, DN-3489634) at status LOADING; LOAD-5045386 (50102320, DN-3489185) at status LOADING · entry ET-1186051 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK53 · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1186051 · row updated 11/25 9:00:04p PT · last load task to close here: 11/25 12:30:43p PT TASK-5430599 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED) · last receive task to close here: 11/25 12:13:04p PT TASK-5429706 (Nanci Viviana Rosas, customer ORG-585450, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "DANIEL BELTRAN (LOAD IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5432096"],
    duration: "On this door: LOAD 1h56m since 11/27 1:45:39p PT · TASK-5432096 · DANIEL BELTRAN (assigneeUserId 1932077596691410945) · IN_PROGRESS · PRE_LOAD · task created 11/27 12:29:48p PT · started 11/27 1:45:39p PT · checked in 11/27 1:45:52p PT · updated 11/27 2:22:32p PT · 5 loads: LOAD-5045564 (DN-3496631, DN-3496631) at status LOADED; LOAD-5045565 (DN-3496259, DN-3496259) at status LOADED; LOAD-5045560 (DN-3496899, DN-3496899) at status LOADED; LOAD-5045562 (DN-3496692, DN-3496692) at status LOADED; LOAD-5045199 (DN-3478677, DN-3478677) at status LOADED · seal 1304611 · entry ET-1186329 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK54 · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1186329 · row updated 11/27 1:45:53p PT · last load task to close here: 11/25 2:20:30p PT TASK-5430590 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED) · last receive task to close here: 11/25 3:19:21p PT TASK-5426702 (Nanci Viviana Rosas, customer ORG-585450, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1185991 · row updated 11/25 8:59:42p PT · last load task to close here: 11/25 1:55:07p PT TASK-5430880 (DANIEL BELTRAN, customer ORG-655875, CLOSED) · last receive task to close here: 11/23 12:23:46p PT TASK-5425381 (Fatima Ponce, customer ORG-655875, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space OCCUPIED, occupiedCustomerIds none, entry ET-1186234 · row updated 11/27 9:18:46a PT · last load task to close here: 11/25 2:16:30p PT TASK-5430775 (DANIEL BELTRAN, customer ORG-655875, CLOSED) · last receive task to close here: 11/24 9:20:22a PT TASK-5428317 (Fatima Ponce, customer ORG-655875, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: "DANIEL BELTRAN (RECEIVE IN_PROGRESS)",
    customer: "KARAKA, LLC",
    taskIds: ["TASK-5431923"],
    duration: "On this door: RECEIVE 5h29m since 11/27 10:12:26a PT · TASK-5431923 · DANIEL BELTRAN (assigneeUserId 1932077596691410945) · IN_PROGRESS · DOCK · task created 11/27 10:01:55a PT · started 11/27 10:12:26a PT · checked in 11/27 10:12:37a PT · updated 11/27 10:12:37a PT · 1 receipt: RN-196110 at status IN_PROGRESS · PO POBOK0567 · container UNKNOWN - LCL · reference 24804859 · appointment 11/27 8:00:00a PT · receivedStart 11/27 10:12:26a PT · entry ET-1186258 · customer ORG-585450 (KARAKA, LLC) · door DOCK57 · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1186258 · row updated 11/27 11:28:36a PT · last load task to close here: 11/27 9:53:03a PT TASK-5431717 (DANIEL BELTRAN, customer ORG-655875, CLOSED) · last receive task to close here: 11/23 4:39:59p PT TASK-5428293 (DANIELA GONZALEZ, customer ORG-655875, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1186234 · row updated 11/27 2:01:24p PT · last load task to close here: 11/27 11:12:27a PT TASK-5431840 (DANIEL BELTRAN, customer ORG-655875, CLOSED) · last receive task to close here: 11/20 12:18:57p PT TASK-5425943 (CANDY MENDEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1184953 · row updated 11/25 8:59:24p PT · last load task to close here: 11/16 3:17:16p PT TASK-5422412 (DANIEL BELTRAN, customer ORG-655875, CLOSED) · last receive task to close here: 11/20 8:09:54a PT TASK-5424859 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1185367 · row updated 11/27 7:42:37a PT · last load task to close here: 11/24 10:06:15a PT TASK-5429135 (DANIEL BELTRAN, customer ORG-655875, CLOSED) · last receive task to close here: 10/23 6:21:53p PT TASK-5402543 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1186112 · row updated 11/27 8:05:04a PT · last load task to close here: 11/13 10:56:09a PT TASK-5420400 (BARTOLO RAMIREZ, customer ORG-655875, CLOSED) · last receive task to close here: 11/27 6:43:41a PT TASK-5431126 (Astrid Aguilar, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1185668 · row updated 11/25 9:56:01a PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/25 8:44:36a PT TASK-5429914 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1184657 · row updated 11/25 8:59:03p PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/23 10:31:29a PT TASK-5427009 (Fatima Ponce, customer ORG-655875, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5431033"],
    duration: "On this door: RECEIVE 45h48m since 11/25 5:52:58p PT · TASK-5431033 · DANIELA GONZALEZ (assigneeUserId 11769) · IN_PROGRESS · DOCK · task created 11/25 4:03:22p PT · started 11/25 5:52:58p PT · checked in 11/25 7:21:12p PT · updated 11/25 7:21:12p PT · 1 receipt: RN-5011741 at status IN_PROGRESS · PO OOCU5361162 · container OOCU5361162 · reference B00420376 · appointment 11/25 4:00:00p PT · receivedStart 11/25 5:52:58p PT · entry ET-1186078 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK64 · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1186078 · row updated 11/25 8:58:53p PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/24 9:21:52p PT TASK-5429826 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: "julian rios (RECEIVE IN_PROGRESS)",
    customer: "KARAKA, LLC",
    taskIds: ["TASK-5429183"],
    duration: "On this door: RECEIVE 57h21m since 11/25 6:20:56a PT · TASK-5429183 · julian rios (assigneeUserId 1988318610789830658) · IN_PROGRESS · DOCK · task created 11/24 9:36:39a PT · started 11/25 6:20:56a PT · checked in 11/25 8:29:41a PT · updated 11/25 11:28:21p PT · 2 receipts: RN-195876 at status IN_PROGRESS · PO POBOK0559.unis · container UNKNOWN - LCL · reference 24761549 · appointment 11/23 8:00:00a PT · receivedStart 11/25 6:20:56a PT; RN-195671 at status IN_PROGRESS · PO POBOK0347_unis2 · container UNKNOWN - LCL · reference SPR44841575 · appointment 11/24 10:00:00a PT · receivedStart 11/25 6:20:56a PT · entry ET-1185386 · customer ORG-585450 (KARAKA, LLC) · door DOCK65 · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1185386 · row updated 11/25 8:58:44p PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/10 11:38:02a PT TASK-5413519 (Nanci Viviana Rosas, customer ORG-585450, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1184169 · row updated 11/25 8:58:31p PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/23 9:50:02a PT TASK-5425867 (CANDY MENDEZ, customer ORG-655875, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1185393 · row updated 11/27 4:01:54a PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/24 10:26:12a PT TASK-5429207 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1184494 · row updated 11/24 8:53:51p PT · last load task to close here: 11/20 12:57:47p PT TASK-5426700 (DANIEL BELTRAN, customer ORG-655875, CLOSED) · last receive task to close here: 11/2 3:06:46p PT TASK-5408610 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "On this door: RECEIVE not started · TASK-5381972 · Jorge Antonio Franco (assigneeUserId 2060441422549078018) · NEW · DOCK · task created 09/30 10:46:50a PT · started no startTime · not checked in at dock · updated 09/30 10:48:35a PT · 1 receipt: RN-5010583 at status IMPORTED · PO PO9139-2 · container Jpack09242026 · reference none · appointment none · receivedStart none · entry ET-1162686 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK69 · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1185525 · row updated 11/25 8:58:05p PT · last load task to close here: 11/24 3:02:10p PT TASK-5429574 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED) · last receive task to close here: 11/17 7:25:08p PT TASK-5423772 (JESUS ESPINOZA, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1172826 · row updated 11/25 8:57:56p PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 10/21 8:42:23a PT TASK-5399423 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1182729 · row updated 11/25 8:57:48p PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/17 12:58:36p PT TASK-5422515 (CANDY MENDEZ, customer ORG-655875, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1185321 · row updated 11/25 8:57:29p PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/24 11:49:53a PT TASK-5429045 (CANDY MENDEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 20
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 1
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 9
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 1
const available = doors.filter((d) => d.status === "Available").length; // 2

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors Occupied",
    value: "20/23",
    numerator: 20,
    denominator: 23,
    percentage: 87,
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
    value: "2",
    numerator: 2,
    denominator: 23,
    percentage: 9,
  },
  {
    label: "Anomalies",
    value: "1",
    numerator: 1,
    denominator: 23,
    percentage: 4,
  },
];

// Door that carried dockStatus RESERVED at this pull: 1 (DOCK56). A
// reserved door is held rather than free, so 20 read Occupied and 20 of 23 are not fully free.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee - GURUNANDA scope (the dashboard cards).
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, 11/27 3:41:57p PT).
// 7 active-status GURUNANDA tasks at Bay-4 doors: 4 LOAD + 3 RECEIVE, at 7 distinct doors
// (DOCK50, DOCK51, DOCK52, DOCK53, DOCK54, DOCK64, DOCK69).
//       ARNULFO MUNGUIA (2): assigneeUserId 89
//       DANIEL BELTRAN (1): assigneeUserId 1932077596691410945
//       DANIELA GONZALEZ (1): assigneeUserId 11769
//       EDUARDO MEJIA (1): assigneeUserId 2029638366082560001
//       Jorge Antonio Franco (1): assigneeUserId 2060441422549078018
//       daira gonzalez (1): assigneeUserId 1948070158297014492
// All names/ids are resolved verbatim from the WMS task payloads
// (assigneeUserName / assigneeUserId); no name was normalised or guessed.
// Adding the 2 non-GURUNANDA receive tasks would make the total 9
// (see bay4AllCustomerActiveTaskCount) - both are KARAKA, LLC receive tasks.
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 2 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "DANIELA GONZALEZ", taskCount: 1 },
  { name: "EDUARDO MEJIA", taskCount: 1 },
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

// Mix: 3 RECEIVE + 4 LOAD = 7 active Bay-4 GURUNANDA tasks. The physical
// all-customer mix is 5 RECEIVE + 4 LOAD = 9 (the 2 extra receive tasks are
// KARAKA, LLC at DOCK57 and DOCK65).
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 3, total: 7 },
  { label: "Outbound (LOAD)", count: 4, total: 7 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 7 },
  { label: "Inbound", count: 3, total: 7 },
];

// --- Schedule Data (11/27 3:41:57p PT) ---
// Both percentages use the SAME UTC-derived 11/27 PT business-day window,
// 2026-11-27 08:00:00 -> 2026-11-28 07:59:59 (see TIMESTAMP SEMANTICS in the
// file header; this window is the only one used anywhere in this file):
//   % scheduled inbounds received TODAY: 0 GURUNANDA receipts carry an appointmentTime
//   inside that window (totalCount 0), so the denominator is zero and the card renders
//   NOT COMPUTABLE rather than 0%. The facility-wide read for the same window returns
//   27 receipts (5 already received) and none of them belongs to ORG-655875,
//   so the zero is a real customer-scope result.
//   Cross-checked on the neighbouring days: 0 receipts for the 11/26 PT day,
//   0 for the 11/28 PT day.
//   % scheduled outbounds loaded TODAY: 19 GURUNANDA orders carry a scheduleDate
//   inside that window (scheduleDatePeriod ["2026-11-27 08:00:00", "2026-11-28 07:59:59"],
//   totalCount 19, 19 rows read) and 3 are SHIPPED = 3 of 19 = 15.8%.
//   Status mix in that window: PLANNED 13, SHIPPED 3, PICKED 2, COMMIT_FAILED 1.
//   SHIPPED is the "loaded" proxy defined by the prior refreshes; it is kept for
//   comparability. The SHIPPED orders are SO125185, SO125151, SO125147.
//   Cross-checked on the neighbouring days: 1 order for the 11/26 PT day,
//   0 for the 11/28 PT day.
export const scheduleAvailable = false;               // 0 GURUNANDA receipts scheduled on 11/27 - denominator is zero
export const outboundScheduleAvailable = true;        // 19 GURUNANDA order(s) scheduled on 11/27 - denominator non-zero
export const scheduledInboundOrders = 0;            // receipts with appointmentTime in the 11/27 PT day
export const scheduledOutboundOrders = 19;           // orders with scheduleDate in the 11/27 PT day
export const scheduledInboundReceived = 0;            // receipts in that window carrying a receivedStartTime
export const scheduledOutboundLoaded = 3;           // orders in that window at status SHIPPED
export const pctScheduledInboundReceived = 0.0;       // 0 of 0 - not computable (no receipt scheduled)
export const pctScheduledOutboundLoaded = 15.8;        // 3 of 19 (SHIPPED proxy)
// Facility-wide schedule context for the 11/27 PT day, all customers (same two
// endpoints, no customerId filter, same UTC-derived PT-day window):
// 27 receipts scheduled, of which 5 carry a receivedStartTime; 3095 orders scheduled by
// totalCount, of which 859 are SHIPPED.
export const facilityWideReceiptsCreated = 27;
export const facilityWideReceiptsReceived = 5;
export const facilityWideLoadsCreated = 3095;
export const facilityWideLoadsShipped = 859;

// Door occupancy duration: available from task startTime where a task exists on
// the door, has actually started and has not already ended; unavailable for
// task-less doors and for NEW tasks with no startTime (WMS has no
// occupancy-start field).
// 14 of 23 doors carry no active task at this pull
// and 2 of the 9 active tasks have no open-ended duration basis (1 NEW task with no startTime
// plus the 1 stale task that already carries an endTime), so a duration exists for 7 tasks on 7 doors
// (DOCK51 48h24m, DOCK52 48h04m, DOCK53 45h13m, DOCK54 1h56m, DOCK57 5h29m, DOCK64 45h48m, DOCK65 57h21m, all measured to the
// 11/27 3:41:57p PT reference).
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, 11/27 3:41:57p PT)
// 9 tasks total: 4 LOAD + 5 RECEIVE (7 GURUNANDA + 2 KARAKA, LLC). 1 is a
// data anomaly (TASK-5090739). Newest closed ARNULFO transaction on the
// "Guru live out / in assign to Arnulfo" stream: DOCK54 TASK-5430590,
// closed 11/25 2:20:30p PT; per-door Bay-4 counts and per-day counts are in the file
// header. He currently holds 2 open Bay-4 tasks
// (DOCK53 TASK-5430988 IN_PROGRESS, DOCK51 TASK-5430698 IN_PROGRESS).
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
    taskId: "TASK-5430698",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "LOAD 48h24m since 11/25 3:17:42p PT · TASK-5430698 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/25 11:40:37a PT · started 11/25 3:17:42p PT · checked in 11/25 3:17:47p PT · updated 11/25 4:24:10p PT · 9 loads: LOAD-5045462 (DN-3493773, DN-3493773) at status LOADED; LOAD-5045460 (DN-3494271, DN-3494271) at status LOADED; LOAD-5045390 (50102329, DN-3488905) at status LOADED; LOAD-5045385 (50102318, DN-3489440) at status LOADED; LOAD-5045384 (50102316, DN-3489457) at status LOADED; LOAD-5045382 (50102312, DN-3491599) at status LOADED; LOAD-5045379 (50102306, DN-3493377) at status LOADED; LOAD-5045297 (50102231, DN-3488764) at status LOADED; LOAD-5045183 (50102146, DN-3478329) at status LOADED · entry ET-1185940 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK51",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5430997",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "LOAD 48h04m since 11/25 3:37:04p PT · TASK-5430997 · EDUARDO MEJIA (assigneeUserId 2029638366082560001) · IN_PROGRESS · PRE_LOAD · task created 11/25 3:09:54p PT · started 11/25 3:37:04p PT · checked in 11/25 3:37:06p PT · updated 11/25 10:59:16p PT · 2 loads: LOAD-5045380 (50102308, DN-3492351) at status LOADED; LOAD-5045381 (50102310, DN-3492347) at status LOADED · seal 1304686 · entry ET-1186054 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK52",
    assignee: "EDUARDO MEJIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5430988",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "LOAD 45h13m since 11/25 6:28:56p PT · TASK-5430988 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/25 3:02:42p PT · started 11/25 6:28:56p PT · checked in 11/25 6:29:03p PT · updated 11/27 2:28:28p PT · 2 loads: LOAD-5045383 (50102314, DN-3489634) at status LOADING; LOAD-5045386 (50102320, DN-3489185) at status LOADING · entry ET-1186051 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK53",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5432096",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "LOAD 1h56m since 11/27 1:45:39p PT · TASK-5432096 · DANIEL BELTRAN (assigneeUserId 1932077596691410945) · IN_PROGRESS · PRE_LOAD · task created 11/27 12:29:48p PT · started 11/27 1:45:39p PT · checked in 11/27 1:45:52p PT · updated 11/27 2:22:32p PT · 5 loads: LOAD-5045564 (DN-3496631, DN-3496631) at status LOADED; LOAD-5045565 (DN-3496259, DN-3496259) at status LOADED; LOAD-5045560 (DN-3496899, DN-3496899) at status LOADED; LOAD-5045562 (DN-3496692, DN-3496692) at status LOADED; LOAD-5045199 (DN-3478677, DN-3478677) at status LOADED · seal 1304611 · entry ET-1186329 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK54",
    assignee: "DANIEL BELTRAN",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5431923",
    dns: "RECEIVE",
    customer: "KARAKA, LLC",
    pieces: "RECEIVE 5h29m since 11/27 10:12:26a PT · TASK-5431923 · DANIEL BELTRAN (assigneeUserId 1932077596691410945) · IN_PROGRESS · DOCK · task created 11/27 10:01:55a PT · started 11/27 10:12:26a PT · checked in 11/27 10:12:37a PT · updated 11/27 10:12:37a PT · 1 receipt: RN-196110 at status IN_PROGRESS · PO POBOK0567 · container UNKNOWN - LCL · reference 24804859 · appointment 11/27 8:00:00a PT · receivedStart 11/27 10:12:26a PT · entry ET-1186258 · customer ORG-585450 (KARAKA, LLC) · door DOCK57",
    assignee: "DANIEL BELTRAN",
    door: "DOCK57",
  },
  {
    taskId: "TASK-5431033",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE 45h48m since 11/25 5:52:58p PT · TASK-5431033 · DANIELA GONZALEZ (assigneeUserId 11769) · IN_PROGRESS · DOCK · task created 11/25 4:03:22p PT · started 11/25 5:52:58p PT · checked in 11/25 7:21:12p PT · updated 11/25 7:21:12p PT · 1 receipt: RN-5011741 at status IN_PROGRESS · PO OOCU5361162 · container OOCU5361162 · reference B00420376 · appointment 11/25 4:00:00p PT · receivedStart 11/25 5:52:58p PT · entry ET-1186078 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK64",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK64",
  },
  {
    taskId: "TASK-5429183",
    dns: "RECEIVE",
    customer: "KARAKA, LLC",
    pieces: "RECEIVE 57h21m since 11/25 6:20:56a PT · TASK-5429183 · julian rios (assigneeUserId 1988318610789830658) · IN_PROGRESS · DOCK · task created 11/24 9:36:39a PT · started 11/25 6:20:56a PT · checked in 11/25 8:29:41a PT · updated 11/25 11:28:21p PT · 2 receipts: RN-195876 at status IN_PROGRESS · PO POBOK0559.unis · container UNKNOWN - LCL · reference 24761549 · appointment 11/23 8:00:00a PT · receivedStart 11/25 6:20:56a PT; RN-195671 at status IN_PROGRESS · PO POBOK0347_unis2 · container UNKNOWN - LCL · reference SPR44841575 · appointment 11/24 10:00:00a PT · receivedStart 11/25 6:20:56a PT · entry ET-1185386 · customer ORG-585450 (KARAKA, LLC) · door DOCK65",
    assignee: "julian rios",
    door: "DOCK65",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE not started · TASK-5381972 · Jorge Antonio Franco (assigneeUserId 2060441422549078018) · NEW · DOCK · task created 09/30 10:46:50a PT · started no startTime · not checked in at dock · updated 09/30 10:48:35a PT · 1 receipt: RN-5010583 at status IMPORTED · PO PO9139-2 · container Jpack09242026 · reference none · appointment none · receivedStart none · entry ET-1162686 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK69",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
];
