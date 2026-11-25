import test from "node:test";
import assert from "node:assert/strict";
import { evaluateSchemeEligibility } from "./eligibility";

test("evaluateSchemeEligibility excludes PM-KISAN for tenant farmers without ownership", () => {
  const matches = evaluateSchemeEligibility({
    state: "Punjab",
    landTier: "small",
    farmerType: "tenant",
    primaryNeed: "all",
  });

  assert.equal(
    matches.some((s) => s.id === "pm-kisan"),
    false
  );
  assert.ok(matches.some((s) => s.id === "pmfby"));
});

test("evaluateSchemeEligibility filters by primaryNeed and land size limit", () => {
  const equipmentLarge = evaluateSchemeEligibility({
    state: "Maharashtra",
    landTier: "large",
    farmerType: "owner",
    primaryNeed: "equipment",
  });

  assert.ok(equipmentLarge.some((s) => s.id === "pm-kusum"));
  // PMKSY micro-irrigation capped at 12 acres in profile matcher
  assert.equal(
    equipmentLarge.some((s) => s.id === "pmksy-drip"),
    false
  );
});
