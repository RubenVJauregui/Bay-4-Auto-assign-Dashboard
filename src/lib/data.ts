/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 17, 2026 ~5:14 PM PDT
 *
 * All values sourced from live WISE/WMS queries.
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

export const doors: DoorRecord[] = [
  // ═══════════════════════════════════════════
  // OCCUPIED — with active tasks (5)
  // ═══════════════════════════════════════════
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "daira gonzalez",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5090739"],
    duration: "~239d ⚠",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "ORG-585450",
    taskIds: ["TASK-5293980"],
    duration: "~8.5h",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5294114"],
    duration: "~7.5h",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA + DANIELA GONZALEZ",
    customer: "GURUNANDA, LLC / NZXT",
    taskIds: ["TASK-5294336", "TASK-5294715"],
    duration: "~5h / ~1h",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: "Caren Cubides",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5207670"],
    duration: "~107d ⚠",
    anomaly: true,
  },

  // ═══════════════════════════════════════════
  // OCCUPIED — no active tasks (8)
  // ═══════════════════════════════════════════
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA / ORG-585450",
    taskIds: [],
    duration: null,
    anomaly: false,
  },

  // ═══════════════════════════════════════════
  // EMPTY/Available — with active tasks (ANOMALOUS) (3)
  // ═══════════════════════════════════════════
  {
    door: "DOCK59",
    status: "Available",
    assignee: "DANIELA GONZALEZ",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5294674"],
    duration: "~1.5h ⚠",
    anomaly: true,
  },
  {
    door: "DOCK65",
    status: "Available",
    assignee: "RUFINO MUNGUIA + DUENAS + Cubides",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5294419", "TASK-5293707", "TASK-5252949"],
    duration: "4.5h / 21h / 51d ⚠",
    anomaly: true,
  },
  {
    door: "DOCK67",
    status: "Available",
    assignee: "RUFINO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5294128"],
    duration: "~7.5h ⚠",
    anomaly: true,
  },

  // ═══════════════════════════════════════════
  // AVAILABLE — no tasks (7)
  // ═══════════════════════════════════════════
  {
    door: "DOCK63",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;
const available = doors.filter((d) => d.status === "Available").length;

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Total Doors Occupied",
    value: `${occupied}/23`,
    numerator: occupied,
    denominator: TOTAL_DOORS,
    percentage: (occupied / TOTAL_DOORS) * 100,
  },
  {
    label: "Doors Available",
    value: `${available}`,
    numerator: available,
    denominator: TOTAL_DOORS,
    percentage: (available / TOTAL_DOORS) * 100,
  },
  {
    label: "Doors Reserved",
    value: `0`,
    numerator: 0,
    denominator: TOTAL_DOORS,
    percentage: 0,
  },
  {
    label: "Occupancy Rate",
    value: `${((occupied / TOTAL_DOORS) * 100).toFixed(1)}%`,
    numerator: occupied,
    denominator: TOTAL_DOORS,
    percentage: (occupied / TOTAL_DOORS) * 100,
  },
];

export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 3 },
  { name: "DANIELA GONZALEZ", taskCount: 2 },
  { name: "RUFINO MUNGUIA", taskCount: 2 },
  { name: "Caren Cubides", taskCount: 2 },
  { name: "JORGE ARMANDO DUENAS", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
];

// 2 LOAD (outbound) + 9 RECEIVE (inbound) = 11 active tasks
// 18% outbound / 82% inbound
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 2, total: 11 },
  { label: "Inbound", count: 9, total: 11 },
];

// Schedule from BAM appointments — June 17, 2026
export const scheduleAvailable = true;
export const scheduledInboundOrders = 72;
export const scheduledOutboundOrders = 128;
export const scheduledInboundReceived = 12;
export const scheduledOutboundLoaded = 114;
export const pctScheduledInboundReceived = 16.7;
export const pctScheduledOutboundLoaded = 89.1;

// Facility-wide: NOT queried in this pull — UNAVAILABLE
export const facilityInboundOpen = 0;
export const facilityOutboundOpen = 0;

export const assignments: TaskRecord[] = [
  // ────── OUTBOUND / LOAD (2) ──────
  {
    taskId: "TASK-5294336",
    dns: "LOAD-5031353/55/47",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5294114",
    dns: "LOAD-5031362",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },

  // ────── INBOUND / RECEIVE (9) ──────
  {
    taskId: "TASK-5294715",
    dns: "RN-185357",
    customer: "NZXT",
    pieces: "IN_PROGRESS",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5294674",
    dns: "RN-5008112",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK59",
  },
  {
    taskId: "TASK-5294419",
    dns: "RN-187010",
    customer: "GURUNANDA",
    pieces: "NEW",
    assignee: "RUFINO MUNGUIA",
    door: "DOCK65",
  },
  {
    taskId: "TASK-5294128",
    dns: "RN-187009",
    customer: "GURUNANDA",
    pieces: "NEW",
    assignee: "RUFINO MUNGUIA",
    door: "DOCK67",
  },
  {
    taskId: "TASK-5293980",
    dns: "RN-186534",
    customer: "ORG-585450",
    pieces: "NEW",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5293707",
    dns: "RN-5008119",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS",
    assignee: "JORGE ARMANDO DUENAS",
    door: "DOCK65",
  },
  {
    taskId: "TASK-5252949",
    dns: "RN-183707",
    customer: "GURUNANDA",
    pieces: "NEW ⚠ STALE",
    assignee: "Caren Cubides",
    door: "DOCK65",
  },
  {
    taskId: "TASK-5207670",
    dns: "RN-5006269",
    customer: "GURUNANDA",
    pieces: "NEW ⚠ STALE",
    assignee: "Caren Cubides",
    door: "DOCK62",
  },
  {
    taskId: "TASK-5090739",
    dns: "RN-5002143",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS ⚠ STALE",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
];

// Notes:
// — 13 Occupied / 0 Reserved / 10 Available (by WISE location spaceStatus) — 56.5% occupancy.
// — Active tasks: 11 total — 2 LOAD (outbound) + 9 RECEIVE (inbound) = 18%/82% mix.
// — 5 of 13 occupied doors have active tasks; 8 occupied doors have no active task.
// — 3 EMPTY doors have active tasks (DOCK59, DOCK65, DOCK67) — ANOMALOUS: space released but task still open.
// — Customer mix: GURUNANDA, LLC dominates. NZXT on DOCK54 (TASK-5294715). ORG-585450 on DOCK51/70.
// — ARNULFO MUNGUIA has 3 active tasks: 2 LOAD (GURUNANDA, DOCK52/54) + 1 RECEIVE (ORG-585450, DOCK51).
// — ⚠ 3 STALE tasks: TASK-5090739 (239d, 10/21/2025), TASK-5207670 (107d, 3/2/2026), TASK-5252949 (51d, 4/27/2026).
// — DOCK65 has 3 simultaneous active tasks despite space EMPTY — severe anomaly.
// — DOCK54 has both RECEIVE (NZXT, DANIELA GONZALEZ) and LOAD (GURUNANDA, ARNULFO MUNGUIA) active.
// — Schedule: 12/72 inbounds received (16.7%), 114/128 outbounds loaded (89.1%).
// — ORG-585450 could not be resolved to a name via organization search.
// — All data sourced from live WISE/WMS queries at ~5:14 PM PDT, June 17, 2026.
