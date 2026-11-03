import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Phone, Mail, MapPin, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageHead({
      path: "/contact",
      title: "Contact Us — The Scrap Co.",
      description:
        "Get in touch with The Scrap Co. Contact us via WhatsApp, email, or find our Noida service areas.",
    }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 mx-auto max-w-4xl px-6 py-12 md:py-20 space-y-12 text-left w-full">
        {/* Title */}
        <div className="space-y-3 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Help & Support
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact Us</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            We'd love to hear from you — whether you have questions, feedback, bulk pickup queries, or partnership proposals.
          </p>
        </div>

        {/* Contact info grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-3 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Phone & WhatsApp</h3>
            <p className="text-sm text-primary font-bold">+91 72920 16625</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0" /> Response: Within 2 hours (9 AM–7 PM)
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-3 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Email Address</h3>
            <p className="text-sm text-primary font-bold break-all">bookings.scrapco@gmail.com</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0" /> Response: Within 8 hours on weekdays
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-3 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Our Location</h3>
            <p className="text-sm text-muted-foreground">Noida / Greater Noida West, Uttar Pradesh, India</p>
            <p className="text-xs text-muted-foreground">Serving Noida, Greater Noida &amp; Indirapuram</p>
          </div>
        </div>

        {/* Section FAQ links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border/60">
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">How Can We Help You?</h2>
            <ul className="space-y-3.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <strong className="text-foreground">Schedule a Pickup:</strong> Use the booking form on our{" "}
                  <Link to="/" className="text-primary hover:underline font-semibold">
                    homepage
                  </Link>
                  .
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <strong className="text-foreground">Track Bookings:</strong> Log in and visit your{" "}
                  <Link to="/my-bookings" className="text-primary hover:underline font-semibold">
                    My Bookings
                  </Link>{" "}
                  dashboard.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <strong className="text-foreground">Cancel or Reschedule:</strong> WhatsApp us or modify your booking in the dashboard at least 2 hours before the window.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <strong className="text-foreground">Bulk / RWA Enquiry:</strong> Email us with your society name, approximate flats count, and preferred collection date.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <strong className="text-foreground">Weighment/Payment Issue:</strong> Send us your booking ID and weight slip on WhatsApp immediately after collection.
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-muted/40 p-6 flex flex-col justify-between space-y-4 border border-border/40">
            <div className="space-y-2">
              <h3 className="font-bold text-base text-foreground">Looking to partner with us?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If you are a Resident Welfare Association (RWA), society manager, corporate campus coordinator, or downstream certified recycler, we have custom partnership structures.
              </p>
            </div>
            <Link to="/partner">
              <Button className="rounded-xl w-full cursor-pointer">Explore Partnerships</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
