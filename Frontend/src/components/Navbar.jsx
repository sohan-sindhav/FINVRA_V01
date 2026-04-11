import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Bell, Search, Hexagon } from "lucide-react";
import ThemeToggle from "./ThemePanel";
import { motion } from "framer-motion";
import { useBankAccounts } from "../context/BankAccContext";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { minBalanceWarnings } = useBankAccounts();

  const isProfile = location.pathname === "/profile";
  const warningCount = minBalanceWarnings?.length ?? 0;

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

      {/* CENTER: Empty to push actions to right */}
      <div className="flex-1" />

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-5">
        
        {/* Notifications */}
        <button
          onClick={() => navigate("/bankacc")}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all"
          title={warningCount > 0 ? `${warningCount} account${warningCount > 1 ? 's' : ''} below minimum balance` : "Notifications"}
        >
           <Bell size={18} />
           {warningCount > 0 ? (
             <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] flex items-center justify-center px-1 text-[9px] font-black bg-amber-500 text-white rounded-full border-2 border-[#0a0a0a] animate-pulse">
               {warningCount}
             </span>
           ) : (
             <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500/30 rounded-full border-2 border-[#0a0a0a]" />
           )}
        </button>

        {/* Theme Panel */}
        <div className="hidden sm:block">
           <ThemeToggle />
        </div>

        {/* Vertical Divider */}
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
