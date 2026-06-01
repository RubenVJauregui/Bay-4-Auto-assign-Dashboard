import type { KpiMetric } from "@/lib/data";

interface KpiCardProps {
  metric: KpiMetric;
  accentClass: string;
  gaugeClass: string;
}

export default function KpiCard({
  metric,
  accentClass,
  gaugeClass,
}: KpiCardProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (metric.percentage / 100) * circumference;

  return (
    <div className="bg-[#141419] border border-[#1e1e2a] rounded-xl p-5 flex flex-col gap-3 min-w-0">
      <span className="text-sm font-medium text-[#a1a1aa] tracking-wide uppercase">
        {metric.label}
      </span>

      <div className="flex items-center gap-4">
        {/* Mini gauge */}
        <div className="relative w-20 h-20 shrink-0">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            className="-rotate-90"
          >
            {/* Background ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="#1e1e2a"
              strokeWidth="6"
            />
            {/* Progress ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke={gaugeClass}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="gauge-ring"
            />
          </svg>
          {/* Percentage in center */}
          <span
            className="absolute inset-0 flex items-center justify-center text-lg font-bold"
            style={{ color: gaugeClass }}
          >
            {metric.percentage.toFixed(1)}%
          </span>
        </div>

        <div className="flex flex-col">
          <span className={`text-3xl font-bold ${accentClass}`}>
            {metric.value}
          </span>
          <span className="text-xs text-[#71717a]">
            of {metric.denominator} doors
          </span>
        </div>
      </div>
    </div>
  );
}
