import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { fmtInt, fmtPct } from "@/lib/format";
import { CATEGORICAL, INK, RADIUS } from "@/lib/palette";
import { useIsMobile } from "@/lib/useIsMobile";
import { ChartFrame } from "./ChartFrame";
import { ChartTable } from "./ChartTable";

type Series = {
  label: string;
  color?: string;
  data: { x: number; y: number }[];
};

type Props = {
  series: Series[];
  xLabel?: string;
  yLabel?: string;
  title?: string;
};

/** Time-series column chart with stacked sub-categories. Use when the
 *  series sum to a meaningful total (e.g. SV-Beschäftigte aufgeteilt nach
 *  Branche). For overlapping sub-groups use LineSeries instead. */
export function StackedColumn({ series, xLabel, yLabel }: Props) {
  const isMobile = useIsMobile();
  const fontPx = isMobile ? 11 : 13;

  const data = useMemo(
    () => series.flatMap((s) => s.data.map((d) => ({ ...d, series: s.label }))),
    [series],
  );
  const colorDomain = useMemo(() => series.map((s) => s.label), [series]);
  const colorRange = useMemo(
    () => series.map((s, i) => s.color ?? CATEGORICAL[i % CATEGORICAL.length]),
    [series],
  );

  // Pre-compute totals + per-segment shares for tooltips.
  const totals = useMemo(() => {
    const m = new Map<number, number>();
    for (const d of data) m.set(d.x, (m.get(d.x) ?? 0) + d.y);
    return m;
  }, [data]);

  const options: Plot.PlotOptions = useMemo(
    () => ({
      height: 300,
      marginLeft: 60,
      marginRight: 16,
      marginTop: 24,
      marginBottom: 44,
      x: {
        label: xLabel ?? null,
        labelAnchor: "center",
        tickFormat: (v: number) => String(v),
      },
      y: {
        label: yLabel ?? null,
        labelAnchor: "top",
        labelOffset: 50,
        grid: true,
        tickFormat: (v: number) => fmtInt(v),
      },
      color: {
        type: "ordinal",
        domain: colorDomain,
        range: colorRange,
        legend: true,
      },
      style: {
        fontFamily: "Inter Variable, Inter, sans-serif",
        fontSize: `${fontPx}px`,
        color: INK,
      },
      marks: [
        Plot.barY(data, {
          x: "x",
          y: "y",
          fill: "series",
          insetLeft: 2,
          insetRight: 2,
          rx: RADIUS.bar,
          tip: true,
          title: (d: { x: number; series: string; y: number }) => {
            const total = totals.get(d.x) ?? 0;
            const share = total > 0 ? d.y / total : 0;
            return `${d.x}\n${d.series}: ${fmtInt(d.y)}\n${fmtPct(share)} (Gesamt ${fmtInt(total)})`;
          },
        }),
        Plot.ruleY([0]),
      ],
    }),
    [data, colorDomain, colorRange, xLabel, yLabel, fontPx, totals],
  );

  const xValues = useMemo(() => {
    const set = new Set<number>();
    for (const s of series) for (const d of s.data) set.add(d.x);
    return [...set].sort((a, b) => a - b);
  }, [series]);
  const tableRows = xValues.map((x) => [
    x,
    ...series.map((s) => {
      const d = s.data.find((p) => p.x === x);
      return d ? fmtInt(d.y) : "–";
    }),
    fmtInt(totals.get(x) ?? 0),
  ]);

  return (
    <ChartFrame
      width="wide"
      table={
        <ChartTable
          headers={[xLabel ?? "x", ...series.map((s) => s.label), "Gesamt"]}
          rows={tableRows}
        />
      }
    >
      <PlotFigure options={options} />
    </ChartFrame>
  );
}
