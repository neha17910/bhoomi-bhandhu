import type { BookingRecord } from "../context/AuthContext";
import type { WarehouseItem } from "../data/bhoomiData";

export interface WarehousePortfolioMetrics {
  totalFacilities: number;
  activeFacilities: number;
  pausedFacilities: number;
  totalCapacityMt: number;
  availableCapacityMt: number;
  occupiedCapacityMt: number;
  occupancyPercent: number;
  pendingBookingsCount: number;
  approvedBookingsCount: number;
  confirmedRevenueInr: number;
  pendingPipelineInr: number;
}

export function computeWarehousePortfolioMetrics(
  ownerWarehouses: WarehouseItem[],
  bookings: BookingRecord[]
): WarehousePortfolioMetrics {
  const totalFacilities = ownerWarehouses.length;
  const activeFacilities = ownerWarehouses.filter(
    (w) => w.status === "active"
  ).length;
  const pausedFacilities = totalFacilities - activeFacilities;

  const totalCapacityMt = ownerWarehouses.reduce(
    (sum, w) => sum + Math.max(0, Number(w.totalCapacityMt) || 0),
    0
  );
  const availableCapacityMt = ownerWarehouses.reduce(
    (sum, w) =>
      sum +
      Math.min(
        Math.max(0, Number(w.totalCapacityMt) || 0),
        Math.max(0, Number(w.availableCapacityMt) || 0)
      ),
    0
  );
  const occupiedCapacityMt = Math.max(0, totalCapacityMt - availableCapacityMt);
  const occupancyPercent =
    totalCapacityMt > 0
      ? Math.round((occupiedCapacityMt / totalCapacityMt) * 100)
      : 0;

  let pendingBookingsCount = 0;
  let approvedBookingsCount = 0;
  let confirmedRevenueInr = 0;
  let pendingPipelineInr = 0;

  for (const bk of bookings) {
    const cost = Math.max(0, Number(bk.estimatedCostInr) || 0);
    if (bk.status === "pending") {
      pendingBookingsCount += 1;
      pendingPipelineInr += cost;
    } else if (bk.status === "approved") {
      approvedBookingsCount += 1;
      confirmedRevenueInr += cost;
    }
  }

  return {
    totalFacilities,
    activeFacilities,
    pausedFacilities,
    totalCapacityMt,
    availableCapacityMt,
    occupiedCapacityMt,
    occupancyPercent,
    pendingBookingsCount,
    approvedBookingsCount,
    confirmedRevenueInr,
    pendingPipelineInr,
  };
}

export function validateWarehouseUpdateInput(input: {
  totalCapacityMt: number;
  availableCapacityMt: number;
  pricePerQuintalMonth: number;
}): { valid: boolean; error?: string } {
  if (!Number.isFinite(input.totalCapacityMt) || input.totalCapacityMt <= 0) {
    return {
      valid: false,
      error: "Total capacity must be greater than 0 MT.",
    };
  }
  if (
    !Number.isFinite(input.availableCapacityMt) ||
    input.availableCapacityMt < 0 ||
    input.availableCapacityMt > input.totalCapacityMt
  ) {
    return {
      valid: false,
      error: "Available capacity must be between 0 and total capacity.",
    };
  }
  if (
    !Number.isFinite(input.pricePerQuintalMonth) ||
    input.pricePerQuintalMonth < 0
  ) {
    return {
      valid: false,
      error: "Monthly rate must be 0 or greater.",
    };
  }
  return { valid: true };
}
