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
    case "Assigned":
      return {
        badge: "bg-[#f59e0b1a] text-[#f59e0b] border-[#f59e0b33]",
        dot: "bg-[#f59e0b]",
        label: "Assigned",
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
  return (
    <div>
      {/* Legend */}
      <div className="flex items-center gap-5 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] pulse-dot" />
          <span className="text-xs text-[#a1a1aa]">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
          <span className="text-xs text-[#a1a1aa]">Assigned</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
          <span className="text-xs text-[#a1a1aa]">Available</span>
        </div>
      </div>

      {/* Door cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {doors.map((door) => {
          const styles = statusStyles(door.status);
          return (
            <div
              key={door.door}
              className="bg-[#141419] border border-[#1e1e2a] rounded-lg p-3.5 flex flex-col gap-2 hover:border-[#7c3aed66] transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#f4f4f6] tracking-wide">
                  {door.door}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles.badge}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${styles.dot} ${door.status === "Occupied" ? "pulse-dot" : ""}`}
                  />
                  {styles.label}
                </span>
              </div>
              <div className="text-xs text-[#71717a]">
                {door.entryTicket ? (
                  <span className="font-mono text-[#a1a1aa]">
                    {door.entryTicket}
                  </span>
                ) : door.status === "Available" ? (
                  <span className="text-[#22c55e99]">— Ready —</span>
                ) : (
                  <span className="text-[#71717a] italic">No ticket</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
