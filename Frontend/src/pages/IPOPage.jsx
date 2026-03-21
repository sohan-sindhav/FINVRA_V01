import React, { useState } from "react";
import { Plus, Trash2, TrendingUp, Calendar, Search } from "lucide-react";
import { useIPO } from "../context/IPOContext";
import Modal, {
  ModalField,
  ModalFooter,
  CancelBtn,
  ConfirmBtn,
  modalInputCls,
} from "../components/Modal";
import IPOApplyWizard from "../components/IPOApplyWizard";
import IPOApplicationsDetailsModal from "../components/IPOApplicationsDetailsModal";
import { useTheme } from "../theme/ThemeContext";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const StatusBadge = ({ opendate, closedate }) => {
  const now  = new Date();
  const open = new Date(opendate);
  const close = new Date(closedate);

  if (now < open)
    return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">Upcoming</span>;
  if (now >= open && now <= close)
    return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">Open</span>;
  return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-500">Closed</span>;
};

const IPOPage = () => {
  const { ipos, applications, loading, createIPO, deleteIPO } = useIPO();
  const { theme } = useTheme();

  const [showModal,    setShowModal]    = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeIPO,     setActiveIPO]      = useState(null);
  const [formError,    setFormError]    = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");

  const [companyname, setCompanyname] = useState("");
  const [opendate,    setOpendate]    = useState("");
  const [closedate,   setClosedate]   = useState("");
  const [pricebandMin, setPricebandMin] = useState("");
  const [pricebandMax, setPricebandMax] = useState("");
  const [lot,         setLot]         = useState("");

  const resetForm = () => {
    setCompanyname(""); setOpendate(""); setClosedate("");
    setPricebandMin(""); setPricebandMax(""); setLot("");
    setFormError("");
  };

  const handleClose = () => { setShowModal(false); resetForm(); };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    const result = await createIPO({
      companyname,
      opendate,
      closedate,
      priceband: { min: Number(pricebandMin), max: Number(pricebandMax) },
      lot: Number(lot),
      minimum_retail_price: Number(lot) * Number(pricebandMax),
    });

    setSubmitting(false);

    if (!result.success) {
      setFormError(result.error);
      return;
    }
    handleClose();
  };

  const filtered = ipos.filter(ipo => 
    ipo.companyname.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const sorted = [...filtered].sort((a, b) => a.companyname.localeCompare(b.companyname));

  return (
    <div className="bg-[var(--color-bg-page)] min-h-full flex flex-col transition-colors duration-300 p-4 md:p-8">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-base)]">IPO Manager</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 tracking-tight">
             Active Listings: {ipos.length}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-indigo-600 transition-all shadow-sm"
        >
          <Plus size={16} /> Add IPO
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-6">
         <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
         <input 
           type="text"
           placeholder="Search IPOs..."
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
                 <th className="px-6 py-4 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)]">Company</th>
                 <th className="px-6 py-4 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)]">Status</th>
                 <th className="px-6 py-4 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)]">Timeline</th>
                 <th className="px-6 py-4 text-right text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)]">Min Price</th>
                 <th className="px-6 py-4 text-right text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)] w-32">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-[var(--color-border)]">
              {loading && sorted.length === 0 ? (
                <tr>
                   <td colSpan="6" className="py-20 text-center text-xs text-[var(--color-text-faint)]">Loading records...</td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                   <td colSpan="6" className="py-20 text-center text-xs text-[var(--color-text-faint)]">No IPOs found.</td>
                </tr>
              ) : (
                sorted.map((ipo, i) => {
                  const appCount = applications.filter(app => (app.ipo?._id || app.ipo) === ipo._id).length;
                  return (
                    <tr key={ipo._id} onClick={() => { setActiveIPO(ipo); setShowDetailsModal(true); }} className="hover:bg-[var(--color-bg-page)]/50 cursor-pointer transition-colors group">
                      <td className="px-6 py-4 text-xs text-[var(--color-text-faint)]">{i + 1}</td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[var(--color-text-base)] transition-colors group-hover:text-indigo-500">
                               {ipo.companyname}
                            </span>
                            {appCount > 0 && <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded-md font-medium">{appCount} apps</span>}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <StatusBadge opendate={ipo.opendate} closedate={ipo.closedate} />
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--color-text-muted)] italic">
                         {fmtDate(ipo.opendate)} — {fmtDate(ipo.closedate)}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <span className="text-sm font-semibold text-emerald-500">₹{Number(ipo.minimum_retail_price).toLocaleString("en-IN")}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); setActiveIPO(ipo); setShowApplyModal(true); }} className="text-[11px] font-medium px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors">Apply</button>
                            <button onClick={(e) => { e.stopPropagation(); if(confirm("Delete IPO?")) deleteIPO(ipo._id); }} className="p-1.5 text-[var(--color-text-faint)] hover:text-rose-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
                         </div>
                      </td>
                    </tr>
                  );
                })
              )}
           </tbody>
        </table>
      </div>

      {/* ── MOBILE CARDS ──────────────────────────────────────── */}
      <div className="md:hidden flex flex-col gap-4">
         {loading && sorted.length === 0 ? (
           <div className="py-20 text-center text-xs text-[var(--color-text-faint)] bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">Loading records...</div>
         ) : sorted.length === 0 ? (
           <div className="py-20 text-center text-xs text-[var(--color-text-faint)] bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">No IPOs found.</div>
         ) : (
           sorted.map((ipo, i) => {
             const appCount = applications.filter(app => (app.ipo?._id || app.ipo) === ipo._id).length;
             return (
               <div key={ipo._id} onClick={() => { setActiveIPO(ipo); setShowDetailsModal(true); }} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col gap-4 shadow-sm group cursor-pointer hover:border-indigo-500/30 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                     <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-semibold text-[var(--color-text-base)]">
                              {ipo.companyname}
                           </span>
                           {appCount > 0 && <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-md font-medium">{appCount} apps</span>}
                        </div>
                        <div className="flex items-center gap-2">
                           <StatusBadge opendate={ipo.opendate} closedate={ipo.closedate} />
                           <span className="text-xs text-[var(--color-text-muted)] italic">
                              {fmtDate(ipo.opendate)} — {fmtDate(ipo.closedate)}
                           </span>
                        </div>
                     </div>
                     <div className="text-right shrink-0 flex flex-col items-end">
                        <span className="block text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Min Price</span>
                        <span className="text-base font-semibold text-emerald-500">₹{Number(ipo.minimum_retail_price).toLocaleString("en-IN")}</span>
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)] mt-1">
                     <button onClick={(e) => { e.stopPropagation(); setActiveIPO(ipo); setShowApplyModal(true); }} className="text-xs font-semibold px-4 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all shadow-sm">Apply Now</button>
                     <button onClick={(e) => { e.stopPropagation(); if(confirm("Delete IPO?")) deleteIPO(ipo._id); }} className="text-[var(--color-text-faint)] hover:text-rose-500 transition-colors flex items-center gap-1 text-xs font-semibold ml-2"><Trash2 size={16} /></button>
                  </div>
               </div>
             );
           })
         )}
      </div>

      {/* ── MODALS ── */}
      <Modal open={showModal} onClose={handleClose} title="Add IPO Listing" maxWidth="max-w-md">
        <form onSubmit={handleCreate} className="flex flex-col gap-4 p-1">
          {formError && <p className="text-xs text-rose-500">{formError}</p>}
          <ModalField label="Company Name">
            <input type="text" value={companyname} onChange={(e) => setCompanyname(e.target.value)}
              placeholder="e.g. Tata Tech" className={modalInputCls} required />
          </ModalField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModalField label="Open Date">
              <input type="date" value={opendate} onChange={(e) => setOpendate(e.target.value)} className={modalInputCls} required />
            </ModalField>
            <ModalField label="Close Date">
              <input type="date" value={closedate} onChange={(e) => setClosedate(e.target.value)} className={modalInputCls} required />
            </ModalField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModalField label="Price Min">
              <input type="number" value={pricebandMin} onChange={(e) => setPricebandMin(e.target.value)} className={modalInputCls} required />
            </ModalField>
            <ModalField label="Price Max">
              <input type="number" value={pricebandMax} onChange={(e) => setPricebandMax(e.target.value)} className={modalInputCls} required />
            </ModalField>
          </div>
          <ModalField label="Lot Size">
            <input type="number" value={lot} onChange={(e) => setLot(e.target.value)} className={modalInputCls} required />
          </ModalField>
          <ModalFooter>
             <CancelBtn onClick={handleClose} />
             <ConfirmBtn type="submit" loading={submitting}>Add IPO</ConfirmBtn>
          </ModalFooter>
        </form>
      </Modal>

      <IPOApplyWizard 
        open={showApplyModal} 
        onClose={() => { setShowApplyModal(false); setActiveIPO(null); }} 
        ipo={activeIPO} 
      />

      <IPOApplicationsDetailsModal
        open={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setActiveIPO(null); }}
        ipo={activeIPO}
      />
    </div>
  );
};

export default IPOPage;
