import { af as createLazyFileRoute, r as reactExports, L as jsxRuntimeExports, be as DollarSign, bf as TrendingUp, ao as Scale, bg as Calendar, ap as FileText, bh as ArrowUpRight, bi as ArrowDownRight } from "./vendor-D_Usrqei.js";
import { u as useAuth } from "./router-Bj6HzPyA.js";
import { f as fetchERPDashboard } from "./api-DznPMToT.js";
import { S as Skeleton } from "./skeleton-Bi4Etyvs.js";
import { B as Badge } from "./badge-BF41vIxW.js";
import { R as ResponsiveContainer, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, a as Bar, P as PieChart, b as Pie, c as Cell } from "./recharts-vendor-Dr9Vwxef.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./supabase-BkcVLFJa.js";
const Route = createLazyFileRoute("/admin/erp/")({
  component: ERPDashboard
});
const INVOICE_STATUS_COLORS = {
  paid: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200"
};
const CHART_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00c49f"];
function ERPDashboard() {
  const { session } = useAuth();
  const [data, setData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (!session?.access_token) return;
    async function load() {
      try {
        const res = await fetchERPDashboard(session?.access_token);
        if (res.success) {
          setData(res.dashboard);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session]);
  if (loading || !data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 rounded-2xl" }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-[300px] lg:col-span-2 rounded-2xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-[300px] rounded-2xl" })
      ] })
    ] });
  }
  const { revenue, low_stock_alerts, recent_transactions, monthly_trend, top_materials, invoice_summary, material_pnl } = data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-in fade-in duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wider", children: "Revenue (This Month)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4.5 w-4.5 text-primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-2xl font-bold text-foreground", children: [
          "₹",
          revenue.revenue_this_month.toLocaleString("en-IN")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-1 text-[10px] text-emerald-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3 w-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Active transactions" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wider", children: "Total Collected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "h-4.5 w-4.5 text-secondary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-2xl font-bold text-foreground", children: [
          revenue.weight_this_month.toLocaleString("en-IN"),
          " kg"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-1 text-[10px] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "This calendar month" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wider", children: "Purchase Count" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4.5 w-4.5 text-amber-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-2xl font-bold text-foreground", children: revenue.txn_count_this_month }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 flex items-center gap-1 text-[10px] text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "B2C receipts this month" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wider", children: "Profit & Loss" }),
          revenue.profit_loss >= 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-4.5 w-4.5 text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownRight, { className: "h-4.5 w-4.5 text-red-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `mt-2 text-2xl font-bold ${revenue.profit_loss >= 0 ? "text-emerald-600" : "text-red-600"}`, children: [
          revenue.profit_loss >= 0 ? "+" : "-",
          "₹",
          Math.abs(revenue.profit_loss).toLocaleString("en-IN")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 flex items-center gap-1 text-[10px] text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Sell ₹",
          revenue.revenue_this_month.toLocaleString("en-IN"),
          " − COGS (sold stock only)"
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-sm lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground", children: "6-Month Buy & Sell Trend" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-[11px] text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block h-2.5 w-2.5 rounded-sm", style: { background: "#3b82f6" } }),
              "Buy (from Customers)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block h-2.5 w-2.5 rounded-sm", style: { background: "#f59e0b" } }),
              "Sell (to Recyclers)"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[250px] w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: monthly_trend, barCategoryGap: "30%", barGap: 4, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, tickFormatter: (v) => `₹${v / 1e3}k` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Tooltip,
            {
              formatter: (value, name) => [
                `₹${Number(value).toLocaleString("en-IN")}`,
                name
              ],
              contentStyle: { borderRadius: "10px", fontSize: 12 }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "sell_revenue", name: "Buy (from Customers)", fill: "#3b82f6", radius: [4, 4, 0, 0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "purchase_revenue", name: "Sell (to Recyclers)", fill: "#f59e0b", radius: [4, 4, 0, 0] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground mb-4", children: "Top Materials (Revenue)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[180px] w-full relative", children: top_materials.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center text-xs text-muted-foreground", children: "No collection records this month" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Pie,
            {
              data: top_materials,
              dataKey: "revenue",
              nameKey: "name",
              cx: "50%",
              cy: "50%",
              outerRadius: 70,
              label: ({ name }) => name,
              children: top_materials.map((entry, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: entry.color_hex || CHART_COLORS[index % CHART_COLORS.length] }, `cell-${index}`))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (value) => `₹${Number(value).toLocaleString()}` })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-1.5", children: top_materials.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-full", style: { backgroundColor: m.color_hex || CHART_COLORS[i % CHART_COLORS.length] } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: m.name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-foreground", children: [
            "₹",
            m.revenue.toLocaleString()
          ] })
        ] }, m.name)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-sm lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground mb-4", children: "Recent Scale Tickets" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border text-left text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 pr-2 font-medium", children: "Txn No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 pr-2 font-medium", children: "Recycler" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 pr-2 font-medium", children: "Material" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 pr-2 font-medium", children: "Weight" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 pr-2 font-medium text-right", children: "Payout" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 text-right font-medium", children: "Invoice" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
            recent_transactions.slice(0, 5).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-2 font-semibold text-foreground whitespace-nowrap", children: t.txn_number }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-2 text-muted-foreground whitespace-nowrap truncate max-w-[120px]", children: t.supplier_name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-2 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full", style: { backgroundColor: t.color_hex } }),
                t.material_name
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 pr-2 text-muted-foreground whitespace-nowrap", children: [
                t.weight,
                " ",
                t.unit
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 pr-2 text-right font-bold text-foreground", children: [
                "₹",
                t.total_amount.toLocaleString()
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: "outline",
                  className: `rounded-full text-[10px] px-2 py-0.5 ${INVOICE_STATUS_COLORS[t.invoice_status] || "bg-gray-100"}`,
                  children: t.invoice_status.toUpperCase()
                }
              ) })
            ] }, t.id)),
            recent_transactions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "py-8 text-center text-muted-foreground", children: "No scale tickets registered." }) })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground mb-4", children: "Stock Threshold Alerts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 max-h-[250px] overflow-y-auto pr-1", children: [
          low_stock_alerts.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 border-b border-border/40 pb-3 last:border-0 last:pb-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: m.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600", children: "LOW STOCK" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[11px] text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Current Stock: ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-red-500 font-bold", children: [
                  m.stock_qty,
                  " ",
                  m.unit
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Min Threshold: ",
                m.min_threshold,
                " ",
                m.unit
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-full bg-muted rounded-full overflow-hidden mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "h-full bg-red-500 rounded-full",
                style: { width: `${Math.min(100, m.stock_qty / (m.min_threshold || 1) * 100)}%` }
              }
            ) })
          ] }, m.id)),
          low_stock_alerts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-8 text-center text-xs text-muted-foreground", children: "All materials are above minimum stock levels." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground", children: "Material-wise Profit & Loss" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "All time · Sell revenue − Buy cost" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border text-left text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 pr-4 font-medium", children: "Material" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 pr-4 font-medium text-right", children: "Bought (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 pr-4 font-medium text-right", children: "Sold (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 pr-4 font-medium text-right", children: "Sell Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 pr-4 font-medium text-right", children: "COGS (Sold)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 pr-4 font-medium text-right", children: "Inventory Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 pr-4 font-medium text-right", children: "Profit / Loss" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 font-medium text-right", children: "Margin %" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: (material_pnl || []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "py-8 text-center text-muted-foreground", children: "No transactions recorded yet." }) }) : (material_pnl || []).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-full flex-shrink-0", style: { background: m.color_hex || "#ccc" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: m.material_name })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-4 text-right text-muted-foreground", children: m.buy_weight.toFixed(2) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-4 text-right text-muted-foreground", children: m.sell_weight.toFixed(2) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 pr-4 text-right text-foreground", children: [
            "₹",
            m.sell_revenue.toLocaleString("en-IN", { maximumFractionDigits: 2 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 pr-4 text-right text-foreground", children: [
            "₹",
            m.cogs.toLocaleString("en-IN", { maximumFractionDigits: 2 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 pr-4 text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-blue-600 font-medium", children: [
              m.unsold_weight.toFixed(2),
              " kg"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground ml-1 text-[10px]", children: [
              "(₹",
              m.inventory_value.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center gap-1 font-bold ${m.profit_loss > 0 ? "text-emerald-600" : m.profit_loss < 0 ? "text-red-600" : "text-muted-foreground"}`, children: m.sell_weight === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-500 font-medium text-[10px]", children: "In Inventory" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            m.profit_loss > 0 ? "+" : "",
            "₹",
            Math.abs(m.profit_loss).toLocaleString("en-IN", { maximumFractionDigits: 2 }),
            m.profit_loss > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3 w-3" }),
            m.profit_loss < 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownRight, { className: "h-3 w-3" })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-right", children: m.sell_weight > 0 && m.cogs > 0 ? (() => {
            const margin = m.profit_margin_pct !== void 0 ? m.profit_margin_pct : Number((m.profit_loss / m.cogs * 100).toFixed(1));
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-bold ${margin > 0 ? "text-emerald-600" : margin < 0 ? "text-red-600" : "text-muted-foreground"}`, children: [
              margin > 0 ? "+" : "",
              margin,
              "%"
            ] });
          })() : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) })
        ] }, m.material_id)) }),
        (material_pnl || []).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t-2 border-border font-bold text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pt-3 pr-4 text-foreground", children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pt-3 pr-4 text-right text-muted-foreground", children: (material_pnl || []).reduce((s, m) => s + m.buy_weight, 0).toFixed(2) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pt-3 pr-4 text-right text-muted-foreground", children: (material_pnl || []).reduce((s, m) => s + m.sell_weight, 0).toFixed(2) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "pt-3 pr-4 text-right text-foreground", children: [
            "₹",
            (material_pnl || []).reduce((s, m) => s + m.sell_revenue, 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "pt-3 pr-4 text-right text-foreground", children: [
            "₹",
            (material_pnl || []).reduce((s, m) => s + m.cogs, 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "pt-3 pr-4 text-right text-blue-600", children: [
            (material_pnl || []).reduce((s, m) => s + m.unsold_weight, 0).toFixed(2),
            " kg",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground ml-1 text-[10px] font-normal", children: [
              "(₹",
              (material_pnl || []).reduce((s, m) => s + m.inventory_value, 0).toLocaleString("en-IN", { maximumFractionDigits: 0 }),
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pt-3 pr-4 text-right", children: (() => {
            const total = (material_pnl || []).reduce((s, m) => s + (m.sell_weight > 0 ? m.profit_loss : 0), 0);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 ${total >= 0 ? "text-emerald-600" : "text-red-600"}`, children: [
              total >= 0 ? "+" : "-",
              "₹",
              Math.abs(total).toLocaleString("en-IN", { maximumFractionDigits: 2 }),
              total >= 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownRight, { className: "h-3 w-3" })
            ] });
          })() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pt-3 text-right", children: (() => {
            const totalCogs = (material_pnl || []).reduce((s, m) => s + m.cogs, 0);
            const totalProfit = (material_pnl || []).reduce((s, m) => s + (m.sell_weight > 0 ? m.profit_loss : 0), 0);
            const totalMargin = totalCogs > 0 ? (totalProfit / totalCogs * 100).toFixed(1) : "0.0";
            const numMargin = Number(totalMargin);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-bold ${numMargin >= 0 ? "text-emerald-600" : "text-red-600"}`, children: [
              numMargin >= 0 ? "+" : "",
              totalMargin,
              "%"
            ] });
          })() })
        ] }) })
      ] }) })
    ] })
  ] });
}
export {
  Route
};
