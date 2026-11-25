import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ExternalLink,
  FileText,
  Gift,
  ListOrdered,
} from "lucide-react";
import { SCHEMES_DATA } from "../data/bhoomiData";
import { useAuth } from "../context/AuthContext";
import { getSafeExternalUrl } from "../utils/safeUrl";

export function SchemeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isSchemeSaved, toggleSaveScheme } = useAuth();
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const scheme = SCHEMES_DATA.find((s) => s.id === id);

  if (!scheme) {
    return (
      <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-8 text-center space-y-4">
        <h1 className="text-xl font-display font-bold">Scheme not found</h1>
        <Link
          to="/schemes"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2D6A4F] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Government Schemes</span>
        </Link>
      </div>
    );
  }

  const saved = isSchemeSaved(scheme.id);

  const handleSaveToggle = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setSaving(true);
    setStatusMessage("");
    try {
      const nowSaved = await toggleSaveScheme(scheme);
      setStatusMessage(
        nowSaved
          ? "Saved to your profile for later reference."
          : "Removed from your saved schemes."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="min-h-[44px] min-w-[44px] rounded-xl bg-white border border-[#2D6A4F]/20 flex items-center justify-center text-[#2D6A4F] hover:bg-[#EAF4EE] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#2D6A4F]">
            {scheme.category} · {scheme.ministry}
          </p>
          <h1 className="text-xl md:text-2xl font-display font-bold text-[#1B2A20]">
            {scheme.name}
          </h1>
        </div>
      </div>

      {/* Hero Summary */}
      <div className="bg-[#EAF4EE] rounded-2xl border border-[#2D6A4F]/15 p-5 md:p-6 space-y-2">
        <p className="text-base text-[#1B2A20] leading-relaxed">
          {scheme.summary}
        </p>
        <p className="text-sm font-semibold text-[#2D6A4F]">
          Key Highlight: {scheme.benefitHighlight}
        </p>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-white border border-[#2D6A4F]/25 text-sm font-medium text-[#2D6A4F]"
        >
          {statusMessage}
        </div>
      )}

      {/* Structured Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-3">
          <div className="flex items-center gap-2 text-[#2D6A4F]">
            <CheckCircle2 className="w-5 h-5" />
            <h2 className="font-display font-semibold text-base text-[#1B2A20]">
              Eligibility
            </h2>
          </div>
          <ul className="space-y-2 text-sm text-[#4A5A4F] list-disc pl-5 leading-relaxed">
            {scheme.eligibility.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-3">
          <div className="flex items-center gap-2 text-[#2D6A4F]">
            <Gift className="w-5 h-5" />
            <h2 className="font-display font-semibold text-base text-[#1B2A20]">
              Benefits
            </h2>
          </div>
          <ul className="space-y-2 text-sm text-[#4A5A4F] list-disc pl-5 leading-relaxed">
            {scheme.benefits.map((item, idx) => (
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
            {scheme.documents.map((item, idx) => (
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
            {scheme.howToApply.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ol>
        </section>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {getSafeExternalUrl(scheme.officialUrl) && (
          <a
            href={getSafeExternalUrl(scheme.officialUrl)!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-h-[48px] px-6 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span>Visit Official Application Page</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        <button
          type="button"
          disabled={saving}
          onClick={handleSaveToggle}
          className={`min-h-[48px] px-6 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
            saved
              ? "bg-[#EAF4EE] border-[#2D6A4F] text-[#2D6A4F]"
              : "bg-white border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#EAF4EE]"
          }`}
        >
          {saved ? (
            <>
              <BookmarkCheck className="w-4 h-4" />
              <span>Saved in Profile</span>
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4" />
              <span>{user ? "Save for Later" : "Sign In to Save"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
