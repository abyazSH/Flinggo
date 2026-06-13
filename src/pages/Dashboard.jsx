import StatsRow from "../components/StatsRow";
import DailyChallenge from "../components/DailyChallenge";
import WeeklyChart from "../components/WeeklyChart";
import LanguageProgress from "../components/LanguageProgress";
import ActivityLog from "../components/ActivityLog";
import LeaderboardCard from "../components/LeaderboardCard";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Greeting */}
      <div>
        <h1 className="text-lg font-semibold">Selamat datang kembali 👋</h1>
        <p className="text-sm text-base-content/50 mt-0.5">
          Minggu ini kamu sudah belajar selama 3 jam 20 menit. Pertahankan!
        </p>
      </div>

      {/* Streak banner */}
      <div className="alert bg-primary/10 border-primary/20 py-3">
        <span className="text-2xl">🔥</span>
        <div>
          <p className="text-sm font-semibold text-primary">Streak 5 hari aktif!</p>
          <p className="text-xs text-primary/70">Belajar sekali lagi besok untuk mempertahankan streak kamu.</p>
        </div>
        <button className="btn btn-primary btn-sm ml-auto">Mulai belajar</button>
      </div>

      {/* Stats */}
      <StatsRow />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <DailyChallenge />
          <WeeklyChart />
        </div>
        <div className="flex flex-col gap-4">
          <LanguageProgress />
          <ActivityLog />
        </div>
      </div>

      {/* Leaderboard full width */}
      <LeaderboardCard />
    </div>
  );
}
