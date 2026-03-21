import React, { useState } from "react";
import Modal, { ModalFooter, CancelBtn } from "./Modal";
import { useIPO } from "../context/IPOContext";
import { Trash2, AlertCircle, Bookmark, Search, ArrowUpDown, CreditCard, PiggyBank, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_OPTS = ["Pending", "Applied", "Not Applied", "Allotted", "Blocked", "Refunded"];
const GMP_TYPES = ["Allotted/Not Allotted", "Just Allotted"];

const IPOApplicationsDetailsModal = ({ open, onClose, ipo }) => {
  const { applications, cancelApplication, updateStatus } = useIPO();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const filteredApps = applications.filter(app => (app.ipo?._id || app.ipo) === ipo?._id);

  const searchedApps = filteredApps.filter(app => {
    const s = searchTerm.toLowerCase();
    return (
      app.pan?.nameOnPan?.toLowerCase().includes(s) ||
      app.pan?.panNumber?.toLowerCase().includes(s) ||
      app.bankAcc?.nickname?.toLowerCase().includes(s)
    );
  });

  const sorted = [...searchedApps].sort((a, b) => {
    if (!sortField) return 0;
    const valA = sortField === 'amount' ? a.amount : (a.pan?.nameOnPan || "");
    const valB = sortField === 'amount' ? b.amount : (b.pan?.nameOnPan || "");
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleUpdate = async (appId, updates) => {
    await updateStatus(appId, updates);
  };

  const handleCancel = async (appId) => {
    if (window.confirm("Delete this entry and restore blocked funds?")) {
      await cancelApplication(appId);
    }
  };

  const totalBlocked = searchedApps.reduce((sum, a) => sum + a.amount, 0);
  const totalProfit = searchedApps.reduce((sum, a) => sum + (a.profit || 0), 0);

  return (
    <Modal open={open} onClose={onClose} title={`IPO Ledger: ${ipo?.companyname}`} maxWidth="max-w-[1400px]">
      <div className="flex flex-col gap-6 mt-2 pb-2">
        
        {/* STATS BAR */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 px-1">
          <div className="flex items-center gap-8 w-full lg:w-auto">
             <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/10">
                   <Bookmark size={20} />
                </div>
                <div>
                   <p className="text-white font-black text-lg tracking-tight">₹{totalBlocked.toLocaleString("en-IN")}</p>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Capital Blocked</p>
                </div>
             </div>

             <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                   <PiggyBank size={20} />
                </div>
                <div>
                   <p className="text-emerald-400 font-black text-lg tracking-tight">₹{totalProfit.toLocaleString("en-IN")}</p>
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Total Profit</p>
                </div>
             </div>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text"
              placeholder="Search holder or bank..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all font-bold"
            />
          </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden lg:block border border-white/5 rounded-[40px] overflow-hidden bg-black/40 backdrop-blur-md shadow-2xl">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/5">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-center w-20">#</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-center w-24">Action</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">PAN Holder Info</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Bank Detail</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-center bg-white/[0.02]">GMP Sale</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right bg-white/[0.02]">Profit (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                <AnimatePresence mode="popLayout">
                  {sorted.map((app, index) => (
                    <motion.tr layout key={app._id} className="hover:bg-white/[0.04] transition-all group">
                      <td className="px-8 py-5 text-center">
                         <span className="text-[10px] font-black text-gray-600 font-mono tracking-tighter">{String(index + 1).padStart(2, '0')}</span>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex justify-center">
                            <button onClick={() => handleCancel(app._id)} className="p-3 rounded-2xl text-gray-700 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/10 group-hover:scale-110">
                               <Trash2 size={16} />
                            </button>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-sm">
                               {app.pan?.nameOnPan?.[0].toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                               <span className="text-sm font-black text-white uppercase tracking-tight">{app.pan?.nameOnPan}</span>
                               <span className="text-[10px] text-gray-600 font-black tracking-widest mt-1 uppercase">{app.pan?.panNumber}</span>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex flex-col">
                           <span className="text-xs font-black text-gray-300 uppercase leading-none mb-2">{app.bankAcc?.nickname}</span>
                           <span className="text-[10px] text-gray-600 font-black uppercase tracking-tighter opacity-50">{app.bankAcc?.bank}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <select 
                           value={app.status}
                           onChange={(e) => handleUpdate(app._id, { status: e.target.value })}
                           className={`appearance-none bg-white/5 border border-white/5 rounded-2xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-center cursor-pointer min-w-[140px]
                                       ${app.status === 'Allotted' ? 'text-emerald-400 border-emerald-500/30' : 
                                         app.status === 'Pending' ? 'text-amber-400 border-amber-500/30' : 
                                         app.status === 'Not Applied' ? 'text-rose-400 border-rose-500/30' : 'text-blue-400'}`}
                         >
                            {STATUS_OPTS.map(opt => <option key={opt} value={opt} className="bg-[#141414] text-white">{opt}</option>)}
                         </select>
                      </td>
                      
                      {/* GMP SECTION */}
                      <td className="px-8 py-5 bg-white/[0.01]">
                         <div className="flex flex-col items-center gap-3">
                            <button 
                              onClick={() => handleUpdate(app._id, { isGMPSold: !app.isGMPSold })}
                              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border
                                         ${app.isGMPSold ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-white/5 text-gray-500 border-white/5'}`}
                            >
                               {app.isGMPSold ? "SOLD" : "UNSOLD"}
                            </button>
                            
                            {app.isGMPSold && (
                              <div className="flex flex-col gap-2">
                                <select 
                                  value={app.gmpType}
                                  onChange={(e) => handleUpdate(app._id, { gmpType: e.target.value })}
                                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-[8px] font-bold text-gray-400 uppercase tracking-widest focus:outline-none"
                                >
                                   {GMP_TYPES.map(t => <option key={t} value={t} className="bg-[#141414]">{t}</option>)}
                                </select>
                                <input 
                                  type="number"
                                  placeholder="GMP ₹"
                                  key={`${app._id}-${app.gmpPrice}`}
                                  defaultValue={app.gmpPrice || ""}
                                  onBlur={(e) => handleUpdate(app._id, { gmpPrice: Number(e.target.value) })}
                                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-white focus:border-indigo-500/50 outline-none w-24 text-center font-black"
                                />
                              </div>
                            )}
                         </div>
                      </td>

                      <td className="px-8 py-5 text-right bg-white/[0.01]">
                         <div className="flex flex-col items-end">
                            <span className={`text-xl font-black tracking-tighter ${app.profit > 0 ? 'text-emerald-400' : app.profit < 0 ? 'text-rose-400' : 'text-gray-700'}`}>
                               ₹{(app.profit || 0).toLocaleString("en-IN")}
                            </span>
                            <span className="text-[8px] font-black text-gray-700 uppercase tracking-[0.2em] mt-1 italic">
                               {app.isGMPSold ? (app.gmpType === "Just Allotted" && app.status !== "Allotted" ? "Calculated (If Allotted)" : "Net Profit Recorded") : "No Gains tracked"}
                            </span>
                         </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE CARDS */}
        <div className="lg:hidden flex flex-col gap-4 max-h-[600px] overflow-y-auto custom-scrollbar p-1">
          <AnimatePresence mode="popLayout">
            {sorted.map((app, index) => (
               <motion.div layout key={app._id} className="bg-black/40 border border-white/5 rounded-3xl p-5 flex flex-col gap-4 relative">
                  <div className="flex justify-between items-start gap-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-sm shrink-0">
                           {app.pan?.nameOnPan?.[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-black text-white uppercase tracking-tight">{app.pan?.nameOnPan}</span>
                           <span className="text-[10px] text-gray-600 font-black tracking-widest mt-0.5 uppercase">{app.pan?.panNumber}</span>
                        </div>
                     </div>
                     <button onClick={() => handleCancel(app._id)} className="p-2 -mr-2 -mt-2 rounded-xl text-gray-700 hover:text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 transition-all">
                        <Trash2 size={16} />
                     </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-white/[0.02] p-3 rounded-2xl">
                     <div className="flex flex-col">
                        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider mb-1">Bank</span>
                        <span className="text-xs font-black text-gray-300 uppercase leading-tight truncate">{app.bankAcc?.nickname}</span>
                        <span className="text-[9px] text-gray-600 font-black uppercase tracking-tighter opacity-50 truncate pb-0.5">{app.bankAcc?.bank}</span>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider mb-1">Status</span>
                        <select 
                          value={app.status}
                          onChange={(e) => handleUpdate(app._id, { status: e.target.value })}
                          className={`appearance-none bg-white/5 border border-white/5 rounded-xl px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-center cursor-pointer w-full text-ellipsis overflow-hidden
                                      ${app.status === 'Allotted' ? 'text-emerald-400 border-emerald-500/30' : 
                                        app.status === 'Pending' ? 'text-amber-400 border-amber-500/30' : 
                                        app.status === 'Not Applied' ? 'text-rose-400 border-rose-500/30' : 'text-blue-400'}`}
                        >
                           {STATUS_OPTS.map(opt => <option key={opt} value={opt} className="bg-[#141414] text-white">{opt}</option>)}
                        </select>
                     </div>
                  </div>

                  <div className="flex justify-between items-center bg-white/[0.02] p-3 rounded-2xl gap-4">
                     <div className="flex flex-col flex-1 gap-2 border-r border-white/5 pr-4">
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">GMP</span>
                           <button 
                             onClick={() => handleUpdate(app._id, { isGMPSold: !app.isGMPSold })}
                             className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border
                                        ${app.isGMPSold ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-white/5 text-gray-500 border-white/5'}`}
                           >
                              {app.isGMPSold ? "SOLD" : "UNSOLD"}
                           </button>
                        </div>
                        {app.isGMPSold && (
                          <div className="flex flex-col gap-1.5">
                            <select 
                              value={app.gmpType}
                              onChange={(e) => handleUpdate(app._id, { gmpType: e.target.value })}
                              className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[8px] font-bold text-gray-400 uppercase tracking-widest focus:outline-none w-full"
                            >
                               {GMP_TYPES.map(t => <option key={t} value={t} className="bg-[#141414]">{t}</option>)}
                            </select>
                            <input 
                              type="number"
                              placeholder="₹ Value"
                              key={`${app._id}-${app.gmpPrice}`}
                              defaultValue={app.gmpPrice || ""}
                              onBlur={(e) => handleUpdate(app._id, { gmpPrice: Number(e.target.value) })}
                              className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white focus:border-indigo-500/50 outline-none w-full font-black text-center"
                            />
                          </div>
                        )}
                     </div>
                     <div className="flex flex-col items-end flex-1 pl-2">
                        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider mb-0.5">Profit Tracking</span>
                        <span className={`text-lg font-black tracking-tighter ${app.profit > 0 ? 'text-emerald-400' : app.profit < 0 ? 'text-rose-400' : 'text-gray-500'}`}>
                           ₹{(app.profit || 0).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[7px] font-bold text-gray-600 uppercase tracking-widest mt-1 italic text-right leading-tight max-w-[80px]">
                           {app.isGMPSold ? (app.gmpType === "Just Allotted" && app.status !== "Allotted" ? "Calculated (If Allotted)" : "Net Profit Recorded") : "No Gains tracked"}
                        </span>
                     </div>
                  </div>
               </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <ModalFooter>
           <div className="flex-1 flex items-center gap-6 px-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Active Application</span>
              </div>
              <p className="text-[9px] text-gray-500 font-bold uppercase italic tracking-wider">Note: GMP Profit for 'Just Allotted' is only realized when status is Allotted.</p>
           </div>
           <CancelBtn onClick={onClose} />
        </ModalFooter>
      </div>
    </Modal>
  );
};

export default IPOApplicationsDetailsModal;
