import { leaderboard } from "../data/mockData";

const medals = ["🥇", "🥈", "🥉"];

export default function LeaderboardCard() {
  return (
    <div className="card bg-base-100 border border-base-300 shadow-none">
      <div className="card-body p-4 gap-3">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-sm font-medium">🏆 Leaderboard minggu ini</h3>
          <button className="btn btn-ghost btn-xs text-primary">Semua</button>
        </div>
        <ul className="flex flex-col gap-1">
          {leaderboard.map((user) => (
            <li
              key={user.rank}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                user.isMe ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-base-200"
              }`}
            >
              <span className="text-base w-5 text-center">
                {user.rank <= 3 ? medals[user.rank - 1] : <span className="text-xs text-base-content/40">{user.rank}</span>}
              </span>
              <div className={`avatar placeholder`}>
                <div className={`${user.color} rounded-full w-7 text-[11px] font-medium`}>
                  <span>{user.initials}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${user.isMe ? "text-primary" : "text-base-content"}`}>
                  {user.name}
                </p>
                <p className="text-[10px] text-base-content/40">🔥 {user.streak} hari streak</p>
              </div>
              <span className={`text-sm font-semibold ${user.isMe ? "text-primary" : "text-base-content"}`}>
                {user.pts.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
        <div className="alert alert-info py-2 text-xs">
          Butuh <strong>340 poin</strong> lagi untuk naik ke peringkat #4
        </div>
      </div>
    </div>
  );
}
