import { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../config/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.warn("[Auth] Supabase not configured. Auth features disabled.");
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
        else setLoading(false);
      })
      .catch((err) => {
        console.error("[Auth] Failed to get session:", err);
        setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (!error && data) setProfile(data);
    } catch (err) {
      console.error("[Auth] Failed to fetch profile:", err);
    }
    setLoading(false);
  }

  async function signUp({ email, password, username }) {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured. Please set up your .env file.");
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        username: username || email.split("@")[0],
        display_name: username || email.split("@")[0],
        current_level: 1,
        total_xp: 0,
        streak_days: 0,
      });
    }
    return data;
  }

  async function signIn({ email, password }) {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured. Please set up your .env file.");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function resetPassword(email) {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured. Please set up your .env file.");
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  async function updateProfile(updates) {
    if (!user || !isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();
    if (!error && data) setProfile(data);
    return data;
  }

  // Exposed so pages can pull a fresh profile after game activity
  async function refreshProfile() {
    if (user) await fetchProfile(user.id);
  }

  return (
    <AuthContext.Provider value={{
      user, session, profile, loading,
      signUp, signIn, signOut, resetPassword, updateProfile, fetchProfile, refreshProfile,
      isConfigured: isSupabaseConfigured,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
