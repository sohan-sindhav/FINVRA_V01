import React, { useEffect, useState, useRef } from "react";
import { Plus, RotateCcw, ArrowRight, Trash2, Search, Share2, Check, X, Receipt, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { useTransactions } from "../context/TransactionContext";
import { useConnections } from "../context/ConnectionContext";
import { useBankAccounts } from "../context/BankAccContext";
import Modal, {
  ModalField,
  ModalFooter,
  CancelBtn,
  ConfirmBtn,
  modalSelectCls,
  modalInputCls,
} from "../components/Modal.jsx";
import { useTheme } from "../theme/ThemeContext";

const ShareModal = ({ open, onClose, onSubmit, isSubmitting, error }) => {
  const [email, setEmail] = useState("");
  useEffect(() => { if(open) setEmail(""); }, [open]);
  return (
    <Modal open={open} onClose={onClose} title="Share Transactions">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(email); }} className="p-1 flex flex-col gap-4">
        {error && <p className="text-rose-400 text-xs">{error}</p>}
        <ModalField label="Recipient Email">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={modalInputCls} placeholder="email@example.com" />
        </ModalField>
        <ModalFooter>
          <CancelBtn onClick={onClose} disabled={isSubmitting} />
          <ConfirmBtn type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Share"}</ConfirmBtn>
        </ModalFooter>
      </form>
    </Modal>
  );
};

const OutgoingShares = ({ shares, revokeShare, onViewReceipt }) => {
  if (!shares || !shares.length) return null;
  return (
    <div className="px-6 md:px-10 pb-6">
      <div className="bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] p-5">
        <h3 className="text-[13px] font-bold text-white/50 uppercase tracking-widest mb-4">Outgoing Shares ({shares.length})</h3>
        <div className="flex flex-col gap-3">
          {shares.map(s => (
            <div key={s._id} className="flex items-center justify-between bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
              <div>
                <p className="text-sm font-semibold text-white/90">{s.toUser?.name} <span className="text-white/40 text-xs">({s.toUser?.email})</span></p>
                <p className="text-xs text-indigo-400 mt-1">{s.transactions?.length} transactions shared • <span className="uppercase tracking-widest text-[10px]">{s.status}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onViewReceipt(s)} className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg hover:bg-indigo-500/20 transition-colors">Receipt</button>
                <button onClick={async () => {
                  if(!confirm("Revoke this share?")) return;
                  await revokeShare(s._id);
                }} className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg hover:bg-rose-500/20 transition-colors">Revoke</button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};


const ReceiptModal = ({ open, onClose, shareRequest }) => {
  const hiddenRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!shareRequest) return null;
  const totalAmount = shareRequest.transactions?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  
  const isSender = !!shareRequest.toUser?.name;
  const targetName = isSender ? shareRequest.toUser?.name : shareRequest.fromUser?.name || "Unknown";
  const directionText = isSender ? "To:" : "From:";

  const handleDownload = async () => {
    if (!hiddenRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(hiddenRef.current, {
        backgroundColor: "#111827",
        scale: 2, // High resolution
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Receipt_${targetName.replace(/\s+/g, '_')}_${new Date(shareRequest.createdAt).getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error generating receipt image:", err);
      alert("Failed to download receipt.");
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <Modal open={open} onClose={onClose} title="Transaction Receipt" maxWidth="max-w-md">
      <div className="p-4 flex flex-col gap-5 max-h-[75vh]">
        <div className="flex flex-col items-center gap-1 border-b border-white/[0.04] pb-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
            <Receipt size={24} />
          </div>
          <h2 className="text-[20px] font-black text-white tracking-tight">Receipt</h2>
          <p className="text-[13px] font-medium text-white/40 uppercase tracking-wider">
            {directionText} {targetName}
          </p>
          <p className="text-[11px] font-medium text-white/30">
            {new Date(shareRequest.createdAt).toLocaleString()}
          </p>
        </div>
        
        <div className="flex flex-col gap-3 flex-1 min-h-0">
          <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1 shrink-0">Itemized Breakdown</h3>
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl overflow-y-auto flex-1 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
            {shareRequest.transactions?.map((t, i) => (
              <div key={t._id} className="flex justify-between items-center p-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-white/90">{t.from?.name || "—"}</span>
                  <span className="text-[11px] text-white/40 flex items-center gap-1">
                    To <ArrowRight size={10} /> {t.to?.nickname || "—"}
                  </span>
                </div>
                <span className="text-[13px] font-bold text-emerald-400 tabular-nums">
                  ₹{Number(t.amount).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 flex justify-between items-center bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl mt-2">
          <span className="text-[13px] font-black text-indigo-400 uppercase tracking-wider">Total Amount</span>
          <span className="text-[18px] font-black text-white tabular-nums tracking-tight">
            ₹{totalAmount.toLocaleString("en-IN")}
          </span>
        </div>
        
        <div className="shrink-0 flex justify-end gap-3 mt-2">
          <button onClick={onClose} className="px-5 py-2 text-white/40 text-[13px] font-bold uppercase tracking-wider rounded-[10px] hover:bg-white/[0.05] transition-colors">
            Close
          </button>
          <button onClick={handleDownload} disabled={isDownloading} className="flex items-center gap-2 px-5 py-2 bg-indigo-500/10 text-indigo-400 text-[13px] font-bold uppercase tracking-wider rounded-[10px] hover:bg-indigo-500 hover:text-white border border-indigo-500/20 transition-all">
            {isDownloading ? "Generating..." : <><Download size={14} /> Download</>}
          </button>
        </div>
      </div>

      {/* Hidden layout for html2canvas to capture full height without scrollbars */}
      <div className="fixed left-[-9999px] top-[-9999px]">
        <div ref={hiddenRef} className="bg-[#111827] w-[450px] p-8 flex flex-col gap-6 text-white font-sans rounded-2xl border border-white/10">
          <div className="flex flex-col items-center gap-2 border-b border-white/[0.08] pb-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
              <Receipt size={28} />
            </div>
            <h2 className="text-[24px] font-black tracking-tight">Transaction Receipt</h2>
            <p className="text-[14px] font-medium text-white/50 uppercase tracking-wider">{directionText} {targetName}</p>
            <p className="text-[12px] font-medium text-white/30">{new Date(shareRequest.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Itemized Breakdown</h3>
            <div className="flex flex-col border border-white/[0.08] rounded-xl overflow-hidden">
              {shareRequest.transactions?.map((t, i) => (
                <div key={t._id} className="flex justify-between items-center p-4 border-b border-white/[0.08] last:border-0 bg-white/[0.02]">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-semibold text-white/90">{t.from?.name || "—"}</span>
                    <span className="text-[12px] text-white/40 flex items-center gap-1">
                      To <ArrowRight size={10} /> {t.to?.nickname || "—"}
                    </span>
                  </div>
                  <span className="text-[14px] font-bold text-emerald-400 tabular-nums">₹{Number(t.amount).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-xl mt-4">
            <span className="text-[14px] font-black text-indigo-400 uppercase tracking-wider">Total Amount</span>
            <span className="text-[20px] font-black text-white tabular-nums tracking-tight">₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="text-center text-[10px] text-white/20 uppercase tracking-widest mt-4">
            Generated by Finvra
          </div>
        </div>
      </div>
    </Modal>
  );
};

const TransactionsPage = () => {

  const { transactions, createTransaction, deleteTransaction, reverseTransaction, sendShareRequest, sharedWithMe, outgoingShares, revokeShare } =
    useTransactions();
  const { connections, getConnections } = useConnections();
  const { bankAccounts, updateBalance, getBankAcc } = useBankAccounts();
  const { theme } = useTheme();

  const [showModal,    setShowModal]   = useState(false);
  const [activeTab,    setActiveTab]   = useState("active");
  const [from,         setFrom]        = useState("");
  const [to,           setTo]          = useState("");
  const [amount,       setAmount]      = useState("");
  const [actionError,  setActionError] = useState("");
  const [searchQuery,  setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTxns, setSelectedTxns] = useState([]);
  const [isShareOpen,  setIsShareOpen]  = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const isLight = theme === "light";

  useEffect(() => { getConnections(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const targetBank = bankAccounts.find(b => b._id === to);
      const newBalance = (targetBank?.balance || 0) + Number(amount);

      await createTransaction({ from, to, amount });
      await updateBalance({ balance: newBalance }, to);
      await getBankAcc();
      setFrom(""); setTo(""); setAmount("");
      setShowModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReverse = async (t) => {
    if (isSubmitting) return;
    setActionError("");
    setIsSubmitting(true);
    try {
      const targetBank = bankAccounts.find(b => b._id === t.to?._id);
      if (!targetBank) { setActionError("Bank account not found"); return; }
      const newBalance = targetBank.balance - Number(t.amount);

      const result = await updateBalance({ balance: newBalance }, t.to?._id);
      if (!result.success) { setActionError(result.error); return; }
      await reverseTransaction(t._id);
      await getBankAcc();
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleToggleSelect = (id) => {
    setSelectedTxns(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const active   = transactions.filter((t) => !t.reversed);
  const reversed = transactions.filter((t) =>  t.reversed);
  
  const getFiltered = () => {
    if (activeTab === "shared") {
      return (sharedWithMe || []).filter(share => 
        share.fromUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        share.fromUser?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    const base = activeTab === "active" ? active : reversed;
    return base.filter(t => 
      t.from?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.to?.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  const filtered = getFiltered();

  return (
    <div className="bg-transparent min-h-full flex flex-col transition-colors duration-300">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="flex justify-between items-center px-6 md:px-10 py-8 border-b border-white/[0.04]">
        <div>
          <h1 className="text-[24px] font-black text-white tracking-tight">Transactions</h1>
          <p className="text-[13px] font-medium text-white/40 mt-1 uppercase tracking-wider">
             Ledger: {active.length} active · {reversed.length} archived
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "active" && selectedTxns.length > 0 && (
            <button
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[13px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-[12px] hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-300"
            >
              <Share2 size={16} /> Share ({selectedTxns.length})
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[13px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-[12px] hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* TABS & SEARCH */}
      {/* TABS & SEARCH */}
      <div className="px-6 md:px-10 py-6 flex flex-col md:flex-row gap-4">
         <div className="flex bg-white/[0.02] border border-white/[0.04] p-1 rounded-[14px]">
{[
              { key: "active",   label: "Active",   count: active.length },
              { key: "reversed", label: "Archive", count: reversed.length },
              { key: "shared",   label: "Shared",   count: (sharedWithMe || []).length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-6 py-2.5 text-[13px] font-bold uppercase tracking-wider transition-all rounded-[10px] ${
                  activeTab === key
                    ? "bg-white/[0.06] text-white shadow-sm"
                    : "text-white/40 hover:text-white/80 hover:bg-white/[0.02]"
                }`}
              >
                {label}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === key ? "bg-indigo-500 text-white" : "bg-white/[0.05] text-white/40"}`}>
                  {count}
                </span>
              </button>
            ))}
         </div>

         <div className="relative flex-1 group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search by entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full bg-white/[0.02] border border-white/[0.06] rounded-[14px] py-3 pl-11 pr-4 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all"
            />
         </div>
      </div>

      {/* ERROR BANNER */}
      {actionError && (
        <div className="mb-4 text-rose-500 text-xs bg-rose-500/5 border border-rose-500/10 px-4 py-2.5 rounded-lg flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError("")}>&times;</button>
        </div>
      )}

      {activeTab === "shared" && <OutgoingShares shares={outgoingShares} revokeShare={revokeShare} onViewReceipt={setSelectedReceipt} />}

      {/* ── DESKTOP TABLE ─────────────────────────────────────── */}

      {/* ── DESKTOP TABLE ─────────────────────────────────────── */}
      <div className="hidden md:block px-6 md:px-10 pb-10">
        <div className="bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] overflow-hidden shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
          <table className="w-full border-collapse min-w-[700px]">
             <thead>
                <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                   {activeTab === "shared" ? (
                     <>
                       <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40">From</th>
                       <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40">Date</th>
                       <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-white/40">Transactions</th>
                       <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-white/40">Total Amount</th>
                       <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-white/40 w-32">Actions</th>
                     </>
                   ) : (
                     <>
                       {activeTab === "active" ? (
                         <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40 w-12">
                           <Check size={14} className="opacity-40" />
                         </th>
                       ) : (
                         <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40 w-12">#</th>
                       )}
                       <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40">From</th>
                       <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40">To</th>
                       <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-white/40">Amount</th>
                       <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-white/40 w-32">Actions</th>
                     </>
                   )}
                 </tr>
             </thead>
             <tbody className="divide-y divide-white/[0.04]">
                {filtered.length === 0 ? (
                  <tr>
                     <td colSpan="5" className="py-24 text-center text-[13px] font-medium text-white/40">No records found.</td>
                  </tr>
                ) : (
                  filtered.map((item, i) => {
                    if (activeTab === "shared") {
                      const totalAmount = item.transactions?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;
                      return (
                        <tr key={item._id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                            <span className="text-[14px] font-semibold text-white/90">{item.fromUser?.name || "Unknown"}</span>
                            <div className="text-[11px] text-white/40">{item.fromUser?.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[13px] font-medium text-white/50">{new Date(item.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-[13px] font-bold text-white/60 bg-white/[0.02] border border-white/[0.04] px-3 py-1 rounded-full tabular-nums">
                               {item.transactions?.length || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right tabular-nums">
                             <span className="text-[14px] font-bold text-emerald-400">
                                ₹{totalAmount.toLocaleString("en-IN")}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => setSelectedReceipt(item)} className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-lg hover:bg-indigo-500 hover:text-white transition-colors">
                              View Receipt
                            </button>
                          </td>
                        </tr>
                      );
                    }
                    
                    // For active/reversed tabs:
                    const t = item;
                    return (
                      <tr key={t._id} className="hover:bg-white/[0.02] transition-colors group">
                        {activeTab === "active" ? (
                          <td className="px-6 py-4">
                            <button onClick={() => handleToggleSelect(t._id)} className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedTxns.includes(t._id) ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/20 hover:border-white/40 text-transparent"}`}>
                              <Check size={12} />
                            </button>
                          </td>
                        ) : (
                          <td className="px-6 py-4 text-[13px] font-medium text-white/30 tabular-nums">{i + 1}</td>
                        )}
                        <td className="px-6 py-4">
                           <span className="text-[14px] font-semibold text-white/90">{t.from?.name || "—"}</span>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-[13px] font-medium text-white/50">{t.to?.nickname || "—"}</span>
                        </td>
                        <td className="px-6 py-4 text-right tabular-nums">
                           <span className={`text-[14px] font-bold ${t.reversed ? "text-white/30 line-through" : "text-emerald-400"}`}>
                              ₹{Number(t.amount).toLocaleString("en-IN")}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {activeTab === "active" && (
                                <button onClick={() => { if(confirm("Reverse transaction?")) handleReverse(t); }} className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-white/40 hover:bg-amber-500/10 hover:text-amber-400 border border-transparent hover:border-amber-500/20 transition-all" title="Reverse"><RotateCcw size={14} /></button>
                              )}
                              <button onClick={async () => {
                                 if(!confirm("Delete transaction?")) return;
                                 const targetBank = bankAccounts.find(b => b._id === t.to?._id);
                                 if (!targetBank) { setActionError("Bank account not found"); return; }
                                 const newBalance = targetBank.balance - Number(t.amount);
                                 const result = await updateBalance({ balance: newBalance }, t.to?._id);
                                 if (!result.success) { setActionError(result.error); return; }
                                 await deleteTransaction(t._id);
                                 await getBankAcc();
                              }} className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-white/40 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all" title="Delete"><Trash2 size={14} /></button>
                           </div>
                        </td>
                      </tr>
                    );
                  })
                )}
             </tbody>
          </table>
        </div>
      </div>

      {/* ── MOBILE CARDS ──────────────────────────────────────── */}
      <div className="md:hidden flex flex-col gap-4 px-6 pb-10">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-[13px] font-medium text-white/40 bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">No records found.</div>
        ) : (
          filtered.map((item, i) => {
            if (activeTab === "shared") {
              const totalAmount = item.transactions?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;
              return (
                <div key={item._id} className="bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] p-5 flex flex-col gap-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-[14px] font-semibold text-white/90 truncate">{item.fromUser?.name || "Unknown"}</span>
                      <span className="text-[11px] font-medium text-white/40 truncate">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right tabular-nums">
                      <span className="text-[16px] font-bold text-emerald-400">
                         ₹{totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] mt-1">
                     <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">{item.transactions?.length || 0} Transactions</span>
                     <button onClick={() => setSelectedReceipt(item)} className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-lg hover:bg-indigo-500 hover:text-white transition-colors">
                        View Receipt
                     </button>
                  </div>
                </div>
              );
            }

            const t = item;
            return (
              <div key={t._id} className="bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] p-5 flex flex-col gap-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
                <div className="flex justify-between items-start gap-4">
                  {activeTab === "active" && (
                    <button onClick={() => handleToggleSelect(t._id)} className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${selectedTxns.includes(t._id) ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/20 hover:border-white/40 text-transparent"}`}>
                      <Check size={12} />
                    </button>
                  )}
                  <div className="flex flex-col gap-3 flex-1">
                     <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest w-8">From</span>
                        <span className="text-[14px] font-semibold text-white/90 truncate">{t.from?.name || "—"}</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest w-8">To</span>
                        <span className="text-[13px] font-medium text-white/50 truncate">{t.to?.nickname || "—"}</span>
                     </div>
                  </div>
                  <div className="text-right tabular-nums">
                    <span className={`text-[16px] font-bold ${t.reversed ? "text-white/30 line-through" : "text-emerald-400"}`}>
                       ₹{Number(t.amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.04] mt-1">
                   {activeTab === "active" && (
                     <button onClick={() => { if(confirm("Reverse transaction?")) handleReverse(t); }} className="text-white/40 hover:text-amber-400 transition-colors flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider px-3 py-2 rounded-[8px] hover:bg-amber-500/10"><RotateCcw size={14} /> Reverse</button>
                   )}
                   <button onClick={async () => {
                     if(!confirm("Delete transaction?")) return;
                     const targetBank = bankAccounts.find(b => b._id === t.to?._id);
                     if (!targetBank) { setActionError("Bank account not found"); return; }
                     const newBalance = targetBank.balance - Number(t.amount);
                     const result = await updateBalance({ balance: newBalance }, t.to?._id);
                     if (!result.success) { setActionError(result.error); return; }
                     await deleteTransaction(t._id);
                     await getBankAcc();
                   }} className="text-white/40 hover:text-rose-400 transition-colors flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider px-3 py-2 rounded-[8px] hover:bg-rose-500/10"><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── ADD MODAL ── */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Transaction">
        <form onSubmit={handleCreate} className="flex flex-col gap-4 p-1">
          <ModalField label="From (Connection)">
            <select value={from} onChange={(e) => setFrom(e.target.value)} className={modalSelectCls} required>
              <option value="">Choose Payer</option>
              {[...connections].sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </ModalField>
          <ModalField label="To (Bank Account)">
            <select value={to} onChange={(e) => setTo(e.target.value)} className={modalSelectCls} required>
              <option value="">Choose Receiver</option>
              {[...bankAccounts].sort((a, b) => a.nickname.localeCompare(b.nickname)).map((b) => (
                <option key={b._id} value={b._id}>{b.nickname}</option>
              ))}
            </select>
          </ModalField>
          <ModalField label="Amount (₹)">
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00" className={modalInputCls} required />
          </ModalField>
          <ModalFooter>
            <CancelBtn onClick={() => setShowModal(false)} disabled={isSubmitting} />
            <ConfirmBtn type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Finalize"}
            </ConfirmBtn>
          </ModalFooter>
        </form>
      </Modal>

      <ShareModal 
        open={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        isSubmitting={isSubmitting}
        error={actionError}
        onSubmit={async (email) => {
          setIsSubmitting(true);
          setActionError("");
          const res = await sendShareRequest({ recipientEmail: email, transactionIds: selectedTxns });
          setIsSubmitting(false);
          if (res.success) {
            setIsShareOpen(false);
            setSelectedTxns([]);
          } else {
            setActionError(res.message);
          }
        }}
      />
<ReceiptModal 
        open={!!selectedReceipt} 
        onClose={() => setSelectedReceipt(null)} 
        shareRequest={selectedReceipt} 
      />
    </div>
  );
};



export default TransactionsPage;
