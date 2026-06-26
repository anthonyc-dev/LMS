import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/app/store/authStore";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ||
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:3001";

let socket: Socket | null = null;

/**
 * Get (or create) a singleton Socket.IO client.
 * Automatically authenticates using the JWT from authStore.
 */
export function getSocket(): Socket | null {
  const { token, isAuthenticated } = useAuthStore.getState();

  if (!isAuthenticated || !token) {
    disconnectSocket();
    return null;
  }

  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("[Socket] Connection error:", error.message);
  });

  return socket;
}

/**
 * Disconnect and cleanup the socket connection.
 */
export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

/**
 * Reconnect with a fresh token (e.g., after token refresh).
 */
export function reconnectSocket() {
  disconnectSocket();
  getSocket();
}

// Auto-disconnect on logout
useAuthStore.subscribe((state, prevState) => {
  if (prevState.isAuthenticated && !state.isAuthenticated) {
    disconnectSocket();
  }
});
