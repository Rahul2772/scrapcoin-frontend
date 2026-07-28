import { r as reactExports, L as jsxRuntimeExports, a4 as Link, b5 as X, b9 as Menu } from "./vendor-D_Usrqei.js";
import { B as BrandLogo } from "./brand-logo-DsYSfcsW.js";
import { B as Button } from "./router-Bj6HzPyA.js";
import { N as NavAuth } from "./nav-auth-PFnwIhZm.js";
const NAV_LINKS = [
  { to: "/about", label: "About" },
  { to: "/rates", label: "Rates" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" }
];
function Header() {
  const [mobileOpen, setMobileOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "w-full text-white text-center py-2 px-4 text-[11px] sm:text-xs font-semibold flex items-center justify-center shrink-0 z-50",
        style: { backgroundColor: "#1a6b3a", minHeight: "36px" },
        children: "🎉 Now serving Noida, Greater Noida & Indirapuram — Book your pickup today"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", "aria-label": "The Scrap Co. home", onClick: () => setMobileOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandLogo, { size: 60 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground", children: NAV_LINKS.map(({ to, label }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to,
            className: "hover:text-foreground transition-colors",
            activeProps: { className: "text-foreground font-bold" },
            children: label
          },
          to
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", hash: "booking", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "rounded-full shadow-sm cursor-pointer", children: "Schedule a Pickup" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NavAuth, {})
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex md:hidden items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(NavAuth, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setMobileOpen((o) => !o),
              className: "p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
              "aria-label": mobileOpen ? "Close menu" : "Open menu",
              "aria-expanded": mobileOpen,
              children: mobileOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-5 w-5" })
            }
          )
        ] })
      ] }),
      mobileOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden border-t border-border/60 bg-background/95 backdrop-blur-md px-4 pb-4 pt-3 flex flex-col gap-1 animate-in slide-in-from-top-2 duration-200", children: [
        NAV_LINKS.map(({ to, label }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to,
            className: "block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
            activeProps: { className: "text-foreground font-bold bg-accent" },
            onClick: () => setMobileOpen(false),
            children: label
          },
          to
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 pt-2 border-t border-border/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", hash: "booking", onClick: () => setMobileOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "w-full rounded-full shadow-sm cursor-pointer", children: "Schedule a Pickup" }) }) })
      ] })
    ] })
  ] });
}
export {
  Header as H
};
