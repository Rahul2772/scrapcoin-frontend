import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { fetchERPDashboard, type ERPDashboardData } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
  Scale,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const Route = createLazyFileRoute("/admin/erp/")({
  component: ERPDashboard,
});

const INVOICE_STATUS_COLORS = {
  paid: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200",
};

const CHART_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00c49f"];

function ERPDashboard() {
  const { session } = useAuth();
  const [data, setData] = useState<ERPDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveStatus, setLiveStatus] = useState<"connecting" | "live" | "offline">("connecting");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function loadDashboard(token: string, showLoading = false) {
    if (showLoading) setLoading(true);
    try {
      const res = await fetchERPDashboard(token);
      if (res.success) setData(res.dashboard);
    } catch (err) {
      console.error("[ERP Dashboard] Refresh error:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    if (!session?.access_token) return;
    loadDashboard(session.access_token, true);
  }, [session]);

  // Supabase Realtime — auto-refresh on data changes
  useEffect(() => {
    if (!session?.access_token) return;
    const token = session.access_token;

    const channel = supabase
      .channel("erp-dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "erp_transactions" }, () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => loadDashboard(token), 1500);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "erp_purchase_receipts" }, () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => loadDashboard(token), 1500);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => loadDashboard(token), 1500);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setLiveStatus("live");
        else if (status === "CLOSED" || status === "CHANNEL_ERROR") setLiveStatus("offline");
        else setLiveStatus("connecting");
      });

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [session]);


  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[300px] lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-[300px] rounded-2xl" />
        </div>
      </div>
    );
  }

  const { revenue, low_stock_alerts, recent_transactions, monthly_trend, top_materials, invoice_summary, material_pnl } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Live status indicator */}
      <div className="flex items-center justify-end">
        {liveStatus === "live" && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            LIVE
          </span>
        )}
        {liveStatus === "connecting" && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            Connecting…
          </span>
        )}
        {liveStatus === "offline" && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <span className="inline-flex rounded-full h-2 w-2 bg-gray-400" />
            Offline
          </span>
        )}
      </div>

      {/* Stat Cards — Sell Revenue · Buy Cost · Weight · Scale Tickets · Gross P&L */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">

        {/* 1 — B2B Sell Revenue */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Sell Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            ₹{revenue.revenue_this_month.toLocaleString("en-IN")}
          </p>
          <div className="mt-1 text-[10px] text-emerald-600">
            B2B sales to recyclers · last 30 days
          </div>
        </div>

        {/* 2 — B2C Buy Cost */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Buy Cost</span>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            ₹{(revenue.buy_cost_this_month ?? 0).toLocaleString("en-IN")}
          </p>
          <div className="mt-1 text-[10px] text-rose-500">
            Paid to household customers · last 30 days
          </div>
        </div>

        {/* 3 — Weight Collected */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Weight Collected</span>
            <Scale className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {revenue.weight_this_month.toLocaleString("en-IN")} kg
          </p>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Rolling 30-day window</span>
          </div>
        </div>

        {/* 4 — B2B Scale Ticket Count */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Scale Tickets</span>
            <FileText className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {revenue.txn_count_this_month}
          </p>
          <div className="mt-1 text-[10px] text-muted-foreground">
            B2B transactions · last 30 days
          </div>
        </div>

        {/* 5 — Gross Profit / Loss */}
        <div className={`rounded-2xl border p-5 shadow-sm ${
          revenue.profit_loss >= 0
            ? "border-emerald-500/30 bg-emerald-500/5"
            : "border-red-500/30 bg-red-500/5"
        }`}>
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross P&L</span>
            {revenue.profit_loss >= 0
              ? <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              : <ArrowDownRight className="h-4 w-4 text-red-500" />}
          </div>
          <p className={`mt-2 text-2xl font-bold ${
            revenue.profit_loss >= 0 ? "text-emerald-600" : "text-red-600"
          }`}>
            {revenue.profit_loss >= 0 ? "+" : "-"}₹{Math.abs(revenue.profit_loss).toLocaleString("en-IN")}
          </p>
          <div className="mt-1 text-[10px] text-muted-foreground">
            {revenue.revenue_this_month > 0
              ? `Margin: ${((revenue.profit_loss / revenue.revenue_this_month) * 100).toFixed(1)}% · Sell − COGS`
              : "Sell revenue − cost of goods sold"}
          </div>
        </div>

      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Buy & Sell Trend Bar Chart */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">6-Month Buy & Sell Trend</h2>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#3b82f6" }} />
                Buy (from Customers)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#f59e0b" }} />
                Sell (to Recyclers)
              </span>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly_trend} barCategoryGap="30%" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  formatter={(value, name) => [
                    `₹${Number(value).toLocaleString("en-IN")}`,
                    name,
                  ]}
                  contentStyle={{ borderRadius: "10px", fontSize: 12 }}
                />
                {/* sell_revenue = erp_purchase_receipts = Buy from Customers (B2C) */}
                <Bar dataKey="sell_revenue" name="Buy (from Customers)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                {/* purchase_revenue = erp_transactions = Sell to Recyclers (B2B) */}
                <Bar dataKey="purchase_revenue" name="Sell (to Recyclers)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Materials Pie Chart */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-4">Top Materials (Revenue)</h2>
          <div className="h-[180px] w-full relative">
            {top_materials.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                No collection records this month
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={top_materials}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name }) => name}
                  >
                    {top_materials.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color_hex || CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-3 space-y-1.5">
            {top_materials.map((m, i) => (
              <div key={m.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color_hex || CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-muted-foreground">{m.name}</span>
                </div>
                <span className="font-semibold text-foreground">₹{m.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Scale entries */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground mb-4">Recent Scale Tickets</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 pr-2 font-medium">Txn No.</th>
                  <th className="pb-3 pr-2 font-medium">Recycler</th>
                  <th className="pb-3 pr-2 font-medium">Material</th>
                  <th className="pb-3 pr-2 font-medium">Weight</th>
                  <th className="pb-3 pr-2 font-medium text-right">Payout</th>
                  <th className="pb-3 text-right font-medium">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent_transactions.slice(0, 5).map((t) => (
                  <tr key={t.id}>
                    <td className="py-3 pr-2 font-semibold text-foreground whitespace-nowrap">{t.txn_number}</td>
                    <td className="py-3 pr-2 text-muted-foreground whitespace-nowrap truncate max-w-[120px]">{t.supplier_name}</td>
                    <td className="py-3 pr-2 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color_hex }} />
                        {t.material_name}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-muted-foreground whitespace-nowrap">{t.weight} {t.unit}</td>
                    <td className="py-3 pr-2 text-right font-bold text-foreground">₹{t.total_amount.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <Badge
                        variant="outline"
                        className={`rounded-full text-[10px] px-2 py-0.5 ${
                          INVOICE_STATUS_COLORS[t.invoice_status as keyof typeof INVOICE_STATUS_COLORS] || "bg-gray-100"
                        }`}
                      >
                        {t.invoice_status.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {recent_transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No scale tickets registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-4">Stock Threshold Alerts</h2>
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
            {low_stock_alerts.map((m) => (
              <div key={m.id} className="flex flex-col gap-1 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{m.name}</span>
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600">
                    LOW STOCK
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Current Stock: <strong className="text-red-500 font-bold">{m.stock_qty} {m.unit}</strong></span>
                  <span>Min Threshold: {m.min_threshold} {m.unit}</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${Math.min(100, (m.stock_qty / (m.min_threshold || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {low_stock_alerts.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                All materials are above minimum stock levels.
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Material-wise Profit & Loss Table */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Material-wise Profit &amp; Loss</h2>
          <span className="text-[10px] text-muted-foreground">All time · Sell revenue − Buy cost</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Material</th>
                <th className="pb-3 pr-4 font-medium text-right">Bought (kg)</th>
                <th className="pb-3 pr-4 font-medium text-right">Sold (kg)</th>
                <th className="pb-3 pr-4 font-medium text-right">Sell Revenue</th>
                <th className="pb-3 pr-4 font-medium text-right">COGS (Sold)</th>
                <th className="pb-3 pr-4 font-medium text-right">Inventory Value</th>
                <th className="pb-3 pr-4 font-medium text-right">Profit / Loss</th>
                <th className="pb-3 font-medium text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(material_pnl || []).length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">No transactions recorded yet.</td>
                </tr>
              ) : (
                (material_pnl || []).map((m) => (
                  <tr key={m.material_id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: m.color_hex || "#ccc" }} />
                        <span className="font-medium text-foreground">{m.material_name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right text-muted-foreground">{m.buy_weight.toFixed(2)}</td>
                    <td className="py-3 pr-4 text-right text-muted-foreground">{m.sell_weight.toFixed(2)}</td>
                    <td className="py-3 pr-4 text-right text-foreground">₹{m.sell_revenue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                    <td className="py-3 pr-4 text-right text-foreground">₹{m.cogs.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                    <td className="py-3 pr-4 text-right">
                      <span className="text-blue-600 font-medium">{m.unsold_weight.toFixed(2)} kg</span>
                      <span className="text-muted-foreground ml-1 text-[10px]">(₹{m.inventory_value.toLocaleString("en-IN", { maximumFractionDigits: 0 })})</span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        m.profit_loss > 0 ? "text-emerald-600" :
                        m.profit_loss < 0 ? "text-red-600" : "text-muted-foreground"
                      }`}>
                        {m.sell_weight === 0 ? <span className="text-blue-500 font-medium text-[10px]">In Inventory</span> : (
                          <>{m.profit_loss > 0 ? "+" : ""}₹{Math.abs(m.profit_loss).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          {m.profit_loss > 0 && <ArrowUpRight className="h-3 w-3" />}
                          {m.profit_loss < 0 && <ArrowDownRight className="h-3 w-3" />}</>
                        )}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {m.sell_weight > 0 && m.cogs > 0 ? (
                        (() => {
                          const margin = m.profit_margin_pct !== undefined ? m.profit_margin_pct : Number(((m.profit_loss / m.cogs) * 100).toFixed(1));
                          return (
                            <span className={`font-bold ${margin > 0 ? "text-emerald-600" : margin < 0 ? "text-red-600" : "text-muted-foreground"}`}>
                              {margin > 0 ? "+" : ""}{margin}%
                            </span>
                          );
                        })()
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {(material_pnl || []).length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border font-bold text-xs">
                  <td className="pt-3 pr-4 text-foreground">Total</td>
                  <td className="pt-3 pr-4 text-right text-muted-foreground">
                    {(material_pnl || []).reduce((s, m) => s + m.buy_weight, 0).toFixed(2)}
                  </td>
                  <td className="pt-3 pr-4 text-right text-muted-foreground">
                    {(material_pnl || []).reduce((s, m) => s + m.sell_weight, 0).toFixed(2)}
                  </td>
                  <td className="pt-3 pr-4 text-right text-foreground">
                    ₹{(material_pnl || []).reduce((s, m) => s + m.sell_revenue, 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                  <td className="pt-3 pr-4 text-right text-foreground">
                    ₹{(material_pnl || []).reduce((s, m) => s + m.cogs, 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                  <td className="pt-3 pr-4 text-right text-blue-600">
                    {(material_pnl || []).reduce((s, m) => s + m.unsold_weight, 0).toFixed(2)} kg
                    <span className="text-muted-foreground ml-1 text-[10px] font-normal">(₹{(material_pnl || []).reduce((s, m) => s + m.inventory_value, 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })})</span>
                  </td>
                  <td className="pt-3 pr-4 text-right">
                    {(() => {
                      const total = (material_pnl || []).reduce((s, m) => s + (m.sell_weight > 0 ? m.profit_loss : 0), 0);
                      return (
                        <span className={`inline-flex items-center gap-1 ${total >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {total >= 0 ? "+" : "-"}₹{Math.abs(total).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          {total >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="pt-3 text-right">
                    {(() => {
                      const totalCogs = (material_pnl || []).reduce((s, m) => s + m.cogs, 0);
                      const totalProfit = (material_pnl || []).reduce((s, m) => s + (m.sell_weight > 0 ? m.profit_loss : 0), 0);
                      const totalMargin = totalCogs > 0 ? ((totalProfit / totalCogs) * 100).toFixed(1) : "0.0";
                      const numMargin = Number(totalMargin);
                      return (
                        <span className={`font-bold ${numMargin >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {numMargin >= 0 ? "+" : ""}{totalMargin}%
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
