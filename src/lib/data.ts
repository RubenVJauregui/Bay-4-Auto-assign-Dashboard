/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-09-19 ~3:58p PT (live WISE / WMS-BAM APIs)
 *   Sources:
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors
 *       (fresh dockStatus, spaceStatus per door)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide 11; 4 at Bay 4 doors)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide 28; 8 at Bay 4 doors)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts,
 *       appointmentTime = 2026-09-19 (6 scheduled; 0 CLOSED -> 0.0%)
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders,
 *       scheduleDate = 2026-09-19 -> 0 rows, so the outbound percentage is
 *       NOT COMPUTABLE and is not reported (see schedule block below)
 *   NOTE: /wms-bam/dashboard/dock-door-status/search-by-paging returned HTTP 500;
 *   door state was read from wms-location/search, the same two status fields the
 *   dashboard already uses.
 *
 *   Key changes from prior refresh (9/19 ~10:33a PT -> 9/19 ~3:58p PT):
 *     - Bay 4 GURUNANDA active tasks: unchanged at 12 (4 LOAD + 8 RECEIVE) on 6 doors
 *       (DOCK50, DOCK54, DOCK55, DOCK57, DOCK60, DOCK62). No task opened/closed
 *       in the window; only ages advanced.
 *     - Arnulfo ("Guru live out / in") holds 4: 3 LOAD (all DOCK54, two stale)
 *       and 1 RECEIVE (DOCK62). Note: no WMS record is literally named
 *       "Guru live out / in assign to Arnulfo"; that phrase describes this
 *       GURUNANDA ("Guru") live load/unload activity for ARNULFO MUNGUIA.
 *     - Bay 4 doors occupied: 20/23 - free: DOCK56, DOCK59, DOCK72.
 *     - Stale anomalies STILL OPEN: TASK-5338695 (DOCK54, ended 8/10),
 *       TASK-5365421 (DOCK54, ended 9/11) and TASK-5090739 (DOCK50, ended
 *       10/22/25) - all IN_PROGRESS past their end time.
 *     - "% scheduled inbounds received" (9/19): 0 CLOSED of 6 scheduled = 0.0%
 *       (was 0 of 2 at the 10:33a pull; the scheduled count grew 2 -> 6).
 *     - "% scheduled outbounds loaded" (9/19): UNDEFINED - 0 orders scheduled.
 *     - Inbound/outbound mix: 8 RECEIVE / 4 LOAD of 12 active Bay-4 tasks.
 *     - Door occupancy duration is available only where a task with a startTime
 *       sits on the door; WMS has no occupancy-start field for task-less doors,
 *       so none is derived for them.
 *
 *   NOTE: the in-yard FULL equipment array and the all-time assignment baseline
 *   below were NOT re-pulled in this refresh (out of scope of the request);
 *   Section 1 renders live from the WMS loader. Carried forward, not estimated.
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
// NOT re-pulled in the 9/19 refresh (out of scope of the request). The array is
// left empty rather than carrying forward the 9/11 result; Section 1 renders live
// from the WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875).
// FALLBACK ONLY - not re-pulled in the 9/19 refresh. Last live totalCount was 209
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


export const doors: DoorRecord[] = [
  // =====================================================================
  // OCCUPIED - doors with active GURUNANDA Bay-4 tasks (6 doors)
  // =====================================================================
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "DANIEL BELTRAN (LOAD) / daira gonzalez (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5372145", "TASK-5090739"],
    duration: "LOAD ~24.9h since 9/18 3:02p PT (ET-1156851, PRE_LOAD, seal A51126, 9 loads all LOADED) · RECEIVE STALE since 10/21/25 1:21p PT (RN-5002143 CLOSED 10/22/25, task never closed)",
    anomaly: true, // TASK-5090739 started 10/21/25; receipt closed 10/22/25 but task never closed
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD x3) / CANDY MENDEZ (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5372101", "TASK-5365421", "TASK-5338695", "TASK-5369031"],
    duration: "LOAD ~25.5h since 9/18 2:29p PT (ET-1156829, PRE_LOAD, seal 24800370, 2 loads LOADED) · 2 STALE LOADs ended 9/11 11:16a and 8/10 9:27a, never closed · RECEIVE ~25.5h since 9/18 2:30p PT (RN-192430 IN_PROGRESS)",
    anomaly: true, // TASK-5365421 (ended 9/11) and TASK-5338695 (ended 8/10) still IN_PROGRESS
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "RUFINO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5371830"],
    duration: "RECEIVE NEW · created 9/18 (RN-192379 IMPORTED) - task has no startTime, so no duration basis · dock AVAILABLE, space occupied (row updated 9/18 8:40p PT)",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5371291", "TASK-5371234"],
    duration: "RECEIVE ~43.8h since 9/17 8:11p PT (RN-5010256 IN_PROGRESS) · RECEIVE ~24.4h since 9/18 3:34p PT (RN-5010282 IN_PROGRESS)",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: "RUFINO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5371932", "TASK-5371839"],
    duration: "RECEIVE ~25.8h since 9/18 2:09p PT (RN-192626 IN_PROGRESS) · RECEIVE NEW · created 9/18 (RN-5010368 IMPORTED, no startTime) · dock AVAILABLE, space occupied (row updated 9/18 7:10p PT)",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5365814"],
    duration: "RECEIVE ~5.1d since 9/14 2:44p PT (RN-5009964 IN_PROGRESS)",
    anomaly: false,
  },

  // =====================================================================
  // OCCUPIED - no active task (14 doors)
  // WMS exposes no occupancy-start field on a dock, so no duration is
  // derived for these; the row's updatedTime (last record change) is shown.
  // =====================================================================
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (row updated 9/19 12:21a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied (row updated 9/18 1:27p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (row updated 9/19 12:20a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (row updated 9/19 12:20a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 9/19 12:20a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 9/19 12:19a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 9/19 12:19a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 9/19 12:19a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 9/19 12:18a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 9/19 12:18a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 9/19 12:18a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 9/19 12:18a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 9/19 12:18a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 9/19 12:17a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },

  // =====================================================================
  // AVAILABLE - dock and space free (3 doors)
  // =====================================================================
  {
    door: "DOCK56",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available",
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
    door: "DOCK72",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length;
const anomalyDoors = doors.filter((d) => d.anomaly).length;
const available = doors.filter((d) => d.status === "Available").length;

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

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (Sep 19 2026 ~3:58p PT). 12 active-status tasks at Bay 4 doors: 4 LOAD + 8 RECEIVE.
// ARNULFO MUNGUIA: 4 (3 LOAD DOCK54 + 1 RECEIVE DOCK62) - 2 of the LOADs are stale
// RUFINO MUNGUIA: 3 (DOCK55 x1, DOCK60 x2)
// DANIELA GONZALEZ: 2 (DOCK57 x2)
// DANIEL BELTRAN: 1 LOAD (DOCK50)
// CANDY MENDEZ: 1 RECEIVE (DOCK54)
// daira gonzalez: 1 RECEIVE (DOCK50, STALE)
// All assignee names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 4 },
  { name: "RUFINO MUNGUIA", taskCount: 3 },
  { name: "DANIELA GONZALEZ", taskCount: 2 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "CANDY MENDEZ", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
];

// All-time assignment counts - preserved from prior baseline (Jul 13 2026).
// NOT re-pulled in this refresh (out of scope of the 9/19 request); carried
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

// Mix: 4 LOAD + 8 RECEIVE = 12 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 8, total: 12 },
  { label: "Outbound (LOAD)", count: 4, total: 12 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 12 },
  { label: "Inbound", count: 8, total: 12 },
];

// --- Schedule Data (2026-09-19, Saturday) ---
// % scheduled inbounds received TODAY: 0 CLOSED of 6 scheduled (appointmentTime = 9/19) = 0.0%
//   (6 scheduled receipts: 5 IMPORTED + 1 OPEN - none CLOSED yet)
// % scheduled outbounds loaded TODAY: NOT COMPUTABLE - 0 GURUNANDA orders carry
//   scheduleDate = 2026-09-19 (the query returned 0 rows), so the denominator is
//   zero and the percentage is undefined. It must NOT be rendered as 0%.
//   The prior refresh (9/11) read 22 SHIPPED of 68 scheduled = 32.4%; that figure
//   is NOT carried forward, because it does not describe today.
export const scheduleAvailable = true;              // inbound schedule data available
export const outboundScheduleAvailable = false;     // 0 orders scheduled today -> percentage undefined
export const scheduledInboundOrders = 6;            // receipts with appointmentTime = 2026-09-19
export const scheduledOutboundOrders = 0;           // orders with scheduleDate = 2026-09-19
export const scheduledInboundReceived = 0;          // CLOSED/FORCE_CLOSED among scheduled set
export const scheduledOutboundLoaded = 0;           // SHIPPED among scheduled set
export const pctScheduledInboundReceived = 0;       // 0 / 6 = 0.0%
export const pctScheduledOutboundLoaded = 0;        // 0 / 0 = undefined - gated by outboundScheduleAvailable

// Facility-wide appointment context - unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime where a task exists on the
// door (9 doors); unavailable for task-less doors (no occupancy-start field in WMS)
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Sep 19 2026 ~3:58p PT)
// 12 tasks total: 4 LOAD + 8 RECEIVE. All GURUNANDA, LLC.
// Three are stale-anomaly tasks (TASK-5338695, TASK-5365421, TASK-5090739).
export const assignments: TaskRecord[] = [
  // ------ OUTBOUND / LOAD (4) ------
  {
    taskId: "TASK-5372145",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~24.9h since 9/18 3:02p PT (DANIEL BELTRAN; ET-1156851, PRE_LOAD, seal A51126, 9 loads all LOADED)",
    assignee: "DANIEL BELTRAN",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5372101",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~25.5h since 9/18 2:29p PT (ET-1156829, PRE_LOAD, seal 24800370, 2 loads LOADED)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5365421",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE ~8.3d (started 9/11 9:32a PT, ended 9/11 11:16a but never closed; seal 50663, 3 loads SHIPPED)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5338695",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE ~43.0d (started 8/7 4:29p PT, ended 8/10 9:27a but never closed; seal 25079976, 1 load SHIPPED - LOAD-5035487)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },

  // ------ INBOUND / RECEIVE (8) ------
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE ~10.9mo (started 10/21/25 1:21p PT, ended 10/22/25 10:42a but never closed; RN-5002143 CLOSED)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5369031",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~25.5h since 9/18 2:30p PT (RN-192430 IN_PROGRESS)",
    assignee: "CANDY MENDEZ",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5371830",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/18 (RN-192379 IMPORTED; task has no startTime)",
    assignee: "RUFINO MUNGUIA",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5371291",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~43.8h since 9/17 8:11p PT (RN-5010256 IN_PROGRESS)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK57",
  },
  {
    taskId: "TASK-5371234",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~24.4h since 9/18 3:34p PT (RN-5010282 IN_PROGRESS)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK57",
  },
  {
    taskId: "TASK-5371932",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/18 (RN-5010368 IMPORTED; task has no startTime)",
    assignee: "RUFINO MUNGUIA",
    door: "DOCK60",
  },
  {
    taskId: "TASK-5371839",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~25.8h since 9/18 2:09p PT (RN-192626 IN_PROGRESS)",
    assignee: "RUFINO MUNGUIA",
    door: "DOCK60",
  },
  {
    taskId: "TASK-5365814",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~5.1d since 9/14 2:44p PT (RN-5009964 IN_PROGRESS)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK62",
  },
];
