import { generateQuizWithLlama } from "./llamaService";
import { getLanguageName } from "../config/languages";
import { fetchRandomGameContent, fetchRandomChallenge } from "./supabaseService";

// =============================================================
// Centralized game content fetching with LLM fallback
// All three games call these functions. Priority:
//   1. Fetch from `game_content` Supabase table (DB seed data)
//   2. If empty → generate via LLM
//   3. If LLM fails → hardcoded fallback data
// =============================================================

/**
 * Generate vocabulary quiz questions.
 * Tries DB first, then LLM, then fallback.
 */
export async function generateVocabularyQuiz(targetLangCode, difficulty = "easy", count = 5) {
  // 1. Try fetching from centralized game_content table
  try {
    const dbItems = await fetchRandomGameContent({
      gameType: "vocabulary",
      language: targetLangCode,
      difficulty,
      count,
    });
    if (dbItems && dbItems.length > 0) {
      return dbItems.map((row, idx) => ({
        id: row.id || idx,
        word: row.prompt_text,
        options: row.options || [],
        correctIndex: row.correct_index ?? 0,
        explanation: row.explanation || "",
        xp_reward: row.xp_reward || 10,
        time_limit: row.time_limit_sec || 15,
      }));
    }
  } catch (err) {
    console.warn("DB fetch for vocabulary failed, trying LLM:", err.message);
  }

  // 2. Try LLM generation
  try {
    const targetLang = getLanguageName(targetLangCode);
    const prompt = `Generate ${count} vocabulary quiz questions for learning ${targetLang} at ${difficulty} difficulty level.
Each question should show a word/phrase in English and ask for its translation in ${targetLang}.
Return a JSON array with this exact structure:
[
  {
    "id": 1,
    "word": "Hello",
    "options": ["Hola", "Adios", "Gracias", "Por favor"],
    "correctIndex": 0,
    "explanation": "'Hola' is the standard greeting in Spanish"
  }
]
Return ONLY the JSON array, no other text.`;

    const raw = await generateQuizWithLlama(prompt);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("LLM generation for vocabulary failed:", err.message);
  }

  // 3. Hardcoded fallback
  return getFallbackQuiz(targetLangCode, difficulty);
}

/**
 * Generate sentence arrangement exercises.
 * Tries DB first, then LLM, then fallback.
 */
export async function generateSentenceExercise(targetLangCode, difficulty = "easy", count = 3) {
  // 1. Try DB
  try {
    const dbItems = await fetchRandomGameContent({
      gameType: "sentence",
      language: targetLangCode,
      difficulty,
      count,
    });
    if (dbItems && dbItems.length > 0) {
      return dbItems.map((row, idx) => ({
        id: row.id || idx,
        original_sentence: row.prompt_text,
        english_hint: row.english_hint || row.prompt_text,
        shuffled_words: row.shuffled_words || [],
        correct_order: row.correct_order || [],
        grammar_tip: row.grammar_tip || "",
        correct_answer: row.correct_answer || "",
        explanation: row.explanation || row.grammar_tip || "",
        xp_reward: row.xp_reward || 15,
        time_limit: row.time_limit_sec || 30,
      }));
    }
  } catch (err) {
    console.warn("DB fetch for sentences failed, trying LLM:", err.message);
  }

  // 2. Try LLM (using Gemma for variety)
  try {
    const targetLang = getLanguageName(targetLangCode);
    const prompt = `Generate ${count} sentence arrangement exercises for ${targetLang} at ${difficulty} difficulty.
Each exercise gives a correct sentence broken into shuffled word tokens. The user must arrange them in correct order.
Return a JSON array:
[
  {
    "id": 1,
    "original_sentence": "I want to eat rice",
    "english_hint": "I want to eat rice",
    "shuffled_words": ["nasi", "makan", "saya", "mau"],
    "correct_order": ["saya", "mau", "makan", "nasi"],
    "grammar_tip": "Subject + verb + object order in ${targetLang}"
  }
]
Return ONLY the JSON array.`;

    const raw = await generateQuizWithGemma(prompt);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("LLM generation for sentences failed:", err.message);
  }

  // 3. Fallback
  return getFallbackSentences(targetLangCode, difficulty);
}

/**
 * Generate a daily translation challenge.
 * Tries DB first, then LLM, then fallback.
 */
export async function generateDailyChallenge(sourceLangCode, targetLangCode, difficulty = "medium") {
  // 1. Try DB
  try {
    const dbItem = await fetchRandomChallenge({
      language: targetLangCode,
      difficulty,
      sourceLanguage: sourceLangCode,
    });
    if (dbItem) {
      return {
        id: dbItem.id,
        prompt_text: dbItem.prompt_text,
        english_hint: dbItem.english_hint || dbItem.prompt_text,
        correct_answer: dbItem.correct_answer,
        keywords: dbItem.keywords || [],
        explanation: dbItem.explanation || "",
        difficulty: dbItem.difficulty || difficulty,
        xp_reward: dbItem.xp_reward || 25,
        time_limit: dbItem.time_limit_sec || 60,
      };
    }
  } catch (err) {
    console.warn("DB fetch for challenge failed, trying LLM:", err.message);
  }

  // 2. Try LLM
  try {
    const sourceLang = getLanguageName(sourceLangCode);
    const targetLang = getLanguageName(targetLangCode);
    const prompt = `Generate a daily translation challenge from ${sourceLang} to ${targetLang} at ${difficulty} difficulty.
Return JSON:
{
  "prompt_text": "The text to translate",
  "english_hint": "What it means in English",
  "correct_answer": "The correct translation",
  "keywords": ["key", "words", "to", "check"],
  "explanation": "Why this is the correct translation",
  "difficulty": "${difficulty}"
}
Return ONLY the JSON object.`;

    const raw = await generateQuizWithLlama(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.prompt_text) return parsed;
    }
  } catch (err) {
    console.warn("LLM generation for challenge failed:", err.message);
  }

  // 3. Fallback
  return getFallbackChallenge(sourceLangCode, targetLangCode, difficulty);
}

// =============================================================
// HARDCODED FALLBACKS (used when DB + LLM both unavailable)
// =============================================================

function getFallbackQuiz(langCode, difficulty) {
  const quizzes = {
    es: [
      { id: 1, word: "Hello", options: ["Hola", "Adios", "Gracias", "Buenos"], correctIndex: 0, explanation: "'Hola' means Hello in Spanish" },
      { id: 2, word: "Thank you", options: ["Por favor", "Gracias", "De nada", "Lo siento"], correctIndex: 1, explanation: "'Gracias' means Thank you" },
      { id: 3, word: "Good morning", options: ["Buenas noches", "Buenas tardes", "Buenos dias", "Buenas"], correctIndex: 2, explanation: "'Buenos dias' = Good morning" },
      { id: 4, word: "Water", options: ["Leche", "Agua", "Jugo", "Cafe"], correctIndex: 1, explanation: "'Agua' means Water" },
      { id: 5, word: "Friend", options: ["Familia", "Casa", "Amigo", "Perro"], correctIndex: 2, explanation: "'Amigo' means Friend" },
    ],
    fr: [
      { id: 1, word: "Hello", options: ["Bonjour", "Merci", "Au revoir", "Salut"], correctIndex: 0, explanation: "'Bonjour' = Hello in French" },
      { id: 2, word: "Thank you", options: ["S'il vous plait", "Merci", "Pardon", "Oui"], correctIndex: 1, explanation: "'Merci' means Thank you" },
      { id: 3, word: "Water", options: ["Pain", "Eau", "Lait", "Vin"], correctIndex: 1, explanation: "'Eau' means Water" },
      { id: 4, word: "Good night", options: ["Bonsoir", "Bonne nuit", "Bonjour", "Salut"], correctIndex: 1, explanation: "'Bonne nuit' = Good night" },
      { id: 5, word: "Friend", options: ["Famille", "Ami", "Maison", "Chien"], correctIndex: 1, explanation: "'Ami' means Friend" },
    ],
    ms: [
      { id: 1, word: "Hello", options: ["Hello", "Terima kasih", "Selamat tinggal", "Selamat pagi"], correctIndex: 0, explanation: "Hello or 'Apa khabar' in Malay" },
      { id: 2, word: "Thank you", options: ["Sama-sama", "Terima kasih", "Maaf", "Tolong"], correctIndex: 1, explanation: "'Terima kasih' = Thank you" },
      { id: 3, word: "Water", options: ["Susu", "Air", "Jus", "Teh"], correctIndex: 1, explanation: "'Air' means Water" },
      { id: 4, word: "Eat", options: ["Minum", "Makan", "Tidur", "Jalan"], correctIndex: 1, explanation: "'Makan' means Eat" },
      { id: 5, word: "Friend", options: ["Keluarga", "Rumah", "Kawan", "Anjing"], correctIndex: 2, explanation: "'Kawan' means Friend" },
    ],
    id: [
      { id: 1, word: "Hello", options: ["Halo", "Terima kasih", "Selamat tinggal", "Selamat pagi"], correctIndex: 0, explanation: "'Halo' or 'Apa kabar' in Indonesian" },
      { id: 2, word: "Thank you", options: ["Sama-sama", "Terima kasih", "Maaf", "Tolong"], correctIndex: 1, explanation: "'Terima kasih' = Thank you" },
      { id: 3, word: "Water", options: ["Susu", "Air", "Jus", "Teh"], correctIndex: 1, explanation: "'Air' means Water" },
      { id: 4, word: "Eat", options: ["Minum", "Makan", "Tidur", "Jalan"], correctIndex: 1, explanation: "'Makan' means Eat" },
      { id: 5, word: "Friend", options: ["Keluarga", "Rumah", "Teman", "Kucing"], correctIndex: 2, explanation: "'Teman' means Friend" },
    ],
  };
  return quizzes[langCode] || quizzes.es;
}

function getFallbackSentences(langCode, difficulty) {
  const sentences = {
    id: [
      { id: 1, original_sentence: "saya suka makan nasi", english_hint: "I like to eat rice", shuffled_words: ["nasi", "makan", "saya", "suka"], correct_order: ["saya", "suka", "makan", "nasi"], grammar_tip: "Subject + verb + object in Indonesian" },
      { id: 2, original_sentence: "dia pergi ke sekolah", english_hint: "He goes to school", shuffled_words: ["sekolah", "ke", "dia", "pergi"], correct_order: ["dia", "pergi", "ke", "sekolah"], grammar_tip: "Subject + verb + preposition + place" },
      { id: 3, original_sentence: "kami belajar bahasa baru", english_hint: "We learn a new language", shuffled_words: ["bahasa", "baru", "kami", "belajar"], correct_order: ["kami", "belajar", "bahasa", "baru"], grammar_tip: "Subject + verb + noun + adjective" },
    ],
    ms: [
      { id: 1, original_sentence: "saya suka makan nasi", english_hint: "I like to eat rice", shuffled_words: ["nasi", "makan", "saya", "suka"], correct_order: ["saya", "suka", "makan", "nasi"], grammar_tip: "Subject + verb + object in Malay" },
      { id: 2, original_sentence: "dia pergi ke sekolah", english_hint: "He goes to school", shuffled_words: ["sekolah", "ke", "dia", "pergi"], correct_order: ["dia", "pergi", "ke", "sekolah"], grammar_tip: "Subject + verb + preposition + place" },
      { id: 3, original_sentence: "kami minum air sejuk", english_hint: "We drink cold water", shuffled_words: ["sejuk", "air", "kami", "minum"], correct_order: ["kami", "minum", "air", "sejuk"], grammar_tip: "Subject + verb + noun + adjective" },
    ],
    es: [
      { id: 1, original_sentence: "yo quiero comer arroz", english_hint: "I want to eat rice", shuffled_words: ["arroz", "comer", "yo", "quiero"], correct_order: ["yo", "quiero", "comer", "arroz"], grammar_tip: "Subject + verb + object in Spanish" },
      { id: 2, original_sentence: "ella va a la escuela", english_hint: "She goes to school", shuffled_words: ["escuela", "la", "ella", "a", "va"], correct_order: ["ella", "va", "a", "la", "escuela"], grammar_tip: "Subject + verb + preposition + article + noun" },
      { id: 3, original_sentence: "nosotros comemos pan", english_hint: "We eat bread", shuffled_words: ["pan", "nosotros", "comemos"], correct_order: ["nosotros", "comemos", "pan"], grammar_tip: "Subject + verb + object" },
    ],
    fr: [
      { id: 1, original_sentence: "je veux manger du riz", english_hint: "I want to eat some rice", shuffled_words: ["riz", "manger", "je", "du", "veux"], correct_order: ["je", "veux", "manger", "du", "riz"], grammar_tip: "Subject + verb + infinitive + article + noun" },
      { id: 2, original_sentence: "elle va à l école", english_hint: "She goes to school", shuffled_words: ["école", "à", "elle", "l", "va"], correct_order: ["elle", "va", "à", "l", "école"], grammar_tip: "Subject + verb + preposition + article + noun" },
      { id: 3, original_sentence: "nous mangeons du pain", english_hint: "We eat bread", shuffled_words: ["pain", "nous", "du", "mangeons"], correct_order: ["nous", "mangeons", "du", "pain"], grammar_tip: "Subject + verb + article + noun" },
    ],
  };
  return sentences[langCode] || sentences.id;
}

function getFallbackChallenge(sourceLangCode, targetLangCode, difficulty) {
  const challenges = {
    es: { prompt_text: "Good morning, how are you today?", english_hint: "Good morning, how are you today?", correct_answer: "Buenos días, ¿cómo estás?", keywords: ["buenos", "días", "como", "estas"], explanation: "A common morning greeting in Spanish", difficulty },
    fr: { prompt_text: "Good evening, nice to meet you", english_hint: "Good evening, nice to meet you", correct_answer: "Bonsoir, enchanté", keywords: ["bonsoir", "enchanté"], explanation: "Standard evening greeting and introduction in French", difficulty },
    id: { prompt_text: "Good morning, how are you?", english_hint: "Good morning, how are you?", correct_answer: "Selamat pagi, apa kabar?", keywords: ["selamat", "pagi", "apa", "kabar"], explanation: "Common morning greeting in Indonesian", difficulty },
    ms: { prompt_text: "Good morning, how are you?", english_hint: "Good morning, how are you?", correct_answer: "Selamat pagi, apa khabar?", keywords: ["selamat", "pagi", "apa", "khabar"], explanation: "Common morning greeting in Malay", difficulty },
  };
  return challenges[targetLangCode] || challenges.es;
}
