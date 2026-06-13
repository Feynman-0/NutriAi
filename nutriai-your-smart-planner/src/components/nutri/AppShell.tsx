import { Link, useRouterState } from "@tanstack/react-router";
import { Leaf, LayoutGrid, Sparkles, ClipboardList, BarChart3, User as UserIcon, Sun, Moon } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";

const NAV = [
  { to: "/dashboard", label: "Dashboard", mobile: "Home", icon: LayoutGrid },
  { to: "/generate", label: "Generate Plan", mobile: "Generate", icon: Sparkles },
  { to: "/plan", label: "My Plan", mobile: "Plan", icon: ClipboardList },
  { to: "/analytics", label: "Analytics", mobile: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", mobile: "Profile", icon: UserIcon },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[220px] flex-col bg-bg border-r border-divider px-6 py-8 z-40">
        <Link to="/dashboard" className="flex items-center gap-2 mb-12">
          <Leaf size={20} className="text-accent" />
          <span className="font-serif text-xl text-accent">NutriAI</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`relative pl-4 py-2.5 text-sm transition-colors ${
                  active ? "text-text" : "text-muted hover:text-text"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] bg-accent" />
                )}
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-6 border-t border-divider space-y-3">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="flex items-center gap-2 text-xs text-muted hover:text-text transition-colors w-full"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
          <div className="text-sm text-text truncate">{user?.name ?? "Guest"}</div>
          <button
            onClick={logout}
            className="text-xs text-muted hover:text-accent transition-colors"
          >
            Sign out →
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-11 bg-bg border-b border-divider flex items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-1.5">
          <Leaf size={16} className="text-accent" />
          <span className="font-serif text-base text-accent">NutriAI</span>
        </Link>
        <button
          onClick={toggle}
          className="text-muted hover:text-text transition-colors p-1"
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </header>

      {/* Main */}
      <main className="md:ml-[220px] pt-11 md:pt-0 pb-24 md:pb-12 min-h-screen">{children}</main>

      {/* Bottom tabs (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg border-t border-divider grid grid-cols-5">
        {NAV.map((n) => {
          const active = pathname === n.to;
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] ${
                active ? "text-accent" : "text-muted"
              }`}
            >
              <Icon size={18} />
              <span>{n.mobile}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
