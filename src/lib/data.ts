/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 4, 2026 ~20:00 PDT
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
  { door: "DOCK52", status: "Occupied", assignee: "Arnulfo Munguia", customer: "GURUNANDA", taskIds: ["TASK-5281747"], duration: "~51h" },
  { door: "DOCK53", status: "Occupied", assignee: "Lorenzo Rodriguez", customer: "GURUNANDA", taskIds: ["TASK-5284794"], duration: "~1h" },
  { door: "DOCK54", status: "Occupied", assignee: "Lorenzo Rodriguez", customer: "GURUNANDA", taskIds: ["TASK-5285010"], duration: "~1.5h" },
  { door: "DOCK55", status: "Occupied", assignee: "Jerome Aranda", customer: "KARAKA", taskIds: ["TASK-5284151"], duration: "RECEIVE" },
  { door: "DOCK61", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "No active task" },
  { door: "DOCK62", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5285184"], duration: "~20h" },
  { door: "DOCK63", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5285210"], duration: "~0.7h" },
  { door: "DOCK64", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5285211"], duration: "NEW" },
  { door: "DOCK65", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5283625"], duration: "~16h" },

  // ── RESERVED (6) ──
  { door: "DOCK60", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK68", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK69", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK70", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK71", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK72", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },

  // ── AVAILABLE (8) ──
  { door: "DOCK50", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK51", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK56", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK57", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK58", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK66", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK67", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
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
  { name: "Lorenzo Rodriguez", taskCount: 2 },
  { name: "Arnulfo Munguia", taskCount: 1 },
  { name: "Jerome Aranda", taskCount: 1 },
];

export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 3, total: 8 },
  { label: "Inbound", count: 5, total: 8 },
  { label: "General", count: 0, total: 8 },
];

// Facility-wide open counts from WMS (LT_F1, pulled ~20:00 PDT)
export const facilityInboundOpen = 2204;
export const facilityOutboundOpen = 3630;

export const assignments: TaskRecord[] = [
  // ────── OUTBOUND LOAD LINES ──────
  // TASK-5281747 — DOCK52 — Arnulfo Munguia (IN_PROGRESS ~51h, PRE_LOAD)
  // 1 load, LOADED + carrier signed 6/4 16:14
  {
    taskId: "TASK-5281747",
    dns: "DN-3190424",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5284794 — DOCK53 — Lorenzo Rodriguez (8 loads, all LOADED, ~1h)
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
  // TASK-5285010 — DOCK54 — Lorenzo Rodriguez (2 loads, LOADED, ~1.5h)
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
  // TASK-5285184 — DOCK62 — Daniela Gonzalez (RECEIVE ~20h)
  {
    taskId: "TASK-5285184",
    dns: "RN-5007923",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5285210 — DOCK63 — Daniela Gonzalez (RECEIVE ~0.7h)
  {
    taskId: "TASK-5285210",
    dns: "RN-5007942",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5285211 — DOCK64 — Daniela Gonzalez (RECEIVE, NEW)
  {
    taskId: "TASK-5285211",
    dns: "RN-5007909",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5283625 — DOCK65 — Daniela Gonzalez (RECEIVE ~16h)
  {
    taskId: "TASK-5283625",
    dns: "RN-186014",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5284151 — DOCK55 — Jerome Aranda (RECEIVE, KARAKA)
  {
    taskId: "TASK-5284151",
    dns: "RN-186139",
    customer: "KARAKA",
    pieces: "—",
    assignee: "Jerome Aranda",
  },
];

// Notes:
// — 9 Occupied / 6 Reserved / 8 Available — total 15/23 doors occupied+reserved (65.2%).
// — Active tasks: 3 outbound (PRE_LOAD) / 5 inbound (RECEIVE) — 37.5% outbound / 62.5% inbound.
// — Dominant customer: GURUNANDA (ORG-655875) on 7 of 8 active tasks. KARAKA on DOCK55.
// — Arnulfo Munguia: TASK-5281747 on DOCK52, PRE_LOAD IN_PROGRESS ~51h, DN-3190424 (LOADED + carrier signed 6/4 16:14). No live receive tasks for Arnulfo in Bay 4.
// — Lorenzo Rodriguez: 2 PRE_LOAD tasks — DOCK53 (TASK-5284794, 8 loads LOADED) + DOCK54 (TASK-5285010, 2 loads LOADED).
// — Daniela Gonzalez: 4 RECEIVE tasks — DOCK62 (TASK-5285184 ~20h), DOCK63 (TASK-5285210 ~0.7h), DOCK64 (TASK-5285211 NEW), DOCK65 (TASK-5283625 ~16h).
// — Jerome Aranda: 1 RECEIVE task — DOCK55 (TASK-5284151, KARAKA RN-186139).
// — Luis Velazquez TASK-5280242 (~75h) no longer active on DOCK53.
// — DOCK58 (Daniela Live Unload TASK-5285185) concluded → now Available.
// — DOCK50 now Available (was Reserved — reservation released).
// — DOCK61 marked Occupied (entryId ET-1103945 present) but no active task found.
// — % scheduled inbounds received / outbounds loaded: UNAVAILABLE (schedule-summary API returned 500 Internal Server Error).
// — Facility-wide open counts: 2,204 inbound receipt line-items, 3,630 outbound order line-items.
// — Piece counts for outbound are pallet counts from load-task API; receive piece counts not available.
// — "Guru live out / in assign to Arnulfo" activity: TASK-5281747 (Arnulfo, DOCK52, GURUNANDA PRE_LOAD). No "live in" receive for Arnulfo in Bay 4.
// — DOCK55 added KARAKA (first non-GURUNANDA customer on Bay 4 this pull).
