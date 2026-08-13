/**
 * Top Navigation Bar with User Profile & Logout Menu
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Bell, Search, Menu, User, LogOut, Settings } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";

interface TopNavProps {
  onMenuToggle?: () => void;
  title?: string;
}

export default function TopNav({ onMenuToggle, title = "Dashboard" }: TopNavProps) {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-surface-800/80 backdrop-blur-md border-b border-white/5 flex items-center px-6 gap-4 sticky top-0 z-40">
      {/* ── Menu Toggle ── */}
      <button
        id="topnav-menu-btn"
        onClick={onMenuToggle}
        className="btn-ghost p-2 lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      {/* ── Page Title ── */}
      <h1 className="text-lg font-semibold text-slate-100 flex-1">{title}</h1>

      {/* ── Search ── */}
      <div className="hidden md:flex items-center gap-2 bg-surface-700 border border-white/10 rounded-xl px-4 py-2 w-56 focus-within:border-brand-500/50 transition-colors">
        <Search size={15} className="text-slate-500" />
        <input
          id="topnav-search"
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm text-slate-300 placeholder-slate-500 outline-none w-full"
        />
      </div>

      {/* ── Notifications ── */}
      <button id="topnav-notifications-btn" className="btn-ghost p-2 relative" aria-label="Notifications">
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-surface-800" />
      </button>

      {/* ── Avatar Dropdown ── */}
      <div className="relative">
        <button
          id="topnav-avatar-btn"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 focus:outline-none"
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border border-brand-500/50 shadow-glow"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div
              id="topnav-avatar"
              className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:opacity-90 transition-opacity shadow-glow"
            >
              {(user?.full_name ?? user?.email ?? "U")[0].toUpperCase()}
            </div>
          )}
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-56 glass-card p-2 shadow-2xl border border-white/10 z-50 animate-fade-in space-y-1">
              <div className="px-3 py-2 border-b border-white/5 mb-1">
                <p className="text-xs font-semibold text-white truncate">{user?.full_name ?? "User Account"}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-surface-700/60 rounded-lg transition-colors"
              >
                <User size={14} className="text-brand-400" />
                User Profile
              </Link>

              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-surface-700/60 rounded-lg transition-colors"
              >
                <Settings size={14} className="text-brand-400" />
                Settings
              </Link>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
