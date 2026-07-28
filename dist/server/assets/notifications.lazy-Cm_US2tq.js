import { af as createLazyFileRoute, r as reactExports, ai as toast, L as jsxRuntimeExports, bw as RefreshCw, bx as CheckCheck, aE as Trash2, at as Bell, by as Clock, aV as Check, bz as User, an as Truck, bm as CircleCheck, bg as Calendar } from "./vendor-D_Usrqei.js";
import { u as useAuth, B as Button } from "./router-Bj6HzPyA.js";
import { r as fetchERPNotifications, t as markAllERPNotificationsRead, v as clearAllERPNotifications, w as markERPNotificationRead } from "./api-DznPMToT.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./supabase-BkcVLFJa.js";
const Route = createLazyFileRoute("/admin/erp/notifications")({
  component: ERPNotificationsPage
});
function ERPNotificationsPage() {
  const { session } = useAuth();
  const [notifications, setNotifications] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [filter, setFilter] = reactExports.useState("all");
  reactExports.useEffect(() => {
    loadNotifications();
  }, [session]);
  async function loadNotifications() {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const data = await fetchERPNotifications(session.access_token);
      setNotifications(data);
    } catch (err) {
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
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch (err) {
      toast.error(err.message || "Failed to mark notifications as read");
    }
  }
  async function handleMarkSingleRead(id) {
    if (!session?.access_token) return;
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    try {
      await markERPNotificationRead(id, session.access_token);
    } catch (err) {
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
    } catch (err) {
      toast.error(err.message || "Failed to clear notifications");
    }
  }
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    return true;
  });
  const getEventIcon = (type) => {
    switch (type) {
      case "new_booking":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-emerald-500" });
      case "booking_status_change":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-amber-500" });
      case "champion_assigned":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-4 w-4 text-blue-500" });
      case "customer_30_days":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 text-amber-500" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4 text-zinc-500" });
    }
  };
  const getEventColor = (type) => {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: filter === "all" ? "default" : "outline",
            size: "sm",
            onClick: () => setFilter("all"),
            className: "rounded-full text-xs",
            children: [
              "All Events (",
              notifications.length,
              ")"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: filter === "unread" ? "default" : "outline",
            size: "sm",
            onClick: () => setFilter("unread"),
            className: "rounded-full text-xs",
            children: [
              "Unread (",
              unreadCount,
              ")"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: loadNotifications,
            disabled: loading,
            className: "rounded-full text-xs gap-1.5 cursor-pointer",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-3 w-3 ${loading ? "animate-spin" : ""}` }),
              "Refresh"
            ]
          }
        ),
        unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: handleMarkAllRead,
            className: "rounded-full text-xs gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 cursor-pointer font-medium",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "h-3.5 w-3.5" }),
              "Mark All Read"
            ]
          }
        ),
        notifications.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: handleClearAll,
            className: "rounded-full text-xs gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 cursor-pointer",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
              "Clear All"
            ]
          }
        )
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-60 items-center justify-center rounded-2xl border border-dashed border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-8 w-8 animate-spin text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-medium", children: "Fetching event logs..." })
    ] }) }) : filteredNotifications.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full bg-muted/40 p-4 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-10 w-10 text-muted-foreground/60" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-foreground", children: "No notification events" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 max-w-[280px]", children: filter === "unread" ? "All caught up! No unread notification events found in log." : "No notification events have been logged yet." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filteredNotifications.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        onClick: () => {
          if (!n.is_read) handleMarkSingleRead(n.id);
        },
        className: `flex items-start gap-4 p-4 rounded-xl border border-border/60 transition-all hover:shadow-sm ${!n.is_read ? "cursor-pointer" : ""} ${getEventColor(n.type)} ${!n.is_read ? "bg-background shadow-[inset_3px_0_0_#f5a623]" : "bg-card"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-background p-2 border border-border/40 shadow-sm shrink-0", children: getEventIcon(n.type) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-foreground truncate", children: n.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
                new Date(n.created_at).toLocaleString("en-IN", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                  day: "numeric",
                  month: "short"
                })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground leading-relaxed font-medium", children: n.message })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 shrink-0 self-center", children: !n.is_read ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: (e) => {
                e.stopPropagation();
                handleMarkSingleRead(n.id);
              },
              className: "h-7 text-[11px] px-2.5 rounded-lg border-amber-300 bg-amber-50/50 text-amber-700 hover:bg-amber-100 gap-1 cursor-pointer",
              title: "Click to mark as read",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }),
                "Mark Read"
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground/60 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "h-3.5 w-3.5 text-muted-foreground/40" }),
            "Read"
          ] }) })
        ]
      },
      n.id
    )) })
  ] });
}
export {
  Route
};
