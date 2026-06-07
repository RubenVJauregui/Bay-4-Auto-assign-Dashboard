/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 7, 2026 ~5:00 AM PDT
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
    duration: "~1d 10h",
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "Arnulfo Munguia",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5285558", "TASK-5285913"],
    duration: "~1d 12h",
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "Lorenzo Rodriguez + Arnulfo",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5285010", "TASK-5285860"],
    duration: "~2d 8h ⚠",
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: "Caren Cubides",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5207670"],
    duration: "~97d ⚠",
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: "Rufino Munguia",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5254195"],
    duration: "~40d ⚠",
  },

  // ── GHOST-OCCUPIED (2) — dockStatus=OCCUPIED, no active tasks ──
  {
    door: "DOCK52",
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

  // ── RESERVED (3) — dockStatus=ASSIGNED, no active tasks ──
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

  // ── AVAILABLE (12) ── no active tasks, not occupied ──
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
  { name: "Lorenzo Rodriguez", taskCount: 1 },
  { name: "Caren Cubides", taskCount: 1 },
  { name: "Rufino Munguia", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
];

// 4 outbound + 4 inbound = 8 active tasks — 50% outbound / 50% inbound
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 8 },
  { label: "Inbound", count: 4, total: 8 },
];

// Schedule summary: BAM schedule-summary endpoints return SQL parse errors
export const scheduleAvailable = false;
export const scheduledInboundOrders = 0;
export const scheduledOutboundOrders = 0;
export const scheduledInboundReceived = 0;
export const scheduledOutboundLoaded = 0;
export const pctScheduledInboundReceived = 0;
export const pctScheduledOutboundLoaded = 0;

// Facility-wide from WISE (LT_F1, pulled ~5:00 AM PDT June 7)
// All-time totals: inbound 12,226 / outbound 14,467
export const facilityInboundOpen = 12226;
export const facilityOutboundOpen = 14467;

export const assignments: TaskRecord[] = [
  // ────── OUTBOUND (4 active load tasks) ──────
  // TASK-5285558 — DOCK53 — Arnulfo Munguia — LOAD IN_PROGRESS ~1d 12h
  // LOAD-5030114, GURUNANDA, LLC (ORG-655875), started Jun 5 4:31 PM PDT
  {
    taskId: "TASK-5285558",
    dns: "DN-3198181",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285913 — DOCK53 — Arnulfo Munguia — LOAD IN_PROGRESS ~1d 6h
  // LOAD-5030247 + LOAD-5030248, GURUNANDA, LLC (ORG-655875), started Jun 5 11:15 PM PDT
  {
    taskId: "TASK-5285913",
    dns: "DN-3203261 +1",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285010 — DOCK54 — Lorenzo Rodriguez — LOAD IN_PROGRESS ~2d 8h ⚠
  // LOAD-5030073 + LOAD-5030195, GURUNANDA, LLC (ORG-655875), since Jun 4 9:13 PM PDT
  {
    taskId: "TASK-5285010",
    dns: "DN-3195089, DN-3195088",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  // TASK-5285860 — DOCK54 — Arnulfo Munguia — LOAD NEW → ~1d 8h
  // 4 loads: LOAD-5030111, LOAD-5030113, LOAD-5030115, LOAD-5029667, GURUNANDA, LLC
  {
    taskId: "TASK-5285860",
    dns: "DN-3190635 +3",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },

  // ────── INBOUND (4 active receive tasks) ──────
  // TASK-5090739 — DOCK50 — daira gonzalez — RECEIVE IN_PROGRESS ~229d ⚠
  // RN-5002143, GURUNANDA, LLC (ORG-655875), since Oct 21, 2025
  {
    taskId: "TASK-5090739",
    dns: "RN-5002143",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "daira gonzalez",
  },
  // TASK-5285778 — DOCK51 — Arnulfo Munguia — RECEIVE NEW → ~1d 10h
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
];

// Notes:
// — 8 Occupied / 3 Reserved / 12 Available — 34.8% occupied, 47.8% occupancy rate (incl. reserved).
// — 6 of 8 OCCUPIED doors have active tasks (LOAD or RECEIVE). 2 are ghost-occupied (DOCK52, DOCK66).
// — Active tasks: 4 outbound / 4 inbound. Mix: 50% / 50%.
// — 3 tasks IN_PROGRESS (TASK-5285558, TASK-5285913, TASK-5285010), 5 NEW.
// — ⚠ DOCK54 DOUBLE-BOOKED: Lorenzo TASK-5285010 (IN_PROGRESS ~2d 8h) + Arnulfo TASK-5285860 (NEW → ~1d 8h, 4 DNs).
// — ⚠ DOCK53 DOUBLE-BOOKED: Arnulfo TASK-5285558 (IN_PROGRESS ~1d 12h) + TASK-5285913 (IN_PROGRESS ~1d 6h).
// — ⚠ DOCK52 is a NEW GHOST (was Available in prior pull). YMS shows OCCUPIED with ET-1104275 but zero active load/receive tasks.
// — ⚠ DOCK66 ghost-occupied: YMS OCCUPIED, no active tasks.
// — ⚠ TASK-5090739 (daira gonzalez, DOCK50) critically stale at ~229 days (since Oct 2025).
// — ✅ DOCK63 ghost CLEARED — now Available (was OCCUPIED with no tasks in prior pull).
// — ✅ TASK-5252949 (Caren Cubides, DOCK65, RN-183707) RESOLVED — no longer active on Bay 4.
// — ARNULFO MUNGUIA: 4 Bay 4 tasks (3 outbound, 1 inbound) — 3 LOAD GURUNANDA + 1 RECEIVE KARAKA.
//   OUT: TASK-5285558 (DOCK53, ~1d 12h), TASK-5285913 (DOCK53, ~1d 6h), TASK-5285860 (DOCK54, ~1d 8h, 4 DNs).
//   IN: TASK-5285778 (DOCK51, ~1d 10h, KARAKA RN-182888).
// — "Guru live out / in assign to Arnulfo":
//   LIVE OUT: 3 GURUNANDA outbound — TASK-5285558 (DOCK53, ~1d 12h), TASK-5285913 (DOCK53, ~1d 6h), TASK-5285860 (DOCK54, ~1d 8h, 4 DNs).
//   LIVE IN: None — no GURUNANDA receive tasks for Arnulfo on Bay 4. 1 KARAKA receive (TASK-5285778, DOCK51, ~1d 10h).
// — Lorenzo Rodriguez: 1 task — DOCK54 (LOAD ~2d 8h). Aging concern — needs closing attention.
// — Caren Cubides: 1 task — DOCK62 (RN-5006269, ~97d). Was 2 tasks; TASK-5252949 (DOCK65) resolved.
// — daira gonzalez: 1 task — DOCK50 (RN-5002143, ~229d stale since Oct 2025).
// — Rufino Munguia: 1 task — DOCK65 (RN-5007343, ~40d).
// — Customer mix: GURUNANDA (ORG-655875) on 7 of 8 active tasks, KARAKA LLC (ORG-585450) on 1.
// — AGING: TASK-5285010 (~2d 8h, Lorenzo), TASK-5090739 (~229d, daira), TASK-5254195 (~40d), TASK-5207670 (~97d).
// — Key changes since Jun 6 ~11:35 PM pull:
//   - DOCK63 ghost cleared → Available. DOCK52 is NEW ghost (was Available).
//   - TASK-5252949 (Caren, DOCK65) resolved → mix now 4/4 (50/50) vs 4/5 (44/56).
//   - Caren now 1 task (was 2). Occupied/Reserved/Available counts unchanged (8/3/12).
//   - Door durations: TASK-5285558 ~1d 8h→~1d 12h, TASK-5285913 ~1d 2h→~1d 6h, TASK-5285860 ~1d 3h→~1d 8h, TASK-5285010 ~2d 3h→~2d 8h.
// — Facility-wide: All-time totals 12,226 inbound / 14,467 outbound (all statuses).
// — Schedule %: UNAVAILABLE — BAM schedule-summary endpoints return SQL parse errors.
// — All data sourced from live WISE/WMS queries at ~5:00 AM PDT, June 7, 2026.
