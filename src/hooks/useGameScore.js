import { useState, useRef, useCallback } from "react";
import { useGame } from "../contexts/GameContext";
import { useAuth } from "../contexts/AuthContext";
import { XP_REWARDS } from "../config/languages";
import { saveQuizAttempt, upsertUserProgress } from "../services/supabaseService";

/**
 * Hook for tracking game scoring and persisting to Supabase.
 * @param {string} quizType - 'vocabulary' | 'sentence' | 'challenge'
 * @param {string} [language] - target language code for user_progress tracking
 */
export function useGameScore(quizType, language) {
  const { user } = useAuth();
  const { addXp, recordAnswer, addGamePlayed } = useGame();
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const startTimeRef = useRef(Date.now());

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
  }, []);

  const getTimeSpent = useCallback(() => {
    return Math.round((Date.now() - startTimeRef.current) / 1000);
  }, []);

  const answerQuestion = useCallback(async ({ questionData, userAnswer, correctAnswer, isCorrect, xpType = "quizCorrect" }) => {
    const timeSpent = getTimeSpent();
    const xpEarned = isCorrect ? (XP_REWARDS[xpType] || 10) : 0;

    setTotal((t) => t + 1);
    if (isCorrect) {
      setCorrect((c) => c + 1);
      setScore((s) => s + xpEarned);
      addXp(xpEarned);
    }
    recordAnswer(isCorrect);

    // Save attempt to Supabase
    if (user) {
      try {
        await saveQuizAttempt({
          userId: user.id,
          quizType,
          questionData,
          userAnswer,
          correctAnswer,
          isCorrect,
          xpEarned,
          timeSpentSec: timeSpent,
        });
      } catch (err) {
        console.error("Failed to save quiz attempt:", err);
      }
    }

    startTimer();
    return { xpEarned, timeSpent };
  }, [user, quizType, addXp, recordAnswer, getTimeSpent, startTimer]);

  /**
   * Finalise the current game session.
   * - Increments session counters
   * - Upserts per-language progress to `user_progress` table
   */
  const finishGame = useCallback(async () => {
    addGamePlayed();
    const gameAccuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const result = { score, correct, total, accuracy: gameAccuracy };

    // Persist per-language progress to user_progress table
    if (user && language) {
      try {
        await upsertUserProgress(user.id, language, quizType, {
          games_played: 1,          // will be added to existing via DB trigger-style logic below
          words_learned: correct,   // number of correct answers this session
          score: score,
        });
      } catch (err) {
        console.warn("Failed to upsert user_progress:", err.message);
      }
    }

    return result;
  }, [user, language, quizType, score, correct, total, addGamePlayed]);

  const resetScore = useCallback(() => {
    setScore(0);
    setCorrect(0);
    setTotal(0);
    startTimer();
  }, [startTimer]);

  return {
    score, correct, total,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    answerQuestion, finishGame, resetScore, startTimer, getTimeSpent,
  };
}
