const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export type BookingPayload = {
  fullName: string;
  phone: string;
  society: string;
  tower?: string;
  pickupDate: string;
  materials: string[];
};

export type LivePickupItem = {
  label: string;
  weightKg: number;
  categoryId: string;
};

export type LivePickup = {
  id: string;
  location: string;
  status: "in_progress" | "completed";
  items: LivePickupItem[];
  payoutAmount: number;
  currency: "INR";
};

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    const message = body || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function createBooking(payload: BookingPayload, token?: string) {
  return parseJson<{ message: string }>(
    await fetch(`${API_BASE}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    }),
  );
}

export async function fetchLivePickupDemo(): Promise<LivePickup> {
  return parseJson<LivePickup>(await fetch(`${API_BASE}/api/live-pickup/demo`));
}

export type CircularImpactItem = {
  categoryId: string;
  label: string;
  weightKg: number;
};

export type CircularImpact = {
  grandTotalKg: number;
  breakdown: CircularImpactItem[];
};

export async function fetchCircularImpact(): Promise<CircularImpact> {
  return parseJson<CircularImpact>(await fetch(`${API_BASE}/api/live-pickup/impact`));
}

// ── ERP TYPINGS ──────────────────────────────────────────────────────────────

export type ERPMaterial = {
  id: string;
  name: string;
  category: string;
  unit: string;
  buy_price: number;
  sell_price: number;
  stock_qty: number;
  min_threshold: number;
  color_hex: string;
  is_active: boolean;
  updated_at: string;
  is_low_stock: boolean;
};

export type ERPSupplier = {
  id: string;
  name: string;
  phone?: string | null;
  whatsapp?: string | null;
  upi?: string | null;
  email?: string | null;
  address?: string | null;
  id_type?: string | null;
  id_number?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_transactions?: number;
  total_value?: number;
};

export type ERPCustomer = {
  id: string;
  name: string;
  phone?: string | null;
  whatsapp?: string | null;
  upi?: string | null;
  address?: string | null;
  id_type?: string | null;
  id_number?: string | null;
  total_visits?: number;
  total_paid?: number;
  last_receipt_date?: string | null;
  days_since_last_receipt?: number | null;
  is_30_day_alert?: boolean;
  is_active: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type ERPTransaction = {
  id: string;
  txn_number: string;
  supplier_id: string;
  material_id: string;
  weight: number;
  unit: string;
  price_per_unit: number;
  subtotal: number;
  gst_rate: number;
  gst_amount: number;
  total_amount: number;
  notes?: string | null;
  created_by?: string;
  created_at: string;
  supplier_name: string;
  supplier_phone?: string;
  material_name: string;
  material_unit: string;
  color_hex: string;
  invoice_number?: string;
  invoice_status?: "pending" | "paid" | "overdue" | "cancelled";
  invoice_id?: string | null;
  payment_method?: string | null;
  due_date?: string | null;
};

export type ERPInvoice = {
  id: string;
  invoice_number: string;
  transaction_id: string;
  supplier_id: string;
  amount: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  due_date?: string | null;
  paid_at?: string | null;
  payment_method?: string | null;
  notes?: string | null;
  created_at: string;
  supplier_name: string;
  supplier_phone?: string;
  txn_number: string;
  weight: number;
  unit: string;
  price_per_unit: number;
  material_name: string;
};

export type ERPPurchaseReceipt = {
  id: string;
  receipt_number: string;
  customer_id?: string | null;
  material_id: string;
  weight: number;
  unit: string;
  price_per_unit: number;
  total_amount: number;
  payment_method: string;
  notes?: string | null;
  created_by?: string;
  created_at: string;
  customer_name: string;
  customer_phone?: string;
  material_name: string;
  material_unit: string;
};

export type ERPWhatsAppLog = {
  id: string;
  transaction_id: string;
  supplier_phone: string;
  status: "sent" | "failed" | "skipped";
  message_id?: string | null;
  provider: string;
  pdf_url?: string | null;
  error?: string | null;
  sent_at: string;
  txn_number: string;
  supplier_name: string;
};

export type ERPDashboardData = {
  revenue: {
    revenue_this_month: number;
    weight_this_month: number;
    txn_count_this_month: number;
    buy_cost_this_month: number;
    profit_loss: number;
  };
  low_stock_alerts: {
    id: string;
    name: string;
    stock_qty: number;
    min_threshold: number;
    color_hex: string;
    unit: string;
  }[];
  recent_transactions: {
    id: string;
    txn_number: string;
    weight: number;
    unit: string;
    total_amount: number;
    created_at: string;
    supplier_name: string;
    material_name: string;
    color_hex: string;
    invoice_status: string;
    invoice_number: string;
  }[];
  monthly_trend: {
    month: string;
    total_revenue: number;
    purchase_revenue: number;
    sell_revenue: number;
    transaction_count: number;
  }[];
  top_materials: {
    name: string;
    color_hex: string;
    revenue: number;
    weight_collected: number;
  }[];
  invoice_summary: {
    pending_count: number;
    overdue_count: number;
    pending_amount: number;
    overdue_amount: number;
  };
  material_pnl: {
    material_id: string;
    material_name: string;
    color_hex: string;
    buy_weight: number;
    buy_cost: number;
    avg_buy_price: number;
    sell_weight: number;
    sell_revenue: number;
    cogs: number;
    profit_loss: number;
    profit_margin_pct?: number;
    unsold_weight: number;
    inventory_value: number;
  }[];
};

// ── ERP API CLIENT CALLS ──────────────────────────────────────────────────────

async function authFetch<T>(url: string, token?: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return parseJson<T>(await fetch(url, { ...options, headers }));
}

export async function fetchERPDashboard(token?: string): Promise<{ success: boolean; dashboard: ERPDashboardData }> {
  return authFetch(`${API_BASE}/api/erp/dashboard`, token);
}

export async function fetchERPMaterials(token?: string, category?: string): Promise<{ success: boolean; count: number; materials: ERPMaterial[] }> {
  const url = category ? `${API_BASE}/api/erp/materials?category=${category}` : `${API_BASE}/api/erp/materials`;
  return authFetch(url, token);
}

export async function fetchERPMaterialPriceHistory(materialId: string, token?: string): Promise<{ success: boolean; history: any[] }> {
  return authFetch(`${API_BASE}/api/erp/materials/${materialId}/price-history`, token);
}

export async function createERPMaterial(payload: Partial<ERPMaterial>, token?: string): Promise<{ success: boolean; material: ERPMaterial }> {
  return authFetch(`${API_BASE}/api/erp/materials`, token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateERPMaterial(materialId: string, payload: Partial<ERPMaterial>, token?: string): Promise<{ success: boolean; material: ERPMaterial }> {
  return authFetch(`${API_BASE}/api/erp/materials/${materialId}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteERPMaterial(materialId: string, token?: string): Promise<{ success: boolean; message: string }> {
  return authFetch(`${API_BASE}/api/erp/materials/${materialId}`, token, {
    method: "DELETE",
  });
}

export async function fetchERPSuppliers(token?: string, search?: string): Promise<{ success: boolean; count: number; suppliers: ERPSupplier[] }> {
  const url = search ? `${API_BASE}/api/erp/suppliers?search=${encodeURIComponent(search)}` : `${API_BASE}/api/erp/suppliers`;
  return authFetch(url, token);
}

export async function fetchERPSupplierDetail(supplierId: string, token?: string): Promise<{ success: boolean; supplier: ERPSupplier; recent_transactions: any[] }> {
  return authFetch(`${API_BASE}/api/erp/suppliers/${supplierId}`, token);
}

export async function createERPSupplier(payload: Partial<ERPSupplier>, token?: string): Promise<{ success: boolean; supplier: ERPSupplier }> {
  return authFetch(`${API_BASE}/api/erp/suppliers`, token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateERPSupplier(supplierId: string, payload: Partial<ERPSupplier>, token?: string): Promise<{ success: boolean; supplier: ERPSupplier }> {
  return authFetch(`${API_BASE}/api/erp/suppliers/${supplierId}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteERPSupplier(supplierId: string, token?: string): Promise<{ success: boolean; message: string }> {
  return authFetch(`${API_BASE}/api/erp/suppliers/${supplierId}`, token, {
    method: "DELETE",
  });
}

export async function fetchERPCustomers(token?: string, search?: string): Promise<{ success: boolean; customers: ERPCustomer[] }> {
  const url = search ? `${API_BASE}/api/erp/customers?search=${encodeURIComponent(search)}` : `${API_BASE}/api/erp/customers`;
  return authFetch(url, token);
}

export async function fetchERPCustomerDetail(customerId: string, token?: string): Promise<{ success: boolean; customer: ERPCustomer; receipts: any[] }> {
  return authFetch(`${API_BASE}/api/erp/customers/${customerId}`, token);
}

export async function createERPCustomer(payload: Partial<ERPCustomer>, token?: string): Promise<{ success: boolean; customer: ERPCustomer }> {
  return authFetch(`${API_BASE}/api/erp/customers`, token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateERPCustomer(customerId: string, payload: Partial<ERPCustomer>, token?: string): Promise<{ success: boolean; customer: ERPCustomer }> {
  return authFetch(`${API_BASE}/api/erp/customers/${customerId}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteERPCustomer(customerId: string, token?: string): Promise<{ success: boolean; message: string }> {
  return authFetch(`${API_BASE}/api/erp/customers/${customerId}`, token, {
    method: "DELETE",
  });
}

export async function triggerCustomer30DayNotification(customerId: string, token?: string): Promise<{ success: boolean; message: string; notification?: any }> {
  return authFetch(`${API_BASE}/api/erp/customers/${customerId}/trigger-30-day-notification`, token, {
    method: "POST",
  });
}

export async function fetchERPTransactions(token?: string, params: Record<string, string> = {}): Promise<{ success: boolean; count: number; page: number; transactions: ERPTransaction[] }> {
  const q = new URLSearchParams(params).toString();
  return authFetch(`${API_BASE}/api/erp/transactions?${q}`, token);
}

export async function fetchERPTransactionDetail(txnId: string, token?: string): Promise<{ success: boolean; transaction: ERPTransaction }> {
  return authFetch(`${API_BASE}/api/erp/transactions/${txnId}`, token);
}

export async function createERPTransaction(payload: any, token?: string): Promise<{ success: boolean; message: string; transaction: ERPTransaction; invoice: ERPInvoice }> {
  return authFetch(`${API_BASE}/api/erp/transactions`, token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateERPTransaction(txnId: string, payload: any, token?: string): Promise<{ success: boolean; message: string; transaction: ERPTransaction; invoice: ERPInvoice }> {
  return authFetch(`${API_BASE}/api/erp/transactions/${txnId}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteERPTransaction(txnId: string, token?: string): Promise<{ success: boolean; message: string }> {
  return authFetch(`${API_BASE}/api/erp/transactions/${txnId}`, token, {
    method: "DELETE",
  });
}

export async function fetchERPInvoices(token?: string, params: Record<string, string> = {}): Promise<{ success: boolean; count: number; summary: any; invoices: ERPInvoice[] }> {
  const q = new URLSearchParams(params).toString();
  return authFetch(`${API_BASE}/api/erp/invoices?${q}`, token);
}

export async function payERPInvoice(invoiceId: string, paymentMethod: string, notes?: string, token?: string): Promise<{ success: boolean; message: string; invoice: ERPInvoice }> {
  return authFetch(`${API_BASE}/api/erp/invoices/${invoiceId}/pay`, token, {
    method: "PATCH",
    body: JSON.stringify({ payment_method: paymentMethod, notes }),
  });
}

export async function fetchERPPurchaseReceipts(token?: string, customerId?: string): Promise<{ success: boolean; receipts: ERPPurchaseReceipt[] }> {
  const ts = Date.now();
  const url = customerId
    ? `${API_BASE}/api/erp/purchase-receipts?customer_id=${customerId}&_t=${ts}`
    : `${API_BASE}/api/erp/purchase-receipts?_t=${ts}`;
  return authFetch(url, token, { cache: "no-store" });
}


export async function createERPPurchaseReceipt(payload: any, token?: string): Promise<{ success: boolean; receipt: ERPPurchaseReceipt }> {
  return authFetch(`${API_BASE}/api/erp/purchase-receipts`, token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateERPPurchaseReceipt(receiptId: string, payload: any, token?: string): Promise<{ success: boolean; receipt: ERPPurchaseReceipt }> {
  return authFetch(`${API_BASE}/api/erp/purchase-receipts/${receiptId}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteERPPurchaseReceipt(receiptId: string, token?: string): Promise<{ success: boolean; message: string }> {
  return authFetch(`${API_BASE}/api/erp/purchase-receipts/${receiptId}`, token, {
    method: "DELETE",
  });
}

export async function sendERPWhatsApp(transactionId: string, token?: string): Promise<{ success: boolean; message: string; pdfUrl: string }> {
  return authFetch(`${API_BASE}/api/erp/whatsapp/send/${transactionId}`, token, {
    method: "POST",
  });
}

export async function fetchERPWhatsAppLogs(token?: string): Promise<{ success: boolean; logs: ERPWhatsAppLog[] }> {
  return authFetch(`${API_BASE}/api/erp/whatsapp/logs`, token);
}

export type ERPNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  booking_id?: string | null;
  is_read: boolean;
  created_at: string;
};

export async function fetchERPNotifications(token?: string): Promise<ERPNotification[]> {
  return authFetch(`${API_BASE}/api/notifications`, token);
}

export async function markAllERPNotificationsRead(token?: string): Promise<{ success: boolean; message: string }> {
  return authFetch(`${API_BASE}/api/notifications/mark-all-read`, token, {
    method: "POST",
  });
}

export async function clearAllERPNotifications(token?: string): Promise<{ success: boolean }> {
  return authFetch(`${API_BASE}/api/notifications`, token, {
    method: "DELETE",
  });
}

