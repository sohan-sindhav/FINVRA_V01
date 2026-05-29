import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Bell, Check, X } from "lucide-react";
import ThemeToggle from "./ThemePanel";
import { motion, AnimatePresence } from "framer-motion";
import { useBankAccounts } from "../context/BankAccContext";
import { usePan } from "../context/PanContext";
import { useTransactions } from "../context/TransactionContext";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { minBalanceWarnings } = useBankAccounts();
  const { incomingRequests: panRequests, respondToRequest: respondToPan } = usePan();
  const { incomingRequests: transactionRequests, respondToRequest: respondToTransaction } = useTransactions();

  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);

  const isProfile = location.pathname === "/profile";
  const minBalCount = minBalanceWarnings?.length ?? 0;
  const panReqCount = panRequests?.length ?? 0;
  const transReqCount = transactionRequests?.length ?? 0;
  const totalBadge = minBalCount + panReqCount + transReqCount;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRespondPan = async (id, action) => {
    await respondToPan(id, action);
  };
  const handleRespondTransaction = async (id, action) => {
    await respondToTransaction(id, action);
  };

  const getPageTitle = () => {
    if (location.pathname === "/") return "Dashboard";
    if (location.pathname.startsWith("/connections")) return "Connections";
    if (location.pathname.startsWith("/transactions")) return "Transactions";
    if (location.pathname.startsWith("/bankacc")) return "Bank Accounts";
    if (location.pathname.startsWith("/ipo")) return "IPO Manager";
    if (location.pathname.startsWith("/pan-manager")) return "PAN Manager";
    if (location.pathname.startsWith("/rough-notes")) return "Money Diary";
    if (location.pathname.startsWith("/profile")) return "Profile";
    return "Dashboard";
  };
  const pageTitle = getPageTitle();

  return (
    <nav className="h-[72px] flex items-center justify-between px-6 md:px-10 bg-[#0A0E17]/90 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-[100]">

      {/* LEFT: Dynamic Page Title */}
      <div className="flex items-center select-none">
        <h1 className="text-[18px] font-bold text-white/90 tracking-tight">
          {pageTitle}
        </h1>
      </div>

      <div className="flex-1" />

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-5">

        {/* ── Notification Bell ── */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen((v) => !v)}
            className="relative w-10 h-10 flex items-center justify-center rounded-[12px] bg-white/[0.02] border border-white/[0.04] text-white/50 hover:bg-white/[0.04] hover:text-white/90 hover:border-white/10 transition-all duration-300"
            title="Notifications"
          >
            <Bell size={18} />
            {totalBadge > 0 && (
              <span 
                className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse"
                style={{ boxShadow: "0 0 10px rgba(99,102,241,0.8)" }}
              />
            )}
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {bellOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="absolute right-0 top-12 w-80 bg-[#111827]/90 border border-white/[0.08] rounded-[16px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden z-50 backdrop-blur-2xl"
              >
                <div className="px-5 py-4 border-b border-white/[0.04] bg-white/[0.02]">
                  <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Notifications</p>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04] custom-scrollbar">
                  {/* Min balance warnings */}
                  {minBalanceWarnings.map((acc) => (
                    <div key={acc._id} className="px-5 py-4 flex items-start gap-3 hover:bg-white/[0.02] transition-colors">
                      <div className="w-8 h-8 rounded-[8px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-400 text-xs font-bold">!</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-white/90 leading-snug">
                          {acc.nickname} below minimum balance
                        </p>
                        <p className="text-[11px] text-white/40 mt-0.5">{acc.bank}</p>
                        <button
                          onClick={() => { navigate("/bankacc"); setBellOpen(false); }}
                          className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors mt-2 font-bold flex items-center gap-1 uppercase tracking-wide"
                        >
                          View Account <span>→</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* PAN share requests */}
                  {panRequests.map((req) => (
                    <div key={`pan-${req._id}`} className="px-5 py-4 flex items-start gap-3 hover:bg-white/[0.02] transition-colors">
                      <div className="w-8 h-8 rounded-[8px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-400 text-xs font-bold">P</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-white/90 leading-snug">
                          {req.fromUser?.name} wants to share PANs
                        </p>
                        <p className="text-[11px] text-white/40 mt-0.5">{req.fromUser?.email}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleRespondPan(req._id, "accept")}
                            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-[6px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                          >
                            <Check size={12} /> Accept
                          </button>
                          <button
                            onClick={() => handleRespondPan(req._id, "decline")}
                            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-[6px] bg-white/[0.04] text-white/50 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 border border-white/[0.04] transition-all"
                          >
                            <X size={12} /> Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Transaction share requests */}
                  {transactionRequests.map((req) => (
                    <div key={`txn-${req._id}`} className="px-5 py-4 flex items-start gap-3 hover:bg-white/[0.02] transition-colors">
                      <div className="w-8 h-8 rounded-[8px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-400 text-xs font-bold">T</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-white/90 leading-snug">
                          {req.fromUser?.name} wants to share Transactions
                        </p>
                        <p className="text-[11px] text-white/40 mt-0.5">{req.fromUser?.email}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleRespondTransaction(req._id, "accept")}
                            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-[6px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                          >
                            <Check size={12} /> Accept
                          </button>
                          <button
                            onClick={() => handleRespondTransaction(req._id, "decline")}
                            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-[6px] bg-white/[0.04] text-white/50 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 border border-white/[0.04] transition-all"
                          >
                            <X size={12} /> Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Empty state */}
                  {totalBadge === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 text-white/30">
                      <Bell size={24} className="opacity-40" />
                      <span className="text-[12px] font-medium tracking-wide">All caught up!</span>
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

        <div className="w-px h-6 bg-white/[0.08] hidden sm:block" />

        {/* User Profile */}
        {user && (
          <button
            onClick={() => navigate("/profile")}
            className={`flex items-center gap-3 p-1.5 pr-4 rounded-[12px] transition-all duration-300 border
                       ${isProfile
                         ? "bg-white/[0.04] border-white/10 text-white/90"
                         : "bg-transparent border-transparent text-white/50 hover:text-white/90 hover:bg-white/[0.02] hover:border-white/[0.04]"
                       }`}
          >
            <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center font-bold text-xs
                            ${isProfile ? "bg-indigo-500 text-white" : "bg-white/[0.04] text-white/60 border border-white/[0.04]"}`}>
              {user.name?.[0].toUpperCase() || <User size={14} />}
            </div>
            <div className="hidden sm:flex flex-col items-start justify-center">
              <span className="text-[13px] font-semibold leading-none truncate max-w-[100px]">{user.name?.split(" ")[0]}</span>
            </div>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
