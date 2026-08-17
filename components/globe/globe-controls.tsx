// Floating globe controls — zoom, tilt, reset.
"use client";

import { Plus, Minus, RotateCcw } from "lucide-react";

interface GlobeControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function GlobeControls({ onZoomIn, onZoomOut, onReset }: GlobeControlsProps) {
  return (
    <div className="absolute bottom-20 right-3 flex flex-col gap-1 z-20 lg:bottom-6 lg:right-6">
      <button
        onClick={onZoomIn}
        className="w-9 h-9 flex items-center justify-center bg-black/60 backdrop-blur-md border border-zinc-800/60 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all"
        title="Zoom In"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        onClick={onZoomOut}
        className="w-9 h-9 flex items-center justify-center bg-black/60 backdrop-blur-md border border-zinc-800/60 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all"
        title="Zoom Out"
      >
        <Minus className="w-4 h-4" />
      </button>
      <button
        onClick={onReset}
        className="w-9 h-9 flex items-center justify-center bg-black/60 backdrop-blur-md border border-zinc-800/60 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all"
        title="Reset View"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
}
