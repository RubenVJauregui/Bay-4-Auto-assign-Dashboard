/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed 2026-07-25 ~19:29 UTC (live WMS APIs)
 *   Sources:
 *     - /wms/location/search — door occupancy for DOCK50-DOCK72 (spaceStatus/dockStatus)
 *     - /wms-bam/tasks/search-by-conditional — all tasks at Bay 4 occupied dockIds
 *     - Customer: ORG-655875 = GURUNANDA LLC (from prior baseline)
 *     - Durations computed from task startTime to now (2026-07-25 12:29 PDT / 19:29 UTC)
 *     - Location API occupancy: 16 doors OCCUPIED, 0 RESERVED, 7 AVAILABLE
 *     - Active tasks: 92 (IN_PROGRESS + NEW) across all types
 *     - LOAD (outbound) IN_PROGRESS: 4 tasks (ARNULFO MUNGUIA, GABINO CARRASCO, FABRICIO BARSALLO, ALFREDO SANCHEZ)
 *     - RECEIVE (inbound) active: 19 tasks (IN_PROGRESS + NEW)
 *     - 12 anomaly doors: OCCUPIED but no active LOAD/RECEIVE task
 *     - Appointment API: UNAVAILABLE (all parameter combinations return "No query condition found")
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

export const TOTAL_DOORS = 23;

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
  // OCCUPIED — doors with active LOAD/RECEIVE tasks (3 doors, 4 tasks)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "GABINO CARRASCO",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5326788"],
    duration: "8h 2m",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5326740"],
    duration: "13h 12m",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "EFREN SALVADOR",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5326026"],
    duration: "21h 18m",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // OCCUPIED — location occupied, no active LOAD/RECEIVE task (13 doors)
  // Equipment/trailer present at door, no active load/receive task at these locations
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // AVAILABLE — location empty + available (7 doors)
  // ═══════════════════════════════════════════════════════════════
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK65", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK66", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK67", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK68", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK69", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
  { door: "DOCK71", status: "Available", assignee: null, customer: null, taskIds: [], duration: null, anomaly: false },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;
const reserved = doors.filter((d) => d.status === "Reserved").length;
const available = doors.filter((d) => d.status === "Available").length;
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length;
const anomalyDoors = doors.filter((d) => d.anomaly).length;

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors Occupied",
    value: `${occupied}/23`,
    numerator: occupied,
    denominator: TOTAL_DOORS,
    percentage: (occupied / TOTAL_DOORS) * 100,
  },
  {
    label: "Doors w/ Active Tasks",
    value: `${doorsWithTasks}`,
    numerator: doorsWithTasks,
    denominator: TOTAL_DOORS,
    percentage: (doorsWithTasks / TOTAL_DOORS) * 100,
  },
  {
    label: "Doors Available",
    value: `${available}`,
    numerator: available,
    denominator: TOTAL_DOORS,
    percentage: (available / TOTAL_DOORS) * 100,
  },
  {
    label: "Anomalies",
    value: `${anomalyDoors}`,
    numerator: anomalyDoors,
    denominator: TOTAL_DOORS,
    percentage: (anomalyDoors / TOTAL_DOORS) * 100,
  },
];

// Active assignee task counts — all Bay 4 active tasks (IN_PROGRESS + NEW)
// Source: /wms-bam/tasks/search-by-conditional (Jul 25 2026 ~19:29 UTC)
// 92 active tasks: 4 LOAD + 19 RECEIVE + 42 MOVEMENT + 24 PUT_AWAY + ...
// Top 10 assignees by active task count at Bay 4 doors
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "HUGO TEXCA", taskCount: 18 },
  { name: "PEDRO AVILA", taskCount: 10 },
  { name: "ERICK OLMEDO", taskCount: 10 },
  { name: "DANIELA GONZALEZ", taskCount: 8 },
  { name: "LUIS CHIGUIL", taskCount: 8 },
  { name: "SEBASTIAN MUNGUIA", taskCount: 8 },
  { name: "RICARDO TAPIA", taskCount: 8 },
  { name: "SANDRA B LOPEZ", taskCount: 6 },
  { name: "JAIRO MORALES", taskCount: 4 },
  { name: "DIEGO SANCHEZ", taskCount: 4 },
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

// Mix: 4 LOAD (outbound) + 19 RECEIVE (inbound) = 23 active dock-related tasks at Bay 4 doors
// Note: 92 total active tasks across all types; dock-related subset shown here
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound (LOAD)", count: 4, total: 23 },
  { label: "Inbound (RECEIVE)", count: 19, total: 23 },
];

// Broader active inbound/outbound mix (all task types at Bay 4)
// Inbound ≈ RECEIVE + PUT_AWAY (43), Outbound ≈ LOAD + PACK (9)
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 9, total: 92 },
  { label: "Inbound", count: 43, total: 92 },
];

// Schedule: Appointment API returned "No query condition found" for all parameter
// combinations. % scheduled inbounds received and % scheduled outbounds loaded UNAVAILABLE.
export const scheduleAvailable = false;
export const scheduledInboundOrders = 0;
export const scheduledOutboundOrders = 0;
export const scheduledInboundReceived = 0;
export const scheduledOutboundLoaded = 0;
export const pctScheduledInboundReceived = 0;
export const pctScheduledOutboundLoaded = 0;

// Facility-wide appointment context — unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime
export const doorDurationsAvailable = true;

// Active LOAD + RECEIVE task records at Bay 4 doors (July 25, 2026 ~19:29 UTC)
// 23 active dock-related tasks: 4 LOAD IN_PROGRESS + 19 RECEIVE (IN_PROGRESS + NEW)
// "Guru live out / in assign to Arnulfo": TASK-5326740 (LOAD, ARNULFO MUNGUIA, GURUNANDA)
export const assignments: TaskRecord[] = [
  // ────── OUTBOUND / LOAD — IN_PROGRESS (4) ──────
  {
    taskId: "TASK-5326788",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS (8h 2m)",
    assignee: "GABINO CARRASCO",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5326762",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS (10h 46m)",
    assignee: "FABRICIO BARSALLO",
    door: "—",
  },
  {
    taskId: "TASK-5326740",
    dns: "LOAD — Guru → Arnulfo",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS (13h 12m)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5326413",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS (17h 17m)",
    assignee: "ALFREDO SANCHEZ",
    door: "—",
  },

  // ────── INBOUND / RECEIVE — IN_PROGRESS (10) ──────
  {
    taskId: "TASK-5326790",
    dns: "RECEIVE",
    customer: "—",
    pieces: "IN_PROGRESS (7h 58m)",
    assignee: "DANIELA GONZALEZ",
    door: "—",
  },
  {
    taskId: "TASK-5326750",
    dns: "RECEIVE",
    customer: "—",
    pieces: "IN_PROGRESS (12h 4m)",
    assignee: "PEDRO AVILA",
    door: "—",
  },
  {
    taskId: "TASK-5326749",
    dns: "RECEIVE",
    customer: "—",
    pieces: "IN_PROGRESS (12h 21m)",
    assignee: "PEDRO AVILA",
    door: "—",
  },
  {
    taskId: "TASK-5326457",
    dns: "RECEIVE",
    customer: "—",
    pieces: "IN_PROGRESS (15h 8m)",
    assignee: "SEBASTIAN GONZALEZ",
    door: "—",
  },
  {
    taskId: "TASK-5326417",
    dns: "RECEIVE",
    customer: "—",
    pieces: "IN_PROGRESS (16h 8m)",
    assignee: "TANIA RAMIREZ",
    door: "—",
  },
  {
    taskId: "TASK-5326387",
    dns: "RECEIVE",
    customer: "—",
    pieces: "IN_PROGRESS (14h 17m)",
    assignee: "DIEGO SANCHEZ",
    door: "—",
  },
  {
    taskId: "TASK-5326242",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS (19h 18m)",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5326205",
    dns: "RECEIVE",
    customer: "—",
    pieces: "IN_PROGRESS (19h 33m)",
    assignee: "DIEGO SANCHEZ",
    door: "—",
  },
  {
    taskId: "TASK-5326118",
    dns: "RECEIVE",
    customer: "—",
    pieces: "IN_PROGRESS (20h 17m)",
    assignee: "luis fernando ozuna",
    door: "—",
  },
  {
    taskId: "TASK-5326026",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS (21h 18m)",
    assignee: "EFREN SALVADOR",
    door: "DOCK55",
  },
];
