import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Users, ArrowLeftRight, Landmark, Blocks, CreditCard, NotebookPen, Shield, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { to: "/connections", label: "Connections", icon: Users, id: "connections" },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight, id: "transactions" },
  { to: "/bankacc", label: "Bank Accounts", icon: Landmark, id: "bankacc" },
  { to: "/ipo", label: "IPO Manager", icon: Blocks, id: "ipo" },
  { to: "/pan-manager", label: "PAN Manager", icon: CreditCard, id: "pan" },
  { to: "/rough-notes", label: "Money Diary", icon: NotebookPen, id: "money_diary" },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isAdmin = user?.role === "admin";
  const enabledModules = user?.enabledModules || [];
  
  // Admins only see the Audit Logs (which is their Dashboard at '/')
  const visibleLinks = isAdmin 
    ? [{ to: "/", label: "Audit Logs", icon: Shield, id: "admin_logs" }]
    : NAV_LINKS.filter(link => enabledModules.includes(link.id));

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <div
        className="hidden md:flex flex-col h-full shrink-0"
        style={{
          width: "var(--sidebar-width)",
          background: "var(--color-sidebar-bg)",
          color: "var(--color-text-base)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--color-text-muted)",
            padding: "1.1rem 1.25rem 0.75rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          {isAdmin ? "Admin Portal" : "Navigation"}
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.2rem",
            padding: "0.75rem",
          }}
        >
          {visibleLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={label}
                to={to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  padding: "0.6rem 1rem",
                  borderRadius: "var(--radius-card)",
                  fontSize: "0.875rem",
                  fontWeight: active ? 600 : 400,
                  textDecoration: "none",
                  color: active
                    ? "var(--color-primary-text)"
                    : "var(--color-text-muted)",
                  background: active ? "var(--color-primary)" : "transparent",
                  transition: "all var(--transition-speed)",
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center overflow-x-auto no-scrollbar"
        style={{
          background: "var(--color-sidebar-bg)",
          borderTop: "1px solid var(--color-border)",
          padding: "0.5rem 0.25rem",
          gap: "0.25rem",
        }}
      >
        {visibleLinks.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={label}
              to={to}
              className="flex-shrink-0 min-w-[70px]"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.2rem",
                padding: "0.4rem 0.5rem",
                textDecoration: "none",
                color: active
                  ? "var(--color-text-base)"
                  : "var(--color-text-muted)",
                fontSize: "0.6rem",
                fontWeight: active ? 600 : 400,
                transition: "color var(--transition-speed)",
              }}
            >
              <Icon size={18} />
              <span className="whitespace-nowrap">{label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default Sidebar;
