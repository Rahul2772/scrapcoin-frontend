import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchERPReports, type ERPReport } from "@/lib/api";
import { PERIOD_MODES, periodRange, type PeriodMode } from "@/lib/period";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ChevronLeft, ChevronRight, Download, Search, Info, ArrowUpDown,
  Receipt, Scale, Wallet, TrendingUp, Landmark, Gauge,
} from "lucide-react";

export const Route = createLazyFileRoute("/admin/erp/reports")({
  component: ERPReports,
});

// ── Formatting ────────────────────────────────────────────────────────────────
const inr = (v: number | null | undefined) =>
  v == null ? "—" : "₹" + Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const kg = (v: number | null | undefined) =>
  v == null ? "—" : Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 }) + " kg";
const pctText = (v: number | null | undefined) => (v == null ? "—" : v.toFixed(1) + "%");
const dateText = (d: string | null | undefined) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function Money({ value, strong }: { value: number | null | undefined; strong?: boolean }) {
  if (value == null) return <span className="text-muted-foreground">—</span>;
  const tone = value > 0 ? "text-green-700" : value < 0 ? "text-red-600" : "text-muted-foreground";
  return <span className={tone + (strong ? " font-semibold" : "")}>{(value > 0 ? "+" : "") + inr(value)}</span>;
}

// ── Generic table: sortable, searchable, cards on phones, CSV export ─────────
type Column<T> = {
  key: string;
  label: string;
  align?: "right";
  value: (row: T) => string | number | null; // used for sort + CSV
  render?: (row: T) => ReactNode;
};

function downloadCsv<T>(name: string, columns: Column<T>[], rows: T[]) {
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const csv = [columns.map((c) => esc(c.label)).join(","), ...rows.map((r) => columns.map((c) => esc(c.value(r))).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name + ".csv";
  a.click();
  URL.revokeObjectURL(url);
}

function ReportTable<T>({
  rows, columns, csvName, searchText, empty = "Nothing in this period.",
}: {
  rows: T[];
  columns: Column<T>[];
  csvName: string;
  searchText?: (row: T) => string;
  empty?: string;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; desc: boolean } | null>(null);

  const shown = useMemo(() => {
    let out = rows;
    if (query && searchText) {
      const q = query.toLowerCase();
      out = out.filter((r) => searchText(r).toLowerCase().includes(q));
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col) {
        out = [...out].sort((a, b) => {
          const va = col.value(a), vb = col.value(b);
          const cmp = typeof va === "number" && typeof vb === "number"
            ? va - vb
            : String(va ?? "").localeCompare(String(vb ?? ""));
          return sort.desc ? -cmp : cmp;
        });
      }
    }
    return out;
  }, [rows, query, sort, columns, searchText]);

  const [first, ...rest] = columns;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {searchText && (
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="h-8 pl-8 text-sm" />
          </div>
        )}
        <span className="text-xs text-muted-foreground">{shown.length} row{shown.length === 1 ? "" : "s"}</span>
        <Button
          variant="outline" size="sm" className="ml-auto h-8 gap-1.5 text-xs"
          disabled={shown.length === 0}
          onClick={() => downloadCsv(csvName, columns, shown)}
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{empty}</div>
      ) : (
        <>
          {/* Phones: one card per row */}
          <div className="space-y-2 md:hidden">
            {shown.map((row, i) => (
              <div key={i} className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
                <div className="mb-2 text-sm font-semibold text-foreground">{first.render ? first.render(row) : first.value(row)}</div>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  {rest.map((c) => (
                    <div key={c.key} className="min-w-0">
                      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{c.label}</dt>
                      <dd className="truncate">{c.render ? c.render(row) : c.value(row) ?? "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
                  {columns.map((c) => (
                    <th key={c.key} className={"px-4 py-3 font-semibold whitespace-nowrap " + (c.align === "right" ? "text-right" : "")}>
                      <button
                        className="inline-flex items-center gap-1 cursor-pointer hover:text-foreground"
                        onClick={() => setSort((s) => ({ key: c.key, desc: s?.key === c.key ? !s.desc : true }))}
                      >
                        {c.label}
                        <ArrowUpDown className={"h-3 w-3 " + (sort?.key === c.key ? "text-primary" : "opacity-40")} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((row, i) => (
                  <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                    {columns.map((c) => (
                      <td key={c.key} className={"px-4 py-2.5 align-top " + (c.align === "right" ? "text-right whitespace-nowrap" : "")}>
                        {c.render ? c.render(row) : c.value(row) ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ── Column sets ───────────────────────────────────────────────────────────────
type Row<K extends keyof ERPReport> = ERPReport[K] extends (infer R)[] ? R : never;

// Columns shared by every "group" report (customers, societies, sources)
function groupColumns<T extends { pickups: number; kg: number; paid: number; profit: number; net_profit: number; margin_pct: number | null; profit_per_pickup: number }>(): Column<T>[] {
  return [
    { key: "pickups", label: "Pickups", align: "right", value: (r) => r.pickups },
    { key: "kg", label: "Weight", align: "right", value: (r) => r.kg, render: (r) => kg(r.kg) },
    { key: "paid", label: "Paid", align: "right", value: (r) => r.paid, render: (r) => inr(r.paid) },
    { key: "profit", label: "Est. profit", align: "right", value: (r) => r.profit, render: (r) => <Money value={r.profit} strong /> },
    { key: "margin", label: "Margin", align: "right", value: (r) => r.margin_pct, render: (r) => pctText(r.margin_pct) },
    { key: "ppp", label: "Profit / pickup", align: "right", value: (r) => r.profit_per_pickup, render: (r) => <Money value={r.profit_per_pickup} /> },
    { key: "net", label: "After costs", align: "right", value: (r) => r.net_profit, render: (r) => <Money value={r.net_profit} /> },
  ];
}

const billColumns: Column<Row<"bills">>[] = [
  { key: "bill", label: "Bill", value: (r) => r.bill_no, render: (r) => <span className="font-mono font-semibold">{r.bill_no}</span> },
  { key: "date", label: "Date", value: (r) => r.date, render: (r) => dateText(r.date) },
  { key: "customer", label: "Customer", value: (r) => r.customer_name },
  { key: "society", label: "Society", value: (r) => r.society },
  { key: "materials", label: "Materials", value: (r) => r.materials.join("; "), render: (r) => <span className="line-clamp-2 max-w-[220px]" title={r.materials.join(", ")}>{r.materials.join(", ")}</span> },
  { key: "kg", label: "Weight", align: "right", value: (r) => r.kg, render: (r) => kg(r.kg) },
  { key: "paid", label: "Paid", align: "right", value: (r) => r.paid, render: (r) => inr(r.paid) },
  { key: "value", label: "Sale value", align: "right", value: (r) => r.est_value, render: (r) => inr(r.est_value) },
  { key: "profit", label: "Est. profit", align: "right", value: (r) => r.profit, render: (r) => <Money value={r.profit} strong /> },
  { key: "margin", label: "Margin", align: "right", value: (r) => r.margin_pct, render: (r) => pctText(r.margin_pct) },
];

const customerColumns: Column<Row<"customers">>[] = [
  { key: "name", label: "Customer", value: (r) => r.name, render: (r) => (
    <span><span className="font-semibold">{r.name}</span>{r.phone && <span className="block text-[11px] text-muted-foreground">{r.phone}</span>}</span>
  ) },
  { key: "society", label: "Society", value: (r) => r.society },
  { key: "source", label: "Source", value: (r) => r.lead_source },
  ...groupColumns<Row<"customers">>(),
  { key: "last", label: "Last pickup", value: (r) => r.last_pickup, render: (r) => (
    <span className="whitespace-nowrap">{dateText(r.last_pickup)}{r.days_since_last != null && <span className="block text-[11px] text-muted-foreground">{r.days_since_last} days ago</span>}</span>
  ) },
];

const societyColumns: Column<Row<"societies">>[] = [
  { key: "society", label: "Society", value: (r) => r.society, render: (r) => <span className="font-semibold">{r.society}</span> },
  { key: "customers", label: "Customers", align: "right", value: (r) => r.customers },
  ...groupColumns<Row<"societies">>(),
  { key: "kgpp", label: "Kg / pickup", align: "right", value: (r) => r.kg_per_pickup, render: (r) => kg(r.kg_per_pickup) },
  { key: "mix", label: "Top materials", value: (r) => r.top_materials.map((m) => `${m.name} ${m.kg}kg`).join("; "), render: (r) => (
    <span className="flex flex-wrap gap-1">
      {r.top_materials.map((m) => (
        <span key={m.name} className="rounded-full bg-muted px-2 py-0.5 text-[10px] whitespace-nowrap">{m.name} · {kg(m.kg)}</span>
      ))}
    </span>
  ) },
];

const sourceColumns: Column<Row<"sources">>[] = [
  { key: "source", label: "Lead source", value: (r) => r.lead_source, render: (r) => <span className="font-semibold">{r.lead_source}</span> },
  { key: "customers", label: "Customers", align: "right", value: (r) => r.customers },
  ...groupColumns<Row<"sources">>(),
];

const RATE_SOURCE_LABEL: Record<Row<"materials">["rate_source"], string> = {
  period: "this period's sales",
  all_time: "all-time sales",
  catalogue: "catalogue price",
  none: "no sale price",
};

const materialColumns: Column<Row<"materials">>[] = [
  { key: "name", label: "Material", value: (r) => r.name, render: (r) => (
    <span className="inline-flex items-center gap-1.5 font-semibold">
      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color_hex }} />{r.name}
    </span>
  ) },
  { key: "bought", label: "Bought", align: "right", value: (r) => r.kg_bought, render: (r) => kg(r.kg_bought) },
  { key: "share", label: "Share", align: "right", value: (r) => r.share_kg_pct, render: (r) => pctText(r.share_kg_pct) },
  { key: "buy", label: "Avg buy rate", align: "right", value: (r) => r.avg_buy_rate, render: (r) => inr(r.avg_buy_rate) },
  { key: "sell", label: "Avg sell rate", align: "right", value: (r) => r.avg_sell_rate, render: (r) => (
    <span>{inr(r.avg_sell_rate)}<span className="block text-[10px] text-muted-foreground">{RATE_SOURCE_LABEL[r.rate_source]}</span></span>
  ) },
  { key: "mpk", label: "Margin / kg", align: "right", value: (r) => r.margin_per_kg, render: (r) => <Money value={r.margin_per_kg} /> },
  { key: "profit", label: "Est. profit", align: "right", value: (r) => r.est_profit, render: (r) => <Money value={r.est_profit} strong /> },
  { key: "sold", label: "Sold", align: "right", value: (r) => r.kg_sold, render: (r) => kg(r.kg_sold) },
  { key: "revenue", label: "Sale revenue", align: "right", value: (r) => r.sale_revenue, render: (r) => inr(r.sale_revenue) },
];

const reengageColumns: Column<Row<"reengage">>[] = [
  { key: "name", label: "Customer", value: (r) => r.name, render: (r) => (
    <span><span className="font-semibold">{r.name}</span>{r.phone && <span className="block text-[11px] text-muted-foreground">{r.phone}</span>}</span>
  ) },
  { key: "society", label: "Society", value: (r) => r.society },
  { key: "last", label: "Last pickup", value: (r) => r.last_pickup, render: (r) => dateText(r.last_pickup) },
  { key: "days", label: "Days since", align: "right", value: (r) => r.days_since_last },
  { key: "pickups", label: "Lifetime pickups", align: "right", value: (r) => r.lifetime_pickups },
  { key: "profit", label: "Lifetime profit", align: "right", value: (r) => r.lifetime_profit, render: (r) => <Money value={r.lifetime_profit} strong /> },
];

// ── Overview ──────────────────────────────────────────────────────────────────
function RankCard<T>({ title, rows, label, value, empty }: {
  title: string; rows: T[]; label: (r: T) => string; value: (r: T) => number; empty: string;
}) {
  const top = rows.slice(0, 5);
  const max = Math.max(1, ...top.map((r) => Math.abs(value(r))));
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {top.length === 0 ? (
        <p className="text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-2.5">
          {top.map((r, i) => (
            <li key={i} className="text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate">{label(r)}</span>
                <Money value={value(r)} strong />
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted">
                <div
                  className={"h-1.5 rounded-full " + (value(r) >= 0 ? "bg-primary" : "bg-red-400")}
                  style={{ width: (Math.abs(value(r)) / max) * 100 + "%" }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Overview({ report }: { report: ERPReport }) {
  const byMargin = [...report.materials].filter((m) => m.margin_per_kg != null && m.kg_bought > 0)
    .sort((a, b) => (b.margin_per_kg ?? 0) - (a.margin_per_kg ?? 0));
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <RankCard title="Most profitable societies" rows={report.societies} label={(r) => r.society} value={(r) => r.profit} empty="No pickups in this period." />
      <RankCard title="Most profitable customers" rows={report.customers} label={(r) => r.name} value={(r) => r.profit} empty="No pickups in this period." />
      <RankCard title="Profit by material" rows={report.materials.filter((m) => m.kg_bought > 0)} label={(r) => r.name} value={(r) => r.est_profit} empty="No materials bought in this period." />
      <RankCard title="Best margin per kg" rows={byMargin} label={(r) => r.name} value={(r) => r.margin_per_kg ?? 0} empty="No priced materials." />
      <RankCard title="Lead sources by profit" rows={report.sources} label={(r) => r.lead_source} value={(r) => r.profit} empty="No pickups in this period." />
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold text-foreground">Customers to win back</h3>
        <p className="text-xs text-muted-foreground">
          No pickup for {report.reengage_after_days}+ days, most profitable first. Open the Win back tab to export the list for WhatsApp follow-up.
        </p>
        <p className="mt-3 text-3xl font-bold text-foreground">{report.reengage.length}</p>
        <ul className="mt-2 space-y-1 text-xs">
          {report.reengage.slice(0, 4).map((c) => (
            <li key={c.customer_id} className="flex justify-between gap-2">
              <span className="truncate">{c.name}</span>
              <span className="text-muted-foreground whitespace-nowrap">{c.days_since_last} days</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "bills", label: "Bills" },
  { id: "customers", label: "Customers" },
  { id: "societies", label: "Societies" },
  { id: "sources", label: "Lead sources" },
  { id: "materials", label: "Materials" },
  { id: "reengage", label: "Win back" },
] as const;
type Section = (typeof SECTIONS)[number]["id"];

function Kpi({ icon: Icon, label, value, sub }: { icon: typeof Receipt; label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}<Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="mt-2 text-xl font-bold text-foreground">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function ERPReports() {
  const { session } = useAuth();
  const [periodMode, setPeriodMode] = useState<PeriodMode>("quarter");
  const [periodOffset, setPeriodOffset] = useState(0);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [section, setSection] = useState<Section>("overview");
  const [report, setReport] = useState<ERPReport | null>(null);
  const [loading, setLoading] = useState(true);

  const period = periodMode === "month" || periodMode === "quarter" || periodMode === "year"
    ? periodRange(periodMode, periodOffset)
    : null;
  const from = period ? period.from : periodMode === "custom" ? customFrom : "";
  const to = period ? period.to : periodMode === "custom" ? customTo : "";
  const unitWord = periodMode === "quarter" ? "quarter" : periodMode === "year" ? "year" : "month";
  const periodName = period ? period.label.split(" (")[0] : periodMode === "custom" ? `${from || "start"} to ${to || "today"}` : "All time";
  const fileTag = (from || "all") + (to ? "_" + to : "");

  useEffect(() => {
    if (!session?.access_token) return;
    if (periodMode === "custom" && (!customFrom || !customTo)) return;
    let cancelled = false;
    setLoading(true);
    fetchERPReports(session.access_token, from, to)
      .then((res) => { if (!cancelled) setReport(res.report); })
      .catch((err) => { if (!cancelled) toast.error(err.message || "Could not load reports"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [session, from, to, periodMode, customFrom, customTo]);

  const s = report?.summary;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Reports</h2>
          <p className="text-xs text-muted-foreground">Where our scrap comes from, what it is, and what it earns.</p>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-border bg-muted/40 p-0.5">
          {PERIOD_MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => { setPeriodMode(m.value); setPeriodOffset(0); }}
              className={"rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer transition-all " + (
                periodMode === m.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        {period && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setPeriodOffset((o) => o - 1)} title={"Previous " + unitWord}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="min-w-[150px] text-center text-xs font-semibold text-foreground">{period.label}</span>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={periodOffset >= 0} onClick={() => setPeriodOffset((o) => o + 1)} title={"Next " + unitWord}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        {periodMode === "custom" && (
          <div className="flex items-center gap-2">
            <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="h-8 w-36 text-sm" />
            <span className="text-xs text-muted-foreground">to</span>
            <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="h-8 w-36 text-sm" />
          </div>
        )}
      </div>

      {/* KPIs */}
      {loading || !s ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          <Kpi icon={Receipt} label="Pickups" value={s.pickups} sub={`${s.customers} customers · ${periodName}`} />
          <Kpi icon={Scale} label="Collected" value={kg(s.kg)} sub={`${kg(s.kg_per_pickup)} per pickup`} />
          <Kpi icon={Wallet} label="Paid to customers" value={inr(s.paid)} sub={`Sale value ${inr(s.est_value)}`} />
          <Kpi icon={TrendingUp} label="Est. profit" value={<Money value={s.profit} />} sub={`Margin ${pctText(s.margin_pct)}`} />
          <Kpi icon={Gauge} label="Profit / pickup" value={<Money value={s.profit_per_pickup} />} sub={`Costs ${inr(s.cost_per_pickup)} per pickup`} />
          <Kpi icon={Landmark} label="After expenses" value={<Money value={s.net_profit} />} sub={`Expenses ${inr(s.expenses)}`} />
        </div>
      )}

      <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span>
          Profit is an estimate: weight × the average rate recyclers paid us for that material in this period (before GST),
          minus what we paid the customer. If a material wasn't sold in the period, all-time sales or the catalogue price is used.
          "After costs" also takes off this period's approved expenses, shared equally across pickups.
          {s && s.unpriced_materials.length > 0 && (
            <> <b>No sale price yet:</b> {s.unpriced_materials.join(", ")} (counted as zero value).</>
          )}
        </span>
      </div>

      {/* Sections */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {SECTIONS.map((sec) => (
          <Button
            key={sec.id}
            variant={section === sec.id ? "default" : "outline"}
            size="sm"
            className="h-7 shrink-0 rounded-full text-xs cursor-pointer"
            onClick={() => setSection(sec.id)}
          >
            {sec.label}
            {report && sec.id === "reengage" && report.reengage.length > 0 && (
              <span className="ml-1 rounded-full bg-amber-500 px-1.5 text-[10px] text-white">{report.reengage.length}</span>
            )}
          </Button>
        ))}
      </div>

      {loading || !report ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : section === "overview" ? (
        <Overview report={report} />
      ) : section === "bills" ? (
        <ReportTable rows={report.bills} columns={billColumns} csvName={"bills_" + fileTag}
          searchText={(r) => `${r.bill_no} ${r.customer_name} ${r.society} ${r.materials.join(" ")}`} />
      ) : section === "customers" ? (
        <ReportTable rows={report.customers} columns={customerColumns} csvName={"customers_" + fileTag}
          searchText={(r) => `${r.name} ${r.phone || ""} ${r.society} ${r.lead_source}`} />
      ) : section === "societies" ? (
        <ReportTable rows={report.societies} columns={societyColumns} csvName={"societies_" + fileTag}
          searchText={(r) => r.society} />
      ) : section === "sources" ? (
        <ReportTable rows={report.sources} columns={sourceColumns} csvName={"lead_sources_" + fileTag} />
      ) : section === "materials" ? (
        <ReportTable rows={report.materials} columns={materialColumns} csvName={"materials_" + fileTag}
          searchText={(r) => r.name} />
      ) : (
        <ReportTable rows={report.reengage} columns={reengageColumns} csvName="win_back_customers"
          searchText={(r) => `${r.name} ${r.phone || ""} ${r.society}`}
          empty={`Every customer has had a pickup in the last ${report.reengage_after_days} days.`} />
      )}
    </div>
  );
}
