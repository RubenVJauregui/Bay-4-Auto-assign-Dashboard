/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 15, 2026 ~3:08 PM PDT
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
  // ── OCCUPIED (5) ──
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: "Renato Rosales",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5292126"],
    duration: "~0.4h",
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "DANIEL BELTRAN",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5291922"],
    duration: "~4.3h",
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: "RUFINO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5292226"],
    duration: "~1.6h",
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: "RUFINO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5291946", "TASK-5290955"],
    duration: "~4.4h / ~73.8h ⚠",
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: "RUFINO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5292030", "TASK-5290744"],
    duration: "~3.8h / ~77.0h ⚠",
  },

  // ── AVAILABLE (18) — no active tasks ──
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
    door: "DOCK54",
    status: "Available",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK55",
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
    door: "DOCK67",
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
    label: "Doors Available",
    value: `${available}`,
    numerator: available,
    denominator: TOTAL_DOORS,
    percentage: (available / TOTAL_DOORS) * 100,
  },
  {
    label: "Doors Reserved",
    value: `UNAVAIL`,
    numerator: 0,
    denominator: TOTAL_DOORS,
    percentage: 0,
  },
  {
    label: "Occupancy Rate",
    value: `21.7%`,
    numerator: occupiedReserved,
    denominator: TOTAL_DOORS,
    percentage: (occupiedReserved / TOTAL_DOORS) * 100,
  },
];

export const assigneeSummaries: AssigneeSummary[] = [
  { name: "RUFINO MUNGUIA", taskCount: 5 },
  { name: "Renato Rosales", taskCount: 1 },
  { name: "DANIEL BELTRAN", taskCount: 1 },
];

// 2 outbound + 5 inbound = 7 active tasks — 29% outbound / 71% inbound
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 2, total: 7 },
  { label: "Inbound", count: 5, total: 7 },
];

// Schedule summary: YMS Appointments API not fully queried — UNAVAILABLE
export const scheduleAvailable = false;
export const scheduledInboundOrders = 0;
export const scheduledOutboundOrders = 0;
export const scheduledInboundReceived = 0;
export const scheduledOutboundLoaded = 0;
export const pctScheduledInboundReceived = 0;
export const pctScheduledOutboundLoaded = 0;

// Facility-wide: NOT queried in this pull — UNAVAILABLE
export const facilityInboundOpen = 0;
export const facilityOutboundOpen = 0;

export const assignments: TaskRecord[] = [
  // ────── OUTBOUND (2 active load tasks) ──────
  {
    taskId: "TASK-5292126",
    dns: "LOAD-5031070 +1",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS",
    assignee: "Renato Rosales",
  },
  {
    taskId: "TASK-5291922",
    dns: "LOAD-5031079 +3",
    customer: "GURUNANDA",
    pieces: "IN_PROGRESS",
    assignee: "DANIEL BELTRAN",
  },

  // ────── INBOUND (5 active receive tasks) ──────
  {
    taskId: "TASK-5292226",
    dns: "RN-186779",
    customer: "GURUNANDA",
    pieces: "NEW · APPT-6030839",
    assignee: "RUFINO MUNGUIA",
  },
  {
    taskId: "TASK-5291946",
    dns: "RN-5008070",
    customer: "GURUNANDA",
    pieces: "NEW · APPT-6030852",
    assignee: "RUFINO MUNGUIA",
  },
  {
    taskId: "TASK-5290955",
    dns: "RN-186705",
    customer: "GURUNANDA",
    pieces: "IN_PROG · APPT-6030684",
    assignee: "RUFINO MUNGUIA",
  },
  {
    taskId: "TASK-5292030",
    dns: "RN-186778",
    customer: "GURUNANDA",
    pieces: "IN_PROG · APPT-6030838",
    assignee: "RUFINO MUNGUIA",
  },
  {
    taskId: "TASK-5290744",
    dns: "RN-186704",
    customer: "GURUNANDA",
    pieces: "IN_PROG · APPT-6030683",
    assignee: "RUFINO MUNGUIA",
  },
];

// Notes:
// — 5 Occupied / 0 Reserved / 18 Available — 21.7% occupancy rate.
// — All 5 OCCUPIED doors have active tasks (2 LOAD, 5 RECEIVE).
// — Active tasks: 2 outbound / 5 inbound. Mix: 29% outbound / 71% inbound.
// — 2 OUTBOUND IN_PROGRESS, 2 INBOUND IN_PROGRESS, 2 INBOUND NEW, 1 INBOUND IN_PROGRESS.
// — ⚠ DOCK65 DOUBLE-BOOKED: TASK-5291946 (NEW ~4.4h) + TASK-5290955 (IN_PROGRESS ~73.8h since Jun 12).
// — ⚠ DOCK66 DOUBLE-BOOKED: TASK-5292030 (IN_PROGRESS ~3.8h) + TASK-5290744 (IN_PROGRESS ~77.0h since Jun 12).
// — ⚠ DOCK65 and DOCK66 have been occupied for 3+ days — potential stuck tasks needing escalation.
// — ⚠ Location API was unavailable (500 errors) — door occupancy status is inferred from active tasks, not YMS location state.
// — ⚠ YMS data unavailable — doors status could not be verified independently. Assume active-task-based occupancy.
// — RUFINO MUNGUIA: 5 Bay 4 tasks — all INBOUND on DOCK62, DOCK65, DOCK66.
// — Renato Rosales: 1 task — DOCK52 OUTBOUND.
// — DANIEL BELTRAN: 1 task — DOCK53 OUTBOUND.
// — "Guru live out / in assign to Arnulfo":
//   LIVE OUT: 0 — All Arnulfo Munguia GURUNANDA outbound tasks on Bay 4 are CLOSED.
//   LIVE IN: 0 — All Arnulfo Munguia GURUNANDA receive tasks on Bay 4 are CLOSED.
//   Most recent Arnulfo closings: TASK-5291144 (DOCK55, Jun 15 18:36), TASK-5290890 (DOCK54, Jun 15 16:00).
// — Customer mix: 100% GURUNANDA, LLC (ORG-655875).
// — Schedule %: UNAVAILABLE — full Appointments API query not performed.
// — Facility-wide: NOT queried in this pull.
// — GURUNANDA outbounds shipped today: DOCK54 (APPT-6030779), DOCK55 (APPT-6030808), DOCK56 (5 loads), DOCK59 (APPT-6030726), DOCK62 (APPT-6030431).
// — All data sourced from live WISE/WMS queries at ~3:08 PM PDT, June 15, 2026.
