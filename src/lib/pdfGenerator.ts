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
 * Generates a receipt image that exactly mirrors the PDF layout using the
 * browser's native Canvas 2D API (no external libraries).
 * On mobile: opens the native OS share sheet (WhatsApp, Gmail, etc.)
 * On desktop: falls back to direct file download.
 */
export async function generateReceiptImage(options: PDFDocumentOptions): Promise<void> {
  const SCALE = 2;    // retina multiplier
  const W     = 560;  // logical card width (portrait, A5-ish, phone-friendly)
  const PAD   = 10;   // horizontal inner padding
  const ROW_H = 26;   // item row height

  // ── Colors (identical to PDF) ─────────────────────────────────────────────
  const GREEN_DARK = "#3f6212";
  const GREEN_BG   = "#e2f5c8";
  const WHITE      = "#ffffff";
  const DARK       = "#0f172a";
  const MID        = "#64748b";
  const BORDER     = "#47556960";

  // ── Computed values ───────────────────────────────────────────────────────
  const totalAmount  = options.items.reduce((s, i) => s + i.amount, 0);
  const totalQty     = options.items.reduce((s, i) => s + i.qty, 0);
  const paid         = options.paidAmount   !== undefined ? options.paidAmount   : totalAmount;
  const balance      = options.balanceAmount !== undefined ? options.balanceAmount : 0;
  const fmt          = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  const formattedDate = options.docDate
    ? new Date(options.docDate).toLocaleDateString("en-GB")
    : new Date().toLocaleDateString("en-GB");
  const docLabel  = options.docType === "PURCHASE" ? "Purchase No." :
                    options.docType === "SALE TICKET" ? "Ticket No." : "Invoice No.";
  const dateLabel = options.docType === "PURCHASE" ? "Purchase Date" : "Date";
  const amountWords = numberToWords(totalAmount);

  // ── Section heights (mirrors PDF proportions) ─────────────────────────────
  const HEADER_H       = 72;
  const DIVIDER_H      = 1;
  const PARTY_BAR_H    = 22;
  const PARTY_DETAIL_H = options.partyMobile || options.partyAddress ? 52 : 36;
  const TABLE_HEAD_H   = 26;
  const ITEMS_H        = Math.max(options.items.length, 1) * ROW_H;
  const SUBTOTAL_H     = 26;
  const SUMMARY_H      = 118;
  const FOOTER_H       = 24;
  const CONTENT_H = HEADER_H + DIVIDER_H + PARTY_BAR_H + PARTY_DETAIL_H +
                  TABLE_HEAD_H + ITEMS_H + SUBTOTAL_H + SUMMARY_H + FOOTER_H;

  // Enforce 9:16 aspect ratio (portrait mobile friendly)
  const MIN_H   = Math.round(W * (16 / 9));
  const TOTAL_H = Math.max(CONTENT_H, MIN_H);

  // ── Canvas ────────────────────────────────────────────────────────────────
  const canvas  = document.createElement("canvas");
  canvas.width  = W * SCALE;
  canvas.height = TOTAL_H * SCALE;
  const ctx     = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  // White background + outer border
  ctx.fillStyle = WHITE; ctx.fillRect(0, 0, W, TOTAL_H);
  ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 0.6;
  ctx.strokeRect(0.3, 0.3, W - 0.6, TOTAL_H - 0.6);

  // ── Draw helpers ─────────────────────────────────────────────────────────
  const fill   = (c: string) => { ctx.fillStyle = c; };
  const stroke = (c: string) => { ctx.strokeStyle = c; };
  const frect  = (x: number, y: number, w: number, h: number) => ctx.fillRect(x, y, w, h);
  const hline  = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  };
  const txt  = (t: string, x: number, y: number, mw?: number) =>
    mw ? ctx.fillText(t, x, y, mw) : ctx.fillText(t, x, y);
  const rtxt = (t: string, rx: number, y: number) =>
    ctx.fillText(t, rx - ctx.measureText(t).width, y);

  let y = 0;

  // ─────────────────────────────────────────────────────────────────────────
  // 1. HEADER — white bg, logo left | doc info right (matches PDF exactly)
  // ─────────────────────────────────────────────────────────────────────────
  fill(WHITE); frect(0, y, W, HEADER_H);

  // Logo — green rounded-rect placeholder
  const logoX = PAD + 2, logoY = y + 8, logoSz = 54;
  fill(GREEN_DARK);
  ctx.beginPath(); ctx.roundRect(logoX, logoY, logoSz, logoSz, 6); ctx.fill();
  fill(WHITE); ctx.font = "bold 8px Arial";
  ["THE", "SCRAP", "CO."].forEach((l, i) => {
    const lw = ctx.measureText(l).width;
    ctx.fillText(l, logoX + logoSz / 2 - lw / 2, logoY + 16 + i * 13);
  });

  // Attempt to draw real logo over placeholder
  try {
    const logoB64 = await loadImageBase64("/images/logo.jpg");
    if (logoB64) {
      const img = new Image();
      img.src = logoB64;
      await new Promise<void>((r) => { img.onload = () => r(); img.onerror = () => r(); });
      ctx.save();
      ctx.beginPath(); ctx.roundRect(logoX, logoY, logoSz, logoSz, 6); ctx.clip();
      ctx.drawImage(img, logoX, logoY, logoSz, logoSz);
      ctx.restore();
    }
  } catch { /* keep placeholder */ }

  // Company info (right of logo)
  const cX = logoX + logoSz + 8;
  fill(GREEN_DARK); ctx.font = "bold 14px Arial"; txt("The Scrap Co.", cX, y + 26);
  fill(DARK); ctx.font = "10px Arial";
  txt("Mobile : 7292016625", cX, y + 42);
  txt("Email : bookings.scrapco@gmail.com", cX, y + 56);

  // Vertical divider between company & doc info
  const divX = W / 2 + 10;
  stroke(BORDER); ctx.lineWidth = 0.6; hline(divX, y + 8, divX, y + HEADER_H - 8);

  // Doc type / number / date (right column)
  const rX = divX + 12;
  fill(DARK); ctx.font = "bold 13px Arial"; txt(options.docType, rX, y + 22);
  fill(MID); ctx.font = "9px Arial"; txt(docLabel, rX, y + 38);
  fill(DARK); ctx.font = "bold 9px Arial"; rtxt(options.docNumber, W - PAD, y + 38);
  fill(MID); ctx.font = "9px Arial"; txt(dateLabel, rX, y + 52);
  fill(DARK); ctx.font = "bold 9px Arial"; rtxt(formattedDate, W - PAD, y + 52);

  y += HEADER_H;
  stroke("#94a3b8"); ctx.lineWidth = 0.6; hline(0, y, W, y);
  y += DIVIDER_H;

  // ─────────────────────────────────────────────────────────────────────────
  // 2. BILL FROM / BILL TO — green bar + customer name + mobile
  // ─────────────────────────────────────────────────────────────────────────
  fill(GREEN_BG); frect(0, y, W, PARTY_BAR_H);
  stroke(BORDER); ctx.lineWidth = 0.4; hline(0, y + PARTY_BAR_H, W, y + PARTY_BAR_H);
  fill(DARK); ctx.font = "bold 9px Arial";
  txt(options.partyTitle.toUpperCase(), PAD + 2, y + 15);
  y += PARTY_BAR_H;

  fill(DARK); ctx.font = "bold 13px Arial";
  txt(options.partyName || "Walk-in Customer", PAD + 2, y + 18);
  ctx.font = "10px Arial"; fill(MID);
  let py = y + 32;
  if (options.partyMobile) { txt(`Mobile : ${options.partyMobile}`, PAD + 2, py); py += 14; }
  if (options.partyAddress) { txt(options.partyAddress, PAD + 2, py, W - PAD * 3); }
  y += PARTY_DETAIL_H;

  // ─────────────────────────────────────────────────────────────────────────
  // 3. TABLE HEADER
  // ─────────────────────────────────────────────────────────────────────────
  fill(GREEN_BG); frect(0, y, W, TABLE_HEAD_H);
  stroke(BORDER); ctx.lineWidth = 0.5;
  hline(0, y, W, y); hline(0, y + TABLE_HEAD_H, W, y + TABLE_HEAD_H);

  const C_SNO  = PAD + 2;
  const C_ITEM = C_SNO + 28;
  const C_QTY  = W - 185;
  const C_RATE = W - 100;
  const C_AMT  = W - PAD;

  fill(DARK); ctx.font = "bold 9px Arial";
  txt("S.NO.", C_SNO, y + 17);
  txt("ITEMS", C_ITEM, y + 17);
  rtxt("QTY.", C_QTY, y + 17);
  rtxt("RATE", C_RATE, y + 17);
  rtxt("AMOUNT", C_AMT, y + 17);
  y += TABLE_HEAD_H;

  // ─────────────────────────────────────────────────────────────────────────
  // 4. ITEM ROWS
  // ─────────────────────────────────────────────────────────────────────────
  options.items.forEach((item, idx) => {
    fill(idx % 2 === 0 ? WHITE : "#f7fbf0"); frect(0, y, W, ROW_H);
    stroke(BORDER); ctx.lineWidth = 0.3; hline(0, y + ROW_H, W, y + ROW_H);
    fill(DARK);
    ctx.font = "9px Arial"; txt(String(idx + 1), C_SNO, y + 17);
    ctx.font = "bold 9px Arial"; txt(item.name.toUpperCase(), C_ITEM, y + 17, C_QTY - C_ITEM - 6);
    ctx.font = "9px Arial";
    rtxt(`${fmt(item.qty)} ${item.unit.toUpperCase()}`, C_QTY, y + 17);
    rtxt(fmt(item.rate), C_RATE, y + 17);
    ctx.font = "bold 9px Arial"; rtxt(fmt(item.amount), C_AMT, y + 17);
    y += ROW_H;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 5. SUBTOTAL
  // ─────────────────────────────────────────────────────────────────────────
  fill(GREEN_BG); frect(0, y, W, SUBTOTAL_H);
  stroke(BORDER); ctx.lineWidth = 0.5;
  hline(0, y, W, y); hline(0, y + SUBTOTAL_H, W, y + SUBTOTAL_H);
  fill(DARK); ctx.font = "bold 10px Arial";
  txt("SUBTOTAL", C_ITEM, y + 17);
  rtxt(fmt(totalQty), C_QTY, y + 17);
  rtxt(`Rs. ${fmt(totalAmount)}`, C_AMT, y + 17);
  y += SUBTOTAL_H;

  // ─────────────────────────────────────────────────────────────────────────
  // 6. SUMMARY — payment left | amounts right (two-column like the PDF)
  // ─────────────────────────────────────────────────────────────────────────
  fill(WHITE); frect(0, y, W, SUMMARY_H);
  stroke(BORDER); ctx.lineWidth = 0.4; hline(0, y + SUMMARY_H, W, y + SUMMARY_H);

  const midX = W / 2 - 10;
  hline(midX, y, midX, y + SUMMARY_H);

  // Left: payment mode + notes
  fill(MID); ctx.font = "bold 8px Arial"; txt("Payment Mode:", PAD + 2, y + 16);
  fill(DARK); ctx.font = "bold 11px Arial";
  txt((options.paymentMethod || "CASH").toUpperCase(), PAD + 2, y + 32);
  if (options.notes) {
    fill(MID); ctx.font = "8px Arial";
    txt(`Notes: ${options.notes}`, PAD + 2, y + 48, midX - PAD - 6);
  }

  // Right: amounts
  const rXs = midX + 8, rXe = W - PAD;
  const arow = (label: string, val: string, vy: number, valColor = DARK) => {
    fill(DARK); ctx.font = "9px Arial"; txt(label, rXs, vy);
    fill(valColor); ctx.font = "bold 9px Arial"; rtxt(val, rXe, vy);
  };
  arow("Total Amount",    `Rs. ${fmt(totalAmount)}`, y + 16);
  arow("Received Amount", `Rs. ${fmt(paid)}`,        y + 32, "#16a34a");
  arow("Balance",         `Rs. ${fmt(balance)}`,     y + 48, balance > 0 ? "#dc2626" : DARK);

  stroke(BORDER); ctx.lineWidth = 0.3; hline(rXs, y + 56, rXe, y + 56);
  fill(MID); ctx.font = "bold 8px Arial"; txt("Total Amount (in words)", rXs, y + 68);
  fill(DARK); ctx.font = "8px Arial"; txt(amountWords, rXs, y + 82, rXe - rXs);
  y += SUMMARY_H;

  // ─────────────────────────────────────────────────────────────────────────
  // 7. FOOTER (Pinned to bottom)
  // ─────────────────────────────────────────────────────────────────────────
  const footerY = TOTAL_H - FOOTER_H;
  
  // Fill any empty space between summary and footer with white background
  if (footerY > y) {
    fill(WHITE); frect(0, y, W, footerY - y);
  }
  
  fill(WHITE); frect(0, footerY, W, FOOTER_H);
  stroke(BORDER); ctx.lineWidth = 0.4; hline(0, footerY, W, footerY);
  fill(MID); ctx.font = "8px Arial";
  const ftxt = "Document generated using The Scrap Co. ERP System";
  ctx.fillText(ftxt, W / 2 - ctx.measureText(ftxt).width / 2, footerY + 15);
  // ─────────────────────────────────────────────────────────────────────────
  // 8. SHARE (Web Share API) → WhatsApp / Gmail / any installed app on mobile
  //    Falls back to direct file download on desktop
  // ─────────────────────────────────────────────────────────────────────────
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => b ? resolve(b) : reject(new Error("Canvas export failed")),
      "image/jpeg", 0.88
    )
  );

  const filename = `receipt-${options.docNumber}.jpg`;
  const file = new File([blob], filename, { type: "image/jpeg" });
  const nav = navigator as any;

  if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
    // Mobile: native share sheet — WhatsApp, Gmail, Drive, etc.
    await nav.share({
      title: `The Scrap Co. — Receipt ${options.docNumber}`,
      text: `Receipt ${options.docNumber} | Total: Rs. ${fmt(totalAmount)} | ${options.partyName || "Walk-in Customer"}`,
      files: [file],
    });
  } else {
    // Desktop fallback — download directly
    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");
    a.href = url; a.download = filename; a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}
