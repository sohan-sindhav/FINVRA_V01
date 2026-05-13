import React, { useState } from "react";
import { usePan } from "../context/PanContext";
import { Plus, Trash2, Share2, Search, X, Check, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";
import Modal, { ModalField, ModalFooter, CancelBtn, ConfirmBtn, modalInputCls } from "../components/Modal.jsx";

// ── helpers ────────────────────────────────────────────────────────────────
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const Badge = ({ children, color = "emerald" }) => {
  const colors = {
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    amber:   "bg-amber-500/10  text-amber-500  border-amber-500/20",
    indigo:  "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    rose:    "bg-rose-500/10   text-rose-500   border-rose-500/20",
  };
  return (
    <span className={`text-[10px] font-medium border px-2 py-0.5 rounded-md ${colors[color]}`}>
      {children}
    </span>
  );
};

// ── Tab button ─────────────────────────────────────────────────────────────
const Tab = ({ active, onClick, children, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-2.5 text-[13px] font-bold uppercase tracking-wider transition-all rounded-[10px] ${
      active
        ? "bg-white/[0.06] text-white shadow-sm"
        : "text-white/40 hover:text-white/80 hover:bg-white/[0.02]"
    }`}
  >
    {children}
    {badge > 0 && (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
        active ? "bg-indigo-500 text-white" : "bg-white/[0.05] text-white/40"
      }`}>
        {badge}
      </span>
    )}
  </button>
);

// ── Share PAN Modal ────────────────────────────────────────────────────────
const ShareModal = ({ open, onClose, panCards, sendShareRequest }) => {
  const [email, setEmail]       = useState("");
  const [selected, setSelected] = useState([]);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);

  const reset = () => { setEmail(""); setSelected([]); setError(""); setSuccess(""); };
  const handleClose = () => { reset(); onClose(); };

  const toggle = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError(""); setSuccess("");
    if (!selected.length) { setError("Select at least one PAN card to share."); return; }
    setLoading(true);
    try {
      const res = await sendShareRequest({ recipientEmail: email, panCardIds: selected });
      if (res.success) { setSuccess(res.message); setSelected([]); setEmail(""); }
      else setError(res.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Share PAN Cards">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-1">
        <ModalField label="Recipient's Finvra Email">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); setSuccess(""); }}
            placeholder="their@email.com"
            className={modalInputCls}
            required
          />
        </ModalField>

        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-medium text-[var(--color-text-muted)] ml-1">
            Select PANs to share
          </p>
          {panCards.length === 0 ? (
            <p className="text-xs text-[var(--color-text-faint)] px-1">No PAN cards to share yet.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {panCards.map((pan) => {
                const isSelected = selected.includes(pan._id);
                return (
                  <button
                    key={pan._id}
                    type="button"
                    onClick={() => toggle(pan._id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-indigo-500/50 bg-indigo-500/10"
                        : "border-[var(--color-border)] bg-[var(--color-bg-page)] hover:border-indigo-500/30"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold font-mono tracking-widest text-[var(--color-text-base)]">
                        {pan.panNumber}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-faint)]">{pan.nameOnPan}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected ? "bg-indigo-500 border-indigo-500" : "border-[var(--color-border)]"
                    }`}>
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {error   && <p className="text-xs text-rose-500">{error}</p>}
        {success && <p className="text-xs text-emerald-500">{success}</p>}

        <ModalFooter>
          <CancelBtn onClick={handleClose} disabled={loading} />
          <ConfirmBtn type="submit" disabled={loading || panCards.length === 0}>
            {loading ? "Sending..." : "Send Request"}
          </ConfirmBtn>
        </ModalFooter>
      </form>
    </Modal>
  );
};

// ── Outgoing shares accordion ──────────────────────────────────────────────
const OutgoingShares = ({ shares, revokeShare }) => {
  const [open, setOpen] = useState(false);
  const [revoking, setRevoking] = useState(null);

  const handleRevoke = async (id) => {
    if (!confirm("Revoke this share? The recipient will lose access to your PANs.")) return;
    setRevoking(id);
    await revokeShare(id);
    setRevoking(null);
  };

  if (!shares.length) return null;

  return (
    <div className="px-6 md:px-10 mb-6">
      <div className="rounded-[16px] border border-white/[0.04] bg-[#111827]/50 backdrop-blur-xl overflow-hidden shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-[13px] font-bold uppercase tracking-wider text-white/40 hover:text-white/80 transition-colors bg-white/[0.02]"
        >
          <span>My Active Shares ({shares.length})</span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {open && (
          <div className="border-t border-white/[0.04] divide-y divide-white/[0.04]">
            {shares.map((s) => (
              <div key={s._id} className="flex items-center justify-between px-6 py-4 gap-4">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[14px] font-semibold text-white/90 truncate">
                    {s.toUser?.name}
                  </span>
                  <span className="text-[13px] font-medium text-white/50">{s.toUser?.email}</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 mt-1">
                    {s.panCards?.length} PAN{s.panCards?.length !== 1 ? "s" : ""} shared
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge color={s.status === "accepted" ? "emerald" : "amber"}>
                    {s.status}
                  </Badge>
                  <button
                    onClick={() => handleRevoke(s._id)}
                    disabled={revoking === s._id}
                    className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-white/40 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all disabled:opacity-40"
                    title="Revoke share"
                  >
                    {revoking === s._id ? <RotateCcw size={14} className="animate-spin" /> : <X size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const PanManagerPage = () => {
  const {
    panCards, loading,
    addPanCard, deletePanCard,
    sharedWithMe, outgoingShares,
    sendShareRequest, revokeShare,
  } = usePan();

  const { theme } = useTheme();

  const [tab, setTab]               = useState("mine");       // 'mine' | 'shared'
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen]   = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData]     = useState({ panNumber: "", nameOnPan: "" });
  const [error, setError]           = useState(null);

  // ── Add PAN ──────────────────────────────────────────────────────────────
  const handleAddPan = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    if (!panRegex.test(formData.panNumber.toUpperCase())) {
      setError("Enter a valid PAN number (e.g., ABCDE1234F)");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await addPanCard(formData);
      if (result.success) { setIsAddOpen(false); setFormData({ panNumber: "", nameOnPan: "" }); }
      else setError(result.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Filtered / sorted ────────────────────────────────────────────────────
  const filteredMine = panCards.filter((p) =>
    p.panNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.nameOnPan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group sharedWithMe by sender _id
  const sharedGroups = sharedWithMe.reduce((acc, share) => {
    const key = share.fromUser?._id;
    if (!acc[key]) acc[key] = { user: share.fromUser, pans: [] };
    (share.panCards || []).forEach((p) => acc[key].pans.push(p));
    return acc;
  }, {});

  const sharedPanCount = sharedWithMe.reduce((s, sh) => s + (sh.panCards?.length || 0), 0);

  // ── Row / Card helpers ───────────────────────────────────────────────────
  const renderDesktopRow = (pan, i, deletable) => (
    <tr key={pan._id} className="hover:bg-white/[0.02] transition-colors group">
      <td className="px-6 py-4 text-[13px] font-medium text-white/30 tabular-nums">{i + 1}</td>
      <td className="px-6 py-4">
        <span className="text-[14px] font-semibold tracking-widest font-mono text-white/90">
          {pan.panNumber}
        </span>
      </td>
      <td className="px-6 py-4 text-[13px] font-medium text-white/50 italic">{pan.nameOnPan}</td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center">
          <Badge color="emerald">Verified</Badge>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        {deletable && (
          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsShareOpen(true)}
              className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-white/40 hover:bg-indigo-500/10 hover:text-indigo-400 border border-transparent hover:border-indigo-500/20 transition-all"
              title="Share this PAN"
            >
              <Share2 size={14} />
            </button>
            <button
              onClick={() => { if (confirm("Delete card?")) deletePanCard(pan._id); }}
              className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-white/40 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );

  const renderMobileCard = (pan, deletable) => (
    <div key={pan._id} className="bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] p-5 flex flex-col gap-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold tracking-widest font-mono text-white/90">{pan.panNumber}</span>
          <span className="text-[13px] font-medium text-white/50 italic">{pan.nameOnPan}</span>
        </div>
        <Badge color="emerald">Verified</Badge>
      </div>
      {deletable && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.04]">
          <button onClick={() => setIsShareOpen(true)} className="text-white/40 hover:text-indigo-400 transition-colors flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider px-3 py-2 rounded-[8px] hover:bg-indigo-500/10">
            <Share2 size={14} /> Share
          </button>
          <button onClick={() => { if (confirm("Delete card?")) deletePanCard(pan._id); }} className="text-white/40 hover:text-rose-400 transition-colors flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider px-3 py-2 rounded-[8px] hover:bg-rose-500/10">
            <Trash2 size={14} /> Remove
          </button>
        </div>
      )}
    </div>
  );

  const tableEmpty = (msg) => (
    <tr><td colSpan="5" className="py-24 text-center text-[13px] font-medium text-white/40">{msg}</td></tr>
  );

  return (
    <div className="bg-transparent min-h-full flex flex-col transition-colors duration-300">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center px-6 md:px-10 py-8 border-b border-white/[0.04]">
        <div>
          <h1 className="text-[24px] font-black text-white tracking-tight">PAN Manager</h1>
          <p className="text-[13px] font-medium text-white/40 mt-1 uppercase tracking-wider">
            {tab === "mine"
              ? `Verified Cards: ${panCards.length}`
              : `Shared with you: ${sharedPanCount} PAN${sharedPanCount !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {tab === "mine" && (
            <>
              <button
                onClick={() => setIsShareOpen(true)}
                className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[13px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-[12px] hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all duration-300 h-[40px]"
              >
                <Share2 size={16} /> Share
              </button>
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[13px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-[12px] hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] h-[40px]"
              >
                <Plus size={16} /> Add
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── TABS ────────────────────────────────────────────────────────── */}
      <div className="px-6 md:px-10 py-6">
        <div className="flex bg-white/[0.02] border border-white/[0.04] p-1 rounded-[14px] w-fit">
          <Tab active={tab === "mine"} onClick={() => { setTab("mine"); setSearchQuery(""); }}>
            My PANs
          </Tab>
          <Tab active={tab === "shared"} onClick={() => { setTab("shared"); setSearchQuery(""); }} badge={sharedPanCount}>
            Shared PANs
          </Tab>
        </div>
      </div>

      {/* ── MY PANs TAB ─────────────────────────────────────────────────── */}
      {tab === "mine" && (
        <>
          <OutgoingShares shares={outgoingShares} revokeShare={revokeShare} />

          <div className="px-6 md:px-10 pb-6 relative">
            <Search size={16} className="absolute left-10 top-1/2 -translate-y-1/2 -mt-3 text-white/30 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by PAN or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/[0.06] rounded-[14px] py-3 pl-12 pr-4 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all"
            />
          </div>

          {/* Desktop table */}
          <div className="hidden md:block px-6 md:px-10 pb-10">
            <div className="bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] overflow-hidden shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
              <table className="w-full border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40 w-12">#</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40">PAN Number</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40">Account Holder</th>
                    <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-white/40 w-24">Status</th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-white/40 w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {loading && filteredMine.length === 0
                    ? tableEmpty("Synchronizing data...")
                    : filteredMine.length === 0
                    ? tableEmpty("No identifiers found.")
                    : filteredMine.map((pan, i) => renderDesktopRow(pan, i, true))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-4 px-6 pb-10">
            {loading && filteredMine.length === 0 ? (
              <div className="py-20 text-center text-[13px] font-medium text-white/40 bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">Loading...</div>
            ) : filteredMine.length === 0 ? (
              <div className="py-20 text-center text-[13px] font-medium text-white/40 bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">No identifiers found.</div>
            ) : filteredMine.map((pan) => renderMobileCard(pan, true))}
          </div>
        </>
      )}

      {/* ── SHARED PANs TAB ─────────────────────────────────────────────── */}
      {tab === "shared" && (
        <>
          {Object.keys(sharedGroups).length === 0 ? (
            <div className="mx-6 md:mx-10 py-24 text-center text-[13px] font-medium text-white/40 bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
              No one has shared PANs with you yet.
            </div>
          ) : (
            <div className="flex flex-col gap-8 px-6 md:px-10 pb-10">
              {Object.values(sharedGroups).map(({ user, pans }) => {
                const firstName = user?.name?.split(" ")[0] || "Unknown";
                return (
                  <div key={user?._id} className="flex flex-col gap-4">
                    {/* Group header */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[12px] bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-[14px] font-black border border-indigo-500/20">
                        {firstName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-white/90">{firstName}&apos;s PANs</p>
                        <p className="text-[11px] text-white/40 font-medium">{user?.email}</p>
                      </div>
                    </div>

                    {/* Desktop table for this group */}
                    <div className="hidden md:block bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] overflow-hidden shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                            <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40 w-12">#</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40">PAN Number</th>
                            <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40">Holder Name</th>
                            <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-white/40">Status</th>
                            <th className="px-6 py-4 w-16" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {pans.map((pan, i) => renderDesktopRow(pan, i, false))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards for this group */}
                    <div className="md:hidden flex flex-col gap-3">
                      {pans.map((pan) => renderMobileCard(pan, false))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── MODALS ─────────────────────────────────────────────────────── */}
      {/* Add PAN */}
      <Modal open={isAddOpen} onClose={() => { setIsAddOpen(false); setError(null); }} title="New Identification Card">
        <form onSubmit={handleAddPan} className="flex flex-col gap-4 p-1">
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-[var(--color-text-muted)] ml-1">Holder Name</label>
            <input
              placeholder="As shown on card"
              value={formData.nameOnPan}
              onChange={(e) => setFormData({ ...formData, nameOnPan: e.target.value.toUpperCase() })}
              className={modalInputCls}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-[var(--color-text-muted)] ml-1">PAN Number</label>
            <input
              placeholder="ABCDE1234F"
              value={formData.panNumber}
              onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
              className={`${modalInputCls} font-mono tracking-widest`}
              required
              maxLength={10}
            />
          </div>
          <ModalFooter>
            <CancelBtn onClick={() => { setIsAddOpen(false); setError(null); }} disabled={isSubmitting} />
            <ConfirmBtn type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add Card"}</ConfirmBtn>
          </ModalFooter>
        </form>
      </Modal>

      {/* Share PAN */}
      <ShareModal
        open={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        panCards={panCards}
        sendShareRequest={sendShareRequest}
      />
    </div>
  );
};

export default PanManagerPage;
