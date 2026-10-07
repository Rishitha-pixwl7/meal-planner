import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export const CODE_TTL_MS = 15 * 60 * 1000;
export const RESEND_COOLDOWN_MS = 60 * 1000;
export const MAX_ATTEMPTS = 5;

export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

// Only an HMAC of the code is stored, so a leaked database doesn't expose usable codes.
export function hashCode(code: string, secret: string): string {
  return createHmac("sha256", secret).update(code).digest("hex");
}

export function codeMatches(code: string, storedHash: string, secret: string): boolean {
  const a = Buffer.from(hashCode(code, secret), "hex");
  const b = Buffer.from(storedHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function cooldownSecondsLeft(lastSentAt: Date | null, now = Date.now()): number {
  if (!lastSentAt) return 0;
  const left = RESEND_COOLDOWN_MS - (now - lastSentAt.getTime());
  return left > 0 ? Math.ceil(left / 1000) : 0;
}
