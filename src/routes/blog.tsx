import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookOpen, Sparkles, HelpCircle, Recycle } from "lucide-react";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/blog")({
  head: () =>
    pageHead({
      path: "/blog",
      title: "Blog & Resources — The Scrap Co.",
      description:
        "Learn tips on recycling, sorting household scrap, metal rate trends, and environmental compliance at The Scrap Co. blog.",
    }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-3xl px-6 py-12 md:py-20 space-y-10 text-left w-full">
        {/* Title */}
        <div className="space-y-3 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Publications
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog & Resources</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Guides, insights, and market trends to help you optimize household recycling and stay compliant.
          </p>
        </div>

        {/* Coming soon board */}
        <div className="rounded-2xl border border-dashed border-border/85 bg-card p-10 text-center space-y-4">
          <BookOpen className="h-10 w-10 text-primary/50 mx-auto" />
          <h3 className="font-bold text-base text-foreground">Blog Articles Coming Soon</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            We are working on curated guides and updates. Soon you will find insights on pricing trends and ground operations here.
          </p>
        </div>

        {/* Sneak peek of topics */}
        <div className="space-y-4 pt-6 border-t border-border/60">
          <h2 className="text-lg font-bold text-foreground">Topics We'll Be Sharing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 border border-border/60 rounded-xl bg-card space-y-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-xs text-foreground">Max Payout Tips</h4>
              <p className="text-[11px] text-muted-foreground">How sorting and segregating your recyclables in advance gets you speedier pickups and precise weights.</p>
            </div>
            <div className="p-5 border border-border/60 rounded-xl bg-card space-y-1.5">
              <Recycle className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-xs text-foreground">E-Waste Demystified</h4>
              <p className="text-[11px] text-muted-foreground">Why old chargers and dead phones shouldn't mix with daily trash, and how certified downstream recycling processing works.</p>
            </div>
            <div className="p-5 border border-border/60 rounded-xl bg-card space-y-1.5">
              <HelpCircle className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-xs text-foreground">AOA Segregation Guides</h4>
              <p className="text-[11px] text-muted-foreground">Best practices for apartment association management to enforce source segregation rules cleanly.</p>
            </div>
            <div className="p-5 border border-border/60 rounded-xl bg-card space-y-1.5">
              <BookOpen className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-xs text-foreground">Market Payout Trends</h4>
              <p className="text-[11px] text-muted-foreground">A quarterly look at commodity market valuations for cardboard, copper, steel, and plastics in NCR.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
