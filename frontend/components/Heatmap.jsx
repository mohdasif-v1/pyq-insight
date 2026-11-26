const COLORS = {
  High: "bg-red-500 text-white",
  Medium: "bg-amber-300 text-gray-900",
  Low: "bg-emerald-200 text-gray-900",
};

// topics: [{ id, name, unit, score, level }]
export default function Heatmap({ topics }) {
  const units = [...new Set(topics.map((t) => t.unit))];
  return (
    <div className="space-y-4">
      {units.map((unit) => (
        <section key={unit}>
          <h3 className="mb-2 font-semibold">{unit}</h3>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {topics.filter((t) => t.unit === unit).map((t) => (
              <div key={t.id} className={`rounded p-3 text-sm ${COLORS[t.level]}`}>
                <p className="font-medium">{t.name}</p>
                <p>{t.score}% priority</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
