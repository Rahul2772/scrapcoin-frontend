import type { GroupedERPTransaction } from "./utils";
import type { GroupedERPPurchaseReceipt } from "./utils";

/** Escape a CSV cell: wrap in double-quotes, escape internal quotes */
function cell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

/** Trigger a browser download of a CSV string */
function downloadCsv(csvContent: string, filename: string): void {
  const bom = "\uFEFF"; // UTF-8 BOM so Excel opens correctly
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Format a date-time string to DD/MM/YYYY HH:MM */
function fmt(dt: string): string {
  try {
    const d = new Date(dt);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  } catch {
    return dt;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// B2B TRANSACTIONS  (sell to recyclers)
// ─────────────────────────────────────────────────────────────────────────────

const TXN_HEADERS = [
  "Txn Number",
  "Date",
  "Supplier / Recycler",
  "Material",
  "Weight (kg)",
  "Rate (₹/kg)",
  "Subtotal (₹)",
  "GST %",
  "GST Amount (₹)",
  "Total Amount (₹)",
  "Invoice No",
  "Invoice Status",
  "Payment Method",
  "Notes",
];

export function exportTransactionsCsv(
  transactions: GroupedERPTransaction[],
  filename = `transactions_${new Date().toISOString().slice(0, 10)}.csv`
): void {
  const rows: string[][] = [TXN_HEADERS];

  for (const t of transactions) {
    if (t.materials && t.materials.length > 1) {
      // Multi-material: one row per line item
      for (const m of t.materials) {
        rows.push([
          t.txn_number,
          fmt(t.created_at),
          t.supplier_name,
          m.material_name,
          String(m.weight),
          String(m.price_per_unit),
          String(m.subtotal),
          String(m.gst_rate ?? 0),
          String(m.gst_amount ?? 0),
          String(m.total_amount),
          t.invoice_number ?? "",
          t.invoice_status ?? "",
          t.payment_method ?? "",
          t.notes ?? "",
        ]);
      }
    } else {
      // Single material
      rows.push([
        t.txn_number,
        fmt(t.created_at),
        t.supplier_name,
        t.material_name,
        String(t.weight),
        String(t.price_per_unit),
        String(t.subtotal ?? t.weight * t.price_per_unit),
        String(t.gst_rate ?? 0),
        String(t.gst_amount ?? 0),
        String(t.total_amount),
        t.invoice_number ?? "",
        t.invoice_status ?? "",
        t.payment_method ?? "",
        t.notes ?? "",
      ]);
    }
  }

  const csv = rows.map((r) => r.map(cell).join(",")).join("\r\n");
  downloadCsv(csv, filename);
}

// ─────────────────────────────────────────────────────────────────────────────
// B2C PURCHASE RECEIPTS  (buy from household customers)
// ─────────────────────────────────────────────────────────────────────────────

const RECEIPT_HEADERS = [
  "Receipt Number",
  "Date",
  "Customer Name",
  "Customer Phone",
  "Material",
  "Weight (kg)",
  "Rate (₹/kg)",
  "Total Paid (₹)",
  "Payment Method",
  "Notes",
];

export function exportReceiptsCsv(
  receipts: GroupedERPPurchaseReceipt[],
  filename = `purchase_receipts_${new Date().toISOString().slice(0, 10)}.csv`
): void {
  const rows: string[][] = [RECEIPT_HEADERS];

  for (const r of receipts) {
    if (r.materials && r.materials.length > 1) {
      // Multi-material: one row per line item
      for (const m of r.materials) {
        rows.push([
          r.receipt_number,
          fmt(r.created_at),
          r.customer_name,
          r.customer_phone ?? "",
          m.material_name,
          String(m.weight),
          String(m.price_per_unit),
          String(m.total_amount),
          r.payment_method,
          r.notes ?? "",
        ]);
      }
    } else {
      rows.push([
        r.receipt_number,
        fmt(r.created_at),
        r.customer_name,
        r.customer_phone ?? "",
        r.material_name,
        String(r.weight),
        String(r.price_per_unit),
        String(r.total_amount),
        r.payment_method,
        r.notes ?? "",
      ]);
    }
  }

  const csv = rows.map((row) => row.map(cell).join(",")).join("\r\n");
  downloadCsv(csv, filename);
}
