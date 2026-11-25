export type ConsultationMode =
  | "Audio & Video"
  | "Audio Call Only"
  | "Video Call Only"
  | "Chat & Audio";

export type SessionDurationMins = 20 | 30 | 45;

export const CONSULTATION_LANGUAGE_OPTIONS = [
  "Hindi",
  "English",
  "Punjabi",
  "Marathi",
  "Gujarati",
  "Tamil",
  "Telugu",
  "Kannada",
  "Bengali",
  "Malayalam",
  "Urdu",
] as const;

export const CONSULTATION_MODE_OPTIONS: ConsultationMode[] = [
  "Audio & Video",
  "Audio Call Only",
  "Video Call Only",
  "Chat & Audio",
];

export const CONSULTATION_SLOT_OPTIONS = [
  "Morning · 9:30 AM - 12:00 PM",
  "Today · 6:00 PM - 6:30 PM",
  "Tomorrow · 11:00 AM - 11:30 AM",
  "Tomorrow · 5:00 PM - 5:30 PM",
  "Weekend · 10:30 AM - 11:00 AM",
] as const;

export const SESSION_DURATION_OPTIONS: SessionDurationMins[] = [20, 30, 45];

export interface PsychiatristSettingsPayload {
  availableForConsult: boolean;
  languages: string[];
  experienceYears: number;
  bio: string;
  consultMode: ConsultationMode;
  sessionDurationMins: SessionDurationMins;
  preferredSlots: string[];
  qualification?: string;
  specialization?: string;
}

export function validatePsychiatristSettings(
  input: PsychiatristSettingsPayload
): { valid: boolean; error?: string } {
  if (!Array.isArray(input.languages) || input.languages.length === 0) {
    return {
      valid: false,
      error: "Please select at least one consultation language.",
    };
  }
  if (
    input.availableForConsult &&
    (!Array.isArray(input.preferredSlots) || input.preferredSlots.length === 0)
  ) {
    return {
      valid: false,
      error:
        "Please select at least one consultation time slot while available for farmers.",
    };
  }
  if (
    !Number.isFinite(input.experienceYears) ||
    input.experienceYears < 0 ||
    input.experienceYears > 70
  ) {
    return {
      valid: false,
      error: "Years of experience must be between 0 and 70.",
    };
  }
  return { valid: true };
}

export function normalizePsychiatristSettings(
  input: PsychiatristSettingsPayload
): PsychiatristSettingsPayload {
  const uniqueLangs = Array.from(
    new Set(
      input.languages
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 8)
    )
  );
  const uniqueSlots = Array.from(
    new Set(
      input.preferredSlots
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 6)
    )
  );
  const consultMode: ConsultationMode = CONSULTATION_MODE_OPTIONS.includes(
    input.consultMode
  )
    ? input.consultMode
    : "Audio & Video";
  const sessionDurationMins: SessionDurationMins =
    SESSION_DURATION_OPTIONS.includes(input.sessionDurationMins)
      ? input.sessionDurationMins
      : 30;
  const experienceYears = Math.max(
    0,
    Math.min(70, Math.round(Number(input.experienceYears) || 0))
  );

  return {
    availableForConsult: Boolean(input.availableForConsult),
    languages: uniqueLangs.length > 0 ? uniqueLangs : ["Hindi", "English"],
    experienceYears,
    bio: input.bio.trim().slice(0, 400),
    consultMode,
    sessionDurationMins,
    preferredSlots:
      uniqueSlots.length > 0
        ? uniqueSlots
        : ["Tomorrow · 5:00 PM - 5:30 PM"],
    qualification: input.qualification?.trim().slice(0, 100),
    specialization: input.specialization?.trim().slice(0, 120),
  };
}
