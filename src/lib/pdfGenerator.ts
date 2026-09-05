/**
 * Standard PDF Generator for Receipts, Invoices & Scale Tickets
 * Designed to match the official "The Scrap Co." document template format.
 */

import { numberToWords } from "./utils";

export interface PDFDocumentItem {
  sNo: number;
  name: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface PDFDocumentOptions {
  docType: "PURCHASE" | "SALE TICKET" | "TAX INVOICE";
  docNumber: string;
  docDate: string;
  partyTitle: string; // e.g. "BILL FROM" or "BILL TO"
  partyName: string;
  partyAddress?: string;
  partyMobile?: string;
  items: PDFDocumentItem[];
  paymentMethod?: string;
  paidAmount?: number;
  balanceAmount?: number;
  notes?: string;
}

function loadImageBase64(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/jpeg"));
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function generateStandardPDF(options: PDFDocumentOptions) {
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

  const { jsPDF } = windowObj.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const logoBase64 = await loadImageBase64("/images/logo.jpg");

  // Document dimensions
  const PW = 210;
  const PH = 297;
  const M = 8; // Margin
  const BW = PW - 2 * M; // 194mm box width
  const BH = PH - 2 * M; // 281mm box height

  // Colors
  const GREEN_DARK = [63, 98, 18]; // #3f6212 Olive / Green header text
  const GREEN_BG = [226, 245, 200]; // #e2f5c8 Light green bar
  const DARK = [15, 23, 42]; // #0f172a Text dark
  const MID_GREY = [100, 116, 139]; // Text grey
  const BORDER_COLOR = [71, 85, 105]; // Slate border

  const sf = (c: number[]) => doc.setFillColor(c[0], c[1], c[2]);
  const st = (c: number[]) => doc.setTextColor(c[0], c[1], c[2]);
  const sd = (c: number[]) => doc.setDrawColor(c[0], c[1], c[2]);
  const fn = (sz: number, style = "normal") => {
    doc.setFont("helvetica", style);
    doc.setFontSize(sz);
  };
  const rta = (txt: string, x: number, y: number) => doc.text(txt, x - doc.getTextWidth(txt), y);

  doc.setLineWidth(0.3);
  sd(BORDER_COLOR);

  // 1. Outer Border Box
  doc.rect(M, M, BW, BH);

  // 2. Header Box (y: 8 to 40)
  const headerHeight = 32; // y: 8 to 40
  doc.line(M, M + headerHeight, M + BW, M + headerHeight); // Horizontal line under header
  doc.line(M + 97, M, M + 97, M + headerHeight); // Vertical divider in header

  // Header Left — Logo & Company Details
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "JPEG", M + 3, M + 3, 26, 26);
    } catch {
      sf(GREEN_DARK);
      doc.roundedRect(M + 3, M + 3, 26, 26, 2, 2, "F");
    }
  } else {
    sf(GREEN_DARK);
    doc.roundedRect(M + 3, M + 3, 26, 26, 2, 2, "F");
  }

  const companyX = M + 32;
  fn(14, "bold"); st(GREEN_DARK);
  doc.text("The Scrap Co.", companyX, M + 10);

  fn(9, "normal"); st(DARK);
  doc.text("Mobile : 7292016625", companyX, M + 17);
  doc.text("Email : bookings.scrapco@gmail.com", companyX, M + 23);

  // Header Right — Document Info Box
  const headerRightX = M + 101;
  fn(13, "bold"); st(DARK);
  doc.text(options.docType, headerRightX, M + 11);

  fn(9, "normal"); st(DARK);
  doc.text(
    options.docType === "PURCHASE" ? "Purchase No." :
    options.docType === "SALE TICKET" ? "Ticket No." : "Invoice No.",
    headerRightX, M + 19
  );
  rta(options.docNumber, M + BW - 4, M + 19);

  doc.text(
    options.docType === "PURCHASE" ? "Purchase Date" : "Date",
    headerRightX, M + 26
  );
  const formattedDate = options.docDate
    ? new Date(options.docDate).toLocaleDateString("en-GB")
    : new Date().toLocaleDateString("en-GB");
  rta(formattedDate, M + BW - 4, M + 26);

  // 3. Bill From / Bill To Bar & Details (y: 40 to 68)
  const partyBarY = M + headerHeight; // 40mm
  const partyBarHeight = 7;

  sf(GREEN_BG);
  doc.rect(M, partyBarY, BW, partyBarHeight, "F");
  doc.line(M, partyBarY + partyBarHeight, M + BW, partyBarY + partyBarHeight);

  fn(8.5, "bold"); st(DARK);
  doc.text(options.partyTitle.toUpperCase(), M + 4, partyBarY + 5);

  const partyDetailsY = partyBarY + partyBarHeight + 5;
  fn(10, "bold"); st(DARK);
  doc.text(options.partyName || "Walk-in Customer", M + 4, partyDetailsY);

  let currentY = partyDetailsY + 5;
  fn(8.5, "normal"); st(DARK);

  if (options.partyAddress) {
    const splitAddress = doc.splitTextToSize(options.partyAddress, BW - 10);
    doc.text(splitAddress, M + 4, currentY);
    currentY += splitAddress.length * 4.2;
  }

  if (options.partyMobile) {
    doc.text(`Mobile : ${options.partyMobile}`, M + 4, currentY);
    currentY += 5;
  }

  // 4. Items Table Section
  const tableStartY = Math.max(currentY + 2, 70); // Min y: 70mm
  const tableHeaderHeight = 7;

  sf(GREEN_BG);
  doc.rect(M, tableStartY, BW, tableHeaderHeight, "F");
  doc.line(M, tableStartY, M + BW, tableStartY);
  doc.line(M, tableStartY + tableHeaderHeight, M + BW, tableStartY + tableHeaderHeight);

  // Table Columns Setup
  const colSNo = M + 4;
  const colItems = M + 20;
  const colQty = M + 125;
  const colRate = M + 155;
  const colAmount = M + BW - 4;

  fn(8.5, "bold"); st(DARK);
  doc.text("S.NO.", colSNo, tableStartY + 5);
  doc.text("ITEMS", colItems, tableStartY + 5);
  rta("QTY.", colQty, tableStartY + 5);
  rta("RATE", colRate, tableStartY + 5);
  rta("AMOUNT", colAmount, tableStartY + 5);

  // Rows Rendering
  let rowY = tableStartY + tableHeaderHeight + 6;
  fn(8.5, "normal"); st(DARK);

  let totalQty = 0;
  let totalAmount = 0;

  options.items.forEach((item, index) => {
    totalQty += item.qty;
    totalAmount += item.amount;

    doc.text(String(index + 1), colSNo, rowY);
    doc.text(item.name.toUpperCase(), colItems, rowY);
    rta(`${item.qty} ${item.unit.toUpperCase()}`, colQty, rowY);
    rta(Number(item.rate).toLocaleString("en-IN", { maximumFractionDigits: 2 }), colRate, rowY);
    rta(Number(item.amount).toLocaleString("en-IN", { maximumFractionDigits: 2 }), colAmount, rowY);

    rowY += 6.5;
  });

  // 5. Subtotal Bar (Positioned at fixed bottom area y: 228 to 235)
  const subtotalY = 228;
  const subtotalHeight = 7;

  sf(GREEN_BG);
  doc.rect(M, subtotalY, BW, subtotalHeight, "F");
  doc.line(M, subtotalY, M + BW, subtotalY);
  doc.line(M, subtotalY + subtotalHeight, M + BW, subtotalY + subtotalHeight);

  fn(9, "bold"); st(DARK);
  doc.text("SUBTOTAL", colItems, subtotalY + 5);
  rta(Number(totalQty).toLocaleString("en-IN", { maximumFractionDigits: 2 }), colQty, subtotalY + 5);
  rta(`Rs. ${Number(totalAmount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, colAmount, subtotalY + 5);

  // 6. Bottom Summary Box (y: 235 to M + BH = 289)
  const bottomStartY = subtotalY + subtotalHeight; // 235mm
  const bottomHeight = M + BH - bottomStartY; // 289 - 235 = 54mm

  // Vertical divider in summary box
  doc.line(M + 97, bottomStartY, M + 97, M + BH);

  // Left Summary — Notes / Payment Method
  fn(8.5, "bold"); st(DARK);
  doc.text("Payment Mode:", M + 4, bottomStartY + 7);
  fn(8.5, "normal"); st(DARK);
  doc.text((options.paymentMethod || "CASH").toUpperCase(), M + 30, bottomStartY + 7);

  if (options.notes) {
    fn(8, "italic"); st(MID_GREY);
    const splitNotes = doc.splitTextToSize(`Notes: ${options.notes}`, 88);
    doc.text(splitNotes, M + 4, bottomStartY + 14);
  }

  // Right Summary — Financial Breakdown
  const rightSummaryX = M + 101;
  const rightSummaryValX = M + BW - 4;

  let summaryY = bottomStartY + 7;
  const paid = options.paidAmount !== undefined ? options.paidAmount : totalAmount;
  const balance = options.balanceAmount !== undefined ? options.balanceAmount : 0;

  fn(9, "bold"); st(DARK);
  doc.text("Total Amount", rightSummaryX, summaryY);
  rta(`Rs. ${Number(totalAmount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, rightSummaryValX, summaryY);

  summaryY += 6;
  doc.text("Paid Amount", rightSummaryX, summaryY);
  rta(`Rs. ${Number(paid).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, rightSummaryValX, summaryY);

  summaryY += 6;
  doc.text("Balance", rightSummaryX, summaryY);
  rta(`Rs. ${Number(balance).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, rightSummaryValX, summaryY);

  summaryY += 8;
  fn(8.5, "bold"); st(DARK);
  doc.text("Total Amount (in words)", rightSummaryX, summaryY);

  summaryY += 5;
  fn(8, "normal"); st(DARK);
  const amountWords = numberToWords(totalAmount);
  doc.text(amountWords, rightSummaryX, summaryY);

  // 7. Footer text outside box
  fn(7.5, "italic"); st(MID_GREY);
  const footerTxt = "Document generated using The Scrap Co. ERP System";
  doc.text(footerTxt, PW / 2 - doc.getTextWidth(footerTxt) / 2, PH - 3);

  // Auto-print / open preview
  doc.autoPrint();
  const pdfBlob = doc.output("bloburl");
  window.open(pdfBlob, "_blank");
}

/**
 * Generates a lightweight JPEG image of a receipt card, suitable for sharing
 * via WhatsApp. Uses html2canvas to rasterize an off-screen HTML template
 * that mirrors the PDF design (same green/dark color scheme, same data fields).
 * Downloads directly as a file (no new tab) for easy gallery saving.
 */
export async function generateReceiptImage(options: PDFDocumentOptions): Promise<void> {
  const windowObj = window as any;

  // Load html2canvas dynamically (same pattern as jsPDF loading above)
  if (!windowObj.html2canvas) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load html2canvas library"));
      document.head.appendChild(script);
    });
  }

  const totalAmount = options.items.reduce((s, i) => s + i.amount, 0);
  const totalQty    = options.items.reduce((s, i) => s + i.qty, 0);
  const paid        = options.paidAmount !== undefined ? options.paidAmount : totalAmount;
  const balance     = options.balanceAmount !== undefined ? options.balanceAmount : 0;
  const formattedDate = options.docDate
    ? new Date(options.docDate).toLocaleDateString("en-IN")
    : new Date().toLocaleDateString("en-IN");

  const GREEN_DARK = "#3f6212";
  const GREEN_BG   = "#e2f5c8";
  const DARK       = "#0f172a";
  const BORDER     = "#47556966";

  // Build the item rows HTML
  const itemRows = options.items.map((item, idx) => `
    <tr style="border-bottom:1px solid ${BORDER};">
      <td style="padding:8px 10px;color:${DARK};font-size:13px;">${idx + 1}</td>
      <td style="padding:8px 10px;color:${DARK};font-size:13px;font-weight:600;">${item.name.toUpperCase()}</td>
      <td style="padding:8px 10px;color:${DARK};font-size:13px;text-align:right;">${item.qty} ${item.unit.toUpperCase()}</td>
      <td style="padding:8px 10px;color:${DARK};font-size:13px;text-align:right;">${Number(item.rate).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
      <td style="padding:8px 10px;color:${DARK};font-size:13px;text-align:right;font-weight:600;">${Number(item.amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
    </tr>
  `).join("");

  const docLabel = options.docType === "PURCHASE" ? "Purchase No." :
                   options.docType === "SALE TICKET" ? "Ticket No." : "Invoice No.";
  const dateLabel = options.docType === "PURCHASE" ? "Purchase Date" : "Date";
  const amountWords = numberToWords(totalAmount);

  const html = `
    <div style="
      width:600px;
      font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
      background:#ffffff;
      border:1.5px solid #cbd5e1;
      border-radius:12px;
      overflow:hidden;
      box-shadow:0 4px 24px rgba(0,0,0,0.10);
    ">
      <!-- Header -->
      <div style="background:${GREEN_DARK};padding:18px 20px;display:flex;align-items:center;gap:16px;">
        <img src="/images/logo.jpg" width="56" height="56"
             style="border-radius:10px;object-fit:cover;border:2px solid rgba(255,255,255,0.25);"
             onerror="this.style.display='none'" />
        <div>
          <div style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">The Scrap Co.</div>
          <div style="color:rgba(255,255,255,0.80);font-size:12px;margin-top:2px;">Mobile : 7292016625 &nbsp;|&nbsp; bookings.scrapco@gmail.com</div>
        </div>
        <div style="margin-left:auto;text-align:right;">
          <div style="color:#fff;font-size:13px;font-weight:600;opacity:0.85;">${options.docType}</div>
          <div style="color:rgba(255,255,255,0.70);font-size:11px;margin-top:4px;">${docLabel}: <b style="color:#fff;">${options.docNumber}</b></div>
          <div style="color:rgba(255,255,255,0.70);font-size:11px;margin-top:2px;">${dateLabel}: <b style="color:#fff;">${formattedDate}</b></div>
        </div>
      </div>

      <!-- Bill From/To -->
      <div style="background:${GREEN_BG};padding:10px 20px;border-bottom:1px solid ${BORDER};">
        <div style="color:${GREEN_DARK};font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${options.partyTitle}</div>
        <div style="color:${DARK};font-size:15px;font-weight:700;margin-top:3px;">${options.partyName || "Walk-in Customer"}</div>
        ${options.partyMobile ? `<div style="color:#475569;font-size:12px;margin-top:2px;">Mobile : ${options.partyMobile}</div>` : ""}
        ${options.partyAddress ? `<div style="color:#475569;font-size:12px;margin-top:2px;">${options.partyAddress}</div>` : ""}
      </div>

      <!-- Items Table -->
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:${GREEN_BG};border-bottom:1.5px solid ${GREEN_DARK}33;">
            <th style="padding:9px 10px;text-align:left;color:${DARK};font-size:11px;font-weight:700;letter-spacing:0.5px;">S.NO.</th>
            <th style="padding:9px 10px;text-align:left;color:${DARK};font-size:11px;font-weight:700;letter-spacing:0.5px;">ITEMS</th>
            <th style="padding:9px 10px;text-align:right;color:${DARK};font-size:11px;font-weight:700;letter-spacing:0.5px;">QTY.</th>
            <th style="padding:9px 10px;text-align:right;color:${DARK};font-size:11px;font-weight:700;letter-spacing:0.5px;">RATE</th>
            <th style="padding:9px 10px;text-align:right;color:${DARK};font-size:11px;font-weight:700;letter-spacing:0.5px;">AMOUNT</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <!-- Subtotal Row -->
        <tr style="background:${GREEN_BG};border-top:1.5px solid ${GREEN_DARK}33;">
          <td colspan="2" style="padding:9px 10px;color:${DARK};font-size:13px;font-weight:700;">SUBTOTAL</td>
          <td style="padding:9px 10px;color:${DARK};font-size:13px;font-weight:700;text-align:right;">${Number(totalQty).toLocaleString("en-IN", { maximumFractionDigits: 3 })}</td>
          <td></td>
          <td style="padding:9px 10px;color:${DARK};font-size:13px;font-weight:700;text-align:right;">₹ ${Number(totalAmount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
        </tr>
      </table>

      <!-- Summary Footer -->
      <div style="display:flex;border-top:1.5px solid ${BORDER};">
        <!-- Left: Payment -->
        <div style="flex:1;padding:14px 16px;border-right:1px solid ${BORDER};">
          <div style="color:#64748b;font-size:11px;font-weight:600;margin-bottom:4px;">PAYMENT MODE</div>
          <div style="color:${DARK};font-size:13px;font-weight:700;">${(options.paymentMethod || "CASH").toUpperCase()}</div>
          ${options.notes ? `<div style="color:#64748b;font-size:11px;margin-top:8px;font-style:italic;">Notes: ${options.notes}</div>` : ""}
        </div>
        <!-- Right: Amounts -->
        <div style="flex:1;padding:14px 16px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
            <span style="color:${DARK};font-size:12px;font-weight:600;">Total Amount</span>
            <span style="color:${DARK};font-size:12px;font-weight:700;">₹ ${Number(totalAmount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
            <span style="color:${DARK};font-size:12px;font-weight:600;">Paid Amount</span>
            <span style="color:#16a34a;font-size:12px;font-weight:700;">₹ ${Number(paid).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
            <span style="color:${DARK};font-size:12px;font-weight:600;">Balance</span>
            <span style="color:${balance > 0 ? "#dc2626" : DARK};font-size:12px;font-weight:700;">₹ ${Number(balance).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
          </div>
          <div style="font-size:10px;color:#64748b;font-style:italic;">${amountWords}</div>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f8fafc;padding:8px 16px;text-align:center;border-top:1px solid ${BORDER};">
        <div style="color:#94a3b8;font-size:10px;">Generated using The Scrap Co. ERP System</div>
      </div>
    </div>
  `;

  // Create hidden off-screen container (must be in the document for html2canvas to render)
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:620px;overflow:visible;";
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const canvas = await windowObj.html2canvas(container.firstElementChild as HTMLElement, {
      scale: 2,            // 2× for crisp retina-quality output
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: 640,
    });

    // Convert to blob synchronously-ish then trigger download
    // We must append the anchor to the DOM before clicking — required by Chrome/Firefox
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `receipt-${options.docNumber}.jpg`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    // Small delay before cleanup so the click registers
    await new Promise<void>((r) => setTimeout(r, 200));
    document.body.removeChild(a);
  } finally {
    document.body.removeChild(container);
  }
}
