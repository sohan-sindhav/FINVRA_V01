import React, { useEffect, useState } from "react";
import { ArrowRight, RotateCcw, ArrowLeft, AlertCircle , History , CheckCircle  } from "lucide-react";
import { useBankAccounts } from "../context/BankAccContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../configs/AxiosInstance";
import Modal, { ModalFooter, CancelBtn, ConfirmBtn } from "../components/Modal.jsx";
import { motion } from "framer-motion";



const BankReverseEntriesPage = () => {
  const { bankHistory, getBankHistory, reverseBankHistory } = useBankAccounts();
  const navigate = useNavigate();

  // Modal state
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [reversing, setReversing] = useState(false);

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

  const handleConfirmReverse = async () => {
    if (!selectedEntry) return;
    setReversing(true);
    await reverseBankHistory(selectedEntry._id);
    setReversing(false);
    setSelectedEntry(null);
  };

  const activeEntries = bankHistory?.filter((h) => !h.reversed && h.transactionType !== "self_update") || [];
  const reversedEntries = bankHistory?.filter((h) => h.reversed && h.transactionType !== "self_update") || [];

  return (
    <div className="bg-[#141414] rounded-tl-xl min-h-full">
      {/* HEADER */}
      <div className="flex justify-between items-center p-6 px-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Reverse Entries</h1>
          <p className="text-gray-500 text-sm mt-1">
            Internal bank-to-bank transfers
          </p>
        </div>
        <button
          onClick={() => navigate("/bankacc")}
          className="bg-[#1f1f1f] border border-gray-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full font-semibold hover:bg-[#2a2a2a] transition-all duration-200 flex items-center gap-2"
        >
          ← Back
        </button>
      </div>

      {/* CONFIRMATION MODAL */}
      <Modal
        open={!!selectedEntry}
        onClose={() => !reversing && setSelectedEntry(null)}
        title="Reverse This Transfer?"
        maxWidth="max-w-md"
      >
        {selectedEntry && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-400">
              This will send{" "}
              <span className="text-white font-semibold">₹{selectedEntry.amount?.toLocaleString("en-IN")}</span>{" "}
              back from{" "}
              <span className="text-emerald-400 font-semibold">{selectedEntry.to?.nickname}</span>{" → "}
              <span className="text-indigo-400 font-semibold">{selectedEntry.from?.nickname}</span>.
              This cannot be undone.
            </p>
            {/* Entry preview */}
            <div className="bg-[#2a2a2a] rounded-xl p-4 flex items-center justify-between text-sm">
              <div className="text-center">
                <p className="font-semibold text-white">{selectedEntry.to?.nickname}</p>
                <p className="text-gray-500 text-xs">{selectedEntry.to?.bank}</p>
              </div>
              <ArrowRight size={16} className="text-gray-600" />
              <div className="text-center">
                <p className="font-semibold text-white">{selectedEntry.from?.nickname}</p>
                <p className="text-gray-500 text-xs">{selectedEntry.from?.bank}</p>
              </div>
              <p className="font-bold text-emerald-400">₹{selectedEntry.amount?.toLocaleString("en-IN")}</p>
            </div>
            <ModalFooter>
              <CancelBtn onClick={() => setSelectedEntry(null)} disabled={reversing} />
              <ConfirmBtn variant="warning" onClick={handleConfirmReverse} disabled={reversing} loading={reversing}>
                {reversing ? "Reversing…" : "Confirm Reverse"}
              </ConfirmBtn>
            </ModalFooter>
          </div>
        )}
      </Modal>

      {/* EMPTY STATE */}
      {(!bankHistory || bankHistory.length === 0) && (
        <div className="flex flex-col items-center justify-center h-96 text-white">
          <div className="bg-white/10 rounded-full p-8 mb-4">
            <History size={64} className="opacity-50" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">No Internal Transfers</h3>
          <p className="text-gray-500">
            Use "Send" on a bank account to transfer between your accounts
          </p>
        </div>
      )}

      {/* ACTIVE ENTRIES */}
      {activeEntries.length > 0 && (
        <div className="px-5 pb-2">
          <div className="flex items-center gap-2 px-3 mb-3">
            <AlertCircle size={14} className="text-yellow-400" />
            <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">
              Pending Reversal ({activeEntries.length})
            </p>
          </div>

          {/* Desktop header */}
          <div className="hidden md:grid md:grid-cols-5 text-gray-500 text-sm font-medium px-5 mb-2">
            <span>From</span>
            <span>To</span>
            <span>Amount</span>
            <span>Date</span>
            <span>Action</span>
          </div>

          <div className="flex flex-col gap-2">
            {activeEntries.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-[#1f1f1f] text-white px-5 py-4 rounded-2xl
                           flex flex-col gap-3
                           md:grid md:grid-cols-5 md:items-center md:gap-0"
              >
                <div className="flex justify-between md:block">
                  <span className="text-gray-500 text-xs md:hidden">From</span>
                  <div>
                    <p className="font-medium">{item.to?.nickname || "—"}</p>
                    <p className="text-gray-500 text-xs">{item.to?.bank}</p>
                  </div>
                </div>

                <div className="flex justify-between md:block">
                  <span className="text-gray-500 text-xs md:hidden">To</span>
                  <div className="flex items-center gap-2">
                    <ArrowRight size={14} className="text-gray-600 hidden md:block" />
                    <div>
                      <p className="font-medium">{item.from?.nickname || "—"}</p>
                      <p className="text-gray-500 text-xs">{item.from?.bank}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between md:block">
                  <span className="text-gray-500 text-xs md:hidden">Amount</span>
                  <p className="text-emerald-400 font-bold text-lg">
                    ₹{item.amount?.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex justify-between md:block">
                  <span className="text-gray-500 text-xs md:hidden">Date</span>
                  <p className="text-gray-400 text-sm">{formatDate(item.date)}</p>
                </div>

                <div>
                  <button
                    onClick={() => setSelectedEntry(item)}
                    className="w-full md:w-fit text-yellow-400 hover:text-yellow-300 text-sm px-3 py-1.5 rounded-lg border border-yellow-500/30 hover:bg-yellow-500/10 transition-all duration-200 flex items-center gap-1.5"
                  >
                    <RotateCcw size={13} /> Reverse
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* REVERSED ENTRIES */}
      {reversedEntries.length > 0 && (
        <div className="px-5 pt-4 pb-6">
          <div className="flex items-center gap-2 px-3 mb-3">
            <CheckCircle size={14} className="text-gray-600" />
            <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider">
              Already Reversed ({reversedEntries.length})
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {reversedEntries.map((item, i) => (
              <div
                key={item._id}
                className="bg-[#1a1a1a] text-white px-5 py-4 rounded-2xl opacity-50
                           flex flex-col gap-3
                           md:grid md:grid-cols-5 md:items-center md:gap-0"
              >
                <div className="flex justify-between md:block">
                  <span className="text-gray-500 text-xs md:hidden">From</span>
                  <div>
                    <p className="font-medium line-through text-gray-500">{item.from?.nickname || "—"}</p>
                    <p className="text-gray-600 text-xs">{item.from?.bank}</p>
                  </div>
                </div>

                <div className="flex justify-between md:block">
                  <span className="text-gray-500 text-xs md:hidden">To</span>
                  <div className="flex items-center gap-2">
                    <ArrowRight size={14} className="text-gray-700 hidden md:block" />
                    <div>
                      <p className="font-medium line-through text-gray-500">{item.to?.nickname || "—"}</p>
                      <p className="text-gray-600 text-xs">{item.to?.bank}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between md:block">
                  <span className="text-gray-500 text-xs md:hidden">Amount</span>
                  <p className="text-gray-600 font-bold text-lg line-through">
                    ₹{item.amount?.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex justify-between md:block">
                  <span className="text-gray-500 text-xs md:hidden">Date</span>
                  <p className="text-gray-600 text-sm">{formatDate(item.date)}</p>
                </div>

                <div>
                  <span className="text-gray-600 text-xs px-3 py-1.5 rounded-lg border border-gray-700 flex items-center gap-1.5 w-fit">
                    <CheckCircle size={12} /> Reversed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BankReverseEntriesPage;
