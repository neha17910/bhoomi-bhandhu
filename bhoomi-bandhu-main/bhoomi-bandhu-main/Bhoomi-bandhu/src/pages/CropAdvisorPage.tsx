import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CloudRain,
  Compass,
  Droplets,
  FlaskConical,
  MapPin,
  MessageSquare,
  RotateCcw,
  Sprout,
  Thermometer,
} from "lucide-react";
import {
  recommendCrops,
  type CropAdvisorResult,
  type RegionalSoilDefaults,
  type SoilTypeOption,
} from "../utils/cropAdvisor";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const SOIL_TYPES: SoilTypeOption[] = [
  "Alluvial",
  "Black Cotton",
  "Red Loam",
  "Sandy Loam",
  "Clay Loam",
];

const QUICK_LOCATIONS = [
  "Ludhiana",
  "Nashik",
  "Indore",
  "Jaipur",
  "Tumakuru",
];

interface LiveWeatherData {
  locationName: string;
  admin1: string;
  country: string;
  temperatureC: number;
  humidityPct: number;
  rainfallMm: number;
  weatherSummary: string;
  soilDefaults: RegionalSoilDefaults;
}

export function CropAdvisorPage() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const initialPlace =
    profile?.district?.trim() || profile?.state?.trim() || "";

  const [locationQuery, setLocationQuery] = useState(initialPlace);
  const [showSoilOptions, setShowSoilOptions] = useState(false);
  const [customSoilTouched, setCustomSoilTouched] = useState(false);

  const [soilType, setSoilType] = useState<SoilTypeOption>("Alluvial");
  const [nitrogen, setNitrogen] = useState(85);
  const [phosphorus, setPhosphorus] = useState(48);
  const [potassium, setPotassium] = useState(40);
  const [ph, setPh] = useState(6.8);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [weather, setWeather] = useState<LiveWeatherData | null>(null);
  const [result, setResult] = useState<CropAdvisorResult | null>(null);

  const fetchWeatherAndPredict = async (targetLocation: string) => {
    const cleanLoc = targetLocation.trim();
    if (cleanLoc.length < 2) {
      setError("Please type your village, town, or district name.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `/api/weather?location=${encodeURIComponent(cleanLoc)}`
      );
      const data = (await res.json()) as LiveWeatherData & { error?: string };

      if (!res.ok) {
        throw new Error(
          data.error || "Unable to fetch weather for that location."
        );
      }

      const activeSoilType = customSoilTouched
        ? soilType
        : data.soilDefaults.soilType;
      const activeN = customSoilTouched ? nitrogen : data.soilDefaults.nitrogen;
      const activeP = customSoilTouched
        ? phosphorus
        : data.soilDefaults.phosphorus;
      const activeK = customSoilTouched
        ? potassium
        : data.soilDefaults.potassium;
      const activePh = customSoilTouched ? ph : data.soilDefaults.ph;

      if (!customSoilTouched) {
        setSoilType(data.soilDefaults.soilType);
        setNitrogen(data.soilDefaults.nitrogen);
        setPhosphorus(data.soilDefaults.phosphorus);
        setPotassium(data.soilDefaults.potassium);
        setPh(data.soilDefaults.ph);
      }

      const recommendation = recommendCrops({
        soilType: activeSoilType,
        nitrogen: activeN,
        phosphorus: activeP,
        potassium: activeK,
        temperatureC: data.temperatureC,
        humidityPct: data.humidityPct,
        rainfallMm: data.rainfallMm,
        ph: activePh,
      });

      setWeather(data);
      setResult(recommendation);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not fetch live weather right now."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeatherAndPredict(locationQuery);
  };

  const handleReset = () => {
    setResult(null);
    setWeather(null);
    setError("");
  };

  const handleRecomputeWithSoil = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weather) return;
    const updated = recommendCrops({
      soilType,
      nitrogen,
      phosphorus,
      potassium,
      temperatureC: weather.temperatureC,
      humidityPct: weather.humidityPct,
      rainfallMm: weather.rainfallMm,
      ph,
    });
    setResult(updated);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center shrink-0">
          <FlaskConical className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1B2A20]">
            {t("cropAdvisor.title")}
          </h1>
          <p className="text-sm text-[#4A5A4F]">
            {t("cropAdvisor.subtitle")}
          </p>
        </div>
      </div>

      {/* Location Search Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 md:p-6 space-y-4"
      >
        <div>
          <label
            htmlFor="ca-location"
            className="block font-display font-semibold text-base text-[#1B2A20] mb-1.5"
          >
            {t("cropAdvisor.locationLabel")}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MapPin className="w-5 h-5 text-[#2D6A4F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="ca-location"
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder={t("cropAdvisor.locationPlaceholder")}
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-base text-[#1B2A20] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="min-h-[48px] px-6 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] disabled:opacity-60 text-[#1B2A20] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              <Compass className="w-4 h-4" />
              <span>
                {loading
                  ? t("cropAdvisor.fetchingBtn")
                  : t("cropAdvisor.fetchBtn")}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Location Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[#4A5A4F]">
            {t("cropAdvisor.quickRegions")}
          </span>
          {QUICK_LOCATIONS.map((loc) => (
            <button
              key={loc}
              type="button"
              disabled={loading}
              onClick={() => {
                setLocationQuery(loc);
                fetchWeatherAndPredict(loc);
              }}
              className="min-h-[36px] px-3 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] hover:bg-[#DDECE3] text-xs font-semibold transition-colors"
            >
              {loc}
            </button>
          ))}
        </div>

        {/* Optional Soil Overrides Toggle */}
        <div className="pt-2 border-t border-[#2D6A4F]/10">
          <button
            type="button"
            aria-expanded={showSoilOptions}
            onClick={() => setShowSoilOptions((prev) => !prev)}
            className="min-h-[40px] text-sm font-semibold text-[#2D6A4F] inline-flex items-center gap-1.5 hover:underline"
          >
            {showSoilOptions ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span>{t("cropAdvisor.optionalSoil")}</span>
          </button>

          {showSoilOptions && (
            <div className="mt-4 space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="ca-soil"
                    className="block text-sm font-medium text-[#1B2A20] mb-1"
                  >
                    Soil Type
                  </label>
                  <select
                    id="ca-soil"
                    value={soilType}
                    onChange={(e) => {
                      setCustomSoilTouched(true);
                      setSoilType(e.target.value as SoilTypeOption);
                    }}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
                  >
                    {SOIL_TYPES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <label
                      htmlFor="ca-ph"
                      className="font-medium text-[#1B2A20]"
                    >
                      Soil pH Level
                    </label>
                    <span className="font-semibold text-[#2D6A4F] tabular-nums">
                      {ph.toFixed(1)}
                    </span>
                  </div>
                  <input
                    id="ca-ph"
                    type="range"
                    min={4.5}
                    max={9.0}
                    step={0.1}
                    value={ph}
                    onChange={(e) => {
                      setCustomSoilTouched(true);
                      setPh(Number(e.target.value));
                    }}
                    className="w-full accent-[#2D6A4F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="ca-n"
                    className="block text-sm font-medium text-[#1B2A20] mb-1"
                  >
                    Nitrogen (N) kg/ha
                  </label>
                  <input
                    id="ca-n"
                    type="number"
                    min={0}
                    max={200}
                    value={nitrogen}
                    onChange={(e) => {
                      setCustomSoilTouched(true);
                      setNitrogen(Number(e.target.value));
                    }}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ca-p"
                    className="block text-sm font-medium text-[#1B2A20] mb-1"
                  >
                    Phosphorus (P) kg/ha
                  </label>
                  <input
                    id="ca-p"
                    type="number"
                    min={0}
                    max={150}
                    value={phosphorus}
                    onChange={(e) => {
                      setCustomSoilTouched(true);
                      setPhosphorus(Number(e.target.value));
                    }}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ca-k"
                    className="block text-sm font-medium text-[#1B2A20] mb-1"
                  >
                    Potassium (K) kg/ha
                  </label>
                  <input
                    id="ca-k"
                    type="number"
                    min={0}
                    max={150}
                    value={potassium}
                    onChange={(e) => {
                      setCustomSoilTouched(true);
                      setPotassium(Number(e.target.value));
                    }}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm tabular-nums"
                  />
                </div>
              </div>

              {weather && (
                <button
                  type="button"
                  onClick={handleRecomputeWithSoil}
                  className="min-h-[40px] px-4 rounded-xl border border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#EAF4EE] text-xs font-semibold transition-colors"
                >
                  Update Prediction with Custom Soil Values
                </button>
              )}
            </div>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Live Weather + Crop Prediction Results */}
      {weather && result && (
        <div className="space-y-6">
          {/* Live Weather Snapshot */}
          <section
            aria-label="Live fetched weather"
            className="bg-[#EAF4EE] rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[#1B2A20]">
                Live Weather for {weather.locationName}
                {weather.admin1 ? `, ${weather.admin1}` : ""}
              </p>
              <span className="text-xs font-medium text-[#2D6A4F]">
                {weather.weatherSummary} · {soilType} soil profile
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <div className="bg-white rounded-xl p-3 sm:p-3.5 min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#4A5A4F]">
                  <Thermometer className="w-4 h-4 shrink-0 text-[#2D6A4F]" />
                  <span className="truncate">Temp</span>
                </div>
                <p className="text-base sm:text-xl font-display font-bold text-[#1B2A20] tabular-nums mt-1">
                  {weather.temperatureC} °C
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 sm:p-3.5 min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#4A5A4F]">
                  <Droplets className="w-4 h-4 shrink-0 text-[#2D6A4F]" />
                  <span className="truncate">Humidity</span>
                </div>
                <p className="text-base sm:text-xl font-display font-bold text-[#1B2A20] tabular-nums mt-1">
                  {weather.humidityPct}%
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 sm:p-3.5 min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#4A5A4F]">
                  <CloudRain className="w-4 h-4 shrink-0 text-[#2D6A4F]" />
                  <span className="truncate">30d Rain</span>
                </div>
                <p className="text-base sm:text-xl font-display font-bold text-[#1B2A20] tabular-nums mt-1">
                  {weather.rainfallMm} mm
                </p>
              </div>
            </div>
          </section>

          {/* Primary Crop Recommendation */}
          <div className="bg-white rounded-2xl border border-[#2D6A4F]/25 p-6 md:p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center mx-auto">
              <Sprout className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#2D6A4F]">
                {result.primary.suitabilityLabel} · {result.primary.crop.season} ·{" "}
                <span className="tabular-nums">{result.primary.matchScore}%</span>{" "}
                match
              </p>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-[#1B2A20] mt-1">
                {result.primary.crop.name}
              </h2>
            </div>

            <p className="text-sm text-[#1B2A20] max-w-lg mx-auto leading-relaxed">
              {result.primary.crop.waterNote}. {result.primary.crop.sowingTip}
            </p>

            <p className="text-xs text-[#4A5A4F] max-w-md mx-auto pt-2 border-t border-[#2D6A4F]/10">
              {result.disclaimer}
            </p>
          </div>

          {/* Secondary Crop Suggestions */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-base text-[#1B2A20]">
              Other Suitable Crops for {weather.locationName}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {result.alternatives.map((alt) => (
                <div
                  key={alt.crop.name}
                  className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-4 space-y-1"
                >
                  <p className="text-xs font-semibold text-[#2D6A4F] tabular-nums">
                    {alt.crop.season} · {alt.matchScore}% fit
                  </p>
                  <p className="font-display font-semibold text-base text-[#1B2A20]">
                    {alt.crop.name}
                  </p>
                  <p className="text-xs text-[#4A5A4F]">{alt.crop.waterNote}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[48px] px-6 rounded-xl border border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#EAF4EE] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t("cropAdvisor.checkAnother")}</span>
            </button>

            <Link
              to={`/chat?prompt=${encodeURIComponent(
                `My farm is in ${weather.locationName}${
                  weather.admin1 ? `, ${weather.admin1}` : ""
                }. Current live weather is ${weather.temperatureC}°C, ${
                  weather.humidityPct
                }% humidity, and ${weather.rainfallMm} mm estimated monthly rain (${soilType} soil). Crop Advisor suggested ${
                  result.primary.crop.name
                }. What sowing steps and precautions should I take?`
              )}`}
              className="flex-1 min-h-[48px] px-6 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t("cropAdvisor.askAiAboutCrop")}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
