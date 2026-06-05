/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 5, 2026 ~2:00 PM PDT
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
  // ── OCCUPIED (5) ── active load tasks confirmed via WISE ──
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "Arnulfo Munguia",
    customer: "GURUNANDA",
    taskIds: ["TASK-5285558"],
    duration: "~5.0h",
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "Lorenzo Rodriguez",
    customer: "GURUNANDA",
    taskIds: ["TASK-5285010", "TASK-5285860"],
    duration: "~24.0h ⚠",
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "Arnulfo Munguia",
    customer: "GURUNANDA",
    taskIds: ["TASK-5285835"],
    duration: "~0.8h",
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: "Sebastian Gonzalez",
    customer: "LA JOLLA GROUP",
    taskIds: ["TASK-5285812"],
    duration: "~1.2h",
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: "Jerome Aranda",
    customer: "GURUNANDA",
    taskIds: ["TASK-5285880"],
    duration: "NEW",
  },

  // ── AVAILABLE (18) ── no active load or receive tasks ──
  {
    door: "DOCK50",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK51",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK52",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK56",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK57",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK59",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK60",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK61",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK62",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK63",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK64",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK65",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK66",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK68",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK69",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK70",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK71",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK72",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
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
  { name: "Arnulfo Munguia", taskCount: 3 },
  { name: "Lorenzo Rodriguez", taskCount: 1 },
  { name: "Sebastian Gonzalez", taskCount: 1 },
  { name: "Jerome Aranda", taskCount: 1 },
];

// 6 outbound + 0 inbound = 6 active tasks — 100% outbound
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 6, total: 6 },
  { label: "Inbound", count: 0, total: 6 },
];

// Schedule summary: inbound & outbound schedule-summary endpoints returned 404
export const scheduleAvailable = false;
export const scheduledInboundOrders = 0;
export const scheduledOutboundOrders = 0;
export const scheduledInboundReceived = 0;
export const scheduledOutboundLoaded = 0;
export const pctScheduledInboundReceived = 0;
export const pctScheduledOutboundLoaded = 0;

// Facility-wide open counts from WISE (LT_F1, pulled ~2:00 PM PDT June 5)
// Outbound: 71 open (NEW + IN_PROGRESS) — of which 46 IN_PROGRESS
// Inbound:  106 active offloading records
export const facilityInboundOpen = 106;
export const facilityOutboundOpen = 71;

export const assignments: TaskRecord[] = [
  // ────── OUTBOUND (6 active load tasks) ──────
  // TASK-5285558 — DOCK53 — Arnulfo Munguia — PRE_LOAD ~5.0h
  // DN-3198181, GURUNANDA (ORG-655875), Seal A120211
  {
    taskId: "TASK-5285558",
    dns: "DN-3198181",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285010 — DOCK54 — Lorenzo Rodriguez — PRE_LOAD ~24.0h
  // DN-3195089 + DN-3195088, GURUNANDA (ORG-655875)
  {
    taskId: "TASK-5285010",
    dns: "DN-3195089, DN-3195088",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  // TASK-5285860 — DOCK54 — Arnulfo Munguia — PRE_LOAD NEW
  // DN-3198066 + DN-3198170 + DN-3198529 + DN-3190635, GURUNANDA (ORG-655875), 29 pallets
  {
    taskId: "TASK-5285860",
    dns: "DN-3198066 +3",
    customer: "GURUNANDA",
    pieces: "29 pal",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285835 — DOCK55 — Arnulfo Munguia — LIVE_LOAD ~0.8h
  // DN-3132143 + DN-3175649 + DN-3175641, GURUNANDA (ORG-655875), 28 pallets
  {
    taskId: "TASK-5285835",
    dns: "DN-3132143 +2",
    customer: "GURUNANDA",
    pieces: "28 pal",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285812 — DOCK58 — Sebastian Gonzalez — LIVE_LOAD ~1.2h
  // DN-3202378, LA JOLLA GROUP (ORG-313396), 6 pallets
  {
    taskId: "TASK-5285812",
    dns: "DN-3202378",
    customer: "LA JOLLA GROUP",
    pieces: "6 pal",
    assignee: "Sebastian Gonzalez",
  },
  // TASK-5285880 — DOCK67 — Jerome Aranda — LIVE_LOAD NEW
  // DN-3190330, GURUNANDA (ORG-655875)
  {
    taskId: "TASK-5285880",
    dns: "DN-3190330",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Jerome Aranda",
  },
];

// Notes:
// — 5 Occupied / 0 Reserved / 18 Available — 21.7% occupancy rate.
// — All 5 OCCUPIED doors have active load tasks (PRE_LOAD or LIVE_LOAD).
// — No active receive tasks on any Bay 4 door (all receive entries CLOSED or FORCE_CLOSED).
// — DOCK54 DOUBLE-BOOKED: Lorenzo TASK-5285010 (IN_PROGRESS ~24.0h) + Arnulfo TASK-5285860 (NEW, 29 pal, 4 DNs).
// — Active tasks: 6 outbound / 0 inbound. Mix: 100% / 0%.
// — Three tasks IN_PROGRESS (TASK-5285558, TASK-5285010, TASK-5285835, TASK-5285812), two NEW (TASK-5285860, TASK-5285880).
// — ARNULFO MUNGUIA: 3 Bay 4 tasks — all GURUNANDA outbound: DOCK53 (PRE_LOAD ~5.0h), DOCK54 (PRE_LOAD NEW 29 pal), DOCK55 (LIVE_LOAD ~0.8h 28 pal).
// — "Guru live out / in assign to Arnulfo":
//   LIVE OUT: 3 active GURUNANDA outbound — TASK-5285558 (DOCK53, ~5.0h), TASK-5285835 (DOCK55, ~0.8h, 28 pal), TASK-5285860 (DOCK54, NEW, 29 pal).
//   LIVE IN: None — no GURUNANDA receive tasks for Arnulfo on Bay 4.
//   Previous TASK-5281747 (DOCK52, DN-3190424, 28 pal) CLOSED ~10:06 AM PDT today after ~71h active.
// — Lorenzo Rodriguez: 1 task — DOCK54 (PRE_LOAD ~24.0h, since Jun 4 2:04 PM). TASK-5285635 (DOCK52) CLOSED 11:41 AM.
// — Sebastian Gonzalez: 1 task — DOCK58 (LIVE_LOAD ~1.2h, LA JOLLA GROUP, 6 pal).
// — Jerome Aranda: 1 task — DOCK67 (LIVE_LOAD NEW, GURUNANDA, DN-3190330).
// — Customer mix: GURUNANDA (ORG-655875) on 5 of 6 active tasks, LA JOLLA GROUP (ORG-313396) on 1.
// — AGING: TASK-5285010 (Lorenzo, DOCK54, ~24.0h, since Jun 4 afternoon).
// — Many previously occupied/reserved doors now AVAILABLE after entry checkouts and task closures.
// — Schedule %: UNAVAILABLE — schedule-summary endpoints returned 404.
// — Facility-wide: 106 inbound open (offloading), 71 outbound open (46 IN_PROGRESS + 25 NEW).
// — Facility-wide today: 40 load tasks closed, 47 receipts created, 4,458 orders scheduled.
// — 13,698 closed load tasks facility-wide.
// — All data sourced from live WISE/WMS queries at ~2:00 PM PDT, June 5, 2026.
