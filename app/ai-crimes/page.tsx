// AI-Related Cyber Crimes section — Bonus +10 marks.
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  Scan,
  AudioLines,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const AI_CRIME_CATEGORIES = [
  {
    id: "deepfakes",
    title: "Deepfakes & Identity Cloning",
    icon: Scan,
    description:
      "AI-generated synthetic media used to create fake videos, images, or audio of real people for fraud, defamation, or political manipulation.",
    color: "#ef4444",
    examples: [
      "Non-consensual deepfake pornography",
      "Political deepfakes during elections",
      "CEO fraud / business email compromise using face-swap",
      "Identity cloning for financial fraud",
    ],
  },
  {
    id: "phishing",
    title: "AI Phishing / Voice Scams",
    icon: AudioLines,
    description:
      "AI-powered voice cloning and natural language generation used to conduct sophisticated phishing attacks and social engineering scams.",
    color: "#f59e0b",
    examples: [
      "AI voice cloning for phone scams (vishing)",
      "LLM-generated spear phishing emails",
      "Synthetic voice authorization fraud",
      "Chatbot impersonation attacks",
    ],
  },
  {
    id: "adversarial",
    title: "Adversarial AI Attacks & Data Poisoning",
    icon: Brain,
    description:
      "Attacks targeting AI/ML systems through adversarial inputs, model manipulation, or training data corruption.",
    color: "#a855f7",
    examples: [
      "Adversarial examples to fool facial recognition",
      "Training data poisoning attacks",
      "Model inversion / extraction attacks",
      "Prompt injection in LLM-powered systems",
    ],
  },
  {
    id: "regulation",
    title: "AI Regulation Laws",
    icon: Shield,
    description:
      "Emerging legal frameworks specifically designed to regulate AI development, deployment, and accountability.",
    color: "#06b6d4",
    examples: [
      "EU AI Act — world's first comprehensive AI law",
      "China's Deep Synthesis Provisions 2023",
      "US Executive Order on Safe AI (Oct 2023)",
      "India's Digital India Act (DIA) — draft stage",
    ],
  },
];

export default function AiCrimesPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("deepfakes");
  const [countriesWithAiData, setCountriesWithAiData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/countries")
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          const aiCountries = data.data.countries.filter((c: any) => c.aiCyberCrimes !== null);
          setCountriesWithAiData(aiCountries);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-100 relative">
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
          <div className="text-zinc-500 text-sm animate-pulse tracking-widest uppercase">Fetching Global AI Laws...</div>
        </div>
      )}
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-zinc-800/40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100">AI-Related Cyber Crimes</h1>
            <p className="text-[11px] text-zinc-500">Emerging threats & global regulations</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Intro */}
        <div className="p-4 bg-purple-500/5 border border-purple-500/15 rounded-2xl">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Artificial Intelligence is creating entirely new categories of cyber crime. From
            deepfake fraud to adversarial attacks on ML models, these threats are outpacing
            traditional legislation. Here&apos;s how the world is responding.
          </p>
        </div>

        {/* Crime Categories */}
        <div className="space-y-3">
          {AI_CRIME_CATEGORIES.map((category) => {
            const isExpanded = expandedCategory === category.id;
            const Icon = category.icon;

            return (
              <div
                key={category.id}
                className="bg-zinc-900/40 border border-zinc-800/30 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800/20 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: category.color }} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm text-zinc-200 font-medium">{category.title}</div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-zinc-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-600" />
                  )}
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-zinc-800/20"
                  >
                    <div className="px-4 py-3 space-y-3">
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        {category.description}
                      </p>

                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold">
                          Examples
                        </span>
                        <ul className="mt-1.5 space-y-1">
                          {category.examples.map((example) => (
                            <li
                              key={example}
                              className="flex items-start gap-2 text-[11px] text-zinc-400"
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full mt-1 shrink-0"
                                style={{ backgroundColor: `${category.color}80` }}
                              />
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Country AI Regulation Comparison */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-200 mb-3">
            🌍 Global AI Regulation Status
          </h2>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-zinc-800/40">
                  <th className="text-left text-[10px] uppercase tracking-widest text-zinc-600 font-semibold py-2 pr-3">
                    Country
                  </th>
                  <th className="text-left text-[10px] uppercase tracking-widest text-zinc-600 font-semibold py-2 pr-3">
                    AI Act
                  </th>
                  <th className="text-left text-[10px] uppercase tracking-widest text-zinc-600 font-semibold py-2 pr-3">
                    Deepfake Takedown
                  </th>
                  <th className="text-right text-[10px] uppercase tracking-widest text-zinc-600 font-semibold py-2">
                    AI Strictness
                  </th>
                </tr>
              </thead>
              <tbody>
                {countriesWithAiData.map((country) => {
                  const ai = country.aiCyberCrimes;
                  if (!ai) return null;

                  return (
                    <tr key={country.countryId} className="border-b border-zinc-800/20">
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{country.flagEmoji}</span>
                          <span className="text-xs text-zinc-300">{country.countryName}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={`text-xs font-medium ${
                            ai.hasDedicatedAiAct ? "text-purple-400" : "text-zinc-600"
                          }`}
                        >
                          {ai.hasDedicatedAiAct ? "Yes ✓" : "No"}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="text-xs text-zinc-400">
                          {ai.deepfakeRules.takedownWindowHours}h
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className="text-xs font-mono font-bold"
                          style={{
                            color:
                              ai.voiceCloningAndSyntheticFraud.strictnessRating >= 8
                                ? "#ef4444"
                                : ai.voiceCloningAndSyntheticFraud.strictnessRating >= 5
                                ? "#f59e0b"
                                : "#22c55e",
                          }}
                        >
                          {ai.voiceCloningAndSyntheticFraud.strictnessRating.toFixed(1)}/10
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Back to Globe */}
        <div className="text-center pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Globe
          </Link>
        </div>
      </div>
    </main>
  );
}
