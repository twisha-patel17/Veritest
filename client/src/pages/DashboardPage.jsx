
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

function DashboardPage() {
  const navigate = useNavigate();

  // Replace these empty arrays with real API data later.
  const recentRuns = [];
  const recentFailures = [];

  return (
    <div className="min-h-full bg-[#0b0d0f] px-5 py-7 text-[#f1f3f5] sm:px-7 lg:px-9">
      <div className="mx-auto max-w-[1500px] space-y-8">
        {/* Page heading */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-[#8292aa]">
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

          <button
            type="button"
            onClick={() => navigate("/dashboard/projects")}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-[#80e8bf] px-4 py-2.5 text-sm font-semibold text-[#0b0d0f] transition-colors hover:bg-[#a8f5d4] sm:self-auto"
          >
            <FolderKanban size={16} />
            View projects
            <ArrowRight size={15} />
          </button>
        </header>

        {/* Data availability notice */}
        <div className="flex items-start gap-3 rounded-lg border border-[#303640] bg-[#111419] px-4 py-3.5">
          <CircleHelp
            size={17}
            className="mt-0.5 shrink-0 text-[#80e8bf]"
          />

          <div>
            <p className="text-xs font-medium text-[#dce2ea]">
              Dashboard data isn't connected yet
            </p>
            <p className="mt-1 text-xs leading-5 text-[#8292aa]">
              Metrics will appear when real project, execution, failure, and
              mutation-testing results are available. No test results are
              being assumed.
            </p>
          </div>
        </div>

        {/* Metrics */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#f1f3f5]">
                Testing overview
              </h2>
              <p className="mt-1 text-xs text-[#8292aa]">
                A summary of your verification activity
              </p>
            </div>

            <span className="rounded-full border border-[#303640] px-2.5 py-1 text-[10px] text-[#8292aa]">
              Awaiting data
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {METRICS.map((metric) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                description={metric.description}
                icon={metric.icon}
              />
            ))}
          </div>
        </section>

        {/* Recent runs and failures */}
        <section className="grid grid-cols-1 items-start gap-5 2xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,1fr)]">
          <RecentRunsTable
            runs={recentRuns}
            onViewAll={() => navigate("/dashboard/test-runs")}
          />

          <RecentFailures
            failures={recentFailures}
            onViewAll={() => navigate("/dashboard/failures")}
          />
        </section>

        {/* Veritest's core principle */}
        <section className="rounded-xl border border-[#285541]/70 bg-[#12251e]/40 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#285541] bg-[#12251e]">
              <ShieldCheck size={20} className="text-[#80e8bf]" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-[#f1f3f5]">
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

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard/mutation-testing")
              }
              className="inline-flex shrink-0 items-center gap-2 self-start text-xs font-medium text-[#80e8bf] transition-colors hover:text-[#a8f5d4]"
            >
              Explore mutation testing
              <ArrowRight size={14} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
