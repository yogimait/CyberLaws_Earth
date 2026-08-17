// Strictness score visual gauge (1-10 scale with gradient).
"use client";

interface StrictnessMeterProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 8.0) return "#ef4444";
  if (score >= 5.0) return "#f59e0b";
  return "#22c55e";
}

function getScoreLabel(score: number): string {
  if (score >= 8.0) return "Strict";
  if (score >= 5.0) return "Moderate";
  return "Relaxed";
}

export function StrictnessMeter({ score, size = "md", showLabel = true }: StrictnessMeterProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const percentage = (score / 10) * 100;

  const heights: Record<string, string> = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  const textSizes: Record<string, string> = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className={`flex items-center justify-between mb-1.5 ${textSizes[size]}`}>
          <span className="text-zinc-400 font-medium">{label}</span>
          <span className="font-mono font-bold" style={{ color }}>
            {score.toFixed(1)}/10
          </span>
        </div>
      )}
      <div className={`w-full bg-zinc-800/60 rounded-full ${heights[size]} overflow-hidden`}>
        <div
          className={`${heights[size]} rounded-full transition-all duration-700 ease-out`}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}
