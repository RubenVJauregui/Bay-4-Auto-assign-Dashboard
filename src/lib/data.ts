/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-20 9:53a PT (live WISE / WMS-BAM APIs)
 *   Every value below was re-read live in ONE pass at the reference
 *   2026-11-20T17:53:21+00:00 = 9:53:21a PT.
 *   The 23 door rows, the active load/receive task sets, the two schedule
 *   denominators, the closed-task sets and the planned-order count all come from
 *   that single pass. Nothing here is carried over from an earlier snapshot except
 *   the all-time assignee baseline, which is explicitly labelled as carried forward.
 *   Live WISE counts drift between passes - a re-read three minutes earlier in the
 *   same session returned planned orders 235 (vs 234 here) and 85
 *   active load tasks (vs 86 here) - so treat this file as a
 *   point-in-time snapshot at the reference above, not a rolling average.
 *
 *   TIMESTAMP SEMANTICS - single authority for this file, re-verified at this pull:
 *   WISE/WMS-BAM returns task, receipt, order and appointment timestamps as UTC
 *   strings with NO offset. They are NOT facility wall-clock. Render PT with a real
 *   zone conversion: PST = UTC-8 (on/after 2026-11-01). Evidence read at this pull:
 *   TASK-5425183 (DOCK54 receive) startTime 2026-11-19T17:18:25 = 11/19 9:18:25a PT;
 *   receipt RN-5011651 appointmentTime 2026-11-20T18:00:00 = 11/20 10:00:00a PT with
 *   receivedStartTime 2026-11-20T06:35:42 = 11/19 10:35:42p PT; TASK-5425893 endTime
 *   2026-11-20T17:24:07 = 11/20 9:24:07a PT.
 *   Consequently "the 11/20 PT business day" used for the two schedule percentages is
 *   the UTC window 2026-11-20 08:00:00 -> 2026-11-21 07:59:59, and that is the ONLY
 *   window used in this file.
 *   QUERY MODE - this pull used the raw-UTC mode (no item-time-zone header), the same
 *   mode as every prior snapshot, so windows stay comparable pull to pull.
 *   Durations are measured to the 9:53:21a PT pull reference.
 *
 *   SOURCES USED AT THIS PULL:
 *     - POST /wms-bam/wms-location/search, body {exactlyNames:[DOCK50..DOCK72]}
 *       -> code 0, 23/23 rows (category DOCK, type DOCK, status USABLE on all 23,
 *       dockStatus, spaceStatus, occupiedCustomerIds, entryId, updatedTime).
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer filter)
 *       -> totalCount 86, all 86 read; 4 of them sit on a Bay-4 dockName.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer filter)
 *       -> totalCount 101, all 101 read; 11 of them sit on a Bay-4 dockName.
 *     - POST /wms-bam/inbound/receipt/search-by-paging
 *       {customerId: ORG-655875, appointmentTimeFrom "2026-11-20 08:00:00",
 *       appointmentTimeTo "2026-11-21 07:59:59"} -> totalCount 11, all 11 read,
 *       2 carry a receivedStartTime.
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, scheduleDatePeriod ["2026-11-20 08:00:00",
 *       "2026-11-21 07:59:59"]} -> totalCount 42, all 42 read,
 *       statuses {"IMPORTED": 1, "PLANNED": 16, "PICKED": 15, "SHIPPED": 8, "PICKING": 2}.
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], endTimeFrom "2026-10-31 00:00:00"
 *       -> totalCount 917 (all customers), all 917 read. Per-door "last load task
 *       to close here" is read from this set. The ARNULFO MUNGUIA / GURUNANDA subset is
 *       measured on the same set (customerId ORG-655875 + assigneeUserIds [89,
 *       1948070158297014318]) -> 112 transactions, 94 of them at Bay-4 doors.
 *       Newest load closure anywhere in the facility: 11/20 9:49:09a PT
 *       (TASK-5426303, DOCK35, JOSE MORALES).
 *       Newest at a Bay-4 door: 11/20 9:24:07a PT
 *       (TASK-5425893, DOCK51, ARNULFO MUNGUIA).
 *       NOTE: orderBy/sort are not supported on this endpoint (they null out
 *       totalCount); the endpoint returns newest endTime first. dockNames/dockIds
 *       filters are a NO-OP (they return the facility total) so door scoping is
 *       done client-side.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], newest first -> totalCount 17962; the
 *       newest 4000 were read, which contains every per-door "last receive task to
 *       close here" value below. The endTimeFrom filter is NOT applied to receive tasks
 *       at this pull (the same total is returned with and without it) - the read window
 *       above is what was actually inspected.
 *       Newest receive closure facility-wide: 11/20 9:41:26a PT
 *       (TASK-5426264, DOCK16, Viridiana Martinez).
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, status: PLANNED} -> totalCount 234.
 *     - Task-name keyword RE-TESTED at this pull: the load-task `keyword` filter is
 *       STILL A NO-OP. "Guru live out / in assign to Arnulfo" and a nonsense string
 *       ("zzzz-no-such-task-zzzz") both return the identical facility total,
 *       22882 / 22882. No plan or task group named "Guru live out / in
 *       assign to Arnulfo" can be resolved through keyword search, and all active Bay-4
 *       tasks carry projectId null, so there is no named task group to resolve. The
 *       "Guru live out / in assign to Arnulfo" stream is therefore reported as ARNULFO
 *       MUNGUIA's task-assignment transactions on the GURUNANDA live-out/live-in work,
 *       and nothing is invented.
 *
 *   SCOPE NOTE:
 *     The line-level metrics on this dashboard are GURUNANDA-scoped (the customer scope
 *     this dashboard has always published). At this pull 15 active tasks sit on Bay-4 doors
 *     across all customers (11 RECEIVE / 4 LOAD) while the GURUNANDA scope reads 13
 *     (9 RECEIVE / 4 LOAD). The two extra tasks are KARAKA, LLC (ORG-585450) receive
 *     tasks: DOCK54 TASK-5425183 IN_PROGRESS (ARNULFO MUNGUIA) and DOCK55 TASK-5425838 NEW
 *     (Luis Alberto Paredes). bay4AllCustomerActiveTaskCount / ...ReceiveCount / ...LoadCount
 *     export the physical numbers so the divergence stays explicit. Door status itself is
 *     physical (a door is occupied no matter which customer is on it).
 *
 *   Key state at this pull:
 *     - DOOR STATUS: occupied 19, reserved 1, available 3 (19+1+3 = 23). Only DOCK59, DOCK63 and DOCK64 are
 *       fully free (dock AVAILABLE + space EMPTY). Raw dockStatus: OCCUPIED 17, AVAILABLE 5, RESERVED 1. Raw
 *       spaceStatus: OCCUPIED 8, EMPTY 15. The single RESERVED door is DOCK51 (space OCCUPIED,
 *       entry ET-1184378) - the load task created there at 9:46:04a PT was moved to DOCK55 at
 *       9:48:57a PT, so the door is held but carries no active task. Two doors read dock
 *       AVAILABLE but space OCCUPIED and are therefore counted as Occupied: DOCK53 and
 *       DOCK54. A reservation is a held door, so it is reported in its own "Reserved"
 *       bucket rather than folded into "Occupied"; 20 of the 23 doors are therefore not
 *       fully free at this pull.
 *       Compare 11/19 09:44a PT: occupied 18, reserved 1, available 4.
 *     - ACTIVE TASKS: 15 tasks across all customers - 11 RECEIVE / 4 LOAD - at 11 distinct doors
 *       (DOCK50, DOCK52, DOCK54, DOCK55, DOCK56, DOCK57, DOCK58, DOCK62, DOCK66, DOCK67, DOCK69). GURUNANDA-scoped: 13 tasks
 *       (9 RECEIVE / 4 LOAD) at 10 doors (DOCK50, DOCK52, DOCK55, DOCK56, DOCK57, DOCK58, DOCK62, DOCK66, DOCK67, DOCK69).
 *       Compare 11/19 09:44a PT: 14 physical / 12 GURUNANDA.
 *     - ASSIGNMENTS BY ASSIGNEE (GURUNANDA, the dashboard cards):
 *       DANIELA GONZALEZ 5
 *       ARNULFO MUNGUIA 3
 *       A1SG 1
 *       DANIEL BELTRAN 1
 *       JORGE ANTONIO FRANCO 1
 *       Jorge Antonio Franco 1
 *       daira gonzalez 1 = 13.
 *       Names are reproduced exactly as WISE returns them in assigneeUserName ("A1SG" and
 *       "daira gonzalez" are returned verbatim; "JORGE ANTONIO FRANCO" and "Jorge Antonio
 *       Franco" are two distinct assigneeUserId values and are NOT merged). All-customer
 *       adds ARNULFO MUNGUIA on the second KARAKA task and Luis Alberto Paredes (KARAKA)
 *       -> 15 tasks, ARNULFO MUNGUIA 4.
 *     - LOAD PROGRESS: 4 active GURUNANDA Bay-4 load tasks - DOCK52 TASK-5425788
 *       (IN_PROGRESS, PRE_LOAD, started 11/19 3:45:23p PT), DOCK52 TASK-5425811 (IN_PROGRESS,
 *       PRE_LOAD, started 11/19 2:56:29p PT), DOCK56 TASK-5426242 (IN_PROGRESS, PRE_LOAD,
 *       started 9:10:51a PT) and DOCK55 TASK-5426379 (NEW, LIVE_LOAD, created 9:46:04a PT,
 *       reassigned to DANIEL BELTRAN and moved from DOCK51 to DOCK55 at 9:48:57a PT).
 *     - RECEIVE PROGRESS: 9 active GURUNANDA Bay-4 receive tasks - 6 IN_PROGRESS
 *       (DOCK55 TASK-5425960, DOCK57 TASK-5425944, DOCK58 TASK-5425943, DOCK66 TASK-5425867,
 *       DOCK67 TASK-5426207, plus the stale DOCK50 task below) and 3 NEW
 *       (DOCK55 TASK-5425381 A1SG, DOCK62 TASK-5425962, DOCK69 TASK-5381972).
 *     - ANOMALIES: 1, unchanged. TASK-5090739 (DOCK50, RECEIVE, started 2025-10-21
 *       12:21:14p PDT) is still returned by the active-status query although its endTime is
 *       2025-10-22 9:42:01a PDT and its linked receipt RN-5002143 is CLOSED. Flagged, not
 *       given an open-ended duration.
 *     - Task "Guru live out / in assign to Arnulfo": 112 CLOSED GURUNANDA load transactions with endTime
 *       from 2026-10-31 00:00:00 UTC, 94 at Bay-4 doors, 18 off Bay 4
 *       (DOCK10 4, DOCK4 4, DOCK45 1, DOCK5 2, DOCK6 1, DOCK7 2, DOCK8 2, DOCK9 2).
 *       Bay-4 breakdown: DOCK52 16, DOCK51 15, DOCK54 15, DOCK53 14, DOCK50 9, DOCK55 9, DOCK56 8, DOCK57 4, DOCK60 2, DOCK58 1, DOCK59 1.
 *       Per-day counts by endTime (PT): 11/20 2, 11/19 9, 11/18 8, 11/17 10, 11/16 7, 11/13 8, 11/12 12, 11/11 4, 11/10 10, 11/09 6, 11/06 8, 11/05 4, 11/04 11, 11/03 6, 11/02 7.
 *       Newest transaction: DOCK51 TASK-5425893, started 11/19 5:55:39p,
 *       closed 11/20 9:24:07a PT, 2 loads, seal 25010937. It is also the newest at a
 *       Bay-4 door. He currently holds 4 open Bay-4 tasks
 *       (DOCK56 TASK-5426242, DOCK52 TASK-5425811, DOCK52 TASK-5425788, DOCK54 TASK-5425183; DOCK54 is the KARAKA receive).
 *     - % scheduled inbounds received (11/20 PT): 2 of 11 = 18.2%. Computable - the denominator is
 *       non-zero - and genuinely low: of the 11 GURUNANDA receipts appointed for today, 2 carry a
 *       receivedStartTime (RN-5011708 started 8:38:40a PT for a 10:00a PT appointment;
 *       RN-5011651 started 11/19 10:35:42p PT for a 11/20 10:00a PT appointment - received
 *       ahead of its scheduled day, and counted here on the appointment-day basis this
 *       dashboard has always used).
 *     - % scheduled outbounds loaded (11/20 PT): 8 of 42 = 19.0% on the SHIPPED proxy this dashboard
 *       has always used (see the note on the constant). No order in the set is at status
 *       LOADED, so a loaded-inclusive read is also 8 of 42. Remaining:
 *       IMPORTED 1, PICKED 15, PICKING 2, PLANNED 16.
 *     - Inbound/outbound mix: 9 RECEIVE / 4 LOAD of 13 active GURUNANDA tasks
 *       (11 RECEIVE / 4 LOAD of 15 physical tasks across all customers).
 *     - Total doors occupied: 19 of 23 (plus 1 reserved, 3 available).
 *     - Planned GURUNANDA orders: live count 234 at this pull.
 *     - Door occupancy duration: available where an active task has a startTime and has not
 *       ended - 9 tasks on 8 doors at this pull
 *       (DOCK52 LOAD 18h07m, DOCK52 LOAD 18h56m, DOCK54 RECEIVE 24h34m, DOCK55 RECEIVE 11h17m, DOCK56 LOAD 0h42m, DOCK57 RECEIVE 12h56m, DOCK58 RECEIVE 14h39m, DOCK66 RECEIVE 18h19m, DOCK67 RECEIVE 1h14m), all measured to the
 *       9:53:21a PT reference. WMS has no occupancy-start field for task-less doors
 *       (12 of 23), for the NEW Bay-4 tasks, or for the one stale task, so no duration is
 *       asserted for those.
 *     - Facility-wide schedule context for the 11/20 PT day (no customerId filter, same
 *       window): receipts scheduled 43, of which 7 carry a receivedStartTime; orders scheduled
 *       1647, of which 352 are SHIPPED.
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
// it succeeds. Live totalCount was 234 at the 11/20 9:53a PT pull.
export const plannedGurunandaOrderCount = 234;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 2026-11-20 9:53a PT
//
// All 23 rows come from one /wms-bam/wms-location/search call
// (exactlyNames DOCK50..DOCK72); every row is category DOCK, type DOCK,
// status USABLE. Door status rule (unchanged, keeps the dashboard's 3-value
// enum):
//   Reserved  = dockStatus RESERVED (door is held/reserved, so it is not free)
//   Occupied  = dockStatus OCCUPIED OR spaceStatus OCCUPIED (not fully free)
//   Available = dockStatus AVAILABLE AND spaceStatus EMPTY
// Raw field values are preserved per door so the mapping can be re-checked.
// Totals: Occupied 19, Reserved 1, Available 3 = 23.
// Reserved door: DOCK51 (space OCCUPIED).
// Two further doors are dock AVAILABLE but still carry space OCCUPIED
// (DOCK53, DOCK54), so they count as Occupied. Fully free doors: DOCK59,
// DOCK63, DOCK64 - so 20 of 23 doors are not fully free.
// Raw tallies at this pull: dockStatus OCCUPIED 17 / AVAILABLE 5 / RESERVED 1;
// spaceStatus OCCUPIED 8 / EMPTY 15.
//
// BAY 4 ALL-CUSTOMER PHYSICAL TALLY (see SCOPE NOTE in the file header):
// active (NEW / IN_PROGRESS / EXCEPTION) tasks whose dockName is one of these
// 23 doors = 15 (RECEIVE 11, LOAD 4) on 11 doors. Two of the 11 receive tasks are
// KARAKA, LLC (ORG-585450), so the GURUNANDA-only tally is 13
// (RECEIVE 9, LOAD 4) on 10 doors.
// =====================================================================
export const bay4AllCustomerActiveTaskCount = 15;
export const bay4AllCustomerActiveReceiveCount = 11;
export const bay4AllCustomerActiveLoadCount = 4;

export const doors: DoorRecord[] = [
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "daira gonzalez (RECEIVE IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5090739"],
    duration: "On this door: RECEIVE TASK-5090739 · daira gonzalez (assigneeUserId 1948070158297014492) · IN_PROGRESS · DOCK · task created 10/20 9:38:05p PT · started 10/21 12:21:14p PT · not checked in at dock · updated 10/22 2:25:42p PT · 1 receipt: RN-5002143 at status CLOSED · PO EGSU8032696 · container EGSU8032696 · reference EGLV149507056809 · appointment 10/20 9:00:00a PT · receivedStart none · STALE: status still IN_PROGRESS although endTime is 10/22 9:42:01a PT and its linked receipt RN-5002143 is CLOSED - flagged, not given an open-ended duration · entry ET-1027622 · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1181371 (row updated 11/19 8:47:22p PT) · last load task to close here: 11/19 2:11:15p PT TASK-5425197 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 2 loads all SHIPPED) · last receive task to close here: 11/09 4:55:40p PT TASK-5416210 (DANIELA GONZALEZ, customer ORG-585450, FORCE_CLOSED)",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space OCCUPIED, occupiedCustomerIds none, entry ET-1184378 (row updated 11/20 9:46:06a PT) · last load task to close here: 11/20 9:24:07a PT TASK-5425893 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 2 loads all SHIPPED) · last receive task to close here: 11/13 10:42:38a PT TASK-5420402 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD IN_PROGRESS) + ARNULFO MUNGUIA (LOAD IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5425788", "TASK-5425811"],
    duration: "On this door: LOAD 18h07m since 11/19 3:45:23p PT · TASK-5425788 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/19 2:22:51p PT · started 11/19 3:45:23p PT · checked in 11/19 3:49:41p PT · updated 11/20 12:02:15a PT · no sealNo yet · 1 load: LOAD-5044992 (50101976, DN-3471788) at status LOADED · entry ET-1184101 · Also on this door: LOAD 18h56m since 11/19 2:56:29p PT · TASK-5425811 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/19 2:39:50p PT · started 11/19 2:56:29p PT · checked in 11/19 2:56:52p PT · updated 11/20 12:02:01a PT · seal 1378810 · 1 load: LOAD-5044981 (50101956, DN-3472288) at status LOADED · entry ET-1184121 · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1184101 (row updated 11/19 8:46:54p PT) · last load task to close here: 11/19 2:13:32p PT TASK-5424857 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 1 load all SHIPPED) · last receive task to close here: 11/11 2:39:35p PT TASK-5417998 (Nanci Viviana Rosas, customer ORG-585450, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1184298 (row updated 11/20 9:20:28a PT) · last load task to close here: 11/20 9:20:10a PT TASK-5426108 (DANIEL BELTRAN, customer ORG-655875, CLOSED, 1 load all SHIPPED) · last receive task to close here: 10/29 10:01:54a PT TASK-5407284 (ARNULFO MUNGUIA, customer ORG-585450, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (RECEIVE IN_PROGRESS)",
    customer: "KARAKA, LLC",
    taskIds: ["TASK-5425183"],
    duration: "On this door: RECEIVE 24h34m since 11/19 9:18:25a PT · TASK-5425183 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/19 9:09:19a PT · started 11/19 9:18:25a PT · not checked in at dock · updated 11/19 9:18:27a PT · 2 receipts: RN-194358 at status IN_PROGRESS · PO POILO2103 · container HOUU9907931 · reference M26_SHA45 · appointment 11/19 9:00:00a PT · receivedStart 11/19 9:18:25a PT; RN-194359 at status IN_PROGRESS · PO POKRK3028 · container HOUU9907931 · reference M26_SHA45 · appointment 11/19 9:00:00a PT · receivedStart 11/19 9:18:25a PT · entry ET-1183546 · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1184098 (row updated 11/20 9:05:42a PT) · last load task to close here: 11/20 8:43:38a PT TASK-5425775 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 7 loads all SHIPPED) · last receive task to close here: 11/19 6:26:40p PT TASK-5425254 (ARNULFO MUNGUIA, customer ORG-585450, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "A1SG (RECEIVE NEW) + Luis Alberto Paredes (RECEIVE NEW) + DANIELA GONZALEZ (RECEIVE IN_PROGRESS) + DANIEL BELTRAN (LOAD NEW)",
    customer: "GURUNANDA, LLC + KARAKA, LLC",
    taskIds: ["TASK-5425381", "TASK-5425838", "TASK-5425960", "TASK-5426379"],
    duration: "On this door: RECEIVE not started · RECEIVE TASK-5425381 · A1SG (assigneeUserId 1910160202361942018) · NEW · DOCK · task created 11/19 10:41:33a PT · started no startTime · not checked in at dock · updated 11/19 10:41:33a PT · 1 receipt: RN-5011671 at status IMPORTED · PO PO9466 · container Leafchem11192026 · appointment 11/19 10:00:00a PT · receivedStart none · entry ET-1183963 · Also on this door: RECEIVE not started · RECEIVE TASK-5425838 · Luis Alberto Paredes (assigneeUserId 2000828853478171162) · NEW · DOCK · task created 11/19 3:04:10p PT · started no startTime · not checked in at dock · updated 11/19 3:04:10p PT · 1 receipt: RN-195511 at status IMPORTED · PO POBOK0348_ship_1 · container UNKNOWN - LCL · reference 24695342 · appointment none · receivedStart none · entry ET-1184148 · Also on this door: RECEIVE 11h17m since 11/19 10:35:42p PT · TASK-5425960 · DANIELA GONZALEZ (assigneeUserId 11769) · IN_PROGRESS · DOCK · task created 11/19 9:42:15p PT · started 11/19 10:35:42p PT · not checked in at dock · updated 11/19 10:35:44p PT · 1 receipt: RN-5011651 at status IN_PROGRESS · PO HLBU3079404 · container HLBU3079404 · reference B00414569 · appointment 11/20 10:00:00a PT · receivedStart 11/19 10:35:42p PT · entry ET-1184248 · Also on this door: LOAD not started · LOAD TASK-5426379 · DANIEL BELTRAN (assigneeUserId 1932077596691410945) · NEW · LIVE_LOAD · task created 11/20 9:46:04a PT · started no startTime · not checked in at dock · updated 11/20 9:48:57a PT · no sealNo yet · 1 load: LOAD-5044974 (47174035 // SP BOL, DN-3466731) at status WINDOW_CHECKIN_DONE · entry ET-1184378 · task note \"DOCK   55 ET-1184378\" · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1184248 (row updated 11/20 9:48:59a PT) · last load task to close here: 11/19 2:23:49p PT TASK-5425649 (DANIEL BELTRAN, customer ORG-655875, CLOSED, 4 loads all SHIPPED) · last receive task to close here: 11/16 10:13:39a PT TASK-5421731 (Nanci Viviana Rosas, customer ORG-585450, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5426242"],
    duration: "On this door: LOAD 0h42m since 11/20 9:10:51a PT · TASK-5426242 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/20 8:49:14a PT · started 11/20 9:10:51a PT · checked in 11/20 9:10:57a PT · updated 11/20 9:32:50a PT · no sealNo yet · 2 loads: LOAD-5045102 (50102101, DN-3474595) at status LOADED; LOAD-5045114 (50102129, DN-3475539) at status WINDOW_CHECKIN_DONE · entry ET-1184346 · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1184346 (row updated 11/20 9:32:52a PT) · last load task to close here: 11/17 10:52:27a PT TASK-5423116 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 2 loads all SHIPPED) · last receive task to close here: 11/11 12:11:56p PT TASK-5418081 (Nanci Viviana Rosas, customer ORG-585450, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5425944"],
    duration: "On this door: RECEIVE 12h56m since 11/19 8:56:32p PT · TASK-5425944 · DANIELA GONZALEZ (assigneeUserId 11769) · IN_PROGRESS · DOCK · task created 11/19 5:55:00p PT · started 11/19 8:56:32p PT · not checked in at dock · updated 11/19 8:56:38p PT · 1 receipt: RN-5011695 at status IN_PROGRESS · PO HAMU2873662 · container HAMU2873662 · reference B00414575 · appointment 11/18 4:30:00p PT · receivedStart 11/19 8:56:32p PT · entry ET-1184215 · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1184215 (row updated 11/19 8:56:38p PT) · last load task to close here: 11/17 5:13:20p PT TASK-5423711 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 1 load all SHIPPED) · last receive task to close here: 11/19 10:30:18a PT TASK-5424364 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5425943"],
    duration: "On this door: RECEIVE 14h39m since 11/19 7:13:29p PT · TASK-5425943 · DANIELA GONZALEZ (assigneeUserId 11769) · IN_PROGRESS · DOCK · task created 11/19 5:53:05p PT · started 11/19 7:13:29p PT · not checked in at dock · updated 11/19 7:13:33p PT · 1 receipt: RN-5011645 at status IN_PROGRESS · PO OOLU6823127 · container OOLU6823127 · reference B00418068 · appointment 11/18 12:00:00p PT · receivedStart 11/19 7:13:29p PT · entry ET-1184213 · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1184213 (row updated 11/19 8:45:42p PT) · last load task to close here: 11/19 12:12:45p PT TASK-5425496 (ARNULFO MUNGUIA, customer ORG-655875, CLOSED, 2 loads all SHIPPED) · last receive task to close here: 11/17 8:40:26p PT TASK-5423720 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1183752 (row updated 11/20 8:09:50a PT) · last load task to close here: 11/16 3:17:16p PT TASK-5422412 (DANIEL BELTRAN, customer ORG-655875, CLOSED, 1 load all SHIPPED) · last receive task to close here: 11/20 8:09:54a PT TASK-5424859 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1179653 (row updated 11/19 8:45:13p PT) · last load task to close here: 11/05 2:50:10p PT TASK-5413376 (JULIO CESAR ALVARADO, customer ORG-655875, CLOSED, 5 loads all SHIPPED) · last receive task to close here: 10/23 6:21:53p PT TASK-5402543 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1183310 (row updated 11/20 6:06:02a PT) · last load task to close here: 11/13 10:56:09a PT TASK-5420400 (BARTOLO RAMIREZ, customer ORG-655875, CLOSED, 1 load all SHIPPED) · last receive task to close here: 11/18 6:26:13p PT TASK-5423792 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5425962"],
    duration: "On this door: RECEIVE not started · RECEIVE TASK-5425962 · DANIELA GONZALEZ (assigneeUserId 11769) · NEW · DOCK · task created 11/19 9:44:13p PT · started no startTime · not checked in at dock · updated 11/19 9:44:13p PT · 1 receipt: RN-5011691 at status IMPORTED · PO CSGU9025103 · container CSGU9025103 · reference B00420878 · appointment 11/19 11:00:00a PT · receivedStart none · entry ET-1184249 · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1183780 (row updated 11/20 6:05:26a PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: 11/19 10:24:43a PT TASK-5424885 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1184174 (row updated 11/20 9:48:31a PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: 11/20 9:48:37a PT TASK-5425869 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1182176 (row updated 11/19 3:44:57p PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: 11/13 9:32:35p PT TASK-5420980 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1179941 (row updated 11/19 8:44:06p PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: 11/10 11:38:02a PT TASK-5413519 (Nanci Viviana Rosas, customer ORG-585450, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5425867"],
    duration: "On this door: RECEIVE 18h19m since 11/19 3:33:45p PT · TASK-5425867 · DANIELA GONZALEZ (assigneeUserId 11769) · IN_PROGRESS · DOCK · task created 11/19 3:32:37p PT · started 11/19 3:33:45p PT · not checked in at dock · updated 11/19 3:33:47p PT · 1 receipt: RN-5011643 at status IN_PROGRESS · PO SLPU5014970 · container SLPU5014970 · reference B00418069 · appointment 11/18 10:00:00a PT · receivedStart 11/19 3:33:45p PT · entry ET-1184169 · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1184169 (row updated 11/19 8:43:49p PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: 11/18 8:59:49p PT TASK-5424855 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: "JORGE ANTONIO FRANCO (RECEIVE IN_PROGRESS)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5426207"],
    duration: "On this door: RECEIVE 1h14m since 11/20 8:38:40a PT · TASK-5426207 · JORGE ANTONIO FRANCO (assigneeUserId 1948070158297014498) · IN_PROGRESS · DOCK · task created 11/20 8:32:20a PT · started 11/20 8:38:40a PT · not checked in at dock · updated 11/20 8:39:31a PT · 1 receipt: RN-5011708 at status IN_PROGRESS · PO 9493 · container CORRU112026UNIS · appointment 11/20 10:00:00a PT · receivedStart 11/20 8:38:40a PT · entry ET-1184314 · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1184314 (row updated 11/20 8:39:32a PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: 11/18 8:21:46a PT TASK-5423799 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1177841 (row updated 11/19 8:43:39p PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: 11/02 3:06:46p PT TASK-5408610 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "On this door: RECEIVE not started · RECEIVE TASK-5381972 · Jorge Antonio Franco (assigneeUserId 2060441422549078018) · NEW · DOCK · task created 09/30 9:46:50a PT · started no startTime · not checked in at dock · updated 09/30 9:48:35a PT · 1 receipt: RN-5010583 at status IMPORTED · PO PO9139-2 · container Jpack09242026 · appointment none · receivedStart none · entry ET-1162686 · task note \"DOCK   69 ET-1162686\" · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1183276 (row updated 11/19 8:43:29p PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: 11/17 7:25:08p PT TASK-5423772 (JESUS ESPINOZA, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1172826 (row updated 11/19 8:43:10p PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: 10/21 8:42:23a PT TASK-5399423 (Fatima Ponce, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1182729 (row updated 11/19 8:43:01p PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: 11/17 12:58:36p PT TASK-5422515 (CANDY MENDEZ, customer ORG-655875, FORCE_CLOSED)",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1176051 (row updated 11/19 8:42:49p PT) · last load task to close here: no load task of any customer has closed here inside the 2026-10-31 - now pull window · last receive task to close here: 10/27 5:45:00p PT TASK-5405554 (DANIELA GONZALEZ, customer ORG-655875, CLOSED)",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 19
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 1
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 11
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 1
const available = doors.filter((d) => d.status === "Available").length; // 3

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

// Doors that carried dockStatus RESERVED at this pull: 1 (DOCK51). It is
// held/reserved rather than free, so "not fully free" doors total 20 of 23.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee - GURUNANDA scope (the dashboard cards).
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, 11/20 2026 9:53a PT).
// 13 active-status GURUNANDA tasks at Bay-4 doors: 4 LOAD + 9 RECEIVE, at 10 distinct doors
// (DOCK50, DOCK52, DOCK55, DOCK56, DOCK57, DOCK58, DOCK62, DOCK66, DOCK67, DOCK69).
//       DANIELA GONZALEZ (5): TASK-5425960 RECEIVE IN_PROGRESS (DOCK55), TASK-5425944 RECEIVE IN_PROGRESS (DOCK57), TASK-5425943 RECEIVE IN_PROGRESS (DOCK58), TASK-5425962 RECEIVE NEW (DOCK62), TASK-5425867 RECEIVE IN_PROGRESS (DOCK66)
//       ARNULFO MUNGUIA (3): TASK-5425788 LOAD IN_PROGRESS (DOCK52), TASK-5425811 LOAD IN_PROGRESS (DOCK52), TASK-5426242 LOAD IN_PROGRESS (DOCK56)
//       A1SG (1): TASK-5425381 RECEIVE NEW (DOCK55)
//       DANIEL BELTRAN (1): TASK-5426379 LOAD NEW (DOCK55)
//       JORGE ANTONIO FRANCO (1): TASK-5426207 RECEIVE IN_PROGRESS (DOCK67)
//       Jorge Antonio Franco (1): TASK-5381972 RECEIVE NEW (DOCK69)
//       daira gonzalez (1): TASK-5090739 RECEIVE IN_PROGRESS (DOCK50)
// All names/ids are resolved verbatim from the WMS task payloads
// (assigneeUserName / assigneeUserId); no name was normalised or guessed.
// Adding the non-GURUNANDA tasks would make ARNULFO MUNGUIA 4 and the total
// 15 (see bay4AllCustomerActiveTaskCount) - they are KARAKA, LLC receive tasks on
// DOCK54 (TASK-5425183 IN_PROGRESS) and DOCK55 (TASK-5425838 NEW, Luis Alberto Paredes).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "DANIELA GONZALEZ", taskCount: 5 },
  { name: "ARNULFO MUNGUIA", taskCount: 3 },
  { name: "A1SG", taskCount: 1 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "JORGE ANTONIO FRANCO", taskCount: 1 },
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

// Mix: 9 RECEIVE + 4 LOAD = 13 active Bay-4 GURUNANDA tasks. The physical
// all-customer mix is 11 RECEIVE + 4 LOAD = 15 (the two extra receive tasks are
// KARAKA, LLC on DOCK54 and DOCK55).
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 9, total: 13 },
  { label: "Outbound (LOAD)", count: 4, total: 13 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 13 },
  { label: "Inbound", count: 9, total: 13 },
];

// --- Schedule Data (2026-11-20, Friday) ---
// Both percentages use the SAME UTC-derived 11/20 PT business-day window,
// 2026-11-20 08:00:00 -> 2026-11-21 07:59:59 (see TIMESTAMP SEMANTICS in the
// file header; this window is the only one used anywhere in this file):
//   % scheduled inbounds received TODAY: exactly 11 GURUNANDA receipts carry an
//   appointmentTime inside that window (totalCount 11, all 11 read) and
//   2 of them carry a receivedStartTime = 2 / 11 = 18.2%.
//   Receipts in the set: RN-5011721, RN-195928, RN-195922, RN-195921, RN-195920, RN-5011708, RN-5011706, RN-5011705, RN-5011696, RN-5011652, RN-5011651.
//   Received: RN-5011708 (appointment 11/20 10:00:00a PT, started 11/20 8:38:40a PT), RN-5011651 (appointment 11/20 10:00:00a PT, started 11/19 10:35:42p PT).
//   % scheduled outbounds loaded TODAY: 42 GURUNANDA orders carry a scheduleDate
//   inside that window (scheduleDatePeriod ["2026-11-20 08:00:00",
//   "2026-11-21 07:59:59"], totalCount 42, all 42 read) of which 8 are at status
//   SHIPPED = 8 / 42 = 19.0%.
//   SHIPPED is the "loaded" proxy defined by the prior refreshes and kept here so
//   the trend stays comparable; no order in the set is at status LOADED, so a
//   LOADED-inclusive read is also 8 of 42.
//   Both numerators are real counts of a non-empty denominator, so neither card
//   is a "no schedule" state.
export const scheduleAvailable = true;              // 11 GURUNANDA receipts scheduled on 11/20
export const outboundScheduleAvailable = true;      // 42 GURUNANDA orders scheduled on 11/20
export const scheduledInboundOrders = 11;            // receipts with appointmentTime in the 11/20 PT day
export const scheduledOutboundOrders = 42;          // orders with scheduleDate in the 11/20 PT day
export const scheduledInboundReceived = 2;          // receipts with receivedStartTime in that set
export const scheduledOutboundLoaded = 8;           // orders at status SHIPPED in that set
export const pctScheduledInboundReceived = 18.2;     // 2 of 11
export const pctScheduledOutboundLoaded = 19.0;     // 8 of 42
// Facility-wide schedule context for the 11/20 PT day, all customers (same two
// endpoints, no customerId filter, same UTC-derived PT-day window): 43 receipts
// scheduled, of which 7 carry a receivedStartTime; 1647 orders scheduled by
// totalCount, of which 352 are SHIPPED.
export const facilityWideReceiptsCreated = 43;
export const facilityWideReceiptsReceived = 7;
export const facilityWideLoadsCreated = 1647;
export const facilityWideLoadsShipped = 352;

// Door occupancy duration: available from task startTime where a task exists on
// the door, has actually started and has not already ended; unavailable for
// task-less doors and for NEW tasks with no startTime (WMS has no
// occupancy-start field). 12 of 23 doors carry no active task at this pull and
// 6 of the 15 active tasks have no duration basis (the NEW tasks plus the
// stale DOCK50 task), so a duration exists for 9 tasks on 8 doors
// (DOCK52 LOAD 18h07m, DOCK52 LOAD 18h56m, DOCK54 RECEIVE 24h34m, DOCK55 RECEIVE 11h17m, DOCK56 LOAD 0h42m, DOCK57 RECEIVE 12h56m, DOCK58 RECEIVE 14h39m, DOCK66 RECEIVE 18h19m, DOCK67 RECEIVE 1h14m, all measured to the
// 9:53:21a PT reference).
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, 2026-11-20 9:53a PT)
// 15 tasks total: 4 LOAD + 11 RECEIVE (13 GURUNANDA + 2 KARAKA, LLC). One is a
// data anomaly (TASK-5090739 on DOCK50, stale since 2025-10-21).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// ARNULFO MUNGUIA has 112 CLOSED GURUNANDA load transactions with endTime inside
// the 2026-10-31 00:00:00 UTC - now window, 94 of them at Bay-4 doors:
// DOCK52 16, DOCK51 15, DOCK54 15, DOCK53 14, DOCK50 9, DOCK55 9, DOCK56 8, DOCK57 4, DOCK60 2, DOCK58 1, DOCK59 1;
// the other 18 are off Bay 4; per-day counts by endTime (PT):
// 11/20 2, 11/19 9, 11/18 8, 11/17 10, 11/16 7, 11/13 8, 11/12 12, 11/11 4, 11/10 10, 11/09 6, 11/06 8, 11/05 4, 11/04 11, 11/03 6, 11/02 7.
// The newest transaction is DOCK51 TASK-5425893 (closed 11/20 9:24:07a PT) - also the
// newest at a Bay-4 door.
// He currently holds 4 open Bay-4 tasks: DOCK56 TASK-5426242 (IN_PROGRESS), DOCK52 TASK-5425811 (IN_PROGRESS), DOCK52 TASK-5425788 (IN_PROGRESS), DOCK54 TASK-5425183 (IN_PROGRESS).
export const assignments: TaskRecord[] = [
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE TASK-5090739 · daira gonzalez (assigneeUserId 1948070158297014492) · IN_PROGRESS · DOCK · task created 10/20 9:38:05p PT · started 10/21 12:21:14p PT · not checked in at dock · updated 10/22 2:25:42p PT · 1 receipt: RN-5002143 at status CLOSED · PO EGSU8032696 · container EGSU8032696 · reference EGLV149507056809 · appointment 10/20 9:00:00a PT · receivedStart none · STALE: status still IN_PROGRESS although endTime is 10/22 9:42:01a PT and its linked receipt RN-5002143 is CLOSED - flagged, not given an open-ended duration · entry ET-1027622 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK50",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5425788",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "LOAD 18h07m since 11/19 3:45:23p PT · TASK-5425788 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/19 2:22:51p PT · started 11/19 3:45:23p PT · checked in 11/19 3:49:41p PT · updated 11/20 12:02:15a PT · no sealNo yet · 1 load: LOAD-5044992 (50101976, DN-3471788) at status LOADED · entry ET-1184101 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK52",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5425811",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "LOAD 18h56m since 11/19 2:56:29p PT · TASK-5425811 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/19 2:39:50p PT · started 11/19 2:56:29p PT · checked in 11/19 2:56:52p PT · updated 11/20 12:02:01a PT · seal 1378810 · 1 load: LOAD-5044981 (50101956, DN-3472288) at status LOADED · entry ET-1184121 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK52",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5425183",
    dns: "RECEIVE",
    customer: "KARAKA, LLC",
    pieces: "RECEIVE 24h34m since 11/19 9:18:25a PT · TASK-5425183 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · DOCK · task created 11/19 9:09:19a PT · started 11/19 9:18:25a PT · not checked in at dock · updated 11/19 9:18:27a PT · 2 receipts: RN-194358 at status IN_PROGRESS · PO POILO2103 · container HOUU9907931 · reference M26_SHA45 · appointment 11/19 9:00:00a PT · receivedStart 11/19 9:18:25a PT; RN-194359 at status IN_PROGRESS · PO POKRK3028 · container HOUU9907931 · reference M26_SHA45 · appointment 11/19 9:00:00a PT · receivedStart 11/19 9:18:25a PT · entry ET-1183546 · customer ORG-585450 (KARAKA, LLC) · door DOCK54",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5426379",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "LOAD not started · LOAD TASK-5426379 · DANIEL BELTRAN (assigneeUserId 1932077596691410945) · NEW · LIVE_LOAD · task created 11/20 9:46:04a PT · started no startTime · not checked in at dock · updated 11/20 9:48:57a PT · no sealNo yet · 1 load: LOAD-5044974 (47174035 // SP BOL, DN-3466731) at status WINDOW_CHECKIN_DONE · entry ET-1184378 · task note \"DOCK   55 ET-1184378\" · customer ORG-655875 (GURUNANDA, LLC) · door DOCK55",
    assignee: "DANIEL BELTRAN",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5425381",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE not started · RECEIVE TASK-5425381 · A1SG (assigneeUserId 1910160202361942018) · NEW · DOCK · task created 11/19 10:41:33a PT · started no startTime · not checked in at dock · updated 11/19 10:41:33a PT · 1 receipt: RN-5011671 at status IMPORTED · PO PO9466 · container Leafchem11192026 · appointment 11/19 10:00:00a PT · receivedStart none · entry ET-1183963 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK55",
    assignee: "A1SG",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5425838",
    dns: "RECEIVE",
    customer: "KARAKA, LLC",
    pieces: "RECEIVE not started · RECEIVE TASK-5425838 · Luis Alberto Paredes (assigneeUserId 2000828853478171162) · NEW · DOCK · task created 11/19 3:04:10p PT · started no startTime · not checked in at dock · updated 11/19 3:04:10p PT · 1 receipt: RN-195511 at status IMPORTED · PO POBOK0348_ship_1 · container UNKNOWN - LCL · reference 24695342 · appointment none · receivedStart none · entry ET-1184148 · customer ORG-585450 (KARAKA, LLC) · door DOCK55",
    assignee: "Luis Alberto Paredes",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5425960",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE 11h17m since 11/19 10:35:42p PT · TASK-5425960 · DANIELA GONZALEZ (assigneeUserId 11769) · IN_PROGRESS · DOCK · task created 11/19 9:42:15p PT · started 11/19 10:35:42p PT · not checked in at dock · updated 11/19 10:35:44p PT · 1 receipt: RN-5011651 at status IN_PROGRESS · PO HLBU3079404 · container HLBU3079404 · reference B00414569 · appointment 11/20 10:00:00a PT · receivedStart 11/19 10:35:42p PT · entry ET-1184248 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK55",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5426242",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "LOAD 0h42m since 11/20 9:10:51a PT · TASK-5426242 · ARNULFO MUNGUIA (assigneeUserId 89) · IN_PROGRESS · PRE_LOAD · task created 11/20 8:49:14a PT · started 11/20 9:10:51a PT · checked in 11/20 9:10:57a PT · updated 11/20 9:32:50a PT · no sealNo yet · 2 loads: LOAD-5045102 (50102101, DN-3474595) at status LOADED; LOAD-5045114 (50102129, DN-3475539) at status WINDOW_CHECKIN_DONE · entry ET-1184346 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK56",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK56",
  },
  {
    taskId: "TASK-5425944",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE 12h56m since 11/19 8:56:32p PT · TASK-5425944 · DANIELA GONZALEZ (assigneeUserId 11769) · IN_PROGRESS · DOCK · task created 11/19 5:55:00p PT · started 11/19 8:56:32p PT · not checked in at dock · updated 11/19 8:56:38p PT · 1 receipt: RN-5011695 at status IN_PROGRESS · PO HAMU2873662 · container HAMU2873662 · reference B00414575 · appointment 11/18 4:30:00p PT · receivedStart 11/19 8:56:32p PT · entry ET-1184215 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK57",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK57",
  },
  {
    taskId: "TASK-5425943",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE 14h39m since 11/19 7:13:29p PT · TASK-5425943 · DANIELA GONZALEZ (assigneeUserId 11769) · IN_PROGRESS · DOCK · task created 11/19 5:53:05p PT · started 11/19 7:13:29p PT · not checked in at dock · updated 11/19 7:13:33p PT · 1 receipt: RN-5011645 at status IN_PROGRESS · PO OOLU6823127 · container OOLU6823127 · reference B00418068 · appointment 11/18 12:00:00p PT · receivedStart 11/19 7:13:29p PT · entry ET-1184213 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK58",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK58",
  },
  {
    taskId: "TASK-5425962",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE not started · RECEIVE TASK-5425962 · DANIELA GONZALEZ (assigneeUserId 11769) · NEW · DOCK · task created 11/19 9:44:13p PT · started no startTime · not checked in at dock · updated 11/19 9:44:13p PT · 1 receipt: RN-5011691 at status IMPORTED · PO CSGU9025103 · container CSGU9025103 · reference B00420878 · appointment 11/19 11:00:00a PT · receivedStart none · entry ET-1184249 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK62",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK62",
  },
  {
    taskId: "TASK-5425867",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE 18h19m since 11/19 3:33:45p PT · TASK-5425867 · DANIELA GONZALEZ (assigneeUserId 11769) · IN_PROGRESS · DOCK · task created 11/19 3:32:37p PT · started 11/19 3:33:45p PT · not checked in at dock · updated 11/19 3:33:47p PT · 1 receipt: RN-5011643 at status IN_PROGRESS · PO SLPU5014970 · container SLPU5014970 · reference B00418069 · appointment 11/18 10:00:00a PT · receivedStart 11/19 3:33:45p PT · entry ET-1184169 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK66",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK66",
  },
  {
    taskId: "TASK-5426207",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE 1h14m since 11/20 8:38:40a PT · TASK-5426207 · JORGE ANTONIO FRANCO (assigneeUserId 1948070158297014498) · IN_PROGRESS · DOCK · task created 11/20 8:32:20a PT · started 11/20 8:38:40a PT · not checked in at dock · updated 11/20 8:39:31a PT · 1 receipt: RN-5011708 at status IN_PROGRESS · PO 9493 · container CORRU112026UNIS · appointment 11/20 10:00:00a PT · receivedStart 11/20 8:38:40a PT · entry ET-1184314 · customer ORG-655875 (GURUNANDA, LLC) · door DOCK67",
    assignee: "JORGE ANTONIO FRANCO",
    door: "DOCK67",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "RECEIVE not started · RECEIVE TASK-5381972 · Jorge Antonio Franco (assigneeUserId 2060441422549078018) · NEW · DOCK · task created 09/30 9:46:50a PT · started no startTime · not checked in at dock · updated 09/30 9:48:35a PT · 1 receipt: RN-5010583 at status IMPORTED · PO PO9139-2 · container Jpack09242026 · appointment none · receivedStart none · entry ET-1162686 · task note \"DOCK   69 ET-1162686\" · customer ORG-655875 (GURUNANDA, LLC) · door DOCK69",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
];
