const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

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
    throw new Error(body || `Request failed (${response.status})`);
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
