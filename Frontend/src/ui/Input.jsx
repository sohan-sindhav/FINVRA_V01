/**
 * ui/Input.jsx  — themed text/number/email inputs
 * ui/Select.jsx — themed <select>
 *
 * Both read from CSS custom properties so theme changes apply globally.
 */
import React from "react";

const baseInputStyle = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  background: "var(--color-bg-elevated)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-input)",
  color: "var(--color-text-base)",
  fontSize: "0.875rem",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color var(--transition-speed) ease, box-shadow var(--transition-speed) ease",
  boxSizing: "border-box",
};

export const Input = React.forwardRef(
  ({ label, error, style, className = "", ...props }, ref) => (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem", width: "100%" }}>
      {label && (
        <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-muted)" }}>
          {label}
        </span>
      )}
      <input
        ref={ref}
        style={{ ...baseInputStyle, ...(error ? { borderColor: "var(--color-danger)" } : {}), ...style }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--color-primary)";
          e.target.style.boxShadow = "0 0 0 2px color-mix(in srgb, var(--color-primary) 20%, transparent)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? "var(--color-danger)" : "var(--color-border)";
          e.target.style.boxShadow = "";
        }}
        className={className}
        {...props}
      />
      {error && (
        <span style={{ fontSize: "0.75rem", color: "var(--color-danger)" }}>{error}</span>
      )}
    </label>
  )
);
Input.displayName = "Input";

export const Select = React.forwardRef(
  ({ label, error, children, style, className = "", ...props }, ref) => (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem", width: "100%" }}>
      {label && (
        <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-muted)" }}>
          {label}
        </span>
      )}
      <div style={{ position: "relative" }}>
        <select
          ref={ref}
          style={{
            ...baseInputStyle,
            appearance: "none",
            paddingRight: "2rem",
            cursor: "pointer",
            ...(error ? { borderColor: "var(--color-danger)" } : {}),
            ...style,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--color-primary)";
            e.target.style.boxShadow = "0 0 0 2px color-mix(in srgb, var(--color-primary) 20%, transparent)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? "var(--color-danger)" : "var(--color-border)";
            e.target.style.boxShadow = "";
          }}
          className={className}
          {...props}
        >
          {children}
        </select>
        {/* Custom chevron */}
        <svg
          style={{
            position: "absolute",
            right: "0.625rem",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: "var(--color-text-muted)",
          }}
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {error && (
        <span style={{ fontSize: "0.75rem", color: "var(--color-danger)" }}>{error}</span>
      )}
    </label>
  )
);
Select.displayName = "Select";
