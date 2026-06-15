import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, PackageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/my-bookings")({
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
};

const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  completed: { label: "Completed", className: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 border-red-200" },
};

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

function BookingSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-36" />
      <div className="flex gap-2 flex-wrap">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

function MyBookingsPage() {
  const { user, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!session?.access_token) return;

    async function fetchBookings() {
      try {
        const res = await fetch(`${API_BASE}/api/bookings/me`, {
          headers: {
            Authorization: `Bearer ${session!.access_token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data: Booking[] = await res.json();
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [session]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/60 bg-card px-4 py-5">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <Link to="/">
            <BrandLogo />
          </Link>
          <h1 className="text-lg font-semibold text-foreground">My Bookings</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-4">
        {/* Loading state */}
        {loading && (
          <>
            <BookingSkeleton />
            <BookingSkeleton />
            <BookingSkeleton />
          </>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-2xl border border-border/60 bg-card p-10 text-center space-y-4">
            <PackageIcon className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <div>
              <p className="font-medium text-foreground">No bookings yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Book your first scrap pickup and it'll appear here.
              </p>
            </div>
            <Link to="/">
              <Button className="rounded-full mt-2">Book a pickup</Button>
            </Link>
          </div>
        )}

        {/* Bookings list */}
        {!loading && !error && bookings.map((booking) => {
          const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.scheduled;
          return (
            <div
              key={booking.id}
              className="rounded-2xl border border-border/60 bg-card p-5 space-y-3 transition-shadow hover:shadow-md"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{booking.fullName}</p>
                  <p className="text-sm text-muted-foreground">{booking.phone}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 rounded-full text-xs font-medium ${status.className}`}
                >
                  {status.label}
                </Badge>
              </div>

              {/* Location */}
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{booking.society}</span>
                {booking.tower && <span> · {booking.tower}</span>}
              </div>

              {/* Date */}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>
                  {format(new Date(booking.pickupDate), "EEE, d MMM yyyy")}
                </span>
              </div>

              {/* Materials */}
              <div className="flex flex-wrap gap-1.5">
                {booking.materials.map((m) => (
                  <span
                    key={m}
                    className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
