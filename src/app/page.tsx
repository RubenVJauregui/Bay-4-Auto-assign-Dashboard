import {
  doors,
  kpiMetrics,
  assigneeSummaries,
  inboundOutboundMix,
  scheduleAvailable,
  scheduledInboundReceived,
  scheduledInboundOrders,
  scheduledOutboundLoaded,
  scheduledOutboundOrders,
  pctScheduledInboundReceived,
  pctScheduledOutboundLoaded,
  assignments,
} from "@/lib/data";
import KpiCard from "@/components/KpiCard";
import DoorGrid from "@/components/DoorGrid";
import AssigneeSummaryList from "@/components/AssigneeSummary";
import OperationalMetrics from "@/components/OperationalMetrics";
import AssignmentHistory from "@/components/AssignmentHistory";

const ACCENT_CLASSES = [
  "text-[#ef4444]",
  "text-[#22c55e]",
  "text-[#f59e0b]",
  "text-[#7c3aed]",
];

const GAUGE_CLASSES = [
  "#ef4444",
  "#22c55e",
  "#f59e0b",
  "#7c3aed",
];

const occupied = doors.filter((d) => d.status === "Occupied").length;
const reserved = doors.filter((d) => d.status === "Reserved").length;
const available = doors.filter((d) => d.status === "Available").length;

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-[#1e1e2a] bg-[#0a0a0f] sticky top-0 z-10">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-lg font-bold text-[#f4f4f6] tracking-tight leading-tight">
              Bay 4 Assignments — Valley View
            </h1>
            <p className="text-xs text-[#71717a] tracking-wide">
              DOCK50–DOCK72 &nbsp;|&nbsp; June 15, 2026 &nbsp;|&nbsp; ~3:08 PM PDT
            </p>
          </div>
          {/* Facility badge */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
            <span className="text-xs text-[#a1a1aa] font-medium tracking-wide">
              LT_F1
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-6 flex flex-col gap-6">
        {/* ── Section: KPI Cards ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-5 w-1 rounded-full bg-[#7c3aed]" />
            <h2 className="text-sm font-semibold text-[#a1a1aa] uppercase tracking-widest">
              Summary
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiMetrics.map((metric, i) => (
              <KpiCard
                key={metric.label}
                metric={metric}
                accentClass={ACCENT_CLASSES[i]}
                gaugeClass={GAUGE_CLASSES[i]}
              />
            ))}
          </div>
        </section>

        {/* ── Section: Door Utilization Grid ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-5 w-1 rounded-full bg-[#7c3aed]" />
            <h2 className="text-sm font-semibold text-[#a1a1aa] uppercase tracking-widest">
              Door Utilization
            </h2>
            <span className="text-xs text-[#71717a] ml-auto">
              23 doors &nbsp;|&nbsp; {occupied} occupied / {available} available
            </span>
          </div>
          <DoorGrid doors={doors} />
        </section>

        {/* ── Section: Operational Metrics ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-5 w-1 rounded-full bg-[#7c3aed]" />
            <h2 className="text-sm font-semibold text-[#a1a1aa] uppercase tracking-widest">
              Operational Metrics
            </h2>
          </div>
          <OperationalMetrics
            mix={inboundOutboundMix}
            scheduleAvailable={scheduleAvailable}
            scheduledInboundReceived={scheduledInboundReceived}
            scheduledInboundOrders={scheduledInboundOrders}
            scheduledOutboundLoaded={scheduledOutboundLoaded}
            scheduledOutboundOrders={scheduledOutboundOrders}
            pctInboundReceived={pctScheduledInboundReceived}
            pctOutboundLoaded={pctScheduledOutboundLoaded}
          />
        </section>

        {/* ── Section: Assignments by Assignee ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-5 w-1 rounded-full bg-[#7c3aed]" />
            <h2 className="text-sm font-semibold text-[#a1a1aa] uppercase tracking-widest">
              Assignments by Assignee
            </h2>
            <span className="text-xs text-[#71717a] ml-auto">
              {assigneeSummaries.reduce((sum, a) => sum + a.taskCount, 0)} active tasks
            </span>
          </div>
          <AssigneeSummaryList summaries={assigneeSummaries} />
        </section>

        {/* ── Section: Assignment History ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-5 w-1 rounded-full bg-[#7c3aed]" />
            <h2 className="text-sm font-semibold text-[#a1a1aa] uppercase tracking-widest">
              Assignment History
            </h2>
            <span className="text-xs text-[#71717a] ml-auto">
              {assignments.length} assigned transactions
            </span>
          </div>
          <AssignmentHistory assignments={assignments} />
        </section>

        {/* ── Section: "Guru live out / in assign to Arnulfo" ── */}
        <section>
          <div className="bg-[#141419] border border-[#1e1e2a] rounded-xl p-5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
              Guru Live Out / In — Assigned to Arnulfo
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Live Out (GURUNANDA Outbound)</span>
                <span className="text-sm font-semibold text-[#71717a]">0 — All CLOSED</span>
                <span className="text-xs text-[#71717a]">
                  No active GURUNANDA outbound tasks for Arnulfo on Bay 4.
                </span>
                <span className="text-xs text-[#a1a1aa] mt-2">
                  Most recent closing: TASK-5291144 (DOCK55, Jun 15 18:36)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  TASK-5290890 (DOCK54, Jun 15 16:00)
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Live In (GURUNANDA Receive)</span>
                <span className="text-sm font-semibold text-[#71717a]">0 — All CLOSED</span>
                <span className="text-xs text-[#71717a]">
                  No active GURUNANDA receive tasks for Arnulfo on Bay 4.
                </span>
                <span className="text-xs text-[#a1a1aa] mt-2">
                  TASK-5290712 (DOCK53, Jun 12 21:58)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  TASK-5290628 (DOCK61, Jun 12 16:54)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  TASK-5288507 (DOCK56, Jun 10 17:13)
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Arnulfo&apos;s Bay 4 Summary</span>
                <span className="text-sm font-semibold text-[#71717a]">0 active tasks on Bay 4</span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#7c3aed]">OUT:</span> 0 GURUNANDA
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#f59e0b]">IN:</span> 0 GURUNANDA
                </span>
                <span className="text-xs text-[#22c55e] mt-1">
                  ✓ All prior Arnulfo Bay 4 tasks now CLOSED
                </span>
                <span className="text-xs text-[#71717a] mt-1">
                  5 tasks closed since Jun 10 — DOCK53, DOCK54, DOCK55, DOCK56, DOCK61
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Data Notes ── */}
        <section>
          <div className="bg-[#141419] border border-[#1e1e2a] rounded-xl p-5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
              Data Notes
            </span>
            <ul className="text-xs text-[#71717a] space-y-1 list-disc list-inside">
              <li><strong className="text-[#f4f4f6]">5 Occupied / 0 Reserved / 18 Available</strong> — 21.7% occupancy. All 5 occupied doors have active tasks.</li>
              <li>Active tasks: <strong className="text-[#7c3aed]">2 outbound</strong> / <strong className="text-[#22c55e]">5 inbound</strong>. Mix: <strong className="text-[#f4f4f6]">29% outbound / 71% inbound</strong>.</li>
              <li>Customer mix: 100% GURUNANDA, LLC (ORG-655875) — all 7 active tasks.</li>
              <li>3 assignees: RUFINO MUNGUIA (5), Renato Rosales (1), DANIEL BELTRAN (1).</li>
              <li><strong className="text-[#7c3aed]">ARNULFO MUNGUIA:</strong> 0 active Bay 4 tasks — all prior assignments CLOSED.</li>
              <li><strong className="text-[#7c3aed]">GURU LIVE OUT:</strong> 0 — All Arnulfo GURUNANDA outbound tasks CLOSED. Most recent: TASK-5291144 (DOCK55, Jun 15) and TASK-5290890 (DOCK54, Jun 15).</li>
              <li><strong className="text-[#f59e0b]">GURU LIVE IN:</strong> 0 — All Arnulfo GURUNANDA receive tasks CLOSED.</li>
              <li><strong className="text-[#ef4444]">⚠ DOCK65 DOUBLE-BOOKED:</strong> TASK-5291946 (NEW ~4.4h) + TASK-5290955 (IN_PROGRESS ~73.8h since Jun 12).</li>
              <li><strong className="text-[#ef4444]">⚠ DOCK66 DOUBLE-BOOKED:</strong> TASK-5292030 (IN_PROGRESS ~3.8h) + TASK-5290744 (IN_PROGRESS ~77.0h since Jun 12).</li>
              <li><strong className="text-[#ef4444]">⚠ STUCK TASKS:</strong> DOCK65 and DOCK66 occupied since June 12 (~3+ days) — these receive tasks may need escalation.</li>
              <li><strong className="text-[#ef4444]">⚠ YMS UNAVAILABLE:</strong> Location API returned 500 errors — door occupancy status is inferred from active tasks, not independently verified via YMS. Reserved count shown as UNAVAIL.</li>
              <li><strong className="text-[#ef4444]">⚠ SCHEDULE UNAVAILABLE:</strong> Full Appointments API query not performed — % scheduled inbounds received and % outbounds loaded are not available in this pull.</li>
              <li><strong className="text-[#f4f4f6]">MAJOR SHIFT since June 7:</strong> 5 occupied (was 8), 18 available (was 0), 0 reserved (was 15). Active tasks: 7 (was 9). Arnulfo tasks: 0 (was 4). Mix: 29/71 (was 44/56). All ghost-occupied doors cleared.</li>
              <li>GURUNANDA outbounds shipped today: DOCK54 (APPT-6030779), DOCK55 (APPT-6030808), DOCK56 (5 loads), DOCK59 (APPT-6030726), DOCK62 (APPT-6030431).</li>
              <li>All data sourced from live WISE/WMS queries at ~3:08 PM PDT, June 15, 2026.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2a] bg-[#0a0a0f] mt-2">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#71717a]">
          <span>Valley View Warehouse — Bay 4 Operations</span>
          <span>Last updated: June 15, 2026 ~3:08 PM PDT</span>
        </div>
      </footer>
    </div>
  );
}
