/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 7, 2026 ~4:00 PM PDT
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
  // ── OCCUPIED (8) ── 6 active + 2 ghost ──
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "daira gonzalez",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5090739"],
    duration: "~228d ⚠",
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "Arnulfo Munguia",
    customer: "KARAKA, LLC",
    taskIds: ["TASK-5285778"],
    duration: "NEW",
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "Arnulfo Munguia",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5285558", "TASK-5285913"],
    duration: "~1d 16h – ~1d 23h",
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "Lorenzo Rodriguez + Arnulfo",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5285010", "TASK-5285860"],
    duration: "~2d 18h ⚠",
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: "Caren Cubides",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5207670"],
    duration: "~97d ⚠",
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: "Rufino Munguia + Caren",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5254195", "TASK-5252949"],
    duration: "~40d ⚠",
  },

  // ── GHOST-OCCUPIED (2) — dockStatus=OCCUPIED, no active tasks ──
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: "⚠ Ghost — ET-1104275, no active tasks",
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: "⚠ Ghost — OCCUPIED, no ET, no tasks",
    taskIds: [],
    duration: null,
  },

  // ── RESERVED (15) — YMS ASSIGNED, no active tasks ──
  {
    door: "DOCK55",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK56",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK57",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK58",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK59",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK60",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK61",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
  },
  {
    door: "DOCK63",
    status: "Reserved",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: null,
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
    door: "DOCK67",
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

  // ── AVAILABLE (0) ──
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
  { name: "Caren Cubides", taskCount: 2 },
  { name: "Lorenzo Rodriguez", taskCount: 1 },
  { name: "Rufino Munguia", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
];

// 4 outbound + 5 inbound = 9 active tasks — 44% outbound / 56% inbound
export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 4, total: 9 },
  { label: "Inbound", count: 5, total: 9 },
];

// Schedule summary: cumulative from WISE search-by-paging endpoints
export const scheduleAvailable = true;
export const scheduledInboundOrders = 15318;
export const scheduledOutboundOrders = 732922;
export const scheduledInboundReceived = 10192;
export const scheduledOutboundLoaded = 702396;
export const pctScheduledInboundReceived = 66.5;
export const pctScheduledOutboundLoaded = 95.8;

// Facility-wide from WISE (LT_F1, pulled ~4:00 PM PDT June 7)
// Open: 47 inbound + 50 outbound = 97 total active
export const facilityInboundOpen = 47;
export const facilityOutboundOpen = 50;

export const assignments: TaskRecord[] = [
  // ────── OUTBOUND (4 active load tasks) ──────
  // TASK-5285558 — DOCK53 — Arnulfo Munguia — LOAD IN_PROGRESS ~1d 23h
  // LOAD-5030114, GURUNANDA, LLC (ORG-655875), started Jun 5 4:31 PM PDT
  {
    taskId: "TASK-5285558",
    dns: "DN-3198181",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285913 — DOCK53 — Arnulfo Munguia — LOAD IN_PROGRESS ~1d 16h
  // LOAD-5030247 + LOAD-5030248, GURUNANDA, LLC (ORG-655875), started Jun 5 11:15 PM PDT
  {
    taskId: "TASK-5285913",
    dns: "DN-3203261 +1",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285010 — DOCK54 — Lorenzo Rodriguez — LOAD IN_PROGRESS ~2d 18h ⚠
  // LOAD-5030073 + LOAD-5030195, GURUNANDA, LLC (ORG-655875), since Jun 4 9:13 PM PDT
  {
    taskId: "TASK-5285010",
    dns: "DN-3195089, DN-3195088",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Lorenzo Rodriguez",
  },
  // TASK-5285860 — DOCK54 — Arnulfo Munguia — LOAD NEW (not started)
  // 4 loads: LOAD-5030111, LOAD-5030113, LOAD-5030115, LOAD-5029667, GURUNANDA, LLC
  {
    taskId: "TASK-5285860",
    dns: "DN-3190635 +3",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Arnulfo Munguia",
  },

  // ────── INBOUND (5 active receive tasks) ──────
  // TASK-5090739 — DOCK50 — daira gonzalez — RECEIVE IN_PROGRESS ~228d ⚠
  // RN-5002143, GURUNANDA, LLC (ORG-655875), since Oct 21, 2025
  {
    taskId: "TASK-5090739",
    dns: "RN-5002143",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "daira gonzalez",
  },
  // TASK-5285778 — DOCK51 — Arnulfo Munguia — RECEIVE NEW (not started)
  // RN-182888 (POKRK2135), KARAKA, LLC (ORG-585450)
  {
    taskId: "TASK-5285778",
    dns: "RN-182888",
    customer: "KARAKA LLC",
    pieces: "IRO",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5207670 — DOCK62 — Caren Cubides — RECEIVE NEW
  // RN-5006269 (B00393665), GURUNANDA, LLC (ORG-655875), since Mar 2
  {
    taskId: "TASK-5207670",
    dns: "RN-5006269",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Caren Cubides",
  },
  // TASK-5254195 — DOCK65 — Rufino Munguia — RECEIVE NEW ~40d ⚠
  // RN-5007343 (GKSBLR26044), GURUNANDA, LLC (ORG-655875), since Apr 28
  {
    taskId: "TASK-5254195",
    dns: "RN-5007343",
    customer: "GURUNANDA",
    pieces: "PO 125-16768253",
    assignee: "Rufino Munguia",
  },
  // TASK-5252949 — DOCK65 — Caren Cubides — RECEIVE NEW ~40d ⚠  RETURNED
  // RN-183707, GURUNANDA, LLC (ORG-655875), since Apr 27
  {
    taskId: "TASK-5252949",
    dns: "RN-183707",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Caren Cubides",
  },
];

// Notes:
// — 8 Occupied / 15 Reserved / 0 Available — 34.8% occupied, 100% occupancy rate (incl. reserved).
// — 6 of 8 OCCUPIED doors have active tasks (LOAD or RECEIVE). 2 are ghost-occupied (DOCK52, DOCK66).
// — Active tasks: 4 outbound / 5 inbound. Mix: 44% outbound / 56% inbound.
// — 3 tasks IN_PROGRESS (TASK-5285558, TASK-5285913, TASK-5285010), 6 NEW.
// — ⚠ DOCK54 DOUBLE-BOOKED: Lorenzo TASK-5285010 (IN_PROGRESS ~2d 18h) + Arnulfo TASK-5285860 (NEW, 4 DNs).
// — ⚠ DOCK53 DOUBLE-BOOKED: Arnulfo TASK-5285558 (IN_PROGRESS ~1d 23h) + TASK-5285913 (IN_PROGRESS ~1d 16h).
// — ⚠ DOCK65 DOUBLE-BOOKED: Rufino TASK-5254195 (NEW ~40d) + Caren TASK-5252949 (NEW ~40d, RETURNED).
// — ⚠ DOCK52 ghost-occupied: YMS OCCUPIED with ET-1104275 (TRAILER 53160) but zero active load/receive tasks.
// — ⚠ DOCK66 ghost-occupied: YMS OCCUPIED, no entry ticket, no active tasks.
// — ⚠ TASK-5090739 (daira gonzalez, DOCK50) critically stale at ~228 days (since Oct 2025).
// — ⚠ TASK-5252949 RETURNED — was resolved in prior pulls, now active again on DOCK65.
// — ARNULFO MUNGUIA: 4 Bay 4 tasks (3 outbound, 1 inbound) — 3 LOAD GURUNANDA + 1 RECEIVE KARAKA.
//   OUT: TASK-5285558 (DOCK53, ~1d 23h), TASK-5285913 (DOCK53, ~1d 16h), TASK-5285860 (DOCK54, NEW, 4 DNs).
//   IN: TASK-5285778 (DOCK51, KARAKA RN-182888, NEW).
// — "Guru live out / in assign to Arnulfo":
//   LIVE OUT: 3 GURUNANDA outbound — TASK-5285558 (DOCK53, ~1d 23h, IN_PROGRESS), TASK-5285913 (DOCK53, ~1d 16h, IN_PROGRESS), TASK-5285860 (DOCK54, NEW, 4 DNs).
//   LIVE IN: None — no GURUNANDA receive tasks for Arnulfo on Bay 4. 1 KARAKA receive (TASK-5285778, DOCK51, NEW).
// — Lorenzo Rodriguez: 1 task — DOCK54 (LOAD ~2d 18h). Aging concern — needs closing attention.
// — Caren Cubides: 2 tasks — DOCK62 (RN-5006269, ~97d) + DOCK65 (RN-183707, ~40d, RETURNED).
// — daira gonzalez: 1 task — DOCK50 (RN-5002143, critically stale ~228d since Oct 2025).
// — Rufino Munguia: 1 task — DOCK65 (RN-5007343, ~40d).
// — Customer mix: GURUNANDA (ORG-655875) on 8 of 9 active tasks, KARAKA LLC (ORG-585450) on 1.
// — AGING: TASK-5285010 (~2d 18h, Lorenzo), TASK-5090739 (~228d, daira), TASK-5254195 (~40d), TASK-5207670 (~97d), TASK-5252949 (~40d).
// — DOCK51 and DOCK54 tasks are NEW (not started). 3 tasks IN_PROGRESS, 6 NEW.
// — Key changes since ~5:00 AM PDT June 7 pull:
//   - MAJOR: 0 Available (was 12). All 15 ASSIGNED doors now Reserved.
//   - TASK-5252949 RETURNED on DOCK65 (Caren Cubides) — was resolved, now active again.
//   - Caren now 2 tasks (was 1). DOCK65 double-booked (was Rufino only).
//   - Mix shifted 50/50 → 44/56 (4/4→4/5).
//   - DOCK53/DOCK54/DOCK65 all double-booked.
//   - Durations aged: TASK-5285558 ~1d 12h→~1d 23h, TASK-5285913 ~1d 6h→~1d 16h, TASK-5285010 ~2d 8h→~2d 18h.
//   - TASK-5285860 still NEW (not started) — was ~1d 8h before.
//   - Schedule %: NOW AVAILABLE — 66.5% inbounds received (10,192/15,318), 95.8% outbounds loaded (702,396/732,922).
// — YMS: 0 AVAILABLE doors — 4 OCCUPIED (DOCK52/53/54/66), 19 ASSIGNED (all others, many with GATE_CHECK_OUT).
// — Facility-wide open: 47 inbound + 50 outbound = 97 total active tasks.
// — All data sourced from live WISE/WMS/YMS queries at ~4:00 PM PDT, June 7, 2026.
