import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  List,
  MapPin,
  Plus,
  Search,
  Star,
  Warehouse,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { INDIAN_STATES } from "../data/bhoomiData";
import { filterWarehousesForRegion } from "../utils/warehouseFilter";

export function WarehousesPage() {
  const {
    user,
    profile,
    warehouses,
    ownerIncomingBookings,
    updateBookingStatus,
    createWarehouseListing,
    updateWarehouseListing,
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>(
    profile?.state?.trim() || "All India"
  );
  const [userEditedRegion, setUserEditedRegion] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedPinId, setSelectedPinId] = useState<string>(
    warehouses[0]?.id || ""
  );
  const [activeTab, setActiveTab] = useState<"discover" | "owner">(
    profile?.role === "warehouse_owner" ? "owner" : "discover"
  );

  useEffect(() => {
    if (profile?.role === "warehouse_owner") {
      setActiveTab("owner");
    }
  }, [profile?.role]);

  useEffect(() => {
    if (!userEditedRegion && profile?.state?.trim()) {
      setRegionFilter(profile.state.trim());
    }
  }, [profile?.state, userEditedRegion]);

  // Owner add warehouse form
  const [showAddForm, setShowAddForm] = useState(false);
  const [whName, setWhName] = useState("");
  const [whCity, setWhCity] = useState("");
  const [whTotalCap, setWhTotalCap] = useState("1000");
  const [whAvailCap, setWhAvailCap] = useState("600");
  const [whPrice, setWhPrice] = useState("22");
  const [whDesc, setWhDesc] = useState("");
  const [whSaving, setWhSaving] = useState(false);
  const [whError, setWhError] = useState("");

  const filteredWarehouses = useMemo(
    () =>
      filterWarehousesForRegion({
        warehouses,
        farmerState: profile?.state || "",
        regionFilter,
        searchQuery,
      }),
    [warehouses, profile?.state, regionFilter, searchQuery]
  );

  const selectedPinWarehouse =
    filteredWarehouses.find((w) => w.id === selectedPinId) ||
    filteredWarehouses[0];

  const handleAddWarehouse = async (e: React.FormEvent) => {
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
        facilities: ["Dry Grain Storage", "24x7 Security", "Loading Dock"],
        description:
          whDesc.trim() || "Clean agricultural storage facility for farmers.",
      });
      setWhName("");
      setWhCity("");
      setWhDesc("");
      setShowAddForm(false);
    } catch (err) {
      setWhError(err instanceof Error ? err.message : "Could not add warehouse.");
    } finally {
      setWhSaving(false);
    }
  };

  const isOwner = profile?.role === "warehouse_owner";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1B2A20]">
            {isOwner
              ? "My Warehouses & Farmer Bookings"
              : "Find Storage Near You"}
          </h1>
          <p className="text-sm text-[#4A5A4F] mt-1">
            {isOwner
              ? "Publish storage bays, toggle listing status, and approve incoming farmer requests."
              : "Compare grain & cold storage godowns, capacity, and monthly rates."}
          </p>
        </div>

        {isOwner && (
          <div className="flex items-center gap-1 p-1 bg-[#F2EFE6] rounded-xl self-start">
            <button
              type="button"
              onClick={() => setActiveTab("discover")}
              className={`min-h-[40px] px-4 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === "discover"
                  ? "bg-white text-[#1B2A20] shadow-sm"
                  : "text-[#4A5A4F]"
              }`}
            >
              Market Directory
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("owner")}
              className={`min-h-[40px] px-4 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === "owner"
                  ? "bg-white text-[#1B2A20] shadow-sm"
                  : "text-[#4A5A4F]"
              }`}
            >
              My Warehouses
            </button>
          </div>
        )}
      </div>

      {activeTab === "owner" && isOwner ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-[#1B2A20]">
              My Listed Warehouses & Requests
            </h2>
            <button
              type="button"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-sm inline-flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? "Cancel" : "Add Warehouse"}</span>
            </button>
          </div>

          {showAddForm && (
            <form
              onSubmit={handleAddWarehouse}
              className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-6 space-y-4"
            >
              <h3 className="font-display font-semibold text-base">
                New Warehouse Listing
              </h3>
              {whError && (
                <p className="text-sm text-red-700 bg-red-50 p-3 rounded-xl">
                  {whError}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Warehouse Name
                  </label>
                  <input
                    type="text"
                    value={whName}
                    onChange={(e) => setWhName(e.target.value)}
                    placeholder="e.g. Doaba Kisan Cold Store"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    City & State
                  </label>
                  <input
                    type="text"
                    value={whCity}
                    onChange={(e) => setWhCity(e.target.value)}
                    placeholder="e.g. Jalandhar, Punjab"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Total Capacity (MT)
                  </label>
                  <input
                    type="number"
                    value={whTotalCap}
                    onChange={(e) => setWhTotalCap(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Available Capacity (MT)
                  </label>
                  <input
                    type="number"
                    value={whAvailCap}
                    onChange={(e) => setWhAvailCap(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price (Rs. / Quintal / Month)
                  </label>
                  <input
                    type="number"
                    value={whPrice}
                    onChange={(e) => setWhPrice(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm tabular-nums"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Facility Description
                </label>
                <textarea
                  rows={2}
                  value={whDesc}
                  onChange={(e) => setWhDesc(e.target.value)}
                  placeholder="Describe loading bay, moisture control, or crop specialties..."
                  className="w-full p-3 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={whSaving}
                className="min-h-[44px] px-6 rounded-xl bg-[#E9A23B] text-[#1B2A20] font-semibold text-sm"
              >
                {whSaving ? "Publishing..." : "Publish Warehouse"}
              </button>
            </form>
          )}

          <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-4">
            <h3 className="font-display font-semibold text-base">
              Incoming Booking Requests
            </h3>
            {ownerIncomingBookings.length === 0 ? (
              <p className="text-sm text-[#4A5A4F]">
                No incoming farmer storage requests yet for your warehouses.
              </p>
            ) : (
              <div className="divide-y divide-[#2D6A4F]/10">
                {ownerIncomingBookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold text-sm text-[#1B2A20]">
                        {bk.farmerName} · {bk.cropType} ({bk.quantity} {bk.unit})
                      </p>
                      <p className="text-xs text-[#4A5A4F] mt-0.5 tabular-nums">
                        {bk.warehouseName} · {bk.durationMonths} mo from{" "}
                        {bk.startDate} · Est. Rs. {bk.estimatedCostInr} · Status:{" "}
                        <strong className="uppercase">{bk.status}</strong>
                      </p>
                    </div>
                    {bk.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(bk.id, "approved")}
                          className="min-h-[40px] px-3.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(bk.id, "rejected")}
                          className="min-h-[40px] px-3.5 rounded-xl border border-red-300 text-red-700 text-xs font-semibold inline-flex items-center gap-1"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warehouses
              .filter((w) => w.ownerId === user?.uid)
              .map((w) => (
                <div
                  key={w.id}
                  className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#2D6A4F]">
                      {w.status}
                    </p>
                    <p className="font-semibold text-base text-[#1B2A20] mt-0.5">
                      {w.name}
                    </p>
                    <p className="text-xs text-[#4A5A4F] mt-0.5">{w.cityState}</p>
                    <p className="text-sm text-[#1B2A20] mt-2 tabular-nums">
                      {w.availableCapacityMt.toLocaleString("en-IN")} /{" "}
                      {w.totalCapacityMt.toLocaleString("en-IN")} MT available ·
                      Rs. {w.pricePerQuintalMonth}/quintal/mo
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateWarehouseListing({
                        warehouseId: w.id,
                        availableCapacityMt: w.availableCapacityMt,
                        pricePerQuintalMonth: w.pricePerQuintalMonth,
                        status: w.status === "active" ? "paused" : "active",
                      })
                    }
                    className="min-h-[36px] px-3 rounded-xl border border-[#2D6A4F]/25 text-xs font-semibold text-[#2D6A4F] hover:bg-[#EAF4EE] shrink-0 whitespace-nowrap"
                  >
                    {w.status === "active" ? "Pause" : "Activate"}
                  </button>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <>
          {/* Search + Region Filter + List/Map Toggle */}
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <label htmlFor="warehouse-search" className="sr-only">
                  Search warehouses by city, name, or facility
                </label>
                <MapPin className="w-5 h-5 text-[#2D6A4F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="warehouse-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by city, crop facility (e.g. Wheat, Cold Storage)..."
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-white border border-[#2D6A4F]/20 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="warehouse-region-filter" className="sr-only">
                  Filter warehouses by state
                </label>
                <select
                  id="warehouse-region-filter"
                  value={regionFilter}
                  onChange={(e) => {
                    setUserEditedRegion(true);
                    setRegionFilter(e.target.value);
                  }}
                  className="h-12 px-3.5 rounded-xl bg-white border border-[#2D6A4F]/20 text-sm font-medium text-[#1B2A20] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st === "All India" ? "All India" : st}
                    </option>
                  ))}
                  {regionFilter &&
                    regionFilter !== "All India" &&
                    !INDIAN_STATES.includes(regionFilter) && (
                      <option value={regionFilter}>{regionFilter}</option>
                    )}
                </select>

                <div className="flex items-center gap-1 p-1 bg-[#F2EFE6] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`min-h-[40px] px-4 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5 transition-colors ${
                      viewMode === "list"
                        ? "bg-white text-[#1B2A20] shadow-sm"
                        : "text-[#4A5A4F]"
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span>List</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("map")}
                    className={`min-h-[40px] px-4 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5 transition-colors ${
                      viewMode === "map"
                        ? "bg-white text-[#1B2A20] shadow-sm"
                        : "text-[#4A5A4F]"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Map</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#4A5A4F]">
              <span>
                {regionFilter === "All India"
                  ? `Showing ${filteredWarehouses.length} active storage facilities across India`
                  : `Showing ${filteredWarehouses.length} nearby storage ${
                      filteredWarehouses.length === 1 ? "facility" : "facilities"
                    } in ${regionFilter}`}
              </span>
              {regionFilter !== "All India" && (
                <button
                  type="button"
                  onClick={() => {
                    setUserEditedRegion(true);
                    setRegionFilter("All India");
                  }}
                  className="font-semibold text-[#2D6A4F] hover:underline"
                >
                  Browse other states
                </button>
              )}
            </div>
          </div>

          {filteredWarehouses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-8 text-center space-y-3">
              <Warehouse className="w-10 h-10 text-[#2D6A4F]/60 mx-auto" />
              <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
                No storage facilities matched in {regionFilter}
              </h2>
              <p className="text-sm text-[#4A5A4F] max-w-md mx-auto">
                No listed godowns matched your current search or state filter. You
                can expand to nearby states across India or clear your search text.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {regionFilter !== "All India" && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserEditedRegion(true);
                      setRegionFilter("All India");
                    }}
                    className="min-h-[40px] px-4 rounded-xl bg-[#2D6A4F] text-white text-xs font-semibold"
                  >
                    Show All India Warehouses
                  </button>
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="min-h-[40px] px-4 rounded-xl border border-[#2D6A4F]/25 text-[#2D6A4F] text-xs font-semibold"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          ) : viewMode === "list" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWarehouses.map((wh) => (
                <Link
                  key={wh.id}
                  to={`/warehouses/${wh.id}`}
                  className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 hover:border-[#2D6A4F] transition-colors flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-[#4A5A4F]">
                          {wh.cityState} · {wh.distanceKm} km away
                        </p>
                        <h2 className="font-display font-semibold text-lg text-[#1B2A20] mt-0.5">
                          {wh.name}
                        </h2>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B2A20] tabular-nums shrink-0">
                        <Star className="w-4 h-4 text-[#E9A23B] fill-[#E9A23B]" />
                        {wh.rating.toFixed(1)}
                      </span>
                    </div>

                    <p className="text-sm text-[#4A5A4F] mt-2 line-clamp-2">
                      {wh.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#2D6A4F]/10 flex items-center justify-between text-sm">
                    <span className="text-[#4A5A4F] tabular-nums">
                      {wh.availableCapacityMt} MT free
                    </span>
                    <span className="font-semibold text-[#2D6A4F] tabular-nums">
                      Rs. {wh.pricePerQuintalMonth}/quintal/mo
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 overflow-hidden">
              {/* Stylized Interactive Regional Map */}
              <div className="relative h-80 md:h-96 bg-[#EAF4EE] p-4">
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
                  aria-hidden="true"
                >
                  <path
                    d="M15,20 Q45,10 75,30 T85,80 Q50,95 25,75 T15,20"
                    fill="#DCECE2"
                    stroke="#2D6A4F"
                    strokeWidth="0.6"
                  />
                  <line x1="0" y1="35" x2="100" y2="35" stroke="#2D6A4F" strokeDasharray="2 2" strokeWidth="0.4" />
                  <line x1="0" y1="65" x2="100" y2="65" stroke="#2D6A4F" strokeDasharray="2 2" strokeWidth="0.4" />
                  <line x1="50" y1="0" x2="50" y2="100" stroke="#2D6A4F" strokeDasharray="2 2" strokeWidth="0.4" />
                </svg>

                <div className="relative z-10 flex items-center justify-between text-xs text-[#2D6A4F] font-semibold">
                  <span>Regional Storage Pin View (Illustrative Locations)</span>
                  <Search className="w-4 h-4" />
                </div>

                {filteredWarehouses.map((wh) => {
                  const isSelected = selectedPinWarehouse?.id === wh.id;
                  return (
                    <button
                      key={wh.id}
                      type="button"
                      onClick={() => setSelectedPinId(wh.id)}
                      style={{ left: `${wh.mapX}%`, top: `${wh.mapY}%` }}
                      aria-label={`Select ${wh.name} in ${wh.cityState}`}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm transition-transform ${
                        isSelected
                          ? "bg-[#E9A23B] text-[#1B2A20] scale-110 z-20"
                          : "bg-[#2D6A4F] text-white hover:scale-105 z-10"
                      }`}
                    >
                      <Warehouse className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden sm:inline whitespace-nowrap">
                        Rs. {wh.pricePerQuintalMonth}/q
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedPinWarehouse && (
                <div className="p-5 border-t border-[#2D6A4F]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-[#4A5A4F]">
                      {selectedPinWarehouse.cityState} ·{" "}
                      {selectedPinWarehouse.availableCapacityMt} MT available
                    </p>
                    <h3 className="font-display font-semibold text-lg text-[#1B2A20]">
                      {selectedPinWarehouse.name}
                    </h3>
                    <p className="text-sm font-semibold text-[#2D6A4F] tabular-nums">
                      Rs. {selectedPinWarehouse.pricePerQuintalMonth} per quintal /
                      month
                    </p>
                  </div>
                  <Link
                    to={`/warehouses/${selectedPinWarehouse.id}`}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-sm inline-flex items-center justify-center whitespace-nowrap"
                  >
                    View & Request Booking
                  </Link>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
