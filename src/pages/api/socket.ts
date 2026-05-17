import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HttpServer } from "http";
import { initializeSocketServer } from "@/lib/realtime/socket-server";

type SocketResponse = NextApiResponse & {
  socket: NextApiResponse["socket"] & {
    server: HttpServer;
  };
};

export default function handler(_req: NextApiRequest, res: SocketResponse) {
  initializeSocketServer(res.socket.server);
  res.status(200).json({ ok: true });
}
