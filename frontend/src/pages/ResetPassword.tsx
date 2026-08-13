/**
 * Reset Password Page — React Hook Form + Zod Validation
 */
import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/schemas/authSchemas";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const tokenParam = searchParams.get("token") || "";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenParam,
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (tokenParam) {
      setValue("token", tokenParam);
    }
  }, [tokenParam, setValue]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      const res = await resetPassword(data.token, data.newPassword);
      setSuccessMessage(res.message);
      setTimeout(() => {
        navigate("/login");
      }, 3500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ??
        "Failed to reset password. Token may be invalid or expired.";
      setServerError(typeof msg === "string" ? msg : JSON.stringify(msg));
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
              <KeyRound size={26} className="text-brand-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Reset Password</h1>
            <p className="text-sm text-slate-400 mt-1 text-center">
              Create a new secure password for your account.
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
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm space-y-3 animate-fade-in text-center">
              <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
              <p className="font-bold text-white text-base">Password Reset Successfully!</p>
              <p className="text-xs text-slate-300">{successMessage}</p>
              <p className="text-xs text-brand-400 font-medium pt-2">
                Redirecting to login in 3 seconds...
              </p>
              <Link to="/login" className="btn-primary w-full inline-block py-2 text-xs font-semibold">
                Sign in Now
              </Link>
            </div>
          ) : (
            /* ── Form ── */
            <form id="reset-password-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Reset Token Input */}
              <div>
                <label htmlFor="reset-token" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Reset Token
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                  <input
                    id="reset-token"
                    type="text"
                    placeholder="Enter reset token"
                    {...register("token")}
                    className={`input-field pl-11 ${
                      errors.token ? "border-red-500/50 focus:border-red-500" : ""
                    }`}
                  />
                </div>
                {errors.token && (
                  <p className="mt-1 text-xs text-red-400 animate-fade-in">{errors.token.message}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="reset-new-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                  <input
                    id="reset-new-password"
                    type={showPw ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    {...register("newPassword")}
                    className={`input-field pl-11 pr-11 ${
                      errors.newPassword ? "border-red-500/50 focus:border-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    id="reset-toggle-password"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors z-10"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-xs text-red-400 animate-fade-in">{errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label htmlFor="reset-confirm-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                  <input
                    id="reset-confirm-password"
                    type={showConfirmPw ? "text" : "password"}
                    placeholder="Re-enter new password"
                    {...register("confirmPassword")}
                    className={`input-field pl-11 pr-11 ${
                      errors.confirmPassword ? "border-red-500/50 focus:border-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    id="reset-toggle-confirm-password"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors z-10"
                  >
                    {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-400 animate-fade-in">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                id="reset-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 font-medium transition-all shadow-glow hover:shadow-glow-lg disabled:opacity-50 mt-2"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                {isSubmitting ? "Resetting Password..." : "Reset Password"}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  id="reset-back-login-link"
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Return to Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
