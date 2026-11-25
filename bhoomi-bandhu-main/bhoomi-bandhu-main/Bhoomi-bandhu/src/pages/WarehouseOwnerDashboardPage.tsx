import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Edit3,
  Landmark,
  Plus,
  Shield,
  Warehouse,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { computeWarehousePortfolioMetrics } from "../utils/warehouseDashboard";
import type { WarehouseItem } from "../data/bhoomiData";

type BookingFilterTab = "all" | "pending" | "approved" | "rejected";

export function WarehouseOwnerDashboardPage() {
  const {
    user,
    profile,
    warehouses,
    ownerIncomingBookings,
    updateBookingStatus,
    createWarehouseListing,
    updateWarehouseListing,
  } = useAuth();

  const ownerWarehouses = useMemo(
    () => warehouses.filter((w) => w.ownerId === user?.uid),
    [warehouses, user?.uid]
  );

  const metrics = useMemo(
    () =>
      computeWarehousePortfolioMetrics(ownerWarehouses, ownerIncomingBookings),
    [ownerWarehouses, ownerIncomingBookings]
  );

  const [bookingFilter, setBookingFilter] = useState<BookingFilterTab>("all");
  const [bookingFeedback, setBookingFeedback] = useState("");

  // Quick register warehouse state
  const [showAddForm, setShowAddForm] = useState(false);
  const [whName, setWhName] = useState("");
  const [whCity, setWhCity] = useState(
    profile?.district && profile?.state
      ? `${profile.district}, ${profile.state}`
      : ""
  );
  const [whTotalCap, setWhTotalCap] = useState("1500");
  const [whAvailCap, setWhAvailCap] = useState("1000");
  const [whPrice, setWhPrice] = useState("22");
  const [whDesc, setWhDesc] = useState("");
  const [whSaving, setWhSaving] = useState(false);
  const [whError, setWhError] = useState("");

  // Inline edit capacity / rate state
  const [editingWhId, setEditingWhId] = useState<string | null>(null);
  const [editAvailCap, setEditAvailCap] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "paused">("active");
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState("");
  const [facilityNotice, setFacilityNotice] = useState("");

  const firstName = profile?.name?.split(" ")[0] || "Partner";

  const filteredBookings = useMemo(() => {
    if (bookingFilter === "all") return ownerIncomingBookings;
    return ownerIncomingBookings.filter((b) => b.status === bookingFilter);
  }, [ownerIncomingBookings, bookingFilter]);

  const handleBookingDecision = async (
    bookingId: string,
    decision: "approved" | "rejected"
  ) => {
    setBookingFeedback("");
    await updateBookingStatus(bookingId, decision);
    setBookingFeedback(
      decision === "approved"
        ? "Booking approved. The farmer has been notified."
        : "Booking request declined."
    );
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setWhError("");
    const total = Number(whTotalCap);
    const avail = Number(whAvailCap);
    const price = Number(whPrice);
    if (!whName.trim() || !whCity.trim()) {
      setWhError("Warehouse name and city/state are required.");
      return;
    }
    if (!Number.isFinite(total) || total <= 0 || avail < 0 || avail > total) {
      setWhError("Available capacity must be between 0 and total capacity.");
      return;
    }
    setWhSaving(true);
    try {
      await createWarehouseListing({
        name: whName,
        cityState: whCity,
        totalCapacityMt: total,
        availableCapacityMt: avail,
        pricePerQuintalMonth: price,
        facilities: [
          "Dry Grain Storage",
          "24x7 Security",
          "Digital Weighbridge",
          "Loading Dock",
        ],
        description:
          whDesc.trim() ||
          "Commercial agricultural storage godown with clean moisture-controlled bays.",
      });
      setWhName("");
      setWhDesc("");
      setShowAddForm(false);
      setFacilityNotice("New warehouse facility published to the directory.");
    } catch (err) {
      setWhError(
        err instanceof Error ? err.message : "Could not add warehouse."
      );
    } finally {
      setWhSaving(false);
    }
  };

  const startEditWarehouse = (wh: WarehouseItem) => {
    setEditingWhId(wh.id);
    setEditAvailCap(String(wh.availableCapacityMt));
    setEditPrice(String(wh.pricePerQuintalMonth));
    setEditStatus(wh.status);
    setEditError("");
  };

  const handleSaveWarehouseEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWhId) return;
    setEditError("");
    setEditBusy(true);
    try {
      await updateWarehouseListing({
        warehouseId: editingWhId,
        availableCapacityMt: Number(editAvailCap),
        pricePerQuintalMonth: Number(editPrice),
        status: editStatus,
      });
      setEditingWhId(null);
      setFacilityNotice("Facility capacity, rate, and status updated.");
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Unable to update facility."
      );
    } finally {
      setEditBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Executive Operations Header Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-[#EAF4EE] rounded-2xl border border-[#2D6A4F]/15 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-[#2D6A4F] mb-2">
              Warehouse Partner Operations ·{" "}
              {profile?.district ? `${profile.district}, ` : ""}
              {profile?.state || "India"}
            </p>
            <h1 className="text-2xl md:text-4xl font-display font-bold text-[#1B2A20] leading-tight">
              {firstName}&apos;s Godown &amp; Commercial Hub
            </h1>
            <p className="text-sm md:text-base text-[#4A5A4F] mt-3 max-w-xl leading-relaxed">
              Monitor facility occupancy, approve incoming farmer storage
              bookings, and explore commercial loans and insurance built for
              warehouse construction, daily operations, and land expansion.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-sm inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? "Close Form" : "Register New Godown"}</span>
            </button>
            <Link
              to="/warehouses"
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white border border-[#2D6A4F]/25 text-[#2D6A4F] hover:bg-[#F2EFE6] font-semibold text-sm inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Manage All Godowns</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-[#2D6A4F]/15 bg-[#1B2A20] relative min-h-[220px]">
          <img
            src="/src/assets/images/warehouse_grain_1795276858464.jpg"
            alt="Commercial agricultural grain warehouse bays"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover lg:h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 flex flex-col justify-end text-white">
            <p className="text-xs font-medium text-amber-200 tabular-nums">
              {metrics.activeFacilities} Active Facilities ·{" "}
              {metrics.occupancyPercent}% Capacity Utilized
            </p>
            <p className="font-display font-semibold text-lg leading-snug mt-0.5">
              Expand Storage Capacity or Buy Commercial Land
            </p>
            <Link
              to="/loans"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#E9A23B] hover:underline"
            >
              <span>Explore Commercial Warehouse Loans</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4-Column Operational KPI Strip */}
      <section
        aria-label="Warehouse portfolio metrics"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5">
          <p className="text-xs font-semibold text-[#4A5A4F]">
            Listed Facilities
          </p>
          <p className="text-2xl md:text-3xl font-display font-bold text-[#1B2A20] mt-1 tabular-nums">
            {metrics.totalFacilities}
          </p>
          <p className="text-xs text-[#2D6A4F] mt-1 tabular-nums">
            {metrics.activeFacilities} active · {metrics.pausedFacilities} paused
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5">
          <p className="text-xs font-semibold text-[#4A5A4F]">
            Occupied Capacity
          </p>
          <p className="text-2xl md:text-3xl font-display font-bold text-[#1B2A20] mt-1 tabular-nums">
            {metrics.occupancyPercent}%
          </p>
          <p className="text-xs text-[#4A5A4F] mt-1 tabular-nums">
            {metrics.occupiedCapacityMt.toLocaleString("en-IN")} /{" "}
            {metrics.totalCapacityMt.toLocaleString("en-IN")} MT used
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5">
          <p className="text-xs font-semibold text-[#4A5A4F]">
            Available Bay Space
          </p>
          <p className="text-2xl md:text-3xl font-display font-bold text-[#2D6A4F] mt-1 tabular-nums">
            {metrics.availableCapacityMt.toLocaleString("en-IN")} MT
          </p>
          <p className="text-xs text-[#4A5A4F] mt-1">
            Open for incoming storage
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5">
          <p className="text-xs font-semibold text-[#4A5A4F]">
            Booking Pipeline
          </p>
          <p className="text-2xl md:text-3xl font-display font-bold text-[#1B2A20] mt-1 tabular-nums">
            Rs. {metrics.confirmedRevenueInr.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-[#4A5A4F] mt-1 tabular-nums">
            {metrics.pendingBookingsCount} pending · Rs.{" "}
            {metrics.pendingPipelineInr.toLocaleString("en-IN")} est.
          </p>
        </div>
      </section>

      {/* Register New Godown Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateWarehouse}
          className="bg-white rounded-2xl border border-[#2D6A4F]/20 p-6 space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
              Register New Warehouse / Cold Storage
            </h2>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs font-semibold text-[#4A5A4F] hover:text-[#1B2A20]"
            >
              Cancel
            </button>
          </div>
          {whError && (
            <p
              role="alert"
              className="text-sm text-red-700 bg-red-50 p-3 rounded-xl"
            >
              {whError}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="dash-wh-name"
                className="block text-sm font-medium mb-1"
              >
                Warehouse Name
              </label>
              <input
                id="dash-wh-name"
                type="text"
                value={whName}
                onChange={(e) => setWhName(e.target.value)}
                placeholder="e.g. Saurashtra Agri Logistics Hub"
                className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="dash-wh-city"
                className="block text-sm font-medium mb-1"
              >
                City &amp; State
              </label>
              <input
                id="dash-wh-city"
                type="text"
                value={whCity}
                onChange={(e) => setWhCity(e.target.value)}
                placeholder="e.g. Rajkot, Gujarat"
                className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="dash-wh-price"
                className="block text-sm font-medium mb-1"
              >
                Rate (Rs. / Quintal / Month)
              </label>
              <input
                id="dash-wh-price"
                type="number"
                min="0"
                value={whPrice}
                onChange={(e) => setWhPrice(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm tabular-nums"
              />
            </div>
            <div>
              <label
                htmlFor="dash-wh-total"
                className="block text-sm font-medium mb-1"
              >
                Total Capacity (MT)
              </label>
              <input
                id="dash-wh-total"
                type="number"
                min="1"
                value={whTotalCap}
                onChange={(e) => setWhTotalCap(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm tabular-nums"
              />
            </div>
            <div>
              <label
                htmlFor="dash-wh-avail"
                className="block text-sm font-medium mb-1"
              >
                Available Capacity (MT)
              </label>
              <input
                id="dash-wh-avail"
                type="number"
                min="0"
                value={whAvailCap}
                onChange={(e) => setWhAvailCap(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm tabular-nums"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="dash-wh-desc"
              className="block text-sm font-medium mb-1"
            >
              Facility Specifications
            </label>
            <textarea
              id="dash-wh-desc"
              rows={2}
              value={whDesc}
              onChange={(e) => setWhDesc(e.target.value)}
              placeholder="Loading bays, CCTV, pest control, weighbridge, or WDRA certification..."
              className="w-full p-3 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={whSaving}
            className="min-h-[44px] px-6 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-sm transition-colors"
          >
            {whSaving ? "Publishing..." : "Publish Warehouse"}
          </button>
        </form>
      )}

      {facilityNotice && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-[#EAF4EE] border border-[#2D6A4F]/25 text-sm font-medium text-[#1B2A20] flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
          <span>{facilityNotice}</span>
        </div>
      )}

      {/* Main 2-Column Operational Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Incoming Farmer Booking Requests */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 md:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-display font-semibold text-[#1B2A20]">
                Incoming Farmer Booking Queue
              </h2>
              <p className="text-xs text-[#4A5A4F]">
                Approve or decline storage requests across your listed godowns.
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#FAF8F3] border border-[#2D6A4F]/12 rounded-xl self-start">
              {(["all", "pending", "approved", "rejected"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setBookingFilter(tab)}
                    className={`min-h-[36px] px-3 rounded-lg text-xs font-semibold capitalize whitespace-nowrap shrink-0 transition-colors ${
                      bookingFilter === tab
                        ? "bg-white text-[#1B2A20] shadow-sm"
                        : "text-[#4A5A4F] hover:text-[#1B2A20]"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
          </div>

          {bookingFeedback && (
            <div
              role="status"
              className="p-3 rounded-xl bg-[#EAF4EE] text-xs font-medium text-[#1B2A20] flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
              <span>{bookingFeedback}</span>
            </div>
          )}

          {filteredBookings.length === 0 ? (
            <div className="py-8 text-center space-y-2 border-t border-[#2D6A4F]/10">
              <Warehouse className="w-8 h-8 text-[#2D6A4F]/50 mx-auto" />
              <p className="text-sm font-medium text-[#1B2A20]">
                No {bookingFilter === "all" ? "" : bookingFilter} storage
                requests
              </p>
              <p className="text-xs text-[#4A5A4F]">
                Farmer booking requests for your listed warehouses will appear
                here for approval.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#2D6A4F]/10">
              {filteredBookings.map((bk) => (
                <div
                  key={bk.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#4A5A4F]">
                      <span className="font-semibold uppercase text-[#2D6A4F]">
                        {bk.status}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{bk.warehouseName}</span>
                    </div>
                    <p className="font-semibold text-sm text-[#1B2A20]">
                      {bk.farmerName} · {bk.cropType} ({bk.quantity} {bk.unit})
                    </p>
                    <p className="text-xs text-[#4A5A4F] tabular-nums">
                      Starts {bk.startDate} · {bk.durationMonths} mo · Est. Rs.{" "}
                      {bk.estimatedCostInr.toLocaleString("en-IN")}
                    </p>
                    {bk.notes && (
                      <p className="text-xs text-[#4A5A4F] italic">
                        &ldquo;{bk.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {bk.status === "pending" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleBookingDecision(bk.id, "approved")}
                        className="min-h-[40px] px-3.5 rounded-xl bg-[#2D6A4F] hover:bg-[#23543E] text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBookingDecision(bk.id, "rejected")}
                        className="min-h-[40px] px-3.5 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Facility Capacity Controls & Commercial Finance Hub */}
        <div className="lg:col-span-5 space-y-5">
          {/* Owned Facilities List */}
          <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display font-semibold text-base text-[#1B2A20] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#2D6A4F]" />
                <span>My Storage Facilities</span>
              </h2>
              <Link
                to="/warehouses"
                className="text-xs font-semibold text-[#2D6A4F] hover:underline whitespace-nowrap"
              >
                View all
              </Link>
            </div>

            {ownerWarehouses.length === 0 ? (
              <div className="py-4 space-y-3">
                <p className="text-sm text-[#4A5A4F]">
                  You haven&apos;t listed a godown yet. Register your first
                  warehouse to start receiving farmer bookings.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="min-h-[40px] px-4 rounded-xl bg-[#E9A23B] text-[#1B2A20] text-xs font-semibold"
                >
                  Register First Godown
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#2D6A4F]/10">
                {ownerWarehouses.map((wh) => {
                  const usedMt = Math.max(
                    0,
                    wh.totalCapacityMt - wh.availableCapacityMt
                  );
                  const pct =
                    wh.totalCapacityMt > 0
                      ? Math.round((usedMt / wh.totalCapacityMt) * 100)
                      : 0;
                  const isEditing = editingWhId === wh.id;
                  return (
                    <div key={wh.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs text-[#4A5A4F]">
                            {wh.cityState} ·{" "}
                            <span className="font-semibold uppercase text-[#2D6A4F]">
                              {wh.status}
                            </span>
                          </p>
                          <p className="font-semibold text-sm text-[#1B2A20] truncate">
                            {wh.name}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            isEditing
                              ? setEditingWhId(null)
                              : startEditWarehouse(wh)
                          }
                          className="min-h-[34px] px-2.5 rounded-lg border border-[#2D6A4F]/20 text-xs font-semibold text-[#2D6A4F] hover:bg-[#EAF4EE] inline-flex items-center gap-1 shrink-0"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{isEditing ? "Close" : "Edit"}</span>
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-[#4A5A4F] tabular-nums">
                          <span>
                            {wh.availableCapacityMt.toLocaleString("en-IN")} /{" "}
                            {wh.totalCapacityMt.toLocaleString("en-IN")} MT free
                          </span>
                          <span>
                            Rs. {wh.pricePerQuintalMonth}/q/mo
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#FAF8F3] overflow-hidden border border-[#2D6A4F]/10">
                          <div
                            className="h-full bg-[#2D6A4F] rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                          />
                        </div>
                      </div>

                      {isEditing && (
                        <form
                          onSubmit={handleSaveWarehouseEdit}
                          className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/15 space-y-3"
                        >
                          {editError && (
                            <p className="text-xs text-red-700 bg-red-50 p-2 rounded-lg">
                              {editError}
                            </p>
                          )}
                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label
                                htmlFor={`edit-avail-${wh.id}`}
                                className="block text-[11px] font-semibold text-[#4A5A4F] mb-1"
                              >
                                Available MT (max {wh.totalCapacityMt})
                              </label>
                              <input
                                id={`edit-avail-${wh.id}`}
                                type="number"
                                min={0}
                                max={wh.totalCapacityMt}
                                value={editAvailCap}
                                onChange={(e) => setEditAvailCap(e.target.value)}
                                className="w-full h-9 px-2.5 rounded-lg bg-white border border-[#2D6A4F]/25 text-xs tabular-nums"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor={`edit-rate-${wh.id}`}
                                className="block text-[11px] font-semibold text-[#4A5A4F] mb-1"
                              >
                                Rate (Rs./q/mo)
                              </label>
                              <input
                                id={`edit-rate-${wh.id}`}
                                type="number"
                                min={0}
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className="w-full h-9 px-2.5 rounded-lg bg-white border border-[#2D6A4F]/25 text-xs tabular-nums"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <select
                              aria-label="Facility listing status"
                              value={editStatus}
                              onChange={(e) =>
                                setEditStatus(
                                  e.target.value as "active" | "paused"
                                )
                              }
                              className="h-9 px-2.5 rounded-lg bg-white border border-[#2D6A4F]/25 text-xs font-medium"
                            >
                              <option value="active">Active</option>
                              <option value="paused">Paused</option>
                            </select>
                            <button
                              type="submit"
                              disabled={editBusy}
                              className="min-h-[36px] px-4 rounded-lg bg-[#2D6A4F] text-white text-xs font-semibold"
                            >
                              {editBusy ? "Saving..." : "Save Facility"}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Commercial Loans & Insurance Shortcuts */}
          <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-3">
            <h2 className="font-display font-semibold text-base text-[#1B2A20]">
              Commercial Finance &amp; Asset Cover
            </h2>
            <p className="text-xs text-[#4A5A4F]">
              Tailored strictly for warehouse construction, running working
              capital, and land purchase — with commercial facility insurance.
            </p>
            <div className="space-y-2.5 pt-1">
              <Link
                to="/loans"
                className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/15 hover:border-[#2D6A4F] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center shrink-0">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#1B2A20]">
                      Commercial Warehouse Loans
                    </p>
                    <p className="text-xs text-[#4A5A4F]">
                      Godown construction, running overdraft &amp; land purchase
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-1" />
              </Link>

              <Link
                to="/insurance"
                className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/15 hover:border-[#2D6A4F] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#1B2A20]">
                      Facility &amp; Construction Insurance
                    </p>
                    <p className="text-xs text-[#4A5A4F]">
                      Fire &amp; perils, cold-chain machinery, CAR &amp; stock liability
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
