/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 6, 2026 ~11:35 PM PDT
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
  // ── OCCUPIED (8) ── 6 active + 2 ghost ──
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "daira gonzalez",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5090739"],
    duration: "~229d ⚠",
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "Arnulfo Munguia",
    customer: "KARAKA, LLC",
    taskIds: ["TASK-5285778"],
    duration: "~1d",
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "Arnulfo Munguia",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5285558", "TASK-5285913"],
    duration: "~1d 8h",
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "Lorenzo Rodriguez + Arnulfo",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5285010", "TASK-5285860"],
    duration: "~2d 3h ⚠",
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: "Caren Cubides",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5207670"],
    duration: "~96d ⚠",
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: "Rufino Munguia + Caren Cubides",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5254195", "TASK-5252949"],
    duration: "~40d ⚠",
  },

  // ── GHOST-OCCUPIED (2) — dockStatus=OCCUPIED, no active tasks ──
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: "⚠ Ghost — no active tasks",
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: "⚠ Ghost — no active tasks",
    taskIds: [],
    duration: null,
  },

  // ── RESERVED (3) — dockStatus=RESERVED, no active tasks ──
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

  // ── AVAILABLE (12) ── no active tasks, not occupied/reserved ──
  {
    door: "DOCK52",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK55",
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
    door: "DOCK70",
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
  { name: "Arnulfo Munguia", taskCount: 4 },
  { name: "Caren Cubides", taskCount: 2 },
  { name: "Lorenzo Rodriguez", taskCount: 1 },
  { name: "Rufino Munguia", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
];

// 4 outbound + 5 inbound = 9 active tasks — 44% outbound / 56% inbound
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 9 },
  { label: "Inbound", count: 5, total: 9 },
];

// Schedule summary: all BAM schedule-summary endpoints return SQL parse errors
export const scheduleAvailable = false;
export const scheduledInboundOrders = 0;
export const scheduledOutboundOrders = 0;
export const scheduledInboundReceived = 0;
export const scheduledOutboundLoaded = 0;
export const pctScheduledInboundReceived = 0;
export const pctScheduledOutboundLoaded = 0;

// Facility-wide open counts from WISE (LT_F1, pulled ~11:35 PM PDT June 6)
// Outbound: 50 open (12 NEW + 38 IN_PROGRESS)
// Inbound:  50 open (23 NEW + 27 IN_PROGRESS)
export const facilityInboundOpen = 50;
export const facilityOutboundOpen = 50;

export const assignments: TaskRecord[] = [
  // ────── OUTBOUND (4 active load tasks) ──────
  // TASK-5285558 — DOCK53 — Arnulfo Munguia — LOAD IN_PROGRESS ~1d 8h
  // LOAD-5030114, GURUNANDA, LLC (ORG-655875), started Jun 5 9:04 AM PDT
  {
    taskId: "TASK-5285558",
    dns: "DN-3198181",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285913 — DOCK53 — Arnulfo Munguia — LOAD IN_PROGRESS ~1d 2h
  // LOAD-5030247 + LOAD-5030248, GURUNANDA, LLC (ORG-655875), started Jun 5 2:21 PM PDT
  {
    taskId: "TASK-5285913",
    dns: "DN-3203261 +1",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285010 — DOCK54 — Lorenzo Rodriguez — LOAD IN_PROGRESS ~2d 3h ⚠
  // LOAD-5030073 + LOAD-5030195, GURUNANDA, LLC (ORG-655875), since Jun 4 2:04 PM PDT
  {
    taskId: "TASK-5285010",
    dns: "DN-3195089, DN-3195088",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  // TASK-5285860 — DOCK54 — Arnulfo Munguia — LOAD NEW → ~1d 3h
  // 4 loads: LOAD-5030111, LOAD-5030113, LOAD-5030115, LOAD-5029667, GURUNANDA, LLC
  {
    taskId: "TASK-5285860",
    dns: "DN-3190635 +3",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },

  // ────── INBOUND (5 active receive tasks) ──────
  // TASK-5090739 — DOCK50 — daira gonzalez — RECEIVE IN_PROGRESS ~229d ⚠
  // RN-5002143, GURUNANDA, LLC (ORG-655875), since Oct 21, 2025
  {
    taskId: "TASK-5090739",
    dns: "RN-5002143",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "daira gonzalez",
  },
  // TASK-5285778 — DOCK51 — Arnulfo Munguia — RECEIVE NEW → ~1d
  // RN-182888 (POKRK2135), KARAKA, LLC (ORG-585450)
  {
    taskId: "TASK-5285778",
    dns: "RN-182888",
    customer: "KARAKA LLC",
    pieces: "IRO",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5207670 — DOCK62 — Caren Cubides — RECEIVE NEW
  // RN-5006269 (B00393665), GURUNANDA, LLC (ORG-655875), since Mar 2
  {
    taskId: "TASK-5207670",
    dns: "RN-5006269",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Caren Cubides",
  },
  // TASK-5254195 — DOCK65 — Rufino Munguia — RECEIVE NEW ~40 days ⚠
  // RN-5007343 (GKSBLR26044), GURUNANDA, LLC (ORG-655875), since Apr 28
  {
    taskId: "TASK-5254195",
    dns: "RN-5007343",
    customer: "GURUNANDA",
    pieces: "PO 125-16768253",
    assignee: "Rufino Munguia",
  },
  // TASK-5252949 — DOCK65 — Caren Cubides — RECEIVE NEW ~40 days ⚠
  // RN-183707 (Alnor oils), GURUNANDA, LLC (ORG-655875), since Apr 27
  {
    taskId: "TASK-5252949",
    dns: "RN-183707",
    customer: "GURUNANDA",
    pieces: "Alnor oils",
    assignee: "Caren Cubides",
  },
];

// Notes:
// — 8 Occupied / 3 Reserved / 12 Available — 34.8% occupied, 47.8% occupancy rate (incl. reserved).
// — 6 of 8 OCCUPIED doors have active tasks (LOAD or RECEIVE). 2 are ghost-occupied (DOCK63, DOCK66).
// — Active tasks: 4 outbound / 5 inbound. Mix: 44% / 56%.
// — 4 tasks IN_PROGRESS (TASK-5285558, TASK-5285913, TASK-5285010, TASK-5090739), 5 NEW.
// — ⚠ DOCK54 DOUBLE-BOOKED: Lorenzo TASK-5285010 (IN_PROGRESS ~2d 3h) + Arnulfo TASK-5285860 (NEW → ~1d 3h, 4 DNs).
// — ⚠ DOCK53 DOUBLE-BOOKED: Arnulfo TASK-5285558 (IN_PROGRESS ~1d 8h) + TASK-5285913 (IN_PROGRESS ~1d 2h).
// — ⚠ DOCK65 has 2 stale RECEIVE tasks: TASK-5254195 (~40 days, Rufino), TASK-5252949 (~40 days, Caren).
// — ⚠ DOCK63, DOCK66 ghost-occupied: dockStatus=OCCUPIED but zero active tasks.
// — ⚠ DOCK63 was Reserved in previous pull — now a new ghost.
// — ⚠ TASK-5090739 (daira gonzalez, DOCK50) critically stale at ~229 days (since Oct 2025).
// — ✅ DOCK52 and DOCK61 ghosts CLEARED — now Available.
// — ARNULFO MUNGUIA: 4 Bay 4 tasks (3 outbound, 1 inbound) — 3 LOAD GURUNANDA + 1 RECEIVE KARAKA.
//   OUT: TASK-5285558 (DOCK53, ~1d 8h, DN-3198181), TASK-5285913 (DOCK53, ~1d 2h, DN-3203261+1), TASK-5285860 (DOCK54, ~1d 3h, 4 DNs).
//   IN: TASK-5285778 (DOCK51, ~1d, KARAKA RN-182888).
// — "Guru live out / in assign to Arnulfo":
//   LIVE OUT: 3 GURUNANDA outbound — TASK-5285558 (DOCK53, ~1d 8h), TASK-5285913 (DOCK53, ~1d 2h), TASK-5285860 (DOCK54, ~1d 3h, 4 DNs).
//   LIVE IN: None — no GURUNANDA receive tasks for Arnulfo on Bay 4. 1 KARAKA receive (TASK-5285778, DOCK51).
// — Lorenzo Rodriguez: 1 task — DOCK54 (LOAD ~2d 3h, DN-3195089+DN-3195088). Aging concern — needs closing attention.
// — Caren Cubides: 2 tasks — DOCK62 (RN-5006269, ~96d), DOCK65 (RN-183707, ~40d).
// — daira gonzalez: 1 task — DOCK50 (RN-5002143, ~229d stale since Oct 2025).
// — Rufino Munguia: 1 task — DOCK65 (RN-5007343, ~40d).
// — Customer mix: GURUNANDA (ORG-655875) on 7 of 9 active tasks, KARAKA LLC (ORG-585450) on 1. Ghost: DOCK63, DOCK66.
// — AGING: TASK-5285010 (~2d 3h, Lorenzo), TASK-5090739 (~229d, daira), TASK-5254195 (~40d), TASK-5252949 (~40d), TASK-5207670 (~96d).
// — Key changes since Jun 5 pull: DOCK52 ghost cleared → Available. DOCK61 ghost cleared → Available. DOCK63 new ghost. Reserved 8→3. Available 6→12.
// — Facility-wide: 50 inbound open / 50 outbound open — parity maintained (was 52/52).
// — Schedule %: UNAVAILABLE — all BAM schedule-summary endpoints return SQL parse errors.
// — All data sourced from live WISE/WMS queries at ~11:35 PM PDT, June 6, 2026.
