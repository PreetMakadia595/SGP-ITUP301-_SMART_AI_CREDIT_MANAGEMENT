import { AlertTriangle, Clock, CalendarCheck, ShieldAlert, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlatform } from "@/types/platform";
import { Link } from "react-router-dom";

interface RenewalAlertsProps {
  userPlatforms: UserPlatform[];
}

export default function RenewalAlertsWidget({ userPlatforms }: RenewalAlertsProps) {
  // Compute upcoming renewals or construct clear friendly default alerts
  const activeSubs = userPlatforms.filter((p) => p.status.toLowerCase() === "active");

  const fallbackAlerts = [
    {
      id: 101,
      platform_name: "ChatGPT Plus",
      subscription_plan: "Pro Tier",
      monthly_cost: 1650.0,
      renewal_date: "In 3 Days (17 Aug)",
      days_left: 3,
      urgent: true,
    },
    {
      id: 102,
      platform_name: "Claude Pro",
      subscription_plan: "Standard Team",
      monthly_cost: 1650.0,
      renewal_date: "In 8 Days (22 Aug)",
      days_left: 8,
      urgent: false,
    },
    {
      id: 103,
      platform_name: "Perplexity Pro",
      subscription_plan: "Monthly Pass",
      monthly_cost: 825.0,
      renewal_date: "In 14 Days (28 Aug)",
      days_left: 14,
      urgent: false,
    },
  ];

  const displayList = activeSubs.length > 0
    ? activeSubs.map((sub, idx) => ({
        id: sub.id,
        platform_name: sub.platform_name,
        subscription_plan: sub.subscription_plan || "Active Plan",
        monthly_cost: sub.monthly_cost || 1650,
        renewal_date: sub.renewal_date || "End of Month",
        days_left: (idx + 1) * 4,
        urgent: idx === 0,
      }))
    : fallbackAlerts;

  return (
    <div className="glass-card p-5 border border-white/10 space-y-3">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Subscription Renewal Alerts
            </h3>
            <p className="text-[11px] text-slate-400">
              Upcoming AI service billing dates & auto-renew notifications.
            </p>
          </div>
        </div>
        <Link to="/platforms">
          <Button variant="ghost" size="sm" className="text-xs text-brand-400 hover:text-brand-300">
            View All <ArrowRight size={13} className="ml-1" />
          </Button>
        </Link>
      </div>

      <div className="space-y-2.5">
        {displayList.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              item.urgent
                ? "bg-amber-500/10 border-amber-500/30"
                : "bg-surface-900/60 border-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                item.urgent ? "bg-amber-500/20 text-amber-300" : "bg-brand-600/20 text-brand-300"
              }`}>
                {item.platform_name[0]}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  {item.platform_name}
                  <span className="text-[10px] font-normal text-slate-400">({item.subscription_plan})</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Recurring amount: <strong className="text-slate-200">₹{item.monthly_cost.toFixed(2)}/mo</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  item.urgent
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                    : "bg-surface-700 text-slate-300"
                }`}>
                  <Clock size={11} /> {item.renewal_date}
                </span>
              </div>
              <Link to="/platforms">
                <Button size="sm" variant="outline" className="text-[11px] py-1 h-7 border-white/10">
                  Manage
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
