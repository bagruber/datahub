import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { countByBins, countByCodebook, countByObjectKeys, type AggResult } from "@/lib/aggregate";
import { fmtInt, fmtPct } from "@/lib/format";
import { ACCENT_RED, INK, RADIUS } from "@/lib/palette";
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
  color?: string;
  title?: string;
  preserveOrder?: boolean;
};

// Same constants for every BarH on the page → bar thickness identical and
// the 0 % gridline lands at the same x across charts.
const BAR_BAND = 32;
const MARGIN_LEFT_DESKTOP = 160;
const MARGIN_LEFT_MOBILE = 100;
const MARGIN_RIGHT = 56;
const MARGIN_TOP = 12;
const MARGIN_BOTTOM_DESKTOP = 32;
const MARGIN_BOTTOM_MOBILE = 24;

export function BarH({ records, codebook, source, items, slots, color, preserveOrder }: Props) {
  const isMobile = useIsMobile();
  const { rows, n: answered } = useMemo<AggResult>(() => {
    if (slots && slots.length > 0) return countByObjectKeys(records, source, slots);
    if (items && items.length > 0) return countByBins(records, source, items);
    return countByCodebook(records, source, codebook[source] ?? {});
  }, [records, codebook, source, items, slots]);

  // Object-keys and preserveOrder modes both keep declared order.
  const sorted = useMemo(
    () => (preserveOrder || slots ? rows : [...rows].sort((a, b) => b.share - a.share)),
    [rows, preserveOrder, slots],
  );

  const accent = color ?? ACCENT_RED;
  const marginLeft = isMobile ? MARGIN_LEFT_MOBILE : MARGIN_LEFT_DESKTOP;
  const marginBottom = isMobile ? MARGIN_BOTTOM_MOBILE : MARGIN_BOTTOM_DESKTOP;
  const fontPx = isMobile ? 11 : 13;
  const axisPx = isMobile ? 10 : 12;

  const options: Plot.PlotOptions = useMemo(
    () => ({
      height: sorted.length * BAR_BAND + MARGIN_TOP + marginBottom,
      marginLeft,
      marginRight: MARGIN_RIGHT,
      marginTop: MARGIN_TOP,
      marginBottom,
      x: { axis: "bottom", percent: true, grid: true, label: null, ticks: isMobile ? 4 : 5 },
      y: { domain: sorted.map((d) => d.label), label: null, tickSize: 0 },
      style: {
        fontFamily: "Inter Variable, Inter, sans-serif",
        fontSize: `${fontPx}px`,
        color: INK,
        background: "transparent",
      },
      marks: [
        Plot.axisY({ lineWidth: isMobile ? 9 : 11, fontSize: axisPx }),
        Plot.barX(sorted, {
          x: "share",
          y: "label",
          fill: accent,
          insetTop: 4,
          insetBottom: 4,
          rx: RADIUS.bar,
          tip: true,
          title: (d) =>
            `${d.label}\n${fmtInt(d.count)} Antworten\n${fmtPct(d.share)}${
              answered > 0 ? ` von ${fmtInt(answered)}` : ""
            }`,
        }),
        Plot.text(sorted, {
          x: "share",
          y: "label",
          text: (d) => fmtPct(d.share),
          dx: 5,
          textAnchor: "start",
          fontWeight: 600,
          fontSize: fontPx,
          fill: INK,
        }),
        Plot.ruleX([0]),
      ],
    }),
    [sorted, accent, answered, isMobile, marginLeft, marginBottom, fontPx, axisPx],
  );

  return (
    <ChartFrame
      width="wide"
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
