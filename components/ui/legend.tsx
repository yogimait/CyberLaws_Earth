// Globe color legend — explains heatmap color coding.
"use client";

const LEGEND_ITEMS = [
  { color: "#dc2626", label: "Strict", range: "> 8.0" },
  { color: "#ef4444", label: "High", range: "7.0 – 8.0" },
  { color: "#f59e0b", label: "Moderate", range: "5.0 – 6.9" },
  { color: "#22c55e", label: "Relaxed", range: "< 5.0" },
];

export function Legend() {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-0.5">
        Strictness
      </span>
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}40` }}
          />
          <span className="text-[11px] text-zinc-400">
            {item.label}{" "}
            <span className="text-zinc-600 font-mono">({item.range})</span>
          </span>
        </div>
      ))}
    </div>
  );
}
