import { languageProgress } from "../data/mockData";

export default function LanguageProgress() {
  return (
    <div className="card bg-base-100 border border-base-300 shadow-none">
      <div className="card-body p-4 gap-3">
        <h3 className="card-title text-sm font-medium">🌐 Progres bahasa</h3>
        <div className="flex flex-col gap-3">
          {languageProgress.map((lang) => (
            <div key={lang.name} className="flex items-center gap-3">
              <span className="text-base w-5 text-center">{lang.flag}</span>
              <span className="text-xs text-base-content w-16">{lang.name}</span>
              <div className="flex-1">
                <progress
                  className={`progress ${
                    lang.name === "Indonesia" || lang.name === "Inggris"
                      ? "progress-primary"
                      : lang.name === "Spanyol"
                      ? "progress-warning"
                      : lang.name === "Prancis"
                      ? "progress-error"
                      : "progress-secondary"
                  } h-2`}
                  value={lang.pct}
                  max={100}
                />
              </div>
              <span className="text-xs text-base-content/50 w-8 text-right">{lang.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
