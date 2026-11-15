
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Search,
  X,
  RefreshCw,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { getProjects } from "../services/projectService";
import { getProjectFailures } from "../services/failureService";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

function StatusBadge({ status }) {
  const reproduced = status === "REPRODUCED";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        reproduced
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          : "border-amber-500/40 bg-amber-500/10 text-amber-400"
      }`}
    >
      {reproduced ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
      {reproduced ? "Reproduced" : "Unconfirmed"}
    </span>
  );
}

function SummaryCard({ label, value, icon: Icon, color }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3 }}
      className="rounded-xl border border-[#252c35] bg-[#11151a] p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#8292aa]">{label}</p>
        <Icon size={17} className={color} />
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
    </motion.div>
  );
}

function getProjectList(response) {
  if (Array.isArray(response)) return response;
  return response?.projects || response?.data?.projects || [];
}

function getFailureList(response) {
  if (Array.isArray(response)) return response;
  return response?.failures || response?.data?.failures || [];
}

function formatFailureType(type) {
  if (!type) return "Unknown";

  return type
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function FailureAnalysisPage() {
  const navigate = useNavigate();

  const [failures, setFailures] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFailures = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const projectsResponse = await getProjects();
      const projects = getProjectList(projectsResponse);

      const results = await Promise.allSettled(
        projects.map(async (project) => {
          const response = await getProjectFailures(project.id);
          const projectFailures = getFailureList(response);

          return projectFailures.map((failure) => ({
            ...failure,
            projectId: project.id,
            projectName: project.name || "Untitled project",
          }));
        })
      );

      const successfulResults = results
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => result.value);

      const failedRequests = results.filter(
        (result) => result.status === "rejected"
      );

      setFailures(successfulResults);

      if (failedRequests.length > 0 && successfulResults.length === 0) {
        throw new Error("Could not load failures from your projects.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong while loading failures."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFailures();
  }, [loadFailures]);

  const reproducedCount = failures.filter(
    (failure) => failure.status === "REPRODUCED"
  ).length;

  const filteredFailures = useMemo(() => {
    const query = search.trim().toLowerCase();

    return failures.filter((failure) => {
      const matchesFilter =
        filter === "ALL" || failure.status === filter;

      const searchableText = [
        failure.title,
        failure.type,
        failure.errorMessage,
        failure.projectName,
        failure.testResult?.testCase?.title,
        failure.testResult?.testRun?.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFilter && searchableText.includes(query);
    });
  }, [failures, filter, search]);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-full min-w-0 overflow-x-clip bg-[#0b0d0f] px-4 py-6 text-[#f1f3f5] sm:px-6 sm:py-8 lg:px-9"
    >
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-7"
        >
          <div className="mb-3 flex items-center gap-2 text-xs text-[#8292aa]">
            <span>All projects</span>
            <span>/</span>
            <span className="text-[#a3b1c7]">Failure analysis</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Failure analysis
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#8292aa]">
                Investigate unexpected behavior and inspect execution
                evidence across your projects.
              </p>
            </div>

            <button
              type="button"
              onClick={loadFailures}
              disabled={loading}
              className="flex w-fit items-center gap-2 rounded-lg border border-[#303640] bg-[#11151a] px-3 py-2 text-xs text-[#a3b1c7] transition hover:border-[#80e8bf]/50 hover:text-[#80e8bf] disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </motion.header>

        {/* Summary */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-7 grid grid-cols-1 gap-3 min-[450px]:grid-cols-2 xl:grid-cols-3"
        >
          <SummaryCard
            label="Total failures"
            value={failures.length}
            icon={AlertTriangle}
            color="text-amber-400"
          />
          <SummaryCard
            label="Reproduced"
            value={reproducedCount}
            icon={CheckCircle2}
            color="text-emerald-400"
          />
          <SummaryCard
            label="Unconfirmed"
            value={failures.length - reproducedCount}
            icon={Clock3}
            color="text-amber-400"
          />
        </motion.section>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 rounded-xl border border-[#252c35] bg-[#11151a] py-16 text-sm text-[#8292aa]">
            <RefreshCw size={17} className="animate-spin text-[#80e8bf]" />
            Loading failures...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-10 text-center">
            <AlertTriangle size={22} className="mx-auto text-red-400" />
            <p className="mt-3 text-sm font-medium">Unable to load failures</p>
            <p className="mt-2 text-xs text-[#8292aa]">{error}</p>
            <button
              type="button"
              onClick={loadFailures}
              className="mt-4 text-xs text-[#80e8bf] hover:text-[#a8f5d4]"
            >
              Try again
            </button>
          </div>
        )}

        {/* Failure list */}
        {!loading && !error && (
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-semibold">Detected failures</h2>
              <p className="mt-1 text-xs text-[#8292aa]">
                Select a failure to inspect its execution evidence.
              </p>
            </div>

            {/* Search and filter */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65758a]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search failures, projects, test cases..."
                  aria-label="Search failures"
                  className="h-10 w-full rounded-lg border border-[#303640] bg-[#11151a] pl-9 pr-9 text-xs outline-none transition placeholder:text-[#65758a] focus:border-[#80e8bf] focus:ring-2 focus:ring-[#80e8bf]/10"
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

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Filter failures"
                className="h-10 rounded-lg border border-[#303640] bg-[#11151a] px-3 text-xs text-[#dce2ea] outline-none focus:border-[#80e8bf] sm:min-w-[155px]"
              >
                <option value="ALL">All failures</option>
                <option value="REPRODUCED">Reproduced</option>
                <option value="UNCONFIRMED">Unconfirmed</option>
              </select>
            </div>

            <p className="mb-3 text-xs text-[#65758a]">
              Showing {filteredFailures.length} of {failures.length} failures
            </p>

            {/* Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              <AnimatePresence mode="popLayout">
                {filteredFailures.map((failure) => {
                  const testCaseTitle =
                    failure.testResult?.testCase?.title ||
                    "Untitled test case";

                  const runId = failure.testResult?.testRun?.id;

                  return (
                    <motion.button
                      layout
                      key={failure.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -12 }}
                      whileHover={{
                        y: -3,
                        borderColor: "rgba(128, 232, 191, 0.45)",
                        transition: { duration: 0.18 },
                      }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() =>
                        navigate(
                          `/dashboard/failures/${failure.id}?projectId=${failure.projectId}`
                        )
                      }
                      className="group relative w-full overflow-hidden rounded-xl border border-[#252c35] bg-[#11151a] p-4 text-left transition-colors hover:bg-[#151b20] focus:outline-none focus:ring-2 focus:ring-[#80e8bf]/60 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="break-words text-sm font-semibold leading-6 text-[#f1f3f5] transition-colors group-hover:text-[#80e8bf]">
                            {failure.title || testCaseTitle}
                          </h3>

                          <p className="mt-1 break-all font-mono text-[11px] text-[#8292aa]">
                            {testCaseTitle} · {formatFailureType(failure.type)}
                            {runId ? ` · Run ${runId}` : ""}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <StatusBadge status={failure.status} />
                            <span className="text-xs text-[#8292aa]">
                              {failure.errorMessage || "Execution failure recorded"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-[#252c35] pt-3 sm:border-0 sm:pt-0">
                          <span className="text-xs text-[#65758a]">
                            {failure.projectName}
                          </span>
                          <span className="flex items-center gap-2 text-xs font-medium text-[#8292aa] transition-colors group-hover:text-[#80e8bf]">
                            Inspect
                            <ArrowRight size={15} />
                          </span>
                        </div>
                      </div>

                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.25 }}
                        style={{ transformOrigin: "left" }}
                        className="absolute bottom-0 left-0 h-[2px] w-full bg-[#80e8bf]"
                      />
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Empty state */}
            {filteredFailures.length === 0 && (
              <div className="rounded-xl border border-[#252c35] bg-[#11151a] px-5 py-14 text-center">
                <Search size={22} className="mx-auto text-[#8292aa]" />
                <p className="mt-3 text-sm font-medium">
                  {failures.length === 0
                    ? "No failures detected yet"
                    : "No matching failures"}
                </p>
                <p className="mt-1 text-xs text-[#8292aa]">
                  {failures.length === 0
                    ? "Failures from executed tests will appear here."
                    : "Try changing your search or filter."}
                </p>

                {failures.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setFilter("ALL");
                    }}
                    className="mt-4 text-xs text-[#80e8bf] hover:text-[#a8f5d4]"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </motion.main>
  );
}
