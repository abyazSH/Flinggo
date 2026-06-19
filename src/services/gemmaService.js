import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `You are Flingo AI, an expert multilingual translation assistant. 
Translate text accurately while preserving tone, context, and cultural nuances. 
Always respond in valid JSON with this structure:
{
  "translation": "the translated text",
  "confidence": 0.0-1.0,
  "explanation": "brief explanation of translation choices",
  "alternatives": ["alt1", "alt2"]
}`;

export async function translateWithGemma(text, sourceLang, targetLang) {
  const model = genAI.getGenerativeModel({
    model: "gemma-3-27b-it",
    systemInstruction: SYSTEM_PROMPT,
  });

  const userPrompt = `Translate the following text from ${sourceLang} to ${targetLang}:\n"${text}"\n\nRespond ONLY with valid JSON.`;

  const result = await model.generateContent(userPrompt);
  const content = result.response.text();

  try {
    const parsed = JSON.parse(content);
    return {
      translation: parsed.translation || content,
      confidence: parsed.confidence ?? 0.85,
      explanation: parsed.explanation || "",
      alternatives: parsed.alternatives || [],
      model: "Gemma 3",
    };
  } catch {
    return {
      translation: content,
      confidence: 0.8,
      explanation: "",
      alternatives: [],
      model: "Gemma 3",
    };
  }
}

export async function generateQuizWithGemma(prompt) {
  const model = genAI.getGenerativeModel({
    model: "gemma-3-27b-it",
    systemInstruction: "You generate language learning quiz content. Always respond with valid JSON only, no markdown.",
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}
