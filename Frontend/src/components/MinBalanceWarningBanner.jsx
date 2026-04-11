import React, { useState, useContext } from "react";
import { AlertTriangle, X, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { BankAccContext } from "../context/BankAccContext";
import { useNavigate } from "react-router-dom";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const daysSince = (dateStr) => {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / MS_PER_DAY);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const MinBalanceWarningBanner = () => {
  const { minBalanceWarnings } = useContext(BankAccContext);
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (dismissed || minBalanceWarnings.length === 0) return null;

  const count = minBalanceWarnings.length;

  return (
    <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 overflow-hidden">
      {/* ── Header row ── */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Pulse dot + icon */}
        <div className="relative flex-shrink-0">
          <span className="absolute inset-0 rounded-full bg-amber-500 opacity-30 animate-ping" />
          <span className="relative flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/15 text-amber-500">
            <AlertTriangle size={14} />
          </span>
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-500 leading-tight">
            {count === 1
              ? `1 account below minimum balance for 10+ days`
              : `${count} accounts below minimum balance for 10+ days`}
          </p>
          <p className="text-[11px] text-amber-500/70 mt-0.5">
            Charges may apply. Top up to avoid penalties.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-lg text-amber-500/60 hover:text-amber-500 hover:bg-amber-500/10 transition-all"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-amber-500/60 hover:text-amber-500 hover:bg-amber-500/10 transition-all"
            title="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ── Expandable account list ── */}
      {expanded && (
        <div className="border-t border-amber-500/20 divide-y divide-amber-500/10">
          {minBalanceWarnings.map((acc) => {
            const days = daysSince(acc.minBalanceBreachSince);
            const deficit = (acc.minimumBalance || 0) - (acc.balance || 0);
            return (
              <div
                key={acc._id}
                className="flex items-center justify-between px-4 py-3 gap-3"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-[var(--color-text-base)] truncate">
                    {acc.nickname}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-faint)] mt-0.5">
                    {acc.bank} · Below min since {formatDate(acc.minBalanceBreachSince)}
                  </span>
                </div>

                <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                  <span className="text-xs font-bold text-rose-500">
                    −₹{deficit.toLocaleString("en-IN")} short
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                    {days} day{days !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Footer CTA */}
          <div className="px-4 py-2.5 flex justify-end">
            <button
              onClick={() => navigate("/bankacc")}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-500 hover:text-amber-400 transition-colors"
            >
              Go to Bank Accounts <ExternalLink size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinBalanceWarningBanner;
