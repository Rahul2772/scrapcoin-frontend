import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  PackageIcon,
  CheckCircle2,
  Clock,
  Truck,
  Scale,
  BadgeCheck,
  XCircle,
  ChevronRight,
  RefreshCw,
  User,
  RotateCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { useAuth } from "@/context/AuthContext";
import { NavAuth } from "./__root";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";

export const Route = createFileRoute("/my-bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings — The Scrap Co." },
      { name: "description", content: "Track your ScrapCo pickup status in real time — from booking to payment." },
    ],
  }),
  component: MyBookingsPage,
});

type Booking = {
  id: string;
  fullName: string;
  phone: string;
  society: string;
  tower?: string;
  pickupDate: string;
  materials: string[];
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  createdAt: string;
  updatedAt?: string;
  championId?: string;
  championEmail?: string;
  actualWeights?: Record<string, number>;
  statusComments?: string | null;
};

// ─── Status stepper config ────────────────────────────────────────────────────
type StepKey = "scheduled" | "champion_assigned" | "en_route" | "weighing" | "completed";

const STEPS: { key: StepKey; label: string; icon: React.ElementType; desc: string }[] = [
  { key: "scheduled",        label: "Requested",        icon: Clock,        desc: "Your pickup request has been received." },
  { key: "champion_assigned",label: "Champion Assigned", icon: User,         desc: "A collector has been assigned to your pickup." },
  { key: "en_route",        label: "En Route",          icon: Truck,        desc: "Your collector is on the way." },
  { key: "weighing",        label: "Weighing",           icon: Scale,        desc: "Scrap is being weighed at your location." },
  { key: "completed",       label: "Paid ✓",             icon: BadgeCheck,   desc: "Payment has been sent to you. Thank you!" },
];

/** Map the backend 4-state to the visual 5-step stepper */
function toStepIndex(booking: Booking): number {
  if (booking.status === "cancelled") return -1;
  if (booking.status === "completed") return 4;
  if (booking.status === "in_progress") {
    // Once weighing is done actualWeights has entries → step 3, otherwise en_route → step 2
    const hasWeights = booking.actualWeights && Object.keys(booking.actualWeights).length > 0;
    return hasWeights ? 3 : 2;
  }
  // scheduled: if champion assigned → step 1, else step 0
  return booking.championId ? 1 : 0;
}

const STATUS_BADGE = {
  scheduled:   { label: "Scheduled",   className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800" },
  in_progress: { label: "In Progress", className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800" },
  completed:   { label: "Completed",   className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800" },
  cancelled:   { label: "Cancelled",   className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800" },
};

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

// ─── Sub-components ───────────────────────────────────────────────────────────

function BookingSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <div className="flex gap-2">
        {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8 flex-1 rounded-full" />)}
      </div>
    </div>
  );
}

/** 5-dot visual stepper */
function StatusStepper({ booking }: { booking: Booking }) {
  if (booking.status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
        <XCircle className="h-4 w-4 shrink-0" />
        This booking was cancelled.
        {booking.statusComments && (
          <span className="text-xs text-muted-foreground ml-1">— {booking.statusComments}</span>
        )}
      </div>
    );
  }

  const activeStep = toStepIndex(booking);

  return (
    <div className="w-full">
      {/* Step dots + connector line */}
      <div className="relative flex items-center justify-between">
        {/* Background connector */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-border z-0" />
        {/* Filled connector up to active step */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary z-0 transition-all duration-700"
          style={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((step, i) => {
          const done    = i < activeStep;
          const current = i === activeStep;
          const StepIcon = step.icon;
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                  done    && "bg-primary border-primary text-primary-foreground",
                  current && "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20",
                  !done && !current && "bg-card border-border text-muted-foreground",
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <StepIcon className={cn("h-3.5 w-3.5", current && "animate-pulse")} />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium text-center leading-tight max-w-[52px]",
                  (done || current) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Current step description */}
      {activeStep >= 0 && activeStep < STEPS.length && (
        <p className="mt-3 text-xs text-muted-foreground text-center">
          {STEPS[activeStep].desc}
        </p>
      )}
    </div>
  );
}

/** Champion assigned card */
function ChampionCard({ email }: { email: string }) {
  const initials = email.split("@")[0].slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
      <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
        {initials}
      </div>
      <div>
        <p className="text-xs font-semibold text-foreground">Champion Assigned</p>
        <p className="text-[11px] text-muted-foreground">{email.split("@")[0]} — ScrapCo Collector</p>
      </div>
      <div className="ml-auto flex items-center gap-1 text-[10px] font-medium text-emerald-600">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        Active
      </div>
    </div>
  );
}

/** Actual weights breakdown when completed */
function WeightBreakdown({ actualWeights }: { actualWeights: Record<string, number> }) {
  const entries = Object.entries(actualWeights).filter(([, w]) => w > 0);
  if (!entries.length) return null;
  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1.5">
      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Weighed Materials</p>
      {entries.map(([mat, weight]) => (
        <div key={mat} className="flex justify-between text-xs">
          <span className="text-muted-foreground">{mat}</span>
          <span className="font-semibold text-foreground">{weight} kg</span>
        </div>
      ))}
      <div className="border-t border-emerald-500/20 pt-1.5 flex justify-between text-xs font-bold text-foreground">
        <span>Total</span>
        <span>{entries.reduce((s, [,w]) => s + w, 0).toFixed(1)} kg</span>
      </div>
    </div>
  );
}

/** Full booking detail drawer (vaul-based) */
function BookingDetailDrawer({
  booking,
  open,
  onClose,
}: {
  booking: Booking;
  open: boolean;
  onClose: () => void;
}) {
  const badge = STATUS_BADGE[booking.status];
  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="max-h-[92dvh] pb-8">
        <DrawerHeader className="text-left px-6 pt-6 pb-2">
          <DrawerTitle className="flex items-center gap-3">
            <span>Pickup Details</span>
            <Badge variant="outline" className={cn("rounded-full text-xs font-medium shrink-0", badge.className)}>
              {badge.label}
            </Badge>
          </DrawerTitle>
          <DrawerDescription className="text-xs">
            Booked on {format(new Date(booking.createdAt), "d MMM yyyy, h:mm a")}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 overflow-y-auto space-y-5">
          {/* Stepper */}
          <StatusStepper booking={booking} />

          {/* Champion card (if assigned) */}
          {booking.championEmail && booking.status !== "completed" && booking.status !== "cancelled" && (
            <ChampionCard email={booking.championEmail} />
          )}

          {/* Location */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Location</p>
            <p className="text-sm font-medium">{booking.society}</p>
            {booking.tower && <p className="text-xs text-muted-foreground">{booking.tower}</p>}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Preferred Date</p>
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarIcon className="h-4 w-4 text-primary" />
              {format(new Date(booking.pickupDate), "EEEE, d MMM yyyy")}
            </div>
          </div>

          {/* Materials */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Materials</p>
            <div className="flex flex-wrap gap-1.5">
              {booking.materials.map((m) => (
                <span key={m} className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs">
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Weight breakdown when completed */}
          {booking.actualWeights && Object.keys(booking.actualWeights).length > 0 && (
            <WeightBreakdown actualWeights={booking.actualWeights} />
          )}

          {/* Status comments */}
          {booking.statusComments && (
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
              💬 {booking.statusComments}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ─── Booking card ─────────────────────────────────────────────────────────────

function BookingCard({ booking, onClick }: { booking: Booking; onClick: () => void }) {
  const badge = STATUS_BADGE[booking.status];
  const isActive = booking.status === "scheduled" || booking.status === "in_progress";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl border bg-card p-5 space-y-4 transition-all hover:shadow-md active:scale-[0.99] cursor-pointer",
        isActive ? "border-primary/30 shadow-sm shadow-primary/10" : "border-border/60"
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground text-sm">{booking.society}</p>
          {booking.tower && <p className="text-xs text-muted-foreground mt-0.5">{booking.tower}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isActive && (
            <span className="relative flex h-2 w-2 mt-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
          )}
          <Badge variant="outline" className={cn("rounded-full text-xs font-medium", badge.className)}>
            {badge.label}
          </Badge>
        </div>
      </div>

      {/* Compact stepper */}
      <StatusStepper booking={booking} />

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="h-3.5 w-3.5" />
          {format(new Date(booking.pickupDate), "d MMM yyyy")}
        </div>
        <span className="flex items-center gap-0.5 text-primary font-medium">
          Details <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function MyBookingsPage() {
  const { user, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [user, authLoading, navigate]);

  async function fetchBookings(silent = false) {
    if (!session?.access_token) return;
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookings/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data: Booking[] = await res.json();
      setBookings(data);
      // Keep drawer in sync if open
      if (selectedBooking) {
        const fresh = data.find(b => b.id === selectedBooking.id);
        if (fresh) setSelectedBooking(fresh);
      }
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, [session]);

  // Auto-refresh every 30s when there are active bookings
  useEffect(() => {
    const hasActive = bookings.some(b => b.status === "scheduled" || b.status === "in_progress");
    if (hasActive) {
      refreshTimer.current = setInterval(() => fetchBookings(true), 30_000);
    }
    return () => { if (refreshTimer.current) clearInterval(refreshTimer.current); };
  }, [bookings.map(b => b.status).join(",")]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }
  if (!user) return null;

  const activeBookings  = bookings.filter(b => b.status === "scheduled" || b.status === "in_progress");
  const pastBookings    = bookings.filter(b => b.status === "completed" || b.status === "cancelled");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/60 bg-card/80 backdrop-blur-md sticky top-0 z-40 px-4 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/"><BrandLogo size={44} /></Link>
            <h1 className="text-base font-semibold text-foreground">My Pickups</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchBookings(true)}
              disabled={refreshing}
              className="p-1.5 rounded-full hover:bg-muted transition-colors cursor-pointer"
              aria-label="Refresh"
            >
              <RotateCw className={cn("h-4 w-4 text-muted-foreground", refreshing && "animate-spin")} />
            </button>
            <NavAuth />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <BookingSkeleton />
            <BookingSkeleton />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-6 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchBookings()}>
              Try again
            </Button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-2xl border border-border/60 bg-card p-10 text-center space-y-4">
            <PackageIcon className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <div>
              <p className="font-semibold text-foreground">No pickups yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Book your first scrap pickup and track it here in real time.
              </p>
            </div>
            <Link to="/"><Button className="rounded-full mt-2">Book a pickup</Button></Link>
          </div>
        )}

        {/* Active bookings */}
        {!loading && activeBookings.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Active Pickups</h2>
              <span className="text-xs text-muted-foreground">· refreshes automatically</span>
            </div>
            {activeBookings.map(b => (
              <BookingCard key={b.id} booking={b} onClick={() => setSelectedBooking(b)} />
            ))}
          </section>
        )}

        {/* Past bookings */}
        {!loading && pastBookings.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Past Pickups</h2>
            {pastBookings.map(b => (
              <BookingCard key={b.id} booking={b} onClick={() => setSelectedBooking(b)} />
            ))}
          </section>
        )}
      </div>

      {/* Drawer */}
      {selectedBooking && (
        <BookingDetailDrawer
          booking={selectedBooking}
          open={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
