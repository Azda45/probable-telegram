import crypto from "crypto";

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createSessionToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function createDonationStatusToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashDonationStatusToken(token: string): string {
  return hashToken(token);
}
