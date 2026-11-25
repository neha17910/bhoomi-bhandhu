import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flag,
  HelpCircle,
  Search,
} from "lucide-react";
import { FAQS_DATA } from "../data/bhoomiData";
import { useAuth } from "../context/AuthContext";
import {
  COMPLAINT_SUBJECTS,
  SUPPORT_SUBJECTS,
  formatComplaintTimestamp,
  isActiveComplaint,
  isComplaintTicket,
  prioritizeSupportTickets,
  validateSupportSubmission,
} from "../utils/supportTicketStats";

type SubmissionMode = "support" | "complaint";

export function HelpPage() {
  const [searchParams] = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "complaint" ||
    searchParams.get("mode") === "complaint"
      ? "complaint"
      : "support";

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [openId, setOpenId] = useState<string | null>(FAQS_DATA[0]?.id || null);

  const { user, supportTickets, submitSupportTicket } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<SubmissionMode>(initialTab);
  const [subject, setSubject] = useState<string>(
    initialTab === "complaint" ? COMPLAINT_SUBJECTS[0] : SUPPORT_SUBJECTS[0]
  );
  const [priority, setPriority] = useState<"normal" | "urgent">("normal");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState("");
  const [error, setError] = useState("");

  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS_DATA;
    return FAQS_DATA.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }, [query]);

  const prioritizedUserTickets = useMemo(
    () => prioritizeSupportTickets(supportTickets),
    [supportTickets]
  );

  const handleModeSwitch = (nextMode: SubmissionMode) => {
    setMode(nextMode);
    setError("");
    setSubmittedNotice("");
    setSubject(
      nextMode === "complaint" ? COMPLAINT_SUBJECTS[0] : SUPPORT_SUBJECTS[0]
    );
    if (nextMode === "complaint") {
      setPriority("urgent");
    } else {
      setPriority("normal");
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmittedNotice("");
    if (!user) {
      navigate("/auth");
      return;
    }

    const validationError = validateSupportSubmission({
      mode,
      subject,
      message,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await submitSupportTicket({
        category: mode === "complaint" ? "complaint" : "support",
        subject,
        message: message.trim(),
        priority: mode === "complaint" ? "urgent" : priority,
      });
      setMessage("");
      setPriority(mode === "complaint" ? "urgent" : "normal");
      setSubmittedNotice(
        mode === "complaint"
          ? "Your complaint has been registered and highlighted as High Priority for immediate Support Desk and Admin review."
          : "Your support request has been logged safely."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send request.");
    } finally {
      setSubmitting(false);
    }
  };

  const subjectOptions =
    mode === "complaint" ? COMPLAINT_SUBJECTS : SUPPORT_SUBJECTS;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1B2A20]">
              Help &amp; Grievance Centre
            </h1>
            <p className="text-sm text-[#4A5A4F]">
              Common questions answered simply, direct help requests, and
              priority complaint registration.
            </p>
          </div>
        </div>

        <a
          href="#support-complaint-form"
          onClick={() => handleModeSwitch("complaint")}
          className="min-h-[42px] px-4 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-red-800 font-semibold text-xs inline-flex items-center gap-1.5 self-start sm:self-auto transition-colors shrink-0"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Register a Complaint</span>
        </a>
      </div>

      {/* FAQ Search */}
      <div className="relative">
        <label htmlFor="faq-search" className="sr-only">
          Search frequently asked questions
        </label>
        <Search className="w-5 h-5 text-[#4A5A4F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          id="faq-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search FAQs..."
          className="w-full h-12 pl-11 pr-4 rounded-xl bg-white border border-[#2D6A4F]/20 text-base focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
        />
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-2.5">
        {filteredFaqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className="bg-white rounded-2xl border border-[#2D6A4F]/15 overflow-hidden"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full min-h-[56px] px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#FAF8F3] transition-colors"
              >
                <div>
                  <p className="text-xs font-semibold text-[#2D6A4F]">
                    {faq.category}
                  </p>
                  <p className="font-semibold text-sm md:text-base text-[#1B2A20] mt-0.5">
                    {faq.question}
                  </p>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-[#2D6A4F] shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#2D6A4F] shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-sm text-[#4A5A4F] leading-relaxed border-t border-[#2D6A4F]/10 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact Support & Register Complaint Form */}
      <section
        id="support-complaint-form"
        className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
              {mode === "complaint"
                ? "Register a Priority Complaint"
                : "Still need help?"}
            </h2>
            <p className="text-xs text-[#4A5A4F]">
              {mode === "complaint"
                ? "Formal complaints are automatically flagged Urgent and placed at the top of Support Desk and Admin queues."
                : "Ask our team for guidance on schemes, warehouse bookings, or your account."}
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Help or complaint mode"
            className="inline-flex rounded-xl bg-[#FAF8F3] p-1 border border-[#2D6A4F]/15 self-start sm:self-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "support"}
              onClick={() => handleModeSwitch("support")}
              className={`min-h-[36px] px-3.5 rounded-lg text-xs font-semibold transition-colors ${
                mode === "support"
                  ? "bg-[#2D6A4F] text-white"
                  : "text-[#4A5A4F] hover:text-[#1B2A20]"
              }`}
            >
              General Support
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "complaint"}
              onClick={() => handleModeSwitch("complaint")}
              className={`min-h-[36px] px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                mode === "complaint"
                  ? "bg-red-700 text-white"
                  : "text-red-800 hover:bg-red-50"
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Register a Complaint</span>
            </button>
          </div>
        </div>

        {mode === "complaint" && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                Priority Escalation Enabled Automatically
              </p>
              <p className="mt-0.5 text-red-800">
                Every registered complaint is highlighted in red across the
                Support Desk and Admin Portal so an officer reviews it before
                routine inquiries.
              </p>
            </div>
          </div>
        )}

        {submittedNotice && (
          <div
            role="status"
            className="p-3.5 rounded-xl bg-[#EAF4EE] border border-[#2D6A4F]/25 text-sm text-[#1B2A20] flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
            <span>{submittedNotice}</span>
          </div>
        )}

        <form onSubmit={handleSupportSubmit} className="space-y-4">
          {error && (
            <p
              role="alert"
              className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl"
            >
              {error}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="help-subject"
                className="block text-sm font-medium mb-1"
              >
                {mode === "complaint" ? "Complaint Category" : "Subject"}
              </label>
              <select
                id="help-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
              >
                {subjectOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="help-priority"
                className="block text-sm font-medium mb-1"
              >
                Priority
              </label>
              {mode === "complaint" ? (
                <div
                  id="help-priority"
                  className="w-full h-11 px-3.5 rounded-xl bg-red-50 border border-red-200 text-sm font-semibold text-red-800 flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>High Priority (Auto-Escalated)</span>
                </div>
              ) : (
                <select
                  id="help-priority"
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as "normal" | "urgent")
                  }
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
                >
                  <option value="normal">Normal Support</option>
                  <option value="urgent">Urgent (Time-Sensitive)</option>
                </select>
              )}
            </div>
          </div>
          <div>
            <label
              htmlFor="help-message"
              className="block text-sm font-medium mb-1"
            >
              {mode === "complaint" ? "Complaint Details" : "Message"}
            </label>
            <textarea
              id="help-message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                mode === "complaint"
                  ? "Describe the issue clearly (warehouse/partner name, date, amount, or booking reference)..."
                  : "Explain what you need help with..."
              }
              className="w-full p-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={`min-h-[48px] px-6 rounded-xl font-semibold text-sm inline-flex items-center gap-2 transition-colors ${
              mode === "complaint"
                ? "bg-red-700 hover:bg-red-800 text-white"
                : "bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20]"
            }`}
          >
            {mode === "complaint" && <Flag className="w-4 h-4" />}
            <span>
              {submitting
                ? "Submitting..."
                : !user
                ? "Sign In to Continue"
                : mode === "complaint"
                ? "Register Priority Complaint"
                : "Submit Support Request"}
            </span>
          </button>
        </form>

        {user && prioritizedUserTickets.length > 0 && (
          <div className="pt-4 border-t border-[#2D6A4F]/10 space-y-2.5">
            <p className="text-xs font-semibold text-[#2D6A4F]">
              Your Submitted Complaints &amp; Support Requests
            </p>
            {prioritizedUserTickets.map((t) => {
              const isComplaint = isComplaintTicket(t);
              const activeComplaint = isActiveComplaint(t);
              return (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-xl text-xs space-y-1.5 border ${
                    activeComplaint
                      ? "bg-red-50/60 border-2 border-red-300"
                      : isComplaint
                      ? "bg-[#FAF8F3] border-[#2D6A4F]/20"
                      : "bg-[#FAF8F3] border-transparent"
                  }`}
                >
                  {activeComplaint && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-red-800">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-700 shrink-0" />
                      <span>Priority Complaint · Expedited Review</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#1B2A20]">
                      {isComplaint && !activeComplaint ? "[Complaint] " : ""}
                      {t.subject}
                    </span>
                    <span
                      className={`uppercase font-semibold shrink-0 ${
                        activeComplaint ? "text-red-800" : "text-[#2D6A4F]"
                      }`}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-[#4A5A4F]">{t.message}</p>
                  <p className="text-[11px] text-[#4A5A4F] tabular-nums">
                    Filed: {formatComplaintTimestamp(t.createdAtIso)}
                  </p>
                  {t.employeeReply && (
                    <div className="p-2.5 rounded-lg bg-[#EAF4EE] text-[#1B2A20]">
                      <strong>
                        {t.assignedEmployeeName || "Support Team"}:
                      </strong>{" "}
                      {t.employeeReply}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
