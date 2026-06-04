/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 4, 2026 ~09:31 PDT
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
  { door: "DOCK50", status: "Available", assignee: null, customer: "GURUNANDA", taskIds: [], duration: null },
  { door: "DOCK51", status: "Occupied", assignee: "Arnulfo Munguia", customer: "GURUNANDA", taskIds: ["TASK-5284457"], duration: "0.0h" },
  { door: "DOCK52", status: "Reserved", assignee: "Arnulfo Munguia", customer: "GURUNANDA", taskIds: ["TASK-5281747"], duration: "40.4h" },
  { door: "DOCK53", status: "Reserved", assignee: "Arnulfo Munguia, Daniel Beltran, Luis Velazquez", customer: "GURUNANDA", taskIds: ["TASK-5282315", "TASK-5280242", "TASK-5284189"], duration: "53.8h" },
  { door: "DOCK54", status: "Occupied", assignee: "Arnulfo Munguia", customer: "GURUNANDA", taskIds: ["TASK-5284360"], duration: "0.1h" },
  { door: "DOCK55", status: "Reserved", assignee: null, customer: "GURUNANDA", taskIds: [], duration: null },
  { door: "DOCK56", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK57", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK58", status: "Reserved", assignee: null, customer: "GURUNANDA", taskIds: [], duration: null },
  { door: "DOCK59", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK60", status: "Occupied", assignee: null, customer: "GURUNANDA", taskIds: [], duration: null },
  { door: "DOCK61", status: "Occupied", assignee: "Daniel Beltran", customer: null, taskIds: ["TASK-5284169"], duration: "0.4h" },
  { door: "DOCK62", status: "Available", assignee: null, customer: "GURUNANDA", taskIds: [], duration: null },
  { door: "DOCK63", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK64", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK65", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK66", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK67", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK68", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK69", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK70", status: "Available", assignee: null, customer: "GURUNANDA, ORG-585450", taskIds: [], duration: null },
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
  { name: "Arnulfo Munguia", taskCount: 4 },
  { name: "Daniel Beltran", taskCount: 2 },
  { name: "Luis Velazquez", taskCount: 1 },
];

export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 7, total: 8 },
  { label: "Inbound", count: 0, total: 8 },
  { label: "General", count: 1, total: 8 },
];

export const facilityInboundOpen = 2099;
export const facilityOutboundOpen = 3643;

export const assignments: TaskRecord[] = [
  {
    taskId: "TASK-5284457",
    dns: "DN-3193690",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  {
    taskId: "TASK-5284360",
    dns: "DN-3194401, DN-3194952, DN-3197812, DN-3195035",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  {
    taskId: "TASK-5284189",
    dns: "DN-3194613",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniel Beltran",
  },
  {
    taskId: "TASK-5284169",
    dns: "DN-3170515, DN-3169557, DN-3168587, DN-3167505",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniel Beltran",
  },
  {
    taskId: "TASK-5282315",
    dns: "DN-3192751, DN-3193700, DN-3193631",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  {
    taskId: "TASK-5281747",
    dns: "DN-3190424",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  {
    taskId: "TASK-5280242",
    dns: "DN-3189539",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Luis Velazquez",
  },
];

// Non-GURUNANDA task noted but excluded from Bay 4 scope:
// TASK-5278636 — GENERAL / HRS LABOR (rework), GURUNANDA, Mateo Moreno, NEW, May 28 (no dock)
