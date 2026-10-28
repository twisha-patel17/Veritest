
import { ArrowUpRight, FlaskConical } from "lucide-react";
import RunStatusBadge from "./RunStatusBadge";

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

function formatDuration(duration) {
  if (duration === null || duration === undefined) return "—";

  if (typeof duration === "string") return duration;

  if (duration < 1000) return `${duration} ms`;

  return `${(duration / 1000).toFixed(2)} s`;
}

function RecentRunsTable({
  runs = [],
  onViewAll,
  onRunClick,
  loading = false,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#252a32] bg-[#111419]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252a32] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-[#f1f3f5]">
            Recent test runs
          </h2>
          <p className="mt-1 text-xs text-[#8292aa]">
            Latest executions across your projects
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left">
          <thead>
            <tr className="border-b border-[#252a32] bg-[#15191f]">
              {[
                "Run",
                "Project",
                "Target",
                "Status",
                "Tests",
                "Duration",
                "Started",
              ].map((heading) => (
                <th
                  key={heading}
                  className="whitespace-nowrap px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#8292aa]"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#252a32]">
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-sm text-[#8292aa]"
                >
                  Loading test runs...
                </td>
              </tr>
            ) : runs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-[#252a32] bg-[#1b2028]">
                      <FlaskConical
                        size={18}
                        className="text-[#8292aa]"
                      />
                    </div>

                    <p className="text-sm font-medium text-[#f1f3f5]">
                      No test runs yet
                    </p>

                    <p className="mt-1 max-w-xs text-xs leading-5 text-[#8292aa]">
                      Your recent executions will appear here once you run
                      tests against a project.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              runs.map((run) => (
                <tr
                  key={run.id}
                  onClick={() => onRunClick?.(run)}
                  className={[
                    "transition-colors hover:bg-[#171c22]",
                    onRunClick ? "cursor-pointer" : "",
                  ].join(" ")}
                >
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="font-mono text-xs text-[#80e8bf]">
                      {run.runId || run.id}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="text-xs font-medium text-[#dce2ea]">
                      {run.projectName || "Unnamed project"}
                    </span>
                  </td>

                  <td className="max-w-[180px] truncate px-5 py-4 font-mono text-xs text-[#a3b1c7]">
                    {run.target || "—"}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <RunStatusBadge status={run.status} />
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="text-xs text-[#80e8bf]">
                      {run.passed ?? 0} passed
                    </span>
                    <span className="mx-1.5 text-[#4b5563]">/</span>
                    <span className="text-xs text-[#ff8b92]">
                      {run.failed ?? 0} failed
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-[#a3b1c7]">
                    {formatDuration(run.duration)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-xs text-[#8292aa]">
                    {formatDate(run.startedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {!loading && runs.length > 0 && (
        <div className="border-t border-[#252a32] px-5 py-3">
          <p className="text-[11px] text-[#8292aa]">
            Showing {runs.length} {runs.length === 1 ? "run" : "runs"}
          </p>
        </div>
      )}
    </section>
  );
}

export default RecentRunsTable;
