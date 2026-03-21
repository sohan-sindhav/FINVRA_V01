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

  const isLight = theme === "light";

  useEffect(() => { getConnections(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await createTransaction({ from, to, amount });
    await updateBalance({ balance: Number(amount) }, to);
    await getBankAcc();
    setFrom(""); setTo(""); setAmount("");
    setShowModal(false);
  };

  const handleReverse = async (t) => {
    setActionError("");
    const result = await updateBalance({ balance: -Number(t.amount) }, t.to?._id);
    if (!result.success) { setActionError(result.error); return; }
    await reverseTransaction(t._id);
    await getBankAcc();
  };

  const active   = transactions.filter((t) => !t.reversed);
  const reversed = transactions.filter((t) =>  t.reversed);
  
  const filtered = (activeTab === "active" ? active : reversed).filter(t => 
    t.from?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.to?.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[var(--color-bg-page)] min-h-full flex flex-col transition-colors duration-300 p-4 md:p-8">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-base)]">Transactions</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 tracking-tight">
             Ledger: {active.length} active · {reversed.length} archived
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-indigo-600 transition-all shadow-sm"
        >
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* TABS & SEARCH */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
         <div className="flex bg-[var(--color-bg-card)] border border-[var(--color-border)] p-1 rounded-xl">
            {[
              { key: "active",   label: "Active",   count: active.length },
              { key: "reversed", label: "Archive", count: reversed.length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-6 py-2 text-xs font-medium transition-all rounded-lg ${
                  activeTab === key
                    ? "bg-[var(--color-bg-page)] text-indigo-500 shadow-sm"
                    : "text-[var(--color-text-faint)] hover:text-[var(--color-text-base)]"
                }`}
              >
                {label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === key ? "bg-indigo-500/10 text-indigo-500" : "bg-[var(--color-bg-page)] border border-[var(--color-border)] text-[var(--color-text-faint)]"}`}>
                  {count}
                </span>
              </button>
            ))}
         </div>

         <div className="relative flex-1 group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
            <input 
              type="text"
              placeholder="Search by entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-text-base)] rounded-xl focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-[var(--color-text-faint)]"
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
      <div className="hidden md:block bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden overflow-x-auto shadow-sm">
        <table className="w-full border-collapse min-w-[700px]">
           <thead>
              <tr className="border-b border-[var(--color-border)]">
                 <th className="px-6 py-4 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)] w-12">#</th>
                 <th className="px-6 py-4 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)]">From</th>
                 <th className="px-6 py-4 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)]">To</th>
                 <th className="px-6 py-4 text-right text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)]">Amount</th>
                 <th className="px-6 py-4 text-right text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)] w-32">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-[var(--color-border)]">
              {filtered.length === 0 ? (
                <tr>
                   <td colSpan="5" className="py-20 text-center text-xs text-[var(--color-text-faint)]">No transactions found.</td>
                </tr>
              ) : (
                filtered.map((t, i) => (
                  <tr key={t._id} className="hover:bg-[var(--color-bg-page)]/50 transition-colors group">
                    <td className="px-6 py-4 text-xs text-[var(--color-text-faint)]">{i + 1}</td>
                    <td className="px-6 py-4">
                       <span className="text-sm font-medium text-[var(--color-text-base)]">{t.from?.name || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-xs text-[var(--color-text-muted)]">{t.to?.nickname || "—"}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className={`text-sm font-semibold ${t.reversed ? "text-[var(--color-text-faint)] line-through" : "text-emerald-500"}`}>
                          ₹{Number(t.amount).toLocaleString("en-IN")}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {activeTab === "active" && (
                            <button onClick={() => { if(confirm("Reverse transaction?")) handleReverse(t); }} className="p-1.5 text-[var(--color-text-faint)] hover:text-amber-500 transition-colors" title="Reverse"><RotateCcw size={14} /></button>
                          )}
                          <button onClick={async () => {
                             if(!confirm("Delete transaction?")) return;
                             const result = await updateBalance({ balance: -Number(t.amount) }, t.to?._id);
                             if (!result.success) { setActionError(result.error); return; }
                             await deleteTransaction(t._id);
                             await getBankAcc();
                          }} className="p-1.5 text-[var(--color-text-faint)] hover:text-rose-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
           </tbody>
        </table>
      </div>

      {/* ── MOBILE CARDS ──────────────────────────────────────── */}
      <div className="md:hidden flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-xs text-[var(--color-text-faint)] bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">No transactions found.</div>
        ) : (
          filtered.map((t, i) => (
            <div key={t._id} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-2 flex-1">
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[var(--color-text-faint)] uppercase tracking-wider w-8">From</span>
                      <span className="text-sm font-medium text-[var(--color-text-base)] truncate">{t.from?.name || "—"}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[var(--color-text-faint)] uppercase tracking-wider w-8">To</span>
                      <span className="text-xs text-[var(--color-text-muted)] truncate">{t.to?.nickname || "—"}</span>
                   </div>
                </div>
                <div className="text-right">
                  <span className={`text-base font-semibold ${t.reversed ? "text-[var(--color-text-faint)] line-through" : "text-emerald-500"}`}>
                     ₹{Number(t.amount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-5 pt-4 border-t border-[var(--color-border)] mt-1">
                 {activeTab === "active" && (
                   <button onClick={() => { if(confirm("Reverse transaction?")) handleReverse(t); }} className="text-[var(--color-text-faint)] hover:text-amber-500 transition-colors flex items-center gap-1.5 text-xs font-semibold"><RotateCcw size={14} /> Reverse</button>
                 )}
                 <button onClick={async () => {
                   if(!confirm("Delete transaction?")) return;
                   const result = await updateBalance({ balance: -Number(t.amount) }, t.to?._id);
                   if (!result.success) { setActionError(result.error); return; }
                   await deleteTransaction(t._id);
                   await getBankAcc();
                 }} className="text-[var(--color-text-faint)] hover:text-rose-500 transition-colors flex items-center gap-1.5 text-xs font-semibold"><Trash2 size={14} /> Delete</button>
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
            <CancelBtn onClick={() => setShowModal(false)} />
            <ConfirmBtn type="submit">Finalize</ConfirmBtn>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default TransactionsPage;
