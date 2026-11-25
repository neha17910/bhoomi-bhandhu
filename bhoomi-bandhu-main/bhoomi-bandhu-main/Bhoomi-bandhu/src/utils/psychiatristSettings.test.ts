import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizePsychiatristSettings,
  validatePsychiatristSettings,
} from "./psychiatristSettings";

test("validatePsychiatristSettings requires at least one language and one slot when available", () => {
  const noLang = validatePsychiatristSettings({
    availableForConsult: true,
    languages: [],
    experienceYears: 8,
    bio: "Helping farmers.",
    consultMode: "Audio & Video",
    sessionDurationMins: 30,
    preferredSlots: ["Tomorrow · 5:00 PM - 5:30 PM"],
  });
  assert.equal(noLang.valid, false);

  const noSlot = validatePsychiatristSettings({
    availableForConsult: true,
    languages: ["Hindi", "Punjabi"],
    experienceYears: 8,
    bio: "Helping farmers.",
    consultMode: "Audio Call Only",
    sessionDurationMins: 30,
    preferredSlots: [],
  });
  assert.equal(noSlot.valid, false);

  const pausedNoSlot = validatePsychiatristSettings({
    availableForConsult: false,
    languages: ["Hindi"],
    experienceYears: 8,
    bio: "Helping farmers.",
    consultMode: "Audio Call Only",
    sessionDurationMins: 30,
    preferredSlots: [],
  });
  assert.equal(pausedNoSlot.valid, true);
});

test("normalizePsychiatristSettings deduplicates languages/slots and clamps experience", () => {
  const normalized = normalizePsychiatristSettings({
    availableForConsult: true,
    languages: ["Hindi", "Hindi", "Punjabi", ""],
    experienceYears: 95,
    bio: "  Calm guidance for rural families.  ",
    consultMode: "Audio Call Only",
    sessionDurationMins: 45,
    preferredSlots: [
      "Morning · 9:30 AM - 12:00 PM",
      "Morning · 9:30 AM - 12:00 PM",
    ],
    qualification: "  MD Psychiatry ",
    specialization: "  Sleep & Stress ",
  });

  assert.deepEqual(normalized.languages, ["Hindi", "Punjabi"]);
  assert.deepEqual(normalized.preferredSlots, [
    "Morning · 9:30 AM - 12:00 PM",
  ]);
  assert.equal(normalized.experienceYears, 70);
  assert.equal(normalized.bio, "Calm guidance for rural families.");
  assert.equal(normalized.consultMode, "Audio Call Only");
  assert.equal(normalized.sessionDurationMins, 45);
  assert.equal(normalized.qualification, "MD Psychiatry");
  assert.equal(normalized.specialization, "Sleep & Stress");
});
