import { useAuth } from "../contexts/AuthContext";
import { useGame } from "../contexts/GameContext";
import { motion } from "framer-motion";

export default function Topbar({ title, subtitle, isDark, setIsDark }) {
  const { profile } = useAuth();
  const { xp, level } = useGame();

  const displayName = profile?.display_name || profile?.username || "Learner";
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-base-100/70 backdrop-blur-md border-b border-base-200/60 px-6 h-16 flex items-center gap-4 shadow-sm select-none">
      {/* Bagian Informasi Judul Halaman */}
      <div className="flex-1 min-w-0">
        <motion.h1 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-sm font-black text-base-content/90 truncate tracking-wide"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <p className="text-[11px] font-semibold text-base-content/40 truncate leading-none mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Indikator Akumulasi Skor XP (Gaya Pastel Premium) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 200 }}
        className="badge bg-primary/10 border border-primary/20 text-primary gap-1.5 px-3 py-3.5 rounded-xl shadow-sm"
      >
        <span className="text-xs filter drop-shadow-sm animate-pulse">⭐</span>
        <span className="text-xs font-black tracking-wide tabular-nums">{xp.toLocaleString()} XP</span>
      </motion.div>

      {/* Indikator Capaian Level */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="badge bg-base-200 text-base-content/70 border border-base-300 px-3 py-3.5 rounded-xl text-xs font-black tracking-wide shadow-sm"
      >
        Lv {level}
      </motion.div>

      {/* Tombol Alih Mode Gelap/Terang (Dark/Light Mode) */}
      <motion.label 
        whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.03)" }}
        whileTap={{ scale: 0.95 }}
        className="swap swap-rotate btn btn-ghost btn-sm btn-circle text-base border border-base-200/60 bg-base-100 shadow-sm" 
        title={isDark ? "Light mode" : "Dark mode"}
      >
        <input type="checkbox" checked={isDark} onChange={() => setIsDark(!isDark)} />
        <span className="swap-on text-base">☀️</span>
        <span className="swap-off text-base">🌙</span>
      </motion.label>

      {/* Tombol Notifikasi dengan Indikator Denyut Aktif */}
      <div className="indicator">
        <span className="indicator-item badge badge-error w-2 h-2 p-0 min-h-0 border border-base-100 animate-pulse top-1 right-1" />
        <motion.button 
          whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.03)" }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-ghost btn-sm btn-circle border border-base-200/60 bg-base-100 shadow-sm flex items-center justify-center"
        >
          <span className="text-base">🔔</span>
        </motion.button>
      </div>

      {/* Avatar Mini Identitas Akun */}
      <motion.div 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}
        className="avatar placeholder cursor-pointer flex-shrink-0"
      >
        <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-full w-9 h-9 text-xs font-black shadow-md shadow-primary/20 flex items-center justify-center text-white border border-base-100">
          <span>{initials}</span>
        </div>
      </motion.div>
    </header>
  );
}