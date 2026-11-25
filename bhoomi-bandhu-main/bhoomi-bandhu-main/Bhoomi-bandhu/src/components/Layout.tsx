import React, { useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  Compass,
  FileCheck2,
  Grid,
  Headphones,
  HeartHandshake,
  HelpCircle,
  Home,
  Landmark,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Shield,
  Sprout,
  Stethoscope,
  User,
  Warehouse,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { LanguageSelector } from "./LanguageSelector";
import type { TranslationKey } from "../i18n/translations";
import { getDefaultRouteForRole, getRoleDisplayLabel } from "../utils/roles";

interface NavItem {
  to: string;
  labelKey?: TranslationKey;
  customLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: Array<"farmer" | "warehouse_owner" | "psychiatrist" | "support_staff">;
}

const ADMIN_MODULES: NavItem[] = [
  { to: "/admin", customLabel: "Dashboard", icon: Home },
  { to: "/psychiatrist", customLabel: "Psychiatrist Desk", icon: Stethoscope },
  { to: "/support-desk", customLabel: "Support Desk", icon: Headphones },
  { to: "/notifications", customLabel: "Notifications", icon: Bell },
  { to: "/profile", customLabel: "Profile", icon: User },
];

const ALL_MODULES: NavItem[] = [
  { to: "/", labelKey: "nav.dashboard", icon: Home, roles: ["farmer", "warehouse_owner"] },
  {
    to: "/psychiatrist",
    customLabel: "Psychiatrist Desk",
    icon: Stethoscope,
    roles: ["psychiatrist"],
  },
  {
    to: "/support-desk",
    customLabel: "Support Desk",
    icon: Headphones,
    roles: ["support_staff"],
  },
  { to: "/schemes", labelKey: "nav.schemes", icon: BookOpen, roles: ["farmer"] },
  { to: "/eligibility", labelKey: "nav.eligibility", icon: FileCheck2, roles: ["farmer"] },
  { to: "/warehouses", labelKey: "nav.warehouses", icon: Warehouse, roles: ["farmer"] },
  { to: "/warehouses", customLabel: "My Warehouses", icon: Warehouse, roles: ["warehouse_owner"] },
  { to: "/insurance", labelKey: "nav.insurance", icon: Shield, roles: ["farmer"] },
  { to: "/insurance", customLabel: "Facility Insurance", icon: Shield, roles: ["warehouse_owner"] },
  { to: "/loans", labelKey: "nav.loans", icon: Landmark, roles: ["farmer"] },
  { to: "/loans", customLabel: "Commercial Loans", icon: Landmark, roles: ["warehouse_owner"] },
  { to: "/crop-advisor", labelKey: "nav.cropAdvisor", icon: Compass, roles: ["farmer"] },
  { to: "/chat", labelKey: "nav.chat", icon: MessageSquare, roles: ["farmer"] },
  { to: "/wellbeing", labelKey: "nav.wellbeing", icon: HeartHandshake, roles: ["farmer"] },
  { to: "/notifications", labelKey: "nav.notifications", icon: Bell },
  { to: "/help", labelKey: "nav.help", icon: HelpCircle },
  { to: "/profile", labelKey: "nav.profile", icon: User },
];

export function Layout({ children }: { children: ReactNode }) {
  const { user, profile, isAdmin, isDemoMode, notifications, logOut } =
    useAuth();
  const { t } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const activeRole = profile?.role || "farmer";

  const visibleModules = isAdmin
    ? ADMIN_MODULES
    : ALL_MODULES.filter((item) => {
        if (item.roles) return item.roles.includes(activeRole);
        return true;
      });

  const getItemLabel = (item: NavItem) =>
    item.labelKey ? t(item.labelKey) : item.customLabel || "";

  const homeDestination = getDefaultRouteForRole(profile?.role, isAdmin);
  const roleDisplayLabel = getRoleDisplayLabel(profile?.role, isAdmin);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (!q) {
      navigate("/search");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setDrawerOpen(false);
  };

  const handleLogout = async () => {
    await logOut();
    setDrawerOpen(false);
    navigate("/auth");
  };

  const showLanguageSelector =
    !isAdmin &&
    (activeRole === "farmer" || activeRole === "warehouse_owner");

  const mobileTabs = isAdmin
    ? [
        { to: "/admin", label: "Dashboard", icon: Home },
        { to: "/psychiatrist", label: "Psychiatrist", icon: Stethoscope },
        { to: "/support-desk", label: "Support", icon: Headphones },
        { to: "/profile", label: "Profile", icon: User },
      ]
    : activeRole === "psychiatrist"
    ? [
        { to: "/psychiatrist", label: "Desk", icon: Stethoscope },
        { to: "/notifications", label: "Alerts", icon: Bell },
        { to: "/help", label: "Help", icon: HelpCircle },
        { to: "/profile", label: t("nav.profileTab"), icon: User },
      ]
    : activeRole === "support_staff"
    ? [
        { to: "/support-desk", label: "Tickets", icon: Headphones },
        { to: "/help", label: "FAQs", icon: HelpCircle },
        { to: "/notifications", label: "Alerts", icon: Bell },
        { to: "/profile", label: t("nav.profileTab"), icon: User },
      ]
    : activeRole === "warehouse_owner"
    ? [
        { to: "/", label: "Dashboard", icon: Home },
        { to: "/warehouses", label: "Godowns", icon: Warehouse },
        { to: "/loans", label: "Loans", icon: Landmark },
        { to: "/profile", label: t("nav.profileTab"), icon: User },
      ]
    : [
        { to: homeDestination, label: t("nav.homeTab"), icon: Home },
        { to: "/services", label: t("nav.servicesTab"), icon: Grid },
        { to: "/chat", label: t("nav.chatTab"), icon: MessageSquare },
        { to: "/profile", label: t("nav.profileTab"), icon: User },
      ];

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1B2A20] flex flex-col md:flex-row">
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-[#2D6A4F]/12 z-30">
        <div className="h-16 px-5 flex items-center border-b border-[#2D6A4F]/12">
          <Link
            to={homeDestination}
            className="flex items-center gap-2.5 text-[#2D6A4F] font-display font-bold text-lg whitespace-nowrap shrink-0"
          >
            <Sprout className="w-6 h-6 shrink-0" />
            <span>BhoomiBandhu</span>
          </Link>
        </div>

        <nav
          aria-label="Primary modules"
          className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
        >
          {visibleModules.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-[#EAF4EE] text-[#2D6A4F]"
                      : "text-[#4A5A4F] hover:bg-[#F2EFE6] hover:text-[#1B2A20]"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{getItemLabel(item)}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#2D6A4F]/12">
          {user ? (
            <div className="space-y-2">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#F2EFE6] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center font-semibold text-sm shrink-0">
                  {(profile?.name || user.email || "F").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1B2A20] truncate">
                    {profile?.name || "User"}
                  </p>
                  <p className="text-xs text-[#4A5A4F] truncate">
                    {roleDisplayLabel}
                    {isDemoMode ? " · Test Profile" : ""}
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full min-h-[40px] flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>{t("header.logout")}</span>
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="w-full min-h-[44px] rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>{t("header.loginSignup")}</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Bar Contract */}
        <header className="sticky top-0 z-20 h-14 md:h-16 bg-[#FAF8F3]/95 backdrop-blur-md border-b border-[#2D6A4F]/12 px-3 sm:px-4 md:px-8 flex items-center justify-between gap-2 sm:gap-4 md:gap-8">
          <div className="flex items-center gap-1 min-w-0 shrink md:hidden">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="min-h-[40px] min-w-[40px] -ml-1 flex items-center justify-center rounded-xl text-[#2D6A4F] hover:bg-[#EAF4EE] transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              to={homeDestination}
              className="flex items-center gap-1.5 text-[#2D6A4F] font-display font-bold text-[15px] sm:text-base whitespace-nowrap truncate"
            >
              <Sprout className="w-5 h-5 shrink-0" />
              <span className="truncate">BhoomiBandhu</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4 shrink-0">
            {isAdmin ? (
              <span className="text-sm font-semibold text-[#2D6A4F] whitespace-nowrap shrink-0">
                Admin Portal
              </span>
            ) : (
              <Link
                to="/onboarding"
                className="text-sm font-medium text-[#4A5A4F] hover:text-[#2D6A4F] transition-colors whitespace-nowrap shrink-0"
              >
                {t("header.howItWorks")}
              </Link>
            )}
          </div>

          {!isAdmin && (
            <form
              onSubmit={handleSearchSubmit}
              className="hidden sm:flex flex-1 max-w-md items-center"
              role="search"
            >
              <label htmlFor="global-search-input" className="sr-only">
                Search schemes, crops, warehouses, insurance, or loans
              </label>
              <div className="relative w-full">
                <Search className="w-4 h-4 text-[#4A5A4F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="global-search-input"
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={
                    activeRole === "warehouse_owner"
                      ? "Search warehouse loans, facility insurance, godowns..."
                      : t("header.searchPlaceholder")
                  }
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-[#2D6A4F]/20 text-sm text-[#1B2A20] placeholder:text-[#4A5A4F]/75 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
                />
              </div>
            </form>
          )}

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {!isAdmin && (
              <Link
                to="/search"
                aria-label="Search BhoomiBandhu"
                className="sm:hidden min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#2D6A4F] hover:bg-[#EAF4EE] transition-colors"
              >
                <Search className="w-5 h-5" />
              </Link>
            )}
            {showLanguageSelector && <LanguageSelector />}
            <Link
              to="/notifications"
              aria-label={`${t("nav.notifications")} (${unreadCount} unread)`}
              className="relative min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center rounded-xl text-[#2D6A4F] hover:bg-[#EAF4EE] transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#E9A23B] border border-[#FAF8F3]" />
              )}
            </Link>
            {user ? (
              <Link
                to="/profile"
                className="hidden sm:inline-flex min-h-[40px] px-4 py-2 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] hover:bg-[#DDECE3] text-sm font-semibold items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <User className="w-4 h-4" />
                <span>{profile?.name?.split(" ")[0] || t("nav.profile")}</span>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="hidden sm:inline-flex md:hidden min-h-[40px] px-4 py-2 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] text-sm font-semibold items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                <LogIn className="w-4 h-4" />
                <span>{t("header.signIn")}</span>
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile Fixed Bottom Tab Bar */}
      <nav
        aria-label="Mobile bottom tabs"
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-[#2D6A4F]/15 z-30 grid grid-cols-4 items-center px-2"
      >
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const active =
            tab.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors whitespace-nowrap ${
                active ? "text-[#2D6A4F] font-semibold" : "text-[#4A5A4F]"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Slide-Out Navigation Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="All BhoomiBandhu modules"
        >
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-[#FAF8F3] h-full shadow-xl flex flex-col z-10">
            <div className="p-4 border-b border-[#2D6A4F]/15 flex items-center justify-between bg-white">
              <div>
                <p className="font-display font-semibold text-[#1B2A20]">
                  {user ? profile?.name || "User" : "Welcome to BhoomiBandhu"}
                </p>
                <p className="text-xs text-[#4A5A4F]">
                  {user ? roleDisplayLabel : "Sign in to continue"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#4A5A4F] hover:bg-[#F2EFE6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {visibleModules.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setDrawerOpen(false)}
                    className="min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-[#1B2A20] hover:bg-[#EAF4EE] hover:text-[#2D6A4F] transition-colors"
                  >
                    <Icon className="w-4 h-4 shrink-0 text-[#2D6A4F]" />
                    <span>{getItemLabel(item)}</span>
                  </Link>
                );
              })}
            </div>

            <div className="p-3 border-t border-[#2D6A4F]/15 bg-white">
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full min-h-[44px] flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t("header.logout")}</span>
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setDrawerOpen(false)}
                  className="w-full min-h-[44px] rounded-xl bg-[#E9A23B] text-[#1B2A20] font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t("header.loginSignup")}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
