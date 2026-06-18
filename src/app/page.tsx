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
              DOCK50–DOCK72 &nbsp;|&nbsp; June 18, 2026 &nbsp;|&nbsp; ~12:07 PM PDT
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
                <span className="text-sm font-semibold text-[#7c3aed]">5 Active Load Tasks</span>
                <span className="text-xs text-[#a1a1aa] mt-1">
                  <strong>TASK-5295058</strong> — DOCK51 — IN_PROGRESS (~3h)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  ET-1110214 — GURUNANDA
                </span>
                <span className="text-xs text-[#a1a1aa] mt-1">
                  <strong>TASK-5295159</strong> — DOCK51 — <span className="text-[#22c55e]">NEW</span>
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  GURUNANDA LOAD
                </span>
                <span className="text-xs text-[#a1a1aa] mt-1">
                  <strong>TASK-5294114</strong> — DOCK52 — IN_PROGRESS (~21h)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  ET-1109561 — GURUNANDA
                </span>
                <span className="text-xs text-[#a1a1aa] mt-1">
                  <strong>TASK-5294336</strong> — DOCK54 — IN_PROGRESS (~19h)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  ET-1109680 — GURUNANDA
                </span>
                <span className="text-xs text-[#a1a1aa] mt-1">
                  <strong>TASK-5295174</strong> — DOCK61 — IN_PROGRESS (~2h)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  GURUNANDA LOAD
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Live In (Receive — Arnulfo)</span>
                <span className="text-sm font-semibold text-[#f59e0b]">0 — No Receive Tasks</span>
                <span className="text-xs text-[#71717a]">
                  No active receive tasks assigned to Arnulfo on Bay 4.
                </span>
                <span className="text-xs text-[#a1a1aa] mt-2">
                  <span className="text-[#22c55e]">✅</span> TASK-5293980 (ORG-585450 RECEIVE, DOCK53) — CLOSED since 9:08 AM pull.
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  Arnulfo is now 100% GURUNANDA LOAD (outbound) — all 5 tasks.
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Arnulfo&apos;s Bay 4 Summary</span>
                <span className="text-sm font-semibold text-[#22c55e]">5 active tasks on Bay 4</span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#7c3aed]">OUT:</span> 5 GURUNANDA LOAD (DOCK51×2, DOCK52, DOCK54, DOCK61)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#f59e0b]">IN:</span> 0 receive — prior ORG-585450 task closed
                </span>
                <span className="text-xs text-[#22c55e] mt-1">
                  ✅ Arnulfo remains #1 active assignee on Bay 4 (5 tasks, +1 since 9 AM)
                </span>
                <span className="text-xs text-[#71717a] mt-1">
                  New: TASK-5295159 (GURUNANDA LOAD, DOCK51, NEW) and TASK-5295174 (GURUNANDA LOAD, DOCK61).
                </span>
                <span className="text-xs text-[#71717a] mt-1">
                  DOCK61 is newly occupied for Arnulfo — was available at 9:08 AM.
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
              <li><strong className="text-[#f4f4f6]">9 Occupied / 0 Reserved / 14 Available</strong> — 39.1% occupancy (up from 30.4% at 9 AM). All 9 occupied doors have live active tasks (no orphaned occupancy).</li>
              <li>Active tasks: <strong className="text-[#7c3aed]">7 outbound (LOAD)</strong> / <strong className="text-[#22c55e]">5 inbound (RECEIVE)</strong>. Mix: <strong className="text-[#f4f4f6]">58.3% outbound / 41.7% inbound</strong> — flip from 42.9/57.1 at 9 AM.</li>
              <li>Schedule data not refreshed — BAM appointment API still returns 400/SQL errors.</li>
              <li>6 assignees (up from 3): Arnulfo Munguia (5), Jerome Aranda (2), Caren Cubides (2), Rufino Munguia (1), Daniela Gonzalez (1), Daniel Beltran (1).</li>
              <li><strong className="text-[#22c55e]">ARNULFO MUNGUIA:</strong> #1 active — now <strong className="text-[#f4f4f6]">100% GURUNANDA LOAD</strong> on 4 doors: DOCK51×2, DOCK52, DOCK54, DOCK61. Zero receive tasks.</li>
              <li><strong className="text-[#ef4444]">⚠ DOCK59 ANOMALY:</strong> Still active with unresolved user (was &quot;11769&quot;). 1 RECEIVE task IN_PROGRESS.</li>
              <li><strong className="text-[#f4f4f6]">🔁 Key changes since ~9:08 AM:</strong> DOCK61 newly occupied by Arnulfo. DOCK68 newly occupied (RECEIVE). DOCK53 switched from RECEIVE→LOAD. DOCK65 doubled (1→2 tasks). Arnulfo&apos;s TASK-5293980 (ORG-585450 RECEIVE) closed. Total occupied 7→9, active tasks 7→12.</li>
              <li><strong className="text-[#f59e0b]">⚠ 3 doors unresolved:</strong> DOCK59, DOCK67, DOCK68 have active tasks but door-level assignee mapping requires BAM query not executed in this pull.</li>
              <li>GURUNANDA dominates: 11 of 12 active tasks.</li>
              <li><strong className="text-[#f4f4f6]">⚠ 5 tasks have UNRESOLVED task IDs</strong> — door-level BAM call needed to resolve task IDs for non-Arnulfo doors.</li>
              <li>All core metrics sourced from live WISE/WMS queries at ~12:07 PM PDT, June 18, 2026.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2a] bg-[#0a0a0f] mt-2">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#71717a]">
          <span>Valley View Warehouse — Bay 4 Operations</span>
          <span>Last updated: June 18, 2026 ~12:07 PM PDT</span>
        </div>
      </footer>
    </div>
  );
}
