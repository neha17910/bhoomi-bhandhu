import test from "node:test";
import assert from "node:assert/strict";
import { SEEDED_WAREHOUSES } from "../data/bhoomiData.ts";
import {
  extractWarehouseState,
  filterWarehousesForRegion,
  matchesWarehouseState,
} from "./warehouseFilter.ts";

test("extractWarehouseState parses state name from city, state strings", () => {
  assert.equal(extractWarehouseState("Ludhiana, Punjab"), "Punjab");
  assert.equal(extractWarehouseState("Nashik, Maharashtra"), "Maharashtra");
  assert.equal(extractWarehouseState(""), "");
});

test("matchesWarehouseState matches exact state case-insensitively", () => {
  assert.equal(matchesWarehouseState("Ludhiana, Punjab", "punjab"), true);
  assert.equal(matchesWarehouseState("Nashik, Maharashtra", "Punjab"), false);
  assert.equal(matchesWarehouseState("Indore, Madhya Pradesh", "All India"), true);
});

test("filterWarehousesForRegion shows only Punjab warehouses when regionFilter is Punjab", () => {
  const results = filterWarehousesForRegion({
    warehouses: SEEDED_WAREHOUSES,
    farmerState: "Punjab",
    regionFilter: "Punjab",
    searchQuery: "",
  });

  assert.ok(results.length >= 1);
  assert.ok(
    results.every((w) => matchesWarehouseState(w.cityState, "Punjab")),
    "All returned warehouses should belong to Punjab"
  );
  // Sorted closest first
  for (let i = 1; i < results.length; i++) {
    assert.ok(results[i - 1].distanceKm <= results[i].distanceKm);
  }
});

test("filterWarehousesForRegion prioritizes farmer state first when viewing All India", () => {
  const results = filterWarehousesForRegion({
    warehouses: SEEDED_WAREHOUSES,
    farmerState: "Punjab",
    regionFilter: "All India",
    searchQuery: "",
  });

  assert.ok(results.length >= 2);
  assert.equal(matchesWarehouseState(results[0].cityState, "Punjab"), true);
});
