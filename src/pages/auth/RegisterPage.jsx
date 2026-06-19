import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await signUp({ email: form.email, password: form.password, username: form.username });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card bg-base-100 shadow-lg border border-base-300">
      <div className="card-body gap-4">
        <h2 className="card-title text-xl justify-center">Create account</h2>
        <p className="text-sm text-base-content/50 text-center">Start your language learning journey</p>

        {error && (
          <div className="alert alert-error text-sm py-2">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="form-control">
            <label className="label"><span className="label-text text-sm">Username</span></label>
            <input
              type="text"
              className="input input-bordered input-sm"
              placeholder="Choose a username"
              value={form.username}
              onChange={update("username")}
              required
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text text-sm">Email</span></label>
            <input
              type="email"
              className="input input-bordered input-sm"
              placeholder="you@example.com"
              value={form.email}
              onChange={update("email")}
              required
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text text-sm">Password</span></label>
            <input
              type="password"
              className="input input-bordered input-sm"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={update("password")}
              required
              minLength={6}
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text text-sm">Confirm password</span></label>
            <input
              type="password"
              className="input input-bordered input-sm"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={update("confirm")}
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
            {loading ? "Creating account..." : "Create account"}
          </motion.button>
        </form>

        <p className="text-sm text-center text-base-content/50">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
