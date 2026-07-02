import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

// Konfigurasi meta data halaman (Disesuaikan deskripsi kuis menjadi 3 bahasa)
const pageMeta = {
  "/dashboard":   { title: "Dashboard",          subtitle: "Your learning summary" },
  "/chat":        { title: "Translation Chat",   subtitle: "Chat and translate with Llama 3 AI" },
  "/quiz":        { title: "Vocabulary Quiz",    subtitle: "Practice vocabulary in 3 languages" },
  "/sentence":    { title: "Sentence Builder",   subtitle: "Arrange words into correct sentences" },
  "/challenge":   { title: "Daily Challenge",    subtitle: "Complete challenges and keep your streak" },
  "/leaderboard": { title: "Leaderboard",        subtitle: "This week's top learners" },
  "/progress":    { title: "My Progress",        subtitle: "Analytics and learning history" },
  "/settings":    { title: "Settings",           subtitle: "Manage your preferences" },
};

export default function AppLayout() {
  // Menggunakan useLocation agar React mendeteksi perubahan rute halaman secara real-time
  const location = useLocation();

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("flingo-theme") === "dark";
  });

  // Sinkronisasi tema ke LocalStorage dan DOM root jika diperlukan oleh DaisyUI
  useEffect(() => {
    const currentTheme = isDark ? "flingo-dark" : "flingo";
    localStorage.setItem("flingo-theme", isDark ? "dark" : "light");
    
    // Opsional: Menyisipkan atribut ke dokumen HTML agar deteksi tema global DaisyUI lebih solid
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, [isDark]);

  const theme = isDark ? "flingo-dark" : "flingo";
  
  // Mengambil meta data halaman secara dinamis berdasarkan rute yang sedang aktif saat ini
  const meta = pageMeta[location.pathname] || pageMeta["/dashboard"];

  return (
    <div 
      data-theme={theme} 
      className="flex h-screen overflow-hidden bg-base-200/50 transition-colors duration-300 font-sans text-base-content antialiased"
    >
      {/* Komponen Navigasi Samping */}
      <Sidebar isDark={isDark} setIsDark={setIsDark} />
      
      {/* Kontainer Utama Konten Aplikasi */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar yang otomatis sinkron dengan rute halaman terbaru */}
        <Topbar 
          title={meta.title} 
          subtitle={meta.subtitle} 
          isDark={isDark} 
          setIsDark={setIsDark} 
        />
        
        {/* Tempat merender komponen halaman anak (Dashboard, Chat, dll) */}
        <main className="flex-1 overflow-y-auto scrollbar-none bg-base-200/30 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}