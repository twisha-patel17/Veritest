
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  Clock3,
  RefreshCw,
  Search,
  X,
  XCircle,
  AlertCircle,
  LoaderCircle,
  FileCode2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { getProjects } from "../services/projectService";
import {
  getProjectTestRuns,
  getTestRunById,
} from "../services/testRunService";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

function getRunStatus(run) {
  if (run.status === "RUNNING") return "RUNNING";
  if (run.status === "PENDING") return "PENDING";
  if (run.status === "FAILED") return "FAILED";

  if (run.status === "COMPLETED") {
    return run.failedTests > 0 ? "FAILED" : "PASSED";
  }

  return run.status;
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(duration) {
  if (duration === null || duration === undefined) {
    return "—";
  }

  return `${(duration / 1000).toFixed(2)}s`;
}

function StatusBadge({ status }) {
  const styles = {
    PASSED:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    FAILED:
      "border-red-500/40 bg-red-500/10 text-red-400",
    RUNNING:
      "border-sky-500/40 bg-sky-500/10 text-sky-400",
    PENDING:
      "border-amber-500/40 bg-amber-500/10 text-amber-400",
  };

  const icons = {
    PASSED: <CheckCircle2 size={12} />,
    FAILED: <XCircle size={12} />,
    RUNNING: <LoaderCircle size={12} className="animate-spin" />,
    PENDING: <Clock3 size={12} />,
  };

  const labels = {
    PASSED: "Passed",
    FAILED: "Failed",
    RUNNING: "Running",
    PENDING: "Pending",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        styles[status] || styles.PENDING
      }`}
    >
      {icons[status] || icons.PENDING}
      {labels[status] || status}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3 }}
      className="rounded-xl border border-[#252c35] bg-[#11151a] p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[#8292aa]">{label}</p>
        <Icon size={17} className={color} />
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </motion.div>
  );
}

export default function TestRunsPage() {
  const [runs, setRuns] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("newest");
  const [expandedRun, setExpandedRun] = useState(null);
  const [runDetails, setRunDetails] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRuns = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const projectsResponse = await getProjects();

      const projects = Array.isArray(projectsResponse)
        ? projectsResponse
        : projectsResponse.projects || [];

      const runRequests = await Promise.all(
        projects.map(async (project) => {
          const response = await getProjectTestRuns(project.id);

          const projectRuns = Array.isArray(response)
            ? response
            : response.testRuns || [];

          return projectRuns.map((run) => ({
            ...run,
            projectName: project.name,
            projectId: project.id,
            displayStatus: getRunStatus(run),
          }));
        })
      );

      const allRuns = runRequests
        .flat()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

      setRuns(allRuns);

      // Keep the expanded run synchronized after refreshing.
      if (expandedRun) {
        const updatedRun = allRuns.find(
          (run) => run.id === expandedRun
        );

        if (!updatedRun) {
          setExpandedRun(null);
          setRunDetails(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch test runs:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load execution history. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [expandedRun]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  const handleExpandRun = async (run) => {
    if (expandedRun === run.id) {
      setExpandedRun(null);
      setRunDetails(null);
      return;
    }

    setExpandedRun(run.id);
    setRunDetails(null);

    try {
      setDetailsLoading(true);

      const response = await getTestRunById(
        run.projectId,
        run.id
      );

      setRunDetails(response.testRun);
    } catch (err) {
      console.error("Failed to fetch run details:", err);

      setRunDetails({
        error:
          err.response?.data?.message ||
          "Unable to load this run's details.",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredRuns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return runs
      .filter((run) => {
        const matchesSearch =
          !query ||
          run.id.toLowerCase().includes(query) ||
          run.projectName.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "ALL" ||
          run.displayStatus === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortOrder === "duration-desc") {
          return (b.duration || 0) - (a.duration || 0);
        }

        if (sortOrder === "duration-asc") {
          return (a.duration || 0) - (b.duration || 0);
        }

        if (sortOrder === "oldest") {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }

        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [runs, search, statusFilter, sortOrder]);

  const totalFailed = runs.reduce(
    (sum, run) => sum + (run.failedTests || 0),
    0
  );

  const passedRuns = runs.filter(
    (run) => run.displayStatus === "PASSED"
  ).length;

  const completedRuns = runs.filter(
    (run) =>
      run.status === "COMPLETED" ||
      run.status === "FAILED"
  );

  const runsWithDuration = completedRuns.filter(
    (run) => typeof run.duration === "number"
  );

  const averageDuration = runsWithDuration.length
    ? runsWithDuration.reduce(
        (sum, run) => sum + run.duration,
        0
      ) / runsWithDuration.length
    : 0;

  const toggleSort = () => {
    setSortOrder((current) => {
      if (current === "duration-desc") return "duration-asc";
      if (current === "duration-asc") return "newest";
      return "duration-desc";
    });
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-full min-w-0 overflow-x-clip bg-[#0b0d0f] px-4 py-6 text-[#f1f3f5] sm:px-6 sm:py-8 lg:px-9"
    >
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-7"
        >
          <div className="mb-3 flex items-center gap-2 text-xs text-[#8292aa]">
            <span>Veritest</span>
            <span>/</span>
            <span className="text-[#a3b1c7]">Test runs</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Test runs
              </h1>

              <p className="mt-2 text-sm text-[#8292aa]">
                Inspect execution history and investigate test results.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-[#8292aa]">
                <Activity size={15} className="text-[#80e8bf]" />
                {runs.length} executions
              </div>

              <button
                type="button"
                onClick={() => fetchRuns(true)}
                disabled={refreshing || loading}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#303640] bg-[#11151a] px-3 text-xs text-[#dce2ea] transition hover:border-[#80e8bf]/50 hover:text-[#80e8bf] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={13}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </motion.header>

        {/* Summary cards */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-7 grid grid-cols-1 gap-3 min-[450px]:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard
            label="Total runs"
            value={loading ? "—" : runs.length}
            icon={Activity}
            color="text-[#80e8bf]"
          />

          <StatCard
            label="Successful runs"
            value={loading ? "—" : passedRuns}
            icon={CheckCircle2}
            color="text-emerald-400"
          />

          <StatCard
            label="Failed test cases"
            value={loading ? "—" : totalFailed}
            icon={XCircle}
            color="text-red-400"
          />

          <StatCard
            label="Average duration"
            value={
              loading
                ? "—"
                : runsWithDuration.length
                  ? `${(averageDuration / 1000).toFixed(2)}s`
                  : "—"
            }
            icon={Clock3}
            color="text-sky-400"
          />
        </motion.section>

        {/* Execution history */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="overflow-hidden rounded-xl border border-[#252c35] bg-[#0d1115]"
        >
          {/* Section heading */}
          <div className="flex flex-col gap-2 border-b border-[#252c35] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="text-sm font-semibold">
                Execution history
              </h2>

              <p className="mt-1 text-xs text-[#8292aa]">
                Search, filter, and inspect individual runs.
              </p>
            </div>

            <span className="w-fit rounded-full border border-emerald-500/30 bg-emerald-500/5 px-2.5 py-1 text-[10px] text-emerald-400">
              Live data
            </span>
          </div>

          {/* Error state */}
          {error && (
            <div className="m-4 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0 text-red-400"
              />

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-red-400">
                  Could not load execution history
                </p>

                <p className="mt-1 text-xs leading-5 text-[#a3b1c7]">
                  {error}
                </p>
              </div>

              <button
                onClick={() => fetchRuns(true)}
                className="text-xs text-[#80e8bf] hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Search and filters */}
          <div className="flex flex-col gap-3 border-b border-[#252c35] p-4 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative min-w-0 flex-1 sm:min-w-[220px] sm:max-w-sm">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65758a]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search runs and projects..."
                aria-label="Search test runs"
                className="h-10 w-full rounded-lg border border-[#303640] bg-[#11151a] pl-9 pr-9 text-xs text-[#f1f3f5] outline-none transition placeholder:text-[#65758a] focus:border-[#80e8bf] focus:ring-2 focus:ring-[#80e8bf]/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8292aa] hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                aria-label="Filter by status"
                className="h-10 w-full appearance-none rounded-lg border border-[#303640] bg-[#11151a] px-3 pr-9 text-xs text-[#dce2ea] outline-none focus:border-[#80e8bf] sm:w-auto sm:min-w-[125px]"
              >
                <option value="ALL">All statuses</option>
                <option value="PASSED">Passed</option>
                <option value="FAILED">Failed</option>
                <option value="RUNNING">Running</option>
                <option value="PENDING">Pending</option>
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8292aa]"
              />
            </div>

            <button
              type="button"
              onClick={toggleSort}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#303640] bg-[#11151a] px-3 text-xs text-[#dce2ea] transition-colors hover:border-[#80e8bf]/50 hover:text-[#80e8bf]"
            >
              <ArrowDownUp size={14} />
              Sort
              {sortOrder === "duration-desc" ? (
                <ArrowDown size={13} />
              ) : sortOrder === "duration-asc" ? (
                <ArrowUp size={13} />
              ) : (
                <Clock3 size={13} />
              )}
            </button>

            <span className="text-xs text-[#8292aa] sm:ml-auto">
              {filteredRuns.length} of {runs.length} runs
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#303640] bg-[#11151a] text-xs text-[#8292aa]">
                  <th className="px-4 py-3 font-medium sm:px-5">
                    Run
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Project
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Tests
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Passed
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Failed
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Duration
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-16 text-center">
                      <LoaderCircle
                        size={22}
                        className="mx-auto animate-spin text-[#80e8bf]"
                      />

                      <p className="mt-3 text-xs text-[#8292aa]">
                        Loading execution history...
                      </p>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredRuns.map((run) => (
                      <motion.tr
                        layout
                        key={run.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => handleExpandRun(run)}
                        className={`cursor-pointer border-b border-[#252c35] text-xs transition-colors last:border-0 ${
                          expandedRun === run.id
                            ? "bg-[#151d20]"
                            : "hover:bg-[#151b20]"
                        }`}
                      >
                        <td className="px-4 py-4 font-mono text-[#80e8bf] sm:px-5">
                          {run.id}
                        </td>

                        <td className="px-4 py-4 font-medium text-[#dce2ea]">
                          {run.projectName}
                        </td>

                        <td className="px-4 py-4 text-[#a3b1c7]">
                          {run.totalTests}
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge status={run.displayStatus} />
                        </td>

                        <td className="px-4 py-4 tabular-nums text-[#dce2ea]">
                          {run.passedTests ?? 0}
                        </td>

                        <td className="px-4 py-4 tabular-nums">
                          <span
                            className={
                              run.failedTests
                                ? "text-red-400"
                                : "text-[#8292aa]"
                            }
                          >
                            {run.failedTests ?? 0}
                          </span>
                        </td>

                        <td className="px-4 py-4 font-mono text-[#a3b1c7]">
                          {formatDuration(run.duration)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-[#8292aa]">
                          {formatDate(run.createdAt)}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>

            {/* Empty state */}
            {!loading && !error && filteredRuns.length === 0 && (
              <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
                <div className="mb-3 rounded-xl border border-[#303640] bg-[#11151a] p-3">
                  <Search size={21} className="text-[#8292aa]" />
                </div>

                <p className="text-sm font-medium">
                  {runs.length === 0
                    ? "No test runs yet"
                    : "No matching test runs"}
                </p>

                <p className="mt-1 max-w-sm text-xs leading-5 text-[#8292aa]">
                  {runs.length === 0
                    ? "Create and execute a test run from one of your projects to see its execution history here."
                    : "Try another search term or change the status filter."}
                </p>

                {runs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("ALL");
                    }}
                    className="mt-4 text-xs font-medium text-[#80e8bf] hover:text-[#a8f5d4]"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Expanded run details */}
          <AnimatePresence>
            {expandedRun && (
              <motion.div
                key={expandedRun}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden border-t border-[#303640] bg-[#11151a]"
              >
                <div className="p-4 sm:p-5">
                  {detailsLoading ? (
                    <div className="py-8 text-center">
                      <LoaderCircle
                        size={20}
                        className="mx-auto animate-spin text-[#80e8bf]"
                      />
                      <p className="mt-3 text-xs text-[#8292aa]">
                        Loading test results...
                      </p>
                    </div>
                  ) : runDetails?.error ? (
                    <p className="py-5 text-xs text-red-400">
                      {runDetails.error}
                    </p>
                  ) : runDetails ? (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-mono text-sm text-[#80e8bf]">
                            {runDetails.id}
                          </p>

                          <p className="mt-1 text-xs text-[#8292aa]">
                            {runDetails.project?.name || "Project"} / Execution details
                          </p>
                        </div>

                        <StatusBadge
                          status={getRunStatus(runDetails)}
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                          ["Total tests", runDetails.totalTests],
                          ["Passed", runDetails.passedTests],
                          ["Failed", runDetails.failedTests],
                          ["Duration", formatDuration(runDetails.duration)],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-lg border border-[#252c35] bg-[#0d1115] p-3"
                          >
                            <p className="text-[10px] text-[#8292aa]">
                              {label}
                            </p>

                            <p className="mt-1 text-sm font-medium text-[#dce2ea]">
                              {value ?? 0}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5">
                        <div className="mb-3 flex items-center gap-2">
                          <FileCode2
                            size={15}
                            className="text-[#80e8bf]"
                          />
                          <h3 className="text-xs font-semibold">
                            Individual test results
                          </h3>
                        </div>

                        {runDetails.results?.length > 0 ? (
                          <div className="space-y-2">
                            {runDetails.results.map((result) => (
                              <div
                                key={result.id}
                                className="rounded-lg border border-[#252c35] bg-[#0d1115] p-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="break-words text-xs font-medium text-[#dce2ea]">
                                      {result.testCase?.title ||
                                        "Untitled test"}
                                    </p>

                                    <p className="mt-1 text-[10px] text-[#65758a]">
                                      {result.testCase?.sourceFile ||
                                        "Source file unavailable"}
                                    </p>
                                  </div>

                                  <StatusBadge
                                    status={result.status === "ERROR" ? "FAILED" : result.status}
                                  />
                                </div>

                                {result.errorMessage && (
                                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-red-500/20 bg-red-500/5 p-3 font-mono text-[10px] leading-5 text-red-300">
                                    {result.errorMessage}
                                  </pre>
                                )}

                                {result.stderr && (
                                  <details className="mt-2">
                                    <summary className="cursor-pointer text-[10px] text-[#8292aa] hover:text-[#80e8bf]">
                                      View execution output
                                    </summary>

                                    <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md bg-[#080a0c] p-3 font-mono text-[10px] leading-5 text-[#a3b1c7]">
                                      {result.stderr}
                                    </pre>
                                  </details>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="rounded-lg border border-[#252c35] bg-[#0d1115] p-4 text-xs text-[#8292aa]">
                            No individual test results are available for this run.
                          </p>
                        )}
                      </div>

                      <p className="mt-4 text-[10px] text-[#65758a]">
                        Created {formatDate(runDetails.createdAt)}
                      </p>
                    </>
                  ) : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="flex flex-col gap-2 border-t border-[#252c35] px-4 py-3 text-[11px] text-[#65758a] sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span>
              Showing {filteredRuns.length} live execution records
            </span>
            <span>Click a run to inspect its test results</span>
          </div>
        </motion.section>
      </div>
    </motion.main>
  );
}
