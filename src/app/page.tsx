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
              DOCK50–DOCK72 &nbsp;|&nbsp; June 5, 2026 &nbsp;|&nbsp; ~04:30 PDT
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
              Assignment History Today
            </h2>
            <span className="text-xs text-[#71717a] ml-auto">
              {assignments.length} receive lines
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
                  TASK-5281747 concluded since last pull
                </span>
                <span className="text-xs text-[#22c55e] font-medium">
                  ✓ LOADED — carrier signed 6/4 16:14 PDT
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Live In (RECEIVE)</span>
                <span className="text-sm font-semibold text-[#71717a]">— None —</span>
                <span className="text-xs text-[#71717a]">
                  No active Bay 4 receive tasks for Arnulfo
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Arnulfo&apos;s Current Tasks</span>
                <span className="text-xs text-[#a1a1aa]">
                  DOCK37: TASK-5285037 · KARAKA · RN-184451 · NEW ~14.1h
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  DOCK18: TASK-5280508 · KARAKA · RN-184917 · IN_PROGRESS ~90.5h · Bay 3
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
              <li><strong className="text-[#f4f4f6]">5 Occupied / 0 Reserved / 18 Available</strong> — 21.7% occupancy rate. All previously Occupied outbound doors (DOCK52–DOCK54) cleared.</li>
              <li>Active tasks: <strong className="text-[#22c55e]">9 inbound</strong> (RECEIVE) / <strong className="text-[#71717a]">0 outbound</strong>. Mix: <strong className="text-[#22c55e]">100% inbound</strong> — Bay 4 is now exclusively inbound receiving.</li>
              <li><strong className="text-[#ef4444]">CRITICAL — All outbound/PRE_LOAD tasks concluded.</strong> TASK-5281747 (Arnulfo, DOCK52), TASK-5284794 (Lorenzo, DOCK53), TASK-5285010 (Lorenzo, DOCK54), TASK-5280242 (Luis Velazquez, DOCK53) all closed since prior pull.</li>
              <li>Customer mix: <strong className="text-[#f4f4f6]">GURUNANDA</strong> (ORG-655875) on 8 of 9 tasks. <strong className="text-[#f59e0b]">KARAKA</strong> (ORG-585450) on DOCK55 (TASK-5284151, RN-186139).</li>
              <li>Arnulfo Munguia: <strong className="text-[#ef4444]">ZERO active Bay 4 tasks.</strong> His current tasks are on DOCK37 (TASK-5285037, KARAKA, NEW ~14.1h) and DOCK18 (TASK-5280508, KARAKA, IN_PROGRESS ~90.5h, Bay 3).</li>
              <li>Daniela Gonzalez: <strong className="text-[#f4f4f6]">4 RECEIVE tasks</strong> — DOCK62 (TASK-5285184 ~11.9h + TASK-5207670 ~2,274h), DOCK63 (TASK-5278242 ~180.7h + TASK-5277747 ~202.7h), DOCK65 (TASK-5283625 ~31.9h).</li>
              <li>Caren Cubides: <strong className="text-[#f4f4f6]">2 RECEIVE tasks</strong> — DOCK62 (TASK-5207670, NEW ~2,274h) + DOCK65 (TASK-5252949, NEW ~932h). Both severely aged.</li>
              <li>Jerome Aranda: <strong className="text-[#f4f4f6]">1 RECEIVE task</strong> — DOCK55 (TASK-5284151, KARAKA, RN-186139, NEW ~19.8h).</li>
              <li>daira gonzalez: <strong className="text-[#f4f4f6]">1 RECEIVE task</strong> — DOCK50 (TASK-5090739, ~5,439h, IN_PROGRESS). <strong className="text-[#ef4444]">AGED 227 days (since Oct 2025)</strong>.</li>
              <li>Rufino Munguia: <strong className="text-[#f4f4f6]">1 RECEIVE task</strong> — DOCK65 (TASK-5254195, NEW ~906h). AGED 38 days (since Apr 28).</li>
              <li><strong className="text-[#ef4444]">AGING ALERT:</strong> 4 tasks exceed 30 days: TASK-5090739 (227d), TASK-5207670 (95d), TASK-5252949 (39d), TASK-5254195 (38d). These may be abandoned/stuck and need supervisor review.</li>
              <li>DOCK50 newly Occupied — TASK-5090739 (Oct 2025, GURUNANDA) was previously not appearing in Bay 4 door queries.</li>
              <li>No Reserved doors. No double-booked doors. 18 of 23 doors (78%) available — significant inbound receiving capacity.</li>
              <li>% scheduled inbounds/outbounds: <strong className="text-[#f59e0b]">UNAVAILABLE</strong> — schedule-summary endpoints returned 404/timeout on this pull.</li>
              <li>Facility-wide open counts: <strong className="text-[#f4f4f6]">{facilityInboundOpen}</strong> inbound receive tasks, <strong className="text-[#f4f4f6]">{facilityOutboundOpen}</strong> outbound load tasks.</li>
              <li>All data sourced from live WISE/WMS queries at ~04:30 PDT, June 5, 2026.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2a] bg-[#0a0a0f] mt-2">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#71717a]">
          <span>Valley View Warehouse — Bay 4 Operations</span>
          <span>Last updated: June 5, 2026 ~04:30 PDT</span>
        </div>
      </footer>
    </div>
  );
}
