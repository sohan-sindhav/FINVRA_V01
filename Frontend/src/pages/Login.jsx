import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  LogIn,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Wallet,
  BarChart3,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Brand Panel Feature List ─────────────────────────────── */
const FEATURES = [
  { icon: Wallet,      label: "Bank Account Tracking",   desc: "Monitor all your accounts in one place" },
  { icon: BarChart3,   label: "IPO Portfolio Monitor",   desc: "Track applications and profits live" },
  { icon: BookOpen,    label: "Social Money Ledger",      desc: "Know exactly who owes you what" },
  { icon: TrendingUp,  label: "Real-time Net Worth",      desc: "Complete financial picture at a glance" },
];

/* ── Left Branding Panel ──────────────────────────────────── */
const BrandPanel = () => (
  <div className="hidden md:flex md:w-1/2 auth-gradient relative overflow-hidden flex-col justify-between p-12">
    {/* dot grid overlay */}
    <div className="absolute inset-0 auth-dot-grid pointer-events-none" />

    {/* Decorative floating blobs */}
    <div
      className="auth-float-shape auth-pulse absolute -top-16 -right-16 w-72 h-72 rounded-full"
      style={{ background: "radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)" }}
    />
    <div
      className="auth-float-shape auth-pulse absolute -bottom-20 -left-20 w-80 h-80 rounded-full"
      style={{
        background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
        animationDelay: "3s",
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
        Your Finances,<br />
        <span style={{ background: "linear-gradient(90deg,#a5b4fc,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Simplified.
        </span>
      </h2>
      <p className="text-indigo-200/70 text-sm mb-10 leading-relaxed max-w-xs">
        One dashboard to track everything — from bank balances to IPO bids to who owes you money.
      </p>

      {/* Feature list */}
      <div className="flex flex-col gap-5">
        {FEATURES.map(({ icon: Icon, label, desc }, i) => (
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

    {/* Bottom trust badge */}
    <div className="relative z-10 flex items-center gap-2">
      <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-white/70 text-xs font-medium">Secure &amp; Encrypted</span>
      </div>
    </div>
  </div>
);

/* ── Floating-label Input ─────────────────────────────────── */
const FloatInput = ({ id, type = "text", label, value, onChange, disabled, required, autoFocus, rightSlot }) => (
  <div className="fl-wrapper">
    <input
      id={id}
      type={type}
      placeholder=" "
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      autoFocus={autoFocus}
      className={rightSlot ? "fl-has-icon" : ""}
    />
    <label htmlFor={id}>{label}</label>
    {rightSlot && <div className="fl-icon-btn">{rightSlot}</div>}
  </div>
);

/* ── OTP 6-Box Input ──────────────────────────────────────── */
const OTPBoxes = ({ value, onChange, disabled }) => {
  const refs = Array.from({ length: 6 }, () => useRef(null));
  const chars = value.split("");

  const handleKey = (e, idx) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = value.split("");
      next[idx] = "";
      onChange(next.join(""));
      if (idx > 0) refs[idx - 1].current?.focus();
    } else if (/^\d$/.test(e.key)) {
      e.preventDefault();
      const next = value.split("");
      next[idx] = e.key;
      onChange(next.join(""));
      if (idx < 5) refs[idx + 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    const focusIdx = Math.min(pasted.length, 5);
    refs[focusIdx].current?.focus();
  };

  return (
    <div className="flex justify-center gap-2.5">
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={refs[idx]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={chars[idx] || ""}
          onKeyDown={(e) => handleKey(e, idx)}
          onPaste={handlePaste}
          onChange={() => {}}
          disabled={disabled}
          autoFocus={idx === 0}
          className={`otp-box${chars[idx] ? " otp-filled" : ""}`}
        />
      ))}
    </div>
  );
};

/* ── Main Login Component ─────────────────────────────────── */
const Login = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]    = useState(false);
  const [otp, setOtp]           = useState("");
  const [show2FA, setShow2FA]   = useState(false);
  const [userId, setUserId]     = useState(null);

  const { login, verify2FA, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      if (result.twoFactorRequired) {
        setShow2FA(true);
        setUserId(result.userId);
      } else {
        navigate("/profile");
      }
    }
  };

  const handle2FAVerify = async (e) => {
    e.preventDefault();
    const result = await verify2FA(otp, userId);
    if (result.success) navigate("/profile");
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#080808" }}>
      <BrandPanel />

      {/* ── Right: Form Panel ────────────────────────────────── */}
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
          <AnimatePresence mode="wait">
            {!show2FA ? (
              /* ── Step 1: Login Form ───────────────────────── */
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-black text-white mb-1">Welcome back</h1>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Sign in to your Finvra account
                  </p>
                </div>

                {/* Error Banner */}
                <AnimatePresence>
                  {error && (
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
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <FloatInput
                    id="login-email"
                    type="email"
                    label="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />

                  <FloatInput
                    id="login-password"
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

                  <button type="submit" disabled={loading} className="auth-btn mt-2 flex items-center justify-center gap-2">
                    <div className="auth-btn-shimmer" />
                    <LogIn size={15} />
                    {loading ? "Signing in…" : "Sign In"}
                  </button>
                </form>

                <p className="text-center text-sm mt-6" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Don't have an account?{" "}
                  <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                    Sign Up
                  </Link>
                </p>
              </motion.div>
            ) : (
              /* ── Step 2: 2FA Form ─────────────────────────── */
              <motion.div
                key="2fa-form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-8">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">Credentials</span>
                  </div>
                  <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.1)" }} />
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                      style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", fontSize: "10px", fontWeight: 700 }}
                    >
                      2
                    </div>
                    <span className="text-xs font-semibold text-indigo-400">Verification</span>
                  </div>
                </div>

                {/* Shield icon */}
                <div className="flex flex-col items-center text-center mb-8">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))",
                      border: "1px solid rgba(99,102,241,0.3)",
                      boxShadow: "0 0 24px rgba(99,102,241,0.15)",
                    }}
                  >
                    <ShieldCheck size={28} className="text-indigo-400" />
                  </div>
                  <h1 className="text-2xl font-black text-white mb-1">Two-Factor Auth</h1>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                {/* Error Banner */}
                <AnimatePresence>
                  {error && (
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
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handle2FAVerify} className="flex flex-col gap-5">
                  <OTPBoxes value={otp} onChange={setOtp} disabled={loading} />

                  <button
                    type="submit"
                    disabled={loading || otp.replace(/\s/g, "").length < 6}
                    className="auth-btn mt-2"
                  >
                    <div className="auth-btn-shimmer" />
                    {loading ? "Verifying…" : "Complete Verification"}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => { setShow2FA(false); setOtp(""); }}
                  className="flex items-center justify-center gap-2 text-sm mt-5 w-full transition-colors"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                >
                  <ArrowLeft size={14} /> Back to Login
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Login;
