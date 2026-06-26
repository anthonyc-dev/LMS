import { useEffect, useRef } from "react";
import { getSocket, disconnectSocket } from "@/shared/lib/socket";
import {
  useNotificationStore,
  type Notification,
} from "@/app/store/notificationStore";
import { useAuthStore } from "@/app/store/authStore";
import { toast } from "sonner";

/**
 * Hook that connects to the WebSocket and listens for notification events.
 * Call this once from the DashboardLayout.
 */
export function useNotificationSocket() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const addRef = useRef(addNotification);
  addRef.current = addNotification;

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    const socket = getSocket();
    if (!socket) return;

    const handleNotification = (payload: Omit<Notification, "read">) => {
      // Add to store
      addRef.current(payload);

      // Show toast based on notification type
      switch (payload.type) {
        case "BORROW_CONFIRMED":
          toast.success(payload.title, {
            description: payload.message,
          });
          break;
        case "NEW_BORROWING":
          toast.info(payload.title, {
            description: payload.message,
          });
          break;
        case "OVERDUE_WARNING":
          toast.error(payload.title, {
            description: payload.message,
          });
          break;
        case "FINE_ISSUED":
          toast.warning(payload.title, {
            description: payload.message,
          });
          break;
        default:
          toast(payload.title, {
            description: payload.message,
          });
      }
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [isAuthenticated]);
}
