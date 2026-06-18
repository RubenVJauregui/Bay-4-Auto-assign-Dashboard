import type { DoorRecord } from "@/lib/data";

interface DoorGridProps {
  doors: DoorRecord[];
}

function statusStyles(status: DoorRecord["status"]) {
  switch (status) {
    case "Occupied":
      return {
        badge: "bg-[#ef44441a] text-[#ef4444] border-[#ef444433]",
        dot: "bg-[#ef4444]",
        label: "Occupied",
      };
    case "Reserved":
      return {
        badge: "bg-[#f59e0b1a] text-[#f59e0b] border-[#f59e0b33]",
        dot: "bg-[#f59e0b]",
        label: "Reserved",
      };
    case "Available":
      return {
        badge: "bg-[#22c55e1a] text-[#22c55e] border-[#22c55e33]",
        dot: "bg-[#22c55e]",
        label: "Available",
      };
  }
}

export default function DoorGrid({ doors }: DoorGridProps) {
  const occupied = doors.filter((d) => d.status === "Occupied").length;
  const reserved = doors.filter((d) => d.status === "Reserved").length;
  const available = doors.filter((d) => d.status === "Available").length;
  const anomalous = doors.filter((d) => d.anomaly).length;

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] pulse-dot" />
          <span className="text-xs text-[#a1a1aa]">Occupied ({occupied})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
          <span className="text-xs text-[#a1a1aa]">Reserved ({reserved})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
          <span className="text-xs text-[#a1a1aa]">Available ({available})</span>
        </div>
        {anomalous > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-pulse" />
            <span className="text-xs text-[#ef4444]">Anomalies ({anomalous})</span>
          </div>
        )}
      </div>

      {/* Door cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {doors.map((door) => {
          const styles = statusStyles(door.status);
          return (
            <div
              key={door.door}
              className={`bg-[#141419] border rounded-lg p-3.5 flex flex-col gap-2 hover:border-[#7c3aed66] transition-colors duration-200 ${
                door.anomaly ? "border-[#ef444466]" : "border-[#1e1e2a]"
              }`}
            >
              {/* Header: door + status badge + anomaly flag */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-[#f4f4f6] tracking-wide">
                    {door.door}
                  </span>
                  {door.anomaly && (
                    <span
                      className="text-[10px] text-[#ef4444]"
                      title="Anomaly: space status mismatch or stale task"
                    >
                      ⚠
                    </span>
                  )}
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles.badge}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${styles.dot} ${door.status === "Occupied" ? "pulse-dot" : ""}`}
                  />
                  {styles.label}
                </span>
              </div>

              {/* Body: assignee + duration / or customer */}
              {door.status === "Available" && !door.assignee ? (
                <div className="text-xs text-[#71717a]">
                  {door.customer ? (
                    <span className="text-[#22c55e99]">{door.customer}</span>
                  ) : (
                    <span className="text-[#22c55e99]">— Ready —</span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {door.assignee && (
                    <div className="text-xs text-[#a1a1aa] truncate" title={door.assignee}>
                      {door.assignee}
                    </div>
                  )}
                  {door.duration && (
                    <div className="text-xs text-[#71717a] font-mono tabular-nums">
                      {door.duration}
                    </div>
                  )}
                  {door.taskIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {door.taskIds.map((tid) => (
                        <span
                          key={tid}
                          className="text-[9px] font-mono text-[#8b5cf6] bg-[#8b5cf61a] px-1.5 py-0.5 rounded"
                        >
                          {tid.replace("TASK-", "")}
                        </span>
                      ))}
                    </div>
                  )}
                  {!door.assignee && !door.duration && door.taskIds.length === 0 && (
                    <span className="text-xs text-[#71717a] italic">
                      {door.customer || "No active task"}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
