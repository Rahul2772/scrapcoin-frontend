import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Calendar } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavAuth } from "./__root";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/rates")({
  head: () => ({
    meta: [
      { title: "Today's Scrap Rates — All Materials | The Scrap Co., Noida" },
      {
        name: "description",
        content:
          "Check today's scrap rates per kg in Noida — Metals (Copper ₹935, Brass ₹575, Aluminium ₹220+), Papers, Plastics, Textiles, Wooden Scrap & Glass. Transparent pricing, instant bank transfer.",
      },
    ],
  }),
  component: RatesPage,
});

// ── Static catalog ──────────────────────────────────────────────────────────
// Source: scrap_goods_inventory_and_price_catalog.md (purchase price = rate we pay customer)
// Sorted within each category by purchase price descending

type ScrapItem = { name: string; buyPrice: number; unit: string };

type ScrapCategory = {
  id: string;
  label: string;
  emoji: string;
  accentFrom: string;
  accentTo: string;
  items: ScrapItem[];
};

const CATALOG: ScrapCategory[] = [
  {
    id: "metals",
    label: "Metals",
    emoji: "🔩",
    accentFrom: "#64748b",
    accentTo: "#94a3b8",
    items: [
      { name: "Copper", buyPrice: 935, unit: "kg" },
      { name: "Brass", buyPrice: 575, unit: "kg" },
      { name: "Aluminium Utensils", buyPrice: 225, unit: "kg" },
      { name: "Aluminium Scraps", buyPrice: 220, unit: "kg" },
      { name: "Steel", buyPrice: 40, unit: "kg" },
      { name: "Heavy Iron", buyPrice: 27, unit: "kg" },
      { name: "Metal E-Waste", buyPrice: 25, unit: "kg" },
      { name: "Tin / Light Iron", buyPrice: 24, unit: "kg" },
    ],
  },
  {
    id: "papers",
    label: "Papers",
    emoji: "📰",
    accentFrom: "#d97706",
    accentTo: "#fbbf24",
    items: [
      { name: "Newspapers", buyPrice: 14, unit: "kg" },
      { name: "Office Paper", buyPrice: 14, unit: "kg" },
      { name: "Books / Notebooks / Paper", buyPrice: 13, unit: "kg" },
      { name: "Magazines", buyPrice: 12, unit: "kg" },
      { name: "Cardboard (OCC / Duplex)", buyPrice: 11, unit: "kg" },
      { name: "Mill Board", buyPrice: 5, unit: "kg" },
      { name: "Grey Board", buyPrice: 3, unit: "kg" },
    ],
  },
  {
    id: "plastics",
    label: "Plastics",
    emoji: "♻️",
    accentFrom: "#059669",
    accentTo: "#34d399",
    items: [
      { name: "Exhaust Fan Plastic", buyPrice: 50, unit: "kg" },
      { name: "Water Tank (Black / White)", buyPrice: 20, unit: "kg" },
      { name: "UPVC Door", buyPrice: 20, unit: "kg" },
      { name: "Plastic E-Waste", buyPrice: 20, unit: "kg" },
      { name: "Mixed Plastics", buyPrice: 10, unit: "kg" },
      { name: "Paint Buckets (PVC)", buyPrice: 0, unit: "kg" },
    ],
  },
  {
    id: "textiles",
    label: "Textiles",
    emoji: "👕",
    accentFrom: "#7c3aed",
    accentTo: "#c084fc",
    items: [
      { name: "Used Clothes", buyPrice: 3, unit: "kg" },
      { name: "Used Footwear", buyPrice: 0, unit: "kg" },
    ],
  },
  {
    id: "wooden",
    label: "Wooden Scrap",
    emoji: "🪵",
    accentFrom: "#b45309",
    accentTo: "#f59e0b",
    items: [{ name: "Wooden Scraps", buyPrice: 0, unit: "kg" }],
  },
  {
    id: "glass",
    label: "Glass",
    emoji: "🍶",
    accentFrom: "#0891b2",
    accentTo: "#67e8f9",
    items: [{ name: "Glass Bottles / Sheets / Shards", buyPrice: 0, unit: "kg" }],
  },
];

const TOTAL_ITEMS = CATALOG.reduce((s, c) => s + c.items.length, 0);

function RatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const q = searchQuery.toLowerCase().trim();

  const filteredCatalog = CATALOG.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        q === "" ||
        item.name.toLowerCase().includes(q) ||
        cat.label.toLowerCase().includes(q)
    ),
  })).filter(
    (cat) =>
      (activeCategory === "all" || cat.id === activeCategory) &&
      cat.items.length > 0
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/"><BrandLogo size={60} /></Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mr-2">
              ← Back to Home
            </Link>
            <NavAuth />
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-14 border-b border-border/60" style={{ background: "var(--gradient-soft)" }}>
        <div className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative mx-auto max-w-3xl px-4 text-center space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Updated Daily · Noida Area
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Scrap Rates &amp; Price List
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Certified digital scales · instant bank transfer · {TOTAL_ITEMS} materials across 6 categories.
          </p>
          {/* Stats chips */}
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            {[
              { label: "Categories", value: String(CATALOG.length) },
              { label: "Materials listed", value: String(TOTAL_ITEMS) },
              { label: "Top rate", value: "₹ 935/kg" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border/60 bg-card/80 px-5 py-2 text-center backdrop-blur-sm">
                <p className="text-lg font-bold text-primary">{s.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 space-y-7">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="rates-search"
              placeholder="Search material (e.g. Copper, Paper…)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border border-border bg-card"
            />
          </div>
          <Link to="/" hash="booking">
            <Button size="sm" className="rounded-xl cursor-pointer">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Book Free Pickup
            </Button>
          </Link>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2">
          <CategoryPill id="all" label="All Categories" active={activeCategory === "all"} onClick={() => setActiveCategory("all")} />
          {CATALOG.map((cat) => (
            <CategoryPill
              key={cat.id}
              id={cat.id}
              label={`${cat.emoji} ${cat.label}`}
              active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
        </div>

        {/* Empty search */}
        {filteredCatalog.length === 0 && (
          <div className="rounded-2xl border border-border/60 bg-card p-10 text-center text-muted-foreground">
            No materials found matching &ldquo;{searchQuery}&rdquo;.
          </div>
        )}

        {/* Category sections */}
        <div className="space-y-8">
          {filteredCatalog.map((cat) => (
            <section key={cat.id} id={`section-${cat.id}`}>
              {/* Section header */}
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="flex items-center justify-center w-9 h-9 rounded-xl text-lg shadow-sm border border-border/60"
                  style={{ background: `linear-gradient(135deg, ${cat.accentFrom}22, ${cat.accentTo}22)` }}
                >
                  {cat.emoji}
                </span>
                <h2 className="text-base font-bold tracking-tight">{cat.label}</h2>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  {cat.items.length} item{cat.items.length !== 1 ? "s" : ""}
                </span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              {/* Items table */}
              <div
                className="overflow-hidden rounded-2xl border border-border/60 shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${cat.accentFrom}0d 0%, transparent 60%), var(--color-card, hsl(0 0% 100%))`,
                }}
              >
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-background/60 text-muted-foreground">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Material / Sub-category</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                        We Pay
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {cat.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-foreground">{item.name}</td>
                        <td className="px-5 py-3.5 text-right">
                          {item.buyPrice === 0 ? (
                            <span className="text-xs text-muted-foreground italic">Call for price</span>
                          ) : (
                            <span
                              className="inline-block rounded-lg px-3 py-1 text-sm font-bold tabular-nums"
                              style={{
                                background: `linear-gradient(135deg, ${cat.accentFrom}22, ${cat.accentTo}22)`,
                                color: cat.accentFrom,
                              }}
                            >
                              ₹ {item.buyPrice.toLocaleString("en-IN")} / {item.unit}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>

        {/* Footnote */}
        <div className="text-center text-xs text-muted-foreground pt-2 space-y-1 border-t border-border/40 pt-6">
          <p>Rates shown are standard purchase prices (what we pay you). Actual rates may vary based on quantity, material condition &amp; market.</p>
          <p>Items marked &ldquo;Call for price&rdquo; are accepted — <a href="tel:+918527993306" className="underline underline-offset-2 hover:text-foreground transition-colors">call us</a> for the current rate.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ── Helper ──────────────────────────────────────────────────────────────────
function CategoryPill({ id, label, active, onClick }: { id: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      id={`cat-filter-${id}`}
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
