// Farben und Maße der Diagramme, eine Quelle für alle Komponenten. SVG-Attribute
// lesen keine CSS-Variablen, deshalb stehen die Hexwerte hier.
//
// Probe Diagramme, vorläufig (18.09.2026): Jede Farbe hat genau eine Aufgabe —
// unterscheiden, werten oder ordnen. Die Hexwerte in public/data/*.json werden
// bewusst ignoriert; sie stammen aus den ETL-Skripten und kennen die Formsprache
// nicht. Geprüft mit dem Palettenprüfer: Helligkeitsband, Mindestbuntheit,
// Abstand benachbarter Töne bei Rot- und Grünschwäche, Kontrast auf Weiß.

export const INK = "#1c1c1c";
export const INK_SOFT = "#555555";
export const INK_MUTED = "#6f6b63";
export const INK_LINE = "#e4e0d7";
/** Gitterlinien: eine Stufe über dem Grund, nie kräftiger. */
export const GITTER = "#ece8df";
/** Nulllinie und Kerben: etwas kräftiger als das Gitter. */
export const NULLLINIE = "#b9b3a6";

export const CREAM = "#faf7f2";
export const CREAM_DARK = "#f1ece1";

/** Die Hausfarbe. Bedienung, Links, Marke — und die Wahlseite. */
export const ACCENT_RED = "#c8102e";

/**
 * Unterscheiden: feste Reihenfolge, Slot für Slot vergeben, nie im Kreis
 * weitergedreht. Schwächstes Nachbarpaar ΔE 20,8 bei Farbschwäche; die ersten
 * drei bestehen auch jeder gegen jeden (für Venn und Streudiagramme).
 * Grün steht hinten, weil Rot daneben knapp trennt und als Wertung gelesen wird.
 */
export const SERIE = [
  "#c0041e", // Rot
  "#1196c1", // Isar-Blau
  "#ab821e", // Gold
  "#525ab8", // Indigo
  "#cc6c00", // Orange
  "#8b569c", // Purpur
  "#0f994a", // Grün
] as const;

/** Eine einzelne Reihe trägt Isar-Blau: ruhig und ohne Wertung. */
export const EINZEL = SERIE[1];

/** Werten: zwei Arme, außen kräftig, innen hell. Rot gegen Isar-Blau statt
 *  rot gegen grün, das bei Grünschwäche zusammenfällt. */
export const SKALA6 = ["#a21a20", "#ca5650", "#de958e", "#72b5d3", "#1b8cb3", "#00617f"];
/** Fünf Stufen mit warmem Grau in der Mitte. */
export const SKALA5 = ["#a21a20", "#ca5650", "#d9d4ca", "#1b8cb3", "#00617f"];

/** Ordnen mit Mitte: fünf Stufen, die mittlere neutral („angemessen“). */
export const GOLD_STUFEN = ["#cfac64", "#b58f3c", "#d9d4ca", "#7b5b01", "#5c4304"];
/** Ordnen ohne Mitte: durchgehend von hell nach dunkel, für Anteilsbalken. */
export const GOLD_REIHE = ["#cfac64", "#b58f3c", "#99741b", "#7b5b01", "#5c4304"];
/** Sechs Stufen desselben Tons, für Skalen mit sechs Antworten. */
export const GOLD_STUFEN6 = ["#ddc08a", "#c8a457", "#b08a33", "#94711a", "#7a5c0d", "#5c4304"];
/** Die Mitte einer ungeraden Ordnungsskala bleibt neutral. */
export const NEUTRAL = "#d9d4ca";

/** Korrelation: gegenläufig rot, kein Zusammenhang neutral, gleichgerichtet blau. */
export const KORRELATION_RAMPE = ["#a21a20", "#f4f1ea", "#00617f"];

// Radien für SVG-Marken. Karten nutzen die entsprechenden Tailwind-Klassen.
export const RADIUS = {
  bar: 4,        // Balken und Säulen: runde Spitze, eckige Basis
  cell: 4,       // Zellen der Korrelation, Ecken im Ring
  chip: 4,       // Hintergrund der Chip-Beschriftung
  card: 8,       // Diagrammkarten
  hero: 8,       // Datensatz-Kacheln, Popover
} as const;

// Strichstärken. Gefüllte Datenmarken tragen keinen Rand; Umrisse (Venn,
// Spinnennetz) nutzen die eigene Farbe der Marke.
export const STROKE = {
  none: "none",
  outline: 1.5,      // Venn-Umrisse, Spinnennetz
  outlineHover: 2.5, // überfahren oder fokussiert
  centerRule: 1,     // Mitte der Skalen
  cardBorder: 1,     // ink-line, über CSS
} as const;

/** Kerben an der Mitte der Skalen: leiser als die Nulllinie, aber sichtbar. */
export const KERBE = "#9a9488";
