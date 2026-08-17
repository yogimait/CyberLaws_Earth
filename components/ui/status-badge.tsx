// Legal status badge — Enacted / Draft / Partial.
"use client";

interface StatusBadgeProps {
  status: "enacted" | "draft" | "partial";
  size?: "sm" | "md";
}

const STATUS_CONFIG = {
  enacted: {
    label: "Enacted",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  draft: {
    label: "Draft",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400 animate-pulse",
  },
  partial: {
    label: "Partial",
    bg: "bg-sky-500/15",
    text: "text-sky-400",
    border: "border-sky-500/30",
    dot: "bg-sky-400",
  },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const padding = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${padding} ${config.bg} ${config.text} ${config.border} border rounded-full font-medium ${textSize} uppercase tracking-wider`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
