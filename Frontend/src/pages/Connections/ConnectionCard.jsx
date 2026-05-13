import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useConnections } from "../../context/ConnectionContext";

const ConnectionCard = ({ connection, index }) => {
  const { deleteConnections, setShowEditModal, setEditingConnectionid } =
    useConnections();

  const isEven = index % 2 === 0;

  return (
    <div className={`flex items-center justify-between py-3.5 px-4 md:px-6 border-b border-white/[0.04] last:border-0 group hover:bg-white/[0.02] transition-colors duration-200 ${isEven ? 'bg-white/[0.01]' : 'bg-transparent'}`}>
      {/* Left side: Avatar and Info */}
      <div className="flex items-center gap-4 min-w-0">
        <span className="w-6 text-right text-[13px] font-medium text-white/30 shrink-0 select-none tabular-nums group-hover:text-white/50 transition-colors">
          {index + 1}
        </span>
        <div className="w-[36px] h-[36px] rounded-[10px] bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0 group-hover:border-indigo-500/30 group-hover:text-indigo-400 transition-colors">
          <span className="text-[13px] font-bold text-white/70 uppercase group-hover:text-indigo-400 transition-colors">
            {connection.name.charAt(0)}
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-[14px] font-semibold text-white/90 truncate leading-tight">{connection.name}</p>
          {connection.mobile && (
            <p className="text-[11px] font-medium text-white/40 truncate mt-0.5 tabular-nums tracking-wide">{connection.mobile}</p>
          )}
        </div>
      </div>

      {/* Right side: Actions (visible on hover) */}
      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => {
            setEditingConnectionid(connection._id);
            setShowEditModal(true);
          }}
          className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-white/40 hover:bg-white/[0.04] hover:text-white/90 border border-transparent hover:border-white/[0.05] transition-all"
          title="Edit"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => deleteConnections(connection._id)}
          className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-white/40 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default ConnectionCard;
