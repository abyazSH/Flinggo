import { useState } from "react";
import { dailyChallenge } from "../data/mockData";

export default function DailyChallenge() {
  const [selected, setSelected] = useState(null);
  const { question, lang, options, answer } = dailyChallenge;

  function handleSelect(idx) {
    if (selected !== null) return;
    setSelected(idx);
  }

  function optionClass(idx) {
    if (selected === null) return "btn btn-outline btn-sm text-xs justify-start";
    if (idx === answer) return "btn btn-success btn-sm text-xs justify-start";
    if (idx === selected && idx !== answer) return "btn btn-error btn-sm text-xs justify-start";
    return "btn btn-outline btn-sm text-xs justify-start opacity-40";
  }

  return (
    <div className="card bg-base-100 border border-base-300 shadow-none">
      <div className="card-body p-4 gap-3">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-sm font-medium">📅 Tantangan harian</h3>
          <span className="badge badge-warning badge-sm text-xs">{lang}</span>
        </div>

        <p className="text-sm font-medium text-base-content">{question}</p>

        <div className="grid grid-cols-2 gap-2">
          {options.map((opt, idx) => (
            <button
              key={idx}
              className={optionClass(idx)}
              onClick={() => handleSelect(idx)}
            >
              {opt}
            </button>
          ))}
        </div>

        {selected !== null && (
          <div
            className={`alert alert-sm text-xs py-2 ${
              selected === answer ? "alert-success" : "alert-error"
            }`}
          >
            {selected === answer
              ? "✅ Benar! +100 poin ditambahkan."
              : `❌ Kurang tepat. Jawaban benar: "${options[answer]}"`}
          </div>
        )}
      </div>
    </div>
  );
}
