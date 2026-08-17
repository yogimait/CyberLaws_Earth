// Top floating header bar — minimal frosted glass.
"use client";

import { Search, GitCompareArrows, Sparkles, Menu, X } from "lucide-react";

interface HeaderProps {
  isCompareMode: boolean;
  onToggleCompare: () => void;
  onToggleSearch: () => void;
  onToggleAi: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  compareCount: number;
}

export function Header({
  isCompareMode,
  onToggleCompare,
  onToggleSearch,
  onToggleAi,
  onToggleSidebar,
  isSidebarOpen,
  compareCount,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-3 pt-2.5 pointer-events-none">
      <div className="max-w-screen-2xl mx-auto">
        <div className="relative flex items-center justify-between gap-2 bg-black/50 backdrop-blur-2xl border border-white/[0.04] rounded-2xl px-3 py-1.5 pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          {/* Subtle gradient accent line */}
          <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

          {/* Left — branding */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors text-zinc-500"
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-white/[0.06] flex items-center justify-center">
                <span className="text-[10px]">🌐</span>
              </div>
              <span className="text-xs font-semibold text-zinc-300 tracking-tight hidden sm:inline font-[family-name:var(--font-quantico)]">
                CYBER-SPHERE
              </span>
            </div>
          </div>

          {/* Center — search trigger */}
          <button
            onClick={onToggleSearch}
            className="flex-1 max-w-[200px] sm:max-w-xs mx-2 flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/[0.04] rounded-xl text-[11px] text-zinc-600 hover:text-zinc-400 hover:border-white/[0.08] transition-all"
          >
            <Search className="w-3 h-3 shrink-0" />
            <span className="truncate">Search law...</span>
          </button>

          {/* Right — pill actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleCompare}
              className={`relative flex items-center gap-1 px-2 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                isCompareMode
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.1)]"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
              }`}
            >
              <GitCompareArrows className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compare</span>
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-500 text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </button>

            <button
              onClick={onToggleAi}
              className="flex items-center gap-1 px-2 py-1.5 rounded-full text-[11px] font-medium text-zinc-500 hover:text-purple-400 hover:bg-purple-500/[0.06] transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
