import React from "react";
import { useTheme } from "../theme/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/5 transition-all"
      style={{
        border: "1px solid var(--color-border)",
        color: "var(--color-text-muted)",
      }}
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
