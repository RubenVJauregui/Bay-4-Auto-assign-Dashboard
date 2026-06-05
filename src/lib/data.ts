/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 5, 2026 ~00:00 PDT
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
  { door: "DOCK52", status: "Occupied", assignee: "Arnulfo Munguia", customer: "GURUNANDA", taskIds: ["TASK-5281747"], duration: "~62h" },
  { door: "DOCK53", status: "Occupied", assignee: "Lorenzo Rodriguez", customer: "GURUNANDA", taskIds: ["TASK-5284794"], duration: "~12h" },
  { door: "DOCK54", status: "Occupied", assignee: "Lorenzo Rodriguez", customer: "GURUNANDA", taskIds: ["TASK-5285010"], duration: "~10h" },
  { door: "DOCK61", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "No active task ⚠" },
  { door: "DOCK62", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5285184"], duration: "~0.4h" },

  // ── ASSIGNED (5 — entry tickets, no active task) ──
  { door: "DOCK60", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK64", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK68", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK70", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK71", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },

  // ── AVAILABLE (13) ──
  { door: "DOCK50", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK51", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK55", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK56", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK57", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK58", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK63", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK65", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK66", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK67", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK69", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
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
  { name: "Lorenzo Rodriguez", taskCount: 2 },
  { name: "Arnulfo Munguia", taskCount: 1 },
  { name: "Daniela Gonzalez", taskCount: 1 },
];

export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 3, total: 5 },
  { label: "Inbound", count: 1, total: 5 },
  { label: "Unknown", count: 1, total: 5 },
];

// Schedule summary from WISE (pulled ~00:00 PDT June 5)
export const scheduledInboundOrders = 240;
export const scheduledOutboundOrders = 1124;
export const scheduledInboundReceived = 1;   // 1 receipt on DOCK62
export const scheduledOutboundLoaded = 11;   // 11 loads across 3 doors
export const pctScheduledInboundReceived = (1 / 240) * 100;   // ~0.4%
export const pctScheduledOutboundLoaded = (11 / 1124) * 100;  // ~1.0%

// Facility-wide open counts from WISE (LT_F1, pulled ~00:00 PDT)
export const facilityInboundOpen = 61;
export const facilityOutboundOpen = 47;

export const assignments: TaskRecord[] = [
  // ────── TASK-5281747 — DOCK52 — Arnulfo Munguia ──────
  // PRE_LOAD, IN_PROGRESS ~62h, GURUNANDA, 1 load
  {
    taskId: "TASK-5281747",
    dns: "DN-3190424",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // ────── TASK-5284794 — DOCK53 — Lorenzo Rodriguez ──────
  // PRE_LOAD, IN_PROGRESS ~12h, GURUNANDA, 8 loads (all LOADED)
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
  // PRE_LOAD, IN_PROGRESS ~10h, GURUNANDA, 2 loads (all LOADED)
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
// — 5 Occupied / 5 Assigned / 13 Available — total 10/23 doors occupied+assigned (43.5%).
// — Active tasks: 3 outbound (PRE_LOAD) / 1 inbound (RECEIVE) / 1 unknown (DOCK61 occupied, no task).
// — Dominant customer: GURUNANDA (ORG-655875) on all identified tasks — 100% of Bay 4 activity.
// — Arnulfo Munguia: TASK-5281747 on DOCK52, PRE_LOAD ~62h, DN-3190424 (LOADED, carrier signed 6/4 16:14, seal 25079538). Task STUCK — should be CLOSED. No live receive for Arnulfo in Bay 4.
// — Lorenzo Rodriguez: 2 PRE_LOAD tasks — DOCK53 (TASK-5284794, 8 loads all LOADED, ~12h) + DOCK54 (TASK-5285010, 2 loads all LOADED, ~10h).
// — Daniela Gonzalez: 1 RECEIVE task — DOCK62 (TASK-5285184, RN-5007923, ~0.4h).
// — DOCK61 OCCUPIED with entry ET-1103945 but no active task — needs reconciliation.
// — DOCK60, DOCK64, DOCK68, DOCK70, DOCK71 ASSIGNED with entry tickets but no active tasks.
// — DOCK53 no longer double-booked: TASK-5280242 (Luis Velazquez) has been removed/concluded since last pull.
// — DOCK63 returned to Available (was Occupied — TASK-5285210 concluded).
// — DOCK64 changed from Occupied to Assigned (TASK-5285211 concluded).
// — DOCK50, DOCK55, DOCK65, DOCK66, DOCK67, DOCK69 all Available.
// — No KARAKA activity on Bay 4. 100% GURUNANDA.
// — All 3 Bay 4 load tasks have 100% loads LOADED — all remain IN_PROGRESS (not closed).
// — % scheduled inbounds received: 1/240 (~0.4%). % scheduled outbounds loaded: 11/1,124 (~1.0%).
// — Facility-wide open counts: 61 inbound receive tasks, 47 outbound load tasks.
// — "Guru live out / in assign to Arnulfo": TASK-5281747 (Arnulfo, DOCK52, GURUNANDA PRE_LOAD ~62h). No "live in" receive for Arnulfo in Bay 4.
// — Piece/pallet counts not returned by load-task API in this pull; shown as "—".
// — Schedule summary retrieved: 240 scheduled inbounds, 1,124 scheduled outbounds.
