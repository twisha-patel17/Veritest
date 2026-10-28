import {
  AlertTriangle,
  ArrowUpRight,
  Bug,
  ChevronRight,
  Clock3,
  FolderKanban,
} from "lucide-react";

import ReproductionBadge from "./ReproductionBadge";

const SEVERITY_STYLES = {
  critical: "border-[#63333a] bg-[#29191d] text-[#ff8b92]",
  high: "border-[#63333a] bg-[#29191d] text-[#ff8b92]",
  medium: "border-[#65502c] bg-[#282116] text-[#f4c978]",
  low: "border-[#3b424d] bg-[#1b2028] text-[#a3b1c7]",
};

function SeverityBadge({ severity }) {
  const normalizedSeverity = String(severity || "")
    .trim()
    .toLowerCase();

  const styles =
    SEVERITY_STYLES[normalizedSeverity] ||
    "border-[#3b424d] bg-[#1b2028] text-[#a3b1c7]";

  const label = normalizedSeverity
    ? normalizedSeverity.charAt(0).toUpperCase() +
      normalizedSeverity.slice(1)
    : "Unclassified";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2 py-1",
        "text-[10px] font-medium leading-none",
        styles,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function RecentFailures({
  failures = [],
  loading = false,
  onViewAll,
  onFailureClick,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#252a32] bg-[#111419]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252a32] px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[#f1f3f5]">
              Recent failures
            </h2>

            {!loading && failures.length > 0 && (
              <span className="rounded-full border border-[#63333a] bg-[#29191d] px-2 py-0.5 text-[10px] font-medium text-[#ff8b92]">
                {failures.length}
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-[#8292aa]">
            Failures that need investigation
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          disabled={!onViewAll}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#80e8bf] transition-colors hover:text-[#a8f5d4] disabled:cursor-default disabled:opacity-60"
        >
          View all
          <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="divide-y divide-[#252a32]">
        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-[#8292aa]">
            Loading failures...
          </div>
        ) : failures.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-[#285541] bg-[#12251e]">
              <Bug size={18} className="text-[#80e8bf]" />
            </div>

            <p className="text-sm font-medium text-[#f1f3f5]">
              No failures to investigate
            </p>

            <p className="mt-1 max-w-xs text-xs leading-5 text-[#8292aa]">
              When test failures are detected, their details and reproduction
              status will appear here.
            </p>
          </div>
        ) : (
          failures.map((failure) => (
            <div
              key={failure.id}
              onClick={() => onFailureClick?.(failure)}
              className={[
                "group px-5 py-4 transition-colors hover:bg-[#171c22]",
                onFailureClick ? "cursor-pointer" : "",
              ].join(" ")}
              key={failure.id}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#63333a] bg-[#29191d]">
                  <AlertTriangle
                    size={15}
                    className="text-[#ff8b92]"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-words text-xs font-medium text-[#f1f3f5]">
                      {failure.title || "Untitled failure"}
                    </h3>

                    <SeverityBadge severity={failure.severity} />
                  </div>

                  {failure.message && (
                    <p className="mt-1 line-clamp-2 break-words font-mono text-[11px] leading-5 text-[#a3b1c7]">
                      {failure.message}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-[#8292aa]">
                      <FolderKanban size={12} />
                      {failure.projectName || "Unknown project"}
                    </span>

                    {failure.detectedAt && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-[#8292aa]">
                        <Clock3 size={12} />
                        {formatDate(failure.detectedAt)}
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <ReproductionBadge
                      status={failure.reproductionStatus}
                    />
                  </div>
                </div>

                {onFailureClick && (
                  <ChevronRight
                    size={16}
                    className="mt-1 shrink-0 text-[#536071] transition-colors group-hover:text-[#80e8bf]"
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default RecentFailures;
