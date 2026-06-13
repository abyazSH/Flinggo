export default function Topbar({ title, subtitle, isDark, setIsDark }) {
  return (
    <header className="sticky top-0 z-10 bg-base-100 border-b border-base-300 px-6 h-14 flex items-center gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-base-content">{title}</p>
        {subtitle && <p className="text-xs text-base-content/50">{subtitle}</p>}
      </div>

      {/* Search */}
      <label className="input input-sm input-bordered flex items-center gap-2 w-52">
        <span className="text-base-content/40 text-xs">🔍</span>
        <input type="text" className="grow text-sm" placeholder="Cari kosakata..." />
      </label>

      {/* Dark mode toggle */}
      <label className="swap swap-rotate btn btn-ghost btn-sm btn-square" title={isDark ? "Mode terang" : "Mode gelap"}>
        <input
          type="checkbox"
          checked={isDark}
          onChange={() => setIsDark(!isDark)}
        />
        {/* sun icon — shown on dark mode */}
        <span className="swap-on text-lg">☀️</span>
        {/* moon icon — shown on light mode */}
        <span className="swap-off text-lg">🌙</span>
      </label>

      {/* Notif */}
      <div className="indicator">
        <span className="indicator-item badge badge-error badge-xs" />
        <button className="btn btn-ghost btn-sm btn-square">
          <span className="text-base">🔔</span>
        </button>
      </div>

      {/* Avatar */}
      <div className="avatar placeholder">
        <div className="bg-primary text-primary-content rounded-full w-8 text-xs font-medium cursor-pointer">
          <span>MA</span>
        </div>
      </div>
    </header>
  );
}
