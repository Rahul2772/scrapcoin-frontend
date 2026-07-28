import { r as reactExports, L as jsxRuntimeExports, bR as Checkbox$1, bS as CheckboxIndicator, aV as Check, bT as getDefaultClassNames, bU as DayPicker, bV as ChevronLeft, bW as ChevronRight, aP as ChevronDown, bX as Toaster$1, bE as Leaf, a4 as Link, aJ as MessageCircle, bm as CircleCheck, bP as CalendarCheck, ao as Scale, bY as Smartphone, bD as Building, an as Truck, ap as FileText, bg as Calendar$1, ah as format, ai as toast, a2 as captureException } from "./vendor-D_Usrqei.js";
import { c as cn, b as buttonVariants, B as Button, u as useAuth, P as Popover, j as PopoverTrigger, k as PopoverContent } from "./router-Bj6HzPyA.js";
import { I as Input } from "./input-B46-WYs4.js";
import { L as Label } from "./label-BYMti0SU.js";
import { H as fetchCircularImpact, I as createBooking } from "./api-DznPMToT.js";
import { H as Header } from "./Header-CWPAIQ3S.js";
import { i as isPincodeSupported, g as getPincodeLocation } from "./pincodes-DGcWwat0.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./supabase-BkcVLFJa.js";
import "./brand-logo-DsYSfcsW.js";
import "./nav-auth-PFnwIhZm.js";
const Checkbox = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Checkbox$1,
  {
    ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckboxIndicator, { className: cn("grid place-content-center text-current"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = Checkbox$1.displayName;
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DayPicker,
    {
      showOutsideDays,
      className: cn(
        "bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      ),
      captionLayout,
      formatters: {
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters
      },
      classNames: {
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn("bg-popover absolute inset-0 opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label" ? "text-sm" : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
        week_number: cn(
          "text-muted-foreground select-none text-[0.8rem]",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day
        ),
        range_start: cn("bg-accent rounded-l-md", defaultClassNames.range_start),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames
      },
      components: {
        Root: ({ className: className2, rootRef, ...props2 }) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-slot": "calendar", ref: rootRef, className: cn(className2), ...props2 });
        },
        Chevron: ({ className: className2, orientation, ...props2 }) => {
          if (orientation === "left") {
            return /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: cn("size-4", className2), ...props2 });
          }
          if (orientation === "right") {
            return /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: cn("size-4", className2), ...props2 });
          }
          return /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: cn("size-4", className2), ...props2 });
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props2 }) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx("td", { ...props2, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex size-(--cell-size) items-center justify-center text-center", children }) });
        },
        ...components
      },
      ...props
    }
  );
}
function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();
  const ref = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      ref,
      variant: "ghost",
      size: "icon",
      "data-day": day.date.toLocaleDateString(),
      "data-selected-single": modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle,
      "data-range-start": modifiers.range_start,
      "data-range-end": modifiers.range_end,
      "data-range-middle": modifiers.range_middle,
      className: cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-(--cell-size) flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      ),
      ...props
    }
  );
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const WHATSAPP_NUMBER = "917292016625";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hi The Scrap Co., I would like to schedule a scrap pickup."
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;
function WhatsAppIcon({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      fill: "currentColor",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" })
    }
  );
}
function WhatsAppFAB() {
  const [showLabel, setShowLabel] = reactExports.useState(false);
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setShowLabel(true), 1200);
    const hideTimer = setTimeout(() => setShowLabel(false), 5e3);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);
  if (!mounted) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed bottom-6 right-6 z-50 flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: `hidden sm:inline-block rounded-full bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-lg transition-all duration-500 ${showLabel ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}`,
        style: { boxShadow: "0 4px 20px rgba(0,0,0,0.15)" },
        children: "Chat on WhatsApp"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "a",
      {
        href: WHATSAPP_URL,
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": "Chat on WhatsApp",
        className: "group relative grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white shadow-lg transition-transform duration-200 hover:scale-110 hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2",
        style: { boxShadow: "0 6px 24px rgba(37, 211, 102, 0.4)" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 rounded-full bg-emerald-500 animate-whatsapp-ping" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 rounded-full bg-emerald-500 animate-whatsapp-ping [animation-delay:0.6s]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(WhatsAppIcon, { className: "relative h-7 w-7" })
        ]
      }
    )
  ] });
}
function WhatsAppLink({
  children,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "a",
    {
      href: WHATSAPP_URL,
      target: "_blank",
      rel: "noopener noreferrer",
      className,
      children: children ?? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WhatsAppIcon, { className: "h-4 w-4" }),
        "Chat on WhatsApp"
      ] })
    }
  );
}
const MATERIALS = ["Paper / Cardboard", "Plastics", "Metals", "E-Waste", "Others"];
const FALLBACK_IMPACT = {
  grandTotalKg: 2135.5,
  breakdown: [{
    categoryId: "paper",
    label: "Paper & Cardboard",
    weightKg: 1140
  }, {
    categoryId: "plastics",
    label: "Plastics",
    weightKg: 380
  }, {
    categoryId: "metals",
    label: "Metals",
    weightKg: 486
  }, {
    categoryId: "e-waste",
    label: "E-Waste",
    weightKg: 92
  }, {
    categoryId: "others",
    label: "Others",
    weightKg: 45
  }]
};
function CountUp({
  end,
  duration = 1200,
  decimals = 0
}) {
  const [count, setCount] = reactExports.useState(0);
  reactExports.useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(progress * end);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: count.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }) });
}
function Index() {
  const {
    session
  } = useAuth();
  const [date, setDate] = reactExports.useState();
  const [materials, setMaterials] = reactExports.useState([]);
  const [pincodeInput, setPincodeInput] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [impact, setImpact] = reactExports.useState(FALLBACK_IMPACT);
  const [bookingSuccessData, setBookingSuccessData] = reactExports.useState(null);
  const adminPhone = "917292016625";
  const bookingText = bookingSuccessData ? `Hello, I just scheduled a scrap pickup on Scrapco.in:

👤 *Name*: ${bookingSuccessData.fullName}
📅 *Preferred Date*: ${bookingSuccessData.pickupDate}
📍 *Address*: ${bookingSuccessData.tower ? `${bookingSuccessData.tower}, ` : ""}${bookingSuccessData.society}
📦 *Materials*: ${bookingSuccessData.materials.join(", ")}` : "";
  const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(bookingText)}`;
  reactExports.useEffect(() => {
    fetchCircularImpact().then(setImpact).catch(() => setImpact(FALLBACK_IMPACT));
  }, []);
  const toggleMaterial = (m) => setMaterials((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (!data.get("fullName") || !data.get("phone") || !data.get("society") || !date) {
      toast.error("Please fill all required fields and pick a date.");
      return;
    }
    const cleanPin = pincodeInput.trim();
    if (!cleanPin || cleanPin.length !== 6) {
      toast.error("Please enter a valid 6-digit Pincode to check pickup availability.");
      return;
    }
    if (!isPincodeSupported(cleanPin)) {
      toast.error(`Pickup is currently not available for pincode ${cleanPin}. Serviceable areas are Noida, Greater Noida, Noida Extension & Indirapuram.`);
      return;
    }
    if (materials.length === 0) {
      toast.error("Please select at least one material type.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        fullName: String(data.get("fullName")),
        phone: String(data.get("phone")),
        society: `${String(data.get("society"))} (PIN: ${cleanPin})`,
        tower: String(data.get("tower") || "") || void 0,
        pincode: cleanPin,
        pickupDate: format(date, "yyyy-MM-dd"),
        materials
      };
      const result = await createBooking(payload, session?.access_token ?? void 0);
      toast.success(result.message);
      setBookingSuccessData(payload);
      form.reset();
      setPincodeInput("");
      setDate(void 0);
      setMaterials([]);
    } catch (err) {
      if (typeof window !== "undefined") {
        captureException(err);
      }
      toast.error(err instanceof Error ? err.message : "Could not schedule pickup. Please try again or WhatsApp us.");
    } finally {
      setSubmitting(false);
    }
  };
  let minEst = 0;
  let maxEst = 0;
  if (materials.includes("Paper / Cardboard")) {
    minEst += 50;
    maxEst += 150;
  }
  if (materials.includes("Plastics")) {
    minEst += 30;
    maxEst += 100;
  }
  if (materials.includes("Metals")) {
    minEst += 100;
    maxEst += 450;
  }
  if (materials.includes("E-Waste")) {
    minEst += 100;
    maxEst += 900;
  }
  if (materials.includes("Others")) {
    minEst += 20;
    maxEst += 100;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { richColors: true, position: "top-center" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "top", className: "relative overflow-hidden", style: {
      background: "var(--gradient-soft)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full opacity-30 blur-3xl", style: {
        background: "var(--gradient-hero)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:pt-20 lg:grid lg:grid-cols-2 lg:gap-12 lg:pb-24", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "h-3.5 w-3.5" }),
            " Noida Area • Apartments & RWAs"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl", children: [
            "Hassle-free scrap pickup.",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-clip-text text-transparent", style: {
              backgroundImage: "var(--gradient-hero)"
            }, children: "Transparent. Instant. Tech-driven." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-lg text-muted-foreground", children: "Smart scales, live weight readings, and instant UPI payment — right at your doorstep. Built for environmentally-conscious citizens who want recycling done the right way." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#booking", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", className: "rounded-full px-7 shadow-lg cursor-pointer", children: "Schedule a Pickup" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/rates", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", variant: "outline", className: "rounded-full px-6 cursor-pointer", children: "Check Scrap Rates" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(WhatsAppLink, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "lg", variant: "outline", className: "rounded-full border-emerald-500/40 px-6 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "mr-2 h-4 w-4" }),
              "WhatsApp Us"
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 flex flex-wrap gap-5 text-sm text-muted-foreground", children: ["SWM 2026 compliant", "Live digital weighing", "Paid in seconds"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-primary" }),
            " ",
            t
          ] }, t)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative mt-12 lg:mt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border/60 bg-card p-6 sm:p-8", style: {
          boxShadow: "var(--shadow-elegant)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground font-semibold", children: "Scrap Saved from Landfill" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-2xl font-black text-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CountUp, { end: impact.grandTotalKg, decimals: 1 }),
                " kg"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 flex items-center gap-1.5 border border-emerald-500/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "h-3 w-3" }),
              " Saved from Landfills"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-xs text-muted-foreground", children: "Total weight of recyclable scrap materials collected, traced, and diverted to certified recycling channels." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid grid-cols-2 gap-3", children: impact.breakdown.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-background p-3.5 transition-all hover:border-primary/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium", children: r.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-lg font-bold text-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CountUp, { end: r.weightKg, decimals: 0 }),
              " kg"
            ] })
          ] }, r.categoryId)) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "border-y border-border/50 bg-primary/5 py-4 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-4 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "⚖️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Digital Scales, Verified Weight" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "💸" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Instant UPI Payment" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "♻️" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Certified Recycling Partners" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "how", className: "mx-auto max-w-6xl px-4 py-16 sm:py-24", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold tracking-tight sm:text-4xl", children: "How it works" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: "Three simple steps. Zero negotiation, zero guesswork." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-12 grid gap-6 sm:grid-cols-3", children: [{
        icon: CalendarCheck,
        title: "Book Online",
        desc: "Fill in the booking form — takes under 2 minutes. Select your materials and preferred pickup date."
      }, {
        icon: Scale,
        title: "We Come to You",
        desc: "Our trained champion collector arrives at your society with a calibrated digital scale. You verify the weight."
      }, {
        icon: Smartphone,
        title: "Get Paid Instantly",
        desc: "Receive payment directly to your UPI account on the spot. No waiting, no follow-ups."
      }].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative rounded-2xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-1", style: {
        boxShadow: "var(--shadow-card)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-muted-foreground", children: [
            "Step ",
            i + 1
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 text-xl font-semibold", children: s.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: s.desc })
      ] }, s.title)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-muted/40 py-16 sm:py-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold tracking-tight sm:text-4xl", children: "Why Choose Us" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: "Built around how modern apartment communities live and recycle." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-7 transition-all hover:shadow-md", style: {
          boxShadow: "var(--shadow-card)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-5 text-xl font-semibold", children: "Apartment & Society Pickup" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground leading-relaxed", children: "Serving residential apartments and societies across Noida, Greater Noida, and Indirapuram." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-7 transition-all hover:shadow-md", style: {
          boxShadow: "var(--shadow-card)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-5 text-xl font-semibold", children: "Arrives Within 24 Hours" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground leading-relaxed", children: "Book today, get your pickup scheduled. Our collectors are local to your area." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-7 transition-all hover:shadow-md", style: {
          boxShadow: "var(--shadow-card)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-5 text-xl font-semibold", children: "Digital Receipt Every Pickup" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground leading-relaxed", children: "Every pickup gets a digital record — material, weight, rate, and amount paid." })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "booking", className: "mx-auto max-w-4xl px-4 py-16 sm:py-24", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarCheck, { className: "h-3.5 w-3.5" }),
          " Book your pickup"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-3xl font-bold tracking-tight sm:text-4xl", children: "Schedule a pickup" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: "Get your recyclables collected and paid out dynamically." })
      ] }),
      bookingSuccessData ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 sm:p-10 text-center animate-in fade-in zoom-in-95 duration-300", style: {
        boxShadow: "var(--shadow-elegant)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-10 w-10 animate-bounce" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-6 text-2xl font-bold text-foreground", children: "Pickup Scheduled!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Your scrap pickup has been scheduled successfully." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 rounded-2xl border border-border bg-card p-6 text-left max-w-md mx-auto space-y-3 text-xs sm:text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b border-border pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Name:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: bookingSuccessData.fullName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b border-border pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Preferred Date:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: bookingSuccessData.pickupDate })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b border-border pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Location:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-right", children: [
              bookingSuccessData.tower ? `${bookingSuccessData.tower}, ` : "",
              bookingSuccessData.society
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between pb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Materials:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-right", children: bookingSuccessData.materials.join(", ") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-xs text-muted-foreground", children: "A confirmation message has been queued to your number. For instant scheduling, please share the details with our admin directly." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: whatsappUrl, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center justify-center gap-2 rounded-full h-12 px-6 bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold cursor-pointer shadow-md text-sm transition-all w-full sm:w-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-5 w-5" }),
            "Notify Admin on WhatsApp"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setBookingSuccessData(null), variant: "outline", className: "rounded-full h-12 px-8 cursor-pointer border-border hover:bg-accent text-sm w-full sm:w-auto", children: "Schedule Another" })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, autoComplete: "off", className: "mt-10 rounded-3xl border border-border/60 bg-card p-6 sm:p-10", style: {
        boxShadow: "var(--shadow-elegant)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 text-left", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary", children: "⚡ Quick booking — under 2 minutes. No account needed." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "fullName", children: "Full name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "fullName", name: "fullName", placeholder: "Sai Shankar", required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "phone", children: "WhatsApp number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "phone", name: "phone", type: "tel", inputMode: "tel", pattern: "[0-9+ ]{10,15}", placeholder: "+91 98765 12345", required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "society", children: "Apartment society / Sector" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "society", name: "society", placeholder: "e.g. Gaur City , Sector 16C, Greater Noida West", required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "tower", children: "Tower & flat number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "tower", name: "tower", placeholder: "Tower B • Flat 1204" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pincode", children: "Pincode *" }),
              (pincodeInput || "").length === 6 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1", isPincodeSupported(pincodeInput) ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"), children: isPincodeSupported(pincodeInput) ? "✓ Serviceable" : "✕ Not Serviceable" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "pincode", name: "pincode", type: "text", inputMode: "numeric", maxLength: 6, placeholder: "e.g. 201306", value: pincodeInput || "", onChange: (e) => setPincodeInput((e.target?.value || "").replace(/\D/g, "").slice(0, 6)), required: true, className: cn("rounded-xl transition-all", (pincodeInput || "").length === 6 && !isPincodeSupported(pincodeInput) && "border-red-500 focus-visible:ring-red-500 bg-red-50/20", (pincodeInput || "").length === 6 && isPincodeSupported(pincodeInput) && "border-emerald-500 focus-visible:ring-emerald-500 bg-emerald-50/20") }),
            (pincodeInput || "").length === 6 && isPincodeSupported(pincodeInput) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-emerald-600 font-medium", children: [
              "📍 Area: ",
              getPincodeLocation(pincodeInput) || "Serviceable Area"
            ] }),
            (pincodeInput || "").length === 6 && !isPincodeSupported(pincodeInput) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-500 font-medium", children: "Pickup is currently only available in Noida, Greater Noida, Noida Extension & Indirapuram." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Preferred pickup date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", className: cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar$1, { className: "mr-2 h-4 w-4" }),
                date ? format(date, "PPP") : "Pick a date"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { mode: "single", selected: date, onSelect: setDate, initialFocus: true, disabled: (d) => d < new Date((/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0)), className: cn("p-3 pointer-events-auto") }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Material estimate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-4", children: MATERIALS.map((m) => {
              const active = materials.includes(m);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: cn("flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition-all", active ? "border-primary bg-primary/5 text-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/40"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: active, onCheckedChange: () => toggleMaterial(m) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: m })
              ] }, m);
            }) })
          ] })
        ] }),
        materials.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center text-xs animate-in fade-in duration-200 text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold", children: [
            "💰 Estimated payout: ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary font-extrabold text-sm sm:text-base", children: [
              "₹",
              minEst,
              " – ₹",
              maxEst
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-1", children: "Based on current rates • Actual payout depends on exact weight measured at collection" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "lg", disabled: submitting, className: "mt-8 w-full rounded-full text-base shadow-lg cursor-pointer", children: submitting ? "Confirming..." : "Confirm Booking" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-center text-xs text-muted-foreground", children: "You'll receive a WhatsApp confirmation within 4 hours." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-muted/30 py-16 sm:py-24 border-t border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary", children: "Testimonials" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-3xl font-bold tracking-tight sm:text-4xl", children: "What our customers say" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: "Real reviews from real residents in Noida and Greater Noida." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12 grid gap-6 md:grid-cols-2 max-w-4xl mx-auto text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/65 bg-card p-6 shadow-sm space-y-4 relative overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-amber-500 flex gap-0.5 text-xs", children: "⭐⭐⭐⭐⭐" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed relative z-10 italic", children: '"Got ₹420 for boxes and old newspapers I was about to throw away. The whole thing took 15 minutes. Will definitely book again."' }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border/40 pt-3 flex justify-between items-center text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-foreground", children: "Priya S." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Gaur City 2" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/65 bg-card p-6 shadow-sm space-y-4 relative overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-amber-500 flex gap-0.5 text-xs", children: "⭐⭐⭐⭐⭐" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed relative z-10 italic", children: '"I was skeptical about the digital scale but I could see the reading myself. Paid on the spot via Gpay. Legit service."' }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border/40 pt-3 flex justify-between items-center text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-foreground", children: "Rahul M." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Greater Noida West" })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-4xl px-4 py-16 sm:py-24 border-t border-border/60 text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary", children: "FAQ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-3xl font-bold tracking-tight sm:text-4xl", children: "Common Questions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: "Quick answers to the questions we get asked most often." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-12 space-y-3 max-w-2xl mx-auto", children: [{
        q: "How is the weight calculated?",
        a: "We use calibrated digital scales at your doorstep. You can inspect the scale reading yourself during collection — there are no hidden rounding cuts or estimations."
      }, {
        q: "When and how do I get paid?",
        a: "On the spot, at the time of pickup, via UPI (PhonePe, GPay, Paytm, etc.). You receive the payout directly in your bank account before our collector leaves."
      }, {
        q: "What types of scrap do you accept?",
        a: "We collect paper, cardboard, plastics, metals (ferrous and non-ferrous), and electronic waste. Check our rates page for the complete list of accepted grades."
      }, {
        q: "Which areas do you serve?",
        a: "We currently cover Noida, Greater Noida, and Indirapuram. We are constantly expanding to new sectors and housing societies in NCR."
      }].map((faq, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-border bg-card overflow-hidden shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "w-full px-5 py-4 flex items-center justify-between text-left font-semibold text-xs sm:text-sm text-foreground hover:bg-muted/10 cursor-pointer list-none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: faq.q }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground group-open:rotate-180 transition-transform duration-200", children: "▼" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 pb-4 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2", children: faq.a }) })
      ] }) }, idx)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/faq", className: "text-xs font-semibold text-primary hover:underline", children: "More questions? View all FAQs →" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WhatsAppFAB, {})
  ] });
}
export {
  Index as component
};
