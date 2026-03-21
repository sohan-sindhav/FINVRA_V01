import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  NotebookPen, 
  Trash2, 
  UserPlus, 
  TrendingUp, 
  TrendingDown, 
  LayoutGrid, 
  List, 
  Search, 
  SendHorizontal, 
  HandCoins, 
  Loader2,
  ChevronRight
} from "lucide-react";
import { useRoughNote } from "../context/RoughNoteContext";
import Modal, { ModalField, ModalFooter, CancelBtn, ConfirmBtn, modalInputCls } from "../components/Modal";
import { Link } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";

const RoughNotesPage = () => {
  const { persons, loading, addPerson, deletePerson, addEntry } = useRoughNote();
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const { theme } = useTheme();
  
  const isLight = theme === "light";

  // Quick Action Modal State
  const [quickAction, setQuickAction] = useState({ open: false, person: null, type: "send" });
  const [quickAmount, setQuickAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPerson = async (e) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    const res = await addPerson(newPersonName);
    if (res.success) {
      setNewPersonName("");
      setShowAddPerson(false);
    }
  };

  const handleQuickAction = async (e) => {
    e.preventDefault();
    if (!quickAmount || Number(quickAmount) <= 0) return;
    setIsSubmitting(true);
    const res = await addEntry({
      personId: quickAction.person._id,
      type: quickAction.type,
      amount: Number(quickAmount),
      description: `Quick ${quickAction.type}`,
      date: new Date().toISOString().split("T")[0]
    });
    if (res.success) {
      setQuickAmount("");
      setQuickAction({ open: false, person: null, type: "send" });
    }
    setIsSubmitting(false);
  };

  const filteredPersons = persons.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOwed = persons.reduce((sum, p) => p.balance > 0 ? sum + p.balance : sum, 0);
  const totalOweTo = persons.reduce((sum, p) => p.balance < 0 ? sum + Math.abs(p.balance) : sum, 0);

  return (
    <div className="min-h-full bg-[var(--color-bg-page)] p-4 md:p-8 text-[var(--color-text-base)] font-exo transition-colors duration-300 overflow-y-auto custom-scrollbar">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 mt-2">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-base)] flex items-center gap-2">
             <NotebookPen size={22} className="text-indigo-500" /> Money Diary
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Settle up with friends, family, and colleagues.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
           <div className="relative w-full sm:w-64 group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)] group-focus-within:text-[var(--color-text-base)] transition-colors" />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] py-2 pl-10 pr-4 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-[var(--color-text-faint)]"
              />
           </div>
           <button 
             onClick={() => setShowAddPerson(true)}
             className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-500 text-white px-5 py-2 text-sm font-medium rounded-lg hover:bg-indigo-600 transition-all shadow-sm"
           >
             <UserPlus size={16} /> Add 
           </button>
        </div>
      </div>

      {/* ── SUMMARY STATS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
         <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
               <TrendingUp size={16} className="text-emerald-500" />
               <p className="text-sm font-medium text-[var(--color-text-muted)]">They owe you</p>
            </div>
            <p className="text-2xl font-bold text-emerald-500">₹{totalOwed.toLocaleString("en-IN")}</p>
         </div>
         <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
               <TrendingDown size={16} className="text-rose-500" />
               <p className="text-sm font-medium text-[var(--color-text-muted)]">You owe them</p>
            </div>
            <p className="text-2xl font-bold text-rose-500">₹{totalOweTo.toLocaleString("en-IN")}</p>
         </div>
         <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6 rounded-xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
               <p className="text-sm font-medium text-[var(--color-text-muted)] mb-2">Active Ledgers</p>
               <p className="text-2xl font-bold">{persons.length}</p>
            </div>
            <div className="flex border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-bg-page)] shadow-sm">
               <button onClick={() => setViewMode('grid')} className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-[var(--color-bg-elevated)] text-indigo-500' : 'text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)]'}`}><LayoutGrid size={16} /></button>
               <button onClick={() => setViewMode('list')} className={`p-2 transition-all ${viewMode === 'list' ? 'bg-[var(--color-bg-elevated)] text-indigo-500' : 'text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)]'}`}><List size={16} /></button>
            </div>
         </div>
      </div>

      {/* ── CONTENT GRID ── */}
      <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "flex flex-col gap-4"
          }>
        <AnimatePresence mode="popLayout">
          {filteredPersons.length === 0 && !loading && (
             <div className="col-span-full py-20 text-center text-[var(--color-text-muted)]">
                 <NotebookPen size={40} className="mx-auto mb-4 opacity-30" />
                 <p className="text-sm">No ledger entries found.</p>
             </div>
          )}
          {filteredPersons.map((p) => (
            <Link to={`/rough-notes/${p._id}`} key={p._id} className={viewMode === 'list' ? 'contents' : ''}>
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl group hover:border-indigo-500/50 hover:shadow-md transition-all duration-300 relative
                           ${viewMode === 'list' ? 'flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6' : 'flex flex-col h-full shadow-sm'}`}
              >
                <div className={viewMode === 'list' ? 'flex items-center gap-6 flex-1 w-full' : 'p-6 flex-1'}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xl font-bold">
                          {p.name[0].toUpperCase()}
                       </div>
                       <div>
                          <p className="text-base font-semibold text-[var(--color-text-base)]">{p.name}</p>
                          <span className="text-xs text-[var(--color-text-muted)] mt-0.5">Active Ledger</span>
                       </div>
                    </div>
                  </div>

                  <div className={`flex flex-col gap-1 ${viewMode === 'list' ? 'ml-auto text-right' : 'mt-6 mb-2'}`}>
                     <span className="text-xs font-medium text-[var(--color-text-muted)]">
                       {p.balance === 0 ? "Settled Up" : p.balance > 0 ? "Owes you" : "You owe"}
                     </span>
                     <p className={`text-2xl font-bold ${p.balance === 0 ? 'text-[var(--color-text-base)]' : p.balance > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        ₹{Math.abs(p.balance).toLocaleString("en-IN")}
                     </p>
                  </div>
                </div>

                <div className={`flex gap-3 bg-[var(--color-bg-page)] border-t border-[var(--color-border)] p-4 ${viewMode === 'list' ? 'border-t-0 border-l rounded-r-xl w-full sm:w-auto mt-4 sm:mt-0' : 'rounded-b-xl'}`}>
                   <button 
                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickAction({ open: true, person: p, type: "send" }); }}
                     className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-emerald-500/10 text-emerald-500 rounded-lg text-sm font-medium hover:bg-emerald-500 hover:text-white transition-all"
                   >
                      Sent
                   </button>
                   <button 
                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickAction({ open: true, person: p, type: "receive" }); }}
                     className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-rose-500/10 text-rose-500 rounded-lg text-sm font-medium hover:bg-rose-500 hover:text-white transition-all"
                   >
                      Rcvd
                   </button>
                </div>

                {/* Minimal Delete Toggle */}
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); if(confirm("Are you sure you want to delete this person's ledger?")) deletePerson(p._id); }}
                  className="absolute top-4 right-4 p-2 text-[var(--color-text-faint)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            </Link>
          ))}
        </AnimatePresence>
      </div>

      {/* ── MODALS ── */}
      <Modal open={showAddPerson} onClose={() => setShowAddPerson(false)} title="Add Person" maxWidth="max-w-sm">
         <form onSubmit={handleAddPerson} className="flex flex-col gap-6 mt-4">
            <ModalField label="Name">
               <input 
                 type="text" 
                 value={newPersonName} 
                 onChange={(e) => setNewPersonName(e.target.value)}
                 placeholder="Enter name"
                 className={`${modalInputCls}`}
                 required
                 autoFocus
               />
            </ModalField>
            <ModalFooter>
               <CancelBtn onClick={() => setShowAddPerson(false)} />
               <ConfirmBtn type="submit">Create Ledger</ConfirmBtn>
            </ModalFooter>
         </form>
      </Modal>

      <Modal 
        open={quickAction.open} 
        onClose={() => !isSubmitting && setQuickAction({ ...quickAction, open: false })} 
        title={`${quickAction.type === 'send' ? 'You gave to ' : 'You received from '} ${quickAction.person?.name}`}
        maxWidth="max-w-xs"
      >
         <form onSubmit={handleQuickAction} className="flex flex-col gap-6 mt-4">
            <ModalField label="Amount (₹)">
               <input 
                 type="number" 
                 value={quickAmount} 
                 onChange={(e) => setQuickAmount(e.target.value)}
                 className={`${modalInputCls} text-lg`}
                 placeholder="0.00"
                 required
                 autoFocus
                 min="1"
               />
            </ModalField>
            <ModalFooter>
               <CancelBtn onClick={() => setQuickAction({ ...quickAction, open: false })} disabled={isSubmitting} />
               <ConfirmBtn 
                 variant={quickAction.type === 'send' ? 'primary' : 'danger'} 
                 disabled={isSubmitting}
               >
                 {isSubmitting ? <Loader2 size={16} className="animate-spin inline" /> : 'Confirm'}
               </ConfirmBtn>
            </ModalFooter>
         </form>
      </Modal>
    </div>
  );
};

export default RoughNotesPage;
