import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  searchPlatformContent,
  type SearchModuleCategory,
} from "../utils/search";

const FARMER_CATEGORIES: SearchModuleCategory[] = [
  "All",
  "Schemes",
  "Insurance",
  "Loans",
  "Warehouses",
  "Well-Being",
  "Help",
];

const OWNER_CATEGORIES: SearchModuleCategory[] = [
  "All",
  "Warehouses",
  "Loans",
  "Insurance",
  "Help",
];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<SearchModuleCategory>("All");
  const { profile, warehouses } = useAuth();
  const { t } = useLanguage();

  const isOwner = profile?.role === "warehouse_owner";
  const visibleCategories = isOwner ? OWNER_CATEGORIES : FARMER_CATEGORIES;
  const popularTerms = isOwner
    ? ["Construction", "Land Purchase", "Running Capital", "Cold Storage", "Liability", "Machinery"]
    : ["PM-KISAN", "PMFBY", "Solar", "Onion", "Kisan Credit Card", "Soil"];

  const results = useMemo(
    () => searchPlatformContent(query, warehouses, category, profile?.role),
    [query, warehouses, category, profile?.role]
  );

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1B2A20]">
          {t("search.title")}
        </h1>
        <p className="text-sm text-[#4A5A4F] mt-1">
          {isOwner
            ? "Search across commercial warehouse loans, facility insurance, and storage listings."
            : t("search.subtitle")}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-4 space-y-4">
        <label htmlFor="page-search-input" className="sr-only">
          Type keywords to search across BhoomiBandhu
        </label>
        <div className="relative">
          <Search className="w-5 h-5 text-[#4A5A4F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="page-search-input"
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={
              isOwner
                ? "Search warehouse construction loans, facility insurance, or godowns..."
                : t("search.placeholder")
            }
            className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/20 text-base text-[#1B2A20] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {visibleCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`min-h-[40px] px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                category === cat
                  ? "bg-[#2D6A4F] text-white"
                  : "bg-[#FAF8F3] border border-[#2D6A4F]/20 text-[#1B2A20] hover:bg-[#EAF4EE]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {!query.trim() ? (
        <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-6 space-y-3">
          <p className="text-sm font-semibold text-[#1B2A20]">
            {t("search.popular")}
          </p>
          <div className="flex flex-wrap gap-2">
            {popularTerms.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleQueryChange(term)}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] text-sm font-medium hover:bg-[#DDECE3] transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-8 text-center space-y-3">
          <p className="text-base font-semibold text-[#1B2A20]">
            No matches found for &ldquo;{query.trim()}&rdquo;
          </p>
          <p className="text-sm text-[#4A5A4F]">
            {isOwner
              ? "Try another keyword like \"construction\", \"land\", or \"liability\", or contact Support Desk."
              : "Try another keyword like \"PMFBY\", \"drip\", or ask BhoomiBandhu AI Chat directly."}
          </p>
          <Link
            to={isOwner ? "/help" : "/chat"}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#E9A23B] text-[#1B2A20] font-semibold text-sm inline-flex items-center gap-2"
          >
            <span>{isOwner ? "Open Help & Support" : "Ask AI Chat"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[#4A5A4F] tabular-nums">
            Showing {results.length} result{results.length === 1 ? "" : "s"} for{" "}
            <strong className="text-[#1B2A20]">{query.trim()}</strong>
          </p>
          {results.map((item) => (
            <Link
              key={item.id}
              to={item.route}
              className="block bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 hover:border-[#2D6A4F] transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[#2D6A4F] font-semibold">
                    <span>{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#4A5A4F] font-normal">
                      {item.subtitle}
                    </span>
                  </div>
                  <h2 className="font-display font-semibold text-base text-[#1B2A20]">
                    {item.title}
                  </h2>
                  <p className="text-sm text-[#4A5A4F] leading-relaxed">
                    {item.snippet}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
