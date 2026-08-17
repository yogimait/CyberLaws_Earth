// AI-powered search panel for legal queries.
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Sparkles, Loader2, Scale } from "lucide-react";

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
        setError(data.message || "Search failed. Configure GROQ_API_KEY.");
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/60 rounded-t-3xl flex flex-col lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[520px] lg:max-h-[70vh] lg:rounded-3xl lg:border"
          >
            {/* Handle */}
            <div className="flex justify-center pt-2 pb-1 lg:hidden">
              <div className="w-10 h-1 bg-zinc-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b border-zinc-800/40">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-semibold text-zinc-100">AI Legal Search</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-all"
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
                  placeholder="What happens if someone makes a deepfake of me in Germany?"
                  className="w-full pl-4 pr-12 py-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading || !query.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 transition-all disabled:opacity-40"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-zinc-600 mt-1.5 px-1">
                Ask any cyber crime scenario in natural language. Powered by Groq AI.
              </p>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mt-2"
                >
                  <p className="text-xs text-red-400">{error}</p>
                </motion.div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-4 bg-zinc-900/50 border border-zinc-800/40 rounded-xl space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-zinc-500" />
                    <h3 className="text-sm text-zinc-200 font-semibold">{result.primaryAct}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <InfoCard label="Section" value={result.legalSection} />
                    <InfoCard
                      label="Max Prison"
                      value={result.maxPrisonYears > 0 ? `${result.maxPrisonYears} years` : "Civil"}
                    />
                    <InfoCard label="Max Fine" value={`$${result.maxFineUsd?.toLocaleString() ?? "N/A"}`} />
                    <InfoCard
                      label="Bail"
                      value={result.isBailable ? "Bailable" : "Non-Bailable"}
                      color={result.isBailable ? "#22c55e" : "#ef4444"}
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 bg-zinc-800/30 rounded-lg">
                    <span className="text-[11px] text-zinc-500">Strictness</span>
                    <span
                      className="text-sm font-mono font-bold"
                      style={{
                        color:
                          result.strictnessRating >= 8
                            ? "#ef4444"
                            : result.strictnessRating >= 5
                            ? "#f59e0b"
                            : "#22c55e",
                      }}
                    >
                      {result.strictnessRating}/10
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed">{result.summary}</p>

                  {result.isDraftLaw && (
                    <div className="px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <span className="text-[10px] text-amber-400 font-medium">
                        ⚠ This law is still in draft/proposed stage
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

function InfoCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="p-2 bg-zinc-800/20 rounded-lg">
      <div className="text-[10px] text-zinc-600 mb-0.5">{label}</div>
      <div className="text-xs font-medium" style={{ color: color ?? "#a1a1aa" }}>
        {value}
      </div>
    </div>
  );
}
