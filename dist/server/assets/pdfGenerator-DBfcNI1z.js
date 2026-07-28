import { n as numberToWords } from "./router-Bj6HzPyA.js";
function loadImageBase64(url) {
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
async function generateStandardPDF(options) {
  const windowObj = window;
  if (!windowObj.jspdf) {
    await new Promise((resolve, reject) => {
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
  const PW = 210;
  const PH = 297;
  const M = 8;
  const BW = PW - 2 * M;
  const BH = PH - 2 * M;
  const GREEN_DARK = [63, 98, 18];
  const GREEN_BG = [226, 245, 200];
  const DARK = [15, 23, 42];
  const MID_GREY = [100, 116, 139];
  const BORDER_COLOR = [71, 85, 105];
  const sf = (c) => doc.setFillColor(c[0], c[1], c[2]);
  const st = (c) => doc.setTextColor(c[0], c[1], c[2]);
  const sd = (c) => doc.setDrawColor(c[0], c[1], c[2]);
  const fn = (sz, style = "normal") => {
    doc.setFont("helvetica", style);
    doc.setFontSize(sz);
  };
  const rta = (txt, x, y) => doc.text(txt, x - doc.getTextWidth(txt), y);
  doc.setLineWidth(0.3);
  sd(BORDER_COLOR);
  doc.rect(M, M, BW, BH);
  const headerHeight = 32;
  doc.line(M, M + headerHeight, M + BW, M + headerHeight);
  doc.line(M + 97, M, M + 97, M + headerHeight);
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
  fn(14, "bold");
  st(GREEN_DARK);
  doc.text("The Scrap Co.", companyX, M + 10);
  fn(9, "normal");
  st(DARK);
  doc.text("Mobile : 7292016625", companyX, M + 17);
  doc.text("Email : bookings.scrapco@gmail.com", companyX, M + 23);
  const headerRightX = M + 101;
  fn(13, "bold");
  st(DARK);
  doc.text(options.docType, headerRightX, M + 11);
  fn(9, "normal");
  st(DARK);
  doc.text(
    options.docType === "PURCHASE" ? "Purchase No." : options.docType === "SALE TICKET" ? "Ticket No." : "Invoice No.",
    headerRightX,
    M + 19
  );
  rta(options.docNumber, M + BW - 4, M + 19);
  doc.text(
    options.docType === "PURCHASE" ? "Purchase Date" : "Date",
    headerRightX,
    M + 26
  );
  const formattedDate = options.docDate ? new Date(options.docDate).toLocaleDateString("en-GB") : (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB");
  rta(formattedDate, M + BW - 4, M + 26);
  const partyBarY = M + headerHeight;
  const partyBarHeight = 7;
  sf(GREEN_BG);
  doc.rect(M, partyBarY, BW, partyBarHeight, "F");
  doc.line(M, partyBarY + partyBarHeight, M + BW, partyBarY + partyBarHeight);
  fn(8.5, "bold");
  st(DARK);
  doc.text(options.partyTitle.toUpperCase(), M + 4, partyBarY + 5);
  const partyDetailsY = partyBarY + partyBarHeight + 5;
  fn(10, "bold");
  st(DARK);
  doc.text(options.partyName || "Walk-in Customer", M + 4, partyDetailsY);
  let currentY = partyDetailsY + 5;
  fn(8.5, "normal");
  st(DARK);
  if (options.partyAddress) {
    const splitAddress = doc.splitTextToSize(options.partyAddress, BW - 10);
    doc.text(splitAddress, M + 4, currentY);
    currentY += splitAddress.length * 4.2;
  }
  if (options.partyMobile) {
    doc.text(`Mobile : ${options.partyMobile}`, M + 4, currentY);
    currentY += 5;
  }
  const tableStartY = Math.max(currentY + 2, 70);
  const tableHeaderHeight = 7;
  sf(GREEN_BG);
  doc.rect(M, tableStartY, BW, tableHeaderHeight, "F");
  doc.line(M, tableStartY, M + BW, tableStartY);
  doc.line(M, tableStartY + tableHeaderHeight, M + BW, tableStartY + tableHeaderHeight);
  const colSNo = M + 4;
  const colItems = M + 20;
  const colQty = M + 125;
  const colRate = M + 155;
  const colAmount = M + BW - 4;
  fn(8.5, "bold");
  st(DARK);
  doc.text("S.NO.", colSNo, tableStartY + 5);
  doc.text("ITEMS", colItems, tableStartY + 5);
  rta("QTY.", colQty, tableStartY + 5);
  rta("RATE", colRate, tableStartY + 5);
  rta("AMOUNT", colAmount, tableStartY + 5);
  let rowY = tableStartY + tableHeaderHeight + 6;
  fn(8.5, "normal");
  st(DARK);
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
  const subtotalY = 228;
  const subtotalHeight = 7;
  sf(GREEN_BG);
  doc.rect(M, subtotalY, BW, subtotalHeight, "F");
  doc.line(M, subtotalY, M + BW, subtotalY);
  doc.line(M, subtotalY + subtotalHeight, M + BW, subtotalY + subtotalHeight);
  fn(9, "bold");
  st(DARK);
  doc.text("SUBTOTAL", colItems, subtotalY + 5);
  rta(Number(totalQty).toLocaleString("en-IN", { maximumFractionDigits: 2 }), colQty, subtotalY + 5);
  rta(`Rs. ${Number(totalAmount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, colAmount, subtotalY + 5);
  const bottomStartY = subtotalY + subtotalHeight;
  doc.line(M + 97, bottomStartY, M + 97, M + BH);
  fn(8.5, "bold");
  st(DARK);
  doc.text("Payment Mode:", M + 4, bottomStartY + 7);
  fn(8.5, "normal");
  st(DARK);
  doc.text((options.paymentMethod || "CASH").toUpperCase(), M + 30, bottomStartY + 7);
  if (options.notes) {
    fn(8, "italic");
    st(MID_GREY);
    const splitNotes = doc.splitTextToSize(`Notes: ${options.notes}`, 88);
    doc.text(splitNotes, M + 4, bottomStartY + 14);
  }
  const rightSummaryX = M + 101;
  const rightSummaryValX = M + BW - 4;
  let summaryY = bottomStartY + 7;
  const paid = options.paidAmount !== void 0 ? options.paidAmount : totalAmount;
  const balance = options.balanceAmount !== void 0 ? options.balanceAmount : 0;
  fn(9, "bold");
  st(DARK);
  doc.text("Total Amount", rightSummaryX, summaryY);
  rta(`Rs. ${Number(totalAmount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, rightSummaryValX, summaryY);
  summaryY += 6;
  doc.text("Paid Amount", rightSummaryX, summaryY);
  rta(`Rs. ${Number(paid).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, rightSummaryValX, summaryY);
  summaryY += 6;
  doc.text("Balance", rightSummaryX, summaryY);
  rta(`Rs. ${Number(balance).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, rightSummaryValX, summaryY);
  summaryY += 8;
  fn(8.5, "bold");
  st(DARK);
  doc.text("Total Amount (in words)", rightSummaryX, summaryY);
  summaryY += 5;
  fn(8, "normal");
  st(DARK);
  const amountWords = numberToWords(totalAmount);
  doc.text(amountWords, rightSummaryX, summaryY);
  fn(7.5, "italic");
  st(MID_GREY);
  const footerTxt = "Document generated using The Scrap Co. ERP System";
  doc.text(footerTxt, PW / 2 - doc.getTextWidth(footerTxt) / 2, PH - 3);
  doc.autoPrint();
  const pdfBlob = doc.output("bloburl");
  window.open(pdfBlob, "_blank");
}
export {
  generateStandardPDF as g
};
