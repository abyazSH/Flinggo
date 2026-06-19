import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useGame } from "../contexts/GameContext";
import { motion } from "framer-motion";

const navItems = [
  { path: "/dashboard",  label: "Dashboard",        icon: "🏠", badge: null  },
  { path: "/chat",       label: "Translation Chat", icon: "🤖", badge: "AI"  },
  { path: "/quiz",       label: "Vocabulary Quiz",  icon: "🃏", badge: null  },
  { path: "/sentence",   label: "Sentence Builder",  icon: "✍️", badge: null  },
  { path: "/challenge",  label: "Daily Challenge",  icon: "📅", badge: null  },
];

const accountItems = [
  { path: "/leaderboard", label: "Leaderboard", icon: "🏆" },
  { path: "/progress",    label: "My Progress", icon: "📊" },
  { path: "/settings",    label: "Settings",    icon: "⚙️" },
];

export default function Sidebar({ isDark, setIsDark }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { level } = useGame();

  const displayName = profile?.display_name || profile?.username || "Learner";
  const initials = displayName.substring(0, 2).toUpperCase();
  const levelTitles = ["Beginner", "Learner", "Explorer", "Scholar", "Polyglot"];
  const levelTitle = levelTitles[Math.min(level - 1, levelTitles.length - 1)] || "Polyglot";

  function handleSignOut() {
    signOut();
    navigate("/login");
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-base-100 border-r border-base-300 flex flex-col h-screen sticky top-0">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2.5 px-4 py-4 border-b border-base-300"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-secondary"
        />
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Flinggo
        </span>
      </motion.div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin">
        <p className="text-[10px] text-base-content/40 px-3 mb-1.5 uppercase tracking-[0.15em] font-semibold">Menu</p>
        <ul className="menu menu-sm gap-0.5 p-0">
          {navItems.map((item, i) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.li key={item.path} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <motion.a
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm cursor-pointer relative overflow-hidden
                    ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-base-content/70 hover:bg-base-200"}`}
                  onClick={() => navigate(item.path)}
                >
                  {isActive && (
                    <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-primary/10 rounded-xl" transition={{ type: "spring", stiffness: 350, damping: 30 }} />
                  )}
                  <span className="text-lg relative z-10">{item.icon}</span>
                  <span className="flex-1 relative z-10">{item.label}</span>
                  {item.badge && <span className="badge badge-primary badge-xs text-[10px] relative z-10">{item.badge}</span>}
                </motion.a>
              </motion.li>
            );
          })}
        </ul>

        <p className="text-[10px] text-base-content/40 px-3 mt-5 mb-1.5 uppercase tracking-[0.15em] font-semibold">Account</p>
        <ul className="menu menu-sm gap-0.5 p-0">
          {accountItems.map((item, i) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.li key={item.path} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                <motion.a
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm cursor-pointer relative overflow-hidden
                    ${isActive ? "bg-primary/10 text-primary font-semibold" : "text-base-content/70 hover:bg-base-200"}`}
                  onClick={() => navigate(item.path)}
                >
                  {isActive && (
                    <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-primary/10 rounded-xl" transition={{ type: "spring", stiffness: 350, damping: 30 }} />
                  )}
                  <span className="text-lg relative z-10">{item.icon}</span>
                  <span className="relative z-10">{item.label}</span>
                </motion.a>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-base-300 px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs text-base-content/50">{isDark ? "Dark mode" : "Light mode"}</span>
        <label className="swap swap-rotate cursor-pointer">
          <input type="checkbox" checked={isDark} onChange={() => setIsDark(!isDark)} />
          <span className="swap-on text-base">☀️</span>
          <span className="swap-off text-base">🌙</span>
        </label>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="border-t border-base-300 px-4 py-3 flex items-center gap-3">
        <div className="avatar placeholder">
          <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-full w-9 text-xs font-bold shadow-md shadow-primary/20">
            <span>{initials}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{displayName}</p>
          <p className="text-[10px] text-base-content/50">Lv {level} · {levelTitle}</p>
        </div>
        <motion.button whileHover={{ scale: 1.1, rotate: -10 }} whileTap={{ scale: 0.9 }} className="btn btn-ghost btn-xs btn-circle" onClick={handleSignOut} title="Sign out">
          <span className="text-sm">🚪</span>
        </motion.button>
      </motion.div>
    </aside>
  );
}
