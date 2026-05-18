// All chart-spec discriminated-union variants. Imported by ChartRenderer and
// any tool that builds chart JSON. Kept in its own file because it grows
// faster than the rest of the dataset schema and pollutes diffs otherwise.

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
      /** Caption shown beneath the chart: "← left  …  right →".
       *  Defaults to ["sehr schlecht", "sehr gut"]. Override for e.g.
       *  importance scales: ["unwichtig", "sehr wichtig"]. */
      endpoints?: { left: string; right: string };
    }
  | {
      type: "likert5";
      id: string;
      title: string;
      items: { source: string; label: string; group?: string }[];
      endpoints?: { left: string; right: string };
    }
  | {
      type: "price";
      id: string;
      title: string;
      scale: 5 | 6;
      items: { source: string; label: string }[];
      endpoints?: { left: string; right: string };
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
      endpoints?: { left: string; right: string };
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
