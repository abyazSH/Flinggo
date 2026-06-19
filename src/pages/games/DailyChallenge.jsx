import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScoreBadge from "../../components/ScoreBadge";
import FeedbackToast from "../../components/FeedbackToast";
import { useGameScore } from "../../hooks/useGameScore";
import { useGame } from "../../contexts/GameContext";
import { generateDailyChallenge } from "../../services/quizService";
import { LANGUAGES, DIFFICULTY_LEVELS } from "../../config/languages";

export default function DailyChallenge() {
  const [phase, setPhase] = useState("setup"); // setup | playing | results
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [difficulty, setDifficulty] = useState("medium");
  const [challenge, setChallenge] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [checked, setChecked] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  const { streak: gameStreak, updateStreak } = useGame();
  const { score, answerQuestion, finishGame, resetScore, startTimer } = useGameScore("challenge", targetLang);

  async function startChallenge() {
    setLoading(true);
    resetScore();
    try {
      const ch = await generateDailyChallenge(sourceLang, targetLang, difficulty);
      setChallenge(ch);
      setPhase("playing");
      setUserAnswer("");
      setChecked(false);
      setShowHint(false);
      setTimer(0);
      const limit = ch.time_limit || 60;
      setTimeLeft(limit);
      startTimer();

      // Elapsed timer (counts up)
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);

      // Countdown timer
      countdownRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(countdownRef.current);
            clearInterval(timerRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Failed to generate challenge:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  async function handleSubmit() {
    if (!userAnswer.trim() || checked) return;
    setChecked(true);
    clearInterval(timerRef.current);
    clearInterval(countdownRef.current);

    // Lenient keyword matching
    const keywords = challenge.keywords || [];
    const answerLower = userAnswer.toLowerCase();
    const matchedKeywords = keywords.filter((k) => answerLower.includes(k.toLowerCase()));
    const isCorrect =
      keywords.length > 0 ? matchedKeywords.length >= Math.ceil(keywords.length * 0.6) : false;

    const matchPct =
      keywords.length > 0
        ? Math.round((matchedKeywords.length / keywords.length) * 100)
        : 0;

    setFeedback({
      show: true,
      isCorrect,
      message: isCorrect
        ? `Great translation! (${matchedKeywords.length}/${keywords.length} keywords matched)`
        : `Expected: "${challenge.correct_answer}" — ${challenge.explanation}`,
    });

    await answerQuestion({
      questionData: challenge,
      userAnswer: userAnswer,
      correctAnswer: challenge.correct_answer,
      isCorrect,
      xpType: "dailyChallenge",
    });

    // Update daily streak
    updateStreak();
  }

  function showResults() {
    finishGame();
    setPhase("results");
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const timerLimit = challenge?.time_limit || 60;
  const timerPct = (timeLeft / timerLimit) * 100;

  // ── Setup ──
  if (phase === "setup") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-4 p-6 max-w-lg mx-auto">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-lg font-semibold">📅 Daily Challenge</motion.h1>

        {/* Streak banner */}
        {gameStreak > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="alert bg-primary/10 border-primary/20 py-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-sm font-semibold text-primary">{gameStreak} day streak!</p>
              <p className="text-xs text-primary/70">
                Complete today's challenge to keep it going.
              </p>
            </div>
          </motion.div>
        )}

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm">From</span>
                </label>
                <select
                  className="select select-bordered select-sm text-sm"
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm">To</span>
                </label>
                <select
                  className="select select-bordered select-sm text-sm"
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                >
                  {LANGUAGES.filter((l) => l.code !== sourceLang).map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.name}
                    </option>
                  ))}
                </select>
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
                    {d.id === "hard" && (
                      <span className="badge badge-xs badge-warning ml-1">2x XP</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn btn-warning btn-sm mt-2"
              onClick={startChallenge}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-xs" /> Loading...
                </>
              ) : (
                "Start Challenge"
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Results ──
  if (phase === "results") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-4 p-6 max-w-lg mx-auto">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-lg font-semibold">📅 Challenge Complete!</motion.h1>
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body items-center text-center gap-4">
            <span className="text-5xl">🏅</span>
            <h2 className="text-xl font-bold">Challenge Finished</h2>

            <div className="stats stats-vertical sm:stats-horizontal shadow-none bg-base-200 w-full">
              <div className="stat place-items-center">
                <div className="stat-title text-xs">Time</div>
                <div className="stat-value text-lg">{formatTime(timer)}</div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title text-xs">XP Earned</div>
                <div className="stat-value text-lg text-primary">{score}</div>
              </div>
            </div>

            {/* Answer review */}
            {challenge && (
              <div className="w-full text-left bg-base-200 rounded-lg p-3 text-xs space-y-1">
                <p>
                  <span className="font-semibold">Your answer:</span>{" "}
                  <span className={feedback?.isCorrect ? "text-success" : "text-error"}>
                    {userAnswer || "(empty)"}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Correct:</span>{" "}
                  <span className="text-success">{challenge.correct_answer}</span>
                </p>
                <p className="text-base-content/60">{challenge.explanation}</p>
              </div>
            )}

            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn btn-primary btn-sm" onClick={() => setPhase("setup")}>
              New Challenge
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Playing ──
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col gap-4 p-6 max-w-lg mx-auto relative">
      <FeedbackToast
        show={feedback?.show}
        isCorrect={feedback?.isCorrect}
        message={feedback?.message}
        onDone={() => setFeedback(null)}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">📅 Daily Challenge</h1>
        <div className="flex items-center gap-2">
          <span className="badge badge-ghost badge-sm">⏱ {formatTime(timer)}</span>
          <ScoreBadge score={score} />
        </div>
      </div>

      {/* Countdown */}
      {!checked && (
        <div className="flex items-center gap-2">
          <div className="w-10 text-center">
            <span
              className={`text-xs font-mono font-bold ${
                timeLeft <= 10 ? "text-error" : timeLeft <= 20 ? "text-warning" : "text-base-content/50"
              }`}
            >
              {timeLeft}s
            </span>
          </div>
          <progress
            className={`progress h-1.5 flex-1 ${
              timeLeft <= 10 ? "progress-error" : timeLeft <= 20 ? "progress-warning" : "progress-info"
            }`}
            value={timerPct}
            max={100}
          />
        </div>
      )}

      {challenge && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-base-100 border border-base-300"
        >
          <div className="card-body gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`badge badge-sm ${
                  DIFFICULTY_LEVELS.find((d) => d.id === difficulty)?.color || "badge-warning"
                }`}
              >
                {difficulty}
              </span>
              <span className="text-xs text-base-content/50">Translate the text below</span>
            </div>

            <div className="bg-base-200 rounded-lg p-4">
              <p className="text-sm font-medium">{challenge.prompt_text}</p>
              {showHint && challenge.english_hint && challenge.english_hint !== challenge.prompt_text && (
                <p className="text-xs text-base-content/50 mt-1 italic">
                  Hint: {challenge.english_hint}
                </p>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm">Your translation:</span>
              </label>
              <textarea
                className="textarea textarea-bordered text-sm"
                rows={3}
                placeholder="Type your translation here..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={checked}
              />
            </div>

            {/* Keywords matched indicator */}
            {checked && challenge.keywords && challenge.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-base-content/50 mr-1">Keywords:</span>
                {challenge.keywords.map((kw, i) => {
                  const matched = userAnswer.toLowerCase().includes(kw.toLowerCase());
                  return (
                    <span
                      key={i}
                      className={`badge badge-xs ${matched ? "badge-success" : "badge-ghost"}`}
                    >
                      {kw}
                    </span>
                  );
                })}
              </div>
            )}

            {checked && challenge.correct_answer && (
              <div className="alert bg-base-200 py-2 text-xs">
                <div>
                  <p className="font-medium">Correct answer: {challenge.correct_answer}</p>
                  <p className="text-base-content/50">{challenge.explanation}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {!checked && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="btn btn-ghost btn-xs"
                    onClick={() => setShowHint(true)}
                    disabled={showHint}
                  >
                    💡 Hint
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn btn-warning btn-sm flex-1"
                    onClick={handleSubmit}
                    disabled={!userAnswer.trim()}
                  >
                    Submit Answer
                  </motion.button>
                </>
              )}
              {checked && (
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="btn btn-primary btn-sm w-full" onClick={showResults}>
                  See Results
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
