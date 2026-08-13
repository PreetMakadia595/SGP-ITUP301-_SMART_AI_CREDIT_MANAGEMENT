import { useEffect, useState } from "react";
import {
  IndianRupee, Sparkles, CreditCard, Activity, RefreshCw,
  Search, ArrowUpRight, ShieldCheck, Zap
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { getUserPlatforms } from "@/api/platforms";
import { UserPlatform } from "@/types/platform";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [taskQuery, setTaskQuery] = useState("");
  const [userPlatforms, setUserPlatforms] = useState<UserPlatform[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getUserPlatforms();
      setUserPlatforms(data);
    } catch {
      // Fallback
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

  const activePlatforms = userPlatforms.filter((p) => p.status.toLowerCase() === "active");
  const totalCost = userPlatforms.reduce((sum, p) => sum + (p.monthly_cost || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Page Title & Action ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Usage Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor AI assistant usage, cost allocation, and subscription status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? "animate-spin mr-1.5" : "mr-1.5"} />
            Sync Data
          </Button>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Monthly Cost</span>
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white">₹{totalCost > 0 ? totalCost.toFixed(2) : "0.00"}</h3>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <ArrowUpRight size={12} /> {activePlatforms.length} Active Subscriptions
            </p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Managed AI Tools</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Zap size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white">{userPlatforms.length} Tools</h3>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              {userPlatforms.length > 0
                ? userPlatforms.map((p) => p.platform_name).join(", ")
                : "No tools registered yet"}
            </p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Monthly Prompts</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Activity size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white">1,420</h3>
            <p className="text-[11px] text-purple-300 mt-1">~47 prompts / day</p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Top Utilized Assistant</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white">
              {userPlatforms.length > 0 ? userPlatforms[0].platform_name : "ChatGPT"}
            </h3>
            <p className="text-[11px] text-amber-300 mt-1">Primary active assistant</p>
          </div>
        </Card>
      </div>

      {/* ── AI Assistant Tool Selector (Skeleton for future recommendations) ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="text-brand-400" size={18} />
                Smart AI Assistant Selector
              </CardTitle>
              <CardDescription>
                Enter your task requirements below to select the optimal AI tool based on cost and capability.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[11px] border-brand-500/40 text-brand-300">
              Tool Selector Ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <Input
                placeholder="e.g., Write python script for data processing, Analyze 50-page PDF..."
                value={taskQuery}
                onChange={(e) => setTaskQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="shrink-0">
              <Sparkles size={16} className="mr-2" />
              Analyze Task
            </Button>
          </div>
          <div className="rounded-xl border border-dashed border-white/10 bg-surface-900/40 p-4 text-center">
            <p className="text-xs text-slate-400">
              AI recommendation engine will be connected in the next phase. Enter a prompt above to preview tool requirements.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Subscriptions & Usage Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Managed Subscriptions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard size={18} className="text-brand-400" />
                Managed AI Subscriptions
              </CardTitle>
              <Link to="/platforms">
                <Button variant="ghost" size="sm" className="text-xs text-brand-400 hover:text-brand-300">
                  Manage Subscriptions →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {userPlatforms.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <p className="text-xs text-slate-400">No subscriptions added yet.</p>
                <Link to="/platforms">
                  <Button size="sm" variant="outline">
                    + Add Your First AI Subscription
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {userPlatforms.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-surface-900/60 border border-white/5 gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar fallback={sub.platform_name[0]} className="w-9 h-9 text-xs" />
                      <div>
                        <h4 className="text-sm font-bold text-white">{sub.platform_name}</h4>
                        <p className="text-xs text-slate-400">
                          {sub.subscription_plan} • ₹{sub.monthly_cost.toFixed(2)}/mo
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-mono">Renews: {sub.renewal_date}</span>
                      <Badge
                        variant={sub.status.toLowerCase() === "active" ? "success" : "secondary"}
                      >
                        {sub.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              Account Manager Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <p className="font-semibold text-emerald-300">AI Subscription Tracking Active</p>
              <p className="text-slate-400 text-[11px]">
                Subscriptions, costs, renewal dates, and status are tracked per user.
              </p>
            </div>
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex justify-between">
                <span className="text-slate-400">CRUD APIs:</span>
                <span className="font-semibold text-emerald-400">Enabled (/api/v1/platforms)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Database Notes:</span>
                <span className="font-semibold text-slate-200">Supported</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Search & Filters:</span>
                <span className="font-semibold text-slate-200">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
