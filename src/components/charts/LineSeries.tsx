import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { fmtInt } from "@/lib/format";
import { EINZEL, GITTER, INK, INK_MUTED, NULLLINIE, SERIE } from "@/lib/palette";
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
    // Farben aus der Palette; eine einzelne Reihe trägt Isar-Blau.
    () => (series.length === 1 ? [EINZEL] : series.map((_, i) => SERIE[i % SERIE.length])),
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
        label: null,
        tickFormat: (v: number) => String(v),
        grid: false,
      },
      // Achsentitel ohne Pfeil; die Einheit steht in der Fusszeile der Karte.
      y: {
        label: null,
        grid: false,
        tickFormat: (v: number) => fmtInt(v),
      },
      color: {
        type: "ordinal",
        domain: colorDomain,
        range: colorRange,
        legend: series.length > 1,
      },
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: `${fontPx}px`,
        color: INK,
      },
      marks: [
        Plot.gridY({ stroke: GITTER, strokeOpacity: 1 }),
        Plot.axisX({ fontSize: axisPx, tickSize: 0, color: INK_MUTED, tickFormat: (v: number) => String(v) }),
        Plot.axisY({ fontSize: axisPx, tickSize: 0, color: INK_MUTED, tickFormat: (v: number) => fmtInt(v) }),
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
        Plot.ruleY([0], { stroke: NULLLINIE }),
      ],
    }),
    [data, colorDomain, colorRange, series.length, markers, fontPx, axisPx],
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
      {yLabel && <p className="mb-1 text-xs text-ink-muted">{yLabel}</p>}
      <PlotFigure options={options} />
    </ChartFrame>
  );
}
