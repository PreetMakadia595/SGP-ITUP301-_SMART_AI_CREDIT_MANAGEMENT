/**
 * CreditGauge — Donut chart showing used vs remaining credits for a service
 */
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface CreditGaugeProps {
  serviceName: string;
  serviceColor: string;
  creditsUsed: number;
  creditsRemaining: number;
  totalCost?: number;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{name: string; value: number}> }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs">
        <p className="text-slate-300">
          <span className="font-semibold">{payload[0].name}:</span> {payload[0].value.toFixed(1)}
        </p>
      </div>
    );
  }
  return null;
};

export default function CreditGauge({
  serviceName,
  serviceColor,
  creditsUsed,
  creditsRemaining,
  totalCost,
}: CreditGaugeProps) {
  const total = creditsUsed + creditsRemaining;
  const usagePct = total > 0 ? Math.round((creditsUsed / total) * 100) : 0;

  const data = [
    { name: "Used",      value: creditsUsed },
    { name: "Remaining", value: creditsRemaining },
  ];

  return (
    <div className="glass-card p-4 hover:border-white/10 transition-all duration-200 animate-fade-in">
      {/* ── Service Header ── */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: serviceColor, boxShadow: `0 0 8px ${serviceColor}` }}
        />
        <span className="text-sm font-semibold text-slate-200 truncate">{serviceName}</span>
      </div>

      {/* ── Donut Chart ── */}
      <div className="relative h-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={52}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={serviceColor} opacity={0.9} />
              <Cell fill="rgba(255,255,255,0.06)" />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* ── Center percentage ── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-white">{usagePct}%</span>
          <span className="text-xs text-slate-500">used</span>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="mt-3 space-y-1 text-xs text-slate-400">
        <div className="flex justify-between">
          <span>Used:</span>
          <span className="text-slate-200 font-medium">{creditsUsed.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span>Remaining:</span>
          <span className="text-slate-200 font-medium">{creditsRemaining.toFixed(1)}</span>
        </div>
        {totalCost !== undefined && (
          <div className="flex justify-between pt-1 border-t border-white/5">
            <span>Cost:</span>
            <span className="text-brand-400 font-semibold">₹{totalCost.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
