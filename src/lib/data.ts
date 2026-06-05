/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 5, 2026 ~1:30 PM PDT
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
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "Rubi Manuel Sandoval",
    customer: "LA JOLLA GROUP",
    taskIds: ["TASK-5285812"],
    duration: "NEW",
  },
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "stale",
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "Arnulfo Munguia",
    customer: "GURUNANDA",
    taskIds: ["TASK-5285558"],
    duration: "~4.0h",
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "Lorenzo Rodriguez",
    customer: "GURUNANDA",
    taskIds: ["TASK-5285010", "TASK-5285860"],
    duration: "~23.3h ⚠",
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: "Arnulfo Munguia",
    customer: "GURUNANDA",
    taskIds: ["TASK-5285835"],
    duration: "just started",
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "stale",
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "stale",
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "stale",
  },

  // ── RESERVED (ASSIGNED) (8) ──
  {
    door: "DOCK60",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK62",
    status: "Reserved",
    assignee: "Caren Cubides",
    customer: "GURUNANDA",
    taskIds: ["TASK-5207670"],
    duration: "NEW",
  },
  {
    door: "DOCK64",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK68",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK69",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK70",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK71",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK72",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },

  // ── AVAILABLE (7) — D51 & D65 have active tasks despite dock status showing Available ──
  {
    door: "DOCK51",
    status: "Available",
    assignee: "Arnulfo Munguia",
    customer: "KARAKA",
    taskIds: ["TASK-5285485", "TASK-5285778"],
    duration: "~5.2h ⚠",
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
    door: "DOCK58",
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
    door: "DOCK65",
    status: "Available",
    assignee: "Caren Cubides",
    customer: "GURUNANDA",
    taskIds: ["TASK-5252949", "TASK-5254195"],
    duration: "NEW ⚠",
  },
  {
    door: "DOCK67",
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
  { name: "Arnulfo Munguia", taskCount: 5 },
  { name: "Caren Cubides", taskCount: 2 },
  { name: "Lorenzo Rodriguez", taskCount: 1 },
  { name: "Rubi Manuel Sandoval", taskCount: 1 },
  { name: "Rufino Munguia", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
];

// 5 outbound + 6 inbound = 11 active tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 5, total: 11 },
  { label: "Inbound", count: 6, total: 11 },
];

// Schedule summary: inbound & outbound schedule-summary endpoints returned 404/405
export const scheduleAvailable = false;
export const scheduledInboundOrders = 0;
export const scheduledOutboundOrders = 0;
export const scheduledInboundReceived = 0;
export const scheduledOutboundLoaded = 0;
export const pctScheduledInboundReceived = 0;
export const pctScheduledOutboundLoaded = 0;

// Facility-wide open counts from WISE (LT_F1, pulled ~1:30 PM PDT June 5)
// Outbound: 70 open (NEW + IN_PROGRESS)
// Inbound:  62 open (NEW + IN_PROGRESS)
export const facilityInboundOpen = 62;
export const facilityOutboundOpen = 70;

export const assignments: TaskRecord[] = [
  // ────── OUTBOUND (5) ──────
  // TASK-5285812 — DOCK50 — Rubi Manuel Sandoval — LIVE_LOAD NEW
  // LOAD-5030360, DN-3202378, LA JOLLA GROUP (ORG-313396), 6 pallets
  {
    taskId: "TASK-5285812",
    dns: "DN-3202378",
    customer: "LA JOLLA GROUP",
    pieces: "6 pal",
    assignee: "Rubi Manuel Sandoval",
  },
  // TASK-5285558 — DOCK53 — Arnulfo Munguia — PRE_LOAD ~4.0h
  // LOAD-5030114, DN-3198181, GURUNANDA (ORG-655875), Seal A120211
  {
    taskId: "TASK-5285558",
    dns: "DN-3198181",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285010 — DOCK54 — Lorenzo Rodriguez — PRE_LOAD ~23.3h
  // LOAD-5030073, LOAD-5030195; DN-3195089 + DN-3195088, GURUNANDA (ORG-655875)
  {
    taskId: "TASK-5285010",
    dns: "DN-3195089, DN-3195088",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  // TASK-5285860 — DOCK54 — Arnulfo Munguia — PRE_LOAD NEW ⚠ DOUBLE-BOOKED
  // DN-3198066 + DN-3198170 + DN-3198529 + DN-3190635, GURUNANDA (ORG-655875), 29 pallets
  {
    taskId: "TASK-5285860",
    dns: "DN-3198066 +3",
    customer: "GURUNANDA",
    pieces: "29 pal",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285835 — DOCK55 — Arnulfo Munguia — LIVE_LOAD just started
  // DN-3132143 + DN-3175649 + DN-3175641, GURUNANDA (ORG-655875), 28 pallets
  {
    taskId: "TASK-5285835",
    dns: "DN-3132143 +2",
    customer: "GURUNANDA",
    pieces: "28 pal",
    assignee: "Arnulfo Munguia",
  },

  // ────── INBOUND (6) ──────
  // TASK-5285485 — DOCK51 — Arnulfo Munguia — RECEIVE ~5.2h
  // RN-186139, KARAKA (ORG-585450), PO=POBOK0098-UNIS, 19 pallets
  {
    taskId: "TASK-5285485",
    dns: "RN-186139",
    customer: "KARAKA",
    pieces: "19 pal",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285778 — DOCK51 — Arnulfo Munguia — RECEIVE NEW
  // RN-182888, KARAKA (ORG-585450)
  {
    taskId: "TASK-5285778",
    dns: "RN-182888",
    customer: "KARAKA",
    pieces: "0 pal",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5207670 — DOCK62 — Caren Cubides — RECEIVE NEW
  // RN-5006269, GURUNANDA (ORG-655875), since Mar 2
  {
    taskId: "TASK-5207670",
    dns: "RN-5006269",
    customer: "GURUNANDA",
    pieces: "0 pal",
    assignee: "Caren Cubides",
  },
  // TASK-5252949 — DOCK65 — Caren Cubides — RECEIVE NEW
  // RN-183707, GURUNANDA (ORG-655875), 15 pallets, since Apr 27
  {
    taskId: "TASK-5252949",
    dns: "RN-183707",
    customer: "GURUNANDA",
    pieces: "15 pal",
    assignee: "Caren Cubides",
  },
  // TASK-5254195 — DOCK65 — Rufino Munguia — RECEIVE NEW
  // RN-5007343, GURUNANDA (ORG-655875), 7 pallets, since Apr 28
  {
    taskId: "TASK-5254195",
    dns: "RN-5007343",
    customer: "GURUNANDA",
    pieces: "7 pal",
    assignee: "Rufino Munguia",
  },
  // TASK-5090739 — DOCK50 — daira gonzalez — RECEIVE since Oct 2025 (stale)
  // RN unknown, GURUNANDA (ORG-655875)
  {
    taskId: "TASK-5090739",
    dns: "RN=?",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "daira gonzalez",
  },
];

// Notes:
// — 8 Occupied / 8 Reserved / 7 Available — 69.6% occupancy rate (occupied+reserved).
// — 4 stale OCCUPIED doors: DOCK52 (entry ET-1104275, all tasks CLOSED), DOCK61 (ET-1103945, TASK-5284169 CLOSED Jun 4), DOCK63 (ET-1099953, TASK-5283427 CLOSED Jun 3), DOCK66 (no entry, TASK-5268405 CLOSED May 15). Entries need checkout.
// — 7 stale RESERVED doors (DOCK60, DOCK64, DOCK68, DOCK69, DOCK70, DOCK71, DOCK72) assigned to entries but no active tasks.
// — ⚠ 2 AVAILABLE doors with active tasks: DOCK51 (TASK-5285485 KARAKA ~5.2h + TASK-5285778 KARAKA NEW), DOCK65 (TASK-5252949 GURUNANDA + TASK-5254195 GURUNANDA). Dock status may be stale.
// — Active tasks: 5 outbound / 6 inbound. Mix: 45% / 55%.
// — Outbound: DOCK50 (Rubi LIVE_LOAD NEW LA JOLLA), DOCK53 (Arnulfo PRE_LOAD ~4.0h), DOCK54 (Lorenzo PRE_LOAD ~23.3h + Arnulfo PRE_LOAD NEW), DOCK55 (Arnulfo LIVE_LOAD just started).
// — Inbound: DOCK51 (Arnulfo KARAKA x2), DOCK62 (Caren GURUNANDA), DOCK65 (Caren GURUNANDA + Rufino GURUNANDA).
// — Customer mix: GURUNANDA (ORG-655875) on 8 of 11 active tasks, KARAKA (ORG-585450) on 2, LA JOLLA GROUP (ORG-313396) on 1.
// — ⚠ DOCK54 DOUBLE-BOOKED: Lorenzo TASK-5285010 (IN_PROGRESS ~23.3h) + Arnulfo TASK-5285860 (NEW, 29 pal, 4 DNs). Two assignees on same door.
// — ARNULFO MUNGUIA: 5 Bay 4 tasks — 3 outbound (TASK-5285558 DOCK53, TASK-5285860 DOCK54, TASK-5285835 DOCK55) + 2 inbound (TASK-5285485 DOCK51, TASK-5285778 DOCK51).
// — "Guru live out / in assign to Arnulfo":
//   LIVE OUT: TASK-5285558 (DOCK53, PRE_LOAD, ~4.0h, DN-3198181, Seal A120211), TASK-5285835 (DOCK55, LIVE_LOAD, just started, 28 pal, 3 DNs), TASK-5285860 (DOCK54, PRE_LOAD, NEW, 29 pal, 4 DNs).
//   LIVE IN: No GURUNANDA receive for Arnulfo on Bay 4. His Bay 4 receives are KARAKA only: TASK-5285485 (RN-186139, DOCK51, ~5.2h) + TASK-5285778 (RN-182888, DOCK51, NEW).
//   Previous TASK-5281747 (DOCK52, DN-3190424, 28 pal) CLOSED at ~10:06 AM PDT today after ~71h active.
// — Lorenzo Rodriguez: 1 task — DOCK54 (PRE_LOAD ~23.3h, since Jun 4 2:13 PM). DOCK52 task TASK-5285635 CLOSED at 11:41 AM PDT today.
// — Caren Cubides: 2 tasks — DOCK62 (RECEIVE NEW since Mar 2) + DOCK65 (RECEIVE NEW, 15 pal, since Apr 27).
// — Rubi Manuel Sandoval: 1 task — DOCK50 (LIVE_LOAD NEW, LA JOLLA GROUP, 6 pal).
// — Rufino Munguia: 1 task — DOCK65 (RECEIVE NEW, 7 pal, since Apr 28).
// — daira gonzalez: 1 stale task — DOCK50 (RECEIVE IN_PROGRESS since Oct 2025, ~5,464h, likely orphaned).
// — AGING TASKS: TASK-5285010 (Lorenzo, DOCK54, ~23.3h), TASK-5285485 (Arnulfo, DOCK51, ~5.2h), TASK-5090739 (daira, DOCK50, ~5,464h stale).
// — 6 IN_PROGRESS, 5 NEW. No CLOSED tasks on Bay 4 today (2 closed earlier: TASK-5285635, TASK-5281747).
// — Schedule %: UNAVAILABLE — schedule-summary endpoints returned 404/405.
// — Facility-wide: 62 inbound open, 70 outbound open (132 total).
// — Load tasks closed today (facility-wide): 40.
// — Receipts created today: 47. Orders scheduled today: 4,458.
// — All data sourced from live WISE/WMS queries at ~1:30 PM PDT, June 5, 2026.
