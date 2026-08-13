/**
 * Settings Page — Embedded Profile, Security, and App Preferences
 */
import { useState } from "react";
import { User2, Shield, Bell, Palette } from "lucide-react";
import Profile from "@/pages/Profile";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<"profile" | "preferences">("profile");

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      {/* ── Sub Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          id="settings-tab-profile"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "profile"
              ? "bg-brand-600/20 text-brand-300 border border-brand-500/30 shadow-glow"
              : "text-slate-400 hover:text-white hover:bg-surface-800"
          }`}
        >
          <User2 size={15} />
          Profile & Security
        </button>
        <button
          id="settings-tab-preferences"
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "preferences"
              ? "bg-brand-600/20 text-brand-300 border border-brand-500/30 shadow-glow"
              : "text-slate-400 hover:text-white hover:bg-surface-800"
          }`}
        >
          <Bell size={15} />
          Preferences & Notifications
        </button>
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "profile" ? (
        <Profile />
      ) : (
        <div className="max-w-2xl space-y-5 animate-fade-in">
          {/* ── Notifications ── */}
          <div className="glass-card p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
              <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center">
                <Bell size={16} className="text-brand-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-100">Notification Alerts</h3>
            </div>

            <div className="space-y-4">
              {[
                { label: "Credit threshold alerts", desc: "Get notified when credits drop below 20%" },
                { label: "Weekly usage report", desc: "Summary of your weekly AI platform spend" },
                { label: "AI Advisor recommendations", desc: "Personalized optimization suggestions" },
              ].map(({ label, desc }) => (
                <label key={label} className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                      {label}
                    </p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-10 h-5 bg-surface-600 rounded-full peer peer-checked:bg-brand-600 transition-colors duration-200" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-5" />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* ── Appearance ── */}
          <div className="glass-card p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
              <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center">
                <Palette size={16} className="text-brand-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-100">Appearance & Theme</h3>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Theme</p>
                <p className="text-xs text-slate-500">Currently: Dark (default)</p>
              </div>
              <div className="flex gap-2">
                {["Dark", "Light"].map((t) => (
                  <button
                    key={t}
                    id={`settings-theme-${t.toLowerCase()}-btn`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      t === "Dark"
                        ? "bg-brand-600/20 border-brand-600/40 text-brand-300"
                        : "bg-surface-700 border-white/10 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
