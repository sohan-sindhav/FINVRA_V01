import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authcontext";
import { useConnections } from "../context/ConnectionContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  LogOut,
  Users,
  ShieldCheck,
  Settings,
  Blocks,
  Landmark,
  ArrowLeftRight,
  CreditCard,
  NotebookPen,
  LayoutGrid,
  Check,
  AlertCircle
} from "lucide-react";
import TwoFactorSetup from "../components/TwoFactorSetup";
import LoginHistory from "../components/LoginHistory";

const MOD_LIST = [
  { id: "connections", label: "Connections", icon: Users, desc: "Account linking and social tracking" },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight, desc: "Internal transfers and logging" },
  { id: "bankacc", label: "Bank Accounts", icon: Landmark, desc: "Capital management and balances" },
  { id: "ipo", label: "IPO Manager", icon: Blocks, desc: "Applies to IPOs (Requires Conn, Trans, Bank)", dependsOn: ["connections", "transactions", "bankacc"] },
  { id: "pan", label: "PAN Manager", icon: CreditCard, desc: "Tax credentials and identification" },
  { id: "money_diary", label: "Money Diary", icon: NotebookPen, desc: "Rough notes and social lending" },
];

const Profile = () => {
  const { user, logout, updateModules } = useAuth();
  const { connectionsNumber, getConnections } = useConnections();
  const [enabledModules, setEnabledModules] = useState(user?.enabledModules || []);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getConnections();
    if (user?.enabledModules) {
      setEnabledModules(user.enabledModules);
    }
  }, [user?.enabledModules]);

  const toggleModule = (id) => {
    const mod = MOD_LIST.find(m => m.id === id);
    let newModules = [...enabledModules];

    if (newModules.includes(id)) {
      // Disabling
      newModules = newModules.filter(m => m !== id);
      
      // If we disable a dependency of IPO, disable IPO too
      if (["connections", "transactions", "bankacc"].includes(id)) {
        newModules = newModules.filter(m => m !== "ipo");
      }
    } else {
      // Enabling
      newModules.push(id);
      
      // If we enable IPO, enable its dependencies
      if (id === "ipo") {
        mod.dependsOn.forEach(dep => {
          if (!newModules.includes(dep)) newModules.push(dep);
        });
      }
    }
    setEnabledModules(newModules);
  };

  const handleSaveModules = async () => {
    setIsSaving(true);
    await updateModules(enabledModules);
    setIsSaving(false);
  };

  const hasChanges = JSON.stringify(enabledModules.sort()) !== JSON.stringify((user?.enabledModules || []).sort());

  const initials = (user?.name || "User")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-full bg-[var(--color-bg-page)] text-[var(--color-text-base)] font-exo transition-colors duration-300 p-4 md:p-8">
      
      {/* ── HEADER SECTION ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6 md:p-8 rounded-2xl shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-indigo-500 text-white flex items-center justify-center text-2xl md:text-3xl font-bold shadow-md shadow-indigo-500/20">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-base)]">{user?.name || "Member"}</h1>
            <p className="text-sm font-medium text-[var(--color-text-muted)] mt-1 flex items-center gap-2">
              <Mail size={14} className="opacity-70" /> {user?.email}
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-rose-500/10 text-rose-500 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-rose-500 hover:text-white transition-all flex-1 md:flex-none justify-center"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Module Preferences */}
          <section className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm overflow-hidden border-t-4 border-t-indigo-500">
             <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                   <LayoutGrid size={20} className="text-indigo-500" />
                   <div>
                      <h2 className="text-lg font-bold">Module Preferences</h2>
                      <p className="text-xs text-[var(--color-text-muted)]">Customize your dashboard experience</p>
                   </div>
                </div>
                <AnimatePresence>
                   {hasChanges && (
                     <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onClick={handleSaveModules}
                        disabled={isSaving}
                        className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50"
                     >
                        {isSaving ? "Saving..." : "Save Changes"}
                     </motion.button>
                   )}
                </AnimatePresence>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOD_LIST.map((mod) => {
                   const isActive = enabledModules.includes(mod.id);
                   const isDependencyOfIpo = mod.id !== 'ipo' && enabledModules.includes('ipo') && (mod.id === 'connections' || mod.id === 'transactions' || mod.id === 'bankacc');
                   
                   return (
                     <div 
                        key={mod.id} 
                        onClick={() => !isDependencyOfIpo && toggleModule(mod.id)}
                        className={`group p-4 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden
                                   ${isActive ? 'bg-indigo-500/5 border-indigo-500/40' : 'bg-[var(--color-bg-page)] border-[var(--color-border)] opacity-60 grayscale hover:grayscale-0 hover:opacity-100'}
                                   ${isDependencyOfIpo ? 'cursor-not-allowed border-dashed' : ''}`}
                     >
                        <div className="flex gap-4 items-start relative z-10">
                           <div className={`p-2.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-500 text-white' : 'bg-[var(--color-bg-card)] text-[var(--color-text-muted)]'}`}>
                              <mod.icon size={18} />
                           </div>
                           <div className="flex-1">
                              <h3 className="text-sm font-bold flex items-center gap-2">
                                 {mod.label}
                                 {isActive && <Check size={14} className="text-emerald-500" />}
                              </h3>
                              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{mod.desc}</p>
                           </div>
                           <div className="pt-1">
                              <div className={`w-10 h-5 rounded-full relative transition-colors ${isActive ? 'bg-indigo-500' : 'bg-[var(--color-border)]'}`}>
                                 <motion.div 
                                    animate={{ x: isActive ? 22 : 2 }}
                                    className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm" 
                                 />
                              </div>
                           </div>
                        </div>

                        {isDependencyOfIpo && (
                           <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center gap-1.5">
                              <AlertCircle size={10} className="text-amber-500" />
                              <span className="text-[9px] font-bold text-amber-500 uppercase">Required by IPO Manager</span>
                           </div>
                        )}
                        
                        {isActive && !isDependencyOfIpo && (
                           <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                           </div>
                        )}
                     </div>
                   );
                })}
             </div>
          </section>

          {/* Security Tools */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-[var(--color-text-base)]">
               <ShieldCheck size={18} className="text-indigo-500" />
               <h2 className="text-lg font-semibold">Security Settings</h2>
            </div>
            <TwoFactorSetup />
          </section>

          {/* Login History */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-[var(--color-text-base)]">
               <Settings size={18} className="text-indigo-500" />
               <h2 className="text-lg font-semibold">Access Logs</h2>
            </div>
            <LoginHistory />
          </section>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-5 rounded-xl flex items-center gap-4 hover:border-indigo-500/50 transition-colors shadow-sm">
             <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-lg">
               <Users size={20} />
             </div>
             <div>
               <p className="text-xl font-bold text-[var(--color-text-base)]">{connectionsNumber}</p>
               <p className="text-xs font-medium text-[var(--color-text-muted)]">Active Connections</p>
             </div>
           </div>

           <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6 rounded-xl shadow-sm">
              <h4 className="text-sm font-bold text-[var(--color-text-base)] mb-4">Support & Help</h4>
              <div className="space-y-3">
                 <button className="w-full text-left px-4 py-3 rounded-lg bg-[var(--color-bg-page)] text-xs font-medium border border-[var(--color-border)] hover:border-indigo-500/50 transition-colors">
                    Report Technical Issue
                 </button>
                 <button className="w-full text-left px-4 py-3 rounded-lg bg-[var(--color-bg-page)] text-xs font-medium border border-[var(--color-border)] hover:border-indigo-500/50 transition-colors">
                    Privacy Policy
                 </button>
              </div>
           </div>
        </div>

      </div>

    </div>
  );
};

export default Profile;
