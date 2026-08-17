// Desktop sidebar — filters, comparison tray, legend.
"use client";

import { X, Filter, Plus } from "lucide-react";
import { Legend } from "@/components/ui/legend";
import type { Country } from "@/lib/types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  showDraftLaws: boolean;
  onToggleDraftLaws: () => void;
  showAiRegulations: boolean;
  onToggleAiRegulations: () => void;
  compareList: Country[];
  onRemoveFromCompare: (countryId: string) => void;
  onCompareNow: () => void;
  isCompareMode: boolean;
}

export function Sidebar({
  isOpen,
  onClose,
  showDraftLaws,
  onToggleDraftLaws,
  showAiRegulations,
  onToggleAiRegulations,
  compareList,
  onRemoveFromCompare,
  onCompareNow,
  isCompareMode,
}: SidebarProps) {
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 w-[240px] bg-black/80 backdrop-blur-2xl border-r border-white/[0.04] transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:z-30 lg:pt-14`}
      >
        {/* Close button — mobile */}
        <div className="flex items-center justify-between p-3 border-b border-white/[0.04] lg:hidden">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.2em] font-[family-name:var(--font-quantico)]">
            Filters
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/[0.04] text-zinc-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar">
          {/* Quick Filters */}
          <section>
            <div className="flex items-center gap-1.5 mb-3">
              <Filter className="w-3 h-3 text-zinc-600" />
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 font-semibold font-[family-name:var(--font-quantico)]">
                Filters
              </span>
            </div>

            <div className="space-y-2.5">
              <ToggleSwitch
                label="Draft Laws"
                isOn={showDraftLaws}
                onToggle={onToggleDraftLaws}
                color="amber"
              />
              <ToggleSwitch
                label="AI Regulations"
                isOn={showAiRegulations}
                onToggle={onToggleAiRegulations}
                color="purple"
              />
            </div>
          </section>

          {/* Gradient divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          {/* Comparison Tray */}
          {isCompareMode && (
            <section>
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 font-semibold font-[family-name:var(--font-quantico)]">
                Compare Tray
              </span>
              <div className="mt-2.5 space-y-1.5">
                {compareList.length === 0 && (
                  <p className="text-[10px] text-zinc-700 font-mono">
                    // tap countries on globe
                  </p>
                )}
                {compareList.map((country) => (
                  <div
                    key={country.countryId}
                    className="flex items-center gap-2 px-2 py-1.5 bg-white/[0.02] border border-white/[0.04] rounded-lg group"
                    style={{ borderLeftColor: country.colorCode, borderLeftWidth: 2 }}
                  >
                    <span className="text-sm">{country.flagEmoji}</span>
                    <span className="text-[11px] text-zinc-400 flex-1 truncate">
                      {country.countryName}
                    </span>
                    <button
                      onClick={() => onRemoveFromCompare(country.countryId)}
                      className="text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {compareList.length < 3 && (
                  <div className="flex items-center gap-2 px-2 py-1.5 border border-dashed border-white/[0.04] rounded-lg text-zinc-700">
                    <Plus className="w-3 h-3" />
                    <span className="text-[10px] font-mono">add_country</span>
                  </div>
                )}
                {compareList.length >= 2 && (
                  <button
                    onClick={onCompareNow}
                    className="w-full mt-2 py-2 bg-cyan-500/8 border border-cyan-500/15 rounded-xl text-[11px] font-semibold text-cyan-400 hover:bg-cyan-500/15 transition-all font-[family-name:var(--font-quantico)] tracking-wider"
                  >
                    ⚡ COMPARE NOW
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Gradient divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          {/* Legend */}
          <section>
            <Legend />
          </section>
        </div>
      </aside>
    </>
  );
}

function ToggleSwitch({
  label,
  isOn,
  onToggle,
  color,
}: {
  label: string;
  isOn: boolean;
  onToggle: () => void;
  color: "amber" | "purple";
}) {
  const colors = {
    amber: { bg: "bg-amber-500/20", dot: "bg-amber-400", text: "text-amber-400/80" },
    purple: { bg: "bg-purple-500/20", dot: "bg-purple-400", text: "text-purple-400/80" },
  };
  const c = colors[color];

  return (
    <button onClick={onToggle} className="flex items-center gap-2.5 w-full group">
      <div
        className={`relative w-7 h-4 rounded-full transition-all duration-300 ${
          isOn ? c.bg : "bg-white/[0.04]"
        }`}
      >
        <div
          className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-300 ${
            isOn ? `left-3.5 ${c.dot}` : "left-0.5 bg-zinc-600"
          }`}
        />
      </div>
      <span className={`text-[11px] transition-colors ${isOn ? c.text : "text-zinc-600 group-hover:text-zinc-400"}`}>
        {label}
      </span>
    </button>
  );
}
