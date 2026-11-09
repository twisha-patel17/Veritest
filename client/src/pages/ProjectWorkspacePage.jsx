
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Sparkles,
  FileCode2,
  FolderOpen,
  Plus,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { getProjectById } from "../services/projectService";
import { createSourceFile } from "../services/sourceFileService";
import {
  getTestCases,
  updateTestCase,
} from "../services/testcaseService";
import {
  createTestRun,
  executeTestRun,
} from "../services/testrunService";

const springTransition = {
  type: "spring",
  stiffness: 260,
  damping: 24,
};

function formatLanguage(language) {
  const languages = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
  };

  return languages[language] || language;
}

export default function ProjectWorkspacePage() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [sourceFiles, setSourceFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [candidates, setCandidates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Add source file modal state.
  const [showAddFile, setShowAddFile] = useState(false);
  const [savingFile, setSavingFile] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [latestTestRun, setLatestTestRun] = useState(null);

  const [fileForm, setFileForm] = useState({
    fileName: "",
    filePath: "",
    language: "javascript",
    content: "",
  });

  // Fetch project and its saved source files.
  useEffect(() => {
    let cancelled = false;

    const fetchProject = async () => {
      try {
        setLoading(true);
        setError("");

        const [projectResponse, testCaseResponse] = await Promise.all([
          getProjectById(projectId),
          getTestCases(projectId),
        ]);

        if (!projectResponse.success || !projectResponse.project) {
          throw new Error("Unable to load project.");
        }

        if (!testCaseResponse.success) {
          throw new Error("Unable to load saved test cases.");
        }

        if (cancelled) return;

        const loadedProject = projectResponse.project;
        const savedTestCases = testCaseResponse.testCases || [];
        const files = loadedProject.sourceFiles || [];

        setProject(loadedProject);
        setSourceFiles(files);
        setActiveFileId(files[0]?.id || null);

        setFileForm((current) => ({
          ...current,
          language: loadedProject.language || "javascript",
        }));

        // Restore saved test cases and their review decisions.
        setCandidates(
          savedTestCases.map((testCase) => ({
            ...testCase,
            selected: false,
            decision:
              testCase.status === "APPROVED"
                ? "Approved"
                : testCase.status === "REJECTED"
                  ? "Rejected"
                  : "",
          }))
        );
      } catch (err) {
        if (cancelled) return;

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load project."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProject();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const activeFile = sourceFiles.find(
    (file) => file.id === activeFileId
  );

  const selectedCount = candidates.filter(
    (candidate) =>
      candidate.selected && candidate.status === "PENDING"
  ).length;

  const approvedCount = candidates.filter(
    (candidate) => candidate.status === "APPROVED"
  ).length;

  const updateCandidate = (id, changes) => {
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id
          ? { ...candidate, ...changes }
          : candidate
      )
    );

    setNotice("");
  };

  // Save a new source file through the backend API.
  const handleAddFile = async (event) => {
    event.preventDefault();

    if (!fileForm.fileName.trim() || !fileForm.content.trim()) {
      setNotice("File name and source code are required.");
      return;
    }

    try {
      setSavingFile(true);
      setNotice("");

      const fileData = {
        ...fileForm,
        fileName: fileForm.fileName.trim(),
        filePath:
          fileForm.filePath.trim() || fileForm.fileName.trim(),
      };

      const response = await createSourceFile(projectId, fileData);

      if (!response.success || !response.sourceFile) {
        throw new Error("Unable to save source file.");
      }

      const savedFile = response.sourceFile;

      setSourceFiles((current) => [...current, savedFile]);
      setActiveFileId(savedFile.id);

      setFileForm({
        fileName: "",
        filePath: "",
        language: project.language || "javascript",
        content: "",
      });

      setShowAddFile(false);
      setNotice("Source file saved successfully.");
    } catch (err) {
      setNotice(
        err.response?.data?.message ||
          err.message ||
          "Failed to save source file."
      );
    } finally {
      setSavingFile(false);
    }
  };

  // Persist a test case review decision through the backend API.
  const saveReviewDecision = async (candidate, status) => {
    try {
      setNotice("");

      const response = await updateTestCase(
        projectId,
        candidate.id,
        { status }
      );

      if (!response.success || !response.testCase) {
        throw new Error("Unable to update this test case.");
      }

      const savedTestCase = response.testCase;

      setCandidates((current) =>
        current.map((item) =>
          item.id === candidate.id
            ? {
                ...savedTestCase,
                selected: false,
                decision:
                  savedTestCase.status === "APPROVED"
                    ? "Approved"
                    : savedTestCase.status === "REJECTED"
                      ? "Rejected"
                      : "",
              }
            : item
        )
      );

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to update test case.",
      };
    }
  };

  const approveSelected = async () => {
    const selectedCandidates = candidates.filter(
      (candidate) =>
        candidate.selected && candidate.status === "PENDING"
    );

    if (!selectedCandidates.length) {
      setNotice("Select at least one pending candidate.");
      return;
    }

    const results = await Promise.all(
      selectedCandidates.map((candidate) =>
        saveReviewDecision(candidate, "APPROVED")
      )
    );

    const approved = results.filter((result) => result.success).length;
    const failed = results.length - approved;

    if (failed === 0) {
      setNotice(`${approved} candidate(s) approved and saved.`);
    } else {
      setNotice(
        `${approved} candidate(s) approved. ${failed} could not be updated. ${results.find((result) => !result.success)?.message || ""}`
      );
    }
  };

  const generateTests = () => {
    if (!sourceFiles.length) {
      setNotice("Add a source file before generating tests.");
      return;
    }

    setNotice(
      "Test generation will be connected to the GenAI service next."
    );
  };

  const executeApproved = async () => {
    if (!approvedCount) {
      setNotice("Approve test candidates before executing tests.");
      return;
    }

    try {
      setIsExecuting(true);
      setNotice("Creating a new test run...");

      // Step 1: Create a new TestRun.
      const createResponse = await createTestRun(projectId);

      if (!createResponse.success || !createResponse.testRun?.id) {
        throw new Error(
          createResponse.message || "Failed to create test run."
        );
      }

      const testRunId = createResponse.testRun.id;

      setNotice("Executing approved test cases...");

      // Step 2: Execute the newly created TestRun.
      const executionResponse = await executeTestRun(
        projectId,
        testRunId
      );

      if (!executionResponse.success || !executionResponse.testRun) {
        throw new Error(
          executionResponse.message || "Test execution failed."
        );
      }

      // Step 3: Read the execution summary.
      const testRun = executionResponse.testRun;
      setLatestTestRun(testRun);

      setNotice(
        `Execution completed! ${testRun.passedTests} passed, ` +
          `${testRun.failedTests} failed, out of ${testRun.totalTests} tests.`
      );
    } catch (err) {
      setNotice(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong during test execution."
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const toggleSelectAll = () => {
    const pendingCandidates = candidates.filter(
      (candidate) => candidate.status === "PENDING"
    );

    const allSelected =
      pendingCandidates.length > 0 &&
      pendingCandidates.every((candidate) => candidate.selected);

    setCandidates((current) =>
      current.map((candidate) =>
        candidate.status !== "PENDING"
          ? candidate
          : { ...candidate, selected: !allSelected }
      )
    );
  };

  const rejectCandidate = async (candidate) => {
    const result = await saveReviewDecision(candidate, "REJECTED");

    if (result.success) {
      setNotice(`Rejected "${candidate.title}" and saved the decision.`);
    } else {
      setNotice(result.message);
    }
  };

  // Loading state.
  if (loading) {
    return (
      <main className="min-h-full bg-[#0b0d0f] p-6 text-[#f1f3f5]">
        <div className="flex items-center gap-3 text-sm text-[#8292aa]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#80e8bf]/30 border-t-[#80e8bf]" />
          Loading project workspace...
        </div>
      </main>
    );
  }

  // Error state.
  if (error || !project) {
    return (
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-full bg-[#0b0d0f] p-6 text-[#f1f3f5]"
      >
        <h1 className="text-xl font-semibold">
          Project not found
        </h1>

        <p className="mt-2 text-sm text-[#8292aa]">
          {error || "Unable to load this project."}
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
              Projects
            </Link>

            <span>/</span>
            <span>{project.name}</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            {project.name}
          </h1>

          <p className="mt-1 text-xs text-[#8292aa]">
            {formatLanguage(project.language)}
            {project.framework && ` · ${project.framework}`}
          </p>
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
            disabled={isExecuting || !approvedCount}
            className="inline-flex items-center gap-2 rounded-md bg-[#80e8bf] px-3 py-2.5 text-sm font-medium text-[#0b0d0f] transition-colors hover:bg-[#9af0cc] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0b0d0f]/30 border-t-[#0b0d0f]" />
                Executing...
              </>
            ) : (
              <>
                <Play size={15} />
                Execute approved
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Notification */}
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

      {/* Latest execution results */}
      <AnimatePresence>
        {latestTestRun && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mb-5 overflow-hidden rounded-xl border border-[#252c35] bg-[#101419]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252c35] p-4">
              <div>
                <h2 className="text-sm font-semibold">Latest execution</h2>
                <p className="mt-1 text-xs text-[#8292aa]">
                  {latestTestRun.createdAt
                    ? `Run started ${new Date(latestTestRun.createdAt).toLocaleString()}`
                    : "Most recent test run"}
                </p>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  latestTestRun.status === "COMPLETED"
                    ? "border-[#477b65] text-[#80e8bf]"
                    : latestTestRun.status === "FAILED"
                      ? "border-red-400/40 text-red-300"
                      : "border-[#4b86c5] text-[#91c4ff]"
                }`}
              >
                {latestTestRun.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-[#252c35] p-4 sm:grid-cols-4">
              {[
                { label: "Total tests", value: latestTestRun.totalTests ?? 0 },
                { label: "Passed", value: latestTestRun.passedTests ?? 0 },
                { label: "Failed", value: latestTestRun.failedTests ?? 0 },
                {
                  label: "Duration",
                  value:
                    latestTestRun.duration != null
                      ? `${latestTestRun.duration} ms`
                      : "—",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-[#252c35] bg-[#0b0d0f] p-3"
                >
                  <p className="text-[11px] text-[#8292aa]">{item.label}</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-[#f1f3f5]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8292aa]">
                Test results
              </h3>

              {latestTestRun.results?.length > 0 ? (
                <div className="space-y-3">
                  {latestTestRun.results.map((result, index) => {
                    const passed = result.status === "PASSED";

                    return (
                      <article
                        key={result.id || `${result.testCaseId}-${index}`}
                        className="rounded-lg border border-[#252c35] bg-[#0b0d0f] p-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="break-words text-sm font-medium text-[#dce2ea]">
                              {result.testCase?.title || `Test ${index + 1}`}
                            </h4>
                            {result.testCase?.sourceFile && (
                              <p className="mt-1 text-[11px] text-[#65758a]">
                                {result.testCase.sourceFile}
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <span className="text-[11px] tabular-nums text-[#8292aa]">
                              {result.duration != null
                                ? `${result.duration} ms`
                                : "—"}
                            </span>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                                passed
                                  ? "border-[#477b65] text-[#80e8bf]"
                                  : "border-red-400/40 text-red-300"
                              }`}
                            >
                              {result.status}
                            </span>
                          </div>
                        </div>

                        {(result.errorMessage || result.stderr || result.stdout) && (
                          <details className="mt-3 border-t border-[#252c35] pt-2">
                            <summary className="cursor-pointer text-xs text-[#91c4ff] hover:text-[#b4d7ff]">
                              View execution details
                            </summary>

                            {result.errorMessage && (
                              <div className="mt-3">
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-red-300">
                                  Error
                                </p>
                                <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-[#171014] p-3 text-xs leading-5 text-red-200">
                                  {result.errorMessage}
                                </pre>
                              </div>
                            )}

                            {result.stderr && (
                              <div className="mt-3">
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-red-300">
                                  Stderr
                                </p>
                                <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-[#171014] p-3 text-xs leading-5 text-red-200">
                                  {result.stderr}
                                </pre>
                              </div>
                            )}

                            {result.stdout && (
                              <div className="mt-3">
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#8292aa]">
                                  Stdout
                                </p>
                                <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-[#101419] p-3 text-xs leading-5 text-[#c6d3e2]">
                                  {result.stdout}
                                </pre>
                              </div>
                            )}

                            {result.exitCode != null && (
                              <p className="mt-2 text-[11px] text-[#65758a]">
                                Exit code: {result.exitCode}
                              </p>
                            )}
                          </details>
                        )}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-[#29313b] px-4 py-6 text-center text-xs text-[#8292aa]">
                  This run did not return individual test result details.
                </p>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Workspace panels */}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,1fr)]">
        {/* Source files panel */}
        <motion.section
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="min-w-0"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">
                Source code
              </h2>

              <p className="mt-1 text-xs text-[#8292aa]">
                {sourceFiles.length} saved file(s)
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setNotice("");
                setShowAddFile(true);
              }}
              className="inline-flex items-center gap-2 rounded-md bg-[#80e8bf] px-3 py-2 text-xs font-medium text-[#0b0d0f] transition-colors hover:bg-[#9af0cc]"
            >
              <Plus size={14} />
              Add file
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#252c35] bg-[#101419]">
            {sourceFiles.length > 0 ? (
              <>
                {/* File selector */}
                <div className="flex flex-wrap items-center gap-2 border-b border-[#252c35] p-3">
                  <FolderOpen
                    size={15}
                    className="shrink-0 text-[#80e8bf]"
                  />

                  <select
                    value={activeFileId || ""}
                    onChange={(event) =>
                      setActiveFileId(event.target.value)
                    }
                    className="min-w-0 flex-1 bg-transparent text-sm text-[#dce2ea] outline-none"
                    aria-label="Select source file"
                  >
                    {sourceFiles.map((file) => (
                      <option
                        key={file.id}
                        value={file.id}
                        className="bg-[#101419]"
                      >
                        {file.filePath || file.fileName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected file */}
                {activeFile && (
                  <>
                    <div className="flex items-center gap-2 border-b border-[#252c35] px-4 py-3">
                      <FileCode2
                        size={15}
                        className="text-[#80e8bf]"
                      />

                      <span className="truncate text-xs text-[#a3b1c7]">
                        {activeFile.fileName}
                      </span>

                      <span className="ml-auto text-[11px] text-[#65758a]">
                        {formatLanguage(activeFile.language)}
                      </span>
                    </div>

                    <motion.pre
                      whileHover={{
                        borderColor: "rgba(128, 232, 191, 0.2)",
                      }}
                      transition={{ duration: 0.2 }}
                      className="max-h-[600px] overflow-auto p-4 text-sm leading-7 text-[#c6d3e2]"
                    >
                      <code>{activeFile.content}</code>
                    </motion.pre>
                  </>
                )}
              </>
            ) : (
              <div className="px-5 py-12 text-center">
                <FolderOpen
                  size={28}
                  className="mx-auto text-[#65758a]"
                />

                <h3 className="mt-3 text-sm font-medium text-[#dce2ea]">
                  No source files yet
                </h3>

                <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-[#8292aa]">
                  Add source files to this project before generating
                  test candidates.
                </p>
              </div>
            )}
          </div>
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
              disabled={!candidates.some((candidate) => candidate.status === "PENDING")}
              className="rounded-md border border-[#29313b] px-3 py-2 text-xs transition-colors hover:bg-[#1a2027] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Select all
            </motion.button>
          </div>

          <div>
            {candidates.length > 0 ? (
              <AnimatePresence initial={false}>
                {candidates.map((candidate, index) => (
                  <motion.article
                    key={candidate.id}
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
                        checked={Boolean(candidate.selected)}
                        disabled={candidate.status !== "PENDING"}
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

                        {candidate.description && (
                          <p className="mt-1 break-words text-xs leading-5 text-[#a2b1c5]">
                            {candidate.description}
                          </p>
                        )}

                        {candidate.sourceFile && (
                          <p className="mt-2 text-[11px] text-[#65758a]">
                            Source: {candidate.sourceFile}
                          </p>
                        )}

                        <pre className="mt-3 max-h-52 overflow-auto rounded-md border border-[#252c35] bg-[#0b0d0f] p-3 text-xs leading-5 text-[#c6d3e2]">
                          <code>{candidate.testCode}</code>
                        </pre>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-[#4b86c5] px-2 py-0.5 text-[11px] text-[#91c4ff]">
                            {candidate.origin || "MANUAL"}
                          </span>

                          <span
                            className={`rounded-full border px-2 py-0.5 text-[11px] ${
                              candidate.status === "APPROVED"
                                ? "border-[#477b65] text-[#80e8bf]"
                                : candidate.status === "REJECTED"
                                  ? "border-red-400/40 text-red-300"
                                  : "border-[#4b86c5] text-[#91c4ff]"
                            }`}
                          >
                            {candidate.status}
                          </span>
                        </div>
                      </div>

                      {candidate.status === "PENDING" && (
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
            ) : (
              <div className="px-5 py-12 text-center">
                <Sparkles
                  size={28}
                  className="mx-auto text-[#80e8bf]"
                />

                <h3 className="mt-3 text-sm font-medium text-[#dce2ea]">
                  No test candidates yet
                </h3>

                <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-[#8292aa]">
                  Generate tests from your source code to review
                  AI-proposed test cases here.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-[#252c35] p-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15 }}
              onClick={approveSelected}
              disabled={!selectedCount}
              className="rounded-md bg-[#80e8bf] px-4 py-2.5 text-sm font-medium text-[#0b0d0f] transition-colors hover:bg-[#9af0cc] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Approve {selectedCount} selected
            </motion.button>
          </div>
        </motion.section>
      </div>

      {/* Add source file modal */}
      <AnimatePresence>
        {showAddFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget && !savingFile) {
                setShowAddFile(false);
              }
            }}
          >
            <motion.form
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15 }}
              onSubmit={handleAddFile}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#29313b] bg-[#101419] p-5"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Add source file
                  </h2>

                  <p className="mt-1 text-xs text-[#8292aa]">
                    Save code to this project.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={savingFile}
                  onClick={() => setShowAddFile(false)}
                  className="rounded-md p-2 text-[#8292aa] hover:bg-[#1a2027] disabled:opacity-40"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs text-[#a3b1c7]">
                  File name

                  <input
                    required
                    maxLength={255}
                    value={fileForm.fileName}
                    onChange={(event) =>
                      setFileForm((current) => ({
                        ...current,
                        fileName: event.target.value,
                      }))
                    }
                    placeholder="calculator.js"
                    className="mt-2 w-full rounded-md border border-[#29313b] bg-[#0b0d0f] px-3 py-2.5 text-sm text-white outline-none focus:border-[#80e8bf]"
                  />
                </label>

                <label className="text-xs text-[#a3b1c7]">
                  File path

                  <input
                    maxLength={255}
                    value={fileForm.filePath}
                    onChange={(event) =>
                      setFileForm((current) => ({
                        ...current,
                        filePath: event.target.value,
                      }))
                    }
                    placeholder="src/calculator.js"
                    className="mt-2 w-full rounded-md border border-[#29313b] bg-[#0b0d0f] px-3 py-2.5 text-sm text-white outline-none focus:border-[#80e8bf]"
                  />
                </label>

                <label className="text-xs text-[#a3b1c7] sm:col-span-2">
                  Language

                  <select
                    value={fileForm.language}
                    onChange={(event) =>
                      setFileForm((current) => ({
                        ...current,
                        language: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-md border border-[#29313b] bg-[#0b0d0f] px-3 py-2.5 text-sm text-white outline-none focus:border-[#80e8bf]"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                  </select>
                </label>

                <label className="text-xs text-[#a3b1c7] sm:col-span-2">
                  Source code

                  <textarea
                    required
                    maxLength={100000}
                    rows={14}
                    value={fileForm.content}
                    onChange={(event) =>
                      setFileForm((current) => ({
                        ...current,
                        content: event.target.value,
                      }))
                    }
                    placeholder="Paste your source code here..."
                    className="mt-2 w-full resize-y rounded-md border border-[#29313b] bg-[#0b0d0f] p-3 font-mono text-sm leading-6 text-[#c6d3e2] outline-none focus:border-[#80e8bf]"
                  />
                </label>
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={savingFile}
                  onClick={() => setShowAddFile(false)}
                  className="rounded-md border border-[#29313b] px-4 py-2 text-sm text-[#a3b1c7] hover:bg-[#1a2027] disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingFile}
                  className="rounded-md bg-[#80e8bf] px-4 py-2 text-sm font-medium text-[#0b0d0f] hover:bg-[#9af0cc] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingFile ? "Saving..." : "Save source file"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
