import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket, disconnectSocket } from "@/shared/lib/socket";
import {
  type Notification,
  type NotificationsResponse,
  NOTIFICATIONS_QUERY_KEY,
} from "@/features/notifications/api/notifications";
import { useAuthStore } from "@/app/store/authStore";
import { toast } from "sonner";

/**
 * Hook that connects to the WebSocket and listens for notification events.
 * Call this once from the DashboardLayout.
 */
export function useNotificationSocket() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    const socket = getSocket();
    if (!socket) return;

    const handleNotification = (payload: Notification) => {
      queryClient.setQueryData<NotificationsResponse>(
        NOTIFICATIONS_QUERY_KEY,
        (current) => {
          if (!current) {
            return {
              items: [payload],
              total: 1,
              unreadCount: payload.read ? 0 : 1,
              page: 1,
              limit: 50,
            };
          }
          if (current.items.some((item) => item.id === payload.id)) {
            return current;
          }
          return {
            ...current,
            items: [payload, ...current.items].slice(0, current.limit),
            total: current.total + 1,
            unreadCount: current.unreadCount + (payload.read ? 0 : 1),
          };
        },
      );

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

    const syncMissedNotifications = () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    };

    socket.on("notification", handleNotification);
    socket.on("connect", syncMissedNotifications);
    syncMissedNotifications();

    return () => {
      socket.off("notification", handleNotification);
      socket.off("connect", syncMissedNotifications);
    };
  }, [isAuthenticated, queryClient]);
}
