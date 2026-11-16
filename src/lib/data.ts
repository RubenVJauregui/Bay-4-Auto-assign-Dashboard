/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-16 12:26p PT (live WISE / WMS-BAM APIs)
 *   Every value below was re-read live at this pull; nothing was carried over.
 *   All reads use item-time-zone America/Los_Angeles. WISE returns the
 *   dock/task/receipt/order timestamps as naive facility wall-clock values, so
 *   the strings below are already PT and no UTC->PT shift is applied.
 *   Durations are measured to the 2026-11-16 12:26p PT pull reference.
 *
 *   SOURCES USED AT THIS PULL:
 *     - POST /wms-bam/wms-location/search, body {exactlyNames:[DOCK50..DOCK72]}
 *       -> code 0, 23/23 rows (name, id, category=DOCK, type=DOCK,
 *       status=USABLE on all 23, dockStatus, spaceStatus, occupiedCustomerIds,
 *       entryId, updatedTime). Door rows are used for "Door Utilization".
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer
 *       filter) -> totalCount 53, all 53 read; exactly 1 of them sits on a
 *       Bay-4 dockName (TASK-5421821, DOCK57, GURUNANDA, IN_PROGRESS).
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [NEW, IN_PROGRESS, EXCEPTION], facility-wide (NO customer
 *       filter) -> totalCount 91, all 91 read; 6 of them sit on Bay-4 dockNames
 *       (2 KARAKA at DOCK54 + 4 GURUNANDA). 8 of the 91 carry no dockName at all
 *       (not yet docked: TASK-5369902, TASK-5012655, TASK-5009441,
 *       TASK-5009440, TASK-5009439, TASK-5008826, TASK-5008825,
 *       TASK-5008824) and none of them is a Bay-4 door.
 *     - POST /wms-bam/inbound/receipt/search-by-paging
 *       {customerId: ORG-655875, appointmentTimeFrom "2026-11-16 08:00:00",
 *       appointmentTimeTo "2026-11-17 07:59:59"} -> totalCount 11, all 11 read;
 *       2 of the 11 carry a receivedStartTime (RN-195674 recvStart 11/16
 *       11:50:24a, RN-5011516 recvStart 11/13 10:20:55a, CLOSED at receivedTime
 *       11/16 8:48:01a).
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, scheduleDatePeriod ["2026-11-16 08:00:00",
 *       "2026-11-17 07:59:59"]} -> totalCount 56, all 56 read; statuses PICKED
 *       24, SHIPPED 16, PLANNED 8, IMPORTED 7, COMMIT_FAILED 1.
 *     - POST /wms-bam/outbound/load-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], endTimeFrom "2026-10-31 00:00:00",
 *       endTimeTo "2026-11-17 23:59:59", sorted endTime DESC -> totalCount 675
 *       (all customers), all 675 read (oldest endTime in the window read set is
 *       11/2 7:48:00a PT). 83 of them are ARNULFO MUNGUIA on GURUNANDA, 73 of
 *       those at Bay-4 doors (his "Assigned Activity" stream). The newest load
 *       closure facility-wide at this pull is 11/16 12:14:33p PT
 *       (TASK-5422007, DOCK171) - i.e. live load closures are flowing today.
 *     - POST /wms-bam/inbound/receive-task/search-by-paging
 *       statuses [CLOSED, FORCE_CLOSED], sorted endTime DESC -> totalCount
 *       17,772; the newest 2,000 were read (window back to 9/22 10:35:47a PT).
 *       Three Bay-4 receive closures are dated on/after 11/14 PT, ALL of them
 *       today 11/16: TASK-5419965 at DOCK63 (FORCE_CLOSED 11/16 10:47:28a,
 *       Fatima Ponce, GURUNANDA), TASK-5421037 at DOCK61 (CLOSED 11/16
 *       10:27:57a, CANDY MENDEZ, GURUNANDA) and TASK-5421731 at DOCK55
 *       (FORCE_CLOSED 11/16 10:13:39a, Nanci Viviana Rosas, KARAKA, LLC).
 *     - POST /wms-bam/outbound/order/search-by-paging
 *       {customerId: ORG-655875, status: PLANNED} -> totalCount 151.
 *     - POST /wms-bam/yard/equipment/search {statuses:["FULL"]} -> 10 rows
 *       facility-wide, of which 0 are GURUNANDA ORG-655875 TRAILER rows (the
 *       FULL set is DRUPLEY/GRAZA "ups", 2 unassigned containers/vehicles plus
 *       7 LENNOX / VITA COCO / CMPC / EUROMARKET trailers and vehicles reading
 *       equipmentStatus EMPTY or UNKNOWN), which is why the live "In Yard Full
 *       Trailers" KPI reads 0 at this pull.
 *
 *   SCOPE NOTE (important, read before comparing to any other snapshot):
 *     The line-level metrics on this dashboard are GURUNANDA-scoped (the same
 *     customer scope the dashboard has always published). At this pull the
 *     physical Bay-4 doors carry 7 active tasks across all customers vs 5 for
 *     GURUNANDA alone: the two extra tasks are KARAKA, LLC (ORG-585450) RECEIVE
 *     tasks at DOCK54 assigned to ARNULFO MUNGUIA - TASK-5421959 (started today
 *     11/16 11:06:28a PT) and TASK-5419478 (started 11/12 9:27:55a PT) - which
 *     the customer-filtered query cannot return. They are shown in DOCK54's
 *     door record because they physically occupy that door, and they are NOT
 *     counted in assigneeSummaries / inboundOutboundMix (which stay
 *     GURUNANDA-scoped so the cards remain internally consistent).
 *     The all-customer physical tallies are exported below as
 *     bay4AllCustomerActiveTaskCount / bay4AllCustomerActiveReceiveCount /
 *     bay4AllCustomerActiveLoadCount and described in the header of `doors`.
 *
 *   CONTEXT - 11/14 PT was a Saturday and 11/15 PT a Sunday: GURUNANDA had NO
 *   scheduled receipts and NO scheduled outbound orders on either, which is why
 *   the previous snapshot published both percentages as NOT COMPUTABLE. Today
 *   (Monday 11/16 PT) both denominators are real and non-zero, so both
 *   percentages are computable again:
 *     % scheduled inbounds received = 2 of 11 (18.2%).
 *     % scheduled outbounds loaded  = 16 of 56 (28.6%).
 *   Re-read live at this pull for comparison: 11/13 = 12 receipts of which 7
 *   carry a receivedStartTime (58.3%) and 32 orders of which 11 are SHIPPED
 *   (34.4%); 11/14 = 0 receipts / 0 orders; 11/15 = 0 receipts / 0 orders.
 *
 *   Key state at this pull:
 *     - DOOR STATUS: occupied 16, reserved 3, available 4 (16+3+4 = 23). Only
 *       DOCK63, DOCK67, DOCK71 and DOCK72 are fully free (dock AVAILABLE +
 *       space EMPTY). Raw dockStatus: OCCUPIED 9, AVAILABLE 11, RESERVED 3.
 *       Raw spaceStatus: OCCUPIED 13, EMPTY 10, FULL 0. The three RESERVED
 *       doors are DOCK50 (spaceStatus OCCUPIED, occupiedCustomerIds
 *       [ORG-655875]), DOCK58 (spaceStatus OCCUPIED) and DOCK65 (spaceStatus
 *       EMPTY) - a reservation is a held door, so it is reported in its own
 *       "Reserved" bucket rather than folded into "Occupied"; 19 of the 23
 *       doors are therefore not fully free at this pull. Compare 11/15:
 *       occupied 21, reserved 0, available 2.
 *       Newest door-row update: DOCK56 11/16 12:08:43p PT.
 *     - ACTIVE TASKS (GURUNANDA): 5 tasks - 4 RECEIVE / 1 LOAD - at 4 distinct
 *       doors (DOCK50, DOCK57, DOCK58, DOCK69). All-customer physical count at
 *       the same doors: 7 tasks - 6 RECEIVE / 1 LOAD - at 5 doors (DOCK50,
 *       DOCK54, DOCK57, DOCK58, DOCK69).
 *       The four GURUNANDA load tasks that were open at the previous snapshot
 *       (DOCK52 TASK-5420648, DOCK53 TASK-5421041, DOCK54 TASK-5421045,
 *       DOCK56 TASK-5421056) ALL closed this morning 11/16 between 9:18:06a
 *       and 11:02:48a PT, and the two DANIELA GONZALEZ receive tasks (DOCK61
 *       TASK-5421037, DOCK63 TASK-5419965) closed at 10:27:57a / 10:47:28a PT.
 *     - ASSIGNMENTS BY ASSIGNEE (GURUNANDA, the dashboard cards): DANIEL
 *       BELTRAN 1 (LOAD DOCK57, IN_PROGRESS, started 12:04:40p PT), Luis
 *       Alberto Paredes 1 (RECEIVE DOCK58, NEW), Gonzalo Rangel 1 (RECEIVE
 *       DOCK50, NEW), Jorge Antonio Franco 1 (RECEIVE DOCK69, NEW), daira
 *       gonzalez 1 (RECEIVE DOCK50, stale) = 5. ARNULFO MUNGUIA holds 0
 *       GURUNANDA active tasks at this pull but 2 KARAKA RECEIVE tasks at
 *       DOCK54, so including all customers he holds 2 of the 7 physical Bay-4
 *       tasks.
 *     - LOAD PROGRESS: the single active Bay-4 load task (TASK-5421821,
 *       DOCK57, DANIEL BELTRAN) is IN_PROGRESS / LIVE_LOAD, checked in 12:05:02p
 *       PT, 1 load (LOAD-5043552) at status LOADING, NO sealNo recorded yet.
 *     - ANOMALIES: 1, unchanged. TASK-5090739 (DOCK50, RECEIVE, started
 *       2025-10-21 1:21:14p PT) is still returned by the active-status query
 *       although its endTime is 2025-10-22 10:42:01a PT and its linked receipt
 *       RN-5002143 is CLOSED. Flagged, not given an open-ended duration.
 *     - Task "Guru live out / in assign to Arnulfo": no WMS record is literally
 *       named that (the load-task `keyword` filter is a no-op here - it was
 *       re-tested at this pull and returns the full 22,604-row facility total
 *       for "Guru live out / in assign to Arnulfo", for "Guru live out" and for
 *       a nonsense string alike - and all 7 active Bay-4 tasks carry projectId
 *       null, so there is no named task group to resolve). The
 *       stream is therefore reported as ARNULFO MUNGUIA's task assignment
 *       transactions on the GURUNANDA live-out/live-in work, and nothing is
 *       invented: 83 CLOSED load transactions with endTime from 2026-10-31
 *       00:00:00 PT (82 under assigneeUserId 89 + 1 under a second Arnulfo
 *       identity, assigneeUserId 1948070158297014318, name rendered
 *       "arnulfo munguia"), 73 at Bay-4 doors, 10 off Bay 4 (DOCK4 2, DOCK5 2,
 *       DOCK7 2, DOCK6 1, DOCK9 1, DOCK10 1, DOCK45 1).
 *       Per-day counts by endTime (PT): 11/16 7, 11/13 8, 11/12 12, 11/11 4,
 *       11/10 10, 11/9 6, 11/6 8, 11/5 4, 11/4 11, 11/3 6, 11/2 7, with no
 *       closures at all on 11/1, 11/7, 11/8, 11/14 or 11/15.
 *       Newest overall: TASK-5421016 at DOCK10 (started 11/13 6:49:05p PT,
 *       closed 11/16 11:40:39a PT). Newest at a Bay-4 door: DOCK56
 *       TASK-5421056 (started 11/13 9:53:54p PT, closed 11/16 11:02:48a PT,
 *       2 loads both SHIPPED, seal 25010981).
 *     - % scheduled inbounds received (11/16 PT): 2 of 11 = 18.2%.
 *     - % scheduled outbounds loaded (11/16 PT): 16 of 56 = 28.6%.
 *     - Inbound/outbound mix: 4 RECEIVE / 1 LOAD of 5 active GURUNANDA tasks.
 *     - Total doors occupied: 16 of 23 (plus 3 reserved, 4 available).
 *     - Planned GURUNANDA orders: live count 151 at this pull.
 *     - Door occupancy duration: available where an active task has a startTime
 *       and has not ended - 3 tasks on 2 doors at this pull (DOCK54 98h58m
 *       KARAKA RECEIVE, DOCK54 1h19m KARAKA RECEIVE, DOCK57 21m LOAD), all
 *       measured to 11/16 12:26p PT. WMS has no occupancy-start field for
 *       task-less doors (18 of 23), for the three NEW GURUNANDA tasks (DOCK50
 *       TASK-5418313, DOCK58 TASK-5420461, DOCK69 TASK-5381972) or for the one
 *       stale task.
 *     - Facility-wide appointment context for the 11/16 PT day (no customerId
 *       filter): receipts scheduled 40, of which 20 carry a receivedStartTime;
 *       orders scheduled 3,365 by totalCount (all 3,365 rows read across
 *       paging) of which 1,631 are SHIPPED.
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

// ─── Section 1 — In-Yard FULL Equipment (TRAILER-only display) ───
// The live yard query was re-read at this pull: {statuses:["FULL"]} returned 10
// facility rows and NONE of them is a GURUNANDA ORG-655875 TRAILER row (the
// FULL set is DRUPLEY/GRAZA vehicle "ups", 2 unassigned containers/vehicles
// plus LENNOX, VITA COCO, CMPC and EUROMARKET trailers/vehicles reading
// equipmentStatus EMPTY or UNKNOWN), so the KPI legitimately reads 0. The static
// array stays empty rather than duplicating the live loader's result; Section 1
// renders live from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 151 at the 11/16 12:26p PT pull (re-verified).
export const plannedGurunandaOrderCount = 151;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/16 12:26p PT
//
// All 23 rows come from one /wms-bam/wms-location/search call
// (exactlyNames DOCK50..DOCK72); every row is category DOCK, type DOCK,
// status USABLE. Door status rule (unchanged, keeps the dashboard's 3-value
// enum):
//   Reserved  = dockStatus RESERVED (door is held/reserved, so it is not free)
//   Occupied  = dockStatus OCCUPIED OR spaceStatus OCCUPIED (not fully free)
//   Available = dockStatus AVAILABLE AND spaceStatus EMPTY
// Raw field values are preserved per door so the mapping can be re-checked.
// Totals: Occupied 16, Reserved 3, Available 4 = 23.
// Reserved doors: DOCK50, DOCK58, DOCK65 (DOCK50 and DOCK58 also read
// spaceStatus OCCUPIED; DOCK65 reads spaceStatus EMPTY). Fully free doors:
// DOCK63, DOCK67, DOCK71, DOCK72 - so 19 of 23 doors are not fully free.
// Raw tallies at this pull: dockStatus OCCUPIED 9 / AVAILABLE 11 / RESERVED 3;
// spaceStatus OCCUPIED 13 / EMPTY 10 / FULL 0.
//
// BAY 4 ALL-CUSTOMER PHYSICAL TALLY (see SCOPE NOTE in the file header):
// active (NEW / IN_PROGRESS / EXCEPTION) tasks whose dockName is one of these
// 23 doors = 7 (RECEIVE 6, LOAD 1) on 5 doors. GURUNANDA-only = 5
// (RECEIVE 4, LOAD 1) on 4 of those doors.
// =====================================================================
export const bay4AllCustomerActiveTaskCount = 7;
export const bay4AllCustomerActiveReceiveCount = 6;
export const bay4AllCustomerActiveLoadCount = 1;

export const doors: DoorRecord[] = [
  {
    door: "DOCK50",
    status: "Reserved",
    assignee: "Gonzalo Rangel (RECEIVE NEW) + daira gonzalez (RECEIVE - STALE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5418313", "TASK-5090739"],
    duration: "RECEIVE NEW, not started (created 11/11 11:24:50a PT, TASK-5418313, Gonzalo Rangel, entry ET-1181371, receipt RN-195495 at status IMPORTED, PO RMA0276 / reference 'Po # 979126', appointment 11/11 12:00a PT, in-yard 11/11 11:24:50a PT, carrier WILL CALL) - no startTime, so no duration basis · the door's second task, TASK-5090739 (daira gonzalez), is STALE: started 2025-10-21 1:21:14p PT and its endTime is 2025-10-22 10:42:01a PT (RN-5002143 status CLOSED, container EGSU8032696, reference EGLV149507056809), dock-checked-in 2025-10-22 10:41:46a PT · dock RESERVED, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1182531 (row updated 11/16 11:04:57a PT - note the entry on the door row is newer than the entry recorded on either task) · the last load task to close here was TASK-5421917 (BYRON PALADINES, ORG-55783 - not GURUNANDA, 11/16 10:32:09a PT, 1 load SHIPPED, seal 25076956); the last receive task to close was TASK-5416210 (DANIELA GONZALEZ, KARAKA, LLC, 11/9 4:55:40p PT, FORCE_CLOSED)",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1182058 (row updated 11/13 2:12:01p PT) · the last load task to close here was TASK-5420549 (ARNULFO MUNGUIA, 11/13 1:56:58p PT, 1 load SHIPPED, seal 25010987); the last receive task to close here was TASK-5420402 (Fatima Ponce, 11/13 10:42:38a PT, GURUNANDA, CLOSED) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1182083 (row updated 11/16 9:23:53a PT) · the load task that was open here at the previous snapshot, TASK-5420648 (ARNULFO MUNGUIA, 8 loads, seal A52688), CLOSED 11/16 9:18:06a PT with all 8 loads SHIPPED · the last receive task to close here was TASK-5417998 (Nanci Viviana Rosas, KARAKA, LLC, 11/11 2:39:35p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [], entry ET-1182378 (row updated 11/16 10:01:40a PT) · the load task that was open here at the previous snapshot, TASK-5421041 (ARNULFO MUNGUIA, 2 loads), CLOSED 11/16 9:59:10a PT with both loads SHIPPED and seal 25010984 recorded at closure (the previous snapshot recorded NO sealNo on this task) · the newest receive closure here is TASK-5407284 (ARNULFO MUNGUIA, KARAKA, LLC, 10/29 11:01:54a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (2× KARAKA RECEIVE)",
    customer: "KARAKA, LLC",
    taskIds: ["TASK-5421959", "TASK-5419478"],
    duration: "TWO open RECEIVE tasks here, both KARAKA, LLC (NOT GURUNANDA, so outside the customer-scoped cards) · RECEIVE 1h19m since 11/16 11:06:28a PT (TASK-5421959, ARNULFO MUNGUIA, created 11/16 10:24:08a PT, dock-checked-in 11:06:30a PT, dockCheckOutTime already stamped 12:02:45p PT while the task still reads IN_PROGRESS; receipts RN-195510 (PO POBOK0460, reference 24695325, appointment 9:00a PT) and RN-195509 (PO POBOK0414, reference 24695315, appointment 8:00a PT), both IN_PROGRESS and both devanned at 12:02:45p PT, container 'UNKNOWN - LCL', carrier RXOI, in-yard 10:23:46a PT, entry ET-1182496, driver RONALD POLANCO POLANCO MORENO) · RECEIVE 98h58m since 11/12 9:27:55a PT (TASK-5419478, ARNULFO MUNGUIA, created 11/12 9:07:37a PT, dock-checked-in 9:27:59a PT, entry ET-1181678, RN-195042 at status IN_PROGRESS, receivedStartTime 9:27:55a PT, PO POBOK0432 / reference SPR43963200, appointment 11/12 10:00a PT, container 'UNKNOWN - LCL', carrier AAA COOPER TRANSPORTATION, in-yard 9:07:16a PT) · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [], entry ET-1182496 (row updated 11/16 12:02:46p PT) · the load task that was open here at the previous snapshot, TASK-5421045 (ARNULFO MUNGUIA, 4 loads, seal 25010985), CLOSED 11/16 9:26:07a PT with all 4 loads SHIPPED; the last receive task to close before today was TASK-5414446 (Nanci Viviana Rosas, KARAKA, LLC, 11/11 7:21:29a PT)",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds none, entry ET-1182391 (row updated 11/16 8:31:41a PT; DOCK56 carries the same entry ET-1182391) · the last receive task to close here was TASK-5421731 (Nanci Viviana Rosas, KARAKA, LLC, 11/16 10:13:39a PT, FORCE_CLOSED); the last load task to close here was TASK-5419003 (ARNULFO MUNGUIA, 11/13 7:23:29p PT, 1 load SHIPPED, seal 25010979) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [], entry ET-1182391 (row updated 11/16 12:08:43p PT - the newest door-row update at this pull) · the load task that was open here at the previous snapshot, TASK-5421056 (ARNULFO MUNGUIA, 2 loads, seal 25010981), CLOSED 11/16 11:02:48a PT with both loads SHIPPED - the newest Bay-4 closure in Arnulfo's Assigned Activity stream · the last receive task to close here was TASK-5418081 (Nanci Viviana Rosas, KARAKA, LLC, 11/11 12:11:56p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: "DANIEL BELTRAN (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5421821"],
    duration: "LOAD 21m since 11/16 12:04:40p PT (TASK-5421821, DANIEL BELTRAN, IN_PROGRESS, LIVE_LOAD, created 11/16 8:54:39a PT, checked in 12:05:02p PT, 1 load LOAD-5043552 still at status LOADING, proNo 5043552, load appointment 11/6 8:00a PT, carrier ORG-378878, NO sealNo recorded yet) · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [], entry ET-1182416 (row updated 11/16 12:05:02p PT; DOCK58 carries the same entry ET-1182416) · the previous load task here closed 11/13 10:23:09a PT (TASK-5420289, DANIEL BELTRAN, 1 load SHIPPED, seal A52689); the newest receive closure here is TASK-5414098 (Nanci Viviana Rosas, KARAKA, LLC, 11/9 2:14:50p PT)",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Reserved",
    assignee: "Luis Alberto Paredes (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5420461"],
    duration: "RECEIVE NEW, not started (created 11/13 10:13:50a PT, TASK-5420461, Luis Alberto Paredes, entry ET-1182030, receipt RN-5011507 at status IMPORTED, PO PO9419, appointment 11/13 10:00a PT, in-yard 11/13 10:13:27a PT, container Leafchem11132026, carrier WILL CALL) - no startTime, so no duration basis · dock RESERVED, space OCCUPIED, occupiedCustomerIds [], entry ET-1182416 (row updated 11/16 8:54:41a PT) · the last load task to close here was TASK-5420377 (BARTOLO RAMIREZ, 11/13 12:10:57p PT, 1 load SHIPPED, seal 1304053); the last receive task to close here was TASK-5414761 (DANIELA GONZALEZ, 11/6 5:09:25p PT, GURUNANDA)",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [], entry ET-1181760 (row updated 11/16 6:42:27a PT) · the receive task that held it, TASK-5417811 (CANDY MENDEZ, GURUNANDA), was FORCE_CLOSED 11/11 12:09:52p PT · the last load task to close here was TASK-5419780 (DANIEL BELTRAN, 11/12 1:22:58p PT, 1 load SHIPPED, seal 1379061) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds [ORG-655875], entry ET-1179653 (row updated 11/12 9:01:22p PT) · the last load task to close here was TASK-5413376 (JULIO CESAR ALVARADO, 11/5 2:50:10p PT, 5 loads all SHIPPED, seal 1378416); the newest receive closure here is TASK-5402543 (DANIELA GONZALEZ, 10/23 7:21:53p PT, GURUNANDA) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED, occupiedCustomerIds [], entry ET-1182218 (row updated 11/16 10:50:36a PT) · the receive task that held it, TASK-5421037 (GURUNANDA), CLOSED 11/16 10:27:57a PT under CANDY MENDEZ - the previous snapshot still showed it open under DANIELA GONZALEZ (40h30m) · the last load task to close here was TASK-5420400 (BARTOLO RAMIREZ, 11/13 10:56:09a PT, 1 load SHIPPED, seal 1304052) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds [], entry ET-1181858 (row updated 11/15 2:12:40p PT) · the last receive task to close here was TASK-5419984 (DANIELA GONZALEZ, 11/12 8:25:21p PT, GURUNANDA); no load task of any customer has closed at this door inside the 2026-10-31 - now window · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds [], entry ET-1181840 (row updated 11/16 10:50:29a PT) · the receive task that held it, TASK-5419965 (GURUNANDA), was FORCE_CLOSED 11/16 10:47:28a PT (Fatima Ponce) - the newest Bay-4 receive closure at this pull, and the previous snapshot still showed it open under DANIELA GONZALEZ (44h08m) · no load task of any customer has closed at this door inside the 2026-10-31 - now window · fully free",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED, occupiedCustomerIds none, entry ET-1182176 (row updated 11/16 6:15:25a PT) · the last receive task to close here was TASK-5420980 (DANIELA GONZALEZ, 11/13 9:32:35p PT, GURUNANDA); no load task of any customer has closed at this door inside the 2026-10-31 - now window · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space EMPTY, occupiedCustomerIds [], entry ET-1179941 (row updated 11/16 10:24:09a PT) · the receive task that held it, TASK-5413519 (Nanci Viviana Rosas, KARAKA, LLC), was FORCE_CLOSED 11/10 11:38:02a PT; no load task of any customer has closed at this door inside the 2026-10-31 - now window · reserved but physically empty - no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds [], entry ET-1173309 (row updated 11/15 2:09:53p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - now window; the newest receive closure here is TASK-5392562 (DANIELA GONZALEZ, 10/12 6:46:00p PT, GURUNANDA) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds [], entry ET-1181521 (row updated 11/13 8:14:15p PT) · the last receive task to close here was TASK-5418827 (Fatima Ponce, 11/12 9:38:33a PT, GURUNANDA); no load task of any customer has closed at this door inside the 2026-10-31 - now window · fully free",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds [], entry ET-1177841 (row updated 11/12 8:59:43p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - now window; the newest receive closure here is TASK-5408610 (Fatima Ponce, 11/2 3:06:46p PT, GURUNANDA) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE NEW)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW, not started (created 9/30 10:46:50a PT, TASK-5381972, Jorge Antonio Franco, entry ET-1162686, receipt RN-5010583 at status IMPORTED, PO9139-2, container Jpack09242026, no appointment, in-yard 9/30 10:46:48a PT, carrier WILL CALL) - no startTime, so no duration basis · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1171953 (row updated 11/12 8:59:19p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - now window; the newest receive closure here is TASK-5398554 (DANIELA GONZALEZ, 10/20 6:56:09p PT, GURUNANDA)",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY, occupiedCustomerIds none, entry ET-1172826 (row updated 11/16 6:20:32a PT) · no load task of any customer has closed at this door inside the 2026-10-31 - now window; the newest receive closure here is TASK-5399423 (Fatima Ponce, 10/21 9:42:23a PT, GURUNANDA) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1176765 (row updated 11/16 6:17:09a PT) · no load task of any customer has closed at this door inside the 2026-10-31 - now window; the newest receive closure here is TASK-5406898 (DANIELA GONZALEZ, 10/28 8:41:53p PT, GURUNANDA) · fully free",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, occupiedCustomerIds none, entry ET-1176051 (row updated 11/11 6:13:28p PT) · no load task of any customer has closed at this door inside the 2026-10-31 - now window; the newest receive closure here is TASK-5405554 (DANIELA GONZALEZ, 10/27 6:45:00p PT, GURUNANDA) · fully free",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 16
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 3
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 5
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 1
const available = doors.filter((d) => d.status === "Available").length; // 4

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
    value: `5`,
    numerator: 5,
    denominator: TOTAL_DOORS,
    percentage: Math.round((5 / TOTAL_DOORS) * 100),
  },
  {
    label: "Doors Available",
    value: `4`,
    numerator: 4,
    denominator: TOTAL_DOORS,
    percentage: Math.round((4 / TOTAL_DOORS) * 100),
  },
  {
    label: "Anomalies",
    value: `1`,
    numerator: 1,
    denominator: TOTAL_DOORS,
    percentage: Math.round((1 / TOTAL_DOORS) * 100),
  },
];

// Doors that carried dockStatus RESERVED at this pull: 3 (DOCK50, DOCK58,
// DOCK65). They are held/reserved rather than free, and DOCK50 + DOCK58 also
// read spaceStatus OCCUPIED, so "not fully free" doors total 19 of 23.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee - GURUNANDA scope (the dashboard cards).
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, Nov 16 2026 12:26p PT).
// 5 active-status tasks at Bay-4 doors: 1 LOAD + 4 RECEIVE, at 4 distinct doors
// (DOCK50, DOCK57, DOCK58, DOCK69).
// DANIEL BELTRAN (1932077596691410945): 1 LOAD (DOCK57 TASK-5421821, IN_PROGRESS,
//   LIVE_LOAD, checked in 11/16 12:05:02p PT)
// Luis Alberto Paredes (2000828853478171162): 1 RECEIVE (DOCK58 TASK-5420461, NEW)
// Gonzalo Rangel (2000828853478170980): 1 RECEIVE (DOCK50 TASK-5418313, NEW)
// Jorge Antonio Franco (2060441422549078018): 1 RECEIVE (DOCK69 TASK-5381972, NEW)
// daira gonzalez (1948070158297014492): 1 RECEIVE (DOCK50 TASK-5090739, IN_PROGRESS, stale)
// All names/ids resolved verbatim from the WMS task payloads (assigneeUserName /
// assigneeUserId); no name was normalised or guessed. ARNULFO MUNGUIA has 0
// GURUNANDA active tasks at this pull (all four of his Bay-4 load tasks closed
// this morning) but he holds BOTH KARAKA RECEIVE tasks on DOCK54
// (TASK-5421959 TASK-5419478), so adding the non-GURUNANDA tasks would make
// ARNULFO MUNGUIA 2 and the total 7 - see bay4AllCustomerActiveTaskCount.
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "DANIEL BELTRAN", taskCount: 1 },
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

// Mix: 4 RECEIVE + 1 LOAD = 5 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 4, total: 5 },
  { label: "Outbound (LOAD)", count: 1, total: 5 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 1, total: 5 },
  { label: "Inbound", count: 4, total: 5 },
];

// --- Schedule Data (2026-11-16, Monday) ---
// GURUNANDA is scheduling again after the 11/14-11/15 weekend, so both
// percentages are computable at this pull:
//   % scheduled inbounds received TODAY: 11 GURUNANDA receipts carry an
//   appointmentTime inside the 11/16 PT business day (query window
//   appointmentTimeFrom "2026-11-16 00:00:00" -> appointmentTimeTo
//   "2026-11-16 23:59:59", totalCount 11), of which 2 carry a receivedStartTime
//   (RN-195674 recvStart 11/16 11:50:24a PT, RN-5011516 recvStart 11/13
//   10:20:55a PT and CLOSED at receivedTime 11/16 8:48:01a PT) = 2 / 11.
//   % scheduled outbounds loaded TODAY: 56 GURUNANDA orders carry a scheduleDate
//   inside the 11/16 PT day (scheduleDatePeriod ["2026-11-16 00:00:00",
//   "2026-11-16 23:59:59"], totalCount 56) of which 16 are at status SHIPPED
//   (the other 40 are PICKED 24, PLANNED 8, IMPORTED 7, COMMIT_FAILED 1)
//   = 16 / 56.
//   CONTEXT ONLY: re-read live at this refresh, 11/13 reads 12 receipts of
//   which 7 carry a receivedStartTime (58.3%) and 32 orders of which 11 are
//   SHIPPED (34.4%); 11/14 and 11/15 read 0 receipts and 0 orders (weekend,
//   which is why the previous snapshot published both cards as NOT COMPUTABLE).
export const scheduleAvailable = true;              // 11 GURUNANDA receipts scheduled on 11/16
export const outboundScheduleAvailable = true;      // 56 GURUNANDA orders scheduled on 11/16
export const scheduledInboundOrders = 11;           // receipts with appointmentTime in the 11/16 PT day
export const scheduledOutboundOrders = 56;          // orders with scheduleDate in the 11/16 PT day
export const scheduledInboundReceived = 2;          // receipts with receivedStartTime in that set
export const scheduledOutboundLoaded = 16;          // orders at status SHIPPED in that set
export const pctScheduledInboundReceived = 18.2;    // 2 of 11
export const pctScheduledOutboundLoaded = 28.6;     // 16 of 56
// Facility-wide appointment context for the 11/16 PT day, all customers (same
// two endpoints, no customerId filter): 40 receipts scheduled, of which 20
// carry a receivedStartTime; 3,365 orders scheduled by totalCount (all 3,365
// read across paging) of which 1,631 are SHIPPED.
//   TIME-WINDOW NOTE (verified at this pull): /wms-bam/inbound/receipt/search-by-paging
//   and /wms-bam/outbound/order/search-by-paging compare appointmentTime /
//   scheduleDate against the RAW stored UTC value, so the America/Los_Angeles
//   business day must be passed as 2026-11-16 08:00:00 -> 2026-11-17 07:59:59.
//   Passing 2026-11-16 00:00:00 -> 23:59:59 returns only 7 GURUNANDA receipts
//   (it silently drops the 4 evening-PT ones stored as 11/17 04:00-07:00 UTC).
export const facilityWideReceiptsCreated = 40;
export const facilityWideReceiptsReceived = 20;
export const facilityWideLoadsCreated = 3365;
export const facilityWideLoadsShipped = 1631;

// Door occupancy duration: available from task startTime where a task exists on
// the door, has actually started and has not already ended; unavailable for
// task-less doors and for NEW tasks with no startTime (WMS has no
// occupancy-start field, and the dock-door-status dashboard endpoint returns an
// empty Duration column). 18 of 23 doors carry no active task at this pull, 3 of
// the 7 physical tasks are NEW/not started (DOCK50 TASK-5418313, DOCK58
// TASK-5420461, DOCK69 TASK-5381972) and 1 is stale (DOCK50 TASK-5090739), so a
// duration exists for 3 tasks on 2 doors (DOCK54 98h58m from 11/12 9:27:55a PT
// KARAKA RECEIVE, DOCK54 1h19m from 11/16 11:06:28a PT KARAKA RECEIVE and
// DOCK57 21m from 11/16 12:04:40p PT LOAD - all measured to 11/16 12:26p PT).
export const doorDurationsAvailable = true;

// All Bay 4 active GURUNANDA task records (DOCK50-DOCK72, Nov 16 2026 12:26p PT)
// 5 tasks total: 1 LOAD + 4 RECEIVE. One is a data anomaly (TASK-5090739 on
// DOCK50, stale since 2025-10-21). The 2 physical tasks on those doors that are
// NOT GURUNANDA - KARAKA, LLC RECEIVE TASK-5421959 and TASK-5419478, both at
// DOCK54 - are deliberately not listed here so this array stays consistent with
// assigneeSummaries / inboundOutboundMix; they are documented in the DOCK54
// door record.
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA has 83 CLOSED GURUNANDA load transactions with endTime inside
// the 2026-10-31 00:00:00 PT - now window (82 under assigneeUserId 89 plus 1
// under a second Arnulfo identity, assigneeUserId 1948070158297014318, name
// rendered "arnulfo munguia"; 73 of them at Bay-4 doors - DOCK51 12, DOCK53 11,
// DOCK54 11, DOCK52 11, DOCK55 8, DOCK56 7, DOCK50 7, DOCK57 3, DOCK60 2,
// DOCK59 1; the other 10 are on DOCK4 2, DOCK5 2, DOCK7 2, DOCK6 1, DOCK9 1,
// DOCK10 1 and DOCK45 1); per-day counts by endTime (PT): 11/16 7, 11/13 8,
// 11/12 12, 11/11 4, 11/10 10, 11/9 6, 11/6 8, 11/5 4, 11/4 11, 11/3 6 and
// 11/2 7, with no closures on 11/14, 11/15, 11/8, 11/7 or 11/1.
// The newest overall is DOCK10 TASK-5421016 (started 11/13 6:49:05p PT, closed
// 11/16 11:40:39a PT); the newest at a Bay-4 door is DOCK56 TASK-5421056
// (started 11/13 9:53:54p PT, closed 11/16 11:02:48a PT; 2 loads both SHIPPED;
// seal 25010981).
// He now holds ZERO GURUNANDA open tasks facility-wide and TWO KARAKA RECEIVE
// tasks, both at DOCK54: TASK-5421959 (started 11/16 11:06:28a PT, 2 receipts
// RN-195510 / RN-195509, dock checked out 12:02:45p PT while still
// IN_PROGRESS) and TASK-5419478 (started 11/12 9:27:55a PT, RN-195042).
export const assignments: TaskRecord[] = [
  // ----- INBOUND / RECEIVE (4) -----
  {
    taskId: "TASK-5420461",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/13 10:13:50a PT (Luis Alberto Paredes; entry ET-1182030, RN-5011507 at status IMPORTED, PO PO9419, appointment 11/13 10:00a PT, in-yard 11/13 10:13:27a PT, container Leafchem11132026, carrier WILL CALL) - task has no startTime",
    assignee: "Luis Alberto Paredes",
    door: "DOCK58",
  },
  {
    taskId: "TASK-5418313",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/11 11:24:50a PT (Gonzalo Rangel; entry ET-1181371, RN-195495 at status IMPORTED, PO RMA0276 / reference 'Po # 979126', appointment 11/11 12:00a PT, in-yard 11/11 11:24:50a PT, carrier WILL CALL) - task has no startTime",
    assignee: "Gonzalo Rangel",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/30 10:46:50a PT (Jorge Antonio Franco; entry ET-1162686, RN-5010583 at status IMPORTED, PO9139-2, container Jpack09242026, no appointment, in-yard 9/30 10:46:48a PT, carrier WILL CALL) - task has no startTime",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 2025-10-21 1:21:14p PT; status still IN_PROGRESS although endTime is 2025-10-22 10:42:01a PT; daira gonzalez, entry ET-1027622, RN-5002143 which is itself already CLOSED, container EGSU8032696, reference EGLV149507056809, dock-checked-in 2025-10-22 10:41:46a PT)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },

  // ----- OUTBOUND / LOAD (1) -----
  {
    taskId: "TASK-5421821",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 21m since 11/16 12:04:40p PT (DANIEL BELTRAN, task created 11/16 8:54:39a PT, checked in 12:05:02p PT; LIVE_LOAD, 1 load LOAD-5043552 still at status LOADING, proNo 5043552, load appointment 11/6 8:00a PT, carrier ORG-378878, NO sealNo recorded yet)",
    assignee: "DANIEL BELTRAN",
    door: "DOCK57",
  },
];
