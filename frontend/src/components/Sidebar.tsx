import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Layers,
  CreditCard,
  BarChart3,
  Activity,
  Sparkles,
  Settings,
  Zap,
  User,
  LogOut,
  MessageSquareText,
  GitFork,
  Bell,
  Bot,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/",                 label: "Dashboard",        icon: LayoutDashboard },
  { to: "/assistant",        label: "AI Advisor",       icon: Bot },
  { to: "/workflow-planner", label: "Workflow Planner", icon: GitFork },
  { to: "/budget-planner",   label: "Budget Planner",   icon: Sparkles },
  { to: "/notifications",    label: "Notifications",    icon: Bell },
  { to: "/platforms",        label: "AI Tools",         icon: Layers },
  { to: "/credits",          label: "Subscriptions",    icon: CreditCard },
  { to: "/analytics",        label: "Usage & Costs",    icon: BarChart3 },
  { to: "/task-advisor",     label: "Task Advisor",     icon: MessageSquareText },
  { to: "/profile",          label: "User Profile",     icon: User },
  { to: "/settings",         label: "Settings",         icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const { logout, user } = useAuth();

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-surface-800 border-r border-white/5 transition-all duration-300 z-30 shrink-0",
        collapsed ? "w-16" : "w-[260px]"
      )}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
          <Zap size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in min-w-0">
            <p className="text-sm font-bold text-white leading-tight truncate">
              AI Usage
            </p>
            <p className="text-xs text-brand-400 font-medium truncate">Optimizer</p>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-brand-600/20 text-white border border-brand-500/30 shadow-glow-sm"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
              )
            }
            id={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="animate-fade-in truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ── User Footer ── */}
      <div className="px-3 py-4 border-t border-white/5 space-y-2">
        {!collapsed && user && (
          <NavLink
            to="/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-700/50 hover:bg-surface-700 transition-colors"
          >
            <Avatar
              fallback={(user.full_name || user.email || "U")[0]}
              className="w-8 h-8 text-xs"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-100 truncate">
                {user.full_name || "User Profile"}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
          </NavLink>
        )}
        <button
          id="sidebar-logout-btn"
          onClick={logout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          )}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
