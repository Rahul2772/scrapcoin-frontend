import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
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
  Truck,
  Building,
  FileText,
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
import { createBooking, fetchCircularImpact, type CircularImpact } from "@/lib/api";
import { NavAuth } from "./__root";
import { Header } from "@/components/Header";
import { isPincodeSupported, getPincodeLocation } from "@/lib/pincodes";
import * as Sentry from "@sentry/react";

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

const FALLBACK_IMPACT: CircularImpact = {
  grandTotalKg: 2135.5,
  breakdown: [
    { categoryId: "paper", label: "Paper & Cardboard", weightKg: 1140.0 },
    { categoryId: "plastics", label: "Plastics", weightKg: 380.0 },
    { categoryId: "metals", label: "Metals", weightKg: 486.0 },
    { categoryId: "e-waste", label: "E-Waste", weightKg: 92.0 },
    { categoryId: "others", label: "Others", weightKg: 45.0 }
  ]
};

function CountUp({ end, duration = 1200, decimals = 0 }: { end: number; duration?: number; decimals?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(progress * end);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <>{count.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>;
}

function Index() {
  const { session } = useAuth();
  const [date, setDate] = useState<Date>();
  const [materials, setMaterials] = useState<string[]>([]);
  const [pincodeInput, setPincodeInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [impact, setImpact] = useState<CircularImpact>(FALLBACK_IMPACT);
  const [bookingSuccessData, setBookingSuccessData] = useState<{
    fullName: string;
    phone: string;
    society: string;
    tower?: string;
    pickupDate: string;
    materials: string[];
  } | null>(null);

  const adminPhone = "917292016625";
  const bookingText = bookingSuccessData
    ? `Hello, I just scheduled a scrap pickup on Scrapco.in:\n\n` +
      `👤 *Name*: ${bookingSuccessData.fullName}\n` +
      `📅 *Preferred Date*: ${bookingSuccessData.pickupDate}\n` +
      `📍 *Address*: ${bookingSuccessData.tower ? `${bookingSuccessData.tower}, ` : ""}${bookingSuccessData.society}\n` +
      `📦 *Materials*: ${bookingSuccessData.materials.join(", ")}`
    : "";
  const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(bookingText)}`;


  useEffect(() => {
    fetchCircularImpact()
      .then(setImpact)
      .catch(() => setImpact(FALLBACK_IMPACT));
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

    const cleanPin = pincodeInput.trim();
    if (!cleanPin || cleanPin.length !== 6) {
      toast.error("Please enter a valid 6-digit Pincode to check pickup availability.");
      return;
    }

    if (!isPincodeSupported(cleanPin)) {
      toast.error(`Pickup is currently not available for pincode ${cleanPin}. Serviceable areas are Noida, Greater Noida, Noida Extension & Indirapuram.`);
      return;
    }

    if (materials.length === 0) {
      toast.error("Please select at least one material type.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: String(data.get("fullName")),
        phone: String(data.get("phone")),
        society: `${String(data.get("society"))} (PIN: ${cleanPin})`,
        tower: String(data.get("tower") || "") || undefined,
        pincode: cleanPin,
        pickupDate: format(date, "yyyy-MM-dd"),
        materials,
      };
      const result = await createBooking(
        payload,
        session?.access_token ?? undefined,
      );
      toast.success(result.message);
      setBookingSuccessData(payload);
      form.reset();
      setPincodeInput("");
      setDate(undefined);
      setMaterials([]);
    } catch (err) {
      if (typeof window !== "undefined") {
        Sentry.captureException(err);
      }
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not schedule pickup. Please try again or WhatsApp us."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Dynamic pricing calculation
  let minEst = 0;
  let maxEst = 0;
  if (materials.includes("Paper / Cardboard")) { minEst += 50; maxEst += 150; }
  if (materials.includes("Plastics")) { minEst += 30; maxEst += 100; }
  if (materials.includes("Metals")) { minEst += 100; maxEst += 450; }
  if (materials.includes("E-Waste")) { minEst += 100; maxEst += 900; }
  if (materials.includes("Others")) { minEst += 20; maxEst += 100; }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster richColors position="top-center" />

      {/* Nav */}
      <Header />

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
                <Button size="lg" className="rounded-full px-7 shadow-lg cursor-pointer">
                  Schedule a Pickup
                </Button>
              </a>
              <Link to="/rates">
                <Button size="lg" variant="outline" className="rounded-full px-6 cursor-pointer">
                  Check Scrap Rates
                </Button>
              </Link>
              <WhatsAppLink>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-emerald-500/40 px-6 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
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
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Scrap Saved from Landfill</p>
                  <p className="mt-1 text-2xl font-black text-foreground">
                    <CountUp end={impact.grandTotalKg} decimals={1} /> kg
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 flex items-center gap-1.5 border border-emerald-500/20">
                  <Leaf className="h-3 w-3" /> Saved from Landfills
                </span>
              </div>
 
              <p className="mt-4 text-xs text-muted-foreground">
                Total weight of recyclable scrap materials collected, traced, and diverted to certified recycling channels.
              </p>
 
              <div className="mt-6 grid grid-cols-2 gap-3">
                {impact.breakdown.map((r) => (
                  <div key={r.categoryId} className="rounded-xl border border-border/60 bg-background p-3.5 transition-all hover:border-primary/30">
                    <p className="text-xs text-muted-foreground font-medium">{r.label}</p>
                    <p className="mt-1 text-lg font-bold text-foreground">
                      <CountUp end={r.weightKg} decimals={0} /> kg
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Strip */}
      <section className="border-y border-border/50 bg-primary/5 py-4 w-full">
        <div className="mx-auto max-w-6xl px-4 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="text-lg">⚖️</span>
            <span>Digital Scales, Verified Weight</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="text-lg">💸</span>
            <span>Instant UPI Payment</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="text-lg">♻️</span>
            <span>Certified Recycling Partners</span>
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
              title: "Book Online",
              desc: "Fill in the booking form — takes under 2 minutes. Select your materials and preferred pickup date.",
            },
            {
              icon: Scale,
              title: "We Come to You",
              desc: "Our trained champion collector arrives at your society with a calibrated digital scale. You verify the weight.",
            },
            {
              icon: Smartphone,
              title: "Get Paid Instantly",
              desc: "Receive payment directly to your UPI account on the spot. No waiting, no follow-ups.",
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
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Choose Us</h2>
            <p className="mt-3 text-muted-foreground">
              Built around how modern apartment communities live and recycle.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div
              className="rounded-2xl border border-border/60 bg-card p-7 transition-all hover:shadow-md"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <Building className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-semibold">Apartment &amp; Society Pickup</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Serving residential apartments and societies across Noida, Greater Noida, and Indirapuram.
              </p>
            </div>
            
            <div
              className="rounded-2xl border border-border/60 bg-card p-7 transition-all hover:shadow-md"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <Truck className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-semibold">Arrives Within 24 Hours</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Book today, get your pickup scheduled. Our collectors are local to your area.
              </p>
            </div>

            <div
              className="rounded-2xl border border-border/60 bg-card p-7 transition-all hover:shadow-md"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-semibold">Digital Receipt Every Pickup</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Every pickup gets a digital record — material, weight, rate, and amount paid.
              </p>
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
            Get your recyclables collected and paid out dynamically.
          </p>
        </div>

        {bookingSuccessData ? (
          <div
            className="mt-10 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 sm:p-10 text-center animate-in fade-in zoom-in-95 duration-300"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-foreground">Pickup Scheduled!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your scrap pickup has been scheduled successfully.
            </p>

            <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left max-w-md mx-auto space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-semibold">{bookingSuccessData.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Preferred Date:</span>
                <span className="font-semibold">{bookingSuccessData.pickupDate}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-semibold text-right">
                  {bookingSuccessData.tower ? `${bookingSuccessData.tower}, ` : ""}{bookingSuccessData.society}
                </span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-muted-foreground">Materials:</span>
                <span className="font-semibold text-right">{bookingSuccessData.materials.join(", ")}</span>
              </div>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              A confirmation message has been queued to your number. For instant scheduling, please share the details with our admin directly.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full h-12 px-6 bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold cursor-pointer shadow-md text-sm transition-all w-full sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" />
                Notify Admin on WhatsApp
              </a>
              <Button
                onClick={() => setBookingSuccessData(null)}
                variant="outline"
                className="rounded-full h-12 px-8 cursor-pointer border-border hover:bg-accent text-sm w-full sm:w-auto"
              >
                Schedule Another
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="mt-10 rounded-3xl border border-border/60 bg-card p-6 sm:p-10"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <div className="mb-6 text-left">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary">
                ⚡ Quick booking — under 2 minutes. No account needed.
              </span>
            </div>
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="pincode">Pincode *</Label>
                  {(pincodeInput || "").length === 6 && (
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1",
                      isPincodeSupported(pincodeInput) ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"
                    )}>
                      {isPincodeSupported(pincodeInput) ? "✓ Serviceable" : "✕ Not Serviceable"}
                    </span>
                  )}
                </div>
                <Input
                  id="pincode"
                  name="pincode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="e.g. 201306"
                  value={pincodeInput || ""}
                  onChange={(e) => setPincodeInput((e.target?.value || "").replace(/\D/g, "").slice(0, 6))}
                  required
                  className={cn(
                    "rounded-xl transition-all",
                    (pincodeInput || "").length === 6 && !isPincodeSupported(pincodeInput) && "border-red-500 focus-visible:ring-red-500 bg-red-50/20",
                    (pincodeInput || "").length === 6 && isPincodeSupported(pincodeInput) && "border-emerald-500 focus-visible:ring-emerald-500 bg-emerald-50/20"
                  )}
                />
                {(pincodeInput || "").length === 6 && isPincodeSupported(pincodeInput) && (
                  <p className="text-xs text-emerald-600 font-medium">
                    📍 Area: {getPincodeLocation(pincodeInput) || "Serviceable Area"}
                  </p>
                )}
                {(pincodeInput || "").length === 6 && !isPincodeSupported(pincodeInput) && (
                  <p className="text-xs text-red-500 font-medium">
                    Pickup is currently only available in Noida, Greater Noida, Noida Extension & Indirapuram.
                  </p>
                )}
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

            {materials.length > 0 && (
              <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center text-xs animate-in fade-in duration-200 text-foreground">
                <p className="font-bold">
                  💰 Estimated payout: <span className="text-primary font-extrabold text-sm sm:text-base">₹{minEst} – ₹{maxEst}</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Based on current rates • Actual payout depends on exact weight measured at collection
                </p>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="mt-8 w-full rounded-full text-base shadow-lg cursor-pointer"
            >
              {submitting ? "Confirming..." : "Confirm Booking"}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              You'll receive a WhatsApp confirmation within 4 hours.
            </p>
          </form>
        )}
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted/30 py-16 sm:py-24 border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Testimonials
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">What our customers say</h2>
            <p className="mt-3 text-muted-foreground">
              Real reviews from real residents in Noida and Greater Noida.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 max-w-4xl mx-auto text-left">
            <div className="rounded-2xl border border-border/65 bg-card p-6 shadow-sm space-y-4 relative overflow-hidden">
              <div className="text-amber-500 flex gap-0.5 text-xs">⭐⭐⭐⭐⭐</div>
              <p className="text-sm text-muted-foreground leading-relaxed relative z-10 italic">
                &quot;Got ₹420 for boxes and old newspapers I was about to throw away. The whole thing took 15 minutes. Will definitely book again.&quot;
              </p>
              <div className="border-t border-border/40 pt-3 flex justify-between items-center text-xs">
                <span className="font-bold text-foreground">Priya S.</span>
                <span className="text-muted-foreground">Gaur City 2</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border/65 bg-card p-6 shadow-sm space-y-4 relative overflow-hidden">
              <div className="text-amber-500 flex gap-0.5 text-xs">⭐⭐⭐⭐⭐</div>
              <p className="text-sm text-muted-foreground leading-relaxed relative z-10 italic">
                &quot;I was skeptical about the digital scale but I could see the reading myself. Paid on the spot via Gpay. Legit service.&quot;
              </p>
              <div className="border-t border-border/40 pt-3 flex justify-between items-center text-xs">
                <span className="font-bold text-foreground">Rahul M.</span>
                <span className="text-muted-foreground">Greater Noida West</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Snippet Section */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:py-24 border-t border-border/60 text-left">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            FAQ
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Common Questions</h2>
          <p className="mt-3 text-muted-foreground">
            Quick answers to the questions we get asked most often.
          </p>
        </div>

        <div className="mt-12 space-y-3 max-w-2xl mx-auto">
          {[
            {
              q: "How is the weight calculated?",
              a: "We use calibrated digital scales at your doorstep. You can inspect the scale reading yourself during collection — there are no hidden rounding cuts or estimations.",
            },
            {
              q: "When and how do I get paid?",
              a: "On the spot, at the time of pickup, via UPI (PhonePe, GPay, Paytm, etc.). You receive the payout directly in your bank account before our collector leaves.",
            },
            {
              q: "What types of scrap do you accept?",
              a: "We collect paper, cardboard, plastics, metals (ferrous and non-ferrous), and electronic waste. Check our rates page for the complete list of accepted grades.",
            },
            {
              q: "Which areas do you serve?",
              a: "We currently cover Noida, Greater Noida, and Indirapuram. We are constantly expanding to new sectors and housing societies in NCR.",
            },
          ].map((faq, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <details className="group">
                <summary className="w-full px-5 py-4 flex items-center justify-between text-left font-semibold text-xs sm:text-sm text-foreground hover:bg-muted/10 cursor-pointer list-none">
                  <span>{faq.q}</span>
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform duration-200">▼</span>
                </summary>
                <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                  <div className="pt-2">{faq.a}</div>
                </div>
              </details>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/faq" className="text-xs font-semibold text-primary hover:underline">
            More questions? View all FAQs →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp Button */}
      <WhatsAppFAB />
    </div>
  );
}
