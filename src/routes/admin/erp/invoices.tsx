import { createFileRoute, redirect } from "@tanstack/react-router";

// Invoices were merged into the Sales (B2B) page; keep old links working.
export const Route = createFileRoute("/admin/erp/invoices")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/erp/transactions" });
  },
});
