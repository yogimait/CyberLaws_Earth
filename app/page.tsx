// Main globe page — orchestrates all components.
"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { CyberGlobe, type GlobeApi } from "@/components/globe/cyber-globe";
import { GlobeControls } from "@/components/globe/globe-controls";
import { IconDock } from "@/components/layout/icon-dock";
import { CountryDrawer } from "@/components/panels/country-drawer";
import { ComparisonModal } from "@/components/panels/comparison-modal";
import { AiSearchPanel } from "@/components/panels/ai-search-panel";
import type { Country, CountryDetail } from "@/lib/types";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  // State
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<CountryDetail | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareList, setCompareList] = useState<Country[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [comparisonCountries, setComparisonCountries] = useState<CountryDetail[]>([]);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [showDraftLaws, setShowDraftLaws] = useState(true);
  const [showAiRegulations, setShowAiRegulations] = useState(false);

  const globeApiRef = useRef<GlobeApi | null>(null);
  const handleGlobeReady = useCallback((api: GlobeApi) => {
    globeApiRef.current = api;
  }, []);

  useEffect(() => {
    fetch("/api/countries")
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          setAllCountries(data.data.countries);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const stats = useMemo(() => {
    if (allCountries.length === 0) return null;
    const total = allCountries.length;
    const average =
      allCountries.reduce((sum, c) => sum + c.overallStrictnessScore, 0) / total;
    const strictest = allCountries.reduce((top, c) =>
      c.overallStrictnessScore > top.overallStrictnessScore ? c : top
    );
    const withAiAct = allCountries.filter((c) => c.aiCyberCrimes?.hasDedicatedAiAct).length;
    return { total, average, strictest, withAiAct };
  }, [allCountries]);

  // Handlers
  const handleCountryClick = useCallback(
    async (countryId: string) => {
      if (isCompareMode) {
        handleAddToCompare(countryId);
        return;
      }
      const res = await fetch(`/api/countries/${countryId}`);
      const data = await res.json();
      if (data.status) {
        setSelectedCountry(data.data);
        setIsDrawerOpen(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isCompareMode, compareList, allCountries]
  );

  function handleAddToCompare(countryId: string) {
    if (compareList.length >= 3) return;
    if (compareList.some((c) => c.countryId === countryId)) return;
    const country = allCountries.find((c) => c.countryId === countryId);
    if (country) {
      setCompareList((prev) => [...prev, country]);
    }
  }

  function handleRemoveFromCompare(countryId: string) {
    setCompareList((prev) => prev.filter((c) => c.countryId !== countryId));
  }

  async function handleCompareNow() {
    if (compareList.length < 2) return;
    const res = await fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countryIds: compareList.map((c) => c.countryId) }),
    });
    const data = await res.json();
    if (data.status) {
      setComparisonCountries(data.data.countries);
      setIsComparisonOpen(true);
    }
  }

  function handleToggleCompare() {
    setIsCompareMode((prev) => !prev);
    if (isCompareMode) {
      setCompareList([]);
    }
  }

  function handleSearch(query: string) {
    setAiQuery(query);
    setIsAiOpen(true);
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#050505]">
      {/* Ambience — starfield, aurora bloom, scanline grid */}
      <div className="absolute inset-0 starfield pointer-events-none" />
      <div className="absolute inset-0 aurora-bloom pointer-events-none" />
      <div className="absolute inset-0 hud-grid pointer-events-none" />

      {isLoading && (
        <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-4" />
          <div className="text-zinc-500 text-sm animate-pulse tracking-widest uppercase">
            Connecting to Database...
          </div>
        </div>
      )}

      {/* Brand mark — the only fixed chrome left; every control floats */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-2xl border border-white/[0.05] pointer-events-none">
        <span className="relative w-4 h-4 rounded-md bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-white/[0.06] flex items-center justify-center text-[9px]">
          🌐
        </span>
        <span className="text-[10px] font-semibold text-zinc-400 tracking-[0.18em] font-[family-name:var(--font-quantico)]">
          CYBER-SPHERE
        </span>
        {isCompareMode && (
          <span className="text-[9px] font-bold text-cyan-400 tracking-[0.14em] border-l border-white/[0.06] pl-2 font-[family-name:var(--font-quantico)]">
            COMPARE
          </span>
        )}
      </div>

      {/* Globe */}
      <div className="absolute inset-0">
        <CyberGlobe
          countries={allCountries}
          onCountryClick={handleCountryClick}
          compareList={compareList.map((c) => c.countryId)}
          isCompareMode={isCompareMode}
          onAddToCompare={handleAddToCompare}
          showDraftLaws={showDraftLaws}
          showAiRegulations={showAiRegulations}
          onReady={handleGlobeReady}
        />
        <GlobeControls
          onZoomIn={() => globeApiRef.current?.zoomIn()}
          onZoomOut={() => globeApiRef.current?.zoomOut()}
          onReset={() => globeApiRef.current?.reset()}
        />
      </div>

      {/* HUD corner brackets */}
      <div className="pointer-events-none absolute inset-3 z-10 hidden sm:block">
        <span className="absolute top-0 left-0 w-5 h-5 border-l border-t border-cyan-500/20 rounded-tl-md" />
        <span className="absolute top-0 right-0 w-5 h-5 border-r border-t border-cyan-500/20 rounded-tr-md" />
        <span className="absolute bottom-0 left-0 w-5 h-5 border-l border-b border-cyan-500/20 rounded-bl-md" />
        <span className="absolute bottom-0 right-0 w-5 h-5 border-r border-b border-cyan-500/20 rounded-br-md" />
      </div>

      {/* Live telemetry strip */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-black/55 backdrop-blur-2xl border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-subtle" />
            <span className="text-[9px] uppercase tracking-[0.18em] text-zinc-500 font-[family-name:var(--font-quantico)]">
              Live
            </span>
          </span>
          <Stat label="Jurisdictions" value={String(stats.total)} />
          <Stat label="Avg Strictness" value={stats.average.toFixed(1)} accent="#06b6d4" />
          <Stat
            label="Strictest"
            value={`${stats.strictest.flagEmoji} ${stats.strictest.overallStrictnessScore.toFixed(1)}`}
            accent={stats.strictest.colorCode}
          />
          <Stat label="AI Acts" value={String(stats.withAiAct)} accent="#a855f7" />
        </motion.div>
      )}

      {/* Floating draggable option icons */}
      <IconDock
        countries={allCountries}
        onSelectCountry={handleCountryClick}
        onSearch={handleSearch}
        onOpenAi={() => setIsAiOpen(true)}
        isCompareMode={isCompareMode}
        onToggleCompareMode={handleToggleCompare}
        showDraftLaws={showDraftLaws}
        onToggleDraftLaws={() => setShowDraftLaws((prev) => !prev)}
        showAiRegulations={showAiRegulations}
        onToggleAiRegulations={() => setShowAiRegulations((prev) => !prev)}
        compareList={compareList}
        onRemoveFromCompare={handleRemoveFromCompare}
        onCompareNow={handleCompareNow}
      />

      {/* Country Detail Drawer */}
      <CountryDrawer
        country={selectedCountry}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAddToCompare={isCompareMode ? handleAddToCompare : undefined}
      />

      {/* Comparison Modal */}
      <ComparisonModal
        countries={comparisonCountries}
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
      />

      {/* AI Search Panel */}
      <AiSearchPanel
        key={aiQuery}
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        initialQuery={aiQuery}
      />
    </main>
  );
}

function Stat({
  label,
  value,
  accent = "#a1a1aa",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <span className="flex items-center gap-1.5 border-l border-white/[0.05] pl-3">
      <span className="text-[9px] uppercase tracking-[0.14em] text-zinc-600 hidden sm:inline font-[family-name:var(--font-quantico)]">
        {label}
      </span>
      <span className="text-[11px] font-bold font-mono" style={{ color: accent }}>
        {value}
      </span>
    </span>
  );
}
