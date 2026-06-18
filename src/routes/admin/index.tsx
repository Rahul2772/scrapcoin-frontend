import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type Booking = {
  id: string;
  fullName: string;
  society: string;
  pickupDate: string;
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

function AdminDashboard() {
  const { user, profile, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

// FIXED — waits for both auth AND profile to load
useEffect(() => {
  if (authLoading) return;
  if (!user) { navigate({ to: "/" }); return; }
  if (profile && profile.role !== "admin" && profile.role !== "champion") { navigate({ to: "/" }); return; }
}, [user, profile, authLoading, navigate]);

  useEffect(() => {
    if (!session?.access_token) return;
    async function fetchBookings() {
      try {
        const res = await fetch(`${API_BASE}/api/bookings`, {
          headers: { Authorization: `Bearer ${session!.access_token}` },
        });
        if (!res.ok) throw new Error("Failed");
        setBookings(await res.json());
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [session]);

  const statusCounts = [
    "scheduled",
    "in_progress",
    "completed",
    "cancelled",
  ].map((s) => ({
    status: s.replace("_", " "),
    count: bookings.filter((b) => b.status === s).length,
  }));

  const recent = bookings.slice(0, 5);

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <p className="text-sm text-muted-foreground">Total Bookings</p>
            <p className="mt-1 text-3xl font-bold text-foreground">
              {bookings.length}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <p className="text-sm text-muted-foreground">Scheduled</p>
            <p className="mt-1 text-3xl font-bold text-blue-600">
              {bookings.filter((b) => b.status === "scheduled").length}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="mt-1 text-3xl font-bold text-green-600">
              {bookings.filter((b) => b.status === "completed").length}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Bookings by Status
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusCounts} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent bookings */}
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Recent Bookings
          </h2>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No bookings yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    {["Name", "Society", "Pickup Date", "Status"].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recent.map((b) => {
                    const s = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.scheduled;
                    return (
                      <tr key={b.id}>
                        <td className="py-3 pr-4 font-medium text-foreground whitespace-nowrap">
                          {b.fullName}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {b.society}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                          {format(new Date(b.pickupDate), "d MMM yyyy")}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant="outline"
                            className={`rounded-full text-xs ${s.className}`}
                          >
                            {s.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
