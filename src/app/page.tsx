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
              DOCK50–DOCK72 &nbsp;|&nbsp; June 5, 2026 &nbsp;|&nbsp; ~11:30 AM PDT
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
                <span className="text-sm font-semibold text-[#7c3aed]">TASK-5285558 · DOCK53</span>
                <span className="text-xs text-[#a1a1aa]">
                  GURUNANDA · DN-3198181 · PRE_LOAD · ~2.4h · IN_PROGRESS
                </span>
                <span className="text-xs text-[#71717a]">
                  LOAD-5030114 · Seal A120211
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Live In (RECEIVE)</span>
                <span className="text-sm font-semibold text-[#71717a]">— None (GURUNANDA) —</span>
                <span className="text-xs text-[#71717a]">
                  No active GURUNANDA receive tasks for Arnulfo on Bay 4.
                </span>
                <span className="text-xs text-[#71717a]">
                  His Bay 4 receive is KARAKA TASK-5285485 (RN-186139, DOCK51, ~3.3h).
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Arnulfo&apos;s Active Bay 4</span>
                <span className="text-sm font-semibold text-[#22c55e]">2 tasks on Bay 4</span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#7c3aed]">OUT:</span> TASK-5285558 · DOCK53 · GURUNANDA · DN-3198181
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#22c55e]">IN:</span> TASK-5285485 · DOCK51 · KARAKA · RN-186139 · ~3.3h
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
              <li><strong className="text-[#f4f4f6]">8 Occupied / 7 Reserved / 8 Available</strong> — 65.2% occupancy rate (occupied+reserved).</li>
              <li><strong className="text-[#ef4444]">4 stale OCCUPIED doors</strong> — DOCK61, DOCK63, DOCK66, DOCK67 have no active tasks. Dock checkout may be needed.</li>
              <li><strong className="text-[#f59e0b]">6 stale RESERVED doors</strong> — DOCK60, DOCK64, DOCK69, DOCK70, DOCK71, DOCK72 assigned but no active tasks.</li>
              <li><strong className="text-[#f59e0b]">⚠ 3 AVAILABLE doors with active tasks:</strong> DOCK51 (TASK-5285485 KARAKA), DOCK53 (TASK-5285558 GURUNANDA), DOCK65 (TASK-5283625 GURUNANDA). Dock status may be stale.</li>
              <li>Active tasks: <strong className="text-[#7c3aed]">4 outbound</strong> / <strong className="text-[#22c55e]">4 inbound</strong>. Mix: <strong className="text-[#f4f4f6]">50% / 50%</strong>.</li>
              <li>Outbound: DOCK52 (Lorenzo LIVE_LOAD ~1.1h), DOCK53 (Arnulfo PRE_LOAD ~2.4h), DOCK54 (Lorenzo PRE_LOAD ~21.4h), DOCK58 (Daniel Beltran LIVE_LOAD ~1h).</li>
              <li>Inbound: DOCK51 (Arnulfo KARAKA RECEIVE ~3.3h), DOCK62 (Daniela RECEIVE ~18.9h), DOCK65 (Daniela RECEIVE ~44.3h), DOCK68 (Rufino RECEIVE ~1.5h).</li>
              <li>Customer mix: <strong className="text-[#f4f4f6]">GURUNANDA</strong> (ORG-655875) on 7 of 8 active tasks. <strong className="text-[#f59e0b]">KARAKA</strong> (ORG-585450) on DOCK51.</li>
              <li><strong className="text-[#7c3aed]">ARNULFO MUNGUIA:</strong> 2 Bay 4 tasks — LIVE OUT TASK-5285558 (DOCK53, GURUNANDA DN-3198181, ~2.4h, Seal A120211) + RECEIVE TASK-5285485 (DOCK51, KARAKA RN-186139, ~3.3h).</li>
              <li>Previous GURUNANDA TASK-5281747 (DOCK52, DN-3190424, 28 pal) CLOSED — carrier signed 6/4 16:14. DOCK52 now OCCUPIED by Lorenzo (TASK-5285635 LIVE_LOAD ~1.1h).</li>
              <li><strong className="text-[#f4f4f6]">Lorenzo Rodriguez:</strong> 2 tasks — DOCK52 (LIVE_LOAD ~1.1h) + DOCK54 (PRE_LOAD ~21.4h, since Jun 4 2:04 PM). DOCK54 significantly aging.</li>
              <li><strong className="text-[#f4f4f6]">Daniela Gonzalez:</strong> 2 tasks — DOCK62 (RECEIVE ~18.9h, since Jun 4 4:38 PM) + DOCK65 (RECEIVE ~44.3h, since Jun 3 3:12 PM).</li>
              <li><strong className="text-[#f4f4f6]">Daniel Beltran:</strong> 1 task — DOCK58 (LIVE_LOAD ~1h, LOAD-5028979, DN-3175802 + DN-3180188).</li>
              <li><strong className="text-[#f4f4f6]">Rufino Munguia:</strong> 1 task — DOCK68 (RECEIVE ~1.5h, RN-186441).</li>
              <li><strong className="text-[#ef4444]">AGING TASKS:</strong> TASK-5283625 (Daniela, DOCK65, ~44.3h, since Jun 3), TASK-5285010 (Lorenzo, DOCK54, ~21.4h, since Jun 4).</li>
              <li>All 8 active Bay 4 tasks are IN_PROGRESS. No NEW tasks on Bay 4.</li>
              <li>Schedule %: <strong className="text-[#71717a]">UNAVAILABLE</strong> — inbound schedule-summary API timed out; outbound returned 2,734 items but no received/loaded breakdown.</li>
              <li>Facility-wide open: <strong className="text-[#22c55e]">{facilityInboundOpen}</strong> inbound (42 IN_PROGRESS + 25 NEW), <strong className="text-[#7c3aed]">{facilityOutboundOpen}</strong> outbound (47 IN_PROGRESS + 20 NEW).</li>
              <li>All data sourced from live WISE/WMS queries at ~11:30 AM PDT, June 5, 2026.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2a] bg-[#0a0a0f] mt-2">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#71717a]">
          <span>Valley View Warehouse — Bay 4 Operations</span>
          <span>Last updated: June 5, 2026 ~11:30 AM PDT</span>
        </div>
      </footer>
    </div>
  );
}
