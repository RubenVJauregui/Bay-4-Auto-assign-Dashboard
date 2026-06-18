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
              DOCK50–DOCK72 &nbsp;|&nbsp; June 18, 2026 &nbsp;|&nbsp; ~16:20 PDT
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
              23 doors &nbsp;|&nbsp; {occupied} occupied / {reserved} reserved / {available} available / {anomalous} anomalies
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
              {assigneeSummaries.reduce((sum, a) => sum + a.taskCount, 0)} assigned tasks
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
                <span className="text-sm font-semibold text-[#7c3aed]">4 Active Load Tasks</span>
                <span className="text-xs text-[#a1a1aa] mt-1">
                  <strong>TASK-5294114</strong> — DOCK52 — IN_PROGRESS (~27h)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  ET-1109561 — GURUNANDA
                </span>
                <span className="text-xs text-[#a1a1aa] mt-1">
                  <strong>TASK-5294336</strong> — DOCK54 — IN_PROGRESS (~28h)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  ET-1109680 — GURUNANDA
                </span>
                <span className="text-xs text-[#a1a1aa] mt-1">
                  <strong>TASK-5295159</strong> — DOCK53 — IN_PROGRESS (~2.6h)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  GURUNANDA LOAD
                </span>
                <span className="text-xs text-[#a1a1aa] mt-1">
                  <strong>TASK-5295565</strong> — DOCK54 — IN_PROGRESS (~1h)
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
                  <span className="text-[#22c55e]">✅</span> TASK-5293980 (ORG-585450 RECEIVE, DOCK53) — CLOSED since this morning.
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  Arnulfo is 100% GURUNANDA LOAD (outbound) — all 4 tasks.
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Arnulfo&apos;s Bay 4 Summary</span>
                <span className="text-sm font-semibold text-[#22c55e]">4 active tasks on Bay 4</span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#7c3aed]">OUT:</span> 4 GURUNANDA LOAD (DOCK52, DOCK53, DOCK54×2)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#f59e0b]">IN:</span> 0 receive — prior ORG-585450 task closed
                </span>
                <span className="text-xs text-[#22c55e] mt-1">
                  ✅ Arnulfo remains #1 active assignee on Bay 4 (4 tasks)
                </span>
                <span className="text-xs text-[#71717a] mt-1">
                  Changes since noon: DOCK51 cleared (was 2 tasks). DOCK61 cleared (was 1 task).
                </span>
                <span className="text-xs text-[#71717a] mt-1">
                  TASK-5295159 moved DOCK51→DOCK53. TASK-5295565 new on DOCK54.
                </span>
                <span className="text-xs text-[#ef4444] mt-1">
                  ⚠ DOCK54 double-booked: 2 concurrent LOAD tasks for Arnulfo.
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
              <li><strong className="text-[#f4f4f6]">5 Occupied / 4 Reserved / 14 Available</strong> — 21.7% active occupancy (down from 39.1% at 12:07 PM). All 5 occupied doors have live active tasks.</li>
              <li>Active tasks: <strong className="text-[#7c3aed]">4 outbound (LOAD)</strong> / <strong className="text-[#22c55e]">2 inbound (RECEIVE)</strong>. Mix: <strong className="text-[#f4f4f6]">66.7% outbound / 33.3% inbound</strong>.</li>
              <li>Plus <strong className="text-[#f59e0b]">7 NEW (pending)</strong> tasks across DOCK59, DOCK60, DOCK61, DOCK62, DOCK64, DOCK65 — all GURUNANDA RECEIVE.</li>
              <li>Schedule data still unavailable — BAM appointment API returns 400/SQL errors.</li>
              <li>4 assignees: Arnulfo Munguia (4 LOAD), Daniela Gonzalez (1 IP + 3 NEW), Caren Cubides (1 IP + 2 NEW), Rufino Munguia (2 NEW).</li>
              <li><strong className="text-[#22c55e]">ARNULFO MUNGUIA:</strong> #1 active — <strong className="text-[#f4f4f6]">100% GURUNANDA LOAD</strong> on 3 doors: DOCK52, DOCK53, DOCK54×2. Zero receive tasks. Down from 5→4 since noon.</li>
              <li><strong className="text-[#ef4444]">⚠ DOCK54 ANOMALY:</strong> 2 concurrent LOAD tasks for same assignee. TASK-5294336 (~28h) + TASK-5295565 (~1h).</li>
              <li><strong className="text-[#22c55e]">✅ DOCK59 RESOLVED:</strong> Previously anomalous with unresolved user &quot;11769&quot;. Now confirmed: Daniela Gonzalez.</li>
              <li><strong className="text-[#f4f4f6]">🔁 Key changes since ~12:07 PM:</strong> DOCK51 cleared (was Arnulfo×2). DOCK61 cleared (Arnulfo→Rufino). DOCK67/DOCK68 cleared (were RECEIVE). TASK-5295159 moved DOCK51→DOCK53. TASK-5295565 new on DOCK54. IN_PROGRESS collapsed 12→6. Reserved emerged 0→4.</li>
              <li>GURUNANDA dominates: all 13 tasks (6 active + 7 pending) are GURUNANDA.</li>
              <li><strong className="text-[#f4f4f6]">⚠ 7 NEW tasks</strong> are pending — none yet IN_PROGRESS. Appear to be batch-created RECEIVE assignments.</li>
              <li>All core metrics sourced from live WISE/WMS queries at ~16:20 PDT, June 18, 2026.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2a] bg-[#0a0a0f] mt-2">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#71717a]">
          <span>Valley View Warehouse — Bay 4 Operations</span>
          <span>Last updated: June 18, 2026 ~16:20 PDT</span>
        </div>
      </footer>
    </div>
  );
}
