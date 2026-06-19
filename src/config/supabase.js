import { createClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate URL before creating client to prevent crash on invalid .env
const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const FALLBACK_URL = "https://placeholder.supabase.co";
const FALLBACK_KEY = "placeholder-key";

const supabaseUrl = (rawUrl && isValidUrl(rawUrl)) ? rawUrl : FALLBACK_URL;
const supabaseAnonKey = (rawKey && rawKey !== "your_supabase_anon_key") ? rawKey : FALLBACK_KEY;

export const isSupabaseConfigured = supabaseUrl !== FALLBACK_URL && supabaseAnonKey !== FALLBACK_KEY;

if (!isSupabaseConfigured) {
  console.warn(
    "[Supabase] Not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file. " +
    "The app will render but auth and database features will not work."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
