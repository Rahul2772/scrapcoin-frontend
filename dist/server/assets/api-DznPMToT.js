const API_BASE = "http://localhost:4000";
async function parseJson(response) {
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.text();
      if (body) {
        try {
          const parsed = JSON.parse(body);
          message = parsed.message || parsed.error || body;
        } catch {
          message = body;
        }
      }
    } catch {
    }
    throw new Error(message);
  }
  return response.json();
}
async function createBooking(payload, token) {
  return parseJson(
    await fetch(`${API_BASE}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...token ? { Authorization: `Bearer ${token}` } : {}
      },
      body: JSON.stringify(payload)
    })
  );
}
async function fetchCircularImpact() {
  return parseJson(await fetch(`${API_BASE}/api/live-pickup/impact`));
}
async function authFetch(url, token, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers || {},
    ...token ? { Authorization: `Bearer ${token}` } : {}
  };
  return parseJson(await fetch(url, { ...options, headers }));
}
async function fetchERPDashboard(token) {
  return authFetch(`${API_BASE}/api/erp/dashboard`, token);
}
async function fetchERPMaterials(token, category) {
  const ts = Date.now();
  const url = `${API_BASE}/api/erp/materials?_t=${ts}`;
  return authFetch(url, token, { cache: "no-store" });
}
async function fetchERPMaterialPriceHistory(materialId, token) {
  return authFetch(`${API_BASE}/api/erp/materials/${materialId}/price-history`, token);
}
async function createERPMaterial(payload, token) {
  return authFetch(`${API_BASE}/api/erp/materials`, token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function updateERPMaterial(materialId, payload, token) {
  return authFetch(`${API_BASE}/api/erp/materials/${materialId}`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}
async function deleteERPMaterial(materialId, token) {
  return authFetch(`${API_BASE}/api/erp/materials/${materialId}`, token, {
    method: "DELETE"
  });
}
async function fetchERPSuppliers(token, search) {
  const ts = Date.now();
  const url = search ? `${API_BASE}/api/erp/suppliers?search=${encodeURIComponent(search)}&_t=${ts}` : `${API_BASE}/api/erp/suppliers?_t=${ts}`;
  return authFetch(url, token, { cache: "no-store" });
}
async function fetchERPSupplierDetail(supplierId, token) {
  return authFetch(`${API_BASE}/api/erp/suppliers/${supplierId}`, token);
}
async function createERPSupplier(payload, token) {
  return authFetch(`${API_BASE}/api/erp/suppliers`, token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function updateERPSupplier(supplierId, payload, token) {
  return authFetch(`${API_BASE}/api/erp/suppliers/${supplierId}`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}
async function deleteERPSupplier(supplierId, token) {
  return authFetch(`${API_BASE}/api/erp/suppliers/${supplierId}`, token, {
    method: "DELETE"
  });
}
async function fetchERPCustomers(token, search) {
  const ts = Date.now();
  const url = search ? `${API_BASE}/api/erp/customers?search=${encodeURIComponent(search)}&_t=${ts}` : `${API_BASE}/api/erp/customers?_t=${ts}`;
  return authFetch(url, token, { cache: "no-store" });
}
async function fetchERPCustomerDetail(customerId, token) {
  return authFetch(`${API_BASE}/api/erp/customers/${customerId}`, token);
}
async function createERPCustomer(payload, token) {
  return authFetch(`${API_BASE}/api/erp/customers`, token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function updateERPCustomer(customerId, payload, token) {
  return authFetch(`${API_BASE}/api/erp/customers/${customerId}`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}
async function deleteERPCustomer(customerId, token) {
  return authFetch(`${API_BASE}/api/erp/customers/${customerId}`, token, {
    method: "DELETE"
  });
}
async function triggerCustomer30DayNotification(customerId, token) {
  return authFetch(`${API_BASE}/api/erp/customers/${customerId}/trigger-30-day-notification`, token, {
    method: "POST"
  });
}
async function fetchERPTransactions(token, params = {}) {
  const ts = Date.now();
  const q = new URLSearchParams({ ...params, _t: ts.toString() }).toString();
  return authFetch(`${API_BASE}/api/erp/transactions?${q}`, token, { cache: "no-store" });
}
async function createERPTransaction(payload, token) {
  return authFetch(`${API_BASE}/api/erp/transactions`, token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function updateERPTransaction(txnId, payload, token) {
  return authFetch(`${API_BASE}/api/erp/transactions/${txnId}`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}
async function deleteERPTransaction(txnId, token) {
  return authFetch(`${API_BASE}/api/erp/transactions/${txnId}`, token, {
    method: "DELETE"
  });
}
async function fetchERPInvoices(token, params = {}) {
  const ts = Date.now();
  const q = new URLSearchParams({ ...params, _t: ts.toString() }).toString();
  return authFetch(`${API_BASE}/api/erp/invoices?${q}`, token, { cache: "no-store" });
}
async function payERPInvoice(invoiceId, paymentMethod, notes, token) {
  return authFetch(`${API_BASE}/api/erp/invoices/${invoiceId}/pay`, token, {
    method: "PATCH",
    body: JSON.stringify({ payment_method: paymentMethod, notes })
  });
}
async function fetchERPPurchaseReceipts(token, customerId) {
  const ts = Date.now();
  const url = `${API_BASE}/api/erp/purchase-receipts?_t=${ts}`;
  return authFetch(url, token, { cache: "no-store" });
}
async function createERPPurchaseReceipt(payload, token) {
  return authFetch(`${API_BASE}/api/erp/purchase-receipts`, token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function updateERPPurchaseReceipt(receiptId, payload, token) {
  return authFetch(`${API_BASE}/api/erp/purchase-receipts/${receiptId}`, token, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}
async function deleteERPPurchaseReceipt(receiptId, token) {
  return authFetch(`${API_BASE}/api/erp/purchase-receipts/${receiptId}`, token, {
    method: "DELETE"
  });
}
async function sendERPWhatsApp(transactionId, token) {
  return authFetch(`${API_BASE}/api/erp/whatsapp/send/${transactionId}`, token, {
    method: "POST"
  });
}
async function fetchERPWhatsAppLogs(token) {
  return authFetch(`${API_BASE}/api/erp/whatsapp/logs`, token);
}
async function fetchERPNotifications(token) {
  return authFetch(`${API_BASE}/api/notifications`, token);
}
async function markAllERPNotificationsRead(token) {
  return authFetch(`${API_BASE}/api/notifications/mark-all-read`, token, {
    method: "POST"
  });
}
async function markERPNotificationRead(id, token) {
  return authFetch(`${API_BASE}/api/notifications/${id}/read`, token, {
    method: "PATCH"
  });
}
async function clearAllERPNotifications(token) {
  return authFetch(`${API_BASE}/api/notifications`, token, {
    method: "DELETE"
  });
}
export {
  createERPMaterial as A,
  fetchERPInvoices as B,
  payERPInvoice as C,
  triggerCustomer30DayNotification as D,
  fetchERPCustomerDetail as E,
  deleteERPCustomer as F,
  updateERPCustomer as G,
  fetchCircularImpact as H,
  createBooking as I,
  fetchERPWhatsAppLogs as a,
  fetchERPMaterials as b,
  fetchERPSuppliers as c,
  fetchERPTransactions as d,
  deleteERPTransaction as e,
  fetchERPDashboard as f,
  createERPTransaction as g,
  fetchERPSupplierDetail as h,
  deleteERPSupplier as i,
  updateERPSupplier as j,
  createERPSupplier as k,
  fetchERPCustomers as l,
  fetchERPPurchaseReceipts as m,
  deleteERPPurchaseReceipt as n,
  updateERPPurchaseReceipt as o,
  createERPPurchaseReceipt as p,
  createERPCustomer as q,
  fetchERPNotifications as r,
  sendERPWhatsApp as s,
  markAllERPNotificationsRead as t,
  updateERPTransaction as u,
  clearAllERPNotifications as v,
  markERPNotificationRead as w,
  fetchERPMaterialPriceHistory as x,
  deleteERPMaterial as y,
  updateERPMaterial as z
};
