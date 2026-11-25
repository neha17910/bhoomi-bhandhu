import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  Landmark,
  ListOrdered,
  Phone,
} from "lucide-react";
import { LOANS_DATA } from "../data/bhoomiData";
import { useAuth } from "../context/AuthContext";
import {
  filterPartnerCompaniesForRole,
  getLoanFilterTabsForRole,
  getLoansForRole,
} from "../utils/warehouseFinance";
import { getSafeExternalUrl } from "../utils/safeUrl";

export function LoansPage() {
  const { profile, partnerCompanies } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(
    searchParams.get("loan")
  );
  const [filterType, setFilterType] = useState<string>("All");

  const isOwner = profile?.role === "warehouse_owner";

  const roleLoans = useMemo(
    () => getLoansForRole(profile?.role, LOANS_DATA),
    [profile?.role]
  );

  const loanTypes = useMemo(
    () => getLoanFilterTabsForRole(profile?.role),
    [profile?.role]
  );

  useEffect(() => {
    if (!loanTypes.includes(filterType)) {
      setFilterType("All");
    }
  }, [loanTypes, filterType]);

  const activeLoan = roleLoans.find((l) => l.id === selectedLoanId);
  const activeLoanCompanies = useMemo(
    () => filterPartnerCompaniesForRole(profile?.role, "loan", partnerCompanies),
    [profile?.role, partnerCompanies]
  );

  const openLoan = (id: string) => {
    setSelectedLoanId(id);
    setSearchParams({ loan: id });
  };

  const closeLoan = () => {
    setSelectedLoanId(null);
    setSearchParams({});
  };

  if (activeLoan) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={closeLoan}
            aria-label="Back to Loans list"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-white border border-[#2D6A4F]/20 flex items-center justify-center text-[#2D6A4F] hover:bg-[#EAF4EE]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs font-semibold text-[#2D6A4F]">
              {activeLoan.loanType} · {activeLoan.provider}
            </p>
            <h1 className="text-xl md:text-2xl font-display font-bold text-[#1B2A20]">
              {activeLoan.name}
            </h1>
          </div>
        </div>

        <div className="bg-[#EAF4EE] rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-2">
          <p className="text-base text-[#1B2A20] leading-relaxed">
            {activeLoan.summary}
          </p>
          <p className="text-sm font-semibold text-[#2D6A4F]">
            Interest Overview: {activeLoan.interestSummary}
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
              {activeLoan.eligibility.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#2D6A4F]">
              <Landmark className="w-5 h-5" />
              <h2 className="font-display font-semibold text-base text-[#1B2A20]">
                Interest &amp; Repayment
              </h2>
            </div>
            <ul className="space-y-2 text-sm text-[#4A5A4F] list-disc pl-5 leading-relaxed">
              {activeLoan.repaymentTerms.map((item, idx) => (
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
              {activeLoan.documents.map((item, idx) => (
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
              {activeLoan.howToApply.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ol>
          </section>
        </div>

        {getSafeExternalUrl(activeLoan.officialUrl) && (
          <a
            href={getSafeExternalUrl(activeLoan.officialUrl)!}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-h-[48px] px-7 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors"
          >
            <span>
              {isOwner
                ? "Visit Commercial Lending Portal"
                : "Visit Official Portal"}
            </span>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    );
  }

  const visibleLoans = roleLoans.filter(
    (l) => filterType === "All" || l.loanType === filterType
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1B2A20]">
          {isOwner
            ? "Commercial Warehouse Financing & Loans"
            : "Financial Assistance & Loans"}
        </h1>
        <p className="text-sm text-[#4A5A4F] mt-1">
          {isOwner
            ? "Term loans, working capital overdrafts, and land purchase credit for warehouse construction and operations."
            : "Simple explanations of institutional farm credit without hidden banking jargon."}
        </p>
      </div>

      {isOwner && (
        <div className="bg-[#EAF4EE] rounded-2xl border border-[#2D6A4F]/15 p-5 md:p-6">
          <p className="text-sm md:text-base text-[#1B2A20] leading-relaxed">
            Financing shown below is tailored strictly for commercial godown
            owners — covering new warehouse or cold-storage construction,
            working capital overdrafts for utilities and staff, and commercial
            storage plot acquisition (excludes crop cultivation loans).
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {loanTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilterType(type)}
            className={`min-h-[40px] px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
              filterType === type
                ? "bg-[#2D6A4F] text-white"
                : "bg-white border border-[#2D6A4F]/25 text-[#1B2A20] hover:bg-[#EAF4EE]"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleLoans.map((loan) => (
          <button
            key={loan.id}
            type="button"
            onClick={() => openLoan(loan.id)}
            className="text-left bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 hover:border-[#2D6A4F] transition-colors flex items-start justify-between gap-4"
          >
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-[#2D6A4F]">
                {loan.loanType} · {loan.provider}
              </p>
              <h2 className="font-display font-semibold text-base md:text-lg text-[#1B2A20]">
                {loan.name}
              </h2>
              <p className="text-sm text-[#4A5A4F] leading-relaxed">
                {loan.summary}
              </p>
              <p className="text-xs font-medium text-[#1B2A20] pt-1">
                {loan.interestSummary}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-1" />
          </button>
        ))}
      </div>

      {activeLoanCompanies.length > 0 && (
        <section className="space-y-4 pt-2">
          <div>
            <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
              {isOwner
                ? `Commercial Warehouse Lending Partners (${activeLoanCompanies.length})`
                : `Verified Partner Loan Companies (${activeLoanCompanies.length})`}
            </h2>
            <p className="text-xs text-[#4A5A4F]">
              Banks and financial institutions published by BhoomiBandhu Admin.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLoanCompanies.map((comp) => (
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
                  Limit: {comp.coverageOrLimit}
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
    </div>
  );
}
