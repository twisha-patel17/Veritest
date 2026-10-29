
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, FolderCode, Boxes, Package } from "lucide-react";

const projects = [
  {
    id: "billing-core",
    name: "billing-core",
    language: "Node 20",
    lastRun: "Oct 15",
    description: "Billing calculations and proration edge cases.",
    icon: FolderCode,
  },
  {
    id: "auth-utils",
    name: "auth-utils",
    language: "Node 20",
    lastRun: "Oct 14",
    description: "Authentication helpers and session validation.",
    icon: Boxes,
  },
  {
    id: "inventory-sync",
    name: "inventory-sync",
    language: "Python 3.12",
    lastRun: "Oct 13",
    description: "Inventory synchronization and stock consistency.",
    icon: Package,
  },
];

export default function ProjectsPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-full bg-[#0b0d0f] p-5 text-[#f1f3f5] sm:p-6">
      <div className="mb-6">
        <p className="mb-1 text-xs text-[#8292aa]">
          acme-platform / Projects
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-2 text-sm text-[#8292aa]">
          Explore your codebases and review generated tests.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => {
          const Icon = project.icon;

          return (
            <button
              key={project.id}
              type="button"
              onClick={() =>
                navigate(`/dashboard/projects/${project.id}`)
              }
              className="group rounded-xl border border-[#252c35] bg-[#11151a] p-5 text-left transition hover:border-[#80e8bf]/60 hover:bg-[#151b20] focus:outline-none focus:ring-2 focus:ring-[#80e8bf]"
            >
              <div className="mb-5 flex items-start justify-between">
                <div className="rounded-lg border border-[#29342f] bg-[#17231e] p-2.5 text-[#80e8bf]">
                  <Icon size={19} />
                </div>

                <ArrowUpRight
                  size={18}
                  className="text-[#8292aa] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#80e8bf]"
                />
              </div>

              <h2 className="text-base font-semibold">{project.name}</h2>

              <p className="mt-2 text-sm leading-6 text-[#8292aa]">
                {project.description}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-[#252c35] pt-4 text-xs text-[#8292aa]">
                <span>{project.language}</span>
                <span>Last run {project.lastRun}</span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-xs text-[#8292aa]">
        Demo projects · Select a project to open its workspace.
      </p>
    </main>
  );
}
