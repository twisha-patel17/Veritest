
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  FolderCode,
  FolderPlus,
  Package,
  Plus,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

const projects = [
  {
    id: "billing-core",
    name: "billing-core",
    language: "Node 20",
    description: "Billing calculations and proration edge cases.",
    icon: FolderCode,
  },
  {
    id: "auth-utils",
    name: "auth-utils",
    language: "Node 20",
    description: "Authentication helpers and session validation.",
    icon: Boxes,
  },
  {
    id: "inventory-sync",
    name: "inventory-sync",
    language: "Python 3.12",
    description: "Inventory synchronization and stock consistency.",
    icon: Package,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function ProjectsPage() {
  const navigate = useNavigate();

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
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs text-[#8292aa]">
              <span>acme-platform</span>
              <span>/</span>
              <span className="text-[#a3b1c7]">Projects</span>
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Projects
              </h1>
              <span className="rounded-full border border-[#29342f] bg-[#17231e] px-2 py-1 text-[10px] text-[#80e8bf]">
                {projects.length} demo
              </span>
            </div>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#8292aa]">
              Your codebases, your tests, and the evidence that verifies them.
            </p>
          </div>

          <motion.button
            type="button"
            onClick={() => navigate("/dashboard/projects/new")}
            whileHover={{ y: -3, boxShadow: "0 8px 30px rgba(128,232,191,0.13)" }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#80e8bf] px-4 py-2.5 text-sm font-semibold text-[#0b0d0f] transition-colors hover:bg-[#a8f5d4] sm:w-auto"
          >
            <Plus size={17} />
            New Project
            <ArrowRight size={15} />
          </motion.button>
        </motion.header>

        {/* Intro banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative mb-7 overflow-hidden rounded-2xl border border-[#285541]/70 bg-gradient-to-br from-[#14271f] via-[#101a17] to-[#111419] p-5 sm:p-7"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full bg-[#80e8bf]/10 blur-3xl"
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium text-[#80e8bf]">
                <Sparkles size={14} />
                YOUR VERIFICATION WORKSPACE
              </div>

              <h2 className="text-lg font-semibold sm:text-xl">
                Every codebase has edge cases.
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#a3b1c7]">
                Create a project to organize source files, generate test
                candidates, execute them, and investigate failures.
              </p>
            </div>

            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="hidden shrink-0 rounded-2xl border border-[#285541] bg-[#0b1410]/70 p-5 sm:block"
            >
              <FolderCode size={34} strokeWidth={1.4} className="text-[#80e8bf]" />
            </motion.div>
          </div>
        </motion.div>

        {/* Project section heading */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Your projects</h2>
            <p className="mt-1 text-xs text-[#8292aa]">
              Select a project to open its workspace.
            </p>
          </div>
          <span className="text-xs text-[#8292aa]">
            {projects.length} projects
          </span>
        </div>

        {/* Project cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {projects.map((project) => {
            const Icon = project.icon;

            return (
              <motion.button
                key={project.id}
                type="button"
                variants={cardVariants}
                whileHover={{
                  y: -5,
                  borderColor: "rgba(128,232,191,0.5)",
                }}
                whileTap={{ scale: 0.985 }}
                onClick={() =>
                  navigate(`/dashboard/projects/${project.id}`)
                }
                className="group relative min-w-0 overflow-hidden rounded-xl border border-[#252c35] bg-[#11151a] p-5 text-left transition-colors hover:bg-[#151b20] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#80e8bf]"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#80e8bf]/0 blur-3xl transition-colors duration-300 group-hover:bg-[#80e8bf]/10" />

                <div className="relative mb-5 flex items-start justify-between">
                  <div className="rounded-lg border border-[#29342f] bg-[#17231e] p-2.5 text-[#80e8bf] transition-transform duration-200 group-hover:scale-105">
                    <Icon size={20} />
                  </div>

                  <ArrowUpRight
                    size={19}
                    className="text-[#8292aa] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#80e8bf]"
                  />
                </div>

                <h3 className="relative break-words text-base font-semibold">
                  {project.name}
                </h3>

                <p className="relative mt-2 min-h-12 text-sm leading-6 text-[#8292aa]">
                  {project.description}
                </p>

                <div className="relative mt-5 flex flex-wrap items-center gap-2 border-t border-[#252c35] pt-4">
                  <span className="rounded-md border border-[#29313b] bg-[#0d1115] px-2 py-1 text-xs text-[#a3b1c7]">
                    {project.language}
                  </span>
                  <span className="text-xs text-[#8292aa]">
                    Demo project
                  </span>
                </div>

                <motion.div
                  aria-hidden="true"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.25 }}
                  style={{ transformOrigin: "left" }}
                  className="absolute bottom-0 left-0 h-[2px] w-full bg-[#80e8bf]"
                />
              </motion.button>
            );
          })}

          {/* Create project card */}
          <motion.button
            type="button"
            variants={cardVariants}
            whileHover={{
              y: -5,
              borderColor: "rgba(128,232,191,0.5)",
              backgroundColor: "rgba(128,232,191,0.035)",
            }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate("/dashboard/projects/new")}
            className="flex min-h-[220px] min-w-0 flex-col items-center justify-center rounded-xl border border-dashed border-[#303a43] bg-[#0e1215] p-6 text-center transition-colors hover:bg-[#121a16] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#80e8bf]"
          >
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.25 }}
              className="mb-4 rounded-xl border border-[#285541] bg-[#17231e] p-3 text-[#80e8bf]"
            >
              <FolderPlus size={23} />
            </motion.div>

            <span className="text-sm font-semibold">Create a project</span>
            <span className="mt-2 max-w-52 text-xs leading-5 text-[#8292aa]">
              Bring a new codebase into your verification workspace.
            </span>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#80e8bf]">
              Get started <ArrowRight size={13} />
            </span>
          </motion.button>
        </motion.div>

        <p className="mt-6 text-xs leading-5 text-[#65758a]">
          The listed projects are demo data. Real project persistence and
          source-file storage will be connected to the backend.
        </p>
      </div>
    </motion.main>
  );
}
