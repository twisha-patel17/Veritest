
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Play,
  RotateCcw,
  ShieldAlert,
  Terminal,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { DEMO_FAILURES } from "../data/failures";

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
      {reproduced ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}
      {reproduced ? "Reproduced" : "Observed, not confirmed"}
    </span>
  );
}

function CodePanel({ title, children, icon: Icon }) {
  return (
    <section className="min-w-0">
      <div className="mb-2 flex items-center gap-2">
        {Icon && <Icon size={15} className="text-[#80e8bf]" />}
        <h2 className="text-sm font-semibold text-[#dce2ea]">
          {title}
        </h2>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#252c35] bg-[#101419] p-3">
        <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-[#dce2ea]">
          {children}
        </pre>
      </div>
    </section>
  );
}

export default function FailureDetailPage() {
  const { failureId } = useParams();

  const failure = DEMO_FAILURES.find(
    (item) => item.id === failureId
  );

  const [retrying, setRetrying] = useState(false);
  const [retryResult, setRetryResult] = useState(null);

  if (!failure) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-[#0b0d0f] px-5 text-center text-[#f1f3f5]">
        <ShieldAlert size={32} className="text-amber-400" />
        <h1 className="mt-4 text-xl font-semibold">
          Failure not found
        </h1>
        <p className="mt-2 text-sm text-[#8292aa]">
          This failure does not exist in the current demo dataset.
        </p>
        <Link
          to="/dashboard/failures"
          className="mt-5 text-sm text-[#80e8bf] hover:text-[#a8f5d4]"
        >
          Back to failure analysis
        </Link>
      </div>
    );
  }

  const handleRetry = () => {
    if (retrying) return;

    setRetrying(true);
    setRetryResult(null);

    // Demo simulation only. Replace with a backend API request.
    window.setTimeout(() => {
      const reproduced =
        failure.successfulReproductions > 0;

      setRetryResult(
        reproduced
          ? "The failure was reproduced in the demo."
          : "The failure could not be reproduced in the demo."
      );

      setRetrying(false);
    }, 1200);
  };

  const reproduced = failure.status === "REPRODUCED";

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
          <Link
            to="/dashboard/failures"
            className="mb-5 inline-flex items-center gap-2 text-xs text-[#8292aa] transition-colors hover:text-[#80e8bf]"
          >
            <ArrowLeft size={14} />
            Back to failure analysis
          </Link>

          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[#8292aa]">
                <span>acme-platform</span>
                <span>/</span>
                <span>{failure.title}</span>
              </div>

              <h1 className="max-w-4xl break-words text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
                {failure.title}
              </h1>

              <p className="mt-2 font-mono text-xs text-[#8292aa]">
                {failure.functionName} · {failure.failureType} · {failure.runId}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <StatusBadge status={failure.status} />
                <span className="text-xs text-[#8292aa]">
                  {failure.summary}
                </span>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              whileHover={!retrying ? { y: -2, scale: 1.02 } : {}}
              whileTap={!retrying ? { scale: 0.97 } : {}}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#303640] bg-[#151a21] px-4 py-2.5 text-xs font-medium text-[#f1f3f5] transition-colors hover:border-[#80e8bf]/50 hover:text-[#80e8bf] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {retrying ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <RotateCcw size={15} />
              )}
              {retrying ? "Retrying..." : "Retry reproduction"}
            </motion.button>
          </div>
        </motion.header>

        {/* Retry feedback */}
        <AnimatePresence>
          {retryResult && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 rounded-lg border border-[#303640] bg-[#11151a] px-4 py-3 text-xs text-[#a3b1c7]"
            >
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-[#80e8bf]" />
                {retryResult}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main evidence grid */}
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">

          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="min-w-0 space-y-5"
          >
            <CodePanel title="Failing input" icon={Terminal}>
              {failure.input}
            </CodePanel>

            <CodePanel title="Expected vs actual" icon={Activity}>
              <span className="text-[#80e8bf]">expected: </span>
              {failure.expected}
              {"\n"}
              <span className="text-red-400">actual:    </span>
              {failure.actual}
            </CodePanel>
          </motion.div>

          {/* Right column */}
          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.14 }}
            className="min-w-0 space-y-5"
          >
            <CodePanel title="Stack trace" icon={Terminal}>
              {failure.stackTrace}
            </CodePanel>

            {/* Related run */}
            <section>
              <h2 className="mb-2 text-sm font-semibold text-[#dce2ea]">
                Related run
              </h2>
              <Link
                to="/dashboard/test-runs"
                className="inline-flex items-center gap-2 font-mono text-xs text-[#80e8bf] transition-colors hover:text-[#a8f5d4]"
              >
                {failure.runId}
                <Play size={12} />
              </Link>
            </section>

            {/* Reproduction attempts */}
            <section className="rounded-xl border border-[#252c35] bg-[#11151a] p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">
                  Reproduction attempts
                </h2>
                <span className="text-xs text-[#8292aa]">
                  {failure.successfulReproductions}/{failure.attempts} reproduced
                </span>
              </div>

              <div className="mt-4 flex gap-1.5">
                {Array.from(
                  { length: failure.attempts },
                  (_, index) => (
                    <motion.div
                      key={index}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className={`h-2 flex-1 origin-left rounded-full ${
                        index < failure.successfulReproductions
                          ? "bg-emerald-400"
                          : "bg-[#303640]"
                      }`}
                    />
                  )
                )}
              </div>

              <p className="mt-3 text-xs leading-6 text-[#8292aa]">
                {failure.summary}
              </p>
            </section>

            {/* Minimization */}
            <section className="rounded-xl border border-[#252c35] bg-[#11151a] p-4">
              <h2 className="text-sm font-semibold">
                Input minimization
              </h2>
              <p className="mt-2 text-xs leading-6 text-[#8292aa]">
                {failure.minimization}
              </p>
            </section>
          </motion.div>
        </div>

        {/* Footer information */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#252c35] pt-4 text-[11px] text-[#65758a]"
        >
          <span>Project: {failure.project}</span>
          <span>Detected: {failure.createdAt}</span>
        </motion.div>

        <p className="mt-4 text-xs text-[#65758a]">
          Demo failure evidence · Retry is simulated and does not execute tests.
        </p>
      </div>
    </motion.main>
  );
}
