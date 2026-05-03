// Aggregations over Dataset.records. All return shares (0..1) by default.
// Records may have scalar or array values; nulls mean "not answered".

import type { Dataset } from "./data";

type Rec = Dataset["records"][number];

export function isAnswered(v: unknown): boolean {
  if (v === null || v === undefined || v === "") return false;
  if (Array.isArray(v) && v.length === 0) return false;
  return true;
}

/** Records with at least one of `vals` for `source` (handles array fields). */
export function shareWhereInBin(records: Rec[], source: string, vals: number[]): number {
  const set = new Set(vals);
  let answered = 0;
  let hits = 0;
  for (const r of records) {
    const v = r[source];
    if (!isAnswered(v)) continue;
    answered++;
    if (Array.isArray(v)) {
      if (v.some((x) => typeof x === "number" && set.has(x))) hits++;
    } else if (typeof v === "number" && set.has(v)) {
      hits++;
    }
  }
  return answered === 0 ? 0 : hits / answered;
}

/** Share per codebook key (each entry = one bar). For array fields, a record
 *  contributes to every key it contains — totals can exceed 100%. */
export function sharesByCodebook(
  records: Rec[],
  source: string,
  codebook: Record<string, string>,
): { key: number; label: string; share: number }[] {
  const keys = Object.keys(codebook).map(Number);
  let answered = 0;
  const counts = new Map<number, number>();
  keys.forEach((k) => counts.set(k, 0));
  for (const r of records) {
    const v = r[source];
    if (!isAnswered(v)) continue;
    answered++;
    const list = Array.isArray(v) ? v : [v];
    for (const x of list) {
      if (typeof x === "number" && counts.has(x)) counts.set(x, counts.get(x)! + 1);
    }
  }
  return keys.map((k) => ({
    key: k,
    label: codebook[String(k)],
    share: answered === 0 ? 0 : counts.get(k)! / answered,
  }));
}

/** Stacked Likert distribution for a scalar source over fixed scale categories. */
export function likertDistribution(
  records: Rec[],
  source: string,
  scaleKeys: number[],
): { key: number; share: number }[] {
  let answered = 0;
  const counts = new Map<number, number>();
  scaleKeys.forEach((k) => counts.set(k, 0));
  for (const r of records) {
    const v = r[source];
    if (!isAnswered(v)) continue;
    if (typeof v !== "number" || !counts.has(v)) continue;
    answered++;
    counts.set(v, counts.get(v)! + 1);
  }
  return scaleKeys.map((k) => ({ key: k, share: answered === 0 ? 0 : counts.get(k)! / answered }));
}

/** Mean of a scalar source (ignores nulls). */
export function meanOf(records: Rec[], source: string): number {
  let sum = 0;
  let n = 0;
  for (const r of records) {
    const v = r[source];
    if (typeof v === "number") {
      sum += v;
      n++;
    }
  }
  return n === 0 ? NaN : sum / n;
}
