import { r as reactExports, L as jsxRuntimeExports, bH as CircleQuestionMark, aY as ChevronUp, aP as ChevronDown } from "./vendor-D_Usrqei.js";
import { H as Header } from "./Header-CWPAIQ3S.js";
import { F as Footer } from "./Footer-BlIWbOS0.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./brand-logo-DsYSfcsW.js";
import "./router-Bj6HzPyA.js";
import "./supabase-BkcVLFJa.js";
import "./nav-auth-PFnwIhZm.js";
import "./api-DznPMToT.js";
const FAQ_DATA = [{
  title: "Booking & Service",
  items: [{
    q: "How do I book a scrap pickup?",
    a: "Fill in the booking form on our homepage — just enter your name, WhatsApp number, society/sector name, tower and flat number, preferred pickup date, and select the scrap categories you have. We will confirm your pickup slot via WhatsApp."
  }, {
    q: "Which areas do you currently serve?",
    a: "We currently serve Greater Noida, Indirapuram, and Noida. We are expanding rapidly to other NCR zones soon."
  }, {
    q: "Is there a minimum weight quantity?",
    a: "No, there is no strict minimum weight requirement. You can book for whatever recyclables you have. However, bookings with very small quantities (under 5 kg total) may be rescheduled or combined with nearby pickups in your sector at our discretion."
  }, {
    q: "Can I schedule a pickup for the same day?",
    a: "Bookings should be made at least 12 hours in advance so we can map routes and assign a collector to your area. For urgent same-day bulk requests, please message us directly on WhatsApp and we will do our best to accommodate."
  }, {
    q: "What are your operational days and timings?",
    a: "We operate Monday to Saturday, from 9 AM to 6 PM. Sunday pickups can sometimes be scheduled upon special request via WhatsApp."
  }]
}, {
  title: "Weighing & Payouts",
  items: [{
    q: "How is the scrap weight calculated?",
    a: "We use calibrated digital scale machines. You can inspect the scale reading yourself during collection — we encourage complete transparency, and there are no rounding deductions or estimation tricks."
  }, {
    q: "When and how do I get paid?",
    a: "Payment is settled on the spot immediately after weighing, via UPI transfer (GPay, PhonePe, Paytm, etc.). You receive the money in your bank account before our collector leaves."
  }, {
    q: "Where can I check today's scrap prices?",
    a: "Real-time rates are published on our Rates page (scrapco.in/rates) and are updated regularly in line with commodity market values. The rates published are exactly what you get paid."
  }]
}, {
  title: "Accepted Materials",
  items: [{
    q: "What types of scrap do you accept?",
    a: "We collect paper, cardboard, plastic items (PET bottles, containers, mixed clean plastics), metals (iron, steel, aluminium, brass, copper), and e-waste (laptops, phones, chargers, appliances, batteries)."
  }, {
    q: "What materials are prohibited?",
    a: "We do not accept hazardous chemical waste, medical or biomedical waste, liquid chemicals, radioactive materials, asbestos, or any items that pose a health/safety risk to our collectors."
  }]
}, {
  title: "Account & Dashboard",
  items: [{
    q: "Do I need to create an account to schedule a pickup?",
    a: "No, guest bookings are fully supported. However, creating a free account allows you to review your pickup history, monitor pending schedules, track your cumulative carbon diversion metrics, and store addresses for faster bookings."
  }, {
    q: "Can I cancel or reschedule a booking?",
    a: "Yes. You can cancel or reschedule up to 2 hours before the confirmed window. Log in to visit the 'My Bookings' page or message us directly on WhatsApp to make updates."
  }]
}, {
  title: "RWAs & Society Campaigns",
  items: [{
    q: "Can you host a society-wide scrap collection drive?",
    a: "Yes. We work closely with RWAs, building management, and green coordinators to organize monthly scrap collection drives. We provide society notice board templates, coordinate collectors, and clear bulk piles efficiently."
  }, {
    q: "Do society partners receive metrics reporting?",
    a: "Yes. RWA partners receive a free monthly environmental dashboard showing total weight recycled, landfill diversion rates, participating flat statistics, and estimated carbon offset equivalents."
  }]
}];
function FAQPage() {
  const [expandedIndex, setExpandedIndex] = reactExports.useState("0-0");
  const toggleExpand = (sectionIdx, itemIdx) => {
    const key = `${sectionIdx}-${itemIdx}`;
    setExpandedIndex(expandedIndex === key ? null : key);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 mx-auto max-w-3xl px-6 py-12 md:py-20 space-y-10 text-left w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-center sm:text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary", children: "Got Questions?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight sm:text-4xl", children: "Frequently Asked Questions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-xl", children: "Everything you need to know about our doorstep collection process, payments, and accepted materials." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-8", children: FAQ_DATA.map((section, sIdx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-bold text-primary uppercase tracking-wider border-b border-border/40 pb-1.5 mt-4", children: section.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5", children: section.items.map((item, iIdx) => {
          const key = `${sIdx}-${iIdx}`;
          const isOpen = expandedIndex === key;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toggleExpand(sIdx, iIdx), className: "w-full px-5 py-4 flex items-center justify-between text-left font-semibold text-xs sm:text-sm text-foreground hover:bg-muted/10 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleQuestionMark, { className: "h-4 w-4 text-primary/75 shrink-0" }),
                item.q
              ] }),
              isOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4 text-muted-foreground shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground shrink-0" })
            ] }),
            isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 pb-4 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border/40 pt-3", children: item.a }) })
          ] }, item.q);
        }) })
      ] }, section.title)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
export {
  FAQPage as component
};
