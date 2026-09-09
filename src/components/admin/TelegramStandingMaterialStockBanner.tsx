import React, { useState, useMemo } from "react";
import {
  Boxes,
  Scale,
  TrendingUp,
  Download,
  ChevronDown,
  ChevronUp,
  Search,
  RotateCw,
  Send,
  Layers,
  ArrowUpDown,
  Info,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { TelegramReceipt } from "@/lib/api";

interface ContributingReceipt {
  receiptId: string;
  purchaseNo: string;
  customerName: string;
  purchaseDate: string | null;
  qty: number;
  rate: number;
  amount: number;
}

interface AggregatedMaterialStock {
  id: string;
  name: string;
  unit: string;
  totalQty: number;
  totalAmount: number;
  avgRate: number;
  receiptCount: number;
  receipts: ContributingReceipt[];
}

interface Props {
  receipts: TelegramReceipt[];
  loading?: boolean;
  onRefresh?: () => void;
}

export function TelegramStandingMaterialStockBanner({
  receipts,
  loading = false,
  onRefresh,
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"amount" | "qty" | "name">("amount");
  const [expandedMaterialId, setExpandedMaterialId] = useState<string | null>(null);

  // Filter only pending review receipts
  const pendingReceipts = useMemo(() => {
    return (receipts || []).filter((r) => r.status === "pending_review");
  }, [receipts]);

  // Aggregate line items across pending receipts
  const {
    items,
    grandTotalWeightKg,
    hasOtherUnits,
    grandTotalValue,
    totalPendingReceipts,
  } = useMemo(() => {
    const map = new Map<string, AggregatedMaterialStock>();
    let totalVal = 0;
    let totalKg = 0;
    let otherUnits = false;

    for (const r of pendingReceipts) {
      if (!r.line_items || !Array.isArray(r.line_items)) continue;

      for (const item of r.line_items) {
        if (!item || !item.item_name) continue;
        const rawName = item.item_name.trim();
        if (!rawName) continue;

        const rawUnit = (item.unit || "kg").trim();
        const normalizedUnit =
          rawUnit.toLowerCase() === "kgs" ? "kg" : rawUnit.toLowerCase();

        const key = `${rawName.toLowerCase()}___${normalizedUnit}`;
        const qty = Number(item.qty || 0);
        const rate = Number(item.rate || 0);
        const amount = Number(
          item.amount != null ? item.amount : Number((qty * rate).toFixed(2))
        );

        if (normalizedUnit === "kg") {
          totalKg += qty;
        } else {
          otherUnits = true;
        }
        totalVal += amount;

        const receiptEntry: ContributingReceipt = {
          receiptId: r.id,
          purchaseNo: r.purchase_no || `Rec #${r.id.slice(0, 6)}`,
          customerName: r.customer_name || "Unknown Customer",
          purchaseDate: r.purchase_date || r.created_at || null,
          qty,
          rate,
          amount,
        };

        const existing = map.get(key);
        if (!existing) {
          // Nicely capitalize first letter of each word
          const displayName = rawName
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");

          map.set(key, {
            id: key,
            name: displayName,
            unit: normalizedUnit === "kg" ? "kg" : rawUnit,
            totalQty: qty,
            totalAmount: amount,
            avgRate: qty > 0 ? amount / qty : rate,
            receiptCount: 1,
            receipts: [receiptEntry],
          });
        } else {
          existing.totalQty += qty;
          existing.totalAmount += amount;
          existing.avgRate =
            existing.totalQty > 0 ? existing.totalAmount / existing.totalQty : 0;
          existing.receiptCount += 1;
          existing.receipts.push(receiptEntry);
        }
      }
    }

    const itemsList = Array.from(map.values());

    return {
      items: itemsList,
      grandTotalWeightKg: totalKg,
      hasOtherUnits: otherUnits,
      grandTotalValue: totalVal,
      totalPendingReceipts: pendingReceipts.length,
    };
  }, [pendingReceipts]);

  // Filtered & sorted items
  const processedItems = useMemo(() => {
    let list = [...items];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((it) => it.name.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      if (sortBy === "amount") return b.totalAmount - a.totalAmount;
      if (sortBy === "qty") return b.totalQty - a.totalQty;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [items, search, sortBy]);

  // CSV export handler
  const handleExportCsv = () => {
    if (items.length === 0) return;

    const headers = [
      "Material Name",
      "Standing Quantity",
      "Unit",
      "Weighted Avg Rate (Rs.)",
      "Total Estimated Value (Rs.)",
      "% Share of Total Value",
      "Pending Receipt Count",
      "Contributing Receipts",
    ];

    const rows = processedItems.map((it) => {
      const share =
        grandTotalValue > 0
          ? ((it.totalAmount / grandTotalValue) * 100).toFixed(1)
          : "0";
      const receiptsSummary = it.receipts
        .map(
          (r) =>
            `${r.purchaseNo} (${r.customerName}: ${r.qty} ${it.unit} @ Rs.${r.rate})`
        )
        .join("; ");

      return [
        `"${it.name.replace(/"/g, '""')}"`,
        it.totalQty.toFixed(2),
        `"${it.unit}"`,
        it.avgRate.toFixed(2),
        it.totalAmount.toFixed(2),
        `"${share}%"`,
        it.receiptCount,
        `"${receiptsSummary.replace(/"/g, '""')}"`,
      ].join(",");
    });

    // Grand total row
    const totalRow = [
      `"GRAND TOTAL"`,
      grandTotalWeightKg.toFixed(2),
      `"${hasOtherUnits ? "mixed" : "kg"}"`,
      `"-"`,
      grandTotalValue.toFixed(2),
      `"100%"`,
      totalPendingReceipts,
      `"-"`,
    ].join(",");

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows, totalRow].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `scrapco_standing_inventory_pending_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.05] via-card to-emerald-500/[0.04] p-4 sm:p-5 shadow-sm space-y-4 transition-all duration-200">
      {/* ── Banner Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Standing Material Stock
              </h3>
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 text-[10px] font-semibold"
              >
                ⏳ Pending Telegram Approval
              </Badge>
              {totalPendingReceipts > 0 && (
                <span className="text-[11px] text-muted-foreground font-medium">
                  • {totalPendingReceipts} receipt{totalPendingReceipts === 1 ? "" : "s"} awaiting approval
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time standing inventory of scrap materials collected from customers before receipt verification.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="h-8 rounded-xl text-xs gap-1.5 cursor-pointer hover:bg-muted"
              title="Download Standing Stock as CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Export Stock</span> CSV
            </Button>
          )}

          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="h-8 w-8 p-0 rounded-xl cursor-pointer"
              title="Refresh Inventory"
            >
              <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 rounded-xl text-xs gap-1 cursor-pointer font-medium"
          >
            {isCollapsed ? (
              <>
                <span>Expand Table</span>
                <ChevronDown className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Collapse</span>
                <ChevronUp className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── KPI Summary Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Standing Weight */}
        <div className="bg-card/70 backdrop-blur-xs border border-border/70 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-medium">Standing Weight</span>
            <Scale className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-foreground">
            {grandTotalWeightKg.toLocaleString(undefined, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 2,
            })}{" "}
            <span className="text-xs font-semibold text-muted-foreground">kg</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {hasOtherUnits ? "+ non-kg materials included" : "Total scrap collected"}
          </div>
        </div>

        {/* Total Committed Value */}
        <div className="bg-card/70 backdrop-blur-xs border border-border/70 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-medium">Committed Value</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-foreground">
            ₹
            {grandTotalValue.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Pending cash/payables worth
          </div>
        </div>

        {/* Pending Inward Receipts */}
        <div className="bg-card/70 backdrop-blur-xs border border-border/70 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-medium">Pending Receipts</span>
            <Send className="h-4 w-4 text-primary" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-foreground">
            {totalPendingReceipts}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Awaiting admin verification
          </div>
        </div>

        {/* Material Categories */}
        <div className="bg-card/70 backdrop-blur-xs border border-border/70 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-medium">Material Types</span>
            <Layers className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-foreground">
            {items.length}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Distinct scrap categories
          </div>
        </div>
      </div>

      {/* ── Table & Search (When not collapsed) ────────────────────────────── */}
      {!isCollapsed && (
        <div className="space-y-3 pt-1">
          {/* Controls Bar */}
          {items.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter material name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 rounded-xl border border-border bg-card text-xs"
                />
              </div>

              {/* Sorting Pills */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto text-[11px]">
                <span className="text-muted-foreground text-[10px] font-medium mr-1 flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3" /> Sort:
                </span>
                <button
                  onClick={() => setSortBy("amount")}
                  className={`px-2 py-0.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    sortBy === "amount"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Value
                </button>
                <button
                  onClick={() => setSortBy("qty")}
                  className={`px-2 py-0.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    sortBy === "qty"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Quantity
                </button>
                <button
                  onClick={() => setSortBy("name")}
                  className={`px-2 py-0.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    sortBy === "name"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Name
                </button>
              </div>
            </div>
          )}

          {/* Table Container */}
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-card/40 p-6 text-center">
              <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground mb-2">
                <Boxes className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                No standing materials pending approval
              </p>
              <p className="text-[11px] text-muted-foreground max-w-md mx-auto mt-1">
                There are currently no Telegram receipts with pending review status. As field purchase receipts arrive via Telegram, their materials and standing stock will be totaled here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 font-medium text-muted-foreground">
                      <th className="px-3.5 py-2.5">Material Name</th>
                      <th className="px-3.5 py-2.5 text-right">Standing Qty</th>
                      <th className="px-3.5 py-2.5 text-center">Unit</th>
                      <th className="px-3.5 py-2.5 text-right">Avg. Rate</th>
                      <th className="px-3.5 py-2.5 text-right">Standing Value</th>
                      <th className="px-3.5 py-2.5 text-center">% Share</th>
                      <th className="px-3.5 py-2.5 text-center">Receipts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {processedItems.map((item) => {
                      const share =
                        grandTotalValue > 0
                          ? ((item.totalAmount / grandTotalValue) * 100).toFixed(1)
                          : "0";
                      const isExpanded = expandedMaterialId === item.id;

                      return (
                        <React.Fragment key={item.id}>
                          <tr
                            onClick={() =>
                              setExpandedMaterialId(isExpanded ? null : item.id)
                            }
                            className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                              isExpanded ? "bg-muted/20" : ""
                            }`}
                          >
                            {/* Material Name */}
                            <td className="px-3.5 py-2.5 font-semibold text-foreground whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                                <span>{item.name}</span>
                              </div>
                            </td>

                            {/* Standing Quantity */}
                            <td className="px-3.5 py-2.5 text-right font-bold text-foreground whitespace-nowrap">
                              {item.totalQty.toLocaleString(undefined, {
                                minimumFractionDigits: 1,
                                maximumFractionDigits: 2,
                              })}
                            </td>

                            {/* Unit */}
                            <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                              <span className="inline-block px-1.5 py-0.5 rounded bg-muted/60 text-[10px] font-medium text-muted-foreground uppercase">
                                {item.unit}
                              </span>
                            </td>

                            {/* Avg Rate */}
                            <td className="px-3.5 py-2.5 text-right text-muted-foreground whitespace-nowrap font-medium">
                              ₹{item.avgRate.toFixed(2)}
                            </td>

                            {/* Standing Value */}
                            <td className="px-3.5 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              ₹
                              {item.totalAmount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>

                            {/* % Share */}
                            <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5 min-w-[70px]">
                                <div className="w-12 bg-muted rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-amber-500 h-full rounded-full"
                                    style={{
                                      width: `${Math.min(100, Math.max(0, Number(share)))}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] font-semibold text-muted-foreground w-8 text-right">
                                  {share}%
                                </span>
                              </div>
                            </td>

                            {/* Receipt Count & Toggle */}
                            <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 hover:bg-amber-500/20 transition-colors"
                                title="Click to view contributing receipts"
                              >
                                <span>
                                  {item.receiptCount} receipt{item.receiptCount === 1 ? "" : "s"}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Contributing Receipts Sub-Row */}
                          {isExpanded && (
                            <tr className="bg-amber-500/[0.03] border-b border-border">
                              <td colSpan={7} className="px-4 py-3">
                                <div className="rounded-xl border border-border/70 bg-card p-3 space-y-2">
                                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                                    <span className="flex items-center gap-1.5">
                                      <Info className="h-3.5 w-3.5 text-amber-500" />
                                      Receipts Contributing to {item.name}:
                                    </span>
                                    <span className="text-[11px] text-muted-foreground font-normal">
                                      Total: {item.totalQty.toLocaleString()} {item.unit} (₹{item.totalAmount.toLocaleString("en-IN")})
                                    </span>
                                  </div>

                                  <div className="divide-y divide-border/60 border border-border/50 rounded-lg overflow-hidden text-[11px]">
                                    {item.receipts.map((rc, rIdx) => (
                                      <div
                                        key={rIdx}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 bg-card hover:bg-muted/30 gap-2"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-foreground">
                                            {rc.purchaseNo}
                                          </span>
                                          <span className="text-muted-foreground flex items-center gap-1">
                                            <User className="h-3 w-3" /> {rc.customerName}
                                          </span>
                                          {rc.purchaseDate && (
                                            <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
                                              <Calendar className="h-3 w-3" />
                                              {new Date(rc.purchaseDate).toLocaleDateString("en-IN")}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-4 text-right">
                                          <span className="font-medium text-foreground">
                                            {rc.qty} {item.unit}
                                          </span>
                                          <span className="text-muted-foreground">
                                            @ ₹{rc.rate}
                                          </span>
                                          <span className="font-bold text-foreground">
                                            ₹{rc.amount.toLocaleString("en-IN")}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>

                  {/* Table Grand Total Footer */}
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/60 font-bold text-foreground">
                      <td className="px-3.5 py-2.5">
                        <span className="uppercase tracking-wider text-[11px]">
                          Grand Total
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-black">
                        {grandTotalWeightKg.toLocaleString(undefined, {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-3.5 py-2.5 text-center text-[10px] font-semibold text-muted-foreground">
                        {hasOtherUnits ? "MIXED" : "KG"}
                      </td>
                      <td className="px-3.5 py-2.5 text-right text-muted-foreground">
                        —
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                        ₹
                        {grandTotalValue.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-3.5 py-2.5 text-center text-[10px]">
                        100%
                      </td>
                      <td className="px-3.5 py-2.5 text-center text-[10px] font-semibold text-muted-foreground">
                        {totalPendingReceipts} receipts
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
