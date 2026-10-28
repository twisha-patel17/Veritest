
import {
  CheckCircle2,
  CircleHelp,
  Clock3,
  XCircle,
} from "lucide-react";

const REPRODUCTION_CONFIG = {
  reproduced: {
    label: "Reproduced",
    icon: CheckCircle2,
    styles: "border-[#285541] bg-[#12251e] text-[#80e8bf]",
  },
  not_reproduced: {
    label: "Not reproduced",
    icon: XCircle,
    styles: "border-[#63333a] bg-[#29191d] text-[#ff8b92]",
  },
  pending: {
    label: "Pending",
    icon: Clock3,
    styles: "border-[#65502c] bg-[#282116] text-[#f4c978]",
  },
  inconclusive: {
    label: "Inconclusive",
    icon: CircleHelp,
    styles: "border-[#3b424d] bg-[#1b2028] text-[#a3b1c7]",
  },
};

function ReproductionBadge({ status, className = "" }) {
  const normalizedStatus = String(status || "")
    .trim()
    .toLowerCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");

  const config = REPRODUCTION_CONFIG[normalizedStatus] || {
    label: "Unverified",
    icon: CircleHelp,
    styles: "border-[#3b424d] bg-[#1b2028] text-[#a3b1c7]",
  };

  const Icon = config.icon;

  return (
    <span
      title="Indicates whether a reported failure was reproduced during verification."
      className={[
        "inline-flex items-center gap-1.5 whitespace-nowrap",
        "rounded-full border px-2 py-1",
        "text-[11px] font-medium leading-none",
        config.styles,
        className,
      ].join(" ")}
    >
      <Icon size={12} strokeWidth={2} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export default ReproductionBadge;
