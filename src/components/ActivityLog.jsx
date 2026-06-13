import { activityLog } from "../data/mockData";

export default function ActivityLog() {
  return (
    <div className="card bg-base-100 border border-base-300 shadow-none">
      <div className="card-body p-4 gap-3">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-sm font-medium">⚡ Aktivitas terbaru</h3>
          <button className="btn btn-ghost btn-xs text-primary">Lihat semua</button>
        </div>
        <ul className="divide-y divide-base-200">
          {activityLog.map((item, i) => (
            <li key={i} className="flex items-center gap-3 py-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-base-content truncate">{item.label}</p>
                <p className="text-xs text-base-content/50">{item.sub}</p>
              </div>
              <span className="text-xs text-base-content/40 flex-shrink-0">{item.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
