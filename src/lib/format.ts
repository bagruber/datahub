const intFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

export const fmtInt = (v: number) => intFormat.format(v);

// Probe Diagramme, vorläufig (18.09.2026): Prozent ohne Leerzeichen, also
// „52%“. Intl setzt dort ein schmales geschütztes Leerzeichen.
const ohneLuecke = (s: string) => s.replace(/\s+%/u, "%");

export const fmtPct = (v: number) =>
  ohneLuecke(new Intl.NumberFormat("de-DE", { style: "percent", maximumFractionDigits: 0 }).format(v));
export const fmtPct1 = (v: number) =>
  ohneLuecke(new Intl.NumberFormat("de-DE", { style: "percent", maximumFractionDigits: 1 }).format(v));
