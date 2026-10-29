
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  FolderPlus,
  Info,
  Layers3,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const RUNTIMES = {
  node20: {
    label: "Node 20",
    frameworks: [
      { value: "node:test", label: "node:test" },
      { value: "vitest", label: "Vitest" },
      { value: "jest", label: "Jest" },
    ],
  },
  node22: {
    label: "Node 22",
    frameworks: [
      { value: "node:test", label: "node:test" },
      { value: "vitest", label: "Vitest" },
      { value: "jest", label: "Jest" },
    ],
  },
  python312: {
    label: "Python 3.12",
    frameworks: [
      { value: "pytest", label: "pytest" },
      { value: "unittest", label: "unittest" },
    ],
  },
};

const TIME_LIMITS = [
  { value: "1000", label: "1 second" },
  { value: "5000", label: "5 seconds" },
  { value: "10000", label: "10 seconds" },
  { value: "30000", label: "30 seconds" },
];

const panelVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const inputClass =
  "mt-2 w-full rounded-lg border border-[#303640] bg-[#0d1115] px-3.5 py-3 text-sm text-[#f1f3f5] outline-none transition placeholder:text-[#566273] hover:border-[#46534e] focus:border-[#80e8bf] focus:ring-2 focus:ring-[#80e8bf]/10";

const labelClass = "text-sm font-medium text-[#dce2ea]";

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NewProjectPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [runtime, setRuntime] = useState("node20");
  const [framework, setFramework] = useState("node:test");
  const [timeLimit, setTimeLimit] = useState("5000");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(false);

  const projectId = useMemo(() => slugify(name), [name]);
  const availableFrameworks = RUNTIMES[runtime].frameworks;

  function handleRuntimeChange(value) {
    setRuntime(value);
    setFramework(RUNTIMES[value].frameworks[0].value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(projectId)) {
      setError(
        "Use lowercase letters and numbers, separated by single hyphens."
      );
      return;
    }

    if (name.trim().length > 60) {
      setError("Project name must be 60 characters or fewer.");
      return;
    }

    try {
      const existing = JSON.parse(
        localStorage.getItem("veritest-projects") || "[]"
      );

      if (existing.some((project) => project.id === projectId)) {
        setError("A project with this name already exists.");
        return;
      }

      setSaving(true);

      const newProject = {
        id: projectId,
        name: projectId,
        description: description.trim(),
        runtime,
        language: RUNTIMES[runtime].label,
        framework,
        timeLimit: Number(timeLimit),
        createdAt: new Date().toISOString(),
        isDemo: false,
      };

      localStorage.setItem(
        "veritest-projects",
        JSON.stringify([...existing, newProject])
      );

      setCreated(true);

      window.setTimeout(() => {
        navigate("/dashboard/projects", {
          state: { createdProject: projectId },
        });
      }, 700);
    } catch {
      setSaving(false);
      setError("Could not save the project in this browser. Please try again.");
    }
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-full min-w-0 overflow-x-clip bg-[#0b0d0f] px-4 py-6 text-[#f1f3f5] sm:px-6 sm:py-8 lg:px-9"
    >
      <div className="mx-auto max-w-[1100px]">
        {/* Breadcrumb */}
        <motion.button
          type="button"
          onClick={() => navigate("/dashboard/projects")}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.97 }}
          className="mb-6 inline-flex min-h-9 items-center gap-2 text-sm text-[#8292aa] transition-colors hover:text-[#80e8bf]"
        >
          <ArrowLeft size={16} />
          Back to projects
        </motion.button>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8">
          {/* Main form */}
          <motion.section
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            className="min-w-0 overflow-hidden rounded-2xl border border-[#252c35] bg-[#101419]"
          >
            <div className="relative overflow-hidden border-b border-[#252c35] bg-gradient-to-br from-[#172720] via-[#111a17] to-[#101419] px-5 py-6 sm:px-8 sm:py-8">
              <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[#80e8bf]/10 blur-3xl" />

              <div className="relative flex items-start gap-4">
                <motion.div
                  initial={{ scale: 0.8, rotate: -8, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.12, type: "spring", stiffness: 180 }}
                  className="shrink-0 rounded-xl border border-[#285541] bg-[#14271f] p-3 text-[#80e8bf]"
                >
                  <FolderPlus size={25} />
                </motion.div>

                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#80e8bf]">
                    <Sparkles size={14} />
                    NEW VERIFICATION PROJECT
                  </div>

                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Create a project
                  </h1>

                  <p className="mt-2 max-w-lg text-sm leading-6 text-[#a3b1c7]">
                    Set up a codebase and choose how Veritest should execute
                    its tests.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-8">
              {/* Project identity */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Code2 size={17} className="text-[#80e8bf]" />
                  <h2 className="text-sm font-semibold">Project details</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label htmlFor="project-name" className={labelClass}>
                      Project name <span className="text-[#80e8bf]">*</span>
                    </label>

                    <input
                      id="project-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="e.g. billing-core"
                      maxLength={60}
                      autoComplete="off"
                      required
                      className={inputClass}
                    />

                    <p className="mt-2 text-xs leading-5 text-[#8292aa]">
                      Use lowercase letters, numbers, and hyphens.
                      {projectId && (
                        <span className="ml-1 text-[#80e8bf]">
                          ID: {projectId}
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="project-description" className={labelClass}>
                      Description <span className="text-[#65758a]">(optional)</span>
                    </label>

                    <textarea
                      id="project-description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="What does this codebase do?"
                      rows={3}
                      maxLength={240}
                      className={`${inputClass} resize-y`}
                    />

                    <p className="mt-1 text-right text-[11px] text-[#65758a]">
                      {description.length}/240
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#252c35]" />

              {/* Execution settings */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Layers3 size={17} className="text-[#80e8bf]" />
                  <h2 className="text-sm font-semibold">Execution settings</h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="project-runtime" className={labelClass}>
                      Runtime
                    </label>

                    <div className="relative">
                      <select
                        id="project-runtime"
                        value={runtime}
                        onChange={(event) =>
                          handleRuntimeChange(event.target.value)
                        }
                        className={`${inputClass} appearance-none pr-10`}
                      >
                        {Object.entries(RUNTIMES).map(([value, item]) => (
                          <option key={value} value={value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-[#8292aa]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="test-framework" className={labelClass}>
                      Test framework
                    </label>

                    <div className="relative">
                      <select
                        id="test-framework"
                        value={framework}
                        onChange={(event) => setFramework(event.target.value)}
                        className={`${inputClass} appearance-none pr-10`}
                      >
                        {availableFrameworks.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-[#8292aa]"
                      />
                    </div>

                    <p className="mt-2 text-xs leading-5 text-[#8292aa]">
                      The framework intended for generated tests.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="time-limit" className={labelClass}>
                      Per-test time limit
                    </label>

                    <div className="relative">
                      <select
                        id="time-limit"
                        value={timeLimit}
                        onChange={(event) => setTimeLimit(event.target.value)}
                        className={`${inputClass} appearance-none pr-10`}
                      >
                        {TIME_LIMITS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-[#8292aa]"
                      />
                    </div>

                    <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-[#8292aa]">
                      <Clock3 size={13} className="mt-0.5 shrink-0" />
                      Tests exceeding this limit should be recorded as
                      timeouts by the execution engine.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      role="alert"
                      className="rounded-lg border border-red-500/25 bg-red-500/5 px-3.5 py-3 text-sm text-red-300"
                    >
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-[#252c35] pt-5 min-[420px]:flex-row min-[420px]:justify-end">
                <motion.button
                  type="button"
                  onClick={() => navigate("/dashboard/projects")}
                  whileTap={{ scale: 0.98 }}
                  className="min-h-11 rounded-lg border border-[#303640] bg-[#171c23] px-5 py-2.5 text-sm font-medium text-[#dce2ea] transition-colors hover:bg-[#202731]"
                >
                  Cancel
                </motion.button>

                <motion.button
                  type="submit"
                  disabled={saving || created}
                  whileHover={!saving && !created ? { y: -2 } : {}}
                  whileTap={!saving && !created ? { scale: 0.98 } : {}}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#80e8bf] px-5 py-2.5 text-sm font-semibold text-[#0b0d0f] transition-colors hover:bg-[#a8f5d4] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {created ? (
                    <>
                      <Check size={16} />
                      Project created
                    </>
                  ) : saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0b0d0f]/30 border-t-[#0b0d0f]" />
                      Creating project...
                    </>
                  ) : (
                    <>
                      <FolderPlus size={16} />
                      Create project
                      <ArrowRight size={15} />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.section>

          {/* Side information */}
          <motion.aside
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.12 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-[#252c35] bg-[#101419] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Info size={16} className="text-[#80e8bf]" />
                <h2 className="text-sm font-semibold">Before you begin</h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    number: "01",
                    title: "Create the project",
                    detail: "Choose a unique project name and runtime.",
                  },
                  {
                    number: "02",
                    title: "Add source code",
                    detail: "Connect or upload the files you want to test.",
                  },
                  {
                    number: "03",
                    title: "Verify behavior",
                    detail: "Generate candidates and execute your tests.",
                  },
                ].map((step) => (
                  <div key={step.number} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#29342f] bg-[#17231e] text-[10px] font-semibold text-[#80e8bf]">
                      {step.number}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-[#dce2ea]">
                        {step.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#8292aa]">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#285541]/60 bg-[#12251e]/40 p-5">
              <Sparkles size={18} className="mb-3 text-[#80e8bf]" />
              <h2 className="text-sm font-semibold">
                Evidence over green checkmarks.
              </h2>
              <p className="mt-2 text-xs leading-6 text-[#a3b1c7]">
                Veritest is designed to evaluate whether tests expose bugs,
                not simply whether generated tests pass.
              </p>
            </div>
          </motion.aside>
        </div>
      </div>
    </motion.main>
  );
}
