export default function Heatmap({ topics = [] }) {
  const units = [...new Set(topics.map((t) => t.unit || "General"))];

  const levelBadges = {
    High: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    Medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    Low: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  };

  const borderAccents = {
    High: "border-l-rose-500",
    Medium: "border-l-amber-500",
    Low: "border-l-emerald-500",
  };

  return (
    <div className="space-y-6">
      {units.map((unit) => {
        const unitTopics = topics.filter((t) => (t.unit || "General") === unit);
        return (
          <div key={unit} className="space-y-3">
            <div className="flex items-center justify-between border-b border-canvas-border pb-2">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">{unit}</h4>
              <span className="text-[10px] text-ink-muted font-mono">{unitTopics.length} topics</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {unitTopics.map((t) => (
                <div
                  key={t.id}
                  className={`rounded-xl border border-canvas-border bg-canvas-elevated/50 p-4 flex flex-col justify-between gap-3 hover:border-brand-lavender/40 hover:bg-canvas-elevated/80 transition-all border-l-2 ${
                    borderAccents[t.level] || "border-l-brand-royal"
                  }`}
                >
                  <p className="font-semibold text-xs text-white leading-snug line-clamp-2">{t.name}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-canvas-border/50 text-[11px]">
                    <span className="font-mono text-ink-secondary">{t.score}% Priority</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${levelBadges[t.level]}`}>
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
