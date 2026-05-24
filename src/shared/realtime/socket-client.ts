type SocketHandler = (payload: unknown) => void;

export interface RealtimeClientSocket {
  id?: string;
  connected: boolean;
  disconnected?: boolean;
  on(event: string, handler: SocketHandler): void;
  off(event: string, handler?: SocketHandler): void;
  emit(event: string, payload?: unknown): void;
  disconnect(): void;
  connect(): void;
}

type SocketIoFactory = (url?: string, options?: Record<string, unknown>) => RealtimeClientSocket;

declare global {
  interface Window {
    io?: SocketIoFactory;
  }
}

let socketScriptPromise: Promise<void> | null = null;

export async function loadSocketClient(): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.io) return;
  if (socketScriptPromise) return socketScriptPromise;

  socketScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-realtime-client="socket.io"]');
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => {
        socketScriptPromise = null;
        reject(new Error("Failed to load Socket.IO client"));
      }, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "/api/socket/socket.io.js";
    script.async = true;
    script.dataset.realtimeClient = "socket.io";
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => {
      socketScriptPromise = null;
      reject(new Error("Failed to load Socket.IO client"));
    };
    document.head.appendChild(script);
  });

  return socketScriptPromise;
}

export async function createRealtimeSocket(): Promise<RealtimeClientSocket> {
  await fetch("/api/socket", { method: "GET", cache: "no-store" });
  await loadSocketClient();

  if (!window.io) {
    throw new Error("Socket.IO client unavailable");
  }

  const client = window.io(undefined, {
    path: "/api/socket",
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
    randomizationFactor: 0.5,
    timeout: 10000,
    forceNew: true,
  });
  
  if (client.disconnected) {
    client.connect();
  }
  
  return client;
}
