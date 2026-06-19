import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { GameProvider } from "./contexts/GameContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import Dashboard from "./pages/dashboard/Dashboard";
import TranslationChat from "./pages/chat/TranslationChat";
import VocabularyQuiz from "./pages/games/VocabularyQuiz";
import SentenceArrangement from "./pages/games/SentenceArrangement";
import DailyChallenge from "./pages/games/DailyChallenge";
import LeaderboardPage from "./pages/dashboard/LeaderboardPage";
import ProgressPage from "./pages/dashboard/ProgressPage";
import SettingsPage from "./pages/dashboard/SettingsPage";

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Protected app routes */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<TranslationChat />} />
            <Route path="/quiz" element={<VocabularyQuiz />} />
            <Route path="/sentence" element={<SentenceArrangement />} />
            <Route path="/challenge" element={<DailyChallenge />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </GameProvider>
    </AuthProvider>
  );
}
