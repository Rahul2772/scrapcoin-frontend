import { L as jsxRuntimeExports, bq as Phone, bs as Mail, bu as MapPin, a4 as Link, bM as Instagram, bN as Facebook, bO as Twitter } from "./vendor-D_Usrqei.js";
import { B as BrandLogo } from "./brand-logo-DsYSfcsW.js";
function Footer() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "border-t border-border/60 bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BrandLogo, { size: 40, showTagline: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-xs text-muted-foreground leading-relaxed font-medium", children: "Waste to Worth — making scrap pickup transparent, tech-enabled, and instant across Noida & Greater Noida." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-foreground", children: "Contact Us" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-4 space-y-2.5 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4 text-primary shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "+91 72920 16625" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4 text-primary shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "break-all", children: "bookings.scrapco@gmail.com" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-primary shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Noida & Greater Noida" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-foreground", children: "Service Area" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-4 space-y-1.5 text-xs text-muted-foreground font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Greater Noida" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Indirapuram" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Noida" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-[10px] font-normal italic text-muted-foreground/75 pt-1", children: "More areas coming soon" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-foreground", children: "Company" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-4 space-y-2 text-xs text-muted-foreground font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/about", className: "hover:text-foreground transition-colors", children: "About Us" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/faq", className: "hover:text-foreground transition-colors", children: "FAQ" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/impact", className: "hover:text-foreground transition-colors", children: "Impact / Sustainability" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/careers", className: "hover:text-foreground transition-colors", children: "Careers" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/partner", className: "hover:text-foreground transition-colors", children: "Partner with Us" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/terms", className: "hover:text-foreground transition-colors", children: "Terms of Service" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/privacy", className: "hover:text-foreground transition-colors", children: "Privacy Policy" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex gap-2", children: [
          { Icon: Instagram, href: "https://www.instagram.com/scrapco.in", label: "Instagram" },
          { Icon: Facebook, href: "https://www.facebook.com/share/19DUEDLcYa", label: "Facebook" },
          { Icon: Twitter, href: "https://x.com/thescrapcoin", label: "Twitter" }
        ].map(({ Icon, href, label }, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href,
            className: "grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
            "aria-label": label,
            target: "_blank",
            rel: "noreferrer noopener",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" })
          },
          i
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border/60 py-5 text-center text-xs text-muted-foreground", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " The Scrap Co. All rights reserved."
    ] })
  ] });
}
export {
  Footer as F
};
