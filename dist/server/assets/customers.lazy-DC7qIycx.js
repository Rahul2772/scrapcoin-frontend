import { af as createLazyFileRoute, r as reactExports, ai as toast, L as jsxRuntimeExports, bo as Search, bj as RotateCw, aD as Plus, bq as Phone, as as MessageSquare, br as Wallet, bg as Calendar, by as Clock, bC as TriangleAlert, at as Bell, bt as Eye, aG as Pen, aE as Trash2, bu as MapPin, ap as FileText } from "./vendor-D_Usrqei.js";
import { u as useAuth, B as Button, a as groupReceipts } from "./router-Bj6HzPyA.js";
import { l as fetchERPCustomers, D as triggerCustomer30DayNotification, E as fetchERPCustomerDetail, F as deleteERPCustomer, G as updateERPCustomer, q as createERPCustomer } from "./api-DznPMToT.js";
import { I as Input } from "./input-B46-WYs4.js";
import { L as Label } from "./label-BYMti0SU.js";
import { S as Skeleton } from "./skeleton-Bi4Etyvs.js";
import { B as Badge } from "./badge-BF41vIxW.js";
import { D as Dialog, b as DialogContent, c as DialogHeader, d as DialogTitle, e as DialogFooter } from "./dialog-DKRq5zBk.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./supabase-BkcVLFJa.js";
const Route = createLazyFileRoute("/admin/erp/customers")({
  component: ERPCustomersPage
});
function ERPCustomersPage() {
  const { session, profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const [customers, setCustomers] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [search, setSearch] = reactExports.useState("");
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [detailOpen, setDetailOpen] = reactExports.useState(false);
  const [editingCustomer, setEditingCustomer] = reactExports.useState(null);
  const [selectedCustomer, setSelectedCustomer] = reactExports.useState(null);
  const [recentReceipts, setRecentReceipts] = reactExports.useState([]);
  const [loadingDetail, setLoadingDetail] = reactExports.useState(false);
  const [name, setName] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  const [whatsapp, setWhatsapp] = reactExports.useState("");
  const [upi, setUpi] = reactExports.useState("");
  const [address, setAddress] = reactExports.useState("");
  const [idType, setIdType] = reactExports.useState("Aadhaar");
  const [idNumber, setIdNumber] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const [lastReceiptDate, setLastReceiptDate] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  reactExports.useEffect(() => {
    loadCustomers();
  }, [session, search]);
  async function loadCustomers() {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetchERPCustomers(session.access_token, search || void 0);
      if (res.success) {
        setCustomers(res.customers);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }
  function openCreate() {
    setEditingCustomer(null);
    setName("");
    setPhone("");
    setWhatsapp("");
    setUpi("");
    setAddress("");
    setIdType("Aadhaar");
    setIdNumber("");
    setNotes("");
    setLastReceiptDate("");
    setDialogOpen(true);
  }
  function openEdit(c) {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone || "");
    setWhatsapp(c.whatsapp || "");
    setUpi(c.upi || "");
    setAddress(c.address || "");
    setIdType(c.id_type || "Aadhaar");
    setIdNumber(c.id_number || "");
    setNotes(c.notes || "");
    setLastReceiptDate(c.last_receipt_date ? c.last_receipt_date.split("T")[0] : "");
    setDialogOpen(true);
  }
  async function viewDetail(c) {
    setSelectedCustomer(c);
    setRecentReceipts([]);
    setDetailOpen(true);
    setLoadingDetail(true);
    try {
      const res = await fetchERPCustomerDetail(c.id, session?.access_token);
      if (res.success) {
        if (res.customer) {
          setSelectedCustomer(res.customer);
        }
        setRecentReceipts(groupReceipts(res.receipts));
      }
    } catch {
      toast.error("Could not fetch customer ledger logs");
    } finally {
      setLoadingDetail(false);
    }
  }
  async function handleTriggerNotification(c) {
    try {
      const res = await triggerCustomer30DayNotification(c.id, session?.access_token);
      if (res.success) {
        toast.success(`Admin notification generated for ${c.name}`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to trigger notification");
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Customer name is required");
    const payload = {
      name: name.trim(),
      phone: phone.trim() || null,
      whatsapp: whatsapp.trim() || null,
      upi: upi.trim() || null,
      address: address.trim() || null,
      id_type: idType || null,
      id_number: idNumber.trim() || null,
      notes: notes.trim() || null,
      last_receipt_date: lastReceiptDate ? new Date(lastReceiptDate).toISOString() : null
    };
    setSaving(true);
    try {
      if (editingCustomer) {
        const res = await updateERPCustomer(editingCustomer.id, payload, session?.access_token);
        if (res.success) {
          toast.success("Customer profile updated");
          setDialogOpen(false);
          setCustomers(
            (prev) => prev.map(
              (c) => c.id === editingCustomer.id ? { ...c, ...res.customer, name: res.customer?.name ?? payload.name ?? c.name } : c
            )
          );
        } else {
          toast.error(res.message || "Failed to update customer — please try again");
        }
      } else {
        const res = await createERPCustomer(payload, session?.access_token);
        if (res.success) {
          toast.success("Customer registered successfully");
          setDialogOpen(false);
          loadCustomers();
        } else {
          toast.error(res.message || "Failed to create customer — please try again");
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to save customer profile");
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to deactivate this customer?")) return;
    try {
      const res = await deleteERPCustomer(id, session?.access_token);
      if (res.success) {
        toast.success("Customer profile deactivated");
        loadCustomers();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete customer");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-in fade-in duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:max-w-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search B2C customers list...",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            className: "pl-9 rounded-xl border border-border bg-card text-xs"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 w-full sm:w-auto justify-end items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: loadCustomers,
            disabled: loading,
            className: "rounded-xl cursor-pointer",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openCreate, className: "rounded-xl gap-1.5 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          " Add Household Customer"
        ] })
      ] })
    ] }),
    loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 rounded-2xl border border-border/60 bg-card p-5", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-3 border-b border-border/40 last:border-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-48 animate-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-24 animate-pulse" })
    ] }, i)) }),
    !loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full border-collapse text-left text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/40 font-medium text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4", children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4", children: "Phone / Contact" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4", children: "Verification ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4", children: "Last Receipt / Pickup" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Pickups visits" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Lifetime Paid" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
        customers.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/10 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 font-semibold text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c.name }),
            c.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-normal italic truncate max-w-[150px]", children: c.notes })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-muted-foreground whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 text-[11px]", children: [
            c.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-foreground", title: "Phone", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3 text-muted-foreground" }),
              " ",
              c.phone
            ] }),
            c.whatsapp && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-emerald-600 font-medium", title: "WhatsApp", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-3 w-3 text-emerald-500" }),
              " ",
              c.whatsapp
            ] }),
            c.upi && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-indigo-600 font-medium", title: "UPI Number", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-3 w-3 text-indigo-500" }),
              " ",
              c.upi
            ] }),
            !c.phone && !c.whatsapp && !c.upi && "—"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap text-muted-foreground", children: c.id_type ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            c.id_type,
            ": ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: c.id_number })
          ] }) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
            c.last_receipt_date ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-foreground flex items-center gap-1.5 text-[11px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5 text-primary shrink-0" }),
                new Date(c.last_receipt_date).toLocaleDateString("en-IN")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-2.5 w-2.5" }),
                c.days_since_last_receipt !== null && c.days_since_last_receipt !== void 0 ? `${c.days_since_last_receipt} days ago` : "Recorded"
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground italic text-[11px]", children: "No receipts recorded" }),
            c.is_30_day_alert && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "mt-0.5 w-fit border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold gap-1 px-1.5 py-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-2.5 w-2.5" }),
              " 30+ Days Follow-up"
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-right font-semibold text-foreground", children: [
            c.total_visits || c.visit_count || 0,
            " collections"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-right font-bold text-foreground", children: [
            "₹ ",
            (c.total_paid || c.lifetime_paid || 0).toLocaleString()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: () => handleTriggerNotification(c),
                className: "h-7 w-7 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer",
                title: "Generate 30-Day Admin Notification",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: () => viewDetail(c),
                className: "h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer",
                title: "View Ledger",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: () => openEdit(c),
                className: "h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer",
                title: "Edit",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "h-4 w-4" })
              }
            ),
            isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: () => handleDelete(c.id),
                className: "h-7 w-7 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer",
                title: "Delete",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
              }
            )
          ] }) })
        ] }, c.id)),
        customers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-6 py-10 text-center text-muted-foreground", children: 'No household customers registered. Click "Add Household Customer" to create.' }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md bg-card rounded-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-base font-bold text-foreground", children: editingCustomer ? "Edit Customer details" : "Register B2C Customer (Household)" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cust-name", children: "Customer Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "cust-name",
              value: name,
              onChange: (e) => setName(e.target.value),
              placeholder: "e.g. Rahul Verma",
              required: true,
              className: "rounded-xl border border-border"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cust-phone", children: "Phone Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cust-phone",
                value: phone,
                onChange: (e) => setPhone(e.target.value),
                placeholder: "e.g. +91 98765 43210",
                className: "rounded-xl border border-border"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cust-whatsapp", children: "WhatsApp Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cust-whatsapp",
                value: whatsapp,
                onChange: (e) => setWhatsapp(e.target.value),
                placeholder: "e.g. +91 98765 43210",
                className: "rounded-xl border border-border"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cust-upi", children: "UPI Number / ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cust-upi",
                value: upi,
                onChange: (e) => setUpi(e.target.value),
                placeholder: "e.g. 9876543210@paytm",
                className: "rounded-xl border border-border"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cust-address", children: "Apartment/Flat address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cust-address",
                value: address,
                onChange: (e) => setAddress(e.target.value),
                placeholder: "Gaur City Tower B FLAT 1402...",
                className: "rounded-xl border border-border"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cust-id-type", children: "Govt ID Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                id: "cust-id-type",
                value: idType,
                onChange: (e) => setIdType(e.target.value),
                className: "w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Aadhaar", children: "Aadhaar" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "PAN Card", children: "PAN Card" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Voter ID", children: "Voter ID" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Driving License", children: "Driving License" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cust-id-num", children: "ID Verification Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cust-id-num",
                value: idNumber,
                onChange: (e) => setIdNumber(e.target.value),
                placeholder: "ID Card Number...",
                className: "rounded-xl border border-border"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cust-notes", children: "Internal Remarks / Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cust-notes",
                value: notes,
                onChange: (e) => setNotes(e.target.value),
                placeholder: "RWA coordinator, bulk supplier...",
                className: "rounded-xl border border-border"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cust-last-receipt", children: "Last Pickup / Receipt Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cust-last-receipt",
                type: "date",
                value: lastReceiptDate,
                onChange: (e) => setLastReceiptDate(e.target.value),
                className: "rounded-xl border border-border"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => setDialogOpen(false), className: "rounded-xl cursor-pointer", children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: saving, className: "rounded-xl cursor-pointer", children: saving ? "Saving..." : "Save Customer" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: detailOpen, onOpenChange: setDetailOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl bg-card rounded-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-base font-bold text-foreground", children: "Customer Collection History (Ledger)" }) }),
      selectedCustomer && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
        selectedCustomer.is_30_day_alert && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-amber-500/50 bg-amber-500/10 p-3.5 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 animate-in fade-in", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-amber-600 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: "30+ Days Pickup Alert Active" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] opacity-90", children: [
                selectedCustomer.days_since_last_receipt !== null && selectedCustomer.days_since_last_receipt !== void 0 ? `${selectedCustomer.days_since_last_receipt} days since last pickup date.` : "30+ days passed since last pickup.",
                " Time to follow up!"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              onClick: () => handleTriggerNotification(selectedCustomer),
              className: "rounded-lg bg-amber-600 text-white hover:bg-amber-700 text-xs px-2.5 py-1 gap-1 cursor-pointer shrink-0",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-3 w-3" }),
                " Send Admin Alert"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-muted/10 p-4 space-y-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-foreground", children: selectedCustomer.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "bg-primary/10 text-primary border-primary/20", children: "HOUSEHOLD B2C CUSTOMER" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-muted-foreground mt-2", children: [
            selectedCustomer.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3 text-primary" }),
              " Phone: ",
              selectedCustomer.phone
            ] }),
            selectedCustomer.whatsapp && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-3 w-3 text-emerald-600" }),
              " WhatsApp: ",
              selectedCustomer.whatsapp
            ] }),
            selectedCustomer.upi && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-3 w-3 text-indigo-600" }),
              " UPI: ",
              selectedCustomer.upi
            ] }),
            selectedCustomer.last_receipt_date && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 font-medium text-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3 text-primary" }),
              " Last Pickup: ",
              new Date(selectedCustomer.last_receipt_date).toLocaleDateString("en-IN"),
              " (",
              selectedCustomer.days_since_last_receipt ?? "?",
              "d ago)"
            ] }),
            selectedCustomer.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "col-span-2 flex items-start gap-1 mt-1 border-t border-border/40 pt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3 text-primary mt-0.5 shrink-0" }),
              " ",
              selectedCustomer.address
            ] }),
            selectedCustomer.id_type && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "col-span-2 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3 w-3 text-primary shrink-0" }),
              " ID verified — ",
              selectedCustomer.id_type,
              ": ",
              selectedCustomer.id_number
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-foreground mb-2", children: "Household collections scale receipts (B2C)" }),
          loadingDetail && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 py-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-full animate-pulse" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-full animate-pulse" })
          ] }),
          !loadingDetail && recentReceipts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center py-6 text-xs text-muted-foreground", children: "No scale pickup collections logged for this customer." }),
          !loadingDetail && recentReceipts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-xl border border-border bg-card max-h-[220px] overflow-y-auto pr-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-[11px] border-collapse", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/30 text-left text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2.5 font-medium", children: "Receipt No" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2.5 font-medium", children: "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2.5 font-medium", children: "Material" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2.5 font-medium text-right", children: "Weighed Qty" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2.5 font-medium text-right", children: "Paid Out" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: recentReceipts.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/10 animate-in fade-in duration-100", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2.5 font-semibold text-foreground", children: r.receipt_number }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2.5 text-muted-foreground", children: new Date(r.created_at).toLocaleDateString("en-IN") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2.5 text-foreground font-medium", children: r.material_name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-2.5 text-right text-muted-foreground", children: [
                r.weight,
                " ",
                r.unit
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-2.5 text-right font-bold text-foreground", children: [
                "₹",
                Number(r.total_amount).toLocaleString()
              ] })
            ] }, r.id)) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setDetailOpen(false), className: "rounded-xl cursor-pointer", children: "Close Details" }) })
      ] })
    ] }) })
  ] });
}
export {
  Route
};
