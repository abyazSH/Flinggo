import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card bg-base-100 shadow-lg border border-base-300">
      <div className="card-body gap-4">
        <h2 className="card-title text-xl justify-center">Welcome back</h2>
        <p className="text-sm text-base-content/50 text-center">Sign in to continue learning</p>

        {error && (
          <div className="alert alert-error text-sm py-2">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="form-control">
            <label className="label"><span className="label-text text-sm">Email</span></label>
            <input
              type="email"
              className="input input-bordered input-sm"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm">Password</span>
              <Link to="/forgot-password" className="label-text-alt text-xs text-primary">Forgot password?</Link>
            </label>
            <input
              type="password"
              className="input input-bordered input-sm"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`btn btn-primary btn-sm mt-2 shadow-lg shadow-primary/25 ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </motion.button>
        </form>

        <p className="text-sm text-center text-base-content/50">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
