import test from "node:test";
import assert from "node:assert/strict";
import { getSafeExternalUrl, stripCrlf } from "./safeUrl";

test("getSafeExternalUrl permits valid https and http URLs", () => {
  assert.equal(
    getSafeExternalUrl("https://pmkisan.gov.in/RegistrationFormNew.aspx"),
    "https://pmkisan.gov.in/RegistrationFormNew.aspx"
  );
  assert.equal(
    getSafeExternalUrl("  http://localhost:3000/auth  "),
    "http://localhost:3000/auth"
  );
});

test("getSafeExternalUrl blocks javascript:, data:, vbscript:, and malformed URLs", () => {
  assert.equal(getSafeExternalUrl("javascript:alert(1)"), null);
  assert.equal(getSafeExternalUrl("JAVASCRIPT:alert(document.cookie)"), null);
  assert.equal(
    getSafeExternalUrl("data:text/html,<script>alert(1)</script>"),
    null
  );
  assert.equal(getSafeExternalUrl("vbscript:msgbox(1)"), null);
  assert.equal(getSafeExternalUrl("file:///etc/passwd"), null);
  assert.equal(getSafeExternalUrl("not a url"), null);
  assert.equal(getSafeExternalUrl(""), null);
});

test("stripCrlf removes newline and null header injection sequences", () => {
  assert.equal(
    stripCrlf("Meera Nair\r\nBcc: attacker@evil.com\0"),
    "Meera Nair Bcc: attacker@evil.com"
  );
});
