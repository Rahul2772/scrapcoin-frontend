import { ag as useNavigate, r as reactExports, L as jsxRuntimeExports, a4 as Link, bc as Package, bg as Calendar, ah as format } from "./vendor-D_Usrqei.js";
import { B as Badge } from "./badge-BF41vIxW.js";
import { S as Skeleton } from "./skeleton-Bi4Etyvs.js";
import { u as useAuth, B as Button } from "./router-Bj6HzPyA.js";
import { B as BrandLogo } from "./brand-logo-DsYSfcsW.js";
import { N as NavAuth } from "./nav-auth-PFnwIhZm.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./supabase-BkcVLFJa.js";
import "./api-DznPMToT.js";
const STATUS_CONFIG = {
  scheduled: {
    label: "Scheduled",
    className: "bg-blue-100 text-blue-700 border-blue-200"
  },
  in_progress: {
    label: "In Progress",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200"
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-700 border-green-200"
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 border-red-200"
  }
};
const API_BASE = "http://localhost:4000";
function BookingSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-32" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-20 rounded-full" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-48" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-36" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-16 rounded-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-16 rounded-full" })
    ] })
  ] });
}
function MyBookingsPage() {
  const {
    user,
    session,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!authLoading && !user) {
      navigate({
        to: "/login"
      });
    }
  }, [user, authLoading, navigate]);
  reactExports.useEffect(() => {
    if (!session?.access_token) return;
    async function fetchBookings() {
      try {
        const res = await fetch(`${API_BASE}/api/bookings/me`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [session]);
  if (authLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-48" }) });
  }
  if (!user) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-border/60 bg-card px-4 py-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandLogo, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-semibold text-foreground hidden sm:block", children: "My Bookings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavAuth, {})
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl px-4 py-8 space-y-4", children: [
      loading && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BookingSkeleton, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BookingSkeleton, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BookingSkeleton, {})
      ] }),
      error && !loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-red-200 bg-red-50 p-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600", children: error }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "mt-3", onClick: () => window.location.reload(), children: "Try again" })
      ] }),
      !loading && !error && bookings.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-10 text-center space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "mx-auto h-12 w-12 text-muted-foreground/40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: "No bookings yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Book your first scrap pickup and it'll appear here." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "rounded-full mt-2", children: "Book a pickup" }) })
      ] }),
      !loading && !error && bookings.map((booking) => {
        const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.scheduled;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 space-y-3 transition-shadow hover:shadow-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: booking.fullName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: booking.phone })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `shrink-0 rounded-full text-xs font-medium ${status.className}`, children: status.label })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: booking.society }),
            booking.tower && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              " · ",
              booking.tower
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: format(new Date(booking.pickupDate), "EEE, d MMM yyyy") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: booking.materials.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground", children: m }, m)) })
        ] }, booking.id);
      })
    ] })
  ] });
}
export {
  MyBookingsPage as component
};
