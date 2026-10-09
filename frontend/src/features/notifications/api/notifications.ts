import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  data?: Record<string, unknown>;
}

export interface NotificationsResponse {
  items: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

export function useNotifications() {
  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      const response = await api.get<NotificationsResponse>("/notifications", {
        params: { page: 1, limit: 50 },
      });
      return response.data;
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch<Notification>(
        `/notifications/${id}/read`,
      );
      return response.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<NotificationsResponse>(
        NOTIFICATIONS_QUERY_KEY,
        (current) => {
          if (!current) return current;
          const wasUnread = current.items.some(
            (item) => item.id === updated.id && !item.read,
          );
          return {
            ...current,
            items: current.items.map((item) =>
              item.id === updated.id ? updated : item,
            ),
            unreadCount: Math.max(0, current.unreadCount - (wasUnread ? 1 : 0)),
          };
        },
      );
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => {
      queryClient.setQueryData<NotificationsResponse>(
        NOTIFICATIONS_QUERY_KEY,
        (current) =>
          current
            ? {
                ...current,
                unreadCount: 0,
                items: current.items.map((item) => ({
                  ...item,
                  read: true,
                })),
              }
            : current,
      );
    },
  });
}

export function useDismissNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/dismiss`),
    onSuccess: (_response, id) => {
      queryClient.setQueryData<NotificationsResponse>(
        NOTIFICATIONS_QUERY_KEY,
        (current) => {
          if (!current) return current;
          const dismissed = current.items.find((item) => item.id === id);
          return {
            ...current,
            items: current.items.filter((item) => item.id !== id),
            total: Math.max(0, current.total - (dismissed ? 1 : 0)),
            unreadCount: Math.max(
              0,
              current.unreadCount - (dismissed && !dismissed.read ? 1 : 0),
            ),
          };
        },
      );
    },
  });
}

export function useDismissAllNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch("/notifications/dismiss-all"),
    onSuccess: () => {
      queryClient.setQueryData<NotificationsResponse>(
        NOTIFICATIONS_QUERY_KEY,
        (current) =>
          current
            ? { ...current, items: [], total: 0, unreadCount: 0 }
            : current,
      );
    },
  });
}
