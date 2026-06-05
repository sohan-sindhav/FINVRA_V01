import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePan } from "../context/PanContext";
import { useBankAccounts } from "../context/BankAccContext";
import { useIPO } from "../context/IPOContext";
import {
  X, Check, AlertCircle, Loader2, ChevronDown, Smartphone, Landmark, RotateCcw
} from "lucide-react";

// ─── Preset funding methods ────────────────────────────────────────────────
const PRESET_METHODS = ["Net Banking", "Mandate", "UPI", "ASBA"];

// ─── Funding Account Cell ──────────────────────────────────────────────────
const FundingCell = ({ bankAccounts, value, onChange, minAmount, usageCounts }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = bankAccounts.find(b => b._id === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded-lg border transition-all w-full max-w-[160px] ${
          selected
            ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
            : "border-white/10 bg-white/[0.03] text-white/30 hover:border-white/20"
        }`}
      >
        <span className="truncate flex-1 text-left">
          {selected ? selected.nickname : "— Select —"}
        </span>
        <ChevronDown size={11} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.1 }}
            className="absolute left-0 top-full mt-1 z-[10000] bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl min-w-[200px] overflow-hidden"
          >
            {bankAccounts.length === 0 ? (
              <p className="text-[11px] text-white/40 px-3 py-3">No bank accounts found.</p>
            ) : (
              bankAccounts.map(acc => {
                const usageCount = usageCounts[acc._id] || 0;
                // Subtract what other rows in this grid have already claimed from this bank
                const adjustedBalance = acc.balance - usageCount * minAmount;
                const insufficient = adjustedBalance < minAmount;
                const isCurrent = acc._id === value;
                return (
                  <button
                    key={acc._id}
                    type="button"
                    disabled={insufficient && !isCurrent}
                    onClick={() => { onChange(acc._id); setOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors gap-3 ${
                      insufficient && !isCurrent
                        ? "opacity-40 cursor-not-allowed"
                        : isCurrent
                        ? "bg-indigo-500/15"
                        : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className={`text-[12px] font-semibold truncate ${isCurrent ? "text-indigo-300" : "text-white/80"}`}>
                        {acc.nickname}
                      </span>
                      <span className={`text-[10px] ${insufficient ? "text-rose-400" : "text-white/30"}`}>
                        ₹{adjustedBalance.toLocaleString("en-IN")} avail.
                        {insufficient ? " — Insufficient" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {usageCount > 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400">
                          {usageCount} PAN{usageCount !== 1 ? "s" : ""}
                        </span>
                      )}
                      {isCurrent && <Check size={11} className="text-indigo-400" />}
                    </div>
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Funding Method Cell ───────────────────────────────────────────────────
const MethodCell = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(value ? !PRESET_METHODS.includes(value) : false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (isCustom) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type method..."
          autoFocus
          className="text-[12px] bg-white/[0.04] border border-white/10 text-white/80 rounded-lg px-2.5 py-1.5 w-[130px] focus:outline-none focus:border-indigo-500/50 placeholder:text-white/20"
        />
        <button
          type="button"
          onClick={() => { setIsCustom(false); onChange(""); }}
          className="text-white/30 hover:text-white/60 transition-colors"
        >
          <X size={11} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded-lg border transition-all w-full max-w-[140px] ${
          value
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            : "border-white/10 bg-white/[0.03] text-white/30 hover:border-white/20"
        }`}
      >
        <span className="truncate flex-1 text-left">{value || "— Select —"}</span>
        <ChevronDown size={11} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.1 }}
            className="absolute left-0 top-full mt-1 z-[10000] bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl min-w-[160px] overflow-hidden"
          >
            {PRESET_METHODS.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { onChange(m); setOpen(false); }}
                className={`w-full text-left px-3 py-2.5 text-[12px] font-medium transition-colors flex items-center justify-between ${
                  value === m ? "bg-emerald-500/15 text-emerald-300" : "text-white/70 hover:bg-white/[0.04]"
                }`}
              >
                {m}
                {value === m && <Check size={11} />}
              </button>
            ))}
            <div className="border-t border-white/[0.06] mt-1">
              <button
                type="button"
                onClick={() => { setIsCustom(true); onChange(""); setOpen(false); }}
                className="w-full text-left px-3 py-2.5 text-[11px] font-bold text-indigo-400 hover:bg-indigo-500/10 transition-colors uppercase tracking-wider"
              >
                Custom...
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Grid Component ───────────────────────────────────────────────────
const IPOApplyGrid = ({ open, onClose, ipo }) => {
  const { panCards, getPanCards } = usePan();
  const { bankAccounts, getBankAcc } = useBankAccounts();
  const { applyForIPO, applications, cancelApplication } = useIPO();

  // rows: { panId, checked, bankAccId, fundingMethod, device, alreadyApplied, appId, appBankNickname, appFundingMethod }
  const [rows, setRows] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reversingId, setReversingId] = useState(null);
  const [error, setError] = useState(null);
  const prevIpoIdRef = useRef(null);

  useEffect(() => {
    if (!ipo) return;
    const isNewIpo = prevIpoIdRef.current !== ipo._id;
    prevIpoIdRef.current = ipo._id;

    const getApp = (panId) => applications.find(a =>
      (a.ipo?._id || a.ipo) === ipo._id &&
      (a.pan?._id || a.pan) === panId
    );

    if (isNewIpo) {
      setError(null);
      setIsSubmitting(false);
      setRows(panCards.map(pan => {
        const app = getApp(pan._id);
        return {
          panId: pan._id,
          checked: !app,
          bankAccId: pan.lastUsedBankAcc || "",
          fundingMethod: pan.lastFundingMethod || "",
          device: pan.loggedInDevice || "",
          alreadyApplied: !!app,
          appId: app?._id || null,
          appBankNickname: app?.bankAcc?.nickname || "",
          appFundingMethod: app?.fundingMethod || "",
        };
      }));
    } else {
      // Merge: preserve user's selections, only update applied status
      setRows(prev => prev.map(row => {
        const app = getApp(row.panId);
        const wasApplied = row.alreadyApplied;
        const isNowApplied = !!app;
        return {
          ...row,
          alreadyApplied: isNowApplied,
          appId: app?._id || null,
          appBankNickname: app?.bankAcc?.nickname || "",
          appFundingMethod: app?.fundingMethod || "",
          checked: isNowApplied ? false : (wasApplied && !isNowApplied ? true : row.checked),
        };
      }));
    }
  }, [ipo?._id, applications, panCards]);

  if (!ipo || typeof document === "undefined") return null;

  const updateRow = (panId, field, val) =>
    setRows(prev => prev.map(r => r.panId === panId ? { ...r, [field]: val } : r));

  const pendingRows = rows.filter(r => !r.alreadyApplied);
  const checkedRows = rows.filter(r => r.checked && !r.alreadyApplied);
  const allChecked = pendingRows.length > 0 && checkedRows.length === pendingRows.length;
  const minPrice = ipo?.minimum_retail_price || 0;
  const total = checkedRows.length * minPrice;

  const usageCounts = {};
  checkedRows.forEach(r => {
    if (r.bankAccId) usageCounts[r.bankAccId] = (usageCounts[r.bankAccId] || 0) + 1;
  });

  const handleReverse = async (appId) => {
    if (!confirm("Reverse this application? Blocked funds will be released.")) return;
    setReversingId(appId);
    const result = await cancelApplication(appId);
    if (!result.success) setError(result.message);
    await getBankAcc();
    setReversingId(null);
  };

  const handleConfirm = async () => {
    setError(null);
    const unassigned = checkedRows.find(r => !r.bankAccId);
    if (unassigned) {
      const pan = panCards.find(p => p._id === unassigned.panId);
      setError(`Please select a funding account for ${pan?.nameOnPan || "one of the PANs"}.`);
      return;
    }
    if (checkedRows.length === 0) {
      setError("Select at least one PAN to apply.");
      return;
    }

    setIsSubmitting(true);
    const apps = checkedRows.map(r => ({
      panId: r.panId,
      bankAccId: r.bankAccId,
      fundingMethod: r.fundingMethod,
      loggedInDevice: r.device,
    }));

    const result = await applyForIPO(ipo._id, apps);
    if (result.success) {
      await getBankAcc();
      await getPanCards(); // refresh lastFundingMethod + loggedInDevice
      onClose();
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4"
        >
          <motion.div
            key="panel"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.14 }}
            onClick={e => e.stopPropagation()}
            className="bg-[#0f0f1a] border border-white/[0.08] rounded-2xl w-full max-w-5xl overflow-hidden text-white flex flex-col max-h-[90vh] shadow-2xl"
          >
            {/* ── Header ── */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.06] shrink-0">
              <div>
                <h2 className="font-bold text-[15px] tracking-tight">Apply: {ipo?.companyname}</h2>
                <p className="text-[11px] text-white/40 mt-0.5 font-medium uppercase tracking-wider">
                  Min. block per account: ₹{minPrice.toLocaleString("en-IN")}
                </p>
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1.5">
                <X size={16} />
              </button>
            </div>

            {/* ── Error ── */}
            {error && (
              <div className="mx-6 mt-4 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-[12px] leading-relaxed shrink-0">
                <AlertCircle size={13} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {/* ── Table ── */}
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse min-w-[820px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#0f0f1a] border-b border-white/[0.06]">
                    {/* Checkbox — only toggles non-applied rows */}
                    <th className="px-4 py-3 w-10">
                      <button
                        type="button"
                        onClick={() => setRows(prev => prev.map(r =>
                          r.alreadyApplied ? r : { ...r, checked: !allChecked }
                        ))}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          allChecked ? "bg-indigo-500 border-indigo-500" : "border-white/20 bg-transparent"
                        }`}
                      >
                        {allChecked && <Check size={10} strokeWidth={3} />}
                      </button>
                    </th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30 w-8">#</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">Name</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">PAN</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">Broker</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">Funding Account</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">Funding Method</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">Device</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {panCards.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-16 text-center text-[12px] text-white/30">
                        No PAN cards found. Add some in PAN Manager first.
                      </td>
                    </tr>
                  ) : (
                    panCards.map((pan, i) => {
                      const row = rows.find(r => r.panId === pan._id);
                      if (!row) return null;

                      // ── Already-applied row ──────────────────────────────
                      if (row.alreadyApplied) {
                        const isReversing = reversingId === row.appId;
                        return (
                          <tr key={pan._id} className="bg-emerald-500/[0.04] border-l-2 border-l-emerald-500/30">
                            {/* Applied badge */}
                            <td className="px-4 py-3">
                              <span className="flex items-center justify-center w-4 h-4 rounded bg-emerald-500/20">
                                <Check size={9} className="text-emerald-400" strokeWidth={3} />
                              </span>
                            </td>
                            <td className="px-3 py-3 text-[12px] text-white/25 tabular-nums">{i + 1}</td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-white/60">{pan.nameOnPan}</span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 uppercase tracking-wider">Applied</span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <span className="text-[11px] font-mono tracking-widest text-white/30">{pan.panNumber}</span>
                            </td>
                            <td className="px-3 py-3">
                              <span className="text-[12px] text-white/20 italic">{pan.broker || "—"}</span>
                            </td>
                            <td className="px-3 py-3">
                              <span className="text-[12px] text-emerald-400/70">{row.appBankNickname || "—"}</span>
                            </td>
                            <td className="px-3 py-3">
                              <span className="text-[12px] text-white/30 italic">{row.appFundingMethod || "—"}</span>
                            </td>
                            <td className="px-3 py-3">
                              <button
                                type="button"
                                onClick={() => handleReverse(row.appId)}
                                disabled={isReversing}
                                className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-40"
                              >
                                {isReversing
                                  ? <><RotateCcw size={11} className="animate-spin" /> Reversing...</>
                                  : <><RotateCcw size={11} /> Reverse</>}
                              </button>
                            </td>
                          </tr>
                        );
                      }

                      // ── Normal pending row ───────────────────────────────
                      return (
                        <tr
                          key={pan._id}
                          className={`transition-colors ${
                            row.checked
                              ? "bg-white/[0.015] hover:bg-white/[0.025]"
                              : "opacity-40 hover:opacity-60 bg-transparent"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => updateRow(pan._id, "checked", !row.checked)}
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                row.checked ? "bg-indigo-500 border-indigo-500" : "border-white/20"
                              }`}
                            >
                              {row.checked && <Check size={10} strokeWidth={3} />}
                            </button>
                          </td>
                          <td className="px-3 py-3 text-[12px] text-white/25 tabular-nums">{i + 1}</td>
                          <td className="px-3 py-3">
                            <span className="text-[13px] font-semibold text-white/80">{pan.nameOnPan}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-[11px] font-mono tracking-widest text-white/40">{pan.panNumber}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-[12px] text-white/30 italic">
                              {pan.broker || <span className="text-white/15">—</span>}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <FundingCell
                              bankAccounts={bankAccounts}
                              value={row.bankAccId}
                              onChange={val => updateRow(pan._id, "bankAccId", val)}
                              minAmount={minPrice}
                              usageCounts={(() => {
                                const counts = {};
                                checkedRows.filter(r => r.panId !== pan._id)
                                  .forEach(r => { if (r.bankAccId) counts[r.bankAccId] = (counts[r.bankAccId] || 0) + 1; });
                                return counts;
                              })()}
                            />
                          </td>
                          <td className="px-3 py-3">
                            <MethodCell value={row.fundingMethod} onChange={val => updateRow(pan._id, "fundingMethod", val)} />
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5">
                              <Smartphone size={11} className="text-white/20 shrink-0" />
                              <input
                                type="text"
                                value={row.device}
                                onChange={e => updateRow(pan._id, "device", e.target.value)}
                                placeholder="e.g. iPhone 15"
                                className="text-[12px] bg-transparent border-b border-white/10 text-white/70 w-[110px] focus:outline-none focus:border-indigo-500/50 placeholder:text-white/15 transition-colors pb-0.5"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Sticky footer ── */}
            <div className="shrink-0 border-t border-white/[0.06] px-6 py-4 flex items-center justify-between gap-4 bg-[#0f0f1a]">
              {/* Summary */}
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <Landmark size={14} className="text-white/30" />
                  <span className="text-[12px] text-white/50">
                    <span className="text-white font-bold">{checkedRows.length}</span>
                    {" "}account{checkedRows.length !== 1 ? "s" : ""} selected
                  </span>
                </div>
                {checkedRows.length > 0 && (
                  <div className="text-[12px] text-white/50">
                    Total block:{" "}
                    <span className="text-emerald-400 font-bold">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-[12px] font-bold text-white/40 hover:text-white/70 transition-colors disabled:opacity-30"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting || checkedRows.length === 0}
                  className="flex items-center gap-2 bg-green-500 text-black font-black px-6 py-2.5 rounded-xl text-[13px] hover:bg-green-400 transition-all disabled:bg-green-900 disabled:text-green-200 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <><Loader2 size={14} className="animate-spin" /> Processing...</>
                  ) : (
                    <>Confirm &amp; Block Funds</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default IPOApplyGrid;
