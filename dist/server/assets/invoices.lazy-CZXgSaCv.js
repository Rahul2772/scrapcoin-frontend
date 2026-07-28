import { af as createLazyFileRoute, r as reactExports, ai as toast, L as jsxRuntimeExports, bm as CircleCheck, bB as CreditCard, bk as CircleAlert, bo as Search, bj as RotateCw, bp as Download } from "./vendor-D_Usrqei.js";
import { u as useAuth, d as groupInvoices, B as Button } from "./router-Bj6HzPyA.js";
import { B as fetchERPInvoices, C as payERPInvoice } from "./api-DznPMToT.js";
import { I as Input } from "./input-B46-WYs4.js";
import { L as Label } from "./label-BYMti0SU.js";
import { S as Skeleton } from "./skeleton-Bi4Etyvs.js";
import { B as Badge } from "./badge-BF41vIxW.js";
import { D as Dialog, b as DialogContent, c as DialogHeader, d as DialogTitle, e as DialogFooter } from "./dialog-DKRq5zBk.js";
import { g as generateStandardPDF } from "./pdfGenerator-DBfcNI1z.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./supabase-BkcVLFJa.js";
const Route = createLazyFileRoute("/admin/erp/invoices")({
  component: ERPInvoicesPage
});
const STATUS_CONFIG = {
  paid: { label: "Paid", className: "bg-green-50 text-green-700 border-green-200" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
  overdue: { label: "Overdue", className: "bg-red-50 text-red-700 border-red-200" },
  cancelled: { label: "Cancelled", className: "bg-gray-50 text-gray-700 border-gray-200" }
};
async function generatePDFFromInvoice(i) {
  const rawItems = i.materials && i.materials.length > 0 ? i.materials : [{
    id: i.id,
    transaction_id: i.transaction_id || "",
    material_name: i.material_name,
    weight: i.weight,
    unit: i.unit,
    price_per_unit: i.price_per_unit || 0,
    amount: i.amount
  }];
  const totalAmount = rawItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const paid = i.status === "paid" ? totalAmount : 0;
  const balance = totalAmount - paid;
  await generateStandardPDF({
    docType: "TAX INVOICE",
    docNumber: i.invoice_number,
    docDate: i.created_at,
    partyTitle: "BILL TO",
    partyName: i.supplier_name || "Recycler",
    partyMobile: i.supplier_phone || "",
    paymentMethod: i.payment_method || "PENDING",
    paidAmount: paid,
    balanceAmount: balance,
    notes: i.notes || void 0,
    items: rawItems.map((item, idx) => ({
      sNo: idx + 1,
      name: item.material_name,
      qty: item.weight,
      unit: item.unit || "KGS",
      rate: item.price_per_unit || 0,
      amount: item.amount
    }))
  });
}
function ERPInvoicesPage() {
  const { session } = useAuth();
  const [invoices, setInvoices] = reactExports.useState([]);
  const [summary, setSummary] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [search, setSearch] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [payDialogOpen, setPayDialogOpen] = reactExports.useState(false);
  const [selectedInvoice, setSelectedInvoice] = reactExports.useState(null);
  const [payMethod, setPayMethod] = reactExports.useState("cash");
  const [payNotes, setPayNotes] = reactExports.useState("");
  const [paying, setPaying] = reactExports.useState(false);
  reactExports.useEffect(() => {
    loadInvoices();
  }, [session, statusFilter, search]);
  async function loadInvoices() {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.search = search;
      const res = await fetchERPInvoices(session.access_token, params);
      if (res.success) {
        setInvoices(groupInvoices(res.invoices));
        setSummary(res.summary);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load invoices log");
    } finally {
      setLoading(false);
    }
  }
  function openPay(i) {
    setSelectedInvoice(i);
    setPayMethod("cash");
    setPayNotes("");
    setPayDialogOpen(true);
  }
  async function handlePay(e) {
    e.preventDefault();
    if (!selectedInvoice) return;
    setPaying(true);
    try {
      const res = await payERPInvoice(
        selectedInvoice.id,
        payMethod,
        payNotes.trim() || void 0,
        session?.access_token
      );
      if (res.success) {
        toast.success("Invoice paid successfully!");
        setPayDialogOpen(false);
        loadInvoices();
      }
    } catch (err) {
      toast.error(err.message || "Payment trigger failed");
    } finally {
      setPaying(false);
    }
  }
  const filtered = invoices.filter(
    (i) => i.invoice_number.toLowerCase().includes(search.toLowerCase()) || i.supplier_name.toLowerCase().includes(search.toLowerCase())
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-in fade-in duration-300", children: [
    summary && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-4 shadow-sm flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wider", children: "Total Paid" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-emerald-600", children: [
            "₹",
            summary.paid_total.toLocaleString()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
            summary.paid_count,
            " settle tickets"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-8 w-8 text-emerald-600/30" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-4 shadow-sm flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wider", children: "Total Pending" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-amber-600", children: [
            "₹",
            summary.pending_total.toLocaleString()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
            summary.pending_count,
            " unpaid ledger tickets"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-8 w-8 text-amber-500/30" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-4 shadow-sm flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wider", children: "Overdue Bills" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-red-600", children: [
            "₹",
            summary.overdue_total.toLocaleString()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
            summary.overdue_count,
            " critical invoices"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-8 w-8 text-red-500/30" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:max-w-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search invoice number/supplier...",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            className: "pl-9 rounded-xl border border-border bg-card text-xs"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 w-full sm:w-auto justify-end items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex rounded-lg border border-border bg-muted/40 p-0.5", children: ["all", "paid", "pending", "overdue"].map((st) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setStatusFilter(st),
            className: `rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer transition-all uppercase ${statusFilter === st ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
            children: st
          },
          st
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: loadInvoices,
            disabled: loading,
            className: "rounded-xl cursor-pointer",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` })
          }
        )
      ] })
    ] }),
    loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 rounded-2xl border border-border/60 bg-card p-5", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-3 border-b border-border/40 last:border-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-48 animate-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-24 animate-pulse" })
    ] }, i)) }),
    !loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full border-collapse text-left text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/40 font-medium text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4", children: "Invoice No" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4", children: "Recycler" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4", children: "Scale Ticket Reference" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Bill Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Due Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
        filtered.map((inv) => {
          const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.pending;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/10 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 font-semibold text-foreground whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: inv.invoice_number }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground font-normal", children: [
                "Issued: ",
                new Date(inv.created_at).toLocaleDateString("en-IN")
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 font-medium text-foreground truncate max-w-[140px]", children: inv.supplier_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-muted-foreground whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: inv.txn_number }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-semibold text-foreground", children: [
                inv.material_name,
                " (",
                inv.weight,
                " ",
                inv.unit,
                ")"
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-right font-bold text-foreground", children: [
              "₹",
              inv.amount.toLocaleString()
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right text-muted-foreground whitespace-nowrap", children: inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-IN") : "Immediate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: `rounded-full text-[10px] px-2 py-0.5 ${cfg.className}`, children: cfg.label.toUpperCase() }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  onClick: () => generatePDFFromInvoice(inv),
                  className: "h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer",
                  title: "Download PDF Invoice",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" })
                }
              ),
              inv.status !== "paid" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  onClick: () => openPay(inv),
                  className: "rounded-xl font-semibold gap-1 py-1 cursor-pointer h-7 text-[10px]",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-3 w-3" }),
                    " PAY BILL"
                  ]
                }
              )
            ] }) })
          ] }, inv.id);
        }),
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-6 py-10 text-center text-muted-foreground", children: "No invoices recorded under these selection parameters." }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: payDialogOpen, onOpenChange: setPayDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md bg-card rounded-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-base font-bold text-foreground", children: "Record Invoice Bill Settlement" }) }),
      selectedInvoice && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handlePay, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-muted/10 p-4 text-xs space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Invoice Reference:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-bold", children: selectedInvoice.invoice_number })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Recycler:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: selectedInvoice.supplier_name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-t border-border pt-1.5 font-bold text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "Settle Amount:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary", children: [
              "₹ ",
              selectedInvoice.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Mode / Settlement Channel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: [
            { val: "cash", label: "Cash" },
            { val: "upi", label: "UPI" },
            { val: "bank_transfer", label: "Bank Transfer" },
            { val: "cheque", label: "Bank Cheque" }
          ].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: payMethod === m.val ? "default" : "outline",
              size: "sm",
              onClick: () => setPayMethod(m.val),
              className: "rounded-xl font-semibold text-xs cursor-pointer h-9",
              children: m.label
            },
            m.val
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pay-notes", children: "Settlement Remarks" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "pay-notes",
              value: payNotes,
              onChange: (e) => setPayNotes(e.target.value),
              placeholder: "UPI Ref ID, bank cheque numbers...",
              className: "rounded-xl border border-border"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "pt-2 border-t border-border/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => setPayDialogOpen(false), className: "rounded-xl cursor-pointer", children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: paying, className: "rounded-xl cursor-pointer", children: paying ? "Settling bill..." : "Complete Settle Payout" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  Route
};
