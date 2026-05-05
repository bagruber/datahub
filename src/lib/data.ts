// Dataset schema. Mirrors the JSON shape under /public/data.
// Keep this file the single source of truth — chart components read these types.

export type Codebook = Record<string, Record<string, string>>;

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

export type ChartItemBin = { label: string; vals: number[] };

export type ChartSpec =
  | {
      type: "bar_h";
      id: string;
      title: string;
      source: string;
      color?: string;
      items?: ChartItemBin[]; // when present, group categories into custom bins
      /** Object-keys mode: source value is `{key: anything}`; counting checks
       *  presence of each declared key. */
      slots?: { key: string; label: string }[];
      sort?: "asc" | "desc" | "given";
      /** Keep declared order instead of sorting by share. */
      preserveOrder?: boolean;
    }
  | {
      type: "bar_v";
      id: string;
      title: string;
      source: string;
      color?: string;
      items?: ChartItemBin[];
      slots?: { key: string; label: string }[];
      /** Default true for bar_v — pass `false` to sort by share. */
      preserveOrder?: boolean;
    }
  | {
      type: "likert6";
      id: string;
      title: string;
      items: { source: string; label: string; group?: string }[];
    }
  | {
      type: "likert5";
      id: string;
      title: string;
      items: { source: string; label: string; group?: string }[];
    }
  | {
      type: "price";
      id: string;
      title: string;
      scale: 5 | 6;
      items: { source: string; label: string }[];
    }
  | {
      type: "diverging3";
      id: string;
      title: string;
      source: string;
      options: { value: number; label: string; color: string }[];
    }
  | {
      type: "pie";
      id: string;
      title: string;
      source: string;
      labels?: string[];
      values?: number[];
      colors?: string[];
      /** Grouped slices — each can merge multiple codes (like bar_h items). */
      items?: { label: string; vals: number[]; color?: string }[];
    }
  | {
      type: "likert5_group";
      id: string;
      title: string;
      dimLabels: string[];
      invertedDims?: number[];
      innovations: { key: string; name: string; sources: string[] }[];
    }
  | {
      type: "radar";
      id: string;
      title: string;
      dimLabels: string[];
      invertedDims?: number[];
      innovations: { key: string; name: string; color: string; sources: string[] }[];
    }
  | {
      type: "correlation";
      id: string;
      title: string;
      sources: { source: string; label: string }[];
    }
  | {
      type: "venn2";
      id: string;
      title: string;
      source: string;
      values: number[]; // [codeA, codeB]
      labels: string[];
      colors?: string[];
    }
  | {
      type: "venn3";
      id: string;
      title: string;
      source: string;
      values: number[]; // [codeA, codeB, codeC]
      labels: string[]; // 3 entries
      colors?: string[]; // 3 entries
    };

export type Section = {
  id: string;
  title: string;
  order: number;
  text?: string;
  charts: ChartSpec[];
};

export type DatasetMeta = {
  id: string;
  title: string;
  year: number;
  n: number;
  description?: string;
};

export type Dataset = {
  meta: DatasetMeta;
  codebook: Codebook;
  filters: FilterSpec[];
  sections: Section[];
  // Records hold heterogeneous values: numeric codes, code arrays for
  // multi-select, free-text strings, and the occasional `{key: rank}` object
  // (e.g. Bahnhof time slots). `unknown` lets chart components narrow per use.
  records: Record<string, unknown>[];
};

export type ManifestEntry = { id: string; file: string; title: string; year: number; n: number };
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
