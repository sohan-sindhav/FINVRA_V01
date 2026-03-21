/**
 * ui/Button.jsx
 *
 * Variants:
 *   primary   — white fill (main CTA)
 *   secondary — dark fill with border (ghost-ish)
 *   danger    — red
 *   success   — green
 *   warning   — yellow
 *   ghost     — transparent, border only
 *
 * Sizes:  sm | md (default) | lg
 *
 * All values read from CSS custom properties (--radius-button, etc.)
 * so changing theme.js propagates everywhere automatically.
 */
import React from "react";

const variantStyles = {
  primary: `
    background: var(--color-primary);
    color: var(--color-primary-text);
    border: 2px solid var(--color-primary);
  `,
  secondary: `
    background: var(--color-secondary);
    color: var(--color-secondary-text);
    border: 1px solid var(--color-border);
  `,
  danger: `
    background: color-mix(in srgb, var(--color-danger) 15%, transparent);
    color: var(--color-danger);
    border: 1px solid color-mix(in srgb, var(--color-danger) 35%, transparent);
  `,
  success: `
    background: color-mix(in srgb, var(--color-success) 15%, transparent);
    color: var(--color-success);
    border: 1px solid color-mix(in srgb, var(--color-success) 35%, transparent);
  `,
  warning: `
    background: color-mix(in srgb, var(--color-warning) 15%, transparent);
    color: var(--color-warning);
    border: 1px solid color-mix(in srgb, var(--color-warning) 35%, transparent);
  `,
  info: `
    background: color-mix(in srgb, var(--color-info) 15%, transparent);
    color: var(--color-info);
    border: 1px solid color-mix(in srgb, var(--color-info) 35%, transparent);
  `,
  ghost: `
    background: transparent;
    color: var(--color-text-base);
    border: 1px solid var(--color-border);
  `,
};

const sizeStyles = {
  sm: `
    padding: 0.375rem 0.875rem;
    font-size: 0.75rem;
  `,
  md: `
    padding: var(--btn-padding-y) var(--btn-padding-x);
    font-size: var(--btn-font-size);
  `,
  lg: `
    padding: 0.75rem 2rem;
    font-size: 1rem;
  `,
};

const base = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: var(--radius-button);
  font-weight: var(--btn-font-weight);
  font-family: inherit;
  cursor: pointer;
  transition: filter var(--transition-speed) ease,
              background var(--transition-speed) ease,
              opacity var(--transition-speed) ease;
  line-height: 1.25;
  white-space: nowrap;
  outline: none;
`;

export const Button = React.forwardRef(
  (
    {
      variant = "secondary",
      size = "md",
      disabled = false,
      loading = false,
      children,
      style,
      className = "",
      ...props
    },
    ref
  ) => {
    const inlineStyle = `
      ${base}
      ${variantStyles[variant] || variantStyles.secondary}
      ${sizeStyles[size] || sizeStyles.md}
      ${disabled || loading ? "opacity: 0.55; cursor: not-allowed;" : ""}
    `;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={{ ...parseInlineStyle(inlineStyle), ...style }}
        onMouseEnter={(e) => {
          if (!disabled && !loading)
            e.currentTarget.style.filter = "brightness(1.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = "";
        }}
        className={className}
        {...props}
      >
        {loading ? <Spinner /> : children}
      </button>
    );
  }
);

Button.displayName = "Button";

// Tiny inline spinner
const Spinner = () => (
  <div
    style={{
      width: "1em",
      height: "1em",
      border: "2px solid currentColor",
      borderTopColor: "transparent",
      borderRadius: "50%",
      animation: "finvra-spin 0.7s linear infinite",
    }}
  />
);

// Inject keyframe once
if (typeof document !== "undefined" && !document.getElementById("finvra-btn-style")) {
  const s = document.createElement("style");
  s.id = "finvra-btn-style";
  s.textContent = `@keyframes finvra-spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(s);
}

/** Convert a CSS-in-template-literal string to a React style object */
function parseInlineStyle(cssText) {
  const obj = {};
  cssText
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((rule) => {
      const colon = rule.indexOf(":");
      if (colon === -1) return;
      const prop = rule.slice(0, colon).trim();
      const val  = rule.slice(colon + 1).trim();
      // Convert kebab-case to camelCase
      const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      obj[camel] = val;
    });
  return obj;
}
