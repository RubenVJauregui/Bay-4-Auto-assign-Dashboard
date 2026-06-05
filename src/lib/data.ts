/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Pulled: June 5, 2026 ~05:00 PDT
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
  { door: "DOCK50", status: "Occupied", assignee: "daira gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5090739"], duration: "~5,448h" },
  { door: "DOCK52", status: "Occupied", assignee: "Arnulfo Munguia", customer: "GURUNANDA", taskIds: ["TASK-5281747"], duration: "~60h" },
  { door: "DOCK53", status: "Occupied", assignee: "Lorenzo Rodriguez", customer: "GURUNANDA", taskIds: ["TASK-5284794"], duration: "~10h" },
  { door: "DOCK54", status: "Occupied", assignee: "Lorenzo Rodriguez", customer: "GURUNANDA", taskIds: ["TASK-5285010"], duration: "~8h" },
  { door: "DOCK61", status: "Occupied", assignee: null, customer: "GURUNANDA", taskIds: [], duration: "stale" },
  { door: "DOCK62", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5285184", "TASK-5207670"], duration: "~5.6h" },
  { door: "DOCK63", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5278242", "TASK-5277747"], duration: "~196h" },
  { door: "DOCK65", status: "Occupied", assignee: "Daniela Gonzalez", customer: "GURUNANDA", taskIds: ["TASK-5283625", "TASK-5254195", "TASK-5252949"], duration: "~25.7h" },

  // ── RESERVED (7) ──
  { door: "DOCK55", status: "Reserved", assignee: "Jerome Aranda", customer: "KARAKA", taskIds: ["TASK-5284151"], duration: "~21h" },
  { door: "DOCK60", status: "Reserved", assignee: null, customer: "GURUNANDA", taskIds: [], duration: null },
  { door: "DOCK64", status: "Reserved", assignee: null, customer: "GURUNANDA", taskIds: [], duration: null },
  { door: "DOCK68", status: "Reserved", assignee: null, customer: "GURUNANDA", taskIds: [], duration: null },
  { door: "DOCK69", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK70", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK71", status: "Reserved", assignee: null, customer: null, taskIds: [], duration: null },

  // ── AVAILABLE (8) ──
  { door: "DOCK51", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK56", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK57", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK58", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK59", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK66", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
  { door: "DOCK67", status: "Available", assignee: null, customer: null, taskIds: [], duration: null },
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
  { name: "Daniela Gonzalez", taskCount: 4 },
  { name: "Caren Cubides", taskCount: 2 },
  { name: "Lorenzo Rodriguez", taskCount: 2 },
  { name: "Arnulfo Munguia", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
  { name: "Jerome Aranda", taskCount: 1 },
  { name: "Rufino Munguia", taskCount: 1 },
];

export const inboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 3, total: 12 },
  { label: "Inbound", count: 9, total: 12 },
];

// Schedule summary from WISE — all-time facility-wide
export const scheduleAvailable = true;
export const scheduledInboundOrders = 11612;
export const scheduledOutboundOrders = 706113;
export const scheduledInboundReceived = 10140;
export const scheduledOutboundLoaded = 700386;
export const pctScheduledInboundReceived = 87.3;
export const pctScheduledOutboundLoaded = 99.2;

// Facility-wide open counts from WISE (LT_F1, pulled ~05:00 PDT June 5)
export const facilityInboundOpen = 61;
export const facilityOutboundOpen = 47;

export const assignments: TaskRecord[] = [
  // ────── OUTBOUND ──────
  // TASK-5281747 — DOCK52 — Arnulfo Munguia — PRE_LOAD ~60h
  // LOAD-5029674 / DN-3190424 / 28 pal / 94,060 pcs / LOADED
  {
    taskId: "TASK-5281747",
    dns: "DN-3190424",
    customer: "GURUNANDA",
    pieces: "94,060",
    assignee: "Arnulfo Munguia",
  },
  // TASK-5285010 — DOCK54 — Lorenzo Rodriguez — LOAD ~8h
  // 2 DNs: DN-3195089 (19 pal, 4,145 pcs) + DN-3195088 (24 pal, 1,000 pcs)
  {
    taskId: "TASK-5285010",
    dns: "DN-3195089, DN-3195088",
    customer: "GURUNANDA",
    pieces: "5,145",
    assignee: "Lorenzo Rodriguez",
  },
  // TASK-5284794 — DOCK53 — Lorenzo Rodriguez — LOAD ~10h
  // 8 DNs: DN-3198074 (9 pal, 177,270 pcs) + DN-3195098 + DN-3195086 + DN-3198789 + DN-3190634 + DN-3197870 + DN-3197866 + DN-3194936
  {
    taskId: "TASK-5284794",
    dns: "DN-3198074 + 7 more",
    customer: "GURUNANDA",
    pieces: "187,035",
    assignee: "Lorenzo Rodriguez",
  },

  // ────── INBOUND ──────
  // TASK-5285184 — DOCK62 — Daniela Gonzalez — RECEIVE ~5.6h
  {
    taskId: "TASK-5285184",
    dns: "RN-5007923",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5284151 — DOCK55 — Jerome Aranda — RECEIVE NEW ~21h
  {
    taskId: "TASK-5284151",
    dns: "RN-186139",
    customer: "KARAKA",
    pieces: "—",
    assignee: "Jerome Aranda",
  },
  // TASK-5283625 — DOCK65 — Daniela Gonzalez — RECEIVE ~25.7h
  {
    taskId: "TASK-5283625",
    dns: "RN-186014",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5278242 — DOCK63 — Daniela Gonzalez — RECEIVE ~174h
  {
    taskId: "TASK-5278242",
    dns: "RN-5007786",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5277747 — DOCK63 — Daniela Gonzalez — RECEIVE ~196h
  {
    taskId: "TASK-5277747",
    dns: "RN-5007760",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Daniela Gonzalez",
  },
  // TASK-5254195 — DOCK65 — Rufino Munguia — RECEIVE NEW ~907h
  {
    taskId: "TASK-5254195",
    dns: "RN-5007343",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Rufino Munguia",
  },
  // TASK-5252949 — DOCK65 — Caren Cubides — RECEIVE NEW ~933h
  {
    taskId: "TASK-5252949",
    dns: "RN-183707",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Caren Cubides",
  },
  // TASK-5207670 — DOCK62 — Caren Cubides — RECEIVE NEW ~2,274h
  {
    taskId: "TASK-5207670",
    dns: "RN-5006269",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "Caren Cubides",
  },
  // TASK-5090739 — DOCK50 — daira gonzalez — RECEIVE ~5,448h (227 days)
  {
    taskId: "TASK-5090739",
    dns: "RN-5002143",
    customer: "GURUNANDA",
    pieces: "—",
    assignee: "daira gonzalez",
  },
];

// Notes:
// — 8 Occupied / 7 Reserved / 8 Available — 65.2% occupancy (occupied+reserved).
// — Occupied (8): DOCK50 (daira gonzalez ~5,448h ⚠ 227d), DOCK52 (Arnulfo Munguia ~60h PRE_LOAD),
//   DOCK53 (Lorenzo Rodriguez ~10h LOAD), DOCK54 (Lorenzo Rodriguez ~8h LOAD),
//   DOCK61 (stale OCCUPIED, no active task), DOCK62 (Daniela Gonzalez ~5.6h RECEIVE + Caren Cubides ~2,274h),
//   DOCK63 (Daniela Gonzalez ~196h RECEIVE), DOCK65 (Daniela Gonzalez ~25.7h + 2 aged NEW).
// — Reserved (7): DOCK55 (Jerome Aranda KARAKA NEW), DOCK60/DOCK64/DOCK68 (GURUNANDA), DOCK69/DOCK70/DOCK71.
// — Active tasks: 3 outbound / 9 inbound = 25%/75% mix.
// — All 3 outbound tasks stuck IN_PROGRESS despite 100% LOADED.
// — Assignees: Daniela Gonzalez 4, Caren Cubides 2, Lorenzo Rodriguez 2, Arnulfo Munguia 1,
//   daira gonzalez 1, Jerome Aranda 1, Rufino Munguia 1.
// — Customer mix: 11/12 tasks GURUNANDA (ORG-655875), 1/12 KARAKA (ORG-585450) on DOCK55.
// — CRITICAL AGING: TASK-5090739 (DOCK50, 227d), TASK-5207670 (DOCK62, 95d),
//   TASK-5252949 (DOCK65, 39d), TASK-5254195 (DOCK65, 38d).
// — "Guru live out / in assign to Arnulfo": TASK-5281747 on DOCK52 — PRE_LOAD ~60h,
//   DN-3190424, 28 pal, 94,060 pcs, all LOADED, carrier signed 6/4 16:14.
//   No live receive on Bay 4 for Arnulfo. His inbound tasks are on DOCK37 (TASK-5285037, KARAKA)
//   and DOCK18 (TASK-5280508, KARAKA).
// — DOCK50 newly showing Bay 4 activity (TASK-5090739); previously filtered out or on different dock.
// — DOCK61 OCCUPIED but stale — no active tasks, entry ticket ET-1103945 not in active list.
// — DOCK55 has KARAKA TASK-5284151 (NEW) but door API shows AVAILABLE — task queued, not started.
// — All 3 load tasks have DNs and piece counts confirmed.
// — Facility-wide: 61 inbound open (25 NEW + 36 IN_PROGRESS), 47 outbound open (11 NEW + 36 IN_PROGRESS).
// — Schedule: 10,140 / 11,612 inbounds received (87.3%), 700,386 / 706,113 outbounds loaded (99.2%) — all-time.
// — All data sourced from live WISE/WMS queries at ~05:00 PDT, June 5, 2026.
