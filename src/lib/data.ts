// Dataset schema + loader. The chart-spec discriminated union lives in
// `./chartSpec` because it grows faster than the rest. Backwards-compatible
// re-export keeps existing `import { ChartSpec } from "@/lib/data"` working.

import type { ChartSpec } from "./chartSpec";

export type { ChartSpec, ChartItemBin } from "./chartSpec";

export type Codebook = Record<string, Record<string, string>>;

// ── Filters ────────────────────────────────────────────────────────────
export type FilterRangeGroup = { label: string; min: number; max: number };
export type FilterCode = string | number;
/** Eine Filteroption trifft einen Code oder mehrere: So lassen sich sehr kleine
 *  Gruppen in der Darstellung zusammenlegen, ohne die Daten zu ändern. */
export type FilterOption = FilterCode | FilterCode[];

export type FilterSpec =
  | {
      key: string;
      source: string;
      type: "histogram" | "toggle" | "select";
      label: string;
      labels: string[];
      /** Code per option. Some legacy datasets use `values` instead. */
      categories?: FilterOption[];
      values?: FilterOption[];
    }
  | {
      key: string;
      source: string;
      type: "histogram_range";
      label: string;
      groups: FilterRangeGroup[];
    };

/** Resolve the code list for a categorical filter (handles `values` alias). */
export function filterCodes(spec: FilterSpec): FilterOption[] {
  if (spec.type === "histogram_range") return [];
  return spec.categories ?? spec.values ?? [];
}

/** Compare a record value against a filter option, tolerant of "3" vs 3. */
export function codeMatches(recordValue: unknown, code: FilterOption): boolean {
  if (recordValue === null || recordValue === undefined) return false;
  if (Array.isArray(code)) return code.some((c) => String(recordValue) === String(c));
  return String(recordValue) === String(code);
}

// ── Sections & dataset shape ──────────────────────────────────────────
export type Section = {
  id: string;
  title: string;
  order: number;
  text?: string;
  charts: ChartSpec[];
  type?: string;
  /** Ausgewertete Themen aus offenen Rückmeldungen (type "open_themes"). */
  themes?: { label: string; desc: string; icon?: string }[];
};

/** Kind of dataset.
 *  - "survey":    citizen survey with raw records, demographic filters, etc.
 *  - "statistik": pre-aggregated official data (e.g. Bayerisches Landesamt
 *                 für Statistik). No records, no filters; chart data inline.
 *  - "eigen":     hier zusammengetragen und gerechnet, keine fremde Erhebung
 *                 (z. B. aus offenen Geodaten abgeleitet). */
export type DatasetKind = "survey" | "statistik" | "eigen";

export type DatasetMeta = {
  id: string;
  title: string;
  year: number;
  n: number;
  description?: string;
  /** Source attribution shown on the dataset page (statistik kind). */
  source?: string;
};

export type PressOutlet = "sz" | "merkur" | "br" | "mz" | "idowa";

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
  /** "survey" (default), "statistik", "eigen" oder "studie" — steuert die Card.
   *  Eine Studie ist ein Bericht ohne Records, siehe @/lib/studie. */
  kind?: DatasetKind | "studie";
  /** Für Statistik, Wahlen und Studien: ein Satz und die Quelle auf der
   *  Kachel statt der Zahl der Datenpunkte. */
  satz?: string;
  quelle?: string;
};
export type Manifest = { datasets: ManifestEntry[] };

const DATA_BASE = `${import.meta.env.BASE_URL}data/`;

// Immer beim Server nachfragen (ETag, im Normalfall nur ein 304). Hostinger
// schickt kein Cache-Control; Browser hielten ein wochenalt unverändertes
// Manifest dann tagelang für frisch, und ein neuer Datensatz war „nicht
// gefunden“ (25.11.2026, Studie Stadtwebsite).
const FRISCH: RequestInit = { cache: "no-cache" };

export async function loadManifest(): Promise<Manifest> {
  const res = await fetch(`${DATA_BASE}manifest.json`, FRISCH);
  if (!res.ok) throw new Error(`manifest.json: ${res.status}`);
  return res.json();
}

export async function loadDataset<T = Dataset>(file: string): Promise<T> {
  const res = await fetch(`${DATA_BASE}${file}`, FRISCH);
  if (!res.ok) throw new Error(`${file}: ${res.status}`);
  return res.json();
}
