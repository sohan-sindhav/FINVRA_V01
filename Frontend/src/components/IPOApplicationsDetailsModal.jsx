import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useIPO } from "../context/IPOContext";
import { X, Search, RotateCcw, Download } from "lucide-react";

const STATUS_OPTS = ["Pending", "Applied", "Not Applied", "Not Allotted", "Allotted", "Blocked", "Refunded"];
const SOLD_TYPES = ["Subject 1", "Subject 2", "Premium"];

const IPOApplicationsDetailsModal = ({ open, onClose, ipo }) => {
  const { applications, cancelApplication, updateStatus } = useIPO();
  const [searchTerm, setSearchTerm] = useState("");

  if (!ipo || typeof document === "undefined") return null;

  const filteredApps = applications.filter(app => (app.ipo?._id || app.ipo) === ipo?._id);
  
  const searchedApps = filteredApps.filter(app => {
    const s = searchTerm.toLowerCase();
    return (
      app.pan?.nameOnPan?.toLowerCase().includes(s) ||
      app.pan?.panNumber?.toLowerCase().includes(s) ||
      app.bankAcc?.nickname?.toLowerCase().includes(s)
    );
  });

  const sortedApps = [...searchedApps].sort((a, b) => (a.pan?.nameOnPan || "").localeCompare(b.pan?.nameOnPan || ""));

  const handleUpdate = async (appId, updates) => {
    await updateStatus(appId, updates);
  };

  const handleCancel = async (appId) => {
    if (window.confirm("Reverse this application? Blocked funds will be released.")) {
      await cancelApplication(appId);
    }
  };

  const totalBlocked = searchedApps.reduce((sum, a) => sum + a.amount, 0);
  const totalProfit = searchedApps.reduce((sum, a) => sum + (a.profit || 0), 0);
  const totalMyProfit = searchedApps.reduce((sum, a) => sum + (a.myProfit || 0), 0);
  const totalHolderProfit = searchedApps.reduce((sum, a) => sum + (a.holderProfit || 0), 0);
  const totalFunderProfit = searchedApps.reduce((sum, a) => sum + (a.funderProfit || 0), 0);

  const handleDownloadAllotted = () => {
    const allottedApps = searchedApps.filter(app => app.status === "Allotted");
    if (allottedApps.length === 0) {
      alert("No allotted applications found to download.");
      return;
    }

    let csvContent = "Index,Full Name,PAN Number\n";
    allottedApps.forEach((app, index) => {
      csvContent += `${index + 1},"${app.pan?.nameOnPan || ""}","${app.pan?.panNumber || ""}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Allotted_PANs_${ipo?.companyname || "IPO"}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4"
        >
          <motion.div
            key="panel"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.14 }}
            onClick={e => e.stopPropagation()}
            className="bg-[#0f0f1a] border border-white/[0.08] rounded-2xl w-full max-w-[1400px] overflow-hidden text-white flex flex-col max-h-[90vh] shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.06] shrink-0">
              <div>
                <h2 className="font-bold text-[15px] tracking-tight">Ledger: {ipo?.companyname}</h2>
                <p className="text-[11px] text-white/40 mt-0.5 font-medium uppercase tracking-wider">
                  Total Apps: {filteredApps.length}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={handleDownloadAllotted}
                  className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-indigo-500 hover:text-white transition-colors"
                  title="Download Allotted PANs as CSV"
                >
                  <Download size={13} /> Allotted
                </button>
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input 
                    type="text"
                    placeholder="Search holder or bank..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/[0.04] border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-[12px] text-white focus:outline-none focus:border-indigo-500/50 w-64 placeholder:text-white/20"
                  />
                </div>
                <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse min-w-[1200px]">
                <thead className="sticky top-0 z-10 bg-[#0f0f1a]">
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30 w-10">#</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">Name</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">PAN</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">Bank Account</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">Status</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">Sold</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">Sold Type</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">Sold ₹</th>
                    <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-white/30" title="My % / Holder % / Funder %">Shares % (M/H/F)</th>
                    <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-white/30">Profit</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-white/30 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {sortedApps.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-16 text-center text-[12px] text-white/30">
                        No applications found.
                      </td>
                    </tr>
                  ) : (
                    sortedApps.map((app, i) => (
                      <tr key={app._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-[12px] text-white/25 tabular-nums">{i + 1}</td>
                        
                        <td className="px-3 py-3">
                          <span className="text-[13px] font-semibold text-white/80">{app.pan?.nameOnPan}</span>
                        </td>
                        
                        <td className="px-3 py-3">
                          <span className="text-[11px] font-mono tracking-widest text-white/40">{app.pan?.panNumber}</span>
                        </td>
                        
                        <td className="px-3 py-3">
                          <span className="text-[12px] text-emerald-400/70">{app.bankAcc?.nickname}</span>
                        </td>

                        <td className="px-3 py-3">
                          <select 
                            value={app.status}
                            onChange={(e) => handleUpdate(app._id, { status: e.target.value })}
                            className={`text-[11px] font-bold uppercase tracking-wider bg-white/[0.04] border border-white/10 rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500/50 cursor-pointer
                                        ${app.status === 'Allotted' ? 'text-emerald-400' : 
                                          app.status === 'Pending' ? 'text-amber-400' : 
                                          app.status === 'Not Applied' ? 'text-rose-400' :
                                          app.status === 'Not Allotted' ? 'text-orange-400' : 'text-blue-400'}`}
                          >
                            {STATUS_OPTS.map(opt => <option key={opt} value={opt} className="bg-[#141414] text-white">{opt}</option>)}
                          </select>
                        </td>

                        <td className="px-3 py-3">
                          <button 
                            onClick={() => handleUpdate(app._id, { isGMPSold: !app.isGMPSold })}
                            className={`px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                              app.isGMPSold 
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
                                : 'bg-white/[0.03] text-white/30 border-white/10 hover:border-white/20'
                            }`}
                          >
                            {app.isGMPSold ? "Yes" : "No"}
                          </button>
                        </td>

                        <td className="px-3 py-3">
                          {app.isGMPSold ? (
                            <select 
                              value={app.gmpType || "Premium"}
                              onChange={(e) => handleUpdate(app._id, { gmpType: e.target.value })}
                              className="text-[11px] bg-transparent border-b border-white/10 text-white/70 focus:outline-none focus:border-indigo-500/50 pb-0.5 cursor-pointer w-[120px]"
                            >
                              {!SOLD_TYPES.includes(app.gmpType) && app.gmpType && (
                                <option value={app.gmpType} className="bg-[#141414] hidden">{app.gmpType}</option>
                              )}
                              {SOLD_TYPES.map(t => <option key={t} value={t} className="bg-[#141414]">{t}</option>)}
                            </select>
                          ) : (
                            <span className="text-[12px] text-white/15">—</span>
                          )}
                        </td>

                        <td className="px-3 py-3">
                          {app.isGMPSold ? (
                            <input 
                              type="number"
                              placeholder="₹"
                              defaultValue={app.gmpPrice || ""}
                              onBlur={(e) => handleUpdate(app._id, { gmpPrice: Number(e.target.value) })}
                              className="text-[12px] bg-white/[0.04] border border-white/10 text-white/90 rounded px-2 py-1.5 w-[80px] focus:outline-none focus:border-indigo-500/50 font-mono"
                            />
                          ) : (
                            <span className="text-[12px] text-white/15">—</span>
                          )}
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-1 text-[11px] text-white/50 font-mono">
                            <input 
                              type="number"
                              defaultValue={app.mySharePct ?? 25}
                              onBlur={(e) => handleUpdate(app._id, { mySharePct: Number(e.target.value) })}
                              className="w-8 bg-transparent border-b border-white/20 text-center focus:outline-none focus:border-indigo-500 hover:border-white/50"
                              title="My Share %"
                            />/
                            <input 
                              type="number"
                              defaultValue={app.holderSharePct ?? 25}
                              onBlur={(e) => handleUpdate(app._id, { holderSharePct: Number(e.target.value) })}
                              className="w-8 bg-transparent border-b border-white/20 text-center focus:outline-none focus:border-indigo-500 hover:border-white/50"
                              title="Holder Share %"
                            />/
                            <input 
                              type="number"
                              defaultValue={app.funderSharePct ?? 50}
                              onBlur={(e) => handleUpdate(app._id, { funderSharePct: Number(e.target.value) })}
                              className="w-8 bg-transparent border-b border-white/20 text-center focus:outline-none focus:border-indigo-500 hover:border-white/50"
                              title="Funder Share %"
                            />
                          </div>
                        </td>

                        <td className="px-3 py-3 text-right">
                           <div className="flex flex-col items-end gap-0.5">
                              <span className={`text-[13px] font-bold tracking-tight ${app.profit > 0 ? 'text-emerald-400' : app.profit < 0 ? 'text-rose-400' : 'text-white/30'}`}>
                                 ₹{(app.profit || 0).toLocaleString("en-IN")}
                              </span>
                              {(app.profit > 0 || app.profit < 0) && (
                                <div className="flex gap-1.5 text-[9px] font-medium text-white/40">
                                  <span title="My Profit">M: ₹{Math.round(app.myProfit || 0).toLocaleString("en-IN")}</span>
                                  <span title="Holder Profit">H: ₹{Math.round(app.holderProfit || 0).toLocaleString("en-IN")}</span>
                                  <span title="Funder Profit">F: ₹{Math.round(app.funderProfit || 0).toLocaleString("en-IN")}</span>
                                </div>
                              )}
                           </div>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleCancel(app._id)}
                            className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-all ml-auto whitespace-nowrap"
                            title="Reverse Application"
                          >
                            <RotateCcw size={11} /> Reverse
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="shrink-0 border-t border-white/[0.06] px-6 py-4 flex items-center justify-between bg-[#0f0f1a]">
              <div className="flex items-center gap-8">
                <div className="flex flex-col">
                   <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Capital Blocked</p>
                   <p className="text-[14px] text-white font-bold tracking-tight">₹{totalBlocked.toLocaleString("en-IN")}</p>
                </div>
                 <div className="flex flex-col items-end gap-0.5 border-r border-white/10 pr-6 mr-2">
                   <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Total My Profit</p>
                   <p className={`text-[15px] font-black tracking-tight ${totalMyProfit > 0 ? 'text-indigo-400' : totalMyProfit < 0 ? 'text-rose-400' : 'text-white'}`}>
                     ₹{Math.round(totalMyProfit).toLocaleString("en-IN")}
                   </p>
                 </div>
                 <div className="flex flex-col items-end gap-0.5">
                   <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Total Overall Profit</p>
                   <p className={`text-[15px] font-black tracking-tight ${totalProfit > 0 ? 'text-emerald-400' : totalProfit < 0 ? 'text-rose-400' : 'text-white'}`}>
                     ₹{totalProfit.toLocaleString("en-IN")}
                   </p>
                   {totalProfit !== 0 && (
                     <div className="flex gap-2 text-[9px] font-medium text-white/40 mt-1">
                       <span>H: ₹{Math.round(totalHolderProfit).toLocaleString("en-IN")}</span>
                       <span>F: ₹{Math.round(totalFunderProfit).toLocaleString("en-IN")}</span>
                     </div>
                   )}
                 </div>
              </div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider font-medium max-w-sm text-right">
                Profit for 'Subject 1' and 'Subject 2' is realized only when status is 'Allotted'. 'Premium' is realized regardless.
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default IPOApplicationsDetailsModal;
