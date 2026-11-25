import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateEstimatedStorageCost,
  convertToQuintals,
  estimateMonthlyRainfallMm,
  inferRegionalSoilDefaults,
  recommendCrops,
} from "./cropAdvisor";

test("recommendCrops suggests Rice for warm, humid, high-rainfall alluvial profile", () => {
  const result = recommendCrops({
    soilType: "Alluvial",
    nitrogen: 90,
    phosphorus: 45,
    potassium: 42,
    temperatureC: 26,
    humidityPct: 82,
    rainfallMm: 210,
    ph: 6.4,
  });

  assert.equal(result.primary.crop.name, "Rice (Paddy)");
  assert.equal(result.alternatives.length, 3);
  assert.ok(result.disclaimer.includes("not a guarantee"));
});

test("recommendCrops suggests Wheat for cool Rabi alluvial profile", () => {
  const result = recommendCrops({
    soilType: "Alluvial",
    nitrogen: 85,
    phosphorus: 50,
    potassium: 40,
    temperatureC: 18,
    humidityPct: 55,
    rainfallMm: 70,
    ph: 6.9,
  });

  assert.equal(result.primary.crop.name, "Wheat");
});

test("storage unit conversion and cost estimation calculate accurately", () => {
  assert.equal(convertToQuintals(500, "kg"), 5);
  assert.equal(convertToQuintals(2, "ton"), 20);
  assert.equal(convertToQuintals(10, "quintal"), 10);

  assert.equal(calculateEstimatedStorageCost(10, "quintal", 3, 20), 600);
  assert.equal(calculateEstimatedStorageCost(2, "ton", 2, 25), 1000);
  assert.equal(calculateEstimatedStorageCost(0, "kg", 2, 25), 0);
});

test("inferRegionalSoilDefaults maps Indian states to representative soil profiles", () => {
  assert.equal(inferRegionalSoilDefaults("Maharashtra").soilType, "Black Cotton");
  assert.equal(inferRegionalSoilDefaults("Rajasthan").soilType, "Sandy Loam");
  assert.equal(inferRegionalSoilDefaults("Karnataka").soilType, "Red Loam");
  assert.equal(inferRegionalSoilDefaults("Punjab").soilType, "Alluvial");
});

test("estimateMonthlyRainfallMm scales precipitation window to 30-day equivalent", () => {
  assert.equal(estimateMonthlyRainfallMm([7, 7, 7], 21), 30);
  assert.equal(estimateMonthlyRainfallMm([], 21), 0);
});
