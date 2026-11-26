export default function Heatmap({ topics = [] }) {
  const units = [...new Set(topics.map((t) => t.unit || "General"))];

  const levelBadges = {
    High: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    Low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
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
          <div key={unit} className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <h4 className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">{unit}</h4>
              <span className="text-[10px] text-slate-500 font-mono">{unitTopics.length} topics</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {unitTopics.map((t) => (
                <div
                  key={t.id}
                  className={`rounded-md border border-slate-800 bg-slate-900/90 p-3 flex flex-col justify-between gap-2.5 transition hover:border-slate-700 border-l-2 ${
                    borderAccents[t.level] || "border-l-slate-600"
                  }`}
                >
                  <p className="font-medium text-xs text-slate-200 leading-snug line-clamp-2">{t.name}</p>
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[11px]">
                    <span className="font-mono text-slate-400 font-medium">{t.score}% Priority</span>
                    <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border ${levelBadges[t.level]}`}>
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
