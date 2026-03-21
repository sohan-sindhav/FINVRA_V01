/**
 * ui/Modal.jsx — Animated modal overlay using framer-motion
 * Reads borderRadius from var(--radius-modal).
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Modal = ({ open, onClose, title, children, maxWidth = "28rem" }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.72)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
          padding: "1rem",
        }}
      >
        <motion.div
          key="panel"
          initial={{ scale: 0.93, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0, y: 12 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "var(--color-bg-card)",
            borderRadius: "var(--radius-modal)",
            padding: "1.5rem",
            width: "100%",
            maxWidth,
            color: "var(--color-text-base)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {title && (
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                marginBottom: "1.25rem",
              }}
            >
              {title}
            </h2>
          )}
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
