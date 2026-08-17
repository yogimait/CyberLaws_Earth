// Interactive 3D Globe — the core visual component.
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { Country } from "@/lib/types";

// Dynamic import check for SSR
let Globe: typeof import("react-globe.gl").default | null = null;

interface CyberGlobeProps {
  countries: Country[];
  onCountryClick: (countryId: string) => void;
  compareList: string[];
  isCompareMode: boolean;
  onAddToCompare: (countryId: string) => void;
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

export function CyberGlobe({
  countries,
  onCountryClick,
  compareList,
  isCompareMode,
  onAddToCompare,
}: CyberGlobeProps) {
  const globeRef = useRef<unknown>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [GlobeComponent, setGlobeComponent] = useState<typeof Globe>(null);
  const [countriesGeoJSON, setCountriesGeoJSON] = useState<any>(null);
  const [countryBorders, setCountryBorders] = useState<any[]>([]);

  // Load globe only on client
  useEffect(() => {
    setIsClient(true);
    import("react-globe.gl").then((mod) => {
      setGlobeComponent(() => mod.default);
    });

    // Fetch GeoJSON for dotted hex polygon earth
    fetch("https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson")
      .then((res) => res.json())
      .then((data) => {
        setCountriesGeoJSON(data);
        
        // Extract borders for tracked countries to render as dotted lines
        const borders: any[] = [];
        data.features.forEach((feature: any) => {
          const countryCode = feature.properties?.ISO_A2;
          const country = countries.find((c) => c.countryId === countryCode);
          if (country && feature.geometry && feature.geometry.coordinates) {
            const extractPaths = (coords: any[]) => {
               if (coords.length > 0 && Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
                  borders.push({
                     points: coords.map((c: any) => ({ lat: c[1], lng: c[0] })),
                     color: country.colorCode
                  });
               } else if (Array.isArray(coords)) {
                  coords.forEach(extractPaths);
               }
            };
            extractPaths(feature.geometry.coordinates);
          }
        });
        setCountryBorders(borders);
      });
  }, [countries]);

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

  // Auto-rotate
  useEffect(() => {
    if (!globeRef.current) return;
    const globe = globeRef.current as { controls: () => { autoRotate: boolean; autoRotateSpeed: number } };
    try {
      const controls = globe.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
    } catch {
      // Controls not ready yet
    }
  }, [GlobeComponent, dimensions]);

  // Transform country data to globe points
  const points: GlobePoint[] = countries.map((c) => ({
    lat: c.geo.latitude,
    lng: c.geo.longitude,
    countryId: c.countryId,
    countryName: c.countryName,
    flagEmoji: c.flagEmoji,
    score: c.overallStrictnessScore,
    color: c.colorCode,
    size: compareList.includes(c.countryId) ? 1.2 : 0.6,
  }));

  // Generate arcs between compared countries
  const arcs: GlobeArc[] = [];
  if (compareList.length >= 2) {
    for (let i = 0; i < compareList.length; i++) {
      for (let j = i + 1; j < compareList.length; j++) {
        const a = countries.find((c) => c.countryId === compareList[i]);
        const b = countries.find((c) => c.countryId === compareList[j]);
        if (a && b) {
          arcs.push({
            startLat: a.geo.latitude,
            startLng: a.geo.longitude,
            endLat: b.geo.latitude,
            endLng: b.geo.longitude,
            color: "#06b6d4",
          });
        }
      }
    }
  }

  const handlePointClick = useCallback(
    (point: object) => {
      const p = point as GlobePoint;
      if (isCompareMode) {
        onAddToCompare(p.countryId);
      } else {
        onCountryClick(p.countryId);
      }

      // Fly to the country
      if (globeRef.current) {
        const globe = globeRef.current as {
          pointOfView: (coords: { lat: number; lng: number; altitude: number }, ms: number) => void;
        };
        globe.pointOfView({ lat: p.lat, lng: p.lng, altitude: 1.8 }, 1000);
      }
    },
    [isCompareMode, onAddToCompare, onCountryClick]
  );

  if (!isClient || !GlobeComponent) {
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
        atmosphereColor="#111111"
        atmosphereAltitude={0.15}
        
        // Dotted Earth Look
        hexPolygonsData={countriesGeoJSON?.features || []}
        hexPolygonResolution={3}
        hexPolygonMargin={0.5}
        hexPolygonColor={() => "rgba(255, 255, 255, 0.15)"}
        onPolygonClick={(polygon: any) => {
          const countryCode = polygon.properties?.ISO_A2;
          if (!countryCode) return;
          const c = points.find((p) => p.countryId === countryCode);
          if (c) handlePointClick(c);
        }}

        // Animated Radar Ripples
        ringsData={points}
        ringLat="lat"
        ringLng="lng"
        ringColor={(d: any) => (t: number) => {
          const hex = d.color.replace('#', '');
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
        hexSideColor={(d: any) => d.points[0].color + '99'}
        hexLabel={(d: any) => {
          const point = d.points[0] as GlobePoint;
          return `<div style="background:rgba(0,0,0,0.85);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.1);padding:8px 12px;border-radius:12px;font-family:Inter,system-ui,sans-serif;min-width:140px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <span style="font-size:16px;">${point.flagEmoji}</span>
              <span style="color:#e4e4e7;font-size:12px;font-weight:600;">${point.countryName}</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="width:8px;height:8px;border-radius:50%;background:${point.color};display:inline-block;box-shadow:0 0 6px ${point.color}"></span>
              <span style="color:${point.color};font-size:13px;font-weight:700;font-family:monospace;">${point.score.toFixed(1)}/10</span>
            </div>
          </div>`;
        }}
        onHexClick={(d: any) => handlePointClick(d.points[0])}
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
