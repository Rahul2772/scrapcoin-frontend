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
