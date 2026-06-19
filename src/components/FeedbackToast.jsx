import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FeedbackToast({ show, isCorrect, message, onDone }) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    if (show) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDone?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className={`toast toast-top toast-end z-50`}
        >
          <div className={`alert ${isCorrect ? "alert-success" : "alert-error"} shadow-lg`}>
            <span className="text-lg">{isCorrect ? "✅" : "❌"}</span>
            <div>
              <h3 className="font-bold text-sm">{isCorrect ? "Correct!" : "Not quite"}</h3>
              {message && <p className="text-xs">{message}</p>}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
