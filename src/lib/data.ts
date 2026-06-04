/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 4, 2026 ~15:31 PDT
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
  { door: "DOCK52", status: "Occupied", assignee: null, customer: "GURUNANDA", taskIds: [], duration: "stale (gate out Jun 2)" },
  { door: "DOCK53", status: "Occupied", assignee: "Lorenzo Rodriguez, Luis Velazquez", customer: "GURUNANDA", taskIds: ["TASK-5284794", "TASK-5280242"], duration: "1.6h / 3.5d stale" },
  { door: "DOCK54", status: "Occupied", assignee: null, customer: "GURUNANDA", taskIds: [], duration: "stale (ET deleted)" },
  { door: "DOCK55", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK56", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK57", status: "Occupied", assignee: null, customer: "Ross Stores", taskIds: [], duration: "all 6 loads LOADED" },
  { door: "DOCK58", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK60", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK61", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK62", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK63", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK64", status: "Occupied", assignee: null, customer: "GURUNANDA", taskIds: [], duration: "receipt IMPORTED" },
  { door: "DOCK65", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK66", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK67", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK68", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK69", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK70", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK71", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK72", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
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
  { name: "Lorenzo Rodriguez", taskCount: 1 },
  { name: "Luis Velazquez", taskCount: 1 },
  { name: "Mateo Moreno", taskCount: 1 },
  { name: "Ricardo Tapia", taskCount: 2 },
  { name: "Yuyang Gong", taskCount: 1 },
  { name: "Brayan Escobar", taskCount: 1 },
];

export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 2, total: 3 },
  { label: "Inbound", count: 1, total: 3 },
  { label: "General", count: 0, total: 3 },
];

export const facilityInboundOpen = 2185;
export const facilityOutboundOpen = 3533;

export const assignments: TaskRecord[] = [
  {
    taskId: "TASK-5284794",
    dns: "—",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5280242",
    dns: "—",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Luis Velazquez",
  },
];

// Notes:
// — Arnulfo Munguia has ZERO active Bay 4 load tasks this pull (shift change from prior pull)
// — DOCK53: TASK-5284794 (Lorenzo Rodriguez, 8 loads PRE_LOAD, IN_PROGRESS ~1.6h)
// — DOCK53: TASK-5280242 (Luis Velazquez, 1 load LOADED, stale ~3.5d)
// — DOCK64: inbound receipt RN-5007909 (SAPU5033831, IMPORTED) — no task ID from load-task API
// — DOCK52: gate checked out Jun 2, no active task
// — DOCK54: entry ticket ET-1103806 404 — may have been deleted
// — DOCK57: Ross Stores, all 6 loads already LOADED — no active tasks
// — Non-load tasks found: Mateo Moreno (1, GURU rework), Ricardo Tapia (2, TORQUAY kits), Yuyang Gong (1), Brayan Escobar (1, NZXT), Unassigned (1, ENVISION cycle count)
// — % scheduled inbounds received / outbounds loaded: UNAVAILABLE (schedule-summary APIs return open counts only)
// — DN & pieces per task: UNAVAILABLE (order-level search API does not expose these fields)
