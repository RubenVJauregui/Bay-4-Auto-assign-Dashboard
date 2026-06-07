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
              DOCK50–DOCK72 &nbsp;|&nbsp; June 7, 2026 &nbsp;|&nbsp; ~4:00 PM PDT
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
                  TASK-5285558 · DOCK53 · LOAD · ~1d 23h · DN-3198181
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  TASK-5285913 · DOCK53 · LOAD · ~1d 16h · DN-3203261 +1
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  TASK-5285860 · DOCK54 · LOAD · NEW · 4 DNs
                </span>
                <span className="text-xs text-[#71717a] mt-1">
                  All GURUNANDA (ORG-655875) · DOCK53/DOCK54 · 2 IN_PROGRESS · 1 NEW
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Live In (GURUNANDA Receive)</span>
                <span className="text-sm font-semibold text-[#71717a]">— None (GURUNANDA) —</span>
                <span className="text-xs text-[#71717a]">
                  No active GURUNANDA receive tasks for Arnulfo on Bay 4.
                </span>
                <span className="text-xs text-[#71717a] mt-2">
                  Arnulfo has 1 KARAKA receive task on DOCK51:
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  TASK-5285778 · NEW · RN-182888 (IRO)
                </span>
                <span className="text-xs text-[#71717a] mt-1">
                  Previous TASK-5285485 (KARAKA RN-186139) — CLOSED
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Arnulfo&apos;s Bay 4 Summary</span>
                <span className="text-sm font-semibold text-[#22c55e]">4 tasks on Bay 4</span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#7c3aed]">OUT:</span> 3 GURUNANDA — DOCK53 · DOCK54
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#f59e0b]">IN:</span> 1 KARAKA — DOCK51
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#f59e0b]">IN (GURU):</span> None on Bay 4
                </span>
                <span className="text-xs text-[#71717a] mt-1">
                  Previous TASK-5285835 (DOCK55, Dollar Tree) CLOSED Jun 5
                </span>
                <span className="text-xs text-[#ef4444]">
                  ⚠ DOCK54 double-booked with Lorenzo (TASK-5285010 ~2d 18h)
                </span>
                <span className="text-xs text-[#ef4444]">
                  ⚠ DOCK53 double-booked (TASK-5285558 + TASK-5285913)
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
              <li><strong className="text-[#f4f4f6]">8 Occupied / 15 Reserved / 0 Available</strong> — 34.8% occupied, 100% occupancy rate (incl. reserved). 6 doors with active tasks + 2 ghost-occupied (DOCK52, DOCK66).</li>
              <li>Active tasks: <strong className="text-[#7c3aed]">4 outbound</strong> / <strong className="text-[#22c55e]">5 inbound</strong>. Mix: <strong className="text-[#f4f4f6]">44% outbound / 56% inbound</strong>.</li>
              <li>Customer mix: GURUNANDA (ORG-655875) on 8 of 9 tasks, KARAKA LLC (ORG-585450) on 1.</li>
              <li>3 tasks IN_PROGRESS, 6 NEW. DOCK53, DOCK54, and DOCK65 are double-booked.</li>
              <li>YMS: 4 OCCUPIED (DOCK52/53/54/66), 19 ASSIGNED, 0 AVAILABLE. Many ASSIGNED doors have entry tickets in GATE_CHECK_OUT — docks held in reserved state.</li>
              <li><strong className="text-[#7c3aed]">ARNULFO MUNGUIA:</strong> 4 Bay 4 tasks — 3 outbound (DOCK53×2, DOCK54) + 1 inbound (DOCK51 KARAKA).</li>
              <li><strong className="text-[#7c3aed]">GURU LIVE OUT:</strong> TASK-5285558 (DOCK53, IN_PROGRESS ~1d 23h, DN-3198181), TASK-5285913 (DOCK53, IN_PROGRESS ~1d 16h, DN-3203261+1), TASK-5285860 (DOCK54, NEW, 4 DNs).</li>
              <li><strong className="text-[#f59e0b]">GURU LIVE IN:</strong> None — no GURUNANDA receive tasks for Arnulfo on Bay 4. 1 KARAKA receive (TASK-5285778, DOCK51, NEW).</li>
              <li><strong className="text-[#ef4444]">⚠ DOCK54 DOUBLE-BOOKED:</strong> Lorenzo TASK-5285010 (IN_PROGRESS ~2d 18h, since Jun 4) + Arnulfo TASK-5285860 (NEW, 4 DNs).</li>
              <li><strong className="text-[#ef4444]">⚠ DOCK53 DOUBLE-BOOKED:</strong> Arnulfo TASK-5285558 (~1d 23h) + TASK-5285913 (~1d 16h).</li>
              <li><strong className="text-[#ef4444]">⚠ DOCK65 DOUBLE-BOOKED:</strong> Rufino TASK-5254195 (NEW ~40d) + Caren TASK-5252949 (NEW ~40d, RETURNED).</li>
              <li><strong className="text-[#ef4444]">⚠ AGING:</strong> TASK-5285010 (Lorenzo, DOCK54, ~2d 18h). TASK-5090739 (daira gonzalez, DOCK50, ~228d since Oct 2025). TASK-5254195 (~40d) — stale RECEIVE on DOCK65. TASK-5207670 (~97d, Caren, DOCK62). TASK-5252949 (~40d, Caren, DOCK65).</li>
              <li><strong className="text-[#ef4444]">⚠ TASK-5252949 RETURNED:</strong> Caren Cubides DOCK65 task (RN-183707, ~40d) was resolved in prior pulls — now active again.</li>
              <li><strong className="text-[#ef4444]">⚠ DOCK52 GHOST:</strong> YMS OCCUPIED with ET-1104275 (TRAILER 53160) but zero active load/receive tasks.</li>
              <li><strong className="text-[#ef4444]">⚠ DOCK66 GHOST:</strong> YMS OCCUPIED but no entry ticket and no active tasks.</li>
              <li><strong className="text-[#f4f4f6]">MAJOR SHIFT:</strong> 0 Available doors (was 12 at ~5:00 AM). All 15 ASSIGNED doors now Reserved — 100% of Bay 4 doors are booked.</li>
              <li><strong className="text-[#f4f4f6]">Key changes since ~5:00 AM June 7:</strong> TASK-5252949 RETURNED. Caren 1→2 tasks. Mix 50/50 → 44/56. 12→0 Available. All 15 YMS ASSIGNED doors now Reserved. Durations aged ~10h.</li>
              <li>Schedule: <strong className="text-[#22c55e]">AVAILABLE</strong> — 66.5% inbounds received (10,192/15,318), <strong className="text-[#7c3aed]">95.8%</strong> outbounds loaded (702,396/732,922).</li>
              <li>Facility-wide open: <strong className="text-[#f59e0b]">47</strong> inbound + <strong className="text-[#7c3aed]">50</strong> outbound = <strong className="text-[#f4f4f6]">97</strong> total active tasks.</li>
              <li>All data sourced from live WISE/WMS/YMS queries at ~4:00 PM PDT, June 7, 2026.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2a] bg-[#0a0a0f] mt-2">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#71717a]">
          <span>Valley View Warehouse — Bay 4 Operations</span>
          <span>Last updated: June 7, 2026 ~4:00 PM PDT</span>
        </div>
      </footer>
    </div>
  );
}
