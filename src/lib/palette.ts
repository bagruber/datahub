// Centralised colour tokens. Single source of truth for hex values used in
// chart components — keeps swapping the brand red one edit instead of grep.
// Mirrors the CSS variables in src/index.css; SVG fill attributes can't read
// CSS vars portably, so we keep both.

export const INK = "#1c1c1c";
export const INK_SOFT = "#555555";
export const INK_MUTED = "#888888";
export const INK_LINE = "#e4e0d7";

export const CREAM = "#faf7f2";
export const CREAM_DARK = "#f1ece1";

export const ACCENT_RED = "#c8102e";
export const ACCENT_RED_DEEP = "#9b0000";
export const ACCENT_GOLD = "#b39f7a";
export const ACCENT_GOLD_DARK = "#968b69";

// Diverging Likert ramps. Index 0 = worst → last = best.
export const LIKERT6_RAMP = ["#b00e28", "#d96a4f", "#e8b878", "#c9d39e", "#82b67c", "#3f8c52"];
export const LIKERT5_RAMP = ["#b00e28", "#d96a4f", "#d6cfc1", "#82b67c", "#3f8c52"];

// Correlation ramp: red (-1) → cream (0) → green (+1)
export const CORRELATION_RAMP = ["#b00e28", "#f6ecd5", "#3f8c52"];

// Generic categorical fallback (pie, charts that ship no colors).
export const CATEGORICAL = [
  "#c8102e",
  "#b8964e",
  "#5b9bd5",
  "#78be1e",
  "#9b59b6",
  "#00b4d8",
  "#e8b878",
];

// Radius scale for SVG/chart marks. Cards use the equivalent Tailwind classes.
export const RADIUS = {
  bar: 2,        // bars in any bar/stack chart, filter mini-bars
  cell: 4,       // heatmap and correlation cells, pie/donut corners
  chip: 4,       // chip annotation backgrounds
  card: 8,       // chart cards, stat cards (matches rounded-lg)
  hero: 12,      // dataset cards, popovers (matches rounded-xl)
} as const;

// Stroke logic. Filled data marks don't get strokes by default; outline shapes
// (radar polygons, venn circles) use the mark's own colour.
export const STROKE = {
  none: "none",
  outline: 1,        // venn circles, radar polygons
  outlineHover: 2.5, // when hovered/focused
  centerRule: 1.25,  // diverging-bar zero line
  cardBorder: 1,     // ink-line, applied via CSS
} as const;
