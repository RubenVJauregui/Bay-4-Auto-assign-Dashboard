/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 *
 * TASK DATA: Refreshed 2026-09-05 ~3:57p PT (live WMS APIs)
 *   Sources:
 *     - /wms-bam/wms-location/search — exactlyNames for all 23 doors
 *       (fresh dockStatus, spaceStatus, occupiedCustomerIds per door)
 *     - /wms-bam/outbound/load-task/search-by-paging — NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA load tasks (facility-wide 13; 6 at Bay 4 doors)
 *     - /wms-bam/inbound/receive-task/search-by-paging — NEW/IN_PROGRESS/EXCEPTION
 *       GURUNANDA receive tasks (facility-wide 11; 2 at Bay 4 doors)
 *     - /wms-bam/yard/equipment/search — FULL TRAILERS for GURUNANDA only
 *       (full-scope live result: 39 FULL trailers for ORG-655875)
 *     - /wms-bam/outbound/order/search-by-paging — GURUNANDA orders,
 *       scheduleDate = 2026-09-05 (0 scheduled — Saturday, no outbound dock schedule)
 *     - /wms-bam/inbound/receipt/search-by-paging — GURUNANDA receipts,
 *       appointmentTime = 2026-09-05 (1 scheduled: RN-5010097 IMPORTED 02:00a PT)
 *
 *   Key changes from prior refresh (9/5 ~2:23p PT → 9/5 ~3:57p PT):
 *     - Bay 4 GURUNANDA active tasks UNCHANGED: 8 (6 LOAD + 2 RECEIVE) on 5 doors
 *       (DOCK50, DOCK51, DOCK53, DOCK54, DOCK67). Same assignees, same statuses;
 *       elapsed durations grew ~1.6h. Arnulfo still holds 5 live-out LOAD tasks;
 *       no task closed or was assigned since 2:23p. Stale tasks TASK-5338695
 *       (DOCK54, load SHIPPED 8/10) and TASK-5090739 (DOCK50, receipt closed
 *       10/22/25) are STILL OPEN — flagged as anomalies.
 *     - Bay 4 doors occupied: 23/23 — UNCHANGED. dockStatus/spaceStatus per door
 *       and door entry tickets are unchanged since the 2:23p pull (location rows
 *       last updated 9/4 16:xx – 9/5 00:14 PT; no Bay-4 dock/space movement
 *       since midnight).
 *     - In-yard FULL GURUNANDA trailers (full-scope live pull): 39 — UNCHANGED
 *       composition vs 2:23p (same 13 staged 9/4 + same 26 longer-staged units,
 *       gate check-ins 8/7–9/3). 0 GURUNANDA gate check-ins since 9/4 14:56 PT
 *       and 0 new FULL trailers since the 2:23p pull; in-yard durations advanced
 *       ~1.6h. Several units still carry FORCE_CLOSED shuttle/internal-move
 *       exceptions (53166@DOCK67, 53782@DOCK68, 53734@DOCK52, 53211@DOCK70
 *       UNKNOWN op, 53280, 53401CT 29d, etc.); 53176/53737/53694 remain
 *       FULL_TO_OFFLOAD (inbound-loaded staging, shuttle NEW/FORCE_CLOSED).
 *       Recommend physical yard verification for units in yard > 2 days.
 *     - "Guru live out": 5 GURUNANDA LOAD tasks on ARNULFO MUNGUIA (DOCK50
 *       TASK-5360206 since 9/3 3:58p PT — trlr 53397, 2 loads LOADED; DOCK51
 *       TASK-5359541 since 9/3 10:28a PT — trlr 53731, load LOADED; DOCK53
 *       TASK-5361270 since 9/4 4:18p PT — trlr 53400CT, 5 loads: 1 LOADED +
 *       4 LOADING; DOCK54 TASK-5360934 since 9/4 1:17p PT — trlr 53602,
 *       8 loads LOADED; DOCK54 TASK-5338695 STALE — load SHIPPED 8/10).
 *     - "Guru live in": NO active RECEIVE task for Arnulfo at Bay 4. Bay-4
 *       receives are RUFINO MUNGUIA (DOCK53 NEW — RN-191921 ctn 53722 IMPORTED,
 *       queued, container not at dock) and daira gonzalez (DOCK50 STALE ~10.6mo —
 *       RN-5002143 closed 10/22/25, task never closed).
 *     - Planned GURUNANDA orders: all-time PLANNED 152 (unchanged); scheduleDate
 *       9/5 PLANNED 0.
 *     - % scheduled outbounds loaded (9/5): none scheduled (scheduleDate 9/5 = 0 orders).
 *     - % scheduled inbounds received (9/5): 0 CLOSED of 1 scheduled (RN-5010097
 *       still IMPORTED) = 0.0%.
 *
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
  anomaly: boolean;
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
  door: string;
}

export interface InYardEquipmentRecord {
  equipmentNo: string;
  entryTicket: string;
  checkInPdt: string;
  timeInYard: string;
  customer: string;
  equipmentType: "TRAILER";
}

export const TOTAL_DOORS = 23;

// ─── Section 1 — In-Yard FULL Equipment (TRAILER-only display) ───
// Fresh from /wms-bam/yard/equipment/search (Sep 5 2026 ~3:57p PT).
// Filtered to equipmentType=TRAILER, equipmentStatus=FULL, customer ORG-655875.
// RESULT: 39 FULL GURUNANDA trailers (full-scope live result, newest gate check-in
// first) — UNCHANGED composition vs the 2:23p pull: same 13 staged on 9/4 (loaded
// outbound close-outs) plus the same 26 longer-staged FULL trailers (gate check-ins
// 8/7–9/3; loads closed SHIPPED 8/27–9/3). Several carry FORCE_CLOSED shuttle/
// internal-move exceptions (53166@DOCK67, 53782@DOCK68, 53734@DOCK52,
// 53211@DOCK70 UNKNOWN op, 53280, 53401CT 29d, etc.) and should be verified
// physically. 53176/53737/53694 are FULL_TO_OFFLOAD (inbound-loaded staging),
// 53211 has UNKNOWN operation status. Containers/VEHICLEs/CHASSIS excluded
// (TRAILER-only display). 0 GURUNANDA gate check-ins on 9/5 — zero new FULL
// trailers since the 2:23p pull.
export const inYardFullEquipment: InYardEquipmentRecord[] = [
  {
    equipmentNo: "488598",
    entryTicket: "ET-1149209",
    checkInPdt: "09/04/2026, 02:56 PM",
    timeInYard: "1 Days 1 Hours 0 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "715569",
    entryTicket: "ET-1149152",
    checkInPdt: "09/04/2026, 02:01 PM",
    timeInYard: "1 Days 1 Hours 55 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "155477",
    entryTicket: "ET-1149128",
    checkInPdt: "09/04/2026, 01:32 PM",
    timeInYard: "1 Days 2 Hours 24 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "LE0986",
    entryTicket: "ET-1149072",
    checkInPdt: "09/04/2026, 12:35 PM",
    timeInYard: "1 Days 3 Hours 21 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "2504",
    entryTicket: "ET-1149057",
    checkInPdt: "09/04/2026, 12:23 PM",
    timeInYard: "1 Days 3 Hours 33 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "5380",
    entryTicket: "ET-1149041",
    checkInPdt: "09/04/2026, 12:03 PM",
    timeInYard: "1 Days 3 Hours 53 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "U5376",
    entryTicket: "ET-1149040",
    checkInPdt: "09/04/2026, 12:02 PM",
    timeInYard: "1 Days 3 Hours 54 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "5381",
    entryTicket: "ET-1148982",
    checkInPdt: "09/04/2026, 11:07 AM",
    timeInYard: "1 Days 4 Hours 49 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "W84599",
    entryTicket: "ET-1148952",
    checkInPdt: "09/04/2026, 10:33 AM",
    timeInYard: "1 Days 5 Hours 23 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "175068",
    entryTicket: "ET-1148904",
    checkInPdt: "09/04/2026, 09:57 AM",
    timeInYard: "1 Days 5 Hours 59 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "166167",
    entryTicket: "ET-1148898",
    checkInPdt: "09/04/2026, 09:48 AM",
    timeInYard: "1 Days 6 Hours 8 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "6523",
    entryTicket: "ET-1148862",
    checkInPdt: "09/04/2026, 09:21 AM",
    timeInYard: "1 Days 6 Hours 35 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "516579",
    entryTicket: "ET-1148852",
    checkInPdt: "09/04/2026, 09:10 AM",
    timeInYard: "1 Days 6 Hours 46 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "480060",
    entryTicket: "ET-1148472",
    checkInPdt: "09/03/2026, 03:43 PM",
    timeInYard: "2 Days 0 Hours 13 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "X6652",
    entryTicket: "ET-1148418",
    checkInPdt: "09/03/2026, 02:18 PM",
    timeInYard: "2 Days 1 Hours 38 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "1957",
    entryTicket: "ET-1148385",
    checkInPdt: "09/03/2026, 01:22 PM",
    timeInYard: "2 Days 2 Hours 34 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "292",
    entryTicket: "ET-1148362",
    checkInPdt: "09/03/2026, 12:48 PM",
    timeInYard: "2 Days 3 Hours 8 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "HV2700123",
    entryTicket: "ET-1148282",
    checkInPdt: "09/03/2026, 11:24 AM",
    timeInYard: "2 Days 4 Hours 32 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "200391",
    entryTicket: "ET-1148265",
    checkInPdt: "09/03/2026, 10:51 AM",
    timeInYard: "2 Days 5 Hours 6 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "172440",
    entryTicket: "ET-1148238",
    checkInPdt: "09/03/2026, 10:25 AM",
    timeInYard: "2 Days 5 Hours 31 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "53176",
    entryTicket: "ET-1147997",
    checkInPdt: "09/03/2026, 12:22 AM",
    timeInYard: "2 Days 15 Hours 34 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  }, // FULL_TO_OFFLOAD (inbound-loaded staging); shuttle FORCE_CLOSED — was to DOCK59
  {
    equipmentNo: "53782",
    entryTicket: "ET-1147936",
    checkInPdt: "09/02/2026, 09:05 PM",
    timeInYard: "2 Days 18 Hours 52 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  }, // parked at DOCK68 per equipment record (shuttle FORCE_CLOSED / Internal Movement)
  {
    equipmentNo: "53737",
    entryTicket: "ET-1147909",
    checkInPdt: "09/02/2026, 07:52 PM",
    timeInYard: "2 Days 20 Hours 4 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  }, // FULL_TO_OFFLOAD (inbound-loaded staging); shuttle NEW — was to DOCK70
  {
    equipmentNo: "53477",
    entryTicket: "ET-1147815",
    checkInPdt: "09/02/2026, 03:46 PM",
    timeInYard: "3 Days 0 Hours 10 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "LE2209",
    entryTicket: "ET-1147805",
    checkInPdt: "09/02/2026, 03:34 PM",
    timeInYard: "3 Days 0 Hours 22 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "HGIU646662",
    entryTicket: "ET-1147714",
    checkInPdt: "09/02/2026, 01:47 PM",
    timeInYard: "3 Days 2 Hours 9 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "V571096",
    entryTicket: "ET-1147700",
    checkInPdt: "09/02/2026, 01:14 PM",
    timeInYard: "3 Days 2 Hours 42 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "XPOU422077",
    entryTicket: "ET-1147673",
    checkInPdt: "09/02/2026, 12:47 PM",
    timeInYard: "3 Days 3 Hours 9 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "233235",
    entryTicket: "ET-1147445",
    checkInPdt: "09/02/2026, 09:04 AM",
    timeInYard: "3 Days 6 Hours 52 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "PTLZ262272",
    entryTicket: "ET-1147424",
    checkInPdt: "09/02/2026, 08:40 AM",
    timeInYard: "3 Days 7 Hours 16 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "U43361",
    entryTicket: "ET-1147387",
    checkInPdt: "09/02/2026, 08:11 AM",
    timeInYard: "3 Days 7 Hours 45 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "53694",
    entryTicket: "ET-1147273",
    checkInPdt: "09/02/2026, 01:35 AM",
    timeInYard: "3 Days 14 Hours 21 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  }, // FULL_TO_OFFLOAD (inbound-loaded staging); shuttle FORCE_CLOSED — was to DOCK58
  {
    equipmentNo: "53232",
    entryTicket: "ET-1147268",
    checkInPdt: "09/02/2026, 01:32 AM",
    timeInYard: "3 Days 14 Hours 25 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  },
  {
    equipmentNo: "53166",
    entryTicket: "ET-1147168",
    checkInPdt: "09/01/2026, 09:03 PM",
    timeInYard: "3 Days 18 Hours 53 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  }, // parked at DOCK67 per equipment record (shuttle FORCE_CLOSED / Internal Movement)
  {
    equipmentNo: "53734",
    entryTicket: "ET-1144811",
    checkInPdt: "08/27/2026, 08:59 PM",
    timeInYard: "8 Days 18 Hours 57 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  }, // parked at DOCK52 per equipment record (shuttle FORCE_CLOSED / Internal Movement)
  {
    equipmentNo: "5301",
    entryTicket: "ET-1144539",
    checkInPdt: "08/27/2026, 12:53 PM",
    timeInYard: "9 Days 3 Hours 3 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  }, // parked at DOCK2 per equipment record
  {
    equipmentNo: "53211",
    entryTicket: "ET-1143488",
    checkInPdt: "08/26/2026, 12:50 AM",
    timeInYard: "10 Days 15 Hours 6 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  }, // op status UNKNOWN; parked at DOCK70 per equipment record
  {
    equipmentNo: "53280",
    entryTicket: "ET-1141880",
    checkInPdt: "08/21/2026, 04:51 PM",
    timeInYard: "14 Days 23 Hours 6 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  }, // shuttle FORCE_CLOSED (Internal Movement)
  {
    equipmentNo: "53401CT",
    entryTicket: "ET-1135113",
    checkInPdt: "08/07/2026, 08:08 PM",
    timeInYard: "28 Days 19 Hours 48 Minutes",
    customer: "GURUNANDA, LLC",
    equipmentType: "TRAILER",
  }, // oldest FULL unit; verify physically (shuttle FORCE_CLOSED; last loads SHIPPED 9/2)
];

// Planned Orders context: WMS outbound orders for GURUNANDA (ORG-655875).
// All-time PLANNED: 152 (live totalCount at 9/5 ~3:57p PT — unchanged from 2:23p).
// Today's (2026-09-05) scheduleDate PLANNED: 0 (Saturday — no outbound orders
// scheduled on 9/5). plannedGurunandaOrderCount = all-time PLANNED totalCount
// (fallback mirroring the live loader's status=PLANNED query semantics).
export const plannedGurunandaOrderCount = 152;

// ─── Graza Dispatch Types (preserved for GrazaDispatchSummary component) ───
export interface GrazaDispatchRun {
  runLabel: string;
  time: string;
  runInfo: {
    date: string;
    facility: string;
    customer: string;
    assignee: string;
    totalOrdersFound: number;
  };
  plans: {
    planId: string;
    taskId: string;
    status: string;
    method: string;
    skipPackingScan: boolean;
    orderCount: number;
  }[];
  labelNoteOrders: {
    dn: string;
    planId: string;
    status: string;
    note: string;
  }[];
  exceptions: {
    dn: string;
    reason: string;
    action: string;
  }[];
  summary: {
    totalPlans: number;
    totalTasks: number;
    exceptions: number;
    issues: string[];
  };
}

export interface GrazaCombinedDispatchData {
  combinedSummary: {
    totalOrdersCovered: number;
    coveragePct: number;
    totalPlans: number;
    wavePlans: number;
    batchPlans: number;
    labelNotePlans: number;
    released: number;
    inProgress: number;
    failures: number;
    stuckPlans: number;
    unassignedTasks: number;
    exceptions: number;
  };
  runs: GrazaDispatchRun[];
}





export const doors: DoorRecord[] = [
  // ═══════════════════════════════════════════════════════════════
  // OCCUPIED — doors with active GURUNANDA Bay-4 tasks (5 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK50",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA / daira gonzalez",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5360206", "TASK-5090739"],
    duration: "LOAD ~48.0h since 9/3 3:58p PT (trlr 53397, 2 loads LOADED) · RECEIVE STALE ~10.6mo",
    anomaly: true, // TASK-5090739 (RECEIVE) started Oct 21 2025 — RN-5002143 closed 10/22/25, task never closed
  },
  {
    door: "DOCK51",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5359541"],
    duration: "~53.5h since 9/3 10:28a PT (trlr 53731, load LOADED, task open)",
    anomaly: false,
  },
  {
    door: "DOCK53",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA (LOAD) / RUFINO MUNGUIA (RECEIVE queued)",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5361270", "TASK-5360939"],
    duration: "LOAD ~23.6h since 9/4 4:18p PT (trlr 53400CT, 5 loads: 1 LOADED + 4 LOADING) · RECEIVE RN-191921 ctn 53722 queued, not at dock",
    anomaly: false,
  },
  {
    door: "DOCK54",
    status: "Occupied",
    assignee: "ARNULFO MUNGUIA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5360934", "TASK-5338695"],
    duration: "LOAD ~26.7h since 9/4 1:17p PT (trlr 53602, 8 loads LOADED) · TASK-5338695 STALE ~29d open (load SHIPPED 8/10)",
    anomaly: true, // TASK-5338695 load ended Aug 10 (SHIPPED) but task status never closed
  },
  {
    door: "DOCK67",
    status: "Occupied",
    assignee: "JEROME ARANDA",
    customer: "GURUNANDA, LLC",
    taskIds: ["TASK-5359531"],
    duration: "LOAD NEW (appt 9/8 9:00a) · truck not on dock; dock occupied by staged equipment (FULL trlr 53166 per yard)",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // OCCUPIED — dock free + space occupied, no active task (8 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK56",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, space occupied",
    anomaly: false,
  },
  {
    door: "DOCK57",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, FULL trailer 715569 staged at space (ET-1149152)",
    anomaly: false,
  },
  {
    door: "DOCK58",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, space occupied",
    anomaly: false,
  },
  {
    door: "DOCK60",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, space occupied (GURUNANDA staging)",
    anomaly: false,
  },
  {
    door: "DOCK62",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, space occupied",
    anomaly: false,
  },
  {
    door: "DOCK63",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, space occupied",
    anomaly: false,
  },
  {
    door: "DOCK64",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, space occupied",
    anomaly: false,
  },
  {
    door: "DOCK72",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock free, space occupied (space staging)",
    anomaly: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // OCCUPIED — dock occupied (space empty or occupied), no active task (10 doors)
  // ═══════════════════════════════════════════════════════════════
  {
    door: "DOCK52",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied (entry ET-1149038; FULL trlr 53734 staged per yard)",
    anomaly: false,
  },
  {
    door: "DOCK55",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied",
    anomaly: false,
  },
  {
    door: "DOCK59",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied",
    anomaly: false,
  },
  {
    door: "DOCK61",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty",
    anomaly: false,
  },
  {
    door: "DOCK65",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty",
    anomaly: false,
  },
  {
    door: "DOCK66",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty",
    anomaly: false,
  },
  {
    door: "DOCK68",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (FULL trlr 53782 staged at dock per yard)",
    anomaly: false,
  },
  {
    door: "DOCK69",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock and space occupied",
    anomaly: false,
  },
  {
    door: "DOCK70",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty (staged equipment per yard — FULL trlr 53211 UNKNOWN op)",
    anomaly: false,
  },
  {
    door: "DOCK71",
    status: "Occupied",
    assignee: null,
    customer: null,
    taskIds: [],
    duration: "No active task · dock occupied, space empty",
    anomaly: false,
  },
];

const occupied = doors.filter((d) => d.status === "Occupied").length;
const doorsWithTasks = doors.filter((d) => d.taskIds.length > 0).length;
const anomalyDoors = doors.filter((d) => d.anomaly).length;
const available = doors.filter((d) => d.status === "Available").length;

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Doors Occupied",
    value: `${occupied}/23`,
    numerator: occupied,
    denominator: TOTAL_DOORS,
    percentage: Math.round((occupied / TOTAL_DOORS) * 100),
  },
  {
    label: "Doors w/ Active Tasks",
    value: `${doorsWithTasks}`,
    numerator: doorsWithTasks,
    denominator: TOTAL_DOORS,
    percentage: Math.round((doorsWithTasks / TOTAL_DOORS) * 100),
  },
  {
    label: "Doors Available",
    value: `${available}`,
    numerator: available,
    denominator: TOTAL_DOORS,
    percentage: Math.round((available / TOTAL_DOORS) * 100),
  },
  {
    label: "Anomalies",
    value: `${anomalyDoors}`,
    numerator: anomalyDoors,
    denominator: TOTAL_DOORS,
    percentage: Math.round((anomalyDoors / TOTAL_DOORS) * 100),
  },
];

// Bay 4 active task counts by assignee
// Source: /wms-bam/outbound/load-task/search-by-paging + /wms-bam/inbound/receive-task/search-by-paging
// (Sep 5 2026 ~3:57p PT). 8 active-status tasks at Bay 4 doors: 6 LOAD + 2 RECEIVE.
// ARNULFO MUNGUIA: 5 LOAD (DOCK50, DOCK51, DOCK53, DOCK54 x2 — incl. stale TASK-5338695)
// JEROME ARANDA: 1 LOAD (DOCK67 NEW, appt 9/8 — truck not on dock)
// RUFINO MUNGUIA: 1 RECEIVE (DOCK53 NEW, queued — RN-191921 ctn 53722)
// daira gonzalez: 1 RECEIVE (DOCK50, STALE ~10.5mo)
// All assignee names resolved from WMS task payloads (assigneeUserName); no Assignee-<id> labels remain.
export const assigneeSummaries: AssigneeSummary[] = [
  { name: "ARNULFO MUNGUIA", taskCount: 5 },
  { name: "JEROME ARANDA", taskCount: 1 },
  { name: "RUFINO MUNGUIA", taskCount: 1 },
  { name: "daira gonzalez", taskCount: 1 },
];

// All-time assignment counts — preserved from prior baseline (Jul 13 2026)
export const allTimeAssigneeSummaries: AssigneeSummary[] = [
  { name: "Arnulfo Munguia (89)", taskCount: 110 },
  { name: "Daniel Beltran", taskCount: 90 },
  { name: "Caren Cubides", taskCount: 3 },
  { name: "Daniela Gonzalez", taskCount: 1 },
  { name: "Fatima Ponce", taskCount: 1 },
  { name: "Nanci Viviana Rosas", taskCount: 1 },
  { name: "Rufino Munguia", taskCount: 1 },
];

// Mix: 6 LOAD + 2 RECEIVE = 8 active Bay-4 GURUNANDA tasks
export const inboundOutboundMix: MixMetric[] = [
  { label: "Inbound (RECEIVE)", count: 2, total: 8 },
  { label: "Outbound (LOAD)", count: 6, total: 8 },
];

// Active inbound/outbound mix at Bay 4 doors
export const activeInboundOutboundMix: MixMetric[] = [
  { label: "Outbound", count: 6, total: 8 },
  { label: "Inbound", count: 2, total: 8 },
];

// ─── Schedule Data (2026-09-05, Saturday) ───
// % scheduled inbounds received TODAY: 0 CLOSED of 1 scheduled (appointmentTime = 9/5) = 0.0%
//   (1 scheduled: RN-5010097 IMPORTED appt 02:00a PT, ctn EMCU8832724 — not yet received)
// % scheduled outbounds loaded TODAY: 0 SHIPPED of 0 scheduled (scheduleDate = 9/5) = no
//   outbound orders scheduled for Saturday 9/5
// All-time PLANNED (GURUNANDA): 152
export const scheduleAvailable = true;
export const scheduledInboundOrders = 1;      // receipts with appointmentTime = 2026-09-05
export const scheduledOutboundOrders = 0;     // orders with scheduleDate = 2026-09-05
export const scheduledInboundReceived = 0;    // CLOSED/FORCE_CLOSED among scheduled set
export const scheduledOutboundLoaded = 0;     // SHIPPED among scheduled set
export const pctScheduledInboundReceived = 0; // 0 / 1 = 0.0%
export const pctScheduledOutboundLoaded = 0;  // 0 scheduled / 0 loaded — none scheduled 9/5

// Facility-wide appointment context — unavailable
export const facilityWideReceiptsCreated = 0;
export const facilityWideReceiptsReceived = 0;
export const facilityWideLoadsCreated = 0;
export const facilityWideLoadsShipped = 0;

// Door occupancy duration: available from task startTime and space updatedTime
export const doorDurationsAvailable = true;

// All Bay 4 active task records (DOCK50-DOCK72, Sep 5 2026 ~3:57p PT)
// 8 tasks total: 6 LOAD + 2 RECEIVE
// All GURUNANDA, LLC. Two are stale-anomaly tasks (TASK-5338695, TASK-5090739).
export const assignments: TaskRecord[] = [
  // ────── OUTBOUND / LOAD (6) ──────
  {
    taskId: "TASK-5360206",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~48.0h since 9/3 3:58p PT (trlr 53397, 2 loads LOADED)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK50",
  },
  {
    taskId: "TASK-5359541",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~53.5h since 9/3 10:28a PT (trlr 53731, load LOADED, task open)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK51",
  },
  {
    taskId: "TASK-5361270",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~23.6h since 9/4 4:18p PT (trlr 53400CT, 5 loads: 1 LOADED + 4 LOADING)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5360934",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~26.7h since 9/4 1:17p PT (trlr 53602, 8 loads LOADED)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5338695",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · STALE ~29d open (load SHIPPED 8/10)",
    assignee: "ARNULFO MUNGUIA",
    door: "DOCK54",
  },
  {
    taskId: "TASK-5359531",
    dns: "LOAD",
    customer: "GURUNANDA, LLC",
    pieces: "NEW · appt 9/8 9:00a · truck not on dock",
    assignee: "JEROME ARANDA",
    door: "DOCK67",
  },

  // ────── INBOUND / RECEIVE (2) ──────
  {
    taskId: "TASK-5360939",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "NEW since 9/4 12:34p PT · RN-191921, ctn 53722 (queued, container not at dock)",
    assignee: "RUFINO MUNGUIA",
    door: "DOCK53",
  },
  {
    taskId: "TASK-5090739",
    dns: "RECEIVE",
    customer: "GURUNANDA, LLC",
    pieces: "IN_PROGRESS · ~10.6mo · STALE",
    assignee: "daira gonzalez",
    door: "DOCK50",
  },
];