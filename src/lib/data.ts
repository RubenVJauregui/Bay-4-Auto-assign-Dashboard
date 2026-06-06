/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 5, 2026 ~8:36 PM PDT
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
  // ── OCCUPIED (9) ── 6 active + 3 ghost ──
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "daira gonzalez",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5090739"],
    duration: "~227d ⚠",
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "Arnulfo Munguia",
    customer: "KARAKA, LLC",
    taskIds: ["TASK-5285778"],
    duration: "NEW",
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "Arnulfo Munguia",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5285558", "TASK-5285913"],
    duration: "~11.1h",
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "Lorenzo Rodriguez + Arnulfo",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5285010", "TASK-5285860"],
    duration: "~30.4h ⚠",
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: "Caren Cubides",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5207670"],
    duration: "NEW",
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: "Rufino Munguia + Caren Cubides",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5254195", "TASK-5252949"],
    duration: "~39d ⚠",
  },

  // ── GHOST-OCCUPIED (3) — OCCUPIED status, no active tasks ──
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: "⚠ Ghost — no active tasks",
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK61",
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

  // ── ASSIGNED (8) — WISE ASSIGNED status, no active tasks ──
  {
    door: "DOCK60",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK63",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK64",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK68",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK69",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK70",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK71",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK72",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },

  // ── AVAILABLE (6) — no active tasks, not occupied ──
  {
    door: "DOCK55",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK56",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK57",
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
    door: "DOCK67",
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

// Schedule summary: endpoint returned HTTP 500 — unavailable
export const scheduleAvailable = false;
export const scheduledInboundOrders = 0;
export const scheduledOutboundOrders = 0;
export const scheduledInboundReceived = 0;
export const scheduledOutboundLoaded = 0;
export const pctScheduledInboundReceived = 0;
export const pctScheduledOutboundLoaded = 0;

// Facility-wide open counts from WISE (LT_F1, pulled ~8:36 PM PDT June 5)
// Outbound: 52 open (12 NEW + 40 IN_PROGRESS)
// Inbound:  52 open (23 NEW + 29 IN_PROGRESS)
export const facilityInboundOpen = 52;
export const facilityOutboundOpen = 52;

export const assignments: TaskRecord[] = [
  // ────── OUTBOUND (4 active load tasks) ──────
  // TASK-5285558 — DOCK53 — Arnulfo Munguia — LOAD IN_PROGRESS ~11.1h
  // DN-3198181, GURUNANDA, LLC (ORG-655875), started 9:31 AM PDT
  {
    taskId: "TASK-5285558",
    dns: "DN-3198181",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285913 — DOCK53 — Arnulfo Munguia — LOAD IN_PROGRESS ~4.4h
  // DN-3203261 + DN-3203214, GURUNANDA, LLC (ORG-655875), started ~4:15 PM PDT
  {
    taskId: "TASK-5285913",
    dns: "DN-3203261 +1",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285010 — DOCK54 — Lorenzo Rodriguez — LOAD IN_PROGRESS ~30.4h ⚠
  // DN-3195089 + DN-3195088, GURUNANDA, LLC (ORG-655875), since Jun 4 2:13 PM PDT
  {
    taskId: "TASK-5285010",
    dns: "DN-3195089, DN-3195088",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  // TASK-5285860 — DOCK54 — Arnulfo Munguia — LOAD NEW
  // 4 DNs: DN-3190635, DN-3198066, DN-3198170, DN-3198529, GURUNANDA, LLC
  {
    taskId: "TASK-5285860",
    dns: "DN-3190635 +3",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },

  // ────── INBOUND (5 active receive tasks) ──────
  // TASK-5090739 — DOCK50 — daira gonzalez — RECEIVE IN_PROGRESS ~227d ⚠
  // RN-5002143, GURUNANDA, LLC (ORG-655875), since Oct 21, 2025
  {
    taskId: "TASK-5090739",
    dns: "RN-5002143",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "daira gonzalez",
  },
  // TASK-5285778 — DOCK51 — Arnulfo Munguia — RECEIVE NEW
  // RN-182888, KARAKA, LLC (ORG-585450)
  {
    taskId: "TASK-5285778",
    dns: "RN-182888",
    customer: "KARAKA LLC",
    pieces: "IRO",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5207670 — DOCK62 — Caren Cubides — RECEIVE NEW
  // RN-5006269, GURUNANDA, LLC (ORG-655875), since Mar 2
  {
    taskId: "TASK-5207670",
    dns: "RN-5006269",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Caren Cubides",
  },
  // TASK-5254195 — DOCK65 — Rufino Munguia — RECEIVE NEW ~39 days ⚠
  // RN-5007343, GURUNANDA, LLC (ORG-655875), PO 125-16768253, since Apr 28
  {
    taskId: "TASK-5254195",
    dns: "RN-5007343",
    customer: "GURUNANDA",
    pieces: "PO 125-16768253",
    assignee: "Rufino Munguia",
  },
  // TASK-5252949 — DOCK65 — Caren Cubides — RECEIVE NEW ~39 days ⚠
  // RN-183707, GURUNANDA, LLC (ORG-655875), Alnor oils, since Apr 27
  {
    taskId: "TASK-5252949",
    dns: "RN-183707",
    customer: "GURUNANDA",
    pieces: "Alnor oils",
    assignee: "Caren Cubides",
  },
];

// Notes:
// — 9 Occupied / 8 Assigned / 6 Available — 39.1% occupied, 73.9% occupancy rate (incl. assigned).
// — 6 of 9 OCCUPIED doors have active tasks (LOAD or RECEIVE). 3 are ghost-occupied (DOCK52, DOCK61, DOCK66).
// — Active tasks: 4 outbound / 5 inbound. Mix: 44% / 56%.
// — 4 tasks IN_PROGRESS (TASK-5285558, TASK-5285913, TASK-5285010, TASK-5090739), 5 NEW.
// — ⚠ DOCK54 DOUBLE-BOOKED: Lorenzo TASK-5285010 (IN_PROGRESS ~30.4h) + Arnulfo TASK-5285860 (NEW, 4 DNs).
// — ⚠ DOCK53 DOUBLE-BOOKED: Arnulfo TASK-5285558 (IN_PROGRESS ~11.1h) + TASK-5285913 (IN_PROGRESS ~4.4h).
// — ⚠ DOCK65 has 2 stale RECEIVE tasks: TASK-5254195 (~39 days, Rufino), TASK-5252949 (~39 days, Caren).
// — ⚠ DOCK52, DOCK61, DOCK66 ghost-occupied: dockStatus=OCCUPIED but zero active tasks.
// — ⚠ TASK-5090739 (daira gonzalez, DOCK50) critically stale at ~227 days (since Oct 2025).
// — ARNULFO MUNGUIA: 4 Bay 4 tasks (3 outbound, 1 inbound) — 3 LOAD GURUNANDA + 1 RECEIVE KARAKA.
//   OUT: TASK-5285558 (DOCK53, ~11.1h, DN-3198181), TASK-5285913 (DOCK53, ~4.4h, DN-3203261+DN-3203214), TASK-5285860 (DOCK54, NEW, 4 DNs).
//   IN: TASK-5285778 (DOCK51, NEW, KARAKA RN-182888).
// — "Guru live out / in assign to Arnulfo":
//   LIVE OUT: 3 GURUNANDA outbound — TASK-5285558 (DOCK53, ~11.1h), TASK-5285913 (DOCK53, ~4.4h), TASK-5285860 (DOCK54, NEW, 4 DNs).
//   LIVE IN: None — no GURUNANDA receive tasks for Arnulfo on Bay 4. 1 KARAKA receive (TASK-5285778, DOCK51).
//   Previous TASK-5285835 (DOCK55, Dollar Tree, 3 DNs) CLOSED ~2:38 PM PDT today.
//   Previous TASK-5285485 (DOCK51, KARAKA RN-186139) no longer active — likely closed.
// — Daniel Beltran: off Bay 4 — TASK-5285880 (DOCK70, TikTok FBT) CLOSED ~3:04 PM PDT today.
// — Lorenzo Rodriguez: 1 task — DOCK54 (LOAD ~30.4h, DN-3195089+DN-3195088). Needs closing attention.
// — Caren Cubides: 2 tasks — DOCK62 (RN-5006269, NEW), DOCK65 (RN-183707, ~39d).
// — daira gonzalez: 1 task — DOCK50 (RN-5002143, ~227d stale since Oct 2025).
// — Rufino Munguia: 1 task — DOCK65 (RN-5007343, ~39d).
// — DOCK55 returned to Available (TASK-5285835 Dollar Tree CLOSED 2:38 PM).
// — DOCK70 now Assigned (TASK-5285880 TikTok FBT CLOSED 3:04 PM, Daniel Beltran off Bay 4).
// — DOCK63 & DOCK66 still ghost-occupied; DOCK61 newly ghost-occupied.
// — WISE door status labels changed: now shows ASSIGNED (was Reserved) for 8 doors.
// — Customer mix: GURUNANDA on 7 of 9 tasks, KARAKA on 1, plus 1 ghost.
// — AGING: TASK-5285010 (~30.4h, Lorenzo), TASK-5090739 (~227d, daira), TASK-5254195 (~39d), TASK-5252949 (~39d).
// — Schedule %: UNAVAILABLE — schedule-summary endpoint returned HTTP 500.
// — Facility-wide parity: 52 inbound open = 52 outbound open.
// — All data sourced from live WISE/WMS queries at ~8:36 PM PDT, June 5, 2026.
