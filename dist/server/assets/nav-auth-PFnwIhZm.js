import { ag as useNavigate, r as reactExports, L as jsxRuntimeExports, a4 as Link, at as Bell, bg as Calendar, bm as CircleCheck, an as Truck, bd as LogOut, ai as toast } from "./vendor-D_Usrqei.js";
import { u as useAuth, T as TooltipProvider, e as Tooltip, f as TooltipTrigger, A as Avatar, h as AvatarFallback, i as TooltipContent, P as Popover, j as PopoverTrigger, k as PopoverContent, B as Button } from "./router-Bj6HzPyA.js";
import { r as fetchERPNotifications, t as markAllERPNotificationsRead } from "./api-DznPMToT.js";
function NavAuth() {
  const { user, profile, session, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = reactExports.useState([]);
  const [unreadCount, setUnreadCount] = reactExports.useState(0);
  reactExports.useEffect(() => {
    if (!user || profile?.role !== "admin" && profile?.role !== "champion") return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 15e3);
    return () => clearInterval(interval);
  }, [user, profile]);
  async function loadNotifications() {
    try {
      const data = await fetchERPNotifications(session?.access_token || void 0);
      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.is_read).length);
    } catch {
    }
  }
  async function handleMarkAllRead() {
    try {
      const res = await markAllERPNotificationsRead(session?.access_token || void 0);
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        toast.success("Notifications marked as read");
      }
    } catch (err) {
      toast.error(err.message || "Failed to mark notifications read");
    }
  }
  async function handleSignOut() {
    try {
      await signOut();
      toast.success("Signed out");
      await navigate({ to: "/" });
    } catch {
      toast.error("Failed to sign out");
    }
  }
  if (loading) return null;
  if (user) {
    const userInitials = user.email ? user.email.slice(0, 2).toUpperCase() : "U";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-full border border-border/80 bg-background/85 backdrop-blur-md pl-3 pr-2.5 py-1.5 shadow-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-r border-border/60 pr-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-6 w-6 border border-border cursor-help", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-[10px] font-bold bg-primary/10 text-primary", children: userInitials }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TooltipContent, { side: "bottom", align: "end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium", children: "Logged in as:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] opacity-80", children: user.email })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden lg:inline text-xs font-medium text-foreground max-w-[120px] truncate", title: user.email, children: user.email })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/my-bookings",
          className: "text-xs font-medium text-muted-foreground hover:text-foreground transition-colors",
          children: "My Bookings"
        }
      ),
      (profile?.role === "admin" || profile?.role === "champion") && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/admin",
          className: "text-xs font-medium text-muted-foreground hover:text-foreground transition-colors",
          children: profile.role === "champion" ? "Champion Panel ⚙️" : "Admin ⚙️"
        }
      ),
      (profile?.role === "admin" || profile?.role === "champion") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "relative p-1 hover:bg-muted rounded-full transition-colors cursor-pointer flex items-center justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4 text-muted-foreground hover:text-foreground" }),
          unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-0.5 -right-0.5 flex h-2 w-2 rounded-full bg-amber-500 ring-2 ring-background animate-pulse" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(PopoverContent, { className: "w-80 p-0 rounded-2xl shadow-xl border border-border/80 bg-background/95 backdrop-blur-md z-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border/60 px-4 py-3 bg-muted/20 rounded-t-2xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold text-foreground flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-3.5 w-3.5 text-primary" }),
              "Recent Events"
            ] }),
            unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: handleMarkAllRead,
                className: "text-[10px] font-semibold text-primary hover:underline cursor-pointer",
                children: "Mark all read"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/50 max-h-64 overflow-y-auto", children: notifications.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-8 text-center px-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-8 w-8 text-muted-foreground/45 mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-foreground", children: "No recent events" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground mt-0.5", children: "You're all caught up!" })
          ] }) : notifications.slice(0, 5).map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `p-3 transition-colors hover:bg-muted/30 flex gap-2.5 ${!n.is_read ? "bg-primary/5" : ""}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 shrink-0", children: n.type === "new_booking" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5 text-emerald-500" }) : n.type === "booking_status_change" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-amber-500" }) : n.type === "champion_assigned" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-3.5 w-3.5 text-blue-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-3.5 w-3.5 text-zinc-500" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 space-y-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-foreground truncate", children: n.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground whitespace-nowrap", children: new Date(n.created_at).toLocaleDateString("en-IN") })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground line-clamp-2 leading-relaxed", children: n.message })
                ] })
              ]
            },
            n.id
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border/60 p-2 text-center bg-muted/10 rounded-b-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/admin/erp/notifications",
              className: "block text-[11px] font-bold text-primary hover:text-primary/95 py-1",
              children: "View all notifications"
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: "h-6 w-6 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer",
          onClick: handleSignOut,
          title: "Sign out",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-3.5 w-3.5" })
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "rounded-full shadow-sm hover:shadow", children: "Sign in" }) });
}
export {
  NavAuth as N
};
