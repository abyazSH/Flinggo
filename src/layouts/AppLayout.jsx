import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const pageMeta = {
  "/dashboard":   { title: "Dashboard",          subtitle: "Your learning summary" },
  "/chat":        { title: "Translation Chat",   subtitle: "Chat and translate with AI" },
  "/quiz":        { title: "Vocabulary Quiz",    subtitle: "Practice vocabulary in 5 languages" },
  "/sentence":    { title: "Sentence Builder",   subtitle: "Arrange words into correct sentences" },
  "/challenge":   { title: "Daily Challenge",    subtitle: "Complete challenges and keep your streak" },
  "/leaderboard": { title: "Leaderboard",        subtitle: "This week's top learners" },
  "/progress":    { title: "My Progress",        subtitle: "Analytics and learning history" },
  "/settings":    { title: "Settings",           subtitle: "Manage your preferences" },
};

export default function AppLayout() {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("flingo-theme") === "dark"
  );

  useEffect(() => {
    localStorage.setItem("flingo-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const theme = isDark ? "flingo-dark" : "flingo";
  const path = window.location.pathname;
  const meta = pageMeta[path] || pageMeta["/dashboard"];

  return (
    <div data-theme={theme} className="flex h-screen overflow-hidden bg-base-200 transition-colors duration-300">
      <Sidebar isDark={isDark} setIsDark={setIsDark} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={meta.title} subtitle={meta.subtitle} isDark={isDark} setIsDark={setIsDark} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
