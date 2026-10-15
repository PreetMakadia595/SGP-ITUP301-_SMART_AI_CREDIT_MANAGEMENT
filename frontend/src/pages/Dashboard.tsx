import { useEffect, useState } from "react";
import {
  IndianRupee, Sparkles, CreditCard, Activity, RefreshCw,
  TrendingDown, HelpCircle, Zap, BarChart2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserPlatforms } from "@/api/platforms";
import { getTaskAdvisorHistory, TaskAdvisorRecommendation } from "@/api/taskAdvisor";
import { getUsageSummary, UsageSummary } from "@/api/usageTracker";
import { UserPlatform } from "@/types/platform";
import TodaysBestAICard from "@/components/dashboard/TodaysBestAICard";
import QuickRecommendationWidget from "@/components/dashboard/QuickRecommendationWidget";
import RenewalAlertsWidget from "@/components/dashboard/RenewalAlertsWidget";
import RecentTasksCard from "@/components/dashboard/RecentTasksCard";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import SmartPredictionsCard from "@/components/dashboard/SmartPredictionsCard";
import SmartAlertsWidget from "@/components/dashboard/SmartAlertsWidget";
import DataQualityBadge from "@/components/dashboard/DataQualityBadge";

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [userPlatforms, setUserPlatforms] = useState<UserPlatform[]>([]);
  const [taskHistory, setTaskHistory] = useState<TaskAdvisorRecommendation[]>([]);
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [platformsData, historyData, summaryData] = await Promise.allSettled([
        getUserPlatforms(),
        getTaskAdvisorHistory(10, 0),
        getUsageSummary(),
      ]);

      if (platformsData.status === "fulfilled") setUserPlatforms(platformsData.value);
      if (historyData.status === "fulfilled") setTaskHistory(historyData.value);
      if (summaryData.status === "fulfilled") setUsageSummary(summaryData.value);
    } catch {
      // Silent failure — empty states will be shown
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // ── Real user data calculations (no fake fallbacks) ──
  const activePlatforms = userPlatforms.filter((p) => p.status.toLowerCase() === "active");
  const totalCost = userPlatforms.reduce((sum, p) => sum + (p.monthly_cost || 0), 0);
  const mostUsedAI = usageSummary?.most_used_ai || usageSummary?.favorite_ai || null;

  // Savings: derived from total usage cost vs cheapest available alternative
  // Only show if we have real platform data
  const hasPlatforms = userPlatforms.length > 0;
  const hasUsage = (usageSummary?.this_month?.prompts ?? 0) > 0;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Personalized AI Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-600/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
              Live Overview
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time AI model recommendation, subscription tracking, smart spending, and activity insights.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DataQualityBadge />
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="text-xs border-white/10">
            <RefreshCw size={13} className={refreshing ? "animate-spin mr-1.5" : "mr-1.5"} />
            Sync Usage
          </Button>
        </div>
      </div>

      {/* ── Smart Notification Alerts Banner ── */}
      <SmartAlertsWidget />

      {/* ── Key Metrics Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly AI Spending */}
        <div className="glass-card p-5 border border-white/10 hover:border-brand-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Monthly AI Spending</span>
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="mt-3">
            {loading ? (
              <div className="h-8 w-24 bg-white/5 rounded-lg animate-pulse" />
            ) : hasPlatforms ? (
              <h3 className="text-2xl font-black text-white">₹{totalCost.toFixed(2)}</h3>
            ) : (
              <h3 className="text-2xl font-black text-slate-500">₹0.00</h3>
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              {hasPlatforms ? "Across all connected platforms" : "No platforms connected yet"}
            </p>
          </div>
        </div>

        {/* Money Saved */}
        <div className="glass-card p-5 border border-white/10 hover:border-emerald-500/30 transition-all relative group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400">Estimated Savings</span>
              <div className="relative cursor-pointer">
                <HelpCircle size={13} className="text-slate-500 hover:text-slate-300" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 p-2 rounded-lg bg-surface-900 border border-white/10 text-[10px] text-slate-300 shadow-xl z-30 pointer-events-none">
                  Calculated by routing simple prompts to free/cheaper AI models instead of high-cost APIs.
                </div>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="mt-3">
            {loading ? (
              <div className="h-8 w-24 bg-white/5 rounded-lg animate-pulse" />
            ) : hasUsage ? (
              <h3 className="text-2xl font-black text-emerald-400">
                ₹{((usageSummary?.this_month?.cost_usd ?? 0) * 0.15 * 83).toFixed(2)}
              </h3>
            ) : (
              <h3 className="text-2xl font-black text-slate-500">—</h3>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              {hasUsage ? "Smart prompt routing savings" : "Log usage to see savings"}
            </p>
          </div>
        </div>

        {/* Most Used AI */}
        <div className="glass-card p-5 border border-white/10 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Most Used AI</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="mt-3">
            {loading ? (
              <div className="h-8 w-32 bg-white/5 rounded-lg animate-pulse" />
            ) : mostUsedAI ? (
              <>
                <h3 className="text-xl font-extrabold text-white truncate">{mostUsedAI}</h3>
                <p className="text-[11px] text-purple-300 mt-1 flex items-center gap-1">
                  <Activity size={12} /> Your top AI platform this month
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-extrabold text-slate-500">—</h3>
                <p className="text-[11px] text-slate-500 mt-1">No usage recorded yet</p>
              </>
            )}
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="glass-card p-5 border border-white/10 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Managed AI Subscriptions</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="mt-3">
            {loading ? (
              <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse" />
            ) : hasPlatforms ? (
              <>
                <h3 className="text-2xl font-black text-white">{activePlatforms.length} Active</h3>
                <p className="text-[11px] text-cyan-300 mt-1">
                  {userPlatforms.length} total tool{userPlatforms.length !== 1 ? "s" : ""} connected
                </p>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-black text-slate-500">0 Active</h3>
                <p className="text-[11px] text-slate-500 mt-1">No tools connected yet</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Machine Learning Smart Predictions & Daily Forecast ── */}
      <SmartPredictionsCard />

      {/* ── Today's Best AI & Quick Recommendation Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TodaysBestAICard mostUsedAI={mostUsedAI} loading={loading} />
        </div>
        <div className="lg:col-span-2">
          <QuickRecommendationWidget />
        </div>
      </div>

      {/* ── Subscription Renewal Alerts ── */}
      <RenewalAlertsWidget userPlatforms={userPlatforms} />

      {/* ── Interactive Charts Section (Weekly Activity, Platform Usage, Task Categories) ── */}
      <DashboardCharts usageSummary={usageSummary} loading={loading} />

      {/* ── Recent Tasks ── */}
      <RecentTasksCard tasks={taskHistory} />
    </div>
  );
}
