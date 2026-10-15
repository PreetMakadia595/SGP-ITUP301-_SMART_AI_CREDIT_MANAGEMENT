import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import AssistantDrawer from "@/components/AssistantDrawer";

const PAGE_TITLES: Record<string, string> = {
  "/":               "Dashboard Overview",
  "/assistant":      "AI Personal Assistant",
  "/platforms":      "AI Tools & Platforms",
  "/credits":        "AI Subscriptions",
  "/analytics":      "Usage & Cost Analytics",
  "/recommendations":"AI Tool Optimizer",
  "/budget-planner": "AI Budget Planner",
  "/workflow-planner": "AI Workflow Planner",
  "/notifications":  "Smart Notifications Hub",
  "/task-advisor":   "Smart Task Advisor",
  "/profile":        "User Profile",
  "/settings":       "Settings",
};

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? "AI Usage Optimizer";

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900 font-sans text-slate-100 antialiased">
      {/* ── Sidebar Navigation ── */}
      <Sidebar collapsed={collapsed} />

      {/* ── Main Work Area ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav
          title={title}
          onMenuToggle={() => setCollapsed((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          <Outlet />
        </main>
      </div>

      {/* ── Global Floating Personal Advisor Launcher ── */}
      <AssistantDrawer />
    </div>
  );
}
