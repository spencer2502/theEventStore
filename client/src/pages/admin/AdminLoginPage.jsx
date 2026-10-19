import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import FunkyButton from "../../components/common/FunkyButton";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8">
      {/* Back to Store link */}
      <div className="mb-4">
        <Link
          to="/"
          className="btn-funky bg-white text-ink px-4 py-2 text-xs flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          <span>Back to Storefront</span>
        </Link>
      </div>

      <div className="w-full max-w-md sticker-panel p-6 sm:p-8 shadow-funky-lg bg-panel-bg">
        {/* Header */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="THE EVENT STORE"
            className="h-16 mx-auto object-contain mb-3"
          />
          <h1 className="font-heading font-extrabold text-3xl text-ink tracking-tight">
            Admin Login
          </h1>
          <p className="text-xs font-bold text-pink uppercase tracking-wider mt-1">
            THE EVENT STORE Operations Portal
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-100 border-2 border-[#ff4d4d] text-xs font-bold text-ink flex items-center gap-2 shadow-[2px_2px_0px_#161221]">
            <AlertCircle size={16} className="text-[#ff4d4d] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="email"
                required
                placeholder="chayen.jain@eventstore.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full funky-input pl-10 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-ink uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full funky-input pl-10 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-funky bg-lime text-ink py-3 text-base flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={18} strokeWidth={3} />
              </>
            )}
          </button>
        </form>

        {/* Quick-Fill Button */}
        <div className="mt-6 pt-5 border-t-2 border-ink">
          <button
            type="button"
            onClick={() =>
              handleQuickFill("chayen.jain@eventstore.in", "chayen.2904")
            }
            className="w-full btn-funky bg-yellow text-ink py-2 text-xs text-center"
          >
            Quick Fill Admin Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
