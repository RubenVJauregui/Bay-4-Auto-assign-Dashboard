/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 5, 2026 ~11:30 AM PDT
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
  // ── OCCUPIED (8) ──
  { door: "DOCK52", status: "Occupied", assignee: "Lorenzo Rodriguez", customer: "GURUNANDA", taskIds: ["TASK-5285635"], duration: "~1.1h" },
  { door: "DOCK54", status: "Occupied", assignee: "Lorenzo Rodriguez", customer: "GURUNANDA", taskIds: ["TASK-5285010"], duration: "~21.4h" },
  { door: "DOCK58", status: "Occupied", assignee: "Daniel Beltran", customer: "GURUNANDA", taskIds: ["TASK-5285646"], duration: "~1h" },
  { door: "DOCK61", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK63", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK66", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK67", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK68", status: "Occupied", assignee: "Rufino Munguia", customer: "GURUNANDA", taskIds: ["TASK-5285614"], duration: "~1.5h" },

  // ── RESERVED (7) ──
  { door: "DOCK60", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK62", status: "Reserved", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5285184"], duration: "~18.9h" },
  { door: "DOCK64", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK69", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK70", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK71", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK72", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: "stale" },

  // ── AVAILABLE (8) — D51, D53, D65 have active tasks despite dock status showing Available ──
  { door: "DOCK50", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK51", status: "Available", assignee: "Arnulfo Munguia", customer: "KARAKA", taskIds: ["TASK-5285485"], duration: "~3.3h ⚠" },
  { door: "DOCK53", status: "Available", assignee: "Arnulfo Munguia", customer: "GURUNANDA", taskIds: ["TASK-5285558"], duration: "~2.4h ⚠" },
  { door: "DOCK55", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK56", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK57", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK65", status: "Available", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5283625"], duration: "~44.3h ⚠" },
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
  { name: "Lorenzo Rodriguez", taskCount: 2 },
  { name: "Daniela Gonzalez", taskCount: 2 },
  { name: "Arnulfo Munguia", taskCount: 2 },
  { name: "Daniel Beltran", taskCount: 1 },
  { name: "Rufino Munguia", taskCount: 1 },
];

// 4 outbound + 4 inbound = 8 active tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 8 },
  { label: "Inbound", count: 4, total: 8 },
];

// Schedule summary: outbound returned 2,734 items; inbound API timed out twice
export const scheduleAvailable = false;
export const scheduledInboundOrders = 0;
export const scheduledOutboundOrders = 0;
export const scheduledInboundReceived = 0;
export const scheduledOutboundLoaded = 0;
export const pctScheduledInboundReceived = 0;
export const pctScheduledOutboundLoaded = 0;

// Facility-wide open counts from WISE (LT_F1, pulled ~11:30 AM PDT June 5)
// Outbound: 47 IN_PROGRESS + 20 NEW = 67
// Inbound:  42 IN_PROGRESS + 25 NEW = 67
export const facilityInboundOpen = 67;
export const facilityOutboundOpen = 67;

export const assignments: TaskRecord[] = [
  // ────── OUTBOUND ──────
  // TASK-5285558 — DOCK53 — Arnulfo Munguia — PRE_LOAD ~2.4h
  // LOAD-5030114, DN-3198181, GURUNANDA (ORG-655875), Seal A120211
  {
    taskId: "TASK-5285558",
    dns: "DN-3198181",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285635 — DOCK52 — Lorenzo Rodriguez — LIVE_LOAD ~1.1h
  // LOAD-5029929, DN-3193076, GURUNANDA (ORG-655875)
  {
    taskId: "TASK-5285635",
    dns: "DN-3193076",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  // TASK-5285010 — DOCK54 — Lorenzo Rodriguez — PRE_LOAD ~21.4h
  // LOAD-5030073, LOAD-5030195, GURUNANDA (ORG-655875)
  {
    taskId: "TASK-5285010",
    dns: "LOAD-5030073, LOAD-5030195",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  // TASK-5285646 — DOCK58 — Daniel Beltran — LIVE_LOAD ~1h
  // LOAD-5028979, DN-3175802 + DN-3180188, GURUNANDA (ORG-655875)
  {
    taskId: "TASK-5285646",
    dns: "DN-3175802, DN-3180188",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniel Beltran",
  },

  // ────── INBOUND ──────
  // TASK-5285485 — DOCK51 — Arnulfo Munguia — RECEIVE ~3.3h
  // RN-186139, KARAKA (ORG-585450), PO=POBOK0098-UNIS
  {
    taskId: "TASK-5285485",
    dns: "RN-186139",
    customer: "KARAKA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285184 — DOCK62 — Daniela Gonzalez — RECEIVE ~18.9h
  // RN-5007923, GURUNANDA (ORG-655875)
  {
    taskId: "TASK-5285184",
    dns: "RN-5007923",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5283625 — DOCK65 — Daniela Gonzalez — RECEIVE ~44.3h
  // RN-186014, GURUNANDA (ORG-655875)
  {
    taskId: "TASK-5283625",
    dns: "RN-186014",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5285614 — DOCK68 — Rufino Munguia — RECEIVE ~1.5h
  // RN-186441, GURUNANDA (ORG-655875)
  {
    taskId: "TASK-5285614",
    dns: "RN-186441",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Rufino Munguia",
  },
];

// Notes:
// — 8 Occupied / 7 Reserved / 8 Available — 65.2% occupancy rate (occupied+reserved).
// — 4 outbound / 4 inbound = 50%/50% mix. Total 8 active tasks across Bay 4.
// — 4 stale OCCUPIED doors (DOCK61, DOCK63, DOCK66, DOCK67) — no active tasks. Dock checkout may be needed.
// — 5 stale RESERVED doors (DOCK60, DOCK64, DOCK69, DOCK70, DOCK71, DOCK72) — assigned but no active tasks. (6 doors)
// — 3 AVAILABLE doors with active tasks ⚠: DOCK51 (TASK-5285485 KARAKA), DOCK53 (TASK-5285558 GURUNANDA), DOCK65 (TASK-5283625 GURUNANDA). Dock status may be stale.
// — Customer mix: 7/8 GURUNANDA (ORG-655875), 1/8 KARAKA (ORG-585450).
// — "Guru live out / in assign to Arnulfo":
//   LIVE OUT: TASK-5285558 (DOCK53, PRE_LOAD, GURUNANDA DN-3198181, ~2.4h, Seal A120211).
//   LIVE IN: No GURUNANDA receive for Arnulfo on Bay 4. His Bay 4 receive is KARAKA TASK-5285485 (RN-186139, DOCK51, ~3.3h).
//   Previous TASK-5281747 (DOCK52, DN-3190424, 28 pal) is CLOSED — carrier signed 6/4 16:14.
// — Arnulfo Munguia: 2 active Bay 4 tasks — 1 outbound (DOCK53 GURUNANDA) + 1 inbound (DOCK51 KARAKA).
// — Lorenzo Rodriguez: 2 tasks — DOCK52 (LIVE_LOAD ~1.1h) + DOCK54 (PRE_LOAD ~21.4h). DOCK54 significantly aging since Jun 4 2:04 PM.
// — Daniela Gonzalez: 2 tasks — DOCK62 (RECEIVE ~18.9h) + DOCK65 (RECEIVE ~44.3h, since Jun 3 3:12 PM).
// — Daniel Beltran: 1 task — DOCK58 (LIVE_LOAD ~1h).
// — Rufino Munguia: 1 task — DOCK68 (RECEIVE ~1.5h).
// — All 8 active tasks are IN_PROGRESS. No NEW tasks on Bay 4.
// — AGING tasks: TASK-5283625 (Daniela, DOCK65, ~44.3h), TASK-5285010 (Lorenzo, DOCK54, ~21.4h).
// — Schedule % UNAVAILABLE — inbound schedule-summary API timed out; outbound returned 2,734 items but no received/loaded breakdown.
// — Facility-wide: 67 inbound open (42 IN_PROGRESS + 25 NEW), 67 outbound open (47 IN_PROGRESS + 20 NEW).
// — All data sourced from live WISE/WMS queries at ~11:30 AM PDT, June 5, 2026.
