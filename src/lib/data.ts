/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-10-22 ~4:01p PT (live WISE / WMS-BAM APIs)
 *   Sources:
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors
 *       (fresh dockStatus, spaceStatus, occupiedCustomerIds, updatedTime per door)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide 13; 4 at Bay 4 doors)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide 15; 4 at Bay 4 doors)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To = 2026-10-22 -> 10 scheduled (totalCount 10).
 *       All 10 listed in the same pull: 7 IMPORTED, 2 IN_PROGRESS, 1 CLOSED.
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDateFrom/To = 2026-10-22 -> 71 scheduled (totalCount 71);
 *       32 of them status SHIPPED (totalCount 32).
 *     - /wms-bam/dashboard/dock-door-status/search-by-paging - read for cross-check
 *       only (per-door Status + Task ID); its "Duration" column is empty for all
 *       23 Bay 4 doors, so door durations are still derived from task startTime.
 *   NOTE: door state is read from wms-location/search (dockStatus + spaceStatus),
 *   the same two status fields the dashboard already uses.
 *
 *   Key changes from the prior refresh (10/19 ~6:31p PT -> 10/22 ~4:01p PT):
 *     - Bay 4 GURUNANDA active tasks: 8 (4 LOAD + 4 RECEIVE) on 6 doors
 *       (DOCK50, DOCK53, DOCK54, DOCK61, DOCK68, DOCK69).
 *       New since 10/19: TASK-5401241 (DOCK54 LIVE_LOAD, DANIEL BELTRAN, 3:39p),
 *       TASK-5401111 (DOCK53 PRE_LOAD, DANIEL BELTRAN, 2:11p), TASK-5401012
 *       (DOCK50 PRE_LOAD, DANIEL BELTRAN, 1:12p), TASK-5401002 (DOCK68 RECEIVE,
 *       RUFINO MUNGUIA, 12:22p), TASK-5400354 (DOCK61 RECEIVE, DANIELA GONZALEZ,
 *       3:39p). Gone from the active Bay-4 population: TASK-5398112, TASK-5397937,
 *       TASK-5398184, TASK-5397874, TASK-5397988, TASK-5394671, TASK-5398179,
 *       TASK-5398255.
 *     - Task "Guru live out / in assign to Arnulfo" still resolves to ARNULFO
 *       MUNGUIA GURUNANDA Bay 4 work, but that stream is now CLOSED for the day
 *       and only one stale task remains open: 4 ASSIGNED ACTIVITY transactions
 *       closed on 10/22 - DOCK52 TASK-5400327 (closed 9:48a PT), DOCK51
 *       TASK-5400283 (closed 9:31a PT), DOCK54 TASK-5399772 (closed 9:37a PT)
 *       and DOCK10 TASK-5397642 (closed 12:24p PT, outside DOCK50-DOCK72) - plus
 *       the still-open stale DOCK54 TASK-5338695 (PRE_LOAD, started 8/7/26).
 *       Arnulfo holds 0 active LIVE_LOAD tasks and 0 Bay-4 RECEIVE tasks at this
 *       pull; today's Bay-4 live load (TASK-5401241, DOCK54) sits with
 *       DANIEL BELTRAN. No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo" and none is invented here.
 *     - Bay 4 doors occupied (rule below): 18/23 - 5 available
 *       (DOCK62, DOCK67, DOCK68, DOCK69, DOCK72), 0 reserved.
 *       Raw dockStatus=OCCUPIED = 15/23; the extra occupied doors are
 *       space-occupied doors whose dockStatus reads AVAILABLE (DOCK51, DOCK52,
 *       DOCK55, DOCK56, DOCK60). No door carries dockStatus RESERVED at this pull.
 *     - Stale anomalies STILL OPEN: TASK-5338695 (DOCK54, LOAD started 8/7/26
 *       4:29p PT, ~76.0 days; status still IN_PROGRESS although its endTime is
 *       8/10/26 9:27a PT) and TASK-5090739 (DOCK50, RECEIVE started 10/21/25
 *       1:21p PT, ~366.1 days; status still IN_PROGRESS although its endTime is
 *       10/22/25 10:42a PT).
 *     - Door/task mismatch flagged: DOCK68 and DOCK69 (active receive task while
 *       the location row reports dock AVAILABLE, space EMPTY).
 *     - "% scheduled inbounds received" (10/22): 1 of 10 = 10.0%
 *       (RN-5011040 CLOSED at 2:43p PT; 2 receipts IN_PROGRESS hold a
 *       receivedStartTime but no receivedTime, so they are not counted).
 *     - "% scheduled outbounds loaded" (10/22): 32 of 71 = 45.1%
 *       (status split for the same day: 32 SHIPPED, 18 PICKED, 13 PLANNED,
 *       6 LOADED, 1 PICKING, 1 LOADING).
 *     - Inbound/outbound mix: 4 RECEIVE / 4 LOAD of 8 active Bay-4 tasks.
 *     - Door occupancy duration is available only where a task with a startTime
 *       sits on the door; WMS has no occupancy-start field for task-less doors,
 *       so none is derived for them.
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
// NOT re-pulled in the 10/22 refresh (out of scope of the request). The array is
// left empty rather than carrying a stale result; Section 1 renders live from the
// WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875).
// FALLBACK ONLY - the dashboard shows the live loader count when it succeeds.
// Live totalCount was 189 at the 10/22 ~4:01p PT pull.
export const plannedGurunandaOrderCount = 189;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 10/22 ~4:01p PT
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
    assignee: "DANIEL BELTRAN (LOAD) / daira gonzalez (RECEIVE - STALE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5401012", "TASK-5090739"],
    duration: "LOAD ~2.8h since 10/22 1:12p PT (TASK-5401012, DANIEL BELTRAN, ET-1173808, PRE_LOAD, 5 loads LOADED, seal 1303583) · RECEIVE STALE started 10/21/25 1:21p PT, ~366.1 days; task status still IN_PROGRESS although its endTime is 10/22/25 10:42a PT (TASK-5090739, daira gonzalez, ET-1027622, RN-5002143 CLOSED) · dock and space occupied, occupiedCustomerIds ORG-655875 (row updated 10/22 1:12p PT)",
    anomaly: true, // TASK-5090739 started 10/21/25 and is still IN_PROGRESS
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied (row updated 10/22 10:04a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied (row updated 10/22 10:04a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "DANIEL BELTRAN (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5401111"],
    duration: "LOAD ~1.8h since 10/22 2:11p PT (TASK-5401111, DANIEL BELTRAN, ET-1173886, PRE_LOAD, 9 loads: 7 LOADING, 2 WINDOW_CHECKIN_DONE) · dock and space occupied (row updated 10/22 3:55p PT)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "DANIEL BELTRAN (LOAD) / ARNULFO MUNGUIA (LOAD - STALE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5401241", "TASK-5338695"],
    duration: "LOAD ~0.4h since 10/22 3:39p PT (TASK-5401241, DANIEL BELTRAN, ET-1173950, LIVE_LOAD, 3 loads: 1 LOADING, 2 LOADED) · LOAD STALE started 8/7/26 4:29p PT, ~76.0 days; task status still IN_PROGRESS although its endTime is 8/10/26 9:27a PT (TASK-5338695, ARNULFO MUNGUIA, ET-1135033, 1 load SHIPPED) · dock and space occupied (row updated 10/22 3:39p PT)",
    anomaly: true, // TASK-5338695 started 8/7/26 but is still IN_PROGRESS (~76.0 days)
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied (row updated 10/22 2:30p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied (row updated 10/22 2:00p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space occupied (row updated 10/22 2:54p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space occupied (row updated 10/22 3:13p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/21 8:58p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied, occupiedCustomerIds ORG-655875 (row updated 10/22 3:38p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5400354"],
    duration: "RECEIVE ~0.4h since 10/22 3:39p PT (TASK-5400354, DANIELA GONZALEZ, RN-5010991 IN_PROGRESS / B00415747) · dock and space occupied (row updated 10/22 3:39p PT)",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available (row updated 10/21 8:31p PT)",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/21 8:58p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/21 8:57p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/22 2:17p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/22 7:36a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available (row updated 10/21 9:36p PT)",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Available",
    assignee: "RUFINO MUNGUIA (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5401002"],
    duration: "RECEIVE ~3.6h since 10/22 12:22p PT (TASK-5401002, RUFINO MUNGUIA, RN-194449 IN_PROGRESS / GN10212026UNIS-1290) · location row reports dock AVAILABLE, space EMPTY (row updated 10/22 12:48p PT)",
    anomaly: true, // active receive task on a door whose location row is free
  },
  {
    door: "DOCK69",
    status: "Available",
    assignee: "Jorge Antonio Franco (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW · created 9/30 10:46a PT (TASK-5381972, Jorge Antonio Franco, RN-5010583 IMPORTED) - task has no startTime, so no duration basis · location row reports dock AVAILABLE, space EMPTY (updated 10/22 2:12p PT)",
    anomaly: true, // active receive task on a door whose location row is free
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/21 8:56p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/20 9:02p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available (row updated 10/21 10:47p PT)",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 18
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 0
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 6
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 4
const available = doors.filter((d) => d.status === "Available").length; // 5

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

// No door carries dockStatus RESERVED at this pull; reservedDoorCount stays
// exported for the DoorGrid legend.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (Oct 22 2026 ~4:01p PT). 8 active-status tasks at Bay 4 doors: 4 LOAD + 4 RECEIVE.
// DANIEL BELTRAN: 3 LOAD (DOCK54 TASK-5401241 LIVE_LOAD; DOCK53 TASK-5401111;
//   DOCK50 TASK-5401012)
// ARNULFO MUNGUIA: 1 LOAD (DOCK54 stale TASK-5338695)
// RUFINO MUNGUIA: 1 RECEIVE (DOCK68)
// DANIELA GONZALEZ: 1 RECEIVE (DOCK61)
// Jorge Antonio Franco: 1 RECEIVE (DOCK69, NEW)
// daira gonzalez: 1 RECEIVE (DOCK50, STALE)
// All assigned names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "DANIEL BELTRAN", taskCount: 3 },
  { name: "ARNULFO MUNGUIA", taskCount: 1 },
  { name: "RUFINO MUNGUIA", taskCount: 1 },
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

// Mix: 4 LOAD + 4 RECEIVE = 8 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 4, total: 8 },
  { label: "Outbound (LOAD)", count: 4, total: 8 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 8 },
  { label: "Inbound", count: 4, total: 8 },
];

// --- Schedule Data (2026-10-22, Thursday) ---
// % scheduled inbounds received TODAY: 10 GURUNANDA receipts carry
//   appointmentTime = 2026-10-22 (appointmentTimeFrom/To query returned totalCount 10).
//   Status split re-checked in the same pull by listing all 10: 7 IMPORTED,
//   2 IN_PROGRESS (RN-5011068, RN-5011069 - both hold receivedStartTime
//   10/22 12:29p PT but no receivedTime) and 1 CLOSED (RN-5011040,
//   receivedTime/closedTime 10/22 2:43p PT), so received = 1 and the metric is
//   1 of 10 = 10.0%.
// % scheduled outbounds loaded TODAY: 71 GURUNANDA orders carry scheduleDate = 2026-10-22
//   (scheduleDateFrom/To query returned totalCount 71); 32 of them carry status SHIPPED
//   (same date filter + statuses SHIPPED returned totalCount 32), so loaded = 32 of 71
//   = 45.1%. Remaining order statuses: 18 PICKED, 13 PLANNED, 6 LOADED, 1 PICKING,
//   1 LOADING.
export const scheduleAvailable = true;              // inbound denominator is 10
export const outboundScheduleAvailable = true;      // outbound denominator is 71
export const scheduledInboundOrders = 10;           // receipts with appointmentTime = 2026-10-22
export const scheduledOutboundOrders = 71;          // orders with scheduleDate = 2026-10-22
export const scheduledInboundReceived = 1;          // 1 CLOSED receipt today
export const scheduledOutboundLoaded = 32;          // orders at status SHIPPED today
export const pctScheduledInboundReceived = 10.0;    // 1 of 10 = 10.00%
export const pctScheduledOutboundLoaded = 45.1;     // 32 of 71 = 45.07% -> 45.1%
// Facility-wide appointment context - unavailable (GURUNANDA-scoped query only;
// no all-customer facility-wide appointment totals were pulled for this refresh).
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime where a task exists on the
// door; unavailable for task-less doors (no occupancy-start field in WMS, and the
// dock-door-status dashboard endpoint returns an empty Duration column).
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Oct 22 2026 ~4:01p PT)
// 8 tasks total: 4 LOAD + 4 RECEIVE. All GURUNANDA, LLC.
// Two are stale-anomaly tasks (TASK-5338695 on DOCK54, TASK-5090739 on DOCK50).
// "Assigned Activity" stream for task "Guru live out / in assign to Arnulfo":
// Arnulfo MUNGUIA closed 4 GURUNANDA assignments today (DOCK52 TASK-5400327 9:48a,
// DOCK51 TASK-5400283 9:31a, DOCK54 TASK-5399772 9:37a, DOCK10 TASK-5397642 12:24p
// - the last one outside DOCK50-DOCK72) and keeps only the open stale
// DOCK54 TASK-5338695; his live-load Bay 4 work moved to DANIEL BELTRAN, whose
// TASK-5401241 (DOCK54, LIVE_LOAD) is the only live load open at this pull.
export const assignments: TaskRecord[] = [
  // ----- OUTBOUND / LOAD (4) -----
  {
    taskId: "TASK-5401241",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~0.4h since 10/22 3:39p PT (DANIEL BELTRAN; ET-1173950, LIVE_LOAD, 3 loads - 1 LOADING, 2 LOADED)",
    assignee: "DANIEL BELTRAN",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5401111",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~1.8h since 10/22 2:11p PT (DANIEL BELTRAN; ET-1173886, PRE_LOAD, 9 loads - 7 LOADING, 2 WINDOW_CHECKIN_DONE)",
    assignee: "DANIEL BELTRAN",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5401012",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~2.8h since 10/22 1:12p PT (DANIEL BELTRAN; ET-1173808, PRE_LOAD, 5 loads LOADED, seal 1303583)",
    assignee: "DANIEL BELTRAN",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5338695",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 8/7/26 4:29p PT, ~76.0 days; status still IN_PROGRESS although endTime is 8/10/26 9:27a PT; ARNULFO MUNGUIA, ET-1135033, 1 load SHIPPED)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },

  // ----- INBOUND / RECEIVE (4) -----
  {
    taskId: "TASK-5401002",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~3.6h since 10/22 12:22p PT (RUFINO MUNGUIA; RN-194449 IN_PROGRESS, GN10212026UNIS-1290)",
    assignee: "RUFINO MUNGUIA",
    door: "DOCK68",
  },
  {
    taskId: "TASK-5400354",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~0.4h since 10/22 3:39p PT (DANIELA GONZALEZ; RN-5010991 IN_PROGRESS, B00415747)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK61",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/30 10:46a PT (Jorge Antonio Franco; RN-5010583 IMPORTED) - task has no startTime",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 10/21/25 1:21p PT, ~366.1 days; status still IN_PROGRESS although endTime is 10/22/25 10:42a PT; daira gonzalez, ET-1027622, RN-5002143 CLOSED)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
];
