
import {
  CheckCircle2,
  XCircle,
  LoaderCircle,
  Ban,
  Clock3,
} from "lucide-react";

const STATUS_CONFIG = {
  passed: {
    label: "Passed",
    className: "border-[#285541] bg-[#12251e] text-[#80e8bf]",
    icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    className: "border-[#63333a] bg-[#29191d] text-[#ff8b92]",
    icon: XCircle,
  },
  running: {
    label: "Running",
    className: "border-[#65502c] bg-[#282116] text-[#f4c978]",
    icon: LoaderCircle,
  },
  cancelled: {
    label: "Cancelled",
    className: "border-[#3b424d] bg-[#1b2028] text-[#a3b1c7]",
    icon: Ban,
  },
  pending: {
    label: "Pending",
    className: "border-[#3b424d] bg-[#1b2028] text-[#a3b1c7]",
    icon: Clock3,
  },
};

function RunStatusBadge({ status, className = "" }) {
  const normalizedStatus = String(status || "")
    .trim()
    .toLowerCase();

  const config = STATUS_CONFIG[normalizedStatus] || {
    label: status || "Unknown",
    className: "border-[#3b424d] bg-[#1b2028] text-[#a3b1c7]",
    icon: Clock3,
  };

  const Icon = config.icon;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 whitespace-nowrap",
        "rounded-full border px-2 py-1",
        "text-[11px] font-medium leading-none",
        config.className,
        className,
      ].join(" ")}
    >
      <Icon
        size={12}
        strokeWidth={2}
        className={
          normalizedStatus === "running"
            ? "animate-spin"
            : "shrink-0"
        }
        aria-hidden="true"
      />

      {config.label}
    </span>
  );
}

export default RunStatusBadge;
