/**
 * ui/Card.jsx — A standard surface card
 */
import React from "react";

export const Card = ({ children, style, onClick, hoverable = false, ...props }) => (
  <div
    onClick={onClick}
    style={{
      background: "var(--color-bg-card)",
      borderRadius: "var(--radius-card)",
      boxShadow: "var(--shadow-card)",
      padding: "1.25rem",
      color: "var(--color-text-base)",
      transition: hoverable ? "background var(--transition-speed) ease" : undefined,
      cursor: onClick ? "pointer" : undefined,
      ...style,
    }}
    onMouseEnter={
      hoverable
        ? (e) => (e.currentTarget.style.background = "var(--color-bg-elevated)")
        : undefined
    }
    onMouseLeave={
      hoverable
        ? (e) => (e.currentTarget.style.background = "var(--color-bg-card)")
        : undefined
    }
    {...props}
  >
    {children}
  </div>
);
