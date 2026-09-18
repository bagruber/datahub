import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { fmtInt } from "@/lib/format";
import { INK, KORRELATION_RAMPE, RADIUS } from "@/lib/palette";
import { useIsMobile } from "@/lib/useIsMobile";
import { ChartFrame } from "./ChartFrame";
import { ChartTable } from "./ChartTable";
import type { Dataset } from "@/lib/data";

type Source = { source: string; label: string };

type Props = {
  records: Dataset["records"];
  sources: Source[];
  title?: string;
};

type Cell = { x: string; y: string; xi: number; yi: number; r: number; n: number };

/** Pearson correlation coefficient over pairs where both values are numeric. */
function pearson(records: Dataset["records"], a: string, b: string): { r: number; n: number } {
  let n = 0;
  let sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0;
  for (const rec of records) {
    const x = rec[a];
    const y = rec[b];
    if (typeof x !== "number" || typeof y !== "number") continue;
    n++;
    sa += x; sb += y;
    saa += x * x; sbb += y * y;
    sab += x * y;
  }
  if (n < 2) return { r: NaN, n };
  const cov = sab - (sa * sb) / n;
  const va = saa - (sa * sa) / n;
  const vb = sbb - (sb * sb) / n;
  if (va <= 0 || vb <= 0) return { r: NaN, n };
  return { r: cov / Math.sqrt(va * vb), n };
}

export function Correlation({ records, sources }: Props) {
  // Probe Diagramme, vorläufig (18.09.2026): nur die untere Dreieckshälfte.
  // Die Matrix ist spiegelgleich, die Diagonale ist immer 1.
  const cells: Cell[] = useMemo(() => {
    const out: Cell[] = [];
    for (let i = 1; i < sources.length; i++) {
      for (let j = 0; j < i; j++) {
        const { r, n } = pearson(records, sources[i].source, sources[j].source);
        out.push({
          x: sources[j].label,
          y: sources[i].label,
          xi: j,
          yi: i,
          r,
          n,
        });
      }
    }
    return out;
  }, [records, sources]);

  const isMobile = useIsMobile();
  const labels = useMemo(() => sources.map((s) => s.label), [sources]);
  // Ohne Diagonale: die erste Spalte und die letzte Zeile bleiben leer und
  // fallen deshalb aus den Achsen. Am Handy stehen die Namen stattdessen auf
  // der Diagonale, das spart die Hälfte der Breite.
  const xDomain = useMemo(() => (isMobile ? labels : labels.slice(0, -1)), [labels, isMobile]);
  const yDomain = useMemo(() => (isMobile ? labels : labels.slice(1)), [labels, isMobile]);
  const diagonale = useMemo(
    () => labels.map((l) => ({ label: l })),
    [labels],
  );
  const longestLabel = useMemo(() => labels.reduce((m, l) => Math.max(m, l.length), 0), [labels]);
  const marginLeft = isMobile
    ? Math.min(140, Math.max(80, longestLabel * 6))
    : Math.min(220, Math.max(110, longestLabel * 8));
  const marginTop = isMobile
    ? Math.min(110, Math.max(60, longestLabel * 5))
    : Math.min(160, Math.max(80, longestLabel * 7));
  const fontPx = isMobile ? 9 : 12;
  const cellPx = isMobile ? 9 : 11;

  // Format r-value for the cell. On mobile, fewer digits to keep it readable
  // inside small cells. Diagonal cells (r === 1, where x === y) collapse to "1".
  // Zahl erst ab ,30, bei gegenläufigen ab −,20; darunter trägt die Farbe allein.
  const zeigt = (r: number) => !Number.isNaN(r) && (r >= 0.3 || r <= -0.2);
  const formatR = (d: Cell): string => {
    if (!zeigt(d.r)) return "";
    const rounded = d.r.toFixed(2);
    // Drop leading zero for compactness: 0.42 → ,42; -0.42 → −,42
    const noLead = rounded.replace(/^(-?)0\./, "$1.");
    return noLead.replace(".", ",").replace("-", "−");
  };

  const options: Plot.PlotOptions = useMemo(
    () => ({
      height: yDomain.length * (isMobile ? 21 : 36) + (isMobile ? 16 : marginTop + 24),
      marginLeft: isMobile ? 6 : marginLeft,
      marginRight: isMobile ? 84 : 24,
      marginTop: isMobile ? 8 : marginTop,
      marginBottom: 24,
      x: {
        domain: xDomain,
        axis: isMobile ? null : "top",
        label: null,
        tickRotate: -35,
        tickSize: 0,
      },
      y: { domain: yDomain, axis: isMobile ? null : "left", label: null, tickSize: 0 },
      color: {
        type: "linear",
        domain: [-1, 0, 1],
        range: KORRELATION_RAMPE,
        legend: true,
        label: "Pearson r (−1 = gegenläufig, 0 = kein Zusammenhang, +1 = gleichgerichtet)",
        ticks: [-1, -0.5, 0, 0.5, 1],
      },
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: `${fontPx}px`,
        color: INK,
      },
      marks: [
        Plot.cell(cells, {
          x: "x",
          y: "y",
          fill: "r",
          inset: 1,
          rx: RADIUS.cell,
          tip: true,
          title: (d: Cell) =>
            `${d.y}\n× ${d.x}\nr = ${
              Number.isNaN(d.r) ? "–" : d.r.toFixed(3).replace(".", ",")
            }\n${fmtInt(d.n)} Antworten`,
        }),
        Plot.text(cells, {
          x: "x",
          y: "y",
          text: formatR,
          fill: (d: Cell) => (Math.abs(d.r) > 0.55 ? "white" : INK),
          fontWeight: 600,
          fontSize: cellPx,
        } as never),
        // Am Handy stehen die Namen in der leeren Diagonale.
        ...(isMobile
          ? [
              Plot.text(diagonale, {
                x: "label",
                y: "label",
                text: "label",
                textAnchor: "start",
                dx: -10,
                fontSize: 9,
                fill: INK,
              } as never),
            ]
          : []),
      ],
    }),
    [cells, xDomain, yDomain, diagonale, marginLeft, marginTop, isMobile, fontPx, cellPx],
  );

  return (
    <ChartFrame
      width="wide"
      table={
        <ChartTable
          headers={["", ...labels]}
          rows={labels.map((row, i) => [
            row,
            ...labels.map((_, j) => {
              const c = cells.find((x) => x.xi === j && x.yi === i);
              return c && !Number.isNaN(c.r) ? c.r.toFixed(2) : "–";
            }),
          ])}
        />
      }
    >
      <PlotFigure options={options} />
    </ChartFrame>
  );
}
