export default function Heatmap({ topics = [] }) {
  const units = [...new Set(topics.map((t) => t.unit || "General"))];

  const levelStyles = {
    High: "bg-status-error/15 border-status-error/30 text-status-error",
    Medium: "bg-status-warning/15 border-status-warning/30 text-status-warning",
    Low: "bg-status-success/15 border-status-success/30 text-status-success",
  };

  const badgeStyles = {
    High: "bg-status-error/25 text-status-error",
    Medium: "bg-status-warning/25 text-status-warning",
    Low: "bg-status-success/25 text-status-success",
  };

  return (
    <div className="space-y-6">
      {units.map((unit) => {
        const unitTopics = topics.filter((t) => (t.unit || "General") === unit);
        return (
          <div key={unit} className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-dark-border/60 pb-1.5">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{unit}</h4>
              <span className="text-[11px] text-slate-500 font-mono">{unitTopics.length} topics</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {unitTopics.map((t) => (
                <div
                  key={t.id}
                  className={`rounded-lg border p-3 flex flex-col justify-between gap-2 transition hover:border-slate-500/50 ${
                    levelStyles[t.level] || "bg-dark-surface border-dark-border text-slate-300"
                  }`}
                >
                  <p className="font-medium text-xs text-slate-200 leading-snug line-clamp-2">{t.name}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-dark-border/40 text-[11px]">
                    <span className="font-mono font-medium">{t.score}% Priority</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${badgeStyles[t.level]}`}>
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
