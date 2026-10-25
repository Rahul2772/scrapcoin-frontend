import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchERPExpenses,
  fetchERPExpenseCategories,
  fetchERPExpenseSummary,
  createERPExpense,
  updateERPExpense,
  deleteERPExpense,
  uploadERPExpenseReceipt,
  fetchERPExpenseReceiptUrl,
  type ERPExpense,
  type ERPExpenseCategory,
  type ERPExpenseSummary,
} from "@/lib/api";
import { getCategoryBadge, sortCategories } from "@/lib/expense-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Search, Plus, Trash2, Edit2, RotateCw, FileText,
  TrendingUp, TrendingDown, Wallet, Tag, Receipt,
  ExternalLink, Upload, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

export const Route = createLazyFileRoute("/admin/erp/expenses")({
  component: ERPExpensesPage,
});

const PAYMENT_METHODS = ["cash", "upi", "card", "bank"] as const;
const CATEGORY_COLORS = ["#f59e0b", "#10b981", "#6366f1", "#ef4444", "#8b5cf6", "#f97316", "#06b6d4"];
const STATUS_STYLES: Record<string, string> = {
  approved: "bg-green-100 text-green-700 border-green-200",
  pending:  "bg-amber-100 text-amber-700 border-amber-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

function fmt(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(amount);
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ── Summary Cards ─────────────────────────────────────────────────────────────
function SummaryCards({ summary, loading }: { summary: ERPExpenseSummary | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    );
  }
  if (!summary) return null;

  const pct = summary.pct_change;
  const up  = pct !== null && pct > 0;

  const cards = [
    {
      label: "This Month",
      value: fmt(summary.this_month_total),
      icon: <Wallet className="h-5 w-5" />,
      sub: pct !== null ? (
        <span className={"flex items-center gap-1 text-xs font-medium " + (up ? "text-red-500" : "text-green-500")}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(pct)}% vs last month
        </span>
      ) : <span className="text-xs text-muted-foreground">No previous data</span>,
      accent: "from-amber-500/10 to-amber-500/5",
    },
    {
      label: "Last Month",
      value: fmt(summary.last_month_total),
      icon: <Receipt className="h-5 w-5" />,
      sub: <span className="text-xs text-muted-foreground">Approved expenses</span>,
      accent: "from-indigo-500/10 to-indigo-500/5",
    },
    {
      label: "Top Category",
      value: summary.top_category ? getCategoryBadge(summary.top_category).fullLabel : "—",
      icon: <Tag className="h-5 w-5" />,
      sub: <span className="text-xs text-muted-foreground">Highest spend this month</span>,
      accent: "from-emerald-500/10 to-emerald-500/5",
    },
    {
      label: "Categories",
      value: String(summary.by_category.length),
      icon: <FileText className="h-5 w-5" />,
      sub: <span className="text-xs text-muted-foreground">Active this period</span>,
      accent: "from-purple-500/10 to-purple-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div
          key={i}
          className={"rounded-xl border border-border/60 bg-gradient-to-br " + c.accent + " p-4 flex flex-col gap-2"}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            {c.icon}
            <span className="text-xs">{c.label}</span>
          </div>
          <p className="text-xl font-bold text-foreground leading-none">{c.value}</p>
          {c.sub}
        </div>
      ))}
    </div>
  );
}

// ── Expense Form Dialog ────────────────────────────────────────────────────────
interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  categories: ERPExpenseCategory[];
  token?: string;
  editing: ERPExpense | null;
}

function ExpenseFormDialog({ open, onClose, onSaved, categories, token, editing }: FormDialogProps) {
  const [categoryId, setCategoryId]         = useState("");
  const [amount, setAmount]                 = useState("");
  const [date, setDate]                     = useState(new Date().toISOString().split("T")[0]);
  const [vendor, setVendor]                 = useState("");
  const [description, setDescription]       = useState("");
  const [payMethod, setPayMethod]           = useState<string>("cash");
  const [isRecurring, setIsRecurring]       = useState(false);
  const [gstAmount, setGstAmount]           = useState("");
  const [vendorGstin, setVendorGstin]       = useState("");
  const [receiptPath, setReceiptPath]       = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploading, setUploading]           = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setCategoryId(editing.category_id || "");
      setAmount(String(editing.amount));
      setDate(editing.expense_date);
      setVendor(editing.vendor || "");
      setDescription(editing.description || "");
      setPayMethod(editing.payment_method || "cash");
      setIsRecurring(editing.is_recurring);
      setGstAmount(editing.gst_amount ? String(editing.gst_amount) : "");
      setVendorGstin(editing.vendor_gstin || "");
      setReceiptPath(editing.receipt_url || null);
      setReceiptPreview(null);
    } else {
      setCategoryId(""); setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setVendor(""); setDescription(""); setPayMethod("cash");
      setIsRecurring(false); setGstAmount(""); setVendorGstin("");
      setReceiptPath(null); setReceiptPreview(null);
    }
  }, [open, editing]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ALLOWED = ["image/jpeg", "image/png", "application/pdf"];
    if (!ALLOWED.includes(file.type)) { toast.error("Only JPG, PNG or PDF files allowed"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("File must be under 5 MB"); return; }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const b64 = (reader.result as string).split(",")[1];
        const res = await uploadERPExpenseReceipt(b64, file.type, token);
        if (res.success) {
          setReceiptPath(res.path);
          setReceiptPreview(res.signed_url);
          toast.success("Receipt uploaded");
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!categoryId) return toast.error("Category is required");
    if (!amount || Number(amount) <= 0) return toast.error("Amount must be greater than 0");
    if (!date) return toast.error("Date is required");
    if (new Date(date) > new Date()) return toast.error("Date cannot be in the future");
    setSubmitting(true);
    try {
      const payload = {
        category_id:    categoryId,
        amount:         Number(amount),
        expense_date:   date,
        vendor:         vendor.trim() || null,
        description:    description.trim() || null,
        payment_method: payMethod,
        is_recurring:   isRecurring,
        gst_amount:     gstAmount ? Number(gstAmount) : 0,
        vendor_gstin:   vendorGstin.trim() || null,
        receipt_url:    receiptPath || null,
      };
      if (editing) {
        const r = await updateERPExpense(editing.id, payload, token);
        if (r.success) { toast.success("Expense updated"); onSaved(); onClose(); }
      } else {
        const r = await createERPExpense(payload, token);
        if (r.success) {
          toast.success("Expense " + r.expense.expense_number + " recorded");
          onSaved(); onClose();
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save expense");
    } finally {
      setSubmitting(false);
    }
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const sortedCategories = sortCategories(categories);
  const formCategories = [...sortedCategories];
  if (editing?.category_id && editing?.erp_expense_categories?.name) {
    if (!formCategories.some((c) => c.id === editing.category_id)) {
      formCategories.push({
        id: editing.category_id,
        name: `${editing.erp_expense_categories.name} (legacy)`,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit " + editing.expense_number : "Add Expense"}</DialogTitle>
        </DialogHeader>
        <form id="expense-form" onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Category + Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="exp-category">Category *</Label>
              <select
                id="exp-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                required
              >
                <option value="">Select…</option>
                {formCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exp-amount">Amount (₹) *</Label>
              <Input
                id="exp-amount" type="number" min="0.01" step="0.01"
                value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00" required
              />
            </div>
          </div>

          {/* Date + Payment */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="exp-date">Date *</Label>
              <Input
                id="exp-date" type="date" value={date} max={todayStr}
                onChange={(e) => setDate(e.target.value)} required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exp-pay">Payment Method</Label>
              <select
                id="exp-pay" value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm capitalize"
              >
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
              </select>
            </div>
          </div>

          {/* Vendor */}
          <div className="space-y-1.5">
            <Label htmlFor="exp-vendor">Vendor</Label>
            <Input
              id="exp-vendor" value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="Shop / company name"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="exp-desc">Description</Label>
            <textarea
              id="exp-desc" value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this expense for?" rows={2}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-none"
            />
          </div>

          {/* Recurring */}
          <div className="flex items-center gap-2">
            <input
              id="exp-recurring" type="checkbox" checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded border-input h-4 w-4 accent-primary"
            />
            <Label htmlFor="exp-recurring" className="cursor-pointer">
              Recurring expense (rent / subscription)
            </Label>
          </div>

          {/* GST */}
          <details className="border border-border/60 rounded-lg px-3 py-2">
            <summary className="text-xs font-medium text-muted-foreground cursor-pointer select-none">
              Tax details (optional)
            </summary>
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="space-y-1.5">
                <Label htmlFor="exp-gst">GST Amount (₹)</Label>
                <Input
                  id="exp-gst" type="number" min="0" step="0.01"
                  value={gstAmount} onChange={(e) => setGstAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exp-gstin">Vendor GSTIN</Label>
                <Input
                  id="exp-gstin" value={vendorGstin}
                  onChange={(e) => setVendorGstin(e.target.value)}
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
            </div>
          </details>

          {/* Receipt upload */}
          <div className="space-y-1.5">
            <Label>Receipt / Bill</Label>
            {receiptPreview ? (
              <div className="relative border border-border rounded-lg p-2 flex items-center gap-3">
                {receiptPath?.endsWith(".pdf") ? (
                  <a
                    href={receiptPreview} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-primary underline"
                  >
                    <FileText className="h-4 w-4" /> View PDF
                  </a>
                ) : (
                  <img src={receiptPreview} alt="receipt" className="h-16 w-auto rounded object-contain" />
                )}
                <button
                  type="button"
                  onClick={() => { setReceiptPath(null); setReceiptPreview(null); }}
                  className="ml-auto text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-4 text-center text-sm text-muted-foreground cursor-pointer hover:border-primary transition-colors"
              >
                {uploading
                  ? "Uploading…"
                  : <><Upload className="h-4 w-4 inline mr-1" />Click to upload JPG, PNG or PDF (max 5 MB)</>
                }
              </div>
            )}
            <input
              ref={fileRef} type="file"
              accept="image/jpeg,image/png,application/pdf"
              className="hidden" onChange={handleFileChange}
            />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="expense-form" disabled={submitting}>
            {submitting ? "Saving…" : editing ? "Save Changes" : "Add Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
function ERPExpensesPage() {
  const { session, profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const [expenses, setExpenses]             = useState<ERPExpense[]>([]);
  const [categories, setCategories]         = useState<ERPExpenseCategory[]>([]);
  const [summary, setSummary]               = useState<ERPExpenseSummary | null>(null);
  const [total, setTotal]                   = useState(0);
  const [loading, setLoading]               = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [search, setSearch]         = useState("");
  const [filterCat, setFilterCat]   = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo]     = useState("");
  const [page, setPage]             = useState(1);
  const LIMIT = 30;

  const [formOpen, setFormOpen]       = useState(false);
  const [editing, setEditing]         = useState<ERPExpense | null>(null);
  const [receiptModal, setReceiptModal] = useState<{ url: string; isPdf: boolean } | null>(null);

  useEffect(() => { loadCategories(); }, [session]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadExpenses(); }, [session, search, filterCat, filterFrom, filterTo, page]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadSummary(); }, [session, filterFrom, filterTo]);

  async function loadCategories() {
    if (!session?.access_token) return;
    try {
      const res = await fetchERPExpenseCategories(session.access_token);
      if (res.success) setCategories(res.categories);
    } catch { /* silent */ }
  }

  async function loadExpenses() {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(LIMIT) };
      if (search)     params.search      = search;
      if (filterCat)  params.category_id = filterCat;
      if (filterFrom) params.from        = filterFrom;
      if (filterTo)   params.to          = filterTo;
      const res = await fetchERPExpenses(session.access_token, params);
      if (res.success) { setExpenses(res.expenses); setTotal(res.count); }
    } catch (err: any) {
      toast.error(err.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }

  async function loadSummary() {
    if (!session?.access_token) return;
    setSummaryLoading(true);
    try {
      const res = await fetchERPExpenseSummary(
        session.access_token,
        filterFrom || undefined,
        filterTo || undefined,
      );
      if (res.success) setSummary(res.summary);
    } catch { /* silent */ } finally {
      setSummaryLoading(false);
    }
  }

  function refresh() { loadExpenses(); loadSummary(); }
  function openCreate() { setEditing(null); setFormOpen(true); }
  function openEdit(e: ERPExpense) { setEditing(e); setFormOpen(true); }

  async function handleVoid(id: string, num: string) {
    if (!confirm("Void expense " + num + "? This is a soft-delete and cannot be undone.")) return;
    try {
      const res = await deleteERPExpense(id, session?.access_token);
      if (res.success) { toast.success(res.message); refresh(); }
    } catch (err: any) {
      toast.error(err.message || "Failed to void expense");
    }
  }

  async function openReceipt(e: ERPExpense) {
    if (!e.receipt_url) return;
    try {
      const res = await fetchERPExpenseReceiptUrl(e.id, session?.access_token);
      if (res.success && res.url) {
        setReceiptModal({ url: res.url, isPdf: e.receipt_url.endsWith(".pdf") });
      }
    } catch (err: any) {
      toast.error(err.message || "Could not load receipt");
    }
  }

  function clearFilters() {
    setSearch(""); setFilterCat(""); setFilterFrom(""); setFilterTo(""); setPage(1);
  }

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = !!(search || filterCat || filterFrom || filterTo);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Operational Expenses</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Track and manage all company expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh} className="gap-1.5">
            <RotateCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          {isAdmin && (
            <Button size="sm" onClick={openCreate} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Expense
            </Button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <SummaryCards summary={summary} loading={summaryLoading} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="expense-search"
            placeholder="Search vendor or description…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-8 text-sm"
          />
        </div>
        {(() => {
          const sortedFilterCats = sortCategories(categories);
          const filterCategories = [...sortedFilterCats];
          for (const exp of expenses) {
            if (exp.category_id && exp.erp_expense_categories?.name) {
              if (!filterCategories.some((c) => c.id === exp.category_id)) {
                filterCategories.push({
                  id: exp.category_id,
                  name: `${exp.erp_expense_categories.name} (legacy)`,
                });
              }
            }
          }
          return (
            <select
              id="expense-filter-category"
              value={filterCat}
              onChange={(e) => { setFilterCat(e.target.value); setPage(1); }}
              className="h-8 rounded-md border border-input bg-transparent px-2 text-sm min-w-[140px]"
            >
              <option value="">All Categories</option>
              {filterCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          );
        })()}
        <Input
          id="expense-filter-from" type="date" value={filterFrom}
          onChange={(e) => { setFilterFrom(e.target.value); setPage(1); }}
          className="h-8 w-36 text-sm"
        />
        <Input
          id="expense-filter-to" type="date" value={filterTo}
          onChange={(e) => { setFilterTo(e.target.value); setPage(1); }}
          className="h-8 w-36 text-sm"
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-3.5 w-3.5 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border/60">
              <tr>
                {["Date", "Expense #", "Category", "Vendor", "Description", "Method", "Amount", "Status", "Receipt", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    {[...Array(10)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-muted-foreground text-sm">
                    No expenses found.
                    {isAdmin && (
                      <> <button onClick={openCreate} className="text-primary underline">Add one now.</button></>
                    )}
                  </td>
                </tr>
              ) : expenses.map((e) => (
                <tr key={e.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs whitespace-nowrap">{fmtDate(e.expense_date)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{e.expense_number}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {(() => {
                      const badge = getCategoryBadge(e.erp_expense_categories?.name);
                      return (
                        <span
                          title={badge.fullLabel}
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium max-w-[170px] truncate ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 max-w-[120px] truncate text-xs">{e.vendor || "—"}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-xs text-muted-foreground">
                    {e.description || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs capitalize">{e.payment_method}</td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap">{fmt(e.amount)}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={"text-xs " + (STATUS_STYLES[e.approval_status] || "")}
                    >
                      {e.approval_status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {e.receipt_url ? (
                      <button
                        onClick={() => openReceipt(e)}
                        className="text-primary hover:text-primary/80 transition-colors"
                        title="View receipt"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(e)} title="Edit"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleVoid(e.id, e.expense_number)} title="Void"
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 text-xs text-muted-foreground">
            <span>
              Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total}
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Charts */}
      {summary && summary.by_category.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border/60 p-4 space-y-3">
            <h3 className="text-sm font-semibold">Spend by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={summary.by_category} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => "₹" + (v / 1000).toFixed(0) + "k"} />
                <Tooltip formatter={(v: number) => [fmt(v), "Total"]} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {summary.by_category.map((_, idx) => (
                    <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl border border-border/60 p-4 space-y-3">
            <h3 className="text-sm font-semibold">Monthly Trend (last 12 months)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={summary.monthly_trend} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <XAxis
                  dataKey="month" tick={{ fontSize: 10 }}
                  tickFormatter={(m: string) => {
                    const parts = m.split("-");
                    return new Date(Number(parts[0]), Number(parts[1]) - 1)
                      .toLocaleDateString("en-IN", { month: "short" });
                  }}
                />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => "₹" + (v / 1000).toFixed(0) + "k"} />
                <Tooltip
                  formatter={(v: number) => [fmt(v), "Total"]}
                  labelFormatter={(l: string) => {
                    const parts = l.split("-");
                    return new Date(Number(parts[0]), Number(parts[1]) - 1)
                      .toLocaleDateString("en-IN", { month: "long", year: "numeric" });
                  }}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Form dialog */}
      <ExpenseFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={refresh}
        categories={categories}
        token={session?.access_token}
        editing={editing}
      />

      {/* Receipt preview modal */}
      {receiptModal && (
        <Dialog open onOpenChange={() => setReceiptModal(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Receipt</DialogTitle></DialogHeader>
            {receiptModal.isPdf ? (
              <a
                href={receiptModal.url} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-primary underline text-sm"
              >
                <ExternalLink className="h-4 w-4" /> Open PDF in new tab
              </a>
            ) : (
              <img
                src={receiptModal.url} alt="receipt"
                className="max-h-[60vh] object-contain rounded-lg mx-auto"
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
