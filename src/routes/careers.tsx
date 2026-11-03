import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Mail, CheckCircle2, TrendingUp, Users } from "lucide-react";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/careers")({
  head: () =>
    pageHead({
      path: "/careers",
      title: "Careers — The Scrap Co.",
      description:
        "Join the team at The Scrap Co. Explore job applications and help us build waste-to-worth infrastructure.",
    }),
  component: CareersPage,
});

function CareersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-3xl px-6 py-12 md:py-20 space-y-10 text-left w-full">
        {/* Title */}
        <div className="space-y-3 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Join the Team
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Careers at The Scrap Co.</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            We're building the waste-to-worth infrastructure for urban India — and we are just getting started.
          </p>
        </div>

        {/* Culture & Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="border border-border/60 p-5 rounded-xl bg-card space-y-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-sm text-foreground">High Growth</h4>
            <p className="text-xs text-muted-foreground">Work at a fast-growing startup cleaning up residential apartment clusters in NCR.</p>
          </div>
          <div className="border border-border/60 p-5 rounded-xl bg-card space-y-2">
            <Users className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-sm text-foreground">Decisions That Matter</h4>
            <p className="text-xs text-muted-foreground">Small collaborative team where your code, designs, or operations decisions run live immediately.</p>
          </div>
          <div className="border border-border/60 p-5 rounded-xl bg-card space-y-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-sm text-foreground">Real Sustainability</h4>
            <p className="text-xs text-muted-foreground">Directly contribute to circular waste streams and measurable landfill diversions.</p>
          </div>
        </div>

        {/* Application details block */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-foreground">How to Apply</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            We are always looking for honest, reliable, and hardworking individuals to join our operations, field collection, and developer teams. 
          </p>
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-xs sm:text-sm text-foreground space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Mail className="h-4 w-4" />
              <span>Submit Your Application</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Email us at <strong>bookings.scrapco@gmail.com</strong> with the subject <strong>&quot;Application — [Your Name]&quot;</strong>.
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Please include: your name, contact phone number, residential area in Noida/NCR, a brief summary of your work history, and a short note about why you want to join us.
            </p>
          </div>
        </div>

        {/* Our Culture */}
        <div className="space-y-4 pt-6 border-t border-border/60">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Our Culture</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            We're a small, scrappy team. We value integrity above all else. Because we deal directly with doorstep logistics, weighing tools, and instant cash payouts, our reputation for honesty is what builds customer trust. 
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            We work hard, move fast, learn from operational challenges on the ground, and value direct feedback. If you're excited about building green infrastructure, we'd love to hear from you.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
