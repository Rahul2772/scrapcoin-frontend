import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/admin/bookings")({
  component: AdminBookings,
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
  updatedAt: string;
  actualWeights?: Record<string, number>;
  championId?: string;
  championEmail?: string;
};

const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  completed: { label: "Completed", className: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 border-red-200" },
};

const FILTERS = ["all", "scheduled", "in_progress", "completed", "cancelled"] as const;
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

function AdminBookings() {
  const { user, profile, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [updating, setUpdating] = useState(false);
  const [weightsForm, setWeightsForm] = useState<Record<string, string>>({});
  const [showWeightForm, setShowWeightForm] = useState(false);
  type Champion = { id: string; email: string; role: string };
  const [champions, setChampions] = useState<Champion[]>([]);

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

  useEffect(() => {
    if (!session?.access_token || profile?.role !== "admin") return;
    async function fetchChampions() {
      try {
        const res = await fetch(`${API_BASE}/api/admin/champions`, {
          headers: { Authorization: `Bearer ${session!.access_token}` },
        });
        if (res.ok) {
          setChampions(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch champions:", err);
      }
    }
    fetchChampions();
  }, [session, profile]);

  async function updateStatus(id: string, status: string) {
    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated: Booking = await res.json();
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      setSelected(updated);
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  async function updateChampion(bookingId: string, championId: string | null) {
    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify({ championId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to assign champion");
      }
      const updated: Booking = await res.json();
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
      setSelected(updated);
      toast.success("Champion assigned");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign champion");
    } finally {
      setUpdating(false);
    }
  }

  const filtered = bookings
    .filter((b) => filter === "all" || b.status === filter)
    .filter((b) => {
      const q = search.toLowerCase();
      return (
        b.fullName.toLowerCase().includes(q) || b.phone.includes(q)
      );
    });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-foreground">Bookings</h1>

        {/* Filters & search */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                className="rounded-full capitalize text-xs"
                onClick={() => setFilter(f)}
              >
                {f.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No bookings found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40">
                  <tr className="text-left text-muted-foreground">
                    {["Name", "Phone", "Society", "Pickup Date", "Materials", "Champion", "Status"].map(
                      (h) => (
                        <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((b) => {
                    const s = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.scheduled;
                    return (
                      <tr
                        key={b.id}
                        onClick={() => setSelected(b)}
                        className="cursor-pointer hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                          {b.fullName}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {b.phone}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {b.society}
                          {b.tower ? ` · ${b.tower}` : ""}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {format(new Date(b.pickupDate), "d MMM yyyy")}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">
                          {b.materials.join(", ")}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap max-w-[150px] truncate">
                          {b.championEmail ?? (
                            <span className="text-muted-foreground/50 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
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

      {/* Booking detail drawer */}
      <Sheet
        open={!!selected}
        onOpenChange={(o) => {
          if (!o) {
            setSelected(null);
            setShowWeightForm(false);
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>Booking Details</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium text-foreground">{selected.fullName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{selected.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Society</p>
                    <p className="font-medium text-foreground">
                      {selected.society}
                      {selected.tower ? ` · ${selected.tower}` : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pickup Date</p>
                    <p className="font-medium text-foreground">
                      {format(new Date(selected.pickupDate), "EEE, d MMM yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Booked On</p>
                    <p className="font-medium text-foreground">
                      {format(new Date(selected.createdAt), "d MMM yyyy")}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Materials</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selected.materials.map((m) => (
                        <span
                          key={m}
                          className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {!showWeightForm && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-muted-foreground mb-2">Update Status</p>
                    <Select
                      value={selected.status}
                      onValueChange={(val) => {
                        if (val === "completed") {
                          const initial: Record<string, string> = {};
                          selected.materials.forEach((m) => {
                            initial[m] = "";
                          });
                          setWeightsForm(initial);
                          setShowWeightForm(true);
                        } else {
                          updateStatus(selected.id, val);
                        }
                      }}
                      disabled={updating || (profile?.role === "champion" && selected.status === "completed")}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {!showWeightForm && (
                  <>
                    {profile?.role === "admin" ? (
                      <div className="pt-4 border-t border-border">
                        <p className="text-muted-foreground mb-2">Assign Champion</p>
                        <Select
                          value={selected.championId ?? "unassigned"}
                          onValueChange={(val) => {
                            updateChampion(selected.id, val === "unassigned" ? null : val);
                          }}
                          disabled={updating}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select Champion" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {champions.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-border">
                        <p className="text-muted-foreground">Assigned Champion</p>
                        <p className="font-medium text-foreground">
                          {selected.championEmail ?? "Unassigned"}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {showWeightForm && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <p className="font-semibold text-foreground text-xs uppercase tracking-wider">Record Actual Weights (kg)</p>
                    <div className="space-y-3">
                      {selected.materials.map((m) => (
                        <div key={m} className="space-y-1">
                          <Label htmlFor={`weight-${m}`} className="text-xs text-muted-foreground">{m}</Label>
                          <Input
                            id={`weight-${m}`}
                            type="number"
                            step="any"
                            placeholder="0.0"
                            value={weightsForm[m] ?? ""}
                            onChange={(e) =>
                              setWeightsForm((prev) => ({ ...prev, [m]: e.target.value }))
                            }
                            className="rounded-xl"
                            required
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full rounded-xl cursor-pointer"
                        onClick={() => setShowWeightForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="w-full rounded-xl cursor-pointer"
                        disabled={updating}
                        onClick={async () => {
                          const weightsPayload: Record<string, number> = {};
                          let isValid = true;
                          selected.materials.forEach((m) => {
                            const val = Number(weightsForm[m]);
                            if (isNaN(val) || val <= 0) {
                              isValid = false;
                            }
                            weightsPayload[m] = val;
                          });
                          if (!isValid) {
                            toast.error("Please enter a valid positive number for all weights.");
                            return;
                          }

                          setUpdating(true);
                          try {
                            const res = await fetch(`${API_BASE}/api/bookings/${selected.id}`, {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${session!.access_token}`,
                              },
                              body: JSON.stringify({
                                status: "completed",
                                actualWeights: weightsPayload,
                              }),
                            });
                            if (!res.ok) throw new Error("Failed");
                            const updated: Booking = await res.json();
                            setBookings((prev) =>
                              prev.map((b) => (b.id === selected.id ? updated : b))
                            );
                            setSelected(updated);
                            setShowWeightForm(false);
                            toast.success("Order completed with weights!");
                          } catch {
                            toast.error("Failed to complete order");
                          } finally {
                            setUpdating(false);
                          }
                        }}
                      >
                        {updating ? "Completing..." : "Complete Pickup"}
                      </Button>
                    </div>
                  </div>
                )}

                {selected.status === "completed" && selected.actualWeights && Object.keys(selected.actualWeights).length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-muted-foreground mb-2">Recorded Weights</p>
                    <div className="grid grid-cols-2 gap-2 bg-muted/40 rounded-xl p-3 border border-border/40">
                      {Object.entries(selected.actualWeights).map(([mat, weight]) => (
                        <div key={mat} className="text-xs">
                          <span className="text-muted-foreground">{mat}:</span>{" "}
                          <span className="font-semibold text-foreground">{weight} kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
