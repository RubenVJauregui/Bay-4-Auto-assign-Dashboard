/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 5, 2026 ~03:30 PDT
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
  // ── OCCUPIED (7) ──
  { door: "DOCK52", status: "Occupied", assignee: "Arnulfo Munguia", customer: "GURUNANDA", taskIds: ["TASK-5281747"], duration: "~58h" },
  { door: "DOCK53", status: "Occupied", assignee: "Lorenzo Rodriguez", customer: "GURUNANDA", taskIds: ["TASK-5284794"], duration: "~16h" },
  { door: "DOCK54", status: "Occupied", assignee: "Lorenzo Rodriguez", customer: "GURUNANDA", taskIds: ["TASK-5285010"], duration: "~6h" },
  { door: "DOCK55", status: "Occupied", assignee: "Jerome Aranda", customer: "KARAKA", taskIds: ["TASK-5284151"], duration: "~12h" },
  { door: "DOCK62", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5285184"], duration: "~4h" },
  { door: "DOCK63", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5278242", "TASK-5277747"], duration: "~7d" },
  { door: "DOCK65", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5283625"], duration: "~20h" },

  // ── AVAILABLE (16) ──
  { door: "DOCK50", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK51", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
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
  { name: "Daniela Gonzalez", taskCount: 3 },
  { name: "Lorenzo Rodriguez", taskCount: 2 },
  { name: "Arnulfo Munguia", taskCount: 1 },
  { name: "Jerome Aranda", taskCount: 1 },
];

export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 3, total: 7 },
  { label: "Inbound", count: 4, total: 7 },
];

// Schedule summary endpoints returned 404 — UNAVAILABLE
// Previous values carried forward with explicit caveat
export const scheduleAvailable = false;
export const scheduledInboundOrders = 0;
export const scheduledOutboundOrders = 0;
export const scheduledInboundReceived = 0;
export const scheduledOutboundLoaded = 0;
export const pctScheduledInboundReceived = 0;
export const pctScheduledOutboundLoaded = 0;

// Facility-wide open counts from WISE (LT_F1, pulled ~03:30 PDT June 5)
export const facilityInboundOpen = 61;
export const facilityOutboundOpen = 47;

export const assignments: TaskRecord[] = [
  // ────── TASK-5281747 — DOCK52 — Arnulfo Munguia ──────
  // PRE_LOAD, IN_PROGRESS ~58h, GURUNANDA, DN-3190424 (LOADED, carrier signed 6/4 16:14)
  {
    taskId: "TASK-5281747",
    dns: "DN-3190424",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // ────── TASK-5284794 — DOCK53 — Lorenzo Rodriguez ──────
  // PRE_LOAD, IN_PROGRESS ~16h, GURUNANDA
  {
    taskId: "TASK-5284794-1",
    dns: "DN-3198074",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5284794-2",
    dns: "DN-3195098",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5284794-3",
    dns: "DN-3195086",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5284794-4",
    dns: "DN-3194936",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5284794-5",
    dns: "DN-3190634",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5284794-6",
    dns: "DN-3197870",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5284794-7",
    dns: "DN-3198789",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5284794-8",
    dns: "DN-3197866",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  // ────── TASK-5285010 — DOCK54 — Lorenzo Rodriguez ──────
  // PRE_LOAD, IN_PROGRESS ~6h, GURUNANDA
  {
    taskId: "TASK-5285010-1",
    dns: "DN-3195088",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5285010-2",
    dns: "DN-3195089",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
];

// Notes:
// — 7 Occupied / 0 Reserved / 16 Available — 30.4% occupancy rate.
// — Active tasks: 3 outbound (PRE_LOAD) / 4 inbound (RECEIVE). Mix: 43% outbound / 57% inbound.
// — Customer mix: GURUNANDA (ORG-655875) on 6 of 7 occupied doors. KARAKA (ORG-585450) on DOCK55.
// — Arnulfo Munguia: TASK-5281747 on DOCK52, PRE_LOAD ~58h (started Jun 2 17:07), DN-3190424 (LOADED, carrier signed 6/4 16:14, seal 25079538). Task STUCK — should be CLOSED. No live receive for Arnulfo in Bay 4.
// — Lorenzo Rodriguez: 2 PRE_LOAD tasks — DOCK53 (TASK-5284794, ~16h) + DOCK54 (TASK-5285010, ~6h).
// — Daniela Gonzalez: 3 RECEIVE tasks — DOCK62 (TASK-5285184, ~4h), DOCK63 (TASK-5278242 ~7d + TASK-5277747), DOCK65 (TASK-5283625 ~20h + 2 NEW).
// — Jerome Aranda: 1 RECEIVE task — DOCK55 (TASK-5284151, KARAKA RN-186139, ~12h, NEW). First KARAKA activity on Bay 4.
// — All 3 Bay 4 load tasks have 100% loads LOADED — all remain IN_PROGRESS (not closed).
// — DOCK61, DOCK63, DOCK64, DOCK65 all changed status since last pull: DOCK61 Available (was Occupied stale), DOCK63 Occupied (was Available), DOCK64 Available (was Reserved), DOCK65 Occupied (was Available).
// — DOCK55 newly Occupied — was Available in prior pull, now has KARAKA receive.
// — All Reserved/Assigned doors cleared — DOCK60, DOCK64, DOCK68, DOCK70, DOCK71 now Available.
// — DOCK53 no longer double-booked: TASK-5280242 (Luis Velazquez, ~78h) concluded since last pull.
// — No Reserved/Assigned doors remain.
// — % scheduled inbounds/outbounds: UNAVAILABLE (schedule-summary endpoints return 404).
// — Facility-wide open counts: 61 inbound receive tasks, 47 outbound load tasks.
// — "Guru live out / in assign to Arnulfo": TASK-5281747 (Arnulfo, DOCK52, GURUNANDA PRE_LOAD ~58h). No live receive for Arnulfo in Bay 4.
// — Piece/pallet counts not returned by load-task API in this pull; shown as "—".
// — DN details for TASK-5284794 and TASK-5285010 carried from prior pull; not re-queried in this refresh.
// — All data sourced from live WISE/WMS queries at ~03:30 PDT, June 5, 2026.
