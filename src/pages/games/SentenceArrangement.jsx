import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScoreBadge from "../../components/ScoreBadge";
import FeedbackToast from "../../components/FeedbackToast";
import { useGameScore } from "../../hooks/useGameScore";
import { generateSentenceExercise } from "../../services/quizService";
import { LANGUAGES, DIFFICULTY_LEVELS } from "../../config/languages";

export default function SentenceArrangement() {
  const [phase, setPhase] = useState("setup"); // setup | playing | results
  const [targetLang, setTargetLang] = useState("id");
  const [difficulty, setDifficulty] = useState("easy");
  const [exercises, setExercises] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [arranged, setArranged] = useState([]);
  const [available, setAvailable] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [streak, setStreak] = useState(0);
  const [exerciseResults, setExerciseResults] = useState([]);
  const timerRef = useRef(null);

  const { score, correct, total, accuracy, answerQuestion, finishGame, resetScore, startTimer } =
    useGameScore("sentence", targetLang);

  // Countdown timer per exercise
  useEffect(() => {
    if (phase !== "playing" || checked) return;
    const ex = exercises[currentIdx];
    const limit = ex?.time_limit || 30;
    setTimeLeft(limit);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          if (!checked) handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIdx, phase]);

  const handleTimeout = useCallback(() => {
    if (checked) return;
    setChecked(true);
    const ex = exercises[currentIdx];
    setFeedback({
      show: true,
      isCorrect: false,
      message: `Time's up! Correct: "${ex.correct_order.join(" ")}" — ${ex.grammar_tip}`,
    });
    setStreak(0);
    setExerciseResults((prev) => [
      ...prev,
      { hint: ex.english_hint, correct: false, userAnswer: "(timed out)", correctAnswer: ex.correct_order.join(" ") },
    ]);
    answerQuestion({
      questionData: ex,
      userAnswer: "(timed out)",
      correctAnswer: ex.correct_order.join(" "),
      isCorrect: false,
      xpType: "sentenceCorrect",
    });
  }, [checked, currentIdx, exercises]);

  async function startGame() {
    setLoading(true);
    resetScore();
    setStreak(0);
    setExerciseResults([]);
    try {
      const exs = await generateSentenceExercise(targetLang, difficulty, 3);
      setExercises(exs);
      setCurrentIdx(0);
      setPhase("playing");
      loadExercise(exs[0]);
      startTimer();
    } catch (err) {
      console.error("Failed to generate exercises:", err);
    } finally {
      setLoading(false);
    }
  }

  function loadExercise(ex) {
    setArranged([]);
    // Shuffle the words for the player
    const shuffled = [...ex.shuffled_words].sort(() => Math.random() - 0.5);
    setAvailable(shuffled);
    setChecked(false);
    setShowHint(false);
    setFeedback(null);
  }

  function pickWord(word, fromIdx) {
    if (checked) return;
    setAvailable((prev) => {
      const next = [...prev];
      next.splice(fromIdx, 1);
      return next;
    });
    setArranged((prev) => [...prev, word]);
  }

  function removeWord(word, fromIdx) {
    if (checked) return;
    setArranged((prev) => {
      const next = [...prev];
      next.splice(fromIdx, 1);
      return next;
    });
    setAvailable((prev) => [...prev, word]);
  }

  async function checkAnswer() {
    if (checked) return;
    clearInterval(timerRef.current);
    setChecked(true);

    const ex = exercises[currentIdx];
    const userStr = arranged.join(" ");
    const correctStr = ex.correct_order.join(" ");
    const isCorrect = userStr === correctStr;

    setFeedback({
      show: true,
      isCorrect,
      message: isCorrect
        ? `+${ex.xp_reward || 15} XP! Perfect sentence structure!`
        : `Correct: "${correctStr}" — ${ex.grammar_tip}`,
    });

    if (isCorrect) {
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }

    setExerciseResults((prev) => [
      ...prev,
      { hint: ex.english_hint, correct: isCorrect, userAnswer: userStr, correctAnswer: correctStr },
    ]);

    await answerQuestion({
      questionData: ex,
      userAnswer: userStr,
      correctAnswer: correctStr,
      isCorrect,
      xpType: "sentenceCorrect",
    });
  }

  function nextExercise() {
    setFeedback(null);
    setChecked(false);
    if (currentIdx + 1 >= exercises.length) {
      finishGame();
      setPhase("results");
    } else {
      const nextI = currentIdx + 1;
      setCurrentIdx(nextI);
      loadExercise(exercises[nextI]);
    }
  }

  const currentEx = exercises[currentIdx];
  const isAnswerCorrect = currentEx && JSON.stringify(arranged) === JSON.stringify(currentEx.correct_order);
  const timerLimit = currentEx?.time_limit || 30;
  const timerPct = (timeLeft / timerLimit) * 100;

  // ── Setup ──
  if (phase === "setup") {
    return (
      <div className="flex flex-col gap-4 p-6 max-w-lg mx-auto">
        <h1 className="text-lg font-semibold">✍️ Sentence Arrangement</h1>
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
              onClick={startGame}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-xs" /> Loading...
                </>
              ) : (
                "Start Exercise"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Results ──
  if (phase === "results") {
    return (
      <div className="flex flex-col gap-4 p-6 max-w-lg mx-auto">
        <h1 className="text-lg font-semibold">✍️ Exercise Results</h1>
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body items-center text-center gap-4">
            <span className="text-5xl">
              {accuracy >= 80 ? "🎉" : accuracy >= 50 ? "👍" : "💪"}
            </span>
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
            {exerciseResults.length > 0 && (
              <div className="w-full mt-2">
                <h3 className="text-xs font-semibold text-base-content/60 mb-2 text-left">Review</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {exerciseResults.map((r, i) => (
                    <div
                      key={i}
                      className={`text-xs p-2 rounded ${r.correct ? "bg-success/10" : "bg-error/10"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{r.correct ? "✅" : "❌"}</span>
                        <span className="font-medium">{r.hint}</span>
                      </div>
                      {!r.correct && (
                        <div className="mt-1 ml-6">
                          <span className="text-error">Your: {r.userAnswer}</span>
                          <br />
                          <span className="text-success">Correct: {r.correctAnswer}</span>
                        </div>
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

  // ── Playing ──
  return (
    <div className="flex flex-col gap-4 p-6 max-w-lg mx-auto relative">
      <FeedbackToast
        show={feedback?.show}
        isCorrect={feedback?.isCorrect}
        message={feedback?.message}
        onDone={() => setFeedback(null)}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">✍️ Sentence Builder</h1>
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

      {/* Progress */}
      <div className="flex items-center gap-2">
        <progress
          className="progress progress-primary h-2 flex-1"
          value={currentIdx + 1}
          max={exercises.length}
        />
        <span className="text-xs text-base-content/50">
          {currentIdx + 1}/{exercises.length}
        </span>
      </div>

      {/* Timer */}
      <div className="flex items-center gap-2">
        <div className="w-10 text-center">
          <span
            className={`text-xs font-mono font-bold ${
              timeLeft <= 5 ? "text-error" : timeLeft <= 10 ? "text-warning" : "text-base-content/50"
            }`}
          >
            {timeLeft}s
          </span>
        </div>
        <progress
          className={`progress h-1.5 flex-1 ${
            timeLeft <= 5 ? "progress-error" : timeLeft <= 10 ? "progress-warning" : "progress-info"
          }`}
          value={timerPct}
          max={100}
        />
      </div>

      {currentEx && (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-4">
            <div className="text-center">
              <p className="text-xs text-base-content/50">Arrange words to form:</p>
              <p className="text-sm font-medium mt-1">"{currentEx.english_hint}"</p>
            </div>

            {/* Arranged words (drop zone) */}
            <div className="min-h-[60px] border-2 border-dashed border-base-300 rounded-lg p-3 flex flex-wrap gap-2">
              {arranged.length === 0 && (
                <p className="text-xs text-base-content/30 w-full text-center">
                  Tap words below to arrange them
                </p>
              )}
              <AnimatePresence>
                {arranged.map((word, idx) => (
                  <motion.button
                    key={`arr-${idx}-${word}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className={`btn btn-sm ${
                      checked
                        ? isAnswerCorrect
                          ? "btn-success"
                          : "btn-error"
                        : "btn-primary"
                    }`}
                    onClick={() => removeWord(word, idx)}
                    disabled={checked}
                  >
                    {word}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Available words */}
            <div className="flex flex-wrap gap-2 justify-center">
              <AnimatePresence>
                {available.map((word, idx) => (
                  <motion.button
                    key={`avail-${idx}-${word}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="btn btn-outline btn-sm"
                    onClick={() => pickWord(word, idx)}
                    disabled={checked}
                  >
                    {word}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Hint */}
            {showHint && currentEx.grammar_tip && (
              <div className="alert alert-info py-2 text-xs">
                <span>💡 {currentEx.grammar_tip}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-between">
              {!checked && (
                <>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => setShowHint(true)}
                    disabled={showHint}
                  >
                    💡 Hint
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={checkAnswer}
                    disabled={arranged.length === 0}
                  >
                    Check Answer
                  </button>
                </>
              )}
              {checked && (
                <button className="btn btn-primary btn-sm w-full" onClick={nextExercise}>
                  {currentIdx + 1 >= exercises.length ? "See Results" : "Next Exercise"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
