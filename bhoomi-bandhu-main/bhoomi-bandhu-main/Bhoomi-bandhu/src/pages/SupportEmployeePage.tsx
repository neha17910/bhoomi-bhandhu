import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flag,
  Headphones,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import {
  useAuth,
  type AutomatedMailRecord,
  type SupportTicketRecord,
} from "../context/AuthContext";
import { generateOneTimePassword } from "../utils/employeeAccess";
import {
  isActiveComplaint,
  isComplaintTicket,
  prioritizeSupportTickets,
} from "../utils/supportTicketStats";

export function SupportEmployeePage() {
  const {
    profile,
    isAdmin,
    allSupportTickets,
    supportEmployees,
    mailOutbox,
    updateSupportTicket,
    provisionSupportEmployee,
  } = useAuth();

  const [adminTab, setAdminTab] = useState<"employees" | "tickets">("employees");

  // Ticket queue filters & drafts
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "open" | "in_review" | "resolved"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "complaint" | "support" | "wellbeing"
  >("all");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Admin-only Add Support Employee form
  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empDepartment, setEmpDepartment] = useState(
    "Farmer Help & Operations Desk"
  );
  const [tempPassword, setTempPassword] = useState(() =>
    generateOneTimePassword(10)
  );
  const [provisioning, setProvisioning] = useState(false);
  const [latestGeneratedMail, setLatestGeneratedMail] =
    useState<AutomatedMailRecord | null>(null);

  const hasAccess = profile?.role === "support_staff" || isAdmin;

  const filteredTickets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const matched = allSupportTickets.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter)
        return false;
      if (!q) return true;
      return (
        t.subject.toLowerCase().includes(q) ||
        t.message.toLowerCase().includes(q) ||
        (t.assignedEmployeeName || "").toLowerCase().includes(q)
      );
    });
    return prioritizeSupportTickets(matched);
  }, [allSupportTickets, statusFilter, categoryFilter, searchQuery]);

  if (!hasAccess) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-2xl border border-[#2D6A4F]/15 p-8 text-center space-y-3">
        <Lock className="w-10 h-10 text-[#2D6A4F] mx-auto" />
        <h1 className="text-xl font-display font-bold text-[#1B2A20]">
          Company Support Desk Access Required
        </h1>
        <p className="text-sm text-[#4A5A4F]">
          This help and support console is restricted to BhoomiBandhu support
          employees and platform administrators.
        </p>
      </div>
    );
  }

  const openCount = allSupportTickets.filter((t) => t.status === "open").length;
  const reviewCount = allSupportTickets.filter(
    (t) => t.status === "in_review"
  ).length;
  const activeComplaintsCount = allSupportTickets.filter((t) =>
    isActiveComplaint(t)
  ).length;
  const urgentCount = allSupportTickets.filter(
    (t) => t.priority === "urgent" && t.status !== "resolved"
  ).length;
  const resolvedCount = allSupportTickets.filter(
    (t) => t.status === "resolved"
  ).length;

  const activeEmployeesCount = supportEmployees.filter(
    (e) => e.status === "active"
  ).length;
  const pendingFirstLoginCount = supportEmployees.filter(
    (e) => e.status === "pending_first_login"
  ).length;

  const handleGiveAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setErrorMsg("");
    setNotice("");
    setProvisioning(true);
    try {
      const result = await provisionSupportEmployee({
        name: empName,
        email: empEmail,
        department: empDepartment,
        tempPassword,
      });
      setLatestGeneratedMail(result.emailRecord);
      setNotice(
        `Access granted to ${result.employee.name} (${result.employee.email}). Automated no-reply email generated with one-time login credentials.`
      );
      setEmpName("");
      setEmpEmail("");
      setEmpDepartment("Farmer Help & Operations Desk");
      setTempPassword(generateOneTimePassword(10));
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Unable to provision support employee right now."
      );
    } finally {
      setProvisioning(false);
    }
  };

  const handleClaimAndReview = async (t: SupportTicketRecord) => {
    setSavingId(t.id);
    setNotice("");
    setErrorMsg("");
    try {
      const draft = replyDrafts[t.id] ?? t.employeeReply ?? "";
      await updateSupportTicket({
        ticketId: t.id,
        status: "in_review",
        claimTicket: true,
        employeeReply: draft.trim() || undefined,
      });
      setNotice(`Claimed ticket "${t.subject}" and moved to In Review.`);
    } finally {
      setSavingId(null);
    }
  };

  const handleResolve = async (t: SupportTicketRecord) => {
    setSavingId(t.id);
    setNotice("");
    setErrorMsg("");
    try {
      const draft = replyDrafts[t.id] ?? t.employeeReply ?? "";
      await updateSupportTicket({
        ticketId: t.id,
        status: "resolved",
        claimTicket: !t.assignedEmployeeId,
        employeeReply:
          draft.trim() ||
          "Resolved by BhoomiBandhu support desk. Please reach back out anytime if you need more assistance.",
      });
      setNotice(`Resolved ticket "${t.subject}".`);
    } finally {
      setSavingId(null);
    }
  };

  const showTicketsSection = !isAdmin || adminTab === "tickets";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#2D6A4F]">
              {isAdmin
                ? "Admin Support Team & Operations Control"
                : profile?.department || "Farmer Help & Operations Desk"}
            </p>
            <h1 className="text-2xl font-display font-bold text-[#1B2A20]">
              {isAdmin
                ? "Support Desk — Employees & Help Operations"
                : "Company Employee Help & Support Desk"}
            </h1>
            <p className="text-sm text-[#4A5A4F] mt-0.5">
              {isAdmin
                ? "View all support employees, grant one-time access (only Admin can add employees), send automated no-reply onboarding mail, and oversee tickets."
                : "Claim incoming farmer help tickets, reply with scheme/storage guidance, and resolve cases promptly."}
            </p>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div
          role="tablist"
          aria-label="Support Desk Admin sections"
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={adminTab === "employees"}
            onClick={() => setAdminTab("employees")}
            className={`min-h-[42px] px-4 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
              adminTab === "employees"
                ? "bg-[#2D6A4F] text-white"
                : "bg-white border border-[#2D6A4F]/20 text-[#1B2A20] hover:bg-[#EAF4EE]"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Support Employees &amp; Access ({supportEmployees.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={adminTab === "tickets"}
            onClick={() => setAdminTab("tickets")}
            className={`min-h-[42px] px-4 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
              adminTab === "tickets"
                ? "bg-[#2D6A4F] text-white"
                : "bg-white border border-[#2D6A4F]/20 text-[#1B2A20] hover:bg-[#EAF4EE]"
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>
              Support Tickets ({allSupportTickets.length})
              {activeComplaintsCount > 0
                ? ` · ${activeComplaintsCount} Priority Complaint${
                    activeComplaintsCount > 1 ? "s" : ""
                  }`
                : ""}
            </span>
          </button>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-[#EAF4EE] border border-[#2D6A4F]/25 text-sm font-medium text-[#1B2A20] flex items-start gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
          <span>{notice}</span>
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-800 flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ADMIN-ONLY: Support Employees Roster, Add Employee Form & Automated No-Reply Mail */}
      {isAdmin && adminTab === "employees" && (
        <div className="space-y-6">
          {/* Employee KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-4 md:p-5">
              <p className="text-xs font-semibold text-[#2D6A4F]">
                Total Support Employees
              </p>
              <p className="text-2xl font-display font-bold text-[#1B2A20] tabular-nums mt-1">
                {supportEmployees.length}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-4 md:p-5">
              <p className="text-xs font-semibold text-[#2D6A4F]">
                Active Employees
              </p>
              <p className="text-2xl font-display font-bold text-[#1B2A20] tabular-nums mt-1">
                {activeEmployeesCount}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-4 md:p-5">
              <p className="text-xs font-semibold text-amber-700">
                Pending First Login Password Change
              </p>
              <p className="text-2xl font-display font-bold text-[#1B2A20] tabular-nums mt-1">
                {pendingFirstLoginCount}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Admin-Only Add Support Employee & Give Access Form */}
            <section className="lg:col-span-5 bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 md:p-6 space-y-4">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
                    Add Support Employee
                  </h2>
                  <p className="text-xs text-[#4A5A4F]">
                    Only the Administrator can add employees and grant one-time
                    login credentials.
                  </p>
                </div>
              </div>

              <form onSubmit={handleGiveAccess} className="space-y-3.5">
                <div>
                  <label
                    htmlFor="emp-name"
                    className="block text-sm font-medium text-[#1B2A20] mb-1"
                  >
                    Employee Full Name
                  </label>
                  <input
                    id="emp-name"
                    type="text"
                    required
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder="e.g. Meera Nair"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
                  />
                </div>

                <div>
                  <label
                    htmlFor="emp-email"
                    className="block text-sm font-medium text-[#1B2A20] mb-1"
                  >
                    Employee Email Address
                  </label>
                  <input
                    id="emp-email"
                    type="email"
                    required
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    placeholder="e.g. meera.support@bhoomibandhu.in"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
                  />
                </div>

                <div>
                  <label
                    htmlFor="emp-dept"
                    className="block text-sm font-medium text-[#1B2A20] mb-1"
                  >
                    Department
                  </label>
                  <input
                    id="emp-dept"
                    type="text"
                    value={empDepartment}
                    onChange={(e) => setEmpDepartment(e.target.value)}
                    placeholder="Farmer Help & Operations Desk"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="emp-temp-password"
                      className="block text-sm font-medium text-[#1B2A20]"
                    >
                      One-Time Login Password
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setTempPassword(generateOneTimePassword(10))
                      }
                      className="text-xs font-semibold text-[#2D6A4F] hover:underline inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Generate New</span>
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#4A5A4F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="emp-temp-password"
                      type="text"
                      required
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      placeholder="Auto-generated one-time password"
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
                    />
                  </div>
                  <p className="text-[11px] text-[#4A5A4F] mt-1">
                    Employee must replace this temporary password immediately
                    after their first login.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={provisioning}
                  className="w-full min-h-[46px] rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] disabled:opacity-60 text-[#1B2A20] font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>
                    {provisioning
                      ? "Granting Access & Generating Mail..."
                      : "Give Access"}
                  </span>
                </button>
              </form>
            </section>

            {/* Right: All Support Employees Directory */}
            <section className="lg:col-span-7 bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
                    All Support Desk Employees
                  </h2>
                  <p className="text-xs text-[#4A5A4F]">
                    Live roster of company employees and first-login activation
                    status.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#2D6A4F]">
                  {supportEmployees.length} total
                </span>
              </div>

              {supportEmployees.length === 0 ? (
                <p className="text-sm text-[#4A5A4F] py-6 text-center">
                  No support employees added yet. Use the form on the left to
                  grant access.
                </p>
              ) : (
                <div className="space-y-3">
                  {supportEmployees.map((emp) => (
                    <article
                      key={emp.id}
                      className="p-4 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-sm text-[#1B2A20]">
                            {emp.name}
                          </h3>
                          {emp.status === "pending_first_login" ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-semibold">
                              Pending First-Login Password Change
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-[#EAF4EE] text-[#2D6A4F] text-[11px] font-semibold">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-[#1B2A20] truncate">
                          {emp.email}
                        </p>
                        <p className="text-xs text-[#4A5A4F]">
                          {emp.department} · {emp.createdAtLabel}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2D6A4F] shrink-0">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>
                          {emp.emailDeliveryStatus === "sent"
                            ? "No-Reply Mail Sent"
                            : "No-Reply Mail Generated"}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Latest Automated No-Reply Mail Receipt */}
          {latestGeneratedMail && (
            <section
              aria-label="Generated automated no-reply access email"
              className="bg-white rounded-2xl border-2 border-[#2D6A4F]/30 p-5 md:p-6 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[#2D6A4F]">
                  <Mail className="w-5 h-5" />
                  <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
                    Automated No-Reply Mail Generated
                  </h2>
                </div>
                <span className="text-xs font-semibold text-[#2D6A4F] uppercase">
                  {latestGeneratedMail.deliveryMode === "smtp"
                    ? "Dispatched via SMTP"
                    : "Automated No-Reply Outbox"}
                </span>
              </div>

              <div className="rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/15 p-4 space-y-2 text-xs">
                <p>
                  <strong className="text-[#1B2A20]">From:</strong>{" "}
                  <span className="font-mono text-[#4A5A4F]">
                    {latestGeneratedMail.fromAddress}
                  </span>
                </p>
                <p>
                  <strong className="text-[#1B2A20]">To:</strong>{" "}
                  <span className="font-mono text-[#1B2A20]">
                    {latestGeneratedMail.toEmail}
                  </span>
                </p>
                <p>
                  <strong className="text-[#1B2A20]">Subject:</strong>{" "}
                  <span>{latestGeneratedMail.subject}</span>
                </p>
                <pre className="mt-2 p-3 rounded-lg bg-white border border-[#2D6A4F]/10 text-xs font-mono text-[#1B2A20] whitespace-pre-wrap leading-relaxed">
                  {latestGeneratedMail.bodyPreview}
                </pre>
              </div>
            </section>
          )}

          {/* Automated No-Reply Mail Outbox History */}
          {mailOutbox.length > 0 && (
            <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 md:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-base text-[#1B2A20]">
                  Automated No-Reply Mail Log ({mailOutbox.length})
                </h2>
                <span className="text-xs text-[#4A5A4F]">
                  noreply@bhoomibandhu.in
                </span>
              </div>
              <div className="divide-y divide-[#2D6A4F]/10">
                {mailOutbox.map((m) => (
                  <div
                    key={m.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[#1B2A20]">
                        {m.subject} — {m.employeeName} ({m.toEmail})
                      </p>
                      <p className="text-[#4A5A4F] mt-0.5">
                        From: {m.fromAddress} · {m.sentAtLabel}
                      </p>
                    </div>
                    <span className="font-semibold text-[#2D6A4F] uppercase shrink-0">
                      {m.deliveryMode === "smtp"
                        ? "SMTP Sent"
                        : "Outbox Logged"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* SUPPORT TICKETS QUEUE (Visible to Support Employees and Admin on Tickets tab) */}
      {showTicketsSection && (
        <>
          {/* Active Priority Complaint Alert Banner */}
          {activeComplaintsCount > 0 && (
            <div
              role="region"
              aria-label="Active priority complaints alert"
              className="rounded-2xl bg-red-50 border-2 border-red-300 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm text-red-900">
                    {activeComplaintsCount} Active Priority Complaint
                    {activeComplaintsCount > 1 ? "s" : ""} Require Immediate
                    Attention
                  </p>
                  <p className="text-xs text-red-800 mt-0.5">
                    Complaints are automatically pinned to the top of your queue
                    and highlighted in red until resolved.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setCategoryFilter(
                    categoryFilter === "complaint" ? "all" : "complaint"
                  )
                }
                className="min-h-[38px] px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>
                  {categoryFilter === "complaint"
                    ? "Show All Tickets"
                    : "Filter Complaints Only"}
                </span>
              </button>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            <div
              className={`rounded-2xl p-4 md:p-5 border ${
                activeComplaintsCount > 0
                  ? "bg-red-50/70 border-2 border-red-300"
                  : "bg-white border-[#2D6A4F]/15"
              }`}
            >
              <p className="text-xs font-semibold text-red-800">
                Priority Complaints
              </p>
              <p className="text-2xl font-display font-bold text-red-900 tabular-nums mt-1">
                {activeComplaintsCount}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-4 md:p-5">
              <p className="text-xs font-semibold text-[#2D6A4F]">Open Queue</p>
              <p className="text-2xl font-display font-bold text-[#1B2A20] tabular-nums mt-1">
                {openCount}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-4 md:p-5">
              <p className="text-xs font-semibold text-[#2D6A4F]">In Review</p>
              <p className="text-2xl font-display font-bold text-[#1B2A20] tabular-nums mt-1">
                {reviewCount}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-4 md:p-5">
              <p className="text-xs font-semibold text-amber-700">
                Urgent Active
              </p>
              <p className="text-2xl font-display font-bold text-[#1B2A20] tabular-nums mt-1">
                {urgentCount}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-4 md:p-5">
              <p className="text-xs font-semibold text-[#2D6A4F]">Resolved</p>
              <p className="text-2xl font-display font-bold text-[#1B2A20] tabular-nums mt-1">
                {resolvedCount}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <label htmlFor="support-ticket-search" className="sr-only">
                Search support tickets
              </label>
              <Search className="w-4 h-4 text-[#4A5A4F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="support-ticket-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by subject, message, or assignee..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#2D6A4F]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(["all", "open", "in_review", "resolved"] as const).map(
                (st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold uppercase whitespace-nowrap transition-colors ${
                      statusFilter === st
                        ? "bg-[#2D6A4F] text-white"
                        : "bg-white border border-[#2D6A4F]/20 text-[#1B2A20] hover:bg-[#EAF4EE]"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                )
              )}
              <select
                aria-label="Filter by ticket category"
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(
                    e.target.value as
                      | "all"
                      | "complaint"
                      | "support"
                      | "wellbeing"
                  )
                }
                className="h-10 px-3 rounded-xl bg-white border border-[#2D6A4F]/20 text-xs font-semibold text-[#1B2A20]"
              >
                <option value="all">All Categories</option>
                <option value="complaint">Complaints (Priority)</option>
                <option value="support">General Support</option>
                <option value="wellbeing">Well-Being Follow-Up</option>
              </select>
            </div>
          </div>

          {/* Ticket List */}
          <section className="space-y-4">
            {filteredTickets.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-8 text-center">
                <p className="font-semibold text-base text-[#1B2A20]">
                  No matching support tickets
                </p>
                <p className="text-sm text-[#4A5A4F] mt-1">
                  Tickets submitted from the Help Centre or Well-Being page
                  appear here.
                </p>
              </div>
            ) : (
              filteredTickets.map((t) => {
                const draft =
                  replyDrafts[t.id] !== undefined
                    ? replyDrafts[t.id]
                    : t.employeeReply || "";
                const isComplaint = isComplaintTicket(t);
                const activeComplaint = isActiveComplaint(t);
                return (
                  <article
                    key={t.id}
                    className={`rounded-2xl p-5 md:p-6 space-y-4 ${
                      activeComplaint
                        ? "bg-red-50/45 border-2 border-red-300"
                        : "bg-white border border-[#2D6A4F]/15"
                    }`}
                  >
                    {activeComplaint && (
                      <div className="px-3 py-2 rounded-xl bg-red-100/90 border border-red-200 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-red-900">
                        <span className="inline-flex items-center gap-1.5 uppercase tracking-wide">
                          <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                          <span>
                            High Priority Complaint · Immediate Review Required
                          </span>
                        </span>
                        <span className="uppercase text-red-800">
                          {t.status.replace("_", " ")}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                          <span
                            className={`uppercase ${
                              activeComplaint
                                ? "text-red-800"
                                : "text-[#2D6A4F]"
                            }`}
                          >
                            {isComplaint ? "Complaint" : t.category} ·{" "}
                            {t.status.replace("_", " ")}
                          </span>
                          {t.priority === "urgent" && !activeComplaint && (
                            <span className="text-amber-700 uppercase">
                              · Urgent Priority
                            </span>
                          )}
                          {t.assignedEmployeeName && (
                            <span className="text-[#4A5A4F] inline-flex items-center gap-1">
                              · <UserCheck className="w-3.5 h-3.5" />{" "}
                              {t.assignedEmployeeName}
                            </span>
                          )}
                        </div>
                        <h2 className="font-display font-semibold text-lg text-[#1B2A20] mt-1">
                          {t.subject}
                        </h2>
                      </div>
                      <span className="text-xs text-[#4A5A4F] flex items-center gap-1 shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Ref: {t.id.slice(0, 12)}</span>
                      </span>
                    </div>

                    <p
                      className={`text-sm text-[#4A5A4F] leading-relaxed p-3.5 rounded-xl ${
                        activeComplaint
                          ? "bg-white border border-red-200/80"
                          : "bg-[#FAF8F3]"
                      }`}
                    >
                      {t.message}
                    </p>

                    {t.status !== "resolved" ? (
                      <div className="space-y-3">
                        <div>
                          <label
                            htmlFor={`reply-${t.id}`}
                            className="block text-xs font-semibold text-[#1B2A20] mb-1"
                          >
                            Employee Response to Farmer
                          </label>
                          <textarea
                            id={`reply-${t.id}`}
                            rows={2}
                            value={draft}
                            onChange={(e) =>
                              setReplyDrafts((prev) => ({
                                ...prev,
                                [t.id]: e.target.value,
                              }))
                            }
                            placeholder="Write clear, actionable guidance for the farmer..."
                            className="w-full p-3 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {t.status === "open" && (
                            <button
                              type="button"
                              disabled={savingId === t.id}
                              onClick={() => handleClaimAndReview(t)}
                              className="min-h-[42px] px-4 rounded-xl border border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#EAF4EE] font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
                            >
                              <UserCheck className="w-4 h-4" />
                              <span>Claim &amp; Mark In Review</span>
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={savingId === t.id}
                            onClick={() => handleResolve(t)}
                            className="min-h-[42px] px-4 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            <span>Send Reply &amp; Resolve</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      t.employeeReply && (
                        <div className="p-3.5 rounded-xl bg-[#EAF4EE] text-sm text-[#1B2A20]">
                          <p className="text-xs font-semibold text-[#2D6A4F] mb-1">
                            Resolution Note
                          </p>
                          <p>{t.employeeReply}</p>
                        </div>
                      )
                    )}
                  </article>
                );
              })
            )}
          </section>
        </>
      )}
    </div>
  );
}
