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
              DOCK50–DOCK72 &nbsp;|&nbsp; June 5, 2026 &nbsp;|&nbsp; ~8:36 PM PDT
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
              23 doors &nbsp;|&nbsp; {occupied} occupied / {reserved} assigned
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
                  TASK-5285558 · DOCK53 · LOAD · ~11.1h · DN-3198181
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  TASK-5285913 · DOCK53 · LOAD · ~4.4h · DN-3203261 +1
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  TASK-5285860 · DOCK54 · LOAD · NEW · 4 DNs
                </span>
                <span className="text-xs text-[#71717a] mt-1">
                  All GURUNANDA (ORG-655875) · DOCK53/DOCK54
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
                  Previous TASK-5285485 (KARAKA RN-186139) — no longer active
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
                  Previous TASK-5285835 (DOCK55) CLOSED ~2:38 PM today
                </span>
                <span className="text-xs text-[#ef4444]">
                  ⚠ DOCK54 double-booked with Lorenzo (TASK-5285010 ~30.4h)
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
              <li><strong className="text-[#f4f4f6]">9 Occupied / 8 Assigned / 6 Available</strong> — 39.1% occupied, 73.9% occupancy rate (incl. assigned). 6 doors with active tasks + 3 ghost-occupied (DOCK52, DOCK61, DOCK66).</li>
              <li>Active tasks: <strong className="text-[#7c3aed]">4 outbound</strong> / <strong className="text-[#22c55e]">5 inbound</strong>. Mix: <strong className="text-[#f4f4f6]">44% outbound / 56% inbound</strong>.</li>
              <li>Customer mix: GURUNANDA (ORG-655875) on 7 of 9 tasks, KARAKA LLC (ORG-585450) on 1, plus 1 ghost.</li>
              <li>4 tasks IN_PROGRESS, 5 NEW. DOCK54 and DOCK53 are double-booked.</li>
              <li><strong className="text-[#7c3aed]">ARNULFO MUNGUIA:</strong> 4 Bay 4 tasks — 3 outbound (DOCK53×2, DOCK54) + 1 inbound (DOCK51 KARAKA).</li>
              <li><strong className="text-[#7c3aed]">GURU LIVE OUT:</strong> TASK-5285558 (DOCK53, ~11.1h, DN-3198181), TASK-5285913 (DOCK53, ~4.4h, DN-3203261+1), TASK-5285860 (DOCK54, NEW, 4 DNs).</li>
              <li><strong className="text-[#f59e0b]">GURU LIVE IN:</strong> None — no GURUNANDA receive tasks for Arnulfo on Bay 4. 1 KARAKA receive (TASK-5285778, DOCK51).</li>
              <li><strong className="text-[#ef4444]">⚠ DOCK54 DOUBLE-BOOKED:</strong> Lorenzo TASK-5285010 (~30.4h, since Jun 4) + Arnulfo TASK-5285860 (NEW, 4 DNs).</li>
              <li><strong className="text-[#ef4444]">⚠ DOCK53 DOUBLE-BOOKED:</strong> Arnulfo TASK-5285558 (~11.1h) + TASK-5285913 (~4.4h).</li>
              <li><strong className="text-[#ef4444]">⚠ AGING:</strong> TASK-5285010 (Lorenzo, DOCK54, ~30.4h). TASK-5090739 (daira gonzalez, DOCK50, ~227d since Oct 2025). TASK-5254195 (~39 days), TASK-5252949 (~39 days) — stale RECEIVE on DOCK65.</li>
              <li><strong className="text-[#ef4444]">⚠ DOCK52, DOCK61 & DOCK66 ghost-occupied:</strong> dockStatus=OCCUPIED but zero active tasks. DOCK61 newly ghost-occupied.</li>
              <li><strong className="text-[#f4f4f6]">Daniel Beltran:</strong> Off Bay 4 — TASK-5285880 (DOCK70, TikTok FBT) CLOSED ~3:04 PM PDT today.</li>
              <li><strong className="text-[#f4f4f6]">Lorenzo Rodriguez:</strong> 1 task — DOCK54 (LOAD ~30.4h, both DN loads LOADED, likely needs closing).</li>
              <li><strong className="text-[#f4f4f6]">daira gonzalez:</strong> 1 task — DOCK50 (RN-5002143, critically stale at ~227d since Oct 2025).</li>
              <li>DOCK55 returned to Available (TASK-5285835 Dollar Tree CLOSED ~2:38 PM).</li>
              <li>DOCK70 now Assigned (TASK-5285880 TikTok FBT CLOSED ~3:04 PM).</li>
              <li>WISE door statuses now show &quot;ASSIGNED&quot; (previously &quot;Reserved&quot;) for 8 doors.</li>
              <li>Schedule %: <strong className="text-[#71717a]">UNAVAILABLE</strong> — schedule-summary endpoint returned HTTP 500.</li>
              <li>Facility-wide: <strong className="text-[#22c55e]">{facilityInboundOpen}</strong> inbound open = <strong className="text-[#7c3aed]">{facilityOutboundOpen}</strong> outbound open — perfect parity at 52/52.</li>
              <li>All data sourced from live WISE/WMS queries at ~8:36 PM PDT, June 5, 2026.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2a] bg-[#0a0a0f] mt-2">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#71717a]">
          <span>Valley View Warehouse — Bay 4 Operations</span>
          <span>Last updated: June 5, 2026 ~8:36 PM PDT</span>
        </div>
      </footer>
    </div>
  );
}
