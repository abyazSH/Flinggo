import { createContext, useContext, useReducer, useEffect, useRef } from "react";
import { calcLevel, XP_REWARDS } from "../config/languages";
import { useAuth } from "./AuthContext";
import { supabase } from "../config/supabase";

const GameContext = createContext(null);

const initialState = {
  xp: 0,
  level: 1,
  streak: 0,
  score: 0,
  gamesPlayed: 0,
  correctAnswers: 0,
  totalAnswers: 0,
  recentXpGains: [],
  showLevelUp: false,
};

function gameReducer(state, action) {
  switch (action.type) {
    case "LOAD_STATE":
      return { ...state, ...action.payload };
    case "ADD_XP": {
      const newXp = state.xp + action.payload;
      const newLevel = calcLevel(newXp);
      const leveledUp = newLevel > state.level;
      return {
        ...state,
        xp: newXp,
        level: newLevel,
        showLevelUp: leveledUp,
        recentXpGains: [...state.recentXpGains, { amount: action.payload, at: Date.now() }],
      };
    }
    case "DISMISS_LEVEL_UP":
      return { ...state, showLevelUp: false };
    case "RECORD_ANSWER":
      return {
        ...state,
        totalAnswers: state.totalAnswers + 1,
        correctAnswers: state.correctAnswers + (action.payload.correct ? 1 : 0),
      };
    case "ADD_GAME_PLAYED":
      return { ...state, gamesPlayed: state.gamesPlayed + 1 };
    case "SET_SCORE":
      return { ...state, score: action.payload };
    case "UPDATE_STREAK":
      return { ...state, streak: action.payload };
    case "RESET_GAME":
      return { ...state, score: 0 };
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const { user, profile } = useAuth();
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const xpRef = useRef(0); // always-current XP value to avoid stale-state DB writes

  // Load state from profile when user logs in
  useEffect(() => {
    if (profile) {
      const loaded = {
        xp: profile.total_xp || 0,
        level: profile.current_level || 1,
        streak: profile.streak_days || 0,
      };
      dispatch({ type: "LOAD_STATE", payload: loaded });
      xpRef.current = loaded.xp;
    }
  }, [profile]);

  // Persist XP and level changes to Supabase
  async function addXp(amount) {
    // Compute new XP BEFORE dispatching to avoid stale-state race condition
    const newXp = xpRef.current + amount;
    xpRef.current = newXp;

    dispatch({ type: "ADD_XP", payload: amount });

    if (user) {
      await supabase
        .from("profiles")
        .update({ total_xp: newXp, current_level: calcLevel(newXp) })
        .eq("id", user.id);
    }
  }

  function recordAnswer(correct) {
    dispatch({ type: "RECORD_ANSWER", payload: { correct } });
  }

  function addGamePlayed() {
    dispatch({ type: "ADD_GAME_PLAYED" });
  }

  function setScore(score) {
    dispatch({ type: "SET_SCORE", payload: score });
  }

  function resetGame() {
    dispatch({ type: "RESET_GAME" });
  }

  function dismissLevelUp() {
    dispatch({ type: "DISMISS_LEVEL_UP" });
  }

  async function updateStreak() {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    if (profile?.last_active_date === today) return;
    const newStreak = (state.streak || 0) + 1;
    dispatch({ type: "UPDATE_STREAK", payload: newStreak });
    await supabase
      .from("profiles")
      .update({ streak_days: newStreak, last_active_date: today })
      .eq("id", user.id);
    // Award streak bonus XP
    addXp(XP_REWARDS.streakBonus);
  }

  const accuracy = state.totalAnswers > 0
    ? Math.round((state.correctAnswers / state.totalAnswers) * 100)
    : 0;

  return (
    <GameContext.Provider value={{
      ...state, accuracy,
      addXp, recordAnswer, addGamePlayed, setScore, resetGame,
      dismissLevelUp, updateStreak,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
