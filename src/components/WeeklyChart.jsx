import { weeklyActivity } from "../data/mockData";
import { motion } from "framer-motion";

// Mencegah error pembagian dengan nol jika data kosong
const barValues = weeklyActivity.map((d) => d.val);
const max = barValues.length > 0 ? Math.max(...barValues) : 1;

// Menghitung total akumulasi seluruh sesi minggu ini secara dinamis
const totalSessions = barValues.reduce((sum, curr) => sum + curr, 0);

export default function WeeklyChart() {
  return (
    <div className="card bg-base-100 border border-base-300/70 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="card-body p-5 gap-4">
        
        {/* Header Title */}
        <div className="flex items-center gap-2">
          <span className="text-base">📈</span>
          <h3 className="text-sm font-bold tracking-wide text-base-content/90">
            Aktivitas 7 Hari Terakhir
          </h3>
        </div>

        {/* Container Utama Grafik Batang */}
        <div className="flex items-end gap-2 h-24 pt-4 px-1">
          {weeklyActivity.map((d, i) => {
            const isToday = i === weeklyActivity.length - 1;
            // Menghitung tinggi relatif dalam bentuk persentase
            const heightPct = max > 0 ? Math.round((d.val / max) * 100) : 0;

            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                
                {/* Tooltip Melayang Saat Hover Batang Grafik */}
                <div className="absolute -top-6 bg-base-content text-base-100 text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10 tabular-nums">
                  {d.val} sesi
                </div>

                {/* Elemen Batang Grafik dengan Animasi Tumbuh */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(heightPct, 6)}%` }} // Batas minimal 6% agar batang bernilai 0 tetap terlihat tipis
                  transition={{ type: "spring", stiffness: 80, damping: 12, delay: i * 0.03 }}
                  className={`w-full rounded-t-md transition-colors duration-200 cursor-pointer ${
                    isToday 
                      ? "bg-gradient-to-t from-primary to-primary-focus shadow-sm shadow-primary/20" 
                      : "bg-primary/20 hover:bg-primary/40"
                  }`}
                />
                
                {/* Singkatan Nama Hari */}
                <span className={`text-[10px] font-bold tracking-wide transition-colors ${
                  isToday ? "text-primary font-black" : "text-base-content/40 group-hover:text-base-content/70"
                }`}>
                  {d.day}
                </span>

              </div>
            );
          })}
        </div>

        {/* Footer Info Akumulasi Total Sesi Dinamis */}
        <div className="border-t border-base-200/60 pt-3 mt-1 flex items-center justify-between text-xs text-base-content/50">
          <span>Metrik belajar</span>
          <p className="font-medium">
            Total pekan ini: <span className="text-base-content font-extrabold tracking-wide tabular-nums">{totalSessions} sesi</span>
          </p>
        </div>

      </div>
    </div>
  );
}