import type { MixMetric } from "@/lib/data";

interface OperationalMetricsProps {
  mix: MixMetric[];
  inboundOpen: number;
  outboundOpen: number;
}

const MIX_COLORS: Record<string, string> = {
  Outbound: "#7c3aed",
  Inbound: "#22c55e",
  General: "#71717a",
};

export default function OperationalMetrics({
  mix,
  inboundOpen,
  outboundOpen,
}: OperationalMetricsProps) {
  const total = mix[0]?.total || 1;
  const inboundUnavailable = inboundOpen < 0;
  const outboundUnavailable = outboundOpen < 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Inbound vs Outbound Mix */}
      <div className="bg-[#141419] border border-[#1e1e2a] rounded-xl p-5 flex flex-col gap-3">
        <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
          Inbound vs Outbound Mix
        </span>
        <div className="flex items-end gap-2 h-16">
          {mix.map((m) => (
            <div
              key={m.label}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <span className="text-sm font-bold tabular-nums text-[#f4f4f6]">
                {m.count}
              </span>
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: `${(m.count / total) * 48}px`,
                  backgroundColor: MIX_COLORS[m.label] || "#71717a",
                  minHeight: m.count > 0 ? "4px" : "0px",
                }}
              />
              <span className="text-[10px] text-[#71717a] uppercase tracking-wider">
                {m.label}
              </span>
            </div>
          ))}
        </div>
        <div className="text-xs text-[#71717a]">
          {mix.filter(m => m.count > 0).length > 0 ? (
            <span>
              <span className="text-[#7c3aed] font-semibold">
                {(() => {
                  const ob = mix.find(m => m.label === "Outbound");
                  return ob ? Math.round((ob.count / (total || 1)) * 100) : 0;
                })()}% outbound
              </span>{" "}
              /{" "}
              <span className="text-[#22c55e] font-semibold">
                {(() => {
                  const ib = mix.find(m => m.label === "Inbound");
                  return ib ? Math.round((ib.count / (total || 1)) * 100) : 0;
                })()}% inbound
              </span>{" "}
              — Bay 4
            </span>
          ) : (
            <span className="text-[#71717a] italic">No active tasks — Bay 4</span>
          )}
        </div>
      </div>

      {/* Scheduled Inbounds */}
      <div className="bg-[#141419] border border-[#1e1e2a] rounded-xl p-5 flex flex-col gap-3">
        <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
          Scheduled Inbounds Received
        </span>
        {inboundUnavailable ? (
          <>
            <span className="text-2xl font-bold text-[#71717a]">
              UNAVAILABLE
            </span>
            <span className="text-xs text-[#71717a]">
              Schedule-summary API returned error
            </span>
          </>
        ) : (
          <>
            <span className="text-3xl font-bold text-[#22c55e] tabular-nums">
              {inboundOpen.toLocaleString()}
            </span>
            <span className="text-xs text-[#71717a]">
              Open receipt orders — facility-wide
            </span>
          </>
        )}
      </div>

      {/* Scheduled Outbounds */}
      <div className="bg-[#141419] border border-[#1e1e2a] rounded-xl p-5 flex flex-col gap-3">
        <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
          Scheduled Outbounds Loaded
        </span>
        {outboundUnavailable ? (
          <>
            <span className="text-2xl font-bold text-[#71717a]">
              UNAVAILABLE
            </span>
            <span className="text-xs text-[#71717a]">
              Schedule-summary API returned error
            </span>
          </>
        ) : (
          <>
            <span className="text-3xl font-bold text-[#7c3aed] tabular-nums">
              {outboundOpen.toLocaleString()}
            </span>
            <span className="text-xs text-[#71717a]">
              Open outbound orders — facility-wide
            </span>
          </>
        )}
      </div>
    </div>
  );
}
