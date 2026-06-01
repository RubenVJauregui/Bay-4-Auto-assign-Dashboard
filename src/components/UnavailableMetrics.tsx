import type { UnavailableMetric } from "@/lib/data";

interface UnavailableMetricsProps {
  metrics: UnavailableMetric[];
}

export default function UnavailableMetrics({ metrics }: UnavailableMetricsProps) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-[#141419] border border-[#1e1e2a] rounded-lg p-4 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              {/* Muted info icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  stroke="#71717a"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 4.5V4.51"
                  stroke="#71717a"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M8 7.5V11.5"
                  stroke="#71717a"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-sm font-medium text-[#a1a1aa]">
                {metric.label}
              </span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-xs font-semibold text-[#71717a] uppercase tracking-wide shrink-0 mt-0.5">
                Unavailable
              </span>
              <span className="text-xs text-[#71717a] leading-relaxed">
                — {metric.reason}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
