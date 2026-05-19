import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { fmtInt } from "@/lib/format";
import { CATEGORICAL, INK } from "@/lib/palette";
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
  markers?: boolean;
  title?: string;
};

/** Multi-line time-series chart. Used by Statistik kommunal for population
 *  history, migration in/out, unemployment-by-group etc. Each series carries
 *  its own colour; legend is auto-generated from labels. */
export function LineSeries({ series, xLabel, yLabel, markers = true }: Props) {
  const isMobile = useIsMobile();
  const fontPx = isMobile ? 11 : 13;
  const axisPx = isMobile ? 10 : 12;

  // Flatten + tag each row with its series label so Plot's colour scale
  // operates on a single channel.
  const data = useMemo(
    () => series.flatMap((s) => s.data.map((d) => ({ ...d, series: s.label }))),
    [series],
  );
  const colorDomain = useMemo(() => series.map((s) => s.label), [series]);
  const colorRange = useMemo(
    () => series.map((s, i) => s.color ?? CATEGORICAL[i % CATEGORICAL.length]),
    [series],
  );

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
        grid: false,
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
        Plot.line(data, {
          x: "x",
          y: "y",
          stroke: "series",
          strokeWidth: 1.75,
          curve: "monotone-x",
        }),
        ...(markers
          ? [
              Plot.dot(data, {
                x: "x",
                y: "y",
                fill: "series",
                stroke: "white",
                strokeWidth: 1,
                r: 2.5,
                tip: true,
                title: (d: { series: string; x: number; y: number }) =>
                  `${d.series}\n${d.x}: ${fmtInt(d.y)}`,
              }),
            ]
          : [
              Plot.tip(
                data,
                Plot.pointer({
                  x: "x",
                  y: "y",
                  title: (d: { series: string; x: number; y: number }) =>
                    `${d.series}\n${d.x}: ${fmtInt(d.y)}`,
                }),
              ),
            ]),
        Plot.ruleY([0]),
      ],
    }),
    [data, colorDomain, colorRange, xLabel, yLabel, markers, fontPx],
  );
  void axisPx;

  // Wide table: rows = x values, columns = series. Useful for screen readers.
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
  ]);

  return (
    <ChartFrame
      width="wide"
      table={
        <ChartTable
          headers={[xLabel ?? "x", ...series.map((s) => s.label)]}
          rows={tableRows}
        />
      }
    >
      <PlotFigure options={options} />
    </ChartFrame>
  );
}
