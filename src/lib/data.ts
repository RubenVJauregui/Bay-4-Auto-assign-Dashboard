/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed 2026-09-05 ~8:42a PT (live WMS APIs)
 *   Sources:
 *     - /wms-bam/wms-location/search — exactlyNames for all 23 doors
 *       (fresh dockStatus, spaceStatus, occupiedCustomerIds per door)
 *     - /wms-bam/outbound/load-task/search-by-paging — NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide; 6 at Bay 4 doors)
 *     - /wms-bam/inbound/receive-task/search-by-paging — NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide; 2 at Bay 4 doors)
 *     - /wms-bam/yard/equipment/search — FULL TRAILERS for GURUNANDA only
 *     - /wms-bam/outbound/order/search-by-paging — GURUNANDA orders,
 *       scheduleDate = 2026-09-05 (0 scheduled — Saturday, no outbound dock schedule)
 *     - /wms-bam/inbound/receipt/search-by-paging — GURUNANDA receipts,
 *       appointmentTime = 2026-09-05 (1 scheduled: RN-5010097 IMPORTED 02:00a PT)
 *
 *   Key changes from prior refresh (9/4 ~2:31p PT → 9/5 ~8:42a PT):
 *     - Active Bay 4 GURUNANDA tasks: 11 → 8 (6 LOAD + 2 RECEIVE) on 5 doors
 *       (DOCK50, DOCK51, DOCK53, DOCK54, DOCK67). DOCK57/58/60/63 LOAD & RECEIVE
 *       tasks from 9/4 closed overnight (their loaded trailers now staged in yard).
 *     - Bay 4 doors occupied: 19/23 → 23/23. DOCK62/65/67/68 (the four previously
 *       available doors) all now report dock or space occupancy (updated ~00:10-00:14 PT).
 *       No door is fully free (dock AVAILABLE + space EMPTY) at this pull.
 *     - "Guru live out": 5 GURUNANDA LOAD tasks on ARNULFO MUNGUIA
 *       (DOCK50 TASK-5360206 since 9/3 3:58p PT; DOCK51 TASK-5359541 since 9/3 10:28a PT;
 *        DOCK53 TASK-5361270 since 9/4 4:18p PT — NEW since last refresh, trlr 53400CT;
 *        DOCK54 TASK-5360934 since 9/4 1:17p PT; DOCK54 TASK-5338695 STALE — load SHIPPED 8/10)
 *     - "Guru live in": NO active RECEIVE task for Arnulfo at Bay 4. Bay-4 receives are
 *       RUFINO MUNGUIA (DOCK53 NEW — RN-191921 ctn 53722, queued, container not at dock),
 *       daira gonzalez (DOCK50 STALE ~10.5 months).
 *     - Closed since 9/4 2:31p: LOAD TASK-5361104 (DOCK57), TASK-5361093 (DOCK58),
 *       TASK-5361043 (DOCK60); RECEIVE TASK-5360958 (DOCK63). Their trailers 715569,
 *       155477 etc. are FULL_AFTER_LOADED in the yard (Section 1).
 *     - In-yard FULL GURUNANDA trailers: 2 → 13 (loaded outbound trailers staged
 *       overnight awaiting dispatch; TRAILER-only display, containers excluded).
 *     - Planned GURUNANDA orders: all-time PLANNED 152; scheduleDate 9/5 PLANNED 0.
 *     - % scheduled outbounds loaded (9/5): none scheduled (scheduleDate 9/5 = 0 orders).
 *     - % scheduled inbounds received (9/5): 0 CLOSED of 1 scheduled (RN-5010097) = 0.0%.
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
// Fresh from /wms-bam/yard/equipment/search (Sep 5 2026 ~8:42a PT).
// Filtered to equipmentType=TRAILER, equipmentStatus=FULL, customer ORG-655875.
// RESULT: 13 FULL GURUNANDA trailers (all FULL_AFTER_LOADED — loaded outbound
// trailers staged in yard awaiting dispatch, many from 9/4 evening close-outs).
// Containers excluded (TRAILER-only display). LE0986's EMPTY inbound row
// (ET-1149038) is excluded; only its FULL loaded row is listed.
export const inYardFullEquipment: InYardEquipmentRecord[] = [
  {
    equipmentNo: "488598",
    entryTicket: "ET-1149209",
    checkInPdt: "09/04/2026, 02:56 PM",
    timeInYard: "0 Days 17 Hours 46 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "715569",
    entryTicket: "ET-1149152",
    checkInPdt: "09/04/2026, 02:01 PM",
    timeInYard: "0 Days 18 Hours 41 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "155477",
    entryTicket: "ET-1149128",
    checkInPdt: "09/04/2026, 01:32 PM",
    timeInYard: "0 Days 19 Hours 11 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "LE0986",
    entryTicket: "ET-1149072",
    checkInPdt: "09/04/2026, 12:35 PM",
    timeInYard: "0 Days 20 Hours 7 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "2504",
    entryTicket: "ET-1149057",
    checkInPdt: "09/04/2026, 12:23 PM",
    timeInYard: "0 Days 20 Hours 19 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "5380",
    entryTicket: "ET-1149041",
    checkInPdt: "09/04/2026, 12:03 PM",
    timeInYard: "0 Days 20 Hours 39 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "U5376",
    entryTicket: "ET-1149040",
    checkInPdt: "09/04/2026, 12:02 PM",
    timeInYard: "0 Days 20 Hours 41 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "5381",
    entryTicket: "ET-1148982",
    checkInPdt: "09/04/2026, 11:07 AM",
    timeInYard: "0 Days 21 Hours 36 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "W84599",
    entryTicket: "ET-1148952",
    checkInPdt: "09/04/2026, 10:33 AM",
    timeInYard: "0 Days 22 Hours 10 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "175068",
    entryTicket: "ET-1148904",
    checkInPdt: "09/04/2026, 09:57 AM",
    timeInYard: "0 Days 22 Hours 45 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "166167",
    entryTicket: "ET-1148898",
    checkInPdt: "09/04/2026, 09:48 AM",
    timeInYard: "0 Days 22 Hours 55 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "6523",
    entryTicket: "ET-1148862",
    checkInPdt: "09/04/2026, 09:21 AM",
    timeInYard: "0 Days 23 Hours 22 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "516579",
    entryTicket: "ET-1148852",
    checkInPdt: "09/04/2026, 09:10 AM",
    timeInYard: "0 Days 23 Hours 32 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875).
// All-time PLANNED: 152 (live totalCount at 9/5 ~8:42a PT). Today's (2026-09-05)
// scheduleDate PLANNED: 0 (Saturday — no outbound orders scheduled on 9/5).
// Fallback value used when the live loader is unavailable.
export const plannedGurunandaOrderCount = 0;

// ─── Graza Dispatch Types (preserved for GrazaDispatchSummary component) ───
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
  // ═══════════════════════════════════════════════════════════════
  // OCCUPIED — doors with active GURUNANDA Bay-4 tasks (5 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA / daira gonzalez",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5360206", "TASK-5090739"],
    duration: "LOAD ~40.7h since 9/3 3:58p PT · RECEIVE STALE ~10.5mo",
    anomaly: true, // TASK-5090739 (RECEIVE) started Oct 21 2025 — RN-5002143 closed 10/22/25, task never closed
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5359541"],
    duration: "~46.2h since 9/3 10:28a PT (load LOADED, task open)",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD) / RUFINO MUNGUIA (RECEIVE queued)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5361270", "TASK-5360939"],
    duration: "LOAD ~16.4h since 9/4 4:18p PT (trlr 53400CT) · RECEIVE RN-191921 ctn 53722 queued, not at dock",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5360934", "TASK-5338695"],
    duration: "LOAD ~19.4h since 9/4 1:17p PT · TASK-5338695 STALE ~26d (load SHIPPED 8/10)",
    anomaly: true, // TASK-5338695 ended Aug 10 (load SHIPPED) but status never closed
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: "JEROME ARANDA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5359531"],
    duration: "LOAD NEW (appt 9/8 9:00a) · truck not on dock; dock holds other equipment",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // OCCUPIED — dock free + space occupied, no active task (8 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, space occupied",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, loaded trailer 715569 staged at space (ET-1149152)",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, space occupied",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "No active task · dock free, space occupied (GURUNANDA staging)",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, space occupied (was Available 9/4 2:31p PT)",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, space occupied (RECEIVE TASK-5360958 closed 9/4)",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, space occupied",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, space occupied (space staging)",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // OCCUPIED — dock occupied (space empty or occupied), no active task (10 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (devan ET-1149038 9/4; space staging)",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (was Available 9/4 2:31p PT)",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (was Available 9/4 2:31p PT)",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty",
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
// (Sep 5 2026 ~8:42a PT). 8 active-status tasks at Bay 4 doors: 6 LOAD + 2 RECEIVE.
// ARNULFO MUNGUIA: 5 LOAD (DOCK50, DOCK51, DOCK53, DOCK54 x2 — incl. stale TASK-5338695)
// JEROME ARANDA: 1 LOAD (DOCK67 NEW, appt 9/8 — truck not on dock)
// RUFINO MUNGUIA: 1 RECEIVE (DOCK53 NEW, queued — RN-191921 ctn 53722)
// daira gonzalez: 1 RECEIVE (DOCK50, STALE ~10.5mo)
// All assignee names resolved from WMS task payloads (assigneeUserName); no Assignee-<id> labels remain.
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 5 },
  { name: "JEROME ARANDA", taskCount: 1 },
  { name: "RUFINO MUNGUIA", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
];

// All-time assignment counts — preserved from prior baseline (Jul 13 2026)
export const allTimeAssigneeSummaries: AssigneeSummary[] = [
  { name: "Arnulfo Munguia (89)", taskCount: 110 },
  { name: "Daniel Beltran", taskCount: 90 },
  { name: "Caren Cubides", taskCount: 3 },
  { name: "Daniela Gonzalez", taskCount: 1 },
  { name: "Fatima Ponce", taskCount: 1 },
  { name: "Nanci Viviana Rosas", taskCount: 1 },
  { name: "Rufino Munguia", taskCount: 1 },
];

// Mix: 6 LOAD + 2 RECEIVE = 8 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 2, total: 8 },
  { label: "Outbound (LOAD)", count: 6, total: 8 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 6, total: 8 },
  { label: "Inbound", count: 2, total: 8 },
];

// ─── Schedule Data (2026-09-05, Saturday) ───
// % scheduled inbounds received TODAY: 0 CLOSED of 1 scheduled (appointmentTime = 9/5) = 0.0%
//   (1 scheduled: RN-5010097 IMPORTED appt 02:00a PT — not yet received)
// % scheduled outbounds loaded TODAY: 0 SHIPPED of 0 scheduled (scheduleDate = 9/5) = no
//   outbound orders scheduled for Saturday 9/5
// All-time PLANNED (GURUNANDA): 152
export const scheduleAvailable = true;
export const scheduledInboundOrders = 1;      // receipts with appointmentTime = 2026-09-05
export const scheduledOutboundOrders = 0;     // orders with scheduleDate = 2026-09-05
export const scheduledInboundReceived = 0;    // CLOSED/FORCE_CLOSED among scheduled set
export const scheduledOutboundLoaded = 0;     // SHIPPED among scheduled set
export const pctScheduledInboundReceived = 0; // 0 / 1 = 0.0%
export const pctScheduledOutboundLoaded = 0;  // 0 scheduled / 0 loaded — none scheduled 9/5

// Facility-wide appointment context — unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime and space updatedTime
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Sep 5 2026 ~8:42a PT)
// 8 tasks total: 6 LOAD + 2 RECEIVE
// All GURUNANDA, LLC. Two are stale-anomaly tasks (TASK-5338695, TASK-5090739).
export const assignments: TaskRecord[] = [
  // ────── OUTBOUND / LOAD (6) ──────
  {
    taskId: "TASK-5360206",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~40.7h since 9/3 3:58p PT",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5359541",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~46.2h since 9/3 10:28a PT (load LOADED, task open)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5361270",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~16.4h since 9/4 4:18p PT (trlr 53400CT, 5 loads)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5360934",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~19.4h since 9/4 1:17p PT (8 loads)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5338695",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE ~26d (load SHIPPED 8/10)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5359531",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · appt 9/8 9:00a · truck not on dock",
    assignee: "JEROME ARANDA",
    door: "DOCK67",
  },

  // ────── INBOUND / RECEIVE (2) ──────
  {
    taskId: "TASK-5360939",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW since 9/4 12:34p PT · RN-191921, ctn 53722 (queued)",
    assignee: "RUFINO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~10.5mo · STALE",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
];
