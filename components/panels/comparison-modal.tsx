// Side-by-side comparison modal — full-screen table.
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Sparkles, Loader2 } from "lucide-react";
import { StrictnessMeter } from "@/components/ui/strictness-meter";
import { StatusBadge } from "@/components/ui/status-badge";
import type { CountryDetail } from "@/lib/types";
import { useState } from "react";

interface ComparisonModalProps {
  countries: CountryDetail[];
  isOpen: boolean;
  onClose: () => void;
}

export function ComparisonModal({ countries, isOpen, onClose }: ComparisonModalProps) {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  if (countries.length < 2) return null;

  const crimeCategories = Array.from(
    new Set(countries.flatMap((c) => c.crimesMatrix.map((cm) => cm.categoryId)))
  );

  async function generateAiReport() {
    setIsLoadingReport(true);
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryName: countries.map((c) => c.countryName).join(" vs "),
          crimeTopic: "comparative analysis of cyber law strictness, penalties, and enforcement",
        }),
      });
      const data = await response.json();
      setAiReport(data.status ? data.data.summary : data.message || "Report unavailable.");
    } catch {
      setAiReport("Failed to generate report.");
    } finally {
      setIsLoadingReport(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-end lg:items-center justify-center p-0 lg:p-6"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-full max-w-4xl bg-zinc-950/98 border border-zinc-800/60 rounded-t-3xl lg:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/40">
              <div className="flex items-center gap-2">
                <span className="text-sm">⚡</span>
                <h2 className="text-sm font-semibold text-zinc-100">
                  Side-by-Side Comparison
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Country Headers */}
              <div className="grid gap-px bg-zinc-800/30" style={{ gridTemplateColumns: `200px repeat(${countries.length}, 1fr)` }}>
                <div className="bg-zinc-950 p-3">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">
                    Metric
                  </span>
                </div>
                {countries.map((c) => (
                  <div key={c.countryId} className="bg-zinc-950 p-3 text-center">
                    <span className="text-xl">{c.flagEmoji}</span>
                    <div className="text-xs text-zinc-200 font-semibold mt-1">{c.countryName}</div>
                  </div>
                ))}
              </div>

              {/* Overall Strictness */}
              <CompareRow label="Overall Strictness" countries={countries}>
                {(c) => (
                  <div className="w-full">
                    <StrictnessMeter score={c.overallStrictnessScore} size="sm" showLabel={false} />
                    <span className="text-xs font-mono font-bold mt-1 block" style={{ color: c.colorCode }}>
                      {c.overallStrictnessScore.toFixed(1)} / 10
                    </span>
                  </div>
                )}
              </CompareRow>

              <CompareRow label="Primary Legislation" countries={countries}>
                {(c) => <span className="text-[11px] text-zinc-300">{c.primaryAct}</span>}
              </CompareRow>

              <CompareRow label="Law Status" countries={countries}>
                {(c) => <StatusBadge status={c.lawStatus} size="sm" />}
              </CompareRow>

              <CompareRow label="Enacted Year" countries={countries}>
                {(c) => <span className="text-xs text-zinc-400 font-mono">{c.enactedYear}</span>}
              </CompareRow>

              <CompareRow label="Enforcement Agency" countries={countries}>
                {(c) => <span className="text-[11px] text-zinc-400">{c.enforcementAgency}</span>}
              </CompareRow>

              <CompareRow label="Draft Bills" countries={countries}>
                {(c) => (
                  <div className="space-y-1">
                    {c.draftLaws.length === 0 && <span className="text-[11px] text-zinc-600">None</span>}
                    {c.draftLaws.map((d) => (
                      <div key={d.id} className="text-[11px] text-amber-400/70">{d.billName}</div>
                    ))}
                  </div>
                )}
              </CompareRow>

              {/* Per-Crime Comparison */}
              {crimeCategories.map((cat) => {
                const categoryName = countries
                  .flatMap((c) => c.crimesMatrix)
                  .find((cm) => cm.categoryId === cat)?.crimeName ?? cat;

                return (
                  <CompareRow key={cat} label={categoryName} countries={countries}>
                    {(c) => {
                      const crime = c.crimesMatrix.find((cm) => cm.categoryId === cat);
                      if (!crime) return <span className="text-[11px] text-zinc-700">N/A</span>;
                      return (
                        <div className="space-y-0.5">
                          <div className="text-[11px] text-zinc-400">{crime.legalSection}</div>
                          <div className="text-[11px]">
                            <span className={crime.maxPrisonTermYears > 0 ? "text-red-400/80" : "text-zinc-500"}>
                              {crime.maxPrisonTermYears > 0
                                ? `${crime.maxPrisonTermYears} yrs`
                                : "Civil"}
                            </span>
                            {" · "}
                            <span className="text-amber-400/80">${crime.maxFineUsd.toLocaleString()}</span>
                          </div>
                          <div className="text-[10px]">
                            <span className={crime.isBailable ? "text-emerald-500/70" : "text-red-400/70"}>
                              {crime.isBailable ? "Bailable" : "Non-Bailable"}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  </CompareRow>
                );
              })}

              {/* AI Regulation */}
              <CompareRow label="Dedicated AI Act" countries={countries}>
                {(c) =>
                  c.aiCyberCrimes ? (
                    <span className={`text-xs font-medium ${c.aiCyberCrimes.hasDedicatedAiAct ? "text-purple-400" : "text-zinc-600"}`}>
                      {c.aiCyberCrimes.hasDedicatedAiAct ? "Yes ✓" : "No ✗"}
                    </span>
                  ) : (
                    <span className="text-[11px] text-zinc-700">N/A</span>
                  )
                }
              </CompareRow>

              <CompareRow label="Deepfake Takedown" countries={countries}>
                {(c) =>
                  c.aiCyberCrimes ? (
                    <span className="text-xs text-zinc-400">
                      {c.aiCyberCrimes.deepfakeRules.takedownWindowHours}h
                    </span>
                  ) : (
                    <span className="text-[11px] text-zinc-700">N/A</span>
                  )
                }
              </CompareRow>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800/40 gap-2">
              <button
                onClick={() => {
                  const text = `Comparison: ${countries.map(c => c.countryName).join(" vs ")}`;
                  navigator.clipboard.writeText(text);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              <button
                onClick={generateAiReport}
                disabled={isLoadingReport}
                className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/15 border border-purple-500/20 rounded-xl text-xs font-medium text-purple-300 hover:bg-purple-500/25 transition-all disabled:opacity-50"
              >
                {isLoadingReport ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                AI Report
              </button>
            </div>

            {/* AI Report */}
            {aiReport && (
              <div className="px-4 pb-3">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-zinc-900/60 border border-zinc-800/40 rounded-xl"
                >
                  <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-line">{aiReport}</p>
                </motion.div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CompareRow({
  label,
  countries,
  children,
}: {
  label: string;
  countries: CountryDetail[];
  children: (country: CountryDetail) => React.ReactNode;
}) {
  return (
    <div
      className="grid gap-px bg-zinc-800/20 border-b border-zinc-800/20"
      style={{ gridTemplateColumns: `200px repeat(${countries.length}, 1fr)` }}
    >
      <div className="bg-zinc-950/80 p-2.5 flex items-center">
        <span className="text-[11px] text-zinc-500 font-medium">{label}</span>
      </div>
      {countries.map((c) => (
        <div key={c.countryId} className="bg-zinc-950/80 p-2.5">
          {children(c)}
        </div>
      ))}
    </div>
  );
}
