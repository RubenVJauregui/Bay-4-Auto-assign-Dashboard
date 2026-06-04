/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 4, 2026 ~16:31 PDT
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
  { door: "DOCK50", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK51", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK52", status: "Occupied", assignee: "Arnulfo Munguia", customer: "GURUNANDA", taskIds: ["TASK-5281747"], duration: "~28h" },
  { door: "DOCK53", status: "Occupied", assignee: "Lorenzo Rodriguez, Luis Velazquez", customer: "GURUNANDA", taskIds: ["TASK-5284794", "TASK-5280242"], duration: "4.5h / ~54h" },
  { door: "DOCK54", status: "Occupied", assignee: "Lorenzo Rodriguez", customer: "GURUNANDA", taskIds: ["TASK-5285010"], duration: "~2.5h" },
  { door: "DOCK55", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK56", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK57", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK58", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK59", status: "Reserved", assignee: null, customer: "GURUNANDA", taskIds: ["TASK-5283629"], duration: "RECEIVE" },
  { door: "DOCK60", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK61", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK62", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK63", status: "Reserved", assignee: null, customer: "GURUNANDA", taskIds: ["TASK-5277747"], duration: "RECEIVE" },
  { door: "DOCK64", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK65", status: "Reserved", assignee: null, customer: "GURUNANDA", taskIds: ["TASK-5283625"], duration: "RECEIVE" },
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
  // TASK-5285010 — DOCK54 — Lorenzo Rodriguez (2 loads)
  {
    taskId: "TASK-5285010-1",
    dns: "DN-3195089",
    customer: "GURUNANDA",
    pieces: "19 pal",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5285010-2",
    dns: "50030436",
    customer: "GURUNANDA",
    pieces: "24 pal",
    assignee: "Lorenzo Rodriguez",
  },
  // TASK-5284794 — DOCK53 — Lorenzo Rodriguez (8 loads, all LOADED)
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
  // TASK-5281747 — DOCK52 — Arnulfo Munguia (IN_PROGRESS ~28h, load details not available)
  {
    taskId: "TASK-5281747",
    dns: "—",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5280242 — DOCK53 — Luis Velazquez (stale ~54h, load details not available)
  {
    taskId: "TASK-5280242",
    dns: "—",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Luis Velazquez",
  },
];

// Notes:
// — All Bay 4 active load/receive tasks are GURUNANDA (ORG-655875). No non-GURUNANDA customers active in Bay 4.
// — Arnulfo Munguia has 1 active Bay 4 task: TASK-5281747 on DOCK52, IN_PROGRESS ~28h (load details not available from load-task API).
// — DOCK53: TASK-5284794 (Lorenzo Rodriguez, 8 loads all LOADED, 21 pallets total, ~4.5h active).
// — DOCK53: TASK-5280242 (Luis Velazquez, stale ~54h).
// — DOCK54: TASK-5285010 (Lorenzo Rodriguez, 2 loads both LOADED, 43 pallets total, ~2.5h active).
// — DOCK59: TASK-5283629 (RECEIVE, unassigned, GURUNANDA).
// — DOCK63: TASK-5277747 (RECEIVE, unassigned, GURUNANDA).
// — DOCK65: TASK-5283625 (RECEIVE, unassigned, GURUNANDA).
// — DOCK66-DOCK68: location dockStatus shows OCCUPIED but entry-ticket tasks are CLOSED/FORCE_CLOSED — stale.
// — % scheduled inbounds received / outbounds loaded: UNAVAILABLE (schedule-summary APIs return 404/405/400 for LT_F1).
// — Facility-wide open counts: UNAVAILABLE (same API limitation).
// — Piece counts per DN are pallet counts, not individual piece counts (load-task API granularity).
// — Non-load tasks (rework, kits, cycle count) from prior pulls were not returned by load/receive task queries in this pull.
