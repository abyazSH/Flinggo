import { statsData } from "../data/mockData";

export default function StatsRow() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statsData.map((s) => (
        <div key={s.label} className="stat bg-base-200 rounded-xl p-4">
          <div className="stat-figure text-2xl">{s.icon}</div>
          <div className="stat-title text-xs text-base-content/50">{s.label}</div>
          <div className="stat-value text-xl font-semibold text-base-content">{s.value}</div>
          <div className="stat-desc text-xs text-success">{s.delta}</div>
        </div>
      ))}
    </div>
  );
}
