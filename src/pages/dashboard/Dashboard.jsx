import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useGame } from "../../contexts/GameContext";
import LevelProgress from "../../components/LevelProgress";
import { getQuizAttempts } from "../../services/supabaseService";

export default function Dashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const { xp, level, streak } = useGame();
  const navigate = useNavigate();
  const [recentActivity, setRecentActivity] = useState([]);
  const [totalGames, setTotalGames] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Refresh profile from DB so XP/level/streak reflect latest game activity
    refreshProfile();

    // Fetch all quiz attempts to count total games and show recent
    getQuizAttempts(user.id, null, 200)
      .then((atts) => {
        setTotalGames(atts.length);
        setRecentActivity(atts.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const displayName = profile?.display_name || profile?.username || "Learner";

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Greeting */}
      <div>
        <h1 className="text-lg font-semibold">Welcome back, {displayName} 👋</h1>
        <p className="text-sm text-base-content/50 mt-0.5">
          Keep up the great work on your language learning journey!
        </p>
      </div>

      {/* Level Progress — reads live xp/level from GameContext (loaded from profiles table) */}
      <div className="card bg-base-100 border border-base-300 shadow-none">
        <div className="card-body p-4">
          <LevelProgress xp={xp} level={level} />
        </div>
      </div>

      {/* Streak banner */}
      <div className="alert bg-primary/10 border-primary/20 py-3">
        <span className="text-2xl">🔥</span>
        <div>
          <p className="text-sm font-semibold text-primary">{streak} day streak!</p>
          <p className="text-xs text-primary/70">Complete a challenge today to keep it going.</p>
        </div>
        <button className="btn btn-primary btn-sm ml-auto" onClick={() => navigate("/challenge")}>
          Start
        </button>
      </div>

      {/* Quick stats — all read from live GameContext state backed by profiles table */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat bg-base-200 rounded-xl p-4">
          <div className="stat-figure text-2xl">⭐</div>
          <div className="stat-title text-xs text-base-content/50">Total XP</div>
          <div className="stat-value text-xl font-semibold">{xp.toLocaleString()}</div>
        </div>
        <div className="stat bg-base-200 rounded-xl p-4">
          <div className="stat-figure text-2xl">📊</div>
          <div className="stat-title text-xs text-base-content/50">Level</div>
          <div className="stat-value text-xl font-semibold">{level}</div>
        </div>
        <div className="stat bg-base-200 rounded-xl p-4">
          <div className="stat-figure text-2xl">🔥</div>
          <div className="stat-title text-xs text-base-content/50">Streak</div>
          <div className="stat-value text-xl font-semibold">{streak} days</div>
        </div>
        <div className="stat bg-base-200 rounded-xl p-4">
          <div className="stat-figure text-2xl">🎮</div>
          <div className="stat-title text-xs text-base-content/50">Games Played</div>
          <div className="stat-value text-xl font-semibold">{totalGames}</div>
        </div>
      </div>

      {/* Quick play buttons */}
      <div>
        <h3 className="text-sm font-medium mb-2">Quick Play</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="card bg-base-100 border border-base-300 hover:border-primary transition-colors cursor-pointer" onClick={() => navigate("/chat")}>
            <div className="card-body items-center text-center p-4 gap-2">
              <span className="text-3xl">💬</span>
              <p className="text-xs font-medium">Translation Chat</p>
            </div>
          </button>
          <button className="card bg-base-100 border border-base-300 hover:border-primary transition-colors cursor-pointer" onClick={() => navigate("/quiz")}>
            <div className="card-body items-center text-center p-4 gap-2">
              <span className="text-3xl">🃏</span>
              <p className="text-xs font-medium">Vocabulary Quiz</p>
            </div>
          </button>
          <button className="card bg-base-100 border border-base-300 hover:border-primary transition-colors cursor-pointer" onClick={() => navigate("/sentence")}>
            <div className="card-body items-center text-center p-4 gap-2">
              <span className="text-3xl">✍️</span>
              <p className="text-xs font-medium">Sentence Builder</p>
            </div>
          </button>
          <button className="card bg-base-100 border border-base-300 hover:border-primary transition-colors cursor-pointer" onClick={() => navigate("/challenge")}>
            <div className="card-body items-center text-center p-4 gap-2">
              <span className="text-3xl">📅</span>
              <p className="text-xs font-medium">Daily Challenge</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent activity — pulls real data from quiz_attempts table */}
      <div className="card bg-base-100 border border-base-300 shadow-none">
        <div className="card-body p-4 gap-3">
          <h3 className="card-title text-sm font-medium">⚡ Recent Activity</h3>
          {loading ? (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner loading-sm" />
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="text-xs text-base-content/50 text-center py-4">
              No activity yet. Start a quiz or chat to see your history!
            </p>
          ) : (
            <ul className="divide-y divide-base-200">
              {recentActivity.map((item, i) => (
                <li key={i} className="flex items-center gap-3 py-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${item.is_correct ? "bg-success/10" : "bg-error/10"}`}>
                    {item.quiz_type === "vocabulary" ? "🃏" : item.quiz_type === "sentence" ? "✍️" : "📅"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-base-content truncate capitalize">
                      {item.quiz_type} quiz
                    </p>
                    <p className="text-xs text-base-content/50">
                      {item.is_correct ? "Correct" : "Incorrect"} — +{item.xp_earned} XP
                    </p>
                  </div>
                  <span className="text-xs text-base-content/40 flex-shrink-0">
                    {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
