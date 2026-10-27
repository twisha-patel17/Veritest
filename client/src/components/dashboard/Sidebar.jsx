
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  FlaskConical,
  SearchCode,
  Dna,
} from "lucide-react";

const navigationItems = [
  {
    label: "Overview",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    path: "/dashboard/projects",
    icon: FolderKanban,
  },
  {
    label: "Test runs",
    path: "/dashboard/test-runs",
    icon: FlaskConical,
  },
  {
    label: "Failure analysis",
    path: "/dashboard/failures",
    icon: SearchCode,
  },
  {
    label: "Mutation testing",
    path: "/dashboard/mutation-testing",
    icon: Dna,
  },
];

function VeritestLogo() {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8 shrink-0"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="38"
        height="38"
        rx="11"
        fill="#12251E"
        stroke="#285541"
      />

      <path
        d="M20 7.5L29 11V19C29 25.2 25.1 29.3 20 32C14.9 29.3 11 25.2 11 19V11L20 7.5Z"
        stroke="#80E8BF"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      <path
        d="M15.5 19.5L18.5 22.5L24.8 16"
        stroke="#80E8BF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="29.5" cy="28.5" r="4.5" fill="#0B0D0F" />

      <path
        d="M28 27L29.5 28.5L28 30"
        stroke="#80E8BF"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M30.5 30H32"
        stroke="#80E8BF"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Sidebar() {
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-[#252a32] bg-[#111419] text-[#f1f3f5]">
      {/* Brand — same logo as the landing page */}
      <div className="flex h-[64px] shrink-0 items-center gap-2 px-5">
        <VeritestLogo />

        <span className="text-base font-semibold tracking-tight text-[#f1f3f5]">
          Veri<span className="text-[#80e8bf]">test</span>
        </span>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Dashboard navigation"
        className="flex flex-1 flex-col gap-1 px-3 pt-2"
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                [
                  "group flex min-h-[38px] items-center gap-3 rounded-md",
                  "border-l-2 px-2 text-[13px] transition-colors",
                  isActive
                    ? "border-[#80e8bf] bg-[#202733] text-[#f1f3f5]"
                    : "border-transparent text-[#a3b1c7] hover:bg-[#191e26] hover:text-white",
                ].join(" ")
              }
            >
              <Icon size={16} strokeWidth={1.8} className="shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Workspace information */}
      <div className="shrink-0 border-t border-[#252a32] px-5 py-4 text-[11px] leading-[18px] text-[#8292aa]">
        <p>
          Workspace:{" "}
          <span className="text-[#a3b1c7]">my-workspace</span>
        </p>
        <p>AI-powered test verification</p>
      </div>
    </aside>
  );
}

export default Sidebar;
