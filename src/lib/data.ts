/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 4, 2026 ~17:30 PDT
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
  { door: "DOCK50", status: "Reserved", assignee: null, customer: "GURUNANDA", taskIds: ["TASK-5284892"], duration: "CLOSED — Gate Out" },
  { door: "DOCK51", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK52", status: "Occupied", assignee: "Arnulfo Munguia", customer: "GURUNANDA", taskIds: ["TASK-5281747"], duration: "~52h" },
  { door: "DOCK53", status: "Occupied", assignee: "Lorenzo Rodriguez, Luis Velazquez", customer: "GURUNANDA", taskIds: ["TASK-5284794", "TASK-5280242"], duration: "~5h / ~73h" },
  { door: "DOCK54", status: "Occupied", assignee: "Lorenzo Rodriguez", customer: "GURUNANDA", taskIds: ["TASK-5285010"], duration: "~3h" },
  { door: "DOCK55", status: "Reserved", assignee: null, customer: "GURUNANDA", taskIds: ["TASK-5284888"], duration: "CLOSED — Gate Out" },
  { door: "DOCK56", status: "Reserved", assignee: null, customer: "Dollar Tree", taskIds: ["TASK-5284803"], duration: "CLOSED — Gate Out" },
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
  { door: "DOCK67", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5285130"], duration: "RECEIVE" },
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
  { name: "Luis Velazquez", taskCount: 1 },
];

export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 7 },
  { label: "Inbound", count: 3, total: 7 },
  { label: "General", count: 0, total: 7 },
];

// Facility-wide schedule counts unavailable — schedule-summary APIs return server errors (404/405/400)
export const facilityInboundOpen = -1;
export const facilityOutboundOpen = -1;

export const assignments: TaskRecord[] = [
  // ────── OUTBOUND LOAD LINES ──────
  // TASK-5281747 — DOCK52 — Arnulfo Munguia (IN_PROGRESS ~52h, PRE_LOAD)
  {
    taskId: "TASK-5281747",
    dns: "DN-3190424",
    customer: "GURUNANDA",
    pieces: "28 pal",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5284794 — DOCK53 — Lorenzo Rodriguez (8 loads, all LOADED, 21 pallets)
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
    pieces: "2 pal",
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
  // TASK-5280242 — DOCK53 — Luis Velazquez (stale ~73h, PRE_LOAD)
  {
    taskId: "TASK-5280242",
    dns: "DN-3189539",
    customer: "GURUNANDA",
    pieces: "1 load",
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
  // TASK-5285130 — DOCK67 — Daniela Gonzalez (RECEIVE)
  {
    taskId: "TASK-5285130",
    dns: "RN-5007903",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
];

// Notes:
// — All Bay 4 activity is GURUNANDA (ORG-655875) except DOCK56 (Dollar Tree, CLOSED).
// — Arnulfo Munguia: TASK-5281747 on DOCK52, PRE_LOAD IN_PROGRESS ~52h, DN-3190424 (28 pal).
// — No active "Guru live in" receive tasks assigned to Arnulfo in Bay 4 — all his recent Bay 4 tasks are outbound PRE_LOAD/LIVE_LOAD.
// — DOCK53: TASK-5284794 (Lorenzo Rodriguez, 8 loads all LOADED, 21 pallets, ~5h) + TASK-5280242 (Luis Velazquez, ~73h).
// — DOCK54: TASK-5285010 (Lorenzo Rodriguez, 2 loads LOADED, 43 pallets, ~3h).
// — Daniela Gonzalez now active on 3 receive tasks: DOCK58 (TASK-5285185, Live Unload), DOCK62 (TASK-5285184), DOCK67 (TASK-5285130).
// — DOCK50: TASK-5284892 CLOSED (Silvano Sertorio Hernandez, GURUNANDA, Gate Checked Out) — Reserved.
// — DOCK55: TASK-5284888 CLOSED (Jose Morales, GURUNANDA, Gate Checked Out) — Reserved.
// — DOCK56: TASK-5284803 CLOSED (Lorenzo Rodriguez, Dollar Tree, Gate Checked Out) — Reserved.
// — DOCK65 now Available (was Occupied by Daniela/Rufino — tasks concluded).
// — DOCK58 newly Occupied since last pull (was Available).
// — % scheduled inbounds received / outbounds loaded: UNAVAILABLE (schedule-summary APIs return 404/405/400 for LT_F1).
// — Facility-wide open counts: UNAVAILABLE (same API limitation).
// — Piece counts for outbound are pallet counts from load-task API; receive piece counts not available.
// — "Guru live out / in assign to Arnulfo" activity: TASK-5281747 (Arnulfo, DOCK52, GURUNANDA PRE_LOAD). Arnulfo has no Bay 4 "live in" receipt tasks.
