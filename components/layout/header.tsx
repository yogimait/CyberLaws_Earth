// Top floating header bar — mobile-first.
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
    <header className="fixed top-0 left-0 right-0 z-40 px-3 pt-3 pointer-events-none">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between gap-2 bg-black/70 backdrop-blur-xl border border-zinc-800/60 rounded-2xl px-3 py-2 pointer-events-auto shadow-2xl">
          {/* Left — branding */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors text-zinc-400"
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-base">🌐</span>
              <span className="text-sm font-semibold text-zinc-100 tracking-tight hidden sm:inline">
                Cyber-Sphere
              </span>
            </div>
          </div>

          {/* Center — search trigger (mobile) */}
          <button
            onClick={onToggleSearch}
            className="flex-1 max-w-xs mx-2 flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-zinc-500 hover:text-zinc-400 hover:border-zinc-700 transition-all sm:max-w-sm"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Search country or law...</span>
          </button>

          {/* Right — actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleCompare}
              className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isCompareMode
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              <GitCompareArrows className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compare</span>
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </button>

            <button
              onClick={onToggleAi}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
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
