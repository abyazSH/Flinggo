import { motion, AnimatePresence } from "framer-motion";

export default function ScoreBadge({ score, label = "Score", show = true }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="badge badge-lg badge-primary gap-1"
        >
          <span className="text-xs">⭐</span>
          <span className="text-xs font-bold">{label}: {score}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function XpGainPopup({ amount, show }) {
  return (
    <AnimatePresence>
      {show && amount > 0 && (
        <motion.span
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -30 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute text-sm font-bold text-success pointer-events-none"
        >
          +{amount} XP
        </motion.span>
      )}
    </AnimatePresence>
  );
}
