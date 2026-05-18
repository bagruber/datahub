// One module, one set of counting primitives. Every chart used to ship its
// own buildRows/buildSlices/buildBars; they all do the same handful of things
// with slight differences. These functions are the canonical versions.
//
// Each returns `{ rows, n }` where `n` is the answered denominator for that
// source (= records where the field is present at all). Charts compute shares
// as `count / n` and reach for the same row shape.

import { asArray, asScalar, isAnswered } from "./record";

export type AggRow = { label: string; count: number; share: number };
export type AggResult = { rows: AggRow[]; n: number };

/** Records where the source field is answered. Centralises the denominator. */
export function answeredCount(records: ReadonlyArray<Record<string, unknown>>, source: string): number {
  let n = 0;
  for (const r of records) if (isAnswered(r[source])) n++;
  return n;
}

/** Count per codebook entry. Multi-select arrays contribute to every code they
 *  contain (totals can exceed n × 100 %). */
export function countByCodebook(
  records: ReadonlyArray<Record<string, unknown>>,
  source: string,
  codebook: Record<string, string>,
): AggResult {
  const keys = Object.keys(codebook).map(Number).filter((k) => Number.isFinite(k));
  const counts = new Map<number, number>(keys.map((k) => [k, 0]));
  const n = answeredCount(records, source);
  for (const r of records) {
    const v = r[source];
    if (!isAnswered(v)) continue;
    const list = Array.isArray(v) ? asArray(v) : [asScalar(v)].filter((x): x is number => x !== null);
    for (const x of list) {
      if (counts.has(x)) counts.set(x, counts.get(x)! + 1);
    }
  }
  const rows: AggRow[] = keys.map((k) => {
    const count = counts.get(k)!;
    return { label: codebook[String(k)], count, share: n === 0 ? 0 : count / n };
  });
  return { rows, n };
}

/** Count per "bin" of codes. Each record contributes once if any of the bin's
 *  vals match (handles multi-select fields). */
export function countByBins(
  records: ReadonlyArray<Record<string, unknown>>,
  source: string,
  bins: ReadonlyArray<{ label: string; vals: number[] }>,
): AggResult {
  const n = answeredCount(records, source);
  const rows = bins.map((b) => {
    const set = new Set(b.vals);
    let count = 0;
    for (const r of records) {
      const v = r[source];
      if (!isAnswered(v)) continue;
      if (Array.isArray(v)) {
        if (asArray(v).some((x) => set.has(x))) count++;
      } else {
        const s = asScalar(v);
        if (s !== null && set.has(s)) count++;
      }
    }
    return { label: b.label, count, share: n === 0 ? 0 : count / n };
  });
  return { rows, n };
}

/** Object-keys mode: source is an object; each declared key counts a record
 *  iff that key is present in the object. Used by Bahnhof Uhrzeiten. */
export function countByObjectKeys(
  records: ReadonlyArray<Record<string, unknown>>,
  source: string,
  slots: ReadonlyArray<{ key: string; label: string }>,
): AggResult {
  const n = answeredCount(records, source);
  const rows = slots.map((s) => {
    let count = 0;
    for (const r of records) {
      const v = r[source];
      if (v && typeof v === "object" && !Array.isArray(v)) {
        if (Object.prototype.hasOwnProperty.call(v, s.key)) count++;
      }
    }
    return { label: s.label, count, share: n === 0 ? 0 : count / n };
  });
  return { rows, n };
}

/** Likert/ordinal distribution: returns counts and shares for each scale step. */
export function distributionOnScale(
  records: ReadonlyArray<Record<string, unknown>>,
  source: string,
  scale: ReadonlyArray<number>,
): { counts: number[]; shares: number[]; n: number } {
  const counts = scale.map(() => 0);
  let n = 0;
  for (const r of records) {
    const v = asScalar(r[source]);
    if (v === null) continue;
    const i = scale.indexOf(v);
    if (i < 0) continue;
    n++;
    counts[i]++;
  }
  const shares = counts.map((c) => (n === 0 ? 0 : c / n));
  return { counts, shares, n };
}

/** Mean of a scalar source. */
export function meanOf(
  records: ReadonlyArray<Record<string, unknown>>,
  source: string,
): { mean: number; n: number } {
  let s = 0;
  let n = 0;
  for (const r of records) {
    const v = asScalar(r[source]);
    if (v === null) continue;
    s += v;
    n++;
  }
  return { mean: n === 0 ? NaN : s / n, n };
}
