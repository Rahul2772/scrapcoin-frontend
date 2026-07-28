import { af as createLazyFileRoute, ag as useNavigate, ak as useRouterState, r as reactExports, L as jsxRuntimeExports, al as LayoutDashboard, am as Boxes, an as Truck, ao as Scale, ap as FileText, aq as Users, ar as Receipt, as as MessageSquare, at as Bell, a4 as Link, a6 as Outlet } from "./vendor-D_Usrqei.js";
import { u as useAuth, B as Button } from "./router-Bj6HzPyA.js";
import { A as AdminLayout } from "./AdminLayout-C04oNr74.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./supabase-BkcVLFJa.js";
import "./brand-logo-DsYSfcsW.js";
const Route = createLazyFileRoute("/admin/erp")({
  component: ERPLayout
});
const ERP_TABS = [
  { to: "/admin/erp", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/erp/materials", label: "Materials", icon: Boxes, exact: false },
  { to: "/admin/erp/suppliers", label: "Recyclers", icon: Truck, exact: false },
  { to: "/admin/erp/transactions", label: "Scale Entry", icon: Scale, exact: false },
  { to: "/admin/erp/invoices", label: "Invoices", icon: FileText, exact: false },
  { to: "/admin/erp/customers", label: "Customers (B2C)", icon: Users, exact: false },
  { to: "/admin/erp/receipts", label: "Receipts (B2C)", icon: Receipt, exact: false },
  { to: "/admin/erp/whatsapp", label: "WhatsApp Logs", icon: MessageSquare, exact: false },
  { to: "/admin/erp/notifications", label: "Notifications", icon: Bell, exact: false }
];
function ERPLayout() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useRouterState({ select: (s) => s.location });
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
  if (authLoading) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 border-b border-border/60 pb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "ERP Management" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Manage B2B scale ticket entries, recycler invoices, material inventory, and B2C customer metrics." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20", children: "ERP Panel" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin", children: ERP_TABS.map((tab) => {
        const active = tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: tab.to, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: active ? "default" : "ghost",
            size: "sm",
            className: "rounded-full text-xs gap-1.5 shrink-0 cursor-pointer",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(tab.icon, { className: "h-3.5 w-3.5" }),
              tab.label
            ]
          }
        ) }, tab.to);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[450px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
  ] }) });
}
export {
  Route
};
