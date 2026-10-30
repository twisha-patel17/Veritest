import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownUp,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Dna,
  Filter,
  FlaskConical,
  Info,
  Search,
  ShieldAlert,
  Skull,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import {
  MUTATION_SUMMARY,
  DEMO_MUTATIONS,
} from "../data/mutations";

const FILTER_OPTIONS = [
  { value: "ALL", label: "All results" },
  { value: "KILLED", label: "Killed" },
  { value: "SURVIVED", label: "Survived" },
  { value: "EQUIVALENT", label: "Equivalent" },
  { value: "INCONCLUSIVE", label: "Inconclusive" },
];

const METRICS = [
  {
    label: "Mutation score",
    value: `${MUTATION_SUMMARY.score}%`,
    description: "Effectiveness of your test suite",
    icon: Activity,
    color: "text-[#80e8bf]",
    iconBg: "bg-[#80e8bf]/10",
  },
  {
    label: "Mutants tested",
    value: MUTATION_SUMMARY.tested,
    description: "Total injected code changes",
    icon: Dna,
    color: "text-[#f1f3f5]",
    iconBg: "bg-[#8292aa]/10",
  },
  {
    label: "Killed",
    value: MUTATION_SUMMARY.killed,
    description: "Detected by your tests",
    icon: Skull,
    color: "text-[#80e8bf]",
    iconBg: "bg-[#80e8bf]/10",
  },
  {
    label: "Survived",
    value: MUTATION_SUMMARY.survived,
    description: "Changes your tests missed",
    icon: ShieldAlert,
    color: "text-[#fb7185]",
    iconBg: "bg-[#fb7185]/10",
  },
  {
    label: "Equivalent",
    value: MUTATION_SUMMARY.equivalent,
    description: "No observable behavior change",
    icon: CheckCircle2,
    color: "text-[#fbbf24]",
    iconBg: "bg-[#fbbf24]/10",
  },
  {
    label: "Inconclusive",
    value: MUTATION_SUMMARY.inconclusive,
    description: "Could not determine outcome",
    icon: CircleHelp,
    color: "text-[#a5b4fc]",
    iconBg: "bg-[#a5b4fc]/10",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.075,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

function ResultBadge({ result }) {
  const styles = {
    KILLED: "border-[#80e8bf]/40 bg-[#80e8bf]/10 text-[#80e8bf]",
    SURVIVED: "border-[#fb7185]/40 bg-[#fb7185]/10 text-[#fb7185]",
    EQUIVALENT: "border-[#fbbf24]/40 bg-[#fbbf24]/10 text-[#fbbf24]",
    INCONCLUSIVE: "border-[#a5b4fc]/40 bg-[#a5b4fc]/10 text-[#a5b4fc]",
  };

  const labels = {
    KILLED: "Killed",
    SURVIVED: "Survived",
    EQUIVALENT: "Equivalent",
    INCONCLUSIVE: "Inconclusive",
  };

  const icons = {
    KILLED: CheckCircle2,
    SURVIVED: XCircle,
    EQUIVALENT: ArrowDownUp,
    INCONCLUSIVE: CircleHelp,
  };

  const Icon = icons[result] || CircleHelp;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles[result] || styles.INCONCLUSIVE}`}
    >
      <Icon size={12} />
      {labels[result] || "Unknown"}
    </span>
  );
}

function MetricCard({ metric, index }) {
  const Icon = metric.icon;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        y: -5,
        borderColor: "rgba(128, 232, 191, 0.35)",
        transition: { duration: 0.2 },
      }}
      className="group relative overflow-hidden rounded-xl border border-[#252c35] bg-[#11151a] p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#8292aa]">
            {metric.label}
          </p>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.07, duration: 0.35 }}
            className={`mt-2 text-2xl font-semibold tracking-tight sm:text-3xl ${metric.color}`}
          >
            {metric.value}
          </motion.p>
        </div>

        <motion.div
          whileHover={{ rotate: -8, scale: 1.1 }}
          className={`rounded-lg p-2.5 ${metric.iconBg}`}
        >
          <Icon size={19} className={metric.color} />
        </motion.div>
      </div>

      <p className="mt-3 text-[11px] leading-5 text-[#8292aa]">
        {metric.description}
      </p>

      <motion.div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-[#80e8bf]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.35 + index * 0.07, duration: 0.45 }}
      />
    </motion.div>
  );
}

export default function MutationTestingPage() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filteredMutations = useMemo(() => {
    return DEMO_MUTATIONS.filter((mutation) => {
      const matchesFilter =
        filter === "ALL" || mutation.result === filter;

      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        mutation.location.toLowerCase().includes(query) ||
        mutation.mutation.toLowerCase().includes(query) ||
        mutation.action.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  const score = MUTATION_SUMMARY.score;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-full bg-[#0b0d0f] px-4 py-6 text-[#f1f3f5] sm:px-6 sm:py-7 lg:px-9"
    >
      <div className="mx-auto max-w-[1500px] space-y-7">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-[#8292aa]">
              <span>acme-platform</span>
              <span>/</span>
              <span className="text-[#a3b1c7]">Mutation testing</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-[#285541] bg-[#12251e] p-2 text-[#80e8bf]">
                <Dna size={21} />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Mutation testing
              </h1>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8292aa]">
              Find out whether your tests catch intentional changes
              to your code, not just whether they pass.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#303640] bg-[#11151a] px-3 py-1.5 text-[11px] text-[#8292aa]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#fbbf24]" />
            Demo results
          </span>
        </motion.header>

        {/* Metrics */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6"
        >
          {METRICS.map((metric, index) => (
            <MetricCard
              key={metric.label}
              metric={metric}
              index={index}
            />
          ))}
        </motion.section>

        {/* Mutation score */}
        <motion.section
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-[#252c35] bg-[#11151a] p-4 sm:p-5"
        >
          <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold">
                Mutation score
              </p>
              <p className="mt-1 text-xs text-[#8292aa]">
                Percentage of non-equivalent mutants detected by tests
              </p>
            </div>

            <p className="text-2xl font-semibold tabular-nums text-[#80e8bf]">
              {score.toFixed(1)}%
            </p>
          </div>

          <div
            className="h-2.5 overflow-hidden rounded-full bg-[#252c35]"
            role="progressbar"
            aria-label="Mutation score"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{
                duration: 1.1,
                delay: 0.35,
                ease: "easeOut",
              }}
              className="h-full rounded-full bg-gradient-to-r from-[#4fbf91] to-[#9af3ce]"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8292aa]">
            <span>0%</span>
            <span>100%</span>
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-[#285541]/50 bg-[#12251e]/40 p-3">
            <Info
              size={16}
              className="mt-0.5 shrink-0 text-[#80e8bf]"
            />
            <p className="text-xs leading-5 text-[#a3b1c7]">
              Score = killed ÷ (killed + survived) = 41 ÷ 48 = 85.4%.
              Equivalent and inconclusive mutants are excluded. A higher
              score means more injected changes were detected; it does not
              prove the code is bug-free.
            </p>
          </div>
        </motion.section>

        {/* Mutations table */}
        <motion.section
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="overflow-hidden rounded-xl border border-[#252c35] bg-[#11151a]"
        >
          <div className="flex flex-col gap-4 border-b border-[#252c35] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-sm font-semibold">
                Mutation results
              </h2>
              <p className="mt-1 text-xs text-[#8292aa]">
                Inspect injected changes and their outcomes.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <div className="relative min-w-0 flex-1 sm:w-56">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8292aa]"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search mutations..."
                  className="w-full rounded-lg border border-[#303640] bg-[#0b0d0f] py-2 pl-9 pr-3 text-xs text-[#f1f3f5] outline-none transition focus:border-[#80e8bf] placeholder:text-[#66758a]"
                />
              </div>

              <div className="relative sm:w-40">
                <Filter
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8292aa]"
                />
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className="w-full appearance-none rounded-lg border border-[#303640] bg-[#0b0d0f] py-2 pl-9 pr-8 text-xs text-[#f1f3f5] outline-none transition focus:border-[#80e8bf]"
                >
                  {FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#303640] bg-[#151a20] text-[11px] font-medium text-[#a3b1c7]">
                  <th className="px-4 py-3 sm:px-5">Location</th>
                  <th className="px-4 py-3">Mutation</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3 sm:px-5">
                    Relevant test / action
                  </th>
                </tr>
              </thead>

              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredMutations.map((mutation) => (
                    <motion.tr
                      key={mutation.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      className="border-b border-[#252c35] last:border-0 transition-colors hover:bg-[#171d23]"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-[#dce2ea] sm:px-5">
                        {mutation.location}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-xs text-[#c3cedd]">
                        {mutation.mutation}
                      </td>

                      <td className="px-4 py-3.5">
                        <ResultBadge result={mutation.result} />
                      </td>

                      <td className="px-4 py-3.5 text-xs text-[#c3cedd] sm:px-5">
                        {mutation.action}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {filteredMutations.length === 0 && (
              <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                <Search size={23} className="mb-3 text-[#66758a]" />
                <p className="text-sm font-medium text-[#dce2ea]">
                  No mutations found
                </p>
                <p className="mt-1 text-xs text-[#8292aa]">
                  Try changing your search or selected filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFilter("ALL");
                  }}
                  className="mt-4 text-xs font-medium text-[#80e8bf] hover:text-[#a8f5d4]"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-[#252c35] px-4 py-3 text-[11px] text-[#8292aa] sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span>
              Showing {filteredMutations.length} of {DEMO_MUTATIONS.length} mutations
            </span>
            <span>Illustrative data · Not connected to execution engine</span>
          </div>
        </motion.section>

        {/* Explanation */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="rounded-xl border border-[#285541]/60 bg-[#12251e]/30 p-4 sm:p-5"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-lg border border-[#285541] bg-[#12251e] p-2 text-[#80e8bf]">
              <FlaskConical size={19} />
            </div>

            <div>
              <h3 className="text-sm font-semibold">
                Why mutation testing matters
              </h3>
              <p className="mt-1 text-xs leading-6 text-[#a3b1c7]">
                A test suite can pass while still missing important bugs.
                Mutation testing introduces small intentional changes to
                your code. If a test catches the change, the mutant is
                killed. If the change goes unnoticed, it survives and
                highlights a potential gap in your tests.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.main>
  );
}