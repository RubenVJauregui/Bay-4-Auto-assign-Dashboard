/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 18, 2026 ~12:07 PM PDT
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
  // OCCUPIED — with active tasks (9)
  // ═══════════════════════════════════════════
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "Arnulfo Munguia",
    customer: "GURUNANDA",
    taskIds: ["TASK-5295058", "TASK-5295159"],
    duration: "~3h / NEW",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "Arnulfo Munguia",
    customer: "GURUNANDA",
    taskIds: ["TASK-5294114"],
    duration: "~21h",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "Multiple",
    customer: "GURUNANDA",
    taskIds: [],
    duration: "1 LOAD NEW",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "Arnulfo Munguia +1",
    customer: "GURUNANDA",
    taskIds: ["TASK-5294336"],
    duration: "~19h / active",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: "Unresolved",
    customer: "GURUNANDA",
    taskIds: [],
    duration: "1 RECEIVE IP",
    anomaly: true,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: "Arnulfo Munguia",
    customer: "GURUNANDA",
    taskIds: ["TASK-5295174"],
    duration: "~2h",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: "Multiple",
    customer: "GURUNANDA",
    taskIds: [],
    duration: "2 RECEIVE",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: "Unresolved",
    customer: "GURUNANDA",
    taskIds: [],
    duration: "1 RECEIVE IP",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: "Unresolved",
    customer: "GURUNANDA",
    taskIds: [],
    duration: "1 RECEIVE IP",
    anomaly: false,
  },

  // ═══════════════════════════════════════════
  // AVAILABLE — no active tasks (14)
  // ═══════════════════════════════════════════
  {
    door: "DOCK50",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK56",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: false,
  },
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
    door: "DOCK69",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
    anomaly: false,
  },
  {
    door: "DOCK70",
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
  { name: "Arnulfo Munguia", taskCount: 5 },
  { name: "Jerome Aranda", taskCount: 2 },
  { name: "Caren Cubides", taskCount: 2 },
  { name: "Rufino Munguia", taskCount: 1 },
  { name: "Daniela Gonzalez", taskCount: 1 },
  { name: "Daniel Beltran", taskCount: 1 },
];

// 5 RECEIVE (inbound) + 7 LOAD (outbound) = 12 active tasks
// 41.7% inbound / 58.3% outbound
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 7, total: 12 },
  { label: "Inbound", count: 5, total: 12 },
];

// Schedule: BAM appointment API still broken — UNAVAILABLE
export const scheduleAvailable = false;
export const scheduledInboundOrders = 0;
export const scheduledOutboundOrders = 0;
export const scheduledInboundReceived = 0;
export const scheduledOutboundLoaded = 0;
export const pctScheduledInboundReceived = 0;
export const pctScheduledOutboundLoaded = 0;

// Facility-wide: not queried in this pull — UNAVAILABLE
export const facilityInboundOpen = 0;
export const facilityOutboundOpen = 0;

export const assignments: TaskRecord[] = [
  // ────── OUTBOUND / LOAD (7) ──────
  {
    taskId: "TASK-5295058",
    dns: "ET-1110214 — GURUNANDA",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS",
    assignee: "Arnulfo Munguia",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5295159",
    dns: "GURUNANDA LOAD",
    customer: "GURUNANDA",
    pieces: "NEW",
    assignee: "Arnulfo Munguia",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5294114",
    dns: "ET-1109561 — GURUNANDA",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS",
    assignee: "Arnulfo Munguia",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5294336",
    dns: "ET-1109680 — GURUNANDA",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS",
    assignee: "Arnulfo Munguia",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5295174",
    dns: "GURUNANDA LOAD",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS",
    assignee: "Arnulfo Munguia",
    door: "DOCK61",
  },
  {
    taskId: "UNRESOLVED",
    dns: "DOCK53 — GURUNANDA",
    customer: "GURUNANDA",
    pieces: "1 LOAD NEW",
    assignee: "Multiple",
    door: "DOCK53",
  },
  {
    taskId: "UNRESOLVED",
    dns: "DOCK54 — GURUNANDA",
    customer: "GURUNANDA",
    pieces: "1 LOAD IP",
    assignee: "Multiple",
    door: "DOCK54",
  },

  // ────── INBOUND / RECEIVE (5) ──────
  {
    taskId: "UNRESOLVED",
    dns: "DOCK59 — GURUNANDA",
    customer: "GURUNANDA",
    pieces: "RECEIVE IP",
    assignee: "Unresolved",
    door: "DOCK59",
  },
  {
    taskId: "UNRESOLVED",
    dns: "DOCK65 — GURUNANDA",
    customer: "GURUNANDA",
    pieces: "2 RECEIVE",
    assignee: "Multiple",
    door: "DOCK65",
  },
  {
    taskId: "UNRESOLVED",
    dns: "DOCK67 — GURUNANDA",
    customer: "GURUNANDA",
    pieces: "RECEIVE IP",
    assignee: "Unresolved",
    door: "DOCK67",
  },
  {
    taskId: "UNRESOLVED",
    dns: "DOCK68 — GURUNANDA",
    customer: "GURUNANDA",
    pieces: "RECEIVE IP",
    assignee: "Unresolved",
    door: "DOCK68",
  },
];

// ── Anomalies & Notes ──
// — 9 Occupied / 0 Reserved / 14 Available — 39.1% occupancy (up from 30.4%).
// — Active tasks: 12 total — 7 LOAD (outbound) + 5 RECEIVE (inbound) = 58.3%/41.7% mix.
// — All 9 occupied doors have live active tasks (no orphaned occupancy).
// — ⚠ 3 doors have unresolved assignee mapping (DOCK59, DOCK67, DOCK68).
// — DOCK59: still anomalous — task active but unresolved user mapping (was "11769").
// — ARNULFO MUNGUIA: #1 active assignee with 5 tasks — all GURUNANDA LOAD (OUTBOUND).
//   TASK-5295058 (DOCK51, IN_PROGRESS), TASK-5295159 (DOCK51, NEW),
//   TASK-5294114 (DOCK52, IN_PROGRESS), TASK-5294336 (DOCK54, IN_PROGRESS),
//   TASK-5295174 (DOCK61, IN_PROGRESS).
// — GURUNANDA dominates: 11 of 12 active tasks.
// — ⚠ All 6 DOCK50 for Bay 4 were closed since ~9:08 AM.
// — ⚠ TASK-5293980 (ORG-585450 RECEIVE on DOCK53, Arnulfo) — NO LONGER ACTIVE.
//   Arnulfo now 100% GURUNANDA LOAD (was 3 LOAD + 1 non-GURUNANDA RECEIVE).
// — 🔁 Changes since ~9:08 AM: DOCK61 occupied (was free). DOCK68 occupied (was free).
//   DOCK50 remains free. DOCK53 task switched from RECEIVE→LOAD.
//   DOCK65 went from 1→2 tasks. Occupied count 7→9. Active tasks 7→12.
// — Schedule data not refreshed — BAM appointment API still returns 400/SQL errors.
// — 5 of 7 remaining tasks (non-Arnulfo) have unresolved task IDs; door-level
//   BAM query required for full resolution.
// — Durations are approximate; door-level BAM timestamps not pulled in this refresh.
// — All core metrics (door count, assignee counts, mix) sourced from live WISE/WMS
//   queries at ~12:07 PM PDT, June 18, 2026.
