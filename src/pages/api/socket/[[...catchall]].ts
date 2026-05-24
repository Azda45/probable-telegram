import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HttpServer } from "http";
import { initializeSocketServer } from "@/be/realtime/socket-server";

type SocketResponse = NextApiResponse & {
  socket: NextApiResponse["socket"] & {
    server: HttpServer;
  };
};

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(req: NextApiRequest, res: SocketResponse) {
  initializeSocketServer(res.socket.server);

  const url = req.url || "";
  const isInitialization = url === "/api/socket" || url === "/api/socket/";

  if (!isInitialization) {
    // Let Socket.IO handle this request internally
    return;
  }

  res.status(200).json({ ok: true });
}
