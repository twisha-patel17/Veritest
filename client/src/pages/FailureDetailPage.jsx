
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  ShieldAlert,
  Terminal,
  AlertTriangle,
} from "lucide-react";
import { motion } from "motion/react";

import { getFailureById } from "../services/failureService";

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
      {reproduced ? "Reproduced" : "Unconfirmed"}
    </span>
  );
}

function CodePanel({ title, children, icon: Icon }) {
  const hasContent =
    children !== null &&
    children !== undefined &&
    String(children).trim() !== "";

  return (
    <section className="min-w-0">
      <div className="mb-2 flex items-center gap-2">
        {Icon && <Icon size={15} className="text-[#80e8bf]" />}
        <h2 className="text-sm font-semibold text-[#dce2ea]">{title}</h2>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#252c35] bg-[#101419] p-3">
        <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-[#dce2ea]">
          {hasContent ? String(children) : "No data available."}
        </pre>
      </div>
    </section>
  );
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString();
}

function formatStatus(value) {
  if (!value) return "Unknown";

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function FailureDetailPage() {
  const { failureId } = useParams();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [failure, setFailure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadFailure = async () => {
      if (!projectId || !failureId) {
        setError("The project ID or failure ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await getFailureById(projectId, failureId);

        if (!active) return;

        setFailure(response.failure || response.data?.failure || null);
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            "Unable to load this failure. It may no longer exist."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadFailure();

    return () => {
      active = false;
    };
  }, [projectId, failureId]);

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center gap-3 bg-[#0b0d0f] text-sm text-[#8292aa]">
        <LoaderCircle size={18} className="animate-spin text-[#80e8bf]" />
        Loading failure details...
      </div>
    );
  }

  if (error || !failure) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-[#0b0d0f] px-5 text-center text-[#f1f3f5]">
        <ShieldAlert size={32} className="text-amber-400" />
        <h1 className="mt-4 text-xl font-semibold">
          Unable to load failure
        </h1>
        <p className="mt-2 max-w-md text-sm text-[#8292aa]">
          {error || "The requested failure could not be found."}
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

  const testResult = failure.testResult || {};
  const testCase = testResult.testCase || {};
  const testRun = testResult.testRun || {};
  const attempts = failure.reproductionAttempts || [];

  const sourceFileName =
    typeof testCase.sourceFile === "string"
      ? testCase.sourceFile
      : testCase.sourceFile?.name;

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

          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[#8292aa]">
            <span>Failure analysis</span>
            <span>/</span>
            <span className="text-[#a3b1c7]">
              {failure.title || "Failure details"}
            </span>
          </div>

          <h1 className="max-w-4xl break-words text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
            {failure.title || testCase.title || "Untitled failure"}
          </h1>

          <p className="mt-2 text-xs text-[#8292aa]">
            {testCase.title || "Test case"} · {formatStatus(failure.type)}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusBadge status={failure.status} />
            <span className="text-xs text-[#8292aa]">
              Detected {formatDate(testRun.createdAt)}
            </span>
          </div>
        </motion.header>

        {/* Failure overview */}
        <section className="mb-6 rounded-xl border border-[#252c35] bg-[#11151a] p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400" />
            <h2 className="text-sm font-semibold">Failure overview</h2>
          </div>

          <p className="mt-3 break-words text-sm leading-6 text-[#c4cedb]">
            {failure.errorMessage || "No error message was recorded."}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-[#252c35] pt-4 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <p className="text-[11px] text-[#65758a]">Test case</p>
              <p className="mt-1 break-words text-xs text-[#dce2ea]">
                {testCase.title || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-[#65758a]">Source file</p>
              <p className="mt-1 break-all font-mono text-xs text-[#dce2ea]">
                {sourceFileName || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-[#65758a]">Test run</p>
              <p className="mt-1 break-all font-mono text-xs text-[#dce2ea]">
                {testRun.id || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-[#65758a]">Run status</p>
              <p className="mt-1 text-xs text-[#dce2ea]">
                {formatStatus(testRun.status)}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-[#65758a]">Failure type</p>
              <p className="mt-1 text-xs text-[#dce2ea]">
                {formatStatus(failure.type)}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-[#65758a]">Detected at</p>
              <p className="mt-1 text-xs text-[#dce2ea]">
                {formatDate(testRun.completedAt || testRun.createdAt)}
              </p>
            </div>
          </div>
        </section>

        {/* Evidence */}
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="min-w-0 space-y-5"
          >
            <CodePanel title="Failing input" icon={Terminal}>
              {failure.failingInput}
            </CodePanel>

            <CodePanel title="Expected value" icon={CheckCircle2}>
              {failure.expected}
            </CodePanel>

            <CodePanel title="Actual value" icon={AlertTriangle}>
              {failure.actual}
            </CodePanel>

            {testCase.testCode && (
              <CodePanel title="Test code" icon={Terminal}>
                {testCase.testCode}
              </CodePanel>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.14 }}
            className="min-w-0 space-y-5"
          >
            <CodePanel title="Error message" icon={AlertTriangle}>
              {failure.errorMessage}
            </CodePanel>

            <CodePanel title="Stack trace" icon={Terminal}>
              {failure.stackTrace}
            </CodePanel>

            <CodePanel title="Standard output (stdout)" icon={Terminal}>
              {failure.stdout}
            </CodePanel>

            <CodePanel title="Standard error (stderr)" icon={Terminal}>
              {failure.stderr}
            </CodePanel>
          </motion.div>
        </div>

        {/* Reproduction attempts */}
        <section className="mt-6 rounded-xl border border-[#252c35] bg-[#11151a] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">
              Reproduction attempts
            </h2>
            <span className="text-xs text-[#8292aa]">
              {attempts.length} recorded attempt(s)
            </span>
          </div>

          {attempts.length === 0 ? (
            <p className="mt-4 text-xs leading-6 text-[#8292aa]">
              No reproduction attempts have been recorded for this failure.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {attempts.map((attempt) => (
                <div
                  key={attempt.id || attempt.attemptNumber}
                  className="rounded-lg border border-[#252c35] bg-[#101419] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#dce2ea]">
                      Attempt #{attempt.attemptNumber}
                    </span>
                    <span className="text-xs text-[#8292aa]">
                      {formatStatus(attempt.status)}
                    </span>
                  </div>

                  {attempt.errorMessage && (
                    <p className="mt-2 break-words text-xs leading-5 text-[#8292aa]">
                      {attempt.errorMessage}
                    </p>
                  )}

                  {attempt.stackTrace && (
                    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-5 text-[#8292aa]">
                      {attempt.stackTrace}
                    </pre>
                  )}

                  {attempt.duration != null && (
                    <p className="mt-2 text-[11px] text-[#65758a]">
                      Duration: {attempt.duration} ms
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="mt-5 text-xs text-[#65758a]">
          Evidence shown here is retrieved from the stored test execution result.
        </p>
      </div>
    </motion.main>
  );
}
