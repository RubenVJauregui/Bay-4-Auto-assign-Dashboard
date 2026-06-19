import type { GrazaDispatchData } from "@/lib/data";

interface GrazaDispatchSummaryProps {
  data: GrazaDispatchData;
}

const STATUS_COLORS: Record<string, string> = {
  RELEASED: "#22c55e",
  IN_PROGRESS: "#7c3aed",
  COMPLETED: "#f59e0b",
  NEW: "#f59e0b",
};

const METHOD_COLORS: Record<string, string> = {
  WAVE_PICK_BY_ITEM: "#7c3aed",
  BATCH_ORDER_PICK: "#22c55e",
};

export default function GrazaDispatchSummary({ data }: GrazaDispatchSummaryProps) {
  const { runInfo, plans, labelNoteOrders, exceptions, summary } = data;

  return (
    <div className="flex flex-col gap-4">
      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Orders */}
        <div className="bg-[#141419] border border-[#1e1e2a] rounded-xl p-4 flex flex-col gap-1">
          <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Total Orders</span>
          <span className="text-2xl font-bold text-[#f4f4f6] tabular-nums">{summary.totalOrdersCovered}</span>
          <span className="text-xs text-[#71717a]">Coverage: {summary.coveragePct}%</span>
        </div>
        {/* Plans */}
        <div className="bg-[#141419] border border-[#1e1e2a] rounded-xl p-4 flex flex-col gap-1">
          <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Plans</span>
          <span className="text-2xl font-bold text-[#7c3aed] tabular-nums">{summary.totalPlans}</span>
          <span className="text-xs text-[#71717a]">{summary.wavePlans} wave / {summary.batchPlans} batch / {summary.labelNotePlans} label-note</span>
        </div>
        {/* Status */}
        <div className="bg-[#141419] border border-[#1e1e2a] rounded-xl p-4 flex flex-col gap-1">
          <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Status</span>
          <span className="text-2xl font-bold text-[#22c55e] tabular-nums">{summary.released}</span>
          <span className="text-xs text-[#71717a]">
            <span className="text-[#22c55e]">{summary.released} released</span> / <span className="text-[#7c3aed]">{summary.inProgress} in progress</span>
          </span>
        </div>
        {/* Failures */}
        <div className="bg-[#141419] border border-[#1e1e2a] rounded-xl p-4 flex flex-col gap-1">
          <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Failures</span>
          <span className={`text-2xl font-bold tabular-nums ${summary.failures > 0 ? "text-[#ef4444]" : "text-[#22c55e]"}`}>{summary.failures}</span>
          <span className="text-xs text-[#71717a]">{summary.stuckPlans} stuck / {summary.unassignedTasks} unassigned</span>
        </div>
        {/* Exceptions */}
        <div className="bg-[#141419] border border-[#1e1e2a] rounded-xl p-4 flex flex-col gap-1">
          <span className="text-[10px] text-[#71717a] uppercase tracking-wider">Exceptions</span>
          <span className={`text-2xl font-bold tabular-nums ${summary.exceptions > 0 ? "text-[#f59e0b]" : "text-[#22c55e]"}`}>{summary.exceptions}</span>
          <span className="text-xs text-[#71717a]">Not dispatchable</span>
        </div>
      </div>

      {/* ── Plans Table ── */}
      <div className="bg-[#141419] border border-[#1e1e2a] rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-[#0a0a0f] border-b border-[#1e1e2a] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
            Plan Details — {runInfo.assignee}
          </span>
          <span className="text-xs text-[#71717a]">{summary.totalPlans} plans · {summary.totalTasks} tasks</span>
        </div>
        {/* Header */}
        <div className="grid grid-cols-[140px_140px_90px_180px_60px] gap-4 px-5 py-2.5 bg-[#0a0a0f]/50 border-b border-[#1e1e2a]">
          <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">Plan</span>
          <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">Task</span>
          <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">Status</span>
          <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">Method</span>
          <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider text-right">Orders</span>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {plans.map((p) => (
            <div
              key={p.planId}
              className="grid grid-cols-[140px_140px_90px_180px_60px] gap-4 px-5 py-2.5 border-b border-[#1e1e2a] last:border-b-0 hover:bg-[#ffffff05] transition-colors"
            >
              <span className="text-xs text-[#8b5cf6] font-mono">{p.planId}</span>
              <span className="text-xs text-[#f4f4f6] font-mono">{p.taskId}</span>
              <span
                className="text-xs font-semibold tabular-nums"
                style={{ color: STATUS_COLORS[p.status] || "#a1a1aa" }}
              >
                {p.status}
              </span>
              <span className="flex items-center gap-2">
                <span
                  className="text-xs"
                  style={{ color: METHOD_COLORS[p.method] || "#a1a1aa" }}
                >
                  {p.method}
                </span>
                {p.skipPackingScan && (
                  <span className="text-[10px] bg-[#7c3aed]/20 text-[#7c3aed] px-1.5 py-0.5 rounded font-medium">
                    SKIP-PACK
                  </span>
                )}
              </span>
              <span className="text-xs text-[#a1a1aa] text-right tabular-nums font-semibold">
                {p.orderCount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Label Notes & Exceptions Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Label Notes */}
        <div className="bg-[#141419] border border-[#1e1e2a] rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-[#0a0a0f] border-b border-[#1e1e2a]">
            <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
              🏷️ Label Notes ({labelNoteOrders.length})
            </span>
          </div>
          <div className="divide-y divide-[#1e1e2a]">
            {labelNoteOrders.map((ln) => (
              <div key={ln.dn} className="px-5 py-3 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8b5cf6] font-mono">{ln.dn}</span>
                  <span className="text-xs text-[#7c3aed] font-mono">{ln.planId}</span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: STATUS_COLORS[ln.status] || "#a1a1aa" }}
                  >
                    {ln.status}
                  </span>
                </div>
                <span className="text-xs text-[#a1a1aa] italic">{ln.note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exceptions */}
        <div className="bg-[#141419] border border-[#1e1e2a] rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-[#0a0a0f] border-b border-[#1e1e2a]">
            <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
              ⚠️ Exceptions ({exceptions.length})
            </span>
          </div>
          <div className="divide-y divide-[#1e1e2a]">
            {exceptions.map((ex) => (
              <div key={ex.dn} className="px-5 py-3 flex flex-col gap-1">
                <span className="text-xs text-[#ef4444] font-mono font-semibold">{ex.dn}</span>
                <span className="text-xs text-[#f59e0b]">{ex.reason}</span>
                <span className="text-xs text-[#71717a]">{ex.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Issues ── */}
      {summary.issues.length > 0 && (
        <div className="bg-[#141419] border border-[#f59e0b]/30 rounded-xl p-4 flex flex-col gap-2">
          <span className="text-xs font-semibold text-[#f59e0b] uppercase tracking-wider">
            ⚡ Issues ({summary.issues.length})
          </span>
          {summary.issues.map((issue, i) => (
            <span key={i} className="text-xs text-[#a1a1aa]">• {issue}</span>
          ))}
        </div>
      )}

      {/* ── Run Info Footer ── */}
      <div className="text-xs text-[#71717a] flex items-center gap-4">
        <span>{runInfo.date}</span>
        <span>·</span>
        <span>{runInfo.facility}</span>
        <span>·</span>
        <span>{runInfo.customer}</span>
        <span>·</span>
        <span className="text-[#22c55e] font-semibold">✓ {runInfo.assignee}</span>
      </div>
    </div>
  );
}
