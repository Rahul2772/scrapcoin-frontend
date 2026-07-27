export const SUPPORTED_PINCODES = [
  "201301",
  "201303",
  "201304",
  "201305",
  "201306",
  "201307",
  "201308",
  "201309",
  "201310",
  "201312",
  "201313",
  "201318",
  "203207",
  "201010",
  "201014",
] as const;

export const PINCODE_LOCATION_MAP: Record<string, string> = {
  "201301": "Noida H.O., Sectors 12, 16, 18, 27",
  "201303": "Noida Sectors 30, 37, 45, 126",
  "201304": "Maharishi Nagar, Noida",
  "201305": "NEPZ / Sectors near NEPZ",
  "201307": "Noida Sectors 34, 55",
  "201308": "Noida Sector 63 / Greater Noida (Alpha, Beta, Gamma, Chi, Omega)",
  "201309": "Noida Sectors 62, 63",
  "201313": "Noida Sectors 110–168 range",
  "201306": "Surajpur, Ecotech, Knowledge Park, Gaur City (Greater Noida West)",
  "201310": "Pari Chowk, Alpha 1, Omega, Knowledge Park II",
  "201312": "GBU Area / Gautam Buddha University belt",
  "203207": "Dadri, Greater Noida",
  "201318": "Core Noida Extension (Gaur City 1 & 2, Sectors 1, 4, 10, 16)",
  "201010": "Indirapuram (Ghaziabad)",
  "201014": "Indirapuram (Ahinsa, Niti, Gyan Khand, Shipra Sun City)",
};

export function isPincodeSupported(pincode: unknown): boolean {
  if (pincode === null || pincode === undefined) return false;
  const str = String(pincode).trim();
  return (SUPPORTED_PINCODES as readonly string[]).includes(str);
}

export function getPincodeLocation(pincode: unknown): string {
  if (pincode === null || pincode === undefined) return "";
  const str = String(pincode).trim();
  return PINCODE_LOCATION_MAP[str] || "";
}
