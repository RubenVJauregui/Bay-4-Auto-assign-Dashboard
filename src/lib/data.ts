/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 5, 2026 ~2:39 PM PDT
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
  // ── OCCUPIED (8) ── active tasks + ghost-occupied doors ──
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "Arnulfo Munguia",
    customer: "KARAKA LLC",
    taskIds: ["TASK-5285485", "TASK-5285778"],
    duration: "~6.4h",
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "Arnulfo Munguia",
    customer: "GURUNANDA",
    taskIds: ["TASK-5285558", "TASK-5285913"],
    duration: "~5.1h",
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "Lorenzo Rodriguez + Arnulfo",
    customer: "GURUNANDA",
    taskIds: ["TASK-5285010", "TASK-5285860"],
    duration: "~24.4h ⚠",
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "Arnulfo Munguia",
    customer: "GURUNANDA → Dollar Tree",
    taskIds: ["TASK-5285835"],
    duration: "~1.1h",
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: "⚠ Ghost — no active tasks",
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: "Rufino Munguia + Caren Cubides",
    customer: "GURUNANDA",
    taskIds: ["TASK-5254195", "TASK-5252949"],
    duration: "~39d ⚠",
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: "⚠ Ghost — no active tasks",
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: "Daniel Beltran",
    customer: "GURUNANDA / TikTok FBT",
    taskIds: ["TASK-5285880"],
    duration: "~25m",
  },

  // ── RESERVED (4) ──
  {
    door: "DOCK50",
    status: "Reserved",
    assignee: null,
    customer: "GURUNANDA",
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK56",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK57",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK67",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },

  // ── AVAILABLE (11) ── no active load or receive tasks ──
  {
    door: "DOCK52",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK58",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK59",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK60",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK61",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK62",
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
const occupiedReserved = occupied + reserved;

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
    value: `${occupiedReserved}/${TOTAL_DOORS}`,
    numerator: occupiedReserved,
    denominator: TOTAL_DOORS,
    percentage: (occupiedReserved / TOTAL_DOORS) * 100,
  },
];

export const assigneeSummaries: AssigneeSummary[] = [
  { name: "Arnulfo Munguia", taskCount: 6 },
  { name: "Daniel Beltran", taskCount: 1 },
  { name: "Lorenzo Rodriguez", taskCount: 1 },
  { name: "Rufino Munguia", taskCount: 1 },
  { name: "Caren Cubides", taskCount: 1 },
];

// 6 outbound + 4 inbound = 10 active tasks — 60% outbound / 40% inbound
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 6, total: 10 },
  { label: "Inbound", count: 4, total: 10 },
];

// Schedule summary: inbound & outbound schedule-summary endpoints failed with SQL errors
export const scheduleAvailable = false;
export const scheduledInboundOrders = 0;
export const scheduledOutboundOrders = 0;
export const scheduledInboundReceived = 0;
export const scheduledOutboundLoaded = 0;
export const pctScheduledInboundReceived = 0;
export const pctScheduledOutboundLoaded = 0;

// Facility-wide open counts from WISE (LT_F1, pulled ~2:39 PM PDT June 5)
// Outbound: 70 open (NEW + IN_PROGRESS)
// Inbound:  63 open (NEW + IN_PROGRESS)
export const facilityInboundOpen = 63;
export const facilityOutboundOpen = 70;

export const assignments: TaskRecord[] = [
  // ────── OUTBOUND (6 active load tasks) ──────
  // TASK-5285558 — DOCK53 — Arnulfo Munguia — PRE_LOAD ~5.1h
  // DN-3198181, GURUNANDA (ORG-655875), LOADED, started 9:31 AM
  {
    taskId: "TASK-5285558",
    dns: "DN-3198181",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285913 — DOCK53 — Arnulfo Munguia — PRE_LOAD NEW
  // DN-3203261 + DN-3203214, GURUNANDA (ORG-655875), created 2:21 PM
  {
    taskId: "TASK-5285913",
    dns: "DN-3203261 +1",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285010 — DOCK54 — Lorenzo Rodriguez — PRE_LOAD ~24.4h ⚠
  // DN-3195089 + DN-3195088, GURUNANDA (ORG-655875), both LOADED, since Jun 4 2:13 PM
  {
    taskId: "TASK-5285010",
    dns: "DN-3195089, DN-3195088",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  // TASK-5285860 — DOCK54 — Arnulfo Munguia — PRE_LOAD NEW
  // DN-3198066 + DN-3198170 + DN-3198529 + DN-3190635, GURUNANDA (ORG-655875), created 1:36 PM
  {
    taskId: "TASK-5285860",
    dns: "DN-3198066 +3",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285835 — DOCK55 — Arnulfo Munguia — LIVE_LOAD ~1.1h
  // DN-3132143 + DN-3175649 + DN-3175641, GURUNANDA (ORG-655875) → Dollar Tree, all LOADED, started 1:32 PM
  {
    taskId: "TASK-5285835",
    dns: "DN-3132143 +2",
    customer: "GURUNANDA → Dollar Tree",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285880 — DOCK70 — Daniel Beltran — LIVE_LOAD ~25m
  // DN-3190330, GURUNANDA (ORG-655875) / TikTok FBT, LOADING, started 2:14 PM
  {
    taskId: "TASK-5285880",
    dns: "DN-3190330",
    customer: "GURUNANDA / TikTok FBT",
    pieces: "—",
    assignee: "Daniel Beltran",
  },

  // ────── INBOUND (4 active receive tasks) ──────
  // TASK-5285485 — DOCK51 — Arnulfo Munguia — RECEIVE ~6.4h
  // RN-186139, KARAKA LLC (ORG-585450), BOK brand, devanned 8:49 AM, started 8:15 AM
  {
    taskId: "TASK-5285485",
    dns: "RN-186139",
    customer: "KARAKA LLC",
    pieces: "BOK",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285778 — DOCK51 — Arnulfo Munguia — RECEIVE NEW
  // RN-182888, KARAKA LLC (ORG-585450), IRO POKRK2135, created 12:10 PM
  {
    taskId: "TASK-5285778",
    dns: "RN-182888",
    customer: "KARAKA LLC",
    pieces: "IRO",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5254195 — DOCK65 — Rufino Munguia — RECEIVE NEW ~38 days ⚠️
  // RN-5007343, GURUNANDA (ORG-655875), PO 125-16768253, created Apr 28
  {
    taskId: "TASK-5254195",
    dns: "RN-5007343",
    customer: "GURUNANDA",
    pieces: "PO 125-16768253",
    assignee: "Rufino Munguia",
  },
  // TASK-5252949 — DOCK65 — Caren Cubides — RECEIVE NEW ~39 days ⚠️
  // RN-183707, GURUNANDA (ORG-655875), PO6252 Alnor oils, created Apr 27
  {
    taskId: "TASK-5252949",
    dns: "RN-183707",
    customer: "GURUNANDA",
    pieces: "Alnor oils",
    assignee: "Caren Cubides",
  },
];

// Notes:
// — 8 Occupied / 4 Reserved / 11 Available — 34.8% occupied, 52.2% occupancy rate.
// — 6 of 8 OCCUPIED doors have active tasks (LOAD or RECEIVE). 2 are ghost-occupied (DOCK63, DOCK66).
// — Active tasks: 6 outbound / 4 inbound. Mix: 60% / 40%.
// — 4 tasks IN_PROGRESS (TASK-5285558, TASK-5285010, TASK-5285835, TASK-5285880, TASK-5285485), 5 NEW (TASK-5285913, TASK-5285860, TASK-5285778, TASK-5254195, TASK-5252949).
// — ⚠ DOCK54 DOUBLE-BOOKED: Lorenzo TASK-5285010 (IN_PROGRESS ~24.4h, since Jun 4 2:13 PM) + Arnulfo TASK-5285860 (NEW, 4 DNs).
// — ⚠ DOCK53 DOUBLE-BOOKED: Arnulfo TASK-5285558 (IN_PROGRESS ~5.1h) + TASK-5285913 (NEW).
// — ⚠ DOCK65 has 2 stale RECEIVE tasks: TASK-5254195 (~38 days, Rufino), TASK-5252949 (~39 days, Caren).
// — ⚠ DOCK63 & DOCK66 ghost-occupied: dockStatus=OCCUPIED but zero active tasks.
// — ARNULFO MUNGUIA: 6 Bay 4 tasks (4 outbound, 2 inbound) — dominates Bay 4.
//   OUT: TASK-5285558 (DOCK53, ~5.1h, DN-3198181 LOADED), TASK-5285913 (DOCK53, NEW), TASK-5285860 (DOCK54, NEW, 4 DNs), TASK-5285835 (DOCK55, ~1.1h, 3 DNs → Dollar Tree).
//   IN: TASK-5285485 (DOCK51, ~6.4h, KARAKA RN-186139), TASK-5285778 (DOCK51, NEW, KARAKA RN-182888).
// — "Guru live out / in assign to Arnulfo":
//   LIVE OUT: 4 GURUNANDA outbound — TASK-5285558 (DOCK53, ~5.1h, LOADED), TASK-5285913 (DOCK53, NEW), TASK-5285860 (DOCK54, NEW, 4 DNs), TASK-5285835 (DOCK55, ~1.1h, 3 DNs → Dollar Tree).
//   LIVE IN: None — no GURUNANDA receive tasks for Arnulfo on Bay 4. 2 KARAKA receives (TASK-5285485, TASK-5285778).
//   Previous TASK-5281747 (DOCK52, DN-3190424, 28 pal) CLOSED ~10:06 AM PDT today after ~71h active.
// — Daniel Beltran: 1 task — DOCK70 (LIVE_LOAD ~25m, DN-3190330, TikTok FBT).
// — Lorenzo Rodriguez: 1 task — DOCK54 (PRE_LOAD ~24.4h, DN-3195089+DN-3195088 both LOADED). TASK-5285635 (DOCK52) CLOSED 11:41 AM.
// — Sebastian Gonzalez & Jerome Aranda: no longer active on Bay 4 (tasks completed/closed).
// — La Jolla Group (DOCK58): task completed, door now AVAILABLE.
// — Customer mix: GURUNANDA (ORG-655875) on 7 of 10 tasks, KARAKA LLC (ORG-585450) on 2, TikTok FBT on 1.
// — AGING: TASK-5285010 (Lorenzo, DOCK54, ~24.4h, since Jun 4), TASK-5254195 (~38d), TASK-5252949 (~39d).
// — Schedule %: UNAVAILABLE — schedule-summary endpoints failed with SQL errors (ER_SP_UNDECLARED_VAR).
// — Facility-wide: 63 inbound open, 70 outbound open.
// — All data sourced from live WISE/WMS queries at ~2:39 PM PDT, June 5, 2026.
