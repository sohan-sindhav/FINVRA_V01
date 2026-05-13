import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Users, ArrowLeftRight, Landmark, Blocks, CreditCard, NotebookPen, Shield, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { to: "/connections", label: "Connections", icon: Users, id: "connections" },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight, id: "transactions" },
  { to: "/bankacc", label: "Bank Accounts", icon: Landmark, id: "bankacc" },
  { to: "/ipo", label: "IPO Manager", icon: Blocks, id: "ipo" },
  { to: "/pan-manager", label: "PAN Manager", icon: CreditCard, id: "pan" },
  { to: "/rough-notes", label: "Money Diary", icon: NotebookPen, id: "money_diary" },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  
  const isAdmin = user?.role === "admin";
  const enabledModules = user?.enabledModules || [];
  
  const visibleLinks = isAdmin 
    ? [{ to: "/", label: "Audit Logs", icon: Shield, id: "admin_logs" }]
    : NAV_LINKS.filter(link => enabledModules.includes(link.id));

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <motion.div
        animate={{ width: isExpanded ? 260 : 72 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:flex flex-col h-full shrink-0 z-40 overflow-hidden"
        style={{
          backgroundColor: "#0A0E17",
          borderRight: "1px solid rgba(255,255,255,0.06)"
        }}
      >
        {/* Logo Area */}
        <div className="h-[72px] flex items-center px-5 shrink-0 relative z-10">
          <Link to="/" className="flex items-center gap-3 w-full h-full cursor-pointer select-none">
            <div className="w-[34px] h-[34px] rounded-[10px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
              <span className="text-[16px] font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">F</span>
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-[20px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60 whitespace-nowrap"
                >
                  Finvra
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto custom-scrollbar">
          {isExpanded && (
            <div className="px-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#475569]">
                {isAdmin ? "Admin Portal" : "Menu"}
              </span>
            </div>
          )}
          
          {visibleLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={label}
                to={to}
                className="relative flex items-center h-11 rounded-[12px] group transition-colors duration-300 mx-2"
                style={{ padding: "0 12px" }}
              >
                {/* Active Indicator */}
                {active && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-[12px] border border-white/[0.06]"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                
                {/* Hover Background */}
                {!active && (
                  <div className="absolute inset-0 rounded-[12px] bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                {/* Content */}
                <div className="relative z-10 flex items-center w-full">
                  <div className="w-6 flex justify-center shrink-0">
                    <Icon size={18} className={`transition-colors duration-300 ${active ? "text-indigo-400" : "text-white/40 group-hover:text-white/80"}`} />
                  </div>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`ml-3 text-[13px] font-semibold whitespace-nowrap transition-colors duration-300 tracking-wide ${
                          active ? "text-white/90" : "text-white/50 group-hover:text-white/90"
                        }`}
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Toggle Collapse Button */}
        <div className="p-4 relative z-10">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center w-full h-11 rounded-[12px] bg-white/[0.02] border border-white/[0.04] text-white/40 hover:bg-white/[0.04] hover:border-white/10 hover:text-white/80 transition-all duration-300"
          >
            {isExpanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>
      </motion.div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center overflow-x-auto no-scrollbar pb-safe"
           style={{ backgroundColor: "rgba(17, 24, 39, 0.95)", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "8px 4px" }}>
        {visibleLinks.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={label}
              to={to}
              className="relative flex-shrink-0 flex flex-col items-center justify-center min-w-[72px] py-1 px-1 rounded-[10px] group"
            >
              <div className={`relative z-10 p-1.5 rounded-lg mb-1 transition-colors ${active ? "bg-indigo-500/10 text-[#6366F1]" : "text-[#475569]"}`}>
                <Icon size={18} />
              </div>
              <span className={`relative z-10 text-[10px] font-medium tracking-tight ${active ? "text-[#6366F1]" : "text-[#64748B]"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default Sidebar;

