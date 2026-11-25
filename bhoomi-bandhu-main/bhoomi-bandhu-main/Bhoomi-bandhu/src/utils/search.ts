import {
  FAQS_DATA,
  INSURANCE_PLANS,
  LOANS_DATA,
  SCHEMES_DATA,
  SEEDED_WAREHOUSES,
  WELLBEING_ARTICLES,
  type WarehouseItem,
} from "../data/bhoomiData";
import type { UserRole } from "./roles";
import { getInsurancePlansForRole, getLoansForRole } from "./warehouseFinance";

export type SearchModuleCategory =
  | "All"
  | "Schemes"
  | "Insurance"
  | "Loans"
  | "Warehouses"
  | "Well-Being"
  | "Help";

export interface SearchResultItem {
  id: string;
  category: Exclude<SearchModuleCategory, "All">;
  title: string;
  subtitle: string;
  snippet: string;
  route: string;
}

export function searchPlatformContent(
  rawQuery: string,
  extraWarehouses: WarehouseItem[] = [],
  categoryFilter: SearchModuleCategory = "All",
  role?: UserRole
): SearchResultItem[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return [];
  }

  const isOwner = role === "warehouse_owner";
  const results: SearchResultItem[] = [];

  const matches = (...fields: Array<string | string[] | undefined>): boolean => {
    for (const field of fields) {
      if (!field) continue;
      if (Array.isArray(field)) {
        if (field.some((item) => item.toLowerCase().includes(query))) {
          return true;
        }
      } else if (field.toLowerCase().includes(query)) {
        return true;
      }
    }
    return false;
  };

  if (!isOwner && (categoryFilter === "All" || categoryFilter === "Schemes")) {
    for (const scheme of SCHEMES_DATA) {
      if (
        matches(
          scheme.name,
          scheme.shortName,
          scheme.category,
          scheme.summary,
          scheme.benefitHighlight,
          scheme.eligibility,
          scheme.benefits
        )
      ) {
        results.push({
          id: `scheme-${scheme.id}`,
          category: "Schemes",
          title: scheme.name,
          subtitle: scheme.category,
          snippet: scheme.summary,
          route: `/schemes/${scheme.id}`,
        });
      }
    }
  }

  if (categoryFilter === "All" || categoryFilter === "Insurance") {
    for (const plan of getInsurancePlansForRole(role, INSURANCE_PLANS)) {
      if (
        matches(
          plan.name,
          plan.category,
          plan.summary,
          plan.premiumAndCoverage,
          plan.eligibility
        )
      ) {
        results.push({
          id: `insurance-${plan.id}`,
          category: "Insurance",
          title: plan.name,
          subtitle: plan.category,
          snippet: plan.summary,
          route: `/insurance?plan=${plan.id}`,
        });
      }
    }
  }

  if (categoryFilter === "All" || categoryFilter === "Loans") {
    for (const loan of getLoansForRole(role, LOANS_DATA)) {
      if (
        matches(
          loan.name,
          loan.provider,
          loan.loanType,
          loan.summary,
          loan.interestSummary
        )
      ) {
        results.push({
          id: `loan-${loan.id}`,
          category: "Loans",
          title: loan.name,
          subtitle: `${loan.loanType} · ${loan.provider}`,
          snippet: loan.summary,
          route: `/loans?loan=${loan.id}`,
        });
      }
    }
  }

  if (categoryFilter === "All" || categoryFilter === "Warehouses") {
    const mergedWarehouses = [...extraWarehouses, ...SEEDED_WAREHOUSES];
    const seenIds = new Set<string>();
    for (const wh of mergedWarehouses) {
      if (seenIds.has(wh.id)) continue;
      seenIds.add(wh.id);
      if (matches(wh.name, wh.cityState, wh.description, wh.facilities)) {
        results.push({
          id: `warehouse-${wh.id}`,
          category: "Warehouses",
          title: wh.name,
          subtitle: `${wh.cityState} · Rs. ${wh.pricePerQuintalMonth}/quintal/mo`,
          snippet: wh.description,
          route: `/warehouses/${wh.id}`,
        });
      }
    }
  }

  if (!isOwner && (categoryFilter === "All" || categoryFilter === "Well-Being")) {
    for (const article of WELLBEING_ARTICLES) {
      if (matches(article.title, article.topic, article.summary, article.practicalSteps)) {
        results.push({
          id: `wellbeing-${article.id}`,
          category: "Well-Being",
          title: article.title,
          subtitle: article.topic,
          snippet: article.summary,
          route: `/wellbeing`,
        });
      }
    }
  }

  if (categoryFilter === "All" || categoryFilter === "Help") {
    for (const faq of FAQS_DATA) {
      if (matches(faq.question, faq.answer, faq.category)) {
        results.push({
          id: `faq-${faq.id}`,
          category: "Help",
          title: faq.question,
          subtitle: faq.category,
          snippet: faq.answer,
          route: `/help?q=${encodeURIComponent(rawQuery.trim())}`,
        });
      }
    }
  }

  return results;
}
