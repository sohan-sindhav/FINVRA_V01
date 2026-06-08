import React, { useMemo, useEffect, useState } from "react";
import { 
  TrendingUp, 
  Wallet, 
  Briefcase, 
  Plus,
  ArrowRight,
  TrendingDown,
  ChevronRight,
  Activity,
  RotateCcw,
  Package
} from "lucide-react";
import { useBankAccounts } from "../context/BankAccContext";
import { useIPO } from "../context/IPOContext";
import { useRoughNote } from "../context/RoughNoteContext";
import { useTransactions } from "../context/TransactionContext";
import { 
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ReTooltip
} from "recharts";
import { Link } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";
import { motion, animate } from "framer-motion";
import { useAuth } from "../context/AuthContext";


import MinBalanceWarningBanner from "../components/MinBalanceWarningBanner.jsx";
import Modal, { ModalFooter, CancelBtn, ConfirmBtn } from "../components/Modal";
const Dashboard = () => {
  const { bankAccounts } = useBankAccounts();
  const { ipos, applications, cancelApplication } = useIPO();
  const { persons } = useRoughNote();
  const { transactions } = useTransactions();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const isLight = theme === "light";
  const enabledModules = user?.enabledModules || [];

  const [activeApp, setActiveApp] = useState(null);
  const [showProfitsModal, setShowProfitsModal] = useState(false);

  const handleDeleteApp = async () => {
    if (activeApp && window.confirm("Delete this placement?")) {
      await cancelApplication(activeApp._id);
      setActiveApp(null);
    }
  };

  // ── MODULE FLAGS ──────────────────────────────────────────────────
  const isBankEnabled = enabledModules.includes("bankacc");
  const isIPOEnabled = enabledModules.includes("ipo");
  const isTransEnabled = enabledModules.includes("transactions");
  const isMoneyDiaryEnabled = enabledModules.includes("money_diary");

  // ── DATA AGGREGATION ──────────────────────────────────────────────

  const totalBankBalance = useMemo(() => 
    isBankEnabled ? bankAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0) : 0, 
  [bankAccounts, isBankEnabled]);

  const totalBlockedCapital = useMemo(() => 
    isIPOEnabled ? applications.reduce((sum, app) => sum + (app.amount || 0), 0) : 0, 
  [applications, isIPOEnabled]);

  const moneyDiaryOwedToYou = useMemo(() => 
    isMoneyDiaryEnabled ? persons.reduce((sum, p) => sum + (p.balance > 0 ? p.balance : 0), 0) : 0, 
  [persons, isMoneyDiaryEnabled]);

  const moneyDiaryYouOwe = useMemo(() => 
    isMoneyDiaryEnabled ? persons.reduce((sum, p) => sum + (p.balance < 0 ? Math.abs(p.balance) : 0), 0) : 0, 
  [persons, isMoneyDiaryEnabled]);

  const totalAssets = totalBankBalance + totalBlockedCapital + moneyDiaryOwedToYou;
  const totalLiabilities = moneyDiaryYouOwe;
  const totalNetWealth = totalAssets - totalLiabilities;

  const totalOverallProfit = useMemo(() => 
    isIPOEnabled ? applications.reduce((sum, app) => sum + (app.profit || 0), 0) : 0, 
  [applications, isIPOEnabled]);

  const totalMyProfit = useMemo(() => 
    isIPOEnabled ? applications.reduce((sum, app) => sum + (app.myProfit || 0), 0) : 0, 
  [applications, isIPOEnabled]);

  const totalHolderProfit = useMemo(() => 
    isIPOEnabled ? applications.reduce((sum, app) => sum + (app.holderProfit || 0), 0) : 0, 
  [applications, isIPOEnabled]);

  const totalFunderProfit = useMemo(() => 
    isIPOEnabled ? applications.reduce((sum, app) => sum + (app.funderProfit || 0), 0) : 0, 
  [applications, isIPOEnabled]);

  const detailedProfitList = useMemo(() => {
    if (!isIPOEnabled) return [];
    let myTotal = 0;
    let funderTotal = 0;
    const holderMap = {};

    applications.forEach(app => {
      myTotal += (app.myProfit || 0);
      funderTotal += (app.funderProfit || 0);
      
      const holderName = app.pan?.nameOnPan || "Unknown Holder";
      holderMap[holderName] = (holderMap[holderName] || 0) + (app.holderProfit || 0);
    });

    const list = [];
    if (myTotal > 0) list.push({ name: "My Profit (Me)", profit: myTotal, type: "Me" });
    if (funderTotal > 0) list.push({ name: "Funder (Total)", profit: funderTotal, type: "Funder" });

    Object.entries(holderMap).forEach(([name, profit]) => {
      if (profit > 0) {
        list.push({ name: `${name}`, profit, type: "Holder" });
      }
    });

    return list.sort((a, b) => b.profit - a.profit);
  }, [applications, isIPOEnabled]);

  const activeTransactions = useMemo(
    () => isTransEnabled ? transactions.filter((t) => !t.reversed) : [],
    [transactions, isTransEnabled]
  );

  // Chart Data: IPO Profits by Company
  const profitData = useMemo(() => {
    if (!isIPOEnabled) return [];
    const map = {};
    applications.forEach(app => {
      const name = app.ipo?.companyname || "Unknown";
      if (!map[name]) {
         map[name] = { myProfit: 0, totalProfit: 0, holderProfit: 0, funderProfit: 0 };
      }
      map[name].myProfit += (app.myProfit || 0);
      map[name].totalProfit += (app.profit || 0);
      map[name].holderProfit += (app.holderProfit || 0);
      map[name].funderProfit += (app.funderProfit || 0);
    });
    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .filter(d => Math.abs(d.totalProfit) > 0)
      .sort((a, b) => b.myProfit - a.myProfit)
      .slice(0, 8);
  }, [applications, isIPOEnabled]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#111827]/90 backdrop-blur-xl border border-white/10 p-3.5 rounded-xl shadow-2xl min-w-[180px]">
          <p className="text-[12px] text-white/50 font-bold uppercase tracking-wider mb-2.5">{label}</p>
          <div className="flex flex-col gap-1.5 text-[13px] font-medium">
            <p className="flex justify-between gap-4"><span className="text-white/60">My Profit:</span><span className="text-indigo-400 font-bold tabular-nums">₹{Math.round(data.myProfit).toLocaleString("en-IN")}</span></p>
            <p className="flex justify-between gap-4"><span className="text-white/60">Holder:</span><span className="text-white/80 tabular-nums">₹{Math.round(data.holderProfit).toLocaleString("en-IN")}</span></p>
            <p className="flex justify-between gap-4"><span className="text-white/60">Funder:</span><span className="text-white/80 tabular-nums">₹{Math.round(data.funderProfit).toLocaleString("en-IN")}</span></p>
            <div className="h-px bg-white/10 my-1"></div>
            <p className="flex justify-between gap-4"><span className="text-white/80 font-bold uppercase text-[10px] tracking-wider mt-0.5">Total</span><span className="text-emerald-400 font-black tabular-nums">₹{Math.round(data.totalProfit).toLocaleString("en-IN")}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-full bg-[var(--color-bg-page)] p-4 md:p-8 text-[var(--color-text-base)] font-exo transition-colors duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-base)]">Overview</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Your financial health at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
           {isTransEnabled && (
             <Link to="/transactions" className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 transition-all shadow-sm">
                <Plus size={16} /> New Transaction
             </Link>
           )}
        </div>
      </div>

      {/* MIN BALANCE WARNING */}
      {isBankEnabled && <MinBalanceWarningBanner />}

      {/* CORE METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        
        {/* Net Wealth Hero Card */}
        <div className="sm:col-span-2 relative p-8 rounded-[16px] overflow-hidden flex flex-col justify-between border border-white/[0.08]"
             style={{ 
               background: "#05050A",
               boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)"
             }}>
           {/* Ambient Glow */}
           <div className="absolute top-[-50%] left-[-10%] w-[150%] h-[150%] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent blur-[80px] rounded-full pointer-events-none" />
           
           <div className="flex justify-between items-start mb-6 relative z-10">
              <p className="text-[13px] font-semibold text-white/60 tracking-wider uppercase">Total Net Worth</p>
              <div className="w-[32px] h-[32px] flex items-center justify-center bg-white/5 border border-white/10 text-white rounded-full backdrop-blur-md">
                 <TrendingUp size={14} />
              </div>
           </div>
           
           <h2 className="text-[42px] font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60 tabular-nums tracking-tighter relative z-10">
             ₹{totalNetWealth.toLocaleString("en-IN")}
           </h2>
           
           <div className="flex gap-6 pt-4 border-t border-white/[0.04] relative z-10">
              <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-white/40 uppercase tracking-widest">Gross Assets</span>
                  <span className="text-sm font-bold text-emerald-400 tabular-nums">+ ₹{totalAssets.toLocaleString("en-IN")}</span>
              </div>
              <div className="w-px bg-white/[0.04]" />
              <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-white/40 uppercase tracking-widest">Liabilities</span>
                  <span className="text-sm font-bold text-rose-400 tabular-nums">− ₹{totalLiabilities.toLocaleString("en-IN")}</span>
              </div>
           </div>
        </div>

        {isBankEnabled && (
          <div className="relative bg-[#0A0E17]/50 backdrop-blur-xl p-[24px] border border-white/[0.04] rounded-[16px] group transition-all duration-300 hover:bg-[#111827] hover:border-white/[0.08]"
               style={{ boxShadow: "0 8px 32px -8px rgba(0,0,0,0.3)" }}>
             <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[16px]" />
             <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-[40px] h-[40px] flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                   <Wallet size={18} />
                </div>
             </div>
             <div className="relative z-10">
                 <p className="text-[12px] font-semibold text-white/50 uppercase tracking-wider mb-1">Bank Total</p>
                 <h2 className="text-[24px] font-bold text-white tabular-nums tracking-tight">₹{totalBankBalance.toLocaleString("en-IN")}</h2>
             </div>
          </div>
        )}

        {isIPOEnabled && (
          <div className="relative bg-[#0A0E17]/50 backdrop-blur-xl p-[24px] border border-white/[0.04] rounded-[16px] group transition-all duration-300 hover:bg-[#111827] hover:border-white/[0.08]"
               style={{ boxShadow: "0 8px 32px -8px rgba(0,0,0,0.3)" }}>
             <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[16px]" />
             <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-[40px] h-[40px] flex items-center justify-center bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                   <Briefcase size={18} />
                </div>
             </div>
             <div className="relative z-10">
                 <p className="text-[12px] font-semibold text-white/50 uppercase tracking-wider mb-1">Locked Capital</p>
                 <h2 className="text-[24px] font-bold text-white tabular-nums tracking-tight">₹{totalBlockedCapital.toLocaleString("en-IN")}</h2>
             </div>
          </div>
        )}
      </div>

      {/* OPERATIONAL STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isTransEnabled && (
            <>
              <div className="bg-[#0A0E17]/50 backdrop-blur-xl border border-white/[0.04] p-5 rounded-[16px] flex items-center gap-4 hover:bg-[#111827] transition-colors">
                <div className="w-[40px] h-[40px] shrink-0 flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                  <Activity size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold text-white tracking-tight">{activeTransactions.length}</p>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest truncate">Transfers</p>
                </div>
              </div>

              <Link to="/transaction-reverse-entries" className="bg-[#0A0E17]/50 backdrop-blur-xl border border-white/[0.04] p-5 rounded-[16px] flex items-center gap-4 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all group">
                <div className="w-[40px] h-[40px] shrink-0 flex items-center justify-center bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl group-hover:bg-rose-500/20 transition-colors">
                  <RotateCcw size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold text-white tracking-tight">{activeTransactions.length}</p>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest truncate">Reversals</p>
                </div>
              </Link>
            </>
          )}

          {isIPOEnabled && (
            <>
              <div className="bg-[#0A0E17]/50 backdrop-blur-xl border border-white/[0.04] p-5 rounded-[16px] flex items-center gap-4 hover:bg-[#111827] transition-colors">
                <div className="w-[40px] h-[40px] shrink-0 flex items-center justify-center bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                  <Package size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold text-white tracking-tight">{applications.length}</p>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest truncate">IPO Apps</p>
                </div>
              </div>

              <div className="bg-[#0A0E17]/50 backdrop-blur-xl border border-white/[0.04] p-5 rounded-[16px] flex items-center gap-4 hover:bg-[#111827] transition-colors">
                <div className="w-[40px] h-[40px] shrink-0 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                  <TrendingUp size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold text-white tracking-tight truncate">₹{Math.round(totalMyProfit).toLocaleString("en-IN")}</p>
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest truncate">My Profit</p>
                </div>
              </div>
            </>
          )}
      </div>

      {/* MAIN CONTENT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Chart */}
        {isIPOEnabled && (
          <div className="lg:col-span-2 bg-[#111827]/80 backdrop-blur-xl border border-white/[0.04] p-6 rounded-[16px] relative overflow-hidden">
             {/* Glow behind chart */}
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[100px] bg-indigo-500/20 blur-[80px] pointer-events-none" />
             
             <div className="flex justify-between items-center mb-8 relative z-10">
               <h3 className="text-[15px] font-semibold text-white/90">Profit Analytics</h3>
             </div>
             
             <div className="h-[280px] w-full min-h-0 min-w-0 flex-1 relative z-10">
                {profitData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={profitData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.4}/>
                            <stop offset="100%" stopColor="#6366F1" stopOpacity={0}/>
                          </linearGradient>
                          <filter id="shadow" height="200%">
                            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6366F1" floodOpacity="0.4"/>
                          </filter>
                        </defs>
                        <XAxis 
                           dataKey="name" 
                           axisLine={false} 
                           tickLine={false} 
                           tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 500 }} 
                           dy={10}
                        />
                        <YAxis hide={true} />
                        <ReTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                        <Area 
                           type="monotone"
                           dataKey="myProfit" 
                           stroke="#6366F1" 
                           strokeWidth={3}
                           fill="url(#colorProfit)" 
                           isAnimationActive={true}
                           style={{ filter: 'url(#shadow)' }}
                        />
                     </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-white/40 text-sm">
                    No profit data available yet.
                  </div>
                )}
             </div>

             <div className="mt-6 pt-6 border-t border-white/[0.04] relative z-10">
               <div className="flex flex-wrap items-center justify-between gap-4">
                 <div className="flex items-center gap-6 md:gap-8">
                   <div className="flex flex-col">
                     <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">My Profit</span>
                     <span className="text-[18px] font-black text-indigo-400 tracking-tight tabular-nums">₹{Math.round(totalMyProfit).toLocaleString("en-IN")}</span>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Total Profit</span>
                     <span className="text-[18px] font-black text-emerald-400 tracking-tight tabular-nums">₹{Math.round(totalOverallProfit).toLocaleString("en-IN")}</span>
                   </div>
                 </div>
                 <button 
                   onClick={() => setShowProfitsModal(true)}
                   className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/[0.04] transition-colors"
                 >
                   Show More Breakdown
                 </button>
               </div>
             </div>
          </div>
        )}

        {/* Recent Transactions Preview */}
        {isTransEnabled && (
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/[0.04] p-6 rounded-[16px] flex flex-col">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-[15px] font-semibold text-white/90">Recent Activity</h3>
               <Link to="/transactions" className="text-[12px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider">View All</Link>
             </div>
             
             <div className="flex flex-col flex-1">
                {activeTransactions.length === 0 ? (
                   <div className="py-12 flex flex-col items-center justify-center text-white/30">
                      <Activity size={24} className="mb-3 opacity-50" />
                      <p className="text-[13px]">No recent transactions.</p>
                   </div>
                ) : (
                  [...activeTransactions].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map((t, i) => (
                    <div key={t._id} className="flex justify-between items-center py-3.5 border-b border-white/[0.04] last:border-0 group hover:bg-white/[0.02] -mx-4 px-4 transition-colors">
                       <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-[36px] h-[36px] rounded-[10px] bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0 group-hover:border-indigo-500/30 group-hover:text-indigo-400 transition-colors">
                             <Activity size={14} className="text-white/40 group-hover:text-indigo-400" />
                          </div>
                          <div className="flex flex-col min-w-0">
                             <span className="text-[14px] font-semibold text-white/90 truncate">{t.description || "Transfer"}</span>
                             <span className="text-[11px] font-medium text-white/40 tracking-wide mt-0.5">{new Date(t.date).toLocaleDateString()}</span>
                          </div>
                       </div>
                       <span className="text-[14px] font-bold tabular-nums shrink-0 ml-2 text-white/90">
                          ₹{(t.amount || 0).toLocaleString("en-IN")}
                       </span>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}
      </div>

      {/* BOTTOM WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Placements */}
        {isIPOEnabled && (
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/[0.04] p-6 rounded-[16px] flex flex-col">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-[15px] font-semibold text-white/90 flex items-center gap-2">
                   Active Placements
                </h3>
                <Link to="/ipo" className="text-[12px] text-indigo-400 font-bold hover:text-indigo-300 transition-colors uppercase tracking-wider">View All</Link>
             </div>

             <div className="flex flex-col max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {applications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-white/30">
                     <Package size={24} className="mb-3 opacity-50" />
                     <p className="text-[13px]">No IPO placements currently tracking.</p>
                  </div>
                ) : (
                  applications.map((app, i) => (
                    <div key={i} onClick={() => setActiveApp(app)} className="cursor-pointer py-3.5 border-b border-white/[0.04] last:border-0 flex justify-between items-center group hover:bg-white/[0.02] -mx-4 px-4 transition-colors">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-[36px] h-[36px] rounded-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                           <Briefcase size={14} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[14px] font-semibold text-white/90 truncate">{app.ipo?.companyname || "Unknown Listing"}</span>
                          <span className="text-[11px] font-medium text-white/40 tracking-wide mt-0.5 flex items-center gap-1.5">
                            <span className="bg-white/10 px-1.5 py-0.5 rounded-[4px] text-[9px] uppercase font-bold text-white/70">PAN</span>
                            {app.pan?.nameOnPan}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col text-right shrink-0 ml-2">
                         <span className="text-[15px] font-bold text-white/90 tabular-nums">₹{(app.amount || 0).toLocaleString("en-IN")}</span>
                         <span className="text-[9px] font-bold text-amber-400 mt-1 bg-amber-500/10 px-2 py-0.5 rounded-full self-end uppercase tracking-widest border border-amber-500/20">Blocked</span>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}

        {/* ROUGH NOTES */}
        {isMoneyDiaryEnabled && (
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/[0.04] p-6 rounded-[16px]">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-[15px] font-semibold text-white/90">Social Ledger</h3>
                <Link to="/rough-notes" className="text-[12px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider">Manage</Link>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {persons.length === 0 ? (
                   <p className="text-[13px] text-white/40 col-span-1 sm:col-span-2 text-center py-4">No ledger entries.</p>
                ) : (
                  persons.slice(0, 4).map((p, idx) => (
                    <Link to={`/rough-notes/${p._id}`} key={idx} className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-[12px] hover:bg-white/[0.04] hover:border-white/10 transition-all block group">
                       <div className="flex justify-between items-center mb-3">
                          <span className="text-[13px] font-semibold text-white/80">{p.name}</span>
                          <ChevronRight size={14} className="text-white/30 group-hover:text-white transition-colors" />
                       </div>
                       <div className="flex flex-col">
                          <span className={`text-[18px] font-bold tracking-tight tabular-nums ${p.balance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                             ₹{Math.abs(p.balance || 0).toLocaleString("en-IN")}
                          </span>
                          <span className="text-[11px] font-medium text-white/40 mt-1 tracking-wide uppercase">
                             {p.balance < 0 ? 'You owe' : 'Owes you'}
                          </span>
                       </div>
                    </Link>
                  ))
                )}
             </div>
          </div>
        )}

      </div>

      {/* ACTIVE PLACEMENT MODAL */}
      <Modal open={!!activeApp} onClose={() => setActiveApp(null)} title="Placement Details" maxWidth="max-w-md">
        {activeApp && (
          <div className="flex flex-col gap-4 text-[var(--color-text-base)]">
            <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
              <div className="flex flex-col">
                 <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-1">Company Listing</span>
                 <span className="text-sm text-white font-bold">{activeApp.ipo?.companyname || "Unknown Listing"}</span>
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-1">Blocked Amount</span>
                 <span className="text-base text-amber-500 font-bold tabular-nums">₹{(activeApp.amount || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05] flex flex-col">
                 <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">PAN Holder</span>
                 <span className="text-sm text-white font-bold truncate">{activeApp.pan?.nameOnPan || "N/A"}</span>
                 <span className="text-[10px] text-white/50 mt-0.5 truncate">{activeApp.pan?.panNumber}</span>
              </div>
              <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05] flex flex-col">
                 <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">Bank Account</span>
                 <span className="text-sm text-white font-bold truncate">{activeApp.bankAcc?.nickname || "N/A"}</span>
                 <span className="text-[10px] text-white/50 mt-0.5 truncate">{activeApp.bankAcc?.bank}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 mt-2">
               <div className="flex flex-col mb-1">
                  <span className="text-sm text-rose-400 font-bold">Delete Application</span>
                  <span className="text-[10px] text-rose-400/70">This will completely remove the placement entry from your active tracking list.</span>
               </div>
               <button 
                 onClick={handleDeleteApp}
                 className="bg-rose-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-rose-600 transition-colors self-end"
               >
                 Delete Placement
               </button>
            </div>
            <ModalFooter>
              <CancelBtn onClick={() => setActiveApp(null)}>Close</CancelBtn>
            </ModalFooter>
          </div>
        )}
      </Modal>

      {/* DETAILED PROFITS MODAL */}
      <Modal open={showProfitsModal} onClose={() => setShowProfitsModal(false)} title="Profit Distribution Breakdown" maxWidth="max-w-md">
        <div className="flex flex-col gap-2 text-[var(--color-text-base)] max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar p-1">
          {detailedProfitList.length === 0 ? (
            <p className="text-center text-[13px] text-white/40 py-8">No profit data available.</p>
          ) : (
            detailedProfitList.map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-3.5 rounded-xl border border-white/[0.05]">
                 <div className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-white/30 w-4 text-right tabular-nums">{i + 1}.</span>
                    <div className="flex flex-col">
                       <span className="text-[14px] font-semibold text-white/90">
                          {item.name}
                       </span>
                       <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-0.5">{item.type}</span>
                    </div>
                 </div>
                 <span className={`text-[15px] font-bold tabular-nums ${item.type === 'Me' ? 'text-indigo-400' : item.type === 'Funder' ? 'text-emerald-400' : 'text-white'}`}>
                    ₹{Math.round(item.profit).toLocaleString("en-IN")}
                 </span>
              </div>
            ))
          )}
        </div>
        <ModalFooter>
          <CancelBtn onClick={() => setShowProfitsModal(false)}>Close</CancelBtn>
        </ModalFooter>
      </Modal>

    </div>
  );
};

export default Dashboard;
