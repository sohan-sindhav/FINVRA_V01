import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Bell, Check, X } from "lucide-react";
import ThemeToggle from "./ThemePanel";
import { motion, AnimatePresence } from "framer-motion";
import { useBankAccounts } from "../context/BankAccContext";
import { usePan } from "../context/PanContext";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { minBalanceWarnings } = useBankAccounts();
  const { incomingRequests, respondToRequest } = usePan();

  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);

  const isProfile = location.pathname === "/profile";
  const minBalCount = minBalanceWarnings?.length ?? 0;
  const panReqCount = incomingRequests?.length ?? 0;
  const totalBadge = minBalCount + panReqCount;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRespond = async (id, action) => {
    await respondToRequest(id, action);
  };

  return (
    <nav className="h-16 flex items-center justify-between px-4 md:px-8 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-[100] transition-all duration-300">

      {/* LEFT: Branding */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2.5 cursor-pointer group select-none"
      >
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tighter text-white leading-tight">FINVRA</span>
          <div className="h-0.5 w-0 group-hover:w-full bg-indigo-500 transition-all duration-300 rounded-full" />
        </div>
      </div>

      <div className="flex-1" />

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-5">

        {/* ── Notification Bell ── */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen((v) => !v)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all"
            title="Notifications"
          >
            <Bell size={18} />
            {totalBadge > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] flex items-center justify-center px-1 text-[9px] font-black bg-amber-500 text-white rounded-full border-2 border-[#0a0a0a] animate-pulse">
                {totalBadge}
              </span>
            ) : (
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500/30 rounded-full border-2 border-[#0a0a0a]" />
            )}
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {bellOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-80 bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-xs font-bold text-white">Notifications</p>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                  {/* Min balance warnings */}
                  {minBalanceWarnings.map((acc) => (
                    <div key={acc._id} className="px-4 py-3 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-amber-500 text-[10px]">⚠</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-amber-400 leading-snug">
                          {acc.nickname} below minimum balance
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{acc.bank}</p>
                        <button
                          onClick={() => { navigate("/bankacc"); setBellOpen(false); }}
                          className="text-[10px] text-amber-500 hover:text-amber-400 transition-colors mt-1 font-semibold"
                        >
                          View Account →
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* PAN share requests */}
                  {incomingRequests.map((req) => (
                    <div key={req._id} className="px-4 py-3 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-indigo-400 text-[10px] font-black">P</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white leading-snug">
                          {req.fromUser?.name} wants to share{" "}
                          <span className="text-indigo-400">
                            {req.panCards?.length} PAN{req.panCards?.length !== 1 ? "s" : ""}
                          </span>{" "}
                          with you
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{req.fromUser?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleRespond(req._id, "accept")}
                            className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all"
                          >
                            <Check size={11} /> Accept
                          </button>
                          <button
                            onClick={() => handleRespond(req._id, "decline")}
                            className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all"
                          >
                            <X size={11} /> Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Empty state */}
                  {totalBadge === 0 && (
                    <div className="py-10 text-center text-xs text-gray-600">
                      No new notifications
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Panel */}
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        <div className="w-px h-6 bg-white/10 hidden sm:block" />

        {/* User Profile */}
        {user && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/profile")}
            className={`flex items-center gap-3 p-1 pr-4 rounded-2xl transition-all duration-300 border
                       ${isProfile
                         ? "bg-indigo-500 border-indigo-500 text-white"
                         : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:border-white/10"
                       }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs
                            ${isProfile ? "bg-white/20" : "bg-indigo-500 text-white"}`}>
              {user.name?.[0].toUpperCase() || <User size={14} />}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-0.5 opacity-60">Account</span>
              <span className="text-xs font-bold leading-none truncate max-w-[80px]">{user.name?.split(" ")[0]}</span>
            </div>
          </motion.button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
