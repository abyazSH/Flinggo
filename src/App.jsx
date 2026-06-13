import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import {
  ChatPage,
  QuizPage,
  SentencePage,
  ChallengePage,
  LeaderboardPage,
  ProgressPage,
  SettingsPage,
} from "./pages/OtherPages";

const pageMeta = {
  dashboard:   { title: "Dashboard",         subtitle: "Ringkasan aktivitas belajarmu" },
  chat:        { title: "Chat AI",            subtitle: "Ngobrol dan terjemahkan dengan Flingo" },
  quiz:        { title: "Kuis kosakata",      subtitle: "Latih kosakata dalam 5 bahasa" },
  sentence:    { title: "Susun kalimat",      subtitle: "Pahami struktur kalimat secara interaktif" },
  challenge:   { title: "Tantangan harian",   subtitle: "Selesaikan tantangan dan jaga streakmu" },
  leaderboard: { title: "Leaderboard",        subtitle: "Peringkat pengguna minggu ini" },
  progress:    { title: "Progres saya",       subtitle: "Analitik dan riwayat belajarmu" },
  settings:    { title: "Pengaturan",         subtitle: "Kelola preferensi akun" },
};

function PageContent({ page }) {
  switch (page) {
    case "dashboard":   return <Dashboard />;
    case "chat":        return <ChatPage />;
    case "quiz":        return <QuizPage />;
    case "sentence":    return <SentencePage />;
    case "challenge":   return <ChallengePage />;
    case "leaderboard": return <LeaderboardPage />;
    case "progress":    return <ProgressPage />;
    case "settings":    return <SettingsPage />;
    default:            return <Dashboard />;
  }
}

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("flingo-theme") === "dark"
  );

  useEffect(() => {
    localStorage.setItem("flingo-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const theme = isDark ? "flingo-dark" : "flingo";
  const meta = pageMeta[activePage] || pageMeta.dashboard;

  return (
    <div data-theme={theme} className="flex h-screen overflow-hidden bg-base-200 transition-colors duration-300">
      <Sidebar activePage={activePage} setActivePage={setActivePage} isDark={isDark} setIsDark={setIsDark} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={meta.title} subtitle={meta.subtitle} isDark={isDark} setIsDark={setIsDark} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <PageContent page={activePage} />
        </main>
      </div>
    </div>
  );
}
