/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 5, 2026 ~08:30 PDT
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
  // ── OCCUPIED (14) ──
  { door: "DOCK50", status: "Occupied", assignee: "Daniel Beltran", customer: "GURUNANDA", taskIds: ["TASK-5285378"], duration: "NEW" },
  { door: "DOCK51", status: "Occupied", assignee: "Arnulfo Munguia", customer: "KARAKA", taskIds: ["TASK-5285485"], duration: "~0.5h" },
  { door: "DOCK52", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK53", status: "Occupied", assignee: "Lorenzo Rodriguez", customer: "GURUNANDA", taskIds: ["TASK-5284794"], duration: "~13.5h" },
  { door: "DOCK54", status: "Occupied", assignee: "Lorenzo Rodriguez", customer: "GURUNANDA", taskIds: ["TASK-5285010"], duration: "~11.5h" },
  { door: "DOCK61", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK62", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5285184"], duration: "~9.1h" },
  { door: "DOCK63", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK65", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5283625"], duration: "~29.2h" },
  { door: "DOCK66", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK67", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK68", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK69", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK70", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "stale" },

  // ── RESERVED (5) ──
  { door: "DOCK55", status: "Reserved", assignee: "Adriana Nunez", customer: "NORTH STAR CONTAINER", taskIds: ["TASK-5285500"], duration: "NEW" },
  { door: "DOCK60", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK64", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK71", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK72", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },

  // ── AVAILABLE (4) ──
  { door: "DOCK56", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK57", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK58", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
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
  { name: "Arnulfo Munguia", taskCount: 1 },
  { name: "Daniel Beltran", taskCount: 1 },
  { name: "Adriana Nunez", taskCount: 1 },
];

export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 7 },
  { label: "Inbound", count: 3, total: 7 },
];

// Schedule summary UNAVAILABLE — no schedule-summary API found; entry-ticket activity returned 500
export const scheduleAvailable = false;
export const scheduledInboundOrders = 0;
export const scheduledOutboundOrders = 0;
export const scheduledInboundReceived = 0;
export const scheduledOutboundLoaded = 0;
export const pctScheduledInboundReceived = 0;
export const pctScheduledOutboundLoaded = 0;

// Facility-wide open counts from WISE (LT_F1, pulled ~08:30 PDT June 5)
// Inbound: 23 NEW + 46 IN_PROGRESS = 69
// Outbound: 18 NEW + 39 IN_PROGRESS = 57
export const facilityInboundOpen = 69;
export const facilityOutboundOpen = 57;

export const assignments: TaskRecord[] = [
  // ────── OUTBOUND ──────
  // TASK-5285378 — DOCK50 — Daniel Beltran — LIVE_LOAD NEW
  // DN-3193080, GURUNANDA (ORG-655875)
  {
    taskId: "TASK-5285378",
    dns: "DN-3193080",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniel Beltran",
  },
  // TASK-5284794 — DOCK53 — Lorenzo Rodriguez — PRE_LOAD ~13.5h
  // 8 DNs: DN-3197870 + DN-3198074 + DN-3195086 + DN-3198789 + DN-3195098 + DN-3190634 + DN-3197866 + DN-3194936
  {
    taskId: "TASK-5284794",
    dns: "DN-3197870 + 7 more",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  // TASK-5285010 — DOCK54 — Lorenzo Rodriguez — PRE_LOAD ~11.5h
  // 2 DNs: DN-3195089 + DN-3195088
  {
    taskId: "TASK-5285010",
    dns: "DN-3195089, DN-3195088",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  // TASK-5285500 — DOCK55 — Adriana Nunez — LIVE_LOAD NEW
  // DN-5188763, NORTH STAR CONTAINER (ORG-436686)
  {
    taskId: "TASK-5285500",
    dns: "DN-5188763",
    customer: "NORTH STAR",
    pieces: "—",
    assignee: "Adriana Nunez",
  },

  // ────── INBOUND ──────
  // TASK-5285485 — DOCK51 — Arnulfo Munguia — RECEIVE ~0.5h
  // RN-186139, KARAKA (ORG-585450)
  {
    taskId: "TASK-5285485",
    dns: "RN-186139",
    customer: "KARAKA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285184 — DOCK62 — Daniela Gonzalez — RECEIVE ~9.1h
  // RN-5007923, GURUNANDA (ORG-655875)
  {
    taskId: "TASK-5285184",
    dns: "RN-5007923",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5283625 — DOCK65 — Daniela Gonzalez — RECEIVE ~29.2h
  // RN-186014, GURUNANDA (ORG-655875)
  {
    taskId: "TASK-5283625",
    dns: "RN-186014",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
];

// Notes:
// — 14 Occupied / 5 Reserved / 4 Available — 82.6% occupancy rate (occupied+reserved). Bay 4 heavily loaded.
// — 10 doors show stale OCCUPIED status with no active task (DOCK52, DOCK61, DOCK63, DOCK66-DOCK70). Dock checkout may be needed.
// — Active tasks: 4 outbound / 3 inbound = 57%/43% mix.
// — Outbound: DOCK50 (Daniel Beltran, LIVE_LOAD NEW), DOCK53 (Lorenzo Rodriguez, PRE_LOAD ~13.5h, 8 DNs),
//   DOCK54 (Lorenzo Rodriguez, PRE_LOAD ~11.5h, 2 DNs), DOCK55 (Adriana Nunez, LIVE_LOAD NEW, NORTH STAR).
// — Inbound: DOCK51 (Arnulfo Munguia, RECEIVE ~0.5h, KARAKA), DOCK62 (Daniela Gonzalez, RECEIVE ~9.1h, GURUNANDA),
//   DOCK65 (Daniela Gonzalez, RECEIVE ~29.2h, GURUNANDA).
// — Customer mix: 5/7 GURUNANDA (ORG-655875), 1/7 KARAKA (ORG-585450), 1/7 NORTH STAR CONTAINER (ORG-436686).
// — Daniel Beltran newly assigned to DOCK50 (TASK-5285378, LIVE_LOAD, DN-3193080).
// — Adriana Nunez newly assigned to DOCK55 (TASK-5285500, LIVE_LOAD, NORTH STAR CONTAINER DN-5188763).
// — Arnulfo Munguia on DOCK51 with KARAKA receive — his first Bay 4 task this shift (was DOCK52 GURUNANDA previously).
// — "Guru live out / in assign to Arnulfo": NO active GURUNANDA tasks for Arnulfo on Bay 4.
//   Previous TASK-5281747 (DOCK52, GURUNANDA PRE_LOAD, DN-3190424) is CLOSED. DOCK52 now stale OCCUPIED.
//   Previous TASK-5284457 (GURUNANDA LIVE_LOAD) and TASK-5284360 (GURUNANDA PRE_LOAD) both CLOSED Jun 4.
//   Arnulfo's active Bay 4 task is KARAKA TASK-5285485 (RECEIVE, RN-186139, DOCK51).
// — DOCK52 stale OCCUPIED — TASK-5281747 concluded, carrier signed 6/4 16:14, but dock not released.
// — DOCK51 door API shows AVAILABLE but has active IN_PROGRESS task — door status lags task assignment.
// — Schedule % UNAVAILABLE — no schedule-summary API found; entry-ticket activity returned 500 timeout.
// — Facility-wide: 69 inbound open (23 NEW + 46 IN_PROGRESS), 57 outbound open (18 NEW + 39 IN_PROGRESS).
// — Piece counts unavailable from load-task API for this pull.
// — All data sourced from live WISE/WMS queries at ~08:30 PDT, June 5, 2026.
