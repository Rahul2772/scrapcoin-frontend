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
  updateTelegramReceipt,
  verifyTelegramReceipt,
  rejectTelegramReceipt,
  fetchTelegramReceiptPdfUrl,
  type ERPPurchaseReceipt,
  type ERPMaterial,
  type ERPCustomer,
  type TelegramReceipt,
  type TelegramReceiptLineItem,
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
  ImageDown,
  Eye,
  Save,
  FileText,
  Loader2,
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

import { generateStandardPDF, generateStandardPDFBlobUrl, generateReceiptImage } from "@/lib/pdfGenerator";
import { TelegramStandingMaterialStockBanner } from "@/components/admin/TelegramStandingMaterialStockBanner";

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
    partyAddress: r.customer_address || "",
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

// Image export wrapper — same PDFDocumentOptions mapping, downloads as JPEG for WhatsApp sharing
async function generateReceiptImageFile(r: GroupedERPPurchaseReceipt) {
  const rawItems = r.materials || [
    {
      material_name: r.material_name,
      weight: r.weight,
      unit: r.unit,
      price_per_unit: r.price_per_unit,
      total_amount: r.total_amount,
    },
  ];

  await generateReceiptImage({
    docType: "PURCHASE",
    docNumber: r.receipt_number,
    docDate: r.created_at,
    partyTitle: "BILL FROM",
    partyName: r.customer_name || "Walk-in Customer",
    partyMobile: r.customer_phone || "",
    partyAddress: r.customer_address || "",
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

  // ── B2C View Receipt Modal State ──────────────────────────────────────────
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewReceipt, setViewReceipt] = useState<GroupedERPPurchaseReceipt | null>(null);
  const [viewReceiptPdfUrl, setViewReceiptPdfUrl] = useState<string | null>(null);
  const [viewReceiptPdfLoading, setViewReceiptPdfLoading] = useState(false);

  // ── Telegram state ────────────────────────────────────────────────────────
  const [tgReceipts, setTgReceipts] = useState<TelegramReceipt[]>([]);
  const [allPendingTgReceipts, setAllPendingTgReceipts] = useState<TelegramReceipt[]>([]);
  const [tgLoading, setTgLoading] = useState(false);
  const [tgStatusFilter, setTgStatusFilter] = useState<"all" | "pending_review" | "verified" | "rejected">("pending_review");
  const [tgActioning, setTgActioning] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Telegram Review Dialog states
  const [tgReviewOpen, setTgReviewOpen] = useState(false);
  const [tgReviewReceipt, setTgReviewReceipt] = useState<TelegramReceipt | null>(null);
  const [tgReviewPdfUrl, setTgReviewPdfUrl] = useState<string | null>(null);
  const [tgReviewPdfLoading, setTgReviewPdfLoading] = useState(false);
  const [tgPdfSource, setTgPdfSource] = useState<"original" | "rendered" | "none">("none");
  const [tgSaving, setTgSaving] = useState(false);
  const [tgApproving, setTgApproving] = useState(false);

  // Review Form editable fields
  const [tgCustName, setTgCustName] = useState("");
  const [tgCustMobile, setTgCustMobile] = useState("");
  const [tgCustAddress, setTgCustAddress] = useState("");
  const [tgPurchaseDate, setTgPurchaseDate] = useState("");
  const [tgPaymentMode, setTgPaymentMode] = useState("cash");
  const [tgNotes, setTgNotes] = useState("");
  const [tgLineItems, setTgLineItems] = useState<
    Array<{
      item_name: string;
      qty: number | "";
      unit: string;
      rate: number | "";
      amount: number;
    }>
  >([]);

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

  async function openViewReceipt(r: GroupedERPPurchaseReceipt) {
    setViewReceipt(r);
    setViewDialogOpen(true);
    setViewReceiptPdfLoading(true);
    setViewReceiptPdfUrl(null);

    try {
      const rawItems = r.materials || [
        {
          material_name: r.material_name,
          weight: r.weight,
          unit: r.unit,
          price_per_unit: r.price_per_unit,
          total_amount: r.total_amount,
        },
      ];

      const blobUrl = await generateStandardPDFBlobUrl({
        docType: "PURCHASE",
        docNumber: r.receipt_number,
        docDate: r.created_at,
        partyTitle: "BILL FROM",
        partyName: r.customer_name || "Walk-in Customer",
        partyMobile: r.customer_phone || "",
        partyAddress: r.customer_address || "",
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

      setViewReceiptPdfUrl(blobUrl);
    } catch (err) {
      console.error("Failed to generate receipt PDF:", err);
      toast.error("Failed to generate receipt preview");
    } finally {
      setViewReceiptPdfLoading(false);
    }
  }

  async function loadTelegramReceipts() {
    if (!session?.access_token) return;
    setTgLoading(true);
    try {
      const statusArg = tgStatusFilter === "all" ? undefined : tgStatusFilter;
      const res = await fetchTelegramReceipts(session.access_token, statusArg);
      if (res.success) {
        setTgReceipts(res.receipts);
        if (tgStatusFilter === "pending_review") {
          setAllPendingTgReceipts(res.receipts);
        } else if (tgStatusFilter === "all") {
          setAllPendingTgReceipts(res.receipts.filter((r) => r.status === "pending_review"));
        }
      }
      // If filtering for verified/rejected, keep pending receipts synced for the inventory banner
      if (tgStatusFilter !== "pending_review" && tgStatusFilter !== "all") {
        fetchTelegramReceipts(session.access_token, "pending_review")
          .then((pRes) => {
            if (pRes.success) setAllPendingTgReceipts(pRes.receipts);
          })
          .catch(() => {});
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load Telegram receipts");
    } finally {
      setTgLoading(false);
    }
  }

  const tgComputedSubtotal = tgLineItems.reduce(
    (acc, it) => acc + Number((Number(it.qty || 0) * Number(it.rate || 0)).toFixed(2)),
    0
  );

  function handleTgItemChange(
    index: number,
    field: "item_name" | "qty" | "rate" | "unit",
    value: any
  ) {
    setTgLineItems((prev) => {
      const copy = [...prev];
      const target = { ...copy[index], [field]: value };
      const q = field === "qty" ? (value !== "" ? Number(value) : "") : target.qty;
      const r = field === "rate" ? (value !== "" ? Number(value) : "") : target.rate;
      target.amount = Number((Number(q || 0) * Number(r || 0)).toFixed(2));
      copy[index] = target;
      return copy;
    });
  }

  function addTgItemRow() {
    setTgLineItems((prev) => [
      ...prev,
      { item_name: "", qty: "", unit: "kg", rate: "", amount: 0 },
    ]);
  }

  function removeTgItemRow(index: number) {
    setTgLineItems((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function openTgReview(r: TelegramReceipt) {
    setTgReviewReceipt(r);
    setTgCustName(r.customer_name || "");
    setTgCustMobile(r.customer_mobile || "");
    setTgCustAddress(r.customer_address || "");
    setTgPurchaseDate(
      r.purchase_date
        ? new Date(r.purchase_date).toISOString().split("T")[0]
        : new Date(r.created_at).toISOString().split("T")[0]
    );
    setTgPaymentMode(r.payment_mode || "cash");
    setTgNotes(r.notes || "");

    const items =
      r.line_items && r.line_items.length > 0
        ? r.line_items.map((li) => ({
            item_name: li.item_name || "",
            qty: (li.qty !== undefined && li.qty !== null) ? li.qty : ("" as const),
            unit: li.unit || "kg",
            rate: (li.rate !== undefined && li.rate !== null) ? li.rate : ("" as const),
            amount: li.amount ?? Number((Number(li.qty || 0) * Number(li.rate || 0)).toFixed(2)),
          }))
        : [{ item_name: "", qty: "" as const, unit: "kg", rate: "" as const, amount: 0 }];

    setTgLineItems(items);
    setTgReviewOpen(true);

    // Fetch signed PDF URL or generate fallback standard receipt preview
    setTgReviewPdfLoading(true);
    setTgReviewPdfUrl(null);
    setTgPdfSource("none");

    let loaded = false;
    try {
      const res = await fetchTelegramReceiptPdfUrl(r.id, session?.access_token);
      if (res.success && res.url) {
        setTgReviewPdfUrl(res.url);
        setTgPdfSource("original");
        loaded = true;
      }
    } catch (fetchErr) {
      console.warn("[Telegram Review] Original PDF fetch failed:", fetchErr);
    }

    // Fallback: If original PDF file is not in storage (e.g. storage upload failed during ingestion),
    // generate the official standard ScrapCo PDF preview from parsed line items!
    if (!loaded) {
      try {
        const rawList = r.line_items && r.line_items.length > 0 ? r.line_items : [];
        const parsedItems = rawList.map((li, idx) => ({
          sNo: idx + 1,
          name: li.item_name || "Item",
          qty: Number(li.qty || 0),
          unit: li.unit || "KGS",
          rate: Number(li.rate || 0),
          amount: Number(li.amount || (Number(li.qty || 0) * Number(li.rate || 0))),
        }));

        const blobUrl = await generateStandardPDFBlobUrl({
          docType: "PURCHASE",
          docNumber: r.purchase_no ? `TG-${r.purchase_no}` : `TG-${r.id.split("-")[0]}`,
          docDate: r.purchase_date || r.created_at,
          partyTitle: "BILL FROM",
          partyName: r.customer_name || "Walk-in Customer",
          partyMobile: r.customer_mobile || "",
          partyAddress: r.customer_address || "",
          paymentMethod: r.payment_mode || "CASH",
          paidAmount: r.paid_amount ?? (r.total_amount ?? undefined),
          balanceAmount: r.balance ?? 0,
          notes: r.notes || undefined,
          items: parsedItems.length > 0 ? parsedItems : [
            { sNo: 1, name: "Scrap Material", qty: 1, unit: "KGS", rate: 0, amount: 0 }
          ],
        });

        setTgReviewPdfUrl(blobUrl);
        setTgPdfSource("rendered");
      } catch (genErr) {
        console.error("[Telegram Review] Failed to generate PDF preview:", genErr);
      }
    }

    setTgReviewPdfLoading(false);
  }

  async function handleSaveTgReview() {
    if (!tgReviewReceipt || !session?.access_token) return;
    if (tgLineItems.length === 0) {
      toast.error("At least one line item is required");
      return;
    }
    for (let i = 0; i < tgLineItems.length; i++) {
      const it = tgLineItems[i];
      if (!it.item_name.trim()) {
        toast.error(`Item #${i + 1} name cannot be empty`);
        return;
      }
      if (it.qty === "" || Number(it.qty) <= 0) {
        toast.error(`Item #${i + 1} weight/qty must be greater than 0`);
        return;
      }
      if (it.rate === "" || Number(it.rate) < 0) {
        toast.error(`Item #${i + 1} rate must be non-negative`);
        return;
      }
    }

    setTgSaving(true);
    try {
      const payload = {
        customer_name: tgCustName.trim() || undefined,
        customer_mobile: tgCustMobile.trim() || undefined,
        customer_address: tgCustAddress.trim() || null,
        purchase_date: tgPurchaseDate ? new Date(tgPurchaseDate).toISOString() : null,
        payment_mode: tgPaymentMode,
        notes: tgNotes.trim() || null,
        line_items: tgLineItems.map((it, idx) => ({
          sno: idx + 1,
          item_name: it.item_name.trim(),
          qty: Number(it.qty),
          unit: it.unit || "KG",
          rate: Number(it.rate),
          amount: Number((Number(it.qty) * Number(it.rate)).toFixed(2)),
        })),
      };

      const res = await updateTelegramReceipt(tgReviewReceipt.id, payload, session.access_token);
      if (res.success) {
        toast.success("Receipt edits saved successfully!");
        setTgReviewReceipt((prev) => (prev ? { ...prev, ...payload } : null));
        await loadTelegramReceipts();
      } else {
        toast.error(res.message || "Failed to save edits");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save edits");
    } finally {
      setTgSaving(false);
    }
  }

  async function handleApproveFromReview() {
    if (!tgReviewReceipt || !session?.access_token) return;
    if (tgLineItems.length === 0) {
      toast.error("At least one line item is required");
      return;
    }
    for (let i = 0; i < tgLineItems.length; i++) {
      const it = tgLineItems[i];
      if (!it.item_name.trim()) {
        toast.error(`Item #${i + 1} name cannot be empty`);
        return;
      }
      if (it.qty === "" || Number(it.qty) <= 0) {
        toast.error(`Item #${i + 1} weight/qty must be greater than 0`);
        return;
      }
      if (it.rate === "" || Number(it.rate) < 0) {
        toast.error(`Item #${i + 1} rate must be non-negative`);
        return;
      }
    }

    setTgApproving(true);
    try {
      // 1. Save edits first so verify creates the exact receipt with user corrections
      const payload = {
        customer_name: tgCustName.trim() || undefined,
        customer_mobile: tgCustMobile.trim() || undefined,
        customer_address: tgCustAddress.trim() || null,
        purchase_date: tgPurchaseDate ? new Date(tgPurchaseDate).toISOString() : null,
        payment_mode: tgPaymentMode,
        notes: tgNotes.trim() || null,
        line_items: tgLineItems.map((it, idx) => ({
          sno: idx + 1,
          item_name: it.item_name.trim(),
          qty: Number(it.qty),
          unit: it.unit || "KG",
          rate: Number(it.rate),
          amount: Number((Number(it.qty) * Number(it.rate)).toFixed(2)),
        })),
      };

      await updateTelegramReceipt(tgReviewReceipt.id, payload, session.access_token);

      // 2. Call verify
      const res = await verifyTelegramReceipt(tgReviewReceipt.id, session.access_token);
      if (res.success) {
        toast.success(
          res.receipt_number
            ? `Approved — created receipt ${res.receipt_number}`
            : "Receipt verified & created ✅"
        );
        setTgReviewOpen(false);
        setTgReviewReceipt(null);
        await Promise.all([loadTelegramReceipts(), loadReceipts()]);
      } else {
        toast.error(res.message || "Approval failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setTgApproving(false);
    }
  }

  async function handleRejectFromReview() {
    if (!tgReviewReceipt || !session?.access_token) return;
    const reason = window.prompt("Reason for rejection (optional):");
    if (reason === null) return; // user clicked Cancel
    setTgActioning(tgReviewReceipt.id);
    try {
      const res = await rejectTelegramReceipt(tgReviewReceipt.id, reason, session.access_token);
      if (res.success) {
        toast.success("Receipt rejected");
        setTgReviewOpen(false);
        setTgReviewReceipt(null);
        loadTelegramReceipts();
      } else {
        toast.error(res.message || "Rejection failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Rejection failed");
    } finally {
      setTgActioning(null);
    }
  }

  async function handleTgVerify(id: string) {
    if (!session?.access_token) return;
    setTgActioning(id);
    setTgApproving(true);
    try {
      const res = await verifyTelegramReceipt(id, session.access_token);
      if (res.success) {
        toast.success(res.receipt_number
          ? `Approved — created receipt ${res.receipt_number}`
          : "Receipt verified ✅"
        );
        setTgReviewOpen(false);
        setTgReviewReceipt(null);
        await Promise.all([loadTelegramReceipts(), loadReceipts()]);
      }
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setTgActioning(null);
      setTgApproving(false);
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
          {/* Pending badge */}
          <TelegramPendingBadge token={session?.access_token} count={allPendingTgReceipts.length} />
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
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground truncate max-w-[150px]">{r.customer_name}</div>
                      {r.customer_phone && (
                        <div className="text-[10px] text-muted-foreground">{r.customer_phone}</div>
                      )}
                      {r.customer_address && (
                        <div className="text-[10px] text-muted-foreground/80 truncate max-w-[150px]" title={r.customer_address}>
                          {r.customer_address}
                        </div>
                      )}
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
                          onClick={() => openViewReceipt(r)}
                          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                          title="View Receipt (Popup)"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                          onClick={() => {
                            toast.promise(generateReceiptImageFile(r), {
                              loading: "Generating image…",
                              success: "Receipt image downloaded!",
                              error: (e) => `Image failed: ${e?.message ?? e}`,
                            });
                          }}
                          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-emerald-600 cursor-pointer"
                          title="Download as Image (WhatsApp)"
                        >
                          <ImageDown className="h-4 w-4" />
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

          {/* Standing Material Stock Banner (on top of pending list) */}
          {(tgStatusFilter === "pending_review" || tgStatusFilter === "all") && (
            <TelegramStandingMaterialStockBanner
              receipts={allPendingTgReceipts.length > 0 ? allPendingTgReceipts : (tgStatusFilter === "pending_review" ? tgReceipts : allPendingTgReceipts)}
              loading={tgLoading}
              onRefresh={loadTelegramReceipts}
            />
          )}

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
                      <tr
                        key={r.id}
                        onClick={() => openTgReview(r)}
                        className={`transition-colors cursor-pointer ${
                          r.status === "pending_review"
                            ? "bg-amber-500/5 hover:bg-amber-500/15"
                            : "hover:bg-muted/20"
                        }`}
                      >
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
                              ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                              : r.status === "verified"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                          }`}>
                            {r.status === "pending_review" ? "⏳ Pending" : r.status === "verified" ? "✅ Verified" : "⛔ Rejected"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {r.status === "pending_review" ? (
                              <Button
                                size="sm"
                                onClick={() => openTgReview(r)}
                                className="h-7 px-3 text-[11px] font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white gap-1 cursor-pointer shadow-xs"
                              >
                                <Edit2 className="h-3 w-3" />
                                Review
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openTgReview(r)}
                                className="h-7 px-2.5 text-[11px] font-medium rounded-lg text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </Button>
                            )}

                            {r.pdf_storage_path && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openPdf(r.id)}
                                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-blue-600 cursor-pointer"
                                title="Open PDF in new tab"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
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

      {/* ── Telegram Review & Edit Dialog ───────────────────────────────── */}
      <Dialog open={tgReviewOpen} onOpenChange={setTgReviewOpen}>
        <DialogContent className="max-w-6xl w-[96vw] h-[92vh] max-h-[92vh] p-0 flex flex-col bg-card rounded-2xl overflow-hidden border border-border shadow-2xl">
          {/* Dialog Header */}
          <DialogHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>Review Telegram Receipt</span>
                  {tgReviewReceipt?.purchase_no && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono">
                      #{tgReviewReceipt.purchase_no}
                    </span>
                  )}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                    tgReviewReceipt?.status === "pending_review"
                      ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                      : tgReviewReceipt?.status === "verified"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                  }`}>
                    {tgReviewReceipt?.status === "pending_review"
                      ? "⏳ Pending Review"
                      : tgReviewReceipt?.status === "verified"
                      ? "✅ Verified & Created"
                      : "⛔ Rejected"}
                  </span>
                  {tgReviewReceipt?.created_at && (
                    <span className="text-[11px] text-muted-foreground">
                      Received: {new Date(tgReviewReceipt.created_at).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {tgReviewPdfUrl && (
              <a
                href={tgReviewPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium mr-8"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open PDF in new tab
              </a>
            )}
          </DialogHeader>

          {/* Side-by-side Body */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* LEFT: PDF Preview */}
            <div className="lg:col-span-6 flex flex-col h-full bg-muted/20 min-h-0">
              <div className="px-4 py-2 bg-muted/30 border-b border-border flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  {tgPdfSource === "original" ? "Original Ingested PDF" : "Standard Receipt Preview"}
                </span>
                {tgPdfSource === "original" && tgReviewReceipt?.pdf_storage_path && (
                  <span className="text-[10px] font-mono opacity-70 truncate max-w-[220px]">
                    {tgReviewReceipt.pdf_storage_path.split("/").pop()}
                  </span>
                )}
                {tgPdfSource === "rendered" && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium">
                    Rendered from Parsed Data
                  </span>
                )}
              </div>
              <div className="flex-1 min-h-0 relative">
                {tgReviewPdfLoading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-xs">Loading PDF document…</span>
                  </div>
                ) : tgReviewPdfUrl ? (
                  <object
                    data={tgReviewPdfUrl}
                    type="application/pdf"
                    className="w-full h-full border-0 bg-white"
                  >
                    <iframe
                      src={tgReviewPdfUrl}
                      className="w-full h-full border-0 bg-white"
                      title="Telegram Receipt PDF Preview"
                    />
                  </object>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                    <FileText className="h-10 w-10 mb-2 opacity-30" />
                    <p className="text-xs">No PDF available for this receipt.</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Editable Form */}
            <div className="lg:col-span-6 flex flex-col h-full min-h-0 bg-card">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {tgReviewReceipt?.status !== "pending_review" && (
                  <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>
                      {tgReviewReceipt?.status === "verified"
                        ? "This receipt has already been verified and converted to an ERP receipt. Fields are read-only."
                        : "This receipt was rejected. Fields are read-only."}
                    </span>
                  </div>
                )}

                {/* Customer Info */}
                <div className="space-y-2 rounded-xl border border-border/60 bg-muted/5 p-3.5">
                  <span className="text-xs font-bold text-foreground">Customer Information</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Customer Name</Label>
                      <Input
                        value={tgCustName}
                        onChange={(e) => setTgCustName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        disabled={tgReviewReceipt?.status !== "pending_review"}
                        className="h-8 text-xs rounded-lg bg-background"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Mobile Number</Label>
                      <Input
                        value={tgCustMobile}
                        onChange={(e) => setTgCustMobile(e.target.value)}
                        placeholder="e.g. 9876543210"
                        disabled={tgReviewReceipt?.status !== "pending_review"}
                        className="h-8 text-xs rounded-lg bg-background"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Address / Area</Label>
                    <Input
                      value={tgCustAddress}
                      onChange={(e) => setTgCustAddress(e.target.value)}
                      placeholder="e.g. Sector 14, Gurgaon"
                      disabled={tgReviewReceipt?.status !== "pending_review"}
                      className="h-8 text-xs rounded-lg bg-background"
                    />
                  </div>
                </div>

                {/* Receipt Details */}
                <div className="space-y-2 rounded-xl border border-border/60 bg-muted/5 p-3.5">
                  <span className="text-xs font-bold text-foreground">Receipt Details</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Purchase Date</Label>
                      <Input
                        type="date"
                        value={tgPurchaseDate}
                        onChange={(e) => setTgPurchaseDate(e.target.value)}
                        disabled={tgReviewReceipt?.status !== "pending_review"}
                        className="h-8 text-xs rounded-lg bg-background"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Payment Mode</Label>
                      <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                        {["cash", "upi", "bank_transfer"].map((m) => (
                          <Button
                            key={m}
                            type="button"
                            size="sm"
                            variant={tgPaymentMode === m ? "default" : "outline"}
                            disabled={tgReviewReceipt?.status !== "pending_review"}
                            onClick={() => setTgPaymentMode(m)}
                            className="h-7 text-[10px] uppercase font-bold rounded-lg cursor-pointer px-1"
                          >
                            {m.replace("_", " ")}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Notes / Remarks</Label>
                    <Input
                      value={tgNotes}
                      onChange={(e) => setTgNotes(e.target.value)}
                      placeholder="Additional notes..."
                      disabled={tgReviewReceipt?.status !== "pending_review"}
                      className="h-8 text-xs rounded-lg bg-background"
                    />
                  </div>
                </div>

                {/* Line Items Editor */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-foreground">Line Items</span>
                      <span className="text-[11px] text-muted-foreground ml-1.5">
                        (Free-text, fully editable)
                      </span>
                    </div>
                    {tgReviewReceipt?.status === "pending_review" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addTgItemRow}
                        className="h-6 text-[11px] px-2.5 rounded-lg cursor-pointer gap-1"
                      >
                        <Plus className="h-3 w-3" /> Add Item
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {tgLineItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-2 items-center rounded-xl border border-border/60 bg-muted/10 p-2.5 text-xs"
                      >
                        <div className="col-span-5 space-y-0.5">
                          <Label className="text-[10px] text-muted-foreground">Item Name</Label>
                          <Input
                            value={item.item_name}
                            onChange={(e) => handleTgItemChange(idx, "item_name", e.target.value)}
                            placeholder="e.g. Iron, Newspaper, Plastic"
                            disabled={tgReviewReceipt?.status !== "pending_review"}
                            className="h-7 text-xs rounded-lg bg-background"
                          />
                        </div>
                        <div className="col-span-2 space-y-0.5">
                          <Label className="text-[10px] text-muted-foreground">Qty ({item.unit || "kg"})</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.qty}
                            onChange={(e) =>
                              handleTgItemChange(
                                idx,
                                "qty",
                                e.target.value !== "" ? Number(e.target.value) : ""
                              )
                            }
                            placeholder="0.00"
                            disabled={tgReviewReceipt?.status !== "pending_review"}
                            className="h-7 text-xs rounded-lg bg-background"
                          />
                        </div>
                        <div className="col-span-2 space-y-0.5">
                          <Label className="text-[10px] text-muted-foreground">Rate (₹)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) =>
                              handleTgItemChange(
                                idx,
                                "rate",
                                e.target.value !== "" ? Number(e.target.value) : ""
                              )
                            }
                            placeholder="0.00"
                            disabled={tgReviewReceipt?.status !== "pending_review"}
                            className="h-7 text-xs rounded-lg bg-background"
                          />
                        </div>
                        <div className="col-span-2 space-y-0.5 text-right">
                          <Label className="text-[10px] text-muted-foreground">Amount</Label>
                          <div className="h-7 flex items-center justify-end font-semibold text-foreground text-xs">
                            ₹{(Number(item.qty || 0) * Number(item.rate || 0)).toFixed(2)}
                          </div>
                        </div>
                        <div className="col-span-1 flex justify-center pt-3">
                          {tgReviewReceipt?.status === "pending_review" && tgLineItems.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTgItemRow(idx)}
                              className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Computed Running Total */}
                  <div className="rounded-xl border border-border bg-primary/5 p-3 flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground">Computed Total Amount:</span>
                    <span className="text-base font-bold text-primary">
                      ₹ {tgComputedSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-border bg-card flex items-center justify-between gap-3 shrink-0">
                {tgReviewReceipt?.status === "pending_review" && isAdmin ? (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRejectFromReview}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl cursor-pointer"
                    >
                      <XCircle className="h-4 w-4 mr-1.5" /> Reject
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={tgSaving || tgApproving}
                        onClick={handleSaveTgReview}
                        className="rounded-xl cursor-pointer gap-1.5 font-medium"
                      >
                        {tgSaving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={tgSaving || tgApproving}
                        onClick={handleApproveFromReview}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer gap-1.5 shadow-sm"
                      >
                        {tgApproving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3.5 w-3.5" />
                        )}
                        Approve & Create Receipt
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-end w-full">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setTgReviewOpen(false)}
                      className="rounded-xl cursor-pointer"
                    >
                      Close
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── B2C View Receipt Popup Modal ────────────────────────────────────── */}
      <Dialog
        open={viewDialogOpen}
        onOpenChange={(open) => {
          setViewDialogOpen(open);
          if (!open && viewReceiptPdfUrl) {
            try { URL.revokeObjectURL(viewReceiptPdfUrl); } catch (_) {}
            setViewReceiptPdfUrl(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl h-[88vh] p-0 flex flex-col overflow-hidden rounded-2xl border border-border/80 shadow-2xl">
          {/* Header */}
          <DialogHeader className="px-5 py-3.5 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  Receipt {viewReceipt?.receipt_number}
                  <span className="text-[11px] font-normal text-muted-foreground">
                    ({viewReceipt?.customer_name || "Walk-in Customer"})
                  </span>
                </DialogTitle>
                <div className="text-[11px] text-muted-foreground">
                  {viewReceipt?.created_at && new Date(viewReceipt.created_at).toLocaleString("en-IN")} • Amount: ₹{viewReceipt?.total_amount.toLocaleString("en-IN")}
                  {viewReceipt?.customer_address ? ` • ${viewReceipt.customer_address}` : ""}
                </div>
              </div>
            </div>

            {/* Header Actions */}
            {viewReceipt && (
              <div className="flex items-center gap-2 pr-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateReceiptPDF(viewReceipt)}
                  className="h-8 rounded-xl text-xs gap-1.5 cursor-pointer"
                  title="Print Receipt"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.promise(generateReceiptImageFile(viewReceipt), {
                      loading: "Generating image…",
                      success: "Receipt image downloaded!",
                      error: (e) => `Image failed: ${e?.message ?? e}`,
                    });
                  }}
                  className="h-8 rounded-xl text-xs gap-1.5 cursor-pointer hover:text-emerald-600"
                  title="Download as WhatsApp Image"
                >
                  <ImageDown className="h-3.5 w-3.5" />
                  WhatsApp
                </Button>
                {viewReceiptPdfUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-8 rounded-xl text-xs gap-1.5"
                    title="Open PDF in new window"
                  >
                    <a href={viewReceiptPdfUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open
                    </a>
                  </Button>
                )}
              </div>
            )}
          </DialogHeader>

          {/* PDF Preview Body */}
          <div className="flex-1 min-h-0 bg-muted/20 relative flex items-center justify-center">
            {viewReceiptPdfLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-xs font-medium">Generating receipt preview…</span>
              </div>
            ) : viewReceiptPdfUrl ? (
              <object
                data={viewReceiptPdfUrl}
                type="application/pdf"
                className="w-full h-full border-0 bg-white"
              >
                <iframe
                  src={viewReceiptPdfUrl}
                  className="w-full h-full border-0 bg-white"
                  title="Receipt PDF Preview"
                />
              </object>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-xs">Failed to render receipt preview.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Small badge showing pending Telegram receipt count */
function TelegramPendingBadge({
  token,
  count: propCount,
}: {
  token?: string;
  count?: number;
}) {
  const [count, setCount] = useState(propCount ?? 0);

  useEffect(() => {
    if (propCount !== undefined && propCount > 0) {
      setCount(propCount);
      return;
    }
    if (!token) return;
    fetchTelegramReceipts(token, "pending_review")
      .then((res) => {
        if (res.success) setCount(res.receipts.length);
      })
      .catch(() => {});
  }, [token, propCount]);

  if (count === 0) return null;
  return (
    <span className="ml-0.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-bold leading-none">
      {count}
    </span>
  );
}
