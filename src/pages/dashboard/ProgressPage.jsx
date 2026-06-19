import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (!user) return;

    // Pull fresh profile from DB so XP/level/streak are up to date
    refreshProfile();

    Promise.all([
      getUserProgress(user.id).catch(() => []),
      getQuizAttempts(user.id, null, 50).catch(() => []),
    ]).then(([prog, atts]) => {
      setProgress(prog || []);
      setAttempts(atts || []);
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
    <div className="flex flex-col gap-4 p-6 max-w-2xl mx-auto">
      <h1 className="text-lg font-semibold">📊 My Progress</h1>

      {/* Level progress — reads real xp/level from profiles table via GameContext */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 gap-3">
          <LevelProgress xp={xp} level={level} />
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div className="text-center">
              <p className="text-xs text-base-content/50">Total XP</p>
              <p className="text-lg font-bold text-primary">{xp.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-base-content/50">Accuracy</p>
              <p className="text-lg font-bold">{overallAccuracy}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-base-content/50">Streak</p>
              <p className="text-lg font-bold">🔥 {streak}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity breakdown — real counts from quiz_attempts table */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 gap-3">
          <h3 className="card-title text-sm font-medium">Activity Breakdown</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-base-200 rounded-lg p-3 text-center">
              <p className="text-2xl">🃏</p>
              <p className="text-lg font-bold">{byType.vocabulary || 0}</p>
              <p className="text-xs text-base-content/50">Vocab Quizzes</p>
            </div>
            <div className="bg-base-200 rounded-lg p-3 text-center">
              <p className="text-2xl">✍️</p>
              <p className="text-lg font-bold">{byType.sentence || 0}</p>
              <p className="text-xs text-base-content/50">Sentences</p>
            </div>
            <div className="bg-base-200 rounded-lg p-3 text-center">
              <p className="text-2xl">📅</p>
              <p className="text-lg font-bold">{byType.challenge || 0}</p>
              <p className="text-xs text-base-content/50">Challenges</p>
            </div>
          </div>
        </div>
      </div>

      {/* Language progress — real data from user_progress table, aggregated per language */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 gap-3">
          <h3 className="card-title text-sm font-medium">🌐 Language Progress</h3>
          {loading ? (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner loading-sm" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {LANGUAGES.filter((lang) => lang.code !== "en").map((lang) => {
                const stats = langStats[lang.code];
                const wordsLearned = stats?.words_learned || 0;
                const gamesPlayed = stats?.games_played || 0;
                // Each 20 correct words = 100% progress (cap at 100%)
                const pct = Math.min(100, wordsLearned * 5);
                return (
                  <div key={lang.code} className="flex items-center gap-3">
                    <span className="text-base w-5 text-center">{lang.flag}</span>
                    <span className="text-xs text-base-content w-16">{lang.name}</span>
                    <div className="flex-1">
                      <progress className="progress progress-primary h-2" value={pct} max={100} />
                    </div>
                    <span className="text-xs text-base-content/50 w-20 text-right">
                      {wordsLearned} words · {gamesPlayed} games
                    </span>
                  </div>
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
      </div>
    </div>
  );
}
