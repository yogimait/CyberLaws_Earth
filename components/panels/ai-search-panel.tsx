// AI-powered search panel for legal queries — redesigned.
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Sparkles, Loader2, Scale, Shield, Gavel, AlertTriangle } from "lucide-react";

function stripThinkTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

interface AiSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  primaryAct: string;
  legalSection: string;
  maxPrisonYears: number;
  maxFineUsd: number;
  isBailable: boolean;
  strictnessRating: number;
  summary: string;
  isDraftLaw: boolean;
}

export function AiSearchPanel({ isOpen, onClose }: AiSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/search-law", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (data.status) {
        setResult(data.data.result);
      } else {
        setError(data.message || "Search failed.");
      }
    } catch {
      setError("Failed to connect. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] bg-zinc-950/98 backdrop-blur-2xl border-t border-white/[0.04] rounded-t-3xl flex flex-col lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[520px] lg:max-h-[70vh] lg:rounded-3xl lg:border"
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-2 pb-1 lg:hidden">
              <div className="w-10 h-1 bg-zinc-800 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-2 pb-2.5 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500/15 to-cyan-500/15 border border-purple-500/10 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                </div>
                <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-[0.15em] font-[family-name:var(--font-quantico)]">
                  AI Legal Search
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-4 pt-3 pb-2">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="What happens if someone makes a deepfake in Germany?"
                  className="w-full pl-4 pr-12 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/10 transition-all font-[family-name:var(--font-space)]"
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading || !query.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all disabled:opacity-30"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-zinc-700 mt-1.5 px-1 font-mono">
                // ask any cyber crime scenario • powered by GPT OSS-20B
              </p>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/[0.06] border border-red-500/15 rounded-xl mt-2"
                >
                  <p className="text-xs text-red-400">{error}</p>
                </motion.div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 space-y-3"
                >
                  {/* Act Title */}
                  <div className="flex items-center gap-2.5 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                    <Scale className="w-4 h-4 text-cyan-500/60 shrink-0" />
                    <div>
                      <h3 className="text-sm text-zinc-100 font-semibold font-[family-name:var(--font-quantico)]">{result.primaryAct}</h3>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{result.legalSection}</p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <StatCard
                      icon={<Shield className="w-3 h-3" />}
                      label="Max Prison"
                      value={result.maxPrisonYears > 0 ? `${result.maxPrisonYears} years` : "Civil"}
                      color={result.maxPrisonYears > 5 ? "#ef4444" : result.maxPrisonYears > 0 ? "#f59e0b" : "#22c55e"}
                    />
                    <StatCard
                      icon={<Gavel className="w-3 h-3" />}
                      label="Max Fine"
                      value={`$${result.maxFineUsd?.toLocaleString() ?? "N/A"}`}
                      color="#f59e0b"
                    />
                  </div>

                  {/* Bail + Strictness */}
                  <div className="flex gap-2">
                    <div className="flex-1 p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-center justify-between">
                      <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-[family-name:var(--font-quantico)]">Bail</span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${result.isBailable ? "text-emerald-400" : "text-red-400"}`}>
                        {result.isBailable ? "BAILABLE" : "NON-BAILABLE"}
                      </span>
                    </div>
                    <div className="flex-1 p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-center justify-between">
                      <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-[family-name:var(--font-quantico)]">Severity</span>
                      <span
                        className="text-sm font-mono font-bold"
                        style={{
                          color: result.strictnessRating >= 8 ? "#ef4444" : result.strictnessRating >= 5 ? "#f59e0b" : "#22c55e",
                        }}
                      >
                        {result.strictnessRating}/10
                      </span>
                    </div>
                  </div>

                  {/* Strictness bar */}
                  <div className="w-full h-1.5 bg-zinc-800/60 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(result.strictnessRating / 10) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${
                          result.strictnessRating >= 8 ? "#ef4444" : result.strictnessRating >= 5 ? "#f59e0b" : "#22c55e"
                        }, ${result.strictnessRating >= 8 ? "#dc2626" : result.strictnessRating >= 5 ? "#d97706" : "#16a34a"})`,
                      }}
                    />
                  </div>

                  {/* Summary */}
                  <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl">
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {stripThinkTags(result.summary)}
                    </p>
                  </div>

                  {/* Draft Law Warning */}
                  {result.isDraftLaw && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/[0.06] border border-amber-500/15 rounded-xl">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-[10px] text-amber-400 font-medium font-[family-name:var(--font-quantico)] tracking-wider">
                        DRAFT / PROPOSED LAW
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-zinc-600">{icon}</span>
        <span className="text-[9px] text-zinc-600 uppercase tracking-wider font-[family-name:var(--font-quantico)]">{label}</span>
      </div>
      <div className="text-sm font-bold font-mono" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
