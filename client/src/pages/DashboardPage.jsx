
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Dna,
  FlaskConical,
  FolderKanban,
  SearchCode,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";

import MetricCard from "../components/dashboard/MetricCard";
import RecentRunsTable from "../components/dashboard/RecentRunsTable";
import RecentFailures from "../components/dashboard/RecentFailures";

const METRICS = [
  {
    label: "Projects",
    value: "—",
    description: "Your testing projects",
    icon: FolderKanban,
  },
  {
    label: "Runs completed",
    value: "—",
    description: "Total test executions",
    icon: FlaskConical,
  },
  {
    label: "Tests passed",
    value: "—",
    description: "Successful test cases",
    icon: CheckCircle2,
  },
  {
    label: "Test pass rate",
    value: "—",
    description: "Based on completed runs",
    icon: Activity,
  },
  {
    label: "Reproduced failures",
    value: "—",
    description: "Failures verified by reruns",
    icon: SearchCode,
  },
  {
    label: "Mutation score",
    value: "—",
    description: "Effectiveness of your tests",
    icon: Dna,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

function DashboardPage() {
  const navigate = useNavigate();

  // Replace these with real API data when the backend is connected.
  const recentRuns = [];
  const recentFailures = [];

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-full min-w-0 overflow-x-clip bg-[#0b0d0f] px-4 py-5 text-[#f1f3f5] sm:px-6 sm:py-7 lg:px-8 xl:px-9"
    >
      <div className="mx-auto w-full max-w-[1500px] space-y-6 sm:space-y-8">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        >
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-[#8292aa]">
              <span>Workspace</span>
              <span>/</span>
              <span className="text-[#a3b1c7]">Overview</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Overview
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#8292aa]">
              Understand how well your tests verify your code, where failures
              occur, and what still needs investigation.
            </p>
          </div>

          <motion.button
            type="button"
            onClick={() => navigate("/dashboard/projects")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#80e8bf] px-4 py-2.5 text-sm font-semibold text-[#0b0d0f] transition-colors hover:bg-[#a8f5d4] sm:w-auto"
          >
            <FolderKanban size={16} />
            View projects
            <ArrowRight size={15} />
          </motion.button>
        </motion.header>

        {/* Data availability notice */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex min-w-0 items-start gap-3 rounded-lg border border-[#303640] bg-[#111419] p-3.5 sm:p-4"
        >
          <CircleHelp
            size={18}
            className="mt-0.5 shrink-0 text-[#80e8bf]"
          />

          <div className="min-w-0">
            <p className="text-xs font-medium leading-5 text-[#dce2ea] sm:text-sm">
              Dashboard data isn't connected yet
            </p>

            <p className="mt-1 text-xs leading-5 text-[#8292aa]">
              Metrics will appear when real project, execution, failure, and
              mutation-testing results are available. No test results are
              being assumed.
            </p>
          </div>
        </motion.div>

        {/* Metrics */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="min-w-0"
        >
          <motion.div
            variants={itemVariants}
            className="mb-4 flex flex-col gap-2 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between"
          >
            <div>
              <h2 className="text-sm font-semibold text-[#f1f3f5]">
                Testing overview
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#8292aa]">
                A summary of your verification activity
              </p>
            </div>

            <span className="w-fit rounded-full border border-[#303640] px-2.5 py-1 text-[10px] text-[#8292aa]">
              Awaiting data
            </span>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid min-w-0 grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:gap-4 xl:grid-cols-3"
          >
            {METRICS.map((metric) => (
              <motion.div
                key={metric.label}
                variants={itemVariants}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="min-w-0"
              >
                <MetricCard
                  label={metric.label}
                  value={metric.value}
                  description={metric.description}
                  icon={metric.icon}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Recent runs and failures */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid min-w-0 grid-cols-1 items-start gap-4 sm:gap-5 2xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"
        >
          <motion.div variants={itemVariants} className="min-w-0">
            <RecentRunsTable
              runs={recentRuns}
              onViewAll={() => navigate("/dashboard/test-runs")}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="min-w-0">
            <RecentFailures
              failures={recentFailures}
              onViewAll={() => navigate("/dashboard/failures")}
            />
          </motion.div>
        </motion.section>

        {/* Veritest's core principle */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
          whileHover={{
            borderColor: "rgba(128, 232, 191, 0.5)",
            transition: { duration: 0.2 },
          }}
          className="min-w-0 rounded-xl border border-[#285541]/70 bg-[#12251e]/40 p-4 sm:p-6"
        >
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            <motion.div
              whileHover={{ rotate: -5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#285541] bg-[#12251e]"
            >
              <ShieldCheck size={20} className="text-[#80e8bf]" />
            </motion.div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-6 text-[#f1f3f5]">
                Passing tests isn't the whole story.
              </p>

              <p className="mt-2 max-w-3xl text-xs leading-6 text-[#a3b1c7]">
                Veritest aims to go beyond generating test cases. It checks
                behavior through execution, investigates whether failures can
                be reproduced, and evaluates test effectiveness through
                mutation testing. The goal is evidence you can trust, not
                just a green checkmark.
              </p>
            </div>

            <motion.button
              type="button"
              onClick={() => navigate("/dashboard/mutation-testing")}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-2 self-start text-xs font-medium text-[#80e8bf] transition-colors hover:text-[#a8f5d4] sm:w-auto sm:justify-start"
            >
              Explore mutation testing
              <ArrowRight size={14} />
            </motion.button>
          </div>
        </motion.section>
      </div>
    </motion.main>
  );
}

export default DashboardPage;

