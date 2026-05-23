const isProduction = process.env.NODE_ENV === "production";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`${name} is required`);
  }
  return value;
}

function requireSecret(name: string, minLength = 32): string {
  const value = requireEnv(name);
  if (value.length < minLength) {
    throw new Error(`${name} must be at least ${minLength} characters`);
  }
  return value;
}

function readInteger(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

function readBoolean(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  return raw === "true" || raw === "1";
}

function readAppUrl(): string {
  const value = process.env.NEXTAUTH_URL || process.env.APP_URL;
  if (!value) throw new Error("NEXTAUTH_URL or APP_URL is required");

  const url = new URL(value);
  const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (isProduction && !isLocalhost && url.protocol !== "https:") {
    throw new Error("NEXTAUTH_URL/APP_URL must use https in production");
  }

  return url.origin;
}

function readRedisUrl(): string {
  const directUrl = process.env.REDIS_URL?.trim();
  if (directUrl) return directUrl;

  const host = process.env.REDIS_HOST?.trim();
  if (!host) return "redis://localhost:6379";

  const port = process.env.REDIS_PORT?.trim() || "6379";
  const username = process.env.REDIS_USERNAME?.trim();
  const password = process.env.REDIS_PASSWORD ?? "";
  const protocol = readBoolean("REDIS_TLS", false) ? "rediss" : "redis";
  const auth = username || password
    ? `${username ? encodeURIComponent(username) : "default"}:${encodeURIComponent(password)}@`
    : "";

  return `${protocol}://${auth}${host}:${port}`;
}

const appUrl = readAppUrl();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: isProduction,
  APP_URL: appUrl,
  NEXTAUTH_SECRET: requireSecret("NEXTAUTH_SECRET", 32),
  DB_HOST: requireEnv("DB_HOST"),
  DB_PORT: readInteger("DB_PORT", 3306),
  DB_USER: requireEnv("DB_USER"),
  DB_PASSWORD: process.env.DB_PASSWORD ?? "",
  DB_NAME: requireEnv("DB_NAME"),
  DB_SSL: readBoolean("DB_SSL", isProduction),
  DB_POOL_LIMIT: readInteger("DB_POOL_LIMIT", 10),
  DB_QUEUE_LIMIT: readInteger("DB_QUEUE_LIMIT", 100),
  SESSION_MAX_AGE_SECONDS: readInteger("SESSION_MAX_AGE_SECONDS", 7 * 24 * 60 * 60),
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || appUrl)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  REDIS_URL: readRedisUrl(),
  API_KEY: process.env.API_KEY || "",
};
