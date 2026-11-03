import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Leaf, Award, Compass, BarChart3, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { loadImpact } from "@/lib/impact";

export const Route = createFileRoute("/impact")({
  head: () =>
    pageHead({
      path: "/impact",
      title: "Circular Impact & Sustainability — The Scrap Co.",
      description:
        "Track our cumulative landfill diversion metrics. Learn how we route paper, plastics, metals, and e-waste to certified recyclers.",
    }),
  loader: loadImpact,
  component: ImpactPage,
});

const IMPACT_LABELS: Record<string, string> = {
  paper: "Paper & Boxes",
  plastics: "Plastics (PET/HDPE)",
  metals: "Metals (Al/Fe)",
  "e-waste": "E-Waste",
  others: "Others",
};

// Rough equivalents, same ratios the page has always used
function impactNote(categoryId: string, kg: number): string {
  switch (categoryId) {
    case "paper":
      return `~${Math.round(kg / 60)} trees saved`;
    case "plastics":
      return `~${Math.round(kg / 20)}k bottles diverted`;
    case "metals":
      return `~${Math.round(kg * 0.2)} kg CO₂ avoided`;
    case "e-waste":
      return "Sent to authorised recyclers";
    default:
      return "—";
  }
}

const formatKg = (kg: number) => kg.toLocaleString("en-IN", { maximumFractionDigits: 1 });

function ImpactPage() {
  const impact = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-4xl px-6 py-12 md:py-20 space-y-12 text-left w-full">
        {/* Title */}
        <div className="space-y-3 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Sustainability
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Circular Impact</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Every pickup is a step away from local landfills. We track every kilogram from doorstep to certified processing.
          </p>
        </div>

        {/* Aggregate numbers board */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div>
              <h3 className="font-bold text-base text-foreground">Cumulative Landfill Diversion Metrics</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Estimated from completed pickups · updates as pickups are completed</p>
            </div>
            <Leaf className="h-5 w-5 text-emerald-600 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {impact.breakdown.map((r) => (
              <div key={r.categoryId} className="rounded-xl border border-border/60 bg-muted/20 p-4 text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {IMPACT_LABELS[r.categoryId] ?? r.label}
                </span>
                <p className="text-lg font-bold text-foreground mt-1">{formatKg(r.weightKg)} kg</p>
                <p className="text-[9px] text-emerald-600 font-semibold mt-1">{impactNote(r.categoryId, r.weightKg)}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 flex items-center justify-between text-xs text-emerald-700 font-semibold">
            <span>Grand Total Diverted: {formatKg(impact.grandTotalKg)} kg</span>
            <span className="rounded bg-emerald-500 text-white px-2 py-0.5 text-[9px] uppercase tracking-wide">100% Recycled</span>
          </div>
        </div>

        {/* Responsible recycling process */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border/60">
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">How We Ensure Responsible Recycling</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Most household scrap in Noida is bought by unorganized traders, who often burn wire coverings or dump non-profitable plastic scraps in drains and empty plots.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We route all collections directly to CPCB-registered processors. Paper is turned back to pulp at local paper mills, metals are melted down for reuse, and electronic devices are handled by certified e-waste recyclers under safety standards.
            </p>
          </div>

          <div className="space-y-3 bg-muted/10 p-5 rounded-2xl border border-border/40">
            <h3 className="font-bold text-sm text-foreground">Our 4-Step Chain of Custody</h3>
            <ol className="space-y-3 text-xs text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-foreground">Doorstep Collection & Weighing:</strong> Digital IoT scale measurements are taken and logged under your booking record.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-foreground">Sorting & Segregation:</strong> Materials are aggregated and cleanly sorted by sub-grade at our operational hub.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-foreground">Certified Dispatch:</strong> Consolidated categories are dispatched directly to registered smelting and pulping mills.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</span>
                <div>
                  <strong className="text-foreground">Audit Trail:</strong> Invoices, weights, and recycling transaction records are stored inside our backend ERP ledger.
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* Compliance and RWA Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/60">
          <div className="rounded-2xl border border-border p-6 space-y-4">
            <h3 className="font-bold text-base text-foreground flex items-center gap-1.5">
              <Award className="h-5 w-5 text-primary" /> How We Handle Your Scrap
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Dry waste collected pre-segregated, in line with the Solid Waste Management Rules</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>E-waste handed only to authorised recyclers under the E-Waste (Management) Rules, 2022</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Your details are used only to run your pickup — see our Privacy Policy</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border p-6 bg-muted/40 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="font-bold text-base text-foreground flex items-center gap-1.5">
                <BarChart3 className="h-5 w-5 text-primary" /> Monthly Society Reports
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                RWAs and societies partnered with us receive a free monthly environmental dashboard showing total flat participation, recycling volumes, and CO₂ savings metrics.
              </p>
            </div>
            <Link to="/contact">
              <Button size="sm" className="rounded-xl w-full cursor-pointer">Request Society Onboarding</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
