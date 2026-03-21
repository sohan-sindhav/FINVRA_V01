import React, { useState } from "react";
import { useAuth } from "../context/authcontext";
import { Shield, ShieldCheck, ShieldAlert, X, Copy, Check } from "lucide-react";

const TwoFactorSetup = () => {
  const { user, setup2FA, verify2FA, disable2FA } = useAuth();
  console.log("Current Auth User:", user);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1); // 1: setup, 2: verify
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleStartSetup = async () => {
    console.log("Enable 2FA button clicked!");
    try {
      const result = await setup2FA();
      if (result.success) {
        setQrCode(result.data.qrCode);
        setSecret(result.data.secret);
        setStep(1);
        setShowModal(true);
      } else {
        console.error("2FA Setup failed:", result.error);
        alert("Failed to start 2FA setup: " + result.error);
      }
    } catch (err) {
      console.error("2FA Setup error:", err);
    }
  };

  const handleVerify = async () => {
    setError("");
    const result = await verify2FA(otp, user?._id);
    if (result.success) {
      setShowModal(false);
      setOtp("");
    } else {
      setError(result.error);
    }
  };

  const handleDisable = async () => {
    if (window.confirm("Disable 2FA? This will decrease your account security.")) {
      await disable2FA();
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${user?.isTwoFactorEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
            {user?.isTwoFactorEnabled ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-base)]">Two-Factor Authentication</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {user?.isTwoFactorEnabled 
                ? "Your account is protected with an extra layer of security."
                : "Add an extra layer of security to your account."}
            </p>
          </div>
        </div>
        
        {user?.isTwoFactorEnabled ? (
          <button 
            onClick={handleDisable}
            className="text-xs font-medium px-4 py-2 border border-rose-500/20 text-rose-500 rounded-lg hover:bg-rose-500/5 transition-all"
          >
            Disable 2FA
          </button>
        ) : (
          <button 
            onClick={handleStartSetup}
            className="text-xs font-medium px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all shadow-sm"
          >
            Enable 2FA
          </button>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-bg-page)] border border-[var(--color-border)] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--color-text-base)] uppercase tracking-wider">Setup 2FA</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--color-text-faint)] hover:text-[var(--color-text-base)] transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {step === 1 ? (
                <div className="flex flex-col items-center text-center gap-4">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Scan this QR code with your Authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                  <div className="p-2 bg-white rounded-xl shadow-inner">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    <p className="text-[10px] text-[var(--color-text-faint)] uppercase font-semibold">Or enter this secret manually</p>
                    <div className="flex items-center gap-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-2">
                       <code className="text-[11px] font-mono text-indigo-400 flex-1 truncate">{secret}</code>
                       <button onClick={copySecret} className="p-1.5 text-[var(--color-text-faint)] hover:text-indigo-400 transition-colors">
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                       </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => setStep(2)}
                    className="w-full py-2.5 bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-500/20 mt-2"
                  >
                    I've Scanned It
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-[var(--color-text-muted)] text-center">
                    Enter the 6-digit code from your app to verify setup
                  </p>
                  <input 
                    type="text" 
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] py-3 px-4 text-center text-2xl font-bold tracking-[0.5em] rounded-xl focus:outline-none focus:border-indigo-500 transition-all placeholder:text-[var(--color-text-faint)]"
                  />
                  {error && <p className="text-rose-500 text-[10px] font-semibold text-center">{error}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 py-2.5 border border-[var(--color-border)] text-[var(--color-text-muted)] text-[10px] font-bold uppercase tracking-wider rounded-xl">Back</button>
                    <button onClick={handleVerify} className="flex-1 py-2.5 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-500/20">Verify & Enable</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;
