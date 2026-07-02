import { languageProgress } from "../data/mockData";
import { motion } from "framer-motion";

export default function LanguageProgress() {
  // Pemetaan warna khusus untuk 3 bahasa utama Flinggo
  function getProgressColor(langName) {
    if (langName === "Indonesia") return "progress-primary";   // Biru Utama
    if (langName === "Inggris") return "progress-secondary";   // Ungu
    if (langName === "Melayu") return "progress-accent";       // Hijau Toska
    return "progress-ghost";
  }

  return (
    <div className="card bg-base-100 border border-base-300/70 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="card-body p-5 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-base">🌐</span>
          <h3 className="text-sm font-bold tracking-wide text-base-content/90">
            Progres Bahasa
          </h3>
        </div>

        <div className="flex flex-col gap-3.5 mt-1">
          {languageProgress.map((lang) => (
            <div key={lang.name} className="flex items-center gap-3 group">
              <span className="text-base w-6 text-center filter drop-shadow-sm group-hover:scale-110 transition-transform duration-150">
                {lang.flag}
              </span>
              
              <span className="text-xs font-semibold text-base-content/80 w-20 truncate">
                {lang.name}
              </span>
              
              <div className="flex-1 bg-base-200 rounded-full h-2 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${lang.pct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${getProgressColor(lang.name)}`}
                  style={{ backgroundColor: "currentColor" }}
                />
              </div>
              
              <span className="text-xs font-bold text-base-content/50 w-10 text-right tabular-nums group-hover:text-primary transition-colors duration-150">
                {lang.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}