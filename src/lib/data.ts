/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-14 5:16p PT (live WISE / WMS-BAM APIs)
 *   Sources (all read with item-time-zone America/Los_Angeles; WISE returns the
 *   dock/task/receipt/order timestamps as naive facility wall-clock values, so
 *   the strings below are already PT and no UTC->PT shift is applied):
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors, 23/23 rows
 *       returned (fresh dockStatus, spaceStatus, occupiedCustomerIds, entryId,
 *       updatedTime)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide totalCount 15); matched on dockName
 *       to the 23 Bay-4 docks -> 4 at Bay-4 doors (DOCK52 TASK-5420648, DOCK53
 *       TASK-5421041, DOCK54 TASK-5421045, DOCK56 TASK-5421056)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide totalCount 19), same per-door
 *       dockName match -> 6 at Bay-4 doors (DOCK50 TASK-5418313, DOCK50
 *       TASK-5090739, DOCK58 TASK-5420461, DOCK61 TASK-5421037, DOCK63
 *       TASK-5419965, DOCK69 TASK-5381972)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To inside the 11/14 PT business day -> totalCount 0
 *       (and 0 inside the 11/15 PT day; 11/16 already carries 5)
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDatePeriod inside the 11/14 PT business day -> totalCount 0
 *       (and 0 inside the 11/15 PT day; 11/16 already carries 49)
 *     - /wms-bam/outbound/load-task/search-by-paging - CLOSED/FORCE_CLOSED load
 *       tasks with endTimeFrom 2026-10-31 00:00:00, sorted endTime DESC ->
 *       totalCount 636 rows (all customers) spanning endTime 11/02 07:48:00 PT
 *       -> 11/13 7:23:29p PT; 76 of them are Arnulfo Munguia, all 76 GURUNANDA
 *       (ORG-655875) - 75 under assigneeUserId 89 plus 1 under a second Arnulfo
 *       identity, assigneeUserId 1948070158297014318 - and 69 of the 76 are at
 *       Bay-4 doors (Arnulfo Assigned Activity stream). No load task of ANY
 *       customer has closed on 11/14 PT (see below).
 *     - /wms-bam/outbound/load-task/search-by-paging - facility-wide (all
 *       customers) CLOSED/FORCE_CLOSED load tasks with endTimeFrom 2026-11-14
 *       00:00:00 -> totalCount 0 (still no load task closed at any door on
 *       Saturday 11/14)
 *     - /wms-bam/inbound/receive-task/search-by-paging - CLOSED/FORCE_CLOSED
 *       receive tasks sorted endTime DESC (all customers; facility-wide); the
 *       endpoint ignores endTimeFrom, so the newest 1,500 rows were pulled
 *       client-side (window 10/02 1:19:25p -> 11/14 12:13:14a PT) -> 1 closure
 *       dated 11/14 PT, TASK-5421052 at DOCK143 (MANUEL ANTONIO CANAS PALACIOS,
 *       ORG-34557), which is NOT a Bay-4 door, so 0 Bay-4 receive closures on
 *       11/14
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders at status
 *       PLANNED, no date filter -> totalCount 163 (planned-orders fallback)
 *   NOTE: door state is read from wms-location/search (dockStatus + spaceStatus),
 *   the same two status fields the dashboard already uses.
 *   NOTE: the load/receive task searches were matched to Bay-4 doors on the
 *   returned dockName field (dockId is also present but is a numeric location id,
 *   not the DOCKnn name). All 15 active load tasks and all 19 active receive
 *   tasks carried a dockName, so no task was dropped for a missing door.
 *   NOTE: the query shapes used here are byte-identical to the prior refresh and
 *   no query window changed (same 11/14 PT business day, same 2026-10-31 00:00:00
 *   assigned-activity start, same facility-wide closure windows); only the read
 *   time moved. This pull ran at 5:16p PT on Saturday 11/14, ~7h31m after the
 *   11/14 9:45a PT pull.
 *
 *   CONTEXT - 11/14 PT is a Saturday and GURUNANDA has NO scheduled inbound
 *   receipts and NO scheduled outbound orders on it, so both percentages are
 *   published as NOT COMPUTABLE rather than as a fabricated 0.0%:
 *   % scheduled inbounds received = 0 scheduled receipts (denominator 0).
 *   % scheduled outbounds loaded = 0 scheduled orders (denominator 0).
 *   The zero denominators are a real result of the query windows, not a broken
 *   filter: re-read live at this refresh, 11/13 reads 12 GURUNANDA receipts of
 *   which 4 carry a receivedStartTime (33.3%) and 31 orders of which 9 are
 *   SHIPPED (29.0%); 11/12 reads 9 receipts of which 7 are received (77.8%) and
 *   43 orders of which 32 are SHIPPED (74.4%); 11/15 also reads 0 receipts and
 *   0 orders; 11/16 (next Monday) already carries 5 receipts and 49 orders.
 *
 *   Key changes from the prior refresh (11/14 9:45a PT -> 11/14 5:16p PT):
 *     - DOOR STATUS: unchanged at occupied 21, reserved 0, available 2 (21/23).
 *       Only DOCK67 and DOCK72 are fully free (dock AVAILABLE + space EMPTY).
 *       Raw dockStatus is OCCUPIED 15, AVAILABLE 8, RESERVED 0; spaceStatus
 *       OCCUPIED 12, EMPTY 11. DOCK50, DOCK51, DOCK55, DOCK57, DOCK58 and DOCK64
 *       read dockStatus AVAILABLE with spaceStatus OCCUPIED, so the dashboard's
 *       Occupied count (21) exceeds the raw dockStatus count (15) - the same rule
 *       the earlier pulls used. Every door row's updatedTime is identical to the
 *       9:45a pull, i.e. no door has changed state in the last 7h31m.
 *     - TASK TURNOVER: none. The same 10 active-status Bay-4 tasks (4 LOAD /
 *       6 RECEIVE at 9 distinct doors) are live at this pull as at 9:45a; no load
 *       task has closed facility-wide on 11/14 and no Bay-4 receive task has
 *       closed on 11/14 either (the only 11/14 receive closure is TASK-5421052
 *       at DOCK143, outside Bay 4).
 *     - ASSIGNMENTS BY ASSIGNEE: unchanged - the 10 active Bay-4 tasks are held
 *       by 7 people: ARNULFO MUNGUIA 3 (LOAD DOCK52, DOCK54, DOCK56), DANIELA
 *       GONZALEZ 2 (RECEIVE DOCK61, DOCK63), EDUARDO MEJIA 1 (LOAD DOCK53),
 *       Luis Alberto Paredes 1 (RECEIVE DOCK58, NEW), Gonzalo Rangel 1 (RECEIVE
 *       DOCK50, NEW), Jorge Antonio Franco 1 (RECEIVE DOCK69, NEW) and
 *       daira gonzalez 1 (RECEIVE DOCK50, stale).
 *     - LOAD PROGRESS: all four active Bay-4 load tasks are PRE_LOAD, all
 *       checked in, all loads LOADED. Seals recorded on three of the four
 *       (DOCK52 A52688, DOCK54 25010985, DOCK56 25010981); DOCK53 TASK-5421041
 *       has no sealNo. Statuses are verbatim.
 *     - ANOMALIES: 1, unchanged. TASK-5090739 (DOCK50, RECEIVE started 10/21/25
 *       1:21:14p PT) is still returned by the active-status query although its
 *       endTime is 10/22/25 10:42:01a PT and its linked receipt RN-5002143 is
 *       CLOSED. It is left flagged, not given an open-ended duration.
 *     - Task "Guru live out / in assign to Arnulfo" still resolves to ARNULFO
 *       MUNGUIA GURUNANDA Bay 4 work. No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo"; the stream is read as the
 *       assignee's task assignment transactions and none is invented here.
 *       His assigned-activity pull (load tasks at CLOSED/FORCE_CLOSED, endTime
 *       from 2026-10-31 00:00:00 PT) holds 76 transactions (69 at Bay-4 doors,
 *       7 off Bay 4: DOCK4, DOCK5 x2, DOCK6, DOCK7 x2, DOCK45) - unchanged from
 *       the 9:45a pull, because nothing closed on 11/14. Per-day counts (endTime
 *       PT): 11/13 8, 11/12 12, 11/11 4, 11/10 10, 11/9 6, 11/8 0, 11/7 0,
 *       11/6 8, 11/5 4, 11/4 11, 11/3 6, 11/2 7, 11/1 0, 10/31 0. The newest is
 *       DOCK55 TASK-5419003 (started 11/11 8:17:28p PT, closed 11/13 7:23:29p PT,
 *       1 load SHIPPED, seal 25010979). He holds FIVE open GURUNANDA load tasks
 *       facility-wide, THREE of them at Bay-4 doors: DOCK52 TASK-5420648 (8 loads
 *       all LOADED, seal A52688), DOCK54 TASK-5421045 (4 loads all LOADED, seal
 *       25010985) and DOCK56 TASK-5421056 (2 loads all LOADED, seal 25010981); the
 *       other two are outside Bay 4 - DOCK9 TASK-5421015 (since 11/13 6:24:47p PT)
 *       and DOCK4 TASK-5421014 (since 11/13 5:41:02p PT).
 *     - "% scheduled inbounds received" (11/14 PT day): 0 scheduled -> NOT
 *       COMPUTABLE (denominator zero).
 *     - "% scheduled outbounds loaded" (11/14 PT day): 0 scheduled -> NOT
 *       COMPUTABLE (denominator zero).
 *     - Inbound/outbound mix: 6 RECEIVE / 4 LOAD of 10 active Bay-4 tasks.
 *     - Total doors occupied: 21 of 23.
 *     - Planned GURUNANDA orders (fallback): 163 (unchanged).
 *     - Door occupancy duration is available where a task with a startTime sits
 *       on the door and has not already ended: still 6 of 10 tasks on 6 doors,
 *       now measured to 11/14 5:16p PT - DOCK52 27h17m from 11/13 1:58:10p PT,
 *       DOCK63 25h34m from 11/13 3:41:26p PT, DOCK61 21h56m from 11/13 7:19:30p
 *       PT, DOCK53 21h01m from 11/13 8:14:06p PT, DOCK54 20h29m from 11/13
 *       8:46:02p PT, DOCK56 19h22m from 11/13 9:53:54p PT. WMS has no
 *       occupancy-start field for task-less doors (14 of 23), for the three NEW
 *       tasks (DOCK50 TASK-5418313, DOCK58 TASK-5420461, DOCK69 TASK-5381972) or
 *       for the one stale task.
 *     - Facility-wide appointment context for the 11/14 PT day (no customerId
 *       filter) moved slightly: orders scheduled 106 -> 108 (100 SHIPPED, 8
 *       IMPORTED, was 100 SHIPPED / 6 IMPORTED); receipts scheduled unchanged at
 *       1 (appointment 3:30p PT, ORG-697616, status IMPORTED), 0 of them carrying
 *       a receivedStartTime.
 *
 *   NOTE: the in-yard FULL equipment array and the all-time assignee baseline
 *   were NOT re-pulled in this refresh (out of scope of the request); Section 1
 *   and the planned-orders section render live from the WMS loader.
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
// NOT re-pulled in the 11/14 5:16p PT refresh (out of scope of the request). The
// array is left empty rather than carrying a stale result; Section 1 renders live
// from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 163 at the 11/14 ~5:16p PT pull (unchanged).
export const plannedGurunandaOrderCount = 163;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/14 ~5:16p PT
//
// Door status rule (kept identical to the dashboard's 3-value enum):
//   Reserved  = dockStatus RESERVED
//   Occupied  = dockStatus OCCUPIED OR spaceStatus OCCUPIED (not fully free)
//   Available = dockStatus AVAILABLE AND spaceStatus EMPTY
// Raw field values are preserved per door so the mapping can be re-checked.
// Totals: Occupied 21, Reserved 0, Available 2 = 23.
// =====================================================================
export const doors: DoorRecord[] = [
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "Gonzalo Rangel (RECEIVE NEW) + daira gonzalez (RECEIVE - STALE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5418313", "TASK-5090739"],
    duration: "RECEIVE NEW, not started (created 11/11 11:24:50a PT, TASK-5418313, Gonzalo Rangel, ET-1181371, receipt RN-195495 at status IMPORTED, PO RMA0276 / reference 'Po # 979126', appointment 11/11 12:00a PT, in-yard 11/11 11:24:50a PT, carrier WILL CALL) - no startTime, so no duration basis · the door's second task, TASK-5090739 (daira gonzalez), is STALE: started 10/21/25 1:21:14p PT and its endTime is 10/22/25 10:42:01a PT (RN-5002143 status CLOSED, PO-container EGSU8032696), dock-checked-in 10/22/25 10:41:46a PT · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1182117 (row updated 11/13 1:43:59p PT) · the last load task to close here was TASK-5420795 (DANIEL BELTRAN, 11/13 1:43:40p PT, 1 load SHIPPED, seal 1304042); the last receive task to close was TASK-5416210 (DANIELA GONZALEZ, KARAKA, LLC, FORCE_CLOSED 11/9 4:55:40p PT)",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1182058 (row updated 11/13 2:12:01p PT) · the last load task to close here was TASK-5420549 (ARNULFO MUNGUIA, 11/13 1:56:58p PT, 1 load SHIPPED, seal 25010987); the last receive task to close here was TASK-5420402 (Fatima Ponce, 11/13 10:42:38a PT, GURUNANDA) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5420648"],
    duration: "LOAD 27h17m since 11/13 1:58:10p PT (TASK-5420648, ARNULFO MUNGUIA, PRE_LOAD, created 11:57:41a PT, checked in 1:58:20p PT, 8 loads all LOADED, equipment 539, seal A52688 - LOAD-5044527 / DN-3458004 proNo 50168599, LOAD-5044519 / DN-3457373, LOAD-5044518 / DN-3457588 proNo 50168465, LOAD-5044517 / DN-3457634, LOAD-5044511 / 50168045 proNo 50168053, LOAD-5044504 / DN-3456049 proNo 50168196, LOAD-5044474 / 50164477 proNo 50168618, LOAD-5044471 / 50164469 proNo 50168489) · dock OCCUPIED, space OCCUPIED, entry ET-1182083 (row updated 11/13 1:58:21p PT) · the previous task here closed 11/13 10:06:00a PT (TASK-5419739, ARNULFO MUNGUIA, 7 loads all SHIPPED, seal 25010958); the last receive task to close here was TASK-5417998 (Nanci Viviana Rosas, 11/11 2:39:35p PT, KARAKA, LLC)",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "EDUARDO MEJIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5421041"],
    duration: "LOAD 21h01m since 11/13 8:14:06p PT (TASK-5421041, EDUARDO MEJIA, PRE_LOAD, created 8:11:47p PT, checked in 8:14:15p PT, 2 loads both LOADED, equipment 53272, NO sealNo recorded - LOAD-5044387 / DN-3453338, LOAD-5044383 / DN-3453233) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [], entry ET-1182227 (row updated 11/13 10:47:51p PT) · the previous load task here closed 11/13 12:29:19p PT (TASK-5420577, DANIEL BELTRAN, 1 load SHIPPED, seal 1304041); the newest receive closure inside the 10/02 - 11/14 12:13a PT closure window is still TASK-5407284 (ARNULFO MUNGUIA, 10/29 11:01:54a PT, ORG-585450)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5421045"],
    duration: "LOAD 20h29m since 11/13 8:46:02p PT (TASK-5421045, ARNULFO MUNGUIA, PRE_LOAD, created 8:22:44p PT, checked in 8:46:05p PT, 4 loads all LOADED, equipment 53779, seal 25010985 - LOAD-5044385 / DN-3453234 proNo 50162388, LOAD-5044382 / DN-3453232, LOAD-5044528 / 50168563 proNo 50168563, LOAD-5044388 / DN-3453345) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [], entry ET-1182229 (row updated 11/13 8:46:05p PT) · the previous load task here closed 11/13 12:15:09p PT (TASK-5419998, ARNULFO MUNGUIA, 1 load SHIPPED, seal 25010957); the last receive task to close here was TASK-5414446 (Nanci Viviana Rosas, KARAKA, LLC, 11/11 7:21:29a PT)",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1181976 (row updated 11/13 7:23:58p PT) · the last load task at this door closed 11/13 7:23:29p PT - TASK-5419003 (ARNULFO MUNGUIA, started 11/11 8:17:28p PT, 1 load SHIPPED, seal 25010979), i.e. 29 seconds before the door row was updated · the newest receive closure inside the 10/02 - 11/14 12:13a PT closure window is TASK-5415451 (julian rios, 11/9 2:58:06p PT, ORG-585450) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5421056"],
    duration: "LOAD 19h22m since 11/13 9:53:54p PT (TASK-5421056, ARNULFO MUNGUIA, PRE_LOAD, created 9:53:39p PT, checked in 9:53:57p PT, 2 loads both LOADED, equipment 53283, seal 25010981 - LOAD-5044386 / DN-3453337 proNo 50168054, LOAD-5044384 / DN-3453235) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [], entry ET-1182256 (row updated 11/13 9:53:57p PT) · the previous load task here closed 11/13 11:33:43a PT (TASK-5420384, DANIEL BELTRAN, 1 load SHIPPED, seal A52686); the last receive task to close here was TASK-5418081 (Nanci Viviana Rosas, KARAKA, LLC, 11/11 12:11:56p PT)",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [], entry ET-1181974 (row updated 11/13 10:23:26a PT) · the last load task to close here was TASK-5420289 (DANIEL BELTRAN, 11/13 10:23:09a PT, 1 load SHIPPED, seal A52689); the newest receive closure inside the 10/02 - 11/14 12:13a PT closure window is TASK-5414098 (Nanci Viviana Rosas, 11/9 2:14:50p PT, ORG-585450) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: "Luis Alberto Paredes (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5420461"],
    duration: "RECEIVE NEW, not started (created 11/13 10:13:50a PT, TASK-5420461, Luis Alberto Paredes, ET-1182030, receipt RN-5011507 at status IMPORTED, PO PO9419, appointment 11/13 10:00a PT, in-yard 11/13 10:13:27a PT, container Leafchem11132026, carrier WILL CALL) - no startTime, so no duration basis · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [], entry ET-1182004 (row updated 11/13 12:11:33p PT) · the last load task to close here was TASK-5420377 (BARTOLO RAMIREZ, 11/13 12:10:57p PT, 1 load SHIPPED, seal 1304053); the last receive task to close here was TASK-5414761 (DANIELA GONZALEZ, 11/6 5:09:25p PT, GURUNANDA)",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [], entry ET-1181760 (row updated 11/12 9:01:35p PT) · the receive task that held it, TASK-5417811 (CANDY MENDEZ, RN-195436), was FORCE_CLOSED 11/11 12:09:52p PT · the last load task to close here was TASK-5419780 (DANIEL BELTRAN, 11/12 1:22:58p PT, 1 load SHIPPED, seal 1379061) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1179653 (row updated 11/12 9:01:22p PT) · the last load task to close here was TASK-5413376 (JULIO CESAR ALVARADO, 11/5 2:50:10p PT, 5 loads all SHIPPED, seal 1378416); the newest receive closure inside the 10/02 - 11/14 12:13a PT closure window is TASK-5402543 (DANIELA GONZALEZ, 10/23 7:21:53p PT, GURUNANDA) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5421037"],
    duration: "RECEIVE 21h56m since 11/13 7:19:30p PT (TASK-5421037, DANIELA GONZALEZ, created 7:16:17p PT, dock-checked-in 7:19:32p PT, ET-1182218, receipt RN-5011583 at status IN_PROGRESS, PO TRHU8394717 / reference B00420740, container TRHU8394717, seal 1746080, carrier WILL CALL, in-yard 7:16:18p PT) · dock OCCUPIED, space EMPTY, occupiedCustomerIds [], entry ET-1182218 (row updated 11/13 7:19:32p PT) · the last load task to close here was TASK-5420400 (BARTOLO RAMIREZ, 11/13 10:56:09a PT, 1 load SHIPPED, seal 1304052); the last receive task to close here was TASK-5414777 (Fatima Ponce, 11/10 7:13:40a PT, GURUNANDA)",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds [], entry ET-1181858 (row updated 11/13 6:26:19a PT) · the last receive task to close here was TASK-5419984 (DANIELA GONZALEZ, 11/12 8:25:21p PT, GURUNANDA); no load task of any customer has closed at this door inside the 2026-10-31 - 11/14 window · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5419965"],
    duration: "RECEIVE 25h34m since 11/13 3:41:26p PT (TASK-5419965, DANIELA GONZALEZ, created 11/12 4:16:44p PT, dock-checked-in 11/13 3:41:36p PT, ET-1181840, receipt RN-5011506 at status IN_PROGRESS, PO OOCU7729628 / reference B00419648, appointment 11/11 4:00p PT, in-yard 11/12 4:16:44p PT, container OOCU7729628, carrier WILL CALL) · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1181840 (row updated 11/13 3:41:45p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - 11/14 window; the newest receive closure inside the 10/02 - 11/14 12:13a PT closure window is TASK-5414772 (Fatima Ponce, 11/9 9:56:00a PT, GURUNANDA)",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1182176 (row updated 11/13 9:32:32p PT) · the last receive task to close here was TASK-5420980 (DANIELA GONZALEZ, 11/13 9:32:35p PT, GURUNANDA); no load task of any customer has closed at this door inside the 2026-10-31 - 11/14 window · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds [], entry ET-1179941 (row updated 11/12 9:00:36p PT) · the receive task that held it, TASK-5413519 (Nanci Viviana Rosas, KARAKA, LLC), was FORCE_CLOSED 11/10 11:38:02a PT; no load task of any customer has closed at this door inside the 2026-10-31 - 11/14 window · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds [], entry ET-1173309 (row updated 11/13 4:20:08p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - 11/14 window; the newest receive closure inside the 10/02 - 11/14 12:13a PT closure window is TASK-5392562 (DANIELA GONZALEZ, 10/12 6:46:00p PT, GURUNANDA) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds [], entry ET-1181521 (row updated 11/13 8:14:15p PT) · the last receive task to close here was TASK-5418827 (Fatima Ponce, 11/12 9:38:33a PT, GURUNANDA); no load task of any customer has closed at this door inside the 2026-10-31 - 11/14 window · fully free",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds [], entry ET-1177841 (row updated 11/12 8:59:43p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - 11/14 window; the newest receive closure inside the 10/02 - 11/14 12:13a PT closure window is TASK-5408610 (Fatima Ponce, 11/2 3:06:46p PT, GURUNANDA) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW, not started (created 9/30 10:46:50a PT, TASK-5381972, Jorge Antonio Franco, ET-1162686, receipt RN-5010583 at status IMPORTED, PO9139-2, container Jpack09242026, no appointment, in-yard 9/30 10:46:48a PT, carrier WILL CALL) - no startTime, so no duration basis · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1171953 (row updated 11/12 8:59:19p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - 11/14 window; the newest receive closure inside the 10/02 - 11/14 12:13a PT closure window is TASK-5398554 (DANIELA GONZALEZ, 10/20 6:56:09p PT, GURUNANDA)",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1172826 (row updated 11/12 8:59:10p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - 11/14 window; the newest receive closure inside the 10/02 - 11/14 12:13a PT closure window is TASK-5399423 (Fatima Ponce, 10/21 9:42:23a PT, GURUNANDA) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1176765 (row updated 11/13 4:23:58p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - 11/14 window; the newest receive closure inside the 10/02 - 11/14 12:13a PT closure window is TASK-5406898 (DANIELA GONZALEZ, 10/28 8:41:53p PT, GURUNANDA) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1176051 (row updated 11/11 6:13:28p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - 11/14 window; the newest receive closure inside the 10/02 - 11/14 12:13a PT closure window is TASK-5405554 (DANIELA GONZALEZ, 10/27 6:45:00p PT, GURUNANDA) · fully free",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 21
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 0
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 9
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 1
const available = doors.filter((d) => d.status === "Available").length; // 2

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors Occupied",
    value: `21/23`,
    numerator: 21,
    denominator: TOTAL_DOORS,
    percentage: Math.round((21 / TOTAL_DOORS) * 100),
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
    value: `2`,
    numerator: 2,
    denominator: TOTAL_DOORS,
    percentage: Math.round((2 / TOTAL_DOORS) * 100),
  },
  {
    label: "Anomalies",
    value: `1`,
    numerator: 1,
    denominator: TOTAL_DOORS,
    percentage: Math.round((1 / TOTAL_DOORS) * 100),
  },
];

// Doors that carried dockStatus RESERVED at this pull: none (0).
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, Nov 14 2026 ~5:16p PT).
// 10 active-status tasks at Bay-4 doors: 4 LOAD + 6 RECEIVE, at 9 distinct doors
// (DOCK50, DOCK52, DOCK53, DOCK54, DOCK56, DOCK58, DOCK61, DOCK63, DOCK69).
// ARNULFO MUNGUIA: 3 LOAD (DOCK52 TASK-5420648, DOCK54 TASK-5421045, DOCK56
//   TASK-5421056 - all IN_PROGRESS, PRE_LOAD, all loads LOADED)
// DANIELA GONZALEZ: 2 RECEIVE (DOCK61 TASK-5421037 IN_PROGRESS, DOCK63
//   TASK-5419965 IN_PROGRESS)
// EDUARDO MEJIA: 1 LOAD (DOCK53 TASK-5421041, IN_PROGRESS)
// Luis Alberto Paredes: 1 RECEIVE (DOCK58 TASK-5420461, NEW)
// Gonzalo Rangel: 1 RECEIVE (DOCK50 TASK-5418313, NEW)
// Jorge Antonio Franco: 1 RECEIVE (DOCK69 TASK-5381972, NEW)
// daira gonzalez: 1 RECEIVE (DOCK50 TASK-5090739, IN_PROGRESS, stale)
// All assigned names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 3 },
  { name: "DANIELA GONZALEZ", taskCount: 2 },
  { name: "EDUARDO MEJIA", taskCount: 1 },
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

// --- Schedule Data (2026-11-14, Saturday) ---
// GURUNANDA has NOTHING scheduled on the 11/14 PT business day, so both
// percentages are published as NOT COMPUTABLE instead of an invented 0.0%.
//   % scheduled inbounds received TODAY: 0 GURUNANDA receipts carry an
//   appointmentTime inside the 11/14 PT business day (query window
//   appointmentTimeFrom "2026-11-14 00:00:00" -> appointmentTimeTo
//   "2026-11-14 23:59:59", totalCount 0) = 0 / 0 -> not computable.
//   % scheduled outbounds loaded TODAY: 0 GURUNANDA orders carry a scheduleDate
//   inside the 11/14 PT day (scheduleDatePeriod ["2026-11-14 00:00:00",
//   "2026-11-14 23:59:59"], totalCount 0) = 0 / 0 -> not computable.
//   CONTEXT ONLY (not substituted into today's metrics): re-read live at this
//   refresh, 11/13 reads 12 receipts of which 4 carry a receivedStartTime
//   (received + IN_PROGRESS + CLOSED statuses: IMPORTED 8, IN_PROGRESS 3,
//   CLOSED 1) and 31 orders of which 9 are SHIPPED (SHIPPED 9,
//   PARTIAL_SHIPPED 3, PICKED 8, PLANNED 5, OPEN 2, IMPORTED 1, CANCELLED 1,
//   COMMIT_FAILED 2); 11/12 reads 9 receipts of which 7 are received and 43
//   orders of which 32 are SHIPPED; 11/15 reads 0 receipts and 0 orders;
//   11/16 already reads 5 receipts and 49 orders. The zero denominators on
//   11/14 reflect the Saturday schedule, not a broken filter.
export const scheduleAvailable = false;             // 0 GURUNANDA receipts scheduled on 11/14
export const outboundScheduleAvailable = false;     // 0 GURUNANDA orders scheduled on 11/14
export const scheduledInboundOrders = 0;            // receipts with appointmentTime in the 11/14 PT day
export const scheduledOutboundOrders = 0;           // orders with scheduleDate in the 11/14 PT day
export const scheduledInboundReceived = 0;          // receipts with receivedStartTime in that set
export const scheduledOutboundLoaded = 0;           // orders at status SHIPPED in that set
export const pctScheduledInboundReceived = 0.0;     // 0 of 0 - not computable
export const pctScheduledOutboundLoaded = 0.0;      // 0 of 0 - not computable
// Facility-wide appointment context for the 11/14 PT day, all customers (same
// two endpoints, no customerId filter): 1 receipt scheduled (ORG-697616,
// appointment 11/14 3:30p PT, status IMPORTED) of which 0 carry a
// receivedStartTime; 108 orders scheduled, 100 at status SHIPPED and 8 IMPORTED
// (was 106 / 100 SHIPPED / 6 IMPORTED at the 9:45a pull).
export const facilityWideReceiptsCreated = 1;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 108;
export const facilityWideLoadsShipped = 100;

// Door occupancy duration: available from task startTime where a task exists on the
// door and has actually started and has not already ended; unavailable for
// task-less doors and for NEW tasks with no startTime (no occupancy-start field in
// WMS, and the dock-door-status dashboard endpoint returns an empty Duration
// column). 14 of 23 doors carry no active task at this pull, 3 of the 10 tasks are
// NEW/not started (DOCK50 TASK-5418313, DOCK58 TASK-5420461, DOCK69 TASK-5381972)
// and 1 is stale (DOCK50 TASK-5090739), so a duration exists for 6 tasks on 6
// doors (DOCK52 27h17m from 11/13 1:58:10p PT, DOCK63 25h34m from 11/13 3:41:26p
// PT, DOCK61 21h56m from 11/13 7:19:30p PT, DOCK53 21h01m from 11/13 8:14:06p PT,
// DOCK54 20h29m from 11/13 8:46:02p PT and DOCK56 19h22m from 11/13 9:53:54p PT -
// all measured to 11/14 5:16p PT).
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Nov 14 2026 ~5:16p PT)
// 10 tasks total: 4 LOAD + 6 RECEIVE. All GURUNANDA, LLC.
// One is a data anomaly (TASK-5090739 on DOCK50, stale since 10/21/25).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA still has 76 CLOSED GURUNANDA load transactions with endTime
// inside the 2026-10-31 00:00:00 - 11/14 5:16p PT window (75 under assigneeUserId
// 89 plus 1 under a second Arnulfo identity, assigneeUserId
// 1948070158297014318; 69 of them at Bay-4 doors, spread over DOCK51 12,
// DOCK52 10, DOCK53 10, DOCK54 10, DOCK55 8, DOCK50 7, DOCK56 6, DOCK57 3,
// DOCK60 2, DOCK59 1; the other 7 are on DOCK5 2, DOCK7 2, DOCK4 1, DOCK6 1
// and DOCK45 1); per-day counts by endTime (PT): 11/13 8, 11/12 12, 11/11 4,
// 11/10 10, 11/9 6, 11/8 0, 11/7 0, 11/6 8, 11/5 4, 11/4 11, 11/3 6 and 11/2 7,
// with no closures on 11/14 or 11/1-10/31 (no load task of any customer has
// closed facility-wide on 11/14).
// The newest is DOCK55 TASK-5419003 (started 11/11 8:17:28p PT, closed 11/13
// 7:23:29p PT; 1 load SHIPPED; seal 25010979).
// He holds FIVE open GURUNANDA load tasks facility-wide at this pull, THREE of
// them at Bay-4 doors: DOCK52 TASK-5420648 (PRE_LOAD since 11/13 1:58:10p PT,
// 8 loads all LOADED, seal A52688), DOCK54 TASK-5421045 (PRE_LOAD since 11/13
// 8:46:02p PT, 4 loads all LOADED, seal 25010985) and DOCK56 TASK-5421056
// (PRE_LOAD since 11/13 9:53:54p PT, 2 loads all LOADED, seal 25010981); the
// other two are outside Bay 4 - DOCK9 TASK-5421015 (since 11/13 6:24:47p PT)
// and DOCK4 TASK-5421014 (since 11/13 5:41:02p PT).
export const assignments: TaskRecord[] = [
  // ----- INBOUND / RECEIVE (6) -----
  {
    taskId: "TASK-5421037",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 21h56m since 11/13 7:19:30p PT (DANIELA GONZALEZ, task created 7:16:17p PT; ET-1182218, dock-checked-in 7:19:32p PT, RN-5011583 at status IN_PROGRESS, PO TRHU8394717 / reference B00420740, container TRHU8394717, seal 1746080, carrier WILL CALL, in-yard 7:16:18p PT)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK61",
  },
  {
    taskId: "TASK-5419965",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 25h34m since 11/13 3:41:26p PT (DANIELA GONZALEZ, task created 11/12 4:16:44p PT; ET-1181840, dock-checked-in 11/13 3:41:36p PT, RN-5011506 at status IN_PROGRESS, PO OOCU7729628 / reference B00419648, appointment 11/11 4:00p PT, in-yard 11/12 4:16:44p PT, container OOCU7729628, carrier WILL CALL)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK63",
  },
  {
    taskId: "TASK-5420461",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/13 10:13:50a PT (Luis Alberto Paredes; ET-1182030, RN-5011507 at status IMPORTED, PO PO9419, appointment 11/13 10:00a PT, in-yard 11/13 10:13:27a PT, container Leafchem11132026, carrier WILL CALL) - task has no startTime",
    assignee: "Luis Alberto Paredes",
    door: "DOCK58",
  },
  {
    taskId: "TASK-5418313",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/11 11:24:50a PT (Gonzalo Rangel; ET-1181371, RN-195495 at status IMPORTED, PO RMA0276 / reference 'Po # 979126', appointment 11/11 12:00a PT, in-yard 11/11 11:24:50a PT, carrier WILL CALL) - task has no startTime",
    assignee: "Gonzalo Rangel",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/30 10:46:50a PT (Jorge Antonio Franco; ET-1162686, RN-5010583 at status IMPORTED, PO9139-2, container Jpack09242026, no appointment, in-yard 9/30 10:46:48a PT, carrier WILL CALL) - task has no startTime",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 10/21/25 1:21:14p PT; status still IN_PROGRESS although endTime is 10/22/25 10:42:01a PT; daira gonzalez, ET-1027622, RN-5002143 which is itself already CLOSED, PO-container EGSU8032696, dock-checked-in 10/22/25 10:41:46a PT)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },

  // ----- OUTBOUND / LOAD (4) -----
  {
    taskId: "TASK-5420648",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 27h17m since 11/13 1:58:10p PT (ARNULFO MUNGUIA, task created 11:57:41a PT, checked in 1:58:20p PT; PRE_LOAD, 8 loads all LOADED, equipment 539, seal A52688 - LOAD-5044527 / DN-3458004 proNo 50168599, LOAD-5044519 / DN-3457373, LOAD-5044518 / DN-3457588 proNo 50168465, LOAD-5044517 / DN-3457634, LOAD-5044511 / 50168045 proNo 50168053, LOAD-5044504 / DN-3456049 proNo 50168196, LOAD-5044474 / 50164477 proNo 50168618, LOAD-5044471 / 50164469 proNo 50168489)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5421041",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 21h01m since 11/13 8:14:06p PT (EDUARDO MEJIA, task created 8:11:47p PT, checked in 8:14:15p PT; PRE_LOAD, 2 loads both LOADED, equipment 53272, NO sealNo recorded - LOAD-5044387 / DN-3453338, LOAD-5044383 / DN-3453233)",
    assignee: "EDUARDO MEJIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5421045",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 20h29m since 11/13 8:46:02p PT (ARNULFO MUNGUIA, task created 8:22:44p PT, checked in 8:46:05p PT; PRE_LOAD, 4 loads all LOADED, equipment 53779, seal 25010985 - LOAD-5044385 / DN-3453234 proNo 50162388, LOAD-5044382 / DN-3453232, LOAD-5044528 / 50168563 proNo 50168563, LOAD-5044388 / DN-3453345)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5421056",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 19h22m since 11/13 9:53:54p PT (ARNULFO MUNGUIA, task created 9:53:39p PT, checked in 9:53:57p PT; PRE_LOAD, 2 loads both LOADED, equipment 53283, seal 25010981 - LOAD-5044386 / DN-3453337 proNo 50168054, LOAD-5044384 / DN-3453235)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK56",
  },
];
