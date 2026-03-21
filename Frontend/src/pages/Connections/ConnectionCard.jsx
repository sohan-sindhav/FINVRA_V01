import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useConnections } from "../../context/ConnectionContext";

const ConnectionCard = ({ connection, index }) => {
  const { deleteConnections, setShowEditModal, setEditingConnectionid } =
    useConnections();

  return (
    <div className="flex items-center gap-4 px-5 py-3 hover:bg-[#1a1a1a] transition-colors duration-150 group">
      {/* Index number */}
      <span className="w-6 text-right text-xs font-medium text-gray-600 shrink-0 select-none">
        {index}
      </span>

      {/* Divider dot */}
      <span className="w-1 h-1 rounded-full bg-gray-700 shrink-0" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{connection.name}</p>
        {connection.mobile && (
          <p className="text-xs text-gray-600 mt-0.5">{connection.mobile}</p>
        )}
      </div>

      {/* Actions — visible on hover */}
      <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          title="Edit"
          onClick={() => {
            setEditingConnectionid(connection._id);
            setShowEditModal(true);
          }}
          className="w-7 h-7 rounded-md border border-gray-800 flex items-center justify-center hover:bg-[#2a2a2a] hover:border-gray-700 transition-colors duration-150"
        >
          <Pencil size={11} className="text-gray-500" />
        </button>
        <button
          title="Delete"
          onClick={() => deleteConnections(connection._id)}
          className="w-7 h-7 rounded-md border border-red-500/20 bg-red-500/5 flex items-center justify-center hover:bg-red-500/15 transition-colors duration-150"
        >
          <Trash2 size={11} className="text-red-400" />
        </button>
      </div>
    </div>
  );
};

export default ConnectionCard;
