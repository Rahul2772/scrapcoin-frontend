import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Building, Truck, Mail, CheckCircle2 } from "lucide-react";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/partner")({
  head: () =>
    pageHead({
      path: "/partner",
      title: "Partner with Us — The Scrap Co.",
      description:
        "Discover partnership options with The Scrap Co. for RWAs, apartment societies, and certified recycling companies.",
    }),
  component: PartnerPage,
});

function PartnerPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-4xl px-6 py-12 md:py-20 space-y-12 text-left w-full">
        {/* Title */}
        <div className="space-y-3 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Collaborations
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Partner with The Scrap Co.</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            We work with Resident Welfare Associations, society facility managers, housing corporations, and certified recycling processors.
          </p>
        </div>

        {/* Two main segments: RWA vs Recyclers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* RWA */}
          <div className="border border-border rounded-2xl p-6 bg-card space-y-4 flex flex-col justify-between shadow-sm">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Building className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-foreground">For Apartment Societies & RWAs</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Provide your residents with a reliable, transparent, and tech-enabled scrap recycling service. There is no cost to the society; residents are paid directly for their recyclables.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground font-medium pt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Free monthly landfill diversion reports for your notice boards</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Helps societies comply with Solid Waste Management Rules 2016</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Option to schedule periodic society-wide collection drives</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <Mail className="h-3.5 w-3.5" />
                <span>RWA Onboarding Request</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                Email us at <strong>bookings.scrapco@gmail.com</strong> with subject <strong>&quot;RWA Partnership — [Society Name]&quot;</strong>.
              </p>
              <p className="text-[10px] leading-relaxed">
                Please include: society name & sector, flat count, your role, and contact number.
              </p>
            </div>
          </div>

          {/* Recyclers */}
          <div className="border border-border rounded-2xl p-6 bg-card space-y-4 flex flex-col justify-between shadow-sm">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-foreground">For Recyclers & Processors</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                If you are a certified scrap recycler, pulping mill, or CPCB-registered electronic waste processor, partner with us to source clean, sorted materials directly from our logistics network.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground font-medium pt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Access sorted, aggregated clean paper, plastics, and metals</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Audit trail compliance records for e-waste recycling</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Consistent recurring volumes from domestic streams</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <Mail className="h-3.5 w-3.5" />
                <span>Supply tie-up enquiry</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                Email us at <strong>bookings.scrapco@gmail.com</strong> with subject <strong>&quot;Recycler Partnership&quot;</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Corporates section */}
        <div className="rounded-2xl bg-muted/30 border border-border/40 p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground">For Corporates & CSR Campaigns</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            If your organization has corporate social responsibility (CSR) targets related to packaging waste collection, plastic recycling, or structured e-waste recovery, we can help you configure campaigns. We provide white-label impact dashboards, host society collection drives, and deliver complete certified chain of custody paperwork.
          </p>
          <p className="text-xs text-muted-foreground">
            Contact us at <strong>bookings.scrapco@gmail.com</strong> with the subject <strong>&quot;CSR Partnership&quot;</strong>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
