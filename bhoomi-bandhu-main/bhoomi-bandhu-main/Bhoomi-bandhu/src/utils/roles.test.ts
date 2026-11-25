import test from "node:test";
import assert from "node:assert/strict";
import {
  canAccessRoute,
  DEMO_ACCOUNTS,
  getDefaultRouteForRole,
  getRoleDisplayLabel,
  isValidRole,
  matchDemoCredential,
} from "./roles";

test("isValidRole recognizes the 4 standard non-admin roles and rejects invalid ones", () => {
  assert.equal(isValidRole("farmer"), true);
  assert.equal(isValidRole("warehouse_owner"), true);
  assert.equal(isValidRole("psychiatrist"), true);
  assert.equal(isValidRole("support_staff"), true);
  assert.equal(isValidRole("admin"), false);
  assert.equal(isValidRole("guest"), false);
});

test("getDefaultRouteForRole directs each role to its primary workspace", () => {
  assert.equal(getDefaultRouteForRole("farmer", true), "/admin");
  assert.equal(getDefaultRouteForRole("psychiatrist", false), "/psychiatrist");
  assert.equal(getDefaultRouteForRole("support_staff", false), "/support-desk");
  assert.equal(getDefaultRouteForRole("warehouse_owner", false), "/");
  assert.equal(getDefaultRouteForRole("farmer", false), "/");
});

test("canAccessRoute enforces strict role isolation for admin, psychiatrist, warehouse_owner, and support-desk", () => {
  assert.equal(canAccessRoute("farmer", false, "/admin"), false);
  assert.equal(canAccessRoute("farmer", true, "/admin"), true);
  assert.equal(canAccessRoute("farmer", true, "/psychiatrist"), true);
  assert.equal(canAccessRoute("farmer", true, "/support-desk"), true);
  assert.equal(canAccessRoute("farmer", true, "/notifications"), true);
  assert.equal(canAccessRoute("farmer", true, "/profile"), true);
  assert.equal(canAccessRoute("farmer", true, "/schemes"), false);
  assert.equal(canAccessRoute("farmer", true, "/warehouses"), false);
  assert.equal(canAccessRoute("farmer", false, "/psychiatrist"), false);
  assert.equal(canAccessRoute("psychiatrist", false, "/psychiatrist"), true);
  assert.equal(canAccessRoute("psychiatrist", false, "/wellbeing"), false);
  assert.equal(canAccessRoute("farmer", false, "/wellbeing"), true);
  assert.equal(canAccessRoute("warehouse_owner", false, "/support-desk"), false);
  assert.equal(canAccessRoute("warehouse_owner", false, "/schemes"), false);
  assert.equal(canAccessRoute("warehouse_owner", false, "/crop-advisor"), false);
  assert.equal(canAccessRoute("warehouse_owner", false, "/loans"), true);
  assert.equal(canAccessRoute("warehouse_owner", false, "/insurance"), true);
  assert.equal(canAccessRoute("warehouse_owner", false, "/warehouses"), true);
  assert.equal(canAccessRoute("support_staff", false, "/support-desk"), true);
  assert.equal(canAccessRoute("farmer", false, "/schemes"), true);
});

test("getRoleDisplayLabel formats readable role names", () => {
  assert.equal(getRoleDisplayLabel("farmer", true), "Administrator");
  assert.equal(getRoleDisplayLabel("psychiatrist", false), "Psychiatrist");
  assert.equal(getRoleDisplayLabel("support_staff", false), "Support Employee");
  assert.equal(getRoleDisplayLabel("warehouse_owner", false), "Warehouse Owner");
  assert.equal(getRoleDisplayLabel("farmer", false), "Farmer");
});

test("matchDemoCredential requires exact email and password without fallback", () => {
  assert.equal(DEMO_ACCOUNTS.length >= 5, true);
  const docMatch = matchDemoCredential("DOCTOR.test@bhoomibandhu.in ", "Doctor@123");
  assert.equal(docMatch?.role, "psychiatrist");
  assert.equal(matchDemoCredential("doctor.test@bhoomibandhu.in", "wrongpass"), null);
  assert.equal(matchDemoCredential("", "Doctor@123"), null);
  assert.equal(matchDemoCredential("support.test@bhoomibandhu.in", "Support@123")?.role, "support_staff");
  assert.equal(matchDemoCredential("admin.demo@bhoomibandhu.in", "Admin@123")?.isAdminDemo, true);
});
