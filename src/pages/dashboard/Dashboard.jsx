import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useGame } from "../../contexts/GameContext";
import LevelProgress from "../../components/LevelProgress";
import { getQuizAttempts } from "../../services/supabaseService";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const { xp, level, streak } = useGame();
  const navigate = useNavigate();
  const [recentActivity, setRecentActivity] = useState([]);
  const [totalGames, setTotalGames] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    refreshProfile();
    getQuizAttempts(user.id, null, 200)
      .then((atts) => {
        setTotalGames(atts.length);
        setRecentActivity(atts.slice(0, 5));
        setError(null);
      })
      .catch((err) => {
        console.error("[Dashboard] Failed to load quiz attempts:", err);
        setError("Could not load activity data. Please run the Supabase schema SQL and check RLS policies.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  const displayName = profile?.display_name || profile?.username || "Learner";

  const quickPlayItems = [
    { path: "/chat", icon: "💬", label: "Translation Chat", color: "from-primary/10 to-primary/5" },
    { path: "/quiz", icon: "🃏", label: "Vocabulary Quiz", color: "from-success/10 to-success/5" },
    { path: "/sentence", icon: "✍️", label: "Sentence Builder", color: "from-info/10 to-info/5" },
    { path: "/challenge", icon: "📅", label: "Daily Challenge", color: "from-warning/10 to-warning/5" },
  ];

  return (
    <div className="flex flex-col gap-5 p-6 max-w-4xl">
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold">Welcome back, {displayName} 👋</h1>
        <p className="text-sm text-base-content/50 mt-1">Keep up the great work on your language learning journey!</p>
      </motion.div>

      <motion.div {...fadeInUp} transition={{ delay: 0.1, duration: 0.4 }} className="card bg-gradient-to-r from-base-100 to-base-200 border border-base-300 shadow-sm">
        <div className="card-body p-5">
          <LevelProgress xp={xp} level={level} />
        </div>
      </motion.div>

      <motion.div
        {...fadeInUp}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="alert bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 py-4"
      >
        <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-3xl">🔥</motion.span>
        <div>
          <p className="text-sm font-bold text-primary">{streak} day streak!</p>
          <p className="text-xs text-primary/70">Complete a challenge today to keep it going.</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-primary btn-sm ml-auto shadow-lg shadow-primary/25" onClick={() => navigate("/challenge")}>
          Start
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: "⭐", label: "Total XP", value: xp.toLocaleString(), delay: 0.2 },
          { icon: "📊", label: "Level", value: level, delay: 0.25 },
          { icon: "🔥", label: "Streak", value: `${streak} days`, delay: 0.3 },
          { icon: "🎮", label: "Games", value: totalGames, delay: 0.35 },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay, duration: 0.3 }}
          >
            <motion.div whileHover={{ y: -4, boxShadow: "0 8px 25px -5px rgba(0,0,0,0.1)" }} className="stat bg-base-100 border border-base-300 rounded-2xl p-4 transition-shadow">
              <div className="stat-figure text-2xl">{stat.icon}</div>
              <div className="stat-title text-[10px] text-base-content/50 uppercase tracking-wide">{stat.label}</div>
              <div className="stat-value text-xl font-bold mt-1">{stat.value}</div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <motion.div {...fadeInUp} transition={{ delay: 0.4, duration: 0.4 }}>
        <h3 className="text-sm font-semibold mb-3">Quick Play</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickPlayItems.map((item, i) => (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 + i * 0.05 }}
              whileHover={{ y: -6, boxShadow: "0 12px 30px -10px rgba(0,0,0,0.15)" }}
              whileTap={{ scale: 0.97 }}
              className={`card bg-gradient-to-br ${item.color} border border-base-300 cursor-pointer`}
              onClick={() => navigate(item.path)}
            >
              <div className="card-body items-center text-center p-5 gap-2">
                <motion.span className="text-4xl" whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}>{item.icon}</motion.span>
                <p className="text-xs font-semibold mt-1">{item.label}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div {...fadeInUp} transition={{ delay: 0.6, duration: 0.4 }} className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-5 gap-3">
          <h3 className="card-title text-sm font-semibold">⚡ Recent Activity</h3>
          {error && <div className="alert alert-error py-2 text-xs"><span>{error}</span></div>}
          {loading ? (
            <div className="flex justify-center py-6"><span className="loading loading-spinner loading-md text-primary" /></div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl block mb-2">🎯</span>
              <p className="text-sm text-base-content/50">No activity yet. Start a quiz or chat to see your history!</p>
            </div>
          ) : (
            <ul className="divide-y divide-base-200">
              {recentActivity.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.65 + i * 0.05 }}
                  className="flex items-center gap-3 py-3"
                >
                  <motion.div whileHover={{ scale: 1.1 }} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${item.is_correct ? "bg-success/10" : "bg-error/10"}`}>
                    {item.quiz_type === "vocabulary" ? "🃏" : item.quiz_type === "sentence" ? "✍️" : "📅"}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{item.quiz_type} quiz</p>
                    <p className="text-xs text-base-content/50">{item.is_correct ? "✅ Correct" : "❌ Incorrect"} — +{item.xp_earned} XP</p>
                  </div>
                  <span className="text-xs text-base-content/40">{new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
}
