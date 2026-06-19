import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScoreBadge from "../../components/ScoreBadge";
import FeedbackToast from "../../components/FeedbackToast";
import { useGameScore } from "../../hooks/useGameScore";
import { generateVocabularyQuiz } from "../../services/quizService";
import { LANGUAGES, DIFFICULTY_LEVELS } from "../../config/languages";

export default function VocabularyQuiz() {
  const [phase, setPhase] = useState("setup"); // setup | playing | results
  const [targetLang, setTargetLang] = useState("es");
  const [difficulty, setDifficulty] = useState("easy");
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(0); // consecutive correct streak within this game
  const [timeLeft, setTimeLeft] = useState(15);
  const [questionResults, setQuestionResults] = useState([]); // track each answer for results
  const timerRef = useRef(null);

  const { score, correct, total, accuracy, answerQuestion, finishGame, resetScore, startTimer } =
    useGameScore("vocabulary", targetLang);

  // Countdown timer per question
  useEffect(() => {
    if (phase !== "playing" || selected !== null) return;
    const q = questions[currentIdx];
    const limit = q?.time_limit || 15;
    setTimeLeft(limit);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          // Auto-submit as wrong when time runs out
          if (selected === null) handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIdx, phase]);

  const handleTimeout = useCallback(() => {
    if (selected !== null) return;
    setSelected(-1); // -1 = timed out
    const q = questions[currentIdx];
    setFeedback({
      show: true,
      isCorrect: false,
      message: `Time's up! Correct: "${q.options[q.correctIndex]}" — ${q.explanation}`,
    });
    setStreak(0);
    setQuestionResults((prev) => [
      ...prev,
      { word: q.word, correct: false, userAnswer: "(timed out)", correctAnswer: q.options[q.correctIndex] },
    ]);
    answerQuestion({
      questionData: q,
      userAnswer: "(timed out)",
      correctAnswer: q.options[q.correctIndex],
      isCorrect: false,
      xpType: "quizCorrect",
    });
  }, [selected, currentIdx, questions]);

  async function startQuiz() {
    setLoading(true);
    resetScore();
    setStreak(0);
    setQuestionResults([]);
    try {
      const qs = await generateVocabularyQuiz(targetLang, difficulty, 5);
      setQuestions(qs);
      setCurrentIdx(0);
      setPhase("playing");
      setSelected(null);
      setFeedback(null);
      startTimer();
    } catch (err) {
      console.error("Failed to generate quiz:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswer(idx) {
    if (selected !== null) return;
    clearInterval(timerRef.current);
    setSelected(idx);

    const q = questions[currentIdx];
    const isCorrect = idx === q.correctIndex;

    setFeedback({
      show: true,
      isCorrect,
      message: isCorrect
        ? `+${q.xp_reward || 10} XP! ${q.explanation}`
        : `Correct: "${q.options[q.correctIndex]}" — ${q.explanation}`,
    });

    if (isCorrect) {
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }

    setQuestionResults((prev) => [
      ...prev,
      {
        word: q.word,
        correct: isCorrect,
        userAnswer: q.options[idx],
        correctAnswer: q.options[q.correctIndex],
      },
    ]);

    await answerQuestion({
      questionData: q,
      userAnswer: q.options[idx],
      correctAnswer: q.options[q.correctIndex],
      isCorrect,
      xpType: "quizCorrect",
    });
  }

  function nextQuestion() {
    setSelected(null);
    setFeedback(null);
    if (currentIdx + 1 >= questions.length) {
      finishGame();
      setPhase("results");
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }

  const currentQ = questions[currentIdx];
  const timerPct = currentQ ? (timeLeft / (currentQ.time_limit || 15)) * 100 : 100;

  // ── Setup Screen ──
  if (phase === "setup") {
    return (
      <div className="flex flex-col gap-4 p-6 max-w-lg mx-auto">
        <h1 className="text-lg font-semibold">🃏 Vocabulary Quiz</h1>
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Target Language</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.filter((l) => l.code !== "en").map((lang) => (
                  <button
                    key={lang.code}
                    className={`btn btn-sm ${targetLang === lang.code ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setTargetLang(lang.code)}
                  >
                    {lang.flag} {lang.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Difficulty</span>
              </label>
              <div className="flex gap-2">
                {DIFFICULTY_LEVELS.map((d) => (
                  <button
                    key={d.id}
                    className={`btn btn-sm ${difficulty === d.id ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setDifficulty(d.id)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn btn-primary btn-sm mt-2"
              onClick={startQuiz}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-xs" /> Loading...
                </>
              ) : (
                "Start Quiz"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Results Screen ──
  if (phase === "results") {
    return (
      <div className="flex flex-col gap-4 p-6 max-w-lg mx-auto">
        <h1 className="text-lg font-semibold">🃏 Quiz Results</h1>
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body items-center text-center gap-4">
            <span className="text-5xl">{accuracy >= 80 ? "🎉" : accuracy >= 50 ? "👍" : "💪"}</span>
            <h2 className="text-xl font-bold">{accuracy}% Accuracy</h2>

            <div className="stats stats-vertical sm:stats-horizontal shadow-none bg-base-200 w-full">
              <div className="stat place-items-center">
                <div className="stat-title text-xs">Correct</div>
                <div className="stat-value text-lg">{correct}/{total}</div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title text-xs">Score</div>
                <div className="stat-value text-lg text-primary">{score} XP</div>
              </div>
            </div>

            {/* Answer review */}
            {questionResults.length > 0 && (
              <div className="w-full mt-2">
                <h3 className="text-xs font-semibold text-base-content/60 mb-2 text-left">Review</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {questionResults.map((r, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 text-xs p-2 rounded ${
                        r.correct ? "bg-success/10" : "bg-error/10"
                      }`}
                    >
                      <span>{r.correct ? "✅" : "❌"}</span>
                      <span className="font-medium">{r.word}</span>
                      <span className="text-base-content/50">→</span>
                      <span className={r.correct ? "text-success" : "text-error"}>
                        {r.userAnswer}
                      </span>
                      {!r.correct && (
                        <span className="ml-auto text-success text-[10px]">{r.correctAnswer}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="btn btn-primary btn-sm" onClick={() => setPhase("setup")}>
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Playing Screen ──
  return (
    <div className="flex flex-col gap-4 p-6 max-w-lg mx-auto relative">
      <FeedbackToast
        show={feedback?.show}
        isCorrect={feedback?.isCorrect}
        message={feedback?.message}
        onDone={() => setFeedback(null)}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">🃏 Vocabulary Quiz</h1>
        <div className="flex items-center gap-2">
          {streak >= 2 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="badge badge-warning badge-sm"
            >
              🔥 {streak}
            </motion.span>
          )}
          <ScoreBadge score={score} />
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <progress
          className="progress progress-primary h-2 flex-1"
          value={currentIdx + 1}
          max={questions.length}
        />
        <span className="text-xs text-base-content/50">
          {currentIdx + 1}/{questions.length}
        </span>
      </div>

      {/* Countdown timer */}
      <div className="flex items-center gap-2">
        <div className="w-10 text-center">
          <span className={`text-xs font-mono font-bold ${timeLeft <= 3 ? "text-error" : timeLeft <= 7 ? "text-warning" : "text-base-content/50"}`}>
            {timeLeft}s
          </span>
        </div>
        <progress
          className={`progress h-1.5 flex-1 ${timeLeft <= 3 ? "progress-error" : timeLeft <= 7 ? "progress-warning" : "progress-info"}`}
          value={timerPct}
          max={100}
        />
      </div>

      <AnimatePresence mode="wait">
        {currentQ && (
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="card bg-base-100 border border-base-300"
          >
            <div className="card-body gap-4">
              <div className="text-center">
                <p className="text-xs text-base-content/50 mb-1">Translate this word:</p>
                <h2 className="text-2xl font-bold">{currentQ.word}</h2>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {currentQ.options.map((opt, idx) => {
                  let btnClass = "btn btn-outline btn-sm text-sm justify-start";
                  if (selected !== null) {
                    if (idx === currentQ.correctIndex)
                      btnClass = "btn btn-success btn-sm text-sm justify-start";
                    else if (idx === selected)
                      btnClass = "btn btn-error btn-sm text-sm justify-start";
                    else
                      btnClass = "btn btn-outline btn-sm text-sm justify-start opacity-40";
                  }
                  return (
                    <button
                      key={idx}
                      className={btnClass}
                      onClick={() => handleAnswer(idx)}
                      disabled={selected !== null}
                    >
                      <span className="badge badge-ghost badge-xs mr-2">{String.fromCharCode(65 + idx)}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {selected !== null && (
                <button className="btn btn-primary btn-sm mt-2" onClick={nextQuestion}>
                  {currentIdx + 1 >= questions.length ? "See Results" : "Next Question"}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
