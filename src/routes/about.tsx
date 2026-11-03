import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShieldCheck, CalendarCheck, Scale, Award } from "lucide-react";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead({
      path: "/about",
      title: "About Us — The Scrap Co.",
      description:
        "Learn how The Scrap Co. is digitizing doorstep scrap collection with calibrated digital scales and payment at pickup.",
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-4xl px-6 py-12 md:py-20 space-y-12 text-left w-full">
        {/* Title */}
        <div className="space-y-3 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Our Story
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About The Scrap Co.</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            We are building a transparent, tech-enabled doorstep scrap collection system for modern urban societies.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">The Problem We Saw</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every apartment society generates kilos of recyclable waste every week — cardboard boxes, plastics, old electronics, and metals. Most of it ends up either in landfills or sold to informal collectors with no weight transparency, no fixed rates, and no trace of where the waste goes.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Households had no way to verify weights, confirm rates, or trust the downstream recycling chain. We built The Scrap Co. to solve this.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/20 p-6 space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Who We Are</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Based in Noida, The Scrap Co. is a tech-driven scrap collection service. We use calibrated digital scales, live market prices, and payment by UPI at pickup to make recycling **transparent, traceable, and trustworthy**.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every kilogram collected is logged and tracked. We help you make sure your recyclables actually get recycled.
            </p>
          </div>
        </div>

        {/* Mission and Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/60">
          <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-3">
            <h3 className="text-base font-bold text-foreground">Our Mission</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Turn household scrap into verified value — for residents, for apartment societies, and for the local environment.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-3">
            <h3 className="text-base font-bold text-foreground">Our Vision</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              India where no recyclable material goes to a landfill, where every society has a trusted recycling partner, and where recycling is a simple daily habit with instant, visible rewards.
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="space-y-4 pt-6 border-t border-border/60">
          <h2 className="text-xl font-bold tracking-tight text-foreground">How We are Different</h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 font-semibold text-foreground">
                  <th className="px-6 py-3.5">Traditional Kabadiwala</th>
                  <th className="px-6 py-3.5 bg-primary/5 text-primary">The Scrap Co.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-muted-foreground">
                <tr>
                  <td className="px-6 py-3.5">Arbitrary rates, often underquoted</td>
                  <td className="px-6 py-3.5 bg-primary/5 font-semibold text-foreground">Published live rates per kg</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5">Manual springs scales (uncalibrated)</td>
                  <td className="px-6 py-3.5 bg-primary/5 font-semibold text-foreground">Certified digital IoT scales (you verify the weight)</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5">Cash only, no invoice or transaction record</td>
                  <td className="px-6 py-3.5 bg-primary/5 font-semibold text-foreground">UPI payment at pickup + digital receipt</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5">No pickup scheduling (wait for local calls)</td>
                  <td className="px-6 py-3.5 bg-primary/5 font-semibold text-foreground">Book slots online with confirmed window</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Our Values */}
        <div className="space-y-6 pt-6 border-t border-border/60">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 border border-border/60 rounded-xl bg-card space-y-2">
              <Scale className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-sm text-foreground">Transparency</h4>
              <p className="text-xs text-muted-foreground">Every weight, rate, and transaction value is visible and auditable.</p>
            </div>
            <div className="p-5 border border-border/60 rounded-xl bg-card space-y-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-sm text-foreground">Reliability</h4>
              <p className="text-xs text-muted-foreground">We value your time. We show up within the confirmed operational slot.</p>
            </div>
            <div className="p-5 border border-border/60 rounded-xl bg-card space-y-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-sm text-foreground">Sustainability</h4>
              <p className="text-xs text-muted-foreground">Ensuring maximum diversion of metals, papers, and plastics from local landfills.</p>
            </div>
            <div className="p-5 border border-border/60 rounded-xl bg-card space-y-2">
              <Award className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-sm text-foreground">Community</h4>
              <p className="text-xs text-muted-foreground">Working in tandem with RWAs, building managers, and apartment societies.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
