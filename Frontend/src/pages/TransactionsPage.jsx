import React, { useEffect, useState } from "react";
import { Plus, RotateCcw, ArrowRight, Trash2, Search } from "lucide-react";
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

const TransactionsPage = () => {
  const { transactions, createTransaction, deleteTransaction, reverseTransaction } =
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

  const isLight = theme === "light";

  useEffect(() => { getConnections(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createTransaction({ from, to, amount });
      await updateBalance({ balance: Number(amount) }, to);
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
      const result = await updateBalance({ balance: -Number(t.amount) }, t.to?._id);
      if (!result.success) { setActionError(result.error); return; }
      await reverseTransaction(t._id);
      await getBankAcc();
    } finally {
      setIsSubmitting(false);
    }
  };

  const active   = transactions.filter((t) => !t.reversed);
  const reversed = transactions.filter((t) =>  t.reversed);
  
  const filtered = (activeTab === "active" ? active : reversed).filter(t => 
    t.from?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.to?.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[13px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-[12px] hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* TABS & SEARCH */}
      {/* TABS & SEARCH */}
      <div className="px-6 md:px-10 py-6 flex flex-col md:flex-row gap-4">
         <div className="flex bg-white/[0.02] border border-white/[0.04] p-1 rounded-[14px]">
            {[
              { key: "active",   label: "Active",   count: active.length },
              { key: "reversed", label: "Archive", count: reversed.length },
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

      {/* ── DESKTOP TABLE ─────────────────────────────────────── */}
      {/* ── DESKTOP TABLE ─────────────────────────────────────── */}
      <div className="hidden md:block px-6 md:px-10 pb-10">
        <div className="bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] overflow-hidden shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
          <table className="w-full border-collapse min-w-[700px]">
             <thead>
                <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                   <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40 w-12">#</th>
                   <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40">From</th>
                   <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40">To</th>
                   <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-white/40">Amount</th>
                   <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-white/40 w-32">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-white/[0.04]">
                {filtered.length === 0 ? (
                  <tr>
                     <td colSpan="5" className="py-24 text-center text-[13px] font-medium text-white/40">No transactions found.</td>
                  </tr>
                ) : (
                  filtered.map((t, i) => (
                    <tr key={t._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 text-[13px] font-medium text-white/30 tabular-nums">{i + 1}</td>
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
                               const result = await updateBalance({ balance: -Number(t.amount) }, t.to?._id);
                               if (!result.success) { setActionError(result.error); return; }
                               await deleteTransaction(t._id);
                               await getBankAcc();
                            }} className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-white/40 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all" title="Delete"><Trash2 size={14} /></button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
             </tbody>
          </table>
        </div>
      </div>

      {/* ── MOBILE CARDS ──────────────────────────────────────── */}
      <div className="md:hidden flex flex-col gap-4 px-6 pb-10">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-[13px] font-medium text-white/40 bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">No transactions found.</div>
        ) : (
          filtered.map((t, i) => (
            <div key={t._id} className="bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] p-5 flex flex-col gap-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
              <div className="flex justify-between items-start gap-4">
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
                   const result = await updateBalance({ balance: -Number(t.amount) }, t.to?._id);
                   if (!result.success) { setActionError(result.error); return; }
                   await deleteTransaction(t._id);
                   await getBankAcc();
                 }} className="text-white/40 hover:text-rose-400 transition-colors flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider px-3 py-2 rounded-[8px] hover:bg-rose-500/10"><Trash2 size={14} /> Delete</button>
              </div>
            </div>
          ))
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
    </div>
  );
};

export default TransactionsPage;
