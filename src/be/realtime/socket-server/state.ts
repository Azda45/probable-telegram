import type { Server as SocketIOServer } from "socket.io";
import type { RedisClientType } from "redis";

type SocketServer = SocketIOServer | null;

export const globalForRealtime = globalThis as unknown as {
  realtimeSocketServer?: SocketIOServer;
  realtimeRedisAdapter?: {
    pubClient: RedisClientType;
    subClient: RedisClientType;
  };
  realtimeRedisAdapterReady?: Promise<void>;
  realtimePauseSubscriber?: RedisClientType;
  realtimePauseSubscriberReady?: Promise<void>;
};

export function getSocketServer(): SocketServer {
  return globalForRealtime.realtimeSocketServer || null;
}

export function setSocketServer(io: SocketIOServer) {
  globalForRealtime.realtimeSocketServer = io;
}
