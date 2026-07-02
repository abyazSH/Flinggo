import { activityLog } from "../data/mockData";
import { motion } from "framer-motion";

export default function ActivityLog() {
  // Variasi animasi untuk list agar muncul bergantian (stagger effect)
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="card bg-base-100 border border-base-300/70 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="card-body p-5 gap-4">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-base">⚡</span>
            <h3 className="text-sm font-bold tracking-wide text-base-content/90">
              Aktivitas Terbaru
            </h3>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-ghost btn-xs text-primary font-semibold hover:bg-primary/10 transition-colors"
          >
            Lihat semua
          </motion.button>
        </div>

        {/* List Section dengan Animasi Mikro */}
        {activityLog.length === 0 ? (
          <div className="text-center py-6 text-xs text-base-content/40">
            Belum ada aktivitas terekam.
          </div>
        ) : (
          <motion.ul 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-base-200/60"
          >
            {activityLog.map((item, i) => (
              <motion.li 
                key={i} 
                variants={itemVariants}
                className="flex items-center gap-3.5 py-3 first:pt-1 last:pb-1 group hover:bg-base-200/30 px-2 -mx-2 rounded-xl transition-colors duration-150"
              >
                {/* Pembungkus Ikon */}
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-base flex-shrink-0 shadow-inner group-hover:bg-primary group-hover:text-primary-content transition-all duration-200">
                  {item.icon}
                </div>

                {/* Teks Utama (Mengambil sisa ruang penuh karena jam dihapus) */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <p className="text-xs font-semibold text-base-content group-hover:text-primary transition-colors duration-150 truncate">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-base-content/60 leading-relaxed truncate">
                    {item.sub}
                  </p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </div>
  );
}