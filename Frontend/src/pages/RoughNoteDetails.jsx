import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  SendHorizontal, 
  HandCoins, 
  History, 
  FileText, 
  Plus, 
  Trash2,
  CheckCircle2,
  AlertCircle,
  StickyNote,
  Check,
  Download,
  Zap,
  Calendar
} from "lucide-react";
import { useRoughNote } from "../context/RoughNoteContext";
import Modal, { ModalField, ModalFooter, CancelBtn, ConfirmBtn, modalInputCls } from "../components/Modal";

const CATEGORIES = ["Lunch", "Travel", "Lend", "Movie", "Shopping", "Gifts", "Other"];

const RoughNoteDetails = () => {
  const { personId } = useParams();
  const navigate = useNavigate();
  const { persons, getHistory, addEntry, deleteEntry, updatePersonNotes } = useRoughNote();
  
  const [person, setPerson] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [entryType, setEntryType] = useState("send");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [entryNotes, setEntryNotes] = useState("");
  const [category, setCategory] = useState("Other");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [personNotes, setPersonNotes] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");

  const fetchData = async () => {
    setLoading(true);
    const h = await getHistory(personId);
    setHistory(h || []);
    setLoading(false);
  };

  useEffect(() => {
    const p = persons.find(x => x._id === personId);
    if (p) {
      setPerson(p);
      setPersonNotes(p.notes || "");
    }
    fetchData();
  }, [personId, persons]);

  const handleSaveNotes = async () => {
    setSaveStatus("saving");
    const res = await updatePersonNotes(personId, personNotes);
    if (res.success) {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } else {
      setSaveStatus("idle");
    }
  };

  const handleAdd = async (e) => {
    if (e) e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setIsSubmitting(true);
    const res = await addEntry({
      personId,
      type: entryType,
      amount: Number(amount),
      description: desc,
      notes: entryNotes,
      category,
      date
    });
    if (res.success) {
      setAmount("");
      setDesc("");
      setEntryNotes("");
      setCategory("Other");
      setShowAdd(false);
      fetchData();
    }
    setIsSubmitting(false);
  };

  const handleDeleteEntry = async (entryId) => {
    if (!confirm("Are you sure you want to delete this entry? This will adjust the balance back.")) return;
    const res = await deleteEntry(entryId);
    if (res.success) fetchData();
  };

  const handleQuickSettle = async () => {
    if (!person || person.balance === 0) return;
    const isOwedToUser = person.balance > 0;
    const settleAmount = Math.abs(person.balance);
    
    if (!confirm(`Settle full amount of ₹${settleAmount.toLocaleString()}?`)) return;
    
    setIsSubmitting(true);
    const res = await addEntry({
      personId,
      type: isOwedToUser ? "receive" : "send",
      amount: settleAmount,
      description: "Full Settlement",
      category: "Other",
      date: new Date().toISOString().split("T")[0]
    });
    if (res.success) fetchData();
    setIsSubmitting(false);
  };

  const exportToCSV = () => {
    const headers = ["Date", "Type", "Amount", "Category", "Description"];
    const rows = history.map(item => [
      item.date.split("T")[0],
      item.type.toUpperCase(),
      item.amount,
      item.category,
      item.description || ""
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Ledger_${person?.name}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  if (!person && !loading) return (
    <div className="flex flex-col items-center justify-center min-h-full text-[var(--color-text-base)]">
      <h2 className="text-2xl font-semibold mb-4">Person Not Found</h2>
      <button onClick={() => navigate("/rough-notes")} className="px-6 py-2 bg-indigo-500 rounded-lg text-sm text-white font-medium hover:bg-indigo-600 transition-all">Back to Notes</button>
    </div>
  );

  return (
    <div className="min-h-full bg-[var(--color-bg-page)] text-[var(--color-text-base)] font-exo overflow-y-auto pb-20">
      {/* ── TOP NAV HEADER ── */}
      <div className="sticky top-0 z-20 bg-[var(--color-bg-page)]/80 backdrop-blur-xl border-b border-[var(--color-border)] p-4 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 md:gap-6">
           <button onClick={() => navigate("/rough-notes")} className="p-2.5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-indigo-500 hover:border-indigo-500/30 transition-all">
              <ArrowLeft size={18} />
           </button>
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-xl">
                 {person?.name?.[0].toUpperCase()}
              </div>
              <div className="flex flex-col">
                 <h2 className="text-xl md:text-2xl font-bold text-[var(--color-text-base)]">{person?.name}</h2>
                 <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Money Diary Ledger</p>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="flex items-center gap-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] p-3 px-6 rounded-xl shadow-sm whitespace-nowrap">
               <div className="flex flex-col">
                  <span className="text-xs font-medium text-[var(--color-text-muted)] mb-1">Total Balance</span>
                  <p className={`text-lg font-bold ${person?.balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                     {person?.balance >= 0 ? "You're owed " : "You owe "}
                     <span>₹{Math.abs(person?.balance || 0).toLocaleString("en-IN")}</span>
                  </p>
               </div>
               {person?.balance !== 0 && (
                 <button 
                   onClick={handleQuickSettle}
                   disabled={isSubmitting}
                   className="ml-4 p-2 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
                   title="Quick Settle"
                 >
                   <Zap size={14} /> Settle
                 </button>
               )}
            </div>

            <button 
              onClick={exportToCSV}
              className="p-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-indigo-500 transition-all shadow-sm"
              title="Export CSV"
            >
              <Download size={18} />
            </button>

            <button 
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-all shadow-sm whitespace-nowrap"
            >
              <Plus size={16} /> New Entry
            </button>
        </div>
      </div>

      <div className="p-4 md:p-8 flex flex-col gap-10">
         {/* ── TOP: LEDGER HISTORY ── */}
         <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-2 p-6 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">
               <History size={18} className="text-indigo-500" />
               <h3 className="text-base font-semibold text-[var(--color-text-base)]">Ledger History <span className="text-[var(--color-text-muted)] font-normal text-sm ml-2">({history.length} entries)</span></h3>
            </div>

            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
               {/* Table Header */}
               <div className="grid grid-cols-12 gap-0 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] hidden md:grid">
                  <div className="col-span-2 p-4 text-center text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider uppercase">Time</div>
                  <div className="col-span-4 p-4 text-center text-[10px] font-bold text-[var(--color-text-muted)] border-x border-[var(--color-border)] uppercase tracking-wider uppercase">You Received</div>
                  <div className="col-span-4 p-4 text-center text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider uppercase border-r border-[var(--color-border)]">You Sent</div>
                  <div className="col-span-2 p-4 text-center text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider uppercase">Action</div>
               </div>

               {loading ? (
                  <div className="flex justify-center flex-col items-center py-20 text-[var(--color-text-muted)]">
                     <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                     <p className="text-sm">Loading ledger...</p>
                  </div>
               ) : history.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center text-[var(--color-text-muted)]">
                     <FileText size={40} className="mb-4 opacity-30" />
                     <p className="text-sm">No entries recorded yet.</p>
                  </div>
               ) : (
                  <div className="flex flex-col">
                     {(() => {
                        const groups = history.reduce((acc, item) => {
                          const d = item.date.split('T')[0];
                          if (!acc[d]) acc[d] = [];
                          acc[d].push(item);
                          return acc;
                        }, {});

                        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0])).map(([dateKey, items], groupIdx) => (
                           <motion.div 
                             key={dateKey}
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: groupIdx * 0.05 }}
                             className="flex flex-col"
                           >
                              <div className="px-6 py-3 bg-[var(--color-bg-elevated)]/50 border-y border-[var(--color-border)] first:border-t-0 flex items-center gap-3">
                                 <Calendar size={13} className="text-indigo-500" />
                                 <span className="text-xs font-bold text-[var(--color-text-base)] tracking-wide">{formatDate(dateKey)}</span>
                              </div>

                              <div className="flex flex-col divide-y divide-[var(--color-border)]">
                                 {items.map((item) => (
                                    <div key={item._id} className="grid grid-cols-1 md:grid-cols-12 gap-0 items-center hover:bg-[var(--color-bg-page)] transition-colors group">
                                       <div className="md:col-span-2 p-4 flex flex-col items-center justify-center text-center">
                                          <span className="text-[11px] font-semibold text-[var(--color-text-base)]">
                                             {new Date(item.date).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                          <div className="md:hidden mt-2 p-2 rounded-lg bg-rose-500/10 text-rose-500" onClick={() => handleDeleteEntry(item._id)}>
                                             <Trash2 size={14} />
                                          </div>
                                       </div>
                                       
                                       {/* RECEIVED COLUMN */}
                                       <div className="md:col-span-4 p-4 px-6 flex flex-col items-center justify-center border-x border-[var(--color-border)] min-h-[90px] text-center">
                                          {item.type === 'receive' && (
                                             <div className="flex flex-col items-center w-full">
                                                <span className="text-[11px] font-medium text-[var(--color-text-muted)] mb-1">{item.description || "Received"}</span>
                                                <span className="text-lg font-bold text-rose-500">₹{item.amount.toLocaleString("en-IN")}</span>
                                                <div className="flex items-center gap-2 mt-2">
                                                   <span className="text-[9px] font-bold text-rose-500 px-2 py-0.5 bg-rose-500/10 rounded-full border border-rose-500/20">{item.category}</span>
                                                   {item.notes && (
                                                      <span className="text-[9px] text-[var(--color-text-faint)] italic max-w-[120px] truncate" title={item.notes}>笔记</span>
                                                   )}
                                                </div>
                                             </div>
                                          )}
                                       </div>

                                       {/* SENT COLUMN */}
                                       <div className="md:col-span-4 p-4 px-6 flex flex-col items-center justify-center min-h-[90px] text-center border-r border-[var(--color-border)]">
                                          {item.type === 'send' && (
                                             <div className="flex flex-col items-center w-full">
                                                <span className="text-[11px] font-medium text-[var(--color-text-muted)] mb-1">{item.description || "Sent"}</span>
                                                <span className="text-lg font-bold text-emerald-500">₹{item.amount.toLocaleString("en-IN")}</span>
                                                <div className="flex items-center gap-2 mt-2">
                                                   <span className="text-[9px] font-bold text-emerald-500 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">{item.category}</span>
                                                   {item.notes && (
                                                      <span className="text-[9px] text-[var(--color-text-faint)] italic max-w-[120px] truncate" title={item.notes}>笔记</span>
                                                   )}
                                                </div>
                                             </div>
                                          )}
                                       </div>

                                       <div className="md:col-span-2 p-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button 
                                            onClick={() => handleDeleteEntry(item._id)}
                                            className="p-2.5 rounded-full text-[var(--color-text-faint)] hover:text-rose-500 hover:bg-rose-500/10"
                                          >
                                             <Trash2 size={16} />
                                          </button>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </motion.div>
                        ));
                     })()}
                  </div>
               )}
            </div>
         </div>

         {/* ── BOTTOM: PRIVATE SCRATCHPAD ── */}
         <div className="flex flex-col gap-6">
            <div className="p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-sm flex flex-col gap-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[var(--color-text-base)]">
                     <StickyNote size={18} className="text-amber-500" />
                     <h3 className="text-base font-semibold">Private Scratchpad</h3>
                  </div>
                  {saveStatus !== 'idle' && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                       {saveStatus === 'saving' ? 'Saving...' : <><Check size={12} /> Saved</>}
                    </div>
                  )}
               </div>

               <textarea 
                 value={personNotes}
                 onChange={(e) => setPersonNotes(e.target.value)}
                 onBlur={handleSaveNotes}
                 placeholder="Jot down informal notes, agreements, or reminders here..."
                 className="w-full h-48 bg-[var(--color-bg-page)] border border-[var(--color-border)] rounded-xl p-6 text-base text-[var(--color-text-base)] focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all resize-none leading-relaxed placeholder:text-[var(--color-text-faint)]"
               />
               
               <p className="text-xs text-[var(--color-text-faint)] text-center italic">
                  Notes are private to this diary entry. Reminders and informal agreements can go here.
               </p>
            </div>
         </div>
      </div>

      {/* ── ADD ENTRY MODAL ── */}
      <Modal open={showAdd} onClose={() => !isSubmitting && setShowAdd(false)} title="Add Ledger Note" maxWidth="max-w-md">
         <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--color-bg-page)] rounded-xl border border-[var(--color-border)]">
                <button 
                  type="button" 
                  onClick={() => setEntryType("send")}
                  className={`py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all
                             ${entryType === 'send' ? 'bg-emerald-500 text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-base)]'}`}
                >
                   <SendHorizontal size={16} /> I Sent Money
                </button>
                <button 
                  type="button" 
                  onClick={() => setEntryType("receive")}
                  className={`py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all
                             ${entryType === 'receive' ? 'bg-rose-500 text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-base)]'}`}
                >
                   <HandCoins size={16} /> I Got Money
                </button>
            </div>

            <div className="flex flex-col gap-4">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <ModalField label="Amount (₹)">
                    <input 
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)} 
                      placeholder="0.00"
                      className={modalInputCls}
                      required
                      autoFocus
                    />
                 </ModalField>
                 <ModalField label="Category">
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className={modalInputCls}
                    >
                       {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                 </ModalField>
               </div>

               <ModalField label="Reason / Memo (Optional)">
                  <input 
                    type="text" 
                    value={desc} 
                    onChange={(e) => setDesc(e.target.value)} 
                    placeholder="e.g. Lunch split, movie tickets"
                    className={modalInputCls}
                  />
               </ModalField>

               <ModalField label="Additional Notes (Optional)">
                  <textarea 
                    value={entryNotes} 
                    onChange={(e) => setEntryNotes(e.target.value)} 
                    placeholder="Any extra details..."
                    className={`${modalInputCls} min-h-[80px] py-3 resize-none`}
                  />
               </ModalField>

               <ModalField label="Date of Entry">
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className={modalInputCls}
                  />
               </ModalField>
            </div>

            <div className={`p-4 rounded-xl flex items-start gap-3
                           ${entryType === 'send' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
               <div className={`mt-0.5 shrink-0 ${entryType === "send" ? "text-emerald-500" : "text-rose-500"}`}>
                  {entryType === "send" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
               </div>
               <p className={`text-sm ${entryType === 'send' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                  {entryType === 'send' 
                    ? `Tracking ₹${amount || '0'} as an expense you paid. ${person?.name} owes this back to you.` 
                    : `Tracking ₹${amount || '0'} as money received. This reduces ${person?.name}'s debt to you.`
                  }
               </p>
            </div>

            <ModalFooter>
               <CancelBtn onClick={() => setShowAdd(false)} disabled={isSubmitting} />
               <ConfirmBtn 
                 type="submit" 
                 disabled={isSubmitting} 
                 className={entryType === 'send' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-rose-500 hover:bg-rose-600 text-white'}
               >
                 Confirm Entry
               </ConfirmBtn>
            </ModalFooter>
         </form>
      </Modal>
    </div>
  );
};

export default RoughNoteDetails;
