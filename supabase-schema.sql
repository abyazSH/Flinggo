-- Supabase Schema for Flinggo Translation Learning Platform
-- Run this SQL in the Supabase SQL Editor to create all required tables.

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  current_level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Translation History
CREATE TABLE IF NOT EXISTS translation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  source_lang TEXT NOT NULL,
  target_lang TEXT NOT NULL,
  input_text TEXT NOT NULL,
  llama_output TEXT,
  gemma_output TEXT,
  selected_model TEXT NOT NULL DEFAULT 'llama',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE translation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own translations"
  ON translation_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own translations"
  ON translation_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Quiz Attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('vocabulary', 'sentence', 'challenge')),
  question_data JSONB,
  user_answer TEXT,
  correct_answer TEXT,
  is_correct BOOLEAN DEFAULT FALSE,
  xp_earned INTEGER DEFAULT 0,
  time_spent_sec INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz attempts"
  ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts"
  ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. User Progress (per language/category)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  score INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  words_learned INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  UNIQUE(user_id, language, category)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own progress"
  ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- 5. Daily Challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  challenge_type TEXT NOT NULL DEFAULT 'translation',
  source_lang TEXT NOT NULL,
  target_lang TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, difficulty)
);

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily challenges"
  ON daily_challenges FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX idx_translation_history_user ON translation_history(user_id, created_at DESC);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id, created_at DESC);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_daily_challenges_date ON daily_challenges(date);
CREATE INDEX idx_profiles_xp ON profiles(total_xp DESC);

-- 6. Game Content (centralized table for all game types)
-- Stores vocabulary questions, sentence exercises, and daily challenges
-- All three games query this single table for content.
CREATE TABLE IF NOT EXISTS game_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type TEXT NOT NULL CHECK (game_type IN ('vocabulary', 'sentence', 'challenge')),
  language TEXT NOT NULL,                    -- target language code: en, es, fr, ms, id
  source_language TEXT DEFAULT 'en',         -- source language code
  difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  
  -- Common fields
  prompt_text TEXT NOT NULL,                 -- the word/phrase/sentence shown to the user
  english_hint TEXT,                         -- English translation hint
  correct_answer TEXT NOT NULL,              -- the correct answer
  explanation TEXT,                          -- shown after answering
  
  -- Vocabulary quiz fields
  options JSONB,                             -- array of 4 options e.g. ["Hola","Adios","Gracias","Buenos"]
  correct_index INTEGER,                     -- index of correct answer in options array (0-3)
  
  -- Sentence arrangement fields
  shuffled_words JSONB,                      -- shuffled word tokens e.g. ["nasi","makan","saya","suka"]
  correct_order JSONB,                       -- correct word order e.g. ["saya","suka","makan","nasi"]
  grammar_tip TEXT,                          -- grammar explanation
  
  -- Daily challenge fields
  keywords JSONB,                            -- keywords to check in free-text answers
  
  -- Metadata
  xp_reward INTEGER DEFAULT 10,             -- XP awarded for correct answer
  time_limit_sec INTEGER DEFAULT 15,        -- suggested time limit in seconds
  is_active BOOLEAN DEFAULT TRUE,            -- soft-delete / toggle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE game_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active game content"
  ON game_content FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can insert game content"
  ON game_content FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update game content"
  ON game_content FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Indexes for fast game content queries
CREATE INDEX idx_game_content_type_lang_diff ON game_content(game_type, language, difficulty) WHERE is_active = true;
CREATE INDEX idx_game_content_type_diff ON game_content(game_type, difficulty) WHERE is_active = true;

-- ============================================================
-- SEED DATA: Pre-populated game content for all game types
-- ============================================================

-- VOCABULARY QUIZ: Spanish (easy)
INSERT INTO game_content (game_type, language, difficulty, prompt_text, correct_answer, options, correct_index, explanation, xp_reward, time_limit_sec) VALUES
('vocabulary', 'es', 'easy', 'Hello', 'Hola', '["Hola","Adiós","Gracias","Buenos días"]', 0, '''Hola'' is the standard greeting in Spanish', 10, 15),
('vocabulary', 'es', 'easy', 'Thank you', 'Gracias', '["Por favor","Gracias","De nada","Lo siento"]', 1, '''Gracias'' means Thank you in Spanish', 10, 15),
('vocabulary', 'es', 'easy', 'Good morning', 'Buenos días', '["Buenas noches","Buenas tardes","Buenos días","Buenas"]', 2, '''Buenos días'' literally means "good days" and is used for good morning', 10, 15),
('vocabulary', 'es', 'easy', 'Water', 'Agua', '["Leche","Agua","Jugo","Café"]', 1, '''Agua'' means water in Spanish', 10, 15),
('vocabulary', 'es', 'easy', 'Friend', 'Amigo', '["Familia","Casa","Amigo","Perro"]', 2, '''Amigo'' (male) or ''Amiga'' (female) means friend', 10, 15),
('vocabulary', 'es', 'easy', 'Cat', 'Gato', '["Perro","Gato","Pájaro","Pez"]', 1, '''Gato'' means cat in Spanish', 10, 15),
('vocabulary', 'es', 'easy', 'House', 'Casa', '["Casa","Carro","Calle","Ciudad"]', 0, '''Casa'' means house/home in Spanish', 10, 15),
('vocabulary', 'es', 'easy', 'Book', 'Libro', '["Libro","Mesa","Silla","Puerta"]', 0, '''Libro'' means book in Spanish', 10, 15);

-- VOCABULARY QUIZ: Spanish (medium)
INSERT INTO game_content (game_type, language, difficulty, prompt_text, correct_answer, options, correct_index, explanation, xp_reward, time_limit_sec) VALUES
('vocabulary', 'es', 'medium', 'Beautiful', 'Hermoso', '["Hermoso","Feo","Grande","Pequeño"]', 0, '''Hermoso/a'' means beautiful in Spanish', 10, 12),
('vocabulary', 'es', 'medium', 'To run', 'Correr', '["Caminar","Correr","Saltar","Nadar"]', 1, '''Correr'' is the verb for "to run"', 10, 12),
('vocabulary', 'es', 'medium', 'Yesterday', 'Ayer', '["Hoy","Ayer","Mañana","Siempre"]', 1, '''Ayer'' means yesterday in Spanish', 10, 12),
('vocabulary', 'es', 'medium', 'Kitchen', 'Cocina', '["Dormitorio","Cocina","Baño","Jardín"]', 1, '''Cocina'' means kitchen (also means cuisine)', 10, 12),
('vocabulary', 'es', 'medium', 'To understand', 'Entender', '["Entender","Olvidar","Recordar","Creer"]', 0, '''Entender'' or ''Comprender'' means to understand', 10, 12);

-- VOCABULARY QUIZ: French (easy)
INSERT INTO game_content (game_type, language, difficulty, prompt_text, correct_answer, options, correct_index, explanation, xp_reward, time_limit_sec) VALUES
('vocabulary', 'fr', 'easy', 'Hello', 'Bonjour', '["Bonjour","Merci","Au revoir","Salut"]', 0, '''Bonjour'' literally means "good day" and is the standard greeting', 10, 15),
('vocabulary', 'fr', 'easy', 'Thank you', 'Merci', '["S''il vous plaît","Merci","Pardon","Oui"]', 1, '''Merci'' means thank you in French', 10, 15),
('vocabulary', 'fr', 'easy', 'Water', 'Eau', '["Pain","Eau","Lait","Vin"]', 1, '''Eau'' (pronounced "oh") means water in French', 10, 15),
('vocabulary', 'fr', 'easy', 'Good night', 'Bonne nuit', '["Bonsoir","Bonne nuit","Bonjour","Salut"]', 1, '''Bonne nuit'' is said when going to bed', 10, 15),
('vocabulary', 'fr', 'easy', 'Friend', 'Ami', '["Famille","Ami","Maison","Chien"]', 1, '''Ami'' (male) or ''Amie'' (female) means friend', 10, 15),
('vocabulary', 'fr', 'easy', 'Cat', 'Chat', '["Chien","Chat","Oiseau","Poisson"]', 1, '''Chat'' (pronounced "shah") means cat', 10, 15),
('vocabulary', 'fr', 'easy', 'House', 'Maison', '["Maison","Voiture","Rue","Ville"]', 0, '''Maison'' means house in French', 10, 15),
('vocabulary', 'fr', 'easy', 'Book', 'Livre', '["Livre","Table","Chaise","Porte"]', 0, '''Livre'' means book in French', 10, 15);

-- VOCABULARY QUIZ: Malay (easy)
INSERT INTO game_content (game_type, language, difficulty, prompt_text, correct_answer, options, correct_index, explanation, xp_reward, time_limit_sec) VALUES
('vocabulary', 'ms', 'easy', 'Hello', 'Hello', '["Hello","Terima kasih","Selamat tinggal","Selamat pagi"]', 0, 'In Malay, "Hello" is commonly used, or "Apa khabar" (how are you)', 10, 15),
('vocabulary', 'ms', 'easy', 'Thank you', 'Terima kasih', '["Sama-sama","Terima kasih","Maaf","Tolong"]', 1, '''Terima kasih'' literally means "receive love"', 10, 15),
('vocabulary', 'ms', 'easy', 'Water', 'Air', '["Susu","Air","Jus","Teh"]', 1, '''Air'' means water in Malay', 10, 15),
('vocabulary', 'ms', 'easy', 'Friend', 'Kawan', '["Keluarga","Rumah","Kawan","Anjing"]', 2, '''Kawan'' or ''Teman'' means friend in Malay', 10, 15),
('vocabulary', 'ms', 'easy', 'Eat', 'Makan', '["Minum","Makan","Tidur","Jalan"]', 1, '''Makan'' means to eat in Malay', 10, 15),
('vocabulary', 'ms', 'easy', 'House', 'Rumah', '["Rumah","Kereta","Jalan","Bandar"]', 0, '''Rumah'' means house in Malay', 10, 15);

-- VOCABULARY QUIZ: Indonesian (easy)
INSERT INTO game_content (game_type, language, difficulty, prompt_text, correct_answer, options, correct_index, explanation, xp_reward, time_limit_sec) VALUES
('vocabulary', 'id', 'easy', 'Hello', 'Halo', '["Halo","Terima kasih","Selamat tinggal","Selamat pagi"]', 0, '''Halo'' or ''Apa kabar'' are common greetings', 10, 15),
('vocabulary', 'id', 'easy', 'Thank you', 'Terima kasih', '["Sama-sama","Terima kasih","Maaf","Tolong"]', 1, '''Terima kasih'' means thank you. Reply: ''Sama-sama''', 10, 15),
('vocabulary', 'id', 'easy', 'Water', 'Air', '["Susu","Air","Jus","Teh"]', 1, '''Air'' (pronounced "ah-eer") means water', 10, 15),
('vocabulary', 'id', 'easy', 'Friend', 'Teman', '["Keluarga","Rumah","Teman","Kucing"]', 2, '''Teman'' or ''Sahabat'' means friend', 10, 15),
('vocabulary', 'id', 'easy', 'Eat', 'Makan', '["Minum","Makan","Tidur","Jalan"]', 1, '''Makan'' means to eat in Indonesian', 10, 15),
('vocabulary', 'id', 'easy', 'Beautiful', 'Cantik', '["Cantik","Jelek","Besar","Kecil"]', 0, '''Cantik'' means beautiful (for women/objects), ''Tampan'' for men', 10, 15);

-- SENTENCE ARRANGEMENT: Indonesian
INSERT INTO game_content (game_type, language, difficulty, prompt_text, english_hint, correct_answer, shuffled_words, correct_order, grammar_tip, xp_reward, time_limit_sec) VALUES
('sentence', 'id', 'easy', 'saya suka makan nasi', 'I like to eat rice', 'saya suka makan nasi', '["nasi","makan","saya","suka"]', '["saya","suka","makan","nasi"]', 'Indonesian follows Subject + Verb + Object order', 15, 30),
('sentence', 'id', 'easy', 'dia pergi ke sekolah', 'He/She goes to school', 'dia pergi ke sekolah', '["sekolah","ke","dia","pergi"]', '["dia","pergi","ke","sekolah"]', 'Subject + Verb + Preposition + Place', 15, 30),
('sentence', 'id', 'easy', 'kami belajar bahasa baru', 'We learn a new language', 'kami belajar bahasa baru', '["bahasa","baru","kami","belajar"]', '["kami","belajar","bahasa","baru"]', 'Subject + Verb + Noun + Adjective', 15, 30),
('sentence', 'id', 'easy', 'ibu memasak di dapur', 'Mother cooks in the kitchen', 'ibu memasak di dapur', '["dapur","di","ibu","memasak"]', '["ibu","memasak","di","dapur"]', 'Subject + Verb + Preposition + Place', 15, 30),
('sentence', 'id', 'medium', 'mereka sudah bermain sepak bola di lapangan', 'They have already played football at the field', 'mereka sudah bermain sepak bola di lapangan', '["lapangan","sepak bola","sudah","mereka","di","bermain"]', '["mereka","sudah","bermain","sepak bola","di","lapangan"]', 'Subject + Adverb + Verb + Object + Preposition + Place', 15, 45),
('sentence', 'id', 'medium', 'saya ingin membeli buku baru di toko', 'I want to buy a new book at the store', 'saya ingin membeli buku baru di toko', '["toko","buku","ingin","saya","baru","di","membeli"]', '["saya","ingin","membeli","buku","baru","di","toko"]', 'Subject + Modal + Verb + Noun + Adjective + Preposition + Place', 15, 45);

-- SENTENCE ARRANGEMENT: Spanish
INSERT INTO game_content (game_type, language, difficulty, prompt_text, english_hint, correct_answer, shuffled_words, correct_order, grammar_tip, xp_reward, time_limit_sec) VALUES
('sentence', 'es', 'easy', 'yo quiero comer arroz', 'I want to eat rice', 'yo quiero comer arroz', '["arroz","comer","yo","quiero"]', '["yo","quiero","comer","arroz"]', 'Spanish follows Subject + Verb + Object order', 15, 30),
('sentence', 'es', 'easy', 'ella va a la escuela', 'She goes to the school', 'ella va a la escuela', '["escuela","la","ella","a","va"]', '["ella","va","a","la","escuela"]', 'Subject + Verb + Preposition + Article + Noun', 15, 30),
('sentence', 'es', 'easy', 'nosotros comemos pan', 'We eat bread', 'nosotros comemos pan', '["pan","nosotros","comemos"]', '["nosotros","comemos","pan"]', 'Subject + Verb + Object', 15, 30),
('sentence', 'es', 'medium', 'ellos han jugado futbol en el parque', 'They have played football in the park', 'ellos han jugado futbol en el parque', '["parque","futbol","han","ellos","el","en","jugado"]', '["ellos","han","jugado","futbol","en","el","parque"]', 'Subject + Auxiliary + Past Participle + Object + Prep + Article + Noun', 15, 45);

-- SENTENCE ARRANGEMENT: French
INSERT INTO game_content (game_type, language, difficulty, prompt_text, english_hint, correct_answer, shuffled_words, correct_order, grammar_tip, xp_reward, time_limit_sec) VALUES
('sentence', 'fr', 'easy', 'je veux manger du riz', 'I want to eat some rice', 'je veux manger du riz', '["riz","manger","je","du","veux"]', '["je","veux","manger","du","riz"]', 'French: Subject + Verb + Infinitive + Article + Noun', 15, 30),
('sentence', 'fr', 'easy', 'elle va à l école', 'She goes to school', 'elle va à l école', '["école","à","elle","l","va"]', '["elle","va","à","l","école"]', 'Subject + Verb + Preposition + Article + Noun', 15, 30),
('sentence', 'fr', 'medium', 'nous avons mangé du pain ce matin', 'We ate bread this morning', 'nous avons mangé du pain ce matin', '["matin","pain","avons","nous","ce","du","mangé"]', '["nous","avons","mangé","du","pain","ce","matin"]', 'Subject + Auxiliary + Past Participle + Article + Noun + Time expression', 15, 45);

-- SENTENCE ARRANGEMENT: Malay
INSERT INTO game_content (game_type, language, difficulty, prompt_text, english_hint, correct_answer, shuffled_words, correct_order, grammar_tip, xp_reward, time_limit_sec) VALUES
('sentence', 'ms', 'easy', 'saya suka makan nasi', 'I like to eat rice', 'saya suka makan nasi', '["nasi","makan","saya","suka"]', '["saya","suka","makan","nasi"]', 'Malay follows Subject + Verb + Object order', 15, 30),
('sentence', 'ms', 'easy', 'dia pergi ke sekolah', 'He goes to school', 'dia pergi ke sekolah', '["sekolah","ke","dia","pergi"]', '["dia","pergi","ke","sekolah"]', 'Subject + Verb + Preposition + Place', 15, 30),
('sentence', 'ms', 'easy', 'kami minum air sejuk', 'We drink cold water', 'kami minum air sejuk', '["sejuk","air","kami","minum"]', '["kami","minum","air","sejuk"]', 'Subject + Verb + Noun + Adjective (adjective follows noun)', 15, 30);

-- DAILY CHALLENGES: English → Spanish
INSERT INTO game_content (game_type, language, source_language, difficulty, prompt_text, english_hint, correct_answer, keywords, explanation, xp_reward, time_limit_sec) VALUES
('challenge', 'es', 'en', 'easy', 'Good morning, how are you?', 'Good morning, how are you?', 'Buenos días, ¿cómo estás?', '["buenos","días","como","estas"]', 'Standard morning greeting in Spanish', 25, 60),
('challenge', 'es', 'en', 'easy', 'I like to eat pizza', 'I like to eat pizza', 'Me gusta comer pizza', '["gusta","comer","pizza"]', '"Me gusta" = "I like" in Spanish', 25, 60),
('challenge', 'es', 'en', 'medium', 'Where is the nearest hospital?', 'Where is the nearest hospital?', '¿Dónde está el hospital más cercano?', '["donde","esta","hospital","cercano"]', 'Uses interrogative "dónde" and superlative "más cercano"', 25, 90),
('challenge', 'es', 'en', 'medium', 'I would like a glass of water please', 'I would like a glass of water please', 'Me gustaría un vaso de agua por favor', '["gustaria","vaso","agua","favor"]', 'Polite request using conditional "gustaría"', 25, 90),
('challenge', 'es', 'en', 'hard', 'If I had known, I would have come earlier', 'If I had known, I would have come earlier', 'Si hubiera sabido, habría venido más temprano', '["hubiera","sabido","habria","venido","temprano"]', 'Uses past subjunctive "hubiera" and conditional perfect "habría venido"', 25, 120);

-- DAILY CHALLENGES: English → French
INSERT INTO game_content (game_type, language, source_language, difficulty, prompt_text, english_hint, correct_answer, keywords, explanation, xp_reward, time_limit_sec) VALUES
('challenge', 'fr', 'en', 'easy', 'Good evening, nice to meet you', 'Good evening, nice to meet you', 'Bonsoir, enchanté', '["bonsoir","enchanté"]', '"Bonsoir" = good evening, "enchanté" = nice to meet you', 25, 60),
('challenge', 'fr', 'en', 'easy', 'I love reading books', 'I love reading books', 'J''adore lire des livres', '["adore","lire","livres"]', '"J''adore" = I love, "lire" = to read', 25, 60),
('challenge', 'fr', 'en', 'medium', 'Could you tell me where the station is?', 'Could you tell me where the station is?', 'Pourriez-vous me dire où est la gare?', '["pourriez","dire","où","gare"]', 'Polite question with "pourriez-vous" (could you)', 25, 90),
('challenge', 'fr', 'en', 'hard', 'Although it was raining, we decided to go out', 'Although it was raining, we decided to go out', 'Bien qu''il pleuvait, nous avons décidé de sortir', '["bien","qu","pleuvait","avons","décidé","sortir"]', 'Uses "bien que" (although) with subjunctive mood', 25, 120);

-- DAILY CHALLENGES: English → Indonesian
INSERT INTO game_content (game_type, language, source_language, difficulty, prompt_text, english_hint, correct_answer, keywords, explanation, xp_reward, time_limit_sec) VALUES
('challenge', 'id', 'en', 'easy', 'Good morning, how are you?', 'Good morning, how are you?', 'Selamat pagi, apa kabar?', '["selamat","pagi","apa","kabar"]', '"Selamat pagi" = good morning, "apa kabar" = how are you', 25, 60),
('challenge', 'id', 'en', 'easy', 'I want to go to the market', 'I want to go to the market', 'Saya mau pergi ke pasar', '["saya","mau","pergi","pasar"]', '"Saya mau" = I want, "pergi ke" = go to', 25, 60),
('challenge', 'id', 'en', 'medium', 'Can you help me find the nearest restaurant?', 'Can you help me find the nearest restaurant?', 'Bisakah kamu membantu saya menemukan restoran terdekat?', '["bisakah","membantu","menemukan","restoran","terdekat"]', '"Bisakah" = can you, "terdekat" = nearest', 25, 90),
('challenge', 'id', 'en', 'hard', 'If I had more time, I would learn three languages at once', 'If I had more time, I would learn three languages at once', 'Jika saya punya lebih banyak waktu, saya akan belajar tiga bahasa sekaligus', '["jika","punya","waktu","akan","belajar","bahasa","sekaligus"]', 'Conditional sentence: "Jika...akan" = "If...would"', 25, 120);

-- DAILY CHALLENGES: English → Malay
INSERT INTO game_content (game_type, language, source_language, difficulty, prompt_text, english_hint, correct_answer, keywords, explanation, xp_reward, time_limit_sec) VALUES
('challenge', 'ms', 'en', 'easy', 'Good morning, how are you?', 'Good morning, how are you?', 'Selamat pagi, apa khabar?', '["selamat","pagi","apa","khabar"]', '"Selamat pagi" = good morning, "apa khabar" = how are you', 25, 60),
('challenge', 'ms', 'en', 'easy', 'I want to eat fried rice', 'I want to eat fried rice', 'Saya mahu makan nasi goreng', '["saya","mahu","makan","nasi","goreng"]', '"Saya mahu" = I want, "nasi goreng" = fried rice', 25, 60),
('challenge', 'ms', 'en', 'medium', 'The weather is very hot today', 'The weather is very hot today', 'Cuaca sangat panas hari ini', '["cuaca","sangat","panas","hari","ini"]', '"Sangat" = very, "panas" = hot, "cuaca" = weather', 25, 90);
