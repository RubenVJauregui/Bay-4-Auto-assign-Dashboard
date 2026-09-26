/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-09-26 ~7:56a PT (live WISE / WMS-BAM APIs)
 *   Sources:
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors
 *       (fresh dockStatus, spaceStatus, occupiedCustomerIds, updatedTime per door)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide 11; 4 at Bay 4 doors)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide 13; 4 at Bay 4 doors)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts,
 *       appointmentTime = 2026-09-26 (0 scheduled). Filter verified working:
 *       9/24 = 7, 9/25 = 11, 9/28 = 8 receipts.
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders,
 *       scheduleDate = 2026-09-26 -> 0 rows, so the outbound percentage is
 *       NOT COMPUTABLE (filter verified working: 9/25 = 39 orders).
 *   NOTE: /wms-bam/dashboard/dock-door-status/search-by-paging STILL returns
 *   HTTP 500 (re-checked this pull); door state was read from wms-location/search,
 *   the same two status fields the dashboard already uses.
 *
 *   Key changes from the prior refresh (9/19 ~3:58p PT -> 9/26 ~7:56a PT):
 *     - Bay 4 GURUNANDA active tasks: 8 (4 LOAD + 4 RECEIVE) on 6 doors
 *       (DOCK50, DOCK51, DOCK53, DOCK54, DOCK56, DOCK69).
 *     - Task "Guru live out / in assign to Arnulfo" resolves to ARNULFO MUNGUIA
 *       (userId 89) GURUNANDA Bay-4 load work: TASK-5376774 (DOCK50) and the
 *       stale TASK-5338695 (DOCK54). No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo", and Arnulfo holds no Bay-4
 *       RECEIVE task at this pull. Both of his tasks are PRE_LOAD (not LIVE_LOAD).
 *     - Bay 4 doors occupied: 18/23 (derived) - plus 3 RESERVED (DOCK51, DOCK52,
 *       DOCK65) and 2 available (DOCK59, DOCK64). Raw dockStatus=OCCUPIED = 14/23.
 *     - Stale anomalies STILL OPEN: TASK-5338695 (DOCK54, LOAD ended 8/10/26),
 *       TASK-5090739 (DOCK50, RECEIVE ended 10/22/25) - IN_PROGRESS past end time.
 *     - "% scheduled inbounds received" (9/26): NOT COMPUTABLE - 0 receipts
 *       carry appointmentTime = 2026-09-26 (denominator zero).
 *     - "% scheduled outbounds loaded" (9/26): NOT COMPUTABLE - 0 orders carry
 *       scheduleDate = 2026-09-26 (denominator zero).
 *     - Inbound/outbound mix: 4 RECEIVE / 4 LOAD of 8 active Bay-4 tasks.
 *     - Door occupancy duration is available only where a task with a startTime
 *       sits on the door; WMS has no occupancy-start field for task-less doors,
 *       so none is derived for them.
 *
 *   NOTE: the in-yard FULL equipment array, the planned-order fallback count and
 *   the all-time assignment baseline below were NOT re-pulled in this refresh
 *   (out of scope of the request); they remain the previously carried values.
 *
 * Do NOT fabricate, estimate, or guess any metric.
 */export type DoorStatus = "Occupied" | "Reserved" | "Available";

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
// NOT re-pulled in the 9/26 refresh (out of scope of the request). The array is
// left empty rather than carrying a stale result; Section 1 renders live from the
// WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875).
// FALLBACK ONLY - not re-pulled in the 9/26 refresh. Last live totalCount was 209
// at the 9/11 pull. The dashboard shows the live loader count when it succeeds.
export const plannedGurunandaOrderCount = 209;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 9/26 ~7:56a PT
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
    assignee: "ARNULFO MUNGUIA (LOAD) / daira gonzalez (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5376774", "TASK-5090739"],
    duration: "LOAD ~40.4h since 9/24 3:32p PT (ET-1159768, PRE_LOAD, seal A51840, 2 loads) · RECEIVE STALE since 10/21/25 1:21p PT (ended 10/22/25 10:42a, RN-5002143 CLOSED, task never closed)",
    anomaly: true, // TASK-5090739 started 10/21/25; receipt closed 10/22/25 but task never closed
  },
  {
    door: "DOCK51",
    status: "Reserved",
    assignee: "DANIEL BELTRAN (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5377571"],
    duration: "LOAD ~20.0h since 9/25 11:55a PT (ET-1160320, PRE_LOAD, 3 loads) · dock RESERVED, space occupied (row updated 9/26 4:45a PT)",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space occupied (row updated 9/25 3:18p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "DANIEL BELTRAN (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5377822"],
    duration: "LOAD ~16.8h since 9/25 3:08p PT (ET-1160445, PRE_LOAD, 7 loads)",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD x1 stale) / RUFINO MUNGUIA (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5338695", "TASK-5377435"],
    duration: "LOAD STALE started 8/7/26 4:29p PT, ended 8/10/26 9:27a, never closed · RECEIVE ~21.8h since 9/25 10:06a PT (RN-192747 IN_PROGRESS)",
    anomaly: true, // TASK-5338695 ended 8/10/26 but is still IN_PROGRESS
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied (row updated 9/25 3:41p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: "RUFINO MUNGUIA (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5377454"],
    duration: "RECEIVE NEW · created 9/25 (RN-192748 IMPORTED) - task has no startTime, so no duration basis · dock AVAILABLE, space occupied",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (row updated 9/25 12:38p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (row updated 9/25 8:41p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied (row updated 9/25 3:08p PT) · occupiedCustomerIds ORG-655875 · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 9/26 12:19a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied (row updated 9/24 12:45p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (row updated 9/26 12:20a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space occupied (row updated 9/25 12:38p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 9/26 12:19a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 9/26 12:19a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 9/26 12:18a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5377286"],
    duration: "RECEIVE ~23.3h since 9/25 8:38a PT (RN-5010438 IN_PROGRESS) · dock occupied, space empty",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 9/26 12:18a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 9/26 12:18a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (row updated 9/26 12:17a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 18
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 3
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 6
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 2
const available = doors.filter((d) => d.status === "Available").length; // 2

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

// Reserved doors are surfaced via the DoorGrid legend (DOCK51, DOCK52, DOCK65).
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (Sep 26 2026 ~7:56a PT). 8 active-status tasks at Bay 4 doors: 4 LOAD + 4 RECEIVE.
// DANIEL BELTRAN: 2 LOAD (DOCK53, DOCK51)
// ARNULFO MUNGUIA: 2 LOAD (DOCK50, DOCK54 - DOCK54 one is stale)
// RUFINO MUNGUIA: 2 RECEIVE (DOCK56, DOCK54)
// Jorge Antonio Franco: 1 RECEIVE (DOCK69)
// daira gonzalez: 1 RECEIVE (DOCK50, STALE)
// All assignee names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "DANIEL BELTRAN", taskCount: 2 },
  { name: "ARNULFO MUNGUIA", taskCount: 2 },
  { name: "RUFINO MUNGUIA", taskCount: 2 },
  { name: "Jorge Antonio Franco", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
];

// All-time assignment counts - preserved from prior baseline (Jul 13 2026).
// NOT re-pulled in this refresh (out of scope of the 9/26 request); carried
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

// --- Schedule Data (2026-09-26, Saturday) ---
// % scheduled inbounds received TODAY: NOT COMPUTABLE - 0 GURUNANDA receipts carry
//   appointmentTime = 2026-09-26 (denominator is zero, so the percentage is
//   undefined and must NOT be rendered as 0%). The date filter was verified to
//   work on adjacent days (9/24 = 7, 9/25 = 11, 9/28 = 8 receipts).
// % scheduled outbounds loaded TODAY: NOT COMPUTABLE - 0 GURUNANDA orders carry
//   scheduleDate = 2026-09-26 (the scheduleDatePeriod query returned 0 rows), so
//   the denominator is zero and the percentage is undefined. It must NOT be
//   rendered as 0%. The filter was verified to work on 9/25 (39 orders).
export const scheduleAvailable = false;             // inbound denominator is zero -> not computable
export const outboundScheduleAvailable = false;     // outbound denominator is zero -> not computable
export const scheduledInboundOrders = 0;            // receipts with appointmentTime = 2026-09-26
export const scheduledOutboundOrders = 0;           // orders with scheduleDate = 2026-09-26
export const scheduledInboundReceived = 0;          // no scheduled set -> nothing received
export const scheduledOutboundLoaded = 0;           // no scheduled set -> nothing loaded
export const pctScheduledInboundReceived = 0;       // 0 / 0 = undefined - gated by scheduleAvailable
export const pctScheduledOutboundLoaded = 0;        // 0 / 0 = undefined - gated by outboundScheduleAvailable

// Facility-wide appointment context - unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime where a task exists on the
// door; unavailable for task-less doors (no occupancy-start field in WMS)
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Sep 26 2026 ~7:56a PT)
// 8 tasks total: 4 LOAD + 4 RECEIVE. All GURUNANDA, LLC.
// Two are stale-anomaly tasks (TASK-5338695, TASK-5090739).
export const assignments: TaskRecord[] = [
  // ------ OUTBOUND / LOAD (4) ------
  {
    taskId: "TASK-5376774",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~40.4h since 9/24 3:32p PT (ARNULFO MUNGUIA; ET-1159768, PRE_LOAD, seal A51840, 2 loads)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5377571",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~20.0h since 9/25 11:55a PT (DANIEL BELTRAN; ET-1160320, PRE_LOAD, 3 loads)",
    assignee: "DANIEL BELTRAN",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5377822",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~16.8h since 9/25 3:08p PT (DANIEL BELTRAN; ET-1160445, PRE_LOAD, 7 loads)",
    assignee: "DANIEL BELTRAN",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5338695",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 8/7/26 4:29p PT, ended 8/10/26 9:27a but never closed; ET-1135033, seal 25079976, 1 load)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },

  // ------ INBOUND / RECEIVE (4) ------
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 10/21/25 1:21p PT, ended 10/22/25 10:42a but never closed; RN-5002143 CLOSED)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5377435",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~21.8h since 9/25 10:06a PT (RUFINO MUNGUIA; RN-192747 IN_PROGRESS)",
    assignee: "RUFINO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5377454",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/25 (RUFINO MUNGUIA; RN-192748 IMPORTED; task has no startTime)",
    assignee: "RUFINO MUNGUIA",
    door: "DOCK56",
  },
  {
    taskId: "TASK-5377286",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~23.3h since 9/25 8:38a PT (Jorge Antonio Franco; RN-5010438 IN_PROGRESS)",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
];
