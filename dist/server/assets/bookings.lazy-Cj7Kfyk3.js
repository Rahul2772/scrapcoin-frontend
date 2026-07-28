import { r as reactExports, L as jsxRuntimeExports, af as createLazyFileRoute, ag as useNavigate, aD as Plus, ah as format, aE as Trash2, aF as UserCheck, aG as Pen, aH as Save, aI as Shield, aJ as MessageCircle, aK as Globe, ai as toast } from "./vendor-D_Usrqei.js";
import { A as AdminLayout, S as Sheet, a as SheetContent, b as SheetHeader, c as SheetTitle } from "./AdminLayout-C04oNr74.js";
import { B as Badge } from "./badge-BF41vIxW.js";
import { c as cn, u as useAuth, B as Button } from "./router-Bj6HzPyA.js";
import { I as Input } from "./input-B46-WYs4.js";
import { L as Label } from "./label-BYMti0SU.js";
import { S as Skeleton } from "./skeleton-Bi4Etyvs.js";
import { D as Dialog, b as DialogContent, c as DialogHeader, d as DialogTitle, e as DialogFooter } from "./dialog-DKRq5zBk.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-ZI4Kaozi.js";
import { i as isPincodeSupported, g as getPincodeLocation } from "./pincodes-DGcWwat0.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./brand-logo-DsYSfcsW.js";
import "./supabase-BkcVLFJa.js";
const Textarea = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
const Route = createLazyFileRoute("/admin/bookings")({
  component: AdminBookings
});
const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  completed: { label: "Completed", className: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 border-red-200" }
};
const SOURCE_CONFIG = {
  website: {
    label: "Website",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-3 w-3" }),
    className: "bg-purple-100 text-purple-700 border-purple-200"
  },
  whatsapp: {
    label: "WhatsApp",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3 w-3" }),
    className: "bg-green-100 text-green-700 border-green-200"
  },
  admin: {
    label: "Admin",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3 w-3" }),
    className: "bg-orange-100 text-orange-700 border-orange-200"
  }
};
const FILTERS = ["all", "scheduled", "in_progress", "completed", "cancelled"];
const API_BASE = "http://localhost:4000";
const DEFAULT_MATERIALS = ["Paper", "Plastic", "Metal", "Electronics", "Glass", "Cardboard", "Clothes", "Books", "Copper", "Iron", "Aluminium"];
const emptyForm = () => ({
  fullName: "",
  phone: "",
  society: "",
  tower: "",
  pincode: "",
  pickupDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  materials: [],
  source: "whatsapp",
  status: "scheduled",
  inquiryDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  lastCommunicationDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  statusComments: ""
});
function AdminBookings() {
  const { user, profile, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = profile?.role === "admin";
  const isAdminOrChampion = profile?.role === "admin" || profile?.role === "champion";
  const [bookings, setBookings] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [filter, setFilter] = reactExports.useState("all");
  const [search, setSearch] = reactExports.useState("");
  const [selected, setSelected] = reactExports.useState(null);
  const [updating, setUpdating] = reactExports.useState(false);
  const [weightsForm, setWeightsForm] = reactExports.useState({});
  const [showWeightForm, setShowWeightForm] = reactExports.useState(false);
  const [champions, setChampions] = reactExports.useState([]);
  const [availableMaterials, setAvailableMaterials] = reactExports.useState(DEFAULT_MATERIALS);
  const [crmEdit, setCrmEdit] = reactExports.useState(null);
  const [savingCrm, setSavingCrm] = reactExports.useState(false);
  const [showCreateDialog, setShowCreateDialog] = reactExports.useState(false);
  const [createForm, setCreateForm] = reactExports.useState(emptyForm());
  const [creating, setCreating] = reactExports.useState(false);
  const [showEditDialog, setShowEditDialog] = reactExports.useState(false);
  const [editForm, setEditForm] = reactExports.useState(emptyForm());
  const [editing, setEditing] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/" });
      return;
    }
    if (profile && profile.role !== "admin" && profile.role !== "champion") {
      navigate({ to: "/" });
      return;
    }
  }, [user, profile, authLoading, navigate]);
  reactExports.useEffect(() => {
    if (!session?.access_token) return;
    async function fetchBookings() {
      try {
        const res = await fetch(`${API_BASE}/api/bookings`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        if (!res.ok) throw new Error("Failed");
        setBookings(await res.json());
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [session]);
  reactExports.useEffect(() => {
    if (!session?.access_token || profile?.role !== "admin") return;
    async function fetchChampions() {
      try {
        const res = await fetch(`${API_BASE}/api/admin/champions`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
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
  reactExports.useEffect(() => {
    async function fetchMaterials() {
      try {
        const res = await fetch(`${API_BASE}/api/scrap-categories`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAvailableMaterials(data.map((c) => c.name));
          }
        }
      } catch {
      }
    }
    fetchMaterials();
  }, []);
  function toggleMaterial(mat, form, setForm) {
    setForm({
      ...form,
      materials: form.materials.includes(mat) ? form.materials.filter((m) => m !== mat) : [...form.materials, mat]
    });
  }
  const [statusSelectValue, setStatusSelectValue] = reactExports.useState("");
  const [statusCommentInput, setStatusCommentInput] = reactExports.useState("");
  async function updateStatus(id, status, statusComments) {
    setUpdating(true);
    try {
      const payload = { status };
      if (statusComments !== void 0) {
        payload.statusComments = statusComments;
      }
      const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setBookings((prev) => prev.map((b) => b.id === id ? updated : b));
      setSelected(updated);
      setStatusSelectValue(updated.status);
      setStatusCommentInput(updated.statusComments || "");
      toast.success("Status updated");
      if (status === "scheduled" || status === "completed") {
        toast.info("Customer automatically added/updated in ERP Customers", { duration: 4e3 });
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  }
  async function updateChampion(bookingId, championId) {
    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ championId })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to assign champion");
      }
      const updated = await res.json();
      setBookings((prev) => prev.map((b) => b.id === bookingId ? updated : b));
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
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          inquiryDate: crmEdit.inquiryDate || null,
          lastCommunicationDate: crmEdit.lastCommunicationDate || null,
          statusComments: crmEdit.statusComments || null
        })
      });
      if (!res.ok) throw new Error("Failed to save CRM fields");
      const updated = await res.json();
      setBookings((prev) => prev.map((b) => b.id === selected.id ? updated : b));
      setSelected(updated);
      setCrmEdit(null);
      toast.success("CRM details saved");
    } catch {
      toast.error("Failed to save CRM details");
    } finally {
      setSavingCrm(false);
    }
  }
  async function deleteBookingClick(id) {
    if (!isAdmin) return;
    const confirmed = window.confirm("Are you sure to permanently delete this booking");
    if (!confirmed) return;
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
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
    } catch (err) {
      toast.error(err.message || "Failed to delete booking");
    }
  }
  function openEditDialog(booking) {
    setEditForm({
      fullName: booking.fullName,
      phone: booking.phone,
      society: booking.society,
      tower: booking.tower ?? "",
      pincode: booking.pincode ?? "",
      pickupDate: booking.pickupDate?.slice(0, 10) ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      materials: booking.materials ?? [],
      source: booking.source ?? "whatsapp",
      status: booking.status,
      inquiryDate: booking.inquiryDate?.slice(0, 10) ?? "",
      lastCommunicationDate: booking.lastCommunicationDate?.slice(0, 10) ?? "",
      statusComments: booking.statusComments ?? ""
    });
    setShowEditDialog(true);
  }
  async function handleEditBooking() {
    if (!selected) return;
    if (!editForm.fullName.trim() || !editForm.phone.trim() || !editForm.society.trim()) {
      toast.error("Name, Phone, and Society are required");
      return;
    }
    if (editForm.pincode.trim() && !isPincodeSupported(editForm.pincode.trim())) {
      toast.error(`Pincode ${editForm.pincode.trim()} is not in supported service area.`);
      return;
    }
    if (editForm.materials.length === 0) {
      toast.error("Please select at least one material");
      return;
    }
    setEditing(true);
    try {
      const cleanPin = editForm.pincode.trim();
      const payload = {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        society: editForm.society.trim(),
        tower: editForm.tower.trim() || null,
        pincode: cleanPin || null,
        pickupDate: editForm.pickupDate,
        materials: editForm.materials,
        source: editForm.source
      };
      const res = await fetch(`${API_BASE}/api/bookings/${selected.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error ?? "Failed to update booking");
      }
      const updated = await res.json();
      setBookings((prev) => prev.map((b) => b.id === selected.id ? updated : b));
      setSelected(updated);
      setShowEditDialog(false);
      toast.success("Booking updated successfully");
    } catch (err) {
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
    if (createForm.pincode.trim() && !isPincodeSupported(createForm.pincode.trim())) {
      toast.error(`Pickup is currently not available for pincode ${createForm.pincode.trim()}. Supported areas: Noida, Greater Noida, Noida Extension & Indirapuram.`);
      return;
    }
    if (createForm.materials.length === 0) {
      toast.error("Please select at least one material");
      return;
    }
    setCreating(true);
    try {
      const cleanPin = createForm.pincode.trim();
      const payload = {
        fullName: createForm.fullName.trim(),
        phone: createForm.phone.trim(),
        society: cleanPin && !createForm.society.includes(cleanPin) ? `${createForm.society.trim()} (PIN: ${cleanPin})` : createForm.society.trim(),
        tower: createForm.tower.trim() || void 0,
        pincode: cleanPin || void 0,
        pickupDate: createForm.pickupDate,
        materials: createForm.materials,
        source: createForm.source,
        status: createForm.status,
        inquiryDate: createForm.inquiryDate || null,
        lastCommunicationDate: createForm.lastCommunicationDate || null,
        statusComments: createForm.statusComments.trim() || null
      };
      const res = await fetch(`${API_BASE}/api/bookings/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error ?? "Failed to create booking");
      }
      const result = await res.json();
      const newBooking = result.booking;
      setBookings((prev) => [newBooking, ...prev]);
      setShowCreateDialog(false);
      setCreateForm(emptyForm());
      toast.success(`Booking created for ${newBooking.fullName}`);
      if (createForm.status === "scheduled" || createForm.status === "completed") {
        toast.info("Customer automatically added to ERP Customers", { duration: 4e3 });
      }
    } catch (err) {
      toast.error(err.message || "Failed to create booking");
    } finally {
      setCreating(false);
    }
  }
  const filtered = bookings.filter((b) => filter === "all" || b.status === filter).filter((b) => {
    const q = search.toLowerCase();
    return b.fullName.toLowerCase().includes(q) || b.phone.includes(q) || b.society?.toLowerCase().includes(q);
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Bookings" }),
        isAdminOrChampion && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            id: "create-booking-btn",
            onClick: () => {
              setCreateForm(emptyForm());
              setShowCreateDialog(true);
            },
            className: "gap-2 rounded-xl cursor-pointer",
            size: "sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
              "Add Booking"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search by name, phone or society...",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            className: "max-w-xs"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: FILTERS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            variant: filter === f ? "default" : "outline",
            className: "rounded-full capitalize text-xs",
            onClick: () => setFilter(f),
            children: f.replace("_", " ")
          },
          f
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border/60 bg-card overflow-hidden", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-5 space-y-3", children: [1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }, i)) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-10 text-center text-sm text-muted-foreground", children: "No bookings found." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "border-b border-border bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left text-muted-foreground", children: [
          ["Name", "Phone", "Society", "Inquiry Date", "Pickup Date", "Source", "Champion", "Status"].map(
            (h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium whitespace-nowrap", children: h }, h)
          ),
          isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-medium whitespace-nowrap text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: filtered.map((b) => {
          const s = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.scheduled;
          const src = SOURCE_CONFIG[b.source ?? "website"] ?? SOURCE_CONFIG.website;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "tr",
            {
              onClick: () => {
                setSelected(b);
                setCrmEdit(null);
                setStatusSelectValue(b.status);
                setStatusCommentInput(b.statusComments || "");
              },
              className: "cursor-pointer hover:bg-muted/30 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium text-foreground whitespace-nowrap", children: b.fullName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground whitespace-nowrap", children: b.phone }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-muted-foreground", children: [
                  b.society,
                  b.tower ? ` · ${b.tower}` : ""
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground whitespace-nowrap", children: b.inquiryDate ? format(new Date(b.inquiryDate), "d MMM yyyy") : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/40 italic text-xs", children: "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground whitespace-nowrap", children: format(new Date(b.pickupDate), "d MMM yyyy") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${src.className}`, children: [
                  src.icon,
                  src.label
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground whitespace-nowrap max-w-[150px] truncate", children: b.championEmail ?? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/50 italic", children: "Unassigned" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Badge,
                  {
                    variant: "outline",
                    className: `rounded-full text-xs ${s.className}`,
                    children: s.label
                  }
                ) }),
                isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    onClick: () => deleteBookingClick(b.id),
                    className: "h-7 w-7 rounded-lg text-red-500 hover:text-red-650 hover:bg-red-50 cursor-pointer",
                    title: "Delete Booking",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                  }
                ) })
              ]
            },
            b.id
          );
        }) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showCreateDialog, onOpenChange: (o) => {
      if (!o) setShowCreateDialog(false);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-5 w-5" }),
        "Add New Booking"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: ["whatsapp", "admin", "website"].map((src) => {
            const cfg = SOURCE_CONFIG[src];
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setCreateForm({ ...createForm, source: src }),
                className: `flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all cursor-pointer ${createForm.source === src ? cfg.className + " ring-2 ring-offset-1 ring-current" : "border-border text-muted-foreground hover:bg-muted"}`,
                children: [
                  cfg.icon,
                  cfg.label
                ]
              },
              src
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cb-fullName", children: "Full Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cb-fullName",
                value: createForm.fullName,
                onChange: (e) => setCreateForm({ ...createForm, fullName: e.target.value }),
                placeholder: "e.g. Rahul Sharma",
                className: "rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cb-phone", children: "Phone *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cb-phone",
                value: createForm.phone,
                onChange: (e) => setCreateForm({ ...createForm, phone: e.target.value }),
                placeholder: "+91 9876543210",
                className: "rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cb-society", children: "Society / Area *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cb-society",
                value: createForm.society,
                onChange: (e) => setCreateForm({ ...createForm, society: e.target.value }),
                placeholder: "e.g. Green Valley Society",
                className: "rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cb-tower", children: "Tower / Block" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cb-tower",
                value: createForm.tower,
                onChange: (e) => setCreateForm({ ...createForm, tower: e.target.value }),
                placeholder: "e.g. A, B3, Tower 2",
                className: "rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cb-pincode", children: "Pincode *" }),
              (createForm.pincode || "").length === 6 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[11px] font-medium ${isPincodeSupported(createForm.pincode) ? "text-emerald-600" : "text-red-500"}`, children: isPincodeSupported(createForm.pincode) ? `✓ Serviceable (${getPincodeLocation(createForm.pincode) || "Supported Area"})` : "✕ Pickup Not Available" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cb-pincode",
                maxLength: 6,
                value: createForm.pincode || "",
                onChange: (e) => setCreateForm({ ...createForm, pincode: (e.target?.value || "").replace(/\D/g, "").slice(0, 6) }),
                placeholder: "e.g. 201306",
                className: "rounded-xl"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cb-inquiryDate", children: "Inquiry Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cb-inquiryDate",
                type: "date",
                value: createForm.inquiryDate,
                onChange: (e) => setCreateForm({ ...createForm, inquiryDate: e.target.value }),
                className: "rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cb-lastComm", children: "Last Communication Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cb-lastComm",
                type: "date",
                value: createForm.lastCommunicationDate,
                onChange: (e) => setCreateForm({ ...createForm, lastCommunicationDate: e.target.value }),
                className: "rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cb-pickupDate", children: "Scheduled Pickup Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "cb-pickupDate",
                type: "date",
                value: createForm.pickupDate,
                onChange: (e) => setCreateForm({ ...createForm, pickupDate: e.target.value }),
                className: "rounded-xl"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Initial Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: createForm.status,
              onValueChange: (v) => setCreateForm({ ...createForm, status: v }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "scheduled", children: "Scheduled" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "in_progress", children: "In Progress" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "completed", children: "Completed" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cancelled", children: "Cancelled" })
                ] })
              ]
            }
          ),
          (createForm.status === "scheduled" || createForm.status === "completed") && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-600 flex items-center gap-1 mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "h-3 w-3" }),
            "Customer will be auto-added to ERP Customers"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: [
            "Materials * ",
            createForm.materials.length > 0 && `(${createForm.materials.length} selected)`
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: availableMaterials.map((mat) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => toggleMaterial(mat, createForm, setCreateForm),
              className: `rounded-full border px-3 py-1 text-xs font-medium transition-all cursor-pointer ${createForm.materials.includes(mat) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`,
              children: mat
            },
            mat
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cb-comments", children: "Status Comments / Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              id: "cb-comments",
              value: createForm.statusComments,
              onChange: (e) => setCreateForm({ ...createForm, statusComments: e.target.value }),
              placeholder: "e.g. Customer wants pickup before 10 AM, called twice...",
              className: "rounded-xl resize-none",
              rows: 3
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            onClick: () => setShowCreateDialog(false),
            className: "rounded-xl cursor-pointer",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleCreateBooking,
            disabled: creating,
            className: "rounded-xl cursor-pointer gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
              creating ? "Creating..." : "Create Booking"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Sheet,
      {
        open: !!selected,
        onOpenChange: (o) => {
          if (!o) {
            setSelected(null);
            setShowWeightForm(false);
            setCrmEdit(null);
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetContent, { className: "w-full sm:max-w-md overflow-y-auto", children: selected && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 pr-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetTitle, { className: "flex items-center gap-2", children: [
              "Booking Details",
              selected.source && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${SOURCE_CONFIG[selected.source]?.className ?? ""}`, children: [
                SOURCE_CONFIG[selected.source]?.icon,
                SOURCE_CONFIG[selected.source]?.label
              ] })
            ] }),
            isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                className: "h-8 gap-1.5 rounded-xl text-xs cursor-pointer",
                onClick: () => openEditDialog(selected),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "h-3.5 w-3.5" }),
                  "Edit"
                ]
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-4 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: selected.fullName })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Phone" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: selected.phone })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Society" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-foreground", children: [
                  selected.society,
                  selected.tower ? ` · ${selected.tower}` : ""
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Pickup Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: format(new Date(selected.pickupDate), "EEE, d MMM yyyy") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Booked On" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: format(new Date(selected.createdAt), "d MMM yyyy") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Materials" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 mt-1", children: selected.materials.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs",
                    children: m
                  },
                  m
                )) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "CRM Tracking" }),
                !crmEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "sm",
                    className: "h-7 text-xs rounded-lg cursor-pointer",
                    onClick: () => setCrmEdit({
                      inquiryDate: selected.inquiryDate ?? "",
                      lastCommunicationDate: selected.lastCommunicationDate ?? "",
                      statusComments: selected.statusComments ?? ""
                    }),
                    children: "Edit"
                  }
                )
              ] }),
              crmEdit ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 bg-muted/30 rounded-xl p-3 border border-border/40", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Inquiry Date" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        type: "date",
                        value: crmEdit.inquiryDate,
                        onChange: (e) => setCrmEdit({ ...crmEdit, inquiryDate: e.target.value }),
                        className: "rounded-lg h-8 text-xs"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Last Communication" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        type: "date",
                        value: crmEdit.lastCommunicationDate,
                        onChange: (e) => setCrmEdit({ ...crmEdit, lastCommunicationDate: e.target.value }),
                        className: "rounded-lg h-8 text-xs"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Status Comments / Notes" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Textarea,
                    {
                      value: crmEdit.statusComments,
                      onChange: (e) => setCrmEdit({ ...crmEdit, statusComments: e.target.value }),
                      placeholder: "Internal notes...",
                      className: "rounded-lg resize-none text-xs",
                      rows: 3
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "sm",
                      variant: "outline",
                      className: "flex-1 rounded-lg text-xs cursor-pointer",
                      onClick: () => setCrmEdit(null),
                      children: "Cancel"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      size: "sm",
                      className: "flex-1 rounded-lg text-xs cursor-pointer gap-1",
                      disabled: savingCrm,
                      onClick: saveCrmFields,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3 w-3" }),
                        savingCrm ? "Saving..." : "Save"
                      ]
                    }
                  )
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 bg-muted/30 rounded-xl p-3 border border-border/40", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Inquiry Date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: selected.inquiryDate ? format(new Date(selected.inquiryDate), "d MMM yyyy") : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/50 italic text-xs", children: "Not set" }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Last Communication" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: selected.lastCommunicationDate ? format(new Date(selected.lastCommunicationDate), "d MMM yyyy") : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/50 italic text-xs", children: "Not set" }) })
                ] }),
                selected.statusComments && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Comments" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground whitespace-pre-line", children: selected.statusComments })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Update Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: statusSelectValue || selected.status,
                  onValueChange: (val) => {
                    setStatusSelectValue(val);
                  },
                  disabled: updating || profile?.role === "champion" && selected.status === "completed",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "scheduled", children: "Scheduled" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "in_progress", children: "In Progress" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "completed", children: "Completed" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cancelled", children: "Cancelled" })
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "status-comment", className: "text-xs text-muted-foreground", children: "Status Comment / Remark (Optional)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Textarea,
                  {
                    id: "status-comment",
                    value: statusCommentInput,
                    onChange: (e) => setStatusCommentInput(e.target.value),
                    placeholder: "e.g. Rescheduled on customer request / Completed pickup...",
                    className: "rounded-xl resize-none text-xs",
                    rows: 2
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  disabled: updating || profile?.role === "champion" && selected.status === "completed",
                  onClick: () => {
                    const newStatus = statusSelectValue || selected.status;
                    updateStatus(selected.id, newStatus, statusCommentInput.trim() || void 0);
                  },
                  className: "w-full rounded-xl text-xs cursor-pointer gap-1.5",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3.5 w-3.5" }),
                    updating ? "Saving..." : "Save Status & Comment"
                  ]
                }
              )
            ] }),
            profile?.role === "admin" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-2", children: "Assign Champion" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: selected.championId ?? "unassigned",
                  onValueChange: (val) => {
                    updateChampion(selected.id, val === "unassigned" ? null : val);
                  },
                  disabled: updating,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Champion" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "unassigned", children: "Unassigned" }),
                      champions.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.email }, c.id))
                    ] })
                  ]
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Assigned Champion" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: selected.championEmail ?? "Unassigned" })
            ] }),
            selected.status === "completed" && selected.actualWeights && Object.keys(selected.actualWeights).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-2", children: "Recorded Weights" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 bg-muted/40 rounded-xl p-3 border border-border/40", children: Object.entries(selected.actualWeights).map(([mat, weight]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                  mat,
                  ":"
                ] }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-foreground", children: [
                  weight,
                  " kg"
                ] })
              ] }, mat)) })
            ] }),
            isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4 border-t border-border flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => deleteBookingClick(selected.id),
                className: "rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-605 cursor-pointer gap-1.5",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
                  "Delete Booking"
                ]
              }
            ) })
          ] })
        ] }) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showEditDialog, onOpenChange: setShowEditDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2 text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "h-5 w-5 text-primary" }),
        "Edit Booking"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "eb-fullName", children: "Full Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "eb-fullName",
                value: editForm.fullName,
                onChange: (e) => setEditForm({ ...editForm, fullName: e.target.value }),
                placeholder: "e.g. Rahul Sharma",
                className: "rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "eb-phone", children: "Phone *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "eb-phone",
                value: editForm.phone,
                onChange: (e) => setEditForm({ ...editForm, phone: e.target.value }),
                placeholder: "+91 9876543210",
                className: "rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "eb-society", children: "Society / Area *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "eb-society",
                value: editForm.society,
                onChange: (e) => setEditForm({ ...editForm, society: e.target.value }),
                placeholder: "e.g. Green Valley Society",
                className: "rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "eb-tower", children: "Tower / Block" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "eb-tower",
                value: editForm.tower,
                onChange: (e) => setEditForm({ ...editForm, tower: e.target.value }),
                placeholder: "e.g. A, B3, Tower 2",
                className: "rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "eb-pincode", children: "Pincode" }),
              (editForm.pincode || "").length === 6 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[11px] font-medium ${isPincodeSupported(editForm.pincode) ? "text-emerald-600" : "text-red-500"}`, children: isPincodeSupported(editForm.pincode) ? `✓ Serviceable (${getPincodeLocation(editForm.pincode) || "Supported Area"})` : "✕ Pickup Not Available" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "eb-pincode",
                maxLength: 6,
                value: editForm.pincode || "",
                onChange: (e) => setEditForm({ ...editForm, pincode: (e.target?.value || "").replace(/\D/g, "").slice(0, 6) }),
                placeholder: "e.g. 201306",
                className: "rounded-xl"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Source" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: editForm.source,
                onValueChange: (v) => setEditForm({ ...editForm, source: v }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "website", children: "Website" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "whatsapp", children: "WhatsApp" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "admin", children: "Admin" })
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "eb-pickupDate", children: "Scheduled Pickup Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "eb-pickupDate",
                type: "date",
                value: editForm.pickupDate,
                onChange: (e) => setEditForm({ ...editForm, pickupDate: e.target.value }),
                className: "rounded-xl"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: [
            "Materials * ",
            editForm.materials.length > 0 && `(${editForm.materials.length} selected)`
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: availableMaterials.map((mat) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => toggleMaterial(mat, editForm, setEditForm),
              className: `rounded-full border px-3 py-1 text-xs font-medium transition-all cursor-pointer ${editForm.materials.includes(mat) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`,
              children: mat
            },
            mat
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            onClick: () => setShowEditDialog(false),
            className: "rounded-xl cursor-pointer",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleEditBooking,
            disabled: editing,
            className: "rounded-xl cursor-pointer gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
              editing ? "Saving..." : "Save Changes"
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  Route
};
