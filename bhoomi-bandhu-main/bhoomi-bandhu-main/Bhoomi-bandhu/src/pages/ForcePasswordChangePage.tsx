import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  ShieldAlert,
  Sprout,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function ForcePasswordChangePage() {
  const { user, profile, completeFirstLoginPasswordChange, logOut } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await completeFirstLoginPasswordChange({
        newPassword,
        confirmPassword,
      });
      navigate("/support-desk", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update password right now."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logOut();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1B2A20] flex flex-col">
      <header className="h-16 px-4 md:px-8 border-b border-[#2D6A4F]/12 bg-white/90 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-[#2D6A4F] font-display font-bold text-lg">
          <Sprout className="w-6 h-6 shrink-0" />
          <span>BhoomiBandhu Support Desk</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="min-h-[40px] px-3.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-sm font-semibold inline-flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-[#2D6A4F]/15 p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                First-Login Security Step
              </p>
              <h1 className="text-2xl font-display font-bold text-[#1B2A20]">
                Change Your One-Time Password
              </h1>
              <p className="text-sm text-[#4A5A4F] mt-1">
                Welcome, <strong className="text-[#1B2A20]">{profile?.name || user?.email}</strong>.
                Because your account was provisioned with a one-time access
                password, you must set a private personal password before
                opening the Support Desk.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/15 text-xs text-[#4A5A4F] flex items-center justify-between gap-2">
            <span>Signed-in Email:</span>
            <strong className="text-[#1B2A20] font-mono truncate">
              {user?.email}
            </strong>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="new-employee-password"
                className="block text-sm font-medium text-[#1B2A20] mb-1.5"
              >
                New Personal Password
              </label>
              <div className="relative">
                <input
                  id="new-employee-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters (must differ from one-time password)"
                  className="w-full h-12 pl-4 pr-12 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-base focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="min-h-[44px] min-w-[44px] absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#4A5A4F]"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-employee-password"
                className="block text-sm font-medium text-[#1B2A20] mb-1.5"
              >
                Confirm New Password
              </label>
              <input
                id="confirm-employee-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full h-12 px-4 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-base focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full min-h-[48px] rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] disabled:opacity-60 text-[#1B2A20] font-semibold text-base flex items-center justify-center gap-2 transition-colors"
            >
              <KeyRound className="w-5 h-5" />
              <span>
                {saving
                  ? "Updating Password..."
                  : "Update Password & Enter Support Desk"}
              </span>
            </button>
          </form>

          <p className="text-xs text-[#4A5A4F] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
            <span>
              Your one-time password expires permanently once you save your new
              password.
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
