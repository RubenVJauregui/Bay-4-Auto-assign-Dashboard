/**
 * Bay 4 Assignments - Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50-DOCK72
 *
 * TASK DATA: Refreshed 2026-09-18 (live WMS APIs)
 *   Sources:
 *     - /wms-bam/wms-location/search - exactlyNames for all 23 doors
 *       (fresh dockStatus, spaceStatus, occupiedCustomerIds per door)
 *     - /wms-bam/outbound/load-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide 11; 4 at Bay 4 doors)
 *     - /wms-bam/inbound/receive-task/search-by-paging - NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide 27; 8 at Bay 4 doors)
 *     - /wms-bam/outbound/order/search-by-paging - GURUNANDA orders,
 *       scheduleDate = 2026-09-18 (25 scheduled; 3 SHIPPED -> 12.0%);
 *       all-time PLANNED totalCount 134
 *     - /wms-bam/inbound/receipt/search-by-paging - GURUNANDA receipts,
 *       appointmentTime = 2026-09-18 (9 scheduled; 0 CLOSED -> 0.0%)
 *
 *   Key changes from prior refresh (9/11 ~5:20p PT -> 2026-09-18):
 *     - Bay 4 GURUNANDA active tasks: 12 (4 LOAD + 8 RECEIVE) on 9 doors
 *       (DOCK50, DOCK52, DOCK53, DOCK54, DOCK55, DOCK56, DOCK57, DOCK62, DOCK70).
 *     - Arnulfo Munguia ("Guru live out / in" assignee): 2 Bay-4 tasks ->
 *       1 LOAD (DOCK54 TASK-5338695, stale) + 1 RECEIVE (DOCK62 TASK-5365814).
 *     - Bay 4 doors occupied: 20/23 - DOCK56, DOCK59 and DOCK66 free/available.
 *     - Stale anomalies STILL OPEN: TASK-5338695 (DOCK54, load ended 8/10/26)
 *       and TASK-5090739 (DOCK50, receipt closed 10/22/25).
 *     - "% scheduled inbounds received" (9/18): 0 CLOSED of 9 scheduled = 0.0%.
 *     - "% scheduled outbounds loaded" (9/18): 3 SHIPPED of 25 scheduled = 12.0%.
 *     - Inbound/outbound mix: 8 RECEIVE / 4 LOAD of 12 active Bay-4 tasks.
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
// Not re-pulled in this refresh (out of scope). Section 1 renders live from
// the WMS loader; no value is inferred or carried over from the prior pull.
export const inYardFullEquipment: InYardEquipmentRecord[] = [];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875).
// All-time PLANNED: 134 (live totalCount at 2026-09-18).
// Orders with scheduleDate = 2026-09-18: 25 scheduled, 3 SHIPPED (12.0%).
export const plannedGurunandaOrderCount = 134;

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
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "daira gonzalez",
    customer: "GURUNANDA, LLC",
    taskIds: [
      "TASK-5090739"
    ],
    duration: "RECEIVE STALE ~332.1d open (started 10/21 1:21p PT, ended 10/22 10:42a PT, task never closed) · door row updated 9/17 9:07p PT",
    anomaly: true
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED (entry ET-1154400; row updated 9/17 9:07p PT)",
    anomaly: false
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "SILVANO SERTORIO HERNANDEZ",
    customer: null,
    taskIds: [
      "TASK-5371172"
    ],
    duration: "LOAD ~23.3h since 9/17 3:24p PT (SILVANO SERTORIO HERNANDEZ; 3 loads, 3 LOADED, seal 24800352) · door row updated 9/17 9:07p PT",
    anomaly: false
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "SILVANO SERTORIO HERNANDEZ",
    customer: null,
    taskIds: [
      "TASK-5371016"
    ],
    duration: "LOAD ~25.3h since 9/17 1:27p PT (SILVANO SERTORIO HERNANDEZ; 4 loads, 4 LOADED) · door row updated 9/17 9:06p PT",
    anomaly: false
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "SILVANO SERTORIO HERNANDEZ / ARNULFO MUNGUIA / CANDY MENDEZ",
    customer: "GURUNANDA, LLC",
    taskIds: [
      "TASK-5370878",
      "TASK-5338695",
      "TASK-5369031"
    ],
    duration: "LOAD ~25.6h since 9/17 1:09p PT (SILVANO SERTORIO HERNANDEZ; 5 loads, 5 LOADED, seal 24800357) · LOAD STALE ~41.9d open (started 8/7 4:29p PT, ended 8/10 9:27a PT, task never closed) · RECEIVE NEW since 9/16 7:40a PT (CANDY MENDEZ; RN-192430) · door row updated 9/17 9:06p PT",
    anomaly: true
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ",
    customer: null,
    taskIds: [
      "TASK-5369975"
    ],
    duration: "RECEIVE ~23.0h since 9/17 3:42p PT (DANIELA GONZALEZ; RN-5010255, ctn EGSU9301300) · door row updated 9/18 6:23a PT",
    anomaly: false
  },
  {
    door: "DOCK56",
    status: "Available",
    assignee: "CANDY MENDEZ",
    customer: null,
    taskIds: [
      "TASK-5369057"
    ],
    duration: "RECEIVE NEW since 9/16 7:59a PT (CANDY MENDEZ; RN-192414, ctn 53380) · door row updated 9/18 6:32a PT",
    anomaly: false
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: "DANIELA GONZALEZ / Fatima Ponce",
    customer: null,
    taskIds: [
      "TASK-5371291",
      "TASK-5369084"
    ],
    duration: "RECEIVE ~18.5h since 9/17 8:11p PT (DANIELA GONZALEZ; RN-5010256, ctn EITU1981126) · RECEIVE ~26.7h since 9/17 12:00p PT (Fatima Ponce; RN-192372, ctn 53211) · door row updated 9/17 9:05p PT",
    anomaly: false
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED (entry ET-1156246; row updated 9/18 6:16a PT)",
    anomaly: false
  },
  {
    door: "DOCK59",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY (entry ET-1154937; row updated 9/18 1:13a PT)",
    anomaly: false
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED (entry ET-1155346; row updated 9/17 11:04p PT)",
    anomaly: false
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY (entry ET-1152224; row updated 9/17 9:04p PT)",
    anomaly: false
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: null,
    taskIds: [
      "TASK-5365814"
    ],
    duration: "RECEIVE ~4.0d since 9/14 2:44p PT (ARNULFO MUNGUIA; RN-5009964, ctn TQL09042026) · door row updated 9/17 9:04p PT",
    anomaly: false
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space OCCUPIED (entry ET-1153419; row updated 9/17 9:04p PT)",
    anomaly: false
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space OCCUPIED (entry ET-1156384; row updated 9/17 9:47p PT)",
    anomaly: false
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY (entry ET-1156202; row updated 9/17 9:03p PT)",
    anomaly: false
  },
  {
    door: "DOCK66",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock AVAILABLE, space EMPTY (entry ET-1154928; row updated 9/18 6:38a PT)",
    anomaly: false
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY (entry ET-1150035; row updated 9/18 6:23a PT)",
    anomaly: false
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY (entry ET-1153420; row updated 9/17 9:03p PT)",
    anomaly: false
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY (entry ET-1151383; row updated 9/17 9:02p PT)",
    anomaly: false
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: "RUFINO MUNGUIA",
    customer: null,
    taskIds: [
      "TASK-5370705"
    ],
    duration: "RECEIVE ~27.1h since 9/17 11:35a PT (RUFINO MUNGUIA; RN-5010279, ctn CORRU091726UNIS) · door row updated 9/17 9:02p PT",
    anomaly: false
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY (entry ET-1155619; row updated 9/17 9:02p PT)",
    anomaly: false
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock OCCUPIED, space EMPTY (entry ET-1152898; row updated 9/17 9:02p PT)",
    anomaly: false
  }
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
// (2026-09-18). 12 active-status tasks at Bay 4 doors: 4 LOAD + 8 RECEIVE.
// All assignee names resolved from WMS task payloads (assigneeUserName).
export const assigneeSummaries: AssigneeSummary[] = [
  {
    name: "SILVANO SERTORIO HERNANDEZ",
    taskCount: 3
  },
  {
    name: "ARNULFO MUNGUIA",
    taskCount: 2
  },
  {
    name: "CANDY MENDEZ",
    taskCount: 2
  },
  {
    name: "DANIELA GONZALEZ",
    taskCount: 2
  },
  {
    name: "daira gonzalez",
    taskCount: 1
  },
  {
    name: "Fatima Ponce",
    taskCount: 1
  },
  {
    name: "RUFINO MUNGUIA",
    taskCount: 1
  }
];

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

// --- Schedule Data (2026-09-18, Friday) ---
// % scheduled inbounds received TODAY: 0 CLOSED of 9 scheduled (appointmentTime = 9/18) = 0.0%
// % scheduled outbounds loaded TODAY: 3 SHIPPED of 25 scheduled (scheduleDate = 9/18) = 12.0%
// All-time PLANNED (GURUNANDA): 134
export const scheduleAvailable = true;
export const scheduledInboundOrders = 9;     // receipts with appointmentTime = 2026-09-18
export const scheduledOutboundOrders = 25;    // orders with scheduleDate = 2026-09-18
export const scheduledInboundReceived = 0;    // CLOSED/FORCE_CLOSED among scheduled set
export const scheduledOutboundLoaded = 3;    // SHIPPED among scheduled set
export const pctScheduledInboundReceived = 0;   // 0 / 9 = 0.0%
export const pctScheduledOutboundLoaded = 12.0; // 3 / 25 = 12.0%

// Facility-wide appointment context - unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime and space updatedTime
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, 2026-09-18)
// 12 tasks total: 4 LOAD + 8 RECEIVE. All GURUNANDA, LLC.
// Two are stale-anomaly tasks (TASK-5338695, TASK-5090739).
export const assignments: TaskRecord[] = [
  {
    taskId: "TASK-5371172",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~23.3h since 9/17 3:24p PT (SILVANO SERTORIO HERNANDEZ; 3 loads, 3 LOADED, seal 24800352)",
    assignee: "SILVANO SERTORIO HERNANDEZ",
    door: "DOCK52"
  },
  {
    taskId: "TASK-5371016",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~25.3h since 9/17 1:27p PT (SILVANO SERTORIO HERNANDEZ; 4 loads, 4 LOADED)",
    assignee: "SILVANO SERTORIO HERNANDEZ",
    door: "DOCK53"
  },
  {
    taskId: "TASK-5370878",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~25.6h since 9/17 1:09p PT (SILVANO SERTORIO HERNANDEZ; 5 loads, 5 LOADED, seal 24800357)",
    assignee: "SILVANO SERTORIO HERNANDEZ",
    door: "DOCK54"
  },
  {
    taskId: "TASK-5338695",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE ~41.9d open (started 8/7 4:29p PT, ended 8/10 9:27a PT, task never closed)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54"
  },
  {
    taskId: "TASK-5371291",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~18.5h since 9/17 8:11p PT (DANIELA GONZALEZ; RN-5010256, ctn EITU1981126)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK57"
  },
  {
    taskId: "TASK-5370705",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~27.1h since 9/17 11:35a PT (RUFINO MUNGUIA; RN-5010279, ctn CORRU091726UNIS)",
    assignee: "RUFINO MUNGUIA",
    door: "DOCK70"
  },
  {
    taskId: "TASK-5369975",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~23.0h since 9/17 3:42p PT (DANIELA GONZALEZ; RN-5010255, ctn EGSU9301300)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK55"
  },
  {
    taskId: "TASK-5369084",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~26.7h since 9/17 12:00p PT (Fatima Ponce; RN-192372, ctn 53211)",
    assignee: "Fatima Ponce",
    door: "DOCK57"
  },
  {
    taskId: "TASK-5369057",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · NEW since 9/16 7:59a PT (CANDY MENDEZ; RN-192414, ctn 53380)",
    assignee: "CANDY MENDEZ",
    door: "DOCK56"
  },
  {
    taskId: "TASK-5369031",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · NEW since 9/16 7:40a PT (CANDY MENDEZ; RN-192430)",
    assignee: "CANDY MENDEZ",
    door: "DOCK54"
  },
  {
    taskId: "TASK-5365814",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~4.0d since 9/14 2:44p PT (ARNULFO MUNGUIA; RN-5009964, ctn TQL09042026)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK62"
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE ~332.1d open (started 10/21 1:21p PT, ended 10/22 10:42a PT, task never closed)",
    assignee: "daira gonzalez",
    door: "DOCK50"
  }
];
