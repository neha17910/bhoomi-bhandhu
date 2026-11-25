import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { INDIAN_STATES } from "../data/bhoomiData";
import {
  evaluateSchemeEligibility,
  type FarmerCategoryType,
  type LandHoldingTier,
  type PrimaryNeedType,
} from "../utils/eligibility";

export function EligibilityCheckerPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [state, setState] = useState("Punjab");
  const [landTier, setLandTier] = useState<LandHoldingTier>("small");
  const [farmerType, setFarmerType] = useState<FarmerCategoryType>("owner");
  const [primaryNeed, setPrimaryNeed] = useState<PrimaryNeedType>("all");

  const matchedSchemes = evaluateSchemeEligibility({
    state,
    landTier,
    farmerType,
    primaryNeed,
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1B2A20]">
          Check if you&apos;re eligible
        </h1>
        <p className="text-sm text-[#4A5A4F] mt-1">
          Answer 4 simple questions to see which central schemes fit your farm.
        </p>
      </div>

      {step <= 4 ? (
        <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#2D6A4F]">
              <span>Step {step} of 4</span>
              <span className="tabular-nums">{step * 25}%</span>
            </div>
            <div className="h-2 rounded-full bg-[#EAF4EE] overflow-hidden">
              <div
                className="h-full bg-[#2D6A4F] transition-all duration-200"
                style={{ width: `${step * 25}%` }}
              />
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-3">
              <label
                htmlFor="elig-state"
                className="block font-display font-semibold text-lg text-[#1B2A20]"
              >
                Which state is your farm in?
              </label>
              <select
                id="elig-state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-base focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
              >
                {INDIAN_STATES.filter((s) => s !== "All India").map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="font-display font-semibold text-lg text-[#1B2A20]">
                What is your approximate land holding size?
              </p>
              <div className="space-y-2.5">
                {[
                  {
                    value: "marginal" as LandHoldingTier,
                    label: "Marginal Farmer (Up to 2.5 acres / 1 hectare)",
                  },
                  {
                    value: "small" as LandHoldingTier,
                    label: "Small Farmer (2.5 to 5 acres / 1–2 hectares)",
                  },
                  {
                    value: "medium" as LandHoldingTier,
                    label: "Medium Farmer (5 to 12 acres)",
                  },
                  {
                    value: "large" as LandHoldingTier,
                    label: "Large Farmer (Above 12 acres)",
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLandTier(opt.value)}
                    className={`w-full min-h-[48px] p-4 rounded-xl border text-left text-sm font-medium transition-colors ${
                      landTier === opt.value
                        ? "border-[#2D6A4F] bg-[#EAF4EE] text-[#1B2A20]"
                        : "border-[#2D6A4F]/20 bg-[#FAF8F3] text-[#4A5A4F] hover:bg-[#F2EFE6]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="font-display font-semibold text-lg text-[#1B2A20]">
                How do you cultivate the land?
              </p>
              <div className="space-y-2.5">
                {[
                  {
                    value: "owner" as FarmerCategoryType,
                    label: "Landowner Farmer (land registered in family name)",
                  },
                  {
                    value: "tenant" as FarmerCategoryType,
                    label: "Tenant / Sharecropper (leased land)",
                  },
                  {
                    value: "fpo" as FarmerCategoryType,
                    label: "FPO / Farmer Group Member",
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFarmerType(opt.value)}
                    className={`w-full min-h-[48px] p-4 rounded-xl border text-left text-sm font-medium transition-colors ${
                      farmerType === opt.value
                        ? "border-[#2D6A4F] bg-[#EAF4EE] text-[#1B2A20]"
                        : "border-[#2D6A4F]/20 bg-[#FAF8F3] text-[#4A5A4F] hover:bg-[#F2EFE6]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <p className="font-display font-semibold text-lg text-[#1B2A20]">
                What kind of support are you looking for?
              </p>
              <div className="space-y-2.5">
                {[
                  { value: "all" as PrimaryNeedType, label: "Show all matching schemes" },
                  { value: "income" as PrimaryNeedType, label: "Direct Income & Market Support" },
                  { value: "insurance" as PrimaryNeedType, label: "Crop Loss & Weather Insurance" },
                  { value: "loan" as PrimaryNeedType, label: "Low-Interest Crop Loans" },
                  { value: "soil" as PrimaryNeedType, label: "Soil Testing & Organic Farming" },
                  { value: "equipment" as PrimaryNeedType, label: "Solar Pumps & Drip Irrigation" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPrimaryNeed(opt.value)}
                    className={`w-full min-h-[48px] p-4 rounded-xl border text-left text-sm font-medium transition-colors ${
                      primaryNeed === opt.value
                        ? "border-[#2D6A4F] bg-[#EAF4EE] text-[#1B2A20]"
                        : "border-[#2D6A4F]/20 bg-[#FAF8F3] text-[#4A5A4F] hover:bg-[#F2EFE6]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
                className="min-h-[44px] px-4 text-sm font-semibold text-[#4A5A4F] hover:text-[#1B2A20] inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as 2 | 3 | 4 | 5)}
              className="min-h-[48px] px-7 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-sm inline-flex items-center gap-2 transition-colors"
            >
              <span>{step === 4 ? "See Matching Schemes" : "Next"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-7 h-7 text-[#2D6A4F] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-display font-bold text-[#1B2A20]">
                You may be eligible for {matchedSchemes.length} scheme
                {matchedSchemes.length === 1 ? "" : "s"}
              </h2>
              <p className="text-sm text-[#4A5A4F] mt-1">
                Based on {state} · {landTier} holding · {farmerType} profile.
                Final approval depends on official document verification.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {matchedSchemes.map((scheme) => (
              <Link
                key={scheme.id}
                to={`/schemes/${scheme.id}`}
                className="block p-4 rounded-xl border border-[#2D6A4F]/20 bg-[#FAF8F3] hover:border-[#2D6A4F] transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-[#2D6A4F]">
                      {scheme.category}
                    </p>
                    <p className="font-semibold text-base text-[#1B2A20]">
                      {scheme.name}
                    </p>
                    <p className="text-xs text-[#4A5A4F] mt-0.5">
                      {scheme.benefitHighlight}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                </div>
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="min-h-[44px] px-4 rounded-xl border border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#EAF4EE] font-semibold text-sm inline-flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Check Again</span>
            </button>
            <Link
              to="/schemes"
              className="text-sm font-semibold text-[#2D6A4F] hover:underline"
            >
              Browse all schemes
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
