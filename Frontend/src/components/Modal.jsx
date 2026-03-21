/**
 * components/Modal.jsx  —  Single shared modal shell for the entire app.
 *
 * Usage:
 *   <Modal open={show} onClose={() => setShow(false)} title="Add Account">
 *     ...children...
 *   </Modal>
 *
 * Props:
 *   open      boolean        — controls visibility
 *   onClose   () => void     — called when overlay or X is clicked
 *   title     string         — header text
 *   maxWidth  string         — Tailwind max-w class (default "max-w-sm")
 *   children  ReactNode
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const Modal = ({ open, onClose, title, children, maxWidth = "max-w-sm" }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          key="panel"
          initial={{ scale: 0.94, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 10 }}
          transition={{ duration: 0.14 }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-[#1f1f1f] border border-gray-800 rounded-xl w-full ${maxWidth} overflow-hidden text-white`}
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-800">
            <h2 className="font-bold text-base">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Body ───────────────────────────────────────────── */}
          <div className="p-5">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ── Shared field label used inside modals ─────────────────────────────── */
export const ModalField = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {label}
    </label>
    {children}
  </div>
);

/* ── Shared input class ────────────────────────────────────────────────── */
export const modalInputCls =
  "w-full px-3 py-2 bg-[#2a2a2a] border border-gray-700 text-white text-sm rounded-lg " +
  "focus:outline-none focus:border-gray-500 placeholder:text-gray-600 transition-colors duration-150";

/* ── Shared select class ───────────────────────────────────────────────── */
export const modalSelectCls =
  "w-full px-3 py-2 bg-[#2a2a2a] border border-gray-700 text-white text-sm rounded-lg " +
  "focus:outline-none focus:border-gray-500 transition-colors duration-150 cursor-pointer";

/* ── Modal footer button row ───────────────────────────────────────────── */
export const ModalFooter = ({ children }) => (
  <div className="flex gap-2 justify-end pt-2">{children}</div>
);

/* ── Cancel button ─────────────────────────────────────────────────────── */
export const CancelBtn = ({ onClick, disabled, children = "Cancel" }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="px-4 py-2 text-sm font-semibold rounded-full border border-gray-700 text-gray-300
               hover:bg-[#2a2a2a] transition-colors duration-200 disabled:opacity-50"
  >
    {children}
  </button>
);

/* ── Primary confirm button ────────────────────────────────────────────── */
export const ConfirmBtn = ({
  children = "Confirm",
  disabled,
  loading,
  variant = "white", // "white" | "danger" | "warning" | "success"
  ...props
}) => {
  const colors = {
    white:   "bg-white text-black hover:bg-gray-100",
    danger:  "bg-red-600 text-white hover:bg-red-700",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700",
    success: "bg-green-600 text-white hover:bg-green-700",
  };
  return (
    <button
      disabled={disabled || loading}
      className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2
                  transition-colors duration-200 disabled:opacity-55
                  ${colors[variant] || colors.white}`}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
};

export default Modal;
