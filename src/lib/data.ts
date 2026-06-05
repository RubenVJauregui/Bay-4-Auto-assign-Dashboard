/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 5, 2026 ~04:30 PDT
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
  // ── OCCUPIED (5) ──
  { door: "DOCK50", status: "Occupied", assignee: "daira gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5090739"], duration: "~5,439h" },
  { door: "DOCK55", status: "Occupied", assignee: "Jerome Aranda", customer: "KARAKA", taskIds: ["TASK-5284151"], duration: "~19.8h" },
  { door: "DOCK62", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5285184", "TASK-5207670"], duration: "~11.9h" },
  { door: "DOCK63", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5278242", "TASK-5277747"], duration: "~180.7h" },
  { door: "DOCK65", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5283625", "TASK-5254195", "TASK-5252949"], duration: "~31.9h" },

  // ── AVAILABLE (18) ──
  { door: "DOCK51", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK52", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK53", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK54", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK56", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK57", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK58", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK60", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK61", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK64", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK66", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK67", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK68", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK69", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK70", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK71", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK72", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
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
  { name: "Daniela Gonzalez", taskCount: 4 },
  { name: "Caren Cubides", taskCount: 2 },
  { name: "Jerome Aranda", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
  { name: "Rufino Munguia", taskCount: 1 },
];

export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 0, total: 9 },
  { label: "Inbound", count: 9, total: 9 },
];

// Schedule summary endpoints returned 404 / timeout — UNAVAILABLE
export const scheduleAvailable = false;
export const scheduledInboundOrders = 0;
export const scheduledOutboundOrders = 0;
export const scheduledInboundReceived = 0;
export const scheduledOutboundLoaded = 0;
export const pctScheduledInboundReceived = 0;
export const pctScheduledOutboundLoaded = 0;

// Facility-wide open counts from WISE (LT_F1, pulled ~04:30 PDT June 5)
export const facilityInboundOpen = 61;
export const facilityOutboundOpen = 47;

export const assignments: TaskRecord[] = [
  // ────── TASK-5285184 — DOCK62 — Daniela Gonzalez ──────
  // RECEIVE, IN_PROGRESS ~11.9h, GURUNANDA, RN-5007923
  {
    taskId: "TASK-5285184",
    dns: "RN-5007923",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // ────── TASK-5284151 — DOCK55 — Jerome Aranda ──────
  // RECEIVE, NEW ~19.8h, KARAKA, RN-186139
  {
    taskId: "TASK-5284151",
    dns: "RN-186139",
    customer: "KARAKA",
    pieces: "—",
    assignee: "Jerome Aranda",
  },
  // ────── TASK-5283625 — DOCK65 — Daniela Gonzalez ──────
  // RECEIVE, IN_PROGRESS ~31.9h, GURUNANDA, RN-186014
  {
    taskId: "TASK-5283625",
    dns: "RN-186014",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // ────── TASK-5278242 — DOCK63 — Daniela Gonzalez ──────
  // RECEIVE, IN_PROGRESS ~180.7h, GURUNANDA, RN-5007786
  {
    taskId: "TASK-5278242",
    dns: "RN-5007786",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // ────── TASK-5277747 — DOCK63 — Daniela Gonzalez ──────
  // RECEIVE, IN_PROGRESS ~202.7h, GURUNANDA, RN-5007760
  {
    taskId: "TASK-5277747",
    dns: "RN-5007760",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // ────── TASK-5254195 — DOCK65 — Rufino Munguia ──────
  // RECEIVE, NEW ~906.2h, GURUNANDA, RN-5007343
  {
    taskId: "TASK-5254195",
    dns: "RN-5007343",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Rufino Munguia",
  },
  // ────── TASK-5252949 — DOCK65 — Caren Cubides ──────
  // RECEIVE, NEW ~932.3h, GURUNANDA, RN-183707
  {
    taskId: "TASK-5252949",
    dns: "RN-183707",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Caren Cubides",
  },
  // ────── TASK-5207670 — DOCK62 — Caren Cubides ──────
  // RECEIVE, NEW ~2,274.3h, GURUNANDA, RN-5006269
  {
    taskId: "TASK-5207670",
    dns: "RN-5006269",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Caren Cubides",
  },
  // ────── TASK-5090739 — DOCK50 — daira gonzalez ──────
  // RECEIVE, IN_PROGRESS ~5,439.2h, GURUNANDA, RN-5002143
  {
    taskId: "TASK-5090739",
    dns: "RN-5002143",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "daira gonzalez",
  },
];

// Notes:
// — 5 Occupied / 0 Reserved / 18 Available — 21.7% occupancy rate. All load tasks (outbound) concluded since prior pull.
// — Active tasks: 0 outbound / 9 inbound (RECEIVE). Mix: 0% outbound / 100% inbound — Bay 4 is now exclusively inbound receiving.
// — Customer mix: GURUNANDA (ORG-655875) on 8 of 9 tasks. KARAKA (ORG-585450) on DOCK55 (TASK-5284151).
// — Arnulfo Munguia: ZERO active Bay 4 tasks. TASK-5281747 (DOCK52, PRE_LOAD) concluded since prior pull. Arnulfo's current tasks are on DOCK37 (TASK-5285037, KARAKA, RN-184451, NEW ~14.1h) and DOCK18 (TASK-5280508, KARAKA, RN-184917, IN_PROGRESS ~90.5h, Bay 3).
// — Daniela Gonzalez: 4 RECEIVE tasks — DOCK62 (TASK-5285184 ~11.9h + TASK-5207670 ~2,274h), DOCK63 (TASK-5278242 ~180.7h + TASK-5277747 ~202.7h), DOCK65 (TASK-5283625 ~31.9h).
// — Caren Cubides: 2 RECEIVE tasks — DOCK62 (TASK-5207670) + DOCK65 (TASK-5252949), both NEW and severely aged.
// — Jerome Aranda: 1 RECEIVE task — DOCK55 (TASK-5284151, KARAKA, RN-186139, ~19.8h, NEW).
// — daira gonzalez: 1 RECEIVE task — DOCK50 (TASK-5090739, ~5,439h, IN_PROGRESS). AGED 227 days (since Oct 2025).
// — Rufino Munguia: 1 RECEIVE task — DOCK65 (TASK-5254195, ~906h, NEW). AGED 38 days (since Apr 28).
// — CRITICAL AGING: TASK-5090739 (DOCK50, 227d), TASK-5207670 (DOCK62, 95d), TASK-5252949 (DOCK65, 39d), TASK-5254195 (DOCK65, 38d). These may be abandoned/stuck and need review.
// — ALL outbound (PRE_LOAD) tasks from prior pull concluded: TASK-5281747 (DOCK52), TASK-5284794 (DOCK53), TASK-5285010 (DOCK54), TASK-5280242 (DOCK53). DOCK52-DOCK54 now Available.
// — DOCK50 newly Occupied — TASK-5090739 was previously not appearing on Bay 4 door queries. May have been re-categorized or was previously filtered out.
// — DOCK55 remains Occupied (KARAKA). DOCK62/DOCK63/DOCK65 remain Occupied (GURUNANDA) with additional aged tasks uncovered.
// — No Reserved doors remain. No double-booked doors.
// — 18 of 23 doors (78%) available — significant inbound receiving capacity.
// — % scheduled inbounds/outbounds: UNAVAILABLE (schedule-summary endpoints returned 404/timeout on this pull).
// — Facility-wide: 61 inbound receive tasks, 47 outbound load tasks.
// — "Guru live out / in assign to Arnulfo": NO ACTIVE BAY 4 TASKS. Prior TASK-5281747 (DOCK52, GURUNANDA PRE_LOAD) concluded. Arnulfo has no Bay 4 receive tasks.
// — Piece/pallet counts not returned by receive-task API; shown as "—".
// — All data sourced from live WISE/WMS queries at ~04:30 PDT, June 5, 2026.
