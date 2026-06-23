export const LANGUAGES = [
  { code: "en", name: "English",    flag: "\u{1F1EC}\u{1F1E7}" },
  { code: "ms", name: "Malay",      flag: "\u{1F1F2}\u{1F1FE}" },
  { code: "id", name: "Indonesian", flag: "\u{1F1EE}\u{1F1E9}" },
];

export const getLanguageByCode = (code) =>
  LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];

export const getLanguageName = (code) => getLanguageByCode(code).name;

export const DIFFICULTY_LEVELS = [
  { id: "easy",   label: "Easy",   color: "badge-success" },
  { id: "medium", label: "Medium", color: "badge-warning" },
  { id: "hard",   label: "Hard",   color: "badge-error"   },
];

export const XP_REWARDS = {
  quizCorrect:    10,
  sentenceCorrect: 15,
  dailyChallenge:  25,
  streakBonus:     5,
};

export const LEVEL_XP = 500; // XP needed per level

export const calcLevel = (xp) => Math.floor(xp / LEVEL_XP) + 1;
