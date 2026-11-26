export default function Heatmap({ topics = [] }) {
  const units = [...new Set(topics.map((t) => t.unit || "General"))];

  const levelBadges = {
    High: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    Medium: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    Low: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  };

  const levelPill = {
    High: "text-rose-400 font-semibold",
    Medium: "text-amber-400 font-semibold",
    Low: "text-emerald-400 font-semibold",
  };

  return (
    <div className="space-y-6">
      {units.map((unit) => {
        const unitTopics = topics.filter((t) => (t.unit || "General") === unit);
        return (
          <div key={unit} className="space-y-2">
            <div className="flex items-center justify-between border-b border-app-border pb-1.5">
              <h4 className="text-xs font-mono font-medium text-text-primary uppercase tracking-wider">{unit}</h4>
              <span className="text-[10px] text-text-muted font-mono">{unitTopics.length} topics</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {unitTopics.map((t) => (
                <div
                  key={t.id}
                  className="rounded border border-app-border bg-app-elevated/40 p-3 flex flex-col justify-between gap-2 hover:bg-app-elevated/80 transition"
                >
                  <p className="font-medium text-xs text-text-primary leading-snug line-clamp-2">{t.name}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-app-border/60 text-[11px]">
                    <span className="font-mono text-text-secondary">{t.score}% Weight</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${levelBadges[t.level]}`}>
                      {t.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
