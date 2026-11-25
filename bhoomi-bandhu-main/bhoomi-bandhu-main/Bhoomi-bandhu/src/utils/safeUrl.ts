/**
 * Validates and normalizes external URLs to prevent javascript:, data:, or
 * other unsafe URI schemes from reaching DOM anchor links.
 */
export function getSafeExternalUrl(rawUrl?: string | null): string | null {
  if (typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.length > 500) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function stripCrlf(value: string): string {
  return value.replace(/[\r\n\0]+/g, " ").trim();
}
