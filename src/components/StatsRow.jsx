import { statsData } from "../data/mockData";
import { motion } from "framer-motion";

export default function StatsRow() {
  // Variasi animasi geser halus saat deretan statistik pertama kali dimuat
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-4 gap-3.5 w-full"
    >
      {statsData.map((s) => {
        // Deteksi dinamis warna teks delta (jika berisi penurunan/minus bisa disesuaikan otomatis)
        const isNegative = s.delta?.toString().includes("-");

        return (
          <motion.div 
            key={s.label} 
            variants={itemVariants}
            whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}
            className="stat bg-base-100 border border-base-300/70 rounded-xl p-4 flex flex-col gap-1 transition-colors duration-200 hover:border-base-300 relative overflow-hidden group select-none"
          >
            {/* Bagian Angka Nilai & Ikon Utama */}
            <div className="flex items-center justify-between w-full">
              <div className="stat-value text-xl font-black text-base-content tracking-tight tabular-nums">
                {s.value}
              </div>
              <div className="stat-figure text-xl bg-base-200/50 group-hover:bg-primary/10 group-hover:scale-110 p-2 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 w-9 h-9">
                {s.icon}
              </div>
            </div>
            
            {/* Judul Parameter Kategori */}
            <div className="stat-title text-[11px] font-bold tracking-wide uppercase text-base-content/40 leading-none mt-1">
              {s.label}
            </div>
            
            {/* Deskripsi Tambahan / Info Delta Kenaikan Status */}
            {s.delta && (
              <div className={`stat-desc text-[10px] font-bold mt-0.5 tracking-wide ${
                isNegative ? "text-error" : "text-success"
              }`}>
                {s.delta}
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}