/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 4, 2026 ~19:00 PDT
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
  { door: "DOCK50", status: "Reserved", assignee: null, customer: "GURUNANDA", taskIds: [], duration: null },
  { door: "DOCK51", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK52", status: "Occupied", assignee: "Arnulfo Munguia", customer: "GURUNANDA", taskIds: ["TASK-5281747"], duration: "~50h" },
  { door: "DOCK53", status: "Occupied", assignee: "Lorenzo Rodriguez, Luis Velazquez", customer: "GURUNANDA", taskIds: ["TASK-5284794", "TASK-5280242"], duration: "~5h / ~75h" },
  { door: "DOCK54", status: "Occupied", assignee: "Lorenzo Rodriguez", customer: "GURUNANDA", taskIds: ["TASK-5285010"], duration: "~5h" },
  { door: "DOCK55", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK56", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK57", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK58", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5285185"], duration: "Live Unload" },
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK60", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK61", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK62", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5285184"], duration: "RECEIVE" },
  { door: "DOCK63", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK64", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK65", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
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
  { name: "Daniela Gonzalez", taskCount: 2 },
  { name: "Lorenzo Rodriguez", taskCount: 2 },
  { name: "Arnulfo Munguia", taskCount: 1 },
  { name: "Luis Velazquez", taskCount: 1 },
];

export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 6 },
  { label: "Inbound", count: 2, total: 6 },
  { label: "General", count: 0, total: 6 },
];

// Facility-wide open counts from WMS (LT_F1, pulled ~19:00 PDT)
export const facilityInboundOpen = 2204;
export const facilityOutboundOpen = 3603;

export const assignments: TaskRecord[] = [
  // ────── OUTBOUND LOAD LINES ──────
  // TASK-5281747 — DOCK52 — Arnulfo Munguia (IN_PROGRESS ~50h, PRE_LOAD)
  {
    taskId: "TASK-5281747",
    dns: "DN-3190424",
    customer: "GURUNANDA",
    pieces: "28 pal",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5284794 — DOCK53 — Lorenzo Rodriguez (8 loads, all LOADED, 39 pallets total)
  {
    taskId: "TASK-5284794-1",
    dns: "DN-3197870",
    customer: "GURUNANDA",
    pieces: "1 pal",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5284794-2",
    dns: "DN-3198074",
    customer: "GURUNANDA",
    pieces: "9 pal",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5284794-3",
    dns: "DN-3195086",
    customer: "GURUNANDA",
    pieces: "20 pal",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5284794-4",
    dns: "DN-3198789",
    customer: "GURUNANDA",
    pieces: "1 pal",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5284794-5",
    dns: "DN-3195098",
    customer: "GURUNANDA",
    pieces: "3 pal",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5284794-6",
    dns: "DN-3190634",
    customer: "GURUNANDA",
    pieces: "1 pal",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5284794-7",
    dns: "DN-3197866",
    customer: "GURUNANDA",
    pieces: "1 pal",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5284794-8",
    dns: "DN-3194936",
    customer: "GURUNANDA",
    pieces: "3 pal",
    assignee: "Lorenzo Rodriguez",
  },
  // TASK-5280242 — DOCK53 — Luis Velazquez (stale ~75h, PRE_LOAD)
  {
    taskId: "TASK-5280242",
    dns: "DN-3189539",
    customer: "GURUNANDA",
    pieces: "26 pal",
    assignee: "Luis Velazquez",
  },
  // TASK-5285010 — DOCK54 — Lorenzo Rodriguez (2 loads, LOADED, 43 pallets)
  {
    taskId: "TASK-5285010-1",
    dns: "DN-3195089",
    customer: "GURUNANDA",
    pieces: "19 pal",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5285010-2",
    dns: "DN-3195088",
    customer: "GURUNANDA",
    pieces: "24 pal",
    assignee: "Lorenzo Rodriguez",
  },

  // ────── INBOUND RECEIVE LINES ──────
  // TASK-5285185 — DOCK58 — Daniela Gonzalez (Live Unload)
  {
    taskId: "TASK-5285185",
    dns: "RN-186015",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5285184 — DOCK62 — Daniela Gonzalez (RECEIVE)
  {
    taskId: "TASK-5285184",
    dns: "RN-5007923",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
];

// Notes:
// — All Bay 4 activity is GURUNANDA (ORG-655875). No other customers active.
// — 5 Occupied / 1 Reserved / 17 Available — total 6/23 doors occupied+reserved (26.1%).
// — DOCK50 now Reserved (ORG-655875 inventory activity, no active task).
// — DOCK67 now Available (was Occupied by Daniela — TASK-5285130 RECEIVE concluded).
// — DOCK55, DOCK56 remain Available (CLOSED tasks fully concluded).
// — DOCK65 remains Available (receive tasks concluded earlier).
// — Arnulfo Munguia: TASK-5281747 on DOCK52, PRE_LOAD IN_PROGRESS ~50h, DN-3190424 (28 pal, LOADED + signed 6/4 16:14).
// — No active "Guru live in" receive tasks assigned to Arnulfo in Bay 4.
// — DOCK53: TASK-5284794 (Lorenzo Rodriguez, 8 loads all LOADED, 39 pallets, ~5h) + TASK-5280242 (Luis Velazquez, ~75h, 26 pal).
// — DOCK54: TASK-5285010 (Lorenzo Rodriguez, 2 loads LOADED, 43 pallets, ~5h).
// — Daniela Gonzalez active on 2 receive tasks: DOCK58 (TASK-5285185, Live Unload RN-186015), DOCK62 (TASK-5285184, RN-5007923).
// — % scheduled inbounds received / outbounds loaded: UNAVAILABLE (schedule-summary API returns 404 for LT_F1).
// — Facility-wide open counts: 2,204 inbound receipts, 3,603 outbound orders.
// — Piece counts for outbound are pallet counts from load-task API; receive piece counts not available.
// — "Guru live out / in assign to Arnulfo" activity: TASK-5281747 (Arnulfo, DOCK52, GURUNANDA PRE_LOAD). No "live in" receive for Arnulfo in Bay 4.
