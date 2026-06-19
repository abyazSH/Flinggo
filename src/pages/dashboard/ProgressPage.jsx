import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useGame } from "../../contexts/GameContext";
import LevelProgress from "../../components/LevelProgress";
import { getUserProgress, getQuizAttempts } from "../../services/supabaseService";
import { LANGUAGES } from "../../config/languages";

export default function ProgressPage() {
  const { user, refreshProfile } = useAuth();
  const { xp, level, streak } = useGame();
  const [progress, setProgress] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Pull fresh profile from DB so XP/level/streak are up to date
    refreshProfile();

    let fetchFailed = false;

    Promise.all([
      getUserProgress(user.id).catch((err) => {
        console.error("[Progress] getUserProgress failed:", err);
        fetchFailed = true;
        return [];
      }),
      getQuizAttempts(user.id, null, 50).catch((err) => {
        console.error("[Progress] getQuizAttempts failed:", err);
        fetchFailed = true;
        return [];
      }),
    ]).then(([prog, atts]) => {
      setProgress(prog || []);
      setAttempts(atts || []);
      // Only show error if the DB queries actually threw errors (table missing, RLS blocked, etc.)
      if (fetchFailed) {
        setError("Could not load progress data. Check that the Supabase tables exist and RLS policies are set.");
      } else {
        setError(null);
      }
      setLoading(false);
    });
  }, [user]);

  // Aggregate real quiz attempts by type
  const totalCorrect = attempts.filter((a) => a.is_correct).length;
  const totalAttempts = attempts.length;
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const byType = { vocabulary: 0, sentence: 0, challenge: 0 };
  attempts.forEach((a) => {
    byType[a.quiz_type] = (byType[a.quiz_type] || 0) + 1;
  });

  // Aggregate user_progress rows per language (across all categories/game types)
  const langStats = {};
  progress.forEach((p) => {
    if (!langStats[p.language]) {
      langStats[p.language] = { words_learned: 0, games_played: 0, score: 0 };
    }
    langStats[p.language].words_learned += p.words_learned || 0;
    langStats[p.language].games_played += p.games_played || 0;
    langStats[p.language].score += p.score || 0;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-4 p-6 max-w-2xl mx-auto">
      <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-lg font-semibold">📊 My Progress</motion.h1>

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="alert alert-error py-2 text-xs">
          <span>{error}</span>
        </motion.div>
      )}

      {/* Level progress — reads real xp/level from profiles table via GameContext */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ y: -2 }} className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 gap-3">
          <LevelProgress xp={xp} level={level} />
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[
              { label: "Total XP", value: xp.toLocaleString(), cls: "text-primary" },
              { label: "Accuracy", value: `${overallAccuracy}%`, cls: "" },
              { label: "Streak", value: `🔥 ${streak}`, cls: "" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.07 }} className="text-center">
                <p className="text-xs text-base-content/50">{stat.label}</p>
                <p className={`text-lg font-bold ${stat.cls}`}>{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Activity breakdown — real counts from quiz_attempts table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} whileHover={{ y: -2 }} className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 gap-3">
          <h3 className="card-title text-sm font-medium">Activity Breakdown</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { emoji: "🃏", count: byType.vocabulary || 0, label: "Vocab Quizzes" },
              { emoji: "✍️", count: byType.sentence || 0, label: "Sentences" },
              { emoji: "📅", count: byType.challenge || 0, label: "Challenges" },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 + i * 0.08 }} whileHover={{ scale: 1.05 }} className="bg-base-200 rounded-lg p-3 text-center cursor-default">
                <p className="text-2xl">{item.emoji}</p>
                <p className="text-lg font-bold">{item.count}</p>
                <p className="text-xs text-base-content/50">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Language progress — real data from user_progress table, aggregated per language */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} whileHover={{ y: -2 }} className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 gap-3">
          <h3 className="card-title text-sm font-medium">🌐 Language Progress</h3>
          {loading ? (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner loading-sm" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {LANGUAGES.filter((lang) => lang.code !== "en").map((lang, i) => {
                const stats = langStats[lang.code];
                const wordsLearned = stats?.words_learned || 0;
                const gamesPlayed = stats?.games_played || 0;
                // Each 20 correct words = 100% progress (cap at 100%)
                const pct = Math.min(100, wordsLearned * 5);
                return (
                  <motion.div key={lang.code} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.06 }} className="flex items-center gap-3">
                    <span className="text-base w-5 text-center">{lang.flag}</span>
                    <span className="text-xs text-base-content w-16">{lang.name}</span>
                    <div className="flex-1">
                      <progress className="progress progress-primary h-2" value={pct} max={100} />
                    </div>
                    <span className="text-xs text-base-content/50 w-20 text-right">
                      {wordsLearned} words · {gamesPlayed} games
                    </span>
                  </motion.div>
                );
              })}
              {Object.keys(langStats).length === 0 && (
                <p className="text-xs text-base-content/40 text-center py-4">
                  Play some games to start tracking language progress!
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
