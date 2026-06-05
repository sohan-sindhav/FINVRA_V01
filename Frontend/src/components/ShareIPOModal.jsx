import React, { useState, useEffect } from "react";
import Modal, { ModalFooter, CancelBtn, ConfirmBtn } from "./Modal";
import axiosInstance from "../configs/AxiosInstance";
import { Users } from "lucide-react";

const ShareIPOModal = ({ open, onClose, ipo }) => {
  const [partners, setPartners] = useState([]);
  const [sharedPartners, setSharedPartners] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (open) {
      fetchPartners();
      setError("");
      setSuccess("");
      setSelectedPartner("");
    }
  }, [open]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/partners");
      const outRes = await axiosInstance.get("/api/ipo-share/outgoing");
      
      if (res.success) {
        setPartners(res.partners);
      }
      
      if (outRes.success) {
        const sharedMap = {};
        outRes.shares.forEach(s => {
          if (s.ipo._id === ipo._id) {
            sharedMap[s.toUser._id] = s._id;
          }
        });
        setSharedPartners(sharedMap);
      }
    } catch (err) {
      setError("Failed to load partners.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    if (!selectedPartner) {
      setError("Please select a partner to share with.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await axiosInstance.post("/api/ipo-share/share", {
        toUserId: selectedPartner,
        ipoId: ipo._id,
      });

      if (res.success) {
        setSuccess(res.message);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.message || "Failed to send share request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (shareId, e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axiosInstance.delete(`/api/ipo-share/revoke/${shareId}`);
      if (res.success) {
        setSuccess("Share revoked successfully.");
        fetchPartners();
      }
    } catch (err) {
      setError("Failed to revoke share.");
      setLoading(false);
    }
  };

  if (!ipo) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Share IPO: ${ipo.companyname}`} maxWidth="max-w-md">
      <form onSubmit={handleShare} className="flex flex-col gap-4 p-2">
        {error && <p className="text-xs text-rose-500 font-medium bg-rose-500/10 p-2 rounded-lg">{error}</p>}
        {success && <p className="text-xs text-emerald-500 font-medium bg-emerald-500/10 p-2 rounded-lg">{success}</p>}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            Select Partner
          </label>
          {loading ? (
            <p className="text-sm text-[var(--color-text-faint)]">Loading partners...</p>
          ) : partners.length === 0 ? (
            <p className="text-sm text-[var(--color-text-faint)] bg-[var(--color-bg-card)] p-3 rounded-lg border border-[var(--color-border)] flex items-center gap-2">
              <Users size={16} /> No partners found. Add a partner first.
            </p>
          ) : (
            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
              {partners.map((partner) => {
                const shareId = sharedPartners[partner._id];
                
                if (shareId) {
                  return (
                    <div key={partner._id} className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[var(--color-text-base)]">{partner.name}</span>
                        <span className="text-xs text-emerald-500 font-medium">Already Shared</span>
                      </div>
                      <button 
                        onClick={(e) => handleRevoke(shareId, e)}
                        className="px-3 py-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Revoke
                      </button>
                    </div>
                  );
                }

                return (
                  <label
                    key={partner._id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedPartner === partner._id
                        ? "border-indigo-500 bg-indigo-500/10"
                        : "border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-text-muted)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="partner"
                      value={partner._id}
                      checked={selectedPartner === partner._id}
                      onChange={(e) => setSelectedPartner(e.target.value)}
                      className="hidden"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[var(--color-text-base)]">{partner.name}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">{partner.email}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <ModalFooter>
          <CancelBtn onClick={onClose} />
          <ConfirmBtn type="submit" loading={submitting} disabled={loading || partners.length === 0}>
            Share IPO
          </ConfirmBtn>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default ShareIPOModal;
