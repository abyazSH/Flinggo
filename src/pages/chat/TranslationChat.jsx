import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSelector from "../../components/LanguageSelector";
import ModelToggle from "../../components/ModelToggle";
import ChatBubble from "../../components/ChatBubble";
import ModelComparison from "./ModelComparison";
import { useLLM } from "../../hooks/useLLM";
import { useAuth } from "../../contexts/AuthContext";
import { useGame } from "../../contexts/GameContext";
import { saveTranslation } from "../../services/supabaseService";
import { getLanguageByCode } from "../../config/languages";
import { chatWithFlingo } from "../../services/llamaService"; 

const GUEST_LIMIT = 5;
const STORAGE_KEY = "flingo_guest_translations";

export default function TranslationChat() {
  const { user } = useAuth();
  const { level, xp } = useGame();
  const navigate = useNavigate();
  const { translateText, translateBothModels, isLoading: isLlmLoading } = useLLM();
  
  // State manajemen riwayat obrolan per model
  const [llamaMessages, setLlamaMessages] = useState([]);
  const [gemmaMessages, setGemmaMessages] = useState([]);
  const [compareMessages, setCompareMessages] = useState([]);
  
  const [input, setInput] = useState("");
  const [sourceLang, setSourceLang] = useState("id"); 
  const [targetLang, setTargetLang] = useState("en"); 
  const [mode, setMode] = useState("llama"); // "llama", "gemma", atau "compare"
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const chatEndRef = useRef(null);

  const isLoading = isLlmLoading || isLocalLoading;

  // Render obrolan sesuai dengan model yang sedang aktif
  const activeMessages = mode === "llama" 
    ? llamaMessages 
    : mode === "gemma" 
      ? gemmaMessages 
      : compareMessages;

  const [guestCount, setGuestCount] = useState(() => {
    if (user) return 0;
    return parseInt(sessionStorage.getItem(STORAGE_KEY) || "0", 10);
  });

  useEffect(() => {
    if (user) {
      setGuestCount(0);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // Gulir otomatis layar chat jika ada pesan baru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, mode]);

  // FITUR UTAMA: Bersihkan total apa pun teks yang sedang diketik ketika klik pindah tab model
  useEffect(() => {
    setInput(""); 
  }, [mode]);

  const isGuest = !user;
  const remaining = isGuest ? GUEST_LIMIT - guestCount : Infinity;

  function handleSwap() {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  }

  function incrementGuestCount() {
    const newCount = guestCount + 1;
    setGuestCount(newCount);
    sessionStorage.setItem(STORAGE_KEY, String(newCount));
    return newCount;
  }

  function isConversational(text) {
    const txt = text.toLowerCase().trim();
    const wordCount = txt.split(/\s+/).length;

    const chatKeywords = [
      "halo", "hai", "hello", "hi", "haloo", "helo", "apa kabar", "kamu siapa", 
      "siapa", "nama", "pengembang", "pembuat", "terima kasih", "thanks", "makasih", "test"
    ];
    const hasKeyword = chatKeywords.some(keyword => txt.includes(keyword));
    const isShortQuery = wordCount < 4 && !txt.includes("terjemahkan") && !txt.includes("translate") && !txt.includes("penerjemahan");

    return hasKeyword || isShortQuery;
  }

  async function handleSend(e) {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    if (isGuest && guestCount >= GUEST_LIMIT) {
      setShowLoginModal(true);
      return;
    }

    const currentInput = input.trim();

    const userMsg = {
      id: Date.now(),
      isUser: true,
      text: currentInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Salurkan pesan user ke model yang sedang aktif
    if (mode === "llama") setLlamaMessages((prev) => [...prev, userMsg]);
    if (mode === "gemma") setGemmaMessages((prev) => [...prev, userMsg]);
    if (mode === "compare") setCompareMessages((prev) => [...prev, userMsg]);

    setInput("");
    if (isGuest) incrementGuestCount();

    try {
      // MODE COMPARE
      if (mode === "compare") {
        const result = await translateBothModels(currentInput, sourceLang, targetLang);
        const botMsg = {
          id: Date.now() + 1, isUser: false, isComparison: true,
          llamaResult: result.llama, gemmaResult: result.gemma, comparison: result.comparison,
          sourceText: currentInput, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setCompareMessages((prev) => [...prev, botMsg]);
        if (user) saveTranslation({ userId: user.id, sourceLang, targetLang, inputText: currentInput, llamaOutput: result.llama?.translation, gemmaOutput: result.gemma?.translation, selectedModel: "compare" }).catch(console.error);
      } 
      // MODE LLAMA MURNI
      else if (mode === "llama") {
        if (isConversational(currentInput)) {
          setIsLocalLoading(true);
          const result = await chatWithFlingo(currentInput);
          const botMsg = {
            id: Date.now() + 1, isUser: false, text: result.translation || result, model: "Flingo LLaMA Chatbot",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setLlamaMessages((prev) => [...prev, botMsg]);
          setIsLocalLoading(false);
        } else {
          const result = await translateText(currentInput, sourceLang, targetLang, "llama");
          const botMsg = {
            id: Date.now() + 1, isUser: false, text: result.translation, model: "Flingo LLaMA Translasi",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setLlamaMessages((prev) => [...prev, botMsg]);
          if (user) saveTranslation({ userId: user.id, sourceLang, targetLang, inputText: currentInput, llamaOutput: result.translation, gemmaOutput: null, selectedModel: "llama" }).catch(console.error);
        }
      } 
      // MODE GEMMA MURNI
      else if (mode === "gemma") {
        const result = await translateText(currentInput, sourceLang, targetLang, "gemma");
        const botMsg = {
          id: Date.now() + 1, isUser: false, text: result.translation, model: "Flingo Gemma Engine",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setGemmaMessages((prev) => [...prev, botMsg]);
        if (user) saveTranslation({ userId: user.id, sourceLang, targetLang, inputText: currentInput, llamaOutput: null, gemmaOutput: result.translation, selectedModel: "gemma" }).catch(console.error);
      }
    } catch (err) {
      const errorMsg = { id: Date.now() + 1, isUser: false, text: `Error Gateway: ${err.message}`, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
      if (mode === "llama") setLlamaMessages((prev) => [...prev, errorMsg]);
      if (mode === "gemma") setGemmaMessages((prev) => [...prev, errorMsg]);
      if (mode === "compare") setCompareMessages((prev) => [...prev, errorMsg]);
      setIsLocalLoading(false);
    }
  }

  const srcLang = getLanguageByCode(sourceLang);
  const tgtLang = getLanguageByCode(targetLang);
  const totalInteractionsCount = llamaMessages.filter(m => !m.isUser).length + gemmaMessages.filter(m => !m.isUser).length + compareMessages.filter(m => !m.isUser).length;

  return (
    <div className="flex h-full relative">
      <AnimatePresence>
        {showLoginModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="card bg-base-100 border border-base-300 w-full max-w-sm mx-4 shadow-2xl">
              <div className="card-body items-center text-center gap-4 p-6">
                <motion.span animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }} className="text-5xl">🔒</motion.span>
                <h2 className="text-lg font-bold">Batas uji coba gratis tercapai</h2>
                <p className="text-sm text-base-content/60">Anda telah menggunakan semua {GUEST_LIMIT} terjemahan gratis. Masuk untuk akses tanpa batas.</p>
                <div className="flex flex-col gap-2 w-full mt-2">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn btn-primary btn-sm w-full" onClick={() => navigate("/register")}>Buat akun gratis</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn btn-ghost btn-sm w-full" onClick={() => navigate("/login")}>Masuk</motion.button>
                </div>
                <button className="btn btn-ghost btn-xs mt-1" onClick={() => setShowLoginModal(false)}>Tutup</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="border-b border-b-base-300 bg-base-100/80 backdrop-blur-sm px-4 py-3 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <LanguageSelector sourceLang={sourceLang} targetLang={targetLang} onSourceChange={setSourceLang} onTargetChange={setTargetLang} onSwap={handleSwap} />
            <div className="flex items-center gap-2">
              {isGuest && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`badge badge-sm ${remaining <= 2 ? "badge-warning" : "badge-ghost"}`}>
                  Sisa {remaining} terjemahan gratis
                </motion.div>
              )}
              <ModelToggle mode={mode} onChange={setMode} />
              {user && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`btn btn-ghost btn-sm btn-circle ${showHistory ? "btn-active" : ""}`} onClick={() => setShowHistory(!showHistory)} title="Riwayat terjemahan">
                  📋
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {activeMessages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center justify-center h-full text-center gap-4">
              <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl">💬</motion.span>
              <div>
                <p className="text-lg font-semibold">
                  Ruang Obrolan {mode === "llama" ? "Llama 3" : mode === "gemma" ? "Gemma 2" : "Komparasi Model"}
                </p>
                <p className="text-sm text-base-content/50 max-w-sm mt-1">
                  Ketik teks dalam bahasa {srcLang.name} untuk mendapatkan keluaran respons murni di tab khusus {mode === "llama" ? "Llama 3" : mode === "gemma" ? "Gemma 2" : "Dual-Engine Compare"}.
                </p>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap justify-center">
                {["Halo, kamu siapa?", "Saye nak pergi besok", "Where is the restaurant?"].map((sample) => (
                  <button key={sample} className="btn btn-outline btn-sm text-xs" onClick={() => setInput(sample)}>
                    {sample}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {activeMessages.map((msg) =>
              msg.isComparison ? (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4">
                  <p className="text-xs text-base-content/50 mb-2">Menerjemahkan: "{msg.sourceText}" ({srcLang.flag} → {tgtLang.flag})</p>
                  <ModelComparison llamaResult={msg.llamaResult} gemmaResult={msg.gemmaResult} comparison={msg.comparison} />
                </motion.div>
              ) : (
                <motion.div key={msg.id} initial={{ opacity: 0, x: msg.isUser ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <ChatBubble message={{ text: msg.text, model: msg.model }} isUser={msg.isUser} timestamp={msg.timestamp} />
                </motion.div>
              )
            )}
          </AnimatePresence>

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="chat chat-start">
              <div className="chat-bubble bg-gradient-to-r from-primary/10 to-secondary/10 border border-base-300">
                <span className="loading loading-dots loading-sm text-primary" />
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSend} className="border-t border-base-300 bg-base-100/80 backdrop-blur-sm px-4 py-3 flex gap-2">
          <input
            type="text"
            className="input input-bordered input-sm flex-1 text-sm"
            placeholder={isGuest && guestCount >= GUEST_LIMIT ? "Batas uji coba gratis habis — silakan masuk..." : `Ketik dalam bahasa ${srcLang.name} untuk berinteraksi...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || (isGuest && guestCount >= GUEST_LIMIT)}
          />
          <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-primary btn-sm shadow-md shadow-primary/20" disabled={isLoading || !input.trim()}>
            {isLoading ? <span className="loading loading-spinner loading-xs" /> : "Kirim"}
          </motion.button>
        </form>
      </div>

      <AnimatePresence>
        {user && showHistory && (
          <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="border-l border-l-base-300 bg-base-100 overflow-hidden flex-shrink-0">
            <div className="w-[280px] p-4 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold">Info Sesi</h3>
                <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setShowHistory(false)}>✕</button>
              </div>

              <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border border-base-300 mb-4">
                <div className="card-body p-3 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="badge badge-primary badge-sm">Lv {level}</div>
                    <div className="badge badge-ghost badge-sm">⭐ {xp.toLocaleString()} XP</div>
                  </div>
                  <p className="text-xs text-base-content/50 mt-1">Interaksi total sesi: <span className="font-bold text-base-content">{totalInteractionsCount}</span></p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-wider text-base-content/40 font-semibold mb-2">Model Aktif</p>
                <div className="flex gap-1.5">
                  {mode === "llama" && <div className="badge badge-sm bg-blue-500/10 text-blue-500 border-blue-500/20">🦙 Llama 3</div>}
                  {mode === "gemma" && <div className="badge badge-sm bg-emerald-500/10 text-emerald-500 border-emerald-500/20">💎 Gemma 2</div>}
                  {mode === "compare" && (
                    <>
                      <div className="badge badge-sm bg-blue-500/10 text-blue-500 border-blue-500/20">🦙 Llama 3</div>
                      <div className="badge badge-sm bg-emerald-500/10 text-emerald-500 border-emerald-500/20">💎 Gemma 2</div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <p className="text-[10px] uppercase tracking-wider text-base-content/40 font-semibold mb-2">Aktivitas Terakhir di Tab Ini</p>
                {activeMessages.filter((m) => m.isUser).length === 0 ? (
                  <p className="text-xs text-base-content/30 text-center py-6">Belum ada aktivitas di model ini</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {activeMessages.filter((m) => m.isUser).slice(-5).reverse().map((msg) => (
                      <div key={msg.id} className="bg-base-200 rounded-lg p-2 text-xs">
                        <p className="truncate font-medium">{msg.text}</p>
                        <p className="text-[10px] text-base-content/40 mt-0.5">{msg.timestamp}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-base-300 pt-3 mt-3 flex flex-col gap-1.5">
                <button className="btn btn-ghost btn-xs justify-start gap-2" onClick={() => {
                  if (mode === "llama") setLlamaMessages([]);
                  if (mode === "gemma") setGemmaMessages([]);
                  if (mode === "compare") setCompareMessages([]);
                }}>🗑️ Bersihkan tab ini</button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}