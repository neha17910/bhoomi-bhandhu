import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Eye,
  Flag,
  Headphones,
  Landmark,
  Lock,
  PauseCircle,
  PlayCircle,
  Plus,
  Search,
  Shield,
  Stethoscope,
  Trash2,
  Users,
  Warehouse,
} from "lucide-react";
import { useAuth, type UserProfileData } from "../context/AuthContext";
import { SupportTicketStatusWidget } from "../components/SupportTicketStatusWidget";
import { getRoleDisplayLabel, type UserRole } from "../utils/roles";
import {
  isActiveComplaint,
  isComplaintTicket,
  prioritizeSupportTickets,
} from "../utils/supportTicketStats";
import { getSafeExternalUrl } from "../utils/safeUrl";

type AdminTab =
  | "overview"
  | "companies"
  | "users"
  | "psychiatrists"
  | "warehouses"
  | "tickets";

export function AdminPage() {
  const {
    isAdmin,
    isDemoMode,
    warehouses,
    partnerCompanies,
    psychiatrists,
    allUsers,
    allBookings,
    allConsultations,
    allSupportTickets,
    addPartnerCompany,
    togglePartnerCompanyStatus,
    deletePartnerCompany,
    adminUpdateUserRole,
    updateBookingStatus,
    updateSupportTicket,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [notice, setNotice] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Companies form state
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [companyFilter, setCompanyFilter] = useState<
    "all" | "loan" | "insurance"
  >("all");
  const [compName, setCompName] = useState("");
  const [compCategory, setCompCategory] = useState<"loan" | "insurance">(
    "loan"
  );
  const [compRate, setCompRate] = useState("");
  const [compLimit, setCompLimit] = useState("");
  const [compEligibility, setCompEligibility] = useState("");
  const [compHelpline, setCompHelpline] = useState("");
  const [compWebsite, setCompWebsite] = useState("");
  const [compSaving, setCompSaving] = useState(false);

  // Users directory state
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [inspectedUser, setInspectedUser] = useState<UserProfileData | null>(
    null
  );
  const [ticketFilter, setTicketFilter] = useState<"all" | "complaints">(
    "all"
  );

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return allUsers.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.state.toLowerCase().includes(q) ||
        u.district.toLowerCase().includes(q)
      );
    });
  }, [allUsers, userSearch, roleFilter]);

  const filteredCompanies = useMemo(() => {
    return partnerCompanies.filter(
      (c) => companyFilter === "all" || c.category === companyFilter
    );
  }, [partnerCompanies, companyFilter]);

  const activeComplaintsCount = useMemo(
    () => allSupportTickets.filter((t) => isActiveComplaint(t)).length,
    [allSupportTickets]
  );

  const prioritizedAdminTickets = useMemo(() => {
    const base =
      ticketFilter === "complaints"
        ? allSupportTickets.filter((t) => isComplaintTicket(t))
        : allSupportTickets;
    return prioritizeSupportTickets(base);
  }, [allSupportTickets, ticketFilter]);

  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-2xl border border-[#2D6A4F]/15 p-8 text-center space-y-3">
        <Lock className="w-10 h-10 text-[#2D6A4F] mx-auto" />
        <h1 className="text-xl font-display font-bold text-[#1B2A20]">
          Admin Access Required
        </h1>
        <p className="text-sm text-[#4A5A4F]">
          This section is restricted to verified BhoomiBandhu administrators.
        </p>
      </div>
    );
  }

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setNotice("");
    if (
      compName.trim().length < 2 ||
      compRate.trim().length < 2 ||
      compLimit.trim().length < 2 ||
      compEligibility.trim().length < 2 ||
      compHelpline.trim().length < 2
    ) {
      setErrorMsg(
        "Please fill in Company Name, Rate/Premium, Coverage/Limit, Eligibility, and Helpline."
      );
      return;
    }
    const rawWebsite = compWebsite.trim();
    const safeWebsite = rawWebsite ? getSafeExternalUrl(rawWebsite) : undefined;
    if (rawWebsite && !safeWebsite) {
      setErrorMsg(
        "Official Portal URL must be a valid http:// or https:// web address."
      );
      return;
    }

    setCompSaving(true);
    try {
      await addPartnerCompany({
        name: compName.trim(),
        category: compCategory,
        interestOrPremium: compRate.trim(),
        coverageOrLimit: compLimit.trim(),
        eligibilitySummary: compEligibility.trim(),
        contactHelpline: compHelpline.trim(),
        websiteUrl: safeWebsite || undefined,
      });
      setNotice(
        `Added ${compName.trim()} (${compCategory}) to live partner directory.`
      );
      setCompName("");
      setCompRate("");
      setCompLimit("");
      setCompEligibility("");
      setCompHelpline("");
      setCompWebsite("");
      setShowCompanyForm(false);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Could not add partner company."
      );
    } finally {
      setCompSaving(false);
    }
  };

  const roleCounts = {
    farmer: allUsers.filter((u) => u.role === "farmer").length,
    warehouse_owner: allUsers.filter((u) => u.role === "warehouse_owner").length,
    psychiatrist: allUsers.filter((u) => u.role === "psychiatrist").length,
    support_staff: allUsers.filter((u) => u.role === "support_staff").length,
  };

  const tabs: Array<{
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: "overview", label: "Overview", icon: Shield },
    { id: "companies", label: "Loan & Insurance Companies", icon: Building2 },
    { id: "users", label: "All Users & Data", icon: Users },
    { id: "psychiatrists", label: "Psychiatrists & Mental Health", icon: Stethoscope },
    { id: "warehouses", label: "Warehouses & Bookings", icon: Warehouse },
    { id: "tickets", label: "Support Tickets", icon: Headphones },
  ];

  const inspectedUserWarehouses = inspectedUser
    ? warehouses.filter((w) => w.ownerId === inspectedUser.uid)
    : [];
  const inspectedUserBookings = inspectedUser
    ? allBookings.filter(
        (b) =>
          b.farmerId === inspectedUser.uid ||
          b.warehouseOwnerId === inspectedUser.uid
      )
    : [];
  const inspectedUserConsults = inspectedUser
    ? allConsultations.filter(
        (c) =>
          c.farmerId === inspectedUser.uid ||
          c.psychiatristId === inspectedUser.uid
      )
    : [];
  const inspectedUserTickets = inspectedUser
    ? allSupportTickets.filter((t) => t.userId === inspectedUser.uid)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#2D6A4F]">
            {isDemoMode
              ? "Admin Sandbox Preview"
              : "Live Verified Administrator Console"}
          </p>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1B2A20]">
            Admin Portal Dashboard
          </h1>
          <p className="text-sm text-[#4A5A4F]">
            Manage loan &amp; insurance partner companies, inspect all users and
            data, oversee psychiatrists, warehouses, and support operations.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        role="tablist"
        aria-label="Admin Portal sections"
        className="flex flex-wrap items-center gap-2"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[42px] px-4 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors ${
                active
                  ? "bg-[#2D6A4F] text-white"
                  : "bg-white border border-[#2D6A4F]/20 text-[#1B2A20] hover:bg-[#EAF4EE]"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>
                {tab.label}
                {tab.id === "tickets" && activeComplaintsCount > 0
                  ? ` (${activeComplaintsCount} Priority)`
                  : ""}
              </span>
            </button>
          );
        })}
      </div>

      {notice && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-[#EAF4EE] border border-[#2D6A4F]/25 text-sm font-medium text-[#1B2A20] flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800"
        >
          {errorMsg}
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5">
              <p className="text-xs font-semibold text-[#2D6A4F]">
                Registered Users
              </p>
              <p className="text-2xl font-display font-bold text-[#1B2A20] tabular-nums mt-1">
                {allUsers.length}
              </p>
              <p className="text-xs text-[#4A5A4F] mt-1">
                {roleCounts.farmer} Farmers · {roleCounts.warehouse_owner}{" "}
                Owners · {roleCounts.psychiatrist} Psychiatrists ·{" "}
                {roleCounts.support_staff} Support
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5">
              <p className="text-xs font-semibold text-[#2D6A4F]">
                Loan &amp; Insurance Companies
              </p>
              <p className="text-2xl font-display font-bold text-[#1B2A20] tabular-nums mt-1">
                {partnerCompanies.length}
              </p>
              <p className="text-xs text-[#4A5A4F] mt-1">
                {partnerCompanies.filter((c) => c.category === "loan").length}{" "}
                Loan ·{" "}
                {
                  partnerCompanies.filter((c) => c.category === "insurance")
                    .length
                }{" "}
                Insurance
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5">
              <p className="text-xs font-semibold text-[#2D6A4F]">
                Psychiatrists &amp; Care
              </p>
              <p className="text-2xl font-display font-bold text-[#1B2A20] tabular-nums mt-1">
                {psychiatrists.length} Specialists
              </p>
              <p className="text-xs text-[#4A5A4F] mt-1">
                {allConsultations.length} consultation records
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5">
              <p className="text-xs font-semibold text-[#2D6A4F]">
                Active Warehouses
              </p>
              <p className="text-2xl font-display font-bold text-[#1B2A20] tabular-nums mt-1">
                {warehouses.length}
              </p>
              <p className="text-xs text-[#4A5A4F] mt-1">
                {allBookings.length} total storage bookings
              </p>
            </div>
            <div
              className={`rounded-2xl p-5 border ${
                activeComplaintsCount > 0
                  ? "bg-red-50/50 border-2 border-red-300"
                  : "bg-white border-[#2D6A4F]/15"
              }`}
            >
              <p
                className={`text-xs font-semibold ${
                  activeComplaintsCount > 0 ? "text-red-800" : "text-[#2D6A4F]"
                }`}
              >
                Open Tickets &amp; Complaints
              </p>
              <p className="text-2xl font-display font-bold text-[#1B2A20] tabular-nums mt-1">
                {allSupportTickets.filter((t) => t.status !== "resolved").length}
              </p>
              <p className="text-xs text-[#4A5A4F] mt-1">
                {activeComplaintsCount > 0 ? (
                  <span className="font-semibold text-red-800">
                    {activeComplaintsCount} priority complaint
                    {activeComplaintsCount > 1 ? "s" : ""} active ·{" "}
                  </span>
                ) : null}
                {allSupportTickets.length} total logged
              </p>
            </div>
          </div>

          <SupportTicketStatusWidget
            tickets={allSupportTickets}
            onInspectTickets={() => setActiveTab("tickets")}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => {
                setActiveTab("companies");
                setShowCompanyForm(true);
              }}
              className="p-5 rounded-2xl bg-[#EAF4EE] border border-[#2D6A4F]/20 text-left hover:border-[#2D6A4F] transition-colors space-y-1.5"
            >
              <Building2 className="w-5 h-5 text-[#2D6A4F]" />
              <p className="font-display font-semibold text-base text-[#1B2A20]">
                + Add Loan / Insurance Company
              </p>
              <p className="text-xs text-[#4A5A4F]">
                Publish new banks or crop insurance companies to farmer portals.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className="p-5 rounded-2xl bg-white border border-[#2D6A4F]/15 text-left hover:border-[#2D6A4F] transition-colors space-y-1.5"
            >
              <Users className="w-5 h-5 text-[#2D6A4F]" />
              <p className="font-display font-semibold text-base text-[#1B2A20]">
                Inspect Users &amp; Data
              </p>
              <p className="text-xs text-[#4A5A4F]">
                View farmers, warehouse owners, psychiatrists &amp; support
                staff.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("psychiatrists")}
              className="p-5 rounded-2xl bg-white border border-[#2D6A4F]/15 text-left hover:border-[#2D6A4F] transition-colors space-y-1.5"
            >
              <Stethoscope className="w-5 h-5 text-[#2D6A4F]" />
              <p className="font-display font-semibold text-base text-[#1B2A20]">
                Psychiatrist &amp; Mental Health Data
              </p>
              <p className="text-xs text-[#4A5A4F]">
                Monitor specialist availability and consultation sessions.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: PARTNER LOAN & INSURANCE COMPANIES */}
      {activeTab === "companies" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {(["all", "loan", "insurance"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCompanyFilter(cat)}
                  className={`min-h-[38px] px-4 rounded-xl text-xs font-semibold capitalize transition-colors ${
                    companyFilter === cat
                      ? "bg-[#2D6A4F] text-white"
                      : "bg-white border border-[#2D6A4F]/20 text-[#1B2A20]"
                  }`}
                >
                  {cat === "all" ? "All Companies" : `${cat} Providers`}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowCompanyForm((prev) => !prev)}
              className="min-h-[44px] px-5 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-sm inline-flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>
                {showCompanyForm
                  ? "Close Form"
                  : "Add Loan / Insurance Company"}
              </span>
            </button>
          </div>

          {showCompanyForm && (
            <form
              onSubmit={handleAddCompany}
              className="bg-white rounded-2xl border border-[#2D6A4F]/20 p-5 md:p-6 space-y-4"
            >
              <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
                Register Partner Loan or Crop Insurance Company
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="comp-name"
                    className="block text-xs font-semibold mb-1"
                  >
                    Company / Bank Name
                  </label>
                  <input
                    id="comp-name"
                    type="text"
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    placeholder="e.g. HDFC Agro Crop Shield"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="comp-category"
                    className="block text-xs font-semibold mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="comp-category"
                    value={compCategory}
                    onChange={(e) =>
                      setCompCategory(e.target.value as "loan" | "insurance")
                    }
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
                  >
                    <option value="loan">Agricultural Loan Company</option>
                    <option value="insurance">Crop Insurance Company</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="comp-rate"
                    className="block text-xs font-semibold mb-1"
                  >
                    Interest Rate / Farmer Premium Share
                  </label>
                  <input
                    id="comp-rate"
                    type="text"
                    value={compRate}
                    onChange={(e) => setCompRate(e.target.value)}
                    placeholder="e.g. 4% effective p.a. or 2% Kharif"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="comp-limit"
                    className="block text-xs font-semibold mb-1"
                  >
                    Coverage / Loan Limit
                  </label>
                  <input
                    id="comp-limit"
                    type="text"
                    value={compLimit}
                    onChange={(e) => setCompLimit(e.target.value)}
                    placeholder="e.g. Up to Rs. 5,00,000"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="comp-helpline"
                    className="block text-xs font-semibold mb-1"
                  >
                    Toll-Free / Helpline
                  </label>
                  <input
                    id="comp-helpline"
                    type="text"
                    value={compHelpline}
                    onChange={(e) => setCompHelpline(e.target.value)}
                    placeholder="e.g. 1800-200-4455"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="comp-website"
                    className="block text-xs font-semibold mb-1"
                  >
                    Official Portal URL (optional)
                  </label>
                  <input
                    id="comp-website"
                    type="url"
                    value={compWebsite}
                    onChange={(e) => setCompWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="comp-eligibility"
                  className="block text-xs font-semibold mb-1"
                >
                  Eligibility Summary
                </label>
                <textarea
                  id="comp-eligibility"
                  rows={2}
                  value={compEligibility}
                  onChange={(e) => setCompEligibility(e.target.value)}
                  placeholder="Who can apply and what crops/documents are supported..."
                  className="w-full p-3 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={compSaving}
                className="min-h-[44px] px-6 rounded-xl bg-[#2D6A4F] hover:bg-[#23543E] text-white font-semibold text-sm"
              >
                {compSaving ? "Publishing..." : "Publish Partner Company"}
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCompanies.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase text-[#2D6A4F] inline-flex items-center gap-1">
                      {c.category === "loan" ? (
                        <Landmark className="w-3.5 h-3.5" />
                      ) : (
                        <Shield className="w-3.5 h-3.5" />
                      )}
                      {c.category}
                    </span>
                    <span
                      className={`text-xs font-semibold uppercase ${
                        c.status === "active"
                          ? "text-[#2D6A4F]"
                          : "text-amber-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-base text-[#1B2A20]">
                    {c.name}
                  </h3>
                  <p className="text-xs font-medium text-[#1B2A20]">
                    Rate / Premium: {c.interestOrPremium}
                  </p>
                  <p className="text-xs text-[#4A5A4F]">
                    Coverage / Limit: {c.coverageOrLimit}
                  </p>
                  <p className="text-xs text-[#4A5A4F]">
                    {c.eligibilitySummary}
                  </p>
                  <p className="text-xs font-mono text-[#2D6A4F]">
                    Helpline: {c.contactHelpline}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#2D6A4F]/10">
                  <button
                    type="button"
                    onClick={() =>
                      togglePartnerCompanyStatus(
                        c.id,
                        c.status === "active" ? "paused" : "active"
                      )
                    }
                    className="min-h-[38px] px-3 rounded-xl border border-[#2D6A4F]/25 text-xs font-semibold text-[#2D6A4F] hover:bg-[#EAF4EE] inline-flex items-center gap-1.5"
                  >
                    {c.status === "active" ? (
                      <>
                        <PauseCircle className="w-3.5 h-3.5" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Activate</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePartnerCompany(c.id)}
                    className="min-h-[38px] px-3 rounded-xl border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-50 inline-flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ALL USERS & DATA */}
      {activeTab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#4A5A4F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user name, email, or state..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#2D6A4F]/20 text-sm"
                />
              </div>
              <select
                aria-label="Filter users by role"
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value as "all" | UserRole)
                }
                className="h-11 px-3.5 rounded-xl bg-white border border-[#2D6A4F]/20 text-sm font-medium"
              >
                <option value="all">All Roles ({allUsers.length})</option>
                <option value="farmer">Farmers ({roleCounts.farmer})</option>
                <option value="warehouse_owner">
                  Warehouse Owners ({roleCounts.warehouse_owner})
                </option>
                <option value="psychiatrist">
                  Psychiatrists ({roleCounts.psychiatrist})
                </option>
                <option value="support_staff">
                  Support Employees ({roleCounts.support_staff})
                </option>
              </select>
            </div>

            <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 divide-y divide-[#2D6A4F]/10">
              {filteredUsers.length === 0 ? (
                <p className="p-6 text-sm text-[#4A5A4F]">
                  No user accounts matched this filter.
                </p>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u.uid}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase text-[#2D6A4F]">
                        {getRoleDisplayLabel(u.role, false)} · {u.state}
                      </p>
                      <p className="font-semibold text-sm text-[#1B2A20] truncate">
                        {u.name}
                      </p>
                      <p className="text-xs text-[#4A5A4F] truncate">
                        {u.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInspectedUser(u)}
                      className="min-h-[38px] px-3.5 rounded-xl border border-[#2D6A4F]/25 text-xs font-semibold text-[#2D6A4F] hover:bg-[#EAF4EE] inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Data</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <aside className="lg:col-span-5 bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-4">
            {!inspectedUser ? (
              <div className="py-8 text-center space-y-2">
                <Users className="w-8 h-8 text-[#2D6A4F] mx-auto" />
                <p className="font-display font-semibold text-base text-[#1B2A20]">
                  User Data Inspector
                </p>
                <p className="text-xs text-[#4A5A4F]">
                  Select any Farmer, Warehouse Owner, Psychiatrist, or Support
                  Employee on the left to inspect their profile, role,
                  bookings, consultations, and tickets.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-[#2D6A4F]/10 pb-3">
                  <p className="text-xs font-semibold uppercase text-[#2D6A4F]">
                    {getRoleDisplayLabel(inspectedUser.role, false)}
                  </p>
                  <h2 className="font-display font-bold text-lg text-[#1B2A20]">
                    {inspectedUser.name}
                  </h2>
                  <p className="text-xs text-[#4A5A4F] break-all">
                    {inspectedUser.email}
                  </p>
                </div>

                <div className="text-xs space-y-1.5 text-[#4A5A4F]">
                  <p>
                    <strong className="text-[#1B2A20]">Phone:</strong>{" "}
                    {inspectedUser.phone || "Not set"}
                  </p>
                  <p>
                    <strong className="text-[#1B2A20]">Location:</strong>{" "}
                    {inspectedUser.district
                      ? `${inspectedUser.district}, `
                      : ""}
                    {inspectedUser.state}
                  </p>
                  {inspectedUser.role === "farmer" && (
                    <>
                      <p>
                        <strong className="text-[#1B2A20]">
                          Land Holding:
                        </strong>{" "}
                        {inspectedUser.landSizeAcres} acres
                      </p>
                      <p>
                        <strong className="text-[#1B2A20]">Crops:</strong>{" "}
                        {inspectedUser.primaryCrops.join(", ") || "Not listed"}
                      </p>
                    </>
                  )}
                  {inspectedUser.role === "psychiatrist" && (
                    <>
                      <p>
                        <strong className="text-[#1B2A20]">
                          Qualification:
                        </strong>{" "}
                        {inspectedUser.qualification || "MD Psychiatry"}
                      </p>
                      <p>
                        <strong className="text-[#1B2A20]">
                          Specialization:
                        </strong>{" "}
                        {inspectedUser.specialization || "Rural Mental Health"}
                      </p>
                    </>
                  )}
                  {inspectedUser.role === "support_staff" && (
                    <p>
                      <strong className="text-[#1B2A20]">Department:</strong>{" "}
                      {inspectedUser.department || "Support Operations"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1B2A20] mb-1">
                    Assign Role
                  </label>
                  <select
                    value={inspectedUser.role}
                    onChange={(e) => {
                      const nextRole = e.target.value as UserRole;
                      adminUpdateUserRole(inspectedUser.uid, nextRole);
                      setInspectedUser({ ...inspectedUser, role: nextRole });
                    }}
                    className="w-full h-10 px-3 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-xs font-semibold"
                  >
                    <option value="farmer">Farmer</option>
                    <option value="warehouse_owner">Warehouse Owner</option>
                    <option value="psychiatrist">Psychiatrist</option>
                    <option value="support_staff">
                      Company Support Employee
                    </option>
                  </select>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#2D6A4F]/10 text-xs">
                  <p className="font-semibold text-[#2D6A4F]">
                    Linked Activity Records
                  </p>
                  <p className="text-[#4A5A4F]">
                    Warehouses owned:{" "}
                    <strong className="text-[#1B2A20]">
                      {inspectedUserWarehouses.length}
                    </strong>
                  </p>
                  <p className="text-[#4A5A4F]">
                    Storage bookings:{" "}
                    <strong className="text-[#1B2A20]">
                      {inspectedUserBookings.length}
                    </strong>
                  </p>
                  <p className="text-[#4A5A4F]">
                    Psychiatrist consultations:{" "}
                    <strong className="text-[#1B2A20]">
                      {inspectedUserConsults.length}
                    </strong>
                  </p>
                  <p className="text-[#4A5A4F]">
                    Support tickets:{" "}
                    <strong className="text-[#1B2A20]">
                      {inspectedUserTickets.length}
                    </strong>
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* TAB 4: PSYCHIATRISTS & MENTAL HEALTH */}
      {activeTab === "psychiatrists" && (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
              Registered Mental Health Specialists ({psychiatrists.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {psychiatrists.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-1.5"
                >
                  <p className="text-xs font-semibold uppercase text-[#2D6A4F]">
                    {doc.availableForConsult ? "Available" : "Paused"} ·{" "}
                    {doc.state}
                  </p>
                  <h3 className="font-display font-semibold text-base text-[#1B2A20]">
                    {doc.name}
                  </h3>
                  <p className="text-xs font-medium text-[#2D6A4F]">
                    {doc.qualification}
                  </p>
                  <p className="text-xs text-[#4A5A4F]">{doc.specialization}</p>
                  <p className="text-xs text-[#4A5A4F]">
                    Languages: {doc.languages.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-3">
            <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
              Consultation Logs ({allConsultations.length})
            </h2>
            {allConsultations.length === 0 ? (
              <p className="text-sm text-[#4A5A4F]">
                No consultations booked yet.
              </p>
            ) : (
              <div className="divide-y divide-[#2D6A4F]/10">
                {allConsultations.map((c) => (
                  <div key={c.id} className="py-3 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-[#1B2A20]">
                        {c.farmerName} → {c.psychiatristName}
                      </p>
                      <span className="text-xs font-semibold uppercase text-[#2D6A4F]">
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#4A5A4F]">
                      Topic: {c.concernTopic} · Slot: {c.preferredSlot} ·{" "}
                      {c.language}
                    </p>
                    {c.doctorResponse && (
                      <p className="text-xs text-[#1B2A20] bg-[#EAF4EE] p-2.5 rounded-lg">
                        Doctor Note: {c.doctorResponse}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 5: WAREHOUSES & BOOKINGS */}
      {activeTab === "warehouses" && (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
              Warehouse Directory ({warehouses.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {warehouses.map((w) => (
                <div
                  key={w.id}
                  className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-1"
                >
                  <p className="text-xs font-semibold uppercase text-[#2D6A4F]">
                    {w.status} · Owner ID: {w.ownerId}
                  </p>
                  <h3 className="font-display font-semibold text-base text-[#1B2A20]">
                    {w.name}
                  </h3>
                  <p className="text-xs text-[#4A5A4F]">{w.cityState}</p>
                  <p className="text-sm font-medium text-[#1B2A20] tabular-nums pt-1">
                    {w.availableCapacityMt} / {w.totalCapacityMt} MT free · Rs.{" "}
                    {w.pricePerQuintalMonth}/quintal/mo
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-3">
            <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
              Storage Bookings ({allBookings.length})
            </h2>
            {allBookings.length === 0 ? (
              <p className="text-sm text-[#4A5A4F]">
                No storage bookings submitted yet.
              </p>
            ) : (
              <div className="divide-y divide-[#2D6A4F]/10">
                {allBookings.map((b) => (
                  <div
                    key={b.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold text-sm text-[#1B2A20]">
                        {b.farmerName} → {b.warehouseName} ({b.quantity}{" "}
                        {b.unit} {b.cropType})
                      </p>
                      <p className="text-xs text-[#4A5A4F] tabular-nums">
                        Start {b.startDate} · {b.durationMonths} mo · Rs.{" "}
                        {b.estimatedCostInr.toLocaleString("en-IN")} · Status:{" "}
                        <strong className="uppercase text-[#2D6A4F]">
                          {b.status}
                        </strong>
                      </p>
                    </div>
                    {b.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(b.id, "approved")}
                          className="min-h-[36px] px-3 rounded-xl bg-[#2D6A4F] text-white text-xs font-semibold"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(b.id, "rejected")}
                          className="min-h-[36px] px-3 rounded-xl border border-red-200 text-red-700 text-xs font-semibold"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 6: SUPPORT TICKETS & COMPLAINTS */}
      {activeTab === "tickets" && (
        <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
                Complaints, Support &amp; Well-Being Requests (
                {prioritizedAdminTickets.length})
              </h2>
              <p className="text-xs text-[#4A5A4F]">
                Active complaints are automatically highlighted and sorted to the
                top for priority handling.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTicketFilter("all")}
                className={`min-h-[36px] px-3.5 rounded-xl text-xs font-semibold transition-colors ${
                  ticketFilter === "all"
                    ? "bg-[#2D6A4F] text-white"
                    : "bg-[#FAF8F3] border border-[#2D6A4F]/20 text-[#1B2A20]"
                }`}
              >
                All ({allSupportTickets.length})
              </button>
              <button
                type="button"
                onClick={() => setTicketFilter("complaints")}
                className={`min-h-[36px] px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                  ticketFilter === "complaints"
                    ? "bg-red-700 text-white"
                    : "bg-red-50 border border-red-200 text-red-800 hover:bg-red-100"
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>
                  Complaints (
                  {allSupportTickets.filter((t) => isComplaintTicket(t)).length}
                  )
                </span>
              </button>
            </div>
          </div>

          {activeComplaintsCount > 0 && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-center gap-2.5 text-xs font-semibold text-red-900">
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
              <span>
                {activeComplaintsCount} Active Priority Complaint
                {activeComplaintsCount > 1 ? "s" : ""} highlighted below ahead
                of general requests.
              </span>
            </div>
          )}

          {prioritizedAdminTickets.length === 0 ? (
            <p className="text-sm text-[#4A5A4F]">No matching tickets found.</p>
          ) : (
            <div className="space-y-3">
              {prioritizedAdminTickets.map((t) => {
                const isComplaint = isComplaintTicket(t);
                const activeComplaint = isActiveComplaint(t);
                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      activeComplaint
                        ? "bg-red-50/55 border-2 border-red-300"
                        : "bg-[#FAF8F3]/60 border border-[#2D6A4F]/15"
                    }`}
                  >
                    <div className="space-y-1">
                      {activeComplaint && (
                        <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-red-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-700 shrink-0" />
                          <span>High Priority Complaint · Action Needed</span>
                        </p>
                      )}
                      <p
                        className={`text-xs font-semibold uppercase ${
                          activeComplaint ? "text-red-800" : "text-[#2D6A4F]"
                        }`}
                      >
                        {isComplaint ? "Complaint" : t.category} ·{" "}
                        {t.status.replace("_", " ")}
                        {t.priority === "urgent" ? " · Urgent" : ""}
                        {t.assignedEmployeeName
                          ? ` · Assigned: ${t.assignedEmployeeName}`
                          : ""}
                      </p>
                      <p className="font-semibold text-sm text-[#1B2A20]">
                        {t.subject}
                      </p>
                      <p className="text-xs text-[#4A5A4F]">{t.message}</p>
                      {t.employeeReply && (
                        <p className="text-xs text-[#1B2A20] bg-[#EAF4EE] px-2.5 py-1.5 rounded-lg mt-1">
                          Reply: {t.employeeReply}
                        </p>
                      )}
                    </div>
                    {t.status !== "resolved" && (
                      <button
                        type="button"
                        onClick={() =>
                          updateSupportTicket({
                            ticketId: t.id,
                            status: "resolved",
                            claimTicket: !t.assignedEmployeeId,
                            employeeReply:
                              t.employeeReply ||
                              "Resolved by BhoomiBandhu Admin.",
                          })
                        }
                        className={`min-h-[38px] px-4 rounded-xl text-white text-xs font-semibold inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0 ${
                          activeComplaint
                            ? "bg-red-700 hover:bg-red-800"
                            : "bg-[#2D6A4F] hover:bg-[#24553F]"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {activeComplaint
                            ? "Resolve Complaint"
                            : "Mark Resolved"}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
