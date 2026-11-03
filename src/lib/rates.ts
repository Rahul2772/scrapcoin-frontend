// The rate card: the single source for /rates and the homepage estimator.
// Update RATES_AS_OF whenever a price changes.

/** Date the prices below were last set (YYYY-MM-DD) */
export const RATES_AS_OF = "2026-10-29";

export function formatRatesAsOf(): string {
  return new Date(`${RATES_AS_OF}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Static catalog ──────────────────────────────────────────────────────────
// Source: scrap_goods_inventory_and_price_catalog.md (purchase price = rate we pay customer)
// Sorted within each category by purchase price descending

export type ScrapItem = { name: string; buyPrice: number; unit: string };

export type ScrapCategory = {
  id: string;
  label: string;
  emoji: string;
  accentFrom: string;
  accentTo: string;
  items: ScrapItem[];
};

export const CATALOG: ScrapCategory[] = [
  {
    id: "metals",
    label: "Metals",
    emoji: "🔩",
    accentFrom: "#64748b",
    accentTo: "#94a3b8",
    items: [
      { name: "Copper", buyPrice: 935, unit: "kg" },
      { name: "Brass", buyPrice: 575, unit: "kg" },
      { name: "Aluminium Utensils", buyPrice: 225, unit: "kg" },
      { name: "Aluminium Scraps", buyPrice: 220, unit: "kg" },
      { name: "Steel", buyPrice: 40, unit: "kg" },
      { name: "Heavy Iron", buyPrice: 27, unit: "kg" },
      { name: "Metal E-Waste", buyPrice: 25, unit: "kg" },
      { name: "Tin / Light Iron", buyPrice: 24, unit: "kg" },
    ],
  },
  {
    id: "papers",
    label: "Papers",
    emoji: "📰",
    accentFrom: "#d97706",
    accentTo: "#fbbf24",
    items: [
      { name: "Newspapers", buyPrice: 14, unit: "kg" },
      { name: "Office Paper", buyPrice: 14, unit: "kg" },
      { name: "Books / Notebooks / Paper", buyPrice: 13, unit: "kg" },
      { name: "Magazines", buyPrice: 12, unit: "kg" },
      { name: "Cardboard (OCC / Duplex)", buyPrice: 11, unit: "kg" },
      { name: "Mill Board", buyPrice: 5, unit: "kg" },
      { name: "Grey Board", buyPrice: 3, unit: "kg" },
    ],
  },
  {
    id: "plastics",
    label: "Plastics",
    emoji: "♻️",
    accentFrom: "#059669",
    accentTo: "#34d399",
    items: [
      { name: "Exhaust Fan Plastic", buyPrice: 50, unit: "kg" },
      { name: "Water Tank (Black / White)", buyPrice: 20, unit: "kg" },
      { name: "UPVC Door", buyPrice: 20, unit: "kg" },
      { name: "Plastic E-Waste", buyPrice: 20, unit: "kg" },
      { name: "Mixed Plastics", buyPrice: 10, unit: "kg" },
      { name: "Paint Buckets (PVC)", buyPrice: 0, unit: "kg" },
    ],
  },
  {
    id: "textiles",
    label: "Textiles",
    emoji: "👕",
    accentFrom: "#7c3aed",
    accentTo: "#c084fc",
    items: [
      { name: "Used Clothes", buyPrice: 3, unit: "kg" },
      { name: "Used Footwear", buyPrice: 0, unit: "kg" },
    ],
  },
  {
    id: "wooden",
    label: "Wooden Scrap",
    emoji: "🪵",
    accentFrom: "#b45309",
    accentTo: "#f59e0b",
    items: [{ name: "Wooden Scraps", buyPrice: 0, unit: "kg" }],
  },
  {
    id: "glass",
    label: "Glass",
    emoji: "🍶",
    accentFrom: "#0891b2",
    accentTo: "#67e8f9",
    items: [{ name: "Glass Bottles / Sheets / Shards", buyPrice: 0, unit: "kg" }],
  },
];

function priceOf(name: string): number {
  for (const cat of CATALOG) {
    const item = cat.items.find((i) => i.name === name);
    if (item) return item.buyPrice;
  }
  throw new Error(`Rate card has no item named "${name}"`);
}

/** Lowest and highest rate across the everyday household items in a group */
function rateRange(names: string[]): { rateMin: number; rateMax: number } {
  const prices = names.map(priceOf);
  return { rateMin: Math.min(...prices), rateMax: Math.max(...prices) };
}

// Homepage estimator groups. Ranges come from the rate card above, using the
// items a household typically has (copper/brass would inflate the metals range).
export const ESTIMATOR_ITEMS = [
  {
    id: "paper",
    label: "Paper & Cardboard",
    emoji: "📰",
    unit: "kg",
    bookingMaterial: "Paper / Cardboard",
    ...rateRange(["Newspapers", "Office Paper", "Books / Notebooks / Paper", "Magazines", "Cardboard (OCC / Duplex)"]),
  },
  {
    id: "plastic",
    label: "Plastics",
    emoji: "🧴",
    unit: "kg",
    bookingMaterial: "Plastics",
    ...rateRange(["Mixed Plastics", "Water Tank (Black / White)", "UPVC Door"]),
  },
  {
    id: "metal",
    label: "Metals",
    emoji: "🔩",
    unit: "kg",
    bookingMaterial: "Metals",
    ...rateRange(["Tin / Light Iron", "Heavy Iron", "Steel"]),
  },
  {
    id: "ewaste",
    label: "E-Waste",
    emoji: "💻",
    unit: "kg",
    bookingMaterial: "E-Waste",
    ...rateRange(["Plastic E-Waste", "Metal E-Waste"]),
  },
] as const;
