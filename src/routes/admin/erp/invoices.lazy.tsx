import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchERPInvoices,
  payERPInvoice,
  type ERPInvoice,
  type ERPTransaction,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  RotateCw,
  CreditCard,
  Download,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { groupInvoices, type GroupedERPInvoice } from "@/lib/utils";

export const Route = createLazyFileRoute("/admin/erp/invoices")({
  component: ERPInvoicesPage,
});

const STATUS_CONFIG = {
  paid: { label: "Paid", className: "bg-green-50 text-green-700 border-green-200" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
  overdue: { label: "Overdue", className: "bg-red-50 text-red-700 border-red-200" },
  cancelled: { label: "Cancelled", className: "bg-gray-50 text-gray-700 border-gray-200" },
};

import { generateStandardPDF } from "@/lib/pdfGenerator";

// jsPDF generator trigger using standard document template
async function generatePDFFromInvoice(i: GroupedERPInvoice) {
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
    notes: i.notes || undefined,
    items: rawItems.map((item, idx) => ({
      sNo: idx + 1,
      name: item.material_name,
      qty: item.weight,
      unit: item.unit || "KGS",
      rate: item.price_per_unit || 0,
      amount: item.amount,
    })),
  });
}

function ERPInvoicesPage() {
  const { session } = useAuth();

  const [invoices, setInvoices] = useState<GroupedERPInvoice[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pay Dialog
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<GroupedERPInvoice | null>(null);
  const [payMethod, setPayMethod] = useState<"cash" | "upi" | "bank_transfer" | "cheque">("cash");
  const [payNotes, setPayNotes] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, [session, statusFilter]);

  async function loadInvoices() {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== "all") params.status = statusFilter;

      // The API paginates line items (one row per material, e.g. INV-00045/1, /2),
      // so fetch every page before grouping or older invoices get cut off.
      const PAGE_SIZE = 200;
      const rows: ERPInvoice[] = [];
      let summaryData: any = null;
      for (let page = 1; ; page++) {
        const res = await fetchERPInvoices(session.access_token, {
          ...params,
          page: String(page),
          limit: String(PAGE_SIZE),
        });
        if (!res.success) break;
        summaryData = res.summary;
        rows.push(...res.invoices);
        if (res.invoices.length < PAGE_SIZE) break;
      }

      setInvoices(groupInvoices(rows));
      setSummary(summaryData);
    } catch (err: any) {
      toast.error(err.message || "Failed to load invoices log");
    } finally {
      setLoading(false);
    }
  }

  function openPay(i: GroupedERPInvoice) {
    setSelectedInvoice(i);
    setPayMethod("cash");
    setPayNotes("");
    setPayDialogOpen(true);
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedInvoice) return;

    setPaying(true);
    try {
      const res = await payERPInvoice(
        selectedInvoice.id,
        payMethod,
        payNotes.trim() || undefined,
        session?.access_token
      );
      if (res.success) {
        toast.success("Invoice paid successfully!");
        setPayDialogOpen(false);
        loadInvoices();
      }
    } catch (err: any) {
      toast.error(err.message || "Payment trigger failed");
    } finally {
      setPaying(false);
    }
  }

  const filtered = invoices.filter(
    (i) =>
      i.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      i.supplier_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Summary stats block */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Paid</span>
              <p className="text-xl font-bold text-emerald-600">₹{summary.paid_total.toLocaleString()}</p>
              <span className="text-[10px] text-muted-foreground">{summary.paid_count} settle tickets</span>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-600/30" />
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Pending</span>
              <p className="text-xl font-bold text-amber-600">₹{summary.pending_total.toLocaleString()}</p>
              <span className="text-[10px] text-muted-foreground">{summary.pending_count} unpaid ledger tickets</span>
            </div>
            <CreditCard className="h-8 w-8 text-amber-500/30" />
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Overdue Bills</span>
              <p className="text-xl font-bold text-red-600">₹{summary.overdue_total.toLocaleString()}</p>
              <span className="text-[10px] text-muted-foreground">{summary.overdue_count} critical invoices</span>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500/30" />
          </div>
        </div>
      )}

      {/* Filtering Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoice number/supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border border-border bg-card text-xs"
          />
        </div>

        {/* Status filters */}
        <div className="flex gap-2 w-full sm:w-auto justify-end items-center">
          <div className="flex rounded-lg border border-border bg-muted/40 p-0.5">
            {["all", "paid", "pending", "overdue"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer transition-all uppercase ${
                  statusFilter === st
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadInvoices}
            disabled={loading}
            className="rounded-xl cursor-pointer"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
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

      {/* Invoices List Table */}
      {!loading && (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 font-medium text-muted-foreground">
                  <th className="px-6 py-4">Invoice No</th>
                  <th className="px-6 py-4">Recycler</th>
                  <th className="px-6 py-4">Scale Ticket Reference</th>
                  <th className="px-6 py-4 text-right">Bill Amount</th>
                  <th className="px-6 py-4 text-right">Due Date</th>
                  <th className="px-6 py-4 text-right">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((inv) => {
                  const cfg = STATUS_CONFIG[inv.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                  return (
                    <tr key={inv.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                        <div className="flex flex-col">
                          <span>{inv.invoice_number}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            Issued: {new Date(inv.created_at).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground truncate max-w-[140px]">{inv.supplier_name}</td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        <div className="flex flex-col">
                          <span>{inv.txn_number}</span>
                          <span className="text-[10px] font-semibold text-foreground">
                            {inv.material_name} ({inv.weight} {inv.unit})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-foreground">₹{inv.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-muted-foreground whitespace-nowrap">
                        {inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-IN") : "Immediate"}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Badge variant="outline" className={`rounded-full text-[10px] px-2 py-0.5 ${cfg.className}`}>
                          {cfg.label.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => generatePDFFromInvoice(inv)}
                            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Download PDF Invoice"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {inv.status !== "paid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPay(inv)}
                              className="rounded-xl font-semibold gap-1 py-1 cursor-pointer h-7 text-[10px]"
                            >
                              <CreditCard className="h-3 w-3" /> PAY BILL
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                      No invoices recorded under these selection parameters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pay Invoice Dialog */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent className="max-w-md bg-card rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Record Invoice Bill Settlement
            </DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <form onSubmit={handlePay} className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/10 p-4 text-xs space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Invoice Reference:</span>
                  <span className="text-foreground font-bold">{selectedInvoice.invoice_number}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Recycler:</span>
                  <span className="text-foreground">{selectedInvoice.supplier_name}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1.5 font-bold text-sm">
                  <span className="text-foreground">Settle Amount:</span>
                  <span className="text-primary">₹ {selectedInvoice.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Payment Mode / Settlement Channel</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "cash", label: "Cash" },
                    { val: "upi", label: "UPI" },
                    { val: "bank_transfer", label: "Bank Transfer" },
                    { val: "cheque", label: "Bank Cheque" },
                  ].map((m) => (
                    <Button
                      key={m.val}
                      type="button"
                      variant={payMethod === m.val ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPayMethod(m.val as any)}
                      className="rounded-xl font-semibold text-xs cursor-pointer h-9"
                    >
                      {m.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pay-notes">Settlement Remarks</Label>
                <Input
                  id="pay-notes"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="UPI Ref ID, bank cheque numbers..."
                  className="rounded-xl border border-border"
                />
              </div>

              <DialogFooter className="pt-2 border-t border-border/40">
                <Button type="button" variant="ghost" onClick={() => setPayDialogOpen(false)} className="rounded-xl cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" disabled={paying} className="rounded-xl cursor-pointer">
                  {paying ? "Settling bill..." : "Complete Settle Payout"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

