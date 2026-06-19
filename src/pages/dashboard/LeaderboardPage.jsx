import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { getLeaderboard } from "../../services/supabaseService";

const medals = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const { user, refreshProfile } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Refresh current user's profile first so their XP is up to date in the ranking
    refreshProfile();
    getLeaderboard(20)
      .then(setLeaders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-4 p-6 max-w-2xl mx-auto">
      <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-lg font-semibold">🏆 Leaderboard</motion.h1>

      {loading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-md" />
        </div>
      ) : leaders.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="card bg-base-100 border border-base-300">
          <div className="card-body items-center text-center py-16">
            <span className="text-5xl">🏆</span>
            <p className="text-base font-medium mt-2">No rankings yet</p>
            <p className="text-sm text-base-content/50">Be the first to earn XP!</p>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card bg-base-100 border border-base-300">
          <div className="card-body p-4 gap-2">
            <ul className="flex flex-col gap-1">
              {leaders.map((leader, i) => {
                const rank = i + 1;
                const isMe = user?.id === leader.id;
                const name = leader.display_name || leader.username;
                const initials = name.substring(0, 2).toUpperCase();
                return (
                  <motion.li
                    key={leader.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isMe ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-base-200"
                    }`}
                  >
                    <span className="text-base w-5 text-center">
                      {rank <= 3 ? medals[rank - 1] : <span className="text-xs text-base-content/40">{rank}</span>}
                    </span>
                    <div className="avatar placeholder">
                      <div className={`${isMe ? "bg-primary text-primary-content" : "bg-base-300 text-base-content"} rounded-full w-7 text-[11px] font-medium`}>
                        <span>{initials}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${isMe ? "text-primary" : "text-base-content"}`}>
                        {name} {isMe && "(You)"}
                      </p>
                      <p className="text-[10px] text-base-content/40">Level {leader.current_level} · 🔥 {leader.streak_days || 0} days</p>
                    </div>
                    <span className={`text-sm font-semibold ${isMe ? "text-primary" : "text-base-content"}`}>
                      {(leader.total_xp || 0).toLocaleString()} XP
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
