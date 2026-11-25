import test from "node:test";
import assert from "node:assert/strict";
import {
  computeWarehousePortfolioMetrics,
  validateWarehouseUpdateInput,
} from "./warehouseDashboard";
import type { WarehouseItem } from "../data/bhoomiData";
import type { BookingRecord } from "../context/AuthContext";

const SAMPLE_WAREHOUSES: WarehouseItem[] = [
  {
    id: "w1",
    ownerId: "owner-1",
    name: "Rajkot Hub",
    cityState: "Rajkot, Gujarat",
    distanceKm: 5,
    totalCapacityMt: 2000,
    availableCapacityMt: 500,
    pricePerQuintalMonth: 20,
    rating: 4.7,
    facilities: ["Dry Grain Storage"],
    description: "Main bay",
    status: "active",
    mapX: 20,
    mapY: 50,
  },
  {
    id: "w2",
    ownerId: "owner-1",
    name: "Morbi Cold Store",
    cityState: "Morbi, Gujarat",
    distanceKm: 12,
    totalCapacityMt: 1000,
    availableCapacityMt: 1000,
    pricePerQuintalMonth: 35,
    rating: 4.5,
    facilities: ["Cold Storage"],
    description: "Cold bay",
    status: "paused",
    mapX: 22,
    mapY: 48,
  },
];

const SAMPLE_BOOKINGS: BookingRecord[] = [
  {
    id: "b1",
    farmerId: "f1",
    farmerName: "Farmer A",
    warehouseId: "w1",
    warehouseOwnerId: "owner-1",
    warehouseName: "Rajkot Hub",
    cropType: "Groundnut",
    quantity: 40,
    unit: "quintal",
    startDate: "2026-06-01",
    durationMonths: 2,
    estimatedCostInr: 1600,
    status: "pending",
  },
  {
    id: "b2",
    farmerId: "f2",
    farmerName: "Farmer B",
    warehouseId: "w1",
    warehouseOwnerId: "owner-1",
    warehouseName: "Rajkot Hub",
    cropType: "Cotton",
    quantity: 100,
    unit: "quintal",
    startDate: "2026-05-15",
    durationMonths: 3,
    estimatedCostInr: 6000,
    status: "approved",
  },
  {
    id: "b3",
    farmerId: "f3",
    farmerName: "Farmer C",
    warehouseId: "w1",
    warehouseOwnerId: "owner-1",
    warehouseName: "Rajkot Hub",
    cropType: "Wheat",
    quantity: 20,
    unit: "quintal",
    startDate: "2026-05-10",
    durationMonths: 1,
    estimatedCostInr: 400,
    status: "rejected",
  },
];

test("computeWarehousePortfolioMetrics calculates capacity utilization, counts, and revenue", () => {
  const metrics = computeWarehousePortfolioMetrics(
    SAMPLE_WAREHOUSES,
    SAMPLE_BOOKINGS
  );
  assert.equal(metrics.totalFacilities, 2);
  assert.equal(metrics.activeFacilities, 1);
  assert.equal(metrics.pausedFacilities, 1);
  assert.equal(metrics.totalCapacityMt, 3000);
  assert.equal(metrics.availableCapacityMt, 1500);
  assert.equal(metrics.occupiedCapacityMt, 1500);
  assert.equal(metrics.occupancyPercent, 50);
  assert.equal(metrics.pendingBookingsCount, 1);
  assert.equal(metrics.approvedBookingsCount, 1);
  assert.equal(metrics.confirmedRevenueInr, 6000);
  assert.equal(metrics.pendingPipelineInr, 1600);
});

test("validateWarehouseUpdateInput rejects invalid capacity bounds or negative prices", () => {
  assert.equal(
    validateWarehouseUpdateInput({
      totalCapacityMt: 1000,
      availableCapacityMt: 1200,
      pricePerQuintalMonth: 20,
    }).valid,
    false
  );
  assert.equal(
    validateWarehouseUpdateInput({
      totalCapacityMt: 1000,
      availableCapacityMt: 400,
      pricePerQuintalMonth: -5,
    }).valid,
    false
  );
  assert.equal(
    validateWarehouseUpdateInput({
      totalCapacityMt: 1000,
      availableCapacityMt: 400,
      pricePerQuintalMonth: 22,
    }).valid,
    true
  );
});
