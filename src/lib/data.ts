/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-11 10:02:00 PT (live WISE / WMS-BAM APIs)
 *   Sources (all read with item-time-zone America/Los_Angeles; WISE returns the
 *   dock/task/receipt/order timestamps as naive facility wall-clock values, so
 *   the strings below are already PT and no UTC->PT shift is applied):
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors, 23/23 rows
 *       returned (fresh dockStatus, spaceStatus, occupiedCustomerIds, entryId,
 *       updatedTime)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide total 11); matched on dockName to
 *       the 23 Bay-4 docks -> 3 at Bay-4 doors (DOCK51 TASK-5417125,
 *       DOCK51 TASK-5417954, DOCK55 TASK-5418069)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide total 13), same per-door dockName
 *       match -> 3 at Bay-4 doors (DOCK50 TASK-5090739, DOCK59 TASK-5417811,
 *       DOCK69 TASK-5381972)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To inside the 11/11 PT business day -> totalCount 1
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDatePeriod inside the 11/11 PT business day -> totalCount 64
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA load tasks at
 *       CLOSED/FORCE_CLOSED, endTimeFrom 2026-10-31 00:00:00, sorted endTime DESC
 *       -> 124 rows returned (all status CLOSED; the query's customerIds filter
 *       also admits a handful of other customers, so the Bay-4 stream is read
 *       per assignee); 54 of them are Arnulfo Munguia (53 under assigneeUserId 89
 *       plus 1 under a second Arnulfo identity, assigneeUserId
 *       1948070158297014318), all 54 GURUNANDA (ORG-655875), 49 at Bay-4 doors
 *       (Arnulfo Assigned Activity stream)
 *     - /wms-bam/outbound/load-task/search-by-paging - facility-wide (all
 *       customers) CLOSED/FORCE_CLOSED load tasks with endTimeFrom 2026-11-11
 *       00:00:00 -> totalCount 12, of which 3 closed at Bay-4 doors (DOCK50
 *       TASK-5417115 09:32:38 PT, DOCK58 TASK-5417889 09:18:38 PT, DOCK54
 *       TASK-5417645 09:49:27 PT)
 *     - /wms-bam/inbound/receive-task/search-by-paging - CLOSED/FORCE_CLOSED
 *       receive tasks sorted endTime DESC (all customers; facility-wide); the
 *       endpoint ignores endTimeFrom, so the newest 200 rows were pulled
 *       client-side (window 11/05 09:22 -> 11/11 09:28 PT) -> 6 closures dated
 *       11/11 PT, of which 1 at a Bay-4 door (DOCK54 TASK-5414446, KARAKA, LLC,
 *       closed 07:21:29 PT)
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders at status
 *       PLANNED, no date filter -> totalCount 194 (planned-orders fallback)
 *   NOTE: door state is read from wms-location/search (dockStatus + spaceStatus),
 *   the same two status fields the dashboard already uses.
 *   NOTE: the load/receive task searches were filtered by customerIds only and
 *   matched to Bay-4 doors on the returned dockName field (dockId is also present
 *   but is a numeric location id, not the DOCKnn name). All 11 active load tasks
 *   and all 13 active receive tasks carried a dockName, so no task was dropped
 *   for a missing door.
 *   NOTE: the query shapes used here are byte-identical to the prior refresh and
 *   no query window changed (same 11/11 PT business day, same 2026-10-31 00:00:00
 *   assigned-activity start); only the read time moved. This pull ran at 10:02 PT
 *   on Wednesday 11/11, ~1h06m after the 11/11 8:56a PT pull.
 *
 *   CONTEXT - 11/11 PT is a Wednesday and only 1 GURUNANDA inbound receipt is
 *   scheduled on it, so both percentages are published as real numbers:
 *   % scheduled inbounds received = 0 / 1 = 0.0% (RN B00419648, PO-container
 *   OOCU7729628, appointment 4:00p PT, still at status IMPORTED - the appointment
 *   has not been reached at 10:02 PT).
 *   % scheduled outbounds loaded = 6 / 64 = 9.4% (orders at status SHIPPED - the
 *   same definition the prior pulls used; remaining 11/11 statuses: PICKED 31,
 *   PLANNED 17, IMPORTED 5, OPEN 3, PICKING 1, PACKED 1). Both denominators were
 *   re-validated against neighbouring days at this pull (11/9: 4 receipts all
 *   received = 100.0%, 156 orders of which 59 SHIPPED = 37.8%; 11/10: 6 receipts
 *   of which 4 received = 66.7%, 44 orders of which 4 SHIPPED = 9.1%; 11/12: 1
 *   receipt of which 0 received, 29 orders of which 0 SHIPPED), so the low 11/11
 *   ratios reflect the day only being 3h02m old at 10:02 PT, not a broken filter.
 *
 *   Key changes from the prior refresh (11/11 ~8:56a PT -> 11/11 ~10:02a PT):
 *     - DOOR STATUS: occupied held at 17, but the mix moved - reserved 2 -> 1,
 *       available 4 -> 5. DOCK52 flipped Occupied -> AVAILABLE (dock AVAILABLE +
 *       space EMPTY on a new entry ET-1181279 at 9:53a)
 *       while DOCK55 flipped RESERVED -> OCCUPIED (new entry ET-1181295 at 9:23a
 *       for a LIVE_LOAD). Now occupied: DOCK50, DOCK53, DOCK54, DOCK55, DOCK56,
 *       DOCK57, DOCK58, DOCK59, DOCK60, DOCK61, DOCK63, DOCK64, DOCK65, DOCK67,
 *       DOCK68, DOCK69, DOCK72. Reserved: DOCK51. Available (5): DOCK52, DOCK62,
 *       DOCK66, DOCK70, DOCK71. Raw dockStatus is OCCUPIED 12, AVAILABLE 10,
 *       RESERVED 1; spaceStatus OCCUPIED 11, EMPTY 12. DOCK50, DOCK54, DOCK57,
 *       DOCK58 and DOCK64 are space-occupied with dockStatus AVAILABLE, so the
 *       dashboard's Occupied count (17) exceeds the raw dockStatus count (12).
 *     - TASK TURNOVER: three of the eight tasks seen at 8:56a closed inside this
 *       window - DOCK58 TASK-5417889 (DANIEL BELTRAN, 8:27:11a -> 9:18:38a, 1
 *       load SHIPPED, 18 DNs, seal 1379034), DOCK50 TASK-5417115 (ARNULFO
 *       MUNGUIA, 11/10 3:02:26p -> 9:32:38a, 7 loads all SHIPPED, seal 1379032)
 *       and DOCK54 TASK-5417645 (ARNULFO MUNGUIA, 11/10 8:46:48p -> 9:49:27a, 1
 *       load SHIPPED, seal 1379033). One new task opened: DOCK55 TASK-5418069
 *       (DANIEL BELTRAN, LIVE_LOAD, created 9:13:57a, started 9:23:01a). Net
 *       active count fell 8 -> 6 and the mix moved from 5 LOAD / 3 RECEIVE to
 *       3 LOAD / 3 RECEIVE.
 *     - ASSIGNMENTS BY ASSIGNEE: all six active Bay-4 tasks are held by six
 *       different people, 1 each - ARNULFO MUNGUIA (DOCK51), GONZALO RANGEL
 *       (DOCK51), DANIEL BELTRAN (DOCK55), CANDY MENDEZ (DOCK59), Jorge Antonio
 *       Franco (DOCK69), daira gonzalez (DOCK50, stale).
 *     - LOAD PROGRESS: DOCK51 TASK-5417125 still IN_PROGRESS with all 5 loads
 *       LOADED and no seal recorded (reassigned back to ARNULFO MUNGUIA at 11/10
 *       11:17:11p PT); DOCK51 TASK-5417954 is still NEW at WINDOW_CHECKIN_DONE
 *       (appointment 11/11 11:00a PT, driver MARCO ALVAREZ, equipment TA207656);
 *       DOCK55 TASK-5418069 is a LIVE_LOAD with its single load LOADED on
 *       equipment HGIU503975 and seal 1379035 (checked in 9:23:49a). Statuses are
 *       verbatim.
 *     - ANOMALIES: 1, unchanged. TASK-5090739 (DOCK50, RECEIVE started 10/21/25
 *       1:21:14p) is still returned by the active-status query although its
 *       endTime is 10/22/25 10:42:01a and its linked receipt RN-5002143 is
 *       CLOSED. It is left flagged, not given an open-ended duration.
 *     - Task "Guru live out / in assign to Arnulfo" still resolves to ARNULFO
 *       MUNGUIA GURUNANDA Bay 4 work. No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo"; the stream is read as the
 *       assignee's task assignment transactions and none is invented here.
 *       His assigned-activity pull (load tasks at CLOSED, endTime from 2026-10-31
 *       00:00:00 PT) now holds 54 transactions (49 at Bay-4 doors). TWO closed in
 *       this window: DOCK50 TASK-5417115 (9:32:38a, 7 loads all SHIPPED, seal
 *       1379032, equipment 53779) and DOCK54 TASK-5417645 (9:49:27a, 1 load
 *       SHIPPED, seal 1379033, equipment 53567). Per-day counts: 11/11 2,
 *       11/10 10, 11/9 6, 11/8 0, 11/7 0, 11/6 8, 11/5 4, 11/4 11, 11/3 6,
 *       11/2 7. The newest is DOCK54 TASK-5417645. He now holds ONE open Bay-4
 *       load task, DOCK51 TASK-5417125 (5 loads all LOADED, no seal).
 *     - "% scheduled inbounds received" (11/11 PT day): 0 of 1 = 0.0%.
 *     - "% scheduled outbounds loaded" (11/11 PT day): 6 of 64 = 9.4% (SHIPPED).
 *     - Inbound/outbound mix: 3 RECEIVE / 3 LOAD of 6 active Bay-4 tasks.
 *     - Total doors occupied: 17 of 23 (held), plus 1 reserved.
 *     - Planned GURUNANDA orders (fallback): 194 (was 195).
 *     - Door occupancy duration is available where a task with a startTime sits
 *       on the door and has not already ended: now 2 of 6 tasks on 2 doors
 *       (DOCK51 TASK-5417125 18h48m from 11/10 3:13:38p PT, DOCK55 TASK-5418069
 *       39m from 11/11 9:23:01a PT). WMS has no occupancy-start field for
 *       task-less doors (17 of 23), for the three NEW tasks (DOCK51 TASK-5417954,
 *       DOCK59 TASK-5417811, DOCK69 TASK-5381972) or for the one stale task.
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
// NOT re-pulled in the 11/11 10:02a PT refresh (out of scope of the request). The
// array is left empty rather than carrying a stale result; Section 1 renders live
// from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 194 at the 11/11 ~10:02a PT pull (was 195).
export const plannedGurunandaOrderCount = 194;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/11 ~10:02a PT
//
// Door status rule (kept identical to the dashboard's 3-value enum):
//   Reserved  = dockStatus RESERVED
//   Occupied  = dockStatus OCCUPIED OR spaceStatus OCCUPIED (not fully free)
//   Available = dockStatus AVAILABLE AND spaceStatus EMPTY
// Raw field values are preserved per door so the mapping can be re-checked.
// Totals: Occupied 17, Reserved 1, Available 5 = 23.
// =====================================================================
export const doors: DoorRecord[] = [
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "daira gonzalez (RECEIVE - STALE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5090739"],
    duration: "No duration basis - the only task still returned here, TASK-5090739, is STALE: started 10/21/25 1:21:14p PT and its endTime is 10/22/25 10:42:01a PT (RN-5002143, PO-container EGSU8032696, is itself CLOSED) · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1180948 (row updated 11/11 9:35a PT) · ARNULFO MUNGUIA's 7-load task TASK-5417115 CLOSED here at 11/11 9:32:38a PT after starting 11/10 3:02:26p PT (all 7 loads SHIPPED, equipment 53779, seal 1379032 - LOAD-5044013 / 50153882 DN-3445506, LOAD-5044138 / 50156397 DN-3451144, LOAD-5044141 / 50156429 DN-3450948, LOAD-5044230 / 50159723 DN-3450873, LOAD-5044142 / 50156434 DN-3450838, LOAD-5044011 / 50153828 DN-3445510, LOAD-5044012 / 50153849 DN-3445507) · the last KARAKA receive task to close here was TASK-5416210 (DANIELA GONZALEZ, FORCE_CLOSED 11/9 4:55:40p PT, RN-195120)",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Reserved",
    assignee: "ARNULFO MUNGUIA (LOAD) + GONZALO RANGEL (LOAD NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5417125", "TASK-5417954"],
    duration: "LOAD 18h48m since 11/10 3:13:38p PT (TASK-5417125, ARNULFO MUNGUIA - lastAssignedWhen 11/10 11:17:11p PT, PRE_LOAD, checked in 3:13:44p PT, 5 loads all LOADED, equipment 53142, no seal recorded - LOAD-5044137 / 50156395 DN-3451149, LOAD-5044136 / 50156393 DN-3451216, LOAD-5044135 / 50156391 DN-3451238, LOAD-5044134 / 50156389 DN-3451356, LOAD-5044132 / 50156385 DN-3451362) · the second task here, TASK-5417954, is NEW and not started (created 11/11 8:30:57a PT, GONZALO RANGEL, LIVE_LOAD, not checked in, 1 load at status WINDOW_CHECKIN_DONE, equipment TA207656 - LOAD-5044105 / CS02523438 UNIS BOL, appointment 11/11 11:00a PT, driver MARCO ALVAREZ, 4 DNs DN-3420283 / DN-3420281 / DN-3420282 / DN-3420252), so no duration basis · dock RESERVED, space OCCUPIED, entry ET-1181268 (row updated 11/11 8:31a PT) · last load task to close here was TASK-5416299 (11/10 10:26:16a PT, 2 loads, seal 24800346, ARNULFO MUNGUIA)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1181279 (row updated 11/11 9:53:12a PT) - this door read OCCUPIED at the 11/11 8:56a PT pull and is now fully free · the load task it was holding, TASK-5417412 (ARNULFO MUNGUIA, 11/10 2:53:58p -> 2:58:04p PT, 1 load SHIPPED, seal NA), was already the last closure logged here · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [], entry ET-1180892 (row updated 11/10 8:58p PT) - the space is flagged occupied with no task holding it (the same entry ET-1180892 also appears on DOCK55) · two load tasks closed here on 11/10, both ARNULFO MUNGUIA: TASK-5416134 (9:42:02a PT, 6 loads all SHIPPED, seal 24800345) and TASK-5415952 (11:15:04a PT, 4 loads all SHIPPED, seal 24800342) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [], entry ET-1181162 (row updated 11/11 9:49:50a PT) · ARNULFO MUNGUIA's task TASK-5417645 CLOSED here at 11/11 9:49:27a PT after starting 11/10 8:46:48p PT (ran 13h03m; PRE_LOAD, checked in 8:46:50p PT, 1 load SHIPPED, equipment 53567, seal 1379033 - LOAD-5044010 / 50153815 DN-3445552) · a KARAKA, LLC (ORG-585450) receive task also sat on this door and closed 11/11 7:21:29a PT - TASK-5414446, Nanci Viviana Rosas, RN-194062 / PO POKRK2937, started 11/6 1:26:28p PT",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "DANIEL BELTRAN (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5418069"],
    duration: "LOAD 39m since 11/11 9:23:01a PT (TASK-5418069, DANIEL BELTRAN, LIVE_LOAD, created 9:13:57a PT, checked in 9:23:49a PT, 1 load LOADED, equipment HGIU503975, seal 1379035 - LOAD-5043933 / 11016030 // SP BOL, 7 DNs DN-3410736 / DN-3410719 / DN-3410718 / DN-3410714 / DN-3410716 / DN-3410711 / DN-3410710, load appointment 11/10 10:00a PT, ship-to Marshalls Distribution Center # 888) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [], entry ET-1181295 (row updated 11/11 9:23a PT) - the door moved from RESERVED at the 8:56a PT pull to OCCUPIED on this new entry ticket · the previous task here, TASK-5416941, closed 11/10 11:48:31a PT under a second Arnulfo identity (assigneeUserId 1948070158297014318; 4 loads all SHIPPED, seal 24800341)",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [], entry ET-1181299 (row updated 11/11 9:53a PT) · the last load task to close here, TASK-5417112, closed 11/10 2:24:50p PT under BARTOLO RAMIREZ (1 load SHIPPED, equipment EMHU278326, seal 1379000) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1180355 (row updated 11/9 10:29a PT) · the last GURUNANDA load task to close here was TASK-5415353 (11/9 10:28:04a PT, 1 load, seal 1378464, DANIEL BELTRAN); the last receive task was TASK-5414098 (Nanci Viviana Rosas, CLOSED 11/9 2:14:50p PT, RN-194689) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [], entry ET-1181220 (row updated 11/11 9:20:36a PT) · TASK-5417889 CLOSED here at 11/11 9:18:38a PT (DANIEL BELTRAN, LIVE_LOAD, ran 51m from 8:27:11a PT, checked in 8:27:41a PT, 1 load SHIPPED on equipment JBHz681374, seal 1379034 - LOAD-5043802 / CS0001149966 RTS: 42456809 UNIS BOL, 18 DNs) · the last receive task to close here was TASK-5414761 (DANIELA GONZALEZ, 11/6 5:09:25p PT, RN-5011403) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: "CANDY MENDEZ (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5417811"],
    duration: "RECEIVE NEW, not started (created 11/11 7:38:40a PT, TASK-5417811, CANDY MENDEZ, ET-1181229, receipt RN-195436 at status IMPORTED, PO GN11102026UNIS-1317, appointment 11/10 12:00a PT, in-yard 11/10 2:10:23p PT, seal 9100808, container 53660) - no startTime, so no duration basis · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [], entry ET-1180224 (row updated 11/11 7:38a PT) · the last GURUNANDA load task to close here was TASK-5413966 (11/6 8:59:43a PT, 1 load, seal 1378472, DANIEL BELTRAN); the last receive task was TASK-5415038 (DANIELA GONZALEZ, 11/9 6:45:47p PT, RN-5011335)",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1179653 (row updated 11/10 8:58p PT) · the last GURUNANDA load task to close here was TASK-5413376 (11/5 2:50:10p PT, 5 loads, seal 1378416, JULIO CESAR ALVARADO) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1180178 (row updated 11/11 7:29:58a PT) · the last GURUNANDA load task to close here was TASK-5411834 (11/4 9:51:30a PT, 1 load, seal 1378451, DANIEL BELTRAN); the last receive task was TASK-5414777 (Fatima Ponce, 11/10 7:13:40a PT, RN-5011407) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1181113 (row updated 11/11 8:07a PT). The receive task that held it, TASK-5417481 (DANIELA GONZALEZ, RN-5011485 - the 11/10 9:00a PT appointment PO-container FFAU5817716), closed 11/10 8:40:56p PT after starting 3:36:33p PT",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1180165 (row updated 11/11 7:29:34a PT) · no GURUNANDA load task has closed at this door since 2026-10-31; the last receive task to close here was TASK-5414772 (Fatima Ponce, 11/9 9:56:00a PT, RN-5011413) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1176452 (row updated 11/9 7:36a PT) · no GURUNANDA load or receive task has closed at this door since 2026-10-31 (receive window checked back to 11/5 9:22a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1179941 (row updated 11/10 8:57p PT) · the receive task that held it, TASK-5413519 (Nanci Viviana Rosas), was FORCE_CLOSED 11/10 11:38:02a PT after starting 11/5 1:07:49p PT (RN-194259 at status EXCEPTION, PO Work Order, container UNKNOWN - LCL) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1173309 (row updated 11/11 7:29a PT) · no GURUNANDA load or receive task has closed at this door since 2026-10-31 (receive window checked back to 11/5 9:22a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1181007 (row updated 11/10 2:38p PT) · the receive task that held the door, TASK-5417173 (Fatima Ponce, RN-195361 / PO FUS11092026UNIS-104), closed 11/10 2:38:58p PT after starting 2:35:00p PT · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1177841 (row updated 11/10 8:57p PT) · no GURUNANDA load or receive task has closed at this door since 2026-10-31 (receive window checked back to 11/5 9:22a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW, not started (created 9/30 10:46:50a PT, TASK-5381972, Jorge Antonio Franco, ET-1162686, receipt RN-5010583 / PO9139-2, container Jpack09242026, no appointment, in-yard 9/30 10:46:48a PT, receipt status IMPORTED) - no startTime, so no duration basis · dock OCCUPIED, space EMPTY, entry ET-1171953 (row updated 11/10 8:57p PT) · no GURUNANDA load task has closed here since 2026-10-31",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1172826 (row updated 11/11 6:05a PT) · no GURUNANDA load or receive task has closed at this door since 2026-10-31 (receive window checked back to 11/5 9:22a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1176765 (row updated 11/9 4:40p PT) · no GURUNANDA load or receive task has closed at this door since 2026-10-31 (receive window checked back to 11/5 9:22a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1176051 (row updated 11/10 8:56p PT) · no GURUNANDA load or receive task has closed at this door since 2026-10-31 (receive window checked back to 11/5 9:22a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 17
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 1
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 5
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 1
const available = doors.filter((d) => d.status === "Available").length; // 5

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
    value: `5`,
    numerator: 5,
    denominator: TOTAL_DOORS,
    percentage: Math.round((5 / TOTAL_DOORS) * 100),
  },
  {
    label: "Doors Available",
    value: `5`,
    numerator: 5,
    denominator: TOTAL_DOORS,
    percentage: Math.round((5 / TOTAL_DOORS) * 100),
  },
  {
    label: "Anomalies",
    value: `1`,
    numerator: 1,
    denominator: TOTAL_DOORS,
    percentage: Math.round((1 / TOTAL_DOORS) * 100),
  },
];

// Doors that carried dockStatus RESERVED at this pull:
// DOCK51 only.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, Nov 11 2026 ~10:02a PT).
// 6 active-status tasks at Bay-4 doors: 3 LOAD + 3 RECEIVE, at 5 distinct doors
// (DOCK50, DOCK51, DOCK55, DOCK59, DOCK69).
// ARNULFO MUNGUIA: 1 LOAD (DOCK51 TASK-5417125, IN_PROGRESS, 5 loads all LOADED,
//   no seal, reassigned back to him at 11/10 11:17:11p PT)
// GONZALO RANGEL: 1 LOAD (DOCK51 TASK-5417954, NEW, WINDOW_CHECKIN_DONE)
// DANIEL BELTRAN: 1 LOAD (DOCK55 TASK-5418069, IN_PROGRESS since 9:23:01a)
// CANDY MENDEZ: 1 RECEIVE (DOCK59 TASK-5417811, NEW)
// Jorge Antonio Franco: 1 RECEIVE (DOCK69 TASK-5381972, NEW)
// daira gonzalez: 1 RECEIVE (DOCK50 TASK-5090739, IN_PROGRESS, stale)
// All assigned names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 1 },
  { name: "GONZALO RANGEL", taskCount: 1 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "CANDY MENDEZ", taskCount: 1 },
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

// Mix: 3 RECEIVE + 3 LOAD = 6 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 3, total: 6 },
  { label: "Outbound (LOAD)", count: 3, total: 6 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 3, total: 6 },
  { label: "Inbound", count: 3, total: 6 },
];

// --- Schedule Data (2026-11-11, Wednesday) ---
// Only 1 GURUNANDA inbound receipt is scheduled on 11/11 PT, and no outbound day
// is complete at 10:02 PT, so both percentages are real values this pull.
//   % scheduled inbounds received TODAY: 1 GURUNANDA receipt carries an
//   appointmentTime inside the 11/11 PT business day (query window
//   appointmentTimeFrom "2026-11-11 00:00:00" -> appointmentTimeTo
//   "2026-11-11 23:59:59", totalCount 1), of which 0 carry a receivedStartTime
//   = 0 / 1 = 0.0%. Not yet received (1): B00419648 (PO-container
//   OOCU7729628, appointment 4:00p PT), still at status IMPORTED.
//   % scheduled outbounds loaded TODAY: 64 GURUNANDA orders carry a scheduleDate
//   inside the 11/11 PT day (scheduleDatePeriod ["2026-11-11 00:00:00",
//   "2026-11-11 23:59:59"], totalCount 64), of which 6 are at status SHIPPED
//   = 6 / 64 = 9.4%. Remaining 11/11 order statuses: PICKED 31, PLANNED 17,
//   IMPORTED 5, OPEN 3, PICKING 1, PACKED 1.
//   CONTEXT ONLY (not substituted into today's metrics): these two ratios were
//   re-read live at this refresh as a query sanity check - 11/10 reads 6
//   receipts of which 4 carry a receivedStartTime (66.7%) and 44 orders of which
//   4 are SHIPPED (9.1%); 11/9 reads 4 receipts of which 4 are received (100.0%)
//   and 156 orders of which 59 are SHIPPED (37.8%); 11/12 reads 1 receipt of
//   which 0 are received and 29 orders of which 0 are SHIPPED. The low 11/11
//   figures reflect a day only 3h02m old at 10:02a PT, not a broken filter.
export const scheduleAvailable = true;              // GURUNANDA receipts scheduled on 11/11
export const outboundScheduleAvailable = true;      // GURUNANDA orders scheduled on 11/11
export const scheduledInboundOrders = 1;            // receipts with appointmentTime in the 11/11 PT day
export const scheduledOutboundOrders = 64;          // orders with scheduleDate in the 11/11 PT day
export const scheduledInboundReceived = 0;          // receipts with receivedStartTime in that set
export const scheduledOutboundLoaded = 6;           // orders at status SHIPPED in that set
export const pctScheduledInboundReceived = 0.0;     // 0 of 1
export const pctScheduledOutboundLoaded = 9.4;      // 6 of 64
// Facility-wide appointment context - unavailable (GURUNANDA-scoped queries only;
// no all-customer facility-wide appointment totals were pulled for this refresh).
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime where a task exists on the
// door and has actually started and has not already ended; unavailable for
// task-less doors and for NEW tasks with no startTime (no occupancy-start field in
// WMS, and the dock-door-status dashboard endpoint returns an empty Duration
// column). 17 of 23 doors carry no active task at this pull, 3 of the 6 tasks are
// NEW/not started (DOCK51 TASK-5417954, DOCK59 TASK-5417811, DOCK69 TASK-5381972)
// and 1 is stale (DOCK50 TASK-5090739), so a duration exists for 2 tasks on 2
// doors (DOCK51 18h48m from 11/10 3:13:38p PT and DOCK55 39m from 11/11 9:23:01a
// PT - both measured to 11/11 10:02 PT).
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Nov 11 2026 ~10:02a PT)
// 6 tasks total: 3 LOAD + 3 RECEIVE. All GURUNANDA, LLC.
// One is a data anomaly (TASK-5090739 on DOCK50, stale since 10/21/25).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA has 54 CLOSED GURUNANDA load transactions with endTime inside
// the 2026-10-31 00:00:00 - 2026-11-11 10:02 PT window (53 under assigneeUserId
// 89 plus 1 under a second Arnulfo identity, assigneeUserId
// 1948070158297014318; 49 of them at Bay-4 doors, spread over DOCK51 8,
// DOCK52 8, DOCK54 8, DOCK53 7, DOCK55 6, DOCK50 5, DOCK56 3, DOCK60 2,
// DOCK59 1, DOCK57 1; the other 5 are on DOCK5 2, DOCK7 2 and DOCK45 1);
// 2 of the transactions closed on 11/11 PT - DOCK50 TASK-5417115 (9:32:38a,
// 7 loads all SHIPPED, seal 1379032) and DOCK54 TASK-5417645 (9:49:27a, 1 load
// SHIPPED, seal 1379033) - 10 closed on 11/10 PT, 6 on 11/9 PT, 0 on 11/8 PT,
// 0 on 11/7 PT, 8 on 11/6 PT, 4 on 11/5 PT, 11 on 11/4 PT, 6 on 11/3 PT and
// 7 on 11/2 PT.
// The newest is DOCK54 TASK-5417645
// (started 11/10 8:46:48p PT, closed 11/11 9:49:27a PT; 1 load SHIPPED; seal
// 1379033). The ten that closed on 11/10 are DOCK53 TASK-5416134 (9:42:02a PT,
// 6 loads, seal 24800345), DOCK52 TASK-5414481 (9:45:26a PT, 1 load, seal
// 25079925), DOCK51 TASK-5416299 (10:26:16a PT, 2 loads, seal 24800346), DOCK50
// TASK-5415615 (10:30:25a PT, 1 load, seal 1378465), DOCK53 TASK-5415952
// (11:15:04a PT, 4 loads, seal 24800342), DOCK55 TASK-5416941 (11:48:31a PT,
// 4 loads, seal 24800341 - second Arnulfo identity), DOCK56 TASK-5416956
// (12:24:58p PT, 3 loads, seal 24800344), DOCK52 TASK-5416137 (1:39:35p PT,
// 3 loads, seal 24800340), DOCK45 TASK-5416927 (1:47:14p PT, 1 load, seal
// 24800343 - off Bay 4) and DOCK52 TASK-5417412 (2:58:04p PT, 1 load, seal NA).
// He holds ONE open Bay-4 load task at this pull:
// DOCK51 TASK-5417125 (IN_PROGRESS since 11/10 3:13:38p PT, 5 loads all LOADED,
// no seal, reassigned back to him at 11/10 11:17:11p PT). DOCK62 TASK-5417481
// closed at 8:40:56p PT on 11/10 under DANIELA GONZALEZ.
export const assignments: TaskRecord[] = [
  // ----- INBOUND / RECEIVE (3) -----
  {
    taskId: "TASK-5417811",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/11 7:38:40a PT (CANDY MENDEZ; ET-1181229, RN-195436, PO GN11102026UNIS-1317, appointment 11/10 12:00a PT, in-yard 11/10 2:10:23p PT, seal 9100808, container 53660, receipt status IMPORTED) - task has no startTime",
    assignee: "CANDY MENDEZ",
    door: "DOCK59",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/30 10:46:50a PT (Jorge Antonio Franco; ET-1162686, RN-5010583, PO9139-2, container Jpack09242026, no appointment, in-yard 9/30 10:46:48a PT, receipt status IMPORTED) - task has no startTime",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 10/21/25 1:21:14p PT; status still IN_PROGRESS although endTime is 10/22/25 10:42:01a PT; daira gonzalez, ET-1027622, RN-5002143 which is itself already CLOSED, PO-container EGSU8032696)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },

  // ----- OUTBOUND / LOAD (3) -----
  {
    taskId: "TASK-5417125",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 18h48m since 11/10 3:13:38p PT (ARNULFO MUNGUIA, lastAssignedWhen 11/10 11:17:11p PT - reassigned back from JOSE ROSAS; ET-1180959, PRE_LOAD, checked in 3:13:44p PT, 5 loads all LOADED, equipment 53142, no seal recorded - LOAD-5044137 / 50156395 DN-3451149, LOAD-5044136 / 50156393 DN-3451216, LOAD-5044135 / 50156391 DN-3451238, LOAD-5044134 / 50156389 DN-3451356, LOAD-5044132 / 50156385 DN-3451362)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5418069",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 39m since 11/11 9:23:01a PT (DANIEL BELTRAN, task created 9:13:57a PT; ET-1181295, LIVE_LOAD, checked in 9:23:49a PT, 1 load LOADED, equipment HGIU503975, seal 1379035 - LOAD-5043933 / 11016030 // SP BOL, load appointment 11/10 10:00a PT, 7 DNs DN-3410736 / DN-3410719 / DN-3410718 / DN-3410714 / DN-3410716 / DN-3410711 / DN-3410710)",
    assignee: "DANIEL BELTRAN",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5417954",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/11 8:30:57a PT (GONZALO RANGEL; ET-1181268, LIVE_LOAD, not checked in, 1 load at status WINDOW_CHECKIN_DONE, equipment TA207656 - LOAD-5044105 / CS02523438 UNIS BOL, appointment 11/11 11:00a PT, driver MARCO ALVAREZ, 4 DNs DN-3420283 / DN-3420281 / DN-3420282 / DN-3420252) - task has no startTime",
    assignee: "GONZALO RANGEL",
    door: "DOCK51",
  },
];
