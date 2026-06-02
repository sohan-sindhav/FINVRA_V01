import React, { useState, useEffect } from "react";
import { Users, Mail, UserCheck, X, Check, Loader2 } from "lucide-react";
import Modal, { ModalField, CancelBtn, ConfirmBtn, modalInputCls } from "./Modal";
import axiosInstance from "../configs/AxiosInstance";

const PartnerManagerModal = ({ open, onClose }) => {
  const [partners, setPartners] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/partners`);
      if (res.success) {
        setPartners(res.partners);
        setRequests(res.partnerRequests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPartners();
      setError("");
      setSuccess("");
      setEmail("");
    }
  }, [open]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await axiosInstance.post(`/api/partners/request`, { email });
      if (res.success) {
        setSuccess(res.message);
        setEmail("");
      }
    } catch (err) {
      setError(err?.message || "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (partnerId) => {
    try {
      const res = await axiosInstance.post(`/api/partners/accept`, { partnerId });
      if (res.success) {
        fetchPartners();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (partnerId) => {
    try {
      const res = await axiosInstance.post(`/api/partners/reject`, { partnerId });
      if (res.success) {
        fetchPartners();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Partner Manager" maxWidth="max-w-md">
      <div className="flex flex-col gap-6 mt-4">
        
        {/* Send Request Section */}
        <div className="p-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-sm">
          <h3 className="text-sm font-semibold text-[var(--color-text-base)] mb-3 flex items-center gap-2">
            <UserCheck size={16} className="text-indigo-500" /> Add a Partner
          </h3>
          <form onSubmit={handleSendRequest} className="flex gap-2">
             <div className="relative flex-1">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Partner's email"
                  className={`${modalInputCls} pl-9`}
                  required
                />
             </div>
             <ConfirmBtn type="submit" loading={submitting} className="shrink-0 bg-indigo-500 hover:bg-indigo-600">
               Send
             </ConfirmBtn>
          </form>
          {error && <p className="text-xs text-rose-500 mt-2">{error}</p>}
          {success && <p className="text-xs text-emerald-500 mt-2">{success}</p>}
          <p className="text-xs text-[var(--color-text-muted)] mt-3">
             When a partner is added, any new IPO you create will automatically be sent to their feed, and vice versa.
          </p>
        </div>

        {/* Pending Requests Section */}
        {requests.length > 0 && (
          <div className="flex flex-col gap-3">
             <h3 className="text-xs font-bold text-[var(--color-text-faint)] uppercase tracking-wider">Incoming Requests</h3>
             <div className="flex flex-col gap-2">
               {requests.map(req => (
                 <div key={req._id} className="flex items-center justify-between p-3 bg-[var(--color-bg-page)] border border-[var(--color-border)] rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-base)]">{req.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{req.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => handleAccept(req._id)} className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-md hover:bg-emerald-500 hover:text-white transition-all"><Check size={16} /></button>
                       <button onClick={() => handleReject(req._id)} className="p-1.5 bg-rose-500/10 text-rose-500 rounded-md hover:bg-rose-500 hover:text-white transition-all"><X size={16} /></button>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* Active Partners Section */}
        <div className="flex flex-col gap-3">
           <h3 className="text-xs font-bold text-[var(--color-text-faint)] uppercase tracking-wider">Active Partners</h3>
           {loading ? (
             <div className="py-8 flex justify-center text-[var(--color-text-muted)]">
                <Loader2 className="animate-spin" size={20} />
             </div>
           ) : partners.length === 0 ? (
             <div className="py-6 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-page)] border border-[var(--color-border)] rounded-xl border-dashed">
                No active partners yet.
             </div>
           ) : (
             <div className="flex flex-col gap-2">
               {partners.map(partner => (
                 <div key={partner._id} className="flex items-center justify-between p-3 bg-[var(--color-bg-page)] border border-[var(--color-border)] rounded-lg">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-sm">
                         {partner.name[0].toUpperCase()}
                       </div>
                       <div>
                         <p className="text-sm font-medium text-[var(--color-text-base)]">{partner.name}</p>
                         <p className="text-xs text-[var(--color-text-muted)]">{partner.email}</p>
                       </div>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>

      </div>
    </Modal>
  );
};

export default PartnerManagerModal;
