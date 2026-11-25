import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  Flag,
  HeartHandshake,
  HelpCircle,
  Landmark,
  MessageSquare,
  Shield,
  Sprout,
  Warehouse,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { SCHEMES_DATA } from "../data/bhoomiData";
import type { TranslationKey } from "../i18n/translations";
import { getRoleDisplayLabel } from "../utils/roles";
import {
  formatComplaintTimestamp,
  getComplaintProgressStage,
  getFarmerComplaints,
  isActiveComplaint,
} from "../utils/supportTicketStats";

interface ServiceCardDef {
  to: string;
  labelKey: TranslationKey;
  descKey: TranslationKey;
  icon: React.ComponentType<{ className?: string }>;
}

const SERVICE_CARDS: ServiceCardDef[] = [
  {
    to: "/schemes",
    labelKey: "dashboard.cardSchemes",
    descKey: "dashboard.cardSchemesDesc",
    icon: BookOpen,
  },
  {
    to: "/insurance",
    labelKey: "dashboard.cardInsurance",
    descKey: "dashboard.cardInsuranceDesc",
    icon: Shield,
  },
  {
    to: "/warehouses",
    labelKey: "dashboard.cardStorage",
    descKey: "dashboard.cardStorageDesc",
    icon: Warehouse,
  },
  {
    to: "/loans",
    labelKey: "dashboard.cardLoans",
    descKey: "dashboard.cardLoansDesc",
    icon: Landmark,
  },
  {
    to: "/crop-advisor",
    labelKey: "dashboard.cardCropAdvisor",
    descKey: "dashboard.cardCropAdvisorDesc",
    icon: Compass,
  },
  {
    to: "/chat",
    labelKey: "dashboard.cardAiChat",
    descKey: "dashboard.cardAiChatDesc",
    icon: MessageSquare,
  },
  {
    to: "/wellbeing",
    labelKey: "dashboard.cardWellbeing",
    descKey: "dashboard.cardWellbeingDesc",
    icon: HeartHandshake,
  },
  {
    to: "/help",
    labelKey: "dashboard.cardHelp",
    descKey: "dashboard.cardHelpDesc",
    icon: HelpCircle,
  },
];

export function DashboardPage() {
  const { user, profile, isAdmin, savedSchemes, bookings, supportTickets } =
    useAuth();
  const { t } = useLanguage();
  const [complaintFilter, setComplaintFilter] = useState<
    "all" | "active" | "resolved"
  >("all");

  const displayName = user
    ? profile?.name?.split(" ")[0] || "Friend"
    : "Kisan Friend";

  const featuredScheme = SCHEMES_DATA[0];

  const allFarmerComplaints = useMemo(
    () => getFarmerComplaints(supportTickets),
    [supportTickets]
  );

  const activeComplaintsCount = useMemo(
    () => allFarmerComplaints.filter((c) => isActiveComplaint(c)).length,
    [allFarmerComplaints]
  );

  const visibleComplaints = useMemo(() => {
    if (complaintFilter === "active") {
      return allFarmerComplaints.filter((c) => c.status !== "resolved");
    }
    if (complaintFilter === "resolved") {
      return allFarmerComplaints.filter((c) => c.status === "resolved");
    }
    return allFarmerComplaints;
  }, [allFarmerComplaints, complaintFilter]);

  const recentItems = [
    ...savedSchemes.slice(0, 2).map((s) => ({
      id: s.id,
      title: `Scheme saved: ${s.schemeName}`,
      meta: s.category,
      to: `/schemes/${s.schemeId}`,
    })),
    ...bookings.slice(0, 2).map((b) => ({
      id: b.id,
      title: `Storage ${b.status}: ${b.warehouseName}`,
      meta: `${b.quantity} ${b.unit} · ${b.cropType}`,
      to: `/warehouses/${b.warehouseId}`,
    })),
  ];

  return (
    <div className="space-y-8">
      {/* Greeting + Hero Advisory Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-[#EAF4EE] rounded-2xl border border-[#2D6A4F]/15 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-[#2D6A4F] mb-2">
              {user
                ? `${getRoleDisplayLabel(profile?.role, isAdmin)} · ${profile?.state || "India"}`
                : t("dashboard.tagline")}
            </p>
            <h1 className="text-2xl md:text-4xl font-display font-bold text-[#1B2A20] leading-tight">
              {t("dashboard.namaste")}, {displayName}
            </h1>
            <p className="text-sm md:text-base text-[#4A5A4F] mt-3 max-w-xl leading-relaxed">
              {profile?.role === "warehouse_owner"
                ? t("dashboard.heroOwnerDesc")
                : t("dashboard.heroFarmerDesc")}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/eligibility"
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-sm inline-flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{t("dashboard.checkEligibility")}</span>
            </Link>
            <Link
              to={`/schemes/${featuredScheme.id}`}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white border border-[#2D6A4F]/25 text-[#2D6A4F] hover:bg-[#F2EFE6] font-semibold text-sm inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <span>
                {t("dashboard.viewScheme")}
                {" "}
                {featuredScheme.shortName}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-[#2D6A4F]/15 bg-white relative min-h-[220px]">
          <img
            src="/src/assets/images/hero_farmland_1795276858314.jpg"
            alt="Green Indian agricultural fields at sunrise"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover lg:h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-5 flex flex-col justify-end text-white">
            <p className="text-xs font-medium text-amber-200">
              {t("dashboard.rabiKharif")}
            </p>
            <p className="font-display font-semibold text-lg leading-snug mt-0.5">
              {t("dashboard.heroRightTitle")}
            </p>
            <Link
              to="/crop-advisor"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#E9A23B] hover:underline"
            >
              <span>{t("dashboard.openCropAdvisor")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8-Card Service Grid */}
      <section aria-labelledby="services-heading">
        <div className="flex items-center justify-between mb-4">
          <h2
            id="services-heading"
            className="text-lg md:text-xl font-display font-semibold text-[#1B2A20]"
          >
            {t("dashboard.servicesTitle")}
          </h2>
          <Link
            to="/services"
            className="text-sm font-semibold text-[#2D6A4F] hover:underline whitespace-nowrap"
          >
            {t("dashboard.viewAllModules")}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {SERVICE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.to}
                to={card.to}
                className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-4 md:p-5 hover:border-[#2D6A4F] hover:bg-[#EAF4EE]/40 transition-colors flex flex-col justify-between min-h-[120px]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm md:text-base text-[#1B2A20]">
                    {t(card.labelKey)}
                  </p>
                  <p className="text-xs text-[#4A5A4F] mt-0.5 line-clamp-1">
                    {t(card.descKey)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* My Complaints Tracker */}
      <section
        aria-labelledby="my-complaints-heading"
        className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 md:p-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                activeComplaintsCount > 0
                  ? "bg-red-50 text-red-700"
                  : "bg-[#EAF4EE] text-[#2D6A4F]"
              }`}
            >
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="my-complaints-heading"
                  className="text-lg md:text-xl font-display font-semibold text-[#1B2A20]"
                >
                  My Complaints
                </h2>
                {user && allFarmerComplaints.length > 0 && (
                  <span className="text-xs font-semibold text-[#4A5A4F] tabular-nums">
                    ({allFarmerComplaints.length} total
                    {activeComplaintsCount > 0
                      ? ` · ${activeComplaintsCount} active priority`
                      : ""}
                    )
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#4A5A4F] mt-0.5">
                Track progress, officer replies, and timestamps for every
                complaint you have filed.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {user && allFarmerComplaints.length > 0 && (
              <div
                role="tablist"
                aria-label="Filter my complaints"
                className="inline-flex rounded-xl bg-[#FAF8F3] p-1 border border-[#2D6A4F]/15"
              >
                {(
                  [
                    { id: "all", label: "All" },
                    { id: "active", label: "Active" },
                    { id: "resolved", label: "Resolved" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={complaintFilter === tab.id}
                    onClick={() => setComplaintFilter(tab.id)}
                    className={`min-h-[34px] px-3 rounded-lg text-xs font-semibold transition-colors ${
                      complaintFilter === tab.id
                        ? "bg-[#2D6A4F] text-white"
                        : "text-[#4A5A4F] hover:text-[#1B2A20]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            <Link
              to="/help?tab=complaint"
              className="min-h-[40px] px-4 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-red-800 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Register a Complaint</span>
            </Link>
          </div>
        </div>

        {!user ? (
          <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-[#4A5A4F]">
              Sign in to view your previously filed complaints, live review
              timestamps, and resolution updates.
            </p>
            <Link
              to="/auth"
              className="min-h-[40px] px-4 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-xs inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-colors"
            >
              <span>Sign In to Track</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : visibleComplaints.length === 0 ? (
          <div className="p-5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/10 text-center space-y-2">
            <p className="text-sm font-medium text-[#1B2A20]">
              {allFarmerComplaints.length === 0
                ? "You have not filed any complaints yet."
                : `No ${complaintFilter} complaints found.`}
            </p>
            <p className="text-xs text-[#4A5A4F]">
              Facing an issue with a warehouse, subsidy, loan, or insurance
              claim? File a priority complaint anytime.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleComplaints.map((complaint) => {
              const active = isActiveComplaint(complaint);
              const stage = getComplaintProgressStage(complaint.status);
              const filedAt = formatComplaintTimestamp(complaint.createdAtIso);
              const updatedAt = formatComplaintTimestamp(
                complaint.updatedAtIso || complaint.createdAtIso
              );

              return (
                <article
                  key={complaint.id}
                  className={`rounded-xl p-4 space-y-3 ${
                    active
                      ? "bg-red-50/45 border-2 border-red-300"
                      : "bg-[#FAF8F3] border border-[#2D6A4F]/20"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide">
                        {active ? (
                          <span className="inline-flex items-center gap-1 text-red-800">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-700 shrink-0" />
                            <span>{stage.statusLabel}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#2D6A4F]">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{stage.statusLabel}</span>
                          </span>
                        )}
                        <span className="text-[#4A5A4F] font-medium normal-case tracking-normal">
                          · Ref {complaint.id.slice(0, 14)}
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-base text-[#1B2A20]">
                        {complaint.subject}
                      </h3>
                    </div>

                    <div className="text-xs text-[#4A5A4F] flex flex-col sm:items-end gap-0.5 tabular-nums shrink-0">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Filed: {filedAt}</span>
                      </span>
                      <span className="text-[11px]">
                        Last updated: {updatedAt}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-[#4A5A4F] leading-relaxed">
                    {complaint.message}
                  </p>

                  {/* 3-Step Progress Bar */}
                  <div
                    aria-label={`Complaint progress: step ${stage.step} of 3 (${stage.label})`}
                    className="space-y-1.5 pt-1"
                  >
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { step: 1, label: "1. Filed" },
                          { step: 2, label: "2. In Review" },
                          { step: 3, label: "3. Resolved" },
                        ] as const
                      ).map((item) => {
                        const reached = stage.step >= item.step;
                        return (
                          <div key={item.step} className="space-y-1">
                            <div
                              className={`h-1.5 rounded-full ${
                                reached
                                  ? active
                                    ? "bg-red-600"
                                    : "bg-[#2D6A4F]"
                                  : "bg-[#E2DDD2]"
                              }`}
                            />
                            <p
                              className={`text-[11px] font-semibold ${
                                reached
                                  ? active
                                    ? "text-red-900"
                                    : "text-[#2D6A4F]"
                                  : "text-[#6B7A6F]"
                              }`}
                            >
                              {item.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-[#4A5A4F]">
                      {stage.description}
                      {complaint.assignedEmployeeName
                        ? ` · Officer: ${complaint.assignedEmployeeName}`
                        : ""}
                    </p>
                  </div>

                  {complaint.employeeReply && (
                    <div className="p-3 rounded-lg bg-[#EAF4EE] border border-[#2D6A4F]/15 text-xs text-[#1B2A20]">
                      <strong className="text-[#2D6A4F]">
                        {complaint.assignedEmployeeName || "Support Team"}:
                      </strong>{" "}
                      {complaint.employeeReply}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Activity & Quick Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-[#1B2A20]">
              {t("dashboard.recentActivity")}
            </h2>
            {user && (
              <Link
                to="/profile"
                className="text-sm font-medium text-[#2D6A4F] hover:underline"
              >
                Full history
              </Link>
            )}
          </div>

          {!user ? (
            <div className="py-4 space-y-3">
              <p className="text-sm text-[#4A5A4F]">
                Sign in with your email or Google account to save schemes, track
                warehouse storage bookings, and keep AI chat notes across
                devices.
              </p>
              <Link
                to="/auth"
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-sm inline-flex items-center gap-2 transition-colors"
              >
                <span>Log In or Create Free Account</span>
              </Link>
            </div>
          ) : recentItems.length === 0 ? (
            <div className="py-4 space-y-3">
              <p className="text-sm text-[#4A5A4F]">
                No saved schemes or storage requests yet. Start by saving a
                scheme or requesting storage near your mandi.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/schemes"
                  className="text-sm font-semibold text-[#2D6A4F] hover:underline"
                >
                  Browse Schemes
                </Link>
                <span aria-hidden="true" className="text-[#4A5A4F]">
                  ·
                </span>
                <Link
                  to="/warehouses"
                  className="text-sm font-semibold text-[#2D6A4F] hover:underline"
                >
                  Explore Storage
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#2D6A4F]/10">
              {recentItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.to}
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-[#FAF8F3] px-2 -mx-2 rounded-xl transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1B2A20] truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-[#4A5A4F] mt-0.5">{item.meta}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#2D6A4F] mb-2">
              <Sprout className="w-5 h-5" />
              <h2 className="text-lg font-display font-semibold text-[#1B2A20]">
                {t("dashboard.askAiTitle")}
              </h2>
            </div>
            <p className="text-sm text-[#4A5A4F] leading-relaxed">
              {t("dashboard.askAiDesc")}
            </p>
          </div>
          <div className="mt-5">
            <Link
              to="/chat"
              className="w-full min-h-[44px] rounded-xl border border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#EAF4EE] font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t("dashboard.startAiChat")}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
