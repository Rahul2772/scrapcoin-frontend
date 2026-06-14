import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

type UserProfile = {
  id: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
};

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

function AdminUsers() {
  const { user, profile, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate({ to: "/" }); return; }
    if (profile && profile.role !== "admin") { navigate({ to: "/" }); return; }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    if (!session?.access_token) return;
    fetchUsers();
  }, [session]);

  async function fetchUsers() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${session!.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      setUsers(await res.json());
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(id: string, role: "admin" | "user") {
    setUpdatingRole(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed");
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role } : u))
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
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed");
      }
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
      setInviteOpen(false);
      // Refresh users list
      await fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setInviting(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Admin</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <p className="text-sm text-muted-foreground">
                  An invite email will be sent to this address. The invited user
                  will be added as a regular user — you can promote them to admin
                  from the users table after they accept.
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="invite-email">Email address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <Button
                  className="w-full rounded-full"
                  disabled={inviting || !inviteEmail}
                  onClick={sendInvite}
                >
                  {inviting ? "Sending invite..." : "Send Invite"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40">
                  <tr className="text-left text-muted-foreground">
                    {["Email", "Role", "Joined", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 font-medium whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => {
                    const isSelf = u.id === user?.id;
                    return (
                      <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-foreground font-medium">
                          {u.email}
                          {isSelf && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (you)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-700 border-purple-200"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {format(new Date(u.created_at), "d MMM yyyy")}
                        </td>
                        <td className="px-4 py-3">
                          {isSelf ? (
                            <span className="text-xs text-muted-foreground">
                              Cannot change own role
                            </span>
                          ) : (
                            <Select
                              value={u.role}
                              onValueChange={(val) =>
                                updateRole(u.id, val as "admin" | "user")
                              }
                              disabled={updatingRole === u.id}
                            >
                              <SelectTrigger className="w-28 h-8 text-xs rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">user</SelectItem>
                                <SelectItem value="admin">admin</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
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
