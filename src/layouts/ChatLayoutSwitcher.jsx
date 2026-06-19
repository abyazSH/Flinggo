import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

/**
 * Auth-aware layout switcher for the /chat route.
 *
 * - Authenticated users → full AppLayout (sidebar + topbar + Outlet)
 * - Guest users         → GuestChatLayout (hero header + CTA bar + Outlet)
 *
 * This ensures logged-in users navigating to /chat see the rich
 * authenticated experience instead of the guest-oriented interface.
 */
export default function ChatLayoutSwitcher() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return user ? <AuthenticatedChatLayout /> : <GuestChatLayout />;
}

/* ─── Authenticated: sidebar + topbar (same as AppLayout) ─── */
function AuthenticatedChatLayout() {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("flingo-theme") === "dark"
  );

  useEffect(() => {
    localStorage.setItem("flingo-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const theme = isDark ? "flingo-dark" : "flingo";

  return (
    <div data-theme={theme} className="flex h-screen overflow-hidden bg-base-200 transition-colors duration-300">
      <Sidebar isDark={isDark} setIsDark={setIsDark} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Translation Chat" subtitle="Chat and translate with AI" isDark={isDark} setIsDark={setIsDark} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ─── Guest: hero header + feature strip + CTA bar ─── */
function GuestChatLayout() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("flingo-theme") === "dark"
  );

  useEffect(() => {
    localStorage.setItem("flingo-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const theme = isDark ? "flingo-dark" : "flingo";

  return (
    <div data-theme={theme} className="flex flex-col h-screen bg-base-200 transition-colors duration-300">
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center justify-between px-6 py-3 bg-base-100/80 backdrop-blur-md border-b border-base-300 sticky top-0 z-20"
      >
        <div className="flex items-center gap-3">
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-secondary" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Flinggo</span>
          <span className="badge badge-primary badge-sm animate-pulse">Guest</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="swap swap-rotate cursor-pointer">
            <input type="checkbox" checked={isDark} onChange={() => setIsDark(!isDark)} />
            <span className="swap-on text-lg">☀️</span>
            <span className="swap-off text-lg">🌙</span>
          </label>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-ghost btn-sm text-sm" onClick={() => navigate("/login")}>Sign in</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-primary btn-sm text-sm shadow-lg shadow-primary/25" onClick={() => navigate("/register")}>Sign up free</motion.button>
        </div>
      </motion.header>

      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-b border-base-300">
          <div className="flex items-center justify-center gap-6 py-2 px-4 text-xs text-base-content/60 flex-wrap">
            <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex items-center gap-1"><span className="text-primary font-bold">🤖</span> Dual AI Translation</motion.span>
            <span className="text-base-content/20">|</span>
            <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="flex items-center gap-1"><span>🌍</span> 5 Languages</motion.span>
            <span className="text-base-content/20">|</span>
            <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="flex items-center gap-1"><span>🎮</span> 3 Learning Games</motion.span>
            <span className="text-base-content/20">|</span>
            <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="flex items-center gap-1"><span>🏆</span> Gamified Progress</motion.span>
          </div>
        </motion.div>

        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>

      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1, duration: 0.5 }} className="bg-base-100 border-t border-base-300 px-6 py-2.5 flex items-center justify-between">
        <p className="text-xs text-base-content/50">Try <span className="font-semibold text-primary">5 free translations</span> — then unlock unlimited access</p>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-primary btn-xs" onClick={() => navigate("/register")}>Get started free</motion.button>
      </motion.div>
    </div>
  );
}
