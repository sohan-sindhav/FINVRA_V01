import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../configs/AxiosInstance";
import { X, Search } from "lucide-react";

const SharedIPODetailsModal = ({ open, onClose, shareId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApps, setSelectedApps] = useState([]);

  useEffect(() => {
    if (open && shareId) {
      fetchDetails();
    }
  }, [open, shareId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.get(`/api/ipo-share/details/${shareId}`);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError("Failed to load shared IPO details.");
    } finally {
      setLoading(false);
    }
  };

  if (!open || typeof document === "undefined") return null;

  const applications = data?.applications || [];
  
  const searchedApps = applications.filter(app => {
    const s = searchTerm.toLowerCase();
    return app.panName?.toLowerCase().includes(s);
  });

  const totalProfit = searchedApps.reduce((sum, a) => sum + (a.profit || 0), 0);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedApps(searchedApps.map(a => a._id));
    } else {
      setSelectedApps([]);
    }
  };

  const handleSelectOne = (appId) => {
    setSelectedApps(prev => 
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const handleDownload = () => {
    if (selectedApps.length === 0) return;
    
    const selectedData = searchedApps.filter(app => selectedApps.includes(app._id));
    
    // Create CSV content
    const headers = ["Name", "PAN Card"];
    const csvRows = [
      headers.join(","),
      ...selectedData.map(app => `"${app.panName}","${app.panNumber}"`)
    ];
    
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Shared_PANs_${data?.ipo?.companyname || "IPO"}.csv`);
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
            className="bg-[#0f0f1a] border border-white/[0.08] rounded-2xl w-full max-w-5xl overflow-hidden text-white flex flex-col max-h-[90vh] shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.06] shrink-0">
              <div>
                <h2 className="font-bold text-[15px] tracking-tight flex items-center gap-2">
                  <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded text-[10px] uppercase">Shared</span>
                  {data?.ipo?.companyname || "Loading..."}
                </h2>
                {data && (
                  <p className="text-[11px] text-white/40 mt-0.5 font-medium tracking-wider">
                    Shared by {data.fromUser?.name} • Apps: {applications.length}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input 
                    type="text"
                    placeholder="Search name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/[0.04] border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-[12px] text-white focus:outline-none focus:border-indigo-500/50 w-48 placeholder:text-white/20"
                  />
                </div>
                {selectedApps.length > 0 && (
                  <button 
                    onClick={handleDownload}
                    className="bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm tracking-wide"
                  >
                    Download ({selectedApps.length})
                  </button>
                )}
                <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">Loading applications...</div>
              ) : error ? (
                <div className="absolute inset-0 flex items-center justify-center text-rose-400 text-sm">{error}</div>
              ) : (
                <table className="w-full border-collapse min-w-[800px]">
                  <thead className="sticky top-0 z-10 bg-[#0f0f1a]">
                    <tr className="border-b border-white/[0.06]">
                      <th className="px-4 py-3 text-left w-10">
                        <input 
                          type="checkbox" 
                          checked={searchedApps.length > 0 && selectedApps.length === searchedApps.length}
                          onChange={handleSelectAll}
                          className="accent-indigo-500 w-3.5 h-3.5 rounded bg-white/10 border-white/20"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30 w-10">#</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">PAN Card Name</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">PAN Number</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">Status</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">GMP Sold</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">GMP Type</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">GMP ₹</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-white/30">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {searchedApps.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-16 text-center text-[12px] text-white/30">
                          No applications found.
                        </td>
                      </tr>
                    ) : (
                      searchedApps.map((app, i) => (
                        <tr key={app._id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <input 
                              type="checkbox" 
                              checked={selectedApps.includes(app._id)}
                              onChange={() => handleSelectOne(app._id)}
                              className="accent-indigo-500 w-3.5 h-3.5 rounded bg-white/10 border-white/20"
                            />
                          </td>
                          <td className="px-4 py-3 text-[12px] text-white/25 tabular-nums">{i + 1}</td>
                          
                          <td className="px-4 py-3">
                            <span className="text-[13px] font-semibold text-white/90">{app.panName}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[12px] font-mono font-medium text-indigo-300 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">{app.panNumber}</span>
                          </td>
                          
                          <td className="px-4 py-3">
                            <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-white/[0.04] border border-white/10
                              ${app.status === 'Allotted' ? 'text-emerald-400' : 
                                app.status === 'Pending' ? 'text-amber-400' : 
                                app.status === 'Not Applied' ? 'text-rose-400' : 'text-blue-400'}`}>
                              {app.status}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${app.isGMPSold ? 'text-indigo-400' : 'text-white/30'}`}>
                              {app.isGMPSold ? "Yes" : "No"}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-[12px] text-white/60">
                            {app.isGMPSold ? app.gmpType : "—"}
                          </td>

                          <td className="px-4 py-3 text-[12px] text-white/80 font-mono">
                            {app.isGMPSold && app.gmpPrice ? `₹${app.gmpPrice}` : "—"}
                          </td>

                          <td className="px-4 py-3 text-right">
                             <span className={`text-[13px] font-bold tracking-tight ${app.profit > 0 ? 'text-emerald-400' : app.profit < 0 ? 'text-rose-400' : 'text-white/30'}`}>
                                ₹{(app.profit || 0).toLocaleString("en-IN")}
                             </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer Summary */}
            <div className="shrink-0 border-t border-white/[0.06] px-6 py-4 flex justify-end bg-[#0f0f1a]">
              <div className="flex flex-col items-end">
                 <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Total Profit</p>
                 <p className={`text-[16px] font-bold tracking-tight ${totalProfit > 0 ? 'text-emerald-400' : totalProfit < 0 ? 'text-rose-400' : 'text-white'}`}>
                   ₹{totalProfit.toLocaleString("en-IN")}
                 </p>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SharedIPODetailsModal;
