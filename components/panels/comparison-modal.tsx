// Side-by-side comparison modal — full-screen table + mobile wireframe.
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Sparkles, Loader2, FileText } from "lucide-react";
import { StrictnessMeter } from "@/components/ui/strictness-meter";
import { StatusBadge } from "@/components/ui/status-badge";
import type { CountryDetail } from "@/lib/types";
import { useState } from "react";

function stripThinkTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

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
      const raw = data.status ? data.data.summary : data.message || "Report unavailable.";
      setAiReport(stripThinkTags(raw));
    } catch {
      setAiReport("Failed to generate report.");
    } finally {
      setIsLoadingReport(false);
    }
  }

  function handleExport() {
    const lines: string[] = [];
    lines.push("Cyber Law Comparison Report");
    lines.push(`Countries: ${countries.map(c => c.countryName).join(", ")}`);
    lines.push(`Generated: ${new Date().toLocaleDateString()}`);
    lines.push("");
    lines.push("Country,Strictness Score,Primary Legislation,Law Status,Enacted Year,Enforcement Agency");
    countries.forEach(c => {
      lines.push(`"${c.countryName}",${c.overallStrictnessScore},"${c.primaryAct}","${c.lawStatus}",${c.enactedYear},"${c.enforcementAgency}"`);
    });
    lines.push("");
    lines.push("Crime Category,Country,Legal Section,Max Prison (yrs),Max Fine (USD),Bailable");
    crimeCategories.forEach(cat => {
      countries.forEach(c => {
        const crime = c.crimesMatrix.find(cm => cm.categoryId === cat);
        if (crime) {
          lines.push(`"${crime.crimeName}","${c.countryName}","${crime.legalSection}",${crime.maxPrisonTermYears},${crime.maxFineUsd},${crime.isBailable}`);
        }
      });
    });
    if (aiReport) {
      lines.push("");
      lines.push("AI Report");
      lines.push(aiReport);
    }

    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cyber-law-comparison-${countries.map(c => c.isoCode).join("-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
            className="w-full max-w-4xl bg-zinc-950/98 border border-white/[0.04] rounded-t-3xl lg:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <span className="text-sm">⚡</span>
                <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-[0.15em] font-[family-name:var(--font-quantico)]">
                  Side-by-Side Comparison
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content — everything scrolls together including AI report */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* DESKTOP VIEW */}
              <div className="hidden lg:block">
                <div className="min-w-[500px]">
                  {/* Country Headers */}
                  <div className="grid gap-px bg-zinc-800/30" style={{ gridTemplateColumns: `minmax(140px, 200px) repeat(${countries.length}, minmax(110px, 1fr))` }}>
                    <div className="bg-zinc-950 p-3">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 font-semibold font-[family-name:var(--font-quantico)]">
                        Metric
                      </span>
                    </div>
                    {countries.map((c) => (
                      <div key={c.countryId} className="bg-zinc-950 p-3 text-center">
                        <span className="text-xl">{c.flagEmoji}</span>
                        <div className="text-[11px] text-zinc-200 font-semibold mt-1">{c.countryName}</div>
                      </div>
                    ))}
                  </div>

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
                                  {crime.maxPrisonTermYears > 0 ? `${crime.maxPrisonTermYears} yrs` : "Civil"}
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
              </div>

              {/* MOBILE VIEW (Wireframe card layout) */}
              <div className="block lg:hidden p-4 space-y-4">
                {/* Selected countries */}
                <div className="text-[11px] text-zinc-400 font-mono tracking-wide border border-dashed border-zinc-700/50 p-2.5 rounded-lg bg-zinc-900/30">
                  <span className="text-zinc-600 mr-2">Selected:</span>
                  {countries.map((c, i) => (
                    <span key={c.countryId}>
                      <span className="text-zinc-500">{c.isoCode}</span> <span className="text-zinc-200">{c.countryName}</span>
                      {i < countries.length - 1 && <span className="text-zinc-700 mx-1.5">•</span>}
                    </span>
                  ))}
                </div>

                <MobileCard title="Overall Strictness" icon="📊">
                  {countries.map(c => (
                    <div key={c.countryId} className="flex items-center justify-between text-xs font-mono py-1.5">
                      <div className="w-[85px] text-zinc-300 truncate">
                        <span className="text-zinc-500 mr-1.5">{c.isoCode}</span>{c.countryName}
                      </div>
                      <div className="flex-1 flex items-center justify-end gap-3 pl-2">
                        <span className="text-zinc-400 text-right w-[60px]">[ {c.overallStrictnessScore.toFixed(1)} / 10 ]</span>
                        <div className="w-[60px] h-1.5 bg-zinc-800 rounded-full overflow-hidden flex shrink-0">
                          <div className="h-full" style={{ width: `${(c.overallStrictnessScore / 10) * 100}%`, backgroundColor: c.colorCode }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </MobileCard>

                <MobileCard title="Primary Legislation" icon="📜">
                  {countries.map(c => (
                    <div key={c.countryId} className="flex flex-col gap-1.5 text-[11px] font-mono py-2 border-b border-dashed border-zinc-800/60 last:border-0">
                      <div className="flex justify-between items-start">
                        <div className="text-zinc-300 font-semibold">
                          <span className="text-zinc-500 mr-1.5 font-normal">{c.isoCode}</span>{c.countryName}
                        </div>
                        <span className="text-[9px] text-emerald-400 bg-emerald-400/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          [{c.lawStatus}]
                        </span>
                      </div>
                      <div className="text-zinc-400 pl-6 leading-relaxed">: {c.primaryAct}</div>
                    </div>
                  ))}
                </MobileCard>

                <MobileCard title="Enforcement & Year" icon="🏛️">
                  {countries.map(c => (
                    <div key={c.countryId} className="flex flex-col gap-1.5 text-[11px] font-mono py-2 border-b border-dashed border-zinc-800/60 last:border-0">
                      <div className="text-zinc-300 font-semibold">
                        <span className="text-zinc-500 mr-1.5 font-normal">{c.isoCode}</span>{c.countryName} <span className="text-zinc-600 font-normal ml-1">({c.enactedYear})</span>
                      </div>
                      <div className="text-zinc-400 pl-6 leading-relaxed">: {c.enforcementAgency}</div>
                    </div>
                  ))}
                </MobileCard>

                <MobileCard title="Draft Bills" icon="📝">
                  {countries.map(c => (
                    <div key={c.countryId} className="flex flex-col gap-1.5 text-[11px] font-mono py-2 border-b border-dashed border-zinc-800/60 last:border-0">
                      <div className="text-zinc-300 font-semibold">
                        <span className="text-zinc-500 mr-1.5 font-normal">{c.isoCode}</span>{c.countryName}
                      </div>
                      <div className="text-amber-400/80 pl-6 leading-relaxed space-y-1">
                        {c.draftLaws.length === 0 ? <span className="text-zinc-600">: None</span> : c.draftLaws.map(d => <div key={d.id}>: {d.billName}</div>)}
                      </div>
                    </div>
                  ))}
                </MobileCard>

                {crimeCategories.map(cat => {
                  const categoryName = countries
                    .flatMap((c) => c.crimesMatrix)
                    .find((cm) => cm.categoryId === cat)?.crimeName ?? cat;
                  return (
                    <MobileCard key={cat} title={categoryName} icon="💻">
                      {countries.map(c => {
                        const crime = c.crimesMatrix.find((cm) => cm.categoryId === cat);
                        if (!crime) return null;
                        return (
                          <div key={c.countryId} className="flex flex-col gap-1.5 text-[11px] font-mono py-2 border-b border-dashed border-zinc-800/60 last:border-0">
                            <div className="text-zinc-300 font-semibold">
                              <span className="text-zinc-500 mr-1.5 font-normal">{c.isoCode}</span>{c.countryName}
                            </div>
                            <div className="pl-[22px] flex flex-wrap gap-1.5 items-center mt-0.5">
                              <span className="text-zinc-600 mr-1">:</span>
                              <span className={crime.maxPrisonTermYears > 0 ? "text-red-400/90" : "text-zinc-500"}>
                                {crime.maxPrisonTermYears > 0 ? `Up to ${crime.maxPrisonTermYears} yrs` : "Civil"}
                              </span>
                              <span className="text-zinc-700">•</span>
                              <span className="text-amber-400/90">${crime.maxFineUsd.toLocaleString()}</span>
                              <span className="text-zinc-700">•</span>
                              <span className={crime.isBailable ? "text-emerald-500/80" : "text-red-400/80"}>
                                {crime.isBailable ? "Bailable" : "Non-Bailable"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </MobileCard>
                  );
                })}

                <MobileCard title="AI Regulation" icon="🤖">
                  {countries.map(c => {
                    const ai = c.aiCyberCrimes;
                    return (
                      <div key={c.countryId} className="flex items-center justify-between text-[11px] font-mono py-2 border-b border-dashed border-zinc-800/60 last:border-0">
                        <div className="text-zinc-300 font-semibold">
                          <span className="text-zinc-500 mr-1.5 font-normal">{c.isoCode}</span>{c.countryName}
                        </div>
                        {ai ? (
                          <div className="flex gap-2.5 items-center">
                            <span className={ai.hasDedicatedAiAct ? "text-purple-400" : "text-zinc-600"}>{ai.hasDedicatedAiAct ? "[AI ACT]" : "[NO ACT]"}</span>
                            <span className="text-zinc-400">{ai.deepfakeRules.takedownWindowHours}h</span>
                          </div>
                        ) : (
                          <span className="text-zinc-600">N/A</span>
                        )}
                      </div>
                    );
                  })}
                </MobileCard>
              </div>

              {/* AI Report — INSIDE scrollable area so it doesn't hide comparison */}
              {aiReport && (
                <div className="px-4 pb-4">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-br from-purple-500/[0.04] to-cyan-500/[0.04] border border-purple-500/10 rounded-xl"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-[10px] uppercase tracking-[0.15em] text-purple-300 font-semibold font-[family-name:var(--font-quantico)]">AI Analysis</span>
                    </div>
                    <div className="text-[11px] text-zinc-300 leading-relaxed space-y-2">
                      {aiReport.split("\n").filter(l => l.trim()).map((line, i) => (
                        <p key={i} className={line.startsWith("•") || line.startsWith("-") || line.startsWith("*") ? "pl-3 border-l border-purple-500/20" : ""}>
                          {line.replace(/^\*\*(.*?)\*\*/, "").replace(/\*\*/g, "")}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Footer actions — sticky at bottom */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.04] gap-2 shrink-0">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-zinc-500 hover:text-zinc-200 border border-white/[0.04] hover:border-white/[0.08] transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button
                onClick={generateAiReport}
                disabled={isLoadingReport}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-purple-500/15 to-cyan-500/15 border border-purple-500/15 rounded-lg text-[11px] font-medium text-purple-300 hover:from-purple-500/25 hover:to-cyan-500/25 transition-all disabled:opacity-50 font-[family-name:var(--font-quantico)] tracking-wider"
              >
                {isLoadingReport ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                AI REPORT
              </button>
            </div>
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
      className="grid gap-px bg-zinc-800/20 border-b border-white/[0.03]"
      style={{ gridTemplateColumns: `minmax(140px, 200px) repeat(${countries.length}, minmax(110px, 1fr))` }}
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

function MobileCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="border border-dashed border-zinc-700/40 rounded-xl bg-zinc-900/5 overflow-hidden">
      <div className="px-3.5 py-2 border-b border-dashed border-zinc-700/40 flex items-center gap-2.5 bg-zinc-900/30">
        <span className="text-sm">{icon}</span>
        <span className="text-[9px] font-semibold text-zinc-300 uppercase tracking-[0.2em] font-[family-name:var(--font-quantico)]">{title}</span>
      </div>
      <div className="p-3.5">
        {children}
      </div>
    </div>
  );
}
