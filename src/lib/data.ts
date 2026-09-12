/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * TASK DATA: Refreshed 2026-09-11 ~5:20p PT (live WMS APIs)
 *   Sources:
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors
 *       (fresh dockStatus, spaceStatus, occupiedCustomerIds per door)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide 11; 4 at Bay 4 doors)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide 18; 9 at Bay 4 doors)
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders,
 *       scheduleDate = 2026-09-11 (68 scheduled; 22 SHIPPED -> 32.4%);
 *       all-time PLANNED totalCount 209
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts,
 *       appointmentTime = 2026-09-11 (21 scheduled; 0 CLOSED -> 0.0%)
 *
 *   Key changes from prior refresh (9/5 ~3:57p PT -> 9/11 ~5:20p PT):
 *     - Bay 4 GURUNANDA active tasks: 13 (4 LOAD + 9 RECEIVE) on 8 doors
 *       (DOCK50, DOCK51, DOCK53, DOCK54, DOCK55, DOCK62, DOCK68, DOCK72).
 *     - Arnulfo ("Guru live out") holds 3 LOAD tasks (DOCK51 TASK-5365623,
 *       DOCK53 TASK-5365768, DOCK54 TASK-5338695 - stale). NO active RECEIVE
 *       task ("Guru live in") for Arnulfo at Bay 4.
 *     - Bay 4 doors occupied: 22/23 - only DOCK56 is free. DOCK52 dock is
 *       RESERVED (space occupied) and DOCK57 dock is AVAILABLE (space occupied);
 *       both still count as occupied because the space is occupied.
 *     - Stale anomalies STILL OPEN: TASK-5338695 (DOCK54, load SHIPPED 8/10)
 *       and TASK-5090739 (DOCK50, receipt closed 10/22/25).
 *     - "% scheduled inbounds received" (9/11): 0 CLOSED of 21 scheduled = 0.0%.
 *     - "% scheduled outbounds loaded" (9/11): 22 SHIPPED of 68 scheduled = 32.4%.
 *     - Inbound/outbound mix: 9 RECEIVE / 4 LOAD of 13 active Bay-4 tasks.
 *
 *   NOTE: the in-yard FULL equipment array below was NOT re-pulled in this
 *   refresh (out of scope); Section 1 renders live from the WMS loader.
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
// Fresh from /wms-bam/yard/equipment/search (Sep 11 2026 ~5:00p PT), statuses ["FULL"].
// RESULT: the endpoint returned 10 equipment rows, of which 0 carry
// customerId/customerName = ORG-655875 / GURUNANDA, LLC. So there are ZERO
// in-yard FULL GURUNANDA trailers in the current live result.
// The rows returned belong to other carriers/customers (JUNCTION VENTURES LLC,
// NILO BRANDS, OLD DOMINION, CUBAS) and were staged 9/11 16:26–16:40 PT.
// No value is inferred or carried over from the 9/5 pull.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875).
// All-time PLANNED: 209 (live totalCount at 9/11 ~5:20p PT).
// Orders with scheduleDate = 2026-09-11: 68 scheduled, 22 SHIPPED (32.4%).
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
  // OCCUPIED - doors with active GURUNANDA Bay-4 tasks (8 doors)
  // =====================================================================
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "daira gonzalez",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5090739"],
    duration: "RECEIVE STALE ~10.6mo open (RN-5002143 closed 10/22/25, task never closed) · door row updated 9/10 9:04p PT",
    anomaly: true, // TASK-5090739 started 10/21/25; receipt closed 10/22/25 but task never closed
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA / EDUARDO MEJIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5365623", "TASK-5366005"],
    duration: "LOAD ~4.0h since 9/11 1:19p PT (ARNULFO, trlr 53380, 4 LOADED + 1 LOADING) · LOAD NEW since 9/11 3:41p PT (EDUARDO MEJIA, trlr 53122RL) · door row updated 9/11 3:42p PT",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD) / CANDY MENDEZ (RECEIVE)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5365768", "TASK-5365522"],
    duration: "LOAD ~3.4h since 9/11 1:58p PT (ARNULFO, trlr 53166, 6 loads LOADED) · RECEIVE ~1.9h since 9/11 3:23p PT (CANDY MENDEZ, RN-5010087/88/89) · door row updated 9/11 4:44p PT",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5338695"],
    duration: "LOAD STALE ~34d open (task started 8/7 4:29p PT, load SHIPPED 8/10, task never closed) · door row updated 9/11 2:44p PT",
    anomaly: true, // TASK-5338695 load ended Aug 10 (SHIPPED) but task status never closed
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "JEROME ARANDA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5365675", "TASK-5365676"],
    duration: "RECEIVE ~4.2h since 9/11 1:08p PT (RN-5010237, trlr 5156) · RECEIVE NEW since 9/11 12:40p PT · door row updated 9/11 1:08p PT",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ / RUFINO MUNGUIA / JORGE ANTONIO FRANCO",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5366054", "TASK-5365827", "TASK-5365814"],
    duration: "RECEIVE ~0.7h since 9/11 4:37p PT (RN-5010248, ctn CAIU4659220) · RECEIVE ~3.0h since 9/11 2:17p PT (RN-192207) · RECEIVE NEW since 9/11 2:00p PT (RN-5009964) · dock occupied, space empty; row updated 9/11 4:37p PT",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5366062"],
    duration: "RECEIVE NEW since 9/11 5:15p PT (RN-5010146, ctn OOCU6896106 just checked in) · dock occupied, space empty; row updated 9/11 5:15p PT",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5366063"],
    duration: "RECEIVE NEW since 9/11 5:16p PT (RN-5010224, ctn FFAU2673636 just checked in) · door row updated 9/11 5:16p PT",
    anomaly: false,
  },

  // =====================================================================
  // OCCUPIED - no active task (13 doors)
  // =====================================================================
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock RESERVED, space occupied (entry ET-1152671; row updated 9/11 12:49p PT)",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space occupied (entry ET-1151418; row updated 9/11 3:16p PT)",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (entry ET-1151420; row updated 9/11 7:43a PT)",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (entry ET-1151310; row updated 9/10 9:02p PT)",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (GURUNANDA staging; entry ET-1152605; row updated 9/11 12:23p PT)",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (entry ET-1152224; row updated 9/10 10:06p PT)",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (entry ET-1152409; row updated 9/11 3:55p PT)",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (entry ET-1151377; row updated 9/10 9:01p PT)",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (entry ET-1148474; row updated 9/10 9:01p PT)",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (entry ET-1149107; row updated 9/10 9:01p PT)",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (entry ET-1150035; row updated 9/10 10:06p PT)",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (entry ET-1151383; row updated 9/10 9:00p PT)",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (entry ET-1152329; row updated 9/11 9:40a PT)",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (entry ET-1145407; row updated 9/10 8:59p PT)",
    anomaly: false,
  },

  // =====================================================================
  // AVAILABLE - dock and space free (1 door)
  // =====================================================================
  {
    door: "DOCK56",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space free - available (entry ET-1152641; row updated 9/11 2:47p PT)",
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
// (Sep 11 2026 ~5:20p PT). 13 active-status tasks at Bay 4 doors: 4 LOAD + 9 RECEIVE.
// ARNULFO MUNGUIA: 3 LOAD (DOCK51, DOCK53, DOCK54 stale)
// DANIELA GONZALEZ: 3 RECEIVE (DOCK62, DOCK68, DOCK72)
// JEROME ARANDA: 2 RECEIVE (DOCK55 x2)
// CANDY MENDEZ: 1 RECEIVE (DOCK53) · EDUARDO MEJIA: 1 LOAD (DOCK51)
// JORGE ANTONIO FRANCO: 1 RECEIVE (DOCK62) · RUFINO MUNGUIA: 1 RECEIVE (DOCK62)
// daira gonzalez: 1 RECEIVE (DOCK50, STALE)
// All assignee names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 3 },
  { name: "DANIELA GONZALEZ", taskCount: 3 },
  { name: "JEROME ARANDA", taskCount: 2 },
  { name: "CANDY MENDEZ", taskCount: 1 },
  { name: "EDUARDO MEJIA", taskCount: 1 },
  { name: "JORGE ANTONIO FRANCO", taskCount: 1 },
  { name: "RUFINO MUNGUIA", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
];

// All-time assignment counts - preserved from prior baseline (Jul 13 2026)
export const allTimeAssigneeSummaries: AssigneeSummary[] = [
  { name: "Arnulfo Munguia (89)", taskCount: 110 },
  { name: "Daniel Beltran", taskCount: 90 },
  { name: "Caren Cubides", taskCount: 3 },
  { name: "Daniela Gonzalez", taskCount: 1 },
  { name: "Fatima Ponce", taskCount: 1 },
  { name: "Nanci Viviana Rosas", taskCount: 1 },
  { name: "Rufino Munguia", taskCount: 1 },
];

// Mix: 4 LOAD + 9 RECEIVE = 13 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 9, total: 13 },
  { label: "Outbound (LOAD)", count: 4, total: 13 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 13 },
  { label: "Inbound", count: 9, total: 13 },
];

// --- Schedule Data (2026-09-11, Friday) ---
// % scheduled inbounds received TODAY: 0 CLOSED of 21 scheduled (appointmentTime = 9/11) = 0.0%
//   (21 scheduled receipts, all still IMPORTED or IN_PROGRESS - none CLOSED yet)
// % scheduled outbounds loaded TODAY: 22 SHIPPED of 68 scheduled (scheduleDate = 9/11) = 32.4%
// All-time PLANNED (GURUNANDA): 209
export const scheduleAvailable = true;
export const scheduledInboundOrders = 21;     // receipts with appointmentTime = 2026-09-11
export const scheduledOutboundOrders = 68;    // orders with scheduleDate = 2026-09-11
export const scheduledInboundReceived = 0;    // CLOSED/FORCE_CLOSED among scheduled set
export const scheduledOutboundLoaded = 22;    // SHIPPED among scheduled set
export const pctScheduledInboundReceived = 0;   // 0 / 21 = 0.0%
export const pctScheduledOutboundLoaded = 32.4; // 22 / 68 = 32.4%

// Facility-wide appointment context - unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime and space updatedTime
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Sep 11 2026 ~5:20p PT)
// 13 tasks total: 4 LOAD + 9 RECEIVE. All GURUNANDA, LLC.
// Two are stale-anomaly tasks (TASK-5338695, TASK-5090739).
export const assignments: TaskRecord[] = [
  // ------ OUTBOUND / LOAD (4) ------
  {
    taskId: "TASK-5365623",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~4.0h since 9/11 1:19p PT (ARNULFO; trlr 53380, 5 loads: 4 LOADED + 1 LOADING)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5366005",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · since 9/11 3:41p PT (trlr 53122RL, 5 loads WINDOW_CHECKIN_DONE)",
    assignee: "EDUARDO MEJIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5365768",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~3.4h since 9/11 1:58p PT (ARNULFO; trlr 53166, 6 loads LOADED)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5338695",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE ~34d open (started 8/7; load SHIPPED 8/10)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },

  // ------ INBOUND / RECEIVE (9) ------
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~10.6mo · STALE (RN-5002143 closed 10/22/25)",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5365522",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~1.9h since 9/11 3:23p PT (RN-5010087/88/89, trlr Leafchem0911026)",
    assignee: "CANDY MENDEZ",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5365675",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~4.2h since 9/11 1:08p PT (RN-5010237, trlr 5156)",
    assignee: "JEROME ARANDA",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5365676",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · since 9/11 12:40p PT (RN-5010237, trlr 5156)",
    assignee: "JEROME ARANDA",
    door: "DOCK55",
  },
  {
    taskId: "TASK-5365814",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · since 9/11 2:00p PT (RN-5009964, ctn TQL09042026, trlr Le4092)",
    assignee: "JORGE ANTONIO FRANCO",
    door: "DOCK62",
  },
  {
    taskId: "TASK-5365827",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~3.0h since 9/11 2:17p PT (RN-192207)",
    assignee: "RUFINO MUNGUIA",
    door: "DOCK62",
  },
  {
    taskId: "TASK-5366054",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~0.7h since 9/11 4:37p PT (RN-5010248, ctn CAIU4659220)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK62",
  },
  {
    taskId: "TASK-5366062",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · since 9/11 5:15p PT (RN-5010146, ctn OOCU6896106 just checked in)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK68",
  },
  {
    taskId: "TASK-5366063",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · since 9/11 5:16p PT (RN-5010224, ctn FFAU2673636 just checked in)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK72",
  },
];
