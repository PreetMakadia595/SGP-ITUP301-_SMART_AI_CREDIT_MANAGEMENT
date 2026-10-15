/**
 * App Router — Routes for Auth & App
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout      from "@/layouts/AppLayout";
import Login          from "@/pages/Login";
import Register       from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword  from "@/pages/ResetPassword";
import Dashboard      from "@/pages/Dashboard";
import Profile        from "@/pages/Profile";
import Settings       from "@/pages/Settings";
import Platforms      from "@/pages/Platforms";
import Credits        from "@/pages/Credits";
import Analytics      from "@/pages/Analytics";
import TaskAdvisor   from "@/pages/TaskAdvisor";
import BudgetPlanner from "@/pages/BudgetPlanner";
import WorkflowPlanner from "@/pages/WorkflowPlanner";
import Notifications from "@/pages/Notifications";
import PersonalAssistant from "@/pages/PersonalAssistant";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Auth Routes ── */}
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* ── Protected Routes (require JWT authentication) ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/assistant" element={<PersonalAssistant />} />
            <Route path="/platforms" element={<Platforms />} />
            <Route path="/profile"   element={<Profile />} />
            <Route path="/settings"  element={<Settings />} />
            <Route path="/credits"   element={<Credits />} />
            <Route path="/analytics"        element={<Analytics />} />
            <Route path="/recommendations"  element={<BudgetPlanner />} />
            <Route path="/budget-planner"   element={<BudgetPlanner />} />
            <Route path="/workflow-planner" element={<WorkflowPlanner />} />
            <Route path="/notifications"    element={<Notifications />} />
            <Route path="/task-advisor"     element={<TaskAdvisor />} />
          </Route>
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/* Temporary placeholder for Phase 2 pages */
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-96 gap-4 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow">
        <span className="text-2xl">🚀</span>
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="text-slate-400 text-sm text-center max-w-xs">
        This section is coming in Phase 2 with full ML-powered features.
      </p>
      <span className="px-3 py-1 rounded-full bg-brand-600/20 border border-brand-600/30 text-brand-300 text-xs font-medium">
        Coming Soon
      </span>
    </div>
  );
}
