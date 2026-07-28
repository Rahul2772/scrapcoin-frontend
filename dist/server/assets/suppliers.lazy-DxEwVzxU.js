import { af as createLazyFileRoute, r as reactExports, ai as toast, L as jsxRuntimeExports, bo as Search, bj as RotateCw, aD as Plus, bq as Phone, as as MessageSquare, br as Wallet, bs as Mail, bt as Eye, aG as Pen, aE as Trash2, bu as MapPin, ap as FileText } from "./vendor-D_Usrqei.js";
import { u as useAuth, B as Button } from "./router-Bj6HzPyA.js";
import { c as fetchERPSuppliers, h as fetchERPSupplierDetail, i as deleteERPSupplier, j as updateERPSupplier, k as createERPSupplier } from "./api-DznPMToT.js";
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
const Route = createLazyFileRoute("/admin/erp/suppliers")({
  component: ERPSuppliersPage
});
function ERPSuppliersPage() {
  const { session, profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const [suppliers, setSuppliers] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [search, setSearch] = reactExports.useState("");
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [detailOpen, setDetailOpen] = reactExports.useState(false);
  const [editingSupplier, setEditingSupplier] = reactExports.useState(null);
  const [selectedSupplier, setSelectedSupplier] = reactExports.useState(null);
  const [recentTxns, setRecentTxns] = reactExports.useState([]);
  const [loadingDetail, setLoadingDetail] = reactExports.useState(false);
  const [name, setName] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  const [whatsapp, setWhatsapp] = reactExports.useState("");
  const [upi, setUpi] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [address, setAddress] = reactExports.useState("");
  const [idType, setIdType] = reactExports.useState("Aadhaar");
  const [idNumber, setIdNumber] = reactExports.useState("");
  reactExports.useEffect(() => {
    loadSuppliers();
  }, [session, search]);
  async function loadSuppliers() {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetchERPSuppliers(session.access_token, search || void 0);
      if (res.success) {
        setSuppliers(res.suppliers);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }
  function openCreate() {
    setEditingSupplier(null);
    setName("");
    setPhone("");
    setWhatsapp("");
    setUpi("");
    setEmail("");
    setAddress("");
    setIdType("Aadhaar");
    setIdNumber("");
    setDialogOpen(true);
  }
  function openEdit(s) {
    setEditingSupplier(s);
    setName(s.name);
    setPhone(s.phone || "");
    setWhatsapp(s.whatsapp || "");
    setUpi(s.upi || "");
    setEmail(s.email || "");
    setAddress(s.address || "");
    setIdType(s.id_type || "Aadhaar");
    setIdNumber(s.id_number || "");
    setDialogOpen(true);
  }
  async function viewDetail(s) {
    setSelectedSupplier(s);
    setRecentTxns([]);
    setDetailOpen(true);
    setLoadingDetail(true);
    try {
      const res = await fetchERPSupplierDetail(s.id, session?.access_token);
      if (res.success) {
        setRecentTxns(res.recent_transactions);
      }
    } catch {
      toast.error("Could not fetch supplier details");
    } finally {
      setLoadingDetail(false);
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Recycler name is required");
    const payload = {
      name: name.trim(),
      phone: phone.trim() || null,
      whatsapp: whatsapp.trim() || null,
      upi: upi.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null,
      id_type: idType || null,
      id_number: idNumber.trim() || null
    };
    try {
      if (editingSupplier) {
        const res = await updateERPSupplier(editingSupplier.id, payload, session?.access_token);
        if (res.success) {
          toast.success("Recycler profile updated");
          setDialogOpen(false);
          loadSuppliers();
        }
      } else {
        const res = await createERPSupplier(payload, session?.access_token);
        if (res.success) {
          toast.success("Recycler registered successfully");
          setDialogOpen(false);
          loadSuppliers();
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to save supplier profile");
    }
  }
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    try {
      const res = await deleteERPSupplier(id, session?.access_token);
      if (res.success) {
        toast.success("Recycler profile deactivated");
        loadSuppliers();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete supplier");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-in fade-in duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:max-w-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search suppliers name/phone...",
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
            onClick: loadSuppliers,
            disabled: loading,
            className: "rounded-xl cursor-pointer",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openCreate, className: "rounded-xl gap-1.5 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          " Register Supplier"
        ] })
      ] })
    ] }),
    loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 rounded-2xl border border-border/60 bg-card p-5", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-3 border-b border-border/40 last:border-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-48 animate-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-24 animate-pulse" })
    ] }, i)) }),
    !loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full border-collapse text-left text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/40 font-medium text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4", children: "Recycler" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4", children: "Phone / Contact" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4", children: "Verification ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Transactions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Total Value" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
        suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/10 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 font-semibold text-foreground", children: s.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-muted-foreground whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 text-[11px]", children: [
            s.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-foreground", title: "Phone", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3 text-muted-foreground" }),
              " ",
              s.phone
            ] }),
            s.whatsapp && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-emerald-600 font-medium", title: "WhatsApp", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-3 w-3 text-emerald-500" }),
              " ",
              s.whatsapp
            ] }),
            s.upi && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-indigo-650 font-medium", title: "UPI Number", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-3 w-3 text-indigo-500" }),
              " ",
              s.upi
            ] }),
            s.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-muted-foreground", title: "Email", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3 w-3" }),
              " ",
              s.email
            ] }),
            !s.phone && !s.whatsapp && !s.upi && !s.email && "—"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap text-muted-foreground", children: s.id_type ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            s.id_type,
            ": ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: s.id_number })
          ] }) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-right font-semibold text-foreground", children: [
            s.total_transactions,
            " txns"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-right font-bold text-foreground", children: [
            "₹ ",
            s.total_value?.toLocaleString()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: () => viewDetail(s),
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
                onClick: () => openEdit(s),
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
                onClick: () => handleDelete(s.id),
                className: "h-7 w-7 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer",
                title: "Delete",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
              }
            )
          ] }) })
        ] }, s.id)),
        suppliers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-6 py-10 text-center text-muted-foreground", children: 'No suppliers registered. Click "Register Recycler" to catalog.' }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md bg-card rounded-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-base font-bold text-foreground", children: editingSupplier ? "Edit Recycler profile" : "Register B2B Recycler" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "sup-name", children: "Recycler Name / Business Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "sup-name",
              value: name,
              onChange: (e) => setName(e.target.value),
              placeholder: "e.g. Sharma Metal Recycling Ltd",
              required: true,
              className: "rounded-xl border border-border"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "sup-phone", children: "Phone Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "sup-phone",
                value: phone,
                onChange: (e) => setPhone(e.target.value),
                placeholder: "e.g. +91 98765 43210",
                className: "rounded-xl border border-border"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "sup-whatsapp", children: "WhatsApp Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "sup-whatsapp",
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "sup-upi", children: "UPI Number / ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "sup-upi",
                value: upi,
                onChange: (e) => setUpi(e.target.value),
                placeholder: "e.g. 9876543210@paytm",
                className: "rounded-xl border border-border"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "sup-email", children: "Email Address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "sup-email",
                type: "email",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                placeholder: "contact@supplier.com",
                className: "rounded-xl border border-border"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "sup-address", children: "Business Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "sup-address",
              value: address,
              onChange: (e) => setAddress(e.target.value),
              placeholder: "Plot 12, Ind Area, Sector 5...",
              className: "rounded-xl border border-border"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "sup-id-type", children: "Govt ID Verification Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                id: "sup-id-type",
                value: idType,
                onChange: (e) => setIdType(e.target.value),
                className: "w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "GSTIN", children: "GSTIN" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "PAN Card", children: "PAN Card" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Aadhaar", children: "Aadhaar" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Trade License", children: "Trade License" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "sup-id-num", children: "ID Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "sup-id-num",
                value: idNumber,
                onChange: (e) => setIdNumber(e.target.value),
                placeholder: "ID Number...",
                className: "rounded-xl border border-border"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => setDialogOpen(false), className: "rounded-xl cursor-pointer", children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "rounded-xl cursor-pointer", children: "Save Profile" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: detailOpen, onOpenChange: setDetailOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl bg-card rounded-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-base font-bold text-foreground", children: "Supplier Business Ledger" }) }),
      selectedSupplier && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-muted/10 p-4 space-y-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-foreground", children: selectedSupplier.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "bg-emerald-50 text-emerald-700 border-emerald-200", children: "B2B PARTNER" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-muted-foreground mt-2", children: [
            selectedSupplier.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3 text-primary" }),
              " Phone: ",
              selectedSupplier.phone
            ] }),
            selectedSupplier.whatsapp && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-3 w-3 text-emerald-600" }),
              " WhatsApp: ",
              selectedSupplier.whatsapp
            ] }),
            selectedSupplier.upi && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-3 w-3 text-indigo-600" }),
              " UPI: ",
              selectedSupplier.upi
            ] }),
            selectedSupplier.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3 w-3 text-primary" }),
              " Email: ",
              selectedSupplier.email
            ] }),
            selectedSupplier.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "col-span-2 flex items-start gap-1 mt-1 border-t border-border/40 pt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3 text-primary mt-0.5 shrink-0" }),
              " ",
              selectedSupplier.address
            ] }),
            selectedSupplier.id_type && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "col-span-2 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3 w-3 text-primary shrink-0" }),
              " ID Verified — ",
              selectedSupplier.id_type,
              ": ",
              selectedSupplier.id_number
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-foreground mb-2", children: "Recent scale ticket purchases (B2B)" }),
          loadingDetail && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 py-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-full animate-pulse" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-full animate-pulse" })
          ] }),
          !loadingDetail && recentTxns.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center py-6 text-xs text-muted-foreground", children: "No transactions registered under this supplier." }),
          !loadingDetail && recentTxns.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-xl border border-border bg-card max-h-[220px] overflow-y-auto pr-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-[11px] border-collapse", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/30 text-left text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2.5 font-medium", children: "Txn No." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2.5 font-medium", children: "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2.5 font-medium", children: "Material" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2.5 font-medium text-right", children: "Qty" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2.5 font-medium text-right", children: "Amount" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: recentTxns.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2.5 font-semibold text-foreground", children: t.txn_number }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2.5 text-muted-foreground", children: new Date(t.created_at).toLocaleDateString("en-IN") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2.5 text-foreground font-medium", children: t.material_name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-2.5 text-right text-muted-foreground", children: [
                t.weight,
                " ",
                t.unit
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-2.5 text-right font-bold text-foreground", children: [
                "₹",
                Number(t.total_amount).toLocaleString()
              ] })
            ] }, t.id)) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setDetailOpen(false), className: "rounded-xl cursor-pointer", children: "Close Ledger" }) })
      ] })
    ] }) })
  ] });
}
export {
  Route
};
