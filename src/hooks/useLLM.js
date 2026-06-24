import { useState, useCallback } from "react";
import { translate, translateWithBoth } from "../services/translationService";

export function useLLM() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const translateText = useCallback(async (text, sourceLang, targetLang, model = "llama") => {
    setIsLoading(true);
    setError(null);
    try {
      // Mengirimkan parameter model ("llama" atau "gemma") ke service
      const result = await translate(text, sourceLang, targetLang, model);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const translateBothModels = useCallback(async (text, sourceLang, targetLang) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await translateWithBoth(text, sourceLang, targetLang);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { translateText, translateBothModels, isLoading, error };
}