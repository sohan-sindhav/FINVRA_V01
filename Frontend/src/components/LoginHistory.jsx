import React, { useEffect, useState } from "react";
import axiosInstance from "../configs/AxiosInstance";
import { Monitor, Smartphone, Tablet, Clock, ShieldCheck, ShieldAlert } from "lucide-react";

const LoginHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axiosInstance.get("/api/auth/sessions");
        setHistory(Array.isArray(res) ? res : (res.data || []));
      } catch (error) {
        console.error("Error fetching login history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getDeviceIcon = (type) => {
    if (type === "Mobile") return <Smartphone size={16} />;
    if (type === "Tablet") return <Tablet size={16} />;
    return <Monitor size={16} />;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6 md:p-8 rounded-2xl shadow-sm">
      <h3 className="text-lg font-bold text-[var(--color-text-base)] mb-1 flex items-center gap-2">
        <Clock size={18} className="text-indigo-500" /> Recent Logins
      </h3>
      <p className="text-sm font-medium text-[var(--color-text-muted)] mb-6">Track your recent session activity across devices.</p>

      {loading ? (
        <div className="py-8 text-center text-[var(--color-text-muted)] text-sm">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="py-8 text-center text-[var(--color-text-muted)] text-sm">No recent logins found.</div>
      ) : (
        <div className="border border-[var(--color-border)] rounded-xl overflow-hidden divide-y divide-[var(--color-border)]">
          {history.map((session, i) => (
            <div key={session._id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-bg-page)] hover:bg-[var(--color-bg-card)] transition-colors">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${session.status === 'Success' ? 'bg-emerald-500/10 text-emerald-500' : session.status === 'Failed' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  {getDeviceIcon(session.deviceType)}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--color-text-base)]">
                      {session.os} • {session.browser}
                    </span>
                    {i === 0 && session.status === 'Success' && (
                       <span className="text-[9px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Current</span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-[var(--color-text-muted)] mt-1">{session.ipAddress}</span>
                </div>
              </div>
              <div className="flex items-center justify-between md:flex-col md:items-end md:gap-1">
                <span className="text-xs font-medium text-[var(--color-text-muted)]">{formatDate(session.createdAt)}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1 mt-1 md:mt-0 ${session.status === 'Success' ? 'text-emerald-500 bg-emerald-500/10' : session.status === 'Failed' ? 'text-rose-500 bg-rose-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                   {session.status === 'Success' && <ShieldCheck size={12} />}
                   {session.status === 'Failed' && <ShieldAlert size={12} />}
                   {session.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoginHistory;
