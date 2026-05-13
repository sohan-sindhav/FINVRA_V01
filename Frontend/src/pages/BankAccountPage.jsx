import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Landmark, Trash2, RefreshCw, Send,
  RotateCcw, History, GitBranch, Search
} from "lucide-react";
import { BankAccContext } from "../context/BankAccContext";
import Modal, {
  ModalField, ModalFooter, CancelBtn, ConfirmBtn,
  modalInputCls, modalSelectCls,
} from "../components/Modal.jsx";
import { useTheme } from "../theme/ThemeContext";
import MinBalanceWarningBanner from "../components/MinBalanceWarningBanner.jsx";

const BANK_LIST = [
  "Axis Bank","HDFC Bank","ICICI Bank","State Bank of India","Bank of Baroda",
  "Kotak Mahindra Bank","Punjab National Bank","Canara Bank","Union Bank of India",
  "Bank of India","Indian Bank","Central Bank of India","Indian Overseas Bank",
  "UCO Bank","Bank of Maharashtra","Punjab & Sind Bank","IndusInd Bank","Yes Bank",
  "IDFC First Bank","Federal Bank","South Indian Bank","RBL Bank","City Union Bank",
  "Karur Vysya Bank","Tamilnad Mercantile Bank","DCB Bank","CSB Bank",
  "Jammu & Kashmir Bank","Karnataka Bank","Bandhan Bank","IDBI Bank",
  "AU Small Finance Bank","Equitas Small Finance Bank","Ujjivan Small Finance Bank",
  "Jana Small Finance Bank","Suryoday Small Finance Bank","Utkarsh Small Finance Bank",
  "ESAF Small Finance Bank","Capital Small Finance Bank","Unity Small Finance Bank",
  "Airtel Payments Bank","India Post Payments Bank","Paytm Payments Bank",
  "Fino Payments Bank","Jio Payments Bank",
];

const BankAccountPage = () => {
  const navigate = useNavigate();
  const { bankAccounts, loading, createBankAcc, deleteBankAcc, getBankAcc, updateBalance, sendMoney } =
    useContext(BankAccContext);
  const { theme } = useTheme();

  const [showModal,     setShowModal]     = useState(false);
  const [nickname,      setNickname]      = useState("");
  const [bank,          setBank]          = useState("");
  const [accnumber,     setAccnumber]     = useState("");
  const [balance,       setBalance]       = useState(0);
  // New: zero-balance account toggle & minimum balance
  const [isZeroBalance,   setIsZeroBalance]   = useState(true);
  const [minimumBalance,  setMinimumBalance]  = useState("");

  const [selectedAcc,   setSelectedAcc]   = useState(null);
  const [newBalance,    setNewBalance]     = useState("");
  const [balanceError,  setBalanceError]  = useState("");
  const [balanceWarning, setBalanceWarning] = useState("");
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendFromAcc,   setSendFromAcc]   = useState(null);
  const [sendToId,      setSendToId]      = useState("");
  const [sendAmount,    setSendAmount]    = useState("");
  const [sendError,     setSendError]     = useState("");
  const [sendWarning,   setSendWarning]   = useState(""); // min-balance warning text
  const [searchQuery,   setSearchQuery]   = useState("");
  const [isSubmitting,  setIsSubmitting]  = useState(false);

  const isLight = theme === "light";

  useEffect(() => { getBankAcc(); }, []);

  const resetCreateForm = () => {
    setNickname(""); setBank(""); setAccnumber(""); setBalance(0);
    setIsZeroBalance(true); setMinimumBalance("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createBankAcc({
        nickname,
        bank,
        accnumber,
        balance,
        isZeroBalance,
        minimumBalance: isZeroBalance ? 0 : Number(minimumBalance) || 0,
      });
      resetCreateForm();
      setShowModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBalance = async (e, forceUpdate = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;
    setBalanceError("");
    setBalanceWarning("");
    setIsSubmitting(true);
    try {
      const result = await updateBalance({ balance: Number(newBalance), force: forceUpdate }, selectedAcc._id);
      if (result.warning) {
        setBalanceWarning(result.warningMessage);
        return;
      }
      if (!result.success) { setBalanceError(result.error); return; }
      await getBankAcc();
      setNewBalance(""); setSelectedAcc(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetBalance = async () => {
    setBalanceError("");
    const result = await updateBalance({ balance: 0, force: true }, selectedAcc._id);
    if (!result.success) { setBalanceError(result.error); return; }
    await getBankAcc();
    setNewBalance(""); setSelectedAcc(null);
  };

  const handleSendMoney = async (e, forceTransfer = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;
    setSendError("");
    setSendWarning("");
    setIsSubmitting(true);
    try {
      const result = await sendMoney(sendFromAcc._id, { toId: sendToId, amount: Number(sendAmount), force: forceTransfer });
      if (result.warning) {
        // Show warning in modal — user can then click "Transfer Anyway"
        setSendWarning(result.warningMessage);
        return;
      }
      if (!result.success) { setSendError(result.error); return; }
      await getBankAcc();
      setSendToId(""); setSendAmount(""); setSendWarning("");
      setShowSendModal(false); setSendFromAcc(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAccounts = bankAccounts.filter(acc => 
    acc.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.bank.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBalance = bankAccounts.reduce((s, a) => s + (a.balance || 0), 0);
  const sortedAccounts = [...filteredAccounts].sort((a, b) => a.nickname.localeCompare(b.nickname));

  return (
    <div className="bg-transparent min-h-full flex flex-col transition-colors duration-300">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="flex justify-between items-center px-6 md:px-10 py-8 border-b border-white/[0.04]">
        <div>
          <h1 className="text-[24px] font-black text-white tracking-tight">Bank Accounts</h1>
          <p className="text-[13px] font-medium text-white/40 mt-1 uppercase tracking-wider">
             Available Balance: ₹{totalBalance.toLocaleString("en-IN")}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/bank-history")} className="w-[40px] h-[40px] flex items-center justify-center rounded-[12px] bg-white/[0.02] border border-white/[0.04] text-white/40 hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/20 transition-all duration-300 shadow-sm" title="History"><History size={18} /></button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[13px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-[12px] hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] h-[40px]"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* ── MIN BALANCE WARNING ─────────────────────────────── */}
      <MinBalanceWarningBanner />

      {/* ── SEARCH ─────────────────────────────────────────────── */}
      <div className="px-6 md:px-10 py-6 relative">
        <Search size={16} className="absolute left-10 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        <input 
          type="text"
          placeholder="Search accounts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/[0.02] border border-white/[0.06] rounded-[14px] py-3 pl-12 pr-4 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all"
        />
      </div>

      {/* ── DESKTOP TABLE ─────────────────────────────────────── */}
      <div className="hidden md:block px-6 md:px-10 pb-10">
        <div className="bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] overflow-hidden shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
          <table className="w-full border-collapse min-w-[700px]">
             <thead>
                <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                   <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40 w-12">#</th>
                   <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40">Account</th>
                   <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40">Bank</th>
                   <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-white/40">Min. Balance</th>
                   <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-white/40">Balance</th>
                   <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-white/40 w-40">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-white/[0.04]">
                {loading && sortedAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-24 text-center text-[13px] font-medium text-white/40">Loading records...</td>
                  </tr>
                ) : sortedAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-24 text-center text-[13px] font-medium text-white/40">No accounts found.</td>
                  </tr>
                ) : (
                  sortedAccounts.map((acc, i) => (
                    <tr key={acc._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 text-[13px] font-medium text-white/30 tabular-nums">{i + 1}</td>
                      <td className="px-6 py-4">
                         <span className="text-[14px] font-semibold text-white/90">{acc.nickname}</span>
                         {acc.accnumber && <span className="block text-[11px] font-bold text-white/20 font-mono mt-0.5 uppercase tracking-widest">****{String(acc.accnumber).slice(-4)}</span>}
                         {acc.isZeroBalance
                           ? <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-[6px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Zero Balance</span>
                           : <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-[6px] bg-amber-500/10 text-amber-400 border border-amber-500/20">Min. Balance</span>
                         }
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-white/50">{acc.bank}</td>
                      <td className="px-6 py-4 text-right">
                         <span className="text-[13px] font-medium text-white/30">
                           {acc.isZeroBalance ? "—" : `₹${Number(acc.minimumBalance || 0).toLocaleString("en-IN")}`}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums">
                         {(() => {
                           const isBelowMin = !acc.isZeroBalance && acc.minimumBalance > 0 && acc.balance < acc.minimumBalance;
                           return (
                             <span className={`text-[14px] font-bold ${
                               isBelowMin ? "text-amber-400" : "text-emerald-400"
                             }`}>
                               ₹{Number(acc.balance || 0).toLocaleString("en-IN")}
                               {isBelowMin && <span className="ml-1 text-[10px]">⚠</span>}
                             </span>
                           );
                         })()}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setSelectedAcc(acc)} className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-white/40 hover:bg-indigo-500/10 hover:text-indigo-400 border border-transparent hover:border-indigo-500/20 transition-all" title="Adjust"><RefreshCw size={14} /></button>
                            <button onClick={() => { setSendFromAcc(acc); setShowSendModal(true); }} className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-white/40 hover:bg-emerald-500/10 hover:text-emerald-400 border border-transparent hover:border-emerald-500/20 transition-all" title="Transfer"><Send size={14} /></button>
                            <button onClick={() => { if(confirm("Delete account?")) deleteBankAcc(acc._id); }} className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-white/40 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all" title="Delete"><Trash2 size={14} /></button>
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
        {loading && sortedAccounts.length === 0 ? (
          <div className="py-20 text-center text-[13px] font-medium text-white/40 bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">Loading records...</div>
        ) : sortedAccounts.length === 0 ? (
          <div className="py-20 text-center text-[13px] font-medium text-white/40 bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">No accounts found.</div>
        ) : (
          sortedAccounts.map((acc, i) => (
            <div key={acc._id} className="bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] p-5 flex flex-col gap-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold text-white/90">{acc.nickname}</span>
                  <span className="text-[13px] font-medium text-white/50 mt-1">{acc.bank}</span>
                  {acc.accnumber && <span className="text-[11px] font-bold text-white/20 font-mono mt-1 uppercase tracking-widest">****{String(acc.accnumber).slice(-4)}</span>}
                  {acc.isZeroBalance
                    ? <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-[6px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">Zero Balance</span>
                    : <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-[6px] bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit">Min: ₹{Number(acc.minimumBalance || 0).toLocaleString("en-IN")}</span>
                  }
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Balance</span>
                  {(() => {
                    const isBelowMin = !acc.isZeroBalance && acc.minimumBalance > 0 && acc.balance < acc.minimumBalance;
                    return (
                      <span className={`text-[16px] font-bold tabular-nums ${
                        isBelowMin ? "text-amber-400" : "text-emerald-400"
                      }`}>
                        ₹{Number(acc.balance || 0).toLocaleString("en-IN")}
                        {isBelowMin && <span className="ml-1 text-[10px]">⚠</span>}
                      </span>
                    );
                  })()}
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.04] mt-1">
                <button onClick={() => setSelectedAcc(acc)} className="text-white/40 hover:text-indigo-400 transition-colors flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider px-3 py-2 rounded-[8px] hover:bg-indigo-500/10"><RefreshCw size={14} /> Adjust</button>
                <button onClick={() => { setSendFromAcc(acc); setShowSendModal(true); }} className="text-white/40 hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider px-3 py-2 rounded-[8px] hover:bg-emerald-500/10"><Send size={14} /> Transfer</button>
                <button onClick={() => { if(confirm("Delete account?")) deleteBankAcc(acc._id); }} className="text-white/40 hover:text-rose-400 transition-colors flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider px-3 py-2 rounded-[8px] hover:bg-rose-500/10"><Trash2 size={14} /> Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── MODALS ── */}
      <Modal open={!!selectedAcc} onClose={() => { setSelectedAcc(null); setBalanceError(""); setBalanceWarning(""); }} title="Update Balance">
        {selectedAcc && (
          <form onSubmit={handleUpdateBalance} className="flex flex-col gap-4 p-1">
            <ModalField label="New Balance (₹)">
              <input type="number" value={newBalance} onChange={(e) => { setNewBalance(e.target.value); setBalanceError(""); }}
                placeholder={`Current: ₹${Number(selectedAcc.balance || 0).toLocaleString("en-IN")}`} className={modalInputCls} required min={0} />
            </ModalField>
            {selectedAcc.minimumBalance > 0 && !selectedAcc.isZeroBalance && (
              <p className="text-[11px] text-amber-500 -mt-2">
                ⚠ Minimum balance: ₹{Number(selectedAcc.minimumBalance).toLocaleString("en-IN")}
              </p>
            )}
            {balanceError && <p className="text-xs text-rose-500 mt-1">{balanceError}</p>}
            
            {balanceWarning && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex flex-col gap-2">
                <p className="text-xs text-amber-400 leading-relaxed">⚠ {balanceWarning}</p>
                <div className="flex gap-2 justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => setBalanceWarning("")}
                    className="text-[11px] px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleUpdateBalance(null, true)}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Updating..." : "Update Anyway"}
                  </button>
                </div>
              </div>
            )}

            {!balanceWarning && (
              <ModalFooter>
                <CancelBtn onClick={() => { setSelectedAcc(null); setBalanceError(""); setBalanceWarning(""); }} disabled={isSubmitting} />
                <ConfirmBtn type="submit" disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Update"}</ConfirmBtn>
              </ModalFooter>
            )}
          </form>
        )}
      </Modal>

      {/* ── CREATE ACCOUNT MODAL ── */}
      <Modal open={showModal} onClose={() => { setShowModal(false); resetCreateForm(); }} title="New Account">
        <form onSubmit={handleCreate} className="flex flex-col gap-4 p-1">
          <ModalField label="Nickname">
            <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Personal" className={modalInputCls} required />
          </ModalField>
          <ModalField label="Bank Name">
            <select value={bank} onChange={(e) => setBank(e.target.value)} className={modalSelectCls} required>
              <option value="">Select Bank</option>
              {BANK_LIST.map((b, i) => <option key={i} value={b}>{b}</option>)}
            </select>
          </ModalField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <ModalField label="Acc Number (Last 4)">
               <input type="text" value={accnumber} onChange={(e) => setAccnumber(e.target.value)}
                 className={modalInputCls} maxLength={4} />
             </ModalField>
             <ModalField label="Initial Balance (₹)">
               <input type="number" value={balance} onChange={(e) => setBalance(e.target.value)}
                 className={modalInputCls} min={0} />
             </ModalField>
          </div>

          {/* ── Zero Balance Toggle ── */}
          <div className="flex items-center justify-between bg-[var(--color-bg-page)] border border-[var(--color-border)] rounded-xl px-4 py-3">
            <div>
              <p className="text-xs font-medium text-[var(--color-text-base)]">Zero Balance Account</p>
              <p className="text-[10px] text-[var(--color-text-faint)] mt-0.5">
                {isZeroBalance ? "No minimum balance required" : "Requires a minimum balance"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setIsZeroBalance(!isZeroBalance); setMinimumBalance(""); }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                isZeroBalance ? "bg-emerald-500" : "bg-[var(--color-border)]"
              }`}
              role="switch"
              aria-checked={isZeroBalance}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  isZeroBalance ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Minimum Balance field — shown only when NOT a zero-balance account */}
          {!isZeroBalance && (
            <ModalField label="Minimum Balance (₹)">
              <input
                type="number"
                value={minimumBalance}
                onChange={(e) => setMinimumBalance(e.target.value)}
                placeholder="e.g. 5000"
                className={modalInputCls}
                min={0}
                required
              />
            </ModalField>
          )}

          <ModalFooter>
            <CancelBtn onClick={() => { setShowModal(false); resetCreateForm(); }} disabled={isSubmitting} />
            <ConfirmBtn type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create"}</ConfirmBtn>
          </ModalFooter>
        </form>
      </Modal>

      <Modal open={showSendModal && !!sendFromAcc} onClose={() => { setShowSendModal(false); setSendError(""); setSendWarning(""); }} title="Transfer Money">
        {sendFromAcc && (
          <form onSubmit={handleSendMoney} className="flex flex-col gap-4 p-1">
            <ModalField label="To Account">
              <select value={sendToId} onChange={(e) => setSendToId(e.target.value)} className={modalSelectCls} required>
                <option value="">Select Destination</option>
                {bankAccounts.filter((a) => a._id !== sendFromAcc._id).map((a) => (
                  <option key={a._id} value={a._id}>{a.nickname} (₹{Number(a.balance || 0).toLocaleString("en-IN")})</option>
                ))}
              </select>
            </ModalField>
            <ModalField label="Amount">
              <input type="number" value={sendAmount} onChange={(e) => { setSendAmount(e.target.value); setSendError(""); setSendWarning(""); }}
                placeholder="0.00" className={modalInputCls} required />
            </ModalField>
            {sendFromAcc.minimumBalance > 0 && !sendFromAcc.isZeroBalance && !sendWarning && (
              <p className="text-[11px] text-amber-500 -mt-2">
                ⚠ Min balance of ₹{Number(sendFromAcc.minimumBalance).toLocaleString("en-IN")} must remain in &quot;{sendFromAcc.nickname}&quot;
              </p>
            )}
            {sendError && <p className="text-xs text-rose-500 mt-1">{sendError}</p>}

            {/* Minimum balance warning — shown after first attempt */}
            {sendWarning && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex flex-col gap-2">
                <p className="text-xs text-amber-400 leading-relaxed">⚠ {sendWarning}</p>
                <div className="flex gap-2 justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => setSendWarning("")}
                    className="text-[11px] px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSendMoney(null, true)}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Transferring..." : "Transfer Anyway"}
                  </button>
                </div>
              </div>
            )}

            {!sendWarning && (
              <ModalFooter>
                <CancelBtn onClick={() => { setShowSendModal(false); setSendError(""); setSendWarning(""); }} disabled={isSubmitting} />
                <ConfirmBtn type="submit" disabled={isSubmitting}>{isSubmitting ? "Transferring..." : "Transfer"}</ConfirmBtn>
              </ModalFooter>
            )}
          </form>
        )}
      </Modal>
    </div>
  );
};

export default BankAccountPage;
