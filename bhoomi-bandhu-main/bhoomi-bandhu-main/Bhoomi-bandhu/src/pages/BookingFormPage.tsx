import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  calculateEstimatedStorageCost,
  type StorageUnit,
} from "../utils/cropAdvisor";

const CROP_OPTIONS = [
  "Wheat",
  "Rice (Paddy)",
  "Onion",
  "Potato",
  "Soybean",
  "Chickpea (Chana)",
  "Cotton",
  "Groundnut",
  "Maize",
];

export function BookingFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, warehouses, createWarehouseBooking } = useAuth();

  const warehouse = warehouses.find((w) => w.id === id);

  const [cropType, setCropType] = useState("Wheat");
  const [quantity, setQuantity] = useState("25");
  const [unit, setUnit] = useState<StorageUnit>("quintal");
  const [startDate, setStartDate] = useState("2026-12-01");
  const [durationMonths, setDurationMonths] = useState("3");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!warehouse) {
    return (
      <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-8 text-center">
        <p className="font-semibold">Warehouse not found.</p>
        <Link to="/warehouses" className="text-sm text-[#2D6A4F] underline">
          Return to Warehouses
        </Link>
      </div>
    );
  }

  const numericQty = Number(quantity);
  const numericMonths = Number(durationMonths);
  const estimatedCost = calculateEstimatedStorageCost(
    numericQty,
    unit,
    numericMonths,
    warehouse.pricePerQuintalMonth
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!Number.isFinite(numericQty) || numericQty <= 0) {
      setError("Please enter a valid crop quantity greater than 0.");
      return;
    }
    if (!startDate) {
      setError("Please choose a start date.");
      return;
    }

    setSubmitting(true);
    try {
      await createWarehouseBooking({
        warehouse,
        cropType,
        quantity: numericQty,
        unit,
        startDate,
        durationMonths: numericMonths,
        estimatedCostInr: estimatedCost,
        notes,
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit booking request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-2xl border border-[#2D6A4F]/15 p-8 text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-[#2D6A4F] mx-auto" />
        <h1 className="text-2xl font-display font-bold text-[#1B2A20]">
          Booking Request Sent
        </h1>
        <p className="text-sm text-[#4A5A4F]">
          Your storage request for {numericQty} {unit} of {cropType} at{" "}
          <strong>{warehouse.name}</strong> has been saved. You can track its
          status anytime in your Profile.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/profile"
            className="min-h-[44px] px-6 rounded-xl bg-[#E9A23B] text-[#1B2A20] font-semibold text-sm inline-flex items-center justify-center"
          >
            View My Bookings
          </Link>
          <Link
            to="/warehouses"
            className="min-h-[44px] px-6 rounded-xl border border-[#2D6A4F] text-[#2D6A4F] font-semibold text-sm inline-flex items-center justify-center"
          >
            Back to Storage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="min-h-[44px] min-w-[44px] rounded-xl bg-white border border-[#2D6A4F]/20 flex items-center justify-center text-[#2D6A4F]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <p className="text-xs font-semibold text-[#2D6A4F]">
            {warehouse.name} · {warehouse.cityState}
          </p>
          <h1 className="text-2xl font-display font-bold text-[#1B2A20]">
            Book Storage Space
          </h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-6 space-y-5"
      >
        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="bk-crop"
            className="block text-sm font-medium text-[#1B2A20] mb-1.5"
          >
            Crop Type
          </label>
          <select
            id="bk-crop"
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-base"
          >
            {CROP_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="bk-qty"
              className="block text-sm font-medium text-[#1B2A20] mb-1.5"
            >
              Quantity
            </label>
            <input
              id="bk-qty"
              type="number"
              min="1"
              step="0.5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-base tabular-nums"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-[#1B2A20] mb-1.5">Unit</p>
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#F2EFE6] rounded-xl h-12">
              {(["kg", "quintal", "ton"] as StorageUnit[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`rounded-lg text-sm font-semibold capitalize transition-colors ${
                    unit === u
                      ? "bg-white text-[#2D6A4F] shadow-sm"
                      : "text-[#4A5A4F]"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="bk-start"
              className="block text-sm font-medium text-[#1B2A20] mb-1.5"
            >
              Start Date
            </label>
            <input
              id="bk-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-base"
            />
          </div>

          <div>
            <label
              htmlFor="bk-duration"
              className="block text-sm font-medium text-[#1B2A20] mb-1.5"
            >
              Duration
            </label>
            <select
              id="bk-duration"
              value={durationMonths}
              onChange={(e) => setDurationMonths(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-base"
            >
              {[1, 2, 3, 6, 9, 12].map((m) => (
                <option key={m} value={m}>
                  {m} {m === 1 ? "month" : "months"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="bk-notes"
            className="block text-sm font-medium text-[#1B2A20] mb-1.5"
          >
            Notes (Optional)
          </label>
          <textarea
            id="bk-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Packed in 50 kg gunny bags, morning unloading preferred"
            className="w-full p-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
          />
        </div>

        <div className="p-4 rounded-xl bg-[#EAF4EE] border border-[#2D6A4F]/15 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#2D6A4F]">
              Estimated Total Cost
            </p>
            <p className="text-xs text-[#4A5A4F]">
              Rate: Rs. {warehouse.pricePerQuintalMonth} / quintal / month
            </p>
          </div>
          <p className="text-2xl font-display font-bold text-[#1B2A20] tabular-nums">
            Rs. {estimatedCost.toLocaleString("en-IN")}
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[48px] rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] disabled:opacity-60 text-[#1B2A20] font-semibold text-base transition-colors"
        >
          {submitting
            ? "Submitting..."
            : user
            ? "Submit Request"
            : "Sign In to Submit Request"}
        </button>
      </form>
    </div>
  );
}
