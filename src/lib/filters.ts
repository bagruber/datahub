// URL-synced filter selections: each filter key maps to a list of selected
// option indices (0-based against `categories` for histogram/toggle, against
// `groups` for histogram_range). Empty list = "no filter applied".

import { codeMatches, filterCodes, type Dataset, type FilterSpec } from "./data";

export type FilterSelections = Record<string, number[]>;

const SEP = ",";

/** Parse selections from URLSearchParams. Unknown keys ignored. */
export function readSelections(
  params: URLSearchParams,
  filters: FilterSpec[],
): FilterSelections {
  const out: FilterSelections = {};
  for (const f of filters) {
    const raw = params.get(f.key);
    if (!raw) continue;
    const idxs = raw
      .split(SEP)
      .map((s) => parseInt(s, 10))
      .filter((n) => Number.isFinite(n));
    if (idxs.length) out[f.key] = idxs;
  }
  return out;
}

/** Mutate URLSearchParams to reflect selections. */
export function writeSelections(
  params: URLSearchParams,
  selections: FilterSelections,
  filters: FilterSpec[],
): URLSearchParams {
  const next = new URLSearchParams(params);
  for (const f of filters) {
    const sel = selections[f.key];
    if (!sel || sel.length === 0) next.delete(f.key);
    else next.set(f.key, sel.join(SEP));
  }
  return next;
}

/** Toggle one option index for a given filter; returns new selections. */
export function toggleOption(
  selections: FilterSelections,
  key: string,
  idx: number,
): FilterSelections {
  const cur = selections[key] ?? [];
  const next = cur.includes(idx) ? cur.filter((x) => x !== idx) : [...cur, idx].sort((a, b) => a - b);
  return { ...selections, [key]: next };
}

export function clearAll(): FilterSelections {
  return {};
}

export function activeCount(selections: FilterSelections): number {
  return Object.values(selections).reduce((n, v) => n + (v.length > 0 ? 1 : 0), 0);
}

/** Apply selections to records. AND across filters, OR within a filter. */
export function applyFilters(
  records: Dataset["records"],
  filters: FilterSpec[],
  selections: FilterSelections,
): Dataset["records"] {
  const active = filters.filter((f) => (selections[f.key]?.length ?? 0) > 0);
  if (active.length === 0) return records;

  return records.filter((r) =>
    active.every((f) => {
      const sel = selections[f.key]!;
      const v = r[f.source];
      if (f.type === "histogram_range") {
        if (typeof v !== "number") return false;
        return sel.some((i) => {
          const g = f.groups[i];
          return g && v >= g.min && v <= g.max;
        });
      }
      // histogram | toggle | select — match on category code (string|number)
      const all = filterCodes(f);
      const codes = sel.map((i) => all[i]).filter((x) => x !== undefined);
      if (Array.isArray(v)) return v.some((x) => codes.some((c) => codeMatches(x, c)));
      return codes.some((c) => codeMatches(v, c));
    }),
  );
}
