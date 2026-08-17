// Interactive 3D Globe — the core visual component.
"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import type { Country } from "@/lib/types";

type GlobeComponentType = typeof import("react-globe.gl").default;

const GEOJSON_URL =
  "https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson";

// Untracked landmass keeps the plain dotted look.
const NEUTRAL_DOT = "rgba(255, 255, 255, 0.11)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";

// Lift heights — a clicked country stays raised until another is picked.
const ALTITUDE = {
  untracked: 0.002,
  tracked: 0.008,
  compared: 0.035,
  active: 0.06,
};

const AI_COLORS = {
  dedicated: "#a855f7",
  partial: "#6366f1",
  none: "#3f3f46",
};

export interface GlobeApi {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  flyTo: (latitude: number, longitude: number) => void;
}

interface CyberGlobeProps {
  countries: Country[];
  onCountryClick: (countryId: string) => void;
  compareList: string[];
  isCompareMode: boolean;
  onAddToCompare: (countryId: string) => void;
  showDraftLaws: boolean;
  showAiRegulations: boolean;
  onReady?: (api: GlobeApi) => void;
}

interface GlobePoint {
  lat: number;
  lng: number;
  countryId: string;
  countryName: string;
  flagEmoji: string;
  score: number;
  color: string;
  size: number;
}

interface GlobeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
}

interface GlobePov {
  lat: number;
  lng: number;
  altitude: number;
}

interface GlobeInstance {
  controls: () => { autoRotate: boolean; autoRotateSpeed: number };
  pointOfView: (coords?: Partial<GlobePov>, ms?: number) => GlobePov;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

function isoOf(feature: any): string {
  const properties = feature?.properties ?? {};
  return String(properties.ISO_A2 ?? properties.iso_a2 ?? "").toUpperCase();
}

// Palette colors are tuned for UI panels; on the black globe they read far too hot,
// so every globe layer draws them dimmed.
const GLOBE_DIM = 0.6;

function dim(hex: string, factor = GLOBE_DIM): string {
  const value = hex.replace("#", "");
  if (value.length !== 6) return hex;
  const channels = [0, 2, 4].map((offset) =>
    Math.round(parseInt(value.substring(offset, offset + 2), 16) * factor)
  );
  return `#${channels.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

// Strictness color by default; AI-regulation palette when that layer is on.
function colorFor(country: Country, showAiRegulations: boolean): string {
  if (!showAiRegulations) return dim(country.colorCode);
  const ai = country.aiCyberCrimes;
  if (!ai) return dim(AI_COLORS.none);
  return dim(ai.hasDedicatedAiAct ? AI_COLORS.dedicated : AI_COLORS.partial);
}

function tooltipHtml(country: Country, color: string, isCompareMode: boolean): string {
  return `<div style="background:rgba(0,0,0,0.85);backdrop-filter:blur(12px);border:1px solid ${color}33;padding:8px 12px;border-radius:12px;font-family:var(--font-space),system-ui,sans-serif;min-width:150px;">
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
      <span style="font-size:16px;">${country.flagEmoji}</span>
      <span style="color:#e4e4e7;font-size:12px;font-weight:600;">${country.countryName}</span>
    </div>
    <div style="display:flex;align-items:center;gap:6px;">
      <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block;box-shadow:0 0 6px ${color}"></span>
      <span style="color:${color};font-size:13px;font-weight:700;font-family:monospace;">${country.overallStrictnessScore.toFixed(1)}/10</span>
      <span style="color:#52525b;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;">${country.lawStatus}</span>
    </div>
    <div style="color:#52525b;font-size:10px;margin-top:5px;">${isCompareMode ? "tap to add to compare" : "tap for full profile"}</div>
  </div>`;
}

export function CyberGlobe({
  countries,
  onCountryClick,
  compareList,
  isCompareMode,
  onAddToCompare,
  showDraftLaws,
  showAiRegulations,
  onReady,
}: CyberGlobeProps) {
  const globeRef = useRef<unknown>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [GlobeComponent, setGlobeComponent] = useState<GlobeComponentType | null>(null);
  const [countriesGeoJSON, setCountriesGeoJSON] = useState<any>(null);
  const [hoveredIso, setHoveredIso] = useState<string | null>(null);
  const [activeIso, setActiveIso] = useState<string | null>(null);

  // Load globe library and world borders once — neither depends on country data.
  // The library is client-only, so this doubles as the SSR guard.
  useEffect(() => {
    import("react-globe.gl").then((mod) => setGlobeComponent(() => mod.default));
    fetch(GEOJSON_URL)
      .then((res) => res.json())
      .then(setCountriesGeoJSON)
      .catch(() => setCountriesGeoJSON({ features: [] }));
  }, []);

  // Responsive dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    function updateDimensions() {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    }

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-rotate + expose camera controls to the parent
  useEffect(() => {
    if (!globeRef.current || readyRef.current) return;
    const globe = globeRef.current as GlobeInstance;
    try {
      const controls = globe.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
    } catch {
      return;
    }
    readyRef.current = true;
    onReady?.({
      zoomIn: () =>
        globe.pointOfView({ altitude: Math.max(0.35, globe.pointOfView().altitude * 0.7) }, 400),
      zoomOut: () =>
        globe.pointOfView({ altitude: Math.min(6, globe.pointOfView().altitude * 1.4) }, 400),
      reset: () => globe.pointOfView({ lat: 15, lng: 20, altitude: 2.5 }, 900),
      flyTo: (lat, lng) => globe.pointOfView({ lat, lng, altitude: 1.8 }, 1000),
    });
  }, [GlobeComponent, dimensions, onReady]);

  // "Draft Laws" off hides countries whose primary law is not yet enacted.
  const visibleCountries = useMemo(
    () => countries.filter((c) => showDraftLaws || c.lawStatus === "enacted"),
    [countries, showDraftLaws]
  );

  const countryByIso = useMemo(() => {
    const map = new Map<string, Country>();
    visibleCountries.forEach((c) => map.set(c.isoCode.toUpperCase(), c));
    return map;
  }, [visibleCountries]);

  const polygons: any[] = useMemo(
    () => countriesGeoJSON?.features ?? [],
    [countriesGeoJSON]
  );

  // Countries we hold data for are drawn as a clean outlined plate; the rest of the
  // world stays as plain dots, so tracked countries read as cut-outs on the globe.
  const trackedPolygons: any[] = useMemo(
    () => polygons.filter((feature) => countryByIso.has(isoOf(feature))),
    [polygons, countryByIso]
  );

  const untrackedPolygons: any[] = useMemo(
    () => polygons.filter((feature) => !countryByIso.has(isoOf(feature))),
    [polygons, countryByIso]
  );

  const altitudeFor = useCallback(
    (feature: any): number => {
      const iso = isoOf(feature);
      const country = countryByIso.get(iso);
      if (!country) return ALTITUDE.untracked;
      if (iso === activeIso || iso === hoveredIso) return ALTITUDE.active;
      if (compareList.includes(country.countryId)) return ALTITUDE.compared;
      return ALTITUDE.tracked;
    },
    [countryByIso, activeIso, hoveredIso, compareList]
  );

  const points: GlobePoint[] = useMemo(
    () =>
      visibleCountries.map((c) => ({
        lat: c.geo.latitude,
        lng: c.geo.longitude,
        countryId: c.countryId,
        countryName: c.countryName,
        flagEmoji: c.flagEmoji,
        score: c.overallStrictnessScore,
        color: colorFor(c, showAiRegulations),
        size: compareList.includes(c.countryId) ? 1.2 : 0.6,
      })),
    [visibleCountries, showAiRegulations, compareList]
  );

  const arcs: GlobeArc[] = useMemo(() => {
    const result: GlobeArc[] = [];
    for (let i = 0; i < compareList.length; i++) {
      for (let j = i + 1; j < compareList.length; j++) {
        const a = countries.find((c) => c.countryId === compareList[i]);
        const b = countries.find((c) => c.countryId === compareList[j]);
        if (a && b) {
          result.push({
            startLat: a.geo.latitude,
            startLng: a.geo.longitude,
            endLat: b.geo.latitude,
            endLng: b.geo.longitude,
            color: "#06b6d4",
          });
        }
      }
    }
    return result;
  }, [compareList, countries]);

  const selectCountry = useCallback(
    (country: Country) => {
      setActiveIso(country.isoCode.toUpperCase());
      if (isCompareMode) {
        onAddToCompare(country.countryId);
      } else {
        onCountryClick(country.countryId);
      }
      const globe = globeRef.current as GlobeInstance | null;
      globe?.pointOfView(
        { lat: country.geo.latitude, lng: country.geo.longitude, altitude: 1.8 },
        1000
      );
    },
    [isCompareMode, onAddToCompare, onCountryClick]
  );

  if (!GlobeComponent) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 border-2 border-zinc-800 border-t-cyan-500/50 rounded-full animate-spin" />
          <span className="text-xs text-zinc-600 font-mono">Loading Globe...</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <GlobeComponent
        ref={globeRef as React.RefObject<never>}
        width={dimensions.width || undefined}
        height={dimensions.height || undefined}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=" // Solid black 1x1 pixel
        showAtmosphere={true}
        atmosphereColor="#0b4a5c"
        atmosphereAltitude={0.16}

        // Dotted Earth — only the countries we have no data for.
        hexPolygonsData={untrackedPolygons}
        hexPolygonResolution={3}
        hexPolygonMargin={0.5}
        hexPolygonUseDots={true}
        hexPolygonAltitude={ALTITUDE.untracked}
        hexPolygonColor={() => NEUTRAL_DOT}

        // Tracked countries — colored outline, near-empty interior, lifts on hover
        // and stays lifted after a click.
        polygonsData={trackedPolygons}
        polygonAltitude={altitudeFor}
        polygonCapColor={(polygon: any) => {
          const country = countryByIso.get(isoOf(polygon));
          if (!country) return TRANSPARENT;
          const color = colorFor(country, showAiRegulations);
          const iso = isoOf(polygon);
          if (iso === hoveredIso || iso === activeIso) return `${color}26`;
          return compareList.includes(country.countryId) ? `${color}1a` : `${color}0d`;
        }}
        polygonSideColor={(polygon: any) => {
          const country = countryByIso.get(isoOf(polygon));
          return country ? `${colorFor(country, showAiRegulations)}44` : TRANSPARENT;
        }}
        polygonStrokeColor={(polygon: any) => {
          const country = countryByIso.get(isoOf(polygon));
          return country ? colorFor(country, showAiRegulations) : TRANSPARENT;
        }}
        polygonLabel={(polygon: any) => {
          const country = countryByIso.get(isoOf(polygon));
          if (!country) return "";
          return tooltipHtml(country, colorFor(country, showAiRegulations), isCompareMode);
        }}
        polygonsTransitionDuration={320}
        onPolygonHover={(polygon: any) => {
          const iso = polygon ? isoOf(polygon) : null;
          setHoveredIso(iso && countryByIso.has(iso) ? iso : null);
        }}
        onPolygonClick={(polygon: any) => {
          const country = countryByIso.get(isoOf(polygon));
          if (country) selectCountry(country);
        }}

        // Animated Radar Ripples
        ringsData={points}
        ringLat="lat"
        ringLng="lng"
        ringColor={(d: any) => (t: number) => {
          const hex = d.color.replace("#", "");
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          return `rgba(${r}, ${g}, ${b}, ${1 - Math.sqrt(t)})`;
        }}
        ringMaxRadius={(d: any) => 3 + (d.score / 10) * 4}
        ringPropagationSpeed={1.5}
        ringRepeatPeriod={800}

        // 3D Glowing Hex Pillars
        hexBinPointsData={points}
        hexBinPointLat="lat"
        hexBinPointLng="lng"
        hexBinPointWeight="score"
        hexBinResolution={3}
        hexMargin={0.4}
        hexAltitude={(d: any) => 0.01 + (d.sumWeight / 10) * 0.15}
        hexTopColor={(d: any) => d.points[0].color}
        hexSideColor={(d: any) => d.points[0].color + "99"}
        hexLabel={(d: any) => {
          const point = d.points[0] as GlobePoint;
          const country = countries.find((c) => c.countryId === point.countryId);
          return country ? tooltipHtml(country, point.color, isCompareMode) : "";
        }}
        onHexClick={(d: any) => {
          const point = d.points[0] as GlobePoint;
          const country = countries.find((c) => c.countryId === point.countryId);
          if (country) selectCountry(country);
        }}
        arcsData={arcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor={() => "rgba(6, 182, 212, 0.5)"}
        arcDashLength={0.5}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcStroke={0.5}
      />
    </div>
  );
}
