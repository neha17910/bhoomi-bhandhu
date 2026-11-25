export type TicketStatusKey = "open" | "in_review" | "resolved";
export type TicketCategoryKey = "support" | "complaint" | "wellbeing";

export const SUPPORT_SUBJECTS = [
  "Scheme Application Help",
  "Warehouse Booking Issue",
  "Account or Profile Update",
  "General Feedback",
] as const;

export const COMPLAINT_SUBJECTS = [
  "Warehouse Overcharging / Facility Dispute",
  "Delayed Booking or Storage Rejection",
  "Loan or Insurance Mis-selling / Claim Delay",
  "Scheme / Subsidy Application Grievance",
  "App Error or Incorrect Advisory Data",
  "Partner or Staff Conduct Complaint",
] as const;

export interface SupportTicketSummaryItem {
  key: TicketStatusKey;
  label: "Open" | "In Progress" | "Resolved";
  count: number;
  percentage: number;
  color: string;
  bgTintClass: string;
  textClass: string;
}

export interface SupportTicketSummary {
  total: number;
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  urgentActiveCount: number;
  activeComplaintsCount: number;
  totalComplaintsCount: number;
  resolutionRatePct: number;
  segments: SupportTicketSummaryItem[];
}

export interface ComplaintProgressStage {
  step: 1 | 2 | 3;
  label: "Filed" | "In Review" | "Resolved";
  statusLabel: string;
  description: string;
}

export function isComplaintTicket(ticket: { category?: string }): boolean {
  return ticket.category === "complaint";
}

export function isActiveComplaint(ticket: {
  category?: string;
  status: TicketStatusKey;
}): boolean {
  return isComplaintTicket(ticket) && ticket.status !== "resolved";
}

export function parseFirestoreTimestampToIso(
  value: unknown
): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? undefined : new Date(parsed).toISOString();
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  }
  if (typeof value === "object") {
    const candidate = value as {
      toDate?: () => Date;
      seconds?: number;
      _seconds?: number;
    };
    if (typeof candidate.toDate === "function") {
      try {
        const d = candidate.toDate();
        if (d instanceof Date && !Number.isNaN(d.getTime())) {
          return d.toISOString();
        }
      } catch {
        return undefined;
      }
    }
    const sec =
      typeof candidate.seconds === "number"
        ? candidate.seconds
        : typeof candidate._seconds === "number"
        ? candidate._seconds
        : undefined;
    if (typeof sec === "number" && Number.isFinite(sec)) {
      return new Date(sec * 1000).toISOString();
    }
  }
  return undefined;
}

export function formatComplaintTimestamp(iso?: string): string {
  if (!iso) return "Just now";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "Just now";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ms));
  } catch {
    return new Date(ms).toISOString().slice(0, 16).replace("T", " ");
  }
}

export function getComplaintProgressStage(
  status: TicketStatusKey
): ComplaintProgressStage {
  if (status === "resolved") {
    return {
      step: 3,
      label: "Resolved",
      statusLabel: "Resolved",
      description: "Final resolution note posted and complaint closed.",
    };
  }
  if (status === "in_review") {
    return {
      step: 2,
      label: "In Review",
      statusLabel: "In Review · Priority",
      description: "Assigned to a support officer for active investigation.",
    };
  }
  return {
    step: 1,
    label: "Filed",
    statusLabel: "Open · High Priority",
    description:
      "Logged and pinned to the top of Support Desk & Admin queues.",
  };
}

export function summarizeSupportTickets(
  tickets: Array<{
    status: TicketStatusKey;
    priority?: "normal" | "urgent";
    category?: TicketCategoryKey | string;
  }>
): SupportTicketSummary {
  let openCount = 0;
  let inProgressCount = 0;
  let resolvedCount = 0;
  let urgentActiveCount = 0;
  let activeComplaintsCount = 0;
  let totalComplaintsCount = 0;

  for (const t of tickets) {
    const isComplaint = isComplaintTicket(t);
    if (isComplaint) {
      totalComplaintsCount += 1;
    }

    if (t.status === "open") {
      openCount += 1;
      if (t.priority === "urgent" || isComplaint) urgentActiveCount += 1;
      if (isComplaint) activeComplaintsCount += 1;
    } else if (t.status === "in_review") {
      inProgressCount += 1;
      if (t.priority === "urgent" || isComplaint) urgentActiveCount += 1;
      if (isComplaint) activeComplaintsCount += 1;
    } else if (t.status === "resolved") {
      resolvedCount += 1;
    }
  }

  const total = openCount + inProgressCount + resolvedCount;
  const pct = (count: number) =>
    total > 0 ? Math.round((count / total) * 100) : 0;

  const segments: SupportTicketSummaryItem[] = [
    {
      key: "open",
      label: "Open",
      count: openCount,
      percentage: pct(openCount),
      color: "#E9A23B",
      bgTintClass: "bg-amber-50",
      textClass: "text-amber-800",
    },
    {
      key: "in_review",
      label: "In Progress",
      count: inProgressCount,
      percentage: pct(inProgressCount),
      color: "#3A7CA5",
      bgTintClass: "bg-sky-50",
      textClass: "text-sky-800",
    },
    {
      key: "resolved",
      label: "Resolved",
      count: resolvedCount,
      percentage: pct(resolvedCount),
      color: "#2D6A4F",
      bgTintClass: "bg-[#EAF4EE]",
      textClass: "text-[#2D6A4F]",
    },
  ];

  return {
    total,
    openCount,
    inProgressCount,
    resolvedCount,
    urgentActiveCount,
    activeComplaintsCount,
    totalComplaintsCount,
    resolutionRatePct: pct(resolvedCount),
    segments,
  };
}

/**
 * Computes sort weight so unresolved complaints always appear at the top of
 * Support Desk and Admin queues, followed by other urgent active tickets,
 * normal active tickets, and finally resolved items.
 */
function getTicketQueueRank(ticket: {
  category?: TicketCategoryKey | string;
  priority?: "normal" | "urgent";
  status: TicketStatusKey;
}): number {
  const isComplaint = isComplaintTicket(ticket);
  if (ticket.status !== "resolved") {
    if (isComplaint && ticket.status === "open") return 0;
    if (isComplaint && ticket.status === "in_review") return 1;
    if (ticket.priority === "urgent" && ticket.status === "open") return 2;
    if (ticket.priority === "urgent") return 3;
    if (ticket.status === "open") return 4;
    return 5;
  }
  return isComplaint ? 6 : 7;
}

export function prioritizeSupportTickets<
  T extends {
    category?: TicketCategoryKey | string;
    priority?: "normal" | "urgent";
    status: TicketStatusKey;
  }
>(tickets: readonly T[]): T[] {
  return tickets
    .map((ticket, index) => ({
      ticket,
      index,
      rank: getTicketQueueRank(ticket),
    }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((entry) => entry.ticket);
}

/**
 * Returns only complaint tickets ordered with unresolved active complaints
 * first and newest timestamps prioritized within each status tier.
 */
export function getFarmerComplaints<
  T extends {
    category?: TicketCategoryKey | string;
    priority?: "normal" | "urgent";
    status: TicketStatusKey;
    createdAtIso?: string;
    updatedAtIso?: string;
  }
>(tickets: readonly T[]): T[] {
  const complaints = tickets.filter((t) => isComplaintTicket(t));
  const sortedNewestFirst = [...complaints].sort((a, b) => {
    const aMs = Date.parse(a.updatedAtIso || a.createdAtIso || "") || 0;
    const bMs = Date.parse(b.updatedAtIso || b.createdAtIso || "") || 0;
    return bMs - aMs;
  });
  return prioritizeSupportTickets(sortedNewestFirst);
}

export function validateSupportSubmission(params: {
  mode: "support" | "complaint";
  subject: string;
  message: string;
}): string | null {
  if (!params.subject.trim() || params.subject.trim().length < 2) {
    return "Please select a valid subject.";
  }
  const trimmedMsg = params.message.trim();
  if (trimmedMsg.length < 5) {
    return params.mode === "complaint"
      ? "Please describe your complaint clearly in at least 5 characters."
      : "Please describe your question in at least 5 characters.";
  }
  if (trimmedMsg.length > 1000) {
    return "Please keep your description under 1000 characters.";
  }
  return null;
}
