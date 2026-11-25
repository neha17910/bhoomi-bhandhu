import test from "node:test";
import assert from "node:assert/strict";
import { searchPlatformContent } from "./search";

test("searchPlatformContent matches case-insensitively across schemes and insurance", () => {
  const lowerResults = searchPlatformContent("pm-kisan");
  const upperResults = searchPlatformContent("PM-KISAN");
  const mixedResults = searchPlatformContent("Pm-KiSaN");

  assert.ok(lowerResults.length >= 1);
  assert.equal(lowerResults.length, upperResults.length);
  assert.equal(lowerResults.length, mixedResults.length);
  assert.ok(lowerResults.some((item) => item.id === "scheme-pm-kisan"));
});

test("searchPlatformContent finds warehouses and loans by keyword", () => {
  const onionResults = searchPlatformContent("ONION");
  assert.ok(onionResults.some((item) => item.category === "Warehouses"));

  const kccResults = searchPlatformContent("kisan credit");
  assert.ok(kccResults.some((item) => item.category === "Loans"));
});

test("searchPlatformContent respects category filters and empty input", () => {
  assert.deepEqual(searchPlatformContent("   "), []);

  const filtered = searchPlatformContent("crop", [], "Insurance");
  assert.ok(filtered.length >= 1);
  assert.ok(filtered.every((item) => item.category === "Insurance"));
});

test("searchPlatformContent filters out farmer crop/scheme results for warehouse_owner", () => {
  const ownerLoanHits = searchPlatformContent("warehouse", [], "All", "warehouse_owner");
  assert.ok(ownerLoanHits.some((item) => item.category === "Loans"));
  assert.ok(ownerLoanHits.some((item) => item.category === "Insurance"));
  assert.ok(!ownerLoanHits.some((item) => item.id === "loan-kcc-crop-loan"));
  assert.ok(!ownerLoanHits.some((item) => item.id === "insurance-pmfby-plan"));

  const ownerSchemeHits = searchPlatformContent("pm-kisan", [], "All", "warehouse_owner");
  assert.ok(!ownerSchemeHits.some((item) => item.category === "Schemes"));
});
