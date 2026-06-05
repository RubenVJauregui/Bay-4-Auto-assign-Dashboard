/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 5, 2026 ~10:30 AM PDT
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
  { door: "DOCK54", status: "Occupied", assignee: "Lorenzo Rodriguez", customer: "GURUNANDA", taskIds: ["TASK-5285010"], duration: "~20.3h" },
  { door: "DOCK55", status: "Occupied", assignee: "Daniel Beltran", customer: "GURUNANDA", taskIds: ["TASK-5285620"], duration: "~0.3h" },
  { door: "DOCK61", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK63", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK66", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK67", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK68", status: "Occupied", assignee: "Rufino Munguia", customer: null, taskIds: ["TASK-5285614"], duration: "~0.4h" },
  { door: "DOCK70", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "stale" },

  // ── RESERVED (8) ──
  { door: "DOCK53", status: "Reserved", assignee: "Arnulfo Munguia", customer: "GURUNANDA", taskIds: ["TASK-5285558", "TASK-5285635"], duration: "~1h / NEW" },
  { door: "DOCK58", status: "Reserved", assignee: "Jerome Aranda", customer: null, taskIds: ["TASK-5285646"], duration: "NEW" },
  { door: "DOCK60", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK62", status: "Reserved", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5285184", "TASK-5207670"], duration: "various" },
  { door: "DOCK64", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK69", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK71", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: "stale" },
  { door: "DOCK72", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: "stale" },

  // ── AVAILABLE (7) ──
  { door: "DOCK50", status: "Available", assignee: "daira gonzalez", customer: null, taskIds: ["TASK-5090739"], duration: "227d stale" },
  { door: "DOCK51", status: "Available", assignee: "Arnulfo Munguia", customer: "KARAKA", taskIds: ["TASK-5285485"], duration: "~2.3h" },
  { door: "DOCK52", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK56", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK57", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK65", status: "Available", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5283625", "TASK-5254195", "TASK-5252949"], duration: "various" },
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
  { name: "Jerome Aranda", taskCount: 3 },
  { name: "Arnulfo Munguia", taskCount: 2 },
  { name: "Rufino Munguia", taskCount: 2 },
  { name: "Daniela Gonzalez", taskCount: 2 },
  { name: "Caren Cubides", taskCount: 2 },
  { name: "Daniel Beltran", taskCount: 1 },
  { name: "Lorenzo Rodriguez", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
];

export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 5, total: 13 },
  { label: "Inbound", count: 8, total: 13 },
];

// Schedule summary UNAVAILABLE — no schedule-summary API endpoint found
export const scheduleAvailable = false;
export const scheduledInboundOrders = 0;
export const scheduledOutboundOrders = 0;
export const scheduledInboundReceived = 0;
export const scheduledOutboundLoaded = 0;
export const pctScheduledInboundReceived = 0;
export const pctScheduledOutboundLoaded = 0;

// Facility-wide open counts from WISE (LT_F1, pulled ~10:30 AM PDT June 5)
// Inbound: 26 NEW + 42 IN_PROGRESS = 68
// Outbound: 22 NEW + 43 IN_PROGRESS = 65
export const facilityInboundOpen = 68;
export const facilityOutboundOpen = 65;

export const assignments: TaskRecord[] = [
  // ────── OUTBOUND ──────
  // TASK-5285558 — DOCK53 — Arnulfo Munguia — PRE_LOAD ~1h
  // DN-3198181, GURUNANDA (ORG-655875), carrier ORG-34911, equipment=53169, freight=COLLECT, LTL
  {
    taskId: "TASK-5285558",
    dns: "DN-3198181",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285635 — DOCK53 — Jerome Aranda — LIVE_LOAD NEW
  // GURUNANDA (ORG-655875)
  {
    taskId: "TASK-5285635",
    dns: "—",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Jerome Aranda",
  },
  // TASK-5285010 — DOCK54 — Lorenzo Rodriguez — PRE_LOAD ~20.3h
  // 2 DNs: DN-3195089, DN-3195088, GURUNANDA (ORG-655875)
  {
    taskId: "TASK-5285010",
    dns: "DN-3195089, DN-3195088",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  // TASK-5285620 — DOCK55 — Daniel Beltran — LIVE_LOAD ~0.3h
  // GURUNANDA (ORG-655875)
  {
    taskId: "TASK-5285620",
    dns: "—",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniel Beltran",
  },
  // TASK-5285646 — DOCK58 — Jerome Aranda — LIVE_LOAD NEW
  {
    taskId: "TASK-5285646",
    dns: "—",
    customer: "—",
    pieces: "—",
    assignee: "Jerome Aranda",
  },

  // ────── INBOUND ──────
  // TASK-5285485 — DOCK51 — Arnulfo Munguia — RECEIVE ~2.3h
  // RN-186139, KARAKA (ORG-585450), PO=POBOK0098-UNIS, trailer=P2320
  {
    taskId: "TASK-5285485",
    dns: "RN-186139",
    customer: "KARAKA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285184 — DOCK62 — Daniela Gonzalez — RECEIVE
  // RN-5007923, GURUNANDA (ORG-655875)
  {
    taskId: "TASK-5285184",
    dns: "RN-5007923",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5207670 — DOCK62 — Caren Cubides — RECEIVE ~95d stale
  // GURUNANDA (ORG-655875)
  {
    taskId: "TASK-5207670",
    dns: "—",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Caren Cubides",
  },
  // TASK-5283625 — DOCK65 — Daniela Gonzalez — RECEIVE
  // RN-186014, GURUNANDA (ORG-655875)
  {
    taskId: "TASK-5283625",
    dns: "RN-186014",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5254195 — DOCK65 — Rufino Munguia — RECEIVE ~38d stale
  {
    taskId: "TASK-5254195",
    dns: "—",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Rufino Munguia",
  },
  // TASK-5252949 — DOCK65 — Caren Cubides — RECEIVE ~39d stale
  {
    taskId: "TASK-5252949",
    dns: "—",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Caren Cubides",
  },
  // TASK-5285614 — DOCK68 — Rufino Munguia — RECEIVE ~0.4h
  {
    taskId: "TASK-5285614",
    dns: "—",
    customer: "—",
    pieces: "—",
    assignee: "Rufino Munguia",
  },
  // TASK-5090739 — DOCK50 — daira gonzalez — RECEIVE 227d stale
  {
    taskId: "TASK-5090739",
    dns: "—",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "daira gonzalez",
  },
];

// Notes:
// — 8 Occupied / 8 Reserved / 7 Available — 69.6% occupancy rate (occupied+reserved).
// — 5 stale OCCUPIED doors (DOCK61, DOCK63, DOCK66, DOCK67, DOCK70) — no active tasks. Dock checkout may be needed.
// — 5 stale RESERVED doors (DOCK60, DOCK64, DOCK69, DOCK71, DOCK72) — assigned but no active tasks.
// — 3 AVAILABLE doors with active tasks: DOCK50 (TASK-5090739, 227d), DOCK51 (TASK-5285485, ~2.3h), DOCK65 (3 tasks).
// — 2 DOUBLE-BOOKED: DOCK53 (TASK-5285558 + TASK-5285635), DOCK62 (TASK-5285184 + TASK-5207670).
// — Active tasks: 5 outbound / 8 inbound = 38.5%/61.5% mix. Total 13 active tasks.
// — Outbound: DOCK53 (Arnulfo PRE_LOAD ~1h + Jerome LIVE_LOAD NEW), DOCK54 (Lorenzo PRE_LOAD ~20.3h),
//   DOCK55 (Daniel Beltran LIVE_LOAD ~0.3h), DOCK58 (Jerome LIVE_LOAD NEW).
// — Inbound: DOCK51 (Arnulfo KARAKA RECEIVE ~2.3h), DOCK62 (Daniela + Caren RECEIVE),
//   DOCK65 (Daniela + Rufino + Caren RECEIVE), DOCK68 (Rufino RECEIVE ~0.4h).
// — Customer mix: 11/13 GURUNANDA (ORG-655875), 1/13 KARAKA (ORG-585450), 1 unknown.
// — "Guru live out / in assign to Arnulfo":
//   LIVE OUT: TASK-5285558 (DOCK53, PRE_LOAD, GURUNANDA DN-3198181, ~1h, IN_PROGRESS, carrier ORG-34911).
//   LIVE IN: No GURUNANDA receive for Arnulfo on Bay 4. His Bay 4 receive is KARAKA TASK-5285485 (RN-186139, DOCK51).
//   Previous TASK-5281747 (DOCK52, DN-3190424, 28 pal) is CLOSED — carrier signed 6/4 16:14.
// — DOCK52 now clean AVAILABLE (TASK-5281747 concluded).
// — Lorenzo Rodriguez on DOCK54 with TASK-5285010 (~20.3h) — aging since Jun 4 2:13 PM.
// — AGING tasks: TASK-5090739 (227d), TASK-5207670 (95d), TASK-5252949 (39d), TASK-5254195 (38d).
// — Schedule % UNAVAILABLE — no schedule-summary API endpoint found (404/500 on all tried paths).
// — Facility-wide: 68 inbound open (26 NEW + 42 IN_PROGRESS), 65 outbound open (22 NEW + 43 IN_PROGRESS).
// — All data sourced from live WISE/WMS queries at ~10:30 AM PDT, June 5, 2026.
