import { LANGUAGES } from "../config/languages";

export default function LanguageSelector({ sourceLang, targetLang, onSourceChange, onTargetChange, onSwap }) {
  return (
    <div className="flex items-center gap-2">
      {/* Source language */}
      <div className="flex-1">
        <label className="text-xs text-base-content/50 mb-1 block">From</label>
        <select
          className="select select-bordered select-sm w-full text-sm"
          value={sourceLang}
          onChange={(e) => onSourceChange(e.target.value)}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Swap button */}
      <button
        className="btn btn-ghost btn-sm btn-circle mt-4"
        onClick={onSwap}
        title="Swap languages"
      >
        <span className="text-lg">⇄</span>
      </button>

      {/* Target language */}
      <div className="flex-1">
        <label className="text-xs text-base-content/50 mb-1 block">To</label>
        <select
          className="select select-bordered select-sm w-full text-sm"
          value={targetLang}
          onChange={(e) => onTargetChange(e.target.value)}
        >
          {LANGUAGES.filter((l) => l.code !== sourceLang).map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
