import { createClient, type RedisClientType } from "redis";
import { env } from "@/be/env";

const REDIS_KEEP_ALIVE_INTERVAL_MS = 30_000;

type RedisGlobal = typeof globalThis & {
  redisClient?: RedisClientType;
  redisConnection?: Promise<RedisClientType>;
  redisKeepAliveInterval?: ReturnType<typeof setInterval>;
};

const globalForRedis = globalThis as RedisGlobal;

function sanitizeRedisUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}:${parsed.port || "6379"}`;
  } catch {
    return "invalid-url";
  }
}

function createRedisClient() {
  console.log(`[redis] using ${sanitizeRedisUrl(env.REDIS_URL)}`);

  const client = createClient({
    url: env.REDIS_URL,
    socket: {
      connectTimeout: 10_000,
      keepAlive: true,
      reconnectStrategy: (retries) => Math.min(100 * 2 ** retries, 5_000),
    },
  }) as RedisClientType;

  client.on("error", (error) => {
    console.error("[redis] client error", error);
  });

  client.on("connect", () => {
    console.log("[redis] connected");
  });

  client.on("ready", () => {
    console.log("[redis] ready");
  });

  client.on("end", () => {
    console.warn("[redis] connection closed");
  });

  return client;
}

function startRedisKeepAlive(client: RedisClientType) {
  if (globalForRedis.redisKeepAliveInterval) return;

  globalForRedis.redisKeepAliveInterval = setInterval(() => {
    if (!client.isReady) return;

    client.ping().catch((error) => {
      console.warn("[redis] keep-alive ping failed", error);
    });
  }, REDIS_KEEP_ALIVE_INTERVAL_MS);

  globalForRedis.redisKeepAliveInterval.unref?.();
}

export async function getRedisClient(): Promise<RedisClientType> {
  if (globalForRedis.redisClient?.isOpen) {
    return globalForRedis.redisClient;
  }

  if (!globalForRedis.redisClient) {
    globalForRedis.redisClient = createRedisClient();
  }

  if (!globalForRedis.redisConnection) {
    globalForRedis.redisConnection = globalForRedis.redisClient.connect()
      .then(() => {
        const client = globalForRedis.redisClient as RedisClientType;
        startRedisKeepAlive(client);
        return client;
      })
      .catch((error) => {
        globalForRedis.redisConnection = undefined;
        throw error;
      });
  }

  return globalForRedis.redisConnection;
}

export async function createRedisDuplicate(): Promise<RedisClientType> {
  const baseClient = await getRedisClient();
  const duplicate = baseClient.duplicate() as RedisClientType;
  duplicate.on("error", (error) => {
    console.error("[redis] duplicate client error", error);
  });
  await duplicate.connect();
  return duplicate;
}
