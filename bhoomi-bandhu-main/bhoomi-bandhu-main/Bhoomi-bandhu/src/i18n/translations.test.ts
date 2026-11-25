import test from "node:test";
import assert from "node:assert/strict";
import {
  SUPPORTED_LANGUAGES,
  TRANSLATION_KEYS,
  TRANSLATIONS,
  getLanguageOption,
  isValidLanguageCode,
  translate,
} from "./translations";

test("all 11 requested languages are supported", () => {
  const expectedCodes = [
    "en",
    "hi",
    "gu",
    "mr",
    "ur",
    "pa",
    "bn",
    "ta",
    "kn",
    "ml",
    "te",
  ];
  assert.equal(SUPPORTED_LANGUAGES.length, 11);
  for (const code of expectedCodes) {
    assert.equal(isValidLanguageCode(code), true, `Missing language: ${code}`);
  }
  assert.equal(isValidLanguageCode("fr"), false);
});

test("every language dictionary defines non-empty strings for all translation keys", () => {
  for (const lang of SUPPORTED_LANGUAGES) {
    const dict = TRANSLATIONS[lang.code];
    assert.ok(dict, `Dictionary missing for ${lang.code}`);
    for (const key of TRANSLATION_KEYS) {
      const val = dict[key];
      assert.equal(
        typeof val,
        "string",
        `Key ${key} missing for ${lang.code}`
      );
      assert.ok(
        val.trim().length > 0,
        `Key ${key} is empty for ${lang.code}`
      );
    }
  }
});

test("translate and getLanguageOption return localized strings", () => {
  assert.equal(translate("hi", "nav.dashboard"), "डैशबोर्ड");
  assert.equal(translate("ta", "nav.cropAdvisor"), "பயிர் ஆலோசகர்");
  assert.equal(translate("ur", "header.changeLanguage"), "زبان تبدیل کریں");
  assert.equal(getLanguageOption("kn").englishName, "Kannada");
  assert.equal(getLanguageOption("te").englishName, "Telugu");
  assert.equal(getLanguageOption("bn").englishName, "Bengali");
});
