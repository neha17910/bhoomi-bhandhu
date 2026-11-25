import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  HeartHandshake,
  Phone,
  Stethoscope,
  Wind,
} from "lucide-react";
import {
  WELLBEING_ARTICLES,
  type PsychiatristProfileItem,
} from "../data/bhoomiData";
import { useAuth } from "../context/AuthContext";

export function WellBeingPage() {
  const {
    user,
    psychiatrists,
    consultations,
    bookPsychiatristSession,
    updateConsultationStatus,
    submitSupportTicket,
  } = useAuth();
  const navigate = useNavigate();

  // Gentle 4-4-6 breathing exercise
  const [breathingActive, setBreathingActive] = useState(false);
  const [phase, setPhase] = useState<"Breathe In" | "Hold" | "Breathe Out">(
    "Breathe In"
  );
  const [secondsLeft, setSecondsLeft] = useState(4);

  // Psychiatrist consultation booking
  const [selectedDoctor, setSelectedDoctor] =
    useState<PsychiatristProfileItem | null>(null);
  const [preferredSlot, setPreferredSlot] = useState(
    "Tomorrow · 5:00 PM - 5:30 PM"
  );
  const [consultLang, setConsultLang] = useState("Hindi");
  const [concernTopic, setConcernTopic] = useState(
    "Crop stress & sleeplessness"
  );
  const [consultNotes, setConsultNotes] = useState("");
  const [bookingBusy, setBookingBusy] = useState(false);
  const [consultFeedback, setConsultFeedback] = useState("");
  const [consultError, setConsultError] = useState("");

  // Calm callback request
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [topic, setTopic] = useState("Looking for someone to talk to");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!breathingActive) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        if (phase === "Breathe In") {
          setPhase("Hold");
          return 4;
        }
        if (phase === "Hold") {
          setPhase("Breathe Out");
          return 6;
        }
        setPhase("Breathe In");
        return 4;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [breathingActive, phase]);

  const handleBookConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    setConsultError("");
    setConsultFeedback("");
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!selectedDoctor) return;
    if (consultNotes.trim().length < 5) {
      setConsultError(
        "Please share a short note (at least 5 characters) so the doctor can prepare gently."
      );
      return;
    }
    setBookingBusy(true);
    try {
      await bookPsychiatristSession({
        psychiatrist: selectedDoctor,
        preferredSlot,
        language: consultLang,
        concernTopic,
        notes: consultNotes.trim(),
      });
      setConsultNotes("");
      setSelectedDoctor(null);
      setConsultFeedback(
        `Confidential consultation requested with ${selectedDoctor.name}. You can track the doctor's confirmation below.`
      );
    } catch (err) {
      setConsultError(
        err instanceof Error
          ? err.message
          : "Unable to book consultation right now."
      );
    } finally {
      setBookingBusy(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user) {
      navigate("/auth");
      return;
    }
    if (message.trim().length < 5) {
      setError(
        "Please write a short note so our support team knows how to help."
      );
      return;
    }
    setSubmitting(true);
    try {
      await submitSupportTicket({
        category: "wellbeing",
        subject: topic,
        message: message.trim(),
      });
      setSent(true);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      <div className="space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1B2A20]">
          You&apos;re Not Alone
        </h1>
        <p className="text-base text-[#4A5A4F] leading-relaxed max-w-2xl">
          Farming carries real seasonal pressure. Speak confidentially with a
          BhoomiBandhu psychiatrist, use our calming breathing tool, or reach
          free government helplines anytime.
        </p>
      </div>

      {/* Helplines Card */}
      <section className="bg-[#EAF4EE] rounded-2xl border border-[#2D6A4F]/15 p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
          Free &amp; Confidential Helplines (India)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 space-y-1">
            <p className="text-xs font-semibold text-[#2D6A4F]">
              24x7 Mental Health Support (Tele-MANAS)
            </p>
            <p className="text-xl font-display font-bold text-[#1B2A20] tabular-nums flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#2D6A4F]" />
              <span>14416 / 1800-891-4416</span>
            </p>
            <p className="text-xs text-[#4A5A4F]">
              Toll-free in regional Indian languages
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 space-y-1">
            <p className="text-xs font-semibold text-[#2D6A4F]">
              Kisan Call Centre (Agri Guidance)
            </p>
            <p className="text-xl font-display font-bold text-[#1B2A20] tabular-nums flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#2D6A4F]" />
              <span>1800-180-1551</span>
            </p>
            <p className="text-xs text-[#4A5A4F]">
              Daily 6:00 AM to 10:00 PM · Toll-free
            </p>
          </div>
        </div>
      </section>

      {/* Consult a BhoomiBandhu Psychiatrist */}
      <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
              Consult a BhoomiBandhu Psychiatrist
            </h2>
            <p className="text-sm text-[#4A5A4F]">
              Book a free, confidential 1-on-1 check-in with specialists who
              understand farm stress, crop loss grief, and rural family life.
            </p>
          </div>
        </div>

        {consultFeedback && (
          <div
            role="status"
            className="p-4 rounded-xl bg-[#EAF4EE] border border-[#2D6A4F]/25 text-sm text-[#1B2A20] flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-5 h-5 text-[#2D6A4F] shrink-0" />
            <span>{consultFeedback}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {psychiatrists.map((doc) => (
            <div
              key={doc.id}
              className="rounded-xl border border-[#2D6A4F]/15 bg-[#FAF8F3] p-4 flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-semibold uppercase ${
                      doc.availableForConsult
                        ? "text-[#2D6A4F]"
                        : "text-[#4A5A4F]"
                    }`}
                  >
                    {doc.availableForConsult ? "Available" : "Slot Paused"}
                  </span>
                  <span className="text-[11px] text-[#4A5A4F] tabular-nums">
                    {doc.experienceYears} yrs exp
                  </span>
                </div>
                <h3 className="font-display font-semibold text-base text-[#1B2A20]">
                  {doc.name}
                </h3>
                <p className="text-xs font-medium text-[#2D6A4F]">
                  {doc.qualification}
                </p>
                <p className="text-xs text-[#1B2A20] font-medium">
                  {doc.specialization}
                </p>
                <p className="text-xs text-[#4A5A4F] leading-relaxed">
                  {doc.bio}
                </p>
                <p className="text-[11px] text-[#4A5A4F]">
                  Languages: {doc.languages.join(", ")} · {doc.state}
                </p>
                <p className="text-[11px] font-medium text-[#2D6A4F]">
                  {doc.consultMode || "Audio & Video"} ·{" "}
                  {doc.sessionDurationMins || 30} mins
                </p>
              </div>
              <button
                type="button"
                disabled={!doc.availableForConsult}
                onClick={() => {
                  const defaultSlots = [
                    "Today · 6:00 PM - 6:30 PM",
                    "Tomorrow · 11:00 AM - 11:30 AM",
                    "Tomorrow · 5:00 PM - 5:30 PM",
                    "Weekend · 10:30 AM - 11:00 AM",
                  ];
                  const activeSlots =
                    doc.preferredSlots && doc.preferredSlots.length > 0
                      ? doc.preferredSlots
                      : defaultSlots;
                  setSelectedDoctor(doc);
                  setPreferredSlot(activeSlots[0]);
                  setConsultLang(doc.languages[0] || "Hindi");
                  setConsultError("");
                }}
                className="w-full min-h-[42px] rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] disabled:opacity-50 text-[#1B2A20] font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>
                  {doc.availableForConsult
                    ? "Book Confidential Session"
                    : "Currently Unavailable"}
                </span>
              </button>
            </div>
          ))}
        </div>

        {selectedDoctor && (
          <form
            onSubmit={handleBookConsultation}
            className="p-5 rounded-xl bg-[#EAF4EE]/60 border border-[#2D6A4F]/25 space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display font-semibold text-base text-[#1B2A20]">
                Request Consultation with {selectedDoctor.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDoctor(null)}
                className="text-xs font-semibold text-[#4A5A4F] hover:text-[#1B2A20]"
              >
                Cancel
              </button>
            </div>
            {consultError && (
              <p className="text-sm text-red-700 bg-red-50 p-3 rounded-xl">
                {consultError}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Preferred Slot
                </label>
                <select
                  value={preferredSlot}
                  onChange={(e) => setPreferredSlot(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-white border border-[#2D6A4F]/25 text-sm"
                >
                  {(selectedDoctor.preferredSlots &&
                  selectedDoctor.preferredSlots.length > 0
                    ? selectedDoctor.preferredSlots
                    : [
                        "Today · 6:00 PM - 6:30 PM",
                        "Tomorrow · 11:00 AM - 11:30 AM",
                        "Tomorrow · 5:00 PM - 5:30 PM",
                        "Weekend · 10:30 AM - 11:00 AM",
                      ]
                  ).map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Language
                </label>
                <select
                  value={consultLang}
                  onChange={(e) => setConsultLang(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-white border border-[#2D6A4F]/25 text-sm"
                >
                  {selectedDoctor.languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Main Concern
                </label>
                <select
                  value={concernTopic}
                  onChange={(e) => setConcernTopic(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-white border border-[#2D6A4F]/25 text-sm"
                >
                  <option value="Crop stress & sleeplessness">
                    Crop stress &amp; sleeplessness
                  </option>
                  <option value="Loan & financial anxiety">
                    Loan &amp; financial anxiety
                  </option>
                  <option value="Feeling overwhelmed or low">
                    Feeling overwhelmed or low
                  </option>
                  <option value="Family communication support">
                    Family communication support
                  </option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Private Note for the Psychiatrist
              </label>
              <textarea
                rows={3}
                value={consultNotes}
                onChange={(e) => setConsultNotes(e.target.value)}
                placeholder="Share briefly what has been weighing on you..."
                className="w-full p-3 rounded-xl bg-white border border-[#2D6A4F]/25 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={bookingBusy}
              className="min-h-[44px] px-6 rounded-xl bg-[#2D6A4F] hover:bg-[#23543E] text-white font-semibold text-sm transition-colors"
            >
              {bookingBusy ? "Submitting..." : "Confirm Confidential Request"}
            </button>
          </form>
        )}

        {user && consultations.length > 0 && (
          <div className="pt-4 border-t border-[#2D6A4F]/12 space-y-3">
            <h3 className="font-display font-semibold text-sm text-[#2D6A4F]">
              My Psychiatrist Consultations ({consultations.length})
            </h3>
            <div className="space-y-2.5">
              {consultations.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/12 space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-[#1B2A20]">
                      {c.psychiatristName} · {c.concernTopic}
                    </p>
                    <span className="text-xs font-semibold uppercase text-[#2D6A4F]">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#4A5A4F]">
                    Slot: {c.preferredSlot} · Language: {c.language}
                  </p>
                  {c.doctorResponse && (
                    <div className="p-3 rounded-lg bg-[#EAF4EE] text-xs text-[#1B2A20] mt-1">
                      <strong>Doctor&apos;s Note:</strong> {c.doctorResponse}
                    </div>
                  )}
                  {c.status === "requested" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateConsultationStatus({
                          consultationId: c.id,
                          status: "cancelled",
                        })
                      }
                      className="text-xs font-semibold text-red-700 hover:underline pt-1"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Gentle Breathing Exercise */}
      <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#2D6A4F]">
              <Wind className="w-5 h-5" />
              <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
                One-Minute Calm Breathing (4-4-6)
              </h2>
            </div>
            <p className="text-sm text-[#4A5A4F]">
              Slow breathing helps quiet your heart rate during stressful
              moments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (breathingActive) {
                setBreathingActive(false);
              } else {
                setPhase("Breathe In");
                setSecondsLeft(4);
                setBreathingActive(true);
              }
            }}
            className="min-h-[44px] px-5 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] hover:bg-[#DDECE3] font-semibold text-sm whitespace-nowrap shrink-0 transition-colors"
          >
            {breathingActive ? "Pause Exercise" : "Start Calm Breathing"}
          </button>
        </div>

        {breathingActive && (
          <div className="p-6 rounded-xl bg-[#FAF8F3] text-center space-y-1">
            <p className="text-lg font-display font-semibold text-[#2D6A4F]">
              {phase}
            </p>
            <p className="text-3xl font-display font-bold text-[#1B2A20] tabular-nums">
              {secondsLeft}s
            </p>
          </div>
        )}
      </section>

      {/* Articles */}
      <section className="space-y-4">
        <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
          Helpful Reads
        </h2>
        {WELLBEING_ARTICLES.map((art) => (
          <article
            key={art.id}
            className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-6 space-y-3"
          >
            <p className="text-xs font-semibold text-[#2D6A4F]">
              {art.topic} · {art.readTime}
            </p>
            <h3 className="font-display font-semibold text-lg text-[#1B2A20]">
              {art.title}
            </h3>
            {art.paragraphs.map((p, idx) => (
              <p
                key={idx}
                className="text-sm md:text-base text-[#4A5A4F] leading-relaxed"
              >
                {p}
              </p>
            ))}
            <ul className="space-y-1.5 pt-2 text-sm text-[#1B2A20] list-disc pl-5">
              {art.practicalSteps.map((st, idx) => (
                <li key={idx}>{st}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      {/* Calm Support Callback Card */}
      <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
          Would you like to talk to someone from our support team?
        </h2>
        <p className="text-sm text-[#4A5A4F]">
          Leave a quiet note and our company support coordinator will follow up
          with community or helpline guidance.
        </p>

        {sent ? (
          <div className="p-4 rounded-xl bg-[#EAF4EE] text-[#1B2A20] text-sm flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#2D6A4F] shrink-0" />
            <span>
              Your request has been saved safely. We are glad you reached out.
            </span>
          </div>
        ) : !showRequestForm ? (
          <button
            type="button"
            onClick={() => setShowRequestForm(true)}
            className="min-h-[44px] px-5 rounded-xl border border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#EAF4EE] font-semibold text-sm transition-colors"
          >
            Request a Support Follow-Up
          </button>
        ) : (
          <form onSubmit={handleRequestSubmit} className="space-y-4 pt-2">
            {error && (
              <p className="text-sm text-red-700 bg-red-50 p-3 rounded-xl">
                {error}
              </p>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
              >
                <option value="Looking for someone to talk to">
                  Looking for someone to talk to
                </option>
                <option value="Guidance on crop loss relief">
                  Guidance on crop loss relief
                </option>
                <option value="Need local helpline contact">
                  Need local helpline contact
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Your Note
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share as much or as little as you feel comfortable sharing..."
                className="w-full p-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] px-6 rounded-xl bg-[#E9A23B] text-[#1B2A20] font-semibold text-sm"
            >
              {submitting
                ? "Sending..."
                : user
                ? "Send Note"
                : "Sign In to Send Note"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
