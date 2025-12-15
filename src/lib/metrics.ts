import { differenceInCalendarDays, parseISO } from "date-fns";
import type { RawRow } from "./gviz";

export type KPI = {
  total: number;
  completed: number;
  inProgress: number;
  scheduled: number;
  accepted: number;
  rejected: number;
  highPriority: number;
  medianAgeDays: number | null;
};

function norm(s: string) {
  return (s || "").trim().toLowerCase();
}

export function computeKpis(rows: RawRow[]): KPI {
  const total = rows.length;
  const completed = rows.filter(r => norm(r.status) === "completed").length;
  const inProgress = rows.filter(r => norm(r.status) === "in progress").length;
  const scheduled = rows.filter(r => norm(r.status) === "scheduled").length;
  const accepted = rows.filter(r => norm(r.status) === "accepted").length;
  const rejected = rows.filter(r => norm(r.status) === "rejected").length;
  const highPriority = rows.filter(r => norm(r.priority) === "high").length;

  // Age in days from submissionDate to today, median
  const ages = rows
    .map(r => {
      const d = norm(r.submissionDate);
      if (!d) return null;
      try {
        const parsed = parseISO(d);
        return differenceInCalendarDays(new Date(), parsed);
      } catch {
        return null;
      }
    })
    .filter((x): x is number => typeof x === "number" && Number.isFinite(x))
    .sort((a,b) => a-b);

  let medianAgeDays: number | null = null;
  if (ages.length) {
    const mid = Math.floor(ages.length / 2);
    medianAgeDays = ages.length % 2 ? ages[mid] : Math.round((ages[mid - 1] + ages[mid]) / 2);
  }

  return { total, completed, inProgress, scheduled, accepted, rejected, highPriority, medianAgeDays };
}

export function countBy<T extends string>(rows: RawRow[], pick: (r: RawRow) => T) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const key = (pick(r) || "").toString();
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value);
}
