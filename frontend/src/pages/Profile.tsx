/**
 * Profile Page — Manage User Profile & Password Change with React Hook Form + Zod
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User2,
  Mail,
  Shield,
  Save,
  Loader2,
  Image as ImageIcon,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Calendar,
  Key,
  Copy,
  Check,
  Chrome
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  profileUpdateSchema,
  changePasswordSchema,
  type ProfileUpdateFormData,
  type ChangePasswordFormData,
} from "@/schemas/authSchemas";

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const [copiedToken, setCopiedToken] = useState(false);

  const handleCopyExtensionToken = () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigator.clipboard.writeText(token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 3000);
    }
  };

  // ── Profile Update State ──
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // ── Change Password State ──
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmNewPw, setShowConfirmNewPw] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Profile Form (RHF + Zod)
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    watch: watchProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      full_name: user?.full_name ?? "",
      avatar_url: user?.avatar_url ?? "",
    },
  });

  const watchAvatar = watchProfile("avatar_url");

  const onProfileSubmit = async (data: ProfileUpdateFormData) => {
    setProfileSuccess(null);
    setProfileError(null);
    try {
      await updateProfile({
        full_name: data.full_name || undefined,
        avatar_url: data.avatar_url || undefined,
      });
      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? "Failed to update profile.";
      setProfileError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  // Password Form (RHF + Zod)
  const {
    register: registerPw,
    handleSubmit: handlePwSubmit,
    reset: resetPwForm,
    formState: { errors: pwErrors, isSubmitting: isSubmittingPw },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setPasswordSuccess(null);
    setPasswordError(null);
    try {
      const res = await changePassword(data.currentPassword, data.newPassword);
      setPasswordSuccess(res.message || "Password changed successfully!");
      resetPwForm();
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? "Failed to change password.";
      setPasswordError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in pb-8">
      {/* ── Profile Header Card ── */}
      <div className="glass-card p-6 border border-white/10 flex items-center gap-5">
        <div className="relative">
          {watchAvatar || user?.avatar_url ? (
            <img
              src={watchAvatar || user?.avatar_url || ""}
              alt="Avatar"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-500/50 shadow-glow"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-brand flex items-center justify-center text-3xl font-bold text-white shadow-glow">
              {(user?.full_name || user?.email || "U")[0].toUpperCase()}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">{user?.full_name || "User Profile"}</h2>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Calendar size={13} className="text-brand-400" />
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 font-medium">
              {user?.is_superuser ? "Admin" : "Active User"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Edit Profile Form ── */}
      <div className="glass-card p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
            <User2 size={18} className="text-brand-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Profile Details</h3>
            <p className="text-xs text-slate-400">Update your name and profile avatar</p>
          </div>
        </div>

        {profileSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle size={15} />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle size={15} />
            <span>{profileError}</span>
          </div>
        )}

        <form id="profile-details-form" onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="profile-full-name" className="block text-xs font-medium text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
              <input
                id="profile-full-name"
                type="text"
                placeholder="John Doe"
                {...registerProfile("full_name")}
                className={`input-field pl-11 ${
                  profileErrors.full_name ? "border-red-500/50" : ""
                }`}
              />
            </div>
            {profileErrors.full_name && (
              <p className="mt-1 text-xs text-red-400">{profileErrors.full_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="profile-email-read-only" className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address <span className="text-slate-500">(Primary ID)</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
              <input
                id="profile-email-read-only"
                type="email"
                value={user?.email ?? ""}
                readOnly
                className="input-field pl-11 opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label htmlFor="profile-avatar-url" className="block text-xs font-medium text-slate-300 mb-1.5">
              Avatar Image URL
            </label>
            <div className="relative">
              <ImageIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
              <input
                id="profile-avatar-url"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                {...registerProfile("avatar_url")}
                className={`input-field pl-11 ${
                  profileErrors.avatar_url ? "border-red-500/50" : ""
                }`}
              />
            </div>
            {profileErrors.avatar_url && (
              <p className="mt-1 text-xs text-red-400">{profileErrors.avatar_url.message}</p>
            )}
          </div>

          <button
            id="profile-save-btn"
            type="submit"
            disabled={isSubmittingProfile}
            className="btn-primary flex items-center gap-2 text-xs py-2 px-4 shadow-glow"
          >
            {isSubmittingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isSubmittingProfile ? "Saving..." : "Save Profile Changes"}
          </button>
        </form>
      </div>

      {/* ── Change Password Form ── */}
      <div className="glass-card p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
            <Shield size={18} className="text-brand-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Change Password</h3>
            <p className="text-xs text-slate-400">Update your account security password</p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle size={15} />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle size={15} />
            <span>{passwordError}</span>
          </div>
        )}

        <form id="change-password-form" onSubmit={handlePwSubmit(onPasswordSubmit)} className="space-y-4" noValidate>
          {/* Current Password */}
          <div>
            <label htmlFor="profile-current-password" className="block text-xs font-medium text-slate-300 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
              <input
                id="profile-current-password"
                type={showCurrentPw ? "text" : "password"}
                placeholder="••••••••"
                {...registerPw("currentPassword")}
                className={`input-field pl-11 pr-11 ${
                  pwErrors.currentPassword ? "border-red-500/50" : ""
                }`}
              />
              <button
                type="button"
                id="profile-toggle-current-password"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors z-10"
              >
                {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {pwErrors.currentPassword && (
              <p className="mt-1 text-xs text-red-400">{pwErrors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="profile-new-password" className="block text-xs font-medium text-slate-300 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
              <input
                id="profile-new-password"
                type={showNewPw ? "text" : "password"}
                placeholder="Minimum 8 characters"
                {...registerPw("newPassword")}
                className={`input-field pl-11 pr-11 ${
                  pwErrors.newPassword ? "border-red-500/50" : ""
                }`}
              />
              <button
                type="button"
                id="profile-toggle-new-password"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors z-10"
              >
                {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {pwErrors.newPassword && (
              <p className="mt-1 text-xs text-red-400">{pwErrors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label htmlFor="profile-confirm-new-password" className="block text-xs font-medium text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
              <input
                id="profile-confirm-new-password"
                type={showConfirmNewPw ? "text" : "password"}
                placeholder="Re-enter new password"
                {...registerPw("confirmNewPassword")}
                className={`input-field pl-11 pr-11 ${
                  pwErrors.confirmNewPassword ? "border-red-500/50" : ""
                }`}
              />
              <button
                type="button"
                id="profile-toggle-confirm-new-password"
                onClick={() => setShowConfirmNewPw(!showConfirmNewPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors z-10"
              >
                {showConfirmNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {pwErrors.confirmNewPassword && (
              <p className="mt-1 text-xs text-red-400">{pwErrors.confirmNewPassword.message}</p>
            )}
          </div>

          <button
            id="profile-update-password-btn"
            type="submit"
            disabled={isSubmittingPw}
            className="btn-primary flex items-center gap-2 text-xs py-2 px-4 shadow-glow"
          >
            {isSubmittingPw ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
            {isSubmittingPw ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* ── Chrome Extension Auth Token Card ── */}
      <div className="glass-card p-6 border border-brand-500/20 bg-gradient-to-r from-surface-800 to-indigo-950/30">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Chrome size={18} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Chrome Browser Extension Pairing</h3>
            <p className="text-xs text-slate-400">Authenticate your Chrome extension to auto-track ChatGPT, Claude, Gemini & Cursor</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-surface-700/50 border border-white/5">
          <div>
            <p className="text-xs font-semibold text-slate-200">Extension JWT Access Token</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Copy this token and paste it into the Extension popup window.</p>
          </div>
          <button
            onClick={handleCopyExtensionToken}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-glow transition-all flex items-center gap-2 flex-shrink-0"
          >
            {copiedToken ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
            {copiedToken ? "Token Copied!" : "Copy Extension Token"}
          </button>
        </div>
      </div>
    </div>
  );
}
