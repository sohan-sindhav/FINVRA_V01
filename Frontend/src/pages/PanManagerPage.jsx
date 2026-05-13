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
    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
      active
        ? "bg-indigo-500 text-white shadow-sm"
        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:bg-[var(--color-bg-card)]"
    }`}
  >
    {children}
    {badge > 0 && (
      <span className={`min-w-[17px] h-[17px] flex items-center justify-center px-1 text-[9px] font-black rounded-full ${
        active ? "bg-white/20 text-white" : "bg-indigo-500 text-white"
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
    <div className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] transition-colors"
      >
        <span>My Active Shares ({shares.length})</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <div className="border-t border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          {shares.map((s) => (
            <div key={s._id} className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs font-semibold text-[var(--color-text-base)] truncate">
                  {s.toUser?.name}
                </span>
                <span className="text-[10px] text-[var(--color-text-faint)]">{s.toUser?.email}</span>
                <span className="text-[10px] text-[var(--color-text-faint)] mt-0.5">
                  {s.panCards?.length} PAN{s.panCards?.length !== 1 ? "s" : ""} shared
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge color={s.status === "accepted" ? "emerald" : "amber"}>
                  {s.status}
                </Badge>
                <button
                  onClick={() => handleRevoke(s._id)}
                  disabled={revoking === s._id}
                  className="p-1.5 rounded-lg text-[var(--color-text-faint)] hover:text-rose-500 hover:bg-rose-500/10 transition-all disabled:opacity-40"
                  title="Revoke share"
                >
                  {revoking === s._id ? <RotateCcw size={13} className="animate-spin" /> : <X size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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
    <tr key={pan._id} className="hover:bg-[var(--color-bg-page)]/50 transition-colors group">
      <td className="px-6 py-4 text-xs text-[var(--color-text-faint)]">{i + 1}</td>
      <td className="px-6 py-4">
        <span className="text-sm font-semibold tracking-widest font-mono text-[var(--color-text-base)]">
          {pan.panNumber}
        </span>
      </td>
      <td className="px-6 py-4 text-xs text-[var(--color-text-muted)] italic">{pan.nameOnPan}</td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center">
          <Badge color="emerald">Verified</Badge>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        {deletable && (
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsShareOpen(true)}
              className="p-1.5 text-[var(--color-text-faint)] hover:text-indigo-500 transition-colors"
              title="Share this PAN"
            >
              <Share2 size={14} />
            </button>
            <button
              onClick={() => { if (confirm("Delete card?")) deletePanCard(pan._id); }}
              className="p-1.5 text-[var(--color-text-faint)] hover:text-rose-500 transition-colors"
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
    <div key={pan._id} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold tracking-widest font-mono text-[var(--color-text-base)]">{pan.panNumber}</span>
          <span className="text-xs text-[var(--color-text-muted)] italic">{pan.nameOnPan}</span>
        </div>
        <Badge color="emerald">Verified</Badge>
      </div>
      {deletable && (
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-[var(--color-border)]">
          <button onClick={() => setIsShareOpen(true)} className="text-[var(--color-text-faint)] hover:text-indigo-500 transition-colors flex items-center gap-1.5 text-xs font-semibold">
            <Share2 size={14} /> Share
          </button>
          <button onClick={() => { if (confirm("Delete card?")) deletePanCard(pan._id); }} className="text-[var(--color-text-faint)] hover:text-rose-500 transition-colors flex items-center gap-1.5 text-xs font-semibold">
            <Trash2 size={14} /> Remove
          </button>
        </div>
      )}
    </div>
  );

  const tableEmpty = (msg) => (
    <tr><td colSpan="5" className="py-20 text-center text-xs text-[var(--color-text-faint)]">{msg}</td></tr>
  );

  return (
    <div className="bg-[var(--color-bg-page)] min-h-full p-4 md:p-8 transition-colors duration-300">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-base)]">PAN Manager</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 tracking-tight">
            {tab === "mine"
              ? `Verified Cards: ${panCards.length}`
              : `Shared with you: ${sharedPanCount} PAN${sharedPanCount !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tab === "mine" && (
            <>
              <button
                onClick={() => setIsShareOpen(true)}
                className="flex items-center gap-1.5 border border-indigo-500/40 text-indigo-400 text-xs font-medium px-4 py-2 rounded-lg hover:bg-indigo-500/10 transition-all"
              >
                <Share2 size={15} /> Share PAN
              </button>
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-1.5 bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-indigo-600 transition-all shadow-sm"
              >
                <Plus size={16} /> Add PAN Card
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── TABS ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-6">
        <Tab active={tab === "mine"} onClick={() => { setTab("mine"); setSearchQuery(""); }}>
          My PANs
        </Tab>
        <Tab active={tab === "shared"} onClick={() => { setTab("shared"); setSearchQuery(""); }} badge={sharedPanCount}>
          Shared PANs
        </Tab>
      </div>

      {/* ── MY PANs TAB ─────────────────────────────────────────────────── */}
      {tab === "mine" && (
        <>
          <OutgoingShares shares={outgoingShares} revokeShare={revokeShare} />

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

          {/* Desktop table */}
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
                {loading && filteredMine.length === 0
                  ? tableEmpty("Synchronizing data...")
                  : filteredMine.length === 0
                  ? tableEmpty("No identifiers found.")
                  : filteredMine.map((pan, i) => renderDesktopRow(pan, i, true))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-4">
            {loading && filteredMine.length === 0 ? (
              <div className="py-20 text-center text-xs text-[var(--color-text-faint)] bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl">Loading...</div>
            ) : filteredMine.length === 0 ? (
              <div className="py-20 text-center text-xs text-[var(--color-text-faint)] bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl">No identifiers found.</div>
            ) : filteredMine.map((pan) => renderMobileCard(pan, true))}
          </div>
        </>
      )}

      {/* ── SHARED PANs TAB ─────────────────────────────────────────────── */}
      {tab === "shared" && (
        <>
          {Object.keys(sharedGroups).length === 0 ? (
            <div className="py-24 text-center text-xs text-[var(--color-text-faint)] bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl">
              No one has shared PANs with you yet.
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {Object.values(sharedGroups).map(({ user, pans }) => {
                const firstName = user?.name?.split(" ")[0] || "Unknown";
                return (
                  <div key={user?._id} className="flex flex-col gap-3">
                    {/* Group header */}
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center text-xs font-black">
                        {firstName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text-base)]">{firstName}&apos;s PANs</p>
                        <p className="text-[10px] text-[var(--color-text-faint)]">{user?.email}</p>
                      </div>
                    </div>

                    {/* Desktop table for this group */}
                    <div className="hidden md:block bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-[var(--color-border)]">
                            <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)] w-12">#</th>
                            <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)]">PAN Number</th>
                            <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)]">Holder Name</th>
                            <th className="px-6 py-3 text-center text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-faint)]">Status</th>
                            <th className="px-6 py-3 w-16" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
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
