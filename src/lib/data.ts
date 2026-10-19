/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-10-19 ~11:51a PT (live WISE / WMS-BAM APIs)
 *   Sources:
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors
 *       (fresh dockStatus, spaceStatus, occupiedCustomerIds, updatedTime per door)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide 15; 4 at Bay 4 doors)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide 16; 6 at Bay 4 doors)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To = 2026-10-19 -> 9 scheduled (totalCount 9).
 *       Filter sanity-checked: the same query for 2026-10-16 returns totalCount 7,
 *       so the date filter is applied rather than ignored.
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDateFrom/To = 2026-10-19 -> 86 scheduled (totalCount 86).
 *       Filter sanity-checked: the same query for 2026-10-16 returns totalCount 110.
 *   NOTE: /wms-bam/dashboard/dock-door-status/search-by-paging is not used; door
 *   state is read from wms-location/search (dockStatus + spaceStatus), the same
 *   two status fields the dashboard already uses.
 *
 *   Key changes from the prior refresh (10/18 ~12:49p PT -> 10/19 ~11:51a PT):
 *     - Bay 4 GURUNANDA active tasks: 10 (4 LOAD + 6 RECEIVE) on 9 doors
 *       (DOCK50, DOCK52, DOCK54, DOCK55, DOCK56, DOCK61, DOCK62, DOCK65, DOCK69).
 *       Opened since the 10/18 pull: TASK-5397781 (DOCK56 LOAD, NEW, DANIEL BELTRAN)
 *       and TASK-5397640 (DOCK55 LOAD, IN_PROGRESS, DANIEL BELTRAN).
 *       Left the active Bay-4 population since the 10/18 pull (now closed or moved):
 *       TASK-5396564 (DOCK52), TASK-5396650 (DOCK54), TASK-5394996 (DOCK57).
 *     - Task "Guru live out / in assign to Arnulfo" resolves to ARNULFO MUNGUIA
 *       GURUNANDA Bay-4 work: 2 LOAD tasks (DOCK52 TASK-5395520 and the stale
 *       DOCK54 TASK-5338695). No WMS record is literally named "Guru live out / in
 *       assign to Arnulfo", and Arnulfo holds no Bay-4 RECEIVE task at this pull.
 *     - Bay 4 doors occupied: 15/23 (rule below) - 6 available
 *       (DOCK58, DOCK62, DOCK66, DOCK68, DOCK69, DOCK70), 2 reserved
 *       (DOCK54, DOCK57 - both now read dockStatus RESERVED).
 *       Raw dockStatus=OCCUPIED = 10/23; the extra 5 occupied doors are
 *       space-occupied doors whose dockStatus reads AVAILABLE
 *       (DOCK51, DOCK52, DOCK55, DOCK61 - plus DOCK54/DOCK57 counted as reserved).
 *     - Stale anomalies STILL OPEN: TASK-5338695 (DOCK54, LOAD started 8/7/26
 *       4:29p PT, ~72.8 days; status still IN_PROGRESS although its endTime is
 *       8/10/26 9:27a PT) and TASK-5090739 (DOCK50, RECEIVE started 10/21/25
 *       1:21p PT, ~362.9 days; status still IN_PROGRESS although its endTime is
 *       10/22/25 10:42a PT).
 *     - Door/task mismatch flagged: DOCK62 and DOCK69 carry active receive tasks
 *       while the location record reports dock AVAILABLE + space EMPTY.
 *     - "% scheduled inbounds received" (10/19): 0 of 9 = 0.0% - 9 GURUNANDA
 *       receipts carry appointmentTime = 2026-10-19 and none of them has a
 *       receivedTime or a CLOSED status yet.
 *     - "% scheduled outbounds loaded" (10/19): 22 of 86 = 25.6% - 22 GURUNANDA
 *       orders with scheduleDate = 2026-10-19 carry status SHIPPED.
 *     - Inbound/outbound mix: 6 RECEIVE / 4 LOAD of 10 active Bay-4 tasks.
 *     - Door occupancy duration is available only where a task with a startTime
 *       sits on the door; WMS has no occupancy-start field for task-less doors,
 *       so none is derived for them.
 *
 *   NOTE: the in-yard FULL equipment array was NOT re-pulled in this refresh
 *   (out of scope of the request); Section 1 renders live from the WMS loader, so
 *   the dashboard still shows current data.
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
// NOT re-pulled in the 10/19 refresh (out of scope of the request). The array is
// left empty rather than carrying a stale result; Section 1 renders live from the
// WMS loader, so the dashboard still shows current data.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875).
// FALLBACK ONLY - the dashboard shows the live loader count when it succeeds.
// Last live totalCount was 157 at the 10/19 ~11:51a PT pull.
export const plannedGurunandaOrderCount = 157;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 10/19 ~11:51a PT
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
    assignee: "daira gonzalez (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5090739"],
    duration: "RECEIVE STALE started 10/21/25 1:21p PT, ~362.9 days; task status still IN_PROGRESS although its endTime is 10/22/25 10:42a PT (TASK-5090739, ET-1027622, RN-5002143 CLOSED) · dock and space occupied, occupiedCustomerIds ORG-655875 (row updated 10/17 12:08a PT)",
    anomaly: true, // TASK-5090739 started 10/21/25 and is still IN_PROGRESS
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied (row updated 10/19 11:06a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5395520"],
    duration: "LOAD ~95.4h since 10/15 12:27p PT (TASK-5395520, ARNULFO MUNGUIA, ET-1170320, 4 loads) · dock AVAILABLE, space occupied (row updated 10/19 10:08a PT)",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (row updated 10/19 11:33a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Reserved",
    assignee: "ARNULFO MUNGUIA (LOAD - STALE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5338695"],
    duration: "LOAD STALE started 8/7/26 4:29p PT, ~72.8 days; task status still IN_PROGRESS although its endTime is 8/10/26 9:27a PT (TASK-5338695, ET-1135033, 1 load) · dock RESERVED, space occupied, occupiedCustomerIds ORG-655875 (row updated 10/19 10:57a PT)",
    anomaly: true, // TASK-5338695 started 8/7/26 but is still IN_PROGRESS (~72.8 days)
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "DANIEL BELTRAN (LOAD) / JEROME ARANDA (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5397640", "TASK-5396432"],
    duration: "LOAD ~1.7h since 10/19 10:07a PT (TASK-5397640, DANIEL BELTRAN, ET-1171632, 1 load, LOAD-5041762 LOADING) · RECEIVE ~71.6h since 10/16 12:16p PT (TASK-5396432, JEROME ARANDA, ET-1171001, RN-194171 IN_PROGRESS) · dock AVAILABLE, space occupied (row updated 10/19 11:38a PT)",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: "DANIEL BELTRAN (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5397781"],
    duration: "LOAD NEW · created 10/19 11:02a PT (TASK-5397781, DANIEL BELTRAN, ET-1171713, 2 loads) - task has no startTime, so no duration basis · dock and space occupied (row updated 10/19 11:05a PT)",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space occupied (row updated 10/19 11:03a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available (row updated 10/19 11:05a PT)",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/19 4:41a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "No active task · dock and space occupied (row updated 10/17 7:43p PT) · occupiedCustomerIds ORG-655875 · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5395968"],
    duration: "RECEIVE ~67.9h since 10/16 3:58p PT (TASK-5395968, DANIELA GONZALEZ, ET-1170596, RN-5010938 IN_PROGRESS) · dock AVAILABLE, space occupied (row updated 10/19 4:20a PT)",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Available",
    assignee: "JORGE ARMANDO DUENAS (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5393820"],
    duration: "RECEIVE ~139.8h since 10/13 4:01p PT (TASK-5393820, JORGE ARMANDO DUENAS, ET-1169016, RN-5010896 OPEN) · location row reports dock AVAILABLE, space EMPTY (updated 10/16 5:08p PT)",
    anomaly: true, // active receive task on a door whose location row is free
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/19 4:20a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/17 12:07a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5394671"],
    duration: "RECEIVE ~118.4h since 10/14 1:27p PT (TASK-5394671, Jorge Antonio Franco, ET-1169661, RN-5010808 IN_PROGRESS) · dock occupied, space empty (row updated 10/17 12:06a PT)",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available (row updated 10/16 10:57p PT)",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/19 4:19a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available (row updated 10/17 12:13a PT)",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Available",
    assignee: "Jorge Antonio Franco (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5381972"],
    duration: "RECEIVE NEW · created 9/30 10:46a PT (TASK-5381972, Jorge Antonio Franco, ET-1162686, RN-5010583 IMPORTED) - task has no startTime, so no duration basis · location row reports dock AVAILABLE, space EMPTY (updated 10/19 4:16a PT)",
    anomaly: true, // active receive task on a door whose location row is free
  },
  {
    door: "DOCK70",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available (row updated 10/16 8:54a PT)",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/17 12:05a PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (row updated 10/15 8:57p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 15
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 2
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 9
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 4
const available = doors.filter((d) => d.status === "Available").length; // 6

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

// 2 doors are RESERVED at this pull (DOCK54, DOCK57); reservedDoorCount stays
// exported for the DoorGrid legend.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (Oct 19 2026 ~11:51a PT). 10 active-status tasks at Bay 4 doors: 4 LOAD + 6 RECEIVE.
// ARNULFO MUNGUIA: 2 LOAD (DOCK52 TASK-5395520; DOCK54 stale TASK-5338695)
// DANIEL BELTRAN: 2 LOAD (DOCK56 TASK-5397781 NEW; DOCK55 TASK-5397640)
// Jorge Antonio Franco: 2 RECEIVE (DOCK65, DOCK69)
// DANIELA GONZALEZ: 1 RECEIVE (DOCK61)
// JEROME ARANDA: 1 RECEIVE (DOCK55)
// JORGE ARMANDO DUENAS: 1 RECEIVE (DOCK62)
// daira gonzalez: 1 RECEIVE (DOCK50, STALE)
// All assigned names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 2 },
  { name: "DANIEL BELTRAN", taskCount: 2 },
  { name: "Jorge Antonio Franco", taskCount: 2 },
  { name: "DANIELA GONZALEZ", taskCount: 1 },
  { name: "JEROME ARANDA", taskCount: 1 },
  { name: "JORGE ARMANDO DUENAS", taskCount: 1 },
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

// Mix: 4 LOAD + 6 RECEIVE = 10 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 6, total: 10 },
  { label: "Outbound (LOAD)", count: 4, total: 10 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 10 },
  { label: "Inbound", count: 6, total: 10 },
];

// --- Schedule Data (2026-10-19, Monday) ---
// % scheduled inbounds received TODAY: 9 GURUNANDA receipts carry
//   appointmentTime = 2026-10-19 (appointmentTimeFrom/To query returned totalCount 9).
//   0 of them has a receivedTime and none is CLOSED (8 IMPORTED + 1 IN_PROGRESS with a
//   receivedStartTime only), so received = 0 and the metric is 0 of 9 = 0.0%.
//   Filter sanity-checked: the same query for 10/16 returns totalCount 7, confirming the
//   date filter is applied.
// % scheduled outbounds loaded TODAY: 86 GURUNANDA orders carry scheduleDate = 2026-10-19
//   (scheduleDateFrom/To query returned totalCount 86); 22 of them carry status SHIPPED,
//   so loaded = 22 of 86 = 25.6%. The same query for 10/16 returns totalCount 110,
//   confirming the filter is applied.
export const scheduleAvailable = true;              // inbound denominator is 9
export const outboundScheduleAvailable = true;      // outbound denominator is 86
export const scheduledInboundOrders = 9;            // receipts with appointmentTime = 2026-10-19
export const scheduledOutboundOrders = 86;          // orders with scheduleDate = 2026-10-19
export const scheduledInboundReceived = 0;          // none received / CLOSED yet today
export const scheduledOutboundLoaded = 22;          // orders at status SHIPPED today
export const pctScheduledInboundReceived = 0;       // 0 of 9 = 0.0%
export const pctScheduledOutboundLoaded = 25.6;     // 22 of 86 = 25.58% -> 25.6%
// Facility-wide appointment context - unavailable (GURUNANDA-scoped query only;
// no all-customer facility-wide appointment totals were pulled for this refresh).
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime where a task exists on the
// door; unavailable for task-less doors (no occupancy-start field in WMS)
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Oct 19 2026 ~11:51a PT)
// 10 tasks total: 4 LOAD + 6 RECEIVE. All GURUNANDA, LLC.
// Two are stale-anomaly tasks (TASK-5338695 on DOCK54, TASK-5090739 on DOCK50).
export const assignments: TaskRecord[] = [
  // ----- OUTBOUND / LOAD (4) -----
  {
    taskId: "TASK-5395520",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~95.4h since 10/15 12:27p PT (ARNULFO MUNGUIA; ET-1170320, 4 loads)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5397640",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~1.7h since 10/19 10:07a PT (DANIEL BELTRAN; ET-1171632, 1 load, LOAD-5041762 LOADING)",
    assignee: "DANIEL BELTRAN",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5397781",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 10/19 11:02a PT (DANIEL BELTRAN; ET-1171713, 2 loads) - task has no startTime",
    assignee: "DANIEL BELTRAN",
    door: "DOCK56",
  },
  {
    taskId: "TASK-5338695",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 8/7/26 4:29p PT, ~72.8 days; status still IN_PROGRESS although endTime is 8/10/26 9:27a PT; ARNULFO MUNGUIA, ET-1135033, 1 load)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },

  // ----- INBOUND / RECEIVE (6) -----
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 10/21/25 1:21p PT, ~362.9 days; status still IN_PROGRESS although endTime is 10/22/25 10:42a PT; daira gonzalez, ET-1027622, RN-5002143)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5396432",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~71.6h since 10/16 12:16p PT (JEROME ARANDA; ET-1171001, RN-194171 IN_PROGRESS)",
    assignee: "JEROME ARANDA",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5395968",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~67.9h since 10/16 3:58p PT (DANIELA GONZALEZ; ET-1170596, RN-5010938 IN_PROGRESS)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK61",
  },
  {
    taskId: "TASK-5393820",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~139.8h since 10/13 4:01p PT (JORGE ARMANDO DUENAS; ET-1169016, RN-5010896 OPEN)",
    assignee: "JORGE ARMANDO DUENAS",
    door: "DOCK62",
  },
  {
    taskId: "TASK-5394671",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~118.4h since 10/14 1:27p PT (Jorge Antonio Franco; ET-1169661, RN-5010808 IN_PROGRESS)",
    assignee: "Jorge Antonio Franco",
    door: "DOCK65",
  },
  {
    taskId: "TASK-5381972",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · created 9/30 10:46a PT (Jorge Antonio Franco; ET-1162686, RN-5010583 IMPORTED) - task has no startTime",
    assignee: "Jorge Antonio Franco",
    door: "DOCK69",
  },
];