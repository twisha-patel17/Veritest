
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Search,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const DEMO_RUNS = [
  {
    id: "run_8f3a",
    project: "billing-core",
    target: "calcProration",
    status: "FAILED",
    passed: 11,
    failed: 2,
    duration: 4.2,
    createdAt: "Oct 15, 09:12",
    timestamp: new Date("2026-10-15T09:12:00").getTime(),
    message: "Two generated test cases exposed incorrect proration behavior.",
  },
  {
    id: "run_7e10",
    project: "billing-core",
    target: "parseInvoiceLine",
    status: "PASSED",
    passed: 14,
    failed: 0,
    duration: 3.1,
    createdAt: "Oct 14, 17:40",
    timestamp: new Date("2026-10-14T17:40:00").getTime(),
    message: "All generated test cases completed successfully.",
  },
  {
    id: "run_7b92",
    project: "auth-utils",
    target: "validateToken",
    status: "FAILED",
    passed: 8,
    failed: 1,
    duration: 9.8,
    createdAt: "Oct 14, 11:05",
    timestamp: new Date("2026-10-14T11:05:00").getTime(),
    message: "One test case failed during token validation.",
  },
  {
    id: "run_6d44",
    project: "inventory-sync",
    target: "mergeStock",
    status: "PASSED",
    passed: 22,
    failed: 0,
    duration: 6.4,
    createdAt: "Oct 13, 02:00",
    timestamp: new Date("2026-10-13T02:00:00").getTime(),
    message: "All generated test cases completed successfully.",
  },
  {
    id: "run_6a01",
    project: "billing-core",
    target: "calcProration",
    status: "FAILED",
    passed: 9,
    failed: 3,
    duration: 4.0,
    createdAt: "Oct 12, 15:22",
    timestamp: new Date("2026-10-12T15:22:00").getTime(),
    message: "Three test cases failed during proration verification.",
  },
];

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

function StatusBadge({ status }) {
  const passed = status === "PASSED";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        passed
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          : "border-red-500/40 bg-red-500/10 text-red-400"
      }`}
    >
      {passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      {passed ? "Passed" : "Failed"}
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
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
    </motion.div>
  );
}

export default function TestRunsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("duration-desc");
  const [expandedRun, setExpandedRun] = useState(null);

  const filteredRuns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return DEMO_RUNS.filter((run) => {
      const matchesSearch =
        !query ||
        run.id.toLowerCase().includes(query) ||
        run.project.toLowerCase().includes(query) ||
        run.target.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || run.status === statusFilter;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      if (sortOrder === "duration-desc") return b.duration - a.duration;
      if (sortOrder === "duration-asc") return a.duration - b.duration;
      if (sortOrder === "newest") return b.timestamp - a.timestamp;
      if (sortOrder === "oldest") return a.timestamp - b.timestamp;
      return 0;
    });
  }, [search, statusFilter, sortOrder]);

  const totalPassed = DEMO_RUNS.reduce((sum, run) => sum + run.passed, 0);
  const totalFailed = DEMO_RUNS.reduce((sum, run) => sum + run.failed, 0);
  const averageDuration =
    DEMO_RUNS.reduce((sum, run) => sum + run.duration, 0) /
    DEMO_RUNS.length;

  const passedRuns = DEMO_RUNS.filter(
    (run) => run.status === "PASSED"
  ).length;

  const toggleSort = () => {
    setSortOrder((current) =>
      current === "duration-desc" ? "duration-asc" : "duration-desc"
    );
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
            <span>acme-platform</span>
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

            <div className="flex items-center gap-2 text-xs text-[#8292aa]">
              <Activity size={15} className="text-[#80e8bf]" />
              {DEMO_RUNS.length} demo executions
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
            value={DEMO_RUNS.length}
            icon={Activity}
            color="text-[#80e8bf]"
          />
          <StatCard
            label="Successful runs"
            value={passedRuns}
            icon={CheckCircle2}
            color="text-emerald-400"
          />
          <StatCard
            label="Failed test cases"
            value={totalFailed}
            icon={XCircle}
            color="text-red-400"
          />
          <StatCard
            label="Average duration"
            value={`${averageDuration.toFixed(1)}s`}
            icon={Clock3}
            color="text-sky-400"
          />
        </motion.section>

        {/* Test runs table section */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="overflow-hidden rounded-xl border border-[#252c35] bg-[#0d1115]"
        >
          {/* Section heading */}
          <div className="flex flex-col gap-2 border-b border-[#252c35] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="text-sm font-semibold">Execution history</h2>
              <p className="mt-1 text-xs text-[#8292aa]">
                Search, filter, and inspect individual runs.
              </p>
            </div>

            <span className="w-fit rounded-full border border-[#303640] px-2.5 py-1 text-[10px] text-[#8292aa]">
              Demo data
            </span>
          </div>

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
                placeholder="Search runs, projects, targets..."
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
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by status"
                className="h-10 w-full appearance-none rounded-lg border border-[#303640] bg-[#11151a] px-3 pr-9 text-xs text-[#dce2ea] outline-none focus:border-[#80e8bf] sm:w-auto sm:min-w-[125px]"
              >
                <option value="ALL">All statuses</option>
                <option value="PASSED">Passed</option>
                <option value="FAILED">Failed</option>
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
              Duration
              {sortOrder === "duration-desc" ? (
                <ArrowDown size={13} />
              ) : (
                <ArrowUp size={13} />
              )}
            </button>

            <span className="text-xs text-[#8292aa] sm:ml-auto">
              {filteredRuns.length} of {DEMO_RUNS.length} runs
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#303640] bg-[#11151a] text-xs text-[#8292aa]">
                  <th className="px-4 py-3 font-medium sm:px-5">Run</th>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Target</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Passed</th>
                  <th className="px-4 py-3 font-medium">Failed</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>

              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredRuns.map((run) => (
                    <motion.tr
                      layout
                      key={run.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.2 }}
                      onClick={() =>
                        setExpandedRun((current) =>
                          current === run.id ? null : run.id
                        )
                      }
                      className="cursor-pointer border-b border-[#252c35] text-xs transition-colors last:border-0 hover:bg-[#151b20]"
                    >
                      <td className="px-4 py-4 font-mono text-[#80e8bf] sm:px-5">
                        {run.id}
                      </td>
                      <td className="px-4 py-4 font-medium text-[#dce2ea]">
                        {run.project}
                      </td>
                      <td className="px-4 py-4 font-mono text-[#a3b1c7]">
                        {run.target}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={run.status} />
                      </td>
                      <td className="px-4 py-4 tabular-nums text-[#dce2ea]">
                        {run.passed}
                      </td>
                      <td className="px-4 py-4 tabular-nums">
                        <span className={run.failed ? "text-red-400" : "text-[#8292aa]"}>
                          {run.failed}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono text-[#a3b1c7]">
                        {run.duration}s
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-[#8292aa]">
                        {run.createdAt}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {/* Empty state */}
            {filteredRuns.length === 0 && (
              <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
                <div className="mb-3 rounded-xl border border-[#303640] bg-[#11151a] p-3">
                  <Search size={21} className="text-[#8292aa]" />
                </div>
                <p className="text-sm font-medium">No matching test runs</p>
                <p className="mt-1 text-xs text-[#8292aa]">
                  Try another search term or change the status filter.
                </p>
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
              </div>
            )}
          </div>

          {/* Expandable run details */}
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
                {(() => {
                  const run = DEMO_RUNS.find(
                    (item) => item.id === expandedRun
                  );

                  if (!run) return null;

                  return (
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-mono text-sm text-[#80e8bf]">
                            {run.id}
                          </p>
                          <p className="mt-1 text-xs text-[#8292aa]">
                            {run.project} / {run.target}
                          </p>
                        </div>
                        <StatusBadge status={run.status} />
                      </div>

                      <div className="mt-4 rounded-lg border border-[#303640] bg-[#0d1115] p-3.5">
                        <p className="text-xs font-medium text-[#dce2ea]">
                          Execution summary
                        </p>
                        <p className="mt-2 text-xs leading-6 text-[#8292aa]">
                          {run.message}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                          ["Passed", run.passed],
                          ["Failed", run.failed],
                          ["Duration", `${run.duration}s`],
                          ["Created", run.createdAt],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-lg border border-[#252c35] bg-[#0d1115] p-3"
                          >
                            <p className="text-[10px] text-[#8292aa]">
                              {label}
                            </p>
                            <p className="mt-1 break-words text-xs font-medium text-[#dce2ea]">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="flex flex-col gap-2 border-t border-[#252c35] px-4 py-3 text-[11px] text-[#65758a] sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span>Showing demo execution records</span>
            <span>Click a run to inspect its summary</span>
          </div>
        </motion.section>

        <p className="mt-4 text-xs leading-5 text-[#65758a]">
          These are illustrative records, not actual Veritest execution results.
          Live execution history will be loaded from the backend later.
        </p>
      </div>
    </motion.main>
  );
}
