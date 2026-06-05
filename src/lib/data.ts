/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 4, 2026 ~17:00 PDT
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
  { door: "DOCK52", status: "Occupied", assignee: "Arnulfo Munguia", customer: "GURUNANDA", taskIds: ["TASK-5281747"], duration: "~55h" },
  { door: "DOCK53", status: "Occupied", assignee: "Lorenzo Rodriguez, Luis Velazquez", customer: "GURUNANDA", taskIds: ["TASK-5284794", "TASK-5280242"], duration: "~5h / ~80h" },
  { door: "DOCK54", status: "Occupied", assignee: "Lorenzo Rodriguez", customer: "GURUNANDA", taskIds: ["TASK-5285010"], duration: "~3h" },
  { door: "DOCK55", status: "Reserved", assignee: null, customer: null, taskIds: ["TASK-5284151"], duration: "RECEIVE (NEW)" },
  { door: "DOCK56", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK57", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK58", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK60", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK61", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK62", status: "Occupied", assignee: "Daniela Gonzalez", customer: null, taskIds: ["TASK-5285184", "TASK-5207670"], duration: "~0.3h / RECEIVE" },
  { door: "DOCK63", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK64", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK65", status: "Occupied", assignee: "Daniela Gonzalez, Rufino Munguia", customer: null, taskIds: ["TASK-5283625", "TASK-5254195", "TASK-5252949"], duration: "~20.5h / RECEIVE" },
  { door: "DOCK66", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK67", status: "Occupied", assignee: "Daniela Gonzalez", customer: null, taskIds: ["TASK-5285130"], duration: "~1.3h" },
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
  { name: "Rufino Munguia", taskCount: 1 },
];

export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 11 },
  { label: "Inbound", count: 7, total: 11 },
  { label: "General", count: 0, total: 11 },
];

// Facility-wide schedule counts unavailable — schedule-summary APIs return server errors (404/405/400)
export const facilityInboundOpen = -1;
export const facilityOutboundOpen = -1;

export const assignments: TaskRecord[] = [
  // ────── OUTBOUND LOAD LINES ──────
  // TASK-5281747 — DOCK52 — Arnulfo Munguia (IN_PROGRESS ~55h)
  {
    taskId: "TASK-5281747",
    dns: "DN-3190424",
    customer: "GURUNANDA",
    pieces: "28 pal / ~60,370 pc",
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
  // TASK-5280242 — DOCK53 — Luis Velazquez (stale ~80h, detail TBD)
  {
    taskId: "TASK-5280242",
    dns: "LOAD-5029547",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Luis Velazquez",
  },
  // TASK-5285010 — DOCK54 — Lorenzo Rodriguez (2 loads, 43 pallets)
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
  // TASK-5284151 — DOCK55 — NEW, unassigned
  {
    taskId: "TASK-5284151",
    dns: "RN-186139",
    customer: "—",
    pieces: "—",
    assignee: "Unassigned",
  },
  // TASK-5285184 — DOCK62 — Daniela Gonzalez (IN_PROGRESS ~0.3h)
  {
    taskId: "TASK-5285184",
    dns: "RN-5007923",
    customer: "—",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5207670 — DOCK62 — NEW, unassigned
  {
    taskId: "TASK-5207670",
    dns: "RN-5006269",
    customer: "—",
    pieces: "—",
    assignee: "Unassigned",
  },
  // TASK-5283625 — DOCK65 — Daniela Gonzalez (IN_PROGRESS ~20.5h)
  {
    taskId: "TASK-5283625",
    dns: "RN-186014",
    customer: "—",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5254195 — DOCK65 — Rufino Munguia (NEW)
  {
    taskId: "TASK-5254195",
    dns: "RN-5007343",
    customer: "—",
    pieces: "—",
    assignee: "Rufino Munguia",
  },
  // TASK-5252949 — DOCK65 — NEW, unassigned
  {
    taskId: "TASK-5252949",
    dns: "RN-183707",
    customer: "—",
    pieces: "—",
    assignee: "Unassigned",
  },
  // TASK-5285130 — DOCK67 — Daniela Gonzalez (IN_PROGRESS ~1.3h)
  {
    taskId: "TASK-5285130",
    dns: "RN-5007903",
    customer: "—",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
];

// Notes:
// — All Bay 4 active OUTBOUND load tasks are GURUNANDA (ORG-655875).
// — Inbound receive task customers not available from API at this granularity.
// — Arnulfo Munguia: TASK-5281747 on DOCK52, PRE_LOAD IN_PROGRESS ~55h, DN-3190424 (28 pal / ~60,370 pieces).
// — DOCK53: TASK-5284794 (Lorenzo Rodriguez, 8 loads all LOADED, 21 pallets, ~5h) + TASK-5280242 (Luis Velazquez, stale ~80h).
// — DOCK54: TASK-5285010 (Lorenzo Rodriguez, 2 loads LOADED, 43 pallets, ~3h).
// — Daniela Gonzalez now active on 3 receive tasks: DOCK62 (~0.3h), DOCK65 (~20.5h), DOCK67 (~1.3h).
// — DOCK55: TASK-5284151 (RECEIVE, NEW, unassigned) — Reserved status.
// — DOCK59/DOCK63 previously Reserved — now Available (entry tickets CLOSED/FORCE_CLOSED, no active tasks).
// — DOCK50 still has TASK-5090739 (226-day stale IN_PROGRESS) — excluded from active counts.
// — 6 doors (DOCK56-58, DOCK63, DOCK69, DOCK71) have no internal dock ID and zero activity across all searches.
// — % scheduled inbounds received / outbounds loaded: UNAVAILABLE (schedule-summary APIs return 404/405/400 for LT_F1).
// — Facility-wide open counts: UNAVAILABLE (same API limitation).
// — Task-action API returned 0 results for all Bay 4 assignees — assignment transaction history unavailable through this endpoint.
// — "Guru live out / in assign to Arnulfo" activity: not returned by task-action API for June 4 date range.
// — Piece counts for outbound are pallet counts from load-task API; receive piece counts not available.
