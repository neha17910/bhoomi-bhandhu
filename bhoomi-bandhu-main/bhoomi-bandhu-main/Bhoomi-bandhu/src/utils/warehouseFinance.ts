import type {
  InsurancePlan,
  LoanOption,
  PartnerCompanyItem,
} from "../data/bhoomiData";
import type { UserRole } from "./roles";

const FARMER_ONLY_LOAN_KEYWORDS = ["crop loan", "kisan credit card", "kcc", "tractor", "dairy", "poultry"];
const FARMER_ONLY_INSURANCE_KEYWORDS = ["crop insurance", "pmfby", "fasal bima", "rwbcis", "coconut palm"];

export function getLoansForRole(
  role: UserRole | undefined | null,
  loans: LoanOption[]
): LoanOption[] {
  if (role === "warehouse_owner") {
    return loans.filter(
      (loan) =>
        loan.audience === "warehouse_owner" || loan.audience === "both"
    );
  }
  return loans.filter((loan) => loan.audience !== "warehouse_owner");
}

export function getLoanFilterTabsForRole(
  role: UserRole | undefined | null
): string[] {
  if (role === "warehouse_owner") {
    return [
      "All",
      "Warehouse Construction",
      "Warehouse Running Capital",
      "Land Purchase Loan",
      "Infrastructure Loan",
    ];
  }
  return [
    "All",
    "Crop Loan",
    "Equipment Loan",
    "Infrastructure Loan",
    "Allied Agri Loan",
  ];
}

export function getInsurancePlansForRole(
  role: UserRole | undefined | null,
  plans: InsurancePlan[]
): InsurancePlan[] {
  if (role === "warehouse_owner") {
    return plans.filter(
      (plan) =>
        plan.audience === "warehouse_owner" || plan.audience === "both"
    );
  }
  return plans.filter((plan) => plan.audience !== "warehouse_owner");
}

export function filterPartnerCompaniesForRole(
  role: UserRole | undefined | null,
  category: "loan" | "insurance",
  companies: PartnerCompanyItem[]
): PartnerCompanyItem[] {
  const activeByCat = companies.filter(
    (c) => c.category === category && c.status === "active"
  );

  if (role === "warehouse_owner") {
    return activeByCat.filter((c) => {
      if (c.audience === "warehouse_owner" || c.audience === "both") {
        return true;
      }
      if (c.audience === "farmer") {
        return false;
      }
      // For admin-added companies without explicit audience tag, exclude clearly crop-only listings
      const blob =
        `${c.name} ${c.interestOrPremium} ${c.coverageOrLimit} ${c.eligibilitySummary}`.toLowerCase();
      const keywords =
        category === "loan"
          ? FARMER_ONLY_LOAN_KEYWORDS
          : FARMER_ONLY_INSURANCE_KEYWORDS;
      return !keywords.some((kw) => blob.includes(kw));
    });
  }

  return activeByCat.filter((c) => c.audience !== "warehouse_owner");
}
