import test from "node:test";
import assert from "node:assert/strict";
import {
  createLocalAuthRecord,
  normalizeAuthEmail,
  sanitizePublicSignupRole,
  toSessionCredential,
  verifyLocalAuthRecord,
} from "./appAuth";

test("normalizeAuthEmail trims whitespace and lowercases email", () => {
  assert.equal(
    normalizeAuthEmail("  Rajesh.Farm@Example.IN "),
    "rajesh.farm@example.in"
  );
});

test("sanitizePublicSignupRole restricts public signups to farmer, warehouse_owner, or psychiatrist", () => {
  assert.equal(sanitizePublicSignupRole("farmer"), "farmer");
  assert.equal(sanitizePublicSignupRole("warehouse_owner"), "warehouse_owner");
  assert.equal(sanitizePublicSignupRole("psychiatrist"), "psychiatrist");
  assert.equal(sanitizePublicSignupRole("support_staff"), "farmer");
});

test("createLocalAuthRecord and verifyLocalAuthRecord validate matching and non-matching passwords", async () => {
  const record = await createLocalAuthRecord(
    {
      id: "local-farmer-1",
      role: "farmer",
      label: "Farmer",
      badge: "Farmer",
      name: "Rajesh Deshmukh",
      email: "Rajesh@Farm.in",
      state: "Maharashtra",
      district: "Nashik",
      phone: "",
      landSizeAcres: 2.5,
      primaryCrops: ["Wheat"],
      summary: "Registered BhoomiBandhu account.",
    },
    "KisanPass@123"
  );

  assert.equal(record.credential.email, "rajesh@farm.in");
  assert.equal(await verifyLocalAuthRecord(record, "KisanPass@123"), true);
  assert.equal(await verifyLocalAuthRecord(record, "WrongPass@123"), false);
  assert.equal(await verifyLocalAuthRecord(record, ""), false);

  const session = toSessionCredential(record.credential);
  assert.equal(session.password, "");
  assert.equal(session.state, "Maharashtra");
});
