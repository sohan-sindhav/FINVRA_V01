import React, { useMemo, useEffect } from "react";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ReTooltip
} from "recharts";
import { Link } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import MinBalanceWarningBanner from "../components/MinBalanceWarningBanner.jsx";

const Dashboard = () => {
  const { bankAccounts } = useBankAccounts();
  const { ipos, applications } = useIPO();
  const { persons } = useRoughNote();
  const { transactions } = useTransactions();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const isLight = theme === "light";
  const enabledModules = user?.enabledModules || [];

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

  const totalIPOProfit = useMemo(() => 
    isIPOEnabled ? applications.reduce((sum, app) => sum + (app.profit || 0), 0) : 0, 
  [applications, isIPOEnabled]);

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
      map[name] = (map[name] || 0) + (app.profit || 0);
    });
    return Object.entries(map)
      .map(([name, profit]) => ({ name, profit }))
      .filter(d => Math.abs(d.profit) > 0)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 8);
  }, [applications, isIPOEnabled]);

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
        
        {/* Net Wealth Card */}
        <div className="sm:col-span-2 bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-md text-white">
           <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium text-white/80">Final Net Worth</p>
              <div className="p-2 bg-white/20 rounded-lg">
                 <TrendingUp size={16} />
              </div>
           </div>
           <h2 className="text-3xl font-bold mb-4 drop-shadow-sm">₹{totalNetWealth.toLocaleString("en-IN")}</h2>
           
           <div className="flex flex-col gap-1 border-t border-white/20 pt-3">
              <div className="flex justify-between text-xs font-medium">
                  <span className="text-white/80">Gross Assets (Bank + IPO + Owed to you)</span>
                  <span className="text-emerald-300">+ ₹{totalAssets.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                  <span className="text-white/80">Liabilities (Money you owe)</span>
                  <span className="text-rose-300">- ₹{totalLiabilities.toLocaleString("en-IN")}</span>
              </div>
           </div>

           <div className="flex items-center gap-2 text-[10px] font-medium text-emerald-300 mt-4">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
               Real-time Valuation Active
           </div>
        </div>

        {isBankEnabled && (
          <div className="bg-[var(--color-bg-card)] p-6 border border-[var(--color-border)] rounded-xl shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-medium text-[var(--color-text-muted)]">Bank Balance</p>
                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                   <Wallet size={16} />
                </div>
             </div>
             <h2 className="text-2xl font-bold mb-1">₹{totalBankBalance.toLocaleString("en-IN")}</h2>
             <p className="text-xs text-[var(--color-text-faint)]">{bankAccounts.length} Accounts</p>
          </div>
        )}

        {isIPOEnabled && (
          <div className="bg-[var(--color-bg-card)] p-6 border border-[var(--color-border)] rounded-xl shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-medium text-[var(--color-text-muted)]">Locked Capital</p>
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                   <Briefcase size={16} />
                </div>
             </div>
             <h2 className="text-2xl font-bold mb-1">₹{totalBlockedCapital.toLocaleString("en-IN")}</h2>
             <p className="text-xs text-[var(--color-text-faint)]">{applications.length} IPO Entries</p>
          </div>
        )}
      </div>

      {/* OPERATIONAL STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isTransEnabled && (
            <>
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 rounded-xl flex items-center gap-4">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-lg">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--color-text-base)]">{activeTransactions.length}</p>
                  <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Transfers</p>
                </div>
              </div>

              <Link to="/transaction-reverse-entries" className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 rounded-xl flex items-center gap-4 hover:border-rose-500 group transition-all">
                <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-lg group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  <RotateCcw size={18} />
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--color-text-base)]">{activeTransactions.length}</p>
                  <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Reversals</p>
                </div>
              </Link>
            </>
          )}

          {isIPOEnabled && (
            <>
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 rounded-xl flex items-center gap-4">
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg">
                  <Package size={18} />
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--color-text-base)]">{applications.length}</p>
                  <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">IPO Apps</p>
                </div>
              </div>

              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-4 rounded-xl flex items-center gap-4">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--color-text-base)]">₹{totalIPOProfit.toLocaleString("en-IN")}</p>
                  <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Net Profit</p>
                </div>
              </div>
            </>
          )}
      </div>

      {/* MAIN CONTENT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Chart */}
        {isIPOEnabled && (
          <div className="lg:col-span-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6 rounded-xl shadow-sm">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-base font-semibold text-[var(--color-text-base)]">Profit Analytics</h3>
             </div>
             
             <div className="h-[300px] w-full min-h-0 min-w-0 flex-1">
                {profitData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={profitData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? "#e5e7eb" : "#374151"} />
                        <XAxis 
                           dataKey="name" 
                           axisLine={false} 
                           tickLine={false} 
                           tick={{ fill: isLight ? '#6b7280' : '#9ca3af', fontSize: 12 }} 
                           dy={10}
                        />
                        <YAxis 
                           axisLine={false} 
                           tickLine={false} 
                           tick={{ fill: isLight ? '#6b7280' : '#9ca3af', fontSize: 12 }} 
                        />
                        <ReTooltip 
                           cursor={{ fill: isLight ? '#f3f4f6' : '#1f2937' }}
                           contentStyle={{ backgroundColor: isLight ? '#fff' : '#1f2937', border: `1px solid ${isLight ? '#e5e7eb' : '#374151'}`, borderRadius: '8px' }}
                           itemStyle={{ color: 'var(--color-text-base)', fontSize: '14px', fontWeight: '600' }}
                        />
                        <Bar 
                           dataKey="profit" 
                           fill="#6366f1" 
                           radius={[4, 4, 0, 0]}
                           barSize={32}
                        />
                     </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[var(--color-text-faint)] text-sm">
                    No profit data available yet.
                  </div>
                )}
             </div>
          </div>
        )}

        {/* Detailed Accounts list */}
        {isBankEnabled && (
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6 rounded-xl shadow-sm flex flex-col">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-base font-semibold text-[var(--color-text-base)] flex items-center gap-2">
                  <Wallet size={16} className="text-indigo-500" /> Accounts
               </h3>
               <Link to="/bankacc" className="text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors">Manage</Link>
             </div>
             
             <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                {bankAccounts.length === 0 ? (
                   <p className="text-sm text-[var(--color-text-muted)] text-center py-8">No linked accounts.</p>
                ) : (
                  [...bankAccounts].sort((a,b) => (b.balance || 0) - (a.balance || 0)).slice(0, 6).map((acc, i) => (
                    <div key={acc._id} className="flex justify-between items-center p-3.5 rounded-xl bg-[var(--color-bg-page)] border border-[var(--color-border)] hover:border-indigo-500/30 transition-colors">
                       <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[var(--color-text-base)]">{acc.nickname}</span>
                          <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{acc.bank || "Unknown"}</span>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-bold text-[var(--color-text-base)]">₹{(acc.balance || 0).toLocaleString("en-IN")}</p>
                          <span className="w-12 h-0.5 mt-1 bg-indigo-500/10 rounded-full overflow-hidden block ml-auto">
                             <motion.span initial={{ width: 0 }} animate={{ width: `${((acc.balance || 0) / (totalBankBalance || 1)) * 100}%` }} className="h-full bg-indigo-500 block rounded-full" />
                          </span>
                       </div>
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
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6 rounded-xl shadow-sm flex flex-col">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-semibold text-[var(--color-text-base)] flex items-center gap-2">
                   <Briefcase size={16} className="text-amber-500" /> Active Placements
                </h3>
                <Link to="/ipo" className="text-xs text-indigo-500 font-medium hover:text-indigo-600 transition-colors">View All</Link>
             </div>

             <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {applications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-[var(--color-text-muted)]">
                     <Package size={24} className="mb-2 opacity-50" />
                     <p className="text-sm">No IPO placements currently tracking.</p>
                  </div>
                ) : (
                  applications.map((app, i) => (
                    <div key={i} className="bg-[var(--color-bg-page)] border border-[var(--color-border)] p-4 rounded-xl flex justify-between items-center hover:border-amber-500/40 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[var(--color-text-base)]">{app.ipo?.companyname || "Unknown Listing"}</span>
                        <span className="text-[10px] font-medium text-[var(--color-text-muted)] mt-0.5 flex items-center gap-1">
                          <span className="bg-[var(--color-border)] px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-[var(--color-text-faint)]">PAN</span>
                          {app.pan?.nameOnPan}
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                         <span className="text-base font-bold text-[var(--color-text-base)]">₹{(app.amount || 0).toLocaleString("en-IN")}</span>
                         <span className="text-[10px] font-semibold text-amber-500 mt-0.5 bg-amber-500/10 px-2 rounded-full self-end uppercase">Blocked</span>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}

        {/* ROUGH NOTES */}
        {isMoneyDiaryEnabled && (
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6 rounded-xl shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-semibold text-[var(--color-text-base)]">Social Ledger</h3>
                <Link to="/rough-notes" className="text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors">Manage entries</Link>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {persons.length === 0 ? (
                   <p className="text-sm text-[var(--color-text-muted)] col-span-1 sm:col-span-2 text-center py-4">No ledger entries.</p>
                ) : (
                  persons.slice(0, 4).map((p, idx) => (
                    <Link to={`/rough-notes/${p._id}`} key={idx} className="bg-[var(--color-bg-page)] border border-[var(--color-border)] p-4 rounded-lg hover:border-indigo-500/50 transition-colors block group">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-[var(--color-text-base)]">{p.name}</span>
                          <ChevronRight size={14} className="text-[var(--color-text-faint)] group-hover:text-indigo-500 transition-colors" />
                       </div>
                       <div className="flex flex-col">
                          <span className={`text-lg font-bold ${p.balance < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                             ₹{Math.abs(p.balance || 0).toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-[var(--color-text-muted)] mt-0.5">
                             {p.balance < 0 ? 'You owe them' : 'They owe you'}
                          </span>
                       </div>
                    </Link>
                  ))
                )}
             </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default Dashboard;
