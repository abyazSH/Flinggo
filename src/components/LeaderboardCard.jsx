import { useState } from "react";
import { leaderboard } from "../data/mockData";
import { motion, AnimatePresence } from "framer-motion";

const medals = ["🥇", "🥈", "🥉"];
const ITEMS_PER_PAGE = 10; // Batasan tampilan 10 data per halaman

export default function LeaderboardCard() {
  const [currentPage, setCurrentPage] = useState(1);

  // Menghitung indeks data untuk pagination
  const totalPages = Math.ceil(leaderboard.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = leaderboard.slice(startIndex, endIndex);

  // Variasi animasi untuk daftar peringkat
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.03 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -5 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 120 } }
  };

  return (
    <div className="card bg-base-100 border border-base-300/70 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="card-body p-5 gap-4">
        
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🏆</span>
            <h3 className="text-sm font-bold tracking-wide text-base-content/90">
              Leaderboard Minggu Ini
            </h3>
          </div>
          <span className="text-[11px] font-semibold opacity-50 bg-base-200 px-2.5 py-1 rounded-md">
            Halaman {currentPage} dari {totalPages}
          </span>
        </div>

        {/* List Peringkat Pengguna (Render dinamis per 10 data) */}
        <AnimatePresence mode="wait">
          <motion.ul 
            key={currentPage} // Memicu ulang animasi setiap kali halaman berubah
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-1.5 min-h-[520px]" // Menjaga tinggi kontainer agar tidak melompat-lompat
          >
            {currentData.map((user) => {
              const isTop3 = user.rank <= 3;
              
              return (
                <motion.li
                  key={user.rank}
                  variants={itemVariants}
                  className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                    user.isMe 
                      ? "bg-primary/10 border border-primary/20 shadow-sm shadow-primary/5" 
                      : "hover:bg-base-200/50"
                  }`}
                >
                  {/* Kolom Peringkat / Medali */}
                  <span className="text-base w-6 text-center font-bold flex-shrink-0">
                    {isTop3 ? medals[user.rank - 1] : <span className="text-xs text-base-content/35">{user.rank}</span>}
                  </span>

                  {/* Avatar Bulat Placeholder */}
                  <div className="avatar placeholder flex-shrink-0">
                    <div className={`${user.color} rounded-full w-8 h-8 text-[11px] font-bold shadow-inner flex items-center justify-center text-white`}>
                      <span>{user.initials}</span>
                    </div>
                  </div>

                  {/* Info Akun & Info Streak */}
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <p className={`text-xs font-bold truncate ${user.isMe ? "text-primary" : "text-base-content/90"}`}>
                      {user.name} {user.isMe && <span className="text-[10px] bg-primary/20 text-primary font-bold px-1.5 py-0.5 rounded-md ml-1">Kamu</span>}
                    </p>
                    <p className="text-[10px] font-medium text-base-content/40 flex items-center gap-1">
                      <span>🔥</span> {user.streak} hari streak
                    </p>
                  </div>

                  {/* Poin Akumulasi */}
                  <span className={`text-xs font-black tracking-wider tabular-nums flex-shrink-0 text-right ${user.isMe ? "text-primary" : "text-base-content/70"}`}>
                    {user.pts.toLocaleString()} <span className="text-[9px] font-medium opacity-60">XP</span>
                  </span>
                </motion.li>
              );
            })}
          </motion.ul>
        </AnimatePresence>

        {/* CONTROLLER PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-base-200/60 pt-4 mt-1">
            <motion.button
              whileHover={{ scale: currentPage > 1 ? 1.03 : 1 }}
              whileTap={{ scale: currentPage > 1 ? 0.97 : 1 }}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="btn btn-sm btn-outline rounded-xl px-4 text-xs font-medium border-base-300 disabled:opacity-30"
            >
              ⬅️ Sebelumnya
            </motion.button>

            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 text-xs font-bold rounded-lg transition-colors ${
                    currentPage === page
                      ? "bg-primary text-primary-content"
                      : "bg-base-200 hover:bg-base-300 text-base-content/70"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: currentPage < totalPages ? 1.03 : 1 }}
              whileTap={{ scale: currentPage < totalPages ? 0.97 : 1 }}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="btn btn-sm btn-outline rounded-xl px-4 text-xs font-medium border-base-300 disabled:opacity-30"
            >
              Selanjutnya ➡️
            </motion.button>
          </div>
        )}

        {/* Kotak Pengingat Naik Peringkat */}
        <div className="alert bg-info/10 text-info border border-info/10 py-2.5 px-3.5 text-xs rounded-xl flex items-center gap-2 shadow-inner">
          <span className="text-sm">🎯</span>
          <p className="font-medium leading-relaxed">
            Butuh <span className="font-bold underline decoration-2">340 XP</span> lagi untuk naik ke peringkat #4
          </p>
        </div>
      </div>
    </div>
  );
}