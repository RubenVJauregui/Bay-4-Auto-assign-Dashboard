/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 18, 2026 ~6:29 AM PDT
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
    assignee: "Unknown",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5090739"],
    duration: "~240d ⚠",
    anomaly: true,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "ORG-585450",
    taskIds: ["TASK-5293980"],
    duration: "~16h",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5294114"],
    duration: "~15h",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5294336"],
    duration: "~13h",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: "Caren Cubides",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5207670"],
    duration: "~108d ⚠",
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
    anomaly: true,
  },
  {
    door: "DOCK55",
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
    customer: "GURUNANDA, LLC",
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
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
    anomaly: true,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA / ORG-585450",
    taskIds: [],
    duration: null,
    anomaly: true,
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
    duration: "~12h ⚠",
    anomaly: true,
  },
  {
    door: "DOCK65",
    status: "Available",
    assignee: "RUFINO MUNGUIA + Caren Cubides",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5294419", "TASK-5252949"],
    duration: "~12h / ~52d ⚠",
    anomaly: true,
  },
  {
    door: "DOCK67",
    status: "Available",
    assignee: "RUFINO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5294128"],
    duration: "~15h ⚠",
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
  { name: "RUFINO MUNGUIA", taskCount: 2 },
  { name: "Caren Cubides", taskCount: 2 },
  { name: "DANIELA GONZALEZ", taskCount: 1 },
  { name: "Unknown (194807…)", taskCount: 1 },
];

// 2 LOAD (outbound) + 7 RECEIVE (inbound) = 9 active tasks
// 22.2% outbound / 77.8% inbound
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 2, total: 9 },
  { label: "Inbound", count: 7, total: 9 },
];

// Schedule: not pulled in this refresh — UNAVAILABLE
export const scheduleAvailable = false;
export const scheduledInboundOrders = 0;
export const scheduledOutboundOrders = 0;
export const scheduledInboundReceived = 0;
export const scheduledOutboundLoaded = 0;
export const pctScheduledInboundReceived = 0;
export const pctScheduledOutboundLoaded = 0;

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

  // ────── INBOUND / RECEIVE (7) ──────
  {
    taskId: "TASK-5294674",
    dns: "RN-5008112 / ET-1109857",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS",
    assignee: "DANIELA GONZALEZ",
    door: "DOCK59",
  },
  {
    taskId: "TASK-5294419",
    dns: "RN-187010 / ET-1109700",
    customer: "GURUNANDA",
    pieces: "NEW",
    assignee: "RUFINO MUNGUIA",
    door: "DOCK65",
  },
  {
    taskId: "TASK-5294128",
    dns: "RN-187009 / ET-1109572",
    customer: "GURUNANDA",
    pieces: "NEW",
    assignee: "RUFINO MUNGUIA",
    door: "DOCK67",
  },
  {
    taskId: "TASK-5293980",
    dns: "RN-186534 / ET-1109499",
    customer: "ORG-585450",
    pieces: "NEW",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5207670",
    dns: "RN-5006269 / ET-1069983",
    customer: "GURUNANDA",
    pieces: "NEW ⚠ STALE",
    assignee: "Caren Cubides",
    door: "DOCK62",
  },
  {
    taskId: "TASK-5252949",
    dns: "RN-183707 / ET-1087611",
    customer: "GURUNANDA",
    pieces: "NEW ⚠ STALE",
    assignee: "Caren Cubides",
    door: "DOCK65",
  },
  {
    taskId: "TASK-5090739",
    dns: "—",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS ⚠ STALE",
    assignee: "Unknown (194807…)",
    door: "DOCK50",
  },
];

// Notes:
// — 13 Occupied / 0 Reserved / 10 Available (by WISE location spaceStatus) — 56.5% occupancy.
// — Active tasks: 9 total — 2 LOAD (outbound) + 7 RECEIVE (inbound) = 22.2%/77.8% mix.
// — 5 of 13 occupied doors have active tasks; 8 occupied doors have no active task (anomaly).
// — 3 EMPTY doors have active tasks (DOCK59, DOCK65, DOCK67) — ANOMALOUS: space released but task still open.
// — Customer mix: GURUNANDA, LLC dominates (8 of 9 tasks). ORG-585450 on DOCK51/70.
// — ARNULFO MUNGUIA has 3 active tasks: 2 LOAD (GURUNANDA, DOCK52/54) + 1 RECEIVE (ORG-585450, DOCK51).
// — ⚠ 3 STALE tasks: TASK-5090739 (~240d, 10/21/2025), TASK-5207670 (~108d, 3/2/2026), TASK-5252949 (~52d, 4/27/2026).
// — DOCK65 has 2 simultaneous active tasks despite space EMPTY — anomaly.
// — DOCK59 phantom occupancy: space EMPTY but active RECEIVE IN_PROGRESS.
// — TASK-5294715 (NZXT, DOCK54) and TASK-5293707 (DUENAS, DOCK65) — CONFIRMED CLOSED since prior pull.
// — Schedule data not refreshed in this pull.
// — ORG-585450 could not be resolved to a name via organization search.
// — All data sourced from live WISE/WMS queries at ~6:29 AM PDT, June 18, 2026.
