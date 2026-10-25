export interface ExpenseCategoryDef {
  value: string;
  name: string;
  label: string;
  shortLabel?: string;
  badgeClass: string;
}

export const EXPENSE_CATEGORIES: readonly ExpenseCategoryDef[] = [
  {
    value: "marketing_offline",
    name: "Marketing – Offline",
    label: "Marketing – Offline",
    shortLabel: "Marketing Offline",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  },
  {
    value: "marketing_online",
    name: "Marketing – Online",
    label: "Marketing – Online",
    shortLabel: "Marketing Online",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
  },
  {
    value: "internet_telecom",
    name: "Internet & Telecommunication",
    label: "Internet & Telecommunication",
    shortLabel: "Internet & Telecom",
    badgeClass: "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800",
  },
  {
    value: "subscription",
    name: "Subscription",
    label: "Subscription",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  },
  {
    value: "travel",
    name: "Travel",
    label: "Travel",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  },
  {
    value: "transport",
    name: "Transport",
    label: "Transport",
    badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
  },
  {
    value: "print",
    name: "Print",
    label: "Print",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
  },
  {
    value: "rent",
    name: "Rent",
    label: "Rent",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  {
    value: "miscellaneous",
    name: "Miscellaneous",
    label: "Miscellaneous",
    badgeClass: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  },
] as const;

export const LEGACY_EXPENSE_CATEGORIES: readonly ExpenseCategoryDef[] = [
  {
    value: "marketing",
    name: "Marketing",
    label: "Marketing (legacy)",
    shortLabel: "Marketing",
    badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
  },
] as const;

export function getCategoryBadge(name?: string | null): {
  label: string;
  fullLabel: string;
  className: string;
} {
  if (!name) {
    return {
      label: "—",
      fullLabel: "Uncategorised",
      className: "bg-muted text-muted-foreground border-border",
    };
  }

  const trimmed = name.trim().toLowerCase();
  const found = [...EXPENSE_CATEGORIES, ...LEGACY_EXPENSE_CATEGORIES].find(
    (c) => c.name.toLowerCase() === trimmed || c.value.toLowerCase() === trimmed
  );

  if (found) {
    return {
      label: found.shortLabel || found.label,
      fullLabel: found.label,
      className: found.badgeClass,
    };
  }

  return {
    label: name,
    fullLabel: name,
    className: "bg-muted text-muted-foreground border-border",
  };
}

export function sortCategories<T extends { name: string }>(cats: T[]): T[] {
  const orderMap = new Map(
    EXPENSE_CATEGORIES.map((c, idx) => [c.name.toLowerCase(), idx])
  );
  return [...cats].sort((a, b) => {
    const aIdx = orderMap.has(a.name.toLowerCase()) ? orderMap.get(a.name.toLowerCase())! : 999;
    const bIdx = orderMap.has(b.name.toLowerCase()) ? orderMap.get(b.name.toLowerCase())! : 999;
    if (aIdx !== bIdx) return aIdx - bIdx;
    return a.name.localeCompare(b.name);
  });
}
