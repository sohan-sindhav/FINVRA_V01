import React, { useState } from "react";
import { Plus, Trash2, TrendingUp, Calendar, Search, Edit2 } from "lucide-react";
import { useIPO } from "../context/IPOContext";
import Modal, {
  ModalField,
  ModalFooter,
  CancelBtn,
  ConfirmBtn,
  modalInputCls,
} from "../components/Modal";
import IPOApplyGrid from "../components/IPOApplyGrid";
import IPOApplicationsDetailsModal from "../components/IPOApplicationsDetailsModal";
import ShareIPOModal from "../components/ShareIPOModal";
import SharedIPODetailsModal from "../components/SharedIPODetailsModal";
import { useTheme } from "../theme/ThemeContext";
import { Share2 } from "lucide-react";

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

const Tab = ({ active, onClick, children, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-2.5 text-[13px] font-bold uppercase tracking-wider transition-all rounded-[10px] ${
      active
        ? "bg-white/[0.06] text-[var(--color-text-base)] shadow-sm"
        : "text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)] hover:bg-white/[0.02]"
    }`}
  >
    {children}
    {badge > 0 && (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
        active ? "bg-indigo-500 text-white" : "bg-white/[0.05] text-[var(--color-text-faint)]"
      }`}>
        {badge}
      </span>
    )}
  </button>
);

const IPOPage = () => {
  const { ipos, applications, sharedIPOs, loading, createIPO, updateIPO, deleteIPO } = useIPO();
  const { theme } = useTheme();

  const [showModal,    setShowModal]    = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSharedDetailsModal, setShowSharedDetailsModal] = useState(false);
  const [activeIPO,     setActiveIPO]      = useState(null);
  const [activeShareId, setActiveShareId]  = useState(null);
  const [editingIpoId, setEditingIpoId]    = useState(null);
  const [formError,    setFormError]    = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [tab, setTab] = useState("mine");

  const [companyname, setCompanyname] = useState("");
  const [opendate,    setOpendate]    = useState("");
  const [closedate,   setClosedate]   = useState("");
  const [pricebandMin, setPricebandMin] = useState("");
  const [pricebandMax, setPricebandMax] = useState("");
  const [lot,         setLot]         = useState("");

  const resetForm = () => {
    setEditingIpoId(null);
    setCompanyname(""); setOpendate(""); setClosedate("");
    setPricebandMin(""); setPricebandMax(""); setLot("");
    setFormError("");
  };

  const handleClose = () => { setShowModal(false); resetForm(); };

  const handleEdit = (ipo) => {
    setEditingIpoId(ipo._id);
    setCompanyname(ipo.companyname);
    setOpendate(new Date(ipo.opendate).toISOString().split('T')[0]);
    setClosedate(new Date(ipo.closedate).toISOString().split('T')[0]);
    setPricebandMin(ipo.priceband?.min || "");
    setPricebandMax(ipo.priceband?.max || "");
    setLot(ipo.lot || "");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    const payload = {
      companyname,
      opendate,
      closedate,
      priceband: { min: Number(pricebandMin), max: Number(pricebandMax) },
      lot: Number(lot),
      minimum_retail_price: Number(lot) * Number(pricebandMax),
    };

    let result;
    if (editingIpoId) {
      result = await updateIPO(editingIpoId, payload);
    } else {
      result = await createIPO(payload);
    }

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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-base)]">IPO Manager</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 tracking-tight">
             {tab === "mine" ? `Active Listings: ${ipos.length}` : `Shared with you: ${sharedIPOs?.length || 0}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {tab === "mine" && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-indigo-600 transition-all shadow-sm"
            >
              <Plus size={16} /> Add IPO
            </button>
          )}
        </div>
      </div>

      {/* ── TABS ────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex bg-[var(--color-bg-card)] border border-[var(--color-border)] p-1 rounded-[14px] w-fit">
          <Tab active={tab === "mine"} onClick={() => { setTab("mine"); setSearchQuery(""); }}>
            My IPOs
          </Tab>
          <Tab active={tab === "shared"} onClick={() => { setTab("shared"); setSearchQuery(""); }} badge={sharedIPOs?.length || 0}>
            Shared IPOs
          </Tab>
        </div>
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

       {/* ── MY IPOS TAB ─────────────────────────────────────── */}
       {tab === "mine" && (
         <>
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
                                <button onClick={(e) => { e.stopPropagation(); setActiveIPO(ipo); setShowShareModal(true); }} className="p-1.5 text-[var(--color-text-faint)] hover:text-indigo-500 transition-colors" title="Share"><Share2 size={14} /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleEdit(ipo); }} className="p-1.5 text-[var(--color-text-faint)] hover:text-blue-500 transition-colors" title="Edit"><Edit2 size={14} /></button>
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
                         <button onClick={(e) => { e.stopPropagation(); setActiveIPO(ipo); setShowShareModal(true); }} className="text-[var(--color-text-faint)] hover:text-indigo-500 transition-colors flex items-center gap-1 text-xs font-semibold ml-2" title="Share"><Share2 size={16} /></button>
                         <button onClick={(e) => { e.stopPropagation(); handleEdit(ipo); }} className="text-[var(--color-text-faint)] hover:text-blue-500 transition-colors flex items-center gap-1 text-xs font-semibold ml-2"><Edit2 size={16} /></button>
                         <button onClick={(e) => { e.stopPropagation(); if(confirm("Delete IPO?")) deleteIPO(ipo._id); }} className="text-[var(--color-text-faint)] hover:text-rose-500 transition-colors flex items-center gap-1 text-xs font-semibold ml-2"><Trash2 size={16} /></button>
                      </div>
                   </div>
                 );
               })
             )}
          </div>
         </>
       )}

       {/* ── SHARED IPOS TAB ──────────────────────────────────── */}
       {tab === "shared" && (
         <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden overflow-x-auto shadow-sm">
            <table className="w-full border-collapse min-w-[700px]">
               <thead>
                  <tr className="border-b border-[var(--color-border)]">
                     <th className="px-6 py-4 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)] w-12">#</th>
                     <th className="px-6 py-4 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)]">Company</th>
                     <th className="px-6 py-4 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)]">Shared By</th>
                     <th className="px-6 py-4 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)]">Status</th>
                     <th className="px-6 py-4 text-right text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)]">Min Price</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[var(--color-border)]">
                  {sharedIPOs?.length === 0 ? (
                    <tr>
                       <td colSpan="5" className="py-20 text-center text-xs text-[var(--color-text-faint)]">No shared IPOs found.</td>
                    </tr>
                  ) : (
                    sharedIPOs
                      ?.filter(s => s.ipo?.companyname?.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((share, i) => (
                      <tr key={share._id} onClick={() => { setActiveShareId(share._id); setShowSharedDetailsModal(true); }} className="hover:bg-[var(--color-bg-page)]/50 cursor-pointer transition-colors group">
                        <td className="px-6 py-4 text-xs text-[var(--color-text-faint)]">{i + 1}</td>
                        <td className="px-6 py-4">
                           <span className="text-sm font-medium text-[var(--color-text-base)] transition-colors group-hover:text-indigo-500">
                              {share.ipo?.companyname}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-[var(--color-text-base)]">{share.fromUser?.name}</span>
                            <span className="text-[10px] text-[var(--color-text-muted)]">{share.fromUser?.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           {share.ipo && <StatusBadge opendate={share.ipo.opendate} closedate={share.ipo.closedate} />}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <span className="text-sm font-semibold text-emerald-500">₹{Number(share.ipo?.minimum_retail_price || 0).toLocaleString("en-IN")}</span>
                        </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
       )}

      {/* ── MODALS ── */}
      <Modal open={showModal} onClose={handleClose} title={editingIpoId ? "Edit IPO Listing" : "Add IPO Listing"} maxWidth="max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-1">
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
             <ConfirmBtn type="submit" loading={submitting}>{editingIpoId ? "Save Changes" : "Add IPO"}</ConfirmBtn>
          </ModalFooter>
        </form>
      </Modal>

      <IPOApplyGrid
        open={showApplyModal} 
        onClose={() => { setShowApplyModal(false); setActiveIPO(null); }} 
        ipo={activeIPO} 
      />

      <IPOApplicationsDetailsModal
        open={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setActiveIPO(null); }}
        ipo={activeIPO}
      />

      <ShareIPOModal
        open={showShareModal}
        onClose={() => { setShowShareModal(false); setActiveIPO(null); }}
        ipo={activeIPO}
      />

      <SharedIPODetailsModal
        open={showSharedDetailsModal}
        onClose={() => { setShowSharedDetailsModal(false); setActiveShareId(null); }}
        shareId={activeShareId}
      />
    </div>
  );
};

export default IPOPage;
