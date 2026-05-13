import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
  Wallet,
  BarChart3,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Brand Panel Highlights (Register-specific) ───────────── */
const HIGHLIGHTS = [
  { icon: Zap,        label: "5-minute setup",          desc: "Get your dashboard ready instantly" },
  { icon: ShieldCheck, label: "Bank-grade Security",    desc: "Your data is always encrypted at rest" },
  { icon: Users,      label: "Built for individuals",   desc: "Personal finance, not enterprise bloat" },
  { icon: TrendingUp, label: "Smart Net Worth tracker", desc: "Always know your exact financial position" },
];

/* ── Left Branding Panel ──────────────────────────────────── */
const BrandPanel = () => (
  <div className="hidden md:flex md:w-1/2 auth-gradient relative overflow-hidden flex-col justify-between p-12">
    {/* dot grid overlay */}
    <div className="absolute inset-0 auth-dot-grid pointer-events-none" />

    {/* Decorative blobs */}
    <div
      className="auth-float-shape auth-pulse absolute -top-16 -right-16 w-72 h-72 rounded-full"
      style={{ background: "radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)" }}
    />
    <div
      className="auth-float-shape auth-pulse absolute -bottom-20 -left-20 w-80 h-80 rounded-full"
      style={{
        background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
        animationDelay: "2.5s",
      }}
    />
    <div
      className="auth-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full pointer-events-none"
      style={{ background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 60%)" }}
    />

    {/* Logo */}
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 16px rgba(99,102,241,0.5)" }}
        >
          F
        </div>
        <span className="text-white font-bold text-2xl tracking-tight">Finvra</span>
      </div>
      <p className="text-indigo-200/50 text-xs font-medium tracking-widest uppercase">Personal Finance OS</p>
    </div>

    {/* Hero copy */}
    <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
      <h2 className="text-4xl font-black text-white leading-tight mb-4">
        Join Finvra<br />
        <span style={{ background: "linear-gradient(90deg,#a5b4fc,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Today.
        </span>
      </h2>
      <p className="text-indigo-200/70 text-sm mb-10 leading-relaxed max-w-xs">
        Start managing your entire financial world in one clean, private dashboard. No noise. No subscriptions.
      </p>

      {/* Highlights */}
      <div className="flex flex-col gap-5">
        {HIGHLIGHTS.map(({ icon: Icon, label, desc }, i) => (
          <div key={i} className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}
            >
              <Icon size={15} className="text-indigo-300" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{label}</p>
              <p className="text-indigo-300/60 text-xs mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Bottom badge */}
    <div className="relative z-10 flex items-center gap-2">
      <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-white/70 text-xs font-medium">Secure &amp; Encrypted</span>
      </div>
    </div>
  </div>
);

/* ── Floating-label Input ─────────────────────────────────── */
const FloatInput = ({ id, type = "text", label, value, onChange, disabled, required, rightSlot }) => (
  <div className="fl-wrapper">
    <input
      id={id}
      type={type}
      placeholder=" "
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={rightSlot ? "fl-has-icon" : ""}
    />
    <label htmlFor={id}>{label}</label>
    {rightSlot && <div className="fl-icon-btn">{rightSlot}</div>}
  </div>
);

/* ── Password Strength ────────────────────────────────────── */
const getStrength = (pw) => {
  if (!pw) return { level: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: "Weak",      color: "#ef4444" };
  if (score <= 3) return { level: 2, label: "Fair",      color: "#f59e0b" };
  if (score <= 4) return { level: 3, label: "Good",      color: "#10b981" };
  return           { level: 4, label: "Strong",   color: "#6366f1" };
};

const PasswordStrength = ({ password }) => {
  const { level, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2 px-0.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="pw-strength-bar flex-1"
            style={{ background: i <= level ? color : "rgba(255,255,255,0.08)" }}
          />
        ))}
      </div>
      <p className="text-xs font-semibold" style={{ color }}>
        {label}
      </p>
    </div>
  );
};

/* ── Main Register Component ──────────────────────────────── */
const Register = () => {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]    = useState(false);
  const [localError, setLocalError] = useState("");

  const { register, loading, error: serverError } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    setLocalError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await register(name, email, password);
    if (result.success) navigate("/login");
  };

  const activeError = localError || serverError;

  return (
    <div className="min-h-screen flex" style={{ background: "#080808" }}>
      <BrandPanel />

      {/* ── Right: Form Panel ──────────────────────────────── */}
      <div
        className="flex-1 md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 min-h-screen"
        style={{ background: "#0d0d0d" }}
      >
        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-2 mb-10">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            F
          </div>
          <span className="text-white font-bold text-xl">Finvra</span>
        </div>

        <div className="w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-black text-white mb-1">Create account</h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                Set up your Finvra account — it's free
              </p>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {activeError && (
                <motion.div
                  className="auth-error-banner mb-6 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: "#f87171",
                  }}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <AlertCircle size={15} className="flex-shrink-0" />
                  {activeError}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FloatInput
                id="reg-name"
                type="text"
                label="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />

              <FloatInput
                id="reg-email"
                type="email"
                label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />

              {/* Password + strength */}
              <div>
                <FloatInput
                  id="reg-password"
                  type={showPw ? "text" : "password"}
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  rightSlot={
                    <button type="button" onClick={() => setShowPw((p) => !p)} tabIndex={-1}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                <PasswordStrength password={password} />
              </div>

              <button type="submit" disabled={loading} className="auth-btn mt-2 flex items-center justify-center gap-2">
                <div className="auth-btn-shimmer" />
                <UserPlus size={15} />
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: "rgba(255,255,255,0.3)" }}>
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
