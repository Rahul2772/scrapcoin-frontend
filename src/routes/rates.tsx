import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, RefreshCw, Calendar } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { NavAuth } from "./__root";

export const Route = createFileRoute("/rates")({
  head: () => ({
    meta: [
      { title: "Today's Scrap Prices — Noida Area | The Scrap Co." },
      {
        name: "description",
        content:
          "Check today's real-time scrap rates per kg in Noida. Transparent pricing for Cardboard, Plastics, Copper, Metals, and E-waste.",
      },
    ],
  }),
  component: RatesPage,
});

type Category = {
  id: string;
  name: string;
  unit: string;
  pricePerUnit: number;
};

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

function RatesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/scrap-categories`);
      if (!res.ok) throw new Error("Failed to fetch rates");
      const data: Category[] = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load pricing");
    } finally {
      setLoading(false);
    }
  }

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/">
            <BrandLogo size={60} />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mr-2"
            >
              ← Back to Home
            </Link>
            <NavAuth />
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section
        className="relative overflow-hidden py-12 border-b border-border/60"
        style={{ background: "var(--gradient-soft)" }}
      >
        <div
          className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full opacity-25 blur-3xl"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Updated Daily • Noida Area
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Scrap Category Rates</h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Zero guesswork. We use certified digital scales and pay instant market rates per kilogram
            directly to your bank account.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search category (e.g. Copper, Paper)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border border-border bg-card"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCategories}
              disabled={loading}
              className="rounded-xl cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link to="/" hash="booking">
              <Button size="sm" className="rounded-xl cursor-pointer">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Book Pickup
              </Button>
            </Link>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-border/40 last:border-0"
              >
                <Skeleton className="h-5 w-40 animate-pulse" />
                <Skeleton className="h-5 w-20 animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center">
            <p className="text-sm text-destructive-foreground">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 cursor-pointer"
              onClick={fetchCategories}
            >
              Try again
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredCategories.length === 0 && (
          <div className="rounded-2xl border border-border/60 bg-card p-10 text-center text-muted-foreground">
            No scrap categories found matching "{searchQuery}".
          </div>
        )}

        {/* Pricing List */}
        {!loading && !error && filteredCategories.length > 0 && (
          <div
            className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 font-medium text-muted-foreground">
                  <th className="px-6 py-4">Scrap Item</th>
                  <th className="px-6 py-4 text-right">Price per Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground">{c.name}</td>
                    <td className="px-6 py-4 text-right font-bold text-primary">
                      ₹ {c.pricePerUnit.toFixed(2)} / {c.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground pt-4">
          Note: Prices are subject to slight market revisions based on global recycling commodity
          rates.
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-background/50 py-6 text-center text-xs text-muted-foreground mt-auto">
        © {new Date().getFullYear()} The Scrap Co. All rights reserved.
      </footer>
    </div>
  );
}
