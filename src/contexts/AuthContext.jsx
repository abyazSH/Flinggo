import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../config/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch or auto-create profile. Accepts email to avoid stale React state.
  const fetchProfile = useCallback(async (userId, email) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // 1. Try to read existing profile
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!error && data) {
        console.log("[Auth] Profile found:", data.username);
        setProfile(data);
        setLoading(false);
        return;
      }

      // 2. Profile doesn't exist — auto-create it
      console.log("[Auth] No profile found, auto-creating for:", userId);
      const username = (email || "").split("@")[0] || "learner";

      const { data: newProfile, error: insertErr } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          username,
          display_name: username,
          current_level: 1,
          total_xp: 0,
          streak_days: 0,
        }, { onConflict: "id" })
        .select()
        .single();

      if (insertErr) {
        console.error("[Auth] Profile auto-create FAILED:", insertErr.message);
        console.error("[Auth] Full error:", insertErr);
        console.error("[Auth] Make sure you ran this SQL in Supabase:");
        console.error('  CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);');
      } else if (newProfile) {
        console.log("[Auth] Profile auto-created:", newProfile.username);
        setProfile(newProfile);
      }
    } catch (err) {
      console.error("[Auth] fetchProfile exception:", err);
    }
    setLoading(false);
  }, []);

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
        if (session?.user) {
          fetchProfile(session.user.id, session.user.email);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("[Auth] Failed to get session:", err);
        setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("[Auth] State change:", _event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  async function signUp({ email, password, username }) {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured. Please set up your .env file.");

    // 1. Create auth user
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (!data.user) {
      // If email confirmation is ON, user is created but not confirmed
      throw new Error("Account created but email confirmation may be required. Check your email or disable email confirmation in Supabase Dashboard → Authentication → Email → turn off 'Confirm email'.");
    }

    // 2. Small delay to ensure auth.users row is fully committed
    await new Promise((r) => setTimeout(r, 500));

    // 3. Create profile — THROW on failure so the user sees the error
    const { error: profileErr } = await supabase.from("profiles").upsert({
      id: data.user.id,
      username: username || email.split("@")[0],
      display_name: username || email.split("@")[0],
      current_level: 1,
      total_xp: 0,
      streak_days: 0,
    }, { onConflict: "id" });

    if (profileErr) {
      console.error("[Auth] Profile creation failed:", profileErr);
      throw new Error(
        `Account created but profile table insert failed: ${profileErr.message}. ` +
        `Make sure you ran the SQL schema AND the INSERT policy: ` +
        `CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);`
      );
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

  async function refreshProfile() {
    if (user) await fetchProfile(user.id, user.email);
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
