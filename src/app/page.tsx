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
  facilityInboundOpen,
  facilityOutboundOpen,
} from "@/lib/data";
import KpiCard from "@/components/KpiCard";
import DoorGrid from "@/components/DoorGrid";
import AssigneeSummaryList from "@/components/AssigneeSummary";
import OperationalMetrics from "@/components/OperationalMetrics";
import AssignmentHistory from "@/components/AssignmentHistory";

const ACCENT_CLASSES = [
  "text-[#ef4444]",
  "text-[#f59e0b]",
  "text-[#22c55e]",
  "text-[#7c3aed]",
];

const GAUGE_CLASSES = [
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#7c3aed",
];

const occupied = doors.filter((d) => d.status === "Occupied").length;
const reserved = doors.filter((d) => d.status === "Reserved").length;

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
              DOCK50–DOCK72 &nbsp;|&nbsp; June 5, 2026 &nbsp;|&nbsp; ~08:30 PDT
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
              23 doors &nbsp;|&nbsp; {occupied} occupied / {reserved} reserved
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
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Live Out (PRE_LOAD)</span>
                <span className="text-sm font-semibold text-[#71717a]">— None —</span>
                <span className="text-xs text-[#71717a]">
                  TASK-5281747 (DOCK52, DN-3190424, 28 pal, 94,060 pcs) was CLOSED.
                </span>
                <span className="text-xs text-[#71717a]">
                  Carrier signed 6/4 16:14 PDT. DOCK52 now stale OCCUPIED.
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Live In (RECEIVE)</span>
                <span className="text-sm font-semibold text-[#71717a]">— None —</span>
                <span className="text-xs text-[#71717a]">
                  No active GURUNANDA receive tasks for Arnulfo on Bay 4.
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Arnulfo&apos;s Active Bay 4</span>
                <span className="text-sm font-semibold text-[#22c55e]">TASK-5285485 · DOCK51</span>
                <span className="text-xs text-[#a1a1aa]">
                  KARAKA · RN-186139 · RECEIVE · ~0.5h · IN_PROGRESS
                </span>
                <span className="text-xs text-[#71717a]">
                  Not GURUNANDA — first KARAKA task for Arnulfo on Bay 4.
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
              <li><strong className="text-[#f4f4f6]">14 Occupied / 5 Reserved / 4 Available</strong> — 82.6% occupancy (occupied+reserved). Bay 4 heavily loaded with 19 of 23 doors in use.</li>
              <li><strong className="text-[#ef4444]">10 stale OCCUPIED doors</strong> — DOCK52, DOCK61, DOCK63, DOCK66, DOCK67, DOCK68, DOCK69, DOCK70 have no active tasks. Dock checkout may be needed.</li>
              <li>Active tasks: <strong className="text-[#7c3aed]">4 outbound</strong> / <strong className="text-[#22c55e]">3 inbound</strong>. Mix: <strong className="text-[#7c3aed]">57% outbound</strong> / <strong className="text-[#22c55e]">43% inbound</strong>.</li>
              <li>Outbound: DOCK50 (Daniel Beltran, LIVE_LOAD NEW, GURUNANDA DN-3193080), DOCK53 (Lorenzo Rodriguez, PRE_LOAD ~13.5h, 8 GURUNANDA DNs), DOCK54 (Lorenzo Rodriguez, PRE_LOAD ~11.5h, 2 GURUNANDA DNs), DOCK55 (Adriana Nunez, LIVE_LOAD NEW, NORTH STAR CONTAINER DN-5188763).</li>
              <li>Inbound: DOCK51 (Arnulfo Munguia, RECEIVE ~0.5h, KARAKA RN-186139), DOCK62 (Daniela Gonzalez, RECEIVE ~9.1h, GURUNANDA RN-5007923), DOCK65 (Daniela Gonzalez, RECEIVE ~29.2h, GURUNANDA RN-186014).</li>
              <li>Customer mix: <strong className="text-[#f4f4f6]">GURUNANDA</strong> (ORG-655875) on 5 of 7 active tasks. <strong className="text-[#f59e0b]">KARAKA</strong> (ORG-585450) on DOCK51. <strong className="text-[#8b5cf6]">NORTH STAR CONTAINER</strong> (ORG-436686) on DOCK55.</li>
              <li><strong className="text-[#f59e0b]">Shift change detected:</strong> Daniel Beltran replaces daira gonzalez on DOCK50. Adriana Nunez replaces Jerome Aranda on DOCK55. Arnulfo Munguia moved from DOCK52 (GURUNANDA) to DOCK51 (KARAKA).</li>
              <li>Arnulfo Munguia: <strong className="text-[#22c55e]">1 Bay 4 task</strong> — DOCK51 TASK-5285485 (KARAKA RECEIVE, RN-186139, ~0.5h). Previous GURUNANDA tasks TASK-5281747, TASK-5284457, TASK-5284360 all CLOSED.</li>
              <li>Lorenzo Rodriguez: <strong className="text-[#f4f4f6]">2 PRE_LOAD tasks</strong> — DOCK53 (TASK-5284794, 8 DNs, ~13.5h) + DOCK54 (TASK-5285010, 2 DNs, ~11.5h).</li>
              <li>Daniela Gonzalez: <strong className="text-[#f4f4f6]">2 RECEIVE tasks</strong> — DOCK62 (TASK-5285184, RN-5007923, ~9.1h) + DOCK65 (TASK-5283625, RN-186014, ~29.2h).</li>
              <li>Daniel Beltran: <strong className="text-[#f4f4f6]">1 LIVE_LOAD task</strong> — DOCK50 (TASK-5285378, GURUNANDA DN-3193080, NEW).</li>
              <li>Adriana Nunez: <strong className="text-[#f4f4f6]">1 LIVE_LOAD task</strong> — DOCK55 (TASK-5285500, NORTH STAR CONTAINER DN-5188763, NEW). Not yet IN_PROGRESS.</li>
              <li><strong className="text-[#ef4444]">DOCK51 anomaly:</strong> Door API shows AVAILABLE but has active IN_PROGRESS TASK-5285485. Door status lags task assignment.</li>
              <li><strong className="text-[#ef4444]">DOCK52 stale:</strong> TASK-5281747 concluded (carrier signed 6/4 16:14) but dock still OCCUPIED. Needs checkout.</li>
              <li>Schedule %: <strong className="text-[#71717a]">UNAVAILABLE</strong> — no schedule-summary API endpoint found; entry-ticket activity returned 500 timeout.</li>
              <li>Facility-wide open: <strong className="text-[#22c55e]">{facilityInboundOpen}</strong> inbound (23 NEW + 46 IN_PROGRESS), <strong className="text-[#7c3aed]">{facilityOutboundOpen}</strong> outbound (18 NEW + 39 IN_PROGRESS).</li>
              <li>Piece counts unavailable for this pull — load-task detail API did not return piece data for all tasks.</li>
              <li>All data sourced from live WISE/WMS queries at ~08:30 PDT, June 5, 2026.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2a] bg-[#0a0a0f] mt-2">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#71717a]">
          <span>Valley View Warehouse — Bay 4 Operations</span>
          <span>Last updated: June 5, 2026 ~08:30 PDT</span>
        </div>
      </footer>
    </div>
  );
}
