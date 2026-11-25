import React, { useMemo, useState } from "react";
import * as d3 from "d3";
import { AlertTriangle, ArrowRight, Headphones } from "lucide-react";
import {
  summarizeSupportTickets,
  type SupportTicketSummaryItem,
  type TicketStatusKey,
} from "../utils/supportTicketStats";
import type { SupportTicketRecord } from "../context/AuthContext";

interface SupportTicketStatusWidgetProps {
  tickets: SupportTicketRecord[];
  onInspectTickets: () => void;
}

export function SupportTicketStatusWidget({
  tickets,
  onInspectTickets,
}: SupportTicketStatusWidgetProps) {
  const [hoveredKey, setHoveredKey] = useState<TicketStatusKey | null>(null);

  const summary = useMemo(() => summarizeSupportTickets(tickets), [tickets]);

  const arcs = useMemo(() => {
    const nonZero = summary.segments.filter((s) => s.count > 0);
    if (nonZero.length === 0) return [];

    const pieGen = d3
      .pie<SupportTicketSummaryItem>()
      .value((d) => d.count)
      .sort(null)
      .padAngle(0.03);

    const arcGen = d3
      .arc<d3.PieArcDatum<SupportTicketSummaryItem>>()
      .innerRadius(54)
      .outerRadius(82)
      .cornerRadius(6);

    const activeArcGen = d3
      .arc<d3.PieArcDatum<SupportTicketSummaryItem>>()
      .innerRadius(52)
      .outerRadius(86)
      .cornerRadius(6);

    return pieGen(nonZero).map((slice) => ({
      item: slice.data,
      path:
        hoveredKey === slice.data.key
          ? activeArcGen(slice) || ""
          : arcGen(slice) || "",
    }));
  }, [summary.segments, hoveredKey]);

  const barScale = useMemo(() => {
    const totalVal = Math.max(1, summary.total);
    return d3.scaleLinear().domain([0, totalVal]).range([0, 100]);
  }, [summary.total]);

  const hoveredSegment = summary.segments.find((s) => s.key === hoveredKey);

  return (
    <section
      aria-label="Support Ticket Status Summary"
      className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 md:p-6 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
              Support Ticket Status Breakdown
            </h2>
            <p className="text-xs text-[#4A5A4F]">
              Real-time D3 summary across Open, In Progress, and Resolved cases
              {summary.urgentActiveCount > 0
                ? ` · ${summary.urgentActiveCount} urgent active`
                : ""}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onInspectTickets}
          className="min-h-[38px] px-3.5 rounded-xl border border-[#2D6A4F]/25 text-xs font-semibold text-[#2D6A4F] hover:bg-[#EAF4EE] inline-flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <span>Inspect Ticket Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {summary.activeComplaintsCount > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-red-900">
            <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
            <span>
              {summary.activeComplaintsCount} Active Priority Complaint
              {summary.activeComplaintsCount > 1 ? "s" : ""} Flagged for
              Immediate Review
            </span>
          </div>
          <button
            type="button"
            onClick={onInspectTickets}
            className="text-xs font-bold text-red-800 hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Review Complaints Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* D3 Donut Chart */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg
              viewBox="-96 -96 192 192"
              className="w-48 h-48 overflow-visible"
              role="img"
              aria-label={`Support ticket status chart: ${summary.openCount} Open, ${summary.inProgressCount} In Progress, ${summary.resolvedCount} Resolved`}
            >
              {summary.total === 0 ? (
                <circle
                  cx={0}
                  cy={0}
                  r={68}
                  fill="none"
                  stroke="#E5E0D5"
                  strokeWidth={26}
                />
              ) : (
                arcs.map(({ item, path }) => (
                  <path
                    key={item.key}
                    d={path}
                    fill={item.color}
                    className="transition-all duration-150 cursor-pointer"
                    opacity={
                      hoveredKey && hoveredKey !== item.key ? 0.55 : 1
                    }
                    onMouseEnter={() => setHoveredKey(item.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                  >
                    <title>
                      {item.label}: {item.count} ({item.percentage}%)
                    </title>
                  </path>
                ))
              )}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              {hoveredSegment ? (
                <>
                  <span className="text-2xl font-display font-bold text-[#1B2A20] tabular-nums leading-none">
                    {hoveredSegment.count}
                  </span>
                  <span className="text-[11px] font-semibold text-[#4A5A4F] mt-1">
                    {hoveredSegment.label} ({hoveredSegment.percentage}%)
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-display font-bold text-[#1B2A20] tabular-nums leading-none">
                    {summary.total}
                  </span>
                  <span className="text-[11px] font-medium text-[#4A5A4F] mt-1">
                    Total Tickets
                  </span>
                  <span className="text-[11px] font-semibold text-[#2D6A4F] mt-0.5 tabular-nums">
                    {summary.resolutionRatePct}% resolved
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* D3 Proportional Bar Summary & Status Breakdown */}
        <div className="md:col-span-7 space-y-3.5">
          {summary.segments.map((seg) => {
            const widthPct = summary.total === 0 ? 0 : barScale(seg.count);
            const isHovered = hoveredKey === seg.key;
            return (
              <div
                key={seg.key}
                onMouseEnter={() => setHoveredKey(seg.key)}
                onMouseLeave={() => setHoveredKey(null)}
                className={`p-3 rounded-xl border transition-colors ${
                  isHovered
                    ? "bg-[#FAF8F3] border-[#2D6A4F]/35"
                    : "bg-[#FAF8F3]/60 border-[#2D6A4F]/10"
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="font-semibold text-[#1B2A20]">
                      {seg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="font-display font-bold text-[#1B2A20]">
                      {seg.count}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md ${seg.bgTintClass} ${seg.textClass}`}
                    >
                      {seg.percentage}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-2.5 rounded-full bg-[#E8E4DA] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: seg.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
