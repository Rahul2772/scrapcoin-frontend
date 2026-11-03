// Societies and lead sources for customers. Keep in step with
// backend_scrapco/src/lib/society.ts, which fills the society on the server.
export const KNOWN_SOCIETIES = [
  "Gaur City 1",
  "Gaur City 2",
  "Mahagun Mywoods",
  "Panchsheel Greens 2",
  "Supertech Eco Village 1",
  "Nirala Estate",
  "Fusion Homes",
  "Spring Homes",
  "ATS Happy Trails",
  "Ace Divino",
  "CRC Joyous",
  "Gulshan Bellina",
  "Ace City",
  "Ajnara Le Garden",
  "Ajnara Homes",
  "Panchsheel Hynish",
  "Renox Thrive",
  "Lotus Panache",
  "Parx Laureate",
  "Galaxy Vega",
  "Oxford Square",
  "Cherry County",
  "Unitech Horizon",
  "Divine Meadows",
];

export const LEAD_SOURCES = [
  "WhatsApp",
  "Referral",
  "Society notice / flyer",
  "Website booking",
  "Repeat customer",
  "Walk-in",
  "Other",
];

const societyKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// The society named in an address; longer names win ("Ajnara Le Garden" over shorter ones)
export function detectSociety(address: string | null | undefined, extra: string[] = []): string | null {
  const key = societyKey(address || "");
  if (!key) return null;
  return [...new Set([...KNOWN_SOCIETIES, ...extra.filter(Boolean)])]
    .map((name) => ({ name, k: societyKey(name) }))
    .filter((n) => n.k.length >= 4)
    .sort((a, b) => b.k.length - a.k.length)
    .find((n) => key.includes(n.k))?.name ?? null;
}
