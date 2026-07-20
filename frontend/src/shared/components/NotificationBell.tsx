import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { useNotificationStore } from "@/app/store/notificationStore";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "BORROW_CONFIRMED":
      return "📚";
    case "NEW_BORROWING":
      return "📖";
    case "OVERDUE_WARNING":
      return "⏰";
    case "FINE_ISSUED":
      return "💰";
    default:
      return "🔔";
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const clearAll = useNotificationStore((s) => s.clearAll);
  const removeNotification = useNotificationStore((s) => s.removeNotification);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        }
      />

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] rounded-2xl border border-slate-100 bg-white p-0 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-black text-slate-900">Notifications</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 gap-1 rounded-lg px-2 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-7 gap-1 rounded-lg px-2 text-[11px] font-semibold text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              >
                <Trash2 className="size-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="mb-3 size-10 text-slate-200" />
              <p className="text-sm font-semibold text-slate-400">
                No notifications yet
              </p>
              <p className="text-xs text-slate-300">
                You'll see real-time updates here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`group flex items-start gap-3 border-b border-slate-50 px-4 py-3 transition-colors last:border-none ${
                  notification.read
                    ? "bg-white"
                    : "bg-blue-50/40 hover:bg-blue-50/60"
                }`}
              >
                {/* Icon */}
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm">
                  {getNotificationIcon(notification.type)}
                </span>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm leading-snug ${
                        notification.read
                          ? "font-medium text-slate-600"
                          : "font-bold text-slate-900"
                      }`}
                    >
                      {notification.title}
                    </p>
                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                          title="Mark as read"
                        >
                          <Check className="size-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-red-500"
                        title="Dismiss"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-slate-300">
                    {timeAgo(notification.createdAt)}
                  </p>
                </div>

                {/* Unread dot */}
                {!notification.read && (
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-blue-500" />
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
