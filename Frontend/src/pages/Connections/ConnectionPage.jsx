import React, { useState, useEffect } from "react";
import { Plus, Search, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useConnections } from "../../context/ConnectionContext.jsx";
import ConnectionCard from "./ConnectionCard.jsx";
import Modal, {
  ModalField,
  ModalFooter,
  CancelBtn,
  ConfirmBtn,
  modalInputCls,
} from "../../components/Modal.jsx";

const ConnectionPage = () => {
  const {
    connections,
    showModal,
    setShowModal,
    Loading,
    getConnections,
    createConnection,
    showEditModal,
    setShowEditModal,
    editConnections,
  } = useConnections();

  const [name, setName]               = useState("");
  const [mobile, setMobile]           = useState("");
  const [editingName, setEditingName] = useState("");
  const [search, setSearch]           = useState("");

  useEffect(() => { getConnections(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await createConnection(name, mobile);
    setName(""); setMobile("");
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    await editConnections(editingName);
  };

  const sorted   = [...connections].sort((a, b) => a.name.localeCompare(b.name));
  const filtered = sorted.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-transparent min-h-full flex flex-col transition-colors duration-300">

      {/* HEADER */}
      <div className="flex justify-between items-center px-6 md:px-10 py-8 border-b border-white/[0.04]">
        <div>
          <h1 className="text-[24px] font-black text-white tracking-tight">Connections</h1>
          <p className="text-[13px] font-medium text-white/40 mt-1 uppercase tracking-wider">
            {connections.length} contact{connections.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[13px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-[12px] hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* SEARCH */}
      {connections.length > 0 && (
        <div className="px-6 md:px-10 py-6">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <input
              type="text"
              placeholder="Search contacts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/[0.06] rounded-[12px] py-3 pl-11 pr-4 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all"
            />
          </div>
        </div>
      )}

      {/* LOADING */}
      {Loading && connections.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[var(--color-border)] border-t-indigo-500 rounded-full animate-spin" />
        </div>
      )}

      {/* EMPTY STATE */}
      {!Loading && connections.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 py-24 text-white/40">
          <div className="w-16 h-16 rounded-[16px] border border-white/[0.04] bg-white/[0.02] flex items-center justify-center shadow-sm">
            <Users size={28} className="opacity-40" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-white/90 text-base mb-1.5">No connections yet</p>
            <p className="text-[13px]">Add your first contact to get started</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 text-[13px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-[12px] hover:bg-indigo-500 hover:text-white transition-colors duration-300 mt-2 border border-indigo-500/20 hover:border-indigo-500"
          >
            <Plus size={16} /> Add Connection
          </button>
        </div>
      )}

      {/* LIST */}
      {filtered.length > 0 && (
        <div className="px-6 md:px-10 pb-10">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
            className="border border-white/[0.04] rounded-[16px] overflow-hidden bg-[#111827]/50 backdrop-blur-xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]"
          >
            {filtered.map((c, i) => (
              <motion.div 
                key={c._id} 
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                }}
              >
                <ConnectionCard connection={c} index={i} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* NO SEARCH RESULTS */}
      {connections.length > 0 && filtered.length === 0 && (
        <p className="text-center text-[13px] font-medium text-white/40 py-20">
          No connections matching "{search}"
        </p>
      )}

      {/* ── ADD MODAL ── */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Connection">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <ModalField label="Name">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Full name" className={modalInputCls} required disabled={Loading} />
          </ModalField>
          <ModalField label="Mobile">
            <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)}
              placeholder="Mobile number (optional)" className={modalInputCls} disabled={Loading} />
          </ModalField>
          <ModalFooter>
            <CancelBtn onClick={() => setShowModal(false)} disabled={Loading} />
            <ConfirmBtn type="submit" disabled={Loading} loading={Loading}>
              {Loading ? "Adding…" : "Add"}
            </ConfirmBtn>
          </ModalFooter>
        </form>
      </Modal>

      {/* ── EDIT MODAL ── */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Name">
        <form onSubmit={handleEdit} className="flex flex-col gap-4">
          <ModalField label="New name">
            <input type="text" placeholder="Enter new name"
              onChange={(e) => setEditingName(e.target.value)}
              className={modalInputCls} required />
          </ModalField>
          <ModalFooter>
            <CancelBtn onClick={() => setShowEditModal(false)} />
            <ConfirmBtn type="submit">Update</ConfirmBtn>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
};

export default ConnectionPage;
