import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  ShieldCheck,
  Sprout,
  Stethoscope,
  UserPlus,
  Warehouse,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { LanguageSelector } from "../components/LanguageSelector";
import { INDIAN_STATES } from "../data/bhoomiData";
import {
  ADMIN_BOOTSTRAP_EMAIL,
  DEMO_ACCOUNTS,
  getDefaultRouteForRole,
  type DemoAccountCredential,
  type UserRole,
} from "../utils/roles";

const SIGNUP_ROLES: Array<{
  role: UserRole;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    role: "farmer",
    title: "Farmer",
    desc: "Schemes, weather crop advisor, insurance, loans, storage & well-being.",
    icon: Sprout,
  },
  {
    role: "warehouse_owner",
    title: "Warehouse Owner",
    desc: "List godowns and approve or decline farmer storage bookings.",
    icon: Warehouse,
  },
  {
    role: "psychiatrist",
    title: "Psychiatrist",
    desc: "Mental health support desk for confidential farmer consultations.",
    icon: Stethoscope,
  },
];

export function AuthPage() {
  const {
    user,
    profile,
    isAdmin,
    signInWithGoogle,
    signUpWithEmail,
    logInWithEmail,
    resetPassword,
  } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [role, setRole] = useState<UserRole>("farmer");
  const [name, setName] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    if (user && profile) {
      navigate(getDefaultRouteForRole(profile.role, isAdmin), {
        replace: true,
      });
    }
  }, [user, profile, isAdmin, navigate]);

  const formatAuthError = (err: unknown): string => {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes("auth/operation-not-allowed") ||
      msg.includes("FIREBASE_EMAIL_PASSWORD_DISABLED")
    ) {
      return "Incorrect email or password, or no account exists with this email yet. Please check your details or click Sign Up.";
    }
    if (
      msg.includes("auth/invalid-credential") ||
      msg.includes("auth/wrong-password") ||
      msg.includes("auth/user-not-found")
    ) {
      return "Incorrect email or password. Please check your credentials and try again.";
    }
    if (msg.includes("auth/email-already-in-use")) {
      return "An account with this email already exists. Please log in instead.";
    }
    if (msg.includes("auth/weak-password")) {
      return "Please choose a password with at least 6 characters.";
    }
    if (msg.includes("auth/popup-closed-by-user")) {
      return "Google Sign-In window was closed before completing.";
    }
    return msg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (mode === "forgot") {
      setLoading(true);
      try {
        await resetPassword(email);
        setInfoMessage(
          "Password reset instructions have been sent to your email."
        );
      } catch (err) {
        setError(formatAuthError(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (mode === "register") {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (!stateRegion.trim()) {
        setError("Please select your state or region.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match. Please re-type carefully.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await logInWithEmail(email, password);
      } else {
        await signUpWithEmail({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          state: stateRegion.trim(),
          district: district.trim(),
          specialization: specialization.trim() || undefined,
          qualification: qualification.trim() || undefined,
        });
      }
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setInfoMessage("");
    setLoading(true);
    try {
      await signInWithGoogle(role, stateRegion.trim(), district.trim());
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (acc: DemoAccountCredential) => {
    setMode("login");
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
    setInfoMessage("");
    setLoading(true);
    try {
      await logInWithEmail(acc.email, acc.password);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1B2A20] flex flex-col">
      {/* Clean Auth Top Bar */}
      <header className="h-16 px-4 md:px-8 border-b border-[#2D6A4F]/12 bg-white/80 backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-[#2D6A4F] font-display font-bold text-lg">
          <Sprout className="w-6 h-6 shrink-0" />
          <span>BhoomiBandhu</span>
          <span className="hidden sm:inline text-xs font-normal text-[#4A5A4F] pl-1">
            A Trusted Friend for Every Farmer
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/onboarding"
            className="text-sm font-medium text-[#4A5A4F] hover:text-[#2D6A4F] whitespace-nowrap"
          >
            How it works
          </Link>
          <LanguageSelector />
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Login / Sign Up Card */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-[#2D6A4F]/15 p-6 md:p-8 shadow-sm">
          {/* Login / Sign Up Tabs */}
          {mode !== "forgot" && (
            <div
              role="tablist"
              aria-label="Authentication mode"
              className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#F2EFE6] mb-6"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                onClick={() => {
                  setMode("login");
                  setError("");
                  setInfoMessage("");
                }}
                className={`min-h-[42px] rounded-lg text-sm font-semibold transition-colors ${
                  mode === "login"
                    ? "bg-white text-[#1B2A20] shadow-sm"
                    : "text-[#4A5A4F] hover:text-[#1B2A20]"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "register"}
                onClick={() => {
                  setMode("register");
                  setError("");
                  setInfoMessage("");
                }}
                className={`min-h-[42px] rounded-lg text-sm font-semibold transition-colors ${
                  mode === "register"
                    ? "bg-white text-[#1B2A20] shadow-sm"
                    : "text-[#4A5A4F] hover:text-[#1B2A20]"
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          <h1 className="text-2xl font-display font-bold text-[#1B2A20]">
            {mode === "login"
              ? "Sign in to BhoomiBandhu"
              : mode === "register"
              ? "Create your BhoomiBandhu account"
              : "Reset your password"}
          </h1>
          <p className="text-sm text-[#4A5A4F] mt-1 mb-6">
            {mode === "login"
              ? "Access your role workspace: Farmer, Warehouse Owner, Psychiatrist, Support Employee, or Admin."
              : mode === "register"
              ? "Choose your profile role so we personalize your tools and dashboard."
              : "Enter your registered email address and we will send a reset link."}
          </p>

          {error && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div
              role="status"
              className="mb-5 p-3.5 rounded-xl bg-[#EAF4EE] border border-[#2D6A4F]/25 text-[#1B2A20] text-sm flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#2D6A4F]" />
              <span>{infoMessage}</span>
            </div>
          )}

          {mode === "register" && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-[#1B2A20] mb-2">
                Select your profile role
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SIGNUP_ROLES.map((item) => {
                  const Icon = item.icon;
                  const active = role === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setRole(item.role)}
                      className={`p-3.5 rounded-xl border text-left transition-colors ${
                        active
                          ? "border-[#2D6A4F] bg-[#EAF4EE]"
                          : "border-[#2D6A4F]/20 bg-[#FAF8F3] hover:bg-[#F2EFE6]"
                      }`}
                    >
                      <Icon className="w-5 h-5 text-[#2D6A4F] mb-1.5" />
                      <p className="font-semibold text-sm text-[#1B2A20]">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#4A5A4F] mt-0.5 leading-snug">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-[#4A5A4F] mt-2">
                Support Desk employees are onboarded exclusively by the
                Administrator and receive a one-time password via automated
                no-reply email.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label
                    htmlFor="auth-name"
                    className="block text-sm font-medium text-[#1B2A20] mb-1.5"
                  >
                    Full Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rajesh Deshmukh"
                    className="w-full h-12 px-4 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-base focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="auth-state"
                      className="block text-sm font-medium text-[#1B2A20] mb-1.5"
                    >
                      State / Region
                    </label>
                    <select
                      id="auth-state"
                      value={stateRegion}
                      onChange={(e) => setStateRegion(e.target.value)}
                      className="w-full h-12 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
                    >
                      <option value="">Select your state...</option>
                      {INDIAN_STATES.filter((s) => s !== "All India").map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="auth-district"
                      className="block text-sm font-medium text-[#1B2A20] mb-1.5"
                    >
                      District / City (optional)
                    </label>
                    <input
                      id="auth-district"
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Nashik, Ludhiana, Indore"
                      className="w-full h-12 px-4 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
                    />
                  </div>
                </div>
              </>
            )}

            {mode === "register" && role === "psychiatrist" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="auth-qual"
                    className="block text-sm font-medium text-[#1B2A20] mb-1.5"
                  >
                    Qualification
                  </label>
                  <input
                    id="auth-qual"
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. MD Psychiatry"
                    className="w-full h-12 px-4 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
                  />
                </div>
                <div>
                  <label
                    htmlFor="auth-spec"
                    className="block text-sm font-medium text-[#1B2A20] mb-1.5"
                  >
                    Specialization
                  </label>
                  <input
                    id="auth-spec"
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Rural Stress & Sleep"
                    className="w-full h-12 px-4 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-sm font-medium text-[#1B2A20] mb-1.5"
              >
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-12 px-4 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-base focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
              />
            </div>

            {mode !== "forgot" && (
              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-sm font-medium text-[#1B2A20] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full h-12 pl-4 pr-12 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-base focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="min-h-[44px] min-w-[44px] absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#4A5A4F] hover:text-[#1B2A20]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {mode === "register" && (
              <div>
                <label
                  htmlFor="auth-confirm-password"
                  className="block text-sm font-medium text-[#1B2A20] mb-1.5"
                >
                  Confirm Password
                </label>
                <input
                  id="auth-confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full h-12 px-4 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-base focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] disabled:opacity-60 text-[#1B2A20] font-semibold text-base flex items-center justify-center gap-2 transition-colors"
            >
              {mode === "login" ? (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>{loading ? "Logging in..." : "Log In"}</span>
                </>
              ) : mode === "register" ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>{loading ? "Creating account..." : "Create Account"}</span>
                </>
              ) : (
                <span>{loading ? "Sending link..." : "Send Reset Link"}</span>
              )}
            </button>
          </form>

          {mode === "login" && (
            <div className="mt-3 text-right">
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setError("");
                  setInfoMessage("");
                }}
                className="text-sm font-medium text-[#2D6A4F] hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          {mode === "forgot" && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setInfoMessage("");
                }}
                className="text-sm font-semibold text-[#2D6A4F] hover:underline"
              >
                Back to Log In
              </button>
            </div>
          )}

          <div className="my-5 flex items-center gap-3 text-xs text-[#4A5A4F]">
            <div className="flex-1 h-px bg-[#2D6A4F]/15" />
            <span>or continue with Google</span>
            <div className="flex-1 h-px bg-[#2D6A4F]/15" />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full min-h-[48px] rounded-xl border border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#EAF4EE] font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span>Continue with Google</span>
          </button>
        </section>

        {/* Right: Admin Credentials Notice & Test Role Credentials */}
        <aside className="lg:col-span-5 space-y-5">
          <div className="bg-[#EAF4EE] rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-[#2D6A4F]">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <h2 className="font-display font-semibold text-base text-[#1B2A20]">
                Live Admin Account
              </h2>
            </div>
            <p className="text-xs text-[#4A5A4F] leading-relaxed">
              Verified administrator privileges are bound to{" "}
              <strong className="text-[#1B2A20] break-all">
                {ADMIN_BOOTSTRAP_EMAIL}
              </strong>{" "}
              via Google Sign-In or Firebase Email Auth for full live database
              management.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-4">
            <div className="flex items-center gap-2 text-[#2D6A4F]">
              <KeyRound className="w-5 h-5 shrink-0" />
              <div>
                <h2 className="font-display font-semibold text-base text-[#1B2A20]">
                  Test Profiles & Dummy Credentials
                </h2>
                <p className="text-xs text-[#4A5A4F]">
                  Inspect how each role dashboard looks using these credentials.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {DEMO_ACCOUNTS.map((acc) => (
                <div
                  key={acc.id}
                  className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/15 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-[#1B2A20]">
                      {acc.label}
                    </p>
                    <span className="text-[11px] font-semibold text-[#2D6A4F] uppercase">
                      {acc.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#4A5A4F] leading-snug">
                    {acc.summary}
                  </p>
                  <div className="text-xs font-mono text-[#1B2A20] bg-white rounded-lg px-2.5 py-2 border border-[#2D6A4F]/10 space-y-0.5">
                    <p className="truncate">Email: {acc.email}</p>
                    <p>Pass: {acc.password}</p>
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoLogin(acc)}
                    className="w-full min-h-[38px] rounded-xl bg-white border border-[#2D6A4F]/30 text-[#2D6A4F] hover:bg-[#EAF4EE] font-semibold text-xs transition-colors"
                  >
                    Test {acc.badge} Profile
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
