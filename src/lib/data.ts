/**
 * Bay 4 Assignments — Authoritative Operational Data
 * Valley View Warehouse (LT_F1), DOCK50–DOCK72
 * Date: June 1, 2026
 *
 * All values sourced from the authoritative brief.
 * Do NOT fabricate, estimate, or guess any metric.
 */

export type DoorStatus = "Occupied" | "Assigned" | "Available";

export interface DoorRecord {
  door: string;
  status: DoorStatus;
  entryTicket: string | null;
}

export interface KpiMetric {
  label: string;
  value: string;
  numerator: number;
  denominator: number;
  percentage: number;
}

export interface UnavailableMetric {
  label: string;
  reason: string;
}

export const TOTAL_DOORS = 23;

export const doors: DoorRecord[] = [
  // Occupied (17)
  { door: "DOCK50", status: "Available", entryTicket: null },
  { door: "DOCK51", status: "Occupied", entryTicket: "ET-1101472" },
  { door: "DOCK52", status: "Occupied", entryTicket: "ET-1101492" },
  { door: "DOCK53", status: "Occupied", entryTicket: "ET-1101487" },
  { door: "DOCK54", status: "Available", entryTicket: null },
  { door: "DOCK55", status: "Occupied", entryTicket: "ET-1100773" },
  { door: "DOCK56", status: "Occupied", entryTicket: "ET-1101484" },
  { door: "DOCK57", status: "Available", entryTicket: null },
  { door: "DOCK58", status: "Occupied", entryTicket: null },
  { door: "DOCK59", status: "Occupied", entryTicket: "ET-1100297" },
  { door: "DOCK60", status: "Occupied", entryTicket: "ET-1100365" },
  { door: "DOCK61", status: "Occupied", entryTicket: "ET-1101028" },
  { door: "DOCK62", status: "Occupied", entryTicket: "ET-1101182" },
  { door: "DOCK63", status: "Assigned", entryTicket: "ET-1101209" },
  { door: "DOCK64", status: "Assigned", entryTicket: "ET-1101437" },
  { door: "DOCK65", status: "Occupied", entryTicket: null },
  { door: "DOCK66", status: "Occupied", entryTicket: null },
  { door: "DOCK67", status: "Available", entryTicket: null },
  { door: "DOCK68", status: "Occupied", entryTicket: "ET-1099354" },
  { door: "DOCK69", status: "Occupied", entryTicket: "ET-1100714" },
  { door: "DOCK70", status: "Occupied", entryTicket: "ET-1101207" },
  { door: "DOCK71", status: "Occupied", entryTicket: "ET-1100820" },
  { door: "DOCK72", status: "Occupied", entryTicket: "ET-1100538" },
];

export const kpiMetrics: KpiMetric[] = [
  {
    label: "Total Doors Occupied",
    value: "17/23",
    numerator: 17,
    denominator: TOTAL_DOORS,
    percentage: 73.9,
  },
  {
    label: "Doors Assigned",
    value: "2",
    numerator: 2,
    denominator: TOTAL_DOORS,
    percentage: 8.7,
  },
  {
    label: "Doors Available",
    value: "4",
    numerator: 4,
    denominator: TOTAL_DOORS,
    percentage: 17.4,
  },
  {
    label: "Occupancy Rate",
    value: "73.9%",
    numerator: 17,
    denominator: TOTAL_DOORS,
    percentage: 73.9,
  },
];

export const unavailableMetrics: UnavailableMetric[] = [
  {
    label: "Assigned Activity — Guru live out / in assign to Arnulfo",
    reason:
      "No matching task found in the system. Closest matches: TASK-5262195 (GURUNANDA LLC live load, assigned to Rufino Munguia, CLOSED); TASK-5092233 (Disposal, Arnulfo Munguia, NEEDS_APPROVAL).",
  },
  {
    label: "Door Duration",
    reason:
      "The dock door status report service is currently down. Duration per door cannot be retrieved at this time.",
  },
  {
    label: "Assignments by Assignee",
    reason:
      "Dock assignment data returned empty for this facility. Assignments may be managed through a separate system.",
  },
  {
    label: "% Scheduled Inbounds Received",
    reason:
      "Scheduled receipt comparison data is not currently available for this door scope.",
  },
  {
    label: "% Scheduled Outbounds Loaded",
    reason:
      "Scheduled load comparison data is not currently available for this door scope.",
  },
  {
    label: "Inbound vs Outbound Mix",
    reason:
      "Door task type classification data is not populated. Individual entry ticket lookups would be needed.",
  },
];

export interface AssignmentRecord {
  dn: string;
  customer: string;
  pieces: number;
  assignee: string;
}

// No assignment history data was returned for today
export const assignments: AssignmentRecord[] = [];
