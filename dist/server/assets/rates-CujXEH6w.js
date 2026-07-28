import { r as reactExports, L as jsxRuntimeExports, a4 as Link, bo as Search, bw as RefreshCw, bg as Calendar } from "./vendor-D_Usrqei.js";
import { B as BrandLogo } from "./brand-logo-DsYSfcsW.js";
import { B as Button } from "./router-Bj6HzPyA.js";
import { I as Input } from "./input-B46-WYs4.js";
import { S as Skeleton } from "./skeleton-Bi4Etyvs.js";
import { F as Footer } from "./Footer-BlIWbOS0.js";
import { N as NavAuth } from "./nav-auth-PFnwIhZm.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./supabase-BkcVLFJa.js";
import "./api-DznPMToT.js";
const API_BASE = "http://localhost:4000";
function RatesPage() {
  const [categories, setCategories] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    fetchCategories();
  }, []);
  async function fetchCategories() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/scrap-categories`);
      if (!res.ok) throw new Error("Failed to fetch rates");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load pricing");
    } finally {
      setLoading(false);
    }
  }
  const filteredCategories = categories.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandLogo, { size: 60 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mr-2", children: "← Back to Home" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavAuth, {})
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden py-12 border-b border-border/60", style: {
      background: "var(--gradient-soft)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full opacity-25 blur-3xl", style: {
        background: "var(--gradient-hero)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto max-w-3xl px-4 text-center space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary", children: "Updated Daily • Noida Area" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight sm:text-4xl", children: "Scrap Category Rates" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm sm:text-base max-w-xl mx-auto", children: "Zero guesswork. We use certified digital scales and pay instant market rates per kilogram directly to your bank account." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 mx-auto w-full max-w-3xl px-4 py-8 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:max-w-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search category (e.g. Copper, Paper)", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-9 rounded-xl border border-border bg-card" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 w-full sm:w-auto justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: fetchCategories, disabled: loading, className: "rounded-xl cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}` }),
            "Refresh"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", hash: "booking", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "rounded-xl cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5 mr-1.5" }),
            "Book Pickup"
          ] }) })
        ] })
      ] }),
      loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 rounded-2xl border border-border/60 bg-card p-5", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-3 border-b border-border/40 last:border-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-40 animate-pulse" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-20 animate-pulse" })
      ] }, i)) }),
      error && !loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive-foreground", children: error }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "mt-3 cursor-pointer", onClick: fetchCategories, children: "Try again" })
      ] }),
      !loading && !error && filteredCategories.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-10 text-center text-muted-foreground", children: [
        'No scrap categories found matching "',
        searchQuery,
        '".'
      ] }),
      !loading && !error && filteredCategories.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm", style: {
        boxShadow: "var(--shadow-card)"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full border-collapse text-left text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/40 font-medium text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4", children: "Scrap Item" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Price per Unit" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: filteredCategories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/20 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 font-semibold text-foreground", children: c.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-right font-bold text-primary", children: [
            "₹ ",
            c.pricePerUnit.toFixed(2),
            " / ",
            c.unit
          ] })
        ] }, c.id)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-xs text-muted-foreground pt-4", children: "Note: Prices are subject to slight market revisions based on global recycling commodity rates." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
export {
  RatesPage as component
};
