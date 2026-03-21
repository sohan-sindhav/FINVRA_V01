import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
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
    <div className="bg-[#141414] min-h-full flex flex-col">

      {/* HEADER */}
      <div className="flex justify-between items-center px-4 md:px-7 py-5 border-b border-gray-800">
        <div>
          <h1 className="text-xl font-bold text-white">Connections</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {connections.length} contact{connections.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-white text-black text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
        >
          <Plus size={15} /> Add
        </button>
      </div>

      {/* SEARCH */}
      {connections.length > 0 && (
        <div className="px-4 md:px-7 py-4">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${modalInputCls} pl-9`}
            />
          </div>
        </div>
      )}

      {/* LOADING */}
      {Loading && connections.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* EMPTY STATE */}
      {!Loading && connections.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 py-24 text-gray-500">
          <div className="w-14 h-14 rounded-xl border border-gray-800 bg-[#1f1f1f] flex items-center justify-center">
            <Plus size={24} className="opacity-30" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-white text-sm mb-1">No connections yet</p>
            <p className="text-xs">Add your first contact to get started</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-white text-black text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition-colors mt-1"
          >
            <Plus size={14} /> Add Connection
          </button>
        </div>
      )}

      {/* LIST */}
      {filtered.length > 0 && (
        <div className="px-4 md:px-7 py-4">
          <div className="border border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-800/60">
            {filtered.map((c, i) => (
              <ConnectionCard key={c._id} connection={c} index={i + 1} />
            ))}
          </div>
        </div>
      )}

      {/* NO SEARCH RESULTS */}
      {connections.length > 0 && filtered.length === 0 && (
        <p className="text-center text-sm text-gray-600 py-20">
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
