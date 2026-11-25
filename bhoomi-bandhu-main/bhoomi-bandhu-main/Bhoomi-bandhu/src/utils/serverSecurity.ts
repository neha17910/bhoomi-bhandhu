import crypto from "crypto";

export interface ServerSessionPayload {
  uid: string;
  email: string;
  role: string;
  exp: number;
}

function toBase64Url(input: string): string {
  return Buffer.from(input, "utf-8").toString("base64url");
}

function fromBase64Url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf-8");
}

export function signServerSessionToken(
  payload: Omit<ServerSessionPayload, "exp">,
  secret: string,
  ttlMs = 12 * 60 * 60 * 1000
): string {
  const fullPayload: ServerSessionPayload = {
    uid: payload.uid,
    email: payload.email.trim().toLowerCase(),
    role: payload.role,
    exp: Date.now() + ttlMs,
  };
  const encodedPayload = toBase64Url(JSON.stringify(fullPayload));
  const sig = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${sig}`;
}

export function verifyServerSessionToken(
  token: string | undefined,
  secret: string
): ServerSessionPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encodedPayload, sig] = parts;
  if (!encodedPayload || !sig) return null;

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  const sigBuf = Buffer.from(sig, "utf-8");
  const expectedBuf = Buffer.from(expectedSig, "utf-8");
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const parsed = JSON.parse(
      fromBase64Url(encodedPayload)
    ) as ServerSessionPayload;
    if (
      !parsed ||
      typeof parsed.uid !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.role !== "string" ||
      typeof parsed.exp !== "number" ||
      Date.now() > parsed.exp
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function sanitizePortalUrl(
  rawUrl: unknown,
  fallbackUrl = "https://bhoomibandhu.in"
): string {
  if (typeof rawUrl !== "string") return fallbackUrl;
  const trimmed = rawUrl.trim().slice(0, 200);
  try {
    const parsed = new URL(trimmed);
    const isHttps = parsed.protocol === "https:";
    const isLocalHttp =
      parsed.protocol === "http:" &&
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1");
    if (!isHttps && !isLocalHttp) return fallbackUrl;
    return parsed.origin;
  } catch {
    return fallbackUrl;
  }
}

export function stripEmailHeaderInjection(value: string): string {
  return value.replace(/[\r\n\0]+/g, " ").trim();
}

export class SlidingWindowRateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly hits = new Map<string, number[]>();

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(key: string, nowMs = Date.now()): {
    allowed: boolean;
    remaining: number;
    retryAfterSec: number;
  } {
    const cutoff = nowMs - this.windowMs;
    const prev = this.hits.get(key) || [];
    const recent = prev.filter((ts) => ts > cutoff);

    if (recent.length >= this.maxRequests) {
      const oldest = recent[0] ?? nowMs;
      const retryAfterSec = Math.max(
        1,
        Math.ceil((oldest + this.windowMs - nowMs) / 1000)
      );
      this.hits.set(key, recent);
      return { allowed: false, remaining: 0, retryAfterSec };
    }

    recent.push(nowMs);
    this.hits.set(key, recent);

    if (this.hits.size > 5000) {
      for (const [k, stamps] of this.hits.entries()) {
        if (stamps.every((ts) => ts <= cutoff)) {
          this.hits.delete(k);
        }
      }
    }

    return {
      allowed: true,
      remaining: Math.max(0, this.maxRequests - recent.length),
      retryAfterSec: 0,
    };
  }
}
