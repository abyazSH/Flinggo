import { motion } from "framer-motion";

export default function ModelComparison({ llamaResult, gemmaResult, comparison }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Llama output */}
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }} whileHover={{ y: -2 }} className="card bg-base-100 border border-base-300 shadow-none">
        <div className="card-body p-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="badge badge-sm badge-primary">🦙 Llama 3</span>
            {llamaResult?.confidence != null && (
              <span className="text-xs text-base-content/50">
                {Math.round(llamaResult.confidence * 100)}% confidence
              </span>
            )}
          </div>
          <p className="text-sm font-medium">{llamaResult?.translation || "No result"}</p>
          {llamaResult?.explanation && (
            <p className="text-xs text-base-content/50 italic">{llamaResult.explanation}</p>
          )}
          {llamaResult?.alternatives?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {llamaResult.alternatives.map((alt, i) => (
                <span key={i} className="badge badge-ghost badge-sm text-xs">{alt}</span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Gemma output */}
      <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.1 }} whileHover={{ y: -2 }} className="card bg-base-100 border border-base-300 shadow-none">
        <div className="card-body p-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="badge badge-sm badge-secondary">💎 Gemma 3</span>
            {gemmaResult?.confidence != null && (
              <span className="text-xs text-base-content/50">
                {Math.round(gemmaResult.confidence * 100)}% confidence
              </span>
            )}
          </div>
          <p className="text-sm font-medium">{gemmaResult?.translation || "No result"}</p>
          {gemmaResult?.explanation && (
            <p className="text-xs text-base-content/50 italic">{gemmaResult.explanation}</p>
          )}
          {gemmaResult?.alternatives?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {gemmaResult.alternatives.map((alt, i) => (
                <span key={i} className="badge badge-ghost badge-sm text-xs">{alt}</span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Comparison metrics */}
      {comparison && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="col-span-full card bg-base-200 border border-base-300 shadow-none">
          <div className="card-body p-3 gap-2">
            <h4 className="text-xs font-semibold text-base-content/70">Comparison Metrics</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Word Similarity", value: `${comparison.wordSimilarity}%`, cls: "text-primary" },
                { label: "Words (L/G)", value: `${comparison.llamaWordCount}/${comparison.gemmaWordCount}`, cls: "" },
                { label: "Chars (L/G)", value: `${comparison.llamaCharCount}/${comparison.gemmaCharCount}`, cls: "" },
              ].map((m, i) => (
                <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.06 }}>
                  <p className="text-xs text-base-content/50">{m.label}</p>
                  <p className={`text-sm font-bold ${m.cls}`}>{m.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
