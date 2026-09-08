import { useState, useEffect, useCallback } from "react";
import { Bell, X, MessageSquare, Home, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  apiAdminNotifications,
  apiAdminMarkNotificationRead,
  apiAdminMarkAllNotificationsRead,
  type AdminNotification,
} from "@/lib/api-admin";

export function AdminNotificationBell() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await apiAdminNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (e) {
      console.error("Notification load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAllRead = async () => {
    try {
      await apiAdminMarkAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error("Failed to mark notifications as read:", e);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiAdminMarkNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "listing":
        return <Home className="h-4 w-4" />;
      case "enquiry":
        return <MessageSquare className="h-4 w-4" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="relative"
        onClick={() => {
          setOpen(!open);
          if (!open && unreadCount > 0) {
            markAllRead();
          }
        }}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <Card className="absolute right-0 top-12 z-50 w-96 max-h-[480px] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setOpen(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="overflow-y-auto max-h-[400px]">
              {loading ? (
                <div className="p-6 text-center text-xs text-slate-500">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-900">No notifications</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    You'll see updates here when actions happen
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !n.read ? "bg-blue-50/50" : ""
                      }`}
                      onClick={() => {
                        if (!n.read) markAsRead(n.id);
                      }}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            !n.read ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {getIcon(n.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                              {n.title}
                            </p>
                            {!n.read && (
                              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(n.createdAt).toLocaleString("en-UG", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
