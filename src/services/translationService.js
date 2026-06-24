import { translateWithLlama } from "./llamaService";
import { translateWithGemma } from "./gemmaService";
import { getLanguageName } from "../config/languages";

/**
 * Translate using a single model.
 * @param {string} text
 * @param {string} sourceLangCode - e.g. "en"
 * @param {string} targetLangCode - e.g. "es"
 * @param {"llama"|"gemma"} model
 */
export async function translate(text, sourceLangCode, targetLangCode, model = "llama") {
  const sourceLang = getLanguageName(sourceLangCode);
  const targetLang = getLanguageName(targetLangCode);

  if (model === "gemma") {
    return translateWithGemma(text, sourceLang, targetLang);
  }
  return translateWithLlama(text, sourceLang, targetLang);
}

/**
 * Translate using both models in parallel for comparison.
 */
export async function translateWithBoth(text, sourceLangCode, targetLangCode) {
  const sourceLang = getLanguageName(sourceLangCode);
  const targetLang = getLanguageName(targetLangCode);

  const [llama, gemma] = await Promise.allSettled([
    translateWithLlama(text, sourceLang, targetLang),
    translateWithGemma(text, sourceLang, targetLang),
  ]);

  return {
    llama: llama.status === "fulfilled" ? llama.value : { translation: "Error: " + llama.reason?.message, explanation: "", alternatives: [], model: "Llama 3" },
    gemma: gemma.status === "fulfilled" ? gemma.value : { translation: "Error: " + gemma.reason?.message, explanation: "", alternatives: [], model: "Gemma 2" },
    comparison: compareResults(
      llama.status === "fulfilled" ? llama.value : null,
      gemma.status === "fulfilled" ? gemma.value : null
    ),
  };
}

/**
 * Basic comparison metrics between two translation outputs.
 */
export function compareResults(llamaOutput, gemmaOutput) {
  if (!llamaOutput || !gemmaOutput) return null;

  const lt = llamaOutput.translation || "";
  const gt = gemmaOutput.translation || "";

  const llamaWords = lt.split(/\s+/).length;
  const gemmaWords = gt.split(/\s+/).length;

  // Simple word overlap score (Jaccard-like)
  const llamaSet = new Set(lt.toLowerCase().split(/\s+/));
  const gemmaSet = new Set(gt.toLowerCase().split(/\s+/));
  const intersection = [...llamaSet].filter((w) => gemmaSet.has(w)).length;
  const union = new Set([...llamaSet, ...gemmaSet]).size;
  const similarity = union > 0 ? Math.round((intersection / union) * 100) : 0;

  return {
    llamaWordCount: llamaWords,
    gemmaWordCount: gemmaWords,
    llamaCharCount: lt.length,
    gemmaCharCount: gt.length,
    wordSimilarity: similarity,
  };
}
