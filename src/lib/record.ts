// Narrow helpers around `record[source]` which is typed as `unknown`. Every
// chart used to repeat the same `typeof v === "number"` ceremony; using these
// keeps the chart code focused on its own logic.

/** A record field is "answered" if it isn't null/undefined/"", and (for array
 *  values) isn't empty. Object values count as answered if they have any keys. */
export function isAnswered(v: unknown): boolean {
  if (v === null || v === undefined || v === "") return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v as object).length > 0;
  return true;
}

/** Returns a numeric value or null. Use for scalar Likert/code fields. */
export function asScalar(v: unknown): number | null {
  return typeof v === "number" ? v : null;
}

/** Returns the array of numeric codes for a multi-select field, [] if absent. */
export function asArray(v: unknown): number[] {
  if (!Array.isArray(v)) return [];
  const out: number[] = [];
  for (const x of v) if (typeof x === "number") out.push(x);
  return out;
}

/** Returns the keys of an `{key: anything}` object field (e.g. Bahnhof times). */
export function asObjectKeys(v: unknown): string[] {
  if (!v || typeof v !== "object" || Array.isArray(v)) return [];
  return Object.keys(v as Record<string, unknown>);
}
