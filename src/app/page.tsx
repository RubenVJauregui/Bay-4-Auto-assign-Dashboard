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
              DOCK50–DOCK72 &nbsp;|&nbsp; June 5, 2026 &nbsp;|&nbsp; ~2:00 PM PDT
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
                  TASK-5285558 · DOCK53 · PRE_LOAD · ~5.0h · DN-3198181
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  TASK-5285835 · DOCK55 · LIVE_LOAD · ~0.8h · 28 pal · 3 DNs
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
                <span className="text-xs text-[#71717a] mt-2">
                  No active receive tasks on any Bay 4 door.
                </span>
                <span className="text-xs text-[#71717a]">
                  Previous KARAKA receives TASK-5285485 / TASK-5285778 (DOCK51) now closed.
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Arnulfo&apos;s Bay 4 Summary</span>
                <span className="text-sm font-semibold text-[#22c55e]">3 tasks on Bay 4</span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#7c3aed]">OUT:</span> 3 GURUNANDA — DOCK53 · DOCK54 · DOCK55
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#f59e0b]">IN:</span> None on Bay 4
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
              <li><strong className="text-[#f4f4f6]">5 Occupied / 0 Reserved / 18 Available</strong> — 21.7% occupancy rate. All 5 occupied doors have active load tasks.</li>
              <li>Active tasks: <strong className="text-[#7c3aed]">6 outbound</strong> / <strong className="text-[#22c55e]">0 inbound</strong>. Mix: <strong className="text-[#f4f4f6]">100% outbound</strong>.</li>
              <li>All 5 occupied doors are GURUNANDA (ORG-655875) except DOCK58 (LA JOLLA GROUP, ORG-313396).</li>
              <li>4 tasks IN_PROGRESS (TASK-5285558, TASK-5285010, TASK-5285835, TASK-5285812), 2 NEW (TASK-5285860, TASK-5285880).</li>
              <li><strong className="text-[#7c3aed]">ARNULFO MUNGUIA:</strong> 3 Bay 4 tasks — all GURUNANDA outbound: DOCK53 (PRE_LOAD ~5.0h, DN-3198181), DOCK54 (PRE_LOAD NEW, 29 pal, 4 DNs), DOCK55 (LIVE_LOAD ~0.8h, 28 pal, 3 DNs).</li>
              <li><strong className="text-[#ef4444]">⚠ DOCK54 DOUBLE-BOOKED:</strong> Lorenzo TASK-5285010 (IN_PROGRESS ~24.0h, since Jun 4 2:04 PM) + Arnulfo TASK-5285860 (NEW, 29 pal, 4 DNs).</li>
              <li><strong className="text-[#f4f4f6]">Lorenzo Rodriguez:</strong> 1 task — DOCK54 (PRE_LOAD ~24.0h). TASK-5285635 (DOCK52) CLOSED at 11:41 AM.</li>
              <li><strong className="text-[#f4f4f6]">Sebastian Gonzalez:</strong> 1 task — DOCK58 (LIVE_LOAD ~1.2h, LA JOLLA GROUP, DN-3202378, 6 pal).</li>
              <li><strong className="text-[#f4f4f6]">Jerome Aranda:</strong> 1 task — DOCK67 (LIVE_LOAD NEW, GURUNANDA, DN-3190330).</li>
              <li><strong className="text-[#ef4444]">AGING:</strong> TASK-5285010 (Lorenzo, DOCK54, ~24.0h, since Jun 4 2:04 PM).</li>
              <li>Previous TASK-5281747 (Guru, DOCK52, DN-3190424, 28 pal) CLOSED at ~10:06 AM PDT after ~71h active.</li>
              <li>Many previously occupied/reserved doors now AVAILABLE after entry checkouts and task closures (was 8 Occupied / 8 Reserved earlier today).</li>
              <li>No active receive tasks on any Bay 4 door. DOCK62 receive (ET-1103926, TASK-5285184) FORCE_CLOSED. DOCK68 receive (ET-1104218, TASK-5285614) CLOSED.</li>
              <li>Schedule %: <strong className="text-[#71717a]">UNAVAILABLE</strong> — schedule-summary endpoints returned 404.</li>
              <li>Facility-wide open: <strong className="text-[#22c55e]">{facilityInboundOpen}</strong> inbound (offloading), <strong className="text-[#7c3aed]">{facilityOutboundOpen}</strong> outbound (46 IN_PROGRESS + 25 NEW).</li>
              <li>Facility-wide today: 40 load tasks closed, 47 receipts created, 4,458 orders scheduled. 13,698 closed load tasks total.</li>
              <li>All data sourced from live WISE/WMS queries at ~2:00 PM PDT, June 5, 2026.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2a] bg-[#0a0a0f] mt-2">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#71717a]">
          <span>Valley View Warehouse — Bay 4 Operations</span>
          <span>Last updated: June 5, 2026 ~2:00 PM PDT</span>
        </div>
      </footer>
    </div>
  );
}
