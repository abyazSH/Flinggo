import { supabase } from "../config/supabase";

// ---- Translation History ----

export async function saveTranslation({ userId, sourceLang, targetLang, inputText, llamaOutput, gemmaOutput, selectedModel }) {
  const { data, error } = await supabase.from("translation_history").insert({
    user_id: userId,
    source_lang: sourceLang,
    target_lang: targetLang,
    input_text: inputText,
    llama_output: llamaOutput || null,
    gemma_output: gemmaOutput || null,
    selected_model: selectedModel,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function getTranslationHistory(userId, limit = 50) {
  const { data, error } = await supabase
    .from("translation_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// ---- Quiz Attempts ----

export async function saveQuizAttempt({ userId, quizType, questionData, userAnswer, correctAnswer, isCorrect, xpEarned, timeSpentSec }) {
  const { data, error } = await supabase.from("quiz_attempts").insert({
    user_id: userId,
    quiz_type: quizType,
    question_data: questionData,
    user_answer: userAnswer,
    correct_answer: correctAnswer,
    is_correct: isCorrect,
    xp_earned: xpEarned,
    time_spent_sec: timeSpentSec,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function getQuizAttempts(userId, quizType = null, limit = 20) {
  let query = supabase
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (quizType) query = query.eq("quiz_type", quizType);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ---- User Progress ----

export async function getUserProgress(userId) {
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
}

export async function upsertUserProgress(userId, language, category, updates) {
  // First fetch existing progress to make additive updates
  const { data: existing, error: fetchErr } = await supabase
    .from("user_progress")
    .select("games_played, words_learned, score")
    .eq("user_id", userId)
    .eq("language", language)
    .eq("category", category)
    .maybeSingle();

  const prev = existing || { games_played: 0, words_learned: 0, score: 0 };

  const merged = {
    user_id: userId,
    language,
    category,
    games_played: (prev.games_played || 0) + (updates.games_played || 0),
    words_learned: (prev.words_learned || 0) + (updates.words_learned || 0),
    score: (prev.score || 0) + (updates.score || 0),
    level: updates.level || prev.level || 1,
    last_played_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("user_progress")
    .upsert(merged, { onConflict: "user_id,language,category" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---- Daily Challenges ----

export async function getDailyChallenge(date) {
  const { data, error } = await supabase
    .from("daily_challenges")
    .select("*")
    .eq("date", date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveDailyChallenge(challenge) {
  const { data, error } = await supabase
    .from("daily_challenges")
    .insert(challenge)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---- Leaderboard ----

export async function getLeaderboard(limit = 20) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, current_level, total_xp, streak_days")
    .order("total_xp", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// ---- Profile ----

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

// ---- Game Content (centralized table) ----

/**
 * Fetch game content from the centralized table.
 * @param {Object} params
 * @param {string} params.gameType - 'vocabulary' | 'sentence' | 'challenge'
 * @param {string} params.language - target language code (e.g. 'es', 'fr', 'id')
 * @param {string} [params.difficulty] - 'easy' | 'medium' | 'hard'
 * @param {string} [params.sourceLanguage] - source language code (default 'en')
 * @param {number} [params.limit] - max number of rows to return
 * @returns {Promise<Array>} matching game content rows
 */
export async function fetchGameContent({ gameType, language, difficulty, sourceLanguage, limit = 10 }) {
  let query = supabase
    .from("game_content")
    .select("*")
    .eq("game_type", gameType)
    .eq("language", language)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (difficulty) query = query.eq("difficulty", difficulty);
  if (sourceLanguage) query = query.eq("source_language", sourceLanguage);

  const { data, error } = await query;
  if (error) {
    // If the table doesn't exist yet (schema not run), return empty array
    console.warn("game_content query failed (table may not exist):", error.message);
    return [];
  }
  return data || [];
}

/**
 * Fetch a random subset of game content for variety.
 * Fetches more than needed, then shuffles client-side.
 */
export async function fetchRandomGameContent({ gameType, language, difficulty, sourceLanguage, count = 5 }) {
  const all = await fetchGameContent({ gameType, language, difficulty, sourceLanguage, limit: count * 3 });
  // Fisher-Yates shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, count);
}

/**
 * Fetch a single random challenge (for daily challenge mode).
 */
export async function fetchRandomChallenge({ language, difficulty, sourceLanguage }) {
  const items = await fetchRandomGameContent({
    gameType: "challenge",
    language,
    difficulty,
    sourceLanguage: sourceLanguage || "en",
    count: 1,
  });
  return items[0] || null;
}
