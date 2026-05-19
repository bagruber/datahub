// Dataset schema + loader. The chart-spec discriminated union lives in
// `./chartSpec` because it grows faster than the rest. Backwards-compatible
// re-export keeps existing `import { ChartSpec } from "@/lib/data"` working.

import type { ChartSpec } from "./chartSpec";

export type { ChartSpec, ChartItemBin } from "./chartSpec";

export type Codebook = Record<string, Record<string, string>>;

// ── Filters ────────────────────────────────────────────────────────────
export type FilterRangeGroup = { label: string; min: number; max: number };
export type FilterCode = string | number;

export type FilterSpec =
  | {
      key: string;
      source: string;
      type: "histogram" | "toggle" | "select";
      label: string;
      labels: string[];
      /** Code per option. Some legacy datasets use `values` instead. */
      categories?: FilterCode[];
      values?: FilterCode[];
    }
  | {
      key: string;
      source: string;
      type: "histogram_range";
      label: string;
      groups: FilterRangeGroup[];
    };

/** Resolve the code list for a categorical filter (handles `values` alias). */
export function filterCodes(spec: FilterSpec): FilterCode[] {
  if (spec.type === "histogram_range") return [];
  return spec.categories ?? spec.values ?? [];
}

/** Compare a record value against a filter code, tolerant of "3" vs 3. */
export function codeMatches(recordValue: unknown, code: FilterCode): boolean {
  if (recordValue === null || recordValue === undefined) return false;
  return String(recordValue) === String(code);
}

// ── Sections & dataset shape ──────────────────────────────────────────
export type Section = {
  id: string;
  title: string;
  order: number;
  text?: string;
  charts: ChartSpec[];
};

/** Kind of dataset.
 *  - "survey":    citizen survey with raw records, demographic filters, etc.
 *  - "statistik": pre-aggregated official data (e.g. Bayerisches Landesamt
 *                 für Statistik). No records, no filters; chart data inline. */
export type DatasetKind = "survey" | "statistik";

export type DatasetMeta = {
  id: string;
  title: string;
  year: number;
  n: number;
  description?: string;
  /** Source attribution shown on the dataset page (statistik kind). */
  source?: string;
};

export type PressOutlet = "sz" | "merkur" | "mz" | "idowa";

export type PressLink = {
  outlet: PressOutlet;
  title: string;
  /** ISO date or German display date — both fine; rendered with toLocaleDateString. */
  date: string;
  url: string;
  /** Optional thumbnail path under /public/press/thumbs/ (or full URL). */
  thumb?: string;
};

export type Dataset = {
  meta: DatasetMeta;
  /** Defaults to "survey" when absent (backwards compat). */
  kind?: DatasetKind;
  codebook: Codebook;
  filters: FilterSpec[];
  sections: Section[];
  /** Optional press coverage list — rendered as a "Pressestimmen" section
   *  at the bottom of the dataset page when present. */
  press?: PressLink[];
  // Records hold heterogeneous values: numeric codes, code arrays for
  // multi-select, free-text strings, and the occasional `{key: rank}` object
  // (e.g. Bahnhof time slots). `unknown` lets chart components narrow per use.
  records: Record<string, unknown>[];
};

// ── Manifest + loaders ────────────────────────────────────────────────
export type ManifestEntry = {
  id: string;
  file: string;
  title: string;
  year: number;
  n: number;
  /** "survey" (default) or "statistik" — controls home-card styling. */
  kind?: DatasetKind;
};
export type Manifest = { datasets: ManifestEntry[] };

const DATA_BASE = `${import.meta.env.BASE_URL}data/`;

export async function loadManifest(): Promise<Manifest> {
  const res = await fetch(`${DATA_BASE}manifest.json`);
  if (!res.ok) throw new Error(`manifest.json: ${res.status}`);
  return res.json();
}

export async function loadDataset(file: string): Promise<Dataset> {
  const res = await fetch(`${DATA_BASE}${file}`);
  if (!res.ok) throw new Error(`${file}: ${res.status}`);
  return res.json();
}
