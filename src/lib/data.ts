/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 4, 2026 ~22:00 PDT
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
  { door: "DOCK52", status: "Occupied", assignee: "Arnulfo Munguia", customer: "GURUNANDA", taskIds: ["TASK-5281747"], duration: "~53h" },
  { door: "DOCK53", status: "Occupied", assignee: "Lorenzo Rodriguez + Luis Velazquez", customer: "GURUNANDA", taskIds: ["TASK-5284794", "TASK-5280242"], duration: "~5.1h / ~78h ⚠" },
  { door: "DOCK54", status: "Occupied", assignee: "Lorenzo Rodriguez", customer: "GURUNANDA", taskIds: ["TASK-5285010"], duration: "~0.9h" },
  { door: "DOCK61", status: "Occupied", assignee: null, customer: null, taskIds: [], duration: "No active task ⚠" },
  { door: "DOCK62", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5285184"], duration: "~2.4h" },
  { door: "DOCK63", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5285210"], duration: "~0.5h" },
  { door: "DOCK64", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5285211"], duration: "~0.0h" },

  // ── RESERVED (4 — stale ASSIGNED, no active task) ──
  { door: "DOCK60", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK68", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK70", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK71", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },

  // ── AVAILABLE (12) ──
  { door: "DOCK50", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK51", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK55", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK56", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK57", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK58", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
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

// Facility-wide open counts from WMS (LT_F1, pulled ~22:00 PDT)
export const facilityInboundOpen = 62;
export const facilityOutboundOpen = 47;

export const assignments: TaskRecord[] = [
  // ────── OUTBOUND LOAD LINES ──────
  // TASK-5281747 — DOCK52 — Arnulfo Munguia (IN_PROGRESS ~53h, PRE_LOAD)
  {
    taskId: "TASK-5281747",
    dns: "DN-3190424",
    customer: "GURUNANDA",
    pieces: "28 pal",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5284794 — DOCK53 — Lorenzo Rodriguez (8 loads, all LOADED, ~5.1h)
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
    pieces: "2 pal",
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
  // TASK-5280242 — DOCK53 — Luis Velazquez (IN_PROGRESS ~78h, PRE_LOAD)
  {
    taskId: "TASK-5280242",
    dns: "DN-3189539",
    customer: "GURUNANDA",
    pieces: "26 pal",
    assignee: "Luis Velazquez",
  },
  // TASK-5285010 — DOCK54 — Lorenzo Rodriguez (2 loads, ~0.9h)
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
];

// Notes:
// — 7 Occupied / 4 Reserved / 12 Available — total 11/23 doors occupied+reserved (47.8%).
// — Active tasks: 4 outbound (PRE_LOAD) / 3 inbound (RECEIVE) — 57% outbound / 43% inbound.
// — Dominant customer: GURUNANDA (ORG-655875) on ALL 7 active tasks — 100% of Bay 4 activity.
// — Arnulfo Munguia: TASK-5281747 on DOCK52, PRE_LOAD ~53h, DN-3190424 28 pal (all LOADED, carrier signed 6/4 16:14, seal 25079538). Task STUCK — should be CLOSED.
// — Lorenzo Rodriguez: 2 PRE_LOAD tasks — DOCK53 (TASK-5284794, 8 loads/21 pal all LOADED, ~5.1h) + DOCK54 (TASK-5285010, 2 loads/43 pal all LOADED, ~0.9h).
// — Luis Velazquez: TASK-5280242 on DOCK53, PRE_LOAD ~78h, DN-3189539 26 pal all LOADED (seal A120280). Task STUCK on same door as TASK-5284794 — DOCK53 double-booked.
// — Daniela Gonzalez: 3 RECEIVE tasks — DOCK62 (TASK-5285184 ~2.4h), DOCK63 (TASK-5285210 ~0.5h), DOCK64 (TASK-5285211 ~0.0h).
// — DOCK61 stale OCCUPIED: dockStatus=OCCUPIED but no active task found — needs reconciliation.
// — DOCK60, DOCK68, DOCK70, DOCK71 stale ASSIGNED: dockStatus=ASSIGNED but no active tasks — needs reconciliation.
// — DOCK50 returned to Available (was Occupied — TASK-5090739 concluded/moved).
// — DOCK55 returned to Available (was Occupied — Jerome Aranda KARAKA TASK-5284151 concluded).
// — DOCK65 returned to Available (was Occupied — TASK-5283625 concluded).
// — DOCK66 returned to Available (was Occupied with no task — stale status cleared).
// — No KARAKA activity on Bay 4. All tasks are GURUNANDA.
// — All 4 Bay 4 load tasks have 100% pallets LOADED — all 4 remain IN_PROGRESS (not closed).
// — % scheduled inbounds received / outbounds loaded: UNAVAILABLE (schedule-summary API not accessible).
// — Facility-wide open counts: 62 inbound receive tasks, 47 outbound load tasks.
// — "Guru live out / in assign to Arnulfo": TASK-5281747 (Arnulfo, DOCK52, GURUNANDA PRE_LOAD ~53h, DN-3190424 28 pal). No "live in" receive for Arnulfo in Bay 4.
// — Piece counts for outbound are pallet counts from load-task API; receive piece counts not available.
// — DOCK53 has 2 active LOAD tasks (conflict): TASK-5284794 (Lorenzo) + TASK-5280242 (Luis Velazquez).
