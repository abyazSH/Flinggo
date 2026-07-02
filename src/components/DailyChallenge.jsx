import { useState } from "react";
import { dailyChallenge } from "../data/mockData";
import { motion, AnimatePresence } from "framer-motion";

export default function DailyChallenge() {
  const [selected, setSelected] = useState(null);
  const { question, lang, options, answer } = dailyChallenge;

  function handleSelect(idx) {
    if (selected !== null) return;
    setSelected(idx);
  }

  // Mengoptimalkan class DaisyUI berdasarkan status jawaban untuk UX yang lebih intuitif
  function optionClass(idx) {
    const baseClass = "btn btn-sm text-xs justify-start px-4 h-auto py-2.5 normal-case border text-left transition-all duration-200 flex items-center justify-between";
    
    if (selected === null) {
      return `${baseClass} btn-outline border-base-300 hover:border-primary hover:bg-primary/5 text-base-content`;
    }
    if (idx === answer) {
      return `${baseClass} btn-success text-success-content border-success shadow-sm shadow-success/10`;
    }
    if (idx === selected && idx !== answer) {
      return `${baseClass} btn-error text-error-content border-error shadow-sm shadow-error/10`;
    }
    return `${baseClass} btn-outline border-base-200 opacity-40 text-base-content/60 cursor-not-allowed`;
  }

  return (
    <div className="card bg-base-100 border border-base-300/70 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="card-body p-5 gap-4">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📅</span>
            <h3 className="text-sm font-bold tracking-wide text-base-content/90">
              Tantangan Harian
            </h3>
          </div>
          <span className="badge bg-amber-500/10 text-amber-600 border-amber-500/20 font-semibold tracking-wider text-[10px] uppercase px-2.5 py-1">
            {lang}
          </span>
        </div>

        {/* Pertanyaan */}
        <p className="text-sm font-semibold text-base-content/90 leading-relaxed">
          {question}
        </p>

        {/* Opsi Pilihan Jawaban */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
          {options.map((opt, idx) => {
            const isCorrect = idx === answer;
            const isSelected = idx === selected;
            
            return (
              <motion.button
                key={idx}
                disabled={selected !== null}
                className={optionClass(idx)}
                onClick={() => handleSelect(idx)}
                whileHover={selected === null ? { scale: 1.01, x: 2 } : {}}
                whileTap={selected === null ? { scale: 0.99 } : {}}
              >
                <span className="truncate max-w-[85%]">{opt}</span>
                
                {/* Indikator Status Mikro di Sebelah Kanan Teks Opsi */}
                {selected !== null && (
                  <span className="text-xs flex-shrink-0">
                    {isCorrect && "✨"}
                    {isSelected && !isCorrect && "❌"}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Kotak Pesan Alert Umpan Balik */}
        <AnimatePresence>
          {selected !== null && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`alert shadow-sm rounded-xl py-3 px-4 text-xs font-medium border mt-2 flex items-start gap-2.5 ${
                selected === answer 
                  ? "bg-success/10 text-success border-success/20" 
                  : "bg-error/10 text-error border-error/20"
              }`}
            >
              <span className="text-sm">
                {selected === answer ? "🎉" : "💡"}
              </span>
              <div>
                {selected === answer ? (
                  <p className="font-bold">Benar sekali! +100 XP berhasil ditambahkan ke profil Anda.</p>
                ) : (
                  <p>
                    <span className="font-bold block mb-0.5">Kurang tepat!</span>
                    Solusi benar adalah: <span className="underline decoration-2 font-bold">{options[answer]}</span>
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}