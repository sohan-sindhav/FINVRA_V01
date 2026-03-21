import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, ShieldCheck, ArrowLeft, AlertCircle } from "lucide-react";

const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg bg-[#1f1f1f] border border-gray-800 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors duration-200";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [userId, setUserId] = useState(null);
  
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
    if (result.success) {
      navigate("/profile");
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
           <h1 className="text-3xl font-bold text-white tracking-tight">Finvra</h1>
           <p className="text-gray-500 text-sm mt-1">Welcome back</p>
        </div>

        {/* Card */}
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-8 shadow-xl">

          {/* Error */}
          {error && (
            <div className="mb-6 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {!show2FA ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-400 ml-1">Email address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-400 ml-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className={inputCls}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white text-black text-sm font-bold px-4 py-3 rounded-xl hover:bg-gray-200 transition-all shadow-xl disabled:opacity-50 mt-2"
              >
                <LogIn size={15} />
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <p className="text-center text-sm text-gray-500 mt-2">
                Don't have an account?{" "}
                <Link to="/register" className="text-white hover:text-indigo-400 transition-colors">
                  Sign Up
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handle2FAVerify} className="flex flex-col gap-6 text-center">
              <div className="flex flex-col items-center gap-4">
                 <div className="p-4 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                    <ShieldCheck size={32} />
                 </div>
                 <div>
                    <h2 className="text-white font-bold text-lg">Two-Factor Auth</h2>
                    <p className="text-gray-500 text-sm mt-1">Verification Required</p>
                 </div>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-medium text-gray-500 ml-1">Verification Code</label>
                <input
                  type="text"
                  placeholder="000 000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-4 rounded-xl bg-[#1f1f1f] border border-gray-800 text-white text-2xl font-bold text-center tracking-[0.4em] focus:outline-none focus:border-indigo-500 transition-colors"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-500 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
              >
                {loading ? "Verifying..." : "Complete Verification"}
              </button>

              <button 
                type="button" 
                onClick={() => setShow2FA(false)}
                className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
              >
                <ArrowLeft size={14} /> Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
