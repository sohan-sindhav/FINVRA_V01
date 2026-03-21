import React, { useState } from "react";
import { RotateCcw, ArrowLeft, History, CheckCircle, ArrowRight, User, Landmark } from "lucide-react";
import { useTransactions } from "../context/TransactionContext";
import { useBankAccounts } from "../context/BankAccContext";
import { useNavigate } from "react-router-dom";
import Modal, { ModalFooter, CancelBtn, ConfirmBtn } from "../components/Modal.jsx";
import { motion } from "framer-motion";

const TransactionReversePage = () => {
  const { transactions, reverseTransaction } = useTransactions();
  const { updateBalance, getBankAcc } = useBankAccounts();
  const navigate = useNavigate();

  const [selectedEntry, setSelectedEntry] = useState(null);
  const [reversing, setReversing] = useState(false);
  const [error, setError] = useState("");

  const handleConfirmReverse = async () => {
    if (!selectedEntry) return;
    setReversing(true);
    setError("");

    // 1. Rollback the balance in the bank account (subtract what was added)
    const result = await updateBalance({ balance: -Number(selectedEntry.amount) }, selectedEntry.to?._id);
    
    if (!result.success) {
      setError(result.error || "Failed to adjust bank balance");
      setReversing(false);
      return;
    }

    // 2. Mark the transaction as reversed
    await reverseTransaction(selectedEntry._id);
    
    // 3. Refresh global bank state
    await getBankAcc();

    setReversing(false);
    setSelectedEntry(null);
  };

  const activeEntries = transactions.filter((t) => !t.reversed);
  const reversedEntries = transactions.filter((t) => t.reversed);

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

  return (
    <div className="bg-[#0a0a0a] min-h-full">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center p-6 px-4 md:p-8 md:px-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Reverse Transactions</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase font-black tracking-widest">
            External funds to bank reversal
          </p>
        </div>
        <button
          onClick={() => navigate("/profile")}
          className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Back to Profile
        </button>
      </div>

      <div className="px-10 pb-20">
        
        {/* CONFIRMATION MODAL */}
        <Modal
          open={!!selectedEntry}
          onClose={() => !reversing && setSelectedEntry(null)}
          title="Confirm Transaction Reversal"
          maxWidth="max-w-md"
        >
          {selectedEntry && (
            <div className="flex flex-col gap-5 mt-2">
              <p className="text-sm text-gray-400 leading-relaxed">
                You are about to reverse a payment of{" "}
                <span className="text-white font-bold">₹{selectedEntry.amount?.toLocaleString("en-IN")}</span>. 
                This will deduct the amount from your <span className="text-indigo-400 font-bold">{selectedEntry.to?.nickname}</span> account.
              </p>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">
                  {error}
                </div>
              )}

              <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400">
                        <User size={14} />
                      </div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Sender</span>
                   </div>
                   <span className="text-white font-black uppercase text-xs tracking-widest">{selectedEntry.from?.name}</span>
                </div>
                
                <div className="flex items-center justify-center py-1 opacity-20">
                   <ArrowRight size={20} className="rotate-90" />
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Landmark size={14} />
                      </div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Recipient Account</span>
                   </div>
                   <span className="text-white font-black uppercase text-xs tracking-widest">{selectedEntry.to?.nickname}</span>
                </div>
              </div>

              <ModalFooter>
                <CancelBtn onClick={() => setSelectedEntry(null)} disabled={reversing} />
                <ConfirmBtn variant="warning" onClick={handleConfirmReverse} disabled={reversing} loading={reversing}>
                  {reversing ? "Reversing..." : "Execute Reversal"}
                </ConfirmBtn>
              </ModalFooter>
            </div>
          )}
        </Modal>

        {/* ACTIVE TRANSACTIONS LIST */}
        <div className="flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <History size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider">Eligible for Reversal</h2>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{activeEntries.length} Pending Reversals</p>
              </div>
            </div>

            {activeEntries.length === 0 ? (
              <div className="bg-[#141414] border border-dashed border-white/10 rounded-[32px] py-20 flex flex-col items-center justify-center gap-4">
                 <CheckCircle size={40} className="text-gray-800" />
                 <p className="text-gray-500 font-black text-xs uppercase tracking-widest">All transactions are final</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeEntries.map((item, i) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-[#141414] border border-white/5 rounded-[32px] p-6 group hover:border-amber-500/30 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">From Connection</span>
                        <p className="text-lg font-black text-white uppercase tracking-tight">{item.from?.name}</p>
                      </div>
                      <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-500">
                        <History size={18} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 mb-8">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 font-bold uppercase text-[10px] tracking-widest">Amount</span>
                          <span className="text-white font-black text-xl">₹{item.amount?.toLocaleString("en-IN")}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 font-bold uppercase text-[10px] tracking-widest">Target Bank</span>
                          <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">{item.to?.nickname}</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px]">
                          <span className="text-gray-600 font-bold uppercase tracking-widest">Recorded On</span>
                          <span className="text-gray-600 font-mono italic">{formatDate(item.createdAt || item.date)}</span>
                       </div>
                    </div>

                    <button
                      onClick={() => setSelectedEntry(item)}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-500 transition-all duration-300"
                    >
                      <RotateCcw size={14} className="group-hover:rotate-12 transition-transform" />
                      Reverse Entry
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* REVERSED HISTORY SECTION */}
          {reversedEntries.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-6 opacity-40">
                 <CheckCircle size={20} className="text-white" />
                 <h2 className="text-lg font-black text-white uppercase tracking-wider">Reversed Archive</h2>
              </div>
              <div className="bg-[#141414] border border-white/5 rounded-[32px] overflow-hidden divide-y divide-white/5">
                 {reversedEntries.map((item) => (
                    <div key={item._id} className="p-6 px-8 flex justify-between items-center opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="text-gray-600 italic font-mono text-xs">{formatDate(item.updatedAt || item.date)}</div>
                          <div>
                             <p className="text-white font-black text-sm uppercase tracking-widest">{item.from?.name}</p>
                             <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">To {item.to?.nickname}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-10">
                          <span className="text-gray-400 line-through font-black text-lg font-mono">₹{item.amount?.toLocaleString("en-IN")}</span>
                          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                             <CheckCircle size={12} />
                             Reversed
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionReversePage;
