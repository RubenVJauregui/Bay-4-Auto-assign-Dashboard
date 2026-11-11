/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-10 16:22:00 PT (live WISE / WMS-BAM APIs)
 *   Sources (all read with item-time-zone America/Los_Angeles; WISE returns the
 *   dock/task/receipt/order timestamps as naive facility wall-clock values, so
 *   the strings below are already PT and no UTC->PT shift is applied):
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors, 23/23 rows
 *       returned (fresh dockStatus, spaceStatus, occupiedCustomerIds, entryId,
 *       updatedTime)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide total 10); matched on dockName to
 *       the 23 Bay-4 docks -> 2 at Bay-4 doors (DOCK50 TASK-5417115,
 *       DOCK51 TASK-5417125)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide total 12), same per-door dockName
 *       match -> 3 at Bay-4 doors (DOCK62 TASK-5417481, DOCK69 TASK-5381972,
 *       DOCK50 TASK-5090739)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To inside the 11/10 PT business day -> totalCount 7
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDatePeriod inside the 11/10 PT business day -> totalCount 40
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA CLOSED/FORCE_CLOSED
 *       load tasks, endTimeFrom 2026-10-31 00:00:00, sorted endTime DESC
 *       -> 121 rows; 52 of them are Arnulfo Munguia (51 under assigneeUserId 89
 *       plus 1 under a second Arnulfo identity, assigneeUserId
 *       1948070158297014318), 47 at Bay-4 doors (Arnulfo Assigned Activity stream)
 *     - /wms-bam/outbound/load-task/search-by-paging - facility-wide (all
 *       customers) CLOSED/FORCE_CLOSED load tasks with endTimeFrom 2026-11-10
 *       00:00:00 -> totalCount 52, of which 10 closed at Bay-4 doors; newest
 *       facility-wide closure is 11/10 14:58:04 PT
 *     - /wms-bam/inbound/receive-task/search-by-paging - CLOSED/FORCE_CLOSED
 *       receive tasks sorted endTime DESC (all customers; facility-wide) -> 4
 *       closures dated 11/10 PT at Bay-4 doors (DOCK67, DOCK65, DOCK67, DOCK61)
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders at status
 *       PLANNED, no date filter -> totalCount 188 (planned-orders fallback)
 *   NOTE: door state is read from wms-location/search (dockStatus + spaceStatus),
 *   the same two status fields the dashboard already uses.
 *   NOTE: the load/receive task searches were filtered by customerIds only and
 *   matched to Bay-4 doors on the returned dockName field (dockId is also present
 *   but is a numeric location id, not the DOCKnn name).
 *   NOTE: the query shapes used here are byte-identical to the prior refresh,
 *   except that the receipt/order day windows moved from 11/9 to 11/10 and the
 *   receive-task closed-status pull relies on a client-side endTime date filter
 *   (that endpoint ignores endTimeFrom). This pull ran at 16:22 PT on Tuesday
 *   11/10, ~2h58m after the 11/10 1:24p PT pull.
 *
 *   CONTEXT - 11/10 PT is a Tuesday and GURUNANDA volume IS scheduled on it, so
 *   both percentages are published as real numbers:
 *   % scheduled inbounds received = 3 / 7 = 42.9% (RN-195440 received 3:22:17p,
 *   RN-195361 received 2:35:00p, RN-5011485 received 3:36:33p). The 4 still not
 *   received are RN-195438, RN-195436, RN-195435 (12:00a appointments, still
 *   IMPORTED) and RN-5011505 (6:00p appointment, still IMPORTED).
 *   % scheduled outbounds loaded = 4 / 40 = 10.0% (orders at status SHIPPED - the
 *   same definition the prior pulls used; remaining 11/10 statuses: PLANNED 23,
 *   PICKED 6, COMMIT_FAILED 4, IMPORTED 1, PLANNING 1, COMMIT_BLOCKED 1). Both
 *   denominators were re-validated against neighbouring days at this pull (11/6:
 *   10 receipts of which 10 carry a receivedStartTime, 44 orders of which 24 are
 *   SHIPPED; 11/9: 4 receipts of which 4 are received, 132 orders of which 55 are
 *   SHIPPED), so the low 11/10 ratios reflect the day still being in progress at
 *   16:22 PT, not a broken filter.
 *
 *   Key changes from the prior refresh (11/10 ~1:24p PT -> 11/10 ~4:22p PT):
 *     - DOOR STATUS: occupied moved 15 -> 16 and reserved 2 -> 1 as DOCK52 flipped
 *       from RESERVED to AVAILABLE/EMPTY and DOCK62 filled with a receive task.
 *       Now occupied: DOCK50, DOCK51, DOCK53, DOCK54, DOCK56, DOCK57, DOCK58,
 *       DOCK59, DOCK60, DOCK62, DOCK64, DOCK65, DOCK67, DOCK68, DOCK69, DOCK72.
 *       DOCK55 is the only RESERVED door. Fully free (6): DOCK52, DOCK61,
 *       DOCK63, DOCK66, DOCK70, DOCK71. Raw dockStatus is OCCUPIED 11,
 *       AVAILABLE 11, RESERVED 1; DOCK53, DOCK56, DOCK57, DOCK58 and DOCK64 are
 *       space-occupied only with dockStatus AVAILABLE, so the dashboard's
 *       Occupied count (16) exceeds the raw dockStatus count (11).
 *     - TASK TURNOVER: three of the seven tasks open at the prior pull closed
 *       (DOCK52 TASK-5416137 1:39:35p, DOCK56 TASK-5417112 2:24:50p, DOCK67
 *       TASK-5417173 2:38:58p) and one new task appeared (DOCK62 TASK-5417481).
 *       The two NEW load tasks that were waiting at the prior pull both started:
 *       DOCK50 TASK-5417115 at 3:02:26p (still ARNULFO MUNGUIA) and DOCK51
 *       TASK-5417125 at 3:13:38p (reassigned to JOSE ROSAS). Net active count
 *       fell from 7 to 5 and the mix moved from 4 LOAD / 3 RECEIVE to
 *       2 LOAD / 3 RECEIVE.
 *     - ASSIGNMENTS BY ASSIGNEE: ARNULFO MUNGUIA 1 (DOCK50), JOSE ROSAS 1
 *       (DOCK51, reassigned from Arnulfo shortly before start), DANIELA GONZALEZ
 *       1 (DOCK62), Jorge Antonio Franco 1 (DOCK69), daira gonzalez 1 (DOCK50,
 *       stale).
 *     - LOAD PROGRESS: DOCK50 TASK-5417115 is IN_PROGRESS with 7 loads (2 LOADED
 *       / 5 LOADING, equipment 53779); DOCK51 TASK-5417125 is IN_PROGRESS with
 *       all 5 loads LOADED (equipment 53142, no seal recorded). Statuses are
 *       verbatim.
 *     - ANOMALIES: 1, unchanged. TASK-5090739 (DOCK50, RECEIVE started 10/21/25)
 *       is still returned by the active-status query although its endTime is
 *       10/22/25 and its linked receipt RN-5002143 is CLOSED. It is left flagged,
 *       not given an open-ended duration.
 *     - Task "Guru live out / in assign to Arnulfo" still resolves to ARNULFO
 *       MUNGUIA GURUNANDA Bay 4 work. No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo"; the stream is read as the
 *       assignee's task assignment transactions and none is invented here.
 *       His assigned-activity pull (closed load tasks, endTime from 2026-10-31
 *       00:00:00 PT) grew from 49 to 52 transactions (45 -> 47 at Bay-4 doors),
 *       with 10 closing today (11/10 PT), 6 on 11/9, 0 on 11/8, 0 on 11/7, 8 on
 *       11/6, 4 on 11/5, 11 on 11/4, 6 on 11/3 and 7 on 11/2. The newest is
 *       DOCK52 TASK-5417412 (started 11/10 2:53:58p PT, closed 2:58:04p PT,
 *       1 load SHIPPED, seal NA). He now holds a single open Bay-4 load task
 *       (DOCK50 TASK-5417115).
 *     - "% scheduled inbounds received" (11/10 PT day): 3 of 7 = 42.9%.
 *     - "% scheduled outbounds loaded" (11/10 PT day): 4 of 40 = 10.0% (SHIPPED).
 *     - Inbound/outbound mix: 3 RECEIVE / 2 LOAD of 5 active Bay-4 tasks.
 *     - Total doors occupied: 16 of 23 (was 15), plus 1 reserved.
 *     - Planned GURUNANDA orders (fallback): 188 (was 194).
 *     - Door occupancy duration is available where a task with a startTime sits
 *       on the door and has not already ended: now 3 of 5 tasks on 3 doors
 *       (DOCK50 TASK-5417115 1h19m from 3:02:26p, DOCK51 TASK-5417125 1h08m from
 *       3:13:38p, DOCK62 TASK-5417481 45m from 3:36:33p). WMS has no
 *       occupancy-start field for task-less doors (19 of 23), for the NEW task on
 *       DOCK69 or for the one stale task.
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
// NOT re-pulled in the 11/10 4:22p PT refresh (out of scope of the request). The
// array is left empty rather than carrying a stale result; Section 1 renders live
// from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 188 at the 11/10 ~4:22p PT pull (down from 194).
export const plannedGurunandaOrderCount = 188;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/10 ~4:22p PT
//
// Door status rule (kept identical to the dashboard's 3-value enum):
//   Reserved  = dockStatus RESERVED
//   Occupied  = dockStatus OCCUPIED OR spaceStatus OCCUPIED (not fully free)
//   Available = dockStatus AVAILABLE AND spaceStatus EMPTY
// Raw field values are preserved per door so the mapping can be re-checked.
// =====================================================================
export const doors: DoorRecord[] = [
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD) + daira gonzalez (RECEIVE - STALE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5417115", "TASK-5090739"],
    duration: "LOAD 1h19m since 11/10 3:02:26p PT (TASK-5417115, ARNULFO MUNGUIA, PRE_LOAD, checked in 3:02:33p PT, 7 loads 2 LOADED / 5 LOADING, equipment 53779 - LOAD-5044138 / 50156397 DN-3451144, LOAD-5044230 / 50159723 DN-3450873, LOAD-5044013 / 50153882 DN-3445506, LOAD-5044141 / 50156429 DN-3450948, LOAD-5044142 / 50156434 DN-3450838, LOAD-5044011 / 50153828 DN-3445510, LOAD-5044012 / 50153849 DN-3445507) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1180948 (row updated 3:02p PT) · the second task here, TASK-5090739, is STALE: started 10/21/25 1:21:14p PT and still returned as IN_PROGRESS although its endTime is 10/22/25 10:42:01a PT (RN-5002143 is itself CLOSED), so no open-ended duration is derived · the 1-load task that closed here today, TASK-5415615, ran 11/9 2:49:04p -> 11/10 10:30:25a PT under ARNULFO MUNGUIA (LOAD-5044020 / 50154436 SHIPPED, DN-3445469, seal 1378465)",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "JOSE ROSAS (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5417125"],
    duration: "LOAD 1h08m since 11/10 3:13:38p PT (TASK-5417125, JOSE ROSAS - lastAssignedWhen 3:13:26p PT, PRE_LOAD, checked in 3:13:44p PT, 5 loads all LOADED, equipment 53142, no seal recorded - LOAD-5044137 / 50156395 DN-3451149, LOAD-5044136 / 50156393 DN-3451216, LOAD-5044135 / 50156391 DN-3451238, LOAD-5044134 / 50156389 DN-3451356, LOAD-5044132 / 50156385 DN-3451362) · dock OCCUPIED, space OCCUPIED, entry ET-1180959 (row updated 3:13p PT) · this task was still NEW and assigned to ARNULFO MUNGUIA at the 1:24p PT pull and was reassigned to JOSE ROSAS just before it started · the 2-load task that closed here today, TASK-5416299, ran 11/9 10:35:47p -> 11/10 10:26:16a PT under ARNULFO MUNGUIA (LOAD-5043980 / 50145608 DN-3445165, LOAD-5043981 / 50145612 DN-3445117, seal 24800346)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1181081 (row updated 3:02p PT) - the door freed after two load tasks closed here this afternoon: TASK-5416137 (ARNULFO MUNGUIA, 20h59m from 11/9 4:40:33p -> 11/10 1:39:35p PT, 3 loads all SHIPPED, seal 24800340) and TASK-5417412 (ARNULFO MUNGUIA, 11/10 2:53:58p -> 2:58:04p PT, 1 load SHIPPED, seal NA); the task that had been stale here since 11/6, TASK-5414481, also closed this morning at 9:45:26a PT · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [], entry ET-1180892 (row updated 12:27p PT) - the space is still flagged occupied with no task holding it (the same entry ET-1180892 also appears on DOCK55) · two load tasks closed here today, both ARNULFO MUNGUIA: TASK-5416134 (11/9 3:38:07p -> 11/10 9:42:02a PT, 6 loads all SHIPPED, seal 24800345) and TASK-5415952 (11/9 2:02:53p -> 11/10 11:15:04a PT, 4 loads all SHIPPED, seal 24800342) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, entry ET-1180481 (row updated 2:59a PT) · no Bay-4 load or receive task closed at this door today (11/10 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space OCCUPIED, entry ET-1180892 (row updated 1:17p PT) · the 4-load LIVE_LOAD task that ran here today, TASK-5416941, closed 11/10 11:48:31a PT after starting 11:04:12a PT and is logged under a second Arnulfo identity (assigneeUserId 1948070158297014318; all 4 loads SHIPPED, seal 24800341) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [], entry ET-1180947 (row updated 2:25p PT) · the LIVE_LOAD task that was open here at the 1:24p PT pull, TASK-5417112, closed 2:24:50p PT under BARTOLO RAMIREZ (started 1:10:17p PT, 1 load SHIPPED - LOAD-5041034 / 30237374 // SP BOL, DN-3388769 + DN-3409250, seal 1379000) · the 3-load task TASK-5416956 also closed here today at 12:24:58p PT under ARNULFO MUNGUIA (all 3 SHIPPED, seal 24800344) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1180355 (row updated 11/9 10:29a PT) · no Bay-4 load or receive task closed at this door today (11/10 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1180413 (row updated 3:51p PT) · no Bay-4 load or receive task closed at this door today (11/10 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, entry ET-1180224 (row updated 2:59a PT) · no Bay-4 load or receive task closed at this door today (11/10 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1179653 (row updated 2:59a PT) · no Bay-4 load or receive task closed at this door today (11/10 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1180178 (row updated 7:20a PT, re-stamped as the door freed up). The receive task that held it, TASK-5414777 (Fatima Ponce, RN-5011407 - the 11/6 10:00a PT appointment PO-container OOCU5406647), closed 11/10 7:13:40a PT after starting 11/6 5:51:46p PT",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5417481"],
    duration: "RECEIVE 45m since 11/10 3:36:33p PT (TASK-5417481, DANIELA GONZALEZ, ET-1181113, dock check-in 3:36:35p PT, receipt RN-5011485 IN_PROGRESS - appointment 11/10 9:00a PT, PO-container FFAU5817716, in-yard 3:35:27p PT, receivedStartTime 3:36:33p PT) · dock OCCUPIED, space EMPTY, entry ET-1181113 (row updated 3:36p PT) · the receive task that held this door earlier, TASK-5414773, closed 11/9 1:52:21p PT (Fatima Ponce)",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1180165 (row updated 11/9 10:12a PT) · no Bay-4 load or receive task closed at this door today (11/10 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1176452 (row updated 11/9 7:36a PT) · no Bay-4 load or receive task closed at this door today (11/10 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1179941 (row updated 7:06a PT) · the receive task that held it, TASK-5413519 (Nanci Viviana Rosas), was FORCE_CLOSED 11/10 11:38:02a PT after starting 11/5 1:07:49p PT (RN-194259 at status EXCEPTION, PO Work Order, container UNKNOWN - LCL) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1173309 (row updated 11/9 4:38p PT) · no Bay-4 load or receive task closed at this door today (11/10 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1181007 (row updated 2:38p PT) · the receive task that was open here at the 1:24p PT pull, TASK-5417173 (Fatima Ponce, RN-195361 / PO FUS11092026UNIS-104), closed 2:38:58p PT after starting 2:35:00p PT; the receive task that held the door this morning, TASK-5414174 (Fatima Ponce, RN-5011408 / TGHU6885258), was FORCE_CLOSED 9:28:54a PT after starting 8:09:24a PT · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1177841 (row updated 2:59a PT) · no Bay-4 load or receive task closed at this door today (11/10 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW, not started (created 9/30 10:46:50a PT, TASK-5381972, Jorge Antonio Franco, ET-1162686, receipt RN-5010583 / PO9139-2, container Jpack09242026, no appointment, in-yard 9/30 10:46:48a PT, receipt status IMPORTED) - no startTime, so no duration basis · dock OCCUPIED, space EMPTY, entry ET-1171953 (row updated 7:07a PT)",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1172826 (row updated 11/6 3:43p PT) · no Bay-4 load or receive task closed at this door today (11/10 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1176765 (row updated 11/9 4:40p PT) · no Bay-4 load or receive task closed at this door today (11/10 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1176051 (row updated 11/7 12:36a PT) · no Bay-4 load or receive task closed at this door today (11/10 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 16
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 1
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 4
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 1
const available = doors.filter((d) => d.status === "Available").length; // 6

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors Occupied",
    value: `16/23`,
    numerator: 16,
    denominator: TOTAL_DOORS,
    percentage: Math.round((16 / TOTAL_DOORS) * 100),
  },
  {
    label: "Doors w/ Active Tasks",
    value: `4`,
    numerator: 4,
    denominator: TOTAL_DOORS,
    percentage: Math.round((4 / TOTAL_DOORS) * 100),
  },
  {
    label: "Doors Available",
    value: `6`,
    numerator: 6,
    denominator: TOTAL_DOORS,
    percentage: Math.round((6 / TOTAL_DOORS) * 100),
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
// DOCK55.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, Nov 10 2026 ~4:22p PT).
// 5 active-status tasks at Bay 4 doors: 2 LOAD + 3 RECEIVE.
// ARNULFO MUNGUIA: 1 LOAD (DOCK50 TASK-5417115, IN_PROGRESS)
// JOSE ROSAS: 1 LOAD (DOCK51 TASK-5417125, IN_PROGRESS - reassigned from
//   ARNULFO MUNGUIA at 3:13:26p PT)
// DANIELA GONZALEZ: 1 RECEIVE (DOCK62 TASK-5417481, IN_PROGRESS)
// Jorge Antonio Franco: 1 RECEIVE (DOCK69 TASK-5381972, NEW)
// daira gonzalez: 1 RECEIVE (DOCK50 TASK-5090739, IN_PROGRESS, stale)
// All assigned names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 1 },
  { name: "JOSE ROSAS", taskCount: 1 },
  { name: "DANIELA GONZALEZ", taskCount: 1 },
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

// Mix: 3 RECEIVE + 2 LOAD = 5 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 3, total: 5 },
  { label: "Outbound (LOAD)", count: 2, total: 5 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 2, total: 5 },
  { label: "Inbound", count: 3, total: 5 },
];

// --- Schedule Data (2026-11-10, Tuesday) ---
// GURUNANDA volume IS scheduled on 11/10 PT, so both percentages are real values
// this pull.
//   % scheduled inbounds received TODAY: 7 GURUNANDA receipts carry an
//   appointmentTime inside the 11/10 PT business day (query window
//   appointmentTimeFrom "2026-11-10 00:00:00" -> appointmentTimeTo
//   "2026-11-10 23:59:59", totalCount 7), of which 3 carry a receivedStartTime
//   = 3 / 7 = 42.9%. Received: RN-195440 (3:22:17p), RN-195361 (2:35:00p) and
//   RN-5011485 (3:36:33p). Not yet received (4): RN-195438, RN-195436 and
//   RN-195435 (12:00a appointments) and RN-5011505 (6:00p appointment), all
//   still at status IMPORTED.
//   % scheduled outbounds loaded TODAY: 40 GURUNANDA orders carry a scheduleDate
//   inside the 11/10 PT day (scheduleDatePeriod ["2026-11-10 00:00:00",
//   "2026-11-10 23:59:59"], totalCount 40), of which 4 are at status SHIPPED
//   = 4 / 40 = 10.0%. Remaining 11/10 order statuses: PLANNED 23, PICKED 6,
//   COMMIT_FAILED 4, IMPORTED 1, PLANNING 1, COMMIT_BLOCKED 1.
//   CONTEXT ONLY (not substituted into today's metrics): these two ratios were
//   re-read live at this refresh as a query sanity check - 11/9 now reads 4
//   receipts of which 4 carry a receivedStartTime (100.0%) and 132 orders of
//   which 55 are SHIPPED (41.7%); 11/6 reads 10 receipts of which 10 are
//   received (100.0%) and 44 orders of which 24 are SHIPPED (54.5%). The lower
//   11/10 figures reflect a day still in progress at 4:22p PT, not a broken
//   filter.
export const scheduleAvailable = true;              // GURUNANDA receipts scheduled on 11/10
export const outboundScheduleAvailable = true;      // GURUNANDA orders scheduled on 11/10
export const scheduledInboundOrders = 7;            // receipts with appointmentTime in the 11/10 PT day
export const scheduledOutboundOrders = 40;          // orders with scheduleDate in the 11/10 PT day
export const scheduledInboundReceived = 3;          // receipts with receivedStartTime in that set
export const scheduledOutboundLoaded = 4;           // orders at status SHIPPED in that set
export const pctScheduledInboundReceived = 42.9;    // 3 of 7
export const pctScheduledOutboundLoaded = 10.0;     // 4 of 40
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
// column). 19 of 23 doors carry no active task at this pull, 1 of the 5 tasks is
// NEW/not started (DOCK69) and 1 is stale (DOCK50 TASK-5090739), so a duration
// exists for 3 tasks on 3 doors (DOCK50 1h19m from 3:02:26p PT, DOCK51 1h08m from
// 3:13:38p PT and DOCK62 45m from 3:36:33p PT - all measured to 11/10 16:22 PT).
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Nov 10 2026 ~4:22p PT)
// 5 tasks total: 2 LOAD + 3 RECEIVE. All GURUNANDA, LLC.
// One is a data anomaly (TASK-5090739 on DOCK50, stale since 10/21/25).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA has 52 CLOSED GURUNANDA load transactions with endTime inside
// the 2026-10-31 00:00:00 - 2026-11-10 16:22 PT window (51 under assigneeUserId
// 89 plus 1 under a second Arnulfo identity, assigneeUserId
// 1948070158297014318; 47 of them at Bay-4 doors, spread over DOCK51 8,
// DOCK52 8, DOCK53 7, DOCK54 7, DOCK55 6, DOCK50 4, DOCK56 3, DOCK60 2,
// DOCK59 1, DOCK57 1; the other 5 are on DOCK5 2, DOCK7 2 and DOCK45 1);
// 10 of the transactions closed today (11/10 PT), 6 closed on 11/9 PT, 0 on
// 11/8 PT, 0 on 11/7 PT, 8 on 11/6 PT, 4 on 11/5 PT, 11 on 11/4 PT, 6 on 11/3 PT
// and 7 on 11/2 PT.
// The newest is DOCK52 TASK-5417412
// (started 11/10 2:53:58p PT, closed 11/10 2:58:04p PT; 1 load SHIPPED;
// seal NA). The ten that closed today are DOCK53 TASK-5416134 (9:42:02a PT,
// 6 loads, seal 24800345), DOCK52 TASK-5414481 (9:45:26a PT, 1 load, seal
// 25079925), DOCK51 TASK-5416299 (10:26:16a PT, 2 loads, seal 24800346), DOCK50
// TASK-5415615 (10:30:25a PT, 1 load, seal 1378465), DOCK53 TASK-5415952
// (11:15:04a PT, 4 loads, seal 24800342), DOCK55 TASK-5416941 (11:48:31a PT,
// 4 loads, seal 24800341 - second Arnulfo identity), DOCK56 TASK-5416956
// (12:24:58p PT, 3 loads, seal 24800344), DOCK52 TASK-5416137 (1:39:35p PT,
// 3 loads, seal 24800340), DOCK45 TASK-5416927 (1:47:14p PT, 1 load, seal
// 24800343 - off Bay 4) and DOCK52 TASK-5417412 (2:58:04p PT, 1 load, seal NA).
// He holds ONE open Bay-4 load task at this pull:
// DOCK50 TASK-5417115 (IN_PROGRESS since 3:02:26p PT, 7 loads, 2 LOADED /
// 5 LOADING). DOCK51 TASK-5417125, also his at the prior pull, started at
// 3:13:38p PT under JOSE ROSAS, and DOCK52 TASK-5416137 closed at 1:39:35p PT.
export const assignments: TaskRecord[] = [
  // ----- INBOUND / RECEIVE (3) -----
  {
    taskId: "TASK-5417481",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 45m since 11/10 3:36:33p PT (DANIELA GONZALEZ; ET-1181113, dock check-in 3:36:35p PT, RN-5011485, appointment 11/10 9:00a PT, PO-container FFAU5817716, in-yard 3:35:27p PT, receipt status IN_PROGRESS, receivedStartTime 3:36:33p PT)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK62",
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

  // ----- OUTBOUND / LOAD (2) -----
  {
    taskId: "TASK-5417115",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 1h19m since 11/10 3:02:26p PT (ARNULFO MUNGUIA; ET-1180948, PRE_LOAD, checked in 3:02:33p PT, 7 loads 2 LOADED / 5 LOADING, equipment 53779 - LOAD-5044138 / 50156397 DN-3451144, LOAD-5044230 / 50159723 DN-3450873, LOAD-5044013 / 50153882 DN-3445506, LOAD-5044141 / 50156429 DN-3450948, LOAD-5044142 / 50156434 DN-3450838, LOAD-5044011 / 50153828 DN-3445510, LOAD-5044012 / 50153849 DN-3445507)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5417125",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 1h08m since 11/10 3:13:38p PT (JOSE ROSAS, lastAssignedWhen 3:13:26p PT; ET-1180959, PRE_LOAD, checked in 3:13:44p PT, 5 loads all LOADED, equipment 53142, no seal recorded - LOAD-5044137 / 50156395 DN-3451149, LOAD-5044136 / 50156393 DN-3451216, LOAD-5044135 / 50156391 DN-3451238, LOAD-5044134 / 50156389 DN-3451356, LOAD-5044132 / 50156385 DN-3451362)",
    assignee: "JOSE ROSAS",
    door: "DOCK51",
  },
];
