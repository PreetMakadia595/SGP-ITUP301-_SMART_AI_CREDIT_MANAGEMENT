import React, { useState } from "react";
import { Key, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, XCircle } from "lucide-react";
import { ProviderStatus, connectProvider, disconnectProvider } from "@/api/providers";

interface Props {
  providers: ProviderStatus[];
  onRefresh: () => void;
}

export default function ConnectedProvidersWidget({ providers, onRefresh }: Props) {
  const [selectedProvider, setSelectedProvider] = useState<ProviderStatus | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider || !apiKeyInput.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      await connectProvider(selectedProvider.provider_slug, apiKeyInput.trim());
      setSelectedProvider(null);
      setApiKeyInput("");
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Failed to validate API key");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (slug: string) => {
    if (!confirm(`Are you sure you want to disconnect ${slug}?`)) return;
    try {
      await disconnectProvider(slug);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-surface-800 border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-brand-400" size={20} />
            Connected AI Providers
          </h3>
          <p className="text-xs text-slate-400">
            Official API key integrations with encrypted credentials
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 rounded-xl bg-surface-700 hover:bg-surface-600 text-slate-300 transition-colors"
          title="Refresh Providers"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((p) => (
          <div
            key={p.provider_slug}
            className="p-4 rounded-xl bg-surface-700/50 border border-white/5 flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{p.provider_name}</h4>
                  {p.is_connected ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                      <CheckCircle2 size={10} /> Connected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 text-[10px] font-semibold">
                      Disconnected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  {p.is_connected ? p.masked_key : "No API key configured"}
                </p>
              </div>

              {/* Billing Status Badge */}
              {p.supports_billing_api ? (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-medium" title="Official Billing API Supported">
                  Billing API: Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-medium flex items-center gap-1" title="Billing endpoint not publicly exposed by provider API">
                  <HelpCircle size={10} /> Billing: Not Supported
                </span>
              )}
            </div>

            {/* Model List Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {p.available_models.slice(0, 3).map((m) => (
                <span key={m} className="px-2 py-0.5 rounded bg-surface-600/70 text-slate-300 text-[10px]">
                  {m}
                </span>
              ))}
              {p.available_models.length > 3 && (
                <span className="px-1.5 py-0.5 text-slate-500 text-[10px]">
                  +{p.available_models.length - 3} more
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
              <span className="text-slate-400 text-[11px]">
                Sync: {p.last_sync_at}
              </span>

              {p.is_connected ? (
                <button
                  onClick={() => handleDisconnect(p.provider_slug)}
                  className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium transition-colors"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => setSelectedProvider(p)}
                  className="px-3 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium shadow-glow transition-all flex items-center gap-1"
                >
                  <Key size={12} /> Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Connect Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-800 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Connect {selectedProvider.provider_name} API Key
              </h3>
              <button
                onClick={() => setSelectedProvider(null)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your API key will be encrypted at rest using Fernet 256-bit encryption. It is validated directly with {selectedProvider.provider_name} before saving.
            </p>

            {!selectedProvider.supports_billing_api && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-amber-400" />
                <span>
                  Note: {selectedProvider.provider_name} does not expose public billing endpoints via API. Usage & credits will show as <strong>"Not Supported"</strong> where applicable.
                </span>
              </div>
            )}

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  required
                  placeholder={`Paste your ${selectedProvider.provider_name} API key...`}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-700 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProvider(null)}
                  className="px-4 py-2 rounded-xl bg-surface-700 text-slate-300 hover:bg-surface-600 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-gradient-brand text-white text-xs font-medium shadow-glow hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Validating & Saving..." : "Validate & Connect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
