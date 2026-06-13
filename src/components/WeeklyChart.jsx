import { weeklyActivity } from "../data/mockData";

const max = Math.max(...weeklyActivity.map((d) => d.val));

export default function WeeklyChart() {
  return (
    <div className="card bg-base-100 border border-base-300 shadow-none">
      <div className="card-body p-4 gap-3">
        <h3 className="card-title text-sm font-medium">📈 Aktivitas 7 hari</h3>
        <div className="flex items-end gap-1.5 h-16">
          {weeklyActivity.map((d, i) => {
            const isToday = i === weeklyActivity.length - 1;
            const heightPct = Math.round((d.val / max) * 100);
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    isToday ? "bg-primary" : "bg-primary/25"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[10px] text-base-content/40">{d.day}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-base-content/50">
          Total sesi minggu ini: <span className="text-base-content font-medium">7 sesi</span>
        </p>
      </div>
    </div>
  );
}
