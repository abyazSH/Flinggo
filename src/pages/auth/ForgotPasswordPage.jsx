import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="card bg-base-100 shadow-lg border border-base-300">
      <div className="card-body gap-4">
        <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card-title text-xl justify-center">Reset password</motion.h2>
        <p className="text-sm text-base-content/50 text-center">
          Enter your email and we'll send you a reset link
        </p>

        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="alert alert-error text-sm py-2">
            <span>{error}</span>
          </motion.div>
        )}

        {success ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="alert alert-success text-sm py-2">
            <span>Check your email for a password reset link!</span>
          </motion.div>
        ) : (
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

            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="submit" className={`btn btn-primary btn-sm mt-2 ${loading ? "loading" : ""}`} disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </motion.button>
          </form>
        )}

        <p className="text-sm text-center text-base-content/50">
          <Link to="/login" className="text-primary font-medium">Back to login</Link>
        </p>
      </div>
    </motion.div>
  );
}
