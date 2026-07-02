import { motion, AnimatePresence } from "framer-motion";

/**
 * 1. ScoreBadge - Lencana Skor Modern
 * Menampilkan total skor terkini dengan desain badge premium.
 */
export default function ScoreBadge({ score, label = "Score", show = true }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="badge badge-md bg-primary/10 border border-primary/20 text-primary gap-1.5 px-3 py-3.5 rounded-xl shadow-sm"
        >
          <span className="text-xs filter drop-shadow-sm animate-pulse">⭐</span>
          <span className="text-xs font-bold tracking-wide">
            {label}: <span className="font-black tabular-nums">{score.toLocaleString()}</span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * 2. XpGainPopup - Animasi Melayang Angka XP (+XP)
 * Efek pop-up teks angka yang meluncur ke atas dan memudar saat user mendapatkan poin.
 */
export function XpGainPopup({ amount, show }) {
  return (
    <AnimatePresence>
      {show && amount > 0 && (
        <motion.span
          initial={{ opacity: 0, y: 10, scale: 0.5 }}
          animate={{ 
            opacity: [0, 1, 1, 0], // Keyframes: Muncul, Menetap, lalu Memudar
            y: -40,                // Meluncur naik lebih tinggi
            scale: [0.5, 1.2, 1, 0.9] 
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 1.4, 
            ease: "easeOut" 
          }}
          className="absolute text-xs font-black text-success pointer-events-none tracking-wider filter drop-shadow-[0_2px_8px_rgba(34,197,94,0.3)] bg-success/10 border border-success/20 px-2 py-0.5 rounded-lg select-none"
        >
          +{amount.toLocaleString()} XP
        </motion.span>
      )}
    </AnimatePresence>
  );
}