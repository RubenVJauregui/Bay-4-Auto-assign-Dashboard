/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-11-03 5:40p PT (live WISE / WMS-BAM APIs)
 *   Sources (all read with item-time-zone America/Los_Angeles; the API returns
 *   dock/task/receipt/order timestamps as facility-local PT wall-clock values, so
 *   PT windows below are written as plain PT wall-clock strings):
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors, 23/23 rows
 *       returned (fresh dockStatus, spaceStatus, occupiedCustomerIds, entryId,
 *       updatedTime)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide totalCount 17); matched on dockName to
 *       the 23 Bay-4 docks -> 9 at Bay 4 doors (DOCK50, 51, 52, 53 x2, 54, 55, 56, 59)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide totalCount 16), same per-door
 *       dockName match -> 3 at Bay 4 doors (DOCK50, 63, 69)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To inside the 11/3 PT business day -> totalCount 12
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDatePeriod inside the 11/3 PT business day -> totalCount 33
 *     - /wms-bam/outbound/load-task/search-by-paging - GURUNANDA CLOSED/FORCE_CLOSED
 *       load tasks for assigneeUserId 89 (ARNULFO MUNGUIA), endTime
 *       10/27 00:00:00 - 11/3 17:40:00 PT, sorted endTime DESC -> 26 transactions
 *       (Arnulfo Assigned Activity stream)
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders at status
 *       PLANNED, no date filter -> totalCount 242 (planned-orders fallback)
 *   NOTE: door state is read from wms-location/search (dockStatus + spaceStatus),
 *   the same two status fields the dashboard already uses.
 *   NOTE: the load/receive task searches were filtered by customer only and matched
 *   to Bay-4 doors on the returned dockName field (dockId is also present but is a
 *   numeric location id, not the DOCKnn name).
 *
 *   CONTEXT - 11/3 PT is a Tuesday. 12 GURUNANDA receipts carry an appointment on
 *   11/3; 1 of them (RN-5011295) carries a receivedStartTime = 8.3% received.
 *   33 GURUNANDA orders carry scheduleDate 11/3; 5 are at status SHIPPED (the
 *   loaded proxy defined by the prior refreshes) = 15.2%.
 *
 *   Key changes from the prior refresh (11/1 ~4:40p PT -> 11/3 ~5:40p PT):
 *     - DOOR STATUS FLIPS (6 doors): DOCK62, DOCK65, DOCK69, DOCK72 moved to
 *       Available; DOCK63 and DOCK68 moved to Occupied. Door Utilization now stands
 *       at 14/23 occupied, 1 reserved (DOCK57), 8 available (DOCK61, DOCK62,
 *       DOCK64, DOCK65, DOCK67, DOCK69, DOCK71, DOCK72). Raw dockStatus=OCCUPIED
 *       is 13/23; the extra occupied door is DOCK58, whose dockStatus reads AVAILABLE
 *       while its spaceStatus reads OCCUPIED.
 *     - TASK TURNOVER: none of the 11 tasks on the 11/1 pull is still active. 12
 *       active tasks (9 LOAD + 3 RECEIVE) now sit on 10 doors (DOCK50, 51, 52, 53 x2,
 *       54, 55, 56, 59, 63, 69). New assignees on the board: SEBASTIAN GONZALEZ
 *       (2 LOAD), ENRIQUE HIGAREDA (1 LOAD).
 *     - STALE ANOMALY CLEARED: TASK-5338695 (DOCK54, LOAD started 8/7/26 4:29:29p PT)
 *       finally closed 11/3 10:00:11a PT after 88d01h10m. The only anomaly left is
 *       TASK-5090739 (DOCK50, RECEIVE started 10/21/25 1:21:14p PT, 378d04h18m;
 *       status still IN_PROGRESS although its endTime is 10/22/25 10:42:01a PT).
 *     - Task "Guru live out / in assign to Arnulfo" still resolves to ARNULFO
 *       MUNGUIA GURUNANDA Bay 4 work. No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo"; the stream is read as the
 *       assignee's task assignment transactions and none is invented here.
 *       His assigned-activity pull (closed load tasks, endTime 10/27-11/3 PT)
 *       now returns 26 transactions; the newest is DOCK50 TASK-5409981
 *       (PRE_LOAD, ET-1178302, load LOAD-5043256 SHIPPED / 50103234 -
 *       DN-3429506, seal 1304730, equipment 53377; started 11/2 12:17:15p PT,
 *       closed 11/3 10:25:06a PT = 1d05h22m). His open Bay-4 work is 6 live LOAD
 *       tasks (DOCK52, DOCK53 x2, DOCK55, DOCK56, DOCK59).
 *     - "% scheduled inbounds received" (11/3 PT day): 1 of 12 = 8.3% - computable
 *       this pull (the 11/1 pull had 0 receipts scheduled, so it was not computable).
 *     - "% scheduled outbounds loaded" (11/3 PT day): 5 of 33 = 15.2% (SHIPPED proxy).
 *     - Inbound/outbound mix: 3 RECEIVE / 9 LOAD of 12 active Bay-4 tasks.
 *     - Door occupancy duration is available only where a task with a startTime
 *       sits on the door; WMS has no occupancy-start field for task-less doors
 *       (and for NEW tasks that never started), so none is derived.
 *
 *   NOTE: the in-yard FULL equipment array was NOT re-pulled in this refresh
 *   (out of scope of the request); Section 1 renders live from the WMS loader, so
 *   the dashboard still shows current data. The all-time assignee baseline was
 *   also not re-pulled.
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
// NOT re-pulled in the 11/3 5:40p PT refresh (out of scope of the request). The
// array is left empty rather than carrying a stale result; Section 1 renders live
// from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875) at
// status PLANNED. FALLBACK ONLY - the dashboard shows the live loader count when
// it succeeds. Live totalCount was 242 at the 11/3 ~5:40p PT pull (was 246).
export const plannedGurunandaOrderCount = 242;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 11/3 ~5:40p PT
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
    assignee: "SEBASTIAN GONZALEZ (LOAD) + daira gonzalez (RECEIVE - STALE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5411393", "TASK-5090739"],
    duration: "LOAD 2h19m since 11/3 3:20:43p PT (TASK-5411393, SEBASTIAN GONZALEZ, ET-1178837, PRE_LOAD, seal 1304734, 6 loads - 3 LOADED + 3 WINDOW_CHECKIN_DONE, equipment 53779, dock check-in 3:21:02p PT) — plus STALE RECEIVE 378d04h18m since 10/21/25 1:21:14p PT, task still IN_PROGRESS although its endTime is 10/22/25 10:42:01a PT (TASK-5090739, daira gonzalez, ET-1027622, RN-5002143 CLOSED / PO EGSU8032696) · dock and space occupied, occupiedCustomerIds ORG-655875, entry ET-1178822 (row updated 11/3 3:48:54p PT)",
    anomaly: true, // TASK-5090739 started 10/21/25 and is still IN_PROGRESS
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "ENRIQUE HIGAREDA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5411179"],
    duration: "LOAD 3h34m since 11/3 2:05:52p PT (TASK-5411179, ENRIQUE HIGAREDA, ET-1178752, PRE_LOAD, seal 777527, load LOAD-5043366 LOADED / 50103288 - DN-3430762, equipment 53402CT, dock check-in 2:06:19p PT) · dock and space occupied, entry ET-1178752 (row updated 11/3 2:06:19p PT)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5410268"],
    duration: "LOAD 1d01h23m since 11/2 4:16:38p PT (TASK-5410268, ARNULFO MUNGUIA, ET-1178403, PRE_LOAD, seal 25079935, 6 loads all LOADED; load nos 50116403, 50117271, 50116229, 50116478, 50116447, 50106538; equipment 53188, trailer in yard 11/3 10:39:03a PT, dock check-in 11/2 4:16:42p PT) · dock and space occupied, entry ET-1178403 (row updated 11/3 10:39:21a PT)",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD x2)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5411377", "TASK-5410206"],
    duration: "LOAD 2h34m since 11/3 3:05:33p PT (TASK-5411377, ARNULFO MUNGUIA, ET-1178832, PRE_LOAD, seal 1379204, 3 loads all LOADED, equipment 53240, dock check-in 3:05:36p PT) — plus LOAD 1d01h47m since 11/2 3:52:34p PT (TASK-5410206, ARNULFO MUNGUIA, ET-1178364, PRE_LOAD, seal 24800312, 4 loads all LOADED, equipment 53288, dock check-in 3:52:37p PT) · dock and space occupied, entry ET-1178832 (row updated 11/3 4:08:31p PT)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "SEBASTIAN GONZALEZ (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5411230"],
    duration: "LOAD 3h25m since 11/3 2:14:12p PT (TASK-5411230, SEBASTIAN GONZALEZ, ET-1178768, PRE_LOAD, seal 1304731, 2 loads - LOAD-5043518 LOADING / 50116373 - DN-3437001 + LOAD-5042582 WINDOW_CHECKIN_DONE / 50095747 - DN-3419026, equipment 53104, dock check-in 2:14:27p PT) · dock and space occupied, entry ET-1178768 (row updated 11/3 4:05:06p PT)",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5411426"],
    duration: "LOAD NEW · created 11/3 3:52:14p PT (TASK-5411426, ARNULFO MUNGUIA, ET-1178849, PRE_LOAD, 2 loads WINDOW_CHECKIN_DONE - LOAD-5043622 / 50126939 - DN-3439584, LOAD-5043348 / 50103277 - DN-3430399; equipment 53198) - task has no startTime, so no duration basis · dock and space occupied, entry ET-1178849 (row updated 11/3 3:52:23p PT)",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5411438"],
    duration: "LOAD 1h21m since 11/3 4:18:21p PT (TASK-5411438, ARNULFO MUNGUIA, ET-1178856, PRE_LOAD, 1 load LOADING - LOAD-5043516 / 50116302 - DN-3437157, equipment 53211, dock check-in 4:18:31p PT) · dock and space occupied, entry ET-1178856 (row updated 11/3 4:18:31p PT)",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space occupied, entry ET-1178756 (row updated 11/3 12:22:12p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied, entry ET-1178746 (row updated 11/3 1:29:02p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5410201"],
    duration: "LOAD 1d02h46m since 11/2 2:53:42p PT (TASK-5410201, ARNULFO MUNGUIA, ET-1178361, PRE_LOAD, seal 24800311, 2 loads all LOADED - LOAD-5043351 / 50103280 - DN-3430630, LOAD-5043354 / 50103283 - DN-3430666; equipment TV544, dock check-in 2:53:57p PT) · dock and space occupied, entry ET-1178361 (row updated 11/2 11:10:21p PT)",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied, occupiedCustomerIds ORG-655875, entry ET-1177628 (row updated 11/1 6:26:27p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1177638 (row updated 10/30 11:06:59a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1177432 (row updated 11/2 1:05:59p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5411421"],
    duration: "RECEIVE 2h00m since 11/3 3:39:28p PT (TASK-5411421, DANIELA GONZALEZ, ET-1178846, RN-5011295 IN_PROGRESS / PO OOLU9511800 ref B00417735, appointment 11/3 11:00a PT, receivedStartTime 3:39:28p PT, seal NK523550, dock check-in 3:39:30p PT) · dock occupied, space empty, entry ET-1178846 (row updated 11/3 3:39:30p PT)",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1176452 (row updated 10/29 9:08:11p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1176517 (row updated 11/2 12:18:23p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1173309 (row updated 10/30 10:37:29p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1177613 (row updated 10/30 12:45:31p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1177841 (row updated 11/2 11:09:07p PT) · no occupancy-start field in WMS · the receive task that held this door at the 11/1 pull (TASK-5408610) is no longer active",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Available",
    assignee: "Jorge Antonio Franco (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW · created 9/30 10:46:50a PT (TASK-5381972, Jorge Antonio Franco, ET-1162686, RN-5010583 IMPORTED / PO9139-2, no appointment, trailer in yard 9/30 10:46:48a PT) - task has no startTime, so no duration basis · dock AVAILABLE, space EMPTY, entry ET-1171953 (row updated 10/30 3:46:16p PT), i.e. the open NEW task is not holding the door",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty, entry ET-1172826 (row updated 10/30 10:37:15p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1176765 (row updated 11/3 3:47:28p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY, entry ET-1176051 (row updated 11/2 3:52:37p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 14
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 1
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 10
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 1
const available = doors.filter((d) => d.status === "Available").length; // 8

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors Occupied",
    value: `${occupied}/23`,
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

// Doors carrying dockStatus RESERVED at this pull: DOCK57.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (facility-wide active pulls, matched on dockName to the 23 Bay-4 docks, Nov 3 2026 ~5:40p PT).
// 12 active-status tasks at Bay 4 doors: 9 LOAD + 3 RECEIVE.
// ARNULFO MUNGUIA: 6 LOAD (DOCK52 TASK-5410268, DOCK53 TASK-5411377, DOCK53
//   TASK-5410206, DOCK55 TASK-5411426 NEW, DOCK56 TASK-5411438, DOCK59 TASK-5410201)
// SEBASTIAN GONZALEZ: 2 LOAD (DOCK50 TASK-5411393, DOCK54 TASK-5411230)
// ENRIQUE HIGAREDA: 1 LOAD (DOCK51 TASK-5411179)
// Jorge Antonio Franco: 1 RECEIVE (DOCK69 TASK-5381972 NEW)
// DANIELA GONZALEZ: 1 RECEIVE (DOCK63 TASK-5411421, IN_PROGRESS)
// daira gonzalez: 1 RECEIVE (DOCK50 TASK-5090739, STALE)
// All assigned names resolved from WMS task payloads (assigneeUserName).
// daira gonzalez (userId 1948070158297014492) and DANIELA GONZALEZ (userId 11769)
// are two different WMS users and are kept separate.
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 6 },
  { name: "SEBASTIAN GONZALEZ", taskCount: 2 },
  { name: "ENRIQUE HIGAREDA", taskCount: 1 },
  { name: "Jorge Antonio Franco", taskCount: 1 },
  { name: "DANIELA GONZALEZ", taskCount: 1 },
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

// Mix: 3 RECEIVE + 9 LOAD = 12 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 3, total: 12 },
  { label: "Outbound (LOAD)", count: 9, total: 12 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 9, total: 12 },
  { label: "Inbound", count: 3, total: 12 },
];

// --- Schedule Data (2026-11-03, Tuesday) ---
// % scheduled inbounds received TODAY: 12 GURUNANDA receipts carry an
//   appointmentTime inside the 11/3 PT business day (query window
//   appointmentTimeFrom "2026-11-03 00:00:00" -> appointmentTimeTo
//   "2026-11-03 23:59:59" returned totalCount 12). 1 of those receipts carries a
//   receivedStartTime (RN-5011295 IN_PROGRESS, receivedStartTime 11/3 3:39:28p PT)
//   = 8.3%.
// % scheduled outbounds loaded TODAY: 33 GURUNANDA orders carry a scheduleDate
//   inside the 11/3 PT day (scheduleDatePeriod ["2026-11-03 00:00:00",
//   "2026-11-03 23:59:59"] returned totalCount 33). 5 of those orders are at
//   status SHIPPED (the "loaded" proxy defined by the prior refreshes:
//   DN-3430777, DN-3430314, DN-3430197, DN-3427734, DN-3407615) = 15.2%. One
//   further order is at status LOADED (DN-3438870); it is not counted in this
//   proxy, which stays on the SHIPPED definition for comparability.
export const scheduleAvailable = true;              // inbound denominator is 12 on 11/3
export const outboundScheduleAvailable = true;      // outbound denominator is 33 on 11/3
export const scheduledInboundOrders = 12;           // receipts with appointmentTime in the 11/3 PT day
export const scheduledOutboundOrders = 33;          // orders with scheduleDate in the 11/3 PT day
export const scheduledInboundReceived = 1;          // receipts with receivedStartTime in that set
export const scheduledOutboundLoaded = 5;           // orders at status SHIPPED in that set
export const pctScheduledInboundReceived = 8.3;     // 1 of 12 = 8.3%
export const pctScheduledOutboundLoaded = 15.2;     // 5 of 33 = 15.2%
// Facility-wide appointment context - unavailable (GURUNANDA-scoped queries only;
// no all-customer facility-wide appointment totals were pulled for this refresh).
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime where a task exists on the
// door and has actually started; unavailable for task-less doors and for NEW tasks
// with no startTime (no occupancy-start field in WMS, and the dock-door-status
// dashboard endpoint returns an empty Duration column).
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Nov 3 2026 ~5:40p PT)
// 12 tasks total: 9 LOAD + 3 RECEIVE. All GURUNANDA, LLC.
// One is a stale-anomaly task (TASK-5090739 on DOCK50).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA (userId 89) has 26 CLOSED GURUNANDA load transactions with endTime
// inside 10/27-11/3 PT (re-pulled at 5:40p PT); the newest is DOCK50 TASK-5409981
// (PRE_LOAD, ET-1178302, load LOAD-5043256 SHIPPED / 50103234 - DN-3429506, seal
// 1304730, equipment 53377; started 11/2 12:17:15p PT, closed 11/3 10:25:06a PT
// = 1d05h22m). The formerly stale TASK-5338695 also closed in this window
// (11/3 10:00:11a PT, 88d01h10m). His open Bay-4 work is 6 live LOAD tasks
// (DOCK52, DOCK53 x2, DOCK55, DOCK56, DOCK59).
export const assignments: TaskRecord[] = [
  // ----- OUTBOUND / LOAD (9) -----
  {
    taskId: "TASK-5411438",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 1h21m since 11/3 4:18:21p PT (ARNULFO MUNGUIA; ET-1178856, PRE_LOAD, load LOAD-5043516 LOADING / 50116302 - DN-3437157; equipment 53211, dock check-in 4:18:31p PT)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK56",
  },
  {
    taskId: "TASK-5411426",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 11/3 3:52:14p PT (ARNULFO MUNGUIA; ET-1178849, PRE_LOAD, 2 loads WINDOW_CHECKIN_DONE - LOAD-5043622 / 50126939 - DN-3439584, LOAD-5043348 / 50103277 - DN-3430399; equipment 53198) - task has no startTime",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5411393",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 2h19m since 11/3 3:20:43p PT (SEBASTIAN GONZALEZ; ET-1178837, PRE_LOAD, seal 1304734, 6 loads - 3 LOADED + 3 WINDOW_CHECKIN_DONE; load nos 50123938, 50116170, 50116316, 50116241, 50116207, 50116186; equipment 53779, dock check-in 3:21:02p PT)",
    assignee: "SEBASTIAN GONZALEZ",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5411377",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 2h34m since 11/3 3:05:33p PT (ARNULFO MUNGUIA; ET-1178832, PRE_LOAD, seal 1379204, 3 loads all LOADED - LOAD-5043515 / 50116273 - DN-3437158, LOAD-5043514 / 50116255 - DN-3437159, LOAD-5043524 / 50117146 - DN-3436383; equipment 53240, dock check-in 3:05:36p PT)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5411230",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 3h25m since 11/3 2:14:12p PT (SEBASTIAN GONZALEZ; ET-1178768, PRE_LOAD, seal 1304731, 2 loads - LOAD-5043518 LOADING / 50116373 - DN-3437001 + LOAD-5042582 WINDOW_CHECKIN_DONE / 50095747 - DN-3419026; equipment 53104, dock check-in 2:14:27p PT)",
    assignee: "SEBASTIAN GONZALEZ",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5411179",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 3h34m since 11/3 2:05:52p PT (ENRIQUE HIGAREDA; ET-1178752, PRE_LOAD, seal 777527, load LOAD-5043366 LOADED / 50103288 - DN-3430762; equipment 53402CT, dock check-in 2:06:19p PT)",
    assignee: "ENRIQUE HIGAREDA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5410268",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 1d01h23m since 11/2 4:16:38p PT (ARNULFO MUNGUIA; ET-1178403, PRE_LOAD, seal 25079935, 6 loads all LOADED; load nos 50116403, 50117271, 50116229, 50116478, 50116447, 50106538; equipment 53188, trailer in yard 11/3 10:39:03a PT, dock check-in 11/2 4:16:42p PT)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5410206",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 1d01h47m since 11/2 3:52:34p PT (ARNULFO MUNGUIA; ET-1178364, PRE_LOAD, seal 24800312, 4 loads all LOADED - LOAD-5043352 / 50103281 - DN-3430632, LOAD-5043358 / 50103287 - DN-3430750, LOAD-5043357 / 50103286 - DN-3430702, LOAD-5043356 / 50103285 - DN-3430698; equipment 53288, dock check-in 3:52:37p PT)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5410201",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 1d02h46m since 11/2 2:53:42p PT (ARNULFO MUNGUIA; ET-1178361, PRE_LOAD, seal 24800311, 2 loads all LOADED - LOAD-5043351 / 50103280 - DN-3430630, LOAD-5043354 / 50103283 - DN-3430666; equipment TV544, dock check-in 2:53:57p PT)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK59",
  },

  // ----- INBOUND / RECEIVE (3) -----
  {
    taskId: "TASK-5411421",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · 2h00m since 11/3 3:39:28p PT (DANIELA GONZALEZ; ET-1178846, RN-5011295 IN_PROGRESS / PO OOLU9511800 ref B00417735, appointment 11/3 11:00a PT, receivedStartTime 3:39:28p PT, seal NK523550, dock check-in 3:39:30p PT)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK63",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/30 10:46:50a PT (Jorge Antonio Franco; ET-1162686, RN-5010583 IMPORTED / PO9139-2, no appointment, trailer in yard 9/30 10:46:48a PT) - task has no startTime",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 10/21/25 1:21:14p PT, 378d04h18m; status still IN_PROGRESS although endTime is 10/22/25 10:42:01a PT; daira gonzalez, ET-1027622, RN-5002143 CLOSED / PO EGSU8032696)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
];
