import { r as reactExports, L as jsxRuntimeExports, M as twMerge, j as clsx, S as Slot, N as cva, O as Root, P as Image, Q as Fallback, T as Portal, U as Content2, V as Provider, W as Root3, X as Trigger, Y as Portal$1, Z as Content2$1, $ as Root2, a0 as Trigger$1, a1 as createRootRouteWithContext, a2 as captureException, a3 as useRouter, a4 as Link, a5 as QueryClientProvider, a6 as Outlet, a7 as HeadContent, a8 as Scripts, a9 as createFileRoute, aa as lazyRouteComponent, ab as QueryClient, ac as createRouter } from "./vendor-D_Usrqei.js";
import { c as createClient } from "./supabase-BkcVLFJa.js";
const supabaseUrl = "https://mtzvoeohbifxmertnwwy.supabase.co";
const supabaseAnonKey = "sb_publishable_hqVgHskOyz-dcyMVG0kURg_Yin7El1X";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const AuthContext = reactExports.createContext(void 0);
function AuthProvider({ children }) {
  const [user, setUser] = reactExports.useState(null);
  const [profile, setProfile] = reactExports.useState(null);
  const [session, setSession] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  async function fetchProfile(userId) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (!error && data) setProfile(data);
  }
  reactExports.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: session2 } }) => {
      setSession(session2);
      setUser(session2?.user ?? null);
      if (session2?.user) fetchProfile(session2.user.id);
      setLoading(false);
    });
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session2) => {
      setSession(session2);
      setUser(session2?.user ?? null);
      if (session2?.user) {
        await fetchProfile(session2.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
  }
  async function signUp(email, password) {
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/login` : "/login";
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo
      }
    });
    if (error) throw error;
  }
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    AuthContext.Provider,
    {
      value: { user, profile, session, loading, signIn, signUp, signOut },
      children
    }
  );
}
function useAuth() {
  const ctx = reactExports.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
const appCss = "/assets/styles-BUqT-5Mm.css";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function groupReceipts(rawReceipts) {
  const groups = {};
  rawReceipts.forEach((r) => {
    const baseNumber = r.receipt_number.split("/")[0];
    if (!groups[baseNumber]) {
      groups[baseNumber] = [];
    }
    groups[baseNumber].push(r);
  });
  const grouped = [];
  for (const baseNumber of Object.keys(groups)) {
    const items = groups[baseNumber];
    items.sort((a, b) => a.receipt_number.localeCompare(b.receipt_number));
    const baseItem = items[0];
    const total_amount = items.reduce((sum, item) => sum + Number(item.total_amount), 0);
    const material_name = items.map((item) => item.material_name).join(", ");
    const total_weight = items.reduce((sum, item) => sum + Number(item.weight), 0);
    grouped.push({
      id: baseItem.id,
      receipt_number: baseNumber,
      customer_id: baseItem.customer_id,
      customer_name: baseItem.customer_name,
      customer_phone: baseItem.customer_phone,
      payment_method: baseItem.payment_method,
      notes: baseItem.notes,
      created_at: baseItem.created_at,
      materials: items.map((item) => ({
        material_id: item.material_id,
        material_name: item.material_name,
        weight: Number(item.weight),
        unit: item.unit || "kg",
        price_per_unit: Number(item.price_per_unit),
        total_amount: Number(item.total_amount)
      })),
      total_amount,
      material_name,
      weight: total_weight,
      unit: baseItem.unit || "kg",
      price_per_unit: baseItem.price_per_unit
    });
  }
  const orderedGrouped = [];
  const seen = /* @__PURE__ */ new Set();
  rawReceipts.forEach((r) => {
    const baseNumber = r.receipt_number.split("/")[0];
    if (!seen.has(baseNumber)) {
      seen.add(baseNumber);
      const group = grouped.find((g) => g.receipt_number === baseNumber);
      if (group) {
        orderedGrouped.push(group);
      }
    }
  });
  return orderedGrouped;
}
function groupTransactions(rawTxns) {
  const groups = {};
  rawTxns.forEach((t) => {
    const baseNumber = t.txn_number.split("/")[0];
    if (!groups[baseNumber]) {
      groups[baseNumber] = [];
    }
    groups[baseNumber].push(t);
  });
  const grouped = [];
  for (const baseNumber of Object.keys(groups)) {
    const items = groups[baseNumber];
    items.sort((a, b) => a.txn_number.localeCompare(b.txn_number));
    const baseItem = items[0];
    const total_amount = items.reduce((sum, item) => sum + Number(item.total_amount), 0);
    const material_name = items.map((item) => item.material_name).join(", ");
    const total_weight = items.reduce((sum, item) => sum + Number(item.weight), 0);
    grouped.push({
      id: baseItem.id,
      txn_number: baseNumber,
      supplier_id: baseItem.supplier_id,
      supplier_name: baseItem.supplier_name,
      supplier_phone: baseItem.supplier_phone,
      notes: baseItem.notes,
      created_at: baseItem.created_at,
      invoice_number: baseItem.invoice_number ? baseItem.invoice_number.split("/")[0] : void 0,
      invoice_status: baseItem.invoice_status,
      invoice_id: baseItem.invoice_id,
      payment_method: baseItem.payment_method,
      due_date: baseItem.due_date,
      materials: items.map((item) => ({
        id: item.id,
        material_id: item.material_id,
        material_name: item.material_name,
        weight: Number(item.weight),
        unit: item.unit || "kg",
        price_per_unit: Number(item.price_per_unit),
        subtotal: Number(item.subtotal),
        gst_rate: Number(item.gst_rate || 0),
        gst_amount: Number(item.gst_amount || 0),
        total_amount: Number(item.total_amount)
      })),
      total_amount,
      material_name,
      weight: total_weight,
      unit: baseItem.unit || "kg",
      price_per_unit: baseItem.price_per_unit,
      color_hex: baseItem.color_hex,
      material_id: baseItem.material_id,
      subtotal: baseItem.subtotal,
      gst_rate: baseItem.gst_rate,
      gst_amount: baseItem.gst_amount,
      material_unit: baseItem.material_unit
    });
  }
  const orderedGrouped = [];
  const seen = /* @__PURE__ */ new Set();
  rawTxns.forEach((t) => {
    const baseNumber = t.txn_number.split("/")[0];
    if (!seen.has(baseNumber)) {
      seen.add(baseNumber);
      const group = grouped.find((g) => g.txn_number === baseNumber);
      if (group) {
        orderedGrouped.push(group);
      }
    }
  });
  return orderedGrouped;
}
function groupInvoices(rawInvoices) {
  const groups = {};
  rawInvoices.forEach((i) => {
    const baseNumber = i.invoice_number.split("/")[0];
    if (!groups[baseNumber]) {
      groups[baseNumber] = [];
    }
    groups[baseNumber].push(i);
  });
  const grouped = [];
  for (const baseNumber of Object.keys(groups)) {
    const items = groups[baseNumber];
    items.sort((a, b) => a.invoice_number.localeCompare(b.invoice_number));
    const baseItem = items[0];
    const amount = items.reduce((sum, item) => sum + Number(item.amount), 0);
    const material_name = items.map((item) => item.material_name).join(", ");
    const total_weight = items.reduce((sum, item) => sum + Number(item.weight), 0);
    grouped.push({
      id: baseItem.id,
      invoice_number: baseNumber,
      supplier_id: baseItem.supplier_id,
      supplier_name: baseItem.supplier_name,
      supplier_phone: baseItem.supplier_phone,
      txn_number: baseItem.txn_number.split("/")[0],
      amount,
      status: baseItem.status,
      due_date: baseItem.due_date,
      paid_at: baseItem.paid_at,
      payment_method: baseItem.payment_method,
      notes: baseItem.notes,
      created_at: baseItem.created_at,
      materials: items.map((item) => ({
        id: item.id,
        transaction_id: item.transaction_id,
        material_name: item.material_name,
        weight: Number(item.weight),
        unit: item.unit || "kg",
        price_per_unit: Number(item.price_per_unit),
        amount: Number(item.amount)
      })),
      material_name,
      weight: total_weight,
      unit: baseItem.unit || "kg",
      transaction_id: baseItem.transaction_id,
      price_per_unit: baseItem.price_per_unit
    });
  }
  const orderedGrouped = [];
  const seen = /* @__PURE__ */ new Set();
  rawInvoices.forEach((i) => {
    const baseNumber = i.invoice_number.split("/")[0];
    if (!seen.has(baseNumber)) {
      seen.add(baseNumber);
      const group = grouped.find((g) => g.invoice_number === baseNumber);
      if (group) {
        orderedGrouped.push(group);
      }
    }
  });
  return orderedGrouped;
}
function numberToWords(amount) {
  const a = Math.floor(amount);
  const paise = Math.round((amount - a) * 100);
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function numToWords(n) {
    if (n < 20) return units[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + units[n % 10] : "");
    if (n < 1e3) return units[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + numToWords(n % 100) : "");
    if (n < 1e5) return numToWords(Math.floor(n / 1e3)) + " Thousand" + (n % 1e3 ? " " + numToWords(n % 1e3) : "");
    if (n < 1e7) return numToWords(Math.floor(n / 1e5)) + " Lakh" + (n % 1e5 ? " " + numToWords(n % 1e5) : "");
    return numToWords(Math.floor(n / 1e7)) + " Crore" + (n % 1e7 ? " " + numToWords(n % 1e7) : "");
  }
  if (amount === 0) return "Zero Rupees Only";
  let words = a > 0 ? numToWords(a) + " Rupees" : "";
  if (paise > 0) {
    const paiseWords = numToWords(paise) + " Paise";
    words = words ? `${words} and ${paiseWords}` : `${paiseWords}`;
  }
  return words ? `${words} Only` : "Zero Rupees Only";
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = reactExports.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const Avatar = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root,
  {
    ref,
    className: cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className),
    ...props
  }
));
Avatar.displayName = Root.displayName;
const AvatarImage = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Image,
  {
    ref,
    className: cn("aspect-square h-full w-full", className),
    ...props
  }
));
AvatarImage.displayName = Image.displayName;
const AvatarFallback = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Fallback,
  {
    ref,
    className: cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    ),
    ...props
  }
));
AvatarFallback.displayName = Fallback.displayName;
const TooltipProvider = Provider;
const Tooltip = Root3;
const TooltipTrigger = Trigger;
const TooltipContent = reactExports.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = Content2.displayName;
const Popover = Root2;
const PopoverTrigger = Trigger$1;
const PopoverContent = reactExports.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal$1, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2$1,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = Content2$1.displayName;
if (typeof window !== "undefined") {
  {
    console.warn("Sentry DSN not found in environment variables. Error tracking is disabled.");
  }
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  if (typeof window !== "undefined") {
    captureException(error);
  }
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const JSON_LD_LOCAL_BUSINESS = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://scrapco.in/#business",
  name: "The Scrap Co.",
  description: "Tech-enabled doorstep scrap pickup for apartments and RWAs in Greater Noida West, Noida, and Indirapuram. Transparent weighing, instant UPI payment, full traceability.",
  url: "https://scrapco.in",
  logo: "https://scrapco.in/images/logo.jpg",
  image: "https://scrapco.in/images/Screenshot-1.png",
  telephone: "+91-72920-16625",
  email: "bookings.scrapco@gmail.com",
  priceRange: "₹",
  currenciesAccepted: "INR",
  paymentAccepted: "UPI, Cash",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Greater Noida West",
    addressRegion: "Uttar Pradesh",
    addressCountry: "IN"
  },
  areaServed: [
    { "@type": "City", name: "Greater Noida" },
    { "@type": "City", name: "Noida" },
    { "@type": "City", name: "Indirapuram" }
  ],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "09:00",
    closes: "18:00"
  },
  sameAs: [
    "https://www.instagram.com/scrapco.in",
    "https://www.facebook.com/share/19DUEDLcYa",
    "https://x.com/thescrapcoin"
  ],
  serviceType: "Scrap Collection and Recycling",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Scrap Materials",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Paper & Cardboard Pickup" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Metal Scrap Pickup" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Plastic Scrap Pickup" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "E-Waste Pickup" } }
    ]
  }
});
const Route$s = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "The Scrap Co. — Smart Scrap Pickup in Greater Noida West" },
      {
        name: "description",
        content: "Tech-enabled doorstep scrap collection for apartments in Greater Noida West. Transparent weighing, instant UPI payment, full traceability."
      },
      { name: "author", content: "The Scrap Co." },
      { name: "robots", content: "index, follow" },
      { name: "google-site-verification", content: "R31npkH2HUW4zmf13jrTffEDFY0fbLuTPf46mJUli3o" },
      // Open Graph
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://scrapco.in/" },
      { property: "og:title", content: "The Scrap Co. — Smart Scrap Pickup in Greater Noida West" },
      {
        property: "og:description",
        content: "Doorstep scrap pickup for apartments in Greater Noida West. Transparent digital weighing, instant UPI payment."
      },
      { property: "og:image", content: "https://scrapco.in/images/Screenshot-1.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "en_IN" },
      // Twitter
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@thescrapcoin" },
      { name: "twitter:title", content: "The Scrap Co. — Smart Scrap Pickup" },
      {
        name: "twitter:description",
        content: "Doorstep scrap pickup for apartments in Greater Noida West."
      },
      { name: "twitter:image", content: "https://scrapco.in/images/Screenshot-1.png" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: "https://scrapco.in/" }
    ]
  }),
  scripts: () => [
    {
      type: "application/ld+json",
      children: JSON_LD_LOCAL_BUSINESS
    }
  ],
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$s.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuthProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) }) });
}
const $$splitComponentImporter$d = () => import("./terms-C_W1zA7A.js");
const Route$r = createFileRoute("/terms")({
  head: () => ({
    meta: [{
      title: "Terms of Service — The Scrap Co."
    }, {
      name: "description",
      content: "Terms of Service for using The Scrap Co. platform. Read about scheduling, digital weighing, payouts, and cancellations."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./register-gf7XChkS.js");
const Route$q = createFileRoute("/register")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./rates-CujXEH6w.js");
const Route$p = createFileRoute("/rates")({
  head: () => ({
    meta: [{
      title: "Today's Scrap Prices — Noida Area | The Scrap Co."
    }, {
      name: "description",
      content: "Check today's real-time scrap rates per kg in Noida. Transparent pricing for Cardboard, Plastics, Copper, Metals, and E-waste."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./privacy-qoaceAeE.js");
const Route$o = createFileRoute("/privacy")({
  head: () => ({
    meta: [{
      title: "Privacy Policy — The Scrap Co."
    }, {
      name: "description",
      content: "Read the Privacy Policy of The Scrap Co. Learn how we handle your personal data under the DPDP Act 2023."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./partner-DLIgPAsL.js");
const Route$n = createFileRoute("/partner")({
  head: () => ({
    meta: [{
      title: "Partner with Us — The Scrap Co."
    }, {
      name: "description",
      content: "Discover partnership options with The Scrap Co. for RWAs, apartment societies, and certified recycling companies."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./my-bookings-DLmXgRdT.js");
const Route$m = createFileRoute("/my-bookings")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./login-BW_rvjse.js");
const Route$l = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./impact-CcMN-ye8.js");
const Route$k = createFileRoute("/impact")({
  head: () => ({
    meta: [{
      title: "Circular Impact & Sustainability — The Scrap Co."
    }, {
      name: "description",
      content: "Track our cumulative landfill diversion metrics. Learn how we route paper, plastics, metals, and e-waste to certified recyclers."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./faq-Bau5zhsD.js");
const Route$j = createFileRoute("/faq")({
  head: () => ({
    meta: [{
      title: "FAQ — The Scrap Co."
    }, {
      name: "description",
      content: "Frequently Asked Questions about doorstep scrap pickup, digital weighing, payment modes, and operational areas."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./contact-DHhTzUyj.js");
const Route$i = createFileRoute("/contact")({
  head: () => ({
    meta: [{
      title: "Contact Us — The Scrap Co."
    }, {
      name: "description",
      content: "Get in touch with The Scrap Co. Contact us via WhatsApp, email, or find our Noida service areas."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./careers-3e4gGXK5.js");
const Route$h = createFileRoute("/careers")({
  head: () => ({
    meta: [{
      title: "Careers — The Scrap Co."
    }, {
      name: "description",
      content: "Join the team at The Scrap Co. Explore job applications and help us build waste-to-worth infrastructure."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./blog-XWB2hUoX.js");
const Route$g = createFileRoute("/blog")({
  head: () => ({
    meta: [{
      title: "Blog & Resources — The Scrap Co."
    }, {
      name: "description",
      content: "Learn tips on recycling, sorting household scrap, metal rate trends, and environmental compliance at The Scrap Co. blog."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./about-mK3JLtzV.js");
const Route$f = createFileRoute("/about")({
  head: () => ({
    meta: [{
      title: "About Us — The Scrap Co."
    }, {
      name: "description",
      content: "Learn how The Scrap Co. is digitizing doorstep scrap collection with calibrated digital scales and instant payouts."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-Fp6l-wwF.js");
const Route$e = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "The Scrap Co. — Smart Scrap Pickup in Greater Noida West"
    }, {
      name: "description",
      content: "Tech-enabled doorstep scrap collection for apartments in Greater Noida West. Transparent weighing, instant UPI payment, full traceability."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const Route$d = createFileRoute("/admin/")({
  // Eager configuration and loaders go here (if any). Component is lazy-loaded from index.lazy.tsx.
});
const Route$c = createFileRoute("/admin/users")({
  // Eager metadata definition. Component is split out.
});
const Route$b = createFileRoute("/admin/erp")({
  // Eager metadata definition. Component is split out.
});
const Route$a = createFileRoute("/admin/categories")({
  // Eager metadata definition. Component is split out.
});
const Route$9 = createFileRoute("/admin/bookings")({
  // Eager metadata definition. Component is split out.
});
const Route$8 = createFileRoute("/admin/erp/")({
  // Eager configuration and loaders go here (if any). Component is lazy-loaded from index.lazy.tsx.
});
const Route$7 = createFileRoute("/admin/erp/whatsapp")({
  // Eager metadata definition. Component is split out.
});
const Route$6 = createFileRoute("/admin/erp/transactions")({
  // Eager metadata definition. Component is split out.
});
const Route$5 = createFileRoute("/admin/erp/suppliers")({
  // Eager metadata definition. Component is split out.
});
const Route$4 = createFileRoute("/admin/erp/receipts")({
  // Eager metadata definition. Component is split out.
});
const Route$3 = createFileRoute("/admin/erp/notifications")({
  // Lazy component will load
});
const Route$2 = createFileRoute("/admin/erp/materials")({
  // Eager metadata definition. Component is split out.
});
const Route$1 = createFileRoute("/admin/erp/invoices")({
  // Eager metadata definition. Component is split out.
});
const Route = createFileRoute("/admin/erp/customers")({
  // Eager metadata definition. Component is split out.
});
const TermsRoute = Route$r.update({
  id: "/terms",
  path: "/terms",
  getParentRoute: () => Route$s
});
const RegisterRoute = Route$q.update({
  id: "/register",
  path: "/register",
  getParentRoute: () => Route$s
});
const RatesRoute = Route$p.update({
  id: "/rates",
  path: "/rates",
  getParentRoute: () => Route$s
});
const PrivacyRoute = Route$o.update({
  id: "/privacy",
  path: "/privacy",
  getParentRoute: () => Route$s
});
const PartnerRoute = Route$n.update({
  id: "/partner",
  path: "/partner",
  getParentRoute: () => Route$s
});
const MyBookingsRoute = Route$m.update({
  id: "/my-bookings",
  path: "/my-bookings",
  getParentRoute: () => Route$s
});
const LoginRoute = Route$l.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$s
});
const ImpactRoute = Route$k.update({
  id: "/impact",
  path: "/impact",
  getParentRoute: () => Route$s
});
const FaqRoute = Route$j.update({
  id: "/faq",
  path: "/faq",
  getParentRoute: () => Route$s
});
const ContactRoute = Route$i.update({
  id: "/contact",
  path: "/contact",
  getParentRoute: () => Route$s
});
const CareersRoute = Route$h.update({
  id: "/careers",
  path: "/careers",
  getParentRoute: () => Route$s
});
const BlogRoute = Route$g.update({
  id: "/blog",
  path: "/blog",
  getParentRoute: () => Route$s
});
const AboutRoute = Route$f.update({
  id: "/about",
  path: "/about",
  getParentRoute: () => Route$s
});
const IndexRoute = Route$e.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$s
});
const AdminIndexRoute = Route$d.update({
  id: "/admin/",
  path: "/admin/",
  getParentRoute: () => Route$s
}).lazy(() => import("./index.lazy-CHy8mc-3.js").then((d) => d.Route));
const AdminUsersRoute = Route$c.update({
  id: "/admin/users",
  path: "/admin/users",
  getParentRoute: () => Route$s
}).lazy(() => import("./users.lazy-3Ch95eon.js").then((d) => d.Route));
const AdminErpRoute = Route$b.update({
  id: "/admin/erp",
  path: "/admin/erp",
  getParentRoute: () => Route$s
}).lazy(() => import("./erp.lazy-C_kxPoh7.js").then((d) => d.Route));
const AdminCategoriesRoute = Route$a.update({
  id: "/admin/categories",
  path: "/admin/categories",
  getParentRoute: () => Route$s
}).lazy(
  () => import("./categories.lazy-B2dYXoM0.js").then((d) => d.Route)
);
const AdminBookingsRoute = Route$9.update({
  id: "/admin/bookings",
  path: "/admin/bookings",
  getParentRoute: () => Route$s
}).lazy(
  () => import("./bookings.lazy-Cj7Kfyk3.js").then((d) => d.Route)
);
const AdminErpIndexRoute = Route$8.update({
  id: "/",
  path: "/",
  getParentRoute: () => AdminErpRoute
}).lazy(
  () => import("./index.lazy-CHn44BRc.js").then((d) => d.Route)
);
const AdminErpWhatsappRoute = Route$7.update({
  id: "/whatsapp",
  path: "/whatsapp",
  getParentRoute: () => AdminErpRoute
}).lazy(
  () => import("./whatsapp.lazy-T8kyyM1T.js").then((d) => d.Route)
);
const AdminErpTransactionsRoute = Route$6.update({
  id: "/transactions",
  path: "/transactions",
  getParentRoute: () => AdminErpRoute
}).lazy(
  () => import("./transactions.lazy-D6FbfHsB.js").then((d) => d.Route)
);
const AdminErpSuppliersRoute = Route$5.update({
  id: "/suppliers",
  path: "/suppliers",
  getParentRoute: () => AdminErpRoute
}).lazy(
  () => import("./suppliers.lazy-DxEwVzxU.js").then((d) => d.Route)
);
const AdminErpReceiptsRoute = Route$4.update({
  id: "/receipts",
  path: "/receipts",
  getParentRoute: () => AdminErpRoute
}).lazy(
  () => import("./receipts.lazy-Dxl__xwf.js").then((d) => d.Route)
);
const AdminErpNotificationsRoute = Route$3.update({
  id: "/notifications",
  path: "/notifications",
  getParentRoute: () => AdminErpRoute
}).lazy(
  () => import("./notifications.lazy-Cm_US2tq.js").then((d) => d.Route)
);
const AdminErpMaterialsRoute = Route$2.update({
  id: "/materials",
  path: "/materials",
  getParentRoute: () => AdminErpRoute
}).lazy(
  () => import("./materials.lazy-BVH6QmTm.js").then((d) => d.Route)
);
const AdminErpInvoicesRoute = Route$1.update({
  id: "/invoices",
  path: "/invoices",
  getParentRoute: () => AdminErpRoute
}).lazy(
  () => import("./invoices.lazy-CZXgSaCv.js").then((d) => d.Route)
);
const AdminErpCustomersRoute = Route.update({
  id: "/customers",
  path: "/customers",
  getParentRoute: () => AdminErpRoute
}).lazy(
  () => import("./customers.lazy-DC7qIycx.js").then((d) => d.Route)
);
const AdminErpRouteChildren = {
  AdminErpCustomersRoute,
  AdminErpInvoicesRoute,
  AdminErpMaterialsRoute,
  AdminErpNotificationsRoute,
  AdminErpReceiptsRoute,
  AdminErpSuppliersRoute,
  AdminErpTransactionsRoute,
  AdminErpWhatsappRoute,
  AdminErpIndexRoute
};
const AdminErpRouteWithChildren = AdminErpRoute._addFileChildren(
  AdminErpRouteChildren
);
const rootRouteChildren = {
  IndexRoute,
  AboutRoute,
  BlogRoute,
  CareersRoute,
  ContactRoute,
  FaqRoute,
  ImpactRoute,
  LoginRoute,
  MyBookingsRoute,
  PartnerRoute,
  PrivacyRoute,
  RatesRoute,
  RegisterRoute,
  TermsRoute,
  AdminBookingsRoute,
  AdminCategoriesRoute,
  AdminErpRoute: AdminErpRouteWithChildren,
  AdminUsersRoute,
  AdminIndexRoute
};
const routeTree = Route$s._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Avatar as A,
  Button as B,
  Popover as P,
  TooltipProvider as T,
  groupReceipts as a,
  buttonVariants as b,
  cn as c,
  groupInvoices as d,
  Tooltip as e,
  TooltipTrigger as f,
  groupTransactions as g,
  AvatarFallback as h,
  TooltipContent as i,
  PopoverTrigger as j,
  PopoverContent as k,
  numberToWords as n,
  router as r,
  supabase as s,
  useAuth as u
};
