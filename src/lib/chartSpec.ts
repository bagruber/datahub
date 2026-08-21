// All chart-spec discriminated-union variants. Imported by ChartRenderer and
// any tool that builds chart JSON. Kept in its own file because it grows
// faster than the rest of the dataset schema and pollutes diffs otherwise.

export type ChartItemBin = { label: string; vals: number[] };

// ── Wahlkarten ─────────────────────────────────────────────────────────
// Die Hexagon-Aufteilung wird im Schwesterprojekt bagruber/elections einmal
// vorgerechnet und kommt hier als fertige Zeichenware an: Mittelpunkte,
// Umrisse, Beschriftungsanker, alles schon im Koordinatenraum der viewBox.
// Der Browser projiziert also nichts mehr, er malt nur noch.

/**
 * Eine Zeile der Kreislegende. Das ist nicht zwingend ein einzelner
 * Wahlvorschlag: örtliche Listen sind zu Gruppen zusammengefasst, weil sich
 * neben den gesetzten Parteifarben nur vier weitere Farben unterbringen lassen,
 * die sich zuverlässig unterscheiden — und im Landkreis Freising treten
 * einunddreißig örtliche Listen an. Woraus eine Gruppe besteht, steht in `teile`.
 */
export type WahlListe = {
  id: string;
  name: string;
  /** Ausgeschriebener Name, wo die Quelle ihn führt. */
  lang?: string | null;
  farbe: string;
  sitze: number;
  /** In wie vielen Gemeinden sie angetreten ist. */
  gemeinden?: number;
  /** Stimmenanteil in Prozent. */
  anteil?: number | null;
  /** Gewinn oder Verlust in Prozentpunkten gegenüber der Wahl davor. */
  veraenderung?: number;
  /** Die einzelnen Wahlvorschläge hinter einer Gruppe, nach Gewicht. */
  teile?: { name: string; sitze: number }[];
  /** Sitze, die in der amtlichen Statistik keinen Listennamen tragen. */
  unbenannt?: number;
};

/** Das Ergebnis eines Wahlvorschlags in einer Gemeinde. */
export type WahlErgebnis = {
  id: string;
  /** Zeile der Kreislegende, zu der dieser Wahlvorschlag zählt. */
  gruppe?: string;
  farbe?: string;
  sitze: number | null;
  anteil: number | null;
  veraenderung?: number;
};

/** Das Ergebnis einer Gemeinde. `sitze` ist null, wo keine vergeben werden. */
export type WahlGebiet = {
  ags: string;
  name: string;
  sitze: number | null;
  /** "sammel": nur amtliche Sammelkategorien, örtliche Listen nicht benannt. */
  genauigkeit: "listen" | "sammel";
  quelle?: string;
  ergebnis: WahlErgebnis[];
};

/** Welche Angabe dieser Ebene aus welcher Quelle stammt. */
export type WahlHerkunft = {
  gemeinden: number;
  /** Gemeinden, deren Wahlleitung die Listen beim Namen nennt. */
  listen: number;
  /** Die übrigen, namentlich. */
  ohneListen: string[];
  /** Gemeinden mit prüfbarem Vorwahlvergleich. */
  veraenderung: number;
  vergleichswahl: string | null;
};

/** Eine Wahl, über die dieselbe Geometrie gefärbt werden kann. */
export type WahlEbene = {
  id: string;
  label: string;
  gebiete: WahlGebiet[];
  listen: WahlListe[];
  herkunft?: WahlHerkunft;
  vergleichswahl?: string | null;
};

export type WahlGeometrie = {
  viewBox: number[];
  radius: number;
  gebiete: {
    ags: string;
    name: string;
    /** Je Sitz ein Mittelpunkt samt der Fraktion, die darauf sitzt. */
    felder: [number, number, string][];
    umriss: string;
    beschriftung: { x: number; y: number; platz: number } | null;
  }[];
};

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
    }
  // ── Pre-aggregated chart types (used by Statistik kommunal) ─────────
  // These charts carry their data inline because the underlying dataset
  // doesn't have raw records — it's tabular time-series and snapshots
  // from official statistics.
  | {
      type: "line_series";
      id: string;
      title: string;
      series: { label: string; color?: string; data: { x: number; y: number }[] }[];
      xLabel?: string;
      yLabel?: string;
      /** When true, draws line markers (Plot.dot) at each data point. */
      markers?: boolean;
    }
  | {
      type: "stacked_column";
      id: string;
      title: string;
      /** Sub-categories that sum to a meaningful total. */
      series: { label: string; color?: string; data: { x: number; y: number }[] }[];
      xLabel?: string;
      yLabel?: string;
    }
  | {
      type: "hexmap";
      id: string;
      title: string;
      source: string;
      geometrie: WahlGeometrie;
      /** Mindestens eine; mehrere machen die Vergleichsebene umschaltbar. */
      ebenen: WahlEbene[];
      /**
       * Vorbehalte zum Gezeigten — unvollständig benannte örtliche Listen, oder
       * eine Zusammenfassung, die von der amtlichen Statistik abweicht. `ebene`
       * und `liste` schränken ein, wo ein Hinweis gilt.
       */
      hinweise?: { text: string; ebene?: string; liste?: string }[];
    }
  | {
      type: "gremium";
      id: string;
      title: string;
      source: string;
      geometrie: { viewBox: number[]; radius: number };
      /** Je Sitz: x, y, Liste, Name der gewählten Person. */
      sitze: [number, number, string, string | null][];
      listen: WahlListe[];
    }
  | {
      type: "pyramid";
      id: string;
      title: string;
      /** Bottom-to-top ordering: first entry sits at the bottom of the pyramid. */
      groups: { label: string; left: number; right: number }[];
      leftLabel: string;
      rightLabel: string;
      leftColor?: string;
      rightColor?: string;
    };
