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
} from "@/lib/data";
import KpiCard from "@/components/KpiCard";
import DoorGrid from "@/components/DoorGrid";
import AssigneeSummaryList from "@/components/AssigneeSummary";
import OperationalMetrics from "@/components/OperationalMetrics";
import AssignmentHistory from "@/components/AssignmentHistory";

const ACCENT_CLASSES = [
  "text-[#ef4444]",
  "text-[#22c55e]",
  "text-[#f59e0b]",
  "text-[#7c3aed]",
];

const GAUGE_CLASSES = [
  "#ef4444",
  "#22c55e",
  "#f59e0b",
  "#7c3aed",
];

const occupied = doors.filter((d) => d.status === "Occupied").length;
const reserved = doors.filter((d) => d.status === "Reserved").length;
const available = doors.filter((d) => d.status === "Available").length;

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
              DOCK50–DOCK72 &nbsp;|&nbsp; June 15, 2026 &nbsp;|&nbsp; ~6:08 PM PDT
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
              23 doors &nbsp;|&nbsp; 14 occupied / 7 available / 2 anom.
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
                <span className="text-sm font-semibold text-[#71717a]">0 — No Active Tasks</span>
                <span className="text-xs text-[#71717a]">
                  No GURUNANDA outbound tasks for Arnulfo on Bay 4.
                </span>
                <span className="text-xs text-[#a1a1aa] mt-2">
                  DOCK53 load now assigned to DANIEL BELTRAN (TASK-5291922).
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  All prior Arnulfo outbound tasks CLOSED.
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Live In (GURUNANDA Receive)</span>
                <span className="text-sm font-semibold text-[#71717a]">0 — No Active Tasks</span>
                <span className="text-xs text-[#71717a]">
                  No GURUNANDA receive tasks for Arnulfo on Bay 4.
                </span>
                <span className="text-xs text-[#a1a1aa] mt-2">
                  WISE query returned 0 results for Arnulfo+Bay4+GURUNANDA.
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  All prior Arnulfo receive tasks CLOSED.
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Arnulfo&apos;s Bay 4 Summary</span>
                <span className="text-sm font-semibold text-[#71717a]">0 active tasks on Bay 4</span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#7c3aed]">OUT:</span> 0 GURUNANDA
                </span>
                <span className="text-xs text-[#a1a1aa]">
                  <span className="text-[#f59e0b]">IN:</span> 0 GURUNANDA
                </span>
                <span className="text-xs text-[#22c55e] mt-1">
                  ✓ All Bay 4 GURUNANDA tasks for Arnulfo CLOSED
                </span>
                <span className="text-xs text-[#71717a] mt-1">
                  Active Bay 4 GURUNANDA tasks now assigned to: Beltran, Rosales, Gonzalez, Rufino
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
              <li><strong className="text-[#f4f4f6]">14 Occupied / 0 Reserved / 7 Available</strong> — 60.9% occupancy (by WISE location spaceStatus). 6 of 14 occupied doors have active tasks.</li>
              <li>Active tasks: <strong className="text-[#7c3aed]">2 outbound</strong> / <strong className="text-[#22c55e]">4 inbound</strong>. Mix: <strong className="text-[#f4f4f6]">33% outbound / 67% inbound</strong>.</li>
              <li>Customer mix: 100% GURUNANDA, LLC (ORG-655875) — all 6 active tasks. DOCK70 also has SAGA (ORG-585450).</li>
              <li>4 assignees: RUFINO MUNGUIA (3), DANIEL BELTRAN (1), Renato Rosales (1), DANIEL GONZALEZ (1).</li>
              <li><strong className="text-[#7c3aed]">ARNULFO MUNGUIA:</strong> 0 active Bay 4 tasks — WISE returned 0 GURUNANDA tasks for Arnulfo on Bay 4 doors. All prior assignments CLOSED.</li>
              <li><strong className="text-[#ef4444]">⚠ DOCK65 ANOMALY:</strong> Location space EMPTY but TASK-5291946 (NEW, RN-5008070) is assigned to this door. Space may have been released without closing the task.</li>
              <li><strong className="text-[#ef4444]">⚠ DOCK66 ANOMALY:</strong> Location space EMPTY but TASK-5292030 (IN_PROGRESS ~3.3h, RN-186778) is assigned to this door.</li>
              <li><strong className="text-[#f59e0b]">⚠ 8 OCCUPIED DOORS with NO active tasks:</strong> DOCK50, 51, 55, 56, 57, 58, 60, 61, 67, 70 — these doors show OCCUPIED in WISE but have no linked active receive or load tasks.</li>
              <li><strong className="text-[#ef4444]">⚠ LOCATION API WORKING:</strong> Door occupancy status sourced from live WISE location spaceStatus queries — all 23 doors returned valid data.</li>
              <li><strong className="text-[#ef4444]">⚠ SCHEDULE UNAVAILABLE:</strong> BAM appointment endpoints returning SQL errors — % scheduled inbounds received and % outbounds loaded are not available in this pull.</li>
              <li><strong className="text-[#f4f4f6]">SHIFT from prior pull:</strong> Was 5 occupied, now 14 occupied (location API working vs previously broken). DOCK53 load task reassigned from Arnulfo to DANIEL BELTRAN. DOCK54 receive now active with DANIEL GONZALEZ.</li>
              <li>All data sourced from live WISE/WMS queries at ~6:08 PM PDT, June 15, 2026.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2a] bg-[#0a0a0f] mt-2">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#71717a]">
          <span>Valley View Warehouse — Bay 4 Operations</span>
          <span>Last updated: June 15, 2026 ~6:08 PM PDT</span>
        </div>
      </footer>
    </div>
  );
}
