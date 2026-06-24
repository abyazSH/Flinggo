const API_URL = "https://angkykurniawan-glossa2.hf.space/api/chat";

export async function translateWithGemma(text, sourceLang, targetLang) {
  try {
    const formattedSource = String(sourceLang).toUpperCase().strip();
    const formattedTarget = String(targetLang).toUpperCase().strip();
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `[SRC: ${formattedSource}] [TGT: ${formattedTarget}] Terjemahin santai: ${text.trim()}`
      }),
    });

    if (!response.ok) throw new Error(`Gemma Gateway error: ${response.status}`);
    const data = await response.json();
    
    return {
      translation: data.reply || "",
      confidence: 0.95,
      explanation: "Diproses secara dinamis menggunakan arsitektur Tatoeba-Translations Gemma 2.",
      alternatives: [],
      model: "Flingo Gemma Engine Gateway",
    };
  } catch (error) {
    return {
      translation: text,
      confidence: 0.0,
      explanation: error.message,
      alternatives: [],
      model: "Flingo Gemma Engine Gateway",
    };
  }
}

export async function generateQuizWithGemma(prompt) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Hasilkan konten kuis pembelajaran bahasa dalam Bahasa Indonesia berdasarkan instruksi berikut: ${prompt}`
      }),
    });

    if (!response.ok) throw new Error(`Gemma Gateway error: ${response.status}`);
    const data = await response.json();
    return data.reply || "";
  } catch (error) {
    throw new Error("Gagal memuat konten kuis dari mesin Flingo AI.");
  }
}