import { useState } from "react";

export default function ModelComparison({ llamaResult, gemmaResult, comparison }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Llama output */}
      <div className="card bg-base-100 border border-base-300 shadow-none">
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
      </div>

      {/* Gemma output */}
      <div className="card bg-base-100 border border-base-300 shadow-none">
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
      </div>

      {/* Comparison metrics */}
      {comparison && (
        <div className="col-span-full card bg-base-200 border border-base-300 shadow-none">
          <div className="card-body p-3 gap-2">
            <h4 className="text-xs font-semibold text-base-content/70">Comparison Metrics</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-base-content/50">Word Similarity</p>
                <p className="text-sm font-bold text-primary">{comparison.wordSimilarity}%</p>
              </div>
              <div>
                <p className="text-xs text-base-content/50">Words (L/G)</p>
                <p className="text-sm font-bold">{comparison.llamaWordCount}/{comparison.gemmaWordCount}</p>
              </div>
              <div>
                <p className="text-xs text-base-content/50">Chars (L/G)</p>
                <p className="text-sm font-bold">{comparison.llamaCharCount}/{comparison.gemmaCharCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
