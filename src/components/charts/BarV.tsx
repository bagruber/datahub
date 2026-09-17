import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { countByBins, countByCodebook, countByObjectKeys, type AggResult } from "@/lib/aggregate";
import { fmtInt, fmtPct } from "@/lib/format";
import { EINZEL, INK, INK_MUTED, NULLLINIE, RADIUS } from "@/lib/palette";
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
};

// Vertical-bar variant of BarH for chronological / ordinal-temporal data.
const BAR_BAND = 36;
const HEIGHT = 300;
const MARGIN_TOP_DESKTOP = 12;
const MARGIN_TOP_MOBILE = 8;
const MARGIN_BOTTOM_DESKTOP = 96;
const MARGIN_BOTTOM_MOBILE = 84;
const MARGIN_LEFT = 48;
const MARGIN_RIGHT = 16;

export function BarV({ records, codebook, source, items, slots, preserveOrder }: Props) {
  const isMobile = useIsMobile();
  const { rows, n: answered } = useMemo<AggResult>(() => {
    if (slots && slots.length > 0) return countByObjectKeys(records, source, slots);
    if (items && items.length > 0) return countByBins(records, source, items);
    return countByCodebook(records, source, codebook[source] ?? {});
  }, [records, codebook, source, items, slots]);

  // BarV defaults to declared/codebook order — vertical axes are usually
  // chronological where sorting by share would scramble the time axis.
  const ordered = useMemo(
    () => (preserveOrder === false ? [...rows].sort((a, b) => b.share - a.share) : rows),
    [rows, preserveOrder],
  );

  // Farbe kommt aus der Palette, nicht aus dem Datensatz.
  const accent = EINZEL;
  const marginTop = isMobile ? MARGIN_TOP_MOBILE : MARGIN_TOP_DESKTOP;
  const marginBottom = isMobile ? MARGIN_BOTTOM_MOBILE : MARGIN_BOTTOM_DESKTOP;
  const fontPx = isMobile ? 10 : 12;
  const axisPx = isMobile ? 9 : 11;

  // Probe Diagramme, vorläufig (18.09.2026): Am Handy werden aus den Säulen
  // Balken in derselben Reihenfolge — statt gedrehter Beschriftung und
  // waagrechtem Scroll.
  const options: Plot.PlotOptions = useMemo(
    () =>
      isMobile
        ? {
            height: ordered.length * 34 + 8,
            marginLeft: 96,
            marginRight: 48,
            marginTop: 4,
            marginBottom: 4,
            x: { axis: null, percent: true, label: null },
            y: { domain: ordered.map((d) => d.label), label: null, tickSize: 0 },
            style: { fontFamily: "var(--font-sans)", fontSize: `${fontPx}px`, color: INK },
            marks: [
              Plot.axisY({ fontSize: axisPx, tickSize: 0, color: INK_MUTED, lineWidth: 8 }),
              Plot.barX(ordered, {
                x: "share",
                y: "label",
                fill: accent,
                insetTop: 9,
                insetBottom: 9,
                rx2y1: RADIUS.bar,
                rx2y2: RADIUS.bar,
                tip: true,
                title: (d) =>
                  `${d.label}
${fmtInt(d.count)} Antworten
${fmtPct(d.share)}${
                    answered > 0 ? ` von ${fmtInt(answered)}` : ""
                  }`,
              }),
              Plot.text(ordered, {
                x: "share",
                y: "label",
                text: (d) => fmtPct(d.share),
                dx: 5,
                textAnchor: "start",
                fontWeight: 600,
                fontSize: fontPx,
                fill: INK,
              }),
              Plot.ruleX([0], { stroke: NULLLINIE }),
            ],
          }
        : {

      height: HEIGHT,
      marginLeft: MARGIN_LEFT,
      marginRight: MARGIN_RIGHT,
      marginTop,
      marginBottom,
      x: {
        domain: ordered.map((d) => d.label),
        label: null,
        tickSize: 0,
        // Dichter: die Säule nimmt rund 70 % der Bandbreite.
        padding: 0.3,
      },
      // Die Werte stehen auf den Deckeln, die Achse entfaellt.
      y: { axis: null, percent: true, label: null },
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: `${fontPx}px`,
        color: INK,
      },
      marks: [
        Plot.axisX({ fontSize: axisPx, tickSize: 0, color: INK_MUTED }),

        Plot.barY(ordered, {
          x: "label",
          y: "share",
          fill: accent,
          rx1y1: RADIUS.bar,
          rx2y1: RADIUS.bar,
          tip: true,
          title: (d) =>
            `${d.label}\n${fmtInt(d.count)} Antworten\n${fmtPct(d.share)}${
              answered > 0 ? ` von ${fmtInt(answered)}` : ""
            }`,
        }),
        Plot.text(ordered, {
          x: "label",
          y: "share",
          text: (d) => (d.share >= 0.04 ? fmtPct(d.share) : ""),
          dy: -6,
          textAnchor: "middle",
          fontWeight: 600,
          fontSize: fontPx,
          fill: INK,
        }),
        Plot.ruleY([0], { stroke: NULLLINIE }),
      ],
              },
    [ordered, accent, answered, isMobile, marginTop, marginBottom, fontPx, axisPx],
  );

  const minWidth = isMobile ? 0 : ordered.length * BAR_BAND + MARGIN_LEFT + MARGIN_RIGHT;
  const width: "narrow" | "normal" | "wide" =
    ordered.length <= 7 ? "narrow" : ordered.length <= 9 ? "normal" : "wide";

  return (
    <ChartFrame
      width={width}
      table={
        <ChartTable
          headers={["Kategorie", "Anzahl", "Anteil"]}
          rows={ordered.map((d) => [d.label, fmtInt(d.count), fmtPct(d.share)])}
        />
      }
    >
      <div style={{ minWidth }}>
        <PlotFigure options={options} />
      </div>
    </ChartFrame>
  );
}
