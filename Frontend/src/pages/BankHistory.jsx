import React, { useEffect, useState, useMemo } from "react";
import { useBankAccounts } from "../context/BankAccContext";
import { ArrowRight, History, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TYPE_OPTIONS = [
  { label: "All Types", value: "all" },
  { label: "Transfer", value: "transfer" },
  { label: "Self Update", value: "self_update" },
  { label: "Cash Deposit", value: "cash_deposit" },
];

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Reversed", value: "reversed" },
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "date_desc" },
  { label: "Oldest First", value: "date_asc" },
  { label: "Amount ↑", value: "amount_asc" },
  { label: "Amount ↓", value: "amount_desc" },
];

/* Small pill-style select */
const FilterSelect = ({ value, onChange, options }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-[#1f1f1f] border border-gray-700 text-white text-sm
                 pl-3 pr-8 py-2 rounded-xl cursor-pointer hover:bg-[#2a2a2a]
                 focus:outline-none focus:border-gray-500 transition-all duration-200"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-[#1f1f1f]">
          {o.label}
        </option>
      ))}
    </select>
    <ChevronDown
      size={13}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
    />
  </div>
);

const BankHistoryPage = () => {
  const { bankHistory, getBankHistory } = useBankAccounts();
  const navigate = useNavigate();

  // Filter state
  const [typeFilter, setTypeFilter]     = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy]             = useState("date_desc");

  useEffect(() => {
    getBankHistory();
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Derive filtered + sorted list
  const filtered = useMemo(() => {
    let list = bankHistory || [];

    if (typeFilter !== "all") {
      list = list.filter((h) => h.transactionType === typeFilter);
    }
    if (statusFilter === "active") {
      list = list.filter((h) => !h.reversed);
    } else if (statusFilter === "reversed") {
      list = list.filter((h) => h.reversed);
    }

    list = [...list].sort((a, b) => {
      if (sortBy === "date_desc") return new Date(b.date) - new Date(a.date);
      if (sortBy === "date_asc")  return new Date(a.date) - new Date(b.date);
      if (sortBy === "amount_asc")  return a.amount - b.amount;
      if (sortBy === "amount_desc") return b.amount - a.amount;
      return 0;
    });

    return list;
  }, [bankHistory, typeFilter, statusFilter, sortBy]);

  const hasActiveFilters =
    typeFilter !== "all" || statusFilter !== "all" || sortBy !== "date_desc";

  const resetFilters = () => {
    setTypeFilter("all");
    setStatusFilter("all");
    setSortBy("date_desc");
  };

  // Active chip labels for quick-clear display
  const activeChips = [];
  if (typeFilter !== "all")
    activeChips.push({ label: TYPE_OPTIONS.find((o) => o.value === typeFilter)?.label, clear: () => setTypeFilter("all") });
  if (statusFilter !== "all")
    activeChips.push({ label: STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label, clear: () => setStatusFilter("all") });
  if (sortBy !== "date_desc")
    activeChips.push({ label: SORT_OPTIONS.find((o) => o.value === sortBy)?.label, clear: () => setSortBy("date_desc") });

  return (
    <div className="bg-[#141414] rounded-tl-xl">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 px-4 md:p-6 md:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Transfer History</h1>
        <button
          onClick={() => navigate("/bankacc")}
          className="bg-[#1f1f1f] border border-gray-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full font-semibold hover:bg-[#2a2a2a] transition-all duration-200 flex items-center gap-2"
        >
          ← Back
        </button>
      </div>

      {/* FILTER BAR */}
      {bankHistory?.length > 0 && (
        <div className="px-8 pb-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-gray-500 mr-1">
              <SlidersHorizontal size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
            </div>

            <FilterSelect value={typeFilter}   onChange={setTypeFilter}   options={TYPE_OPTIONS}   />
            <FilterSelect value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
            <FilterSelect value={sortBy}       onChange={setSortBy}       options={SORT_OPTIONS}   />

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-2 rounded-xl transition-all duration-200"
              >
                <X size={12} /> Reset
              </button>
            )}
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeChips.map((chip) => (
                <span
                  key={chip.label}
                  className="flex items-center gap-1.5 text-xs bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full"
                >
                  {chip.label}
                  <button onClick={chip.clear} className="hover:text-white transition-colors">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EMPTY STATE — no data at all */}
      {bankHistory?.length === 0 && (
        <div className="flex flex-col items-center justify-center h-96 text-white">
          <div className="bg-white/10 rounded-full p-8 mb-4">
            <History size={64} className="opacity-50" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">No History Yet</h3>
          <p className="text-gray-500">Your transfer history will appear here</p>
        </div>
      )}

      {/* FILTERED EMPTY STATE */}
      {bankHistory?.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-white">
          <div className="bg-white/10 rounded-full p-6 mb-4">
            <SlidersHorizontal size={40} className="opacity-40" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No matching entries</h3>
          <p className="text-gray-500 text-sm mb-4">Try adjusting or resetting the filters</p>
          <button
            onClick={resetFilters}
            className="text-sm text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/10 px-4 py-2 rounded-xl transition-all duration-200"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* HISTORY LIST */}
      {filtered.length > 0 && (
        <div className="p-5 flex flex-col gap-3">
          {/* Result count */}
          <p className="text-gray-600 text-xs px-1">
            Showing {filtered.length} of {bankHistory?.length} entr{bankHistory?.length === 1 ? "y" : "ies"}
          </p>

          {/* DESKTOP HEADER */}
          <div className="hidden md:grid md:grid-cols-4 text-gray-500 text-sm font-medium px-5">
            <span>From</span>
            <span>To</span>
            <span>Amount</span>
            <span>Date</span>
          </div>

          {filtered.map((item) => (
            <div
              key={item._id}
              className={`text-white px-5 py-4 rounded-2xl
                         flex flex-col gap-3
                         md:grid md:grid-cols-4 md:items-center md:gap-0
                         transition-opacity duration-200
                         ${item.reversed ? "bg-[#1a1a1a] opacity-60" : "bg-[#1f1f1f]"}`}
            >
              {/* FROM */}
              <div className="flex justify-between md:block">
                <span className="text-gray-500 text-xs md:hidden">From</span>
                <div>
                  {item.transactionType === "self_update" ? (
                    <p className="font-medium text-gray-400 italic">Self Update</p>
                  ) : (
                    <p className="font-medium">{item.from?.nickname || "—"}</p>
                  )}
                  <p className="text-gray-500 text-xs">{item.from?.bank}</p>
                </div>
              </div>

              {/* TO */}
              <div className="flex justify-between md:block">
                <span className="text-gray-500 text-xs md:hidden">To</span>
                <div className="flex items-center gap-2">
                  <ArrowRight size={14} className="text-gray-600 hidden md:block" />
                  <div>
                    <p className="font-medium">{item.to?.nickname || "—"}</p>
                    <p className="text-gray-500 text-xs">{item.to?.bank}</p>
                  </div>
                </div>
              </div>

              {/* AMOUNT */}
              <div className="flex justify-between md:block">
                <span className="text-gray-500 text-xs md:hidden">Amount</span>
                <div className="flex items-center gap-2">
                  <p className={`font-bold text-lg ${item.reversed ? "line-through text-gray-500" : "text-green-400"}`}>
                    ₹{item.amount?.toLocaleString("en-IN")}
                  </p>
                  {item.reversed && (
                    <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">Reversed</span>
                  )}
                </div>
              </div>

              {/* DATE */}
              <div className="flex justify-between md:block">
                <span className="text-gray-500 text-xs md:hidden">Date</span>
                <p className="text-gray-400 text-sm">{formatDate(item.date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BankHistoryPage;
