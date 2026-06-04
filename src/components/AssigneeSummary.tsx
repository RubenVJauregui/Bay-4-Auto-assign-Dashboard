import type { AssigneeSummary } from "@/lib/data";

interface AssigneeSummaryProps {
  summaries: AssigneeSummary[];
}

const COLORS = ["#7c3aed", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6"];

export default function AssigneeSummaryList({ summaries }: AssigneeSummaryProps) {
  const maxTasks = Math.max(...summaries.map((s) => s.taskCount), 1);

  return (
    <div className="bg-[#141419] border border-[#1e1e2a] rounded-xl overflow-hidden">
      <div className="px-5 py-3 bg-[#0a0a0f] border-b border-[#1e1e2a]">
        <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
          Assignments by Assignee
        </span>
      </div>
      <div className="divide-y divide-[#1e1e2a]">
        {summaries.map((s, i) => (
          <div
            key={s.name}
            className="px-5 py-3.5 flex items-center gap-4 hover:bg-[#ffffff05] transition-colors"
          >
            {/* Bar + name */}
            <div className="flex-1 min-w-0 flex items-center gap-3">
              <span className="text-sm text-[#f4f4f6] truncate">{s.name}</span>
              <div className="flex-1 h-2 bg-[#1e1e2a] rounded-full overflow-hidden max-w-[160px]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(s.taskCount / maxTasks) * 100}%`,
                    backgroundColor: COLORS[i % COLORS.length],
                  }}
                />
              </div>
            </div>
            {/* Count badge */}
            <span
              className="text-sm font-bold tabular-nums shrink-0"
              style={{ color: COLORS[i % COLORS.length] }}
            >
              {s.taskCount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
