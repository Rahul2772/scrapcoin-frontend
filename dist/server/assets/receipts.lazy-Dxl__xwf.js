import { af as createLazyFileRoute, r as reactExports, ai as toast, L as jsxRuntimeExports, bo as Search, bj as RotateCw, aD as Plus, bv as Printer, aG as Pen, aE as Trash2, ao as Scale, aj as UserPlus, aV as Check } from "./vendor-D_Usrqei.js";
import { u as useAuth, a as groupReceipts, B as Button } from "./router-Bj6HzPyA.js";
import { b as fetchERPMaterials, l as fetchERPCustomers, m as fetchERPPurchaseReceipts, n as deleteERPPurchaseReceipt, o as updateERPPurchaseReceipt, p as createERPPurchaseReceipt, q as createERPCustomer } from "./api-DznPMToT.js";
import { I as Input } from "./input-B46-WYs4.js";
import { L as Label } from "./label-BYMti0SU.js";
import { S as Skeleton } from "./skeleton-Bi4Etyvs.js";
import { D as Dialog, b as DialogContent, c as DialogHeader, d as DialogTitle, e as DialogFooter } from "./dialog-DKRq5zBk.js";
import { g as generateStandardPDF } from "./pdfGenerator-DBfcNI1z.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./supabase-BkcVLFJa.js";
const Route = createLazyFileRoute("/admin/erp/receipts")({
  component: ERPReceiptsPage
});
async function generateReceiptPDF(r) {
  const rawItems = r.materials || [
    {
      material_name: r.material_name,
      weight: r.weight,
      unit: r.unit,
      price_per_unit: r.price_per_unit,
      total_amount: r.total_amount
    }
  ];
  await generateStandardPDF({
    docType: "PURCHASE",
    docNumber: r.receipt_number,
    docDate: r.created_at,
    partyTitle: "BILL FROM",
    partyName: r.customer_name || "Walk-in Customer",
    partyMobile: r.customer_phone || "",
    paymentMethod: r.payment_method || "CASH",
    paidAmount: r.total_amount,
    balanceAmount: 0,
    notes: r.notes || void 0,
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
function ERPReceiptsPage() {
  const { session, profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const [receipts, setReceipts] = reactExports.useState([]);
  const [materials, setMaterials] = reactExports.useState([]);
  const [customers, setCustomers] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [search, setSearch] = reactExports.useState("");
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [customerId, setCustomerId] = reactExports.useState("");
  const [payMethod, setPayMethod] = reactExports.useState("cash");
  const [notes, setNotes] = reactExports.useState("");
  const [date, setDate] = reactExports.useState("");
  const [editingReceipt, setEditingReceipt] = reactExports.useState(null);
  const [showNewCustForm, setShowNewCustForm] = reactExports.useState(false);
  const [newCustName, setNewCustName] = reactExports.useState("");
  const [newCustPhone, setNewCustPhone] = reactExports.useState("");
  const [newCustAddress, setNewCustAddress] = reactExports.useState("");
  const [creatingCust, setCreatingCust] = reactExports.useState(false);
  function resetNewCustForm() {
    setShowNewCustForm(false);
    setNewCustName("");
    setNewCustPhone("");
    setNewCustAddress("");
  }
  async function handleQuickCreateCustomer() {
    if (!newCustName.trim()) {
      toast.error("Customer full name is required");
      return null;
    }
    setCreatingCust(true);
    try {
      const res = await createERPCustomer(
        {
          name: newCustName.trim(),
          phone: newCustPhone.trim() || null,
          address: newCustAddress.trim() || null
        },
        session?.access_token
      );
      if (res.success && res.customer) {
        setCustomers((prev) => [res.customer, ...prev]);
        setCustomerId(res.customer.id);
        resetNewCustForm();
        toast.success(`Customer '${res.customer.name}' registered & selected!`);
        return res.customer.id;
      } else {
        toast.error("Failed to create customer");
        return null;
      }
    } catch (err) {
      toast.error(err.message || "Failed to register customer");
      return null;
    } finally {
      setCreatingCust(false);
    }
  }
  const [items, setItems] = reactExports.useState([{ materialId: "", weight: "", price: "" }]);
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
    setItems([...items, { materialId: "", weight: "", price: "" }]);
  };
  const removeItemRow = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
  };
  reactExports.useEffect(() => {
    loadReceipts();
  }, [session, search]);
  reactExports.useEffect(() => {
    if (dialogOpen && session?.access_token) {
      fetchERPMaterials(session.access_token).then((res) => {
        if (res.success) setMaterials(res.materials);
      });
      fetchERPCustomers(session.access_token).then((res) => {
        if (res.success) setCustomers(res.customers);
      });
    }
  }, [dialogOpen, session]);
  async function loadReceipts() {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const res = await fetchERPPurchaseReceipts(session.access_token);
      if (res.success) {
        setReceipts(groupReceipts(res.receipts));
      }
    } catch (err) {
      toast.error(err.message || "Failed to load receipts");
    } finally {
      setLoading(false);
    }
  }
  function openCreate() {
    setEditingReceipt(null);
    setCustomerId("");
    resetNewCustForm();
    setItems([{ materialId: "", weight: "", price: "" }]);
    setPayMethod("cash");
    setNotes("");
    setDate((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
    setDialogOpen(true);
  }
  function openEdit(r) {
    setEditingReceipt(r);
    setCustomerId(r.customer_id || "");
    resetNewCustForm();
    setPayMethod(r.payment_method || "cash");
    setNotes(r.notes || "");
    setDate(new Date(r.created_at).toISOString().split("T")[0]);
    if (r.materials && r.materials.length > 0) {
      setItems(
        r.materials.map((m) => ({
          materialId: m.material_id,
          weight: m.weight,
          price: m.price_per_unit
        }))
      );
    } else {
      setItems([
        {
          materialId: r.material_id || "",
          weight: r.weight || "",
          price: r.price_per_unit || ""
        }
      ]);
    }
    setDialogOpen(true);
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (items.length === 0) return toast.error("At least one material item is required");
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.materialId) return toast.error(`Material selection is required for item #${i + 1}`);
      if (!item.weight || Number(item.weight) <= 0) return toast.error(`Please enter valid weight for item #${i + 1}`);
      if (item.price === "" || Number(item.price) < 0) return toast.error(`Please enter valid buying rate for item #${i + 1}`);
    }
    setSubmitting(true);
    try {
      let finalCustomerId = customerId;
      if (customerId === "__NEW__" || showNewCustForm) {
        if (!newCustName.trim()) {
          setSubmitting(false);
          return toast.error("Please enter the new Household Customer Name");
        }
        const createdId = await handleQuickCreateCustomer();
        if (!createdId) {
          setSubmitting(false);
          return;
        }
        finalCustomerId = createdId;
      }
      const payload = {
        customer_id: finalCustomerId || null,
        payment_method: payMethod,
        notes: notes.trim() || null,
        created_at: editingReceipt && date === new Date(editingReceipt.created_at).toISOString().split("T")[0] ? editingReceipt.created_at : date ? new Date(date).toISOString() : null,
        items: items.map((item) => ({
          material_id: item.materialId,
          weight: Number(item.weight),
          price_per_unit: Number(item.price)
        }))
      };
      if (editingReceipt) {
        const res = await updateERPPurchaseReceipt(editingReceipt.id, payload, session?.access_token);
        if (res.success) {
          await loadReceipts();
          setDialogOpen(false);
          toast.success("B2C Pickup receipt updated successfully!");
        }
      } else {
        const res = await createERPPurchaseReceipt(payload, session?.access_token);
        if (res.success) {
          await loadReceipts();
          setDialogOpen(false);
          toast.success("B2C Pickup receipt recorded successfully!");
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to save scale receipt");
    } finally {
      setSubmitting(false);
    }
  }
  async function handleDelete(id) {
    if (!confirm("Delete B2C scale receipt? This reverses material stock counts and clears customer visit figures. Proceed?")) return;
    try {
      const res = await deleteERPPurchaseReceipt(id, session?.access_token);
      if (res.success) {
        toast.success(res.message);
        loadReceipts();
      }
    } catch (err) {
      toast.error(err.message || "Receipt deletion failed");
    }
  }
  const calcTotal = items.reduce((acc, curr) => acc + Number(curr.weight || 0) * Number(curr.price || 0), 0);
  const filtered = receipts.filter(
    (r) => r.receipt_number.toLowerCase().includes(search.toLowerCase()) || r.customer_name.toLowerCase().includes(search.toLowerCase()) || r.material_name.toLowerCase().includes(search.toLowerCase())
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-in fade-in duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:max-w-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search receipt list...",
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
            onClick: loadReceipts,
            disabled: loading,
            className: "rounded-xl cursor-pointer",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openCreate, className: "rounded-xl gap-1.5 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          " Create Scale Ticket (B2C)"
        ] })
      ] })
    ] }),
    loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 rounded-2xl border border-border/60 bg-card p-5", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-3 border-b border-border/40 last:border-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-48 animate-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-24 animate-pulse" })
    ] }, i)) }),
    !loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full border-collapse text-left text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/40 font-medium text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4", children: "Receipt No" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4", children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4", children: "Material Collected" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Qty" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Unit Rate" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Cash Paid" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
        filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/10 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 font-semibold text-foreground whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.receipt_number }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-normal", children: new Date(r.created_at).toLocaleDateString("en-IN") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 font-medium text-foreground truncate max-w-[140px]", children: r.customer_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap text-muted-foreground", children: r.material_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-right font-semibold text-foreground whitespace-nowrap", children: [
            r.weight.toLocaleString(),
            " ",
            r.unit
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right text-muted-foreground", children: r.materials && r.materials.length > 1 ? "Various" : `₹${r.price_per_unit.toFixed(2)}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-right font-bold text-foreground", children: [
            "₹",
            r.total_amount.toLocaleString()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-right whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: () => generateReceiptPDF(r),
                className: "h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer",
                title: "Print Receipt",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: () => openEdit(r),
                className: "h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer",
                title: "Edit Scale Receipt",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "h-4 w-4" })
              }
            ),
            isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: () => handleDelete(r.id),
                className: "h-7 w-7 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer",
                title: "Delete Scale Receipt",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
              }
            )
          ] }) })
        ] }, r.id)),
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "px-6 py-10 text-center text-muted-foreground", children: 'No household collection receipts logged. Click "Create Scale Ticket (B2C)" to start.' }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl bg-card rounded-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "text-base font-bold text-foreground flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "h-5 w-5 text-primary" }),
        " ",
        editingReceipt ? "Edit B2C Scale Collection Receipt" : "Log B2C Scale Collection Receipt"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 col-span-1 md:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rec-cust", children: "Household Customer (Optional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    if (!showNewCustForm) {
                      setShowNewCustForm(true);
                      setCustomerId("__NEW__");
                    } else {
                      resetNewCustForm();
                      setCustomerId("");
                    }
                  },
                  className: "text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-3 w-3" }),
                    showNewCustForm ? "Select Existing Customer" : "+ Add New Customer"
                  ]
                }
              )
            ] }),
            !showNewCustForm ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                id: "rec-cust",
                value: customerId,
                onChange: (e) => {
                  if (e.target.value === "__NEW__") {
                    setShowNewCustForm(true);
                    setCustomerId("__NEW__");
                  } else {
                    setCustomerId(e.target.value);
                  }
                },
                className: "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Walk-in Customer (Unregistered)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__NEW__", children: "+ Create New Household Customer..." }),
                  customers.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: c.id, children: [
                    c.name,
                    " (",
                    c.phone || "No phone",
                    ")"
                  ] }, c.id))
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold text-foreground flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-3.5 w-3.5 text-primary" }),
                  "Quick Add Household Customer"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      resetNewCustForm();
                      setCustomerId("");
                    },
                    className: "text-[10px] text-muted-foreground hover:text-foreground cursor-pointer",
                    children: "Cancel"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "Customer Full Name *",
                  value: newCustName,
                  onChange: (e) => setNewCustName(e.target.value),
                  className: "rounded-lg text-xs bg-background h-8",
                  required: true
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    placeholder: "Phone Number (Optional)",
                    value: newCustPhone,
                    onChange: (e) => setNewCustPhone(e.target.value),
                    className: "rounded-lg text-xs bg-background h-8"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    placeholder: "Address / Area (Optional)",
                    value: newCustAddress,
                    onChange: (e) => setNewCustAddress(e.target.value),
                    className: "rounded-lg text-xs bg-background h-8"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[11px] text-muted-foreground pt-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Will auto-register on receipt save" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    type: "button",
                    size: "sm",
                    disabled: creatingCust || !newCustName.trim(),
                    onClick: handleQuickCreateCustomer,
                    className: "h-6 text-[10px] px-2.5 rounded-lg cursor-pointer gap-1",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }),
                      creatingCust ? "Saving..." : "Save & Select"
                    ]
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rec-date", children: "Collection Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "rec-date",
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-bold text-xs text-foreground", children: "Materials Collected" }),
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
                    materials.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: m.id, children: [
                      m.name,
                      " (₹",
                      m.buy_price,
                      ")"
                    ] }, m.id))
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-28 space-y-1", children: [
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
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-28 space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px]", children: "Buying Rate" }),
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-muted/10 p-4 flex justify-between items-center font-bold text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "Total Cash Paid to Customer:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary text-sm", children: [
            "₹ ",
            calcTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Payment Mode" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: ["cash", "upi", "bank_transfer"].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
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
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rec-notes", children: "Remarks / Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "rec-notes",
              value: notes,
              onChange: (e) => setNotes(e.target.value),
              placeholder: "Scale number, vehicle details...",
              className: "rounded-xl border border-border"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "pt-2 border-t border-border/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => setDialogOpen(false), className: "rounded-xl cursor-pointer", children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: submitting, className: "rounded-xl cursor-pointer", children: submitting ? "Saving Receipt..." : editingReceipt ? "Update Scale Collection" : "Record Scale Collection" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  Route
};
