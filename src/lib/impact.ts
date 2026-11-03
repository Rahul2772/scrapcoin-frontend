import { fetchCircularImpact, type CircularImpact } from "@/lib/api";

// Last known totals (3 Nov 2026), shown only if the API is slow or down
export const FALLBACK_IMPACT: CircularImpact = {
  grandTotalKg: 2155.5,
  breakdown: [
    { categoryId: "paper", label: "Paper & Cardboard", weightKg: 1152.5 },
    { categoryId: "plastics", label: "Plastics", weightKg: 380.0 },
    { categoryId: "metals", label: "Metals", weightKg: 486.0 },
    { categoryId: "e-waste", label: "E-Waste", weightKg: 92.0 },
    { categoryId: "others", label: "Others", weightKg: 45.0 },
  ],
};

/** Route loader for the homepage and /impact, so both pages render the same
 *  live total server-side instead of a hardcoded number. */
export async function loadImpact(): Promise<CircularImpact> {
  try {
    return await fetchCircularImpact(AbortSignal.timeout(2500));
  } catch {
    return FALLBACK_IMPACT;
  }
}
