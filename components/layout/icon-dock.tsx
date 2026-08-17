// Floating, draggable option icons — replaces the sidebar and the nav bar.
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useAnimationControls,
  type PanInfo,
} from "framer-motion";
import {
  Layers,
  GitCompareArrows,
  Palette,
  Search,
  Sparkles,
  Brain,
  X,
  Plus,
  GripVertical,
} from "lucide-react";
import { Legend } from "@/components/ui/legend";
import { SearchBar } from "@/components/ui/search-bar";
import type { Country } from "@/lib/types";

interface IconDockProps {
  countries: Country[];
  onSelectCountry: (countryId: string) => void;
  onSearch: (query: string) => void;
  onOpenAi: () => void;
  isCompareMode: boolean;
  onToggleCompareMode: () => void;
  showDraftLaws: boolean;
  onToggleDraftLaws: () => void;
  showAiRegulations: boolean;
  onToggleAiRegulations: () => void;
  compareList: Country[];
  onRemoveFromCompare: (countryId: string) => void;
  onCompareNow: () => void;
}

type DockId = "search" | "ai" | "crimes" | "compare" | "layers" | "legend";

// Half the icons park on each edge; the user drags them wherever they like.
const HOME_POSITIONS: Record<DockId, { side: "left" | "right"; y: number }> = {
  search: { side: "left", y: 16 },
  ai: { side: "left", y: 72 },
  crimes: { side: "left", y: 128 },
  compare: { side: "right", y: 16 },
  layers: { side: "right", y: 72 },
  legend: { side: "right", y: 128 },
};

export function IconDock({
  countries,
  onSelectCountry,
  onSearch,
  onOpenAi,
  isCompareMode,
  onToggleCompareMode,
  showDraftLaws,
  onToggleDraftLaws,
  showAiRegulations,
  onToggleAiRegulations,
  compareList,
  onRemoveFromCompare,
  onCompareNow,
}: IconDockProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [openPanel, setOpenPanel] = useState<DockId | null>(null);

  function togglePanel(id: DockId) {
    setOpenPanel((prev) => (prev === id ? null : id));
  }

  // A click on the globe (or anywhere off the dock) dismisses the open panel.
  useEffect(() => {
    if (!openPanel) return;
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (!fieldRef.current?.contains(target)) setOpenPanel(null);
    }
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [openPanel]);

  return (
    <div ref={fieldRef} className="fixed inset-0 z-40 pointer-events-none" aria-label="Controls">
      <DraggableIcon
        id="search"
        label="Search"
        icon={<Search className="w-4 h-4" />}
        accent="#06b6d4"
        fieldRef={fieldRef}
        isOpen={openPanel === "search"}
        onToggle={() => togglePanel("search")}
        panelWidth={272}
      >
        <PanelTitle>Find a Jurisdiction</PanelTitle>
        <SearchBar
          countries={countries}
          onSelectCountry={(countryId) => {
            setOpenPanel(null);
            onSelectCountry(countryId);
          }}
          onSearch={(query) => {
            setOpenPanel(null);
            onSearch(query);
          }}
        />
        <p className="mt-2 text-[10px] text-zinc-600 font-mono">
          {"// enter with no match asks the AI"}
        </p>
      </DraggableIcon>

      <DraggableIcon
        id="ai"
        label="AI Legal Search"
        icon={<Sparkles className="w-4 h-4" />}
        accent="#a855f7"
        fieldRef={fieldRef}
        onActivate={onOpenAi}
      />

      <DraggableIcon
        id="crimes"
        label="AI Cyber Crimes"
        icon={<Brain className="w-4 h-4" />}
        accent="#22c55e"
        fieldRef={fieldRef}
        href="/ai-crimes"
      />

      <DraggableIcon
        id="compare"
        label="Compare"
        icon={<GitCompareArrows className="w-4 h-4" />}
        accent="#06b6d4"
        badge={compareList.length || undefined}
        isHighlighted={isCompareMode}
        fieldRef={fieldRef}
        isOpen={openPanel === "compare"}
        onToggle={() => togglePanel("compare")}
      >
        <PanelTitle>Compare Tray</PanelTitle>
        <button
          onClick={onToggleCompareMode}
          className={`w-full mb-2.5 py-1.5 rounded-lg text-[10px] font-semibold tracking-wider uppercase transition-all font-[family-name:var(--font-quantico)] ${
            isCompareMode
              ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25"
              : "bg-white/[0.03] text-zinc-500 border border-white/[0.05] hover:text-zinc-300"
          }`}
        >
          {isCompareMode ? "Compare mode: on" : "Compare mode: off"}
        </button>

        <div className="space-y-1.5">
          {compareList.length === 0 && (
            <p className="text-[10px] text-zinc-700 font-mono">
              {isCompareMode ? "// tap countries on globe" : "// turn compare mode on"}
            </p>
          )}
          {compareList.map((country) => (
            <div
              key={country.countryId}
              className="flex items-center gap-2 px-2 py-1.5 bg-white/[0.02] border border-white/[0.04] rounded-lg"
              style={{ borderLeftColor: country.colorCode, borderLeftWidth: 2 }}
            >
              <span className="text-sm">{country.flagEmoji}</span>
              <span className="text-[11px] text-zinc-400 flex-1 truncate">
                {country.countryName}
              </span>
              <button
                onClick={() => onRemoveFromCompare(country.countryId)}
                className="text-zinc-700 hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {compareList.length > 0 && compareList.length < 3 && (
            <div className="flex items-center gap-2 px-2 py-1.5 border border-dashed border-white/[0.04] rounded-lg text-zinc-700">
              <Plus className="w-3 h-3" />
              <span className="text-[10px] font-mono">add_country</span>
            </div>
          )}
          {compareList.length >= 2 && (
            <button
              onClick={onCompareNow}
              className="w-full mt-2 py-2 bg-cyan-500/8 border border-cyan-500/15 rounded-xl text-[11px] font-semibold text-cyan-400 hover:bg-cyan-500/15 transition-all font-[family-name:var(--font-quantico)] tracking-wider"
            >
              ⚡ COMPARE NOW
            </button>
          )}
        </div>
      </DraggableIcon>

      <DraggableIcon
        id="layers"
        label="Layers"
        icon={<Layers className="w-4 h-4" />}
        accent="#f59e0b"
        fieldRef={fieldRef}
        isOpen={openPanel === "layers"}
        onToggle={() => togglePanel("layers")}
      >
        <PanelTitle>Map Layers</PanelTitle>
        <div className="space-y-2.5">
          <ToggleSwitch
            label="Draft Laws"
            isOn={showDraftLaws}
            onToggle={onToggleDraftLaws}
            color="amber"
          />
          <ToggleSwitch
            label="AI Regulations"
            isOn={showAiRegulations}
            onToggle={onToggleAiRegulations}
            color="purple"
          />
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-zinc-600 font-mono">
          {showAiRegulations
            ? "// outlines colored by AI-act status"
            : "// outlines colored by strictness"}
        </p>
      </DraggableIcon>

      <DraggableIcon
        id="legend"
        label="Legend"
        icon={<Palette className="w-4 h-4" />}
        accent="#ef4444"
        fieldRef={fieldRef}
        isOpen={openPanel === "legend"}
        onToggle={() => togglePanel("legend")}
      >
        <PanelTitle>Legend</PanelTitle>
        <Legend />
      </DraggableIcon>
    </div>
  );
}

interface DraggableIconProps {
  id: DockId;
  label: string;
  icon: ReactNode;
  accent: string;
  badge?: number;
  isHighlighted?: boolean;
  fieldRef: React.RefObject<HTMLDivElement | null>;
  panelWidth?: number;
  isOpen?: boolean;
  onToggle?: () => void;
  onActivate?: () => void;
  href?: string;
  children?: ReactNode;
}

function DraggableIcon({
  id,
  label,
  icon,
  accent,
  badge,
  isHighlighted,
  fieldRef,
  panelWidth = 214,
  isOpen = false,
  onToggle,
  onActivate,
  href,
  children,
}: DraggableIconProps) {
  const home = HOME_POSITIONS[id];
  const controls = useAnimationControls();
  const nodeRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);
  const [panelSide, setPanelSide] = useState<"left" | "right">(
    home.side === "right" ? "left" : "right"
  );

  function handleDragEnd(_event: unknown, info: PanInfo) {
    // Real movement suppresses the click that follows the pointer release.
    draggedRef.current = Math.abs(info.offset.x) + Math.abs(info.offset.y) > 4;
    controls.start({
      rotate: [0, -10, 8, -6, 4, -2, 0],
      transition: { duration: 0.55, ease: "easeOut" },
    });
  }

  function handleClick(event: React.MouseEvent) {
    if (draggedRef.current) {
      draggedRef.current = false;
      event.preventDefault();
      return;
    }
    if (nodeRef.current) {
      const { left } = nodeRef.current.getBoundingClientRect();
      setPanelSide(left > window.innerWidth / 2 ? "left" : "right");
    }
    onActivate?.();
    onToggle?.();
  }

  const isLit = isOpen || isHighlighted;
  const buttonClasses =
    "group relative w-11 h-11 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-2xl border transition-colors cursor-grab active:cursor-grabbing";
  const buttonStyle = {
    borderColor: isLit ? `${accent}55` : "rgba(255,255,255,0.06)",
    color: isLit ? accent : "#71717a",
    boxShadow: isLit ? `0 0 22px ${accent}22` : "0 8px 24px rgba(0,0,0,0.45)",
  };
  const inner = (
    <>
      {icon}
      <GripVertical className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
      {badge !== undefined && (
        <span
          className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full text-[9px] font-bold text-black"
          style={{ backgroundColor: accent }}
        >
          {badge}
        </span>
      )}
    </>
  );

  return (
    <motion.div
      ref={nodeRef}
      drag
      dragConstraints={fieldRef}
      dragElastic={0.08}
      dragMomentum={false}
      onDragStart={() => {
        draggedRef.current = true;
      }}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileDrag={{ scale: 1.12, cursor: "grabbing" }}
      style={{
        position: "absolute",
        top: home.y,
        left: home.side === "left" ? 12 : undefined,
        right: home.side === "right" ? 12 : undefined,
      }}
      className="pointer-events-auto touch-none"
    >
      <div className="relative">
        {href ? (
          <Link
            href={href}
            onClick={handleClick}
            title={`${label} — drag to move`}
            className={buttonClasses}
            style={buttonStyle}
          >
            {inner}
          </Link>
        ) : (
          <button
            onClick={handleClick}
            title={`${label} — drag to move`}
            className={buttonClasses}
            style={buttonStyle}
          >
            {inner}
          </button>
        )}

        <AnimatePresence>
          {isOpen && children && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94, x: panelSide === "right" ? -8 : 8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ type: "spring", damping: 26, stiffness: 340 }}
              style={{ width: panelWidth }}
              className={`absolute top-0 p-3 rounded-2xl bg-black/85 backdrop-blur-2xl border border-white/[0.06] shadow-[0_16px_48px_rgba(0,0,0,0.6)] ${
                panelSide === "right" ? "left-full ml-2" : "right-full mr-2"
              }`}
            >
              <div
                className="absolute inset-x-3 top-0 h-px"
                style={{ background: `linear-gradient(90deg,transparent,${accent}55,transparent)` }}
              />
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function PanelTitle({ children }: { children: ReactNode }) {
  return (
    <span className="block mb-2.5 text-[9px] uppercase tracking-[0.2em] text-zinc-600 font-semibold font-[family-name:var(--font-quantico)]">
      {children}
    </span>
  );
}

function ToggleSwitch({
  label,
  isOn,
  onToggle,
  color,
}: {
  label: string;
  isOn: boolean;
  onToggle: () => void;
  color: "amber" | "purple";
}) {
  const colors = {
    amber: { bg: "bg-amber-500/20", dot: "bg-amber-400", text: "text-amber-400/80" },
    purple: { bg: "bg-purple-500/20", dot: "bg-purple-400", text: "text-purple-400/80" },
  };
  const c = colors[color];

  return (
    <button onClick={onToggle} className="flex items-center gap-2.5 w-full group">
      <div
        className={`relative w-7 h-4 rounded-full transition-all duration-300 ${
          isOn ? c.bg : "bg-white/[0.04]"
        }`}
      >
        <div
          className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-300 ${
            isOn ? `left-3.5 ${c.dot}` : "left-0.5 bg-zinc-600"
          }`}
        />
      </div>
      <span
        className={`text-[11px] transition-colors ${
          isOn ? c.text : "text-zinc-600 group-hover:text-zinc-400"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
