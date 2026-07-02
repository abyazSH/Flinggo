import { translateWithLlama } from "./llamaService";
import { getLanguageName } from "../config/languages";

/**
 * Translate menggunakan satu model (Sekarang sepenuhnya dialihkan ke LLaMA 3 Glossa).
 * @param {string} text
 * @param {string} sourceLangCode - e.g. "en"
 * @param {string} targetLangCode - e.g. "es"
 * @param {"llama"} model - (Gemma parameter diabaikan/deprecated)
 */
export async function translate(text, sourceLangCode, targetLangCode, model = "llama") {
  const sourceLang = getLanguageName(sourceLangCode);
  const targetLang = getLanguageName(targetLangCode);

  // Fallback otomatis jika UI masih mengirim string parameter "gemma"
  return translateWithLlama(text, sourceLang, targetLang);
}

/**
 * Translate menggunakan LLaMA Glossa Engine (Fungsi pembanding dipertahankan dengan mock data kosong untuk Gemma).
 * Hal ini dilakukan agar komponen UI perbandingan Anda di React tidak patah atau error.
 */
export async function translateWithBoth(text, sourceLangCode, targetLangCode) {
  const sourceLang = getLanguageName(sourceLangCode);
  const targetLang = getLanguageName(targetLangCode);

  // Hanya memanggil LLaMA service karena Gemma sudah dinonaktifkan di backend
  const [llama] = await Promise.allSettled([
    translateWithLlama(text, sourceLang, targetLang),
  ]);

  const llamaResult = llama.status === "fulfilled" ? llama.value : { 
    translation: "Error: " + llama.reason?.message, 
    explanation: "Gagal terhubung ke gateway.", 
    alternatives: [], 
    model: "Flingo LLaMA 3 Engine Gateway" 
  };

  // Mock respons Gemma sebagai penanda dinonaktifkan agar state UI comparison tetap aman
  const gemmaResult = { 
    translation: "[Engine Gemma Dinonaktifkan - Beralih Penuh ke LLaMA Glossa]", 
    explanation: "Sistem backend bermigrasi ke arsitektur LLaMA tunggal.", 
    alternatives: [], 
    model: "Gemma 2 (Deprecated)" 
  };

  return {
    llama: llamaResult,
    gemma: gemmaResult,
    comparison: compareResults(llamaResult, gemmaResult),
  };
}

/**
 * Metrik komparasi dasar antara dua output teks terjemahan.
 */
export function compareResults(llamaOutput, gemmaOutput) {
  if (!llamaOutput || !gemmaOutput) return null;

  const lt = llamaOutput.translation || "";
  const gt = gemmaOutput.translation || "";

  const llamaWords = lt.split(/\s+/).filter(Boolean).length;
  const gemmaWords = gt.split(/\s+/).filter(Boolean).length;

  // Skor overlap kata sederhana (Jaccard-like)
  const llamaSet = new Set(lt.toLowerCase().split(/\s+/).filter(Boolean));
  const gemmaSet = new Set(gt.toLowerCase().split(/\s+/).filter(Boolean));
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