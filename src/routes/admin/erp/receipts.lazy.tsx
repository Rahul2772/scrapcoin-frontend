import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchERPPurchaseReceipts,
  fetchERPMaterials,
  fetchERPCustomers,
  createERPCustomer,
  createERPPurchaseReceipt,
  updateERPPurchaseReceipt,
  deleteERPPurchaseReceipt,
  fetchTelegramReceipts,
  verifyTelegramReceipt,
  rejectTelegramReceipt,
  fetchTelegramReceiptPdfUrl,
  type ERPPurchaseReceipt,
  type ERPMaterial,
  type ERPCustomer,
  type TelegramReceipt,
} from "@/lib/api";
import { groupReceipts, type GroupedERPPurchaseReceipt } from "@/lib/utils";
import { exportReceiptsCsv } from "@/lib/exportCsv";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Trash2,
  Printer,
  RotateCw,
  Scale,
  Edit2,
  UserPlus,
  Check,
  Download,
  Send,
  ExternalLink,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createLazyFileRoute("/admin/erp/receipts")({
  component: ERPReceiptsPage,
});

import { generateStandardPDF } from "@/lib/pdfGenerator";

// PDF Generator for B2C Receipts using standard format
async function generateReceiptPDF(r: GroupedERPPurchaseReceipt) {
  const rawItems = r.materials || [
    {
      material_name: r.material_name,
      weight: r.weight,
      unit: r.unit,
      price_per_unit: r.price_per_unit,
      total_amount: r.total_amount,
    },
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
    notes: r.notes || undefined,
    items: rawItems.map((item, idx) => ({
      sNo: idx + 1,
      name: item.material_name,
      qty: item.weight,
      unit: item.unit || "KGS",
      rate: item.price_per_unit,
      amount: item.total_amount,
    })),
  });
}

function ERPReceiptsPage() {
  const { session, profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  // ── Tab state: 'b2c' | 'telegram' ─────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"b2c" | "telegram">("b2c");

  // ── B2C state ─────────────────────────────────────────────────────────────
  const [receipts, setReceipts] = useState<GroupedERPPurchaseReceipt[]>([]);
  const [materials, setMaterials] = useState<ERPMaterial[]>([]);
  const [customers, setCustomers] = useState<ERPCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ── Telegram state ────────────────────────────────────────────────────────
  const [tgReceipts, setTgReceipts] = useState<TelegramReceipt[]>([]);
  const [tgLoading, setTgLoading] = useState(false);
  const [tgStatusFilter, setTgStatusFilter] = useState<"all" | "pending_review" | "verified" | "rejected">("pending_review");
  const [tgActioning, setTgActioning] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Modals
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [customerId, setCustomerId] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [editingReceipt, setEditingReceipt] = useState<GroupedERPPurchaseReceipt | null>(null);

  // Inline Runtime Customer creation states
  const [showNewCustForm, setShowNewCustForm] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");
  const [creatingCust, setCreatingCust] = useState(false);

  function resetNewCustForm() {
    setShowNewCustForm(false);
    setNewCustName("");
    setNewCustPhone("");
    setNewCustAddress("");
  }

  async function handleQuickCreateCustomer(): Promise<string | null> {
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
          address: newCustAddress.trim() || null,
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
    } catch (err: any) {
      toast.error(err.message || "Failed to register customer");
      return null;
    } finally {
      setCreatingCust(false);
    }
  }

  type ReceiptItem = {
    materialId: string;
    weight: number | "";
    price: number | "";
  };
  const [items, setItems] = useState<ReceiptItem[]>([{ materialId: "", weight: "", price: "" }]);

  const handleItemChange = (index: number, key: keyof ReceiptItem, val: any) => {
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

  const removeItemRow = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  useEffect(() => {
    loadReceipts();
  }, [session, search]);

  useEffect(() => {
    if (activeTab === "telegram" && session?.access_token) {
      loadTelegramReceipts();
    }
  }, [activeTab, tgStatusFilter, session]);

  useEffect(() => {
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
    } catch (err: any) {
      toast.error(err.message || "Failed to load receipts");
    } finally {
      setLoading(false);
    }
  }

  async function loadTelegramReceipts() {
    if (!session?.access_token) return;
    setTgLoading(true);
    try {
      const statusArg = tgStatusFilter === "all" ? undefined : tgStatusFilter;
      const res = await fetchTelegramReceipts(session.access_token, statusArg);
      if (res.success) setTgReceipts(res.receipts);
    } catch (err: any) {
      toast.error(err.message || "Failed to load Telegram receipts");
    } finally {
      setTgLoading(false);
    }
  }

  async function handleTgVerify(id: string) {
    if (!session?.access_token) return;
    setTgActioning(id);
    try {
      const res = await verifyTelegramReceipt(id, session.access_token);
      if (res.success) {
        toast.success("Receipt verified ✅");
        loadTelegramReceipts();
      }
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setTgActioning(null);
    }
  }

  async function handleTgReject(id: string) {
    if (!session?.access_token) return;
    setTgActioning(id);
    try {
      const res = await rejectTelegramReceipt(id, rejectReason, session.access_token);
      if (res.success) {
        toast.success("Receipt rejected");
        setRejectingId(null);
        setRejectReason("");
        loadTelegramReceipts();
      }
    } catch (err: any) {
      toast.error(err.message || "Rejection failed");
    } finally {
      setTgActioning(null);
    }
  }

  async function openPdf(id: string) {
    if (!session?.access_token) return;
    try {
      const res = await fetchTelegramReceiptPdfUrl(id, session.access_token);
      if (res.success && res.url) window.open(res.url, "_blank");
      else toast.error("PDF not available");
    } catch {
      toast.error("Could not open PDF");
    }
  }

  const pendingTgCount = tgReceipts.filter(
    (r) => r.status === "pending_review" && tgStatusFilter === "pending_review"
  ).length;

  function openCreate() {
    setEditingReceipt(null);
    setCustomerId("");
    resetNewCustForm();
    setItems([{ materialId: "", weight: "", price: "" }]);
    setPayMethod("cash");
    setNotes("");
    setDate(new Date().toISOString().split("T")[0]);
    setDialogOpen(true);
  }

  function openEdit(r: GroupedERPPurchaseReceipt) {
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
          price: m.price_per_unit,
        }))
      );
    } else {
      setItems([
        {
          materialId: (r as any).material_id || "",
          weight: r.weight || "",
          price: r.price_per_unit || "",
        },
      ]);
    }
    setDialogOpen(true);
  }


  async function handleSubmit(e: React.FormEvent) {
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
        created_at: editingReceipt && date === new Date(editingReceipt.created_at).toISOString().split("T")[0]
          ? editingReceipt.created_at
          : (date ? new Date(date).toISOString() : null),
        items: items.map((item) => ({
          material_id: item.materialId,
          weight: Number(item.weight),
          price_per_unit: Number(item.price),
        })),
      };

      if (editingReceipt) {
        const res = await updateERPPurchaseReceipt(editingReceipt.id, payload, session?.access_token);
        if (res.success) {
          // Reload the list first so the updated data is ready, THEN close the dialog
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
    } catch (err: any) {
      toast.error(err.message || "Failed to save scale receipt");
    } finally {
      setSubmitting(false);
    }
  }



  async function handleDelete(id: string) {
    if (!confirm("Delete B2C scale receipt? This reverses material stock counts and clears customer visit figures. Proceed?")) return;
    try {
      const res = await deleteERPPurchaseReceipt(id, session?.access_token);
      if (res.success) {
        toast.success(res.message);
        loadReceipts();
      }
    } catch (err: any) {
      toast.error(err.message || "Receipt deletion failed");
    }
  }

  const calcTotal = items.reduce((acc, curr) => acc + (Number(curr.weight || 0) * Number(curr.price || 0)), 0);

  const filtered = receipts.filter(
    (r) =>
      r.receipt_number.toLowerCase().includes(search.toLowerCase()) ||
      r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      r.material_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ── Tab switcher ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          onClick={() => setActiveTab("b2c")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "b2c"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Scale className="h-3.5 w-3.5" />
          B2C Receipts
        </button>
        <button
          onClick={() => setActiveTab("telegram")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "telegram"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Send className="h-3.5 w-3.5" />
          Telegram Receipts
          {/* Pending badge — load count on mount */}
          <TelegramPendingBadge token={session?.access_token} />
        </button>
      </div>

      {/* ── B2C Tab ──────────────────────────────────────────────────────── */}
      {activeTab === "b2c" && (
        <>
      {/* Filtering Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search receipt list..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border border-border bg-card text-xs"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 w-full sm:w-auto justify-end items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={loadReceipts}
            disabled={loading}
            className="rounded-xl cursor-pointer"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => exportReceiptsCsv(filtered)}
            disabled={loading || filtered.length === 0}
            className="rounded-xl cursor-pointer gap-1.5"
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>

          <Button size="sm" onClick={openCreate} className="rounded-xl gap-1.5 cursor-pointer">
            <Plus className="h-4 w-4" /> Create Scale Ticket (B2C)
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
              <Skeleton className="h-5 w-48 animate-pulse" />
              <Skeleton className="h-5 w-24 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Receipts Table */}
      {!loading && (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 font-medium text-muted-foreground">
                  <th className="px-6 py-4">Receipt No</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Material Collected</th>
                  <th className="px-6 py-4 text-right">Qty</th>
                  <th className="px-6 py-4 text-right">Unit Rate</th>
                  <th className="px-6 py-4 text-right">Cash Paid</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{r.receipt_number}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {new Date(r.created_at).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground truncate max-w-[140px]">
                      {r.customer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {r.material_name}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-foreground whitespace-nowrap">
                      {r.weight.toLocaleString()} {r.unit}
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground">
                      {r.materials && r.materials.length > 1 ? "Various" : `₹${r.price_per_unit.toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-foreground">₹{r.total_amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => generateReceiptPDF(r)}
                          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Print Receipt"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(r)}
                          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Edit Scale Receipt"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(r.id)}
                            className="h-7 w-7 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Delete Scale Receipt"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                      No household collection receipts logged. Click "Create Scale Ticket (B2C)" to start.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </>
      )}

      {/* ── Telegram Tab ─────────────────────────────────────────────────── */}
      {activeTab === "telegram" && (
        <div className="space-y-4">
          {/* Status filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["pending_review", "verified", "rejected", "all"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setTgStatusFilter(s)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                  tgStatusFilter === s
                    ? s === "pending_review" ? "bg-amber-500 text-white"
                      : s === "verified"     ? "bg-emerald-500 text-white"
                      : s === "rejected"     ? "bg-gray-400 text-white"
                      : "bg-primary text-primary-foreground"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                {s === "pending_review" ? "⏳ Pending" : s === "verified" ? "✅ Verified" : s === "rejected" ? "⛔ Rejected" : "All"}
              </button>
            ))}
            <Button variant="ghost" size="sm" onClick={loadTelegramReceipts} disabled={tgLoading} className="ml-auto rounded-xl h-7 cursor-pointer">
              <RotateCw className={`h-3.5 w-3.5 ${tgLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Telegram receipts table */}
          {tgLoading ? (
            <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                  <Skeleton className="h-5 w-48 animate-pulse" />
                  <Skeleton className="h-5 w-24 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 font-medium text-muted-foreground">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Receipt No.</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Items</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {tgReceipts.map((r) => (
                      <tr key={r.id} className={`transition-colors ${
                        r.status === "pending_review" ? "bg-amber-500/5 hover:bg-amber-500/10" : "hover:bg-muted/10"
                      }`}>
                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {r.purchase_no ?? <span className="text-muted-foreground italic">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{r.customer_name ?? "—"}</div>
                          {r.customer_mobile && (
                            <div className="text-[10px] text-muted-foreground">{r.customer_mobile}</div>
                          )}
                          {r.erp_customers && (
                            <div className="text-[10px] text-emerald-600">✓ linked</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {r.line_items?.length > 0
                            ? r.line_items.map((li) => li.item_name).join(", ")
                            : <span className="text-muted-foreground italic">unreadable</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-foreground">
                          {r.total_amount != null ? `₹${r.total_amount.toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                            r.status === "pending_review"
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : r.status === "verified"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}>
                            {r.status === "pending_review" ? "⏳ Pending" : r.status === "verified" ? "✅ Verified" : "⛔ Rejected"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* PDF preview */}
                            {r.pdf_storage_path && (
                              <Button
                                variant="ghost" size="icon"
                                onClick={() => openPdf(r.id)}
                                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-blue-600 cursor-pointer"
                                title="View original PDF"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {/* Verify / Reject — only for pending, only admin */}
                            {r.status === "pending_review" && isAdmin && (
                              <>
                                <Button
                                  variant="ghost" size="icon"
                                  onClick={() => handleTgVerify(r.id)}
                                  disabled={tgActioning === r.id}
                                  className="h-7 w-7 rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                  title="Approve"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost" size="icon"
                                  onClick={() => { setRejectingId(r.id); setRejectReason(""); }}
                                  disabled={tgActioning === r.id}
                                  className="h-7 w-7 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                                  title="Reject"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                          {/* Inline reject reason input */}
                          {rejectingId === r.id && (
                            <div className="mt-2 flex flex-col gap-1.5 min-w-[200px]">
                              <Input
                                placeholder="Reason (optional)"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="h-7 text-[11px] rounded-lg"
                                autoFocus
                              />
                              <div className="flex gap-1">
                                <Button size="sm" className="h-6 text-[10px] rounded-lg flex-1 cursor-pointer" onClick={() => handleTgReject(r.id)} disabled={tgActioning === r.id}>
                                  Confirm Reject
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 text-[10px] rounded-lg cursor-pointer" onClick={() => setRejectingId(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {tgReceipts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                          <Send className="h-8 w-8 mx-auto mb-2 opacity-20" />
                          No Telegram receipts{tgStatusFilter !== "all" ? ` with status "${tgStatusFilter}"` : ""}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* weigh ticket entry dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-card rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" /> {editingReceipt ? "Edit B2C Scale Collection Receipt" : "Log B2C Scale Collection Receipt"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="rec-cust">Household Customer (Optional)</Label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!showNewCustForm) {
                        setShowNewCustForm(true);
                        setCustomerId("__NEW__");
                      } else {
                        resetNewCustForm();
                        setCustomerId("");
                      }
                    }}
                    className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="h-3 w-3" />
                    {showNewCustForm ? "Select Existing Customer" : "+ Add New Customer"}
                  </button>
                </div>

                {!showNewCustForm ? (
                  <select
                    id="rec-cust"
                    value={customerId}
                    onChange={(e) => {
                      if (e.target.value === "__NEW__") {
                        setShowNewCustForm(true);
                        setCustomerId("__NEW__");
                      } else {
                        setCustomerId(e.target.value);
                      }
                    }}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Walk-in Customer (Unregistered)</option>
                    <option value="__NEW__">+ Create New Household Customer...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone || "No phone"})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <UserPlus className="h-3.5 w-3.5 text-primary" />
                        Quick Add Household Customer
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          resetNewCustForm();
                          setCustomerId("");
                        }}
                        className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      <Input
                        placeholder="Customer Full Name *"
                        value={newCustName}
                        onChange={(e) => setNewCustName(e.target.value)}
                        className="rounded-lg text-xs bg-background h-8"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Phone Number (Optional)"
                        value={newCustPhone}
                        onChange={(e) => setNewCustPhone(e.target.value)}
                        className="rounded-lg text-xs bg-background h-8"
                      />
                      <Input
                        placeholder="Address / Area (Optional)"
                        value={newCustAddress}
                        onChange={(e) => setNewCustAddress(e.target.value)}
                        className="rounded-lg text-xs bg-background h-8"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                      <span>Will auto-register on receipt save</span>
                      <Button
                        type="button"
                        size="sm"
                        disabled={creatingCust || !newCustName.trim()}
                        onClick={handleQuickCreateCustomer}
                        className="h-6 text-[10px] px-2.5 rounded-lg cursor-pointer gap-1"
                      >
                        <Check className="h-3 w-3" />
                        {creatingCust ? "Saving..." : "Save & Select"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rec-date">Collection Date</Label>
                <Input
                  id="rec-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="rounded-xl border border-border"
                />
              </div>
            </div>

            {/* Materials List */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-xs text-foreground">Materials Collected</Label>
                <Button type="button" size="sm" variant="outline" onClick={addItemRow} className="text-[10px] h-6 px-2 rounded-lg cursor-pointer">
                  + Add Item
                </Button>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end border border-border/40 rounded-xl p-3 bg-muted/5 relative">
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px]">Material</Label>
                      <select
                        value={item.materialId}
                        onChange={(e) => handleItemChange(idx, "materialId", e.target.value)}
                        required
                        className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">Select Material...</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} (₹{m.buy_price})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-28 space-y-1">
                      <Label className="text-[10px]">Weight (kg)</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={item.weight}
                        onChange={(e) => handleItemChange(idx, "weight", e.target.value !== "" ? Number(e.target.value) : "")}
                        placeholder="0.000"
                        required
                        className="rounded-lg h-8 py-1 text-[11px]"
                      />
                    </div>

                    <div className="w-28 space-y-1">
                      <Label className="text-[10px]">Buying Rate</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemChange(idx, "price", e.target.value !== "" ? Number(e.target.value) : "")}
                        placeholder="₹ 0.00"
                        required
                        className="rounded-lg h-8 py-1 text-[11px]"
                      />
                    </div>

                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItemRow(idx)}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/10 p-4 flex justify-between items-center font-bold text-xs">
              <span className="text-foreground">Total Cash Paid to Customer:</span>
              <span className="text-primary text-sm">₹ {calcTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="space-y-1.5">
              <Label>Payment Mode</Label>
              <div className="grid grid-cols-3 gap-2">
                {["cash", "upi", "bank_transfer"].map((m) => (
                  <Button
                    key={m}
                    type="button"
                    variant={payMethod === m ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPayMethod(m)}
                    className="rounded-xl text-[10px] uppercase font-bold cursor-pointer"
                  >
                    {m.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rec-notes">Remarks / Notes</Label>
              <Input
                id="rec-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Scale number, vehicle details..."
                className="rounded-xl border border-border"
              />
            </div>

            <DialogFooter className="pt-2 border-t border-border/40">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} className="rounded-xl cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-xl cursor-pointer">
                {submitting ? "Saving Receipt..." : editingReceipt ? "Update Scale Collection" : "Record Scale Collection"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Small badge showing pending Telegram receipt count — fetches independently */
function TelegramPendingBadge({ token }: { token?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    fetchTelegramReceipts(token, "pending_review")
      .then((res) => { if (res.success) setCount(res.receipts.length); })
      .catch(() => {});
  }, [token]);

  if (count === 0) return null;
  return (
    <span className="ml-0.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-bold leading-none">
      {count}
    </span>
  );
}
