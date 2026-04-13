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
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendFromAcc,   setSendFromAcc]   = useState(null);
  const [sendToId,      setSendToId]      = useState("");
  const [sendAmount,    setSendAmount]    = useState("");
  const [sendError,     setSendError]     = useState("");
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

  const handleUpdateBalance = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setBalanceError("");
    setIsSubmitting(true);
    try {
      const result = await updateBalance({ balance: Number(newBalance) }, selectedAcc._id);
      if (!result.success) { setBalanceError(result.error); return; }
      await getBankAcc();
      setNewBalance(""); setSelectedAcc(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetBalance = async () => {
    setBalanceError("");
    const result = await updateBalance({ balance: -selectedAcc.balance }, selectedAcc._id);
    if (!result.success) { setBalanceError(result.error); return; }
    await getBankAcc();
    setNewBalance(""); setSelectedAcc(null);
  };

  const handleSendMoney = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSendError("");
    setIsSubmitting(true);
    try {
      const result = await sendMoney(sendFromAcc._id, { toId: sendToId, amount: Number(sendAmount) });
      if (!result.success) { setSendError(result.error); return; }
      await getBankAcc();
      setSendToId(""); setSendAmount("");
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
    <div className="bg-[var(--color-bg-page)] min-h-full flex flex-col transition-colors duration-300 p-4 md:p-8">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-base)]">Bank Accounts</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 tracking-tight">
             Available Balance: ₹{totalBalance.toLocaleString("en-IN")}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/bank-history")} className="p-2 text-[var(--color-text-muted)] hover:text-indigo-500 transition-colors" title="History"><History size={18} /></button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-indigo-600 transition-all shadow-sm"
          >
            <Plus size={16} /> Add Account
          </button>
        </div>
      </div>

      {/* ── MIN BALANCE WARNING ─────────────────────────────── */}
      <MinBalanceWarningBanner />

      {/* ── SEARCH ─────────────────────────────────────────────── */}
      <div className="relative mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
        <input 
          type="text"
          placeholder="Search accounts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-text-base)] rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all placeholder:text-[var(--color-text-faint)]"
        />
      </div>

      {/* ── DESKTOP TABLE ─────────────────────────────────────── */}
      <div className="hidden md:block bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden overflow-x-auto shadow-sm">
        <table className="w-full border-collapse min-w-[700px]">
           <thead>
              <tr className="border-b border-[var(--color-border)]">
                 <th className="px-6 py-4 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)] w-12">#</th>
                 <th className="px-6 py-4 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)]">Account</th>
                 <th className="px-6 py-4 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)]">Bank</th>
                 <th className="px-6 py-4 text-right text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)]">Min. Balance</th>
                 <th className="px-6 py-4 text-right text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)]">Balance</th>
                 <th className="px-6 py-4 text-right text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)] w-32">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-[var(--color-border)]">
              {loading && sortedAccounts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-xs text-[var(--color-text-faint)]">Loading records...</td>
                </tr>
              ) : sortedAccounts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-xs text-[var(--color-text-faint)]">No accounts found.</td>
                </tr>
              ) : (
                sortedAccounts.map((acc, i) => (
                  <tr key={acc._id} className="hover:bg-[var(--color-bg-page)]/50 transition-colors group">
                    <td className="px-6 py-4 text-xs text-[var(--color-text-faint)]">{i + 1}</td>
                    <td className="px-6 py-4">
                       <span className="text-sm font-medium text-[var(--color-text-base)]">{acc.nickname}</span>
                       {acc.accnumber && <span className="block text-[10px] text-[var(--color-text-faint)] font-mono mt-0.5 opacity-60">****{String(acc.accnumber).slice(-4)}</span>}
                       {acc.isZeroBalance
                         ? <span className="inline-block mt-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">Zero Balance</span>
                         : <span className="inline-block mt-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500">Min. Balance</span>
                       }
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--color-text-muted)]">{acc.bank}</td>
                    <td className="px-6 py-4 text-right">
                       <span className="text-xs text-[var(--color-text-faint)]">
                         {acc.isZeroBalance ? "—" : `₹${Number(acc.minimumBalance || 0).toLocaleString("en-IN")}`}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="text-sm font-semibold text-emerald-500">₹{Number(acc.balance || 0).toLocaleString("en-IN")}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setSelectedAcc(acc)} className="p-1.5 text-[var(--color-text-faint)] hover:text-indigo-500 transition-colors" title="Adjust"><RefreshCw size={14} /></button>
                          <button onClick={() => { setSendFromAcc(acc); setShowSendModal(true); }} className="p-1.5 text-[var(--color-text-faint)] hover:text-emerald-500 transition-colors" title="Transfer"><Send size={14} /></button>
                          <button onClick={() => { if(confirm("Delete account?")) deleteBankAcc(acc._id); }} className="p-1.5 text-[var(--color-text-faint)] hover:text-rose-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
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
        {loading && sortedAccounts.length === 0 ? (
          <div className="py-20 text-center text-xs text-[var(--color-text-faint)] bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">Loading records...</div>
        ) : sortedAccounts.length === 0 ? (
          <div className="py-20 text-center text-xs text-[var(--color-text-faint)] bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">No accounts found.</div>
        ) : (
          sortedAccounts.map((acc, i) => (
            <div key={acc._id} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[var(--color-text-base)]">{acc.nickname}</span>
                  <span className="text-xs text-[var(--color-text-muted)] mt-1">{acc.bank}</span>
                  {acc.accnumber && <span className="text-[10px] text-[var(--color-text-faint)] font-mono mt-1">****{String(acc.accnumber).slice(-4)}</span>}
                  {acc.isZeroBalance
                    ? <span className="inline-block mt-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 w-fit">Zero Balance</span>
                    : <span className="inline-block mt-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 w-fit">Min: ₹{Number(acc.minimumBalance || 0).toLocaleString("en-IN")}</span>
                  }
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-[10px] items-center text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Balance</span>
                  <span className="text-base font-semibold text-emerald-500">₹{Number(acc.balance || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-[var(--color-border)] mt-1">
                <button onClick={() => setSelectedAcc(acc)} className="text-[var(--color-text-faint)] hover:text-indigo-500 transition-colors flex items-center gap-1.5 text-xs font-semibold"><RefreshCw size={14} /> Adjust</button>
                <button onClick={() => { setSendFromAcc(acc); setShowSendModal(true); }} className="text-[var(--color-text-faint)] hover:text-emerald-500 transition-colors flex items-center gap-1.5 text-xs font-semibold"><Send size={14} /> Transfer</button>
                <button onClick={() => { if(confirm("Delete account?")) deleteBankAcc(acc._id); }} className="text-[var(--color-text-faint)] hover:text-rose-500 transition-colors flex items-center gap-1.5 text-xs font-semibold"><Trash2 size={14} /> Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── MODALS ── */}
      <Modal open={!!selectedAcc} onClose={() => { setSelectedAcc(null); setBalanceError(""); }} title="Update Balance">
        {selectedAcc && (
          <form onSubmit={handleUpdateBalance} className="flex flex-col gap-4 p-1">
            <ModalField label="New Balance Adjust (₹)">
              <input type="number" value={newBalance} onChange={(e) => { setNewBalance(e.target.value); setBalanceError(""); }}
                placeholder="e.g. 1000 or -500" className={modalInputCls} required />
            </ModalField>
            {selectedAcc.minimumBalance > 0 && !selectedAcc.isZeroBalance && (
              <p className="text-[11px] text-amber-500 -mt-2">
                ⚠ Minimum balance: ₹{Number(selectedAcc.minimumBalance).toLocaleString("en-IN")}
              </p>
            )}
            {balanceError && <p className="text-xs text-rose-500 mt-1">{balanceError}</p>}
            <ModalFooter>
              <CancelBtn onClick={() => { setSelectedAcc(null); setBalanceError(""); }} disabled={isSubmitting} />
              <ConfirmBtn type="submit" disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Update"}</ConfirmBtn>
            </ModalFooter>
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

      <Modal open={showSendModal && !!sendFromAcc} onClose={() => { setShowSendModal(false); setSendError(""); }} title="Transfer Money">
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
              <input type="number" value={sendAmount} onChange={(e) => { setSendAmount(e.target.value); setSendError(""); }}
                placeholder="0.00" className={modalInputCls} required />
            </ModalField>
            {sendFromAcc.minimumBalance > 0 && !sendFromAcc.isZeroBalance && (
              <p className="text-[11px] text-amber-500 -mt-2">
                ⚠ Min balance of ₹{Number(sendFromAcc.minimumBalance).toLocaleString("en-IN")} must remain in "{sendFromAcc.nickname}"
              </p>
            )}
            {sendError && <p className="text-xs text-rose-500 mt-1">{sendError}</p>}
            <ModalFooter>
              <CancelBtn onClick={() => { setShowSendModal(false); setSendError(""); }} disabled={isSubmitting} />
              <ConfirmBtn type="submit" disabled={isSubmitting}>{isSubmitting ? "Transferring..." : "Transfer"}</ConfirmBtn>
            </ModalFooter>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default BankAccountPage;
