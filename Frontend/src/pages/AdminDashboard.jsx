import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authcontext";
import { Shield, Clock, ExternalLink, RefreshCw, User, Globe, Laptop, Smartphone, Tablet } from "lucide-react";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const { getAdminLogs } = useAuth();

  const fetchLogs = async () => {
    setLoadingLogs(true);
    const result = await getAdminLogs();
    if (result.success) {
      setLogs(result.data);
    }
    setLoadingLogs(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getDeviceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "mobile": return <Smartphone size={14} />;
      case "tablet": return <Tablet size={14} />;
      default: return <Laptop size={14} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Success": return "text-green-400 bg-green-400/10 border-green-400/20";
      case "Failed": return "text-red-400 bg-red-400/10 border-red-400/20";
      case "2FA Pending": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 bg-[#080808]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="text-indigo-500" />
            System Audit Logs
          </h1>
          <p className="text-gray-500 text-sm mt-1">Real-time monitoring of all authentication events across the platform.</p>
        </div>
        <button 
          onClick={fetchLogs}
          disabled={loadingLogs}
          className="flex items-center gap-2 bg-[#141414] border border-gray-800 text-gray-300 px-4 py-2 rounded-xl hover:bg-[#1f1f1f] transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={loadingLogs ? "animate-spin" : ""} />
          Refresh Feed
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
            { label: "Total Events", value: logs.length, color: "text-white" },
            { label: "Failed Attempts", value: logs.filter(l => l.status === "Failed").length, color: "text-red-400" },
            { label: "Active Admins", value: logs.filter(l => l.user?.role === "admin").length, color: "text-indigo-400" }
        ].map((stat, idx) => (
            <div key={idx} className="bg-[#141414] border border-gray-800 p-5 rounded-2xl">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
        ))}
      </div>

      {/* Logs Table */}
      <div className="bg-[#141414] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f0f0f] border-b border-gray-800">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">User / Identity</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Event Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Origin (IP & OS)</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loadingLogs ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-gray-500">
                    <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                    Synchronizing system logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-gray-500">No logs found in the database.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={log._id} 
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${log.user?.role === 'admin' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-gray-800 text-gray-400'}`}>
                          <User size={16} />
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{log.user?.name || "Deleted User"}</p>
                          <p className="text-gray-500 text-[11px] font-mono">{log.user?.email || "Unknown"}</p>
                        </div>
                        {log.user?.role === 'admin' && (
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Admin</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-300 text-xs font-mono">
                          <Globe size={12} className="text-gray-600" />
                          {log.ipAddress}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                          {getDeviceIcon(log.deviceType)}
                          {log.os} • {log.browser}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <Clock size={12} />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
