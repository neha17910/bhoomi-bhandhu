import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Star,
  Warehouse,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function WarehouseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { warehouses } = useAuth();

  const warehouse = warehouses.find((w) => w.id === id);

  if (!warehouse) {
    return (
      <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-8 text-center space-y-4">
        <h1 className="text-xl font-display font-bold">Warehouse not found</h1>
        <Link
          to="/warehouses"
          className="text-sm font-semibold text-[#2D6A4F] hover:underline"
        >
          Back to Warehouses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="relative rounded-2xl overflow-hidden border border-[#2D6A4F]/15 bg-[#EAF4EE] h-52 md:h-72">
        <img
          src="/src/assets/images/warehouse_grain_1795276858464.jpg"
          alt={warehouse.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back to warehouse list"
          className="absolute top-4 left-4 min-h-[44px] min-w-[44px] rounded-xl bg-white/95 text-[#1B2A20] flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#4A5A4F]">
            <MapPin className="w-4 h-4 text-[#2D6A4F]" />
            <span>{warehouse.cityState}</span>
            <span aria-hidden="true">·</span>
            <span>{warehouse.distanceKm} km away</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1B2A20] mt-1">
            {warehouse.name}
          </h1>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-[#1B2A20] tabular-nums">
          <Star className="w-4 h-4 text-[#E9A23B] fill-[#E9A23B]" />
          <span>{warehouse.rating.toFixed(1)} rating</span>
        </div>
      </div>

      <p className="text-base text-[#4A5A4F] leading-relaxed">
        {warehouse.description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5">
          <div className="flex items-center gap-2 text-[#2D6A4F] mb-2">
            <Warehouse className="w-5 h-5" />
            <h2 className="font-semibold text-sm text-[#1B2A20]">
              Available Capacity
            </h2>
          </div>
          <p className="text-xl font-display font-bold text-[#1B2A20] tabular-nums">
            {warehouse.availableCapacityMt} MT
          </p>
          <p className="text-xs text-[#4A5A4F] mt-1 tabular-nums">
            of {warehouse.totalCapacityMt} MT total capacity
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5">
          <div className="flex items-center gap-2 text-[#2D6A4F] mb-2">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="font-semibold text-sm text-[#1B2A20]">Pricing</h2>
          </div>
          <p className="text-xl font-display font-bold text-[#2D6A4F] tabular-nums">
            Rs. {warehouse.pricePerQuintalMonth}
          </p>
          <p className="text-xs text-[#4A5A4F] mt-1">per quintal / month</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5">
          <h2 className="font-semibold text-sm text-[#1B2A20] mb-2">
            Facilities
          </h2>
          <ul className="space-y-1.5 text-xs text-[#4A5A4F]">
            {warehouse.facilities.map((fac) => (
              <li key={fac} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                <span>{fac}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-2">
        <Link
          to={`/warehouses/${warehouse.id}/book`}
          className="w-full sm:w-auto min-h-[48px] px-8 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-base inline-flex items-center justify-center transition-colors"
        >
          Request Booking
        </Link>
      </div>
    </div>
  );
}
