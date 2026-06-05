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
              DOCK50–DOCK72 &nbsp;|&nbsp; June 4, 2026 &nbsp;|&nbsp; ~21:30 PDT
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
              <li><strong className="text-[#f4f4f6]">10 Occupied / 1 Reserved / 12 Available</strong> — total 11/23 doors occupied+reserved (47.8%).</li>
              <li>Active tasks: <strong className="text-[#7c3aed]">4 outbound</strong> (PRE_LOAD) / <strong className="text-[#22c55e]">11 inbound</strong> (RECEIVE) — 27% outbound / 73% inbound.</li>
              <li>Dominant customer: <strong className="text-[#f4f4f6]">GURUNANDA</strong> (ORG-655875) on 14 of 15 active tasks. <strong className="text-[#f4f4f6]">KARAKA</strong> (ORG-585450) on DOCK55.</li>
              <li>Arnulfo Munguia: <strong className="text-[#f4f4f6]">TASK-5281747</strong> on DOCK52, PRE_LOAD ~2.5d, DN-3190424 28 pal (LOADED + carrier signed 6/4 09:14). No live receive for Arnulfo in Bay 4.</li>
              <li>Lorenzo Rodriguez: 2 PRE_LOAD tasks — DOCK53 (TASK-5284794, 8 loads LOADED, ~9.7h) + DOCK54 (TASK-5285010, 2 loads, ~7.6h).</li>
              <li>Daniela Gonzalez: <strong className="text-[#f4f4f6]">6 RECEIVE tasks</strong> — DOCK62 (TASK-5285184 ~5h), DOCK63 (TASK-5285210 ~2.5h + TASK-5278242 ~7.5d + TASK-5277747 ~8.3d), DOCK64 (TASK-5285211 ~2.4h), DOCK65 (TASK-5283625 ~30.4h).</li>
              <li>carolina ruiz: <strong className="text-[#f4f4f6]">TASK-5280242</strong> on DOCK53, PRE_LOAD ~3.5d, DN-3189539 26 pal. Previously attributed to Luis Velazquez.</li>
              <li>Jerome Aranda: 1 RECEIVE task — DOCK55 (TASK-5284151, KARAKA RN-186139, NEW ~12.9h).</li>
              <li>New assignees this pull: <strong className="text-[#f4f4f6]">daira gonzalez</strong> (DOCK50, TASK-5090739 ~227d), <strong className="text-[#f4f4f6]">Caren Cubides</strong> (DOCK62 + DOCK65, 2 tasks), <strong className="text-[#f4f4f6]">Edgar Flores</strong> (DOCK65, 1 task).</li>
              <li>DOCK50 now Occupied — TASK-5090739 (GURUNANDA RN-5002143, ~227d, severely aged).</li>
              <li>DOCK66 physically occupied (dockStatus=OCCUPIED) but no active task found.</li>
              <li>DOCK61 returned to Available (entry ET-1103945 cleared). Reserved doors dropped from 6→1.</li>
              <li>Facility-wide open counts: <strong className="text-[#f4f4f6]">63</strong> inbound receive tasks, <strong className="text-[#f4f4f6]">47</strong> outbound load tasks.</li>
              <li>% scheduled inbounds received / outbounds loaded: <strong className="text-[#f4f4f6]">UNAVAILABLE</strong> — schedule-summary API not accessible.</li>
              <li>"Guru live out / in assign to Arnulfo" activity: <strong className="text-[#f4f4f6]">TASK-5281747</strong> (Arnulfo, DOCK52, GURUNANDA PRE_LOAD ~2.5d). No "live in" receive for Arnulfo in Bay 4.</li>
              <li>All 12 loads across 4 load tasks show LOADED but all 4 load tasks remain IN_PROGRESS.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2a] bg-[#0a0a0f] mt-2">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#71717a]">
          <span>Valley View Warehouse — Bay 4 Operations</span>
          <span>Last updated: June 4, 2026 ~21:30 PDT</span>
        </div>
      </footer>
    </div>
  );
}
