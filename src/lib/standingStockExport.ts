import type { TelegramReceipt } from "./api";

export interface AggregatedMaterialStock {
  id: string;
  name: string;
  unit: string;
  totalQty: number;
  totalAmount: number;
  avgRate: number;
  receiptCount: number;
  receipts: Array<{
    receiptId: string;
    purchaseNo: string;
    customerName: string;
    purchaseDate: string | null;
    qty: number;
    rate: number;
    amount: number;
  }>;
}

interface ExportOptions {
  items: AggregatedMaterialStock[];
  receipts: TelegramReceipt[];
  grandTotalWeightKg: number;
  grandTotalValue: number;
  totalPendingReceipts: number;
  hasOtherUnits: boolean;
}

function cell(v: unknown): string {
  if (v === null || v === undefined) return '""';
  const s = String(v).trim();
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * Export Standing Material Stock and all Telegram receipts data to Excel (.csv format with UTF-8 BOM)
 */
export function exportStandingStockToExcel({
  items,
  receipts,
  grandTotalWeightKg,
  grandTotalValue,
  totalPendingReceipts,
  hasOtherUnits,
}: ExportOptions) {
  const pendingReceipts = receipts.filter((r) => r.status === "pending_review");
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN");
  const timeStr = now.toLocaleTimeString("en-IN");

  const lines: string[] = [];

  // Title & Metadata
  lines.push(`${cell("THE SCRAP CO. — STANDING MATERIAL STOCK REPORT")}`);
  lines.push(`${cell(`Generated On: ${dateStr} at ${timeStr}`)}`);
  lines.push(`${cell(`Report Status: Pending Telegram Approval (${totalPendingReceipts} receipts)`)}`);
  lines.push("");

  // Summary Metrics Box
  lines.push(`${cell("METRIC")},${cell("VALUE")}`);
  lines.push(`${cell("Total Standing Weight")},${cell(`${grandTotalWeightKg.toFixed(2)} kg${hasOtherUnits ? " (+ other units)" : ""}`)}`);
  lines.push(`${cell("Total Committed Value (Rs.)")},${cell(`Rs. ${grandTotalValue.toFixed(2)}`)}`);
  lines.push(`${cell("Total Pending Receipts")},${cell(totalPendingReceipts)}`);
  lines.push(`${cell("Distinct Material Categories")},${cell(items.length)}`);
  lines.push("");

  // ── SECTION 1: AGGREGATED MATERIAL STOCK SUMMARY ──────────────────────────
  lines.push(`${cell("SECTION 1: AGGREGATED STANDING MATERIAL STOCK SUMMARY")}`);
  lines.push(
    [
      cell("S.No"),
      cell("Material / Scrap Item"),
      cell("Standing Quantity"),
      cell("Unit"),
      cell("Weighted Avg Rate (Rs./unit)"),
      cell("Total Standing Value (Rs.)"),
      cell("% Share of Value"),
      cell("Pending Receipts Count"),
      cell("Contributing Receipts Summary"),
    ].join(",")
  );

  items.forEach((it, idx) => {
    const share = grandTotalValue > 0 ? ((it.totalAmount / grandTotalValue) * 100).toFixed(1) : "0";
    const contrib = it.receipts
      .map((r) => `${r.purchaseNo} (${r.customerName}: ${r.qty} ${it.unit} @ Rs.${r.rate})`)
      .join("; ");

    lines.push(
      [
        cell(idx + 1),
        cell(it.name),
        cell(it.totalQty.toFixed(2)),
        cell(it.unit),
        cell(it.avgRate.toFixed(2)),
        cell(it.totalAmount.toFixed(2)),
        cell(`${share}%`),
        cell(it.receiptCount),
        cell(contrib),
      ].join(",")
    );
  });

  // Grand Total row for Section 1
  lines.push(
    [
      cell(""),
      cell("GRAND TOTAL"),
      cell(grandTotalWeightKg.toFixed(2)),
      cell(hasOtherUnits ? "mixed" : "kg"),
      cell("-"),
      cell(grandTotalValue.toFixed(2)),
      cell("100%"),
      cell(totalPendingReceipts),
      cell("-"),
    ].join(",")
  );

  lines.push("");
  lines.push("");

  // ── SECTION 2: ITEMIZED TELEGRAM RECEIPTS & COLLECTED MATERIALS ──────────
  lines.push(`${cell("SECTION 2: ITEMIZED TELEGRAM RECEIPTS & COLLECTED MATERIALS (PENDING APPROVAL)")}`);
  lines.push(
    [
      cell("S.No"),
      cell("Receipt / Purchase No"),
      cell("Receipt Date"),
      cell("Customer Name"),
      cell("Customer Mobile"),
      cell("Customer Address"),
      cell("Material Item"),
      cell("Quantity"),
      cell("Unit"),
      cell("Rate (Rs.)"),
      cell("Item Amount (Rs.)"),
      cell("Receipt Total (Rs.)"),
      cell("Payment Mode"),
      cell("Status"),
      cell("Notes / Remarks"),
    ].join(",")
  );

  let itemSerial = 0;
  pendingReceipts.forEach((r) => {
    const pDate = r.purchase_date
      ? new Date(r.purchase_date).toLocaleDateString("en-IN")
      : new Date(r.created_at).toLocaleDateString("en-IN");
    const custName = r.customer_name || r.erp_customers?.name || "Walk-in Customer";
    const custPhone = r.customer_mobile || r.erp_customers?.phone || "";
    const custAddress = r.customer_address || r.erp_customers?.address || "";
    const payMode = r.payment_mode || "Cash";
    const status = "Pending Approval";
    const rTotal = r.total_amount != null ? r.total_amount.toFixed(2) : "";

    const lineItems = r.line_items && r.line_items.length > 0 ? r.line_items : [];

    if (lineItems.length === 0) {
      itemSerial++;
      lines.push(
        [
          cell(itemSerial),
          cell(r.purchase_no || `TG-${r.id.slice(0, 6)}`),
          cell(pDate),
          cell(custName),
          cell(custPhone),
          cell(custAddress),
          cell("Unreadable / No Items"),
          cell(0),
          cell("KG"),
          cell(0),
          cell(0),
          cell(rTotal),
          cell(payMode),
          cell(status),
          cell(r.notes || ""),
        ].join(",")
      );
    } else {
      lineItems.forEach((li) => {
        itemSerial++;
        const qty = Number(li.qty || 0);
        const rate = Number(li.rate || 0);
        const amt = Number(li.amount != null ? li.amount : (qty * rate).toFixed(2));

        lines.push(
          [
            cell(itemSerial),
            cell(r.purchase_no || `TG-${r.id.slice(0, 6)}`),
            cell(pDate),
            cell(custName),
            cell(custPhone),
            cell(custAddress),
            cell(li.item_name || "Scrap Item"),
            cell(qty.toFixed(2)),
            cell(li.unit || "kg"),
            cell(rate.toFixed(2)),
            cell(amt.toFixed(2)),
            cell(rTotal),
            cell(payMode),
            cell(status),
            cell(r.notes || ""),
          ].join(",")
        );
      });
    }
  });

  // Trigger Excel CSV download with UTF-8 BOM
  const bom = "\uFEFF";
  const blob = new Blob([bom + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `scrapco_standing_material_stock_${now.toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Dynamically load jsPDF library
 */
async function loadJsPDF(): Promise<any> {
  const windowObj = window as any;
  if (!windowObj.jspdf) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load PDF library"));
      document.head.appendChild(script);
    });
  }
  return windowObj.jspdf.jsPDF;
}

/**
 * Export Standing Material Stock and all Telegram receipts data to a comprehensive PDF Report
 */
export async function exportStandingStockToPDF({
  items,
  receipts,
  grandTotalWeightKg,
  grandTotalValue,
  totalPendingReceipts,
  hasOtherUnits,
}: ExportOptions) {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const pendingReceipts = receipts.filter((r) => r.status === "pending_review");
  const PW = 210;
  const PH = 297;
  const M = 10;
  const BW = PW - 2 * M; // 190mm
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN");
  const timeStr = now.toLocaleTimeString("en-IN");

  // Helper colors
  const C_DARK = [30, 41, 59];      // #1e293b
  const C_PRIMARY = [31, 107, 68];   // #1f6b44 ScrapCo green
  const C_AMBER = [217, 119, 6];     // #d97706
  const C_BG_LIGHT = [248, 250, 252];// #f8fafc
  const C_BORDER = [226, 232, 240];  // #e2e8f0
  const C_GREEN_BG = [236, 253, 243];// #ecfdf3

  let y = M;

  // ── Header Bar ─────────────────────────────────────────────────────────────
  doc.setFillColor(...C_GREEN_BG);
  doc.rect(M, y, BW, 22, "F");
  doc.setDrawColor(...C_PRIMARY);
  doc.setLineWidth(0.4);
  doc.rect(M, y, BW, 22, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...C_PRIMARY);
  doc.text("THE SCRAP CO. — ERP INVENTORY REPORT", M + 5, y + 8);

  doc.setFontSize(9);
  doc.setTextColor(...C_DARK);
  doc.text("Standing Material Stock & Pending Telegram Receipts Ledger", M + 5, y + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${dateStr} ${timeStr} • Status: Pending Verification`, M + 5, y + 19);

  y += 26;

  // ── 4 KPI Metric Cards ─────────────────────────────────────────────────────
  const cardW = (BW - 9) / 4; // 4 cards with 3mm gap
  const cardH = 15;

  const kpis = [
    { label: "Standing Weight", val: `${grandTotalWeightKg.toFixed(1)} kg`, sub: hasOtherUnits ? "+ other units" : "Gross scrap" },
    { label: "Committed Value", val: `Rs. ${grandTotalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, sub: "Pending payables" },
    { label: "Pending Receipts", val: `${totalPendingReceipts}`, sub: "Awaiting approval" },
    { label: "Material Types", val: `${items.length}`, sub: "Distinct items" },
  ];

  kpis.forEach((k, i) => {
    const kx = M + i * (cardW + 3);
    doc.setFillColor(...C_BG_LIGHT);
    doc.rect(kx, y, cardW, cardH, "F");
    doc.setDrawColor(...C_BORDER);
    doc.setLineWidth(0.3);
    doc.rect(kx, y, cardW, cardH, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(k.label.toUpperCase(), kx + 3, y + 4.5);

    doc.setFontSize(9.5);
    doc.setTextColor(...C_DARK);
    doc.text(k.val, kx + 3, y + 9.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text(k.sub, kx + 3, y + 13);
  });

  y += cardH + 5;

  // ── SECTION 1: Aggregated Material Stock Table ─────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C_PRIMARY);
  doc.text("1. STANDING MATERIAL STOCK SUMMARY", M, y);
  y += 3;

  // Table header
  const thY = y;
  const thH = 6;
  doc.setFillColor(...C_GREEN_BG);
  doc.rect(M, thY, BW, thH, "F");
  doc.setDrawColor(...C_PRIMARY);
  doc.setLineWidth(0.2);
  doc.rect(M, thY, BW, thH, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C_PRIMARY);

  doc.text("#", M + 2, thY + 4);
  doc.text("MATERIAL ITEM", M + 10, thY + 4);
  doc.text("STANDING QTY", M + 75, thY + 4, { align: "right" });
  doc.text("UNIT", M + 85, thY + 4, { align: "center" });
  doc.text("AVG RATE (Rs.)", M + 115, thY + 4, { align: "right" });
  doc.text("TOTAL VALUE (Rs.)", M + 150, thY + 4, { align: "right" });
  doc.text("% SHARE", M + 165, thY + 4, { align: "center" });
  doc.text("RECEIPTS", M + 185, thY + 4, { align: "right" });

  y += thH;

  // Rows
  items.forEach((it, idx) => {
    if (y > 275) {
      doc.addPage();
      y = M + 5;
    }

    const rowH = 5.5;
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(252, 252, 253);
      doc.rect(M, y, BW, rowH, "F");
    }
    doc.setDrawColor(...C_BORDER);
    doc.setLineWidth(0.15);
    doc.line(M, y + rowH, M + BW, y + rowH);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C_DARK);

    const share = grandTotalValue > 0 ? ((it.totalAmount / grandTotalValue) * 100).toFixed(1) : "0";

    doc.text(String(idx + 1), M + 2, y + 4);
    doc.setFont("helvetica", "bold");
    doc.text(it.name, M + 10, y + 4);
    doc.setFont("helvetica", "normal");
    doc.text(it.totalQty.toFixed(2), M + 75, y + 4, { align: "right" });
    doc.text(it.unit.toUpperCase(), M + 85, y + 4, { align: "center" });
    doc.text(it.avgRate.toFixed(2), M + 115, y + 4, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(it.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 }), M + 150, y + 4, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(`${share}%`, M + 165, y + 4, { align: "center" });
    doc.text(`${it.receiptCount} rec`, M + 185, y + 4, { align: "right" });

    y += rowH;
  });

  // Grand Total Row
  const ftH = 6;
  doc.setFillColor(...C_GREEN_BG);
  doc.rect(M, y, BW, ftH, "F");
  doc.setDrawColor(...C_PRIMARY);
  doc.setLineWidth(0.3);
  doc.rect(M, y, BW, ftH, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C_PRIMARY);
  doc.text("GRAND TOTAL", M + 10, y + 4.2);
  doc.text(grandTotalWeightKg.toFixed(2), M + 75, y + 4.2, { align: "right" });
  doc.text(hasOtherUnits ? "MIXED" : "KG", M + 85, y + 4.2, { align: "center" });
  doc.text("—", M + 115, y + 4.2, { align: "right" });
  doc.text(`Rs. ${grandTotalValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, M + 150, y + 4.2, { align: "right" });
  doc.text("100%", M + 165, y + 4.2, { align: "center" });
  doc.text(`${totalPendingReceipts} rec`, M + 185, y + 4.2, { align: "right" });

  y += ftH + 8;

  // ── SECTION 2: Itemized Telegram Receipts Detail ───────────────────────────
  if (y > 230) {
    doc.addPage();
    y = M + 5;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C_PRIMARY);
  doc.text("2. ITEMIZED TELEGRAM RECEIPTS & CUSTOMER INVENTORY DETAIL", M, y);
  y += 3;

  // Ledger Table Header
  const lthH = 6;
  doc.setFillColor(...C_BG_LIGHT);
  doc.rect(M, y, BW, lthH, "F");
  doc.setDrawColor(...C_DARK);
  doc.setLineWidth(0.2);
  doc.rect(M, y, BW, lthH, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...C_DARK);

  doc.text("DATE", M + 2, y + 4);
  doc.text("RECEIPT #", M + 18, y + 4);
  doc.text("CUSTOMER & ADDRESS", M + 45, y + 4);
  doc.text("MATERIAL ITEM", M + 105, y + 4);
  doc.text("QTY", M + 145, y + 4, { align: "right" });
  doc.text("UNIT", M + 153, y + 4, { align: "center" });
  doc.text("RATE (Rs.)", M + 168, y + 4, { align: "right" });
  doc.text("AMOUNT (Rs.)", M + 188, y + 4, { align: "right" });

  y += lthH;

  pendingReceipts.forEach((r, rIdx) => {
    const pDate = r.purchase_date
      ? new Date(r.purchase_date).toLocaleDateString("en-IN")
      : new Date(r.created_at).toLocaleDateString("en-IN");
    const rNo = r.purchase_no || `TG-${r.id.slice(0, 6)}`;
    const custName = r.customer_name || r.erp_customers?.name || "Walk-in Customer";
    const custMobile = r.customer_mobile || r.erp_customers?.phone || "";
    const custAddress = r.customer_address || r.erp_customers?.address || "";

    const lineItems = r.line_items && r.line_items.length > 0 ? r.line_items : [];

    lineItems.forEach((li, lIdx) => {
      if (y > 275) {
        doc.addPage();
        y = M + 5;
      }

      const hasAddress = Boolean(custAddress);
      const rowH = (lIdx === 0 && hasAddress) ? 8 : 5.5;

      if (rIdx % 2 === 1) {
        doc.setFillColor(250, 250, 252);
        doc.rect(M, y, BW, rowH, "F");
      }
      doc.setDrawColor(...C_BORDER);
      doc.setLineWidth(0.15);
      doc.line(M, y + rowH, M + BW, y + rowH);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...C_DARK);

      if (lIdx === 0) {
        doc.text(pDate, M + 2, y + 4);
        doc.setFont("helvetica", "bold");
        doc.text(rNo, M + 18, y + 4);
        doc.setFont("helvetica", "normal");

        const custLine = custMobile ? `${custName} (${custMobile})` : custName;
        doc.text(custLine, M + 45, y + 4);

        if (hasAddress) {
          doc.setFontSize(5.5);
          doc.setTextColor(100, 116, 139);
          const truncatedAddr = custAddress.length > 55 ? custAddress.slice(0, 52) + "..." : custAddress;
          doc.text(truncatedAddr, M + 45, y + 7.2);
          doc.setFontSize(6.5);
          doc.setTextColor(...C_DARK);
        }
      } else {
        doc.setTextColor(148, 163, 184);
        doc.text("↳", M + 20, y + 4);
        doc.setTextColor(...C_DARK);
      }

      doc.setFont("helvetica", "bold");
      doc.text(li.item_name || "Scrap Item", M + 105, y + 4);
      doc.setFont("helvetica", "normal");

      const qty = Number(li.qty || 0);
      const rate = Number(li.rate || 0);
      const amt = Number(li.amount != null ? li.amount : (qty * rate).toFixed(2));

      doc.text(qty.toFixed(2), M + 145, y + 4, { align: "right" });
      doc.text((li.unit || "kg").toUpperCase(), M + 153, y + 4, { align: "center" });
      doc.text(rate.toFixed(2), M + 168, y + 4, { align: "right" });
      doc.setFont("helvetica", "bold");
      doc.text(amt.toLocaleString("en-IN", { minimumFractionDigits: 2 }), M + 188, y + 4, { align: "right" });

      y += rowH;
    });
  });

  // Add Page Numbers to all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `The Scrap Co. ERP — Confidential Standing Inventory Report • Page ${p} of ${pageCount}`,
      PW / 2,
      PH - 5,
      { align: "center" }
    );
  }

  // Trigger download
  doc.save(`scrapco_standing_material_stock_${now.toISOString().slice(0, 10)}.pdf`);
}
