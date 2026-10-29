
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Play, Sparkles } from "lucide-react";

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
      <main className="min-h-full bg-[#0b0d0f] p-6 text-[#f1f3f5]">
        <h1 className="text-xl font-semibold">Project not found</h1>
        <p className="mt-2 text-sm text-[#8292aa]">
          This project does not exist in the demo project list.
        </p>
        <Link
          to="/dashboard/projects"
          className="mt-4 inline-flex text-sm text-[#80e8bf] hover:underline"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to projects
        </Link>
      </main>
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

  return (
    <main className="min-h-full bg-[#0b0d0f] p-5 text-[#f1f3f5] sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-[#8292aa]">
            <Link
              to="/dashboard/projects"
              className="hover:text-[#80e8bf]"
            >
              acme-platform
            </Link>
            <span>/</span>
            <Link
              to="/dashboard/projects"
              className="hover:text-[#80e8bf]"
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

        <div className="flex gap-2">
          <button
            type="button"
            onClick={generateTests}
            className="inline-flex items-center gap-2 rounded-md border border-[#29313b] bg-[#151a20] px-3 py-2.5 text-sm hover:border-[#80e8bf]/50"
          >
            <Sparkles size={16} />
            Generate tests
          </button>

          <button
            type="button"
            onClick={executeApproved}
            className="inline-flex items-center gap-2 rounded-md bg-[#80e8bf] px-3 py-2.5 text-sm font-medium text-[#0b0d0f] hover:bg-[#9af0cc]"
          >
            <Play size={15} />
            Execute approved
          </button>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-[#344b41] bg-[#14211b] px-4 py-3 text-sm text-[#a4edca]"
        >
          {notice}
        </div>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,1fr)]">
        <section className="min-w-0">
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

          <pre className="overflow-x-auto rounded-lg border border-[#252c35] bg-[#101419] p-4 text-sm leading-7 text-[#c6d3e2]">
            <code>{project.code}</code>
          </pre>

          <p className="mt-3 text-xs leading-5 text-[#8292aa]">
            Demo source code. Connect your repository or file-loading API to
            display real project files.
          </p>
        </section>

        <section className="min-w-0 overflow-hidden rounded-xl border border-[#252c35] bg-[#101419]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252c35] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              Candidates
              <span className="font-normal text-[#8292aa]">
                awaiting review
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                const undecided = candidates.filter(
                  (candidate) => !candidate.decision
                );
                const allSelected = undecided.every(
                  (candidate) => candidate.selected
                );

                setCandidates((current) =>
                  current.map((candidate) =>
                    candidate.decision
                      ? candidate
                      : { ...candidate, selected: !allSelected }
                  )
                );
              }}
              className="rounded-md border border-[#29313b] px-3 py-2 text-xs hover:bg-[#1a2027]"
            >
              Select all
            </button>
          </div>

          <div>
            {candidates.map((candidate) => (
              <article
                key={candidate.id}
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
                            : candidate.status === "Needs review"
                              ? "border-[#a77a2c] text-[#f2c56b]"
                              : "border-[#a77a2c] text-[#f2c56b]"
                        }`}
                      >
                        {candidate.status}
                      </span>

                      {candidate.decision && (
                        <span className="rounded-full border border-[#477b65] px-2 py-0.5 text-[11px] text-[#80e8bf]">
                          {candidate.decision}
                        </span>
                      )}
                    </div>
                  </div>

                  {!candidate.decision && (
                    <button
                      type="button"
                      onClick={() => {
                        updateCandidate(candidate.id, {
                          decision: "Rejected",
                          selected: false,
                        });
                        setNotice(`Rejected "${candidate.title}".`);
                      }}
                      className="rounded-md border border-[#29313b] px-3 py-2 text-xs hover:border-red-400/60 hover:text-red-300"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="border-t border-[#252c35] p-4">
            <button
              type="button"
              onClick={approveSelected}
              className="rounded-md bg-[#80e8bf] px-4 py-2.5 text-sm font-medium text-[#0b0d0f] hover:bg-[#9af0cc]"
            >
              Approve {selectedCount} selected
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
