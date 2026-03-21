import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, AlertCircle } from "lucide-react";

const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg bg-[#1f1f1f] border border-gray-800 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors duration-200 disabled:opacity-50";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const { register, loading, error: serverError } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    setLocalError("");
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError("Please enter a valid email address.");
      return false;
    }

    // Password validation
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
    if (result.success) {
      navigate("/login");
    }
  };

  const activeError = localError || serverError;

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Finvra</h1>
          <p className="text-gray-500 text-sm mt-1">Get started today</p>
        </div>

        {/* Card */}
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-8 shadow-xl">

          {/* Error */}
          {activeError && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5 flex items-center gap-2">
              <AlertCircle size={14} />
              {activeError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-gray-400">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className={inputCls}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-400">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className={inputCls}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className={inputCls}
              />
              <p className="text-[10px] text-gray-600 mt-1">Min 6 characters.</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white text-black text-sm font-bold px-4 py-3 rounded-xl hover:bg-gray-100 transition-all shadow-xl disabled:opacity-50 mt-1"
            >
              <UserPlus size={15} />
              {loading ? "Creating account…" : "Sign Up"}
            </button>
          </form>

          {/* Footer link */}
          <p className="text-center text-sm text-gray-500 mt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-white hover:text-gray-300 font-medium transition-colors duration-200">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
