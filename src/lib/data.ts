/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-10 13:24:00 PT (live WISE / WMS-BAM APIs)
 *   Sources (all read with item-time-zone America/Los_Angeles; WISE returns the
 *   dock/task/receipt/order timestamps as naive facility wall-clock values, so
 *   the strings below are already PT and no UTC->PT shift is applied):
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors, 23/23 rows
 *       returned (fresh dockStatus, spaceStatus, occupiedCustomerIds, entryId,
 *       updatedTime)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide total 16); matched on dockName to
 *       the 23 Bay-4 docks -> 4 at Bay-4 doors (DOCK50 TASK-5417115,
 *       DOCK51 TASK-5417125, DOCK52 TASK-5416137, DOCK56 TASK-5417112)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide total 13), same per-door dockName
 *       match -> 3 at Bay-4 doors (DOCK50 TASK-5090739, DOCK67 TASK-5417173,
 *       DOCK69 TASK-5381972)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To inside the 11/10 PT business day -> totalCount 7
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDatePeriod inside the 11/10 PT business day -> totalCount 36
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA CLOSED/FORCE_CLOSED
 *       load tasks, endTimeFrom 2026-10-31 00:00:00, sorted endTime DESC
 *       -> 113 rows; 49 of them are Arnulfo Munguia (48 under assigneeUserId 89
 *       plus 1 under a second Arnulfo identity, assigneeUserId
 *       1948070158297014318), 45 at Bay-4 doors (Arnulfo Assigned Activity stream)
 *     - /wms-bam/outbound/load-task/search-by-paging - facility-wide (all
 *       customers) CLOSED/FORCE_CLOSED load tasks with endTimeFrom 2026-11-10
 *       00:00:00 -> totalCount 29, of which 7 closed at Bay-4 doors; newest
 *       facility-wide closure is 11/10 12:57:39p PT
 *     - /wms-bam/inbound/receive-task/search-by-paging - CLOSED/FORCE_CLOSED
 *       receive tasks sorted endTime DESC (all customers; facility-wide) -> 25
 *       closures dated 11/10 PT, of which 3 at Bay-4 doors (DOCK65, DOCK67,
 *       DOCK61)
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders at status
 *       PLANNED, no date filter -> totalCount 194 (planned-orders fallback)
 *   NOTE: door state is read from wms-location/search (dockStatus + spaceStatus),
 *   the same two status fields the dashboard already uses.
 *   NOTE: the load/receive task searches were filtered by customerIds only and
 *   matched to Bay-4 doors on the returned dockName field (dockId is also present
 *   but is a numeric location id, not the DOCKnn name).
 *   NOTE: the query shapes used here are byte-identical to the prior refresh,
 *   except that the receipt/order day windows moved from 11/9 to 11/10. This pull
 *   ran at 13:24 PT on Tuesday 11/10, ~21h19m after the 11/9 4:05p PT pull.
 *
 *   CONTEXT - 11/10 PT is a Tuesday and GURUNANDA volume IS scheduled on it, so
 *   both percentages are published as real numbers:
 *   % scheduled inbounds received = 0 / 7 = 0.0% (all 7 scheduled receipts are
 *   still at status IMPORTED with no receivedStartTime; the 11/10 09:00a and
 *   13:00p appointments RN-5011485 and RN-195361 are due but not yet received).
 *   % scheduled outbounds loaded = 1 / 36 = 2.8% (orders at status SHIPPED - the
 *   same definition the prior pulls used; remaining 11/10 statuses: PLANNED 22,
 *   PICKED 9, COMMIT_FAILED 2, IMPORTED 1, COMMIT_BLOCKED 1). Both denominators
 *   were re-validated against neighbouring days at this pull (11/6: 10 receipts
 *   of which 10 carry a receivedStartTime, 44 orders of which 21 are SHIPPED;
 *   11/9: 4 receipts of which 4 are received, 132 orders of which 30 are
 *   SHIPPED), so the low 11/10 ratios reflect the day still being in progress at
 *   13:24 PT, not a broken filter.
 *
 *   Key changes from the prior refresh (11/9 ~4:05p PT -> 11/10 ~1:24p PT):
 *     - DOOR STATUS: DOCK52 and DOCK55 are now RESERVED; DOCK50, DOCK51,
 *       DOCK53, DOCK54, DOCK56, DOCK57, DOCK58, DOCK59, DOCK60, DOCK64, DOCK65,
 *       DOCK67, DOCK68, DOCK69 and DOCK72 read occupied; DOCK61, DOCK62, DOCK63,
 *       DOCK66, DOCK70 and DOCK71 are fully free. Occupied 15/23 (unchanged),
 *       reserved 2 (was 1), available 6 (was 7). Raw dockStatus is OCCUPIED 11,
 *       AVAILABLE 10, RESERVED 2; DOCK53, DOCK55, DOCK57, DOCK58 and DOCK64 are
 *       space-occupied only with dockStatus AVAILABLE, so the dashboard's
 *       Occupied count (15) exceeds the raw dockStatus count (11).
 *     - TASK TURNOVER: heavy overnight. Of the 10 tasks open at the prior pull
 *       only three are still open (DOCK50 TASK-5090739 stale RECEIVE, DOCK52
 *       TASK-5416137 LOAD, DOCK69 TASK-5381972 RECEIVE); the other seven closed.
 *       Seven new Bay-4 tasks appeared: DOCK50 TASK-5417115, DOCK51 TASK-5417125,
 *       DOCK56 TASK-5417112 (all LOAD) and DOCK67 TASK-5417173 (RECEIVE).
 *       Net active count fell from 10 to 7 and the mix moved from 5 LOAD / 5
 *       RECEIVE to 4 LOAD / 3 RECEIVE.
 *     - ANOMALIES RESOLVED: TASK-5414481 (DOCK52) - stale since 11/6 - finally
 *       closed today at 09:45:26a PT, so the anomaly count drops from 2 to 1.
 *       The one remaining anomaly is TASK-5090739 (DOCK50, RECEIVE started
 *       10/21/25) which is still returned by the active-status query although its
 *       endTime is 10/22/25 and its linked receipt RN-5002143 is CLOSED. It is
 *       left flagged, not given an open-ended duration. (Facility-wide, 11
 *       active-status tasks carry an endTime already set; only this one is at a
 *       Bay-4 door.)
 *     - ASSIGNMENTS BY ASSIGNEE: ARNULFO MUNGUIA 3 (DOCK50, DOCK51, DOCK52),
 *       Jorge Antonio Franco 2 (DOCK67, DOCK69), BARTOLO RAMIREZ 1 (DOCK56,
 *       his first Bay-4 task in this stream), daira gonzalez 1 (DOCK50, stale).
 *     - LOAD PROGRESS: DOCK52 TASK-5416137 (ARNULFO) moved from NEW with 3
 *       WINDOW_CHECKIN_DONE loads to IN_PROGRESS with all 3 loads LOADED and
 *       seal 24800340; DOCK50 TASK-5417115 is NEW with 7 loads all
 *       WINDOW_CHECKIN_DONE; DOCK51 TASK-5417125 is NEW with 5 loads all
 *       WINDOW_CHECKIN_DONE; DOCK56 TASK-5417112 is IN_PROGRESS LIVE_LOAD with
 *       its single load LOADING. Statuses are verbatim.
 *     - Task "Guru live out / in assign to Arnulfo" still resolves to ARNULFO
 *       MUNGUIA GURUNANDA Bay 4 work. No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo"; the stream is read as the
 *       assignee's task assignment transactions and none is invented here.
 *       His assigned-activity pull (closed load tasks, endTime from 2026-10-31
 *       00:00:00 PT) grew from 42 to 49 transactions (38 -> 45 at Bay-4 doors),
 *       with 7 closing today (11/10 PT), 6 on 11/9, 0 on 11/8, 0 on 11/7, 8 on
 *       11/6, 4 on 11/5, 11 on 11/4, 6 on 11/3 and 7 on 11/2. The newest is
 *       DOCK56 TASK-5416956 (started 11/10 11:29:02a PT, closed 11/10 12:24:58p
 *       PT, 3 loads all SHIPPED, seal 24800344). He still holds three open Bay-4
 *       load tasks (DOCK50, DOCK51, DOCK52).
 *     - "% scheduled inbounds received" (11/10 PT day): 0 of 7 = 0.0%.
 *     - "% scheduled outbounds loaded" (11/10 PT day): 1 of 36 = 2.8% (SHIPPED).
 *     - Inbound/outbound mix: 3 RECEIVE / 4 LOAD of 7 active Bay-4 tasks.
 *     - Total doors occupied: 15 of 23 (unchanged), plus 2 reserved.
 *     - Planned GURUNANDA orders (fallback): 194 (was 157).
 *     - Door occupancy duration is available only where a task with a startTime
 *       sits on the door and has not already ended: now 2 of 7 tasks, because
 *       most of yesterday's long-running tasks closed overnight. The two open
 *       durations are DOCK52 TASK-5416137 20h43m (from 11/9 4:40:33p PT) and
 *       DOCK56 TASK-5417112 13m (from 11/10 1:10:17p PT). WMS has no
 *       occupancy-start field for task-less doors (17 of 23), for NEW tasks that
 *       never started (3 tasks) or for the one stale task.
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
// NOT re-pulled in the 11/10 1:24p PT refresh (out of scope of the request). The
// array is left empty rather than carrying a stale result; Section 1 renders live
// from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 194 at the 11/10 ~1:24p PT pull (up from 157).
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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/10 ~1:24p PT
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
    duration: "Two open tasks, no clean door-occupancy duration. (1) TASK-5417115 is NEW (created 11/10 12:31:11p PT, ARNULFO MUNGUIA, ET-1180948, PRE_LOAD, 7 loads all WINDOW_CHECKIN_DONE) - no startTime, so no duration basis. (2) TASK-5090739 is STALE: started 10/21/25 1:21:14p PT and still returned as IN_PROGRESS although its endTime is 10/22/25 10:42:01a PT (RN-5002143 is itself CLOSED), so no open-ended duration is derived · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1180948 (row updated 11/10 12:41p PT) · the 1-load task that closed here today, TASK-5415615, ran 11/9 2:49:04p -> 11/10 10:30:25a PT under ARNULFO MUNGUIA (LOAD-5044020 / 50154436 SHIPPED, DN-3445469, seal 1378465)",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5417125"],
    duration: "LOAD NEW, not started (created 11/10 12:38:38p PT, TASK-5417125, ARNULFO MUNGUIA, ET-1180959, PRE_LOAD, 5 loads all WINDOW_CHECKIN_DONE - LOAD-5044137 / 50156395 DN-3451149, LOAD-5044136 / 50156393 DN-3451216, LOAD-5044135 / 50156391 DN-3451238, LOAD-5044134 / 50156389 DN-3451356, LOAD-5044132 / 50156385 DN-3451362) - no startTime, so no duration basis · dock OCCUPIED, space OCCUPIED, entry ET-1180959 (row updated 11/10 12:38p PT) · the 2-load task that closed here today, TASK-5416299, ran 11/9 10:35:47p -> 11/10 10:26:16a PT under ARNULFO MUNGUIA (LOAD-5043980 / 50145608 DN-3445165, LOAD-5043981 / 50145612 DN-3445117, seal 24800346)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Reserved",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5416137"],
    duration: "LOAD 20h43m since 11/9 4:40:33p PT (TASK-5416137, ARNULFO MUNGUIA, ET-1180586, checked in 11/9 4:40:41p PT, seal 24800340, 3 loads all LOADED - LOAD-5044014 / 50153915 DN-3445430, LOAD-5044015 / 50153935 DN-3445277, LOAD-5043977 / 50145602 DN-3445257) · dock RESERVED, space EMPTY, entry ET-1181003 (row updated 11/10 1:11p PT), i.e. the door row now carries a different ticket than the open task's ET-1180586 · the previously STALE load task TASK-5414481 finally closed today at 9:45:26a PT (started 11/6 2:55:07p PT, LOAD-5043964 / 50145575 SHIPPED, DN-3441573, seal 25079925), so the 11/6-11/9 anomaly on this door is resolved",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [], entry ET-1180892 (row updated 11/10 12:27p PT) - the space is still flagged occupied with no task holding it (the same entry ET-1180892 also appears on DOCK55) · two load tasks closed here today, both ARNULFO MUNGUIA: TASK-5416134 (11/9 3:38:07p -> 11/10 9:42:02a PT, 6 loads all SHIPPED, seal 24800345) and TASK-5415952 (11/9 2:02:53p -> 11/10 11:15:04a PT, 4 loads all SHIPPED, seal 24800342) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, entry ET-1180481 (row updated 11/10 2:59a PT) · no Bay-4 load or receive task closed at this door today (11/10 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space OCCUPIED, entry ET-1180892 (row updated 11/10 1:17p PT) · the 4-load LIVE_LOAD task that ran here today, TASK-5416941, closed 11/10 11:48:31a PT after starting 11:04:12a PT and is logged under a second Arnulfo identity (assigneeUserId 1948070158297014318; all 4 loads SHIPPED, seal 24800341) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: "BARTOLO RAMIREZ (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5417112"],
    duration: "LOAD 13m since 11/10 1:10:17p PT (TASK-5417112, BARTOLO RAMIREZ, ET-1180947, LIVE_LOAD, checked in 1:11:36p PT, 1 load LOAD-5041034 / 30237374 // SP BOL LOADING - DN-3388769, DN-3409250) · dock OCCUPIED, space OCCUPIED, entry ET-1180947 (row updated 11/10 1:11p PT) · the 3-load LIVE_LOAD task that closed here today, TASK-5416956, ran 11/10 11:29:02a -> 12:24:58p PT under ARNULFO MUNGUIA (all 3 SHIPPED, seal 24800344)",
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
    duration: "No active task · dock AVAILABLE, space OCCUPIED, entry ET-1180413 (row updated 11/9 3:13p PT) · no Bay-4 load or receive task closed at this door today (11/10 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, entry ET-1180224 (row updated 11/10 2:59a PT) · the NEW receive task that sat here at the prior refresh, TASK-5415038 (DANIELA GONZALEZ, RN-5011335), started 11/9 6:06:58p PT and closed 11/9 6:45:47p PT, i.e. just after the prior pull, so the space is flagged occupied with no task holding it · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1179653 (row updated 11/10 2:59a PT) · no Bay-4 load or receive task closed at this door today (11/10 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1180178 (row updated 11/10 7:20a PT, re-stamped as the door freed up). The receive task that held it, TASK-5414777 (Fatima Ponce, RN-5011407 - the 11/6 10:00a PT appointment PO-container OOCU5406647), closed 11/10 7:13:40a PT after starting 11/6 5:51:46p PT · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1180167 (row updated 11/9 1:53p PT) · no Bay-4 load or receive task closed at this door today (11/10 PT) · no occupancy-start field in WMS",
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
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1179941 (row updated 11/10 7:06a PT) · the receive task that held it, TASK-5413519 (Nanci Viviana Rosas), closed 11/10 11:38:02a PT after starting 11/5 1:07:49p PT · no occupancy-start field in WMS",
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
    assignee: "Jorge Antonio Franco (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5417173"],
    duration: "RECEIVE NEW, not started (created 11/10 1:17:01p PT, TASK-5417173, Jorge Antonio Franco, ET-1181007, receipt RN-195361 / PO FUS11092026UNIS-104, appointment 11/10 1:00p PT, in-yard 1:16:43p PT, receipt status IMPORTED, no receivedStartTime) - no startTime, so no duration basis · dock OCCUPIED, space EMPTY, entry ET-1179952 (row updated 11/10 1:18p PT), i.e. the door row carries a different ticket than the open task's ET-1181007 · the receive task that held the door this morning, TASK-5414174, closed 11/10 9:28:54a PT under Fatima Ponce (it was still the GONZALO RANGEL NEW task at the prior refresh)",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, entry ET-1177841 (row updated 11/10 2:59a PT) · no Bay-4 load or receive task closed at this door today (11/10 PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW, not started (created 9/30 10:46:50a PT, TASK-5381972, Jorge Antonio Franco, ET-1162686, receipt RN-5010583 / PO9139-2, container Jpack09242026, no appointment, in-yard 9/30 10:46:48a PT, receipt status IMPORTED) - no startTime, so no duration basis · dock OCCUPIED, space EMPTY, entry ET-1171953 (row updated 11/10 7:07a PT) - the door flipped from AVAILABLE/EMPTY at the prior refresh to OCCUPIED while the open NEW task still points at its 9/30 ticket",
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
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1176765 (row updated 11/9 4:40p PT, re-stamped as the door freed up) · no Bay-4 load or receive task closed at this door today (11/10 PT) · no occupancy-start field in WMS",
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

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 15
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 2
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 6
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 1
const available = doors.filter((d) => d.status === "Available").length; // 6

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors Occupied",
    value: `15/23`,
    numerator: 15,
    denominator: TOTAL_DOORS,
    percentage: Math.round((15 / TOTAL_DOORS) * 100),
  },
  {
    label: "Doors w/ Active Tasks",
    value: `6`,
    numerator: 6,
    denominator: TOTAL_DOORS,
    percentage: Math.round((6 / TOTAL_DOORS) * 100),
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
// DOCK52, DOCK55.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, Nov 10 2026 ~1:24p PT).
// 7 active-status tasks at Bay 4 doors: 4 LOAD + 3 RECEIVE.
// ARNULFO MUNGUIA: 3 LOAD (DOCK50 TASK-5417115 NEW, DOCK51 TASK-5417125 NEW,
//   DOCK52 TASK-5416137 IN_PROGRESS)
// Jorge Antonio Franco: 2 RECEIVE (DOCK67 TASK-5417173 NEW,
//   DOCK69 TASK-5381972 NEW)
// BARTOLO RAMIREZ: 1 LOAD (DOCK56 TASK-5417112, IN_PROGRESS)
// daira gonzalez: 1 RECEIVE (DOCK50 TASK-5090739, IN_PROGRESS, stale)
// All assigned names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 3 },
  { name: "Jorge Antonio Franco", taskCount: 2 },
  { name: "BARTOLO RAMIREZ", taskCount: 1 },
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

// Mix: 3 RECEIVE + 4 LOAD = 7 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 3, total: 7 },
  { label: "Outbound (LOAD)", count: 4, total: 7 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 7 },
  { label: "Inbound", count: 3, total: 7 },
];

// --- Schedule Data (2026-11-10, Tuesday) ---
// GURUNANDA volume IS scheduled on 11/10 PT, so both percentages are real values
// this pull.
//   % scheduled inbounds received TODAY: 7 GURUNANDA receipts carry an
//   appointmentTime inside the 11/10 PT business day (query window
//   appointmentTimeFrom "2026-11-10 00:00:00" -> appointmentTimeTo
//   "2026-11-10 23:59:59", totalCount 7), of which 0 carry a receivedStartTime
//   = 0 / 7 = 0.0%. All 7 are still at status IMPORTED: RN-195436, RN-195438,
//   RN-195440 and RN-195435 (appointments 12:00a PT), RN-5011485 (9:00a PT),
//   RN-195361 (1:00p PT) and RN-5011505 (6:00p PT). The two whose appointment has
//   already passed (RN-5011485, RN-195361) are simply not yet started.
//   % scheduled outbounds loaded TODAY: 36 GURUNANDA orders carry a scheduleDate
//   inside the 11/10 PT day (scheduleDatePeriod ["2026-11-10 00:00:00",
//   "2026-11-10 23:59:59"], totalCount 36), of which 1 is at status SHIPPED
//   = 1 / 36 = 2.8%. Remaining 11/10 order statuses: PLANNED 22, PICKED 9,
//   COMMIT_FAILED 2, IMPORTED 1, COMMIT_BLOCKED 1.
//   CONTEXT ONLY (not substituted into today's metrics): these two ratios were
//   re-read live at this refresh as a query sanity check - 11/9 now reads 4
//   receipts of which 4 carry a receivedStartTime (100.0%) and 132 orders of
//   which 30 are SHIPPED (22.7%); 11/6 reads 10 receipts of which 10 are
//   received (100.0%) and 44 orders of which 21 are SHIPPED (47.7%). The low
//   11/10 figures reflect a day still in progress at 1:24p PT, not a broken
//   filter.
export const scheduleAvailable = true;              // GURUNANDA receipts scheduled on 11/10
export const outboundScheduleAvailable = true;      // GURUNANDA orders scheduled on 11/10
export const scheduledInboundOrders = 7;            // receipts with appointmentTime in the 11/10 PT day
export const scheduledOutboundOrders = 36;          // orders with scheduleDate in the 11/10 PT day
export const scheduledInboundReceived = 0;          // receipts with receivedStartTime in that set
export const scheduledOutboundLoaded = 1;           // orders at status SHIPPED in that set
export const pctScheduledInboundReceived = 0.0;     // 0 of 7
export const pctScheduledOutboundLoaded = 2.8;      // 1 of 36 (2.78%)
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
// column). 17 of 23 doors carry no active task at this pull, 3 of the 7 tasks are
// NEW/not started and 1 is stale (DOCK50 TASK-5090739), so a duration exists for
// 2 tasks on 2 doors (DOCK52 20h43m from 11/9 4:40:33p PT and DOCK56 13m from
// 11/10 1:10:17p PT - both measured to 11/10 13:24 PT).
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Nov 10 2026 ~1:24p PT)
// 7 tasks total: 4 LOAD + 3 RECEIVE. All GURUNANDA, LLC.
// One is a data anomaly (TASK-5090739 on DOCK50, stale since 10/21/25).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA has 49 CLOSED GURUNANDA load transactions with endTime
// inside the 2026-10-31 00:00:00 - 2026-11-10 13:24 PT window (48 under
// assigneeUserId 89 plus 1 under a second Arnulfo identity, assigneeUserId
// 1948070158297014318; 45 of them at Bay-4 doors, spread over DOCK51 8,
// DOCK53 7, DOCK54 7, DOCK52 6, DOCK55 6, DOCK50 4, DOCK56 3, DOCK60 2,
// DOCK57 1, DOCK59 1; the other 4 are on DOCK5 2 and DOCK7 2);
// 7 of the transactions closed today (11/10 PT), 6 closed on 11/9 PT, 0 on
// 11/8 PT, 0 on 11/7 PT, 8 on 11/6 PT, 4 on 11/5 PT, 11 on 11/4 PT, 6 on 11/3 PT
// and 7 on 11/2 PT.
// The newest is DOCK56 TASK-5416956
// (started 11/10 11:29:02a PT, closed 11/10 12:24:58p PT; 3 loads all SHIPPED;
// seal 24800344; LIVE_LOAD). The seven that closed today are DOCK53
// TASK-5416134 (9:42:02a PT, 6 loads, seal 24800345), DOCK52 TASK-5414481
// (9:45:26a PT, 1 load, seal 25079925 - the task that had been stale since 11/6),
// DOCK51 TASK-5416299 (10:26:16a PT, 2 loads, seal 24800346), DOCK50 TASK-5415615
// (10:30:25a PT, 1 load, seal 1378465), DOCK53 TASK-5415952 (11:15:04a PT, 4 loads,
// seal 24800342), DOCK55 TASK-5416941 (11:48:31a PT, 4 loads, seal 24800341) and
// DOCK56 TASK-5416956 (12:24:58p PT, 3 loads, seal 24800344).
// He ALSO holds three open Bay-4 load tasks at this pull, all three his:
// DOCK50 TASK-5417115 (NEW, 7 loads WINDOW_CHECKIN_DONE), DOCK51 TASK-5417125
// (NEW, 5 loads WINDOW_CHECKIN_DONE) and DOCK52 TASK-5416137 (IN_PROGRESS,
// 3 loads LOADED, seal 24800340).
export const assignments: TaskRecord[] = [
  // ----- INBOUND / RECEIVE (3) -----
  {
    taskId: "TASK-5417173",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/10 1:17:01p PT (Jorge Antonio Franco; ET-1181007, RN-195361, PO FUS11092026UNIS-104, appointment 11/10 1:00p PT, in-yard 1:16:43p PT, receipt status IMPORTED, no receivedStartTime) - task has no startTime",
    assignee: "Jorge Antonio Franco",
    door: "DOCK67",
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

  // ----- OUTBOUND / LOAD (4) -----
  {
    taskId: "TASK-5417115",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/10 12:31:11p PT (ARNULFO MUNGUIA; ET-1180948, PRE_LOAD, 7 loads all WINDOW_CHECKIN_DONE - LOAD-5044013 / 50153882 DN-3445506, LOAD-5044138 / 50156397 DN-3451144, LOAD-5044141 / 50156429 DN-3450948, LOAD-5044230 / 50159723 DN-3450873, LOAD-5044142 / 50156434 DN-3450838, LOAD-5044011 / 50153828 DN-3445510, LOAD-5044012 / 50153849 DN-3445507) - task has no startTime",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5417125",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/10 12:38:38p PT (ARNULFO MUNGUIA; ET-1180959, PRE_LOAD, 5 loads all WINDOW_CHECKIN_DONE - LOAD-5044137 / 50156395 DN-3451149, LOAD-5044136 / 50156393 DN-3451216, LOAD-5044135 / 50156391 DN-3451238, LOAD-5044134 / 50156389 DN-3451356, LOAD-5044132 / 50156385 DN-3451362) - task has no startTime",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5416137",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 20h43m since 11/9 4:40:33p PT (ARNULFO MUNGUIA; ET-1180586, checked in 11/9 4:40:41p PT, seal 24800340, 3 loads all LOADED - LOAD-5044014 / 50153915 DN-3445430, LOAD-5044015 / 50153935 DN-3445277, LOAD-5043977 / 50145602 DN-3445257)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5417112",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 13m since 11/10 1:10:17p PT (BARTOLO RAMIREZ; ET-1180947, LIVE_LOAD, checked in 1:11:36p PT, 1 load LOAD-5041034 / 30237374 // SP BOL LOADING - 2 DNs DN-3388769, DN-3409250)",
    assignee: "BARTOLO RAMIREZ",
    door: "DOCK56",
  },
];
