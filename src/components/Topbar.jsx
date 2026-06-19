import { useAuth } from "../contexts/AuthContext";
import { useGame } from "../contexts/GameContext";

export default function Topbar({ title, subtitle, isDark, setIsDark }) {
  const { profile } = useAuth();
  const { xp, level } = useGame();

  const displayName = profile?.display_name || profile?.username || "Learner";
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-10 bg-base-100 border-b border-base-300 px-6 h-14 flex items-center gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-base-content">{title}</p>
        {subtitle && <p className="text-xs text-base-content/50">{subtitle}</p>}
      </div>

      {/* XP badge */}
      <div className="badge badge-primary badge-lg gap-1">
        <span className="text-xs">⭐</span>
        <span className="text-xs font-bold">{xp.toLocaleString()} XP</span>
      </div>

      {/* Level */}
      <div className="badge badge-ghost badge-lg gap-1">
        <span className="text-xs font-bold">Lv {level}</span>
      </div>

      {/* Dark mode toggle */}
      <label className="swap swap-rotate btn btn-ghost btn-sm btn-square" title={isDark ? "Light mode" : "Dark mode"}>
        <input
          type="checkbox"
          checked={isDark}
          onChange={() => setIsDark(!isDark)}
        />
        <span className="swap-on text-lg">☀️</span>
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
          <span>{initials}</span>
        </div>
      </div>
    </header>
  );
}
