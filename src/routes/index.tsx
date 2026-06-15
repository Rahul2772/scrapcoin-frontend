import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  CalendarCheck,
  Scale,
  Smartphone,
  Home,
  Recycle,
  ShieldCheck,
  Leaf,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/context/AuthContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { BrandLogo } from "@/components/brand-logo";
import { WhatsAppFAB, WhatsAppLink } from "@/components/whatsapp-button";
import { createBooking, fetchLivePickupDemo, type LivePickup } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Scrap Co. — Smart Scrap Pickup in Greater Noida West" },
      {
        name: "description",
        content:
          "Tech-enabled doorstep scrap collection for apartments in Greater Noida West. Transparent weighing, instant UPI payment, full traceability.",
      },
    ],
  }),
  component: Index,
});

const MATERIALS = ["Paper / Cardboard", "Plastics", "Metals", "E-Waste", "Others"] as const;

const FALLBACK_LIVE_PICKUP: LivePickup = {
  id: "fallback",
  location: "Tower B-204 • Sector 16C",
  status: "in_progress",
  items: [
    { label: "Cardboard", weightKg: 4.2, categoryId: "cardboard" },
    { label: "Plastics", weightKg: 1.8, categoryId: "plastics" },
    { label: "Metals", weightKg: 2.6, categoryId: "metals" },
    { label: "E-Waste", weightKg: 0.5, categoryId: "e-waste" },
  ],
  payoutAmount: 218,
  currency: "INR",
};

function Index() {
  const { session } = useAuth();
  const [date, setDate] = useState<Date>();
  const [materials, setMaterials] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [livePickup, setLivePickup] = useState<LivePickup>(FALLBACK_LIVE_PICKUP);

  useEffect(() => {
    fetchLivePickupDemo()
      .then(setLivePickup)
      .catch(() => setLivePickup(FALLBACK_LIVE_PICKUP));
  }, []);

  const toggleMaterial = (m: string) =>
    setMaterials((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (!data.get("fullName") || !data.get("phone") || !data.get("society") || !date) {
      toast.error("Please fill all required fields and pick a date.");
      return;
    }
    if (materials.length === 0) {
      toast.error("Please select at least one material type.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createBooking(
        {
          fullName: String(data.get("fullName")),
          phone: String(data.get("phone")),
          society: String(data.get("society")),
          tower: String(data.get("tower") || "") || undefined,
          pickupDate: format(date, "yyyy-MM-dd"),
          materials,
        },
        session?.access_token ?? undefined,
      );
      toast.success(result.message);
      form.reset();
      setDate(undefined);
      setMaterials([]);
    } catch {
      toast.error("Could not schedule pickup. Please try again or WhatsApp us.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster richColors position="top-center" />

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="#top" aria-label="The Scrap Co. home">
            <BrandLogo size={56} />
          </a>
          <a href="#booking" className="hidden sm:block">
            <Button size="sm" className="rounded-full">Schedule a Pickup</Button>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section
        id="top"
        className="relative overflow-hidden"
        style={{ background: "var(--gradient-soft)" }}
      >
        <div
          className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:pt-20 lg:grid lg:grid-cols-2 lg:gap-12 lg:pb-24">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Leaf className="h-3.5 w-3.5" /> Noida Area • Apartments & RWAs
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Hassle-free scrap pickup.{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-hero)" }}
              >
                Transparent. Instant. Tech-driven.
              </span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Smart scales, live weight readings, and instant UPI payment — right at your
              doorstep. Built for environmentally-conscious citizens who want
              recycling done the right way.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#booking">
                <Button size="lg" className="rounded-full px-7 shadow-lg">
                  Schedule a Pickup
                </Button>
              </a>
              <a href="#how">
                <Button size="lg" variant="outline" className="rounded-full px-6">
                  How it works
                </Button>
              </a>
              <WhatsAppLink>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-emerald-500/40 px-6 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp Us
                </Button>
              </WhatsAppLink>
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-sm text-muted-foreground">
              {["SWM 2026 compliant", "Live digital weighing", "Paid in seconds"].map((t) => (
                <span key={t} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> {t}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mt-12 lg:mt-0">
            <div
              className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8"
              style={{ boxShadow: "var(--shadow-elegant)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Live pickup</p>
                  <p className="mt-1 font-semibold">{livePickup.location}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  In progress
                </span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {livePickup.items.map((r) => (
                  <div key={r.categoryId} className="rounded-xl border border-border/60 bg-background p-3">
                    <p className="text-xs text-muted-foreground">{r.label}</p>
                    <p className="mt-1 text-lg font-semibold">{r.weightKg} kg</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between rounded-xl bg-accent p-4">
                <div>
                  <p className="text-xs text-accent-foreground/70">UPI payout</p>
                  <p className="text-2xl font-bold text-accent-foreground">
                    ₹ {livePickup.payoutAmount.toFixed(2)}
                  </p>
                </div>
                <Smartphone className="h-8 w-8 text-accent-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-3 text-muted-foreground">
            Three simple steps. Zero negotiation, zero guesswork.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: CalendarCheck,
              title: "Whatsapp Us",
              desc: "We will work out a slot that works for both of us.",
            },
            {
              icon: Scale,
              title: "Doorstep transparent Weighing",
              desc: "Calibrated scales — weigh every gram accurately.",
            },
            {
              icon: Smartphone,
              title: "Instant UPI Payment",
              desc: "Get paid on the spot, straight to your Bank A/c.",
            },
          ].map((s, i) => (
            <div
              key={s.title}
              className="group relative rounded-2xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-1"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-6 w-6" />
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="bg-muted/40 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our services</h2>
            <p className="mt-3 text-muted-foreground">
              Built around how apartment communities actually live.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div
              className="rounded-2xl border border-border/60 bg-card p-7"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Home className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-semibold">Doorstep Household Collection</h3>
              <p className="mt-2 text-muted-foreground">
                Schedule, weigh, get paid — without
                leaving your flat.
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                {["Slot-based pickup", "All recyclables accepted", "Digital receipt"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="rounded-2xl border border-dashed border-border/80 bg-background/60 p-7 text-muted-foreground"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary/10 text-secondary">
                <Recycle className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-semibold text-foreground">AOA Bulk Tie-ups</h3>
              <p className="mt-2">
                Scheduled society-wide drives with reporting dashboards for the RWA.
              </p>
              <p className="mt-5 text-xs uppercase tracking-wider text-primary">Coming soon</p>
            </div>
            <div className="rounded-2xl border border-dashed border-border/80 bg-background/60 p-7 text-muted-foreground">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary/10 text-secondary">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-semibold text-foreground">E-Waste Compliance</h3>
              <p className="mt-2">
                Certified channels for batteries, electronics and hazardous items.
              </p>
              <p className="mt-5 text-xs uppercase tracking-wider text-primary">Coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking form */}
      <section id="booking" className="mx-auto max-w-4xl px-4 py-16 sm:py-24">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <CalendarCheck className="h-3.5 w-3.5" /> Book your pickup
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Schedule a pickup
          </h2>
          <p className="mt-3 text-muted-foreground">
            We'll send a WhatsApp confirmation within minutes.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="mt-10 rounded-3xl border border-border/60 bg-card p-6 sm:p-10"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" placeholder="Sai Shankar" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                pattern="[0-9+ ]{10,15}"
                placeholder="+91 98765 12345"
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="society">Apartment society / Sector</Label>
              <Input
                id="society"
                name="society"
                placeholder="e.g. Gaur City , Sector 16C, Greater Noida West"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tower">Tower & flat number</Label>
              <Input id="tower" name="tower" placeholder="Tower B • Flat 1204" />
            </div>
            <div className="space-y-2">
              <Label>Preferred pickup date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-3 sm:col-span-2">
              <Label>Material estimate</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {MATERIALS.map((m) => {
                  const active = materials.includes(m);
                  return (
                    <label
                      key={m}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition-all",
                        active
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      <Checkbox
                        checked={active}
                        onCheckedChange={() => toggleMaterial(m)}
                      />
                      <span>{m}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="mt-8 w-full rounded-full text-base shadow-lg"
          >
            {submitting ? "Confirming..." : "Confirm Booking"}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            By confirming, you agree to our friendly pickup terms. No spam, ever.
          </p>
        </form>
      </section>

      {/* Tech advantage */}
      <section
        className="relative overflow-hidden py-16 sm:py-24"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2 lg:items-center">
          <div className="text-primary-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" /> The Tech Advantage
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              A digital-to-circular pipeline you can actually trust.
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Every kilo we collect is logged, traced, and routed to certified recyclers.
              We're built for the next generation of urban waste rules.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Scale,
                title: "Live digital weighing",
                desc: "IoT-connected scales stream weight to your booking — no disputes.",
              },
              {
                icon: Recycle,
                title: "End-to-end traceability",
                desc: "Track each material from your doorstep to its recycler.",
              },
              {
                icon: ShieldCheck,
                title: "SWM 2026 compliant",
                desc: "Aligned with India's Solid Waste Management 2026 framework.",
              },
              {
                icon: Leaf,
                title: "Verified circular impact",
                desc: "Monthly impact reports for residents and AOAs.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/15 bg-white/10 p-5 text-primary-foreground backdrop-blur"
              >
                <f.icon className="h-6 w-6" />
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-primary-foreground/80">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-background">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <BrandLogo size={40} showTagline />
            <p className="mt-4 text-sm text-muted-foreground">
              Sleek, transparent, tech-enabled scrap collection for modern urban lifestyle.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+91 72920 16625</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>bookings.scrapco@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Noida, India</span>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Service area</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Serving apartment clusters and RWAs in Noida, UP.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Terms of service</a></li>
              <li><a href="#" className="hover:text-foreground">Privacy policy</a></li>
            </ul>
            <div className="mt-4 flex gap-3">
              {[Instagram, Facebook, Twitter].map((Ic, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  aria-label="social"
                >
                  <Ic className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} The Scrap Co. All rights reserved.
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <WhatsAppFAB />
    </div>
  );
}
