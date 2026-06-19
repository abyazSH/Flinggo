import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useGame } from "../contexts/GameContext";

const navItems = [
  { path: "/dashboard",  label: "Dashboard",          icon: "🏠", badge: null    },
  { path: "/chat",       label: "Translation Chat",   icon: "🤖", badge: "AI"   },
  { path: "/quiz",       label: "Vocabulary Quiz",    icon: "🃏", badge: null    },
  { path: "/sentence",   label: "Sentence Builder",   icon: "✍️", badge: null    },
  { path: "/challenge",  label: "Daily Challenge",    icon: "📅", badge: null    },
];

const accountItems = [
  { path: "/leaderboard", label: "Leaderboard",  icon: "🏆" },
  { path: "/progress",    label: "My Progress",  icon: "📊" },
  { path: "/settings",    label: "Settings",     icon: "⚙️" },
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
    <aside className="w-52 flex-shrink-0 bg-base-100 border-r border-base-300 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-base-300">
        <div className="w-3 h-3 rounded-full bg-primary" />
        <span className="text-lg font-semibold tracking-tight">Flinggo</span>
      </div>

      {/* Main menu */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin">
        <p className="text-xs text-base-content/40 px-2 mb-1 uppercase tracking-widest">Menu</p>
        <ul className="menu menu-sm gap-0.5 p-0">
          {navItems.map((item) => (
            <li key={item.path}>
              <a
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer
                  ${location.pathname === item.path
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-base-content/70 hover:bg-base-200"
                  }`}
                onClick={() => navigate(item.path)}
              >
                <span className="text-base">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="badge badge-primary badge-sm text-xs">{item.badge}</span>
                )}
              </a>
            </li>
          ))}
        </ul>

        <p className="text-xs text-base-content/40 px-2 mt-4 mb-1 uppercase tracking-widest">Account</p>
        <ul className="menu menu-sm gap-0.5 p-0">
          {accountItems.map((item) => (
            <li key={item.path}>
              <a
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer
                  ${location.pathname === item.path
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-base-content/70 hover:bg-base-200"
                  }`}
                onClick={() => navigate(item.path)}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Theme toggle */}
      <div className="border-t border-base-300 px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs text-base-content/50">
          {isDark ? "Dark mode" : "Light mode"}
        </span>
        <label className="swap swap-rotate cursor-pointer">
          <input
            type="checkbox"
            checked={isDark}
            onChange={() => setIsDark(!isDark)}
          />
          <span className="swap-on text-base">☀️</span>
          <span className="swap-off text-base">🌙</span>
        </label>
      </div>

      {/* User info */}
      <div className="border-t border-base-300 px-4 py-3 flex items-center gap-3">
        <div className="avatar placeholder">
          <div className="bg-primary text-primary-content rounded-full w-8 text-xs font-medium">
            <span>{initials}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{displayName}</p>
          <p className="text-xs text-base-content/50">Level {level} · {levelTitle}</p>
        </div>
        <button className="btn btn-ghost btn-xs" onClick={handleSignOut} title="Sign out">
          <span className="text-sm">🚪</span>
        </button>
      </div>
    </aside>
  );
}
