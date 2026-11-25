import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../i18n/translations";
import { useLanguage } from "../context/LanguageContext";

export function LanguageSelector() {
  const { language, currentLanguage, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t("header.changeLanguage")}: ${currentLanguage.englishName}`}
        title={t("header.changeLanguage")}
        className="min-h-[40px] sm:min-h-[44px] px-2 sm:px-3 rounded-xl bg-white border border-[#2D6A4F]/20 hover:bg-[#EAF4EE] text-[#2D6A4F] text-xs sm:text-sm font-semibold inline-flex items-center gap-1 sm:gap-1.5 transition-colors whitespace-nowrap shrink-0"
      >
        <Globe className="w-4 h-4 shrink-0" />
        <span className="sm:hidden">{currentLanguage.shortBadge}</span>
        <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t("header.selectLanguage")}
          className="absolute right-0 mt-2 w-60 max-h-[75vh] overflow-y-auto bg-white rounded-2xl border border-[#2D6A4F]/20 shadow-lg p-1.5 z-50"
        >
          <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#4A5A4F]">
            {t("header.selectLanguage")}
          </p>
          <div className="space-y-0.5">
            {SUPPORTED_LANGUAGES.map((option) => {
              const active = option.code === language;
              return (
                <button
                  key={option.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    setLanguage(option.code);
                    setOpen(false);
                  }}
                  className={`w-full min-h-[40px] px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2 transition-colors ${
                    active
                      ? "bg-[#EAF4EE] text-[#2D6A4F] font-semibold"
                      : "text-[#1B2A20] hover:bg-[#FAF8F3]"
                  }`}
                >
                  <div className="min-w-0 flex items-baseline gap-2">
                    <span className="text-sm truncate">{option.nativeName}</span>
                    {option.nativeName !== option.englishName && (
                      <span className="text-xs text-[#4A5A4F] truncate">
                        {option.englishName}
                      </span>
                    )}
                  </div>
                  {active && <Check className="w-4 h-4 shrink-0 text-[#2D6A4F]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
