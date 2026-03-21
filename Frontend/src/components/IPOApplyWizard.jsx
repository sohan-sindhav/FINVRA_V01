import React, { useState, useEffect } from "react";
import { usePan } from "../context/PanContext";
import { useBankAccounts } from "../context/BankAccContext";
import { useIPO } from "../context/IPOContext";
import Modal, {
  ModalFooter,
  CancelBtn,
  ConfirmBtn,
  modalSelectCls,
} from "../components/Modal";
import { Check, ChevronRight, CreditCard, Landmark, Loader2, AlertCircle } from "lucide-react";

const IPOApplyWizard = ({ open, onClose, ipo }) => {
  const { panCards } = usePan();
  const { bankAccounts, getBankAcc } = useBankAccounts();
  const { applyForIPO } = useIPO();
  const [step, setStep] = useState(1);
  const [selectedPanIds, setSelectedPanIds] = useState([]);
  const [panBankMapping, setPanBankMapping] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize selection
  useEffect(() => {
    if (open && ipo) {
      setStep(1);
      setSelectedPanIds([]);
      setPanBankMapping({});
      setError(null);
    }
  }, [open, ipo]);

  if (!ipo) return null;

  const handleTogglePan = (id) => {
    setSelectedPanIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPanIds.length === panCards.length) {
      setSelectedPanIds([]);
    } else {
      setSelectedPanIds(panCards.map(p => p._id));
    }
  };

  const goToStep2 = () => {
    if (selectedPanIds.length === 0) return;
    
    // Auto-map last used bank accounts
    const initialMapping = {};
    selectedPanIds.forEach(panId => {
      const pan = panCards.find(p => p._id === panId);
      // Default to lastUsedBankAcc if it exists and is still valid, else empty
      initialMapping[panId] = pan.lastUsedBankAcc || "";
    });
    setPanBankMapping(initialMapping);
    setStep(2);
  };

  const handleConfirm = async () => {
    // Validate all PANs have a bank assigned
    const unassigned = selectedPanIds.some(pid => !panBankMapping[pid]);
    if (unassigned) {
      setError("Please assign a bank account for all selected PAN cards.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const apps = selectedPanIds.map(pid => ({
      panId: pid,
      bankAccId: panBankMapping[pid]
    }));

    const result = await applyForIPO(ipo._id, apps);
    
    if (result.success) {
      await getBankAcc(); // Refresh balances
      onClose();
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  const totalAmount = selectedPanIds.length * (ipo?.minimum_retail_price || 0);

  return (
    <Modal open={open} onClose={onClose} title={`Apply: ${ipo?.companyname}`} maxWidth="max-w-lg">
      <div className="flex flex-col gap-5 mt-2">
        
        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${step >= i ? "w-8 bg-white" : "w-4 bg-gray-800"}`} />
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs leading-relaxed">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* STEP 1: SELECT PAN CARDS */}
        {step === 1 && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select PAN Accounts</span>
              <button onClick={handleSelectAll} className="text-[11px] font-bold text-blue-400 hover:text-blue-300">
                {selectedPanIds.length === panCards.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-2 custom-scrollbar">
              {panCards.map(pan => {
                const isSelected = selectedPanIds.includes(pan._id);
                return (
                  <div 
                    key={pan._id}
                    onClick={() => handleTogglePan(pan._id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected ? "bg-white/5 border-white/20" : "bg-[#1a1a1a] border-gray-800/50 hover:border-gray-700"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isSelected ? "bg-blue-500 border-blue-500" : "bg-transparent border-gray-700"
                    }`}>
                      {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{pan.nameOnPan}</p>
                      <p className="text-[10px] text-gray-500 font-mono tracking-wider">{pan.panNumber}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <ModalFooter>
              <CancelBtn onClick={onClose} />
              <button 
                onClick={goToStep2}
                disabled={selectedPanIds.length === 0}
                className="flex-1 bg-white text-black font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 disabled:opacity-30"
              >
                Next Step <ChevronRight size={16} />
              </button>
            </ModalFooter>
          </div>
        )}

        {/* STEP 2: ASSIGN BANK ACCOUNTS */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Configure Bank Accounts</span>
            
            <div className="max-h-[320px] overflow-y-auto pr-1 flex flex-col gap-4 custom-scrollbar">
              {selectedPanIds.map(pid => {
                const pan = panCards.find(p => p._id === pid);
                return (
                  <div key={pid} className="bg-[#1a1a1a] border border-gray-800/80 p-3.5 rounded-xl flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-gray-500" />
                      <span className="text-sm font-bold text-white">{pan.nameOnPan}</span>
                    </div>
                    
                    <select 
                      className={modalSelectCls}
                      value={panBankMapping[pid]}
                      onChange={(e) => setPanBankMapping(prev => ({ ...prev, [pid]: e.target.value }))}
                      required
                    >
                      <option value="">Select funding bank...</option>
                      {bankAccounts.map(acc => (
                        <option key={acc._id} value={acc._id} disabled={acc.balance < (ipo?.minimum_retail_price || 0)}>
                          {acc.nickname} (₹{acc.balance.toLocaleString("en-IN")}) 
                          {acc.balance < (ipo?.minimum_retail_price || 0) ? " — Insufficient" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            <ModalFooter>
              <button 
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(3)}
                className="flex-1 bg-white text-black font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5"
              >
                Review Summary <ChevronRight size={16} />
              </button>
            </ModalFooter>
          </div>
        )}

        {/* STEP 3: FINAL REVIEW */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-2xl flex flex-col items-center text-center gap-2">
              <Landmark size={32} className="text-blue-500 mb-1" />
              <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Total Block Amount</p>
              <p className="text-3xl font-black text-white">₹{totalAmount.toLocaleString("en-IN")}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#1a1a1a] p-3 rounded-xl border border-gray-800">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Applications</p>
                <p className="text-lg font-bold text-white">{selectedPanIds.length}</p>
              </div>
              <div className="bg-[#1a1a1a] p-3 rounded-xl border border-gray-800">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Per Account</p>
                <p className="text-lg font-bold text-white">₹{(ipo?.minimum_retail_price || 0).toLocaleString("en-IN")}</p>
              </div>
            </div>

            <div className="text-[11px] text-gray-500 leading-relaxed px-1">
              Funds will be <span className="text-red-400 font-bold italic">blocked</span> in the respective bank accounts. They will remain in your account but unavailable for other transactions until the IPO allotment process is complete.
            </div>

            <ModalFooter>
              <button 
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white transition-colors disabled:opacity-20"
              >
                Back
              </button>
              <button 
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 bg-green-500 text-black font-black py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-green-400 transition-all disabled:bg-green-800 disabled:text-green-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>Confirm & Block Funds</>
                )}
              </button>
            </ModalFooter>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default IPOApplyWizard;
