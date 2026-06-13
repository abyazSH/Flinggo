const navItems = [
  { id: "dashboard",  label: "Dashboard",         icon: "🏠", badge: null    },
  { id: "chat",       label: "Chat AI",            icon: "🤖", badge: "Baru" },
  { id: "quiz",       label: "Kuis kosakata",      icon: "🃏", badge: null   },
  { id: "sentence",   label: "Susun kalimat",      icon: "✍️", badge: null   },
  { id: "challenge",  label: "Tantangan harian",   icon: "📅", badge: null   },
];

const accountItems = [
  { id: "leaderboard", label: "Leaderboard",  icon: "🏆" },
  { id: "progress",    label: "Progres saya", icon: "📊" },
  { id: "settings",    label: "Pengaturan",   icon: "⚙️" },
];

export default function Sidebar({ activePage, setActivePage, isDark, setIsDark }) {
  return (
    <aside className="w-52 flex-shrink-0 bg-base-100 border-r border-base-300 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-base-300">
        <div className="w-3 h-3 rounded-full bg-primary" />
        <span className="text-lg font-semibold tracking-tight">Flingo</span>
      </div>

      {/* Menu utama */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin">
        <p className="text-xs text-base-content/40 px-2 mb-1 uppercase tracking-widest">Menu</p>
        <ul className="menu menu-sm gap-0.5 p-0">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer
                  ${activePage === item.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-base-content/70 hover:bg-base-200"
                  }`}
                onClick={() => setActivePage(item.id)}
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

        <p className="text-xs text-base-content/40 px-2 mt-4 mb-1 uppercase tracking-widest">Akun</p>
        <ul className="menu menu-sm gap-0.5 p-0">
          {accountItems.map((item) => (
            <li key={item.id}>
              <a
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer
                  ${activePage === item.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-base-content/70 hover:bg-base-200"
                  }`}
                onClick={() => setActivePage(item.id)}
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
          {isDark ? "Mode gelap" : "Mode terang"}
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
            <span>MA</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">M. Abyaz</p>
          <p className="text-xs text-base-content/50">Level 3 · Pelajar</p>
        </div>
      </div>
    </aside>
  );
}
