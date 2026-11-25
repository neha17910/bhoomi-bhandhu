import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookmarkCheck,
  ChevronRight,
  FileCheck2,
  Search,
} from "lucide-react";
import { SCHEMES_DATA, type SchemeItem } from "../data/bhoomiData";
import { useAuth } from "../context/AuthContext";

const CATEGORIES: Array<"All" | SchemeItem["category"]> = [
  "All",
  "Income Support",
  "Crop Insurance",
  "Soil & Inputs",
  "Loan & Credit",
  "Equipment & Irrigation",
];

export function SchemesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | SchemeItem["category"]
  >("All");
  const { isSchemeSaved } = useAuth();

  const filteredSchemes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SCHEMES_DATA.filter((scheme) => {
      const catMatch =
        selectedCategory === "All" || scheme.category === selectedCategory;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        scheme.name.toLowerCase().includes(q) ||
        scheme.shortName.toLowerCase().includes(q) ||
        scheme.summary.toLowerCase().includes(q) ||
        scheme.category.toLowerCase().includes(q) ||
        scheme.benefitHighlight.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1B2A20]">
            Government Schemes
          </h1>
          <p className="text-sm text-[#4A5A4F] mt-1">
            Verified central agricultural schemes with clear documents and steps.
          </p>
        </div>

        <Link
          to="/eligibility"
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Check Eligibility</span>
        </Link>
      </div>

      {/* Search + Category Filter Chips */}
      <div className="space-y-3">
        <div className="relative">
          <label htmlFor="schemes-search-input" className="sr-only">
            Search government schemes
          </label>
          <Search className="w-5 h-5 text-[#4A5A4F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="schemes-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schemes..."
            className="w-full h-12 pl-11 pr-4 rounded-xl bg-white border border-[#2D6A4F]/20 text-base text-[#1B2A20] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`min-h-[40px] px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                selectedCategory === category
                  ? "bg-[#2D6A4F] text-white"
                  : "bg-white border border-[#2D6A4F]/25 text-[#1B2A20] hover:bg-[#EAF4EE]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes List */}
      {filteredSchemes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-8 text-center space-y-2">
          <p className="font-semibold text-[#1B2A20]">
            No schemes matched your search.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="text-sm font-semibold text-[#2D6A4F] hover:underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchemes.map((scheme) => {
            const saved = isSchemeSaved(scheme.id);
            return (
              <Link
                key={scheme.id}
                to={`/schemes/${scheme.id}`}
                className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 hover:border-[#2D6A4F] transition-colors flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-[#2D6A4F] font-semibold">
                    <span>{scheme.category}</span>
                    {saved && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 text-[#1E4D38]">
                          <BookmarkCheck className="w-3.5 h-3.5" />
                          Saved
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="font-display font-semibold text-base text-[#1B2A20]">
                    {scheme.name}
                  </h2>
                  <p className="text-sm text-[#4A5A4F] line-clamp-2 leading-relaxed">
                    {scheme.summary}
                  </p>
                  <p className="text-xs font-medium text-[#1B2A20] pt-1">
                    {scheme.benefitHighlight}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-1" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
