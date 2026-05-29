import re

with open(r"d:\WINDOWS_LOCATIONS\Projects\Practice\Finvra01\Frontend\src\pages\TransactionsPage.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. New imports: Receipt text icon
content = content.replace(
    'import { Plus, RotateCcw, ArrowRight, Trash2, Search, Share2, Check, X } from "lucide-react";',
    'import { Plus, RotateCcw, ArrowRight, Trash2, Search, Share2, Check, X, Receipt } from "lucide-react";'
)

# 2. Add ReceiptModal Component
receipt_modal_str = """
const ReceiptModal = ({ open, onClose, shareRequest }) => {
  if (!shareRequest) return null;
  const totalAmount = shareRequest.transactions?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  
  return (
    <Modal open={open} onClose={onClose} title="Transaction Receipt">
      <div className="p-4 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1 border-b border-white/[0.04] pb-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
            <Receipt size={24} />
          </div>
          <h2 className="text-[20px] font-black text-white tracking-tight">Receipt</h2>
          <p className="text-[13px] font-medium text-white/40 uppercase tracking-wider">
            From: {shareRequest.fromUser?.name}
          </p>
          <p className="text-[11px] font-medium text-white/30">
            {new Date(shareRequest.createdAt).toLocaleString()}
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Itemized Breakdown</h3>
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl overflow-hidden">
            {shareRequest.transactions?.map((t, i) => (
              <div key={t._id} className="flex justify-between items-center p-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-white/90">{t.from?.name || "—"}</span>
                  <span className="text-[11px] text-white/40 flex items-center gap-1">
                    To <ArrowRight size={10} /> {t.to?.nickname || "—"}
                  </span>
                </div>
                <span className="text-[13px] font-bold text-emerald-400 tabular-nums">
                  ₹{Number(t.amount).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl mt-2">
          <span className="text-[13px] font-black text-indigo-400 uppercase tracking-wider">Total Amount</span>
          <span className="text-[18px] font-black text-white tabular-nums tracking-tight">
            ₹{totalAmount.toLocaleString("en-IN")}
          </span>
        </div>
        
        <div className="flex justify-end mt-2">
          <button onClick={onClose} className="px-6 py-2.5 bg-white/[0.06] text-white text-[13px] font-bold uppercase tracking-wider rounded-[10px] hover:bg-white/[0.1] transition-colors">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
"""
content = content.replace("const TransactionsPage = () => {", receipt_modal_str.strip() + "\n\nconst TransactionsPage = () => {")

# 3. Add state for selectedReceipt
state_str = """
  const [selectedTxns, setSelectedTxns] = useState([]);
  const [isShareOpen,  setIsShareOpen]  = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
"""
content = re.sub(r'const \[selectedTxns, setSelectedTxns\] = useState\(\[\]\);\s*const \[isShareOpen,  setIsShareOpen\]  = useState\(false\);', state_str.strip(), content, flags=re.DOTALL)

# 4. Modify sharedTxns and filtering logic
shared_str = """
  const active   = transactions.filter((t) => !t.reversed);
  const reversed = transactions.filter((t) =>  t.reversed);
  
  const getFiltered = () => {
    if (activeTab === "shared") {
      return (sharedWithMe || []).filter(share => 
        share.fromUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        share.fromUser?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    const base = activeTab === "active" ? active : reversed;
    return base.filter(t => 
      t.from?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.to?.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  const filtered = getFiltered();
"""
content = re.sub(r'const active   = transactions\.filter\(\(t\) => !t\.reversed\);\n\n\s*const reversed = transactions\.filter\(\(t\) =>  t\.reversed\);\s*const sharedTxns =.*?const filtered = getFiltered\(\);', shared_str.strip(), content, flags=re.DOTALL)

# 5. Update Tab count for "Shared"
content = content.replace('{ key: "shared",   label: "Shared",   count: sharedTxns.length },', '{ key: "shared",   label: "Shared",   count: (sharedWithMe || []).length },')

# 6. Change Desktop Table headers
table_headers_str = """
                 <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                   {activeTab === "shared" ? (
                     <>
                       <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40">From</th>
                       <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40">Date</th>
                       <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-white/40">Transactions</th>
                       <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-white/40">Total Amount</th>
                       <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-white/40 w-32">Actions</th>
                     </>
                   ) : (
                     <>
                       {activeTab === "active" ? (
                         <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40 w-12">
                           <Check size={14} className="opacity-40" />
                         </th>
                       ) : (
                         <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40 w-12">#</th>
                       )}
                       <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40">From</th>
                       <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/40">To</th>
                       <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-white/40">Amount</th>
                       <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-white/40 w-32">Actions</th>
                     </>
                   )}
                 </tr>
"""
content = re.sub(r'<tr className="border-b border-white/\[0\.04\] bg-white/\[0\.02\]">.*?</tr>', table_headers_str.strip(), content, flags=re.DOTALL)

# 7. Change Desktop Table Body
table_body_str = """
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.length === 0 ? (
                  <tr>
                     <td colSpan="5" className="py-24 text-center text-[13px] font-medium text-white/40">No records found.</td>
                  </tr>
                ) : (
                  filtered.map((item, i) => {
                    if (activeTab === "shared") {
                      const totalAmount = item.transactions?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;
                      return (
                        <tr key={item._id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                            <span className="text-[14px] font-semibold text-white/90">{item.fromUser?.name || "Unknown"}</span>
                            <div className="text-[11px] text-white/40">{item.fromUser?.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[13px] font-medium text-white/50">{new Date(item.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-[13px] font-bold text-white/60 bg-white/[0.02] border border-white/[0.04] px-3 py-1 rounded-full tabular-nums">
                               {item.transactions?.length || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right tabular-nums">
                             <span className="text-[14px] font-bold text-emerald-400">
                                ₹{totalAmount.toLocaleString("en-IN")}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => setSelectedReceipt(item)} className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-lg hover:bg-indigo-500 hover:text-white transition-colors">
                              View Receipt
                            </button>
                          </td>
                        </tr>
                      );
                    }
                    
                    // For active/reversed tabs:
                    const t = item;
                    return (
                      <tr key={t._id} className="hover:bg-white/[0.02] transition-colors group">
                        {activeTab === "active" ? (
                          <td className="px-6 py-4">
                            <button onClick={() => handleToggleSelect(t._id)} className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedTxns.includes(t._id) ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/20 hover:border-white/40 text-transparent"}`}>
                              <Check size={12} />
                            </button>
                          </td>
                        ) : (
                          <td className="px-6 py-4 text-[13px] font-medium text-white/30 tabular-nums">{i + 1}</td>
                        )}
                        <td className="px-6 py-4">
                           <span className="text-[14px] font-semibold text-white/90">{t.from?.name || "—"}</span>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-[13px] font-medium text-white/50">{t.to?.nickname || "—"}</span>
                        </td>
                        <td className="px-6 py-4 text-right tabular-nums">
                           <span className={`text-[14px] font-bold ${t.reversed ? "text-white/30 line-through" : "text-emerald-400"}`}>
                              ₹{Number(t.amount).toLocaleString("en-IN")}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {activeTab === "active" && (
                                <button onClick={() => { if(confirm("Reverse transaction?")) handleReverse(t); }} className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-white/40 hover:bg-amber-500/10 hover:text-amber-400 border border-transparent hover:border-amber-500/20 transition-all" title="Reverse"><RotateCcw size={14} /></button>
                              )}
                              <button onClick={async () => {
                                 if(!confirm("Delete transaction?")) return;
                                 const targetBank = bankAccounts.find(b => b._id === t.to?._id);
                                 if (!targetBank) { setActionError("Bank account not found"); return; }
                                 const newBalance = targetBank.balance - Number(t.amount);
                                 const result = await updateBalance({ balance: newBalance }, t.to?._id);
                                 if (!result.success) { setActionError(result.error); return; }
                                 await deleteTransaction(t._id);
                                 await getBankAcc();
                              }} className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-white/40 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all" title="Delete"><Trash2 size={14} /></button>
                           </div>
                        </td>
                      </tr>
                    );
                  })
                )}
             </tbody>
"""
content = re.sub(r'<tbody className="divide-y divide-white/\[0\.04\]">.*?</tbody>', table_body_str.strip(), content, flags=re.DOTALL)

# 8. Change Mobile Cards
mobile_body_str = """
      <div className="md:hidden flex flex-col gap-4 px-6 pb-10">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-[13px] font-medium text-white/40 bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">No records found.</div>
        ) : (
          filtered.map((item, i) => {
            if (activeTab === "shared") {
              const totalAmount = item.transactions?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;
              return (
                <div key={item._id} className="bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] p-5 flex flex-col gap-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-[14px] font-semibold text-white/90 truncate">{item.fromUser?.name || "Unknown"}</span>
                      <span className="text-[11px] font-medium text-white/40 truncate">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right tabular-nums">
                      <span className="text-[16px] font-bold text-emerald-400">
                         ₹{totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] mt-1">
                     <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">{item.transactions?.length || 0} Transactions</span>
                     <button onClick={() => setSelectedReceipt(item)} className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-lg hover:bg-indigo-500 hover:text-white transition-colors">
                        View Receipt
                     </button>
                  </div>
                </div>
              );
            }

            const t = item;
            return (
              <div key={t._id} className="bg-[#111827]/50 backdrop-blur-xl border border-white/[0.04] rounded-[16px] p-5 flex flex-col gap-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
                <div className="flex justify-between items-start gap-4">
                  {activeTab === "active" && (
                    <button onClick={() => handleToggleSelect(t._id)} className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${selectedTxns.includes(t._id) ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/20 hover:border-white/40 text-transparent"}`}>
                      <Check size={12} />
                    </button>
                  )}
                  <div className="flex flex-col gap-3 flex-1">
                     <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest w-8">From</span>
                        <span className="text-[14px] font-semibold text-white/90 truncate">{t.from?.name || "—"}</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest w-8">To</span>
                        <span className="text-[13px] font-medium text-white/50 truncate">{t.to?.nickname || "—"}</span>
                     </div>
                  </div>
                  <div className="text-right tabular-nums">
                    <span className={`text-[16px] font-bold ${t.reversed ? "text-white/30 line-through" : "text-emerald-400"}`}>
                       ₹{Number(t.amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.04] mt-1">
                   {activeTab === "active" && (
                     <button onClick={() => { if(confirm("Reverse transaction?")) handleReverse(t); }} className="text-white/40 hover:text-amber-400 transition-colors flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider px-3 py-2 rounded-[8px] hover:bg-amber-500/10"><RotateCcw size={14} /> Reverse</button>
                   )}
                   <button onClick={async () => {
                     if(!confirm("Delete transaction?")) return;
                     const targetBank = bankAccounts.find(b => b._id === t.to?._id);
                     if (!targetBank) { setActionError("Bank account not found"); return; }
                     const newBalance = targetBank.balance - Number(t.amount);
                     const result = await updateBalance({ balance: newBalance }, t.to?._id);
                     if (!result.success) { setActionError(result.error); return; }
                     await deleteTransaction(t._id);
                     await getBankAcc();
                   }} className="text-white/40 hover:text-rose-400 transition-colors flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider px-3 py-2 rounded-[8px] hover:bg-rose-500/10"><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            );
          })
        )}
      </div>
"""
content = re.sub(r'<div className="md:hidden flex flex-col gap-4 px-6 pb-10">.*?(?=\{/\* ── ADD MODAL ── \*/\})', mobile_body_str.strip() + '\n\n      ', content, flags=re.DOTALL)


# Add ReceiptModal renderer
receipt_render_str = """
      <ReceiptModal 
        open={!!selectedReceipt} 
        onClose={() => setSelectedReceipt(null)} 
        shareRequest={selectedReceipt} 
      />
    </div>
  );
};
"""
content = content.replace("    </div>\n  );\n};", receipt_render_str.strip() + "\n")

with open(r"d:\WINDOWS_LOCATIONS\Projects\Practice\Finvra01\Frontend\src\pages\TransactionsPage.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("done")
