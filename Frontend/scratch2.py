import re

with open(r"d:\WINDOWS_LOCATIONS\Projects\Practice\Finvra01\Frontend\src\pages\TransactionsPage.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Import html2canvas & Download icon
content = content.replace(
    'import { Plus, RotateCcw, ArrowRight, Trash2, Search, Share2, Check, X, Receipt } from "lucide-react";',
    'import { Plus, RotateCcw, ArrowRight, Trash2, Search, Share2, Check, X, Receipt, Download } from "lucide-react";\nimport html2canvas from "html2canvas";\nimport { useRef } from "react";'
)
# Make sure useRef is not imported twice
if 'import React, { useEffect, useState, useRef }' not in content:
    content = content.replace(
        'import React, { useEffect, useState } from "react";',
        'import React, { useEffect, useState, useRef } from "react";'
    )
    content = content.replace('\nimport { useRef } from "react";', '')

# 2. Add "View Receipt" to OutgoingShares
content = content.replace(
    'const OutgoingShares = ({ shares, revokeShare }) => {',
    'const OutgoingShares = ({ shares, revokeShare, onViewReceipt }) => {'
)
content = content.replace(
    '<button onClick={async () => {\n                if(!confirm("Revoke this share?")) return;\n                await revokeShare(s._id);\n              }} className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg hover:bg-rose-500/20 transition-colors">Revoke</button>',
    '<div className="flex items-center gap-2">\n                <button onClick={() => onViewReceipt(s)} className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg hover:bg-indigo-500/20 transition-colors">Receipt</button>\n                <button onClick={async () => {\n                  if(!confirm("Revoke this share?")) return;\n                  await revokeShare(s._id);\n                }} className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg hover:bg-rose-500/20 transition-colors">Revoke</button>\n              </div>'
)

# 3. Modify ReceiptModal to support downloading
receipt_modal_old = """
const ReceiptModal = ({ open, onClose, shareRequest }) => {
  if (!shareRequest) return null;
  const totalAmount = shareRequest.transactions?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;
"""

receipt_modal_new = """
const ReceiptModal = ({ open, onClose, shareRequest }) => {
  const hiddenRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!shareRequest) return null;
  const totalAmount = shareRequest.transactions?.reduce((acc, t) => acc + Number(t.amount), 0) || 0;

  const handleDownload = async () => {
    if (!hiddenRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(hiddenRef.current, {
        backgroundColor: "#111827",
        scale: 2, // High resolution
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Receipt_${shareRequest.fromUser?.name || "Shared"}_${new Date(shareRequest.createdAt).getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error generating receipt image:", err);
      alert("Failed to download receipt.");
    } finally {
      setIsDownloading(false);
    }
  };
"""
content = content.replace(receipt_modal_old.strip(), receipt_modal_new.strip())

# Change footer of ReceiptModal to include Download button
modal_footer_old = """
        <div className="shrink-0 flex justify-end mt-2">
          <button onClick={onClose} className="px-6 py-2.5 bg-white/[0.06] text-white text-[13px] font-bold uppercase tracking-wider rounded-[10px] hover:bg-white/[0.1] transition-colors">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
"""

modal_footer_new = """
        <div className="shrink-0 flex justify-end gap-3 mt-2">
          <button onClick={onClose} className="px-5 py-2 text-white/40 text-[13px] font-bold uppercase tracking-wider rounded-[10px] hover:bg-white/[0.05] transition-colors">
            Close
          </button>
          <button onClick={handleDownload} disabled={isDownloading} className="flex items-center gap-2 px-5 py-2 bg-indigo-500/10 text-indigo-400 text-[13px] font-bold uppercase tracking-wider rounded-[10px] hover:bg-indigo-500 hover:text-white border border-indigo-500/20 transition-all">
            {isDownloading ? "Generating..." : <><Download size={14} /> Download</>}
          </button>
        </div>
      </div>

      {/* Hidden layout for html2canvas to capture full height without scrollbars */}
      <div className="fixed left-[-9999px] top-[-9999px]">
        <div ref={hiddenRef} className="bg-[#111827] w-[450px] p-8 flex flex-col gap-6 text-white font-sans rounded-2xl border border-white/10">
          <div className="flex flex-col items-center gap-2 border-b border-white/[0.08] pb-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
              <Receipt size={28} />
            </div>
            <h2 className="text-[24px] font-black tracking-tight">Transaction Receipt</h2>
            <p className="text-[14px] font-medium text-white/50 uppercase tracking-wider">From: {shareRequest.fromUser?.name || "Unknown"}</p>
            <p className="text-[12px] font-medium text-white/30">{new Date(shareRequest.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Itemized Breakdown</h3>
            <div className="flex flex-col border border-white/[0.08] rounded-xl overflow-hidden">
              {shareRequest.transactions?.map((t, i) => (
                <div key={t._id} className="flex justify-between items-center p-4 border-b border-white/[0.08] last:border-0 bg-white/[0.02]">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-semibold text-white/90">{t.from?.name || "—"}</span>
                    <span className="text-[12px] text-white/40 flex items-center gap-1">
                      To <ArrowRight size={10} /> {t.to?.nickname || "—"}
                    </span>
                  </div>
                  <span className="text-[14px] font-bold text-emerald-400 tabular-nums">₹{Number(t.amount).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-xl mt-4">
            <span className="text-[14px] font-black text-indigo-400 uppercase tracking-wider">Total Amount</span>
            <span className="text-[20px] font-black text-white tabular-nums tracking-tight">₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="text-center text-[10px] text-white/20 uppercase tracking-widest mt-4">
            Generated by Finvra
          </div>
        </div>
      </div>
    </Modal>
  );
};
"""
content = content.replace(modal_footer_old.strip(), modal_footer_new.strip())


# 4. Pass onViewReceipt to OutgoingShares
content = content.replace(
    '<OutgoingShares shares={outgoingShares} revokeShare={revokeShare} />',
    '<OutgoingShares shares={outgoingShares} revokeShare={revokeShare} onViewReceipt={setSelectedReceipt} />'
)

with open(r"d:\WINDOWS_LOCATIONS\Projects\Practice\Finvra01\Frontend\src\pages\TransactionsPage.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("updated TransactionsPage.jsx")
