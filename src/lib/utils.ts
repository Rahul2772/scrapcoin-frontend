import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { type ERPPurchaseReceipt, type ERPTransaction, type ERPInvoice } from "./api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface GroupedERPPurchaseReceipt {
  id: string;
  receipt_number: string;
  customer_id?: string | null;
  customer_name: string;
  customer_phone?: string;
  customer_address?: string;
  payment_method: string;
  notes?: string | null;
  created_at: string;
  materials: Array<{
    material_id: string;
    material_name: string;
    weight: number;
    unit: string;
    price_per_unit: number;
    total_amount: number;
  }>;
  total_amount: number;
  material_name: string;
  weight: number;
  unit: string;
  price_per_unit: number;
}

export function groupReceipts(rawReceipts: ERPPurchaseReceipt[]): GroupedERPPurchaseReceipt[] {
  const groups: { [baseNumber: string]: ERPPurchaseReceipt[] } = {};

  rawReceipts.forEach((r) => {
    const baseNumber = r.receipt_number.split("/")[0];
    if (!groups[baseNumber]) {
      groups[baseNumber] = [];
    }
    groups[baseNumber].push(r);
  });

  const grouped: GroupedERPPurchaseReceipt[] = [];

  for (const baseNumber of Object.keys(groups)) {
    const items = groups[baseNumber];
    items.sort((a, b) => a.receipt_number.localeCompare(b.receipt_number));

    const baseItem = items[0];
    const total_amount = items.reduce((sum, item) => sum + Number(item.total_amount), 0);
    const material_name = items.map((item) => item.material_name).join(", ");
    const total_weight = items.reduce((sum, item) => sum + Number(item.weight), 0);

    grouped.push({
      id: baseItem.id,
      receipt_number: baseNumber,
      customer_id: baseItem.customer_id,
      customer_name: baseItem.customer_name,
      customer_phone: baseItem.customer_phone,
      customer_address: baseItem.customer_address,
      payment_method: baseItem.payment_method,
      notes: baseItem.notes,
      created_at: baseItem.created_at,
      materials: items.map((item) => ({
        material_id: item.material_id,
        material_name: item.material_name,
        weight: Number(item.weight),
        unit: item.unit || "kg",
        price_per_unit: Number(item.price_per_unit),
        total_amount: Number(item.total_amount),
      })),
      total_amount,
      material_name,
      weight: total_weight,
      unit: baseItem.unit || "kg",
      price_per_unit: baseItem.price_per_unit,
    });
  }

  const orderedGrouped: GroupedERPPurchaseReceipt[] = [];
  const seen = new Set<string>();
  rawReceipts.forEach((r) => {
    const baseNumber = r.receipt_number.split("/")[0];
    if (!seen.has(baseNumber)) {
      seen.add(baseNumber);
      const group = grouped.find((g) => g.receipt_number === baseNumber);
      if (group) {
        orderedGrouped.push(group);
      }
    }
  });

  return orderedGrouped;
}

export interface GroupedERPTransaction {
  id: string;
  txn_number: string;
  supplier_id: string;
  supplier_name: string;
  supplier_phone?: string;
  notes?: string | null;
  created_at: string;
  invoice_number?: string;
  invoice_status?: "pending" | "paid" | "overdue" | "cancelled";
  invoice_id?: string | null;
  payment_method?: string | null;
  due_date?: string | null;
  materials: Array<{
    id: string;
    material_id: string;
    material_name: string;
    weight: number;
    unit: string;
    price_per_unit: number;
    subtotal: number;
    gst_rate: number;
    gst_amount: number;
    total_amount: number;
  }>;
  total_amount: number;
  material_name: string;
  weight: number;
  unit: string;
  price_per_unit: number;
  color_hex?: string;
  material_id?: string;
  subtotal?: number;
  gst_rate?: number;
  gst_amount?: number;
  material_unit?: string;
}

export function groupTransactions(rawTxns: ERPTransaction[]): GroupedERPTransaction[] {
  const groups: { [baseNumber: string]: ERPTransaction[] } = {};

  rawTxns.forEach((t) => {
    const baseNumber = t.txn_number.split("/")[0];
    if (!groups[baseNumber]) {
      groups[baseNumber] = [];
    }
    groups[baseNumber].push(t);
  });

  const grouped: GroupedERPTransaction[] = [];

  for (const baseNumber of Object.keys(groups)) {
    const items = groups[baseNumber];
    items.sort((a, b) => a.txn_number.localeCompare(b.txn_number));

    const baseItem = items[0];
    const total_amount = items.reduce((sum, item) => sum + Number(item.total_amount), 0);
    const material_name = items.map((item) => item.material_name).join(", ");
    const total_weight = items.reduce((sum, item) => sum + Number(item.weight), 0);

    grouped.push({
      id: baseItem.id,
      txn_number: baseNumber,
      supplier_id: baseItem.supplier_id,
      supplier_name: baseItem.supplier_name,
      supplier_phone: baseItem.supplier_phone,
      notes: baseItem.notes,
      created_at: baseItem.created_at,
      invoice_number: baseItem.invoice_number ? baseItem.invoice_number.split("/")[0] : undefined,
      invoice_status: baseItem.invoice_status,
      invoice_id: baseItem.invoice_id,
      payment_method: baseItem.payment_method,
      due_date: baseItem.due_date,
      materials: items.map((item) => ({
        id: item.id,
        material_id: item.material_id,
        material_name: item.material_name,
        weight: Number(item.weight),
        unit: item.unit || "kg",
        price_per_unit: Number(item.price_per_unit),
        subtotal: Number(item.subtotal),
        gst_rate: Number(item.gst_rate || 0),
        gst_amount: Number(item.gst_amount || 0),
        total_amount: Number(item.total_amount),
      })),
      total_amount,
      material_name,
      weight: total_weight,
      unit: baseItem.unit || "kg",
      price_per_unit: baseItem.price_per_unit,
      color_hex: baseItem.color_hex,
      material_id: baseItem.material_id,
      subtotal: baseItem.subtotal,
      gst_rate: baseItem.gst_rate,
      gst_amount: baseItem.gst_amount,
      material_unit: baseItem.material_unit,
    });
  }

  const orderedGrouped: GroupedERPTransaction[] = [];
  const seen = new Set<string>();
  rawTxns.forEach((t) => {
    const baseNumber = t.txn_number.split("/")[0];
    if (!seen.has(baseNumber)) {
      seen.add(baseNumber);
      const group = grouped.find((g) => g.txn_number === baseNumber);
      if (group) {
        orderedGrouped.push(group);
      }
    }
  });

  return orderedGrouped;
}

export interface GroupedERPInvoice {
  id: string;
  invoice_number: string;
  supplier_id: string;
  supplier_name: string;
  supplier_phone?: string;
  txn_number: string;
  amount: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  due_date?: string | null;
  paid_at?: string | null;
  payment_method?: string | null;
  notes?: string | null;
  created_at: string;
  materials: Array<{
    id: string;
    transaction_id: string;
    material_name: string;
    weight: number;
    unit: string;
    price_per_unit: number;
    amount: number;
  }>;
  material_name: string;
  weight: number;
  unit: string;
  transaction_id?: string;
  price_per_unit?: number;
}

export function groupInvoices(rawInvoices: ERPInvoice[]): GroupedERPInvoice[] {
  const groups: { [baseNumber: string]: ERPInvoice[] } = {};

  rawInvoices.forEach((i) => {
    const baseNumber = i.invoice_number.split("/")[0];
    if (!groups[baseNumber]) {
      groups[baseNumber] = [];
    }
    groups[baseNumber].push(i);
  });

  const grouped: GroupedERPInvoice[] = [];

  for (const baseNumber of Object.keys(groups)) {
    const items = groups[baseNumber];
    items.sort((a, b) => a.invoice_number.localeCompare(b.invoice_number));

    const baseItem = items[0];
    const amount = items.reduce((sum, item) => sum + Number(item.amount), 0);
    const material_name = items.map((item) => item.material_name).join(", ");
    const total_weight = items.reduce((sum, item) => sum + Number(item.weight), 0);

    grouped.push({
      id: baseItem.id,
      invoice_number: baseNumber,
      supplier_id: baseItem.supplier_id,
      supplier_name: baseItem.supplier_name,
      supplier_phone: baseItem.supplier_phone,
      txn_number: baseItem.txn_number.split("/")[0],
      amount,
      status: baseItem.status,
      due_date: baseItem.due_date,
      paid_at: baseItem.paid_at,
      payment_method: baseItem.payment_method,
      notes: baseItem.notes,
      created_at: baseItem.created_at,
      materials: items.map((item) => ({
        id: item.id,
        transaction_id: item.transaction_id,
        material_name: item.material_name,
        weight: Number(item.weight),
        unit: item.unit || "kg",
        price_per_unit: Number(item.price_per_unit),
        amount: Number(item.amount),
      })),
      material_name,
      weight: total_weight,
      unit: baseItem.unit || "kg",
      transaction_id: baseItem.transaction_id,
      price_per_unit: baseItem.price_per_unit,
    });
  }

  const orderedGrouped: GroupedERPInvoice[] = [];
  const seen = new Set<string>();
  rawInvoices.forEach((i) => {
    const baseNumber = i.invoice_number.split("/")[0];
    if (!seen.has(baseNumber)) {
      seen.add(baseNumber);
      const group = grouped.find((g) => g.invoice_number === baseNumber);
      if (group) {
        orderedGrouped.push(group);
      }
    }
  });

  return orderedGrouped;
}

export function numberToWords(amount: number): string {
  const a = Math.floor(amount);
  const paise = Math.round((amount - a) * 100);

  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function numToWords(n: number): string {
    if (n < 20) return units[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + units[n % 10] : "");
    if (n < 1000) return units[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + numToWords(n % 100) : "");
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + numToWords(n % 1000) : "");
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + numToWords(n % 100000) : "");
    return numToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + numToWords(n % 10000000) : "");
  }

  if (amount === 0) return "Zero Rupees Only";

  let words = a > 0 ? numToWords(a) + " Rupees" : "";
  if (paise > 0) {
    const paiseWords = numToWords(paise) + " Paise";
    words = words ? `${words} and ${paiseWords}` : `${paiseWords}`;
  }
  return words ? `${words} Only` : "Zero Rupees Only";
}

