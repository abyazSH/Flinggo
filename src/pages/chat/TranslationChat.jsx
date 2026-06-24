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
// Mengimpor fungsi chat khusus untuk menangani percakapan santai di Flingo
import { chatWithFlingo } from "../../services/llamaService"; 

const GUEST_LIMIT = 5;
const STORAGE_KEY = "flingo_guest_translations";

export default function TranslationChat() {
  const { user } = useAuth();
  const { level, xp } = useGame();
  const navigate = useNavigate();
  const { translateText, translateBothModels, isLoading: isLlmLoading } = useLLM();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sourceLang, setSourceLang] = useState("id"); // Default ke "id" (Indonesia) sesuai target korpus
  const [targetLang, setTargetLang] = useState("en"); // Default ke "en" (Inggris)
  const [mode, setMode] = useState("llama");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const chatEndRef = useRef(null);

  const isLoading = isLlmLoading || isLocalLoading;

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  // === FUNGSI DETEKSI KONTEKS OTOMATIS: LUWES & PINTAR ===
  function isConversational(text) {
    const txt = text.toLowerCase().trim();
    const wordCount = txt.split(/\s+/).length;

    // 1. Cek jika mengandung kata kunci sapaan dasar atau pencarian identitas Flingo
    const chatKeywords = [
      "halo", "hai", "hello", "hi", "haloo", "helo", "apa kabar", "kamu siapa", 
      "siapa", "nama", "pengembang", "pembuat", "terima kasih", "thanks", "makasih", "test"
    ];
    const hasKeyword = chatKeywords.some(keyword => txt.includes(keyword));

    // 2. Jika kalimatnya pendek (di bawah 4 kata) dan TIDAK mengandung kata perintah translasi formal
    const isShortQuery = wordCount < 4 && !txt.includes("terjemahkan") && !txt.includes("translate") && !txt.includes("penerjemahan");

    // Jika salah satu dari kondisi di atas terpenuhi, maka masuk Chat Mode
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
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    if (isGuest) incrementGuestCount();

    try {
      // PERCABANGAN LOGIKA: Memisahkan Chat Mode dan Translation Mode secara bersih
      if (isConversational(currentInput)) {
        setIsLocalLoading(true);
        const result = await chatWithFlingo(currentInput);
        const botMsg = {
          id: Date.now() + 1,
          isUser: false,
          text: result.translation,
          model: "Flingo",
          // explanation: "Respons percakapan umum berbasis default Bahasa Indonesia.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsLocalLoading(false);
      } else if (mode === "compare") {
        const result = await translateBothModels(currentInput, sourceLang, targetLang);
        const botMsg = {
          id: Date.now() + 1, isUser: false, isComparison: true,
          llamaResult: result.llama, gemmaResult: result.gemma, comparison: result.comparison,
          sourceText: currentInput, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
        if (user) saveTranslation({ userId: user.id, sourceLang, targetLang, inputText: currentInput, llamaOutput: result.llama?.translation, gemmaOutput: result.gemma?.translation, selectedModel: "compare" }).catch(console.error);
      } else {
        const result = await translateText(currentInput, sourceLang, targetLang, mode);
        const botMsg = {
          id: Date.now() + 1, isUser: false, text: result.translation, model: result.model,
          // explanation: result.explanation, 
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
        if (user) saveTranslation({ userId: user.id, sourceLang, targetLang, inputText: currentInput, llamaOutput: mode === "llama" ? result.translation : null, gemmaOutput: mode === "gemma" ? result.translation : null, selectedModel: mode }).catch(console.error);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { id: Date.now() + 1, isUser: false, text: `Error: ${err.message}`, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
      setIsLocalLoading(false);
    }
  }

  const srcLang = getLanguageByCode(sourceLang);
  const tgtLang = getLanguageByCode(targetLang);
  const translationCount = messages.filter((m) => !m.isUser).length;

  return (
    <div className="flex h-full relative">
      {/* Login modal */}
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

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header controls */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="border-b border-base-300 bg-base-100/80 backdrop-blur-sm px-4 py-3 flex flex-col gap-3">
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center justify-center h-full text-center gap-4">
              <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl">💬</motion.span>
              <div>
                <p className="text-lg font-semibold">
                  {isGuest ? "Coba Flingo AI Secara Gratis" : "Mulai percakapan bersama Flingo"}
                </p>
                <p className="text-sm text-base-content/50 max-w-sm mt-1">
                  Ketik teks dalam bahasa {srcLang.name} untuk mendapatkan terjemahan instan ke bahasa {tgtLang.name} yang didukung oleh {mode === "compare" ? "Llama 3 & Gemma 3" : mode === "llama" ? "Llama 3" : "Gemma 3"}.
                </p>
              </div>
              {isGuest && (
                <div className="badge badge-outline badge-sm gap-1">
                  <span>🎁</span> Tersedia {GUEST_LIMIT} kuota gratis uji coba
                </div>
              )}
              <div className="flex gap-2 mt-2 flex-wrap justify-center">
                {["Halo, kamu siapa?", "Saye nak pergi besok", "Where is the restaurant?", "Apa kabar?"].map((sample, i) => (
                  <motion.button
                    key={sample}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-outline btn-sm"
                    onClick={() => setInput(sample)}
                  >
                    {sample}
                  </motion.button>
                ))}
              </div>
              {!isGuest && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex gap-4 mt-4 text-xs text-base-content/40">
                  <span>🤖 Dual Mesin AI</span>
                  <span>🌍 3 Bahasa Terintegrasi</span>
                  <span>♾️ Akses Tak Terbatas</span>
                </motion.div>
              )}
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg) =>
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

        {/* Input bar */}
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

      {/* Right sidebar — only for authenticated users */}
      <AnimatePresence>
        {user && showHistory && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-l border-l-base-300 bg-base-100 overflow-hidden flex-shrink-0"
          >
            <div className="w-[280px] p-4 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold">Info Sesi</h3>
                <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setShowHistory(false)}>✕</button>
              </div>

              {/* User stats card */}
              <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border border-base-300 mb-4">
                <div className="card-body p-3 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="badge badge-primary badge-sm">Lv {level}</div>
                    <div className="badge badge-ghost badge-sm">⭐ {xp.toLocaleString()} XP</div>
                  </div>
                  <p className="text-xs text-base-content/50 mt-1">Interaksi sesi ini: <span className="font-bold text-base-content">{translationCount}</span></p>
                </div>
              </div>

              {/* Active models */}
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-wider text-base-content/40 font-semibold mb-2">Model Aktif</p>
                <div className="flex gap-1.5">
                  {mode === "llama" && <div className="badge badge-sm bg-blue-500/10 text-blue-500 border-blue-500/20">🦙 Llama 3</div>}
                  {mode === "gemma" && <div className="badge badge-sm bg-emerald-500/10 text-emerald-500 border-emerald-500/20">💎 Gemma 3</div>}
                  {mode === "compare" && (
                    <>
                      <div className="badge badge-sm bg-blue-500/10 text-blue-500 border-blue-500/20">🦙 Llama 3</div>
                      <div className="badge badge-sm bg-emerald-500/10 text-emerald-500 border-emerald-500/20">💎 Gemma 3</div>
                    </>
                  )}
                </div>
              </div>

              {/* Languages */}
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-wider text-base-content/40 font-semibold mb-2">Bahasa</p>
                <div className="flex items-center gap-2 text-sm">
                  <span>{srcLang.flag}</span>
                  <span className="text-xs">{srcLang.name}</span>
                  <span className="text-base-content/30">→</span>
                  <span>{tgtLang.flag}</span>
                  <span className="text-xs">{tgtLang.name}</span>
                </div>
              </div>

              {/* Recent translations */}
              <div className="flex-1 overflow-y-auto">
                <p className="text-[10px] uppercase tracking-wider text-base-content/40 font-semibold mb-2">Interaksi Terakhir</p>
                {messages.filter((m) => m.isUser).length === 0 ? (
                  <p className="text-xs text-base-content/30 text-center py-6">Belum ada aktivitas</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {messages.filter((m) => m.isUser).slice(-10).reverse().map((msg) => (
                      <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-base-200 rounded-lg p-2.5 text-xs">
                        <p className="truncate font-medium">{msg.text}</p>
                        <p className="text-base-content/40 mt-0.5">{msg.timestamp}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="border-t border-base-300 pt-3 mt-3 flex flex-col gap-1.5">
                <button className="btn btn-ghost btn-xs justify-start gap-2" onClick={() => { setMessages([]); }}>🗑️ Bersihkan obrolan</button>
                <button className="btn btn-ghost btn-xs justify-start gap-2" onClick={() => navigate("/progress")}>📊 Lihat progres</button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}