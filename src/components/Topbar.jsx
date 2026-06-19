import { useAuth } from "../contexts/AuthContext";
import { useGame } from "../contexts/GameContext";
import { motion } from "framer-motion";

export default function Topbar({ title, subtitle, isDark, setIsDark }) {
  const { profile } = useAuth();
  const { xp, level } = useGame();

  const displayName = profile?.display_name || profile?.username || "Learner";
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-10 bg-base-100/80 backdrop-blur-md border-b border-base-300 px-6 h-14 flex items-center gap-4">
      <div className="flex-1">
        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-semibold text-base-content">
          {title}
        </motion.p>
        {subtitle && <p className="text-xs text-base-content/50">{subtitle}</p>}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="badge badge-primary badge-lg gap-1 shadow-sm shadow-primary/20"
      >
        <span className="text-xs">⭐</span>
        <span className="text-xs font-bold">{xp.toLocaleString()} XP</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="badge badge-outline badge-lg gap-1"
      >
        <span className="text-xs font-bold">Lv {level}</span>
      </motion.div>

      <label className="swap swap-rotate btn btn-ghost btn-sm btn-circle" title={isDark ? "Light mode" : "Dark mode"}>
        <input type="checkbox" checked={isDark} onChange={() => setIsDark(!isDark)} />
        <span className="swap-on text-lg">☀️</span>
        <span className="swap-off text-lg">🌙</span>
      </label>

      <div className="indicator">
        <span className="indicator-item badge badge-error badge-xs animate-pulse" />
        <button className="btn btn-ghost btn-sm btn-circle">
          <span className="text-base">🔔</span>
        </button>
      </div>

      <motion.div whileHover={{ scale: 1.1 }} className="avatar placeholder cursor-pointer">
        <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-full w-9 text-xs font-bold shadow-md shadow-primary/20">
          <span>{initials}</span>
        </div>
      </motion.div>
    </header>
  );
}
