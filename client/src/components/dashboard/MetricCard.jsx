
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  trend,
  trendLabel,
  accent = false,
}) {
  const trendIsPositive = trend?.startsWith("+");
  const trendIsNegative = trend?.startsWith("-");

  const trendColor = trendIsPositive
    ? "text-[#80e8bf]"
    : trendIsNegative
      ? "text-[#ff8b92]"
      : "text-[#8292aa]";

  const TrendIcon = trendIsPositive
    ? ArrowUpRight
    : trendIsNegative
      ? ArrowDownRight
      : Minus;

  return (
    <article
      className={[
        "min-w-0 rounded-lg border p-4",
        "transition-colors duration-200",
        accent
          ? "border-[#285541] bg-[#12251e]/50"
          : "border-[#252a32] bg-[#111419]",
        "hover:border-[#3a454f]",
      ].join(" ")}
    >
      {/* Label and optional icon */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium text-[#a3b1c7]">
          {label}
        </p>

        {Icon && (
          <div
            className={[
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
              accent
                ? "bg-[#80e8bf]/10 text-[#80e8bf]"
                : "bg-[#202630] text-[#a3b1c7]",
            ].join(" ")}
          >
            <Icon size={16} strokeWidth={1.8} />
          </div>
        )}
      </div>

      {/* Main value */}
      <div className="mt-4 flex min-w-0 items-baseline gap-2">
        <p className="truncate text-2xl font-semibold tracking-tight text-[#f1f3f5]">
          {value}
        </p>
      </div>

      {/* Description and optional trend */}
      {(description || trend) && (
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${trendColor}`}
            >
              <TrendIcon size={13} strokeWidth={2} />
              {trend}
            </span>
          )}

          {trendLabel && (
            <span className="text-[11px] text-[#8292aa]">
              {trendLabel}
            </span>
          )}

          {description && (
            <p className="text-[11px] leading-5 text-[#8292aa]">
              {description}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export default MetricCard;
