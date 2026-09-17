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
 *  getöntem Grund übernimmt deshalb ink-soft (6,4:1).
 *
 *  Probe Formsprache, vorläufig (17.09.2026): Klecks plus Kategoriezeile. Die
 *  Gründe gelten erst ab sm; darunter stehen die Einträge als Register ohne
 *  Rahmen, und die Kategoriezeile allein trägt die Art. */
import { Bank, ChartLineUp, ClipboardText, type Icon } from "@phosphor-icons/react";

export type CardKind = "umfrage" | "statistik" | "eigen";

export const CARD_KIND: Record<
  CardKind,
  {
    label: string;
    icon: Icon;
    /** Dunkle Tönung für Icon und Kategoriezeile, helle für die Klecksfläche. */
    farbe: { text: string; flaeche: string };
    surface: string;
    meta: string;
    einheit: string;
  }
> = {
  umfrage: {
    label: "Umfrage",
    icon: ClipboardText,
    farbe: { text: "var(--color-red-700)", flaeche: "var(--color-red-100)" },
    surface: "sm:bg-white sm:border-ink-line",
    meta: "text-ink-muted",
    einheit: "Antworten",
  },
  statistik: {
    label: "Amtliche Statistik",
    icon: Bank,
    farbe: { text: "var(--color-gold-700)", flaeche: "var(--color-gold-200)" },
    surface: "sm:bg-gold-100 sm:border-gold-200",
    meta: "text-ink-soft",
    einheit: "Datenpunkte",
  },
  eigen: {
    label: "Eigene Auswertung",
    icon: ChartLineUp,
    farbe: { text: "#6b3e7a", flaeche: "#e2d2e8" },
    surface: "sm:card-hatch sm:border-ink-line",
    meta: "text-ink-soft",
    einheit: "Werte",
  },
};
