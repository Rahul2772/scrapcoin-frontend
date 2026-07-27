import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { Trash2, Plus, MessageCircle, Globe, Shield, Save, UserCheck, Edit2 } from "lucide-react";

export const Route = createLazyFileRoute("/admin/bookings")({
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
  // CRM fields
  inquiryDate?: string | null;
  lastCommunicationDate?: string | null;
  statusComments?: string | null;
  source?: "website" | "whatsapp" | "admin";
};

const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  completed: { label: "Completed", className: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 border-red-200" },
};

const SOURCE_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  website: { label: "Website", icon: <Globe className="h-3 w-3" />, className: "bg-purple-100 text-purple-700 border-purple-200" },
  whatsapp: { label: "WhatsApp", icon: <MessageCircle className="h-3 w-3" />, className: "bg-green-100 text-green-700 border-green-200" },
  admin: { label: "Admin", icon: <Shield className="h-3 w-3" />, className: "bg-orange-100 text-orange-700 border-orange-200" },
};

const FILTERS = ["all", "scheduled", "in_progress", "completed", "cancelled"] as const;
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const DEFAULT_MATERIALS = ["Paper", "Plastic", "Metal", "Electronics", "Glass", "Cardboard", "Clothes", "Books", "Copper", "Iron", "Aluminium"];

type AdminBookingForm = {
  fullName: string;
  phone: string;
  society: string;
  tower: string;
  pickupDate: string;
  materials: string[];
  source: "website" | "whatsapp" | "admin";
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  inquiryDate: string;
  lastCommunicationDate: string;
  statusComments: string;
};

const emptyForm = (): AdminBookingForm => ({
  fullName: "",
  phone: "",
  society: "",
  tower: "",
  pickupDate: new Date().toISOString().slice(0, 10),
  materials: [],
  source: "whatsapp",
  status: "scheduled",
  inquiryDate: new Date().toISOString().slice(0, 10),
  lastCommunicationDate: new Date().toISOString().slice(0, 10),
  statusComments: "",
});

function AdminBookings() {
  const { user, profile, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = profile?.role === "admin";
  const isAdminOrChampion = profile?.role === "admin" || profile?.role === "champion";

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
  const [availableMaterials, setAvailableMaterials] = useState<string[]>(DEFAULT_MATERIALS);

  // CRM inline editing state
  const [crmEdit, setCrmEdit] = useState<{ inquiryDate: string; lastCommunicationDate: string; statusComments: string } | null>(null);
  const [savingCrm, setSavingCrm] = useState(false);

  // Create booking dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState<AdminBookingForm>(emptyForm());
  const [creating, setCreating] = useState(false);

  // Edit booking dialog
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState<AdminBookingForm>(emptyForm());
  const [editing, setEditing] = useState(false);

// Auth guard — wait for both auth AND profile to load
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

  // Fetch available scrap categories for materials selection
  useEffect(() => {
    async function fetchMaterials() {
      try {
        const res = await fetch(`${API_BASE}/api/scrap-categories`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAvailableMaterials(data.map((c: { name: string }) => c.name));
          }
        }
      } catch {
        // Fall back to defaults
      }
    }
    fetchMaterials();
  }, []);

  function toggleMaterial(mat: string, form: AdminBookingForm, setForm: (f: AdminBookingForm) => void) {
    setForm({
      ...form,
      materials: form.materials.includes(mat)
        ? form.materials.filter((m) => m !== mat)
        : [...form.materials, mat],
    });
  }

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
      if (status === "scheduled" || status === "completed") {
        toast.info("Customer automatically added/updated in ERP Customers", { duration: 4000 });
      }
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

  async function saveCrmFields() {
    if (!selected || !crmEdit) return;
    setSavingCrm(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${selected.id}/crm`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify({
          inquiryDate: crmEdit.inquiryDate || null,
          lastCommunicationDate: crmEdit.lastCommunicationDate || null,
          statusComments: crmEdit.statusComments || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save CRM fields");
      const updated: Booking = await res.json();
      setBookings((prev) => prev.map((b) => (b.id === selected.id ? updated : b)));
      setSelected(updated);
      setCrmEdit(null);
      toast.success("CRM details saved");
    } catch {
      toast.error("Failed to save CRM details");
    } finally {
      setSavingCrm(false);
    }
  }

  async function deleteBookingClick(id: string) {
    if (!isAdmin) return;
    const confirmed = window.confirm("Are you sure to permanently delete this booking");
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session!.access_token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to delete booking");
      }
      setBookings((prev) => prev.filter((b) => b.id !== id));
      if (selected?.id === id) {
        setSelected(null);
      }
      toast.success("Booking permanently deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete booking");
    }
  }

  function openEditDialog(booking: Booking) {
    setEditForm({
      fullName: booking.fullName,
      phone: booking.phone,
      society: booking.society,
      tower: booking.tower ?? "",
      pickupDate: booking.pickupDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      materials: booking.materials ?? [],
      source: booking.source ?? "whatsapp",
      status: booking.status,
      inquiryDate: booking.inquiryDate?.slice(0, 10) ?? "",
      lastCommunicationDate: booking.lastCommunicationDate?.slice(0, 10) ?? "",
      statusComments: booking.statusComments ?? "",
    });
    setShowEditDialog(true);
  }

  async function handleEditBooking() {
    if (!selected) return;
    if (!editForm.fullName.trim() || !editForm.phone.trim() || !editForm.society.trim()) {
      toast.error("Name, Phone, and Society are required");
      return;
    }
    if (editForm.materials.length === 0) {
      toast.error("Please select at least one material");
      return;
    }
    setEditing(true);
    try {
      const payload: Record<string, unknown> = {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        society: editForm.society.trim(),
        tower: editForm.tower.trim() || null,
        pickupDate: editForm.pickupDate,
        materials: editForm.materials,
        source: editForm.source,
      };

      const res = await fetch(`${API_BASE}/api/bookings/${selected.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error ?? "Failed to update booking");
      }

      const updated: Booking = await res.json();
      setBookings((prev) => prev.map((b) => (b.id === selected.id ? updated : b)));
      setSelected(updated);
      setShowEditDialog(false);
      toast.success("Booking updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update booking");
    } finally {
      setEditing(false);
    }
  }

  async function handleCreateBooking() {
    if (!createForm.fullName.trim() || !createForm.phone.trim() || !createForm.society.trim()) {
      toast.error("Name, Phone, and Society are required");
      return;
    }
    if (createForm.materials.length === 0) {
      toast.error("Please select at least one material");
      return;
    }
    setCreating(true);
    try {
      const payload: Record<string, unknown> = {
        fullName: createForm.fullName.trim(),
        phone: createForm.phone.trim(),
        society: createForm.society.trim(),
        tower: createForm.tower.trim() || undefined,
        pickupDate: createForm.pickupDate,
        materials: createForm.materials,
        source: createForm.source,
        status: createForm.status,
        inquiryDate: createForm.inquiryDate || null,
        lastCommunicationDate: createForm.lastCommunicationDate || null,
        statusComments: createForm.statusComments.trim() || null,
      };

      const res = await fetch(`${API_BASE}/api/bookings/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error ?? "Failed to create booking");
      }

      const result = await res.json();
      const newBooking: Booking = result.booking;
      setBookings((prev) => [newBooking, ...prev]);
      setShowCreateDialog(false);
      setCreateForm(emptyForm());
      toast.success(`Booking created for ${newBooking.fullName}`);

      if (createForm.status === "scheduled" || createForm.status === "completed") {
        toast.info("Customer automatically added to ERP Customers", { duration: 4000 });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking");
    } finally {
      setCreating(false);
    }
  }

  const filtered = bookings
    .filter((b) => filter === "all" || b.status === filter)
    .filter((b) => {
      const q = search.toLowerCase();
      return (
        b.fullName.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.society?.toLowerCase().includes(q)
      );
    });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
          {isAdminOrChampion && (
            <Button
              id="create-booking-btn"
              onClick={() => { setCreateForm(emptyForm()); setShowCreateDialog(true); }}
              className="gap-2 rounded-xl cursor-pointer"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add Booking
            </Button>
          )}
        </div>

        {/* Filters & search */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <Input
            placeholder="Search by name, phone or society..."
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
                    {["Name", "Phone", "Society", "Inquiry Date", "Pickup Date", "Source", "Champion", "Status"].map(
                      (h) => (
                        <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">
                          {h}
                        </th>
                      )
                    )}
                    {isAdmin && (
                      <th className="px-4 py-3 font-medium whitespace-nowrap text-right">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((b) => {
                    const s = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.scheduled;
                    const src = SOURCE_CONFIG[b.source ?? "website"] ?? SOURCE_CONFIG.website;
                    return (
                      <tr
                        key={b.id}
                        onClick={() => {
                          setSelected(b);
                          setCrmEdit(null);
                          setShowWeightForm(false);
                        }}
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
                          {b.inquiryDate
                            ? format(new Date(b.inquiryDate), "d MMM yyyy")
                            : <span className="text-muted-foreground/40 italic text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {format(new Date(b.pickupDate), "d MMM yyyy")}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${src.className}`}>
                            {src.icon}
                            {src.label}
                          </span>
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
                        {isAdmin && (
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteBookingClick(b.id)}
                              className="h-7 w-7 rounded-lg text-red-500 hover:text-red-650 hover:bg-red-50 cursor-pointer"
                              title="Delete Booking"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Create Booking Dialog ── */}
      <Dialog open={showCreateDialog} onOpenChange={(o) => { if (!o) setShowCreateDialog(false); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Booking
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Source */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source</Label>
              <div className="flex gap-2">
                {(["whatsapp", "admin", "website"] as const).map((src) => {
                  const cfg = SOURCE_CONFIG[src];
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, source: src })}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all cursor-pointer ${createForm.source === src ? cfg.className + " ring-2 ring-offset-1 ring-current" : "border-border text-muted-foreground hover:bg-muted"}`}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customer info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cb-fullName">Full Name *</Label>
                <Input
                  id="cb-fullName"
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cb-phone">Phone *</Label>
                <Input
                  id="cb-phone"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cb-society">Society / Area *</Label>
                <Input
                  id="cb-society"
                  value={createForm.society}
                  onChange={(e) => setCreateForm({ ...createForm, society: e.target.value })}
                  placeholder="e.g. Green Valley Society"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cb-tower">Tower / Block</Label>
                <Input
                  id="cb-tower"
                  value={createForm.tower}
                  onChange={(e) => setCreateForm({ ...createForm, tower: e.target.value })}
                  placeholder="e.g. A, B3, Tower 2"
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cb-inquiryDate">Inquiry Date</Label>
                <Input
                  id="cb-inquiryDate"
                  type="date"
                  value={createForm.inquiryDate}
                  onChange={(e) => setCreateForm({ ...createForm, inquiryDate: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cb-lastComm">Last Communication Date</Label>
                <Input
                  id="cb-lastComm"
                  type="date"
                  value={createForm.lastCommunicationDate}
                  onChange={(e) => setCreateForm({ ...createForm, lastCommunicationDate: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cb-pickupDate">Scheduled Pickup Date *</Label>
                <Input
                  id="cb-pickupDate"
                  type="date"
                  value={createForm.pickupDate}
                  onChange={(e) => setCreateForm({ ...createForm, pickupDate: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label>Initial Status</Label>
              <Select
                value={createForm.status}
                onValueChange={(v) => setCreateForm({ ...createForm, status: v as AdminBookingForm["status"] })}
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
              {(createForm.status === "scheduled" || createForm.status === "completed") && (
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <UserCheck className="h-3 w-3" />
                  Customer will be auto-added to ERP Customers
                </p>
              )}
            </div>

            {/* Materials */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Materials * {createForm.materials.length > 0 && `(${createForm.materials.length} selected)`}
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableMaterials.map((mat) => (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => toggleMaterial(mat, createForm, setCreateForm)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                      createForm.materials.includes(mat)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-1.5">
              <Label htmlFor="cb-comments">Status Comments / Notes</Label>
              <Textarea
                id="cb-comments"
                value={createForm.statusComments}
                onChange={(e) => setCreateForm({ ...createForm, statusComments: e.target.value })}
                placeholder="e.g. Customer wants pickup before 10 AM, called twice..."
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBooking}
              disabled={creating}
              className="rounded-xl cursor-pointer gap-2"
            >
              <Plus className="h-4 w-4" />
              {creating ? "Creating..." : "Create Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Booking detail drawer ── */}
      <Sheet
        open={!!selected}
        onOpenChange={(o) => {
          if (!o) {
            setSelected(null);
            setShowWeightForm(false);
            setCrmEdit(null);
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between gap-2 pr-2">
                  <SheetTitle className="flex items-center gap-2">
                    Booking Details
                    {selected.source && (
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${SOURCE_CONFIG[selected.source]?.className ?? ""}`}>
                        {SOURCE_CONFIG[selected.source]?.icon}
                        {SOURCE_CONFIG[selected.source]?.label}
                      </span>
                    )}
                  </SheetTitle>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 rounded-xl text-xs cursor-pointer"
                      onClick={() => openEditDialog(selected)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  )}
                </div>
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

                {/* ── CRM Tracking Section ── */}
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">CRM Tracking</p>
                    {!crmEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs rounded-lg cursor-pointer"
                        onClick={() => setCrmEdit({
                          inquiryDate: selected.inquiryDate ?? "",
                          lastCommunicationDate: selected.lastCommunicationDate ?? "",
                          statusComments: selected.statusComments ?? "",
                        })}
                      >
                        Edit
                      </Button>
                    )}
                  </div>

                  {crmEdit ? (
                    <div className="space-y-3 bg-muted/30 rounded-xl p-3 border border-border/40">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Inquiry Date</Label>
                          <Input
                            type="date"
                            value={crmEdit.inquiryDate}
                            onChange={(e) => setCrmEdit({ ...crmEdit, inquiryDate: e.target.value })}
                            className="rounded-lg h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Last Communication</Label>
                          <Input
                            type="date"
                            value={crmEdit.lastCommunicationDate}
                            onChange={(e) => setCrmEdit({ ...crmEdit, lastCommunicationDate: e.target.value })}
                            className="rounded-lg h-8 text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Status Comments / Notes</Label>
                        <Textarea
                          value={crmEdit.statusComments}
                          onChange={(e) => setCrmEdit({ ...crmEdit, statusComments: e.target.value })}
                          placeholder="Internal notes..."
                          className="rounded-lg resize-none text-xs"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-lg text-xs cursor-pointer"
                          onClick={() => setCrmEdit(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 rounded-lg text-xs cursor-pointer gap-1"
                          disabled={savingCrm}
                          onClick={saveCrmFields}
                        >
                          <Save className="h-3 w-3" />
                          {savingCrm ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 bg-muted/30 rounded-xl p-3 border border-border/40">
                      <div>
                        <p className="text-xs text-muted-foreground">Inquiry Date</p>
                        <p className="text-sm font-medium text-foreground">
                          {selected.inquiryDate
                            ? format(new Date(selected.inquiryDate), "d MMM yyyy")
                            : <span className="text-muted-foreground/50 italic text-xs">Not set</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Last Communication</p>
                        <p className="text-sm font-medium text-foreground">
                          {selected.lastCommunicationDate
                            ? format(new Date(selected.lastCommunicationDate), "d MMM yyyy")
                            : <span className="text-muted-foreground/50 italic text-xs">Not set</span>}
                        </p>
                      </div>
                      {selected.statusComments && (
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground">Comments</p>
                          <p className="text-sm text-foreground whitespace-pre-line">{selected.statusComments}</p>
                        </div>
                      )}
                    </div>
                  )}
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
                            toast.info("Customer automatically added/updated in ERP Customers", { duration: 4000 });
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

                {isAdmin && (
                  <div className="pt-4 border-t border-border flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBookingClick(selected.id)}
                      className="rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-605 cursor-pointer gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Booking
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      {/* ── Edit Booking Dialog ── */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Edit2 className="h-5 w-5 text-primary" />
              Edit Booking
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            {/* Core Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="eb-fullName">Full Name *</Label>
                <Input
                  id="eb-fullName"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="eb-phone">Phone *</Label>
                <Input
                  id="eb-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="eb-society">Society / Area *</Label>
                <Input
                  id="eb-society"
                  value={editForm.society}
                  onChange={(e) => setEditForm({ ...editForm, society: e.target.value })}
                  placeholder="e.g. Green Valley Society"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="eb-tower">Tower / Block</Label>
                <Input
                  id="eb-tower"
                  value={editForm.tower}
                  onChange={(e) => setEditForm({ ...editForm, tower: e.target.value })}
                  placeholder="e.g. A, B3, Tower 2"
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Source & Pickup Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Source</Label>
                <Select
                  value={editForm.source}
                  onValueChange={(v) => setEditForm({ ...editForm, source: v as AdminBookingForm["source"] })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="eb-pickupDate">Scheduled Pickup Date *</Label>
                <Input
                  id="eb-pickupDate"
                  type="date"
                  value={editForm.pickupDate}
                  onChange={(e) => setEditForm({ ...editForm, pickupDate: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Materials */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Materials * {editForm.materials.length > 0 && `(${editForm.materials.length} selected)`}
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableMaterials.map((mat) => (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => toggleMaterial(mat, editForm, setEditForm)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                      editForm.materials.includes(mat)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditBooking}
              disabled={editing}
              className="rounded-xl cursor-pointer gap-2"
            >
              <Save className="h-4 w-4" />
              {editing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
