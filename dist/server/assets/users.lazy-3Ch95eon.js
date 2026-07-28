import { af as createLazyFileRoute, ag as useNavigate, r as reactExports, ai as toast, L as jsxRuntimeExports, aj as UserPlus, ah as format } from "./vendor-D_Usrqei.js";
import { A as AdminLayout } from "./AdminLayout-C04oNr74.js";
import { u as useAuth, B as Button } from "./router-Bj6HzPyA.js";
import { I as Input } from "./input-B46-WYs4.js";
import { L as Label } from "./label-BYMti0SU.js";
import { S as Skeleton } from "./skeleton-Bi4Etyvs.js";
import { D as Dialog, a as DialogTrigger, b as DialogContent, c as DialogHeader, d as DialogTitle } from "./dialog-DKRq5zBk.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-ZI4Kaozi.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./brand-logo-DsYSfcsW.js";
import "./supabase-BkcVLFJa.js";
const Route = createLazyFileRoute("/admin/users")({
  component: AdminUsers
});
const API_BASE = "http://localhost:4000";
function AdminUsers() {
  const { user, profile, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [inviteOpen, setInviteOpen] = reactExports.useState(false);
  const [inviteEmail, setInviteEmail] = reactExports.useState("");
  const [inviting, setInviting] = reactExports.useState(false);
  const [updatingRole, setUpdatingRole] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/" });
      return;
    }
    if (profile && profile.role !== "admin") {
      navigate({ to: "/" });
      return;
    }
  }, [user, profile, authLoading, navigate]);
  reactExports.useEffect(() => {
    if (!session?.access_token) return;
    fetchUsers();
  }, [session]);
  async function fetchUsers() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      setUsers(await res.json());
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }
  async function updateRole(id, role) {
    setUpdatingRole(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ role })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed");
      }
      setUsers(
        (prev) => prev.map((u) => u.id === id ? { ...u, role } : u)
      );
      toast.success("Role updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setUpdatingRole(null);
    }
  }
  async function sendInvite() {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ email: inviteEmail })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed");
      }
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
      setInviteOpen(false);
      await fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setInviting(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-foreground", children: "User Management" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: inviteOpen, onOpenChange: setInviteOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "rounded-full gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4" }),
          "Invite Admin"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Invite New Admin" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 mt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "An invite email will be sent to this address. The invited user will be added as a regular user — you can promote them to admin from the users table after they accept." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "invite-email", children: "Email address" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "invite-email",
                  type: "email",
                  placeholder: "colleague@example.com",
                  value: inviteEmail,
                  onChange: (e) => setInviteEmail(e.target.value),
                  autoComplete: "off"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                className: "w-full rounded-full",
                disabled: inviting || !inviteEmail,
                onClick: sendInvite,
                children: inviting ? "Sending invite..." : "Send Invite"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border/60 bg-card overflow-hidden", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-5 space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, i)) }) : users.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-10 text-center text-sm text-muted-foreground", children: "No users found." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "border-b border-border bg-muted/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "text-left text-muted-foreground", children: ["Email", "Role", "Joined", "Actions"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "th",
        {
          className: "px-4 py-3 font-medium whitespace-nowrap",
          children: h
        },
        h
      )) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: users.map((u) => {
        const isSelf = u.id === user?.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/20 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-foreground font-medium", children: [
            u.email,
            isSelf && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs text-muted-foreground", children: "(you)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${u.role === "admin" ? "bg-purple-100 text-purple-700 border-purple-200" : u.role === "champion" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-600 border-gray-200"}`,
              children: u.role
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground whitespace-nowrap", children: format(new Date(u.created_at), "d MMM yyyy") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: isSelf ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Cannot change own role" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: u.role,
              onValueChange: (val) => updateRole(u.id, val),
              disabled: updatingRole === u.id,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "user", children: "user" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "champion", children: "champion" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "admin", children: "admin" })
                ] })
              ]
            }
          ) })
        ] }, u.id);
      }) })
    ] }) }) })
  ] }) });
}
export {
  Route
};
