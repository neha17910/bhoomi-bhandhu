import { SCHEMES_DATA, type SchemeItem } from "../data/bhoomiData";

export type LandHoldingTier = "marginal" | "small" | "medium" | "large";
export type FarmerCategoryType = "owner" | "tenant" | "fpo";
export type PrimaryNeedType =
  | "all"
  | "income"
  | "insurance"
  | "loan"
  | "soil"
  | "equipment";

export interface EligibilityProfileInput {
  state: string;
  landTier: LandHoldingTier;
  farmerType: FarmerCategoryType;
  primaryNeed: PrimaryNeedType;
}

const LAND_TIER_ACRES: Record<LandHoldingTier, number> = {
  marginal: 2.0,
  small: 4.5,
  medium: 10.0,
  large: 20.0,
};

export function evaluateSchemeEligibility(
  input: EligibilityProfileInput,
  schemes: SchemeItem[] = SCHEMES_DATA
): SchemeItem[] {
  const estimatedAcres = LAND_TIER_ACRES[input.landTier];

  return schemes.filter((scheme) => {
    const stateMatches =
      scheme.eligibleStates.includes("All India") ||
      scheme.eligibleStates.includes(input.state);
    if (!stateMatches) return false;

    if (
      scheme.maxLandAcres !== null &&
      estimatedAcres > scheme.maxLandAcres
    ) {
      return false;
    }

    // PM-KISAN requires landholding ownership
    if (scheme.id === "pm-kisan" && input.farmerType === "tenant") {
      return false;
    }

    if (input.primaryNeed !== "all") {
      const needMatch = scheme.targetNeeds.includes(input.primaryNeed);
      if (!needMatch) return false;
    }

    return true;
  });
}
