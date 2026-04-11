import React, { useState } from "react";
import { usePan } from "../context/PanContext";
import { 
  Button, 
  Input, 
  Modal, 
  Card 
} from "../ui";
import { 
  Plus, 
  Trash2, 
  CreditCard, 
  ShieldCheck, 
  Search,
  AlertCircle
} from "lucide-react";
import { useTheme } from "../theme/ThemeContext";

const PanManagerPage = () => {
  const { panCards, loading, addPanCard, deletePanCard } = usePan();
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    panNumber: "",
    nameOnPan: ""
  });
  const [error, setError] = useState(null);

  const isLight = theme === "light";

  const handleAddPan = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(formData.panNumber.toUpperCase())) {
      setError("Please enter a valid PAN number (e.g., ABCDE1234F)");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addPanCard(formData);
      if (result.success) {
        setIsModalOpen(false);
        setFormData({ panNumber: "", nameOnPan: "" });
      } else {
        setError(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPans = panCards.filter(pan => 
    pan.panNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pan.nameOnPan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[var(--color-bg-page)] min-h-full p-4 md:p-8 transition-colors duration-300">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-base)]">PAN Manager</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 tracking-tight">
             Verified Cards: {panCards.length}
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-indigo-600 transition-all shadow-sm"
        >
          <Plus size={18} />
          <span>Add PAN Card</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-6">
         <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
         <input 
           type="text"
           placeholder="Search by PAN or Name..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-text-base)] rounded-xl focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-[var(--color-text-faint)]"
         />
      </div>

      {/* ── DESKTOP TABLE ─────────────────────────────────────── */}
      <div className="hidden md:block bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden overflow-x-auto shadow-sm">
        <table className="w-full border-collapse min-w-[700px]">
           <thead>
              <tr className="border-b border-[var(--color-border)]">
                 <th className="px-6 py-4 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)] w-12">#</th>
                 <th className="px-6 py-4 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)]">PAN Number</th>
                 <th className="px-6 py-4 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)]">Account Holder</th>
                 <th className="px-6 py-4 text-center text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)] w-24">Status</th>
                 <th className="px-6 py-4 text-right text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)] w-32">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-[var(--color-border)]">
              {loading && filteredPans.length === 0 ? (
                <tr>
                   <td colSpan="5" className="py-20 text-center text-xs text-[var(--color-text-faint)]">Synchronizing data...</td>
                </tr>
              ) : filteredPans.length === 0 ? (
                <tr>
                   <td colSpan="5" className="py-20 text-center text-xs text-[var(--color-text-faint)]">No identifiers found.</td>
                </tr>
              ) : (
                filteredPans.map((pan, i) => (
                  <tr key={pan._id} className="hover:bg-[var(--color-bg-page)]/50 transition-colors group">
                    <td className="px-6 py-4 text-xs text-[var(--color-text-faint)]">{i + 1}</td>
                    <td className="px-6 py-4">
                       <span className="text-sm font-semibold tracking-widest font-mono text-[var(--color-text-base)]">
                          {pan.panNumber}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--color-text-muted)] italic">
                       {pan.nameOnPan}
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center justify-center">
                          <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-md">Verified</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { if(confirm("Delete card?")) deletePanCard(pan._id); }}
                            className="p-1.5 text-[var(--color-text-faint)] hover:text-rose-500 transition-colors"
                            title="Delete Identifier"
                          >
                            <Trash2 size={14} />
                          </button>
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
        {loading && filteredPans.length === 0 ? (
           <div className="py-20 text-center text-xs text-[var(--color-text-faint)] bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">Synchronizing data...</div>
        ) : filteredPans.length === 0 ? (
           <div className="py-20 text-center text-xs text-[var(--color-text-faint)] bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">No identifiers found.</div>
        ) : (
           filteredPans.map((pan, i) => (
             <div key={pan._id} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                <div className="flex justify-between items-start gap-4">
                   <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-semibold tracking-widest font-mono text-[var(--color-text-base)]">{pan.panNumber}</span>
                      <span className="text-xs text-[var(--color-text-muted)] italic">{pan.nameOnPan}</span>
                   </div>
                   <div className="flex items-center">
                      <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-md">Verified</span>
                   </div>
                </div>
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-[var(--color-border)]">
                   <button onClick={() => { if(confirm("Delete card?")) deletePanCard(pan._id); }} className="text-[var(--color-text-faint)] hover:text-rose-500 transition-colors flex items-center gap-1.5 text-xs font-semibold"><Trash2 size={14} /> Remove Card</button>
                </div>
             </div>
           ))
        )}
      </div>

      {/* Add PAN Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Identification Card">
        <form onSubmit={handleAddPan} className="flex flex-col gap-4 p-1">
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-[var(--color-text-muted)] ml-1">Holder Name</label>
            <input 
              placeholder="As shown on card"
              value={formData.nameOnPan}
              onChange={(e) => setFormData({...formData, nameOnPan: e.target.value.toUpperCase()})}
              className="w-full bg-[var(--color-bg-page)] border border-[var(--color-border)] py-2.5 px-3.5 text-sm rounded-xl focus:outline-none focus:border-indigo-500 transition-all placeholder:text-[var(--color-text-faint)]"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-[var(--color-text-muted)] ml-1">PAN Number</label>
            <input 
              placeholder="ABCDE1234F"
              value={formData.panNumber}
              onChange={(e) => setFormData({...formData, panNumber: e.target.value.toUpperCase()})}
              className="w-full bg-[var(--color-bg-page)] border border-[var(--color-border)] py-2.5 px-3.5 text-sm font-mono tracking-widest rounded-xl focus:outline-none focus:border-indigo-500 transition-all placeholder:text-[var(--color-text-faint)]"
              required
              maxLength={10}
            />
          </div>
          <div className="flex gap-3 mt-2">
            <button 
              type="button" 
              disabled={isSubmitting}
              className="flex-1 py-2.5 text-xs font-medium border border-[var(--color-border)] text-[var(--color-text-muted)] rounded-xl hover:bg-[var(--color-bg-card)] transition-all disabled:opacity-50"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 text-xs font-medium bg-indigo-500 text-white rounded-xl shadow-sm hover:bg-indigo-600 transition-all disabled:opacity-60"
            >
              {isSubmitting ? "Adding..." : "Add Card"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PanManagerPage;
