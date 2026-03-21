/**
 * theme.js  ─  Single source of truth for all design tokens
 *
 * Change anything here → every component that uses the tokens updates.
 * Tokens map to CSS custom properties set on :root by ThemeContext.
 */

export const defaultTheme = {
  // ── Brand / accent ────────────────────────────────────────────────
  colorPrimary:      "#ffffff",   // main CTA bg (white pill buttons)
  colorPrimaryText:  "#000000",   // text on primary bg
  colorSecondary:    "#1f1f1f",   // ghost / secondary button bg
  colorSecondaryText:"#ffffff",

  // ── Status colours ────────────────────────────────────────────────
  colorSuccess:  "#22c55e",
  colorDanger:   "#ef4444",
  colorWarning:  "#eab308",
  colorInfo:     "#3b82f6",

  // ── Backgrounds ───────────────────────────────────────────────────
  colorBgPage:      "#080808",   // outermost app bg
  colorBgSurface:   "#141414",   // page content area bg
  colorBgCard:      "#1f1f1f",   // cards, modals
  colorBgElevated:  "#2a2a2a",   // inputs, hover states

  // ── Text ──────────────────────────────────────────────────────────
  colorTextBase:   "#ffffff",
  colorTextMuted:  "#6b7280",
  colorTextFaint:  "#374151",

  // ── Borders ───────────────────────────────────────────────────────
  colorBorder:        "#374151",   // gray-700
  colorBorderStrong:  "#6b7280",

  // ── Border radius ─────────────────────────────────────────────────
  //  Change radiusButton to "0.5rem" for squarer or "9999px" for pill
  radiusButton:  "9999px",   // pill shape by default
  radiusCard:    "1rem",     // 16px
  radiusModal:   "1rem",
  radiusInput:   "0.5rem",   // 8px

  // ── Spacing (button padding) ───────────────────────────────────────
  btnPaddingX:  "1.5rem",   // px-6
  btnPaddingY:  "0.625rem", // py-2.5
  btnFontSize:  "0.875rem", // text-sm
  btnFontWeight:"600",

  // ── Sidebar ───────────────────────────────────────────────────────
  sidebarWidth: "14rem",    // 224px
  colorSidebarBg: "#080808",

  // ── Navbar ────────────────────────────────────────────────────────
  colorNavbarBg: "#080808",
  navbarHeight:  "56px",

  // ── Transition ────────────────────────────────────────────────────
  transitionSpeed: "200ms",

  // ── Shadow ────────────────────────────────────────────────────────
  shadowCard: "0 4px 24px 0 rgba(0,0,0,0.4)",
};

/** Converts token object → CSS custom properties string */
export const tokensToCSSVars = (tokens) =>
  Object.entries(tokens)
    .map(([k, v]) => `--${camelToKebab(k)}: ${v};`)
    .join("\n  ");

const camelToKebab = (str) =>
  str.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
