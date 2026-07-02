import { LANGUAGES } from "../config/languages";
import { motion } from "framer-motion";

export default function LanguageSelector({ sourceLang, targetLang, onSourceChange, onTargetChange, onSwap }) {
  return (
    <div className="flex items-center gap-3 w-full max-w-xl">
      {/* Bahasa Asal (Source Language) */}
      <div className="flex-1 min-w-0">
        <label className="text-[11px] font-bold tracking-wide uppercase text-base-content/40 mb-1.5 block pl-1">
          From
        </label>
        <select
          className="select select-bordered select-sm w-full text-xs font-medium bg-base-100 border-base-300 focus:border-primary focus:outline-none rounded-xl"
          value={sourceLang}
          onChange={(e) => onSourceChange(e.target.value)}
        >
          {/* Filter bahasa asal: sembunyikan bahasa yang sudah dipilih di targetLang */}
          {LANGUAGES.filter((l) => l.code !== targetLang).map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} &nbsp; {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tombol Tukar (Swap Button) dengan Animasi Mikro */}
      <div className="flex items-end justify-center h-full pt-5">
        <motion.button
          type="button"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.05)" }}
          whileTap={{ scale: 0.9, rotate: 180 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="btn btn-ghost btn-sm btn-circle text-primary border border-base-200 bg-base-100 shadow-sm"
          onClick={onSwap}
          title="Swap languages"
        >
          <span className="text-base font-bold">⇄</span>
        </motion.button>
      </div>

      {/* Bahasa Tujuan (Target Language) */}
      <div className="flex-1 min-w-0">
        <label className="text-[11px] font-bold tracking-wide uppercase text-base-content/40 mb-1.5 block pl-1">
          To
        </label>
        <select
          className="select select-bordered select-sm w-full text-xs font-medium bg-base-100 border-base-300 focus:border-primary focus:outline-none rounded-xl"
          value={targetLang}
          onChange={(e) => onTargetChange(e.target.value)}
        >
          {/* Filter bahasa tujuan: sembunyikan bahasa yang sudah dipilih di sourceLang */}
          {LANGUAGES.filter((l) => l.code !== sourceLang).map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} &nbsp; {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}