import type { TaskRecord } from "@/lib/data";

interface AssignmentHistoryProps {
  assignments: TaskRecord[];
}

export default function AssignmentHistory({
  assignments,
}: AssignmentHistoryProps) {
  return (
    <div>
      <div className="bg-[#141419] border border-[#1e1e2a] rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[80px_1fr_100px_80px_1fr] gap-4 px-5 py-3 bg-[#0a0a0f] border-b border-[#1e1e2a]">
          <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
            Door
          </span>
          <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
            DN
          </span>
          <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
            Customer
          </span>
          <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
            Pieces
          </span>
          <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
            Assignee
          </span>
        </div>

        {/* Table body — scrollable */}
        <div className="max-h-80 overflow-y-auto">
          {assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                className="opacity-40"
              >
                <rect
                  x="4"
                  y="8"
                  width="24"
                  height="18"
                  rx="2"
                  stroke="#71717a"
                  strokeWidth="1.5"
                />
                <line
                  x1="4"
                  y1="13"
                  x2="28"
                  y2="13"
                  stroke="#71717a"
                  strokeWidth="1.5"
                />
                <line
                  x1="12"
                  y1="4"
                  x2="12"
                  y2="26"
                  stroke="#71717a"
                  strokeWidth="1.5"
                />
                <line
                  x1="20"
                  y1="4"
                  x2="20"
                  y2="26"
                  stroke="#71717a"
                  strokeWidth="1.5"
                />
              </svg>
              <span className="text-sm text-[#71717a] font-medium">
                No assignment history available for today
              </span>
              <span className="text-xs text-[#71717a] max-w-xs text-center leading-relaxed">
                Dock assignment data returned empty for this facility.
              </span>
            </div>
          ) : (
            assignments.map((row) => {
              const isStale = row.pieces.includes("STALE");
              return (
                <div
                  key={row.taskId}
                  className={`grid grid-cols-[80px_1fr_100px_80px_1fr] gap-4 px-5 py-3 border-b border-[#1e1e2a] last:border-b-0 hover:bg-[#ffffff05] transition-colors ${
                    isStale ? "bg-[#ef444408]" : ""
                  }`}
                >
                  <span className="text-xs text-[#8b5cf6] font-mono">{row.door}</span>
                  <span className="text-xs text-[#f4f4f6] font-mono leading-relaxed break-words">
                    {row.dns}
                  </span>
                  <span className="text-xs text-[#a1a1aa]">{row.customer}</span>
                  <span className={`text-xs tabular-nums ${isStale ? "text-[#ef4444]" : "text-[#a1a1aa]"}`}>
                    {row.pieces}
                  </span>
                  <span className="text-xs text-[#a1a1aa]">{row.assignee}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
