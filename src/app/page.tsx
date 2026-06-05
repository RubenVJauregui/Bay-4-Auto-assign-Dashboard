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
              DOCK50–DOCK72 &nbsp;|&nbsp; June 5, 2026 &nbsp;|&nbsp; ~1:30 PM PDT
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
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Live Out (GURUNANDA Outbound)</span>
                <span className="text-sm font-semibold text-[#7c3aed]">3 outbound tasks on Bay 4</span>
                <span className="text-xs text-[#a1a1aa]">
                  TASK-5285558 · DOCK53 · PRE_LOAD · ~4.0h · DN-3198181
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  TASK-5285835 · DOCK55 · LIVE_LOAD · just started · 28 pal · 3 DNs
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  TASK-5285860 · DOCK54 · PRE_LOAD · NEW · 29 pal · 4 DNs
                </span>
                <span className="text-xs text-[#71717a] mt-1">
                  All GURUNANDA (ORG-655875) · LOAD-5030114 Seal A120211 (DOCK53)
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Live In (GURUNANDA Receive)</span>
                <span className="text-sm font-semibold text-[#71717a]">— None (GURUNANDA) —</span>
                <span className="text-xs text-[#71717a]">
                  No active GURUNANDA receive tasks for Arnulfo on Bay 4.
                </span>
                <span className="text-xs text-[#a1a1aa] mt-2">
                  <span className="text-[#f59e0b]">Receives on Bay 4:</span> KARAKA only
                </span>
                <span className="text-xs text-[#71717a]">
                  TASK-5285485 · DOCK51 · RN-186139 · ~5.2h · 19 pal
                </span>
                <span className="text-xs text-[#71717a]">
                  TASK-5285778 · DOCK51 · RN-182888 · NEW
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Arnulfo&apos;s Bay 4 Summary</span>
                <span className="text-sm font-semibold text-[#22c55e]">5 tasks on Bay 4</span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#7c3aed]">OUT:</span> 3 GURUNANDA — DOCK53 · DOCK54 · DOCK55
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#f59e0b]">IN:</span> 2 KARAKA — DOCK51 (RN-186139 + RN-182888)
                </span>
                <span className="text-xs text-[#71717a] mt-1">
                  Previous TASK-5281747 (DOCK52) CLOSED ~10:06 AM today
                </span>
                <span className="text-xs text-[#ef4444]">
                  ⚠ DOCK54 double-booked with Lorenzo (TASK-5285010)
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
              <li><strong className="text-[#ef4444]">4 stale OCCUPIED doors</strong> — DOCK52, DOCK61, DOCK63, DOCK66 have entries but no active tasks. Door checkout needed.</li>
              <li><strong className="text-[#f59e0b]">7 stale RESERVED doors</strong> — DOCK60, DOCK64, DOCK68, DOCK69, DOCK70, DOCK71, DOCK72 assigned to entries but no active tasks.</li>
              <li><strong className="text-[#f59e0b]">⚠ 2 AVAILABLE doors with active tasks:</strong> DOCK51 (TASK-5285485 KARAKA ~5.2h + TASK-5285778 KARAKA NEW), DOCK65 (TASK-5252949 GURUNANDA + TASK-5254195 GURUNANDA). Dock status may be stale.</li>
              <li>Active tasks: <strong className="text-[#7c3aed]">5 outbound</strong> / <strong className="text-[#22c55e]">6 inbound</strong>. Mix: <strong className="text-[#f4f4f6]">45% / 55%</strong>.</li>
              <li>Outbound: DOCK50 (Rubi LIVE_LOAD NEW LA JOLLA GROUP 6 pal), DOCK53 (Arnulfo PRE_LOAD ~4.0h), DOCK54 (Lorenzo PRE_LOAD ~23.3h + Arnulfo PRE_LOAD NEW 29 pal), DOCK55 (Arnulfo LIVE_LOAD just started 28 pal).</li>
              <li>Inbound: DOCK51 (Arnulfo KARAKA x2), DOCK62 (Caren GURUNANDA NEW), DOCK65 (Caren + Rufino GURUNANDA NEW).</li>
              <li>Customer mix: <strong className="text-[#f4f4f6]">GURUNANDA</strong> (ORG-655875) on 8 of 11 active tasks. <strong className="text-[#f59e0b]">KARAKA</strong> (ORG-585450) on 2. <strong className="text-[#71717a]">LA JOLLA GROUP</strong> (ORG-313396) on 1.</li>
              <li><strong className="text-[#7c3aed]">ARNULFO MUNGUIA:</strong> 5 Bay 4 tasks — 3 GURUNANDA outbound (DOCK53 PRE_LOAD ~4.0h + DOCK54 PRE_LOAD NEW 29 pal + DOCK55 LIVE_LOAD just started 28 pal) + 2 KARAKA inbound (DOCK51 RN-186139 ~5.2h + RN-182888 NEW).</li>
              <li><strong className="text-[#ef4444]">⚠ DOCK54 DOUBLE-BOOKED:</strong> Lorenzo TASK-5285010 (IN_PROGRESS ~23.3h) + Arnulfo TASK-5285860 (NEW, 29 pal, 4 DNs).</li>
              <li>Previous GURUNANDA TASK-5281747 (DOCK52, DN-3190424, 28 pal) CLOSED at ~10:06 AM PDT today after ~71h. DOCK52 now stale occupied (entry ET-1104275 uncleared).</li>
              <li><strong className="text-[#f4f4f6]">Lorenzo Rodriguez:</strong> 1 task — DOCK54 (PRE_LOAD ~23.3h, since Jun 4 2:13 PM). His DOCK52 task TASK-5285635 CLOSED at 11:41 AM.</li>
              <li><strong className="text-[#f4f4f6]">Caren Cubides:</strong> 2 tasks — DOCK62 (RECEIVE NEW since Mar 2) + DOCK65 (RECEIVE NEW, 15 pal, since Apr 27).</li>
              <li><strong className="text-[#f4f4f6]">Rubi Manuel Sandoval:</strong> 1 task — DOCK50 (LIVE_LOAD NEW, LA JOLLA GROUP, 6 pal).</li>
              <li><strong className="text-[#f4f4f6]">Rufino Munguia:</strong> 1 task — DOCK65 (RECEIVE NEW, 7 pal, since Apr 28).</li>
              <li><strong className="text-[#f4f4f6]">daira gonzalez:</strong> 1 stale task — DOCK50 (RECEIVE IN_PROGRESS since Oct 2025, ~5,464h, likely orphaned data).</li>
              <li><strong className="text-[#ef4444]">AGING TASKS:</strong> TASK-5285010 (Lorenzo, DOCK54, ~23.3h, since Jun 4), TASK-5285485 (Arnulfo, DOCK51, ~5.2h). TASK-5090739 (daira, DOCK50, ~5,464h — stale).</li>
              <li>6 IN_PROGRESS, 5 NEW across Bay 4 active tasks.</li>
              <li>Schedule %: <strong className="text-[#71717a]">UNAVAILABLE</strong> — schedule-summary endpoints returned 404/405.</li>
              <li>Facility-wide open: <strong className="text-[#22c55e]">{facilityInboundOpen}</strong> inbound, <strong className="text-[#7c3aed]">{facilityOutboundOpen}</strong> outbound (132 total).</li>
              <li>Facility-wide today: 40 load tasks closed, 47 receipts created, 4,458 orders scheduled.</li>
              <li>All data sourced from live WISE/WMS queries at ~1:30 PM PDT, June 5, 2026.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2a] bg-[#0a0a0f] mt-2">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#71717a]">
          <span>Valley View Warehouse — Bay 4 Operations</span>
          <span>Last updated: June 5, 2026 ~1:30 PM PDT</span>
        </div>
      </footer>
    </div>
  );
}
