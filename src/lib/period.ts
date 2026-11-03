// ── Period selection (Indian financial year: Apr–Mar) ─────────────────────────
export type PeriodMode = "all" | "month" | "quarter" | "year" | "custom";
export const PERIOD_MODES: { value: PeriodMode; label: string }[] = [
  { value: "all", label: "All" },
  { value: "month", label: "Monthly" },
  { value: "quarter", label: "Quarterly" },
  { value: "year", label: "Yearly" },
  { value: "custom", label: "Custom" },
];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function ymd(y: number, m: number, d: number) {
  const dt = new Date(y, m, d);
  return dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0");
}

// Month index counted from year 0, so offsets can cross year boundaries
function monthLabel(abs: number) {
  return MONTH_SHORT[abs % 12] + " " + Math.floor(abs / 12);
}

function fyLabel(fyStart: number) {
  return "FY " + fyStart + "-" + String(fyStart + 1).slice(2);
}

// Range and labels for the period `offset` steps back (0 = current) from today
export function periodRange(mode: "month" | "quarter" | "year", offset: number) {
  const now = new Date();
  const abs = now.getFullYear() * 12 + now.getMonth();

  if (mode === "month") {
    const start = abs + offset;
    return {
      from: ymd(Math.floor(start / 12), start % 12, 1),
      to: ymd(Math.floor(start / 12), (start % 12) + 1, 0),
      label: monthLabel(start),
      prevLabel: monthLabel(start - 1),
    };
  }

  if (mode === "quarter") {
    // FY quarters start in Apr, Jul, Oct, Jan
    const start = abs - (((abs - 3) % 3) + 3) % 3 + offset * 3;
    const end = start + 2;
    const qLabel = (s: number) => {
      const fyStart = s % 12 >= 3 ? Math.floor(s / 12) : Math.floor(s / 12) - 1;
      const q = Math.floor((((s % 12) - 3 + 12) % 12) / 3) + 1;
      return "Q" + q + " " + fyLabel(fyStart);
    };
    return {
      from: ymd(Math.floor(start / 12), start % 12, 1),
      to: ymd(Math.floor(end / 12), (end % 12) + 1, 0),
      label: qLabel(start) + " (" + MONTH_SHORT[start % 12] + "–" + monthLabel(end) + ")",
      prevLabel: qLabel(start - 3),
    };
  }

  const fyStart = (now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1) + offset;
  return {
    from: ymd(fyStart, 3, 1),
    to: ymd(fyStart + 1, 2, 31),
    label: fyLabel(fyStart) + " (Apr " + fyStart + "–Mar " + (fyStart + 1) + ")",
    prevLabel: fyLabel(fyStart - 1),
  };
}
