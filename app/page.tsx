// Main globe page — orchestrates all components.
"use client";

import { useState, useCallback, useEffect } from "react";
import { CyberGlobe } from "@/components/globe/cyber-globe";
import { GlobeControls } from "@/components/globe/globe-controls";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { CountryDrawer } from "@/components/panels/country-drawer";
import { ComparisonModal } from "@/components/panels/comparison-modal";
import { AiSearchPanel } from "@/components/panels/ai-search-panel";
import { SearchBar } from "@/components/ui/search-bar";
import type { Country, CountryDetail } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [showDraftLaws, setShowDraftLaws] = useState(true);
  const [showAiRegulations, setShowAiRegulations] = useState(false);

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
    console.log("Search:", query);
    setIsAiOpen(true);
    setIsSearchOpen(false);
  }

  function handleSelectCountry(countryId: string) {
    setIsSearchOpen(false);
    handleCountryClick(countryId);
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#050505]">
      {isLoading && (
        <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-4" />
          <div className="text-zinc-500 text-sm animate-pulse tracking-widest uppercase">Connecting to Database...</div>
        </div>
      )}
      {/* Header */}
      <Header
        isCompareMode={isCompareMode}
        onToggleCompare={handleToggleCompare}
        onToggleSearch={() => setIsSearchOpen((prev) => !prev)}
        onToggleAi={() => setIsAiOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        compareCount={compareList.length}
      />

      {/* Search overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-3 right-3 z-40 lg:left-[280px] lg:right-6"
          >
            <SearchBar
              countries={allCountries}
              onSelectCountry={handleSelectCountry}
              onSearch={handleSearch}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        showDraftLaws={showDraftLaws}
        onToggleDraftLaws={() => setShowDraftLaws((prev) => !prev)}
        showAiRegulations={showAiRegulations}
        onToggleAiRegulations={() => setShowAiRegulations((prev) => !prev)}
        compareList={compareList}
        onRemoveFromCompare={handleRemoveFromCompare}
        onCompareNow={handleCompareNow}
        isCompareMode={isCompareMode}
      />

      {/* Globe */}
      <div className="absolute inset-0 lg:pl-[260px]">
        <CyberGlobe
          countries={allCountries}
          onCountryClick={handleCountryClick}
          compareList={compareList.map((c) => c.countryId)}
          isCompareMode={isCompareMode}
          onAddToCompare={handleAddToCompare}
        />
        <GlobeControls
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onReset={() => {}}
        />
      </div>

      {/* Compare mode indicator — mobile */}
      {isCompareMode && (
        <div className="fixed bottom-3 left-3 right-3 z-30 lg:hidden">
          <div className="bg-black/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-cyan-400 font-semibold">
                ⚡ Compare Mode ({compareList.length}/3)
              </span>
              {compareList.length >= 2 && (
                <button
                  onClick={handleCompareNow}
                  className="px-3 py-1.5 bg-cyan-500/15 border border-cyan-500/30 rounded-lg text-[11px] font-semibold text-cyan-400"
                >
                  Compare Now
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {compareList.map((c) => (
                <div
                  key={c.countryId}
                  className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900/60 border border-zinc-800/60 rounded-lg"
                >
                  <span className="text-sm">{c.flagEmoji}</span>
                  <span className="text-[11px] text-zinc-300">{c.countryName}</span>
                  <button
                    onClick={() => handleRemoveFromCompare(c.countryId)}
                    className="text-zinc-600 hover:text-red-400 ml-0.5 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              {compareList.length === 0 && (
                <span className="text-[11px] text-zinc-600 italic">Tap countries to select</span>
              )}
            </div>
          </div>
        </div>
      )}

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
      <AiSearchPanel isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </main>
  );
}
