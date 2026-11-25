import type { WarehouseItem } from "../data/bhoomiData";

export function extractWarehouseState(cityState: string): string {
  const parts = cityState
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return "";
  return parts[parts.length - 1];
}

export function matchesWarehouseState(
  cityState: string,
  targetState: string
): boolean {
  const cleanTarget = targetState.trim().toLowerCase();
  if (!cleanTarget || cleanTarget === "all india") return true;
  const extracted = extractWarehouseState(cityState).toLowerCase();
  if (extracted === cleanTarget) return true;
  return cityState.toLowerCase().includes(cleanTarget);
}

export function filterWarehousesForRegion(params: {
  warehouses: WarehouseItem[];
  farmerState?: string;
  regionFilter: string;
  searchQuery: string;
}): WarehouseItem[] {
  const { warehouses, farmerState = "", regionFilter, searchQuery } = params;
  const q = searchQuery.trim().toLowerCase();
  const cleanFilter = regionFilter.trim();
  const cleanFarmerState = farmerState.trim();

  return warehouses
    .filter((w) => {
      if (w.status !== "active") return false;
      if (
        cleanFilter &&
        cleanFilter.toLowerCase() !== "all india" &&
        !matchesWarehouseState(w.cityState, cleanFilter)
      ) {
        return false;
      }
      if (!q) return true;
      return (
        w.name.toLowerCase().includes(q) ||
        w.cityState.toLowerCase().includes(q) ||
        w.facilities.some((f) => f.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (cleanFarmerState && cleanFilter.toLowerCase() === "all india") {
        const aInState = matchesWarehouseState(a.cityState, cleanFarmerState);
        const bInState = matchesWarehouseState(b.cityState, cleanFarmerState);
        if (aInState !== bInState) return aInState ? -1 : 1;
      }
      return a.distanceKm - b.distanceKm;
    });
}
