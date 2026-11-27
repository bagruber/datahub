import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { countByBins, countByCodebook, countByObjectKeys, type AggResult } from "@/lib/aggregate";
import { fmtInt, fmtPct } from "@/lib/format";
import { BALKEN, EINZEL, GITTER, INK, INK_MUTED, NAME_OBEN } from "@/lib/palette";
import { useIsMobile } from "@/lib/useIsMobile";
import { ChartFrame } from "./ChartFrame";
import { ChartTable } from "./ChartTable";
import type { Codebook, Dataset } from "@/lib/data";

type Props = {
  records: Dataset["records"];
  codebook: Codebook;
  source: string;
  items?: { label: string; vals: number[] }[];
  slots?: { key: string; label: string }[];
  title?: string;
  preserveOrder?: boolean;
  /** Schon gezählte Werte statt Records, etwa aus einer Studie ohne Einzelantworten. */
  daten?: AggResult;
};

// Same constants for every BarH on the page → bar thickness identical and
// the 0 % line lands at the same x across charts.
const BAR_BAND = 32;
// Wie die Zeilen der Likert-Diagramme: 12 px, eckig, auf einer Spur bis 100 %.
const BAR_DICKE = 12;
const MARGIN_LEFT_DESKTOP = 160;
const MARGIN_RIGHT = 56;
const MARGIN_TOP = 12;
const MARGIN_BOTTOM_DESKTOP = 32;
const MARGIN_BOTTOM_MOBILE = 24;

export function BarH({ records, codebook, source, items, slots, preserveOrder, daten }: Props) {
  const isMobile = useIsMobile();
  const { rows, n: answered } = useMemo<AggResult>(() => {
    if (daten) return daten;
    if (slots && slots.length > 0) return countByObjectKeys(records, source, slots);
    if (items && items.length > 0) return countByBins(records, source, items);
    return countByCodebook(records, source, codebook[source] ?? {});
  }, [daten, records, codebook, source, items, slots]);

  // Object-keys and preserveOrder modes both keep declared order.
  const sorted = useMemo(
    () => (preserveOrder || slots ? rows : [...rows].sort((a, b) => b.share - a.share)),
    [rows, preserveOrder, slots],
  );

  // Farbe kommt aus der Palette, nicht aus dem Datensatz.
  const accent = EINZEL;
  // Am Handy steht die Kategorie über dem Balken statt links davon, ohne
  // Band-Padding: Das Band ist genau eine Zeile, der Balken genau BALKEN.
  const nameOben = isMobile;
  const band = BAR_BAND + (nameOben ? NAME_OBEN : 0);
  const insetBottom = (BAR_BAND - BAR_DICKE) / 2;
  const insetTop = nameOben ? band - insetBottom - BALKEN : insetBottom;
  const balkenMitte = (insetTop - insetBottom) / 2;
  const marginLeft = nameOben ? 1 : MARGIN_LEFT_DESKTOP;
  const marginBottom = isMobile ? MARGIN_BOTTOM_MOBILE : MARGIN_BOTTOM_DESKTOP;
  const fontPx = isMobile ? 11 : 13;
  // Nur am Desktop: am Handy steht die Kategorie als Text über dem Balken.
  const axisPx = 12;

  const options: Plot.PlotOptions = useMemo(
    () => ({
      height: sorted.length * band + MARGIN_TOP + marginBottom,
      marginLeft,
      marginRight: MARGIN_RIGHT,
      marginTop: MARGIN_TOP,
      marginBottom,
      // Feste Skala bis 100 %: Die Länge zeigt den Anteil an allen, nicht den
      // Abstand zum größten Wert. Vorher füllten 53 % die ganze Breite.
      x: { domain: [0, 1], axis: null, label: null },
      y: { domain: sorted.map((d) => d.label), label: null, tickSize: 0, ...(nameOben ? { axis: null, padding: 0 } : {}) },
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: `${fontPx}px`,
        color: INK,
        background: "transparent",
      },
      marks: [
        nameOben
          ? Plot.text(sorted, {
              x: 0,
              y: "label",
              text: "label",
              textAnchor: "start",
              dy: balkenMitte - 16,
              fontSize: fontPx,
              fill: INK_MUTED,
            })
          : Plot.axisY({ lineWidth: 11, fontSize: axisPx, tickSize: 0, color: INK_MUTED }),
        Plot.barX(sorted, {
          x: 1,
          y: "label",
          fill: GITTER,
          insetTop,
          insetBottom,
        }),
        Plot.barX(sorted, {
          x: "share",
          y: "label",
          fill: accent,
          insetTop,
          insetBottom,
          tip: true,
          title: (d) =>
            `${d.label}\n${fmtInt(d.count)} Antworten\n${fmtPct(d.share)}${
              answered > 0 ? ` von ${fmtInt(answered)}` : ""
            }`,
        }),
        // Werte in einer Spalte rechts der Spur, wie die Summen bei Likert.
        Plot.text(sorted, {
          x: 1,
          y: "label",
          text: (d) => fmtPct(d.share),
          dx: 6,
          dy: balkenMitte,
          textAnchor: "start",
          fontWeight: 600,
          fontSize: fontPx,
          fill: INK,
        }),
      ],
    }),
    [sorted, accent, answered, nameOben, band, insetTop, insetBottom, balkenMitte, marginLeft, marginBottom, fontPx, axisPx],
  );

  return (
    <ChartFrame
      table={
        <ChartTable
          headers={["Kategorie", "Anzahl", "Anteil"]}
          rows={sorted.map((d) => [d.label, fmtInt(d.count), fmtPct(d.share)])}
        />
      }
    >
      <PlotFigure options={options} />
    </ChartFrame>
  );
}
