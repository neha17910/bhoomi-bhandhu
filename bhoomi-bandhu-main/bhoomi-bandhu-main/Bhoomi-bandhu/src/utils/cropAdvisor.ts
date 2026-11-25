export type SoilTypeOption =
  | "Alluvial"
  | "Black Cotton"
  | "Red Loam"
  | "Sandy Loam"
  | "Clay Loam";

export interface CropAdvisorInput {
  soilType: SoilTypeOption;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperatureC: number;
  humidityPct: number;
  rainfallMm: number;
  ph: number;
}

export interface CropProfile {
  name: string;
  season: string;
  idealSoils: SoilTypeOption[];
  n: number;
  p: number;
  k: number;
  temp: number;
  humidity: number;
  rainfall: number;
  ph: number;
  waterNote: string;
  sowingTip: string;
}

export interface CropSuggestion {
  crop: CropProfile;
  matchScore: number;
  suitabilityLabel: "Strong Fit" | "Good Fit" | "Moderate Fit";
}

export interface CropAdvisorResult {
  primary: CropSuggestion;
  alternatives: CropSuggestion[];
  disclaimer: string;
}

const CROP_PROFILES: CropProfile[] = [
  {
    name: "Rice (Paddy)",
    season: "Kharif",
    idealSoils: ["Alluvial", "Clay Loam"],
    n: 90,
    p: 45,
    k: 42,
    temp: 26,
    humidity: 82,
    rainfall: 210,
    ph: 6.4,
    waterNote: "High water & humid tropical/subtropical climate",
    sowingTip: "Maintain shallow standing water during vegetative growth and verify zinc levels.",
  },
  {
    name: "Wheat",
    season: "Rabi",
    idealSoils: ["Alluvial", "Clay Loam"],
    n: 85,
    p: 50,
    k: 40,
    temp: 18,
    humidity: 56,
    rainfall: 75,
    ph: 6.9,
    waterNote: "Cool winter sowing with 4–6 timely irrigations",
    sowingTip: "Crown root initiation irrigation at 21 days after sowing is critical.",
  },
  {
    name: "Cotton",
    season: "Kharif",
    idealSoils: ["Black Cotton", "Clay Loam"],
    n: 110,
    p: 45,
    k: 35,
    temp: 28,
    humidity: 62,
    rainfall: 95,
    ph: 7.4,
    waterNote: "Moderate rainfall with good drainage",
    sowingTip: "Deep black soil retains moisture well; avoid waterlogging in heavy rain.",
  },
  {
    name: "Maize",
    season: "Kharif / Rabi",
    idealSoils: ["Alluvial", "Red Loam", "Sandy Loam"],
    n: 80,
    p: 48,
    k: 38,
    temp: 24,
    humidity: 64,
    rainfall: 90,
    ph: 6.6,
    waterNote: "Well-drained loamy soil with moderate moisture",
    sowingTip: "Ensure ridge-and-furrow drainage during monsoon sowing.",
  },
  {
    name: "Chickpea (Chana)",
    season: "Rabi",
    idealSoils: ["Black Cotton", "Sandy Loam", "Alluvial"],
    n: 38,
    p: 62,
    k: 55,
    temp: 20,
    humidity: 44,
    rainfall: 55,
    ph: 7.2,
    waterNote: "Low water requirement; thrives on residual soil moisture",
    sowingTip: "Treat seeds with Rhizobium culture to naturally fix nitrogen.",
  },
  {
    name: "Groundnut",
    season: "Kharif / Summer",
    idealSoils: ["Sandy Loam", "Red Loam"],
    n: 35,
    p: 55,
    k: 45,
    temp: 27,
    humidity: 58,
    rainfall: 75,
    ph: 6.3,
    waterNote: "Light friable soil for easy pod penetration",
    sowingTip: "Apply gypsum at flowering stage for healthy pod filling.",
  },
  {
    name: "Sugarcane",
    season: "Annual",
    idealSoils: ["Alluvial", "Black Cotton", "Clay Loam"],
    n: 120,
    p: 55,
    k: 65,
    temp: 29,
    humidity: 76,
    rainfall: 170,
    ph: 6.8,
    waterNote: "High warmth & consistent drip or furrow irrigation",
    sowingTip: "Use paired-row planting with drip irrigation for better water efficiency.",
  },
  {
    name: "Pearl Millet (Bajra)",
    season: "Kharif",
    idealSoils: ["Sandy Loam", "Red Loam"],
    n: 45,
    p: 35,
    k: 30,
    temp: 31,
    humidity: 42,
    rainfall: 48,
    ph: 7.1,
    waterNote: "Drought-resilient crop suited to warm, dry belts",
    sowingTip: "Ideal for low-rainfall zones; light weeding at 25 days improves yield.",
  },
  {
    name: "Soybean",
    season: "Kharif",
    idealSoils: ["Black Cotton", "Clay Loam"],
    n: 40,
    p: 60,
    k: 45,
    temp: 25,
    humidity: 68,
    rainfall: 110,
    ph: 6.6,
    waterNote: "Moderate monsoon moisture with well-drained furrows",
    sowingTip: "Broad-bed furrow planting protects seedlings against sudden heavy rain.",
  },
];

export function recommendCrops(input: CropAdvisorInput): CropAdvisorResult {
  const scored: CropSuggestion[] = CROP_PROFILES.map((crop) => {
    const nDiff = Math.abs(input.nitrogen - crop.n) / 140;
    const pDiff = Math.abs(input.phosphorus - crop.p) / 100;
    const kDiff = Math.abs(input.potassium - crop.k) / 100;
    const tempDiff = Math.abs(input.temperatureC - crop.temp) / 25;
    const humDiff = Math.abs(input.humidityPct - crop.humidity) / 60;
    const rainDiff = Math.abs(input.rainfallMm - crop.rainfall) / 220;
    const phDiff = Math.abs(input.ph - crop.ph) / 3.5;
    const soilPenalty = crop.idealSoils.includes(input.soilType) ? 0 : 0.22;

    const distance =
      nDiff * 0.14 +
      pDiff * 0.12 +
      kDiff * 0.1 +
      tempDiff * 0.18 +
      humDiff * 0.14 +
      rainDiff * 0.18 +
      phDiff * 0.14 +
      soilPenalty;

    const rawScore = Math.max(35, Math.min(97, Math.round((1 - distance) * 100)));
    const suitabilityLabel: CropSuggestion["suitabilityLabel"] =
      rawScore >= 80 ? "Strong Fit" : rawScore >= 65 ? "Good Fit" : "Moderate Fit";

    return {
      crop,
      matchScore: rawScore,
      suitabilityLabel,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  return {
    primary: scored[0],
    alternatives: scored.slice(1, 4),
    disclaimer:
      "This is a suggestion based on your inputs, not a guarantee. Always confirm seed variety and local sowing dates with your Krishi Vigyan Kendra (KVK).",
  };
}

export type StorageUnit = "kg" | "quintal" | "ton";

export function convertToQuintals(quantity: number, unit: StorageUnit): number {
  if (!Number.isFinite(quantity) || quantity <= 0) return 0;
  if (unit === "kg") return quantity / 100;
  if (unit === "ton") return quantity * 10;
  return quantity;
}

export function calculateEstimatedStorageCost(
  quantity: number,
  unit: StorageUnit,
  durationMonths: number,
  pricePerQuintalMonth: number
): number {
  const quintals = convertToQuintals(quantity, unit);
  if (quintals <= 0 || durationMonths <= 0 || pricePerQuintalMonth < 0) {
    return 0;
  }
  return Math.round(quintals * durationMonths * pricePerQuintalMonth);
}

export interface RegionalSoilDefaults {
  soilType: SoilTypeOption;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
}

export function inferRegionalSoilDefaults(regionName: string): RegionalSoilDefaults {
  const r = regionName.toLowerCase();

  if (
    r.includes("maharashtra") ||
    r.includes("madhya pradesh") ||
    r.includes("gujarat") ||
    r.includes("telangana")
  ) {
    return {
      soilType: "Black Cotton",
      nitrogen: 95,
      phosphorus: 48,
      potassium: 40,
      ph: 7.3,
    };
  }

  if (r.includes("rajasthan")) {
    return {
      soilType: "Sandy Loam",
      nitrogen: 45,
      phosphorus: 38,
      potassium: 35,
      ph: 7.2,
    };
  }

  if (
    r.includes("karnataka") ||
    r.includes("tamil nadu") ||
    r.includes("andhra") ||
    r.includes("kerala") ||
    r.includes("odisha")
  ) {
    return {
      soilType: "Red Loam",
      nitrogen: 60,
      phosphorus: 48,
      potassium: 42,
      ph: 6.4,
    };
  }

  return {
    soilType: "Alluvial",
    nitrogen: 85,
    phosphorus: 48,
    potassium: 40,
    ph: 6.8,
  };
}

export function estimateMonthlyRainfallMm(
  precipitationSums: number[],
  windowDays: number
): number {
  if (!Array.isArray(precipitationSums) || precipitationSums.length === 0 || windowDays <= 0) {
    return 0;
  }
  const total = precipitationSums.reduce(
    (sum, val) => sum + (Number.isFinite(val) && val > 0 ? val : 0),
    0
  );
  return Math.round((total / windowDays) * 30);
}

