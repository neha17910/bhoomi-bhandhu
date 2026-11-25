import test from "node:test";
import assert from "node:assert/strict";
import {
  SlidingWindowRateLimiter,
  sanitizePortalUrl,
  signServerSessionToken,
  stripEmailHeaderInjection,
  verifyServerSessionToken,
} from "./serverSecurity";

test("signServerSessionToken and verifyServerSessionToken validate authentic tokens and reject tampering", () => {
  const secret = "test-secret-key-at-least-32-bytes-long";
  const token = signServerSessionToken(
    { uid: "user-123", email: "Meera@BhoomiBandhu.in", role: "support_staff" },
    secret,
    60_000
  );

  const verified = verifyServerSessionToken(token, secret);
  assert.ok(verified);
  assert.equal(verified.uid, "user-123");
  assert.equal(verified.email, "meera@bhoomibandhu.in");
  assert.equal(verified.role, "support_staff");

  // Tampered payload fails HMAC check
  const [payload, sig] = token.split(".");
  assert.equal(verifyServerSessionToken(`${payload}x.${sig}`, secret), null);
  assert.equal(verifyServerSessionToken(token, "wrong-secret"), null);
});

test("verifyServerSessionToken rejects expired tokens", () => {
  const secret = "test-secret-key-at-least-32-bytes-long";
  const token = signServerSessionToken(
    { uid: "user-123", email: "farmer@example.com", role: "farmer" },
    secret,
    -1000
  );
  assert.equal(verifyServerSessionToken(token, secret), null);
});

test("sanitizePortalUrl rejects javascript: and unapproved hosts while normalizing safe origins", () => {
  assert.equal(
    sanitizePortalUrl("https://bhoomibandhu.example/auth?x=1"),
    "https://bhoomibandhu.example"
  );
  assert.equal(
    sanitizePortalUrl("http://localhost:3000/support-desk"),
    "http://localhost:3000"
  );
  assert.equal(
    sanitizePortalUrl("javascript:alert(1)", "https://bhoomibandhu.in"),
    "https://bhoomibandhu.in"
  );
  assert.equal(
    sanitizePortalUrl("http://evil.example/phish", "https://bhoomibandhu.in"),
    "https://bhoomibandhu.in"
  );
});

test("stripEmailHeaderInjection strips CRLF and null characters", () => {
  assert.equal(
    stripEmailHeaderInjection("Vikram\r\nCc: bad@evil.test\0"),
    "Vikram Cc: bad@evil.test"
  );
});

test("SlidingWindowRateLimiter enforces request limits and resets after window", () => {
  const limiter = new SlidingWindowRateLimiter(3, 1000);
  assert.equal(limiter.check("ip-1", 100).allowed, true);
  assert.equal(limiter.check("ip-1", 200).allowed, true);
  assert.equal(limiter.check("ip-1", 300).allowed, true);

  const blocked = limiter.check("ip-1", 400);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSec >= 1);

  // Separate client IP unaffected
  assert.equal(limiter.check("ip-2", 400).allowed, true);

  // Window slides past 1100ms
  assert.equal(limiter.check("ip-1", 1150).allowed, true);
});
