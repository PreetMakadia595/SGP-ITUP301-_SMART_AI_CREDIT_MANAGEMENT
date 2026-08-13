import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Zap, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, type RegisterFormData } from "@/schemas/authSchemas";
import { Button } from "@/components/ui/button";

export default function Register() {
  const { register: registerAuth, googleLogin } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await registerAuth({
        email: data.email,
        password: data.password,
        full_name: data.full_name || undefined,
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ?? "Registration failed. Please check your details and try again.";
      setServerError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  const handleGoogleSignUp = async () => {
    setServerError(null);
    setIsGoogleLoading(true);
    try {
      await googleLogin();
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? "Google registration failed. Please try again.";
      setServerError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4">
      {/* ── Background Glow ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="rounded-3xl border border-white/10 bg-surface-800/90 backdrop-blur-2xl p-8 shadow-2xl">
          {/* ── Header ── */}
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow mb-3">
              <Zap size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Your Account</h1>
            <p className="text-xs text-slate-400 mt-1">Join AI Usage Optimizer & optimize your AI workspace</p>
          </div>

          {/* ── Optional Google Sign-Up ── */}
          <div className="mb-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading || isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-2.5 bg-surface-700/50 hover:bg-surface-700 border border-white/10 rounded-xl transition-all"
            >
              {isGoogleLoading ? (
                <Loader2 size={18} className="animate-spin text-slate-400" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                  />
                </svg>
              )}
              <span className="text-sm font-semibold text-slate-200">Sign up with Google</span>
            </Button>
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface-800 px-3 text-slate-500 font-medium">Or email</span>
              </div>
            </div>
          </div>

          {/* ── Server Error ── */}
          {serverError && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs animate-fade-in flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* ── Form ── */}
          <form id="register-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="register-name" className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name <span className="text-slate-500">(Optional)</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                <input
                  id="register-name"
                  type="text"
                  placeholder="Jane Doe"
                  {...register("full_name")}
                  className={`input-field pl-11 ${
                    errors.full_name ? "border-red-500/50 focus:border-red-500" : ""
                  }`}
                />
              </div>
              {errors.full_name && (
                <p className="mt-1 text-xs text-red-400 animate-fade-in">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="register-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                <input
                  id="register-email"
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

            <div>
              <label htmlFor="register-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                <input
                  id="register-password"
                  type={showPw ? "text" : "password"}
                  placeholder="At least 8 characters"
                  {...register("password")}
                  className={`input-field pl-11 pr-11 ${
                    errors.password ? "border-red-500/50 focus:border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors z-10"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400 animate-fade-in">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="register-confirm-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                <input
                  id="register-confirm-password"
                  type={showConfirmPw ? "text" : "password"}
                  placeholder="Repeat password"
                  {...register("confirmPassword")}
                  className={`input-field pl-11 pr-11 ${
                    errors.confirmPassword ? "border-red-500/50 focus:border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
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

            <Button
              id="register-submit-btn"
              type="submit"
              disabled={isSubmitting || isGoogleLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          {/* ── Footer ── */}
          <p className="text-center text-xs text-slate-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              id="register-login-link"
              className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
