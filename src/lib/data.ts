/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 4, 2026 ~21:30 PDT
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
  // ── OCCUPIED (10) ──
  { door: "DOCK50", status: "Occupied", assignee: "daira gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5090739"], duration: "~227d ⚠" },
  { door: "DOCK52", status: "Occupied", assignee: "Arnulfo Munguia", customer: "GURUNANDA", taskIds: ["TASK-5281747"], duration: "~2.5d" },
  { door: "DOCK53", status: "Occupied", assignee: "Lorenzo Rodriguez", customer: "GURUNANDA", taskIds: ["TASK-5284794", "TASK-5280242"], duration: "~9.7h / 3.5d" },
  { door: "DOCK54", status: "Occupied", assignee: "Lorenzo Rodriguez", customer: "GURUNANDA", taskIds: ["TASK-5285010"], duration: "~7.6h" },
  { door: "DOCK55", status: "Occupied", assignee: "Jerome Aranda", customer: "KARAKA", taskIds: ["TASK-5284151"], duration: "~12.9h" },
  { door: "DOCK62", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5285184", "TASK-5207670"], duration: "~5h / 94.5d" },
  { door: "DOCK63", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5285210", "TASK-5278242", "TASK-5277747"], duration: "~2.5h / 8.3d" },
  { door: "DOCK64", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5285211"], duration: "~2.4h" },
  { door: "DOCK65", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5283625", "TASK-5254195", "TASK-5252949"], duration: "~30.4h / 38.6d" },
  { door: "DOCK66", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "No active task" },

  // ── RESERVED (1) ──
  { door: "DOCK56", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },

  // ── AVAILABLE (12) ──
  { door: "DOCK51", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK57", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK58", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK60", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK61", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
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
  { name: "Daniela Gonzalez", taskCount: 6 },
  { name: "Lorenzo Rodriguez", taskCount: 2 },
  { name: "Caren Cubides", taskCount: 2 },
  { name: "Arnulfo Munguia", taskCount: 1 },
  { name: "carolina ruiz", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
  { name: "Jerome Aranda", taskCount: 1 },
  { name: "Edgar Flores", taskCount: 1 },
];

export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 15 },
  { label: "Inbound", count: 11, total: 15 },
  { label: "General", count: 0, total: 15 },
];

// Facility-wide open counts from WMS (LT_F1, pulled ~21:30 PDT)
export const facilityInboundOpen = 63;
export const facilityOutboundOpen = 47;

export const assignments: TaskRecord[] = [
  // ────── OUTBOUND LOAD LINES ──────
  // TASK-5281747 — DOCK52 — Arnulfo Munguia (IN_PROGRESS ~2.5d, PRE_LOAD)
  {
    taskId: "TASK-5281747",
    dns: "DN-3190424",
    customer: "GURUNANDA",
    pieces: "28 pal",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5284794 — DOCK53 — Lorenzo Rodriguez (8 loads, all LOADED, ~9.7h)
  {
    taskId: "TASK-5284794-1",
    dns: "DN-3198074",
    customer: "GURUNANDA",
    pieces: "9 pal",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5284794-2",
    dns: "DN-3195098",
    customer: "GURUNANDA",
    pieces: "3 pal",
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
    dns: "DN-3194936",
    customer: "GURUNANDA",
    pieces: "3 pal",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5284794-5",
    dns: "DN-3190634",
    customer: "GURUNANDA",
    pieces: "1 pal",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5284794-6",
    dns: "DN-3197870",
    customer: "GURUNANDA",
    pieces: "1 pal",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5284794-7",
    dns: "DN-3198789",
    customer: "GURUNANDA",
    pieces: "1 pal",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5284794-8",
    dns: "DN-3197866",
    customer: "GURUNANDA",
    pieces: "1 pal",
    assignee: "Lorenzo Rodriguez",
  },
  // TASK-5280242 — DOCK53 — carolina ruiz (IN_PROGRESS ~3.5d, PRE_LOAD)
  {
    taskId: "TASK-5280242",
    dns: "DN-3189539",
    customer: "GURUNANDA",
    pieces: "26 pal",
    assignee: "carolina ruiz",
  },
  // TASK-5285010 — DOCK54 — Lorenzo Rodriguez (2 loads, ~7.6h)
  {
    taskId: "TASK-5285010-1",
    dns: "DN-3195088",
    customer: "GURUNANDA",
    pieces: "24 pal",
    assignee: "Lorenzo Rodriguez",
  },
  {
    taskId: "TASK-5285010-2",
    dns: "DN-3195089",
    customer: "GURUNANDA",
    pieces: "19 pal",
    assignee: "Lorenzo Rodriguez",
  },

  // ────── INBOUND RECEIVE LINES ──────
  // TASK-5090739 — DOCK50 — daira gonzalez (IN_PROGRESS ~227d)
  {
    taskId: "TASK-5090739",
    dns: "RN-5002143",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "daira gonzalez",
  },
  // TASK-5284151 — DOCK55 — Jerome Aranda (NEW ~12.9h, KARAKA)
  {
    taskId: "TASK-5284151",
    dns: "RN-186139",
    customer: "KARAKA",
    pieces: "—",
    assignee: "Jerome Aranda",
  },
  // TASK-5285184 — DOCK62 — Daniela Gonzalez (IN_PROGRESS ~5h)
  {
    taskId: "TASK-5285184",
    dns: "RN-5007923",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5207670 — DOCK62 — Caren Cubides (NEW ~94.5d)
  {
    taskId: "TASK-5207670",
    dns: "RN-5006269",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Caren Cubides",
  },
  // TASK-5285210 — DOCK63 — Daniela Gonzalez (IN_PROGRESS ~2.5h)
  {
    taskId: "TASK-5285210",
    dns: "RN-5007942",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5278242 — DOCK63 — Daniela Gonzalez (IN_PROGRESS ~7.5d)
  {
    taskId: "TASK-5278242",
    dns: "RN-5007786",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5277747 — DOCK63 — Daniela Gonzalez (IN_PROGRESS ~8.3d)
  {
    taskId: "TASK-5277747",
    dns: "RN-5007760",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5285211 — DOCK64 — Daniela Gonzalez (IN_PROGRESS ~2.4h)
  {
    taskId: "TASK-5285211",
    dns: "RN-5007909",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5283625 — DOCK65 — Daniela Gonzalez (IN_PROGRESS ~30.4h)
  {
    taskId: "TASK-5283625",
    dns: "RN-186014",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5254195 — DOCK65 — Edgar Flores (NEW ~37.5d)
  {
    taskId: "TASK-5254195",
    dns: "RN-5007343",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Edgar Flores",
  },
  // TASK-5252949 — DOCK65 — Caren Cubides (NEW ~38.6d)
  {
    taskId: "TASK-5252949",
    dns: "RN-183707",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Caren Cubides",
  },
];

// Notes:
// — 10 Occupied / 1 Reserved / 12 Available — total 11/23 doors occupied+reserved (47.8%).
// — Active tasks: 4 outbound (PRE_LOAD) / 11 inbound (RECEIVE) — 27% outbound / 73% inbound.
// — Dominant customer: GURUNANDA (ORG-655875) on 14 of 15 active tasks. KARAKA (ORG-585450) on DOCK55.
// — Arnulfo Munguia: TASK-5281747 on DOCK52, PRE_LOAD IN_PROGRESS ~2.5d, DN-3190424 28 pal (LOADED + carrier signed 6/4 09:14). No live receive for Arnulfo in Bay 4.
// — Lorenzo Rodriguez: 2 PRE_LOAD tasks — DOCK53 (TASK-5284794, 8 loads LOADED, ~9.7h) + DOCK54 (TASK-5285010, 2 loads, ~7.6h).
// — Daniela Gonzalez: 6 RECEIVE tasks — DOCK62 (TASK-5285184 ~5h), DOCK63 (TASK-5285210 ~2.5h + TASK-5278242 ~7.5d + TASK-5277747 ~8.3d), DOCK64 (TASK-5285211 ~2.4h), DOCK65 (TASK-5283625 ~30.4h).
// — carolina ruiz: TASK-5280242 on DOCK53, PRE_LOAD IN_PROGRESS ~3.5d, DN-3189539 26 pal (LOADED). This task was previously attributed to Luis Velazquez.
// — Jerome Aranda: 1 RECEIVE task — DOCK55 (TASK-5284151, KARAKA RN-186139, NEW ~12.9h).
// — daira gonzalez: 1 RECEIVE task — DOCK50 (TASK-5090739, GURUNANDA RN-5002143, IN_PROGRESS ~227d — severely aged).
// — Caren Cubides: 2 RECEIVE tasks — DOCK62 (TASK-5207670 NEW ~94.5d), DOCK65 (TASK-5252949 NEW ~38.6d).
// — Edgar Flores: 1 RECEIVE task — DOCK65 (TASK-5254195 NEW ~37.5d).
// — DOCK66 physically occupied (dockStatus=OCCUPIED) but no active task found.
// — DOCK61 returned to Available (was Occupied — entry ET-1103945 cleared).
// — DOCK50 now Occupied (TASK-5090739 reactivated or newly discovered).
// — Reserved doors dropped from 6→1: DOCK60, DOCK68-DOCK72 now Available.
// — All 12 loads across 4 load tasks show LOADED but all 4 load tasks remain IN_PROGRESS.
// — % scheduled inbounds received / outbounds loaded: UNAVAILABLE (schedule-summary API not accessible).
// — Facility-wide open counts: 63 inbound receive tasks, 47 outbound load tasks.
// — "Guru live out / in assign to Arnulfo": TASK-5281747 (Arnulfo, DOCK52, GURUNANDA PRE_LOAD ~2.5d, DN-3190424 28 pal). No "live in" receive for Arnulfo in Bay 4.
// — Piece counts for outbound are pallet counts from load-task API; receive piece counts not available.
