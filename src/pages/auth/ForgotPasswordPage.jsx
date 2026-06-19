import { useState } from "react";
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
    <div className="card bg-base-100 shadow-lg border border-base-300">
      <div className="card-body gap-4">
        <h2 className="card-title text-xl justify-center">Reset password</h2>
        <p className="text-sm text-base-content/50 text-center">
          Enter your email and we'll send you a reset link
        </p>

        {error && (
          <div className="alert alert-error text-sm py-2">
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="alert alert-success text-sm py-2">
            <span>Check your email for a password reset link!</span>
          </div>
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

            <button type="submit" className={`btn btn-primary btn-sm mt-2 ${loading ? "loading" : ""}`} disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="text-sm text-center text-base-content/50">
          <Link to="/login" className="text-primary font-medium">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
