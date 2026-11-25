import test from "node:test";
import assert from "node:assert/strict";
import {
  formatComplaintTimestamp,
  getComplaintProgressStage,
  getFarmerComplaints,
  isActiveComplaint,
  isComplaintTicket,
  parseFirestoreTimestampToIso,
  prioritizeSupportTickets,
  summarizeSupportTickets,
  validateSupportSubmission,
} from "./supportTicketStats";

test("summarizeSupportTickets handles empty ticket list cleanly", () => {
  const summary = summarizeSupportTickets([]);
  assert.equal(summary.total, 0);
  assert.equal(summary.openCount, 0);
  assert.equal(summary.inProgressCount, 0);
  assert.equal(summary.resolvedCount, 0);
  assert.equal(summary.activeComplaintsCount, 0);
  assert.equal(summary.totalComplaintsCount, 0);
  assert.equal(summary.resolutionRatePct, 0);
  assert.equal(summary.segments.length, 3);
  assert.deepEqual(
    summary.segments.map((s) => s.label),
    ["Open", "In Progress", "Resolved"]
  );
});

test("summarizeSupportTickets counts Open, In Progress, Resolved, urgent, and complaint tickets", () => {
  const summary = summarizeSupportTickets([
    { status: "open", priority: "urgent", category: "support" },
    { status: "open", priority: "normal", category: "support" },
    { status: "in_review", priority: "urgent", category: "complaint" },
    { status: "resolved", priority: "urgent", category: "complaint" },
  ]);

  assert.equal(summary.total, 4);
  assert.equal(summary.openCount, 2);
  assert.equal(summary.inProgressCount, 1);
  assert.equal(summary.resolvedCount, 1);
  assert.equal(summary.urgentActiveCount, 2);
  assert.equal(summary.activeComplaintsCount, 1);
  assert.equal(summary.totalComplaintsCount, 2);
  assert.equal(summary.resolutionRatePct, 25);
  assert.equal(summary.segments[0].percentage, 50);
  assert.equal(summary.segments[1].percentage, 25);
  assert.equal(summary.segments[2].percentage, 25);
});

test("isComplaintTicket and isActiveComplaint distinguish open vs resolved complaints", () => {
  assert.equal(isComplaintTicket({ category: "complaint" }), true);
  assert.equal(isComplaintTicket({ category: "support" }), false);
  assert.equal(
    isActiveComplaint({ category: "complaint", status: "open" }),
    true
  );
  assert.equal(
    isActiveComplaint({ category: "complaint", status: "in_review" }),
    true
  );
  assert.equal(
    isActiveComplaint({ category: "complaint", status: "resolved" }),
    false
  );
});

test("prioritizeSupportTickets places active complaints ahead of other urgent and normal tickets", () => {
  const input = [
    {
      id: "resolved-sup",
      category: "support",
      priority: "normal" as const,
      status: "resolved" as const,
    },
    {
      id: "open-urgent-sup",
      category: "support",
      priority: "urgent" as const,
      status: "open" as const,
    },
    {
      id: "review-complaint",
      category: "complaint",
      priority: "urgent" as const,
      status: "in_review" as const,
    },
    {
      id: "open-normal-sup",
      category: "support",
      priority: "normal" as const,
      status: "open" as const,
    },
    {
      id: "open-complaint",
      category: "complaint",
      priority: "urgent" as const,
      status: "open" as const,
    },
    {
      id: "resolved-complaint",
      category: "complaint",
      priority: "urgent" as const,
      status: "resolved" as const,
    },
  ];

  const sorted = prioritizeSupportTickets(input);
  assert.deepEqual(
    sorted.map((t) => t.id),
    [
      "open-complaint",
      "review-complaint",
      "open-urgent-sup",
      "open-normal-sup",
      "resolved-complaint",
      "resolved-sup",
    ]
  );
});

test("parseFirestoreTimestampToIso and formatComplaintTimestamp handle Firestore Timestamps, seconds maps, and ISOs", () => {
  const fromToDate = parseFirestoreTimestampToIso({
    toDate: () => new Date("2026-11-20T08:30:00.000Z"),
  });
  assert.equal(fromToDate, "2026-11-20T08:30:00.000Z");

  const fromSeconds = parseFirestoreTimestampToIso({ seconds: 1700000000 });
  assert.ok(fromSeconds && fromSeconds.startsWith("2023-11-14T"));

  assert.equal(parseFirestoreTimestampToIso(null), undefined);
  assert.equal(formatComplaintTimestamp(undefined), "Just now");
  const formatted = formatComplaintTimestamp("2026-11-20T08:30:00.000Z");
  assert.ok(formatted.includes("2026"));
});

test("getComplaintProgressStage maps open, in_review, and resolved into sequential progress steps", () => {
  assert.equal(getComplaintProgressStage("open").step, 1);
  assert.equal(getComplaintProgressStage("in_review").step, 2);
  assert.equal(getComplaintProgressStage("resolved").step, 3);
});

test("getFarmerComplaints excludes non-complaints and orders active complaints newest-first", () => {
  const list = getFarmerComplaints([
    {
      id: "sup-1",
      category: "support",
      status: "open",
      priority: "urgent",
      createdAtIso: "2026-11-22T09:00:00.000Z",
    },
    {
      id: "comp-resolved",
      category: "complaint",
      status: "resolved",
      priority: "urgent",
      createdAtIso: "2026-11-18T10:00:00.000Z",
      updatedAtIso: "2026-11-21T10:00:00.000Z",
    },
    {
      id: "comp-open-old",
      category: "complaint",
      status: "open",
      priority: "urgent",
      createdAtIso: "2026-11-19T10:00:00.000Z",
      updatedAtIso: "2026-11-19T10:00:00.000Z",
    },
    {
      id: "comp-open-new",
      category: "complaint",
      status: "open",
      priority: "urgent",
      createdAtIso: "2026-11-22T09:00:00.000Z",
      updatedAtIso: "2026-11-22T09:00:00.000Z",
    },
    {
      id: "comp-review",
      category: "complaint",
      status: "in_review",
      priority: "urgent",
      createdAtIso: "2026-11-20T09:00:00.000Z",
      updatedAtIso: "2026-11-21T15:00:00.000Z",
    },
  ]);

  assert.deepEqual(
    list.map((t) => t.id),
    ["comp-open-new", "comp-open-old", "comp-review", "comp-resolved"]
  );
});

test("validateSupportSubmission enforces message length and subject checks", () => {
  assert.ok(
    validateSupportSubmission({
      mode: "complaint",
      subject: "Warehouse Overcharging / Facility Dispute",
      message: "bad",
    })
  );
  assert.equal(
    validateSupportSubmission({
      mode: "complaint",
      subject: "Warehouse Overcharging / Facility Dispute",
      message: "Godown charged extra Rs 15 per quintal above the booked rate.",
    }),
    null
  );
});
