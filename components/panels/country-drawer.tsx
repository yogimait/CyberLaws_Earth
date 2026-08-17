// Country detail drawer — bottom sheet on mobile, right panel on desktop.
"use client";

function stripThinkTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronDown,
  ChevronUp,
  Scale,
  Shield,
  Sparkles,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { StrictnessMeter } from "@/components/ui/strictness-meter";
import { StatusBadge } from "@/components/ui/status-badge";
import type { CountryDetail } from "@/lib/types";

interface CountryDrawerProps {
  country: CountryDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCompare?: (countryId: string) => void;
}

export function CountryDrawer({ country, isOpen, onClose, onAddToCompare }: CountryDrawerProps) {
  const [expandedCrime, setExpandedCrime] = useState<number | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  if (!country) return null;

  async function handleAiSummary() {
    if (!country) return;
    setIsLoadingAi(true);
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryName: country.countryName,
          crimeTopic: "overall cyber law framework and key penalties",
        }),
      });
      const data = await response.json();
      if (data.status) {
        setAiSummary(stripThinkTags(data.data.summary));
      } else {
        setAiSummary(data.message || "AI summary unavailable. Configure GROQ_API_KEY.");
      }
    } catch {
      setAiSummary("Failed to fetch AI summary. Check your connection.");
    } finally {
      setIsLoadingAi(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%", x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: "100%", x: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/60 rounded-t-3xl overflow-hidden flex flex-col lg:top-0 lg:bottom-0 lg:left-auto lg:right-0 lg:w-[400px] lg:max-h-full lg:rounded-none lg:rounded-l-3xl lg:border-t-0 lg:border-l"
          >
            {/* Drag handle — mobile */}
            <div className="flex justify-center pt-2 pb-1 lg:hidden">
              <div className="w-10 h-1 bg-zinc-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-4 pt-3 pb-3 border-b border-zinc-800/40">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{country.flagEmoji}</span>
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">
                    {country.countryName}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status={country.lawStatus} size="sm" />
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {country.countryId}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {onAddToCompare && (
                  <button
                    onClick={() => onAddToCompare(country.countryId)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all text-xs"
                    title="Add to comparison"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 custom-scrollbar">
              {/* Strictness Score */}
              <div className="p-3 bg-zinc-900/60 border border-zinc-800/40 rounded-xl">
                <StrictnessMeter score={country.overallStrictnessScore} size="lg" />
                
                {country.crimesMatrix.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-zinc-800/50 space-y-2">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1.5">Category Breakdown</div>
                    {country.crimesMatrix.map(c => (
                      <div key={`chart-${c.id}`} className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-400 w-32 truncate" title={c.crimeName}>{c.crimeName}</span>
                        <div className="flex-1 h-1.5 bg-zinc-800/60 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(c.strictnessRating / 10) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full rounded-full" 
                            style={{ 
                              backgroundColor: c.strictnessRating >= 8 ? "#ef4444" : c.strictnessRating >= 5 ? "#f59e0b" : "#22c55e"
                            }} 
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold w-6 text-right" style={{ color: c.strictnessRating >= 8 ? "#ef4444" : c.strictnessRating >= 5 ? "#f59e0b" : "#22c55e" }}>
                          {c.strictnessRating.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Legal Framework */}
              <section>
                <div className="flex items-center gap-1.5 mb-2">
                  <Scale className="w-3.5 h-3.5 text-zinc-500" />
                  <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
                    Legal Framework
                  </h3>
                </div>
                <div className="p-3 bg-zinc-900/40 border border-zinc-800/30 rounded-xl space-y-2">
                  <InfoRow label="Primary Act" value={country.primaryAct} />
                  <InfoRow label="Enacted" value={`${country.enactedYear}`} />
                  <InfoRow label="Last Amended" value={`${country.lastAmendmentYear}`} />
                  <InfoRow label="Enforcement" value={country.enforcementAgency} />
                </div>
              </section>

              {/* Crime Categories */}
              {country.crimesMatrix.length > 0 && (
                <section>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Shield className="w-3.5 h-3.5 text-zinc-500" />
                    <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
                      Cyber Crimes ({country.crimesMatrix.length})
                    </h3>
                  </div>
                  <div className="space-y-1.5">
                    {country.crimesMatrix.map((crime) => (
                      <div
                        key={crime.id}
                        className="bg-zinc-900/40 border border-zinc-800/30 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            setExpandedCrime(expandedCrime === crime.id ? null : crime.id)
                          }
                          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-800/30 transition-colors"
                        >
                          <div className="text-left">
                            <div className="text-xs text-zinc-200 font-medium">
                              {crime.crimeName}
                            </div>
                            <div className="text-[10px] text-zinc-500 mt-0.5">
                              {crime.legalSection}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[11px] font-mono font-bold"
                              style={{
                                color:
                                  crime.strictnessRating >= 8
                                    ? "#ef4444"
                                    : crime.strictnessRating >= 5
                                    ? "#f59e0b"
                                    : "#22c55e",
                              }}
                            >
                              {crime.strictnessRating.toFixed(1)}
                            </span>
                            {expandedCrime === crime.id ? (
                              <ChevronUp className="w-3.5 h-3.5 text-zinc-600" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
                            )}
                          </div>
                        </button>

                        <AnimatePresence>
                          {expandedCrime === crime.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pb-3 pt-2 border-t border-zinc-800/30">
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                  <div className="p-2 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                                    <div className="text-[10px] uppercase text-zinc-500 font-semibold mb-1">Max Prison</div>
                                    <div className="text-sm font-bold text-zinc-100">
                                      {crime.maxPrisonTermYears > 0 ? `${crime.maxPrisonTermYears} YRS` : "Civil"}
                                    </div>
                                    <div className="w-full h-1 bg-zinc-800/60 rounded-full mt-2 overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((crime.maxPrisonTermYears / 20) * 100, 100)}%` }}
                                        className="h-full bg-red-500 rounded-full" 
                                      />
                                    </div>
                                  </div>
                                  <div className="p-2 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                                    <div className="text-[10px] uppercase text-zinc-500 font-semibold mb-1">Max Fine</div>
                                    <div className="text-sm font-bold text-zinc-100">
                                      ${crime.maxFineUsd >= 1000000 ? (crime.maxFineUsd/1000000).toFixed(1) + 'M' : crime.maxFineUsd.toLocaleString()}
                                    </div>
                                    <div className="w-full h-1 bg-zinc-800/60 rounded-full mt-2 overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((crime.maxFineUsd / 5000000) * 100, 100)}%` }}
                                        className="h-full bg-amber-500 rounded-full" 
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-zinc-950/30 rounded-lg border border-zinc-800/30 mb-2">
                                  <span className="text-[11px] text-zinc-500 font-semibold uppercase">Bail Status</span>
                                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: crime.isBailable ? "#22c55e" : "#ef4444" }}>
                                    {crime.isBailable ? "Bailable" : "Non-Bailable"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-300 leading-relaxed border-l-2 border-zinc-700 pl-2.5 py-0.5">
                                  {crime.summary}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Draft / Pending Laws */}
              {country.draftLaws.length > 0 && (
                <section>
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500/70" />
                    <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
                      Pending Bills ({country.draftLaws.length})
                    </h3>
                  </div>
                  <div className="space-y-1.5">
                    {country.draftLaws.map((law) => (
                      <div
                        key={law.id}
                        className="p-2.5 bg-amber-500/5 border border-amber-500/15 rounded-xl"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs text-amber-300/80 font-medium">
                              {law.billName}
                            </div>
                            <div className="text-[10px] text-zinc-500 mt-0.5">
                              Stage: {law.currentStage}
                            </div>
                          </div>
                          <StatusBadge
                            status={law.isNotified ? "enacted" : "draft"}
                            size="sm"
                          />
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">
                          {law.keyFocus}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* AI Cyber Crimes */}
              {country.aiCyberCrimes && (
                <section>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500/70" />
                    <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
                      AI Regulation
                    </h3>
                  </div>
                  <div className="p-3 bg-purple-500/5 border border-purple-500/15 rounded-xl space-y-2">
                    <InfoRow
                      label="Dedicated AI Act"
                      value={country.aiCyberCrimes.hasDedicatedAiAct ? "Yes ✓" : "No"}
                      valueColor={country.aiCyberCrimes.hasDedicatedAiAct ? "#a855f7" : "#71717a"}
                    />
                    <InfoRow
                      label="Deepfake Takedown"
                      value={`${country.aiCyberCrimes.deepfakeRules.takedownWindowHours}h window`}
                    />
                    <InfoRow
                      label="Voice Cloning"
                      value={`${country.aiCyberCrimes.voiceCloningAndSyntheticFraud.strictnessRating.toFixed(1)}/10`}
                    />
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      {country.aiCyberCrimes.deepfakeRules.penalties}
                    </p>
                  </div>
                </section>
              )}

              {/* AI Summary Button */}
              <div className="pb-4">
                <button
                  onClick={handleAiSummary}
                  disabled={isLoadingAi}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-500/15 to-cyan-500/15 border border-purple-500/20 rounded-xl text-xs font-semibold text-purple-300 hover:from-purple-500/25 hover:to-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoadingAi ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Summarize with AI
                    </>
                  )}
                </button>

                {aiSummary && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 p-3 bg-zinc-900/60 border border-zinc-800/40 rounded-xl"
                  >
                    <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-line">
                      {aiSummary}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function InfoRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[11px] text-zinc-500 font-medium shrink-0">{label}</span>
      <span
        className="text-[11px] text-right font-bold tracking-wide"
        style={{ color: valueColor ?? "#e4e4e7" }}
      >
        {value}
      </span>
    </div>
  );
}
