type ScoreBarProps = {
  label: string;
  value: number;
  tone?: "mint" | "signal" | "steel";
};

export function ScoreBar({ label, value, tone = "mint" }: ScoreBarProps) {
  const color =
    tone === "signal" ? "bg-signal" : tone === "steel" ? "bg-steel" : "bg-mint";

  return (
    <div className="rounded border border-ink/10 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-sm font-semibold text-ink">{value}</p>
      </div>
      <div className="mt-3 h-2 rounded bg-ink/10">
        <div className={`h-2 rounded ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

