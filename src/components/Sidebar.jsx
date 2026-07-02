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
    <aside className="w-60 flex-shrink-0 bg-base-100 border-r border-base-200 flex flex-col h-screen sticky top-0 z-40 shadow-sm">
      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-5 py-5 border-b border-base-200/60"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-secondary shadow-sm shadow-primary/30"
        />
        <span className="text-xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Flinggo
        </span>
      </motion.div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-5 scrollbar-none">
        {/* MENU KATEGORI 1 */}
        <div>
          <p className="text-[10px] text-base-content/35 px-3 mb-2 uppercase tracking-[0.2em] font-extrabold">
            Menu
          </p>
          <ul className="flex flex-col gap-1 p-0 m-0">
            {navItems.map((item, i) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.li 
                  key={item.path} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.04 }}
                  className="list-none"
                >
                  <motion.a
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold cursor-pointer relative transition-colors duration-200 select-none
                      ${isActive ? "text-primary font-black" : "text-base-content/60 hover:bg-base-200/50 hover:text-base-content"}`}
                    onClick={() => navigate(item.path)}
                  >
                    {/* Background Slider Animasi Pegas saat Menu Aktif Pindah */}
                    {isActive && (
                      <motion.div 
                        layoutId="sidebar-active" 
                        className="absolute inset-0 bg-primary/10 border border-primary/10 rounded-xl" 
                        transition={{ type: "spring", stiffness: 380, damping: 30 }} 
                      />
                    )}
                    <span className="text-base relative z-10">{item.icon}</span>
                    <span className="flex-1 relative z-10 tracking-wide">{item.label}</span>
                    {item.badge && (
                      <span className="badge bg-primary text-primary-content font-black tracking-wider text-[9px] px-1.5 py-0.5 border-none rounded-md relative z-10 shadow-sm shadow-primary/20 animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </motion.a>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* MENU KATEGORI 2 */}
        <div>
          <p className="text-[10px] text-base-content/35 px-3 mb-2 uppercase tracking-[0.2em] font-extrabold">
            Account
          </p>
          <ul className="flex flex-col gap-1 p-0 m-0">
            {accountItems.map((item, i) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.li 
                  key={item.path} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.2 + i * 0.04 }}
                  className="list-none"
                >
                  <motion.a
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold cursor-pointer relative transition-colors duration-200 select-none
                      ${isActive ? "text-primary font-black" : "text-base-content/60 hover:bg-base-200/50 hover:text-base-content"}`}
                    onClick={() => navigate(item.path)}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="sidebar-active" 
                        className="absolute inset-0 bg-primary/10 border border-primary/10 rounded-xl" 
                        transition={{ type: "spring", stiffness: 380, damping: 30 }} 
                      />
                    )}
                    <span className="text-base relative z-10">{item.icon}</span>
                    <span className="flex-1 relative z-10 tracking-wide">{item.label}</span>
                  </motion.a>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Dark / Light Mode Switcher */}
      <div className="border-t border-base-200/60 px-5 py-3 flex items-center justify-between bg-base-200/10">
        <span className="text-[11px] font-bold tracking-wide text-base-content/40 uppercase">
          {isDark ? "Dark Mode" : "Light Mode"}
        </span>
        <label className="swap swap-rotate cursor-pointer hover:bg-base-200 p-1.5 rounded-lg transition-colors">
          <input type="checkbox" checked={isDark} onChange={() => setIsDark(!isDark)} />
          <span className="swap-on text-base">☀️</span>
          <span className="swap-off text-base">🌙</span>
        </label>
      </div>

      {/* User Footer Account Profile */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4 }} 
        className="border-t border-base-200/60 px-4 py-3.5 flex items-center gap-3 bg-base-200/20"
      >
        {/* Avatar Bulat Gradient */}
        <div className="avatar placeholder flex-shrink-0">
          <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-full w-9 h-9 text-xs font-black shadow-md shadow-primary/20 flex items-center justify-center text-white border border-base-100">
            <span>{initials}</span>
          </div>
        </div>
        
        {/* Info Nama Akun & Tingkatan Gamifikasi */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <p className="text-xs font-bold text-base-content/90 truncate leading-none">
            {displayName}
          </p>
          <p className="text-[10px] font-semibold text-base-content/40 truncate">
            Lv {level} · <span className="text-primary/80 font-bold">{levelTitle}</span>
          </p>
        </div>

        {/* Tombol Keluar Akun (Sign Out) */}
        <motion.button 
          whileHover={{ scale: 1.1, backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444" }} 
          whileTap={{ scale: 0.9 }} 
          className="btn btn-ghost btn-xs btn-circle text-base-content/40 transition-colors duration-150" 
          onClick={handleSignOut} 
          title="Sign out"
        >
          <span className="text-sm">🚪</span>
        </motion.button>
      </motion.div>
    </aside>
  );
}