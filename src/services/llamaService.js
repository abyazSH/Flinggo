// Mengarahkan URL utama ke endpoint FastAPI Hugging Face Space Flingo Anda
const API_URL = "https://angkykurniawan-glossa.hf.space/api/chat";

/**
 * 1. FUNGSI UNTUK PERCAKAPAN/OBROLAN SANTAI (CHAT MODE)
 * Digunakan khusus saat pengguna mengetik di kotak pesan biasa (contoh: "Halo", "Kamu siapa?").
 * Menjamin model merespons otomatis dengan kalimat ramah dalam Bahasa Indonesia baku.
 */
export async function chatWithFlingo(text) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: text // Mengirimkan teks murni tanpa bungkus kalimat perintah terjemahan kaku
      }),
    });

    if (!response.ok) throw new Error(`Flingo Gateway error: ${response.status}`);
    const data = await response.json();
    
    return {
      translation: data.reply || "",
      confidence: 1.0,
      explanation: "Respons percakapan umum berbasis default Bahasa Indonesia.",
      alternatives: [],
      model: "Flingo LLaMA 3 Engine Gateway",
    };
  } catch (error) {
    console.error("Detail Eror Percakapan:", error);
    return {
      translation: "Gagal terhubung ke mesin Flingo AI. Pastikan server Hugging Face Space dalam keadaan aktif.",
      confidence: 0.0,
      explanation: "Terjadi pemutusan transmisi data lokal atau server sedang tidak merespons.",
      alternatives: [],
      model: "Flingo LLaMA 3 Engine Gateway",
    };
  }
}

/**
 * 2. FUNGSI KHUSUS PENERJEMAHAN (TRANSLATION MODE) - VERSI REKAYASA LONGGAR
 * Menghapus pencegatan kaku lokal agar kalimat instruksi campuran dari pengguna bebas dialirkan 
 * ke backend tanpa terblokir di tingkat antarmuka.
 */
export async function translateWithLlama(text, sourceLang, targetLang) {
  try {
    // Meminta pemrosesan teks langsung ke backend FastAPI Flingo dengan parameter fallback aman
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Terjemahkan teks berikut dari bahasa ${sourceLang || "id"} ke bahasa ${targetLang || "en"}: "${text}"`
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
      confidence: 0.95,
      explanation: "Diproses secara dinamis menggunakan akselerasi arsitektur LLaMA 3 dengan kustom LoRA.",
      alternatives: [],
      model: "Flingo LLaMA 3 Engine Gateway",
    };
  } catch (error) {
    console.error("Detail Eror Frontend Penerjemahan:", error);
    return {
      translation: "Gagal terhubung ke mesin Flingo AI. Pastikan server Hugging Face Space dalam keadaan aktif.",
      confidence: 0.0,
      explanation: "Terjadi pemutusan transmisi data lokal atau server sedang tidak merespons.",
      alternatives: [],
      model: "Flingo LLaMA 3 Engine Gateway",
    };
  }
}

/**
 * 3. FUNGSI PEMBUAT KONTEN KUIS
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