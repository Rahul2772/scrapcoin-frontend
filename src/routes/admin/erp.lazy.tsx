import { createLazyFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Boxes,
  Truck,
  Scale,
  FileText,
  Users,
  Receipt,
  MessageSquare,
  Bell,
  Banknote,
} from "lucide-react";

export const Route = createLazyFileRoute("/admin/erp")({
  component: ERPLayout,
});

const ERP_TABS = [
  { to: "/admin/erp", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/erp/materials", label: "Materials", icon: Boxes, exact: false },
  { to: "/admin/erp/suppliers", label: "Recyclers", icon: Truck, exact: false },
  { to: "/admin/erp/transactions", label: "Scale Entry", icon: Scale, exact: false },
  { to: "/admin/erp/invoices", label: "Invoices", icon: FileText, exact: false },
  { to: "/admin/erp/customers", label: "Customers (B2C)", icon: Users, exact: false },
  { to: "/admin/erp/receipts", label: "Receipts (B2C)", icon: Receipt, exact: false },
  { to: "/admin/erp/expenses", label: "Expenses", icon: Banknote, exact: false },
  { to: "/admin/erp/whatsapp", label: "WhatsApp Logs", icon: MessageSquare, exact: false },
  { to: "/admin/erp/notifications", label: "Notifications", icon: Bell, exact: false },
];

function ERPLayout() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useRouterState({ select: (s) => s.location });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/" });
      return;
    }
    // Access restricted to admin/champion only
    if (profile && profile.role !== "admin" && profile.role !== "champion") {
      navigate({ to: "/" });
      return;
    }
  }, [user, profile, authLoading, navigate]);

  if (authLoading) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ERP Sub-navigation Header */}
        <div className="flex flex-col gap-4 border-b border-border/60 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">ERP Management</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage B2B scale ticket entries, recycler invoices, material inventory, and B2C customer metrics.
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
              ERP Panel
            </span>
          </div>

          {/* Navigation tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {ERP_TABS.map((tab) => {
              const active = tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);
              return (
                <Link key={tab.to} to={tab.to}>
                  <Button
                    variant={active ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full text-xs gap-1.5 shrink-0 cursor-pointer"
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tab content renders here */}
        <div className="min-h-[450px]">
          <Outlet />
        </div>
      </div>
    </AdminLayout>
  );
}

