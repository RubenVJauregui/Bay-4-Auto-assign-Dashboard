/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 11/21 4:20:22p PT (live WISE / WMS-BAM APIs)
 *   Reference 2026-11-22T00:20:22.987Z = 11/21 4:20:22p PT.
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
 *   Evidence at this pull: DOCK63 TASK-5427009 receivedStartTime
 *   2026-11-21T04:24:51 = 11/20 8:24:51p PT; DOCK51 TASK-5426987 checkInTime
 *   2026-11-21T00:06:31 = 11/20 4:06:31p PT; receipt RN-5011687 appointmentTime
 *   2026-11-19T21:00:00 = 11/19 1:00:00p PT.
 *   QUERY MODE - this pull used the raw-UTC mode (no item-time-zone header), the
 *   same mode as every prior snapshot, so windows stay comparable pull to pull.
 *   Durations are measured to the 11/21 4:20:22p PT pull reference.
 *
 *   SOURCES USED AT THIS PULL:
 *     - POST /wms-bam/wms-location/search, body {exactlyNames:[DOCK50..DOCK72]}
 *       -> code 0, 23/23 rows (category DOCK, type DOCK, status USABLE on all 23,
 *       dockStatus, spaceStatus, occupiedCustomerIds, entryId, updatedTime).
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer filter)
 *       -> totalCount 79, all read; 6 of them sit on a Bay-4 dockName.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer filter)
 *       -> totalCount 89, all read; 11 of them sit on a Bay-4 dockName.
 *     - POST /wms-bam/inbound/receipt/search-by-paging
 *       {customerId: ORG-655875, appointmentTimeFrom "2026-11-21 08:00:00",
 *       appointmentTimeTo "2026-11-22 07:59:59"} -> totalCount 0, 0 rows read.
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, scheduleDatePeriod ["2026-11-21 08:00:00",
 *       "2026-11-22 07:59:59"]} -> totalCount 0, 0 rows read.
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], endTimeFrom "2026-10-31 00:00:00"
 *       -> totalCount 978, all 978 read. Per-door "last load task
 *       to close here" is read from this set. The ARNULFO MUNGUIA / GURUNANDA subset is
 *       measured on the same set (customerId ORG-655875 + assigneeUserIds [89,
 *       1948070158297014318]) -> 116 transactions, 98 of them at Bay-4 doors.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], sortingFields endTime DESC -> totalCount 18016; the
 *       newest 4000 were read, which contains every per-door "last receive task to
 *       close here" value below. The endTimeFrom filter is NOT applied to receive tasks
 *       (the same total is returned with and without it) - the read window above is what
 *       was actually inspected.
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, status: PLANNED} -> totalCount 256.
 *     - Task-name keyword RE-TESTED at this pull: the load-task `keyword` filter is
 *       STILL A NO-OP. "Guru live out / in assign to Arnulfo" and a nonsense string
 *       ("zzzz-no-such-task-zzzz") both returned the identical facility total,
 *       22940 / 22940 (and 79 / 79 with statuses [NEW, IN_PROGRESS, EXCEPTION]).
 *       No plan or task group named "Guru live out / in
 *       assign to Arnulfo" can be resolved through keyword search, and all active Bay-4
 *       tasks carry projectId null, so there is no named task group to resolve. The
 *       "Guru live out / in assign to Arnulfo" stream is therefore reported as ARNULFO
 *       MUNGUIA's task-assignment transactions on the GURUNANDA live-out/live-in work,
 *       and nothing is invented.
 *
 *   SCOPE NOTE:
 *     The line-level metrics on this dashboard are GURUNANDA-scoped (the customer scope
 *     this dashboard has always published). At this pull 17 active tasks sit on Bay-4 doors
 *     across all customers (11 RECEIVE / 6 LOAD) while the GURUNANDA scope reads 13
 *     (7 RECEIVE / 6 LOAD). The extras are non-GURUNANDA receive tasks: ORG-585450 TASK-5426910 IN_PROGRESS (ARNULFO MUNGUIA) at DOCK50; ORG-585450 TASK-5426702 IN_PROGRESS (ARNULFO MUNGUIA) at DOCK54; ORG-585450 TASK-5426441 IN_PROGRESS (ARNULFO MUNGUIA) at DOCK57; ORG-585450 TASK-5425183 IN_PROGRESS (ARNULFO MUNGUIA) at DOCK54.
 *     bay4AllCustomerActiveTaskCount / ...ReceiveCount / ...LoadCount export the physical
 *     numbers so the divergence stays explicit. Door status itself is physical (a door is
 *     occupied no matter which customer is on it).
 *
 *   Key state at this pull:
 *     - DOOR STATUS: occupied 20, reserved 0, available 3 (20+0+3 = 23). Fully free doors: DOCK61, DOCK62, DOCK64.
 *       Raw dockStatus: AVAILABLE 8, OCCUPIED 15. Raw
 *       spaceStatus: OCCUPIED 10, EMPTY 13. No door is RESERVED at this pull.
 *       5 doors read dock AVAILABLE but space OCCUPIED and are therefore counted as Occupied:
 *       DOCK50, DOCK51, DOCK55, DOCK56, DOCK57.
 *     - ACTIVE TASKS: 17 tasks across all customers - 11 RECEIVE / 6 LOAD - at 11 distinct doors
 *       (DOCK50, DOCK51, DOCK52, DOCK53, DOCK54, DOCK55, DOCK57, DOCK63, DOCK66, DOCK67, DOCK69). GURUNANDA-scoped: 13 tasks
 *       (7 RECEIVE / 6 LOAD) at 10 doors.
 *     - ASSIGNMENTS BY ASSIGNEE (GURUNANDA, the dashboard cards):
 *       ARNULFO MUNGUIA 5
 *       DANIELA GONZALEZ 2
 *       A1SG 1
 *       daira gonzalez 1
 *       EDUARDO MEJIA 1
 *       GONZALO RANGEL 1
 *       Jorge Antonio Franco 1
 *       JORGE ANTONIO FRANCO 1
 *       = 13.
 *       Names are reproduced exactly as WISE returns them in assigneeUserName ("A1SG" and
 *       "daira gonzalez" are returned verbatim; "JORGE ANTONIO FRANCO" and "Jorge Antonio
 *       Franco" are two distinct assigneeUserId values and are NOT merged). All-customer
 *       adds ARNULFO MUNGUIA on 4 non-GURUNANDA receive tasks -> 17 tasks, ARNULFO MUNGUIA 9.
 *     - ANOMALIES: 2. DOCK52 TASK-5426967 (LOAD, IN_PROGRESS) has startTime 11/20 3:34:22p PT and endTime 11/20 4:26:54p PT; DOCK50 TASK-5090739 (RECEIVE, IN_PROGRESS) has startTime 10/21 1:21:14p PT and endTime 10/22 10:42:01a PT;
 *       flagged, not given an open-ended duration.
 *       The DOCK50 task has also been "active" since 10/21/2025 and its linked receipt is
 *       CLOSED - flagged, never given a duration.
 *     - Task "Guru live out / in assign to Arnulfo": 116 CLOSED GURUNANDA load transactions with endTime
 *       from 2026-10-31 00:00:00 UTC, 98 at Bay-4 doors, 18 off Bay 4
 *       (DOCK10 4, DOCK4 4, DOCK9 2, DOCK8 2, DOCK7 2, DOCK5 2, DOCK6 1, DOCK45 1).
 *       Bay-4 breakdown: DOCK52 17, DOCK51 15, DOCK54 15, DOCK53 14, DOCK56 9, DOCK50 9, DOCK55 9, DOCK57 5, DOCK58 2, DOCK60 2, DOCK59 1.
 *       Per-day counts by endTime (PT): 11/20 6, 11/19 9, 11/18 8, 11/17 10, 11/16 7, 11/13 8, 11/12 12, 11/11 4, 11/10 10, 11/09 6, 11/06 8, 11/05 4, 11/04 11, 11/03 6, 11/02 7.
 *       Newest transaction: DOCK58 TASK-5426582, started 11/20 1:20:45p PT,
 *       closed 11/20 3:16:48p PT, 3 loads, seal 25010945. It is the newest at a Bay-4 door.
 *       He currently holds 9 open Bay-4 tasks
 *       (DOCK54 TASK-5427068 LOAD, DOCK52 TASK-5427049 LOAD, DOCK52 TASK-5426967 LOAD, DOCK53 TASK-5426879 LOAD, DOCK52 TASK-5425811 LOAD, DOCK50 TASK-5426910 RECEIVE, DOCK54 TASK-5426702 RECEIVE, DOCK57 TASK-5426441 RECEIVE, DOCK54 TASK-5425183 RECEIVE; the 4 RECEIVE ones are the KARAKA, LLC tasks).
 *     - % scheduled inbounds received (11/21 PT): NOT COMPUTABLE - 0 of 0. No GURUNANDA receipt carries an
 *       appointmentTime inside the 11/21 PT day, so the denominator is zero. This is a
 *       real, re-verified Saturday reading, not a failed query: the same query returns
 *       12 receipts for the 11/20 PT day and 5 for the 11/23 PT day.
 *     - % scheduled outbounds loaded (11/21 PT): NOT COMPUTABLE - 0 of 0. No GURUNANDA order carries a
 *       scheduleDate inside the 11/21 PT day. Same re-verification:
 *       59 orders for 11/20 PT day, 87 for 11/23 PT day.
 *       Last operating day (11/20 PT) for reference only, NOT rendered on the cards:
 *       receipts 12 scheduled of which 3 received (25.0%);
 *       orders 59 scheduled of which 19 SHIPPED (32.2%, plus 1 LOADED).
 *     - Inbound/outbound mix: 7 RECEIVE / 6 LOAD of 13 active GURUNANDA tasks
 *       (11 RECEIVE / 6 LOAD of 17 physical tasks across all customers).
 *     - Total doors occupied: 20 of 23 (plus 0 reserved, 3 available).
 *     - Planned GURUNANDA orders: live count 256 at this pull.
 *     - Door occupancy duration: available where an active task has a startTime and has not
 *       ended - 12 tasks on 9 doors at this pull
 *       (DOCK54 RECEIVE 55h01m, DOCK52 LOAD 49h23m, DOCK66 RECEIVE 48h46m, DOCK67 RECEIVE 31h41m, DOCK57 RECEIVE 30h08m, DOCK54 RECEIVE 27h01m, DOCK53 LOAD 26h01m, DOCK51 LOAD 24h14m, DOCK50 RECEIVE 23h39m, DOCK52 LOAD 19h58m, DOCK63 RECEIVE 19h55m, DOCK54 LOAD 17h14m), all measured to the
 *       11/21 4:20:22p PT reference. WMS has no occupancy-start field for task-less doors
 *       (12 of 23), for the 3 NEW Bay-4 tasks, or for the 2 stale tasks, so no duration is
 *       asserted for those.
 *     - Facility-wide schedule context for the 11/21 PT day (no customerId filter, same
 *       window): receipts scheduled 0, of which 0 carry a receivedStartTime; orders scheduled
 *       11, 11 of them at status IMPORTED.
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
// it succeeds. Live totalCount was 256 at the 4:20:22p PT pull.
export const plannedGurunandaOrderCount = 256;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/21 4:20:22p PT
//
// All 23 rows come from one /wms-bam/wms-location/search call
// (exactlyNames DOCK50..DOCK72); every row is category DOCK, type DOCK,
// status USABLE. Door status rule (unchanged, keeps the dashboard's 3-value
// enum):
//   Reserved  = dockStatus RESERVED (door is held/reserved, so it is not free)
//   Occupied  = dockStatus OCCUPIED OR spaceStatus OCCUPIED (not fully free)
//   Available = dockStatus AVAILABLE AND spaceStatus EMPTY
// Raw field values are preserved per door so the mapping can be re-checked.
// Totals: Occupied 20, Reserved 0, Available 3 = 23.
// 0 doors read RESERVED at this pull.
// 5 doors are dock AVAILABLE but still carry space OCCUPIED
// (DOCK50, DOCK51, DOCK55, DOCK56, DOCK57), so they count as Occupied.
// Fully free doors: DOCK61, DOCK62, DOCK64.
// Raw tallies at this pull: dockStatus AVAILABLE 8 / OCCUPIED 15;
// spaceStatus OCCUPIED 10 / EMPTY 13.
//
// BAY 4 ALL-CUSTOMER PHYSICAL TALLY (see SCOPE NOTE in the file header):
// active (NEW / IN_PROGRESS / EXCEPTION) tasks whose dockName is one of these
// 23 doors = 17 (RECEIVE 11, LOAD 6) on 11 doors. 4 of the receive tasks are
// KARAKA, LLC (ORG-585450), so the GURUNANDA-only tally is 13
// (RECEIVE 7, LOAD 6) on 10 doors.
// =====================================================================
export const bay4AllCustomerActiveTaskCount = 17;
export const bay4AllCustomerActiveReceiveCount = 11;
export const bay4AllCustomerActiveLoadCount = 6;

export const doors: DoorRecord[] = [
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "daira gonzalez (RECEIVE IN_PROGRESS) + ARNULFO MUNGUIA (RECEIVE IN_PROGRESS)",
    customer: "GURUNANDA, LLC + KARAKA, LLC",
    taskIds: ["TASK-5090739", "TASK-5426910"],
    duration: "On this door: RECEIVE ENDED 10/22 10:42:01a PT while status is IN_PROGRESS - STALE/anomaly, no open-ended duration asserted · TASK-5090739 · daira gonzalez (assigneeUserId 1948070158297014492) · IN_PROGRESS · DOCK · task created 10/20 10:38:05p PT · started 10/21 1:21:14p PT · checked in 10/22 10:41:46a PT · updated 10/22 3:25:42p PT · 1 receipt: RN-5002143 at status CLOSED · PO EGSU8032696 · container EGSU8032696 · reference EGLV149507056809 · appointment 10/20 10:00:00a PT · receivedStart none · entry ET-1027622 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK50 · Also on this door: RECEIVE 23h39m since 11/20 4:40:57p PT · TASK-5426910 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/20 2:43:28p PT · started 11/20 4:40:57p PT · checked in 11/20 4:40:59p PT · updated 11/20 4:41:49p PT · 1 receipt: RN-195393 at status IN_PROGRESS · PO POBOK0512 · container UNKNOWN - LCL · reference SPR44475617 · appointment 11/17 10:00:00a PT · receivedStart 11/20 4:40:57p PT · entry ET-1184618 · customer ORG-585450 (KARAKA, LLC) · door DOCK50 · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1184618 (row updated 11/20 4:41:49p PT) · last load task to close here: 11/19 2:11:15p PT TASK-5425197 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 2 loads) · last receive task to close here: 11/09 4:55:40p PT TASK-5416210 (DANIELA GONZALEZ, customer ORG-585450, FORCE_CLOSED)",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "EDUARDO MEJIA (LOAD IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5426987"],
    duration: "On this door: LOAD 24h14m since 11/20 4:06:22p PT · TASK-5426987 · EDUARDO MEJIA (assigneeUserId 2029638366082560001) · IN_PROGRESS · PRE_LOAD · task created 11/20 4:03:05p PT · started 11/20 4:06:22p PT · checked in 11/20 4:06:31p PT · updated 11/20 8:22:16p PT · seal 1378854 · 1 load: LOAD-5044982 (50101958, DN-3472278) at status LOADED · entry ET-1184648 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK51 · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1184648 (row updated 11/21 1:06:35a PT) · last load task to close here: 11/20 3:15:48p PT TASK-5426770 (RENATO ROSALES GARCIA, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 11/13 10:42:38a PT TASK-5420402 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD IN_PROGRESS) + ARNULFO MUNGUIA (LOAD IN_PROGRESS) + ARNULFO MUNGUIA (LOAD IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5425811", "TASK-5426967", "TASK-5427049"],
    duration: "On this door: LOAD 49h23m since 11/19 2:56:29p PT · TASK-5425811 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/19 2:39:50p PT · started 11/19 2:56:29p PT · checked in 11/19 2:56:52p PT · updated 11/20 11:45:43a PT · seal 1378810 · 1 load: LOAD-5044981 (50101956, DN-3472288) at status LOADED · entry ET-1184121 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK52 · Also on this door: LOAD ENDED 11/20 4:26:54p PT while status is IN_PROGRESS - STALE/anomaly, no open-ended duration asserted · TASK-5426967 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/20 3:25:06p PT · started 11/20 3:34:22p PT · checked in 11/20 3:34:33p PT · updated 11/20 7:18:03p PT · seal 25010977 · 1 load: LOAD-5044988 (50101970, DN-3472121) at status LOADED · entry ET-1184639 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK52 · Also on this door: LOAD 19h58m since 11/20 8:22:19p PT · TASK-5427049 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/20 8:13:27p PT · started 11/20 8:22:19p PT · checked in 11/20 8:22:25p PT · updated 11/20 10:52:00p PT · seal 25010976 · 2 loads: LOAD-5045101 (50102099, DN-3474622) at status LOADED; LOAD-5044983 (50101959, DN-3472277) at status LOADED · entry ET-1184706 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK52 · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1184706 (row updated 11/21 1:01:04a PT) · last load task to close here: 11/20 10:02:15a PT TASK-5425788 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 11/11 2:39:35p PT TASK-5417998 (Nanci Viviana Rosas, customer ORG-585450, CLOSED)",
    anomaly: true,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5426879"],
    duration: "On this door: LOAD 26h01m since 11/20 2:18:45p PT · TASK-5426879 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/20 2:18:15p PT · started 11/20 2:18:45p PT · checked in 11/20 2:18:47p PT · updated 11/20 7:27:50p PT · seal 1378803 · 3 loads: LOAD-5045194 (50102170, DN-3477779) at status LOADED; LOAD-5045099 (50102095, DN-3475114) at status LOADED; LOAD-5045100 (50102097, DN-3475003) at status LOADED · entry ET-1184608 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK53 · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1184608 (row updated 11/21 1:00:54a PT) · last load task to close here: 11/20 2:05:15p PT TASK-5426740 (RENATO ROSALES GARCIA, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 10/29 11:01:54a PT TASK-5407284 (ARNULFO MUNGUIA, customer ORG-585450, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (RECEIVE IN_PROGRESS) + ARNULFO MUNGUIA (RECEIVE IN_PROGRESS) + ARNULFO MUNGUIA (LOAD IN_PROGRESS)",
    customer: "KARAKA, LLC + GURUNANDA, LLC",
    taskIds: ["TASK-5425183", "TASK-5426702", "TASK-5427068"],
    duration: "On this door: RECEIVE 55h01m since 11/19 9:18:25a PT · TASK-5425183 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/19 9:09:19a PT · started 11/19 9:18:25a PT · checked in 11/19 9:18:27a PT · updated 11/19 9:18:27a PT · 2 receipts: RN-194359 at status IN_PROGRESS · PO POKRK3028 · container HOUU9907931 · reference M26_SHA45 · appointment 11/19 9:00:00a PT · receivedStart 11/19 9:18:25a PT; RN-194358 at status IN_PROGRESS · PO POILO2103 · container HOUU9907931 · reference M26_SHA45 · appointment 11/19 9:00:00a PT · receivedStart 11/19 9:18:25a PT · entry ET-1183546 · customer ORG-585450 (KARAKA, LLC) · door DOCK54 · Also on this door: RECEIVE 27h01m since 11/20 1:19:04p PT · TASK-5426702 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/20 12:04:46p PT · started 11/20 1:19:04p PT · checked in 11/20 1:19:13p PT · updated 11/20 1:32:15p PT · 2 receipts: RN-195735 at status IN_PROGRESS · PO POBOK0573_ship_1 · container UNKNOWN - LCL · reference 24734515 · appointment 11/20 2:00:00p PT · receivedStart 11/20 1:19:04p PT; RN-195733 at status IN_PROGRESS · PO POBOK0444 · container UNKNOWN - LCL · reference 24734515 · appointment 11/20 2:00:00p PT · receivedStart 11/20 1:19:04p PT · entry ET-1184507 · customer ORG-585450 (KARAKA, LLC) · door DOCK54 · Also on this door: LOAD 17h14m since 11/20 11:05:39p PT · TASK-5427068 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/20 10:57:47p PT · started 11/20 11:05:39p PT · checked in 11/20 11:05:41p PT · updated 11/20 11:30:52p PT · seal 25010940 · 1 load: LOAD-5045103 (50102103, DN-3474594) at status LOADED · entry ET-1184745 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK54 · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1184745 (row updated 11/21 1:00:42a PT) · last load task to close here: 11/20 8:43:38a PT TASK-5425775 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 7 loads) · last receive task to close here: 11/19 6:26:40p PT TASK-5425254 (ARNULFO MUNGUIA, customer ORG-585450, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "A1SG (RECEIVE NEW) + GONZALO RANGEL (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5425381", "TASK-5426833"],
    duration: "On this door: RECEIVE not started · TASK-5425381 · A1SG (assigneeUserId 1910160202361942018) · NEW · DOCK · task created 11/19 10:41:33a PT · started no startTime · not checked in at dock · updated 11/19 10:41:33a PT · 1 receipt: RN-5011671 at status IMPORTED · PO PO9466 · container Leafchem11192026 · reference none · appointment 11/19 10:00:00a PT · receivedStart none · entry ET-1183963 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK55 · Also on this door: RECEIVE not started · TASK-5426833 · GONZALO RANGEL (assigneeUserId 1932077579955884033) · NEW · DOCK · task created 11/20 1:30:45p PT · started no startTime · not checked in at dock · updated 11/20 1:30:45p PT · 1 receipt: RN-195922 at status IMPORTED · PO FUS11192026UNIS-107 · container none · reference 1185149-1 · appointment 11/20 8:00:00a PT · receivedStart none · entry ET-1184562 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK55 · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1184148 (row updated 11/20 4:59:32p PT) · last load task to close here: 11/20 2:06:03p PT TASK-5426568 (DANIEL BELTRAN, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 11/20 5:02:18p PT TASK-5425838 (ARNULFO MUNGUIA, customer ORG-585450, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1184346 (row updated 11/20 10:59:27a PT) · last load task to close here: 11/20 10:58:58a PT TASK-5426242 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 2 loads) · last receive task to close here: 11/11 12:11:56p PT TASK-5418081 (Nanci Viviana Rosas, customer ORG-585450, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (RECEIVE IN_PROGRESS)",
    customer: "KARAKA, LLC",
    taskIds: ["TASK-5426441"],
    duration: "On this door: RECEIVE 30h08m since 11/20 10:11:49a PT · TASK-5426441 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/20 10:06:52a PT · started 11/20 10:11:49a PT · checked in 11/20 10:11:51a PT · updated 11/20 10:14:50a PT · 1 receipt: RN-194652 at status IN_PROGRESS · PO POILO2101_ship_1 · container TXGU7467952 · reference Diana_LCL_YT91 · appointment 11/20 10:00:00a PT · receivedStart 11/20 10:11:49a PT · entry ET-1183830 · task note \"DOCK   57   ET-1183830\" · customer ORG-585450 (KARAKA, LLC) · door DOCK57 · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1184457 (row updated 11/20 12:40:48p PT) · last load task to close here: 11/20 12:33:18p PT TASK-5426533 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 11/20 12:40:53p PT TASK-5425944 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1184478 (row updated 11/21 1:00:31a PT) · last load task to close here: 11/20 3:16:48p PT TASK-5426582 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 3 loads) · last receive task to close here: 11/20 12:18:57p PT TASK-5425943 (CANDY MENDEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1184470 (row updated 11/21 1:00:08a PT) · last load task to close here: 11/16 3:17:16p PT TASK-5422412 (DANIEL BELTRAN, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 11/20 8:09:54a PT TASK-5424859 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1179653 (row updated 11/21 12:59:53a PT) · last load task to close here: 11/05 2:50:10p PT TASK-5413376 (JULIO CESAR Alvarado, customer ORG-655875, CLOSED, 5 loads) · last receive task to close here: 10/23 7:21:53p PT TASK-5402543 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1184658 (row updated 11/20 8:21:42p PT) · last load task to close here: 11/13 10:56:09a PT TASK-5420400 (BARTOLO RAMIREZ, customer ORG-655875, CLOSED, 1 loads) · last receive task to close here: 11/20 8:21:45p PT TASK-5427010 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1184249 (row updated 11/20 8:38:31p PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/20 8:07:23p PT TASK-5425962 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5427009"],
    duration: "On this door: RECEIVE 19h55m since 11/20 8:24:51p PT · TASK-5427009 · DANIELA GONZALEZ (assigneeUserId 11769) · IN_PROGRESS · DOCK · task created 11/20 4:50:08p PT · started 11/20 8:24:51p PT · checked in 11/20 8:24:53p PT · updated 11/20 8:24:53p PT · 1 receipt: RN-5011687 at status IN_PROGRESS · PO FBIU5016100 · container FBIU5016100 · reference B00420884 · appointment 11/19 1:00:00p PT · receivedStart 11/20 8:24:51p PT · entry ET-1184657 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK63 · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1184657 (row updated 11/20 8:24:53p PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/20 9:48:37a PT TASK-5425869 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1182176 (row updated 11/19 3:44:57p PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/13 9:32:35p PT TASK-5420980 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1179941 (row updated 11/21 12:59:34a PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/10 11:38:02a PT TASK-5413519 (Nanci Viviana Rosas, customer ORG-585450, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5425867"],
    duration: "On this door: RECEIVE 48h46m since 11/19 3:33:45p PT · TASK-5425867 · DANIELA GONZALEZ (assigneeUserId 11769) · IN_PROGRESS · DOCK · task created 11/19 3:32:37p PT · started 11/19 3:33:45p PT · checked in 11/19 3:33:47p PT · updated 11/19 3:33:47p PT · 1 receipt: RN-5011643 at status IN_PROGRESS · PO SLPU5014970 · container SLPU5014970 · reference B00418069 · appointment 11/18 10:00:00a PT · receivedStart 11/19 3:33:45p PT · entry ET-1184169 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK66 · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1184169 (row updated 11/19 8:43:49p PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/18 8:59:49p PT TASK-5424855 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: "JORGE ANTONIO FRANCO (RECEIVE IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5426207"],
    duration: "On this door: RECEIVE 31h41m since 11/20 8:38:40a PT · TASK-5426207 · JORGE ANTONIO FRANCO (assigneeUserId 1948070158297014498) · IN_PROGRESS · DOCK · task created 11/20 8:32:20a PT · started 11/20 8:38:40a PT · checked in 11/20 8:39:31a PT · updated 11/20 8:39:31a PT · 1 receipt: RN-5011708 at status IN_PROGRESS · PO 9493 · container CORRU112026UNIS · reference none · appointment 11/20 10:00:00a PT · receivedStart 11/20 8:38:40a PT · entry ET-1184314 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK67 · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1184314 (row updated 11/20 8:39:32a PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/18 8:21:46a PT TASK-5423799 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1184494 (row updated 11/21 12:59:26a PT) · last load task to close here: 11/20 12:57:47p PT TASK-5426700 (DANIEL BELTRAN, customer ORG-655875, CLOSED, 2 loads) · last receive task to close here: 11/02 3:06:46p PT TASK-5408610 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "On this door: RECEIVE not started · TASK-5381972 · Jorge Antonio Franco (assigneeUserId 2060441422549078018) · NEW · DOCK · task created 09/30 10:46:50a PT · started no startTime · not checked in at dock · updated 09/30 10:48:35a PT · 1 receipt: RN-5010583 at status IMPORTED · PO PO9139-2 · container Jpack09242026 · reference none · appointment none · receivedStart none · entry ET-1162686 · task note \"DOCK   69 ET-1162686\" · customer ORG-655875 (GURUNANDA, LLC) · door DOCK69 · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1183276 (row updated 11/21 12:59:06a PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/17 7:25:08p PT TASK-5423772 (JESUS ESPINOZA, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1172826 (row updated 11/21 12:58:57a PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 10/21 9:42:23a PT TASK-5399423 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1182729 (row updated 11/21 12:58:47a PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 11/17 12:58:36p PT TASK-5422515 (CANDY MENDEZ, customer ORG-655875, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1176051 (row updated 11/21 12:58:38a PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 -> now pull window · last receive task to close here: 10/27 6:45:00p PT TASK-5405554 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 20
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 0
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 11
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 2
const available = doors.filter((d) => d.status === "Available").length; // 3

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors Occupied",
    value: "20/23",
    numerator: 20,
    denominator: 23,
    percentage: Math.round((20 / 23) * 100),
  },
  {
    label: "Doors w/ Active Tasks",
    value: "11",
    numerator: 11,
    denominator: 23,
    percentage: Math.round((11 / 23) * 100),
  },
  {
    label: "Doors Available",
    value: "3",
    numerator: 3,
    denominator: 23,
    percentage: Math.round((3 / 23) * 100),
  },
  {
    label: "Anomalies",
    value: "2",
    numerator: 2,
    denominator: 23,
    percentage: Math.round((2 / 23) * 100),
  },
];

// Doors that carried dockStatus RESERVED at this pull: 0. It is
// held/reserved rather than free, so "not fully free" doors total 20 of 23.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee - GURUNANDA scope (the dashboard cards).
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, 11/21 4:20:22p PT).
// 13 active-status GURUNANDA tasks at Bay-4 doors: 6 LOAD + 7 RECEIVE, at 10 distinct doors
// (DOCK50, DOCK51, DOCK52, DOCK53, DOCK54, DOCK55, DOCK63, DOCK66, DOCK67, DOCK69).
//       ARNULFO MUNGUIA (5): TASK-5427068 LOAD IN_PROGRESS (DOCK54), TASK-5427049 LOAD IN_PROGRESS (DOCK52), TASK-5426967 LOAD IN_PROGRESS (DOCK52), TASK-5426879 LOAD IN_PROGRESS (DOCK53), TASK-5425811 LOAD IN_PROGRESS (DOCK52)
//       DANIELA GONZALEZ (2): TASK-5427009 RECEIVE IN_PROGRESS (DOCK63), TASK-5425867 RECEIVE IN_PROGRESS (DOCK66)
//       A1SG (1): TASK-5425381 RECEIVE NEW (DOCK55)
//       daira gonzalez (1): TASK-5090739 RECEIVE IN_PROGRESS (DOCK50)
//       EDUARDO MEJIA (1): TASK-5426987 LOAD IN_PROGRESS (DOCK51)
//       GONZALO RANGEL (1): TASK-5426833 RECEIVE NEW (DOCK55)
//       Jorge Antonio Franco (1): TASK-5381972 RECEIVE NEW (DOCK69)
//       JORGE ANTONIO FRANCO (1): TASK-5426207 RECEIVE IN_PROGRESS (DOCK67)
// All names/ids are resolved verbatim from the WMS task payloads
// (assigneeUserName / assigneeUserId); no name was normalised or guessed.
// Adding the non-GURUNANDA tasks would make ARNULFO MUNGUIA 9 and the total
// 17 (see bay4AllCustomerActiveTaskCount) - they are KARAKA, LLC receive tasks.
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 5 },
  { name: "DANIELA GONZALEZ", taskCount: 2 },
  { name: "A1SG", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
  { name: "EDUARDO MEJIA", taskCount: 1 },
  { name: "GONZALO RANGEL", taskCount: 1 },
  { name: "Jorge Antonio Franco", taskCount: 1 },
  { name: "JORGE ANTONIO FRANCO", taskCount: 1 },
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

// Mix: 7 RECEIVE + 6 LOAD = 13 active Bay-4 GURUNANDA tasks. The physical
// all-customer mix is 11 RECEIVE + 6 LOAD = 17 (the 4 extra receive tasks are
// KARAKA, LLC on DOCK50, DOCK54, DOCK57).
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 7, total: 13 },
  { label: "Outbound (LOAD)", count: 6, total: 13 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 6, total: 13 },
  { label: "Inbound", count: 7, total: 13 },
];

// --- Schedule Data (11/21 4:20:22p PT, Saturday) ---
// Both percentages use the SAME UTC-derived 11/21 PT business-day window,
// 2026-11-21 08:00:00 -> 2026-11-22 07:59:59 (see TIMESTAMP SEMANTICS in the
// file header; this window is the only one used anywhere in this file):
//   % scheduled inbounds received TODAY: 0 GURUNANDA receipts carry an appointmentTime
//   inside that window (totalCount 0, 0 rows read), so the denominator is zero
//   and the percentage is NOT COMPUTABLE. This is a genuine Saturday reading, not a
//   failed query - the identical call returns 12 receipts for the 11/20 PT day and 5
//   for the 11/23 PT day.
//   % scheduled outbounds loaded TODAY: 0 GURUNANDA orders carry a scheduleDate
//   inside that window (scheduleDatePeriod ["2026-11-21 08:00:00",
//   "2026-11-22 07:59:59"], totalCount 0, 0 rows read), so that denominator is
//   zero too and the percentage is NOT COMPUTABLE. Re-verified the same way: 59
//   orders for the 11/20 PT day, 87 for the 11/23 PT day.
//   SHIPPED is the "loaded" proxy defined by the prior refreshes; it is kept for the
//   day the window is non-empty.
//   Because both denominators are zero the two cards render their explicit
//   "not computable" state - no value here is estimated or carried over.
export const scheduleAvailable = false;             // 0 GURUNANDA receipts scheduled on 11/21 - denominator zero
export const outboundScheduleAvailable = false;     // 0 GURUNANDA orders scheduled on 11/21 - denominator zero
export const scheduledInboundOrders = 0;            // receipts with appointmentTime in the 11/21 PT day
export const scheduledOutboundOrders = 0;           // orders with scheduleDate in the 11/21 PT day
export const scheduledInboundReceived = 0;          // no receipt in an empty set
export const scheduledOutboundLoaded = 0;           // no order in an empty set
export const pctScheduledInboundReceived = 0;       // not computable - 0 of 0
export const pctScheduledOutboundLoaded = 0;        // not computable - 0 of 0
// Last operating day (11/20 PT), recorded for comparability ONLY - it is not what the
// two cards show: receipts 12 scheduled of which 3 received
// (25.0%); orders 59 scheduled of which 19 SHIPPED (32.2%, plus 1 LOADED).
// Facility-wide schedule context for the 11/21 PT day, all customers (same two
// endpoints, no customerId filter, same UTC-derived PT-day window):
// 0 receipts scheduled, of which 0 carry a receivedStartTime; 11 orders scheduled by
// totalCount, 11 of them at status IMPORTED.
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 11;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime where a task exists on
// the door, has actually started and has not already ended; unavailable for
// task-less doors and for NEW tasks with no startTime (WMS has no
// occupancy-start field).
// 12 of 23 doors carry no active task at this pull and
// 5 of the 17 active tasks have no duration basis (3 NEW tasks with no startTime
// plus the 2 stale tasks that already carry an endTime), so a duration exists for 12 tasks on 9 doors
// (DOCK54 RECEIVE 55h01m, DOCK52 LOAD 49h23m, DOCK66 RECEIVE 48h46m, DOCK67 RECEIVE 31h41m, DOCK57 RECEIVE 30h08m, DOCK54 RECEIVE 27h01m, DOCK53 LOAD 26h01m, DOCK51 LOAD 24h14m, DOCK50 RECEIVE 23h39m, DOCK52 LOAD 19h58m, DOCK63 RECEIVE 19h55m, DOCK54 LOAD 17h14m, all measured to the
// 11/21 4:20:22p PT reference).
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, 11/21 4:20:22p PT)
// 17 tasks total: 6 LOAD + 11 RECEIVE (13 GURUNANDA + 4 KARAKA, LLC). 2 are
// data anomalies (TASK-5426967, TASK-5090739).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// ARNULFO MUNGUIA has 116 CLOSED GURUNANDA load transactions with endTime inside
// the 2026-10-31 00:00:00 UTC - now window, 98 of them at Bay-4 doors:
// DOCK52 17, DOCK51 15, DOCK54 15, DOCK53 14, DOCK56 9, DOCK50 9, DOCK55 9, DOCK57 5, DOCK58 2, DOCK60 2, DOCK59 1;
// the other 18 are off Bay 4 (DOCK10 4, DOCK4 4, DOCK9 2, DOCK8 2, DOCK7 2, DOCK5 2, DOCK6 1, DOCK45 1); per-day counts by endTime (PT):
// 11/20 6, 11/19 9, 11/18 8, 11/17 10, 11/16 7, 11/13 8, 11/12 12, 11/11 4, 11/10 10, 11/09 6, 11/06 8, 11/05 4, 11/04 11, 11/03 6, 11/02 7.
// The newest transaction is DOCK58 TASK-5426582 (closed 11/20 3:16:48p PT) - also the
// newest at a Bay-4 door.
// He currently holds 9 open Bay-4 tasks: DOCK54 TASK-5427068 (LOAD), DOCK52 TASK-5427049 (LOAD), DOCK52 TASK-5426967 (LOAD), DOCK53 TASK-5426879 (LOAD), DOCK52 TASK-5425811 (LOAD), DOCK50 TASK-5426910 (RECEIVE), DOCK54 TASK-5426702 (RECEIVE), DOCK57 TASK-5426441 (RECEIVE), DOCK54 TASK-5425183 (RECEIVE).
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
    pieces: "RECEIVE 23h39m since 11/20 4:40:57p PT · TASK-5426910 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/20 2:43:28p PT · started 11/20 4:40:57p PT · checked in 11/20 4:40:59p PT · updated 11/20 4:41:49p PT · 1 receipt: RN-195393 at status IN_PROGRESS · PO POBOK0512 · container UNKNOWN - LCL · reference SPR44475617 · appointment 11/17 10:00:00a PT · receivedStart 11/20 4:40:57p PT · entry ET-1184618 · customer ORG-585450 (KARAKA, LLC) · door DOCK50",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5426987",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "LOAD 24h14m since 11/20 4:06:22p PT · TASK-5426987 · EDUARDO MEJIA (assigneeUserId 2029638366082560001) · IN_PROGRESS · PRE_LOAD · task created 11/20 4:03:05p PT · started 11/20 4:06:22p PT · checked in 11/20 4:06:31p PT · updated 11/20 8:22:16p PT · seal 1378854 · 1 load: LOAD-5044982 (50101958, DN-3472278) at status LOADED · entry ET-1184648 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK51",
    assignee: "EDUARDO MEJIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5425811",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "LOAD 49h23m since 11/19 2:56:29p PT · TASK-5425811 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/19 2:39:50p PT · started 11/19 2:56:29p PT · checked in 11/19 2:56:52p PT · updated 11/20 11:45:43a PT · seal 1378810 · 1 load: LOAD-5044981 (50101956, DN-3472288) at status LOADED · entry ET-1184121 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK52",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5426967",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "LOAD ENDED 11/20 4:26:54p PT while status is IN_PROGRESS - STALE/anomaly, no open-ended duration asserted · TASK-5426967 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/20 3:25:06p PT · started 11/20 3:34:22p PT · checked in 11/20 3:34:33p PT · updated 11/20 7:18:03p PT · seal 25010977 · 1 load: LOAD-5044988 (50101970, DN-3472121) at status LOADED · entry ET-1184639 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK52",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5427049",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "LOAD 19h58m since 11/20 8:22:19p PT · TASK-5427049 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/20 8:13:27p PT · started 11/20 8:22:19p PT · checked in 11/20 8:22:25p PT · updated 11/20 10:52:00p PT · seal 25010976 · 2 loads: LOAD-5045101 (50102099, DN-3474622) at status LOADED; LOAD-5044983 (50101959, DN-3472277) at status LOADED · entry ET-1184706 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK52",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5426879",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "LOAD 26h01m since 11/20 2:18:45p PT · TASK-5426879 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/20 2:18:15p PT · started 11/20 2:18:45p PT · checked in 11/20 2:18:47p PT · updated 11/20 7:27:50p PT · seal 1378803 · 3 loads: LOAD-5045194 (50102170, DN-3477779) at status LOADED; LOAD-5045099 (50102095, DN-3475114) at status LOADED; LOAD-5045100 (50102097, DN-3475003) at status LOADED · entry ET-1184608 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK53",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5425183",
    dns: "RECEIVE",
    customer: "KARAKA, LLC",
    pieces: "RECEIVE 55h01m since 11/19 9:18:25a PT · TASK-5425183 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/19 9:09:19a PT · started 11/19 9:18:25a PT · checked in 11/19 9:18:27a PT · updated 11/19 9:18:27a PT · 2 receipts: RN-194359 at status IN_PROGRESS · PO POKRK3028 · container HOUU9907931 · reference M26_SHA45 · appointment 11/19 9:00:00a PT · receivedStart 11/19 9:18:25a PT; RN-194358 at status IN_PROGRESS · PO POILO2103 · container HOUU9907931 · reference M26_SHA45 · appointment 11/19 9:00:00a PT · receivedStart 11/19 9:18:25a PT · entry ET-1183546 · customer ORG-585450 (KARAKA, LLC) · door DOCK54",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5426702",
    dns: "RECEIVE",
    customer: "KARAKA, LLC",
    pieces: "RECEIVE 27h01m since 11/20 1:19:04p PT · TASK-5426702 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/20 12:04:46p PT · started 11/20 1:19:04p PT · checked in 11/20 1:19:13p PT · updated 11/20 1:32:15p PT · 2 receipts: RN-195735 at status IN_PROGRESS · PO POBOK0573_ship_1 · container UNKNOWN - LCL · reference 24734515 · appointment 11/20 2:00:00p PT · receivedStart 11/20 1:19:04p PT; RN-195733 at status IN_PROGRESS · PO POBOK0444 · container UNKNOWN - LCL · reference 24734515 · appointment 11/20 2:00:00p PT · receivedStart 11/20 1:19:04p PT · entry ET-1184507 · customer ORG-585450 (KARAKA, LLC) · door DOCK54",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5427068",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "LOAD 17h14m since 11/20 11:05:39p PT · TASK-5427068 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/20 10:57:47p PT · started 11/20 11:05:39p PT · checked in 11/20 11:05:41p PT · updated 11/20 11:30:52p PT · seal 25010940 · 1 load: LOAD-5045103 (50102103, DN-3474594) at status LOADED · entry ET-1184745 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK54",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5425381",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE not started · TASK-5425381 · A1SG (assigneeUserId 1910160202361942018) · NEW · DOCK · task created 11/19 10:41:33a PT · started no startTime · not checked in at dock · updated 11/19 10:41:33a PT · 1 receipt: RN-5011671 at status IMPORTED · PO PO9466 · container Leafchem11192026 · reference none · appointment 11/19 10:00:00a PT · receivedStart none · entry ET-1183963 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK55",
    assignee: "A1SG",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5426833",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE not started · TASK-5426833 · GONZALO RANGEL (assigneeUserId 1932077579955884033) · NEW · DOCK · task created 11/20 1:30:45p PT · started no startTime · not checked in at dock · updated 11/20 1:30:45p PT · 1 receipt: RN-195922 at status IMPORTED · PO FUS11192026UNIS-107 · container none · reference 1185149-1 · appointment 11/20 8:00:00a PT · receivedStart none · entry ET-1184562 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK55",
    assignee: "GONZALO RANGEL",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5426441",
    dns: "RECEIVE",
    customer: "KARAKA, LLC",
    pieces: "RECEIVE 30h08m since 11/20 10:11:49a PT · TASK-5426441 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/20 10:06:52a PT · started 11/20 10:11:49a PT · checked in 11/20 10:11:51a PT · updated 11/20 10:14:50a PT · 1 receipt: RN-194652 at status IN_PROGRESS · PO POILO2101_ship_1 · container TXGU7467952 · reference Diana_LCL_YT91 · appointment 11/20 10:00:00a PT · receivedStart 11/20 10:11:49a PT · entry ET-1183830 · task note \"DOCK   57   ET-1183830\" · customer ORG-585450 (KARAKA, LLC) · door DOCK57",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK57",
  },
  {
    taskId: "TASK-5427009",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE 19h55m since 11/20 8:24:51p PT · TASK-5427009 · DANIELA GONZALEZ (assigneeUserId 11769) · IN_PROGRESS · DOCK · task created 11/20 4:50:08p PT · started 11/20 8:24:51p PT · checked in 11/20 8:24:53p PT · updated 11/20 8:24:53p PT · 1 receipt: RN-5011687 at status IN_PROGRESS · PO FBIU5016100 · container FBIU5016100 · reference B00420884 · appointment 11/19 1:00:00p PT · receivedStart 11/20 8:24:51p PT · entry ET-1184657 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK63",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK63",
  },
  {
    taskId: "TASK-5425867",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE 48h46m since 11/19 3:33:45p PT · TASK-5425867 · DANIELA GONZALEZ (assigneeUserId 11769) · IN_PROGRESS · DOCK · task created 11/19 3:32:37p PT · started 11/19 3:33:45p PT · checked in 11/19 3:33:47p PT · updated 11/19 3:33:47p PT · 1 receipt: RN-5011643 at status IN_PROGRESS · PO SLPU5014970 · container SLPU5014970 · reference B00418069 · appointment 11/18 10:00:00a PT · receivedStart 11/19 3:33:45p PT · entry ET-1184169 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK66",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK66",
  },
  {
    taskId: "TASK-5426207",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE 31h41m since 11/20 8:38:40a PT · TASK-5426207 · JORGE ANTONIO FRANCO (assigneeUserId 1948070158297014498) · IN_PROGRESS · DOCK · task created 11/20 8:32:20a PT · started 11/20 8:38:40a PT · checked in 11/20 8:39:31a PT · updated 11/20 8:39:31a PT · 1 receipt: RN-5011708 at status IN_PROGRESS · PO 9493 · container CORRU112026UNIS · reference none · appointment 11/20 10:00:00a PT · receivedStart 11/20 8:38:40a PT · entry ET-1184314 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK67",
    assignee: "JORGE ANTONIO FRANCO",
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
