import {
  doors,
  kpiMetrics,
  assigneeSummaries,
  inboundOutboundMix,
  facilityInboundOpen,
  facilityOutboundOpen,
  assignments,
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
              DOCK50–DOCK72 &nbsp;|&nbsp; June 4, 2026 &nbsp;|&nbsp; ~20:00 PDT
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
            inboundOpen={facilityInboundOpen}
            outboundOpen={facilityOutboundOpen}
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
              {assignments.length} load lines
            </span>
          </div>
          <AssignmentHistory assignments={assignments} />
        </section>

        {/* ── Data Notes ── */}
        <section>
          <div className="bg-[#141419] border border-[#1e1e2a] rounded-xl p-5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
              Data Notes
            </span>
            <ul className="text-xs text-[#71717a] space-y-1 list-disc list-inside">
              <li><strong className="text-[#f4f4f6]">9 Occupied / 6 Reserved / 8 Available</strong> — total 15/23 doors occupied+reserved (65.2%).</li>
              <li>Active tasks: <strong className="text-[#7c3aed]">3 outbound</strong> (PRE_LOAD) / <strong className="text-[#22c55e]">5 inbound</strong> (RECEIVE) — 37.5% outbound / 62.5% inbound.</li>
              <li>Dominant customer: <strong className="text-[#f4f4f6]">GURUNANDA</strong> (ORG-655875) on 7 of 8 active tasks. New: <strong className="text-[#f4f4f6]">KARAKA</strong> on DOCK55.</li>
              <li>Arnulfo Munguia: <strong className="text-[#f4f4f6]">TASK-5281747</strong> on DOCK52, PRE_LOAD ~51h, DN-3190424 (LOADED + carrier signed 6/4 16:14). No live receive tasks for Arnulfo in Bay 4.</li>
              <li>Lorenzo Rodriguez: 2 PRE_LOAD tasks — DOCK53 (TASK-5284794, 8 loads LOADED, ~1h) + DOCK54 (TASK-5285010, 2 loads LOADED, ~1.5h).</li>
              <li>Daniela Gonzalez: <strong className="text-[#f4f4f6]">4 RECEIVE tasks</strong> — DOCK62 (TASK-5285184 ~20h), DOCK63 (TASK-5285210 ~0.7h), DOCK64 (TASK-5285211 NEW), DOCK65 (TASK-5283625 ~16h).</li>
              <li>Jerome Aranda: 1 RECEIVE task — DOCK55 (TASK-5284151, KARAKA RN-186139).</li>
              <li>Luis Velazquez TASK-5280242 (~75h) <strong className="text-[#f4f4f6]">no longer active</strong> on DOCK53.</li>
              <li>DOCK58 (Daniela Live Unload TASK-5285185) concluded → now Available.</li>
              <li>DOCK50 released from Reserved → now Available.</li>
              <li>DOCK61 marked Occupied (entryId ET-1103945) but no active task found.</li>
              <li>Facility-wide open counts: <strong className="text-[#f4f4f6]">2,204</strong> inbound line-items, <strong className="text-[#f4f4f6]">3,630</strong> outbound line-items.</li>
              <li>% scheduled inbounds received / outbounds loaded: <strong className="text-[#f4f4f6]">UNAVAILABLE</strong> — schedule-summary API returned 500 error.</li>
              <li>"Guru live out / in assign to Arnulfo" activity: <strong className="text-[#f4f4f6]">TASK-5281747</strong> (Arnulfo, DOCK52, GURUNANDA PRE_LOAD). No "live in" receive for Arnulfo in Bay 4.</li>
              <li>Piece counts are pallet counts from load-task API; receive piece counts not available.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2a] bg-[#0a0a0f] mt-2">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#71717a]">
          <span>Valley View Warehouse — Bay 4 Operations</span>
          <span>Last updated: June 4, 2026 ~20:00 PDT</span>
        </div>
      </footer>
    </div>
  );
}
