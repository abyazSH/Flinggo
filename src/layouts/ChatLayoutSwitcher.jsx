import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

/**
 * Pengalih tata letak (layout switcher) pintar untuk rute /chat.
 * - Pengguna Terautentikasi (Logged-in) -> AuthenticatedChatLayout (Sidebar + Topbar)
 * - Pengguna Tamu (Guest)              -> GuestChatLayout (Landing Strip + Call to Action)
 */
export default function ChatLayoutSwitcher() {
  const { user, loading } = useAuth();

  // Layar pemuatan (loading state) yang bersih saat memeriksa token autentikasi
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200/40">
        <span className="loading loading-spinner loading-md text-primary" />
      </div>
    );
  }

  return user ? <AuthenticatedChatLayout /> : <GuestChatLayout />;
}

/* ──────────────────────────────────────────────────────────────────────
   1. AUTHENTICATED LAYOUT (Pengguna Terdaftar)
   ────────────────────────────────────────────────────────────────────── */
function AuthenticatedChatLayout() {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("flingo-theme") === "dark"
  );

  useEffect(() => {
    const currentTheme = isDark ? "flingo-dark" : "flingo";
    localStorage.setItem("flingo-theme", isDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, [isDark]);

  const theme = isDark ? "flingo-dark" : "flingo";

  return (
    <div data-theme={theme} className="flex h-screen overflow-hidden bg-base-200/50 transition-colors duration-300">
      <Sidebar isDark={isDark} setIsDark={setIsDark} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Subtitle disesuaikan khusus untuk mesin Llama 3 */}
        <Topbar 
          title="Translation Chat" 
          subtitle="Chat and translate with Llama 3 AI" 
          isDark={isDark} 
          setIsDark={setIsDark} 
        />
        <main className="flex-1 overflow-y-auto scrollbar-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   2. GUEST LAYOUT (Pengguna Tamu / Belum Login)
   ────────────────────────────────────────────────────────────────────── */
function GuestChatLayout() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("flingo-theme") === "dark"
  );

  useEffect(() => {
    const currentTheme = isDark ? "flingo-dark" : "flingo";
    localStorage.setItem("flingo-theme", isDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, [isDark]);

  const theme = isDark ? "flingo-dark" : "flingo";

  return (
    <div data-theme={theme} className="flex flex-col h-screen bg-base-200/40 transition-colors duration-300 select-none">
      {/* Header Bar untuk Tamu */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center justify-between px-6 h-16 bg-base-100/70 backdrop-blur-md border-b border-base-200/60 sticky top-0 z-20 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <motion.div 
            animate={{ rotate: [0, 360] }} 
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }} 
            className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-secondary shadow-sm shadow-primary/30" 
          />
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Flinggo</span>
          <span className="badge bg-primary/10 border border-primary/20 text-primary font-bold tracking-wider text-[10px] px-2 py-0.5 uppercase rounded-md animate-pulse">Guest</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Theme Selector */}
          <label className="swap swap-rotate btn btn-ghost btn-sm btn-circle text-base border border-base-200/60 bg-base-100 shadow-sm">
            <input type="checkbox" checked={isDark} onChange={() => setIsDark(!isDark)} />
            <span className="swap-on text-base">☀️</span>
            <span className="swap-off text-base">🌙</span>
          </label>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn btn-ghost btn-sm text-xs font-bold rounded-xl" onClick={() => navigate("/login")}>Sign in</motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn btn-primary btn-sm text-xs font-extrabold rounded-xl shadow-md shadow-primary/15 px-4" onClick={() => navigate("/register")}>Sign up free</motion.button>
        </div>
      </motion.header>

      {/* Konten Utama & Strip Fitur */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Strip Promosi Fitur (Keterangan diubah murni ke Llama 3) */}
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }} className="bg-base-100 border-b border-base-200/60 shadow-inner">
          <div className="flex items-center justify-center gap-6 py-2 px-4 text-[11px] font-bold tracking-wide text-base-content/50 flex-wrap">
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-1.5"><span className="text-sm">🦙</span> Llama 3 AI Engine</motion.span>
            <span className="opacity-30">|</span>
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-1.5"><span>🌍</span> 3 Languages</motion.span>
            <span className="opacity-30">|</span>
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex items-center gap-1.5"><span>🎮</span> 3 Interactive Games</motion.span>
            <span className="opacity-30">|</span>
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="flex items-center gap-1.5"><span>🏆</span> Gamified Progress</motion.span>
          </div>
        </motion.div>

        {/* Viewport utama Chat Room untuk tamu */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>

      {/* Banner Ajakan Daftar (Call To Action Bottom Bar) */}
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }} className="bg-base-100 border-t border-base-200/60 px-6 py-3 flex items-center justify-between shadow-md z-10">
        <p className="text-xs font-medium text-base-content/60">
          Try <span className="font-extrabold text-primary underline decoration-2">5 free translations</span> — then unlock unlimited access
        </p>
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }} 
          className="btn btn-primary btn-sm text-xs font-black rounded-xl px-4 shadow-sm shadow-primary/20" 
          onClick={() => navigate("/register")}
        >
          Get started free
        </motion.button>
      </motion.div>
    </div>
  );
}