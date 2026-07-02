const API_URL = "https://angkykurniawan-glossa.hf.space/api/chat/llama";

/**
 * 1. FUNGSI CHAT / OBROLAN UMUM
 * Digunakan untuk menangani percakapan kasual interaktif langsung ke backend gateway.
 */
export async function chatWithFlingo(text) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: text 
      }),
    });

    if (!response.ok) throw new Error(`Flingo Gateway error: ${response.status}`);
    const data = await response.json();
    
    return {
      translation: data.reply || "",
      explanation: "Respons percakapan umum berbasis default Bahasa Indonesia.",
      alternatives: [],
      model: "Flingo LLaMA 3 Engine Gateway",
    };
  } catch (error) {
    console.error("Detail Eror Percakapan:", error);
    return {
      translation: "Gagal terhubung ke mesin Flingo AI. Pastikan server Hugging Face Space dalam keadaan aktif.",
      explanation: "Terjadi pemutusan transmisi data lokal atau server sedang tidak merespons.",
      alternatives: [],
      model: "Flingo LLaMA 3 Engine Gateway",
    };
  }
}

/**
 * 2. FUNGSI KHUSUS PENERJEMAHAN (TRANSLATION MODE) - VERSI REKAYASA LONGGAR
 * Mempertahankan format instruksi asli. Parameter sourceLang dan targetLang otomatis 
 * diekstrak di tingkat backend Space (app.py) menggunakan regex.
 */
export async function translateWithLlama(text, sourceLang, targetLang) {
  try {
    // Memastikan jika parameter code bahasa kosong/berupa objek utuh, berikan fallback string aman
    const src = typeof sourceLang === 'string' ? sourceLang : "id";
    const tgt = typeof targetLang === 'string' ? targetLang : "en";

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Terjemahkan teks berikut dari bahasa ${src} ke bahasa ${tgt}: "${text}"`
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Flingo Gateway error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const content = data.reply || "";

    return {
      translation: content,
      explanation: "Diproses secara dinamis menggunakan akselerasi arsitektur LLaMA 3 dengan kustom Glossa Model.",
      alternatives: [],
      model: "Flingo LLaMA 3 Engine Gateway",
    };
  } catch (error) {
    console.error("Detail Eror Frontend Penerjemahan:", error);
    return {
      translation: "Gagal terhubung ke mesin Flingo AI. Pastikan server Hugging Face Space dalam keadaan aktif.",
      explanation: "Terjadi pemutusan transmisi data lokal atau server sedang tidak merespons.",
      alternatives: [],
      model: "Flingo LLaMA 3 Engine Gateway",
    };
  }
}

/**
 * 3. FUNGSI PEMBUAT KONTEN KUIS
 * Mengirimkan permintaan pembuatan set kuis interaktif ke backend gateway.
 */
export async function generateQuizWithLlama(prompt) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Hasilkan konten kuis pembelajaran bahasa dalam Bahasa Indonesia berdasarkan instruksi berikut: ${prompt}`
      }),
    });

    if (!response.ok) throw new Error(`Flingo Gateway error: ${response.status}`);
    const data = await response.json();
    return data.reply || "";
  } catch (error) {
    console.error("Detail Eror Kuis:", error);
    throw new Error("Gagal memuat konten kuis dari mesin Flingo AI.");
  }
}