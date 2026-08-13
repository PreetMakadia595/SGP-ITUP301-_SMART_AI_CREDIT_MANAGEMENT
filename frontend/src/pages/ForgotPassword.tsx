/**
 * Forgot Password Page — React Hook Form + Zod Validation
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, Loader2, CheckCircle, Copy, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/schemas/authSchemas";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null);
    setSuccessMessage(null);
    setDevResetToken(null);
    try {
      const res = await forgotPassword(data.email);
      setSuccessMessage(res.message);
      if (res.reset_token) {
        setDevResetToken(res.reset_token);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ?? "Failed to request password reset. Please try again.";
      setServerError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  const copyToken = () => {
    if (devResetToken) {
      navigator.clipboard.writeText(devResetToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4">
      {/* ── Background Blobs ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="glass-card p-8 shadow-2xl border border-white/10">
          {/* ── Header ── */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mb-4">
              <Mail size={26} className="text-brand-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Forgot Password</h1>
            <p className="text-sm text-slate-400 mt-1 text-center">
              Enter your registered email address and we'll send reset instructions.
            </p>
          </div>

          {/* ── Server Error ── */}
          {serverError && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
              {serverError}
            </div>
          )}

          {/* ── Success Banner ── */}
          {successMessage ? (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-start gap-3">
                <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-300">Instructions Sent!</p>
                  <p className="mt-1 text-xs text-emerald-400/90">{successMessage}</p>
                </div>
              </div>

              {/* Developer Preview Token */}
              {devResetToken && (
                <div className="p-4 rounded-xl bg-surface-800/80 border border-brand-500/30 text-xs space-y-2">
                  <div className="flex items-center justify-between text-brand-300 font-medium">
                    <span>Developer Demo Reset Token:</span>
                    <button
                      type="button"
                      onClick={copyToken}
                      className="flex items-center gap-1 text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copied" : "Copy Token"}
                    </button>
                  </div>
                  <p className="font-mono text-slate-300 bg-surface-900 p-2 rounded border border-white/5 break-all">
                    {devResetToken}
                  </p>
                  <Link
                    to={`/reset-password?token=${encodeURIComponent(devResetToken)}`}
                    className="inline-block btn-primary w-full text-center text-xs py-2 mt-2"
                  >
                    Proceed to Reset Password
                  </Link>
                </div>
              )}

              <Link
                to="/login"
                className="btn-secondary w-full flex items-center justify-center gap-2 text-sm mt-4"
              >
                <ArrowLeft size={16} />
                Back to Sign in
              </Link>
            </div>
          ) : (
            /* ── Form ── */
            <form id="forgot-password-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className={`input-field pl-11 ${
                      errors.email ? "border-red-500/50 focus:border-red-500" : ""
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-400 animate-fade-in">{errors.email.message}</p>
                )}
              </div>

              <button
                id="forgot-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 font-medium transition-all shadow-glow hover:shadow-glow-lg disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  id="forgot-back-login-link"
                  className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
