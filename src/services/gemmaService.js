const API_URL = "https://angkykurniawan-glossa.hf.space/api/chat/gemma";

/**
 * 1. FUNGSI PERCAKAPAN UMUM (CHAT MODE)
 */
export async function chatWithGemma(text) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: text,
      }),
    });

    if (!response.ok)
      throw new Error(`Gemma Gateway error: ${response.status}`);

    const data = await response.json();

    return {
      translation: data.reply || "",
      explanation: "Respons percakapan umum berbasis default Bahasa Indonesia.",
      alternatives: [],
      model: "Flingo Gemma Engine Gateway",
    };
  } catch (error) {
    console.error("Detail Eror Percakapan:", error);

    return {
      translation:
        "Gagal terhubung ke mesin Flingo AI. Pastikan server Hugging Face Space dalam keadaan aktif.",
      explanation:
        "Terjadi pemutusan transmisi data lokal atau server sedang tidak merespons.",
      alternatives: [],
      model: "Flingo Gemma Engine Gateway",
    };
  }
}

/**
 * 2. FUNGSI KHUSUS PENERJEMAHAN (TRANSLATION MODE)
 */
export async function translateWithGemma(
  text,
  sourceLang,
  targetLang
) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Terjemahkan teks berikut dari bahasa ${
          sourceLang || "id"
        } ke bahasa ${
          targetLang || "en"
        }: "${text}"`
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(
        `Gemma Gateway error: ${response.status} - ${err}`
      );
    }

    const data = await response.json();
    const content = data.reply || "";

    return {
      translation: content,
      explanation:
        "Diproses secara dinamis menggunakan arsitektur Tatoeba-Translations Gemma 2.",
      alternatives: [],
      model: "Flingo Gemma Engine Gateway",
    };
  } catch (error) {
    console.error(
      "Detail Eror Frontend Penerjemahan:",
      error
    );

    return {
      translation:
        "Gagal terhubung ke mesin Flingo AI. Pastikan server Hugging Face Space dalam keadaan aktif.",
      explanation:
        "Terjadi pemutusan transmisi data lokal atau server sedang tidak merespons.",
      alternatives: [],
      model: "Flingo Gemma Engine Gateway",
    };
  }
}

/**
 * 3. FUNGSI PEMBUAT KONTEN KUIS
 */
export async function generateQuizWithGemma(prompt) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Hasilkan konten kuis pembelajaran bahasa dalam Bahasa Indonesia berdasarkan instruksi berikut: ${prompt}`,
      }),
    });

    if (!response.ok)
      throw new Error(`Gemma Gateway error: ${response.status}`);

    const data = await response.json();

    return data.reply || "";
  } catch (error) {
    console.error("Detail Eror Kuis:", error);

    throw new Error(
      "Gagal memuat konten kuis dari mesin Flingo AI."
    );
  }
}