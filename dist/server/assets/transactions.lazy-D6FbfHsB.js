import { af as createLazyFileRoute, r as reactExports, ai as toast, L as jsxRuntimeExports, bo as Search, bj as RotateCw, aD as Plus, aG as Pen, bp as Download, as as MessageSquare, aE as Trash2, ao as Scale, bg as Calendar } from "./vendor-D_Usrqei.js";
import { u as useAuth, g as groupTransactions, B as Button } from "./router-Bj6HzPyA.js";
import { b as fetchERPMaterials, c as fetchERPSuppliers, d as fetchERPTransactions, s as sendERPWhatsApp, e as deleteERPTransaction, u as updateERPTransaction, g as createERPTransaction } from "./api-DznPMToT.js";
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
const Route = createLazyFileRoute("/admin/erp/transactions")({
  component: ERPTransactionsPage
});
const INVOICE_STATUS_COLORS = {
  paid: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200"
};
async function generatePDF(t) {
  const rawItems = t.materials && t.materials.length > 0 ? t.materials : [{
    id: t.id,
    material_id: "",
    material_name: t.material_name,
    weight: t.weight,
    unit: t.unit,
    price_per_unit: t.price_per_unit,
    subtotal: t.weight * t.price_per_unit,
    gst_rate: 0,
    gst_amount: 0,
    total_amount: t.total_amount
  }];
  const totalAmount = rawItems.reduce((sum, item) => sum + Number(item.total_amount), 0);
  await generateStandardPDF({
    docType: "SALE TICKET",
    docNumber: t.txn_number,
    docDate: t.created_at,
    partyTitle: "BILL TO",
    partyName: t.supplier_name || "Recycler",
    partyMobile: t.supplier_phone || "",
    paymentMethod: t.payment_method || "CASH",
    paidAmount: totalAmount,
    balanceAmount: 0,
    notes: t.notes || void 0,
    items: rawItems.map((item, idx) => ({
      sNo: idx + 1,
      name: item.material_name,
      qty: item.weight,
      unit: item.unit || "KGS",
      rate: item.price_per_unit,
      amount: item.total_amount
    }))
  });
}
function ERPTransactionsPage() {
  const { session, profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const [transactions, setTransactions] = reactExports.useState([]);
  const [materials, setMaterials] = reactExports.useState([]);
  const [suppliers, setSuppliers] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [search, setSearch] = reactExports.useState("");
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [supplierId, setSupplierId] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const [dueDate, setDueDate] = reactExports.useState("");
  const [immediatePayment, setImmediatePayment] = reactExports.useState(true);
  const [payMethod, setPayMethod] = reactExports.useState("cash");
  const [date, setDate] = reactExports.useState("");
  const [editingTransaction, setEditingTransaction] = reactExports.useState(null);
  const [items, setItems] = reactExports.useState([{ materialId: "", weight: "", price: "", gstRate: 0 }]);
  const handleItemChange = (index, key, val) => {
    const newItems = [...items];
    if (key === "materialId") {
      newItems[index].materialId = val;
      const selected = materials.find((m) => m.id === val);
      newItems[index].price = selected ? selected.buy_price : "";
    } else {
      newItems[index][key] = val;
    }
    setItems(newItems);
  };
  const addItemRow = () => {
    setItems([...items, { materialId: "", weight: "", price: "", gstRate: 0 }]);
  };
  const removeItemRow = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
  };
  reactExports.useEffect(() => {
    loadTransactions();
  }, [session, search]);
  reactExports.useEffect(() => {
    if (dialogOpen && session?.access_token) {
      fetchERPMaterials(session.access_token).then((res) => {
        if (res.success) setMaterials(res.materials);
      });
      fetchERPSuppliers(session.access_token).then((res) => {
        if (res.success) setSuppliers(res.suppliers);
      });
    }
  }, [dialogOpen, session]);
  async function loadTransactions() {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const params = {};
      if (search) params.supplier_name = search;
      const res = await fetchERPTransactions(session.access_token, params);
      if (res.success) {
        setTransactions(groupTransactions(res.transactions));
      }
    } catch (err) {
      toast.error(err.message || "Failed to load transactions log");
    } finally {
      setLoading(false);
    }
  }
  function openCreate() {
    setEditingTransaction(null);
    setSupplierId("");
    setItems([{ materialId: "", weight: "", price: "", gstRate: 0 }]);
    setNotes("");
    setDueDate("");
    setImmediatePayment(true);
    setPayMethod("cash");
    setDate((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
    setDialogOpen(true);
  }
  function openEdit(t) {
    setEditingTransaction(t);
    setSupplierId(t.supplier_id);
    setNotes(t.notes || "");
    setDate(new Date(t.created_at).toISOString().split("T")[0]);
    setImmediatePayment(!!t.payment_method);
    setPayMethod(t.payment_method || "cash");
    setDueDate(t.due_date || "");
    if (t.materials && t.materials.length > 0) {
      setItems(
        t.materials.map((m) => ({
          materialId: m.material_id,
          weight: m.weight,
          price: m.price_per_unit,
          gstRate: m.gst_rate || 0
        }))
      );
    } else {
      setItems([
        {
          materialId: "",
          weight: t.weight,
          price: t.price_per_unit,
          gstRate: 0
        }
      ]);
    }
    setDialogOpen(true);
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!supplierId) return toast.error("Recycler selection is required");
    if (items.length === 0) return toast.error("At least one material item is required");
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.materialId) return toast.error(`Material selection is required for item #${i + 1}`);
      if (!item.weight || Number(item.weight) <= 0) return toast.error(`Please enter valid weight for item #${i + 1}`);
      if (item.price === "" || Number(item.price) < 0) return toast.error(`Please enter valid purchase rate for item #${i + 1}`);
    }
    setSubmitting(true);
    try {
      const payload = {
        supplier_id: supplierId,
        notes: notes.trim() || null,
        due_date: immediatePayment ? null : dueDate || null,
        payment_method: immediatePayment ? payMethod : null,
        created_at: editingTransaction && date === new Date(editingTransaction.created_at).toISOString().split("T")[0] ? editingTransaction.created_at : date ? new Date(date).toISOString() : null,
        items: items.map((item) => ({
          material_id: item.materialId,
          weight: Number(item.weight),
          price_per_unit: Number(item.price),
          gst_rate: Number(item.gstRate)
        }))
      };
      if (editingTransaction) {
        const res = await updateERPTransaction(editingTransaction.id, payload, session?.access_token);
        if (res.success) {
          toast.success("Scale transaction(s) updated successfully!");
          setDialogOpen(false);
          loadTransactions();
        }
      } else {
        const res = await createERPTransaction(payload, session?.access_token);
        if (res.success) {
          toast.success("Scale transaction(s) recorded successfully!");
          setDialogOpen(false);
          loadTransactions();
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to save scale transaction");
    } finally {
      setSubmitting(false);
    }
  }
  async function handleWhatsApp(t) {
    try {
      const res = await sendERPWhatsApp(t.id, session?.access_token);
      if (res.success) {
        toast.success(res.message);
      }
    } catch (err) {
      toast.error(err.message || "Simulated alert trigger failed");
    }
  }
  async function handleDelete(id) {
    if (!confirm("Delete transaction? This reverses material inventory levels and deletes B2B invoices. Proceed?")) return;
    try {
      const res = await deleteERPTransaction(id, session?.access_token);
      if (res.success) {
        toast.success(res.message);
        loadTransactions();
      }
    } catch (err) {
      toast.error(err.message || "Transaction delete failed");
    }
  }
  const calcSubtotal = items.reduce((acc, curr) => acc + Number(curr.weight || 0) * Number(curr.price || 0), 0);
  const calcGst = items.reduce((acc, curr) => acc + Number(curr.weight || 0) * Number(curr.price || 0) * Number(curr.gstRate || 0) / 100, 0);
  const calcTotal = calcSubtotal + calcGst;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-in fade-in duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:max-w-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search transactions list...",
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
            onClick: loadTransactions,
            disabled: loading,
            className: "rounded-xl cursor-pointer",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openCreate, className: "rounded-xl gap-1.5 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          " Create Scale Ticket"
        ] })
      ] })
    ] }),
    loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 rounded-2xl border border-border/60 bg-card p-5", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-3 border-b border-border/40 last:border-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-48 animate-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-24 animate-pulse" })
    ] }, i)) }),
    !loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full border-collapse text-left text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/40 font-medium text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4", children: "Ticket ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4", children: "Recycler" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4", children: "Material" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Weighed Qty" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Unit Rate" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Payout Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Bill Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
        transactions.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/10 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 font-semibold text-foreground whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.txn_number }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-normal", children: new Date(t.created_at).toLocaleDateString("en-IN") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-foreground font-medium truncate max-w-[140px]", children: t.supplier_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-full", style: { backgroundColor: t.materials && t.materials.length > 1 ? "#a1a1aa" : t.color_hex } }),
            t.material_name
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-right font-semibold text-foreground whitespace-nowrap", children: [
            t.weight.toLocaleString(),
            " ",
            t.unit
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right text-muted-foreground", children: t.materials && t.materials.length > 1 ? "Various" : `₹${t.price_per_unit.toFixed(2)}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-right font-bold text-foreground", children: [
            "₹",
            t.total_amount.toLocaleString("en-IN")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "outline",
              className: `rounded-full text-[10px] px-2 py-0.5 ${INVOICE_STATUS_COLORS[t.invoice_status] || "bg-gray-100"}`,
              children: (t.invoice_status || "pending").toUpperCase()
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: () => openEdit(t),
                className: "h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer",
                title: "Edit Scale Ticket",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: () => generatePDF(t),
                className: "h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer",
                title: "Download Invoice",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: () => handleWhatsApp(t),
                className: "h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer",
                title: "Simulate WhatsApp Send",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4" })
              }
            ),
            isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: () => handleDelete(t.id),
                className: "h-7 w-7 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer",
                title: "Delete Scale Ticket",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
              }
            )
          ] }) })
        ] }, t.id)),
        transactions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "px-6 py-10 text-center text-muted-foreground", children: 'No scale transactions ticket recorded yet. Click "Create Scale Ticket" to start.' }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl bg-card rounded-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "text-base font-bold text-foreground flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "h-5 w-5 text-primary" }),
        " ",
        editingTransaction ? "Edit Scale Weigh Entry (B2B)" : "Log Scale Weigh Entry (B2B)"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "txn-supplier", children: "Recycler" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                id: "txn-supplier",
                value: supplierId,
                onChange: (e) => setSupplierId(e.target.value),
                required: true,
                className: "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select Recycler..." }),
                  suppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.id, children: s.name }, s.id))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "txn-date", children: "Collection Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "txn-date",
                type: "date",
                value: date,
                onChange: (e) => setDate(e.target.value),
                required: true,
                className: "rounded-xl border border-border"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-bold text-xs text-foreground", children: "Material Items" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", variant: "outline", onClick: addItemRow, className: "text-[10px] h-6 px-2 rounded-lg cursor-pointer", children: "+ Add Item" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 max-h-[220px] overflow-y-auto pr-1", children: items.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-end border border-border/40 rounded-xl p-3 bg-muted/5 relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px]", children: "Material" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: item.materialId,
                  onChange: (e) => handleItemChange(idx, "materialId", e.target.value),
                  required: true,
                  className: "w-full rounded-lg border border-border bg-background px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select Material..." }),
                    materials.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: m.id, children: m.name }, m.id))
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-24 space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px]", children: "Weight (kg)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  step: "0.001",
                  value: item.weight,
                  onChange: (e) => handleItemChange(idx, "weight", e.target.value !== "" ? Number(e.target.value) : ""),
                  placeholder: "0.000",
                  required: true,
                  className: "rounded-lg h-8 py-1 text-[11px]"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-24 space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px]", children: "Rate (₹/kg)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  step: "0.01",
                  value: item.price,
                  onChange: (e) => handleItemChange(idx, "price", e.target.value !== "" ? Number(e.target.value) : ""),
                  placeholder: "₹ 0.00",
                  required: true,
                  className: "rounded-lg h-8 py-1 text-[11px]"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-20 space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px]", children: "GST (%)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: item.gstRate,
                  onChange: (e) => handleItemChange(idx, "gstRate", Number(e.target.value)),
                  className: "w-full rounded-lg border border-border bg-background px-2 py-1.5 text-[11px] focus:outline-none",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 0, children: "0%" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 5, children: "5%" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 12, children: "12%" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 18, children: "18%" })
                  ]
                }
              )
            ] }),
            items.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "icon",
                onClick: () => removeItemRow(idx),
                className: "h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
              }
            )
          ] }, idx)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-muted/10 p-4 space-y-2 text-xs font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Subtotal:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "₹ ",
              calcSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "GST:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "₹ ",
              calcGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-2 flex justify-between text-sm font-bold text-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total Payout Amount:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary", children: [
              "₹ ",
              calcTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-1 border-t border-border/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-foreground", children: "Immediate Settlement Payment" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: immediatePayment,
                onChange: (e) => setImmediatePayment(e.target.checked),
                className: "h-4 w-4 accent-primary"
              }
            )
          ] }),
          immediatePayment ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 animate-in slide-in-from-top-1 duration-150", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Mode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-2", children: ["cash", "upi", "bank_transfer", "cheque"].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: payMethod === m ? "default" : "outline",
                size: "sm",
                onClick: () => setPayMethod(m),
                className: "rounded-xl text-[10px] uppercase font-bold cursor-pointer",
                children: m.replace("_", " ")
              },
              m
            )) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 animate-in slide-in-from-top-1 duration-150", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "txn-due", children: "Invoice Credit Due Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "txn-due",
                  type: "date",
                  value: dueDate,
                  onChange: (e) => setDueDate(e.target.value),
                  className: "pl-9 rounded-xl border border-border text-xs"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "txn-notes", children: "Transaction Remarks" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "txn-notes",
              value: notes,
              onChange: (e) => setNotes(e.target.value),
              placeholder: "Scale calibrations, vehicle reference...",
              className: "rounded-xl border border-border"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "pt-2 border-t border-border/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => setDialogOpen(false), className: "rounded-xl cursor-pointer", children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: submitting, className: "rounded-xl cursor-pointer", children: submitting ? "Saving Ticket..." : editingTransaction ? "Save Changes" : "Record Weighment" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  Route
};
