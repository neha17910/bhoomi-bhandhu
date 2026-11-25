import type { DemoAccountCredential, UserRole } from "./roles";

export interface StoredLocalAuthRecord {
  credential: Omit<DemoAccountCredential, "password">;
  salt: string;
  passwordHash: string;
  mustChangePassword?: boolean;
}

const PBKDF2_PREFIX = "pbkdf2_v1$";
const PBKDF2_ITERATIONS = 100_000;

export function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function sanitizePublicSignupRole(role: UserRole): UserRole {
  if (role === "warehouse_owner" || role === "psychiatrist") {
    return role;
  }
  return "farmer";
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function generateSaltHex(length = 16): string {
  const arr = new Uint8Array(length);
  globalThis.crypto.getRandomValues(arr);
  return bytesToHex(arr);
}

async function hashLegacySha256(
  password: string,
  salt: string
): Promise<string> {
  const encoded = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", encoded);
  return bytesToHex(new Uint8Array(digest));
}

export async function hashPasswordWithSalt(
  password: string,
  salt: string
): Promise<string> {
  try {
    if (globalThis.crypto?.subtle?.importKey && globalThis.crypto?.subtle?.deriveBits) {
      const enc = new TextEncoder();
      const baseKey = await globalThis.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
      );
      const bits = await globalThis.crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt: enc.encode(salt),
          iterations: PBKDF2_ITERATIONS,
          hash: "SHA-256",
        },
        baseKey,
        256
      );
      return `${PBKDF2_PREFIX}${bytesToHex(new Uint8Array(bits))}`;
    }
  } catch {
    // Fallback to SHA-256 only if PBKDF2 is unavailable in a constrained test environment
  }
  return hashLegacySha256(password, salt);
}

export async function createLocalAuthRecord(
  credential: Omit<DemoAccountCredential, "password">,
  password: string,
  mustChangePassword = false
): Promise<StoredLocalAuthRecord> {
  const salt = generateSaltHex();
  const passwordHash = await hashPasswordWithSalt(password, salt);
  return {
    credential: {
      ...credential,
      email: normalizeAuthEmail(credential.email),
    },
    salt,
    passwordHash,
    mustChangePassword,
  };
}

export async function verifyLocalAuthRecord(
  record: StoredLocalAuthRecord,
  password: string
): Promise<boolean> {
  if (!record?.salt || !record?.passwordHash || !password) {
    return false;
  }
  if (record.passwordHash.startsWith(PBKDF2_PREFIX)) {
    const computed = await hashPasswordWithSalt(password, record.salt);
    return constantTimeEqual(computed, record.passwordHash);
  }
  const legacyComputed = await hashLegacySha256(password, record.salt);
  return constantTimeEqual(legacyComputed, record.passwordHash);
}

export function toSessionCredential(
  credential: Omit<DemoAccountCredential, "password">
): DemoAccountCredential {
  return {
    ...credential,
    password: "",
  };
}
