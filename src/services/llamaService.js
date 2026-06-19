const API_KEY = import.meta.env.VITE_META_AI_API_KEY;
const API_URL = "https://api.llama.com/v1/chat/completions";

const SYSTEM_PROMPT = `You are Flingo AI, an expert multilingual translation assistant. 
Translate text accurately while preserving tone, context, and cultural nuances. 
Always respond in valid JSON with this structure:
{
  "translation": "the translated text",
  "confidence": 0.0-1.0,
  "explanation": "brief explanation of translation choices",
  "alternatives": ["alt1", "alt2"]
}`;

export async function translateWithLlama(text, sourceLang, targetLang) {
  const userPrompt = `Translate the following text from ${sourceLang} to ${targetLang}:\n"${text}"\n\nRespond ONLY with valid JSON.`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "Llama-4-Maverick-17B-128E-Instruct-FP8",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Llama API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  try {
    const parsed = JSON.parse(content);
    return {
      translation: parsed.translation || content,
      confidence: parsed.confidence ?? 0.85,
      explanation: parsed.explanation || "",
      alternatives: parsed.alternatives || [],
      model: "Llama 3",
    };
  } catch {
    return {
      translation: content,
      confidence: 0.8,
      explanation: "",
      alternatives: [],
      model: "Llama 3",
    };
  }
}

export async function generateQuizWithLlama(prompt) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "Llama-4-Maverick-17B-128E-Instruct-FP8",
      messages: [
        { role: "system", content: "You generate language learning quiz content. Always respond with valid JSON only, no markdown." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) throw new Error(`Llama API error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
