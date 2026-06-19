import { LEVEL_XP, calcLevel } from "../config/languages";

export default function LevelProgress({ xp, level }) {
  const currentLevel = level || calcLevel(xp || 0);
  const xpInLevel = (xp || 0) % LEVEL_XP;
  const progressPct = Math.round((xpInLevel / LEVEL_XP) * 100);

  return (
    <div className="flex items-center gap-3">
      <div className="badge badge-primary badge-sm font-bold">Lv {currentLevel}</div>
      <div className="flex-1">
        <progress className="progress progress-primary h-2 w-full" value={xpInLevel} max={LEVEL_XP} />
      </div>
      <span className="text-xs text-base-content/50">{xpInLevel}/{LEVEL_XP} XP</span>
    </div>
  );
}
