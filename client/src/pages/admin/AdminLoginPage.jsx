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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-[#FDFCF9]">
      {/* Back to Store link */}
      <div className="mb-4">
        <Link
          to="/"
          className="btn-primary-outline px-4 py-2 text-xs flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          <span>Back to Storefront</span>
        </Link>
      </div>

      <div className="w-full max-w-md elegant-card p-6 sm:p-8 bg-white border border-[#E5E0D8] shadow-md rounded-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="THE EVENT STORE"
            className="h-16 mx-auto object-contain mb-3"
          />
          <h1 className="font-heading font-bold text-2xl text-ink tracking-tight">
            Admin Portal Login
          </h1>
          <p className="text-xs font-semibold text-[#8C1D24] uppercase tracking-wider mt-1">
            Store Management & POS
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-300 text-xs font-medium text-red-800 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.75rem' }}
                className="w-full elegant-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.75rem' }}
                className="w-full elegant-input text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-crimson py-3 text-sm flex items-center justify-center gap-2 mt-3 font-bold"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
