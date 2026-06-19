import { useState, useRef, useEffect } from "react";
import LanguageSelector from "../../components/LanguageSelector";
import ModelToggle from "../../components/ModelToggle";
import ChatBubble from "../../components/ChatBubble";
import ModelComparison from "./ModelComparison";
import { useLLM } from "../../hooks/useLLM";
import { useAuth } from "../../contexts/AuthContext";
import { saveTranslation } from "../../services/supabaseService";
import { getLanguageByCode } from "../../config/languages";

export default function TranslationChat() {
  const { user } = useAuth();
  const { translateText, translateBothModels, isLoading } = useLLM();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [mode, setMode] = useState("llama");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSwap() {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  }

  async function handleSend(e) {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      isUser: true,
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);

    const text = input.trim();
    setInput("");

    try {
      if (mode === "compare") {
        const result = await translateBothModels(text, sourceLang, targetLang);
        const botMsg = {
          id: Date.now() + 1,
          isUser: false,
          isComparison: true,
          llamaResult: result.llama,
          gemmaResult: result.gemma,
          comparison: result.comparison,
          sourceText: text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);

        if (user) {
          saveTranslation({
            userId: user.id, sourceLang, targetLang, inputText: text,
            llamaOutput: result.llama?.translation, gemmaOutput: result.gemma?.translation,
            selectedModel: "compare",
          }).catch(console.error);
        }
      } else {
        const result = await translateText(text, sourceLang, targetLang, mode);
        const botMsg = {
          id: Date.now() + 1,
          isUser: false,
          text: result.translation,
          model: result.model,
          explanation: result.explanation,
          confidence: result.confidence,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);

        if (user) {
          saveTranslation({
            userId: user.id, sourceLang, targetLang, inputText: text,
            llamaOutput: mode === "llama" ? result.translation : null,
            gemmaOutput: mode === "gemma" ? result.translation : null,
            selectedModel: mode,
          }).catch(console.error);
        }
      }
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        isUser: false,
        text: `Error: ${err.message}. Please check your API keys and try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  }

  const srcLang = getLanguageByCode(sourceLang);
  const tgtLang = getLanguageByCode(targetLang);

  return (
    <div className="flex flex-col h-full">
      {/* Header controls */}
      <div className="border-b border-base-300 bg-base-100 px-4 py-3 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <LanguageSelector
            sourceLang={sourceLang}
            targetLang={targetLang}
            onSourceChange={setSourceLang}
            onTargetChange={setTargetLang}
            onSwap={handleSwap}
          />
          <ModelToggle mode={mode} onChange={setMode} />
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-60">
            <span className="text-5xl">💬</span>
            <p className="text-base font-medium">Start a translation conversation</p>
            <p className="text-sm max-w-xs">
              Type text in {srcLang.name} and get instant translations in {tgtLang.name} powered by AI.
            </p>
            <div className="flex gap-2 mt-2">
              {["Hello, how are you?", "Good morning!", "Thank you very much"].map((sample) => (
                <button
                  key={sample}
                  className="btn btn-outline btn-xs"
                  onClick={() => setInput(sample)}
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) =>
          msg.isComparison ? (
            <div key={msg.id} className="mb-4">
              <p className="text-xs text-base-content/50 mb-2">
                Translating: "{msg.sourceText}" ({srcLang.flag} → {tgtLang.flag})
              </p>
              <ModelComparison
                llamaResult={msg.llamaResult}
                gemmaResult={msg.gemmaResult}
                comparison={msg.comparison}
              />
            </div>
          ) : (
            <ChatBubble
              key={msg.id}
              message={{
                text: msg.text,
                model: msg.model,
                explanation: msg.explanation,
                confidence: msg.confidence,
              }}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
            />
          )
        )}

        {isLoading && (
          <div className="chat chat-start">
            <div className="chat-bubble chat-bubble-neutral">
              <span className="loading loading-dots loading-sm" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="border-t border-base-300 bg-base-100 px-4 py-3 flex gap-2">
        <input
          type="text"
          className="input input-bordered input-sm flex-1 text-sm"
          placeholder={`Type in ${srcLang.name} to translate to ${tgtLang.name}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={isLoading || !input.trim()}>
          {isLoading ? <span className="loading loading-spinner loading-xs" /> : "Send"}
        </button>
      </form>
    </div>
  );
}
