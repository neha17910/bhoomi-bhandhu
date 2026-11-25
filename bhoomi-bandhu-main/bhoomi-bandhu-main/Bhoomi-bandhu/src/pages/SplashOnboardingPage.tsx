import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Sprout } from "lucide-react";

export function SplashOnboardingPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get("autostart") === "1") {
      navigate("/", { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1B2A20] flex flex-col justify-between p-6 md:p-10">
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#2D6A4F] font-display font-bold text-lg">
          <Sprout className="w-6 h-6" />
          <span>BhoomiBandhu</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="min-h-[44px] px-4 text-sm font-semibold text-[#4A5A4F] hover:text-[#2D6A4F] transition-colors"
        >
          Skip
        </button>
      </div>

      {step === 1 ? (
        <div className="max-w-xl w-full mx-auto text-center py-12 space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center mx-auto">
            <Sprout className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-display font-bold text-[#1B2A20]">
              BhoomiBandhu
            </h1>
            <p className="text-base md:text-lg font-medium text-[#B86E00]">
              A Trusted Friend for Every Farmer
            </p>
          </div>
          <p className="text-sm md:text-base text-[#4A5A4F] leading-relaxed max-w-md mx-auto">
            Plain-language guidance for government schemes, crop insurance,
            nearby grain storage, crop suggestions, and daily farm support.
          </p>
          <div className="pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="min-h-[48px] px-8 rounded-2xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-base inline-flex items-center justify-center gap-2 transition-colors"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-8">
          <div className="rounded-2xl overflow-hidden bg-[#EAF4EE] border border-[#2D6A4F]/15 aspect-[4/3]">
            <img
              src="/src/assets/images/onboarding_farmer_1795276857907.jpg"
              alt="Indian farmer checking agricultural schemes and storage on a smartphone"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-5">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-[#1B2A20]">
              Everything your farm needs, in one calm place
            </h2>
            <p className="text-base text-[#4A5A4F] leading-relaxed">
              Check your scheme eligibility in 4 simple steps, compare storage
              godowns near your mandi, ask questions in simple language, and
              save everything safely to your account.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="min-h-[48px] px-6 rounded-2xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-base inline-flex items-center justify-center gap-2 transition-colors"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="min-h-[48px] px-6 rounded-2xl border border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#EAF4EE] font-semibold text-base inline-flex items-center justify-center transition-colors"
              >
                Log In / Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl w-full mx-auto flex items-center justify-center gap-2 text-xs text-[#4A5A4F]">
        <span>Step {step} of 2</span>
        <span aria-hidden="true">·</span>
        <span>Built for Indian Farmers</span>
      </div>
    </div>
  );
}
