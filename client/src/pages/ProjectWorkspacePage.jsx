
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Play, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const projectData = {
  "billing-core": {
    language: "Node 20",
    file: "billing/proration.js",
    functionName: "calcProration",
    code: `/** Prorate a plan price over [start, end). Spec: 2 decimals. */
function calcProration(start, end, plan) {
  if (end < start) throw new RangeError();
  const d = daysBetween(start, end);
  return round((d / 30 * plan.price), 2);
}`,
    candidates: [
      {
        id: 1,
        title: "rejects end before start",
        input: '{start: "2024-03-02", end: "2024-03-01"}',
        expected: "throws RangeError",
        status: "Valid",
        selected: true,
      },
      {
        id: 2,
        title: "leap day full-month boundary",
        input: '{start: "2028-02-29", end: "2028-03-01"}',
        expected: "0.33",
        status: "Valid",
        selected: true,
      },
      {
        id: 3,
        title: "zero-length period",
        input: '{start: "2024-05-01", end: "2024-05-01"}',
        expected: "0",
        status: "Valid",
        selected: true,
      },
      {
        id: 4,
        title: "price rounding to 3 decimals",
        input: "{days: 10, price: 100}",
        expected: "33.333",
        status: "Needs review",
        selected: false,
      },
      {
        id: 5,
        title: "negative price",
        input: "{price: -5}",
        expected: "throws",
        status: "Invalid: undefined spec",
        selected: false,
      },
    ],
  },

  "auth-utils": {
    language: "Node 20",
    file: "auth/validateToken.js",
    functionName: "validateToken",
    code: `function validateToken(token, now = Date.now()) {
  if (!token || typeof token !== "object") {
    throw new TypeError("Invalid token");
  }

  if (token.expiresAt <= now) {
    return false;
  }

  return Boolean(token.userId);
}`,
    candidates: [
      {
        id: 1,
        title: "rejects a missing token",
        input: "{token: null}",
        expected: "throws TypeError",
        status: "Valid",
        selected: true,
      },
      {
        id: 2,
        title: "rejects an expired token",
        input: "{expiresAt: 1000, now: 2000}",
        expected: "false",
        status: "Valid",
        selected: true,
      },
      {
        id: 3,
        title: "accepts a valid user token",
        input: "{userId: 'u1', expiresAt: 9999}",
        expected: "true",
        status: "Valid",
        selected: true,
      },
      {
        id: 4,
        title: "handles missing expiry",
        input: "{userId: 'u1'}",
        expected: "needs specification",
        status: "Needs review",
        selected: false,
      },
    ],
  },

  "inventory-sync": {
    language: "Python 3.12",
    file: "inventory/sync.py",
    functionName: "sync_inventory",
    code: `def sync_inventory(local_stock, remote_stock):
    if local_stock < 0 or remote_stock < 0:
        raise ValueError("Stock cannot be negative")

    return min(local_stock, remote_stock)`,
    candidates: [
      {
        id: 1,
        title: "handles zero stock",
        input: "{local_stock: 0, remote_stock: 5}",
        expected: "0",
        status: "Valid",
        selected: true,
      },
      {
        id: 2,
        title: "rejects negative local stock",
        input: "{local_stock: -1, remote_stock: 5}",
        expected: "raises ValueError",
        status: "Valid",
        selected: true,
      },
      {
        id: 3,
        title: "uses the smaller stock value",
        input: "{local_stock: 8, remote_stock: 3}",
        expected: "3",
        status: "Valid",
        selected: true,
      },
      {
        id: 4,
        title: "handles unexpected string input",
        input: "{local_stock: '8', remote_stock: 3}",
        expected: "needs specification",
        status: "Needs review",
        selected: false,
      },
    ],
  },
};

const springTransition = {
  type: "spring",
  stiffness: 260,
  damping: 24,
};

export default function ProjectWorkspacePage() {
  const { projectId } = useParams();
  const project = projectData[projectId];

  const [candidates, setCandidates] = useState(() =>
    (project?.candidates ?? []).map((candidate) => ({
      ...candidate,
      decision: null,
    }))
  );

  const [notice, setNotice] = useState("");

  if (!project) {
    return (
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-full bg-[#0b0d0f] p-6 text-[#f1f3f5]"
      >
        <h1 className="text-xl font-semibold">Project not found</h1>

        <p className="mt-2 text-sm text-[#8292aa]">
          This project does not exist in the demo project list.
        </p>

        <Link
          to="/dashboard/projects"
          className="mt-4 inline-flex items-center text-sm text-[#80e8bf] hover:underline"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to projects
        </Link>
      </motion.main>
    );
  }

  const updateCandidate = (id, changes) => {
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id ? { ...candidate, ...changes } : candidate
      )
    );

    setNotice("");
  };

  const selectedCount = candidates.filter(
    (candidate) => candidate.selected && !candidate.decision
  ).length;

  const approveSelected = () => {
    if (!selectedCount) {
      setNotice("Select at least one undecided candidate.");
      return;
    }

    setCandidates((current) =>
      current.map((candidate) =>
        candidate.selected && !candidate.decision
          ? { ...candidate, decision: "Approved" }
          : candidate
      )
    );

    setNotice(`${selectedCount} candidate(s) approved.`);
  };

  const generateTests = () => {
    setNotice(
      "Demo workspace: connect the test-generation API to generate real candidates."
    );
  };

  const executeApproved = () => {
    const approvedCount = candidates.filter(
      (candidate) => candidate.decision === "Approved"
    ).length;

    setNotice(
      approvedCount
        ? `${approvedCount} candidate(s) approved. Connect the execution API to run them.`
        : "Approve candidates before executing tests."
    );
  };

  const toggleSelectAll = () => {
    const undecided = candidates.filter(
      (candidate) => !candidate.decision
    );

    const allSelected =
      undecided.length > 0 &&
      undecided.every((candidate) => candidate.selected);

    setCandidates((current) =>
      current.map((candidate) =>
        candidate.decision
          ? candidate
          : { ...candidate, selected: !allSelected }
      )
    );
  };

  const rejectCandidate = (candidate) => {
    setCandidates((current) =>
      current.map((item) =>
        item.id === candidate.id
          ? { ...item, decision: "Rejected", selected: false }
          : item
      )
    );

    setNotice(`Rejected "${candidate.title}".`);
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-full bg-[#0b0d0f] p-5 text-[#f1f3f5] sm:p-6"
    >
      {/* Workspace header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-5 flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-[#8292aa]">
            <Link
              to="/dashboard/projects"
              className="transition-colors hover:text-[#80e8bf]"
            >
              acme-platform
            </Link>

            <span>/</span>

            <Link
              to="/dashboard/projects"
              className="transition-colors hover:text-[#80e8bf]"
            >
              Projects
            </Link>

            <span>/</span>
            <span>{projectId} workspace</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            {projectId} workspace
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <motion.button
            type="button"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.18 }}
            onClick={generateTests}
            className="inline-flex items-center gap-2 rounded-md border border-[#29313b] bg-[#151a20] px-3 py-2.5 text-sm transition-colors hover:border-[#80e8bf]/50"
          >
            <Sparkles size={16} />
            Generate tests
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.18 }}
            onClick={executeApproved}
            className="inline-flex items-center gap-2 rounded-md bg-[#80e8bf] px-3 py-2.5 text-sm font-medium text-[#0b0d0f] transition-colors hover:bg-[#9af0cc]"
          >
            <Play size={15} />
            Execute approved
          </motion.button>
        </div>
      </motion.div>

      {/* Animated notification */}
      <AnimatePresence mode="wait">
        {notice && (
          <motion.div
            key={notice}
            role="status"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.22 }}
            className="mb-4 overflow-hidden rounded-lg border border-[#344b41] bg-[#14211b] px-4 py-3 text-sm text-[#a4edca]"
          >
            {notice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workspace panels */}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,1fr)]">
        {/* Source code panel */}
        <motion.section
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="min-w-0"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">{project.file}</h2>

              <p className="mt-1 text-xs text-[#8292aa]">
                {project.functionName} · {project.language}
              </p>
            </div>

            <span className="rounded-full border border-[#29313b] px-2.5 py-1 text-xs text-[#8292aa]">
              Source
            </span>
          </div>

          <motion.pre
            whileHover={{
              borderColor: "rgba(128, 232, 191, 0.35)",
            }}
            transition={{ duration: 0.2 }}
            className="overflow-x-auto rounded-lg border border-[#252c35] bg-[#101419] p-4 text-sm leading-7 text-[#c6d3e2]"
          >
            <code>{project.code}</code>
          </motion.pre>

          <p className="mt-3 text-xs leading-5 text-[#8292aa]">
            Demo source code. Connect your repository or file-loading API to
            display real project files.
          </p>
        </motion.section>

        {/* Candidate review panel */}
        <motion.section
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.16 }}
          className="min-w-0 overflow-hidden rounded-xl border border-[#252c35] bg-[#101419]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252c35] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              Candidates

              <span className="font-normal text-[#8292aa]">
                awaiting review
              </span>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15 }}
              onClick={toggleSelectAll}
              className="rounded-md border border-[#29313b] px-3 py-2 text-xs transition-colors hover:bg-[#1a2027]"
            >
              Select all
            </motion.button>
          </div>

          <div>
            <AnimatePresence initial={false}>
              {candidates.map((candidate, index) => (
                <motion.article
                  key={`${projectId}-${candidate.id}`}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{
                    opacity: { duration: 0.22 },
                    y: springTransition,
                    x: { duration: 0.2 },
                    layout: { duration: 0.22 },
                    delay: index * 0.045,
                  }}
                  className="border-b border-[#252c35] p-4 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={candidate.selected}
                      disabled={Boolean(candidate.decision)}
                      onChange={(event) =>
                        updateCandidate(candidate.id, {
                          selected: event.target.checked,
                        })
                      }
                      aria-label={`Select ${candidate.title}`}
                      className="mt-1 accent-[#80e8bf]"
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold">
                        {candidate.title}
                      </h3>

                      <p className="mt-1 break-words font-mono text-xs leading-5 text-[#a2b1c5]">
                        {candidate.input} → {candidate.expected}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] ${
                            candidate.status === "Valid"
                              ? "border-[#4b86c5] text-[#91c4ff]"
                              : "border-[#a77a2c] text-[#f2c56b]"
                          }`}
                        >
                          {candidate.status}
                        </span>

                        <AnimatePresence>
                          {candidate.decision && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.85 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.85 }}
                              transition={{ duration: 0.18 }}
                              className={`rounded-full border px-2 py-0.5 text-[11px] ${
                                candidate.decision === "Approved"
                                  ? "border-[#477b65] text-[#80e8bf]"
                                  : "border-red-400/40 text-red-300"
                              }`}
                            >
                              {candidate.decision}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {!candidate.decision && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => rejectCandidate(candidate)}
                        className="shrink-0 rounded-md border border-[#29313b] px-3 py-2 text-xs transition-colors hover:border-red-400/60 hover:text-red-300"
                      >
                        Reject
                      </motion.button>
                    )}
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          <div className="border-t border-[#252c35] p-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15 }}
              onClick={approveSelected}
              className="rounded-md bg-[#80e8bf] px-4 py-2.5 text-sm font-medium text-[#0b0d0f] transition-colors hover:bg-[#9af0cc]"
            >
              Approve {selectedCount} selected
            </motion.button>
          </div>
        </motion.section>
      </div>
    </motion.main>
  );
}
