/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * DATA REFRESHED: 2026-10-19 ~3:02p PT (live WISE / WMS-BAM APIs)
 *   Sources:
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors
 *       (fresh dockStatus, spaceStatus, occupiedCustomerIds, updatedTime per door)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide 16; 4 at Bay 4 doors)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide 16; 5 at Bay 4 doors)
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts with
 *       appointmentTimeFrom/To = 2026-10-19 -> 12 scheduled (totalCount 12).
 *       Status split re-checked in the same pull: 12 open (IMPORTED/IN_PROGRESS),
 *       0 CLOSED/FORCE_CLOSED.
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders with
 *       scheduleDateFrom/To = 2026-10-19 -> 98 scheduled (totalCount 98);
 *       25 of them status SHIPPED (totalCount 25).
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders status PLANNED
 *       -> totalCount 160 (live loader fallback value below).
 *   NOTE: /wms-bam/dashboard/dock-door-status/search-by-paging is not used; door
 *   state is read from wms-location/search (dockStatus + spaceStatus), the same
 *   two status fields the dashboard already uses.
 *
 *   Key changes from the prior refresh (10/19 ~11:51a PT -> 10/19 ~3:02p PT):
 *     - Bay 4 GURUNANDA active tasks: 9 (4 LOAD + 5 RECEIVE) on 7 doors
 *       (DOCK50, DOCK52, DOCK54, DOCK61, DOCK62, DOCK65, DOCK69).
 *       Opened since the 11:51a pull: TASK-5398112 (DOCK52 LOAD, IN_PROGRESS,
 *       ARNULFO MUNGUIA, started 3:02p PT), TASK-5397937 (DOCK54 LOAD,
 *       IN_PROGRESS, Norvin Ruiz), TASK-5397988 (DOCK62 RECEIVE,
 *       IN_PROGRESS, Jorge Antonio Franco), TASK-5397874 (DOCK61 RECEIVE,
 *       IN_PROGRESS, Jorge Antonio Franco).
 *       Left the active Bay-4 population since the 11:51a pull (closed/moved):
 *       TASK-5395520 (DOCK52), TASK-5397640 (DOCK55), TASK-5396432 (DOCK55),
 *       TASK-5395968 (DOCK61), TASK-5393820 (DOCK62), TASK-5397781 (DOCK56).
 *     - Task "Guru live out / in assign to Arnulfo" resolves to ARNULFO MUNGUIA
 *       GURUNANDA Bay-4 work: 2 LOAD tasks (DOCK52 TASK-5398112 IN_PROGRESS and
 *       the stale DOCK54 TASK-5338695). No WMS record is literally named
 *       "Guru live out / in assign to Arnulfo", and Arnulfo holds no Bay-4
 *       RECEIVE task at this pull. Arnulfo also holds a non-Bay-4 load task at
 *       DOCK10 (TASK-5397642), which is outside DOCK50-DOCK72 and excluded here.
 *     - Bay 4 doors occupied (rule below): 16/23 - 4 available
 *       (DOCK66, DOCK68, DOCK69, DOCK70), 3 reserved (DOCK51, DOCK57, DOCK58).
 *       Raw dockStatus=OCCUPIED = 13/23; the extra occupied doors are
 *       space-occupied doors whose dockStatus reads AVAILABLE
 *       (DOCK53, DOCK55, DOCK61).
 *     - Stale anomalies STILL OPEN: TASK-5338695 (DOCK54, LOAD started 8/7/26
 *       4:29p PT, ~72.9 days; status still IN_PROGRESS although its endTime is
 *       8/10/26 9:27a PT) and TASK-5090739 (DOCK50, RECEIVE started 10/21/25
 *       1:21p PT, ~362.9 days; status still IN_PROGRESS although its endTime is
 *       10/22/25 10:42a PT).
 *     - Door/task mismatch flagged: DOCK62 (dock occupied, space EMPTY) and
 *       DOCK69 (dock AVAILABLE, space EMPTY) carry active receive tasks while
 *       the location record reports no space occupancy.
 *     - "% scheduled inbounds received" (10/19): 0 of 12 = 0.0%.
 *     - "% scheduled outbounds loaded" (10/19): 25 of 98 = 25.5%.
 *     - Inbound/outbound mix: 5 RECEIVE / 4 LOAD of 9 active Bay-4 tasks.
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
// Last live totalCount was 160 at the 10/19 ~3:02p PT pull.
export const plannedGurunandaOrderCount = 160;

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
// DOOR UTILIZATION - DOCK50-DOCK72 (23 doors), live as of 10/19 ~3:02p PT
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
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space occupied (row updated 10/19 12:12p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5398112"],
    duration: "LOAD ~0.0h since 10/19 3:02p PT (TASK-5398112, ARNULFO MUNGUIA, ET-1171908, 2 loads LOADING) · dock and space occupied (row updated 10/19 3:02p PT)",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied (row updated 10/19 2:57p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "Norvin Ruiz (LOAD) / ARNULFO MUNGUIA (LOAD - STALE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5397937", "TASK-5338695"],
    duration: "LOAD ~2.1h since 10/19 12:56p PT (TASK-5397937, Norvin Ruiz, ET-1171804, 7 loads LOADED) · LOAD STALE started 8/7/26 4:29p PT, ~72.9 days; task status still IN_PROGRESS although its endTime is 8/10/26 9:27a PT (TASK-5338695, ARNULFO MUNGUIA, ET-1135033, 1 load SHIPPED) · dock and space occupied, occupiedCustomerIds ORG-655875 (row updated 10/19 12:56p PT)",
    anomaly: true, // TASK-5338695 started 8/7/26 but is still IN_PROGRESS (~72.9 days)
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied (row updated 10/19 2:59p PT) · no occupancy-start field in WMS",
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (row updated 10/19 12:04p PT) · no occupancy-start field in WMS",
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
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space EMPTY (row updated 10/19 1:07p PT) · no occupancy-start field in WMS",
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
    assignee: "DANIEL BELTRAN (LOAD) / Jorge Antonio Franco (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5397989", "TASK-5397874"],
    duration: "LOAD ~0.3h since 10/19 2:46p PT (TASK-5397989, DANIEL BELTRAN, ET-1171857, 2 loads LOADED) · RECEIVE ~2.7h since 10/19 12:22p PT (TASK-5397874, Jorge Antonio Franco, ET-1171782, RN-5010936 IN_PROGRESS) · dock AVAILABLE, space occupied (row updated 10/19 2:59p PT)",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: "Jorge Antonio Franco (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5397988"],
    duration: "RECEIVE ~1.2h since 10/19 1:52p PT (TASK-5397988, Jorge Antonio Franco, ET-1171855, RN-194239 IN_PROGRESS) · location row reports dock OCCUPIED, space EMPTY (row updated 10/19 1:52p PT)",
    anomaly: true, // active receive task on a door whose location row shows no space occupancy
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
    duration: "RECEIVE ~121.6h (~5.1 days) since 10/14 1:27p PT (TASK-5394671, Jorge Antonio Franco, ET-1169661, RN-5010808 IN_PROGRESS) · dock occupied, space empty (row updated 10/17 12:06a PT)",
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
    duration: "RECEIVE NEW · created 9/30 10:46a PT (TASK-5381972, Jorge Antonio Franco, ET-1162686, RN-5010583 IMPORTED) - task has no startTime, so no duration basis · location row reports dock AVAILABLE, space EMPTY (updated 10/19 2:57p PT)",
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

const occupied = doors.filter((d) => d.status === "Occupied").length;   // 16
const reserved = doors.filter((d) => d.status === "Reserved").length;   // 3
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length; // 7
const anomalyDoors = doors.filter((d) => d.anomaly).length;             // 4
const available = doors.filter((d) => d.status === "Available").length; // 4

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

// 3 doors are RESERVED at this pull (DOCK51, DOCK57, DOCK58); reservedDoorCount
// stays exported for the DoorGrid legend.
export const reservedDoorCount = reserved;

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (Oct 19 2026 ~3:02p PT). 9 active-status tasks at Bay 4 doors: 4 LOAD + 5 RECEIVE.
// ARNULFO MUNGUIA: 2 LOAD (DOCK52 TASK-5398112; DOCK54 stale TASK-5338695)
// Jorge Antonio Franco: 4 RECEIVE (DOCK62, DOCK61, DOCK65, DOCK69)
// Norvin Ruiz: 1 LOAD (DOCK54)
// DANIEL BELTRAN: 1 LOAD (DOCK61)
// daira gonzalez: 1 RECEIVE (DOCK50, STALE)
// All assigned names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "Jorge Antonio Franco", taskCount: 4 },
  { name: "ARNULFO MUNGUIA", taskCount: 2 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "Norvin Ruiz", taskCount: 1 },
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

// Mix: 4 LOAD + 5 RECEIVE = 9 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 5, total: 9 },
  { label: "Outbound (LOAD)", count: 4, total: 9 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 9 },
  { label: "Inbound", count: 5, total: 9 },
];

// --- Schedule Data (2026-10-19, Monday) ---
// % scheduled inbounds received TODAY: 12 GURUNANDA receipts carry
//   appointmentTime = 2026-10-19 (appointmentTimeFrom/To query returned totalCount 12).
//   Status split re-checked in the same pull: 12 IMPORTED/IN_PROGRESS and 0
//   CLOSED/FORCE_CLOSED, and none of the open receipts has a receivedTime
//   (only receivedStartTime), so received = 0 and the metric is 0 of 12 = 0.0%.
// % scheduled outbounds loaded TODAY: 98 GURUNANDA orders carry scheduleDate = 2026-10-19
//   (scheduleDateFrom/To query returned totalCount 98); 25 of them carry status SHIPPED
//   (same date filter + statuses SHIPPED returned totalCount 25), so loaded = 25 of 98
//   = 25.5%.
export const scheduleAvailable = true;              // inbound denominator is 12
export const outboundScheduleAvailable = true;      // outbound denominator is 98
export const scheduledInboundOrders = 12;           // receipts with appointmentTime = 2026-10-19
export const scheduledOutboundOrders = 98;          // orders with scheduleDate = 2026-10-19
export const scheduledInboundReceived = 0;          // none received / CLOSED yet today
export const scheduledOutboundLoaded = 25;          // orders at status SHIPPED today
export const pctScheduledInboundReceived = 0;       // 0 of 12 = 0.0%
export const pctScheduledOutboundLoaded = 25.5;     // 25 of 98 = 25.51% -> 25.5%
// Facility-wide appointment context - unavailable (GURUNANDA-scoped query only;
// no all-customer facility-wide appointment totals were pulled for this refresh).
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime where a task exists on the
// door; unavailable for task-less doors (no occupancy-start field in WMS)
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Oct 19 2026 ~3:02p PT)
// 9 tasks total: 4 LOAD + 5 RECEIVE. All GURUNANDA, LLC.
// Two are stale-anomaly tasks (TASK-5338695 on DOCK54, TASK-5090739 on DOCK50).
export const assignments: TaskRecord[] = [
  // ----- OUTBOUND / LOAD (4) -----
  {
    taskId: "TASK-5398112",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~0.0h since 10/19 3:02p PT (ARNULFO MUNGUIA; ET-1171908, 2 loads LOADING)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5397989",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~0.3h since 10/19 2:46p PT (DANIEL BELTRAN; ET-1171857, 2 loads LOADED)",
    assignee: "DANIEL BELTRAN",
    door: "DOCK61",
  },
  {
    taskId: "TASK-5397937",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~2.1h since 10/19 12:56p PT (Norvin Ruiz; ET-1171804, 7 loads LOADED)",
    assignee: "Norvin Ruiz",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5338695",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 8/7/26 4:29p PT, ~72.9 days; status still IN_PROGRESS although endTime is 8/10/26 9:27a PT; ARNULFO MUNGUIA, ET-1135033, 1 load SHIPPED)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },

  // ----- INBOUND / RECEIVE (5) -----
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE (started 10/21/25 1:21p PT, ~362.9 days; status still IN_PROGRESS although endTime is 10/22/25 10:42a PT; daira gonzalez, ET-1027622, RN-5002143)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5397988",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~1.2h since 10/19 1:52p PT (Jorge Antonio Franco; ET-1171855, RN-194239 IN_PROGRESS)",
    assignee: "Jorge Antonio Franco",
    door: "DOCK62",
  },
  {
    taskId: "TASK-5397874",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~2.7h since 10/19 12:22p PT (Jorge Antonio Franco; ET-1171782, RN-5010936 IN_PROGRESS)",
    assignee: "Jorge Antonio Franco",
    door: "DOCK61",
  },
  {
    taskId: "TASK-5394671",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~121.6h (~5.1 days) since 10/14 1:27p PT (Jorge Antonio Franco; ET-1169661, RN-5010808 IN_PROGRESS)",
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
