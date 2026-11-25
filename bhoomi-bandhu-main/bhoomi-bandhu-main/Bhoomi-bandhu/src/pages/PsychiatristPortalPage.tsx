import React, { useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Lock,
  MessageCircleHeart,
  Stethoscope,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useAuth, type ConsultationRecord } from "../context/AuthContext";

export function PsychiatristPortalPage() {
  const {
    profile,
    isAdmin,
    psychiatristRequests,
    allConsultations,
    updateConsultationStatus,
    togglePsychiatristAvailability,
  } = useAuth();

  const [statusFilter, setStatusFilter] = useState<
    "all" | "requested" | "scheduled" | "completed"
  >("all");
  const [responseDrafts, setResponseDrafts] = useState<Record<string, string>>(
    {}
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [togglingAvail, setTogglingAvail] = useState(false);
  const [feedback, setFeedback] = useState("");

  const hasAccess = profile?.role === "psychiatrist" || isAdmin;

  if (!hasAccess) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-2xl border border-[#2D6A4F]/15 p-8 text-center space-y-3">
        <Lock className="w-10 h-10 text-[#2D6A4F] mx-auto" />
        <h1 className="text-xl font-display font-bold text-[#1B2A20]">
          Psychiatrist Desk Access Required
        </h1>
        <p className="text-sm text-[#4A5A4F]">
          This confidential mental health portal is restricted to registered
          BhoomiBandhu psychiatrists and platform administrators.
        </p>
      </div>
    );
  }

  const consultations: ConsultationRecord[] =
    profile?.role === "psychiatrist"
      ? psychiatristRequests
      : allConsultations.length > 0
      ? allConsultations
      : psychiatristRequests;

  const filtered = consultations.filter(
    (c) => statusFilter === "all" || c.status === statusFilter
  );

  const requestedCount = consultations.filter(
    (c) => c.status === "requested"
  ).length;
  const scheduledCount = consultations.filter(
    (c) => c.status === "scheduled"
  ).length;
  const completedCount = consultations.filter(
    (c) => c.status === "completed"
  ).length;

  const isAvailable = profile?.availableForConsult !== false;

  const handleToggleAvailability = async () => {
    setTogglingAvail(true);
    setFeedback("");
    try {
      await togglePsychiatristAvailability(!isAvailable);
      setFeedback(
        !isAvailable
          ? "Status updated: Now visible as available for farmer consultations."
          : "Status updated: New consultation requests paused."
      );
    } finally {
      setTogglingAvail(false);
    }
  };

  const handleAction = async (
    c: ConsultationRecord,
    nextStatus: "scheduled" | "completed"
  ) => {
    setSavingId(c.id);
    setFeedback("");
    try {
      const draft = responseDrafts[c.id] ?? c.doctorResponse ?? "";
      await updateConsultationStatus({
        consultationId: c.id,
        status: nextStatus,
        doctorResponse:
          draft.trim() ||
          (nextStatus === "scheduled"
            ? `Confirmed for ${c.preferredSlot}. Looking forward to speaking calmly with you.`
            : "Session completed. Follow-up grounding steps shared."),
      });
      setFeedback(
        nextStatus === "scheduled"
          ? `Scheduled consultation for ${c.farmerName}.`
          : `Marked consultation with ${c.farmerName} as completed.`
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#2D6A4F]">
              Farmer Mental Health Care ·{" "}
              {profile?.qualification || "Registered Specialist"}
            </p>
            <h1 className="text-2xl font-display font-bold text-[#1B2A20]">
              Psychiatrist Consultation Desk
            </h1>
            <p className="text-sm text-[#4A5A4F] mt-0.5">
              {profile?.specialization ||
                "Confidential rural stress, financial anxiety & harvest recovery care."}
            </p>
          </div>
        </div>

        {profile?.role === "psychiatrist" && (
          <button
            type="button"
            disabled={togglingAvail}
            onClick={handleToggleAvailability}
            className={`min-h-[44px] px-4 rounded-xl border font-semibold text-sm inline-flex items-center gap-2 transition-colors self-start sm:self-auto whitespace-nowrap ${
              isAvailable
                ? "bg-[#EAF4EE] border-[#2D6A4F]/30 text-[#2D6A4F]"
                : "bg-[#F2EFE6] border-[#2D6A4F]/20 text-[#4A5A4F]"
            }`}
          >
            {isAvailable ? (
              <ToggleRight className="w-5 h-5" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
            <span>
              {isAvailable ? "Available for Farmers" : "Availability Paused"}
            </span>
          </button>
        )}
      </div>

      {feedback && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-[#EAF4EE] border border-[#2D6A4F]/25 text-sm font-medium text-[#1B2A20] flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5">
          <p className="text-xs font-semibold text-[#2D6A4F]">
            Pending Requests
          </p>
          <p className="text-2xl font-display font-bold text-[#1B2A20] tabular-nums mt-1">
            {requestedCount}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5">
          <p className="text-xs font-semibold text-[#2D6A4F]">
            Scheduled Sessions
          </p>
          <p className="text-2xl font-display font-bold text-[#1B2A20] tabular-nums mt-1">
            {scheduledCount}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5">
          <p className="text-xs font-semibold text-[#2D6A4F]">Completed Care</p>
          <p className="text-2xl font-display font-bold text-[#1B2A20] tabular-nums mt-1">
            {completedCount}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(["all", "requested", "scheduled", "completed"] as const).map(
          (tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`min-h-[40px] px-4 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                statusFilter === tab
                  ? "bg-[#2D6A4F] text-white"
                  : "bg-white border border-[#2D6A4F]/20 text-[#1B2A20] hover:bg-[#EAF4EE]"
              }`}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {/* Consultation Queue */}
      <section className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-8 text-center">
            <MessageCircleHeart className="w-8 h-8 text-[#2D6A4F] mx-auto mb-2" />
            <p className="font-semibold text-base text-[#1B2A20]">
              No consultations in this view
            </p>
            <p className="text-sm text-[#4A5A4F] mt-1">
              Farmer consultation requests booked through Well-Being appear here.
            </p>
          </div>
        ) : (
          filtered.map((c) => {
            const draftValue =
              responseDrafts[c.id] !== undefined
                ? responseDrafts[c.id]
                : c.doctorResponse || "";
            return (
              <article
                key={c.id}
                className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 md:p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase text-[#2D6A4F]">
                        {c.status}
                      </span>
                      <span className="text-xs text-[#4A5A4F]">·</span>
                      <span className="text-xs font-medium text-[#4A5A4F]">
                        Language: {c.language}
                      </span>
                      {c.farmerState && (
                        <>
                          <span className="text-xs text-[#4A5A4F]">·</span>
                          <span className="text-xs text-[#4A5A4F]">
                            {c.farmerState}
                          </span>
                        </>
                      )}
                    </div>
                    <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
                      {c.farmerName} — {c.concernTopic}
                    </h2>
                    <p className="text-xs text-[#4A5A4F] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>Preferred Slot: {c.preferredSlot}</span>
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF8F3] text-sm text-[#1B2A20] leading-relaxed">
                  <p className="text-xs font-semibold text-[#4A5A4F] mb-1">
                    Farmer&apos;s Confidential Note
                  </p>
                  <p>{c.notes}</p>
                </div>

                {(c.status === "requested" || c.status === "scheduled") && (
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor={`doc-resp-${c.id}`}
                        className="block text-xs font-semibold text-[#1B2A20] mb-1"
                      >
                        Doctor Guidance / Session Confirmation Note
                      </label>
                      <textarea
                        id={`doc-resp-${c.id}`}
                        rows={2}
                        value={draftValue}
                        onChange={(e) =>
                          setResponseDrafts((prev) => ({
                            ...prev,
                            [c.id]: e.target.value,
                          }))
                        }
                        placeholder="Write supportive guidance, call confirmation, or coping steps..."
                        className="w-full p-3 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {c.status === "requested" && (
                        <button
                          type="button"
                          disabled={savingId === c.id}
                          onClick={() => handleAction(c, "scheduled")}
                          className="min-h-[42px] px-4 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
                        >
                          <CalendarCheck className="w-4 h-4" />
                          <span>Confirm Slot & Send Note</span>
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={savingId === c.id}
                        onClick={() => handleAction(c, "completed")}
                        className="min-h-[42px] px-4 rounded-xl bg-[#2D6A4F] hover:bg-[#23543E] text-white font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Session Completed</span>
                      </button>
                    </div>
                  </div>
                )}

                {c.status === "completed" && c.doctorResponse && (
                  <div className="p-3.5 rounded-xl bg-[#EAF4EE] text-sm text-[#1B2A20]">
                    <p className="text-xs font-semibold text-[#2D6A4F] mb-1">
                      Recorded Guidance Note
                    </p>
                    <p>{c.doctorResponse}</p>
                  </div>
                )}
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
