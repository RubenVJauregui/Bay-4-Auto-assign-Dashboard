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
              DOCK50–DOCK72 &nbsp;|&nbsp; June 5, 2026 &nbsp;|&nbsp; ~10:30 AM PDT
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
                  GURUNANDA · DN-3198181 · PRE_LOAD · ~1h · IN_PROGRESS
                </span>
                <span className="text-xs text-[#71717a]">
                  Carrier ORG-34911 · Equipment 53169 · Freight COLLECT · LTL
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Live In (RECEIVE)</span>
                <span className="text-sm font-semibold text-[#71717a]">— None (GURUNANDA) —</span>
                <span className="text-xs text-[#71717a]">
                  No active GURUNANDA receive tasks for Arnulfo on Bay 4.
                </span>
                <span className="text-xs text-[#71717a]">
                  His Bay 4 receive is KARAKA TASK-5285485 (RN-186139, DOCK51).
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Arnulfo&apos;s Active Bay 4</span>
                <span className="text-sm font-semibold text-[#22c55e]">2 tasks on Bay 4</span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#7c3aed]">OUT:</span> TASK-5285558 · DOCK53 · GURUNANDA · DN-3198181
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#22c55e]">IN:</span> TASK-5285485 · DOCK51 · KARAKA · RN-186139 · ~2.3h
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
              <li><strong className="text-[#f4f4f6]">8 Occupied / 8 Reserved / 7 Available</strong> — 69.6% occupancy rate (occupied+reserved).</li>
              <li><strong className="text-[#ef4444]">5 stale OCCUPIED doors</strong> — DOCK61, DOCK63, DOCK66, DOCK67, DOCK70 have no active tasks. Dock checkout may be needed.</li>
              <li><strong className="text-[#f59e0b]">5 stale RESERVED doors</strong> — DOCK60, DOCK64, DOCK69, DOCK71, DOCK72 assigned but no active tasks.</li>
              <li><strong className="text-[#ef4444]">2 DOUBLE-BOOKED:</strong> DOCK53 (TASK-5285558 PRE_LOAD + TASK-5285635 LIVE_LOAD), DOCK62 (TASK-5285184 + TASK-5207670 RECEIVE).</li>
              <li><strong className="text-[#f59e0b]">3 AVAILABLE doors with tasks:</strong> DOCK50 (TASK-5090739, 227d), DOCK51 (TASK-5285485, ~2.3h), DOCK65 (3 tasks).</li>
              <li>Active tasks: <strong className="text-[#7c3aed]">5 outbound</strong> / <strong className="text-[#22c55e]">8 inbound</strong>. Mix: <strong className="text-[#22c55e]">61.5% inbound</strong> / <strong className="text-[#7c3aed]">38.5% outbound</strong>.</li>
              <li>Outbound: DOCK53 (Arnulfo PRE_LOAD ~1h + Jerome LIVE_LOAD NEW), DOCK54 (Lorenzo PRE_LOAD ~20.3h), DOCK55 (Daniel Beltran LIVE_LOAD ~0.3h), DOCK58 (Jerome LIVE_LOAD NEW).</li>
              <li>Inbound: DOCK51 (Arnulfo KARAKA RECEIVE ~2.3h), DOCK62 (Daniela + Caren RECEIVE), DOCK65 (Daniela + Rufino + Caren RECEIVE), DOCK68 (Rufino RECEIVE ~0.4h).</li>
              <li>Customer mix: <strong className="text-[#f4f4f6]">GURUNANDA</strong> (ORG-655875) on 11 of 13 active tasks. <strong className="text-[#f59e0b]">KARAKA</strong> (ORG-585450) on DOCK51.</li>
              <li><strong className="text-[#7c3aed]">ARNULFO MUNGUIA:</strong> 2 Bay 4 tasks — LIVE OUT TASK-5285558 (DOCK53, GURUNANDA DN-3198181, ~1h, carrier ORG-34911) + RECEIVE TASK-5285485 (DOCK51, KARAKA RN-186139, ~2.3h).</li>
              <li>Previous GURUNANDA TASK-5281747 (DOCK52, DN-3190424, 28 pal) CLOSED — carrier signed 6/4 16:14. DOCK52 now clean AVAILABLE.</li>
              <li>Jerome Aranda: <strong className="text-[#f4f4f6]">3 tasks</strong> — DOCK53 TASK-5285635 (LIVE_LOAD NEW) + DOCK58 TASK-5285646 (LIVE_LOAD NEW).</li>
              <li>Lorenzo Rodriguez: <strong className="text-[#f4f4f6]">1 task</strong> — DOCK54 TASK-5285010 (PRE_LOAD ~20.3h, since Jun 4 2:13 PM). Significantly aging.</li>
              <li><strong className="text-[#ef4444]">AGING TASKS:</strong> TASK-5090739 (daira gonzalez, 227d), TASK-5207670 (Caren Cubides, 95d), TASK-5252949 (Caren Cubides, 39d), TASK-5254195 (Rufino Munguia, 38d).</li>
              <li>Schedule %: <strong className="text-[#71717a]">UNAVAILABLE</strong> — no schedule-summary API endpoint found (404/500 on all paths).</li>
              <li>Facility-wide open: <strong className="text-[#22c55e]">{facilityInboundOpen}</strong> inbound (26 NEW + 42 IN_PROGRESS), <strong className="text-[#7c3aed]">{facilityOutboundOpen}</strong> outbound (22 NEW + 43 IN_PROGRESS).</li>
              <li>All data sourced from live WISE/WMS queries at ~10:30 AM PDT, June 5, 2026.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2a] bg-[#0a0a0f] mt-2">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#71717a]">
          <span>Valley View Warehouse — Bay 4 Operations</span>
          <span>Last updated: June 5, 2026 ~10:30 AM PDT</span>
        </div>
      </footer>
    </div>
  );
}
