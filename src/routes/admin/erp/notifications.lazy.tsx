import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchERPNotifications,
  markAllERPNotificationsRead,
  markERPNotificationRead,
  clearAllERPNotifications,
  type ERPNotification,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  RefreshCw,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Truck,
  User,
} from "lucide-react";

export const Route = createLazyFileRoute("/admin/erp/notifications")({
  component: ERPNotificationsPage,
});

function ERPNotificationsPage() {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<ERPNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    loadNotifications();
  }, [session]);

  async function loadNotifications() {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const data = await fetchERPNotifications(session.access_token);
      setNotifications(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAllRead() {
    if (!session?.access_token) return;
    try {
      const res = await markAllERPNotificationsRead(session.access_token);
      if (res.success) {
        toast.success("All notifications marked as read");
        // Update local state
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to mark notifications as read");
    }
  }

  async function handleMarkSingleRead(id: string) {
    if (!session?.access_token) return;
    // Optimistic local update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await markERPNotificationRead(id, session.access_token);
    } catch (err: any) {
      toast.error(err.message || "Failed to mark notification as read");
    }
  }

  async function handleClearAll() {
    if (!window.confirm("Are you sure you want to clear all notification history?")) return;
    if (!session?.access_token) return;
    try {
      const res = await clearAllERPNotifications(session.access_token);
      if (res.success) {
        toast.success("Notification history cleared");
        setNotifications([]);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to clear notifications");
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    return true;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case "new_booking":
        return <Calendar className="h-4 w-4 text-emerald-500" />;
      case "booking_status_change":
        return <CheckCircle2 className="h-4 w-4 text-amber-500" />;
      case "champion_assigned":
        return <Truck className="h-4 w-4 text-blue-500" />;
      case "customer_30_days":
        return <User className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-zinc-500" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "new_booking":
        return "border-l-4 border-emerald-500 bg-emerald-500/5";
      case "booking_status_change":
        return "border-l-4 border-amber-500 bg-amber-500/5";
      case "champion_assigned":
        return "border-l-4 border-blue-500 bg-blue-500/5";
      case "customer_30_days":
        return "border-l-4 border-amber-500 bg-amber-500/10";
      default:
        return "border-l-4 border-zinc-400 bg-zinc-400/5";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="rounded-full text-xs"
          >
            All Events ({notifications.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
            className="rounded-full text-xs"
          >
            Unread ({unreadCount})
          </Button>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadNotifications}
            disabled={loading}
            className="rounded-full text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="rounded-full text-xs gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 cursor-pointer font-medium"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="rounded-full text-xs gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Main notifications log panel */}
      {loading ? (
        <div className="flex h-60 items-center justify-center rounded-2xl border border-dashed border-border bg-card">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Fetching event logs...</span>
          </div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-6 text-center">
          <div className="rounded-full bg-muted/40 p-4 mb-4">
            <Bell className="h-10 w-10 text-muted-foreground/60" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No notification events</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
            {filter === "unread"
              ? "All caught up! No unread notification events found in log."
              : "No notification events have been logged yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.is_read) handleMarkSingleRead(n.id);
              }}
              className={`flex items-start gap-4 p-4 rounded-xl border border-border/60 transition-all hover:shadow-sm ${
                !n.is_read ? "cursor-pointer" : ""
              } ${getEventColor(n.type)} ${
                !n.is_read ? "bg-background shadow-[inset_3px_0_0_#f5a623]" : "bg-card"
              }`}
            >
              {/* Event Icon badge */}
              <div className="rounded-lg bg-background p-2 border border-border/40 shadow-sm shrink-0">
                {getEventIcon(n.type)}
              </div>

              {/* Message details */}
              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <h4 className="text-sm font-bold text-foreground truncate">{n.title}</h4>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap">
                    <Clock className="h-3 w-3" />
                    {new Date(n.created_at).toLocaleString("en-IN", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {n.message}
                </p>
              </div>

              {/* Read indicator & button */}
              <div className="flex items-center gap-2 shrink-0 self-center">
                {!n.is_read ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkSingleRead(n.id);
                    }}
                    className="h-7 text-[11px] px-2.5 rounded-lg border-amber-300 bg-amber-50/50 text-amber-700 hover:bg-amber-100 gap-1 cursor-pointer"
                    title="Click to mark as read"
                  >
                    <Check className="h-3 w-3" />
                    Mark Read
                  </Button>
                ) : (
                  <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
                    <CheckCheck className="h-3.5 w-3.5 text-muted-foreground/40" />
                    Read
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
