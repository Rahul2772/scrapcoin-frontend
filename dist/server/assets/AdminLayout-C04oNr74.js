import { b0 as Root, b1 as Trigger, r as reactExports, L as jsxRuntimeExports, b2 as Portal, b3 as Content, b4 as Close, b5 as X, b6 as Title, b7 as Overlay, N as cva, b8 as Description, a4 as Link, b9 as Menu, ak as useRouterState, ag as useNavigate, al as LayoutDashboard, ba as PackageSearch, bb as Tags, aq as Users, bc as Package, bd as LogOut, ai as toast } from "./vendor-D_Usrqei.js";
import { c as cn, B as Button, u as useAuth } from "./router-Bj6HzPyA.js";
import { B as BrandLogo } from "./brand-logo-DsYSfcsW.js";
const Sheet = Root;
const SheetTrigger = Trigger;
const SheetPortal = Portal;
const SheetOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = reactExports.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(SheetOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(Content, { ref, className: cn(sheetVariants({ side }), className), ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
    ] }),
    children
  ] })
] }));
SheetContent.displayName = Content.displayName;
const SheetHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
SheetHeader.displayName = "SheetHeader";
const SheetTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  }
));
SheetTitle.displayName = Title.displayName;
const SheetDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
SheetDescription.displayName = Description.displayName;
const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/bookings", label: "Bookings", icon: PackageSearch, exact: false },
  { to: "/admin/categories", label: "Categories", icon: Tags, exact: false },
  { to: "/admin/users", label: "Users", icon: Users, exact: false },
  { to: "/admin/erp", label: "ERP Management", icon: Package, exact: false }
];
function NavLinks({ onClose }) {
  const { pathname } = useRouterState({ select: (s) => s.location });
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  async function handleSignOut() {
    try {
      await signOut();
      toast.success("Signed out");
      await navigate({ to: "/" });
    } catch {
      toast.error("Failed to sign out");
    }
  }
  const filteredNavItems = NAV_ITEMS.filter(({ to }) => {
    if (profile?.role === "champion") {
      return to === "/admin" || to === "/admin/bookings";
    }
    return true;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex flex-col gap-1 flex-1", children: [
    filteredNavItems.map(({ to, label, icon: Icon, exact }) => {
      const active = exact ? pathname === to : pathname.startsWith(to);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to,
          onClick: onClose,
          className: `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 shrink-0" }),
            label
          ]
        },
        to
      );
    }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-auto pt-4 border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: handleSignOut,
        className: "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4 shrink-0" }),
          "Sign out"
        ]
      }
    ) })
  ] });
}
function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden lg:flex w-60 shrink-0 flex-col border-r border-border bg-card px-4 py-6 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandLogo, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3", children: "Admin Panel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NavLinks, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "lg:hidden flex items-center justify-between border-b border-border bg-card px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandLogo, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Sheet, { open: mobileOpen, onOpenChange: setMobileOpen, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", children: mobileOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-5 w-5" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "left", className: "w-60 flex flex-col gap-6 py-6 px-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", onClick: () => setMobileOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandLogo, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3", children: "Admin Panel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(NavLinks, { onClose: () => setMobileOpen(false) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 overflow-auto p-6", children })
    ] })
  ] });
}
export {
  AdminLayout as A,
  Sheet as S,
  SheetContent as a,
  SheetHeader as b,
  SheetTitle as c
};
