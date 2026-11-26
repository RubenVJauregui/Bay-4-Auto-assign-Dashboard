/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 11/26 11:26:23a PT (live WISE / WMS-BAM APIs)
 *   Reference 2026-11-26T19:26:23+00:00 = 11/26 11:26:23a PT.
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
 *   Evidence at this pull: DOCK52 TASK-5430997 startTime 2026-11-25T23:37:04 =
 *   11/25 3:37:04p PT; DOCK61 TASK-5431126 startTime 2026-11-26T03:25:05 =
 *   11/25 7:25:05p PT; DOCK51 TASK-5430698 startTime 2026-11-25T23:17:42 =
 *   11/25 3:17:42p PT.
 *   QUERY MODE - this pull used the raw-UTC mode (no item-time-zone header), the
 *   same mode as every prior snapshot, so windows stay comparable pull to pull.
 *   Durations are measured to the 11/26 11:26:23a PT pull reference.
 *
 *   SOURCES USED AT THIS PULL:
 *     - POST /wms-bam/wms-location/search, body {exactlyNames:[DOCK50..DOCK72]}
 *       -> code 0, 23/23 rows (category DOCK, type DOCK, status USABLE on all 23,
 *       dockStatus, spaceStatus, occupiedCustomerIds, entryId, updatedTime).
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer filter)
 *       -> totalCount 55, all read; 3 of them sit on a Bay-4 dockName.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer filter)
 *       -> totalCount 69, all read; 5 of them sit on a Bay-4 dockName.
 *     - POST /wms-bam/inbound/receipt/search-by-paging
 *       {customerId: ORG-655875, appointmentTimeFrom "2026-11-26 08:00:00",
 *       appointmentTimeTo "2026-11-27 07:59:59"} -> totalCount 0, 0 rows read.
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, scheduleDatePeriod ["2026-11-26 08:00:00",
 *       "2026-11-27 07:59:59"]} -> totalCount 1, 1 rows read.
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], endTimeFrom "2026-10-31 00:00:00"
 *       -> totalCount 1203, all 1203 read. Per-door "last load task
 *       to close here" is read from this set. The ARNULFO MUNGUIA / GURUNANDA subset is
 *       measured on the same set (customerId ORG-655875 + assigneeUserIds [89,
 *       1948070158297014318]) -> 139 transactions, 121 of them at Bay-4 doors.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], endTimePeriod ["2026-10-01 00:00:00", now]
 *       -> totalCount 2043, all 2043 read, which contains every per-door
 *       "last receive task to close here" value below. NOTE: this endpoint rejects
 *       `sortingFields` (HTTP 400 "Invalid format: Request body format error") and
 *       ignores `endTimeFrom` (it returns the full 2043 either way), so the
 *       window above is `endTimePeriod`, which IS applied.
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, status: PLANNED} -> totalCount 212.
 *     - Task-name keyword RE-TESTED at this pull: the load-task `keyword` filter is
 *       STILL A NO-OP. "Guru live out / in assign to Arnulfo" and a nonsense string
 *       ("zzzz-no-such-task-zzzz") both returned the identical facility total,
 *       23144 / 23144 (and 55 / 55 with statuses [NEW, IN_PROGRESS, EXCEPTION]).
 *       No plan or task group named "Guru live out / in
 *       assign to Arnulfo" can be resolved through keyword search, and all active Bay-4
 *       tasks carry projectId null, so there is no named task group to resolve. The
 *       "Guru live out / in assign to Arnulfo" stream is therefore reported as ARNULFO
 *       MUNGUIA's task-assignment transactions on the GURUNANDA live-out/live-in work,
 *       and nothing is invented.
 *
 *   SCOPE NOTE:
 *     The line-level metrics on this dashboard are GURUNANDA-scoped (the customer scope
 *     this dashboard has always published). At this pull 8 active tasks sit on Bay-4 doors
 *     across all customers (5 RECEIVE / 3 LOAD) while the GURUNANDA scope reads 7
 *     (4 RECEIVE / 3 LOAD). The extra is a non-GURUNANDA receive task: ORG-585450 TASK-5429183 IN_PROGRESS (julian rios) at DOCK65.
 *     bay4AllCustomerActiveTaskCount / ...ReceiveCount / ...LoadCount export the physical
 *     numbers so the divergence stays explicit. Door status itself is physical (a door is
 *     occupied no matter which customer is on it).
 *
 *   Key state at this pull:
 *     - DOOR STATUS: occupied 21, reserved 0, available 2 (21+0+2 = 23). Fully free doors: DOCK60, DOCK62.
 *       Raw dockStatus: OCCUPIED 18, AVAILABLE 5. Raw
 *       spaceStatus: OCCUPIED 10, EMPTY 13. Reserved doors: none at this pull.
 *       3 doors read dock AVAILABLE but space OCCUPIED (DOCK56, DOCK57, DOCK58), so they are counted as Occupied and 21 of 23 are not fully free.
 *     - ACTIVE TASKS: 8 tasks across all customers - 5 RECEIVE / 3 LOAD - at 8 distinct doors
 *       (DOCK50, DOCK51, DOCK52, DOCK53, DOCK61, DOCK64, DOCK65, DOCK69). GURUNANDA-scoped: 7 tasks
 *       (4 RECEIVE / 3 LOAD) at 7 doors.
 *     - ASSIGNMENTS BY ASSIGNEE (GURUNANDA, the dashboard cards):
 *       ARNULFO MUNGUIA 1
 *       DANIELA GONZALEZ 2
 *       EDUARDO MEJIA 2
 *       Jorge Antonio Franco 1
 *       daira gonzalez 1
 *      = 7.
 *       Names are reproduced exactly as WISE returns them in assigneeUserName; every count is
 *       a distinct assigneeUserId value and no two assignees are merged.
 *     - ANOMALIES: 1. DOCK50 TASK-5090739 - the task carries an endTime while its status is still active
 *       (stale open task), so it is flagged rather than given an open-ended duration.
 *     - Task "Guru live out / in assign to Arnulfo": 139 CLOSED GURUNANDA load transactions with endTime
 *       from 2026-10-31 00:00:00 UTC, 121 at Bay-4 doors, 18 off Bay 4
 *       (DOCK10 4, DOCK9 2, DOCK8 2, DOCK4 4, DOCK6 1, DOCK45 1, DOCK7 2, DOCK5 2).
 *       Bay-4 breakdown: DOCK52 23, DOCK54 20, DOCK53 18, DOCK51 18, DOCK50 11, DOCK55 10, DOCK56 9, DOCK57 6, DOCK58 2, DOCK60 2, DOCK69 1, DOCK59 1.
 *       Per-day counts by endTime (UTC date): 11/02 7, 11/03 5, 11/04 12, 11/05 4, 11/06 7, 11/07 1, 11/09 6, 11/10 10, 11/11 4, 11/12 12, 11/13 7, 11/14 1, 11/16 7, 11/17 9, 11/18 9, 11/19 9, 11/20 6, 11/23 7, 11/24 10, 11/25 6.
 *       Newest transaction: DOCK54 TASK-5430590, started 2026-11-25T20:13:06 UTC,
 *       closed 2026-11-25T22:20:30 UTC, 2 loads, seal 25010920.
 *       He currently holds 1 open Bay-4 task (DOCK51 TASK-5430698 LOAD).
 *     - % scheduled inbounds received (11/26 PT): 0 of 0. NO GURUNANDA receipt carries an
 *       appointmentTime inside the 11/26 PT day (totalCount 0), so the denominator is zero and the metric is
 *       NOT COMPUTABLE rather than 0%. 11/26 is the Thanksgiving holiday: the facility-wide read for
 *       the same window is also 0 receipts, which confirms the zero is real and not a filter artifact.
 *       Cross-check on the neighbouring days: 8 receipts scheduled for 11/25 PT (3 received),
 *       0 for 11/27 PT.
 *     - % scheduled outbounds loaded (11/26 PT): 1 of 1 (100.0%, SHIPPED proxy). 1 GURUNANDA order carries a
 *       scheduleDate inside the 11/26 PT day: SHIPPED 1,
 *       status mix SHIPPED 1.
 *       The prior-day check: 95 orders for 11/25 PT, 19 for 11/27 PT.
 *     - Inbound/outbound mix: 4 RECEIVE / 3 LOAD of 7 active GURUNANDA tasks
 *       (5 RECEIVE / 3 LOAD of 8 physical tasks across all customers).
 *     - Total doors occupied: 21 of 23 (plus 0 reserved, 2 available).
 *     - Planned GURUNANDA orders: live count 212 at this pull.
 *     - Door occupancy duration: available where an active task has a startTime and has not
 *       ended - 6 tasks at this pull (DOCK65 RECEIVE 29h05m, DOCK51 LOAD 20h09m, DOCK53 LOAD 16h57m, DOCK52 LOAD 19h49m, DOCK64 RECEIVE 17h33m, DOCK61 RECEIVE 16h01m), all measured to the
 *       11/26 11:26:23a PT reference. WMS has no occupancy-start field for task-less doors
 *       (15 of 23) or for the 1 NEW Bay-4 task with no startTime, so no duration is
 *       asserted for those.
 *     - Facility-wide schedule context for the 11/26 PT day (no customerId filter, same
 *       window): receipts scheduled 0; orders scheduled
 *       2051, of which 112 are SHIPPED.
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
// it succeeds. Live totalCount was 212 at the 11/26 11:26:23a PT pull.
export const plannedGurunandaOrderCount = 212;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/26 11:26:23a PT
//
// All 23 rows come from one /wms-bam/wms-location/search call
// (exactlyNames DOCK50..DOCK72); every row is category DOCK, type DOCK,
// status USABLE. Door status rule (unchanged, keeps the dashboard's 3-value
// enum):
//   Reserved  = dockStatus RESERVED (door is held/reserved, so it is not free)
//   Occupied  = dockStatus OCCUPIED OR spaceStatus OCCUPIED (not fully free)
//   Available = dockStatus AVAILABLE AND spaceStatus EMPTY
// Raw field values are preserved per door so the mapping can be re-checked.
// Totals: Occupied 21, Reserved 0, Available 2 = 23.
// No door read RESERVED at this pull.
// 3 doors are dock AVAILABLE but still carry space OCCUPIED
// (DOCK56, DOCK57, DOCK58), so they count as Occupied.
// Fully free doors: DOCK60, DOCK62.
// Raw tallies at this pull: dockStatus OCCUPIED 18 / AVAILABLE 5;
// spaceStatus OCCUPIED 10 / EMPTY 13.
//
// BAY 4 ALL-CUSTOMER PHYSICAL TALLY (see SCOPE NOTE in the file header):
// active (NEW / IN_PROGRESS / EXCEPTION) tasks whose dockName is one of these
// 23 doors = 8 (RECEIVE 5, LOAD 3) on 8 doors. 1 of the receive tasks
// belongs to KARAKA, LLC (ORG-585450), so the GURUNANDA-only tally is 7
// (RECEIVE 4, LOAD 3) on 7 doors.
// =====================================================================
export const bay4AllCustomerActiveTaskCount = 8;
export const bay4AllCustomerActiveReceiveCount = 5;
export const bay4AllCustomerActiveLoadCount = 3;

export const doors: DoorRecord[] = [
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "daira gonzalez (RECEIVE IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5090739"],
    duration: "On this door: RECEIVE ENDED 10/22 10:42:01a PT while status is IN_PROGRESS - STALE/anomaly, no open-ended duration asserted · TASK-5090739 · daira gonzalez (assigneeUserId 1948070158297014492) · IN_PROGRESS · DOCK · task created 10/20 10:38:05p PT · started 10/21 1:21:14p PT · checked in 10/22 10:41:46a PT · updated 10/22 3:25:42p PT · 1 receipt: RN-5002143 at status CLOSED · PO EGSU8032696 · container EGSU8032696 · reference EGLV149507056809 · appointment 10/20 10:00:00a PT · receivedStart none · entry ET-1027622 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK50 · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1185958 · row updated 11/25 9:00:42p PT · last load task to close here: 11/25 8:42:36a PT TASK-5429651 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 3 loads) · last receive task to close here: 11/25 12:25:48p PT TASK-5426910 (Nanci Viviana Rosas, customer ORG-585450, CLOSED)",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5430698"],
    duration: "On this door: LOAD 20h09m since 11/25 3:17:42p PT · TASK-5430698 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/25 11:40:37a PT · started 11/25 3:17:42p PT · checked in 11/25 3:17:47p PT · updated 11/25 4:24:10p PT · 9 loads: LOAD-5045462 (DN-3493773, DN-3493773) at status LOADED; LOAD-5045460 (DN-3494271, DN-3494271) at status LOADED; LOAD-5045390 (50102329, DN-3488905) at status LOADED; LOAD-5045385 (50102318, DN-3489440) at status LOADED; LOAD-5045384 (50102316, DN-3489457) at status LOADED; LOAD-5045382 (50102312, DN-3491599) at status LOADED; LOAD-5045379 (50102306, DN-3493377) at status LOADED; LOAD-5045297 (50102231, DN-3488764) at status LOADED; LOAD-5045183 (50102146, DN-3478329) at status LOADED · entry ET-1185940 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK51 · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1185940 · row updated 11/25 9:00:30p PT · last load task to close here: 11/24 9:39:28a PT TASK-5428182 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 11/23 4:13:23p PT TASK-5427835 (ARNULFO MUNGUIA, customer ORG-585450, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "EDUARDO MEJIA (LOAD IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5430997"],
    duration: "On this door: LOAD 19h49m since 11/25 3:37:04p PT · TASK-5430997 · EDUARDO MEJIA (assigneeUserId 2029638366082560001) · IN_PROGRESS · PRE_LOAD · task created 11/25 3:09:54p PT · started 11/25 3:37:04p PT · checked in 11/25 3:37:06p PT · updated 11/25 10:59:16p PT · 2 loads: LOAD-5045380 (50102308, DN-3492351) at status LOADED; LOAD-5045381 (50102310, DN-3492347) at status LOADED · seal 1304686 · entry ET-1186054 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK52 · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1186054 · row updated 11/25 10:22:11p PT · last load task to close here: 11/25 10:33:40a PT TASK-5429652 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 3 loads) · last receive task to close here: 11/23 2:30:59p PT TASK-5428115 (Fatima ponce, customer ORG-655875, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "EDUARDO MEJIA (LOAD IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5430988"],
    duration: "On this door: LOAD 16h57m since 11/25 6:28:56p PT · TASK-5430988 · EDUARDO MEJIA (assigneeUserId 2029638366082560001) · IN_PROGRESS · PRE_LOAD · task created 11/25 3:02:42p PT · started 11/25 6:28:56p PT · checked in 11/25 6:29:03p PT · updated 11/25 6:29:03p PT · 2 loads: LOAD-5045383 (50102314, DN-3489634) at status LOADING; LOAD-5045386 (50102320, DN-3489185) at status LOADING · entry ET-1186051 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK53 · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1186051 · row updated 11/25 9:00:04p PT · last load task to close here: 11/25 12:30:43p PT TASK-5430599 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 2 loads) · last receive task to close here: 11/25 12:13:04p PT TASK-5429706 (Nanci Viviana Rosas, customer ORG-585450, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1186051 · row updated 11/25 8:59:55p PT · last load task to close here: 11/25 2:20:30p PT TASK-5430590 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 2 loads) · last receive task to close here: 11/25 3:19:21p PT TASK-5426702 (Nanci Viviana Rosas, customer ORG-585450, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1185991 · row updated 11/25 8:59:42p PT · last load task to close here: 11/25 1:55:07p PT TASK-5430880 (DANIEL BELTRAN, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 11/23 12:23:46p PT TASK-5425381 (Fatima ponce, customer ORG-655875, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1185962 · row updated 11/25 2:16:46p PT · last load task to close here: 11/25 2:16:30p PT TASK-5430775 (DANIEL BELTRAN, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 11/24 9:20:22a PT TASK-5428317 (Fatima ponce, customer ORG-655875, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1185989 · row updated 11/25 3:35:37p PT · last load task to close here: 11/25 3:35:33p PT TASK-5430879 (SILVANO SERTORIO HERNANDEZ, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 11/23 4:39:59p PT TASK-5428293 (DANIELA GONZALEZ, customer ORG-655875, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1185395 · row updated 11/25 7:27:05a PT · last load task to close here: 11/24 10:25:25a PT TASK-5429241 (DANIEL BELTRAN, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 11/20 12:18:57p PT TASK-5425943 (CANDY MENDEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1184953 · row updated 11/25 8:59:24p PT · last load task to close here: 11/16 3:17:16p PT TASK-5422412 (DANIEL BELTRAN, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 11/20 8:09:54a PT TASK-5424859 (Fatima ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1185367 · row updated 11/24 10:06:28a PT · last load task to close here: 11/24 10:06:15a PT TASK-5429135 (DANIEL BELTRAN, customer ORG-655875, CLOSED, 2 loads) · last receive task to close here: 10/23 7:21:53p PT TASK-5402543 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5431126"],
    duration: "On this door: RECEIVE 16h01m since 11/25 7:25:05p PT · TASK-5431126 · DANIELA GONZALEZ (assigneeUserId 11769) · IN_PROGRESS · DOCK · task created 11/25 6:48:21p PT · started 11/25 7:25:05p PT · checked in 11/25 7:25:07p PT · updated 11/25 7:25:07p PT · 1 receipt: RN-5011692 at status IN_PROGRESS · PO HOUU9908136 · container HOUU9908136 · reference B00420738 · appointment 11/23 10:00:00a PT · receivedStart 11/25 7:25:05p PT · entry ET-1186112 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK61 · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1186112 · row updated 11/25 8:59:15p PT · last load task to close here: 11/13 10:56:09a PT TASK-5420400 (BARTOLO RAMIREZ, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 11/23 7:24:02p PT TASK-5428412 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1185668 · row updated 11/25 9:56:01a PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/25 8:44:36a PT TASK-5429914 (Fatima ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1184657 · row updated 11/25 8:59:03p PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/23 10:31:29a PT TASK-5427009 (Fatima ponce, customer ORG-655875, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5431033"],
    duration: "On this door: RECEIVE 17h33m since 11/25 5:52:58p PT · TASK-5431033 · DANIELA GONZALEZ (assigneeUserId 11769) · IN_PROGRESS · DOCK · task created 11/25 4:03:22p PT · started 11/25 5:52:58p PT · checked in 11/25 7:21:12p PT · updated 11/25 7:21:12p PT · 1 receipt: RN-5011741 at status IN_PROGRESS · PO OOCU5361162 · container OOCU5361162 · reference B00420376 · appointment 11/25 4:00:00p PT · receivedStart 11/25 5:52:58p PT · entry ET-1186078 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK64 · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1186078 · row updated 11/25 8:58:53p PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/24 9:21:52p PT TASK-5429826 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: "julian rios (RECEIVE IN_PROGRESS)",
    customer: "KARAKA, LLC",
    taskIds: ["TASK-5429183"],
    duration: "On this door: RECEIVE 29h05m since 11/25 6:20:56a PT · TASK-5429183 · julian rios (assigneeUserId 1988318610789830658) · IN_PROGRESS · DOCK · task created 11/24 9:36:39a PT · started 11/25 6:20:56a PT · checked in 11/25 8:29:41a PT · updated 11/25 11:28:21p PT · 2 receipts: RN-195876 at status IN_PROGRESS · PO POBOK0559.unis · container UNKNOWN - LCL · reference 24761549 · appointment 11/23 8:00:00a PT · receivedStart 11/25 6:20:56a PT; RN-195671 at status IN_PROGRESS · PO POBOK0347_unis2 · container UNKNOWN - LCL · reference SPR44841575 · appointment 11/24 10:00:00a PT · receivedStart 11/25 6:20:56a PT · entry ET-1185386 · customer ORG-585450 (KARAKA, LLC) · door DOCK65 · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1185386 · row updated 11/25 8:58:44p PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/10 11:38:02a PT TASK-5413519 (Nanci Viviana Rosas, customer ORG-585450, FORCE_CLOSED)",
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
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1185393 · row updated 11/25 8:58:21p PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/24 10:26:12a PT TASK-5429207 (Fatima ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1184494 · row updated 11/24 8:53:51p PT · last load task to close here: 11/20 12:57:47p PT TASK-5426700 (DANIEL BELTRAN, customer ORG-655875, CLOSED, 2 loads) · last receive task to close here: 11/02 3:06:46p PT TASK-5408610 (Fatima ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "On this door: RECEIVE not started · TASK-5381972 · Jorge Antonio Franco (assigneeUserId 2060441422549078018) · NEW · DOCK · task created 09/30 10:46:50a PT · started no startTime · not checked in at dock · updated 09/30 10:48:35a PT · 1 receipt: RN-5010583 at status IMPORTED · PO PO9139-2 · container Jpack09242026 · reference none · appointment none · receivedStart none · entry ET-1162686 · task note \"DOCK   69 ET-1162686\" · customer ORG-655875 (GURUNANDA, LLC) · door DOCK69 · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1185525 · row updated 11/25 8:58:05p PT · last load task to close here: 11/24 3:02:10p PT TASK-5429574 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 11/17 7:25:08p PT TASK-5423772 (JESUS ESPINOZA, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1172826 · row updated 11/25 8:57:56p PT · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 10/21 9:42:23a PT TASK-5399423 (Fatima ponce, customer ORG-655875, CLOSED)",
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

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 21
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 0
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 8
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 1
const available = doors.filter((d) => d.status === "Available").length; // 2

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors Occupied",
    value: "21/23",
    numerator: 21,
    denominator: 23,
    percentage: 91,
  },
  {
    label: "Doors w/ Active Tasks",
    value: "8",
    numerator: 8,
    denominator: 23,
    percentage: 35,
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

// Doors that carried dockStatus RESERVED at this pull: 0. A
// reserved door is held rather than free, so 21 read Occupied and 21 of 23 are not fully free.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee - GURUNANDA scope (the dashboard cards).
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, 11/26 11:26:23a PT).
// 7 active-status GURUNANDA tasks at Bay-4 doors: 3 LOAD + 4 RECEIVE, at 7 distinct doors
// (DOCK50, DOCK51, DOCK52, DOCK53, DOCK61, DOCK64, DOCK69).
//       ARNULFO MUNGUIA (1): assigneeUserId 89
//       DANIELA GONZALEZ (2): assigneeUserId 11769
//       EDUARDO MEJIA (2): assigneeUserId 2029638366082560001
//       Jorge Antonio Franco (1): assigneeUserId 2060441422549078018
//       daira gonzalez (1): assigneeUserId 1948070158297014492
// All names/ids are resolved verbatim from the WMS task payloads
// (assigneeUserName / assigneeUserId); no name was normalised or guessed.
// Adding the non-GURUNANDA task would make the total 8
// (see bay4AllCustomerActiveTaskCount) - it is a KARAKA, LLC receive task.
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 1 },
  { name: "DANIELA GONZALEZ", taskCount: 2 },
  { name: "EDUARDO MEJIA", taskCount: 2 },
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

// Mix: 4 RECEIVE + 3 LOAD = 7 active Bay-4 GURUNANDA tasks. The physical
// all-customer mix is 5 RECEIVE + 3 LOAD = 8 (the extra receive task is
// KARAKA, LLC on DOCK65).
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 4, total: 7 },
  { label: "Outbound (LOAD)", count: 3, total: 7 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 3, total: 7 },
  { label: "Inbound", count: 4, total: 7 },
];

// --- Schedule Data (11/26 11:26:23a PT) ---
// Both percentages use the SAME UTC-derived 11/26 PT business-day window,
// 2026-11-26 08:00:00 -> 2026-11-27 07:59:59 (see TIMESTAMP SEMANTICS in the
// file header; this window is the only one used anywhere in this file):
//   % scheduled inbounds received TODAY: 0 GURUNANDA receipts carry an appointmentTime
//   inside that window (totalCount 0), so the denominator is zero and the card renders
//   NOT COMPUTABLE rather than 0%. 11/26 is Thanksgiving - the facility-wide
//   read for the same window is also 0 receipts, so the zero is real.
//   Cross-checked on the neighbouring days: 8 receipts for the 11/25 PT day
//   (3 of them received), 0 for 11/27 PT.
//   % scheduled outbounds loaded TODAY: 1 GURUNANDA order carries a scheduleDate
//   inside that window (scheduleDatePeriod ["2026-11-26 08:00:00", "2026-11-27 07:59:59"],
//   totalCount 1, 1 row read) and it is SHIPPED = 1 of 1 = 100.0%.
//   SHIPPED is the "loaded" proxy defined by the prior refreshes; it is kept for
//   comparability. The one scheduled order is DN-3475239 (SO124936, scheduleDate 2026-11-26T08:00:00 UTC, appointment 2026-11-24T16:00:00 UTC, SHIPPED).
//   Cross-checked on the neighbouring days: 95 orders for the 11/25 PT day,
//   19 for the 11/27 PT day.
export const scheduleAvailable = false;               // 0 GURUNANDA receipts scheduled on 11/26 - denominator is zero
export const outboundScheduleAvailable = true;        // 1 GURUNANDA order scheduled on 11/26 - denominator non-zero
export const scheduledInboundOrders = 0;            // receipts with appointmentTime in the 11/26 PT day
export const scheduledOutboundOrders = 1;           // orders with scheduleDate in the 11/26 PT day
export const scheduledInboundReceived = 0;            // receipts in that window carrying a receivedStartTime
export const scheduledOutboundLoaded = 1;           // orders in that window at status SHIPPED
export const pctScheduledInboundReceived = 0.0;       // 0 of 0 - not computable (no receipt scheduled)
export const pctScheduledOutboundLoaded = 100.0;        // 1 of 1 (SHIPPED proxy)
// Facility-wide schedule context for the 11/26 PT day, all customers (same two
// endpoints, no customerId filter, same UTC-derived PT-day window):
// 0 receipts scheduled, of which 0 carry a receivedStartTime; 2051 orders scheduled by
// totalCount, of which 112 are SHIPPED.
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 2051;
export const facilityWideLoadsShipped = 112;

// Door occupancy duration: available from task startTime where a task exists on
// the door, has actually started and has not already ended; unavailable for
// task-less doors and for NEW tasks with no startTime (WMS has no
// occupancy-start field).
// 15 of 23 doors carry no active task at this pull
// and 2 of the 8 active tasks have no open-ended duration basis (1 NEW task with no startTime
// plus the 1 stale task that already carries an endTime), so a duration exists for 6 tasks on 6 doors
// (DOCK65 RECEIVE 29h05m, DOCK51 LOAD 20h09m, DOCK53 LOAD 16h57m, DOCK52 LOAD 19h49m, DOCK64 RECEIVE 17h33m, DOCK61 RECEIVE 16h01m, all measured to the
// 11/26 11:26:23a PT reference).
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, 11/26 11:26:23a PT)
// 8 tasks total: 3 LOAD + 5 RECEIVE (7 GURUNANDA + 1 KARAKA, LLC). 1 is a
// data anomaly (TASK-5090739). Newest closed ARNULFO transaction on the
// "Guru live out / in assign to Arnulfo" stream: DOCK54 TASK-5430590,
// closed 2026-11-25T22:20:30 UTC; per-door Bay-4 counts and per-day counts are in the file
// header. He currently holds 1 open Bay-4 task (DOCK51 TASK-5430698 LOAD).
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
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE not started · TASK-5381972 · Jorge Antonio Franco (assigneeUserId 2060441422549078018) · NEW · DOCK · task created 09/30 10:46:50a PT · started no startTime · not checked in at dock · updated 09/30 10:48:35a PT · 1 receipt: RN-5010583 at status IMPORTED · PO PO9139-2 · container Jpack09242026 · reference none · appointment none · receivedStart none · entry ET-1162686 · task note \"DOCK   69 ET-1162686\" · customer ORG-655875 (GURUNANDA, LLC) · door DOCK69",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5429183",
    dns: "RECEIVE",
    customer: "KARAKA, LLC",
    pieces: "RECEIVE 29h05m since 11/25 6:20:56a PT · TASK-5429183 · julian rios (assigneeUserId 1988318610789830658) · IN_PROGRESS · DOCK · task created 11/24 9:36:39a PT · started 11/25 6:20:56a PT · checked in 11/25 8:29:41a PT · updated 11/25 11:28:21p PT · 2 receipts: RN-195876 at status IN_PROGRESS · PO POBOK0559.unis · container UNKNOWN - LCL · reference 24761549 · appointment 11/23 8:00:00a PT · receivedStart 11/25 6:20:56a PT; RN-195671 at status IN_PROGRESS · PO POBOK0347_unis2 · container UNKNOWN - LCL · reference SPR44841575 · appointment 11/24 10:00:00a PT · receivedStart 11/25 6:20:56a PT · entry ET-1185386 · customer ORG-585450 (KARAKA, LLC) · door DOCK65",
    assignee: "julian rios",
    door: "DOCK65",
  },
  {
    taskId: "TASK-5430698",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "LOAD 20h09m since 11/25 3:17:42p PT · TASK-5430698 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/25 11:40:37a PT · started 11/25 3:17:42p PT · checked in 11/25 3:17:47p PT · updated 11/25 4:24:10p PT · 9 loads: LOAD-5045462 (DN-3493773, DN-3493773) at status LOADED; LOAD-5045460 (DN-3494271, DN-3494271) at status LOADED; LOAD-5045390 (50102329, DN-3488905) at status LOADED; LOAD-5045385 (50102318, DN-3489440) at status LOADED; LOAD-5045384 (50102316, DN-3489457) at status LOADED; LOAD-5045382 (50102312, DN-3491599) at status LOADED; LOAD-5045379 (50102306, DN-3493377) at status LOADED; LOAD-5045297 (50102231, DN-3488764) at status LOADED; LOAD-5045183 (50102146, DN-3478329) at status LOADED · entry ET-1185940 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK51",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5430988",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "LOAD 16h57m since 11/25 6:28:56p PT · TASK-5430988 · EDUARDO MEJIA (assigneeUserId 2029638366082560001) · IN_PROGRESS · PRE_LOAD · task created 11/25 3:02:42p PT · started 11/25 6:28:56p PT · checked in 11/25 6:29:03p PT · updated 11/25 6:29:03p PT · 2 loads: LOAD-5045383 (50102314, DN-3489634) at status LOADING; LOAD-5045386 (50102320, DN-3489185) at status LOADING · entry ET-1186051 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK53",
    assignee: "EDUARDO MEJIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5430997",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "LOAD 19h49m since 11/25 3:37:04p PT · TASK-5430997 · EDUARDO MEJIA (assigneeUserId 2029638366082560001) · IN_PROGRESS · PRE_LOAD · task created 11/25 3:09:54p PT · started 11/25 3:37:04p PT · checked in 11/25 3:37:06p PT · updated 11/25 10:59:16p PT · 2 loads: LOAD-5045380 (50102308, DN-3492351) at status LOADED; LOAD-5045381 (50102310, DN-3492347) at status LOADED · seal 1304686 · entry ET-1186054 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK52",
    assignee: "EDUARDO MEJIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5431033",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE 17h33m since 11/25 5:52:58p PT · TASK-5431033 · DANIELA GONZALEZ (assigneeUserId 11769) · IN_PROGRESS · DOCK · task created 11/25 4:03:22p PT · started 11/25 5:52:58p PT · checked in 11/25 7:21:12p PT · updated 11/25 7:21:12p PT · 1 receipt: RN-5011741 at status IN_PROGRESS · PO OOCU5361162 · container OOCU5361162 · reference B00420376 · appointment 11/25 4:00:00p PT · receivedStart 11/25 5:52:58p PT · entry ET-1186078 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK64",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK64",
  },
  {
    taskId: "TASK-5431126",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE 16h01m since 11/25 7:25:05p PT · TASK-5431126 · DANIELA GONZALEZ (assigneeUserId 11769) · IN_PROGRESS · DOCK · task created 11/25 6:48:21p PT · started 11/25 7:25:05p PT · checked in 11/25 7:25:07p PT · updated 11/25 7:25:07p PT · 1 receipt: RN-5011692 at status IN_PROGRESS · PO HOUU9908136 · container HOUU9908136 · reference B00420738 · appointment 11/23 10:00:00a PT · receivedStart 11/25 7:25:05p PT · entry ET-1186112 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK61",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK61",
  },
];
