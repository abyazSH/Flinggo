import { LEVEL_XP, calcLevel } from "../config/languages";
import { motion } from "framer-motion";

export default function LevelProgress({ xp, level }) {
  const currentLevel = level || calcLevel(xp || 0);
  const xpInLevel = (xp || 0) % LEVEL_XP;
  const progressPct = Math.round((xpInLevel / LEVEL_XP) * 100);

  return (
    <div className="flex items-center gap-3.5 w-full bg-base-100 p-2 rounded-xl transition-all duration-200">
      {/* Badge Level Akun */}
      <div className="badge badge-primary badge-md font-extrabold px-3 py-3 rounded-lg shadow-sm shadow-primary/20 flex-shrink-0">
        Lv {currentLevel}
      </div>
      
      {/* Container Bar Progres Kustom */}
      <div className="flex-1 bg-base-200/80 rounded-full h-2.5 overflow-hidden relative shadow-inner">
        {/* Menggunakan Framer Motion untuk animasi pengisian XP yang mulus */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-primary to-primary-focus rounded-full"
        />
      </div>
      
      {/* Indikator Angka Batasan XP */}
      <span className="text-xs font-bold text-base-content/60 tabular-nums flex-shrink-0 min-w-[75px] text-right">
        {xpInLevel.toLocaleString()}{" "}
        <span className="text-[10px] text-base-content/40 font-medium">
          / {LEVEL_XP.toLocaleString()} XP
        </span>
      </span>
    </div>
  );
}