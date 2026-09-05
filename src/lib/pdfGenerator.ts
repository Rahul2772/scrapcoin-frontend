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
 * Generates a lightweight JPEG image of a receipt card using the browser's
 * native Canvas 2D API — no external libraries needed. Downloads directly.
 */
export async function generateReceiptImage(options: PDFDocumentOptions): Promise<void> {
  const SCALE   = 2;      // retina multiplier
  const W       = 600;    // logical card width in px
  const PAD     = 20;     // horizontal padding
  const ROW_H   = 28;     // item row height

  // ── Colors ────────────────────────────────────────────────────────────────
  const GREEN_DARK = "#3f6212";
  const GREEN_BG   = "#e2f5c8";
  const WHITE      = "#ffffff";
  const DARK       = "#0f172a";
  const MID        = "#475569";
  const LIGHT_BG   = "#f8fafc";
  const BORDER     = "#e2e8f0";

  // ── Computed values ───────────────────────────────────────────────────────
  const totalAmount = options.items.reduce((s, i) => s + i.amount, 0);
  const totalQty    = options.items.reduce((s, i) => s + i.qty, 0);
  const paid        = options.paidAmount !== undefined ? options.paidAmount : totalAmount;
  const balance     = options.balanceAmount !== undefined ? options.balanceAmount : 0;
  const fmt         = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  const formattedDate = options.docDate
    ? new Date(options.docDate).toLocaleDateString("en-IN")
    : new Date().toLocaleDateString("en-IN");
  const docLabel  = options.docType === "PURCHASE" ? "Purchase No." :
                    options.docType === "SALE TICKET" ? "Ticket No." : "Invoice No.";
  const dateLabel = options.docType === "PURCHASE" ? "Purchase Date" : "Date";
  const amountWords = numberToWords(totalAmount);

  // ── Height calculation ────────────────────────────────────────────────────
  const HEADER_H   = 80;
  const PARTY_H    = options.partyMobile || options.partyAddress ? 72 : 52;
  const TABLE_HEADER_H = 30;
  const ITEMS_H    = options.items.length * ROW_H;
  const SUBTOTAL_H = 30;
  const SUMMARY_H  = 130;
  const FOOTER_H   = 30;
  const TOTAL_H    = HEADER_H + PARTY_H + TABLE_HEADER_H + ITEMS_H + SUBTOTAL_H + SUMMARY_H + FOOTER_H;

  // ── Canvas setup ─────────────────────────────────────────────────────────
  const canvas  = document.createElement("canvas");
  canvas.width  = W * SCALE;
  canvas.height = TOTAL_H * SCALE;
  const ctx     = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fill  = (color: string) => { ctx.fillStyle = color; };
  const stroke = (color: string) => { ctx.strokeStyle = color; };
  const rect  = (x: number, y: number, w: number, h: number) => ctx.fillRect(x, y, w, h);
  const line  = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  };
  const text  = (t: string, x: number, y: number, maxW?: number) => {
    if (maxW) ctx.fillText(t, x, y, maxW); else ctx.fillText(t, x, y);
  };
  const rtext = (t: string, rightX: number, y: number) => {
    const w = ctx.measureText(t).width;
    ctx.fillText(t, rightX - w, y);
  };

  let y = 0;

  // ── 1. Header bar (green) ─────────────────────────────────────────────────
  fill(GREEN_DARK); rect(0, y, W, HEADER_H);

  // Logo placeholder circle
  fill("rgba(255,255,255,0.18)"); ctx.beginPath(); ctx.arc(PAD + 24, y + 40, 22, 0, Math.PI * 2); ctx.fill();
  fill(WHITE);
  ctx.font = "bold 10px Arial";
  const logoLines = ["THE", "SCRAP", "CO."];
  logoLines.forEach((l, i) => { const lw = ctx.measureText(l).width; ctx.fillText(l, PAD + 24 - lw/2, y + 26 + i * 14); });

  // Try to draw the actual logo image
  try {
    const logoImg = await loadImageBase64("/images/logo.jpg");
    if (logoImg) {
      const img = new Image();
      img.src = logoImg;
      await new Promise<void>((r) => { img.onload = () => r(); img.onerror = () => r(); });
      ctx.save();
      ctx.beginPath();
      ctx.arc(PAD + 24, y + 40, 22, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, PAD + 2, y + 18, 44, 44);
      ctx.restore();
    }
  } catch { /* skip logo on error */ }

  fill(WHITE);
  ctx.font = "bold 18px Arial"; text("The Scrap Co.", PAD + 52, y + 30);
  ctx.font = "11px Arial"; fill("rgba(255,255,255,0.82)");
  text("Mobile : 7292016625", PAD + 52, y + 48);
  text("bookings.scrapco@gmail.com", PAD + 52, y + 63);

  // Header right — doc info
  fill("rgba(255,255,255,0.72)"); ctx.font = "11px Arial";
  rtext(options.docType, W - PAD, y + 22);
  text(`${docLabel}:`, W - 160, y + 40);
  fill(WHITE); ctx.font = "bold 11px Arial"; rtext(options.docNumber, W - PAD, y + 40);
  fill("rgba(255,255,255,0.72)"); ctx.font = "11px Arial";
  text(`${dateLabel}:`, W - 160, y + 56);
  fill(WHITE); ctx.font = "bold 11px Arial"; rtext(formattedDate, W - PAD, y + 56);

  y += HEADER_H;

  // ── 2. Party bar ──────────────────────────────────────────────────────────
  fill(GREEN_BG); rect(0, y, W, PARTY_H);
  stroke(BORDER); ctx.lineWidth = 0.5; line(0, y + PARTY_H, W, y + PARTY_H);

  fill(GREEN_DARK); ctx.font = "bold 10px Arial";
  text(options.partyTitle.toUpperCase(), PAD, y + 18);

  fill(DARK); ctx.font = "bold 15px Arial";
  text(options.partyName || "Walk-in Customer", PAD, y + 36);

  ctx.font = "12px Arial"; fill(MID);
  let partyY = y + 52;
  if (options.partyMobile) { text(`Mobile : ${options.partyMobile}`, PAD, partyY); partyY += 16; }
  if (options.partyAddress) { text(options.partyAddress, PAD, partyY, W - PAD * 2); }

  y += PARTY_H;

  // ── 3. Table header ───────────────────────────────────────────────────────
  fill(GREEN_BG); rect(0, y, W, TABLE_HEADER_H);
  stroke(BORDER); ctx.lineWidth = 0.5;
  line(0, y, W, y); line(0, y + TABLE_HEADER_H, W, y + TABLE_HEADER_H);

  fill(DARK); ctx.font = "bold 11px Arial";
  const COL_ITEM   = PAD + 30;
  const COL_QTY    = W - 200;
  const COL_RATE   = W - 110;
  const COL_AMOUNT = W - PAD;

  text("S.NO.", PAD, y + 19);
  text("ITEMS", COL_ITEM, y + 19);
  rtext("QTY.", COL_QTY, y + 19);
  rtext("RATE", COL_RATE, y + 19);
  rtext("AMOUNT", COL_AMOUNT, y + 19);

  y += TABLE_HEADER_H;

  // ── 4. Item rows ──────────────────────────────────────────────────────────
  options.items.forEach((item, idx) => {
    const rowBg = idx % 2 === 0 ? WHITE : "#f8faf5";
    fill(rowBg); rect(0, y, W, ROW_H);
    stroke(BORDER); ctx.lineWidth = 0.3; line(0, y + ROW_H, W, y + ROW_H);

    fill(DARK); ctx.font = "12px Arial";
    text(String(idx + 1), PAD, y + 18);
    ctx.font = "bold 12px Arial";
    text(item.name.toUpperCase(), COL_ITEM, y + 18, COL_QTY - COL_ITEM - 10);
    ctx.font = "12px Arial";
    rtext(`${fmt(item.qty)} ${item.unit.toUpperCase()}`, COL_QTY, y + 18);
    rtext(fmt(item.rate), COL_RATE, y + 18);
    ctx.font = "bold 12px Arial";
    rtext(fmt(item.amount), COL_AMOUNT, y + 18);

    y += ROW_H;
  });

  // ── 5. Subtotal row ───────────────────────────────────────────────────────
  fill(GREEN_BG); rect(0, y, W, SUBTOTAL_H);
  stroke(BORDER); ctx.lineWidth = 0.5; line(0, y, W, y); line(0, y + SUBTOTAL_H, W, y + SUBTOTAL_H);

  fill(DARK); ctx.font = "bold 13px Arial";
  text("SUBTOTAL", COL_ITEM, y + 19);
  rtext(`${fmt(totalQty)} KGS`, COL_QTY, y + 19);
  rtext(`₹ ${fmt(totalAmount)}`, COL_AMOUNT, y + 19);

  y += SUBTOTAL_H;

  // ── 6. Summary section ────────────────────────────────────────────────────
  const midX = W / 2;
  fill(WHITE); rect(0, y, W, SUMMARY_H);
  stroke(BORDER); ctx.lineWidth = 0.5;
  line(midX, y, midX, y + SUMMARY_H);
  line(0, y + SUMMARY_H, W, y + SUMMARY_H);

  // Left — payment
  fill(MID); ctx.font = "bold 10px Arial"; text("PAYMENT MODE", PAD, y + 20);
  fill(DARK); ctx.font = "bold 13px Arial"; text((options.paymentMethod || "CASH").toUpperCase(), PAD, y + 38);
  if (options.notes) {
    fill(MID); ctx.font = "italic 10px Arial";
    text(`Notes: ${options.notes}`, PAD, y + 56, midX - PAD * 2);
  }

  // Right — amounts
  const rPAD = midX + 16;
  const rRight = W - PAD;

  const amountRow = (label: string, value: string, vy: number, color = DARK) => {
    fill(DARK); ctx.font = "bold 12px Arial"; text(label, rPAD, vy);
    fill(color); ctx.font = "bold 12px Arial"; rtext(value, rRight, vy);
  };

  amountRow("Total Amount", `₹ ${fmt(totalAmount)}`, y + 22);
  amountRow("Paid Amount",  `₹ ${fmt(paid)}`, y + 42, "#16a34a");
  amountRow("Balance",      `₹ ${fmt(balance)}`, y + 62, balance > 0 ? "#dc2626" : DARK);

  stroke(BORDER); ctx.lineWidth = 0.3; line(rPAD, y + 70, rRight, y + 70);
  fill(MID); ctx.font = "italic 10px Arial";
  text(amountWords, rPAD, y + 84, rRight - rPAD);

  y += SUMMARY_H;

  // ── 7. Footer ─────────────────────────────────────────────────────────────
  fill(LIGHT_BG); rect(0, y, W, FOOTER_H);
  stroke(BORDER); ctx.lineWidth = 0.5; line(0, y, W, y);
  fill(MID); ctx.font = "10px Arial";
  const footerTxt = "Generated using The Scrap Co. ERP System";
  const ftw = ctx.measureText(footerTxt).width;
  ctx.fillText(footerTxt, W / 2 - ftw / 2, y + 19);

  // ── Download ──────────────────────────────────────────────────────────────
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `receipt-${options.docNumber}.jpg`;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

