"use client";

export function ScoreBadge({
  name,
  score,
  highlight,
  right,
}: {
  name: string;
  score: number;
  highlight?: boolean;
  right?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${right ? "flex-row-reverse" : ""}`}>
      <div
        className={`px-2 py-0.5 rounded font-bold text-sm transition-colors ${
          highlight ? "bg-primary text-primary-foreground" : "bg-secondary"
        }`}
      >
        {name}
        {highlight ? " (you)" : ""}
      </div>
      <div className="text-lg tabular-nums">{score}</div>
    </div>
  );
}
