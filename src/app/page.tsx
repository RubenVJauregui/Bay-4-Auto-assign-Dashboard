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
              DOCK50–DOCK72 &nbsp;|&nbsp; June 18, 2026 &nbsp;|&nbsp; ~6:29 AM PDT
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
                <span className="text-sm font-semibold text-[#7c3aed]">2 Active Load Tasks</span>
                <span className="text-xs text-[#a1a1aa] mt-1">
                  <strong>TASK-5294336</strong> — DOCK54 — IN_PROGRESS (~13h)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  LOAD-5031353/55/47 — GURUNANDA
                </span>
                <span className="text-xs text-[#a1a1aa] mt-1">
                  <strong>TASK-5294114</strong> — DOCK52 — IN_PROGRESS (~15h)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  LOAD-5031362 — GURUNANDA
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Live In (GURUNANDA Receive)</span>
                <span className="text-sm font-semibold text-[#f59e0b]">0 — No GURUNANDA Receive Tasks</span>
                <span className="text-xs text-[#71717a]">
                  No active GURUNANDA receive tasks for Arnulfo on Bay 4.
                </span>
                <span className="text-xs text-[#a1a1aa] mt-2">
                  TASK-5293980 on DOCK51 is Arnulfo&apos;s but customer is ORG-585450 (not GURUNANDA).
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  RN-186534 — NEW — ~16h on DOCK51.
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Arnulfo&apos;s Bay 4 Summary</span>
                <span className="text-sm font-semibold text-[#22c55e]">3 active tasks on Bay 4</span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#7c3aed]">OUT:</span> 2 GURUNANDA LOAD (DOCK52, DOCK54)
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#f59e0b]">IN:</span> 1 RECEIVE ORG-585450 (DOCK51)
                </span>
                <span className="text-xs text-[#22c55e] mt-1">
                  ✅ Arnulfo remains #1 active assignee on Bay 4 (3 tasks)
                </span>
                <span className="text-xs text-[#71717a] mt-1">
                  TASK-5294715 (NZXT, DOCK54) confirmed CLOSED — DOCK54 now single-task.
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
              <li><strong className="text-[#f4f4f6]">13 Occupied / 0 Reserved / 10 Available</strong> — 56.5% occupancy (by WISE location spaceStatus). 5 of 13 occupied doors have active tasks.</li>
              <li>Active tasks: <strong className="text-[#7c3aed]">2 outbound (LOAD)</strong> / <strong className="text-[#22c55e]">7 inbound (RECEIVE)</strong>. Mix: <strong className="text-[#f4f4f6]">22.2% outbound / 77.8% inbound</strong>.</li>
              <li>Schedule data not refreshed in this pull — unavailable.</li>
              <li>5 assignees: ARNULFO MUNGUIA (3), RUFINO MUNGUIA (2), Caren Cubides (2), DANIELA GONZALEZ (1), Unknown (1 on DOCK50).</li>
              <li><strong className="text-[#22c55e]">ARNULFO MUNGUIA:</strong> #1 active assignee on Bay 4 — 2 LOAD (GURUNANDA, DOCK52/54) + 1 RECEIVE (ORG-585450, DOCK51).</li>
              <li><strong className="text-[#ef4444]">⚠ DOCK59 ANOMALY:</strong> Space EMPTY but TASK-5294674 (IN_PROGRESS, DANIELA GONZALEZ, GURUNANDA) active — phantom occupancy.</li>
              <li><strong className="text-[#ef4444]">⚠ DOCK65 ANOMALY:</strong> Space EMPTY but 2 active tasks: TASK-5294419 (NEW, RUFINO, ~12h) + TASK-5252949 (NEW, Cubides, ~52d stale).</li>
              <li><strong className="text-[#ef4444]">⚠ DOCK67 ANOMALY:</strong> Space EMPTY but TASK-5294128 (NEW, RUFINO MUNGUIA, ~15h) active.</li>
              <li><strong className="text-[#ef4444]">⚠ 3 STALE TASKS:</strong> TASK-5090739 (~240d, 10/21/2025, Unknown), TASK-5207670 (~108d, 3/2/2026, Cubides), TASK-5252949 (~52d, 4/27/2026, Cubides).</li>
              <li><strong className="text-[#f59e0b]">⚠ 8 OCCUPIED DOORS with NO active tasks:</strong> DOCK53, DOCK55, DOCK56, DOCK57, DOCK58, DOCK60, DOCK61, DOCK70.</li>
              <li><strong className="text-[#f4f4f6]">CORRECTED from prior pull:</strong> TASK-5294715 (NZXT, DOCK54) and TASK-5293707 (DUENAS, DOCK65) — CONFIRMED CLOSED. DOCK54 is single-task now. DOCK65 has 2 active (was 3).</li>
              <li><strong className="text-[#f4f4f6]">DOCK50 new assignee:</strong> TASK-5090739 previously attributed to "daira gonzalez" — actual assignee is userId 194807… (unresolved).</li>
              <li>All data sourced from live WISE/WMS queries at ~6:29 AM PDT, June 18, 2026.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2a] bg-[#0a0a0f] mt-2">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#71717a]">
          <span>Valley View Warehouse — Bay 4 Operations</span>
          <span>Last updated: June 18, 2026 ~6:29 AM PDT</span>
        </div>
      </footer>
    </div>
  );
}
