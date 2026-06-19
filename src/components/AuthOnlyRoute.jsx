import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Route guard that requires authentication.
 * Used inside AppLayout to protect game and dashboard pages.
 * If not logged in, redirects to /login with a message.
 */
export default function AuthOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}
