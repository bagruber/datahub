/** Die drei Herkunftsarten auf der Startseite.
 *
 *  Die Unterscheidung ist inhaltlich, nicht dekorativ: Woher kommen die
 *  Zahlen? Deshalb wandert jeweils der ganze Grundton mit, statt einen
 *  Farbstreifen an eine Kante zu heften.
 *
 *  - umfrage:   Die Stadt hat gefragt, Menschen haben geantwortet.
 *               Weißer Grund, roter Akzent — die Hausfarbe.
 *  - statistik: Amtlich erhoben, von uns nur aufbereitet.
 *               Pergamentener Grund, goldener Akzent.
 *  - eigen:     Hier zusammengetragen und gerechnet, keine fremde Erhebung.
 *               Feine Schraffur als Zeichen des Gemachten — eine Textur
 *               statt einer weiteren Farbe, damit die Palette eng bleibt.
 *
 *  ink-muted käme auf gold-100 nur auf 3,0:1 und damit unter WCAG AA — auf
 *  getöntem Grund übernimmt deshalb ink-soft (6,4:1). */
export type CardKind = "umfrage" | "statistik" | "eigen";

export const CARD_KIND: Record<
  CardKind,
  { surface: string; eyebrow: string; meta: string; titleHover: string; label: string }
> = {
  umfrage: {
    surface: "bg-white border-ink-line",
    eyebrow: "eyebrow text-ink-muted",
    meta: "text-ink-muted",
    titleHover: "group-hover:text-red-700",
    label: "Umfrage",
  },
  statistik: {
    surface: "bg-gold-100 border-gold-200",
    eyebrow: "eyebrow text-gold-700",
    meta: "text-ink-soft",
    titleHover: "group-hover:text-gold-700",
    label: "Amtliche Statistik",
  },
  eigen: {
    surface: "card-hatch border-ink-line",
    eyebrow: "eyebrow text-ink-soft",
    meta: "text-ink-soft",
    titleHover: "group-hover:text-red-700",
    label: "Eigene Auswertung",
  },
};
