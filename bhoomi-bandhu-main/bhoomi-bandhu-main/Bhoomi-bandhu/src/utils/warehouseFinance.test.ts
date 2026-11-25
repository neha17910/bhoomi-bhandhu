import test from "node:test";
import assert from "node:assert/strict";
import {
  INSURANCE_PLANS,
  LOANS_DATA,
  SEEDED_PARTNER_COMPANIES,
} from "../data/bhoomiData";
import {
  filterPartnerCompaniesForRole,
  getInsurancePlansForRole,
  getLoanFilterTabsForRole,
  getLoansForRole,
} from "./warehouseFinance";

test("warehouse_owner loans strictly exclude Crop Loans and include construction, running capital, and land purchase", () => {
  const ownerLoans = getLoansForRole("warehouse_owner", LOANS_DATA);
  assert.equal(ownerLoans.length >= 3, true);
  assert.equal(
    ownerLoans.some((l) => l.loanType === "Crop Loan"),
    false
  );
  assert.equal(
    ownerLoans.some((l) => l.loanType === "Warehouse Construction"),
    true
  );
  assert.equal(
    ownerLoans.some((l) => l.loanType === "Warehouse Running Capital"),
    true
  );
  assert.equal(
    ownerLoans.some((l) => l.loanType === "Land Purchase Loan"),
    true
  );
  const tabs = getLoanFilterTabsForRole("warehouse_owner");
  assert.equal(tabs.includes("Crop Loan"), false);
  assert.equal(tabs.includes("Land Purchase Loan"), true);
});

test("farmer loans include Crop Loans and exclude warehouse-owner-only commercial loans", () => {
  const farmerLoans = getLoansForRole("farmer", LOANS_DATA);
  assert.equal(
    farmerLoans.some((l) => l.loanType === "Crop Loan"),
    true
  );
  assert.equal(
    farmerLoans.some((l) => l.loanType === "Land Purchase Loan"),
    false
  );
});

test("warehouse_owner insurance strictly excludes crop insurance (PMFBY/RWBCIS) and shows warehouse property/stock/construction cover", () => {
  const ownerPlans = getInsurancePlansForRole("warehouse_owner", INSURANCE_PLANS);
  assert.equal(ownerPlans.length >= 3, true);
  assert.equal(
    ownerPlans.some((p) => p.id.includes("pmfby") || p.id.includes("rwbcis")),
    false
  );
  assert.equal(
    ownerPlans.some((p) => p.id === "wh-property-fire-plan"),
    true
  );
  assert.equal(
    ownerPlans.some((p) => p.id === "wh-land-car-plan"),
    true
  );
});

test("partner companies filter out crop-only lenders/insurers for warehouse owners while keeping commercial ones", () => {
  const ownerLoanPartners = filterPartnerCompaniesForRole(
    "warehouse_owner",
    "loan",
    SEEDED_PARTNER_COMPANIES
  );
  assert.equal(
    ownerLoanPartners.some((c) => c.id === "comp-sbi-kcc"),
    false
  );
  assert.equal(
    ownerLoanPartners.some((c) => c.id === "comp-sidbi-wh-loan"),
    true
  );

  const ownerInsPartners = filterPartnerCompaniesForRole(
    "warehouse_owner",
    "insurance",
    SEEDED_PARTNER_COMPANIES
  );
  assert.equal(
    ownerInsPartners.some((c) => c.id === "comp-aic-pmfby"),
    false
  );
  assert.equal(
    ownerInsPartners.some((c) => c.id === "comp-newindia-wh-ins"),
    true
  );
});
