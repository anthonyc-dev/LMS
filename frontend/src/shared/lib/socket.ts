import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/app/store/authStore";

// Socket.IO uses the API origin, never a REST prefix or hostname substring.
const SOCKET_URL = new URL(
  import.meta.env.VITE_API_URL || "http://localhost:3000",
  window.location.origin,
).origin;

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
    auth: (callback) => callback({ token: useAuthStore.getState().token }),
    transports: ["websocket", "polling"],
    reconnection: true,
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
  if (socket) {
    // Preserve subscribers when credentials change.
    socket.disconnect().connect();
  }
}

// Auto-disconnect on logout
useAuthStore.subscribe((state, prevState) => {
  if (prevState.isAuthenticated && !state.isAuthenticated) {
    disconnectSocket();
  } else if (state.isAuthenticated && state.token !== prevState.token) {
    reconnectSocket();
  }
});
