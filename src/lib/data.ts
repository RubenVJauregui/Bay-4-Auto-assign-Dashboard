/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 15, 2026 ~6:08 PM PDT
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
}

export const TOTAL_DOORS = 23;

export const doors: DoorRecord[] = [
  // ── OCCUPIED — with active tasks (6) ──
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "Renato Rosales",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5292126"],
    duration: "~3.4h",
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "DANIEL BELTRAN",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5291922"],
    duration: "~7.3h",
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "DANIEL GONZALEZ",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5292372"],
    duration: "~2.2h",
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: "RUFINO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5292226"],
    duration: "NEW — no start",
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: "RUFINO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5291946"],
    duration: "NEW — no start ⚠",
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: "RUFINO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5292030"],
    duration: "~3.3h ⚠",
  },

  // ── OCCUPIED — no active tasks (8) ──
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA, LLC",
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: "GURUNANDA / SAGA",
    taskIds: [],
    duration: null,
  },

  // ── AVAILABLE / EMPTY (7) ──
  {
    door: "DOCK59",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK63",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK64",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK68",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK69",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK71",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK72",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
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
  { name: "RUFINO MUNGUIA", taskCount: 3 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
  { name: "Renato Rosales", taskCount: 1 },
  { name: "DANIEL GONZALEZ", taskCount: 1 },
];

// 2 outbound + 4 inbound = 6 active tasks — 33% outbound / 67% inbound
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 2, total: 6 },
  { label: "Inbound", count: 4, total: 6 },
];

// Schedule summary: BAM endpoints returning SQL errors — UNAVAILABLE
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
  // ────── OUTBOUND (2 active load tasks) ──────
  {
    taskId: "TASK-5292126",
    dns: "LOAD-5031070 +1",
    customer: "GURUNANDA",
    pieces: "PRE_LOAD · IN_PROG",
    assignee: "Renato Rosales",
  },
  {
    taskId: "TASK-5291922",
    dns: "LOAD-5031079 +3",
    customer: "GURUNANDA",
    pieces: "PRE_LOAD · IN_PROG",
    assignee: "DANIEL BELTRAN",
  },

  // ────── INBOUND (4 active receive tasks) ──────
  {
    taskId: "TASK-5292372",
    dns: "RN-5008086",
    customer: "GURUNANDA",
    pieces: "IN_PROG",
    assignee: "DANIEL GONZALEZ",
  },
  {
    taskId: "TASK-5292226",
    dns: "RN-186779",
    customer: "GURUNANDA",
    pieces: "NEW",
    assignee: "RUFINO MUNGUIA",
  },
  {
    taskId: "TASK-5291946",
    dns: "RN-5008070",
    customer: "GURUNANDA",
    pieces: "NEW",
    assignee: "RUFINO MUNGUIA",
  },
  {
    taskId: "TASK-5292030",
    dns: "RN-186778",
    customer: "GURUNANDA",
    pieces: "IN_PROG",
    assignee: "RUFINO MUNGUIA",
  },
];

// Notes:
// — 14 Occupied / 0 Reserved / 7 Available / 2 anom. — 60.9% occupancy (by WISE location spaceStatus).
// — Active tasks: 6 total — 2 outbound (PRE_LOAD) + 4 inbound (RECEIVE) = 33%/67% mix.
// — 6 of 14 occupied doors have active tasks; 8 occupied doors have no active task.
// — Customer mix: GURUNANDA, LLC (ORG-655875) on all 6 active tasks + most occupied doors.
// — DOCK70 also has SAGA (ORG-585450) listed as occupied customer.
// — ⚠ DOCK65 (space EMPTY, has TASK-5291946 NEW) — anomalous: task assigned but space empty.
// — ⚠ DOCK66 (space EMPTY, has TASK-5292030 IN_PROGRESS ~3.3h) — anomalous: task active but space empty.
// — Arnoldo "Arnulfo" Munguia: 0 active GURUNANDA tasks on Bay 4.
// — RUFINO MUNGUIA: 3 active Bay 4 tasks — DOCK62, DOCK65, DOCK66 (all INBOUND).
// — DANIEL BELTRAN: 1 task — DOCK53 OUTBOUND PRE_LOAD (~7.3h).
// — Renato Rosales: 1 task — DOCK52 OUTBOUND PRE_LOAD (~3.4h).
// — DANIEL GONZALEZ: 1 task — DOCK54 INBOUND (~2.2h).
// — Schedule %: UNAVAILABLE (BAM endpoints returning SQL errors).
// — Facility-wide: NOT queried in this pull.
// — All data sourced from live WISE/WMS queries at ~6:08 PM PDT, June 15, 2026.
