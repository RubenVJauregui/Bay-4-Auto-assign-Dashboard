/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 18, 2026 ~16:20 PDT (23:20 UTC)
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
  // OCCUPIED — with IN_PROGRESS tasks (5)
  // ═══════════════════════════════════════════
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "Arnulfo Munguia",
    customer: "GURUNANDA",
    taskIds: ["TASK-5294114"],
    duration: "~27h",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "Arnulfo Munguia",
    customer: "GURUNANDA",
    taskIds: ["TASK-5295159"],
    duration: "~2.6h",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "Arnulfo Munguia",
    customer: "GURUNANDA",
    taskIds: ["TASK-5294336", "TASK-5295565"],
    duration: "~28h / ~1h",
    anomaly: true,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: "Daniela Gonzalez",
    customer: "GURUNANDA",
    taskIds: ["TASK-5294674"],
    duration: "~24.5h",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: "Caren Cubides",
    customer: "GURUNANDA",
    taskIds: ["TASK-5294419"],
    duration: "~8h",
    anomaly: false,
  },

  // ═══════════════════════════════════════════
  // RESERVED — NEW tasks only, not yet started (4)
  // ═══════════════════════════════════════════
  {
    door: "DOCK60",
    status: "Reserved",
    assignee: "Daniela Gonzalez",
    customer: "GURUNANDA",
    taskIds: ["TASK-5295639"],
    duration: "NEW",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Reserved",
    assignee: "Rufino Munguia",
    customer: "GURUNANDA",
    taskIds: ["TASK-5295386"],
    duration: "NEW",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Reserved",
    assignee: "Caren Cubides",
    customer: "GURUNANDA",
    taskIds: ["TASK-5207670"],
    duration: "NEW",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Reserved",
    assignee: "Daniela Gonzalez",
    customer: "GURUNANDA",
    taskIds: ["TASK-5295635"],
    duration: "NEW",
    anomaly: false,
  },

  // ═══════════════════════════════════════════
  // AVAILABLE — no tasks (14)
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
    door: "DOCK51",
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
    door: "DOCK63",
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
    door: "DOCK67",
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
const reserved = doors.filter((d) => d.status === "Reserved").length;
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
    label: "Doors Reserved",
    value: `${reserved}`,
    numerator: reserved,
    denominator: TOTAL_DOORS,
    percentage: (reserved / TOTAL_DOORS) * 100,
  },
  {
    label: "Doors Available",
    value: `${available}`,
    numerator: available,
    denominator: TOTAL_DOORS,
    percentage: (available / TOTAL_DOORS) * 100,
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
  { name: "Arnulfo Munguia", taskCount: 4 },
  { name: "Daniela Gonzalez", taskCount: 4 },
  { name: "Caren Cubides", taskCount: 3 },
  { name: "Rufino Munguia", taskCount: 2 },
];

// 4 LOAD (outbound) + 2 RECEIVE IN_PROGRESS (inbound) = 6 active tasks
// 7 NEW tasks pending
// Mix: 66.7% outbound / 33.3% inbound
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 6 },
  { label: "Inbound", count: 2, total: 6 },
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
  // ────── OUTBOUND / LOAD — IN_PROGRESS (4) ──────
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
    taskId: "TASK-5295159",
    dns: "GURUNANDA LOAD",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS",
    assignee: "Arnulfo Munguia",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5295565",
    dns: "GURUNANDA LOAD",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS",
    assignee: "Arnulfo Munguia",
    door: "DOCK54",
  },

  // ────── INBOUND / RECEIVE — IN_PROGRESS (2) ──────
  {
    taskId: "TASK-5294674",
    dns: "GURUNANDA RECEIVE",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS",
    assignee: "Daniela Gonzalez",
    door: "DOCK59",
  },
  {
    taskId: "TASK-5294419",
    dns: "GURUNANDA RECEIVE",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS",
    assignee: "Caren Cubides",
    door: "DOCK65",
  },

  // ────── PENDING / NEW (7) ──────
  {
    taskId: "TASK-5295636",
    dns: "GURUNANDA RECEIVE",
    customer: "GURUNANDA",
    pieces: "NEW",
    assignee: "Daniela Gonzalez",
    door: "DOCK59",
  },
  {
    taskId: "TASK-5295639",
    dns: "GURUNANDA RECEIVE",
    customer: "GURUNANDA",
    pieces: "NEW",
    assignee: "Daniela Gonzalez",
    door: "DOCK60",
  },
  {
    taskId: "TASK-5295386",
    dns: "GURUNANDA RECEIVE",
    customer: "GURUNANDA",
    pieces: "NEW",
    assignee: "Rufino Munguia",
    door: "DOCK61",
  },
  {
    taskId: "TASK-5207670",
    dns: "GURUNANDA RECEIVE",
    customer: "GURUNANDA",
    pieces: "NEW",
    assignee: "Caren Cubides",
    door: "DOCK62",
  },
  {
    taskId: "TASK-5295635",
    dns: "GURUNANDA RECEIVE",
    customer: "GURUNANDA",
    pieces: "NEW",
    assignee: "Daniela Gonzalez",
    door: "DOCK64",
  },
  {
    taskId: "TASK-5295135",
    dns: "GURUNANDA RECEIVE",
    customer: "GURUNANDA",
    pieces: "NEW",
    assignee: "Rufino Munguia",
    door: "DOCK65",
  },
  {
    taskId: "TASK-5252949",
    dns: "GURUNANDA RECEIVE",
    customer: "GURUNANDA",
    pieces: "NEW",
    assignee: "Caren Cubides",
    door: "DOCK65",
  },
];

// ── Anomalies & Notes ──
// — 5 Occupied / 4 Reserved / 14 Available — 21.7% active occupancy (down from 39.1% at 12:07 PM).
// — Active tasks: 6 IN_PROGRESS — 4 LOAD (outbound) + 2 RECEIVE (inbound) = 66.7%/33.3% mix.
// — Plus 7 NEW (pending) tasks across 4 unique doors — all GURUNANDA RECEIVE.
// — GURUNANDA dominates: all 13 tasks (6 active + 7 pending) are GURUNANDA.
// — ⚠ DOCK54 anomaly: 2 concurrent LOAD tasks for same assignee (TASK-5294336 ~28h + TASK-5295565 ~1h).
// — ARNULFO MUNGUIA: #1 active with 4 LOAD tasks on 3 doors (DOCK52, DOCK53, DOCK54×2).
//   Down from 5 tasks at 12:07 PM — DOCK51 and DOCK61 cleared.
//   TASK-5295159 moved from DOCK51→DOCK53. New TASK-5295565 on DOCK54.
// — DANIELA GONZALEZ: 4 total tasks — 1 RECEIVE IP (DOCK59) + 3 NEW (DOCK59, DOCK60, DOCK64).
// — CAREN CUBIDES: 3 total tasks — 1 RECEIVE IP (DOCK65) + 2 NEW (DOCK62, DOCK65).
// — RUFINO MUNGUIA: 2 NEW tasks (DOCK61, DOCK65).
// — 🔁 Key changes since ~12:07 PM:
//   DOCK51 cleared (was Arnulfo, 2 tasks). DOCK61 cleared (was Arnulfo, now reserved by Rufino).
//   DOCK67/DOCK68 cleared (were unresolved RECEIVE). DOCK59 assignee resolved: Daniela Gonzalez.
//   DOCK60 newly reserved (Daniela). DOCK62 newly reserved (Caren). DOCK64 newly reserved (Daniela).
//   TASK-5295159 moved DOCK51→DOCK53. TASK-5295565 new on DOCK54.
//   Total IN_PROGRESS 6 (was 12 at noon). Reserved 4 (was 0). Available 14 (unchanged).
// — Schedule data not refreshed — BAM appointment API still returns 400/SQL errors.
// — All door durations calculated from WISE start timestamps against 16:20 PDT.
// — All core metrics (door count, assignee counts, mix) sourced from live WISE/WMS
//   queries at ~16:20 PDT, June 18, 2026.
