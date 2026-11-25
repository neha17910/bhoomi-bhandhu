import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  Headphones,
  ListOrdered,
  MessageSquare,
  Phone,
  Shield,
} from "lucide-react";
import { INSURANCE_PLANS } from "../data/bhoomiData";
import { useAuth } from "../context/AuthContext";
import {
  filterPartnerCompaniesForRole,
  getInsurancePlansForRole,
} from "../utils/warehouseFinance";
import { getSafeExternalUrl } from "../utils/safeUrl";

export function InsurancePage() {
  const { profile, partnerCompanies } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activePlanId = searchParams.get("plan");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    activePlanId
  );

  const isOwner = profile?.role === "warehouse_owner";

  const rolePlans = useMemo(
    () => getInsurancePlansForRole(profile?.role, INSURANCE_PLANS),
    [profile?.role]
  );

  const activePlan = rolePlans.find((p) => p.id === selectedPlanId);
  const activeInsuranceCompanies = useMemo(
    () =>
      filterPartnerCompaniesForRole(
        profile?.role,
        "insurance",
        partnerCompanies
      ),
    [profile?.role, partnerCompanies]
  );

  const openPlan = (id: string) => {
    setSelectedPlanId(id);
    setSearchParams({ plan: id });
  };

  const closePlan = () => {
    setSelectedPlanId(null);
    setSearchParams({});
  };

  if (activePlan) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={closePlan}
            aria-label="Back to Insurance Hub"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-white border border-[#2D6A4F]/20 flex items-center justify-center text-[#2D6A4F] hover:bg-[#EAF4EE]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs font-semibold text-[#2D6A4F]">
              {activePlan.category}
            </p>
            <h1 className="text-xl md:text-2xl font-display font-bold text-[#1B2A20]">
              {activePlan.name}
            </h1>
          </div>
        </div>

        <div className="bg-[#EAF4EE] rounded-2xl border border-[#2D6A4F]/15 p-5">
          <p className="text-base text-[#1B2A20] leading-relaxed">
            {activePlan.summary}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#2D6A4F]">
              <CheckCircle2 className="w-5 h-5" />
              <h2 className="font-display font-semibold text-base text-[#1B2A20]">
                Eligibility
              </h2>
            </div>
            <ul className="space-y-2 text-sm text-[#4A5A4F] list-disc pl-5 leading-relaxed">
              {activePlan.eligibility.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#2D6A4F]">
              <Shield className="w-5 h-5" />
              <h2 className="font-display font-semibold text-base text-[#1B2A20]">
                Premium &amp; Coverage
              </h2>
            </div>
            <ul className="space-y-2 text-sm text-[#4A5A4F] list-disc pl-5 leading-relaxed">
              {activePlan.premiumAndCoverage.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#2D6A4F]">
              <FileText className="w-5 h-5" />
              <h2 className="font-display font-semibold text-base text-[#1B2A20]">
                Required Documents
              </h2>
            </div>
            <ul className="space-y-2 text-sm text-[#4A5A4F] list-disc pl-5 leading-relaxed">
              {activePlan.documents.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#2D6A4F]">
              <ListOrdered className="w-5 h-5" />
              <h2 className="font-display font-semibold text-base text-[#1B2A20]">
                How to Apply
              </h2>
            </div>
            <ol className="space-y-2 text-sm text-[#4A5A4F] list-decimal pl-5 leading-relaxed">
              {activePlan.howToApply.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ol>
          </section>
        </div>

        {getSafeExternalUrl(activePlan.officialUrl) && (
          <a
            href={getSafeExternalUrl(activePlan.officialUrl)!}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-h-[48px] px-7 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors"
          >
            <span>
              {isOwner
                ? "Visit Official Insurer Portal"
                : "Visit Official PMFBY Portal"}
            </span>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center shrink-0">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1B2A20]">
            {isOwner
              ? "Commercial Warehouse & Facility Insurance"
              : "Crop Insurance"}
          </h1>
          <p className="text-sm text-[#4A5A4F]">
            {isOwner
              ? "Protect your godown buildings, cold-chain machinery, construction sites, and stored inventory."
              : "Plain-language guidance on protecting your harvest against weather risks."}
          </p>
        </div>
      </div>

      <div className="bg-[#EAF4EE] rounded-2xl border border-[#2D6A4F]/15 p-5 md:p-6">
        <p className="text-base text-[#1B2A20] leading-relaxed">
          {isOwner
            ? "Commercial storage facilities require protection across building fire and perils, cold-storage compressor and Deterioration of Stock (DOS) breakdown, under-construction Contractors' All-Risk (CAR), and warehouseman legal liability for pledged stock — helping meet bank loan and WDRA compliance."
            : "Crop insurance helps recover your cultivation costs if drought, unseasonal rain, hailstorms, or pests damage your crop. Farmers pay only a small capped percentage (1.5% to 5%), while Central and State governments subsidize the rest."}
        </p>
      </div>

      <div className="space-y-3">
        {rolePlans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => openPlan(plan.id)}
            className="w-full text-left bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 hover:border-[#2D6A4F] transition-colors flex items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#2D6A4F]">
                {plan.category}
              </p>
              <h2 className="font-display font-semibold text-base md:text-lg text-[#1B2A20]">
                {plan.name}
              </h2>
              <p className="text-sm text-[#4A5A4F]">{plan.summary}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#2D6A4F] shrink-0" />
          </button>
        ))}
      </div>

      {activeInsuranceCompanies.length > 0 && (
        <section className="space-y-4 pt-2">
          <div>
            <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
              {isOwner
                ? `Commercial Warehouse Insurance Partners (${activeInsuranceCompanies.length})`
                : `Empaneled Crop Insurance Companies (${activeInsuranceCompanies.length})`}
            </h2>
            <p className="text-xs text-[#4A5A4F]">
              Insurance providers listed and maintained by BhoomiBandhu Admin.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeInsuranceCompanies.map((comp) => (
              <div
                key={comp.id}
                className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-2"
              >
                <p className="text-xs font-semibold text-[#2D6A4F]">
                  {comp.interestOrPremium}
                </p>
                <h3 className="font-display font-semibold text-base text-[#1B2A20]">
                  {comp.name}
                </h3>
                <p className="text-xs font-medium text-[#1B2A20]">
                  Coverage: {comp.coverageOrLimit}
                </p>
                <p className="text-xs text-[#4A5A4F] leading-relaxed">
                  {comp.eligibilitySummary}
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#2D6A4F] inline-flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    Helpline: {comp.contactHelpline}
                  </span>
                  {getSafeExternalUrl(comp.websiteUrl) && (
                    <a
                      href={getSafeExternalUrl(comp.websiteUrl)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#2D6A4F] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="pt-2">
        {isOwner ? (
          <Link
            to="/help"
            className="min-h-[48px] px-6 rounded-xl border border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#EAF4EE] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Headphones className="w-4 h-4" />
            <span>Need help choosing warehouse cover? Contact Support Desk</span>
          </Link>
        ) : (
          <Link
            to="/chat?prompt=Explain%20how%20PMFBY%20crop%20insurance%20premium%20and%20claim%20reporting%20work"
            className="min-h-[48px] px-6 rounded-xl border border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#EAF4EE] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Not sure which to choose? Ask AI Chat</span>
          </Link>
        )}
      </div>
    </div>
  );
}
