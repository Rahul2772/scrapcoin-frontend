import { af as createLazyFileRoute, ag as useNavigate, r as reactExports, L as jsxRuntimeExports, ah as format } from "./vendor-D_Usrqei.js";
import { A as AdminLayout } from "./AdminLayout-C04oNr74.js";
import { S as Skeleton } from "./skeleton-Bi4Etyvs.js";
import { B as Badge } from "./badge-BF41vIxW.js";
import { u as useAuth } from "./router-Bj6HzPyA.js";
import { R as ResponsiveContainer, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, a as Bar } from "./recharts-vendor-Dr9Vwxef.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./brand-logo-DsYSfcsW.js";
import "./supabase-BkcVLFJa.js";
const Route = createLazyFileRoute("/admin/")({
  component: AdminDashboard
});
const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  completed: { label: "Completed", className: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 border-red-200" }
};
const API_BASE = "http://localhost:4000";
function AdminDashboard() {
  const { user, profile, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/" });
      return;
    }
    if (profile && profile.role !== "admin" && profile.role !== "champion") {
      navigate({ to: "/" });
      return;
    }
  }, [user, profile, authLoading, navigate]);
  reactExports.useEffect(() => {
    if (!session?.access_token) return;
    async function fetchBookings() {
      try {
        const res = await fetch(`${API_BASE}/api/bookings`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        if (!res.ok) throw new Error("Failed");
        setBookings(await res.json());
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [session]);
  const statusCounts = [
    "scheduled",
    "in_progress",
    "completed",
    "cancelled"
  ].map((s) => ({
    status: s.replace("_", " "),
    count: bookings.filter((b) => b.status === s).length
  }));
  const recent = bookings.slice(0, 5);
  if (authLoading || loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-48" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 rounded-2xl" }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 rounded-2xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-48 rounded-2xl" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Dashboard" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Total Bookings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-3xl font-bold text-foreground", children: bookings.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Scheduled" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-3xl font-bold text-blue-600", children: bookings.filter((b) => b.status === "scheduled").length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Completed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-3xl font-bold text-green-600", children: bookings.filter((b) => b.status === "completed").length })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-foreground mb-4", children: "Bookings by Status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: statusCounts, barSize: 40, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "status", tick: { fontSize: 12 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false, tick: { fontSize: 12 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "var(--primary)", radius: [6, 6, 0, 0] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-foreground mb-4", children: "Recent Bookings" }),
      recent.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: "No bookings yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b border-border text-left text-muted-foreground", children: ["Name", "Society", "Pickup Date", "Status"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 pr-4 font-medium", children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: recent.map((b) => {
          const s = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.scheduled;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-4 font-medium text-foreground whitespace-nowrap", children: b.fullName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-4 text-muted-foreground", children: b.society }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-4 text-muted-foreground whitespace-nowrap", children: format(new Date(b.pickupDate), "d MMM yyyy") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: "outline",
                className: `rounded-full text-xs ${s.className}`,
                children: s.label
              }
            ) })
          ] }, b.id);
        }) })
      ] }) })
    ] })
  ] }) });
}
export {
  Route
};
