/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 18, 2026 ~9:08 AM PDT
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
  // OCCUPIED — with active tasks (7)
  // ═══════════════════════════════════════════
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5295058"],
    duration: "~2h",
    anomaly: false,
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5294114"],
    duration: "~18h",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "ORG-585450",
    taskIds: ["TASK-5293980"],
    duration: "~19h",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5294336"],
    duration: "~16h",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: "11769",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5294674"],
    duration: "~15h ⚠",
    anomaly: true,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: "Caren Cubides",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5294419"],
    duration: "~15h",
    anomaly: false,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: "Caren Cubides",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5294128"],
    duration: "~18h",
    anomaly: false,
  },

  // ═══════════════════════════════════════════
  // AVAILABLE — no active tasks (16)
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
    door: "DOCK61",
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
  { name: "ARNULFO MUNGUIA", taskCount: 4 },
  { name: "Caren Cubides", taskCount: 2 },
  { name: "11769", taskCount: 1 },
];

// 3 LOAD (outbound) + 4 RECEIVE (inbound) = 7 active tasks
// 42.9% outbound / 57.1% inbound
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 3, total: 7 },
  { label: "Inbound", count: 4, total: 7 },
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
  // ────── OUTBOUND / LOAD (3) ──────
  {
    taskId: "TASK-5295058",
    dns: "ET-1110214 — GURUNANDA",
    customer: "GURUNANDA",
    pieces: "NEW",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5294114",
    dns: "ET-1109561 — GURUNANDA",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK52",
  },
  {
    taskId: "TASK-5294336",
    dns: "ET-1109680 — GURUNANDA",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },

  // ────── INBOUND / RECEIVE (4) ──────
  {
    taskId: "TASK-5293980",
    dns: "ET-1109499 — ORG-585450",
    customer: "ORG-585450",
    pieces: "IN_PROGRESS",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5294674",
    dns: "ET-1109857 — GURUNANDA",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS",
    assignee: "11769",
    door: "DOCK59",
  },
  {
    taskId: "TASK-5294419",
    dns: "ET-1109700 — GURUNANDA",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS",
    assignee: "Caren Cubides",
    door: "DOCK65",
  },
  {
    taskId: "TASK-5294128",
    dns: "ET-1109572 — GURUNANDA",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS",
    assignee: "Caren Cubides",
    door: "DOCK67",
  },
];

// ── Anomalies & Notes ──
// — 7 Occupied / 0 Reserved / 16 Available — 30.4% occupancy.
// — Active tasks: 7 total — 3 LOAD (outbound) + 4 RECEIVE (inbound) = 42.9%/57.1% mix.
// — All 7 occupied doors have live active tasks (no orphaned occupancy).
// — DOCK59: spaceStatus=EMPTY per WISE but TASK-5294674 IN_PROGRESS — phantom occupancy anomaly.
// — Customer mix: GURUNANDA dominates (6 of 7 tasks). ORG-585450 has 1 (DOCK53).
// — ARNULFO MUNGUIA: #1 assignee with 4 active tasks (3 GURUNANDA LOAD + 1 ORG-585450 RECEIVE).
// — TASK-5295058 is NEW (~2h) on DOCK51 — GURUNANDA live-out, appeared since previous pull.
// — TASK-5293980 moved from DOCK51→DOCK53 since prior pull (~6:29 AM).
// — ⚠ Compared to prior pull (~6:29 AM): DOCK50 freed (TASK-5090739 closed), DOCK62 freed (TASK-5207670 closed), DOCK65 reduced from 2→1 task (TASK-5252949 closed).
// — ⚠ 15 FORCE_CLOSED GURUNANDA receive tasks on Bay 4 doors (DOCK59, DOCK65–DOCK70 etc.) — may indicate stale dock close-out procedures.
// — ⚠ 3 FORCE_CLOSED ORG-585450 tasks on DOCK51/DOCK52 dockIds.
// — ⚠ 11769 is an unresolved user ID on DOCK59.
// — Schedule data not refreshed in this pull — BAM appointment API unavailable.
// — All data sourced from live WISE/WMS queries at ~9:08 AM PDT, June 18, 2026.
