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
const available = doors.filter((d) => d.status === "Available").length;
const anomalous = doors.filter((d) => d.anomaly).length;

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
              DOCK50–DOCK72 &nbsp;|&nbsp; June 18, 2026 &nbsp;|&nbsp; ~9:08 AM PDT
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
              23 doors &nbsp;|&nbsp; {occupied} occupied / {available} available / {anomalous} anomalies
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
                <span className="text-sm font-semibold text-[#7c3aed]">3 Active Load Tasks</span>
                <span className="text-xs text-[#a1a1aa] mt-1">
                  <strong>TASK-5295058</strong> — DOCK51 — NEW (~2h)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  ET-1110214 — GURUNANDA
                </span>
                <span className="text-xs text-[#a1a1aa] mt-1">
                  <strong>TASK-5294114</strong> — DOCK52 — IN_PROGRESS (~18h)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  ET-1109561 — GURUNANDA
                </span>
                <span className="text-xs text-[#a1a1aa] mt-1">
                  <strong>TASK-5294336</strong> — DOCK54 — IN_PROGRESS (~16h)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  ET-1109680 — GURUNANDA
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Live In (GURUNANDA Receive)</span>
                <span className="text-sm font-semibold text-[#f59e0b]">0 — No GURUNANDA Receive Tasks</span>
                <span className="text-xs text-[#71717a]">
                  No active GURUNANDA receive tasks for Arnulfo on Bay 4.
                </span>
                <span className="text-xs text-[#a1a1aa] mt-2">
                  TASK-5293980 on DOCK53 is Arnulfo&apos;s but customer is ORG-585450 (not GURUNANDA).
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  ET-1109499 — IN_PROGRESS — ~19h on DOCK53.
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Arnulfo&apos;s Bay 4 Summary</span>
                <span className="text-sm font-semibold text-[#22c55e]">4 active tasks on Bay 4</span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#7c3aed]">OUT:</span> 3 GURUNANDA LOAD (DOCK51, DOCK52, DOCK54)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#f59e0b]">IN:</span> 1 RECEIVE ORG-585450 (DOCK53)
                </span>
                <span className="text-xs text-[#22c55e] mt-1">
                  ✅ Arnulfo remains #1 active assignee on Bay 4 (4 tasks)
                </span>
                <span className="text-xs text-[#71717a] mt-1">
                  New: TASK-5295058 (GURUNANDA LOAD, DOCK51, NEW) since last pull.
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
              <li><strong className="text-[#f4f4f6]">7 Occupied / 0 Reserved / 16 Available</strong> — 30.4% occupancy. All 7 occupied doors have live active tasks (no orphaned occupancy).</li>
              <li>Active tasks: <strong className="text-[#7c3aed]">3 outbound (LOAD)</strong> / <strong className="text-[#22c55e]">4 inbound (RECEIVE)</strong>. Mix: <strong className="text-[#f4f4f6]">42.9% outbound / 57.1% inbound</strong>.</li>
              <li>Schedule data not refreshed — BAM appointment API unavailable.</li>
              <li>3 assignees: ARNULFO MUNGUIA (4), Caren Cubides (2), 11769 (1 on DOCK59).</li>
              <li><strong className="text-[#22c55e]">ARNULFO MUNGUIA:</strong> #1 active assignee on Bay 4 — 3 LOAD (GURUNANDA, DOCK51/52/54) + 1 RECEIVE (ORG-585450, DOCK53).</li>
              <li><strong className="text-[#ef4444]">⚠ DOCK59 ANOMALY:</strong> Space EMPTY per WISE but TASK-5294674 (IN_PROGRESS, 11769, GURUNANDA) active — phantom occupancy.</li>
              <li><strong className="text-[#f4f4f6]">🔁 Changes since ~6:29 AM pull:</strong> DOCK50 freed (TASK-5090739 closed). DOCK62 freed (TASK-5207670 closed). DOCK65 reduced 2→1 task (TASK-5252949 closed). TASK-5293980 moved DOCK51→DOCK53. New TASK-5295058 on DOCK51.</li>
              <li><strong className="text-[#f59e0b]">⚠ 15 FORCE_CLOSED GURUNANDA receive tasks</strong> on Bay 4 doors (DOCK59, DOCK65–DOCK70 dockIds) — stale dock close-out procedures.</li>
              <li><strong className="text-[#f59e0b]">⚠ 3 FORCE_CLOSED ORG-585450 tasks</strong> on DOCK51/DOCK52 dockIds.</li>
              <li><strong className="text-[#f4f4f6]">11769</strong> is an unresolved user ID on DOCK59.</li>
              <li>All data sourced from live WISE/WMS queries at ~9:08 AM PDT, June 18, 2026.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2a] bg-[#0a0a0f] mt-2">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#71717a]">
          <span>Valley View Warehouse — Bay 4 Operations</span>
          <span>Last updated: June 18, 2026 ~9:08 AM PDT</span>
        </div>
      </footer>
    </div>
  );
}
