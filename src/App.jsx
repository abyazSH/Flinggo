import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { GameProvider } from "./contexts/GameContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthOnlyRoute from "./components/AuthOnlyRoute";
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";
import ChatLayoutSwitcher from "./layouts/ChatLayoutSwitcher";
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
import { useAuth } from "./contexts/AuthContext";

/**
 * Smart redirect for the root path:
 * - Authenticated users go to /dashboard
 * - Guests go to /chat (public access)
 */
function SmartRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }
  return <Navigate to={user ? "/dashboard" : "/chat"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Routes>
          {/* Auth routes (login, register, forgot password) */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/*
            Chat route — accessible by everyone.
            ChatLayoutSwitcher picks the right layout:
              • Authenticated users → full AppLayout (sidebar + topbar)
              • Guest users         → GuestChatLayout (hero header + CTA)
            Both see the same TranslationChat component, but the surrounding
            chrome adapts based on authentication status.
          */}
          <Route element={<ChatLayoutSwitcher />}>
            <Route path="/chat" element={<TranslationChat />} />
          </Route>

          {/* Protected app routes - require authentication */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Game pages wrapped with AuthOnlyRoute for extra protection */}
            <Route path="/quiz" element={<AuthOnlyRoute><VocabularyQuiz /></AuthOnlyRoute>} />
            <Route path="/sentence" element={<AuthOnlyRoute><SentenceArrangement /></AuthOnlyRoute>} />
            <Route path="/challenge" element={<AuthOnlyRoute><DailyChallenge /></AuthOnlyRoute>} />

            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Default redirect based on auth state */}
          <Route path="*" element={<SmartRedirect />} />
        </Routes>
      </GameProvider>
    </AuthProvider>
  );
}
