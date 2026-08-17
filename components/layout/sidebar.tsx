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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 w-[260px] bg-black/90 backdrop-blur-xl border-r border-zinc-800/60 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:z-30 lg:pt-16`}
      >
        {/* Close button — mobile only */}
        <div className="flex items-center justify-between p-3 border-b border-zinc-800/40 lg:hidden">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            Filters
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800/60 text-zinc-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* Quick Filters */}
          <section>
            <div className="flex items-center gap-1.5 mb-3">
              <Filter className="w-3 h-3 text-zinc-500" />
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                Quick Filters
              </span>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer group mb-2">
              <div
                className={`relative w-8 h-[18px] rounded-full transition-colors ${
                  showDraftLaws ? "bg-amber-500/30" : "bg-zinc-800"
                }`}
                onClick={onToggleDraftLaws}
              >
                <div
                  className={`absolute top-[3px] w-3 h-3 rounded-full transition-all ${
                    showDraftLaws ? "left-[17px] bg-amber-400" : "left-[3px] bg-zinc-500"
                  }`}
                />
              </div>
              <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors">
                Show Draft Laws
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div
                className={`relative w-8 h-[18px] rounded-full transition-colors ${
                  showAiRegulations ? "bg-purple-500/30" : "bg-zinc-800"
                }`}
                onClick={onToggleAiRegulations}
              >
                <div
                  className={`absolute top-[3px] w-3 h-3 rounded-full transition-all ${
                    showAiRegulations ? "left-[17px] bg-purple-400" : "left-[3px] bg-zinc-500"
                  }`}
                />
              </div>
              <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors">
                AI Regulations
              </span>
            </label>
          </section>

          {/* Comparison Tray */}
          {isCompareMode && (
            <section>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                Comparison Tray
              </span>
              <div className="mt-2 space-y-1.5">
                {compareList.length === 0 && (
                  <p className="text-[11px] text-zinc-600 italic">
                    Tap countries on the globe to add
                  </p>
                )}
                {compareList.map((country) => (
                  <div
                    key={country.countryId}
                    className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-900/60 border border-zinc-800/60 rounded-lg"
                  >
                    <span className="text-sm">{country.flagEmoji}</span>
                    <span className="text-xs text-zinc-300 flex-1 truncate">
                      {country.countryName}
                    </span>
                    <button
                      onClick={() => onRemoveFromCompare(country.countryId)}
                      className="text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {compareList.length < 3 && (
                  <div className="flex items-center gap-2 px-2.5 py-1.5 border border-dashed border-zinc-800 rounded-lg text-zinc-600">
                    <Plus className="w-3 h-3" />
                    <span className="text-[11px]">Add Country</span>
                  </div>
                )}
                {compareList.length >= 2 && (
                  <button
                    onClick={onCompareNow}
                    className="w-full mt-2 py-2 bg-cyan-500/15 border border-cyan-500/30 rounded-xl text-xs font-semibold text-cyan-400 hover:bg-cyan-500/25 transition-all"
                  >
                    ⚡ Compare Now
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Legend */}
          <section>
            <Legend />
          </section>
        </div>
      </aside>
    </>
  );
}
