import { useState, useRef, useCallback } from "react";
import { useGame } from "../contexts/GameContext";
import { useAuth } from "../contexts/AuthContext";
import { XP_REWARDS } from "../config/languages";
import { saveQuizAttempt, upsertUserProgress } from "../services/supabaseService";

/**
 * Hook kustom untuk melacak skor game, durasi waktu, dan menyimpan data performa ke Supabase.
 * @param {string} quizType - Kategori kuis: 'vocabulary' | 'sentence' | 'challenge'
 * @param {string} [language] - Kode bahasa target (misal: 'id', 'en', 'ms') untuk pelacakan progres
 */
export function useGameScore(quizType, language) {
  const { user } = useAuth();
  const { addXp, recordAnswer, addGamePlayed } = useGame();
  
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  
  // Menggunakan useRef sebagai stopwatch internal untuk mencatat durasi berpikir per soal
  const startTimeRef = useRef(Date.now());

  // Memulai ulang pencatatan waktu
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
  }, []);

  // Menghitung selisih waktu dari startTimer hingga detik ini
  const getTimeSpent = useCallback(() => {
    return Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
  }, []);

  /**
   * Fungsi untuk memproses setiap jawaban yang dimasukkan oleh pengguna per nomor soal.
   */
  const answerQuestion = useCallback(async ({ 
    questionData, 
    userAnswer, 
    correctAnswer, 
    isCorrect, 
    xpType = "quizCorrect" 
  }) => {
    const timeSpent = getTimeSpent();
    // Jika jawaban benar, ambil nilai hadiah dari config XP_REWARDS (default ke 10 XP jika tidak terdefinisi)
    const xpEarned = isCorrect ? (XP_REWARDS[xpType] || 10) : 0;

    // Perbarui state lokal secara berkala
    setTotal((t) => t + 1);
    if (isCorrect) {
      setCorrect((c) => c + 1);
      setScore((s) => s + xpEarned);
      addXp(xpEarned); // Tambah ke context global agar Topbar & ScoreBadge langsung terupdate
    }
    recordAnswer(isCorrect);

    // Kirim data riwayat jawaban (attempt) ke Supabase secara asynchronous
    if (user?.id) {
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
        console.error("Supabase Error [saveQuizAttempt]:", err);
      }
    }

    // Reset timer agar perhitungan waktu untuk soal berikutnya kembali adil dari nol
    startTimer();
    return { xpEarned, timeSpent };
  }, [user, quizType, addXp, recordAnswer, getTimeSpent, startTimer]);

  /**
   * Fungsi untuk merangkum seluruh sesi permainan setelah paket soal habis dijawab.
   */
  const finishGame = useCallback(async () => {
    addGamePlayed(); // Naikkan statistik counter total permainan dimainkan
    
    const gameAccuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const result = { score, correct, total, accuracy: gameAccuracy };

    // Sinkronisasi data ke tabel user_progress Supabase untuk memperbarui bar Progres Bahasa
    if (user?.id && language) {
      try {
        await upsertUserProgress(user.id, language, quizType, {
          games_played: 1,          // Akan diakumulasikan di sisi DB / DB Trigger
          words_learned: correct,   // Menghitung jumlah kata baru yang berhasil dikuasai
          score: score,
        });
      } catch (err) {
        console.warn("Supabase Warning [upsertUserProgress]:", err.message);
      }
    }

    return result;
  }, [user, language, quizType, score, correct, total, addGamePlayed]);

  /**
   * Mengembalikan seluruh status kuis ke kondisi awal (untuk fitur 'Main Lagi' / Retry)
   */
  const resetScore = useCallback(() => {
    setScore(0);
    setCorrect(0);
    setTotal(0);
    startTimer();
  }, [startTimer]);

  // Kalkulasi nilai akurasi real-time yang aman dari pembagian nol (NaN guard)
  const currentAccuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return {
    score,
    correct,
    total,
    accuracy: currentAccuracy,
    answerQuestion,
    finishGame,
    resetScore,
    startTimer,
    getTimeSpent,
  };
}