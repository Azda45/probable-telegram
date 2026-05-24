import type { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "@/be/env";
import { HEARTBEAT_INTERVAL_MS, HEARTBEAT_TIMEOUT_MS } from "./socket-server/constants";
import { registerSocketHandlers } from "./socket-server/handlers";
import { configurePauseSubscriber, configureRedisAdapter } from "./socket-server/redis";
import { getSocketServer, setSocketServer } from "./socket-server/state";

export { getSocketServer } from "./socket-server/state";
export { emitOverlayNotification, flushQueuedOverlayNotifications } from "./socket-server/overlay-delivery";
export {
  emitOverlayPause,
  emitOverlaySettingsUpdated,
  emitOverlaySkip,
  emitOverlayRefresh,
  emitPaymentStatus,
} from "./socket-server/emitters";

export function initializeSocketServer(httpServer: HttpServer): SocketIOServer {
  const existingServer = getSocketServer();
  if (existingServer) return existingServer;

  const io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    cors: { origin: env.ALLOWED_ORIGINS, methods: ["GET", "POST"] },
    pingInterval: HEARTBEAT_INTERVAL_MS,
    pingTimeout: HEARTBEAT_TIMEOUT_MS,
    maxHttpBufferSize: 64 * 1024,
    transports: ["websocket"],
  });

  configureRedisAdapter(io).catch((error) => {
    console.error("[realtime] redis adapter unavailable; using local socket rooms", error);
  });
  configurePauseSubscriber(io).catch((error) => {
    console.error("[realtime] redis pause subscriber unavailable", error);
  });

  io.on("connection", (socket) => {
    console.log(`[realtime] connected socket=${socket.id}`);
    registerSocketHandlers(socket);
  });

  setSocketServer(io);
  console.log("[realtime] socket.io server initialized");
  return io;
}
