import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { fmtInt } from "@/lib/format";
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
  const cells: Cell[] = useMemo(() => {
    const out: Cell[] = [];
    for (let i = 0; i < sources.length; i++) {
      for (let j = 0; j < sources.length; j++) {
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

  const labels = useMemo(() => sources.map((s) => s.label), [sources]);
  // y-axis top-to-bottom = first to last
  const yDomain = useMemo(() => [...labels].reverse(), [labels]);
  const longestLabel = useMemo(() => labels.reduce((m, l) => Math.max(m, l.length), 0), [labels]);
  const marginLeft = Math.min(220, Math.max(110, longestLabel * 8));
  const marginTop = Math.min(160, Math.max(80, longestLabel * 7));

  const options: Plot.PlotOptions = useMemo(
    () => ({
      height: labels.length * 38 + marginTop + 24,
      marginLeft,
      marginRight: 24,
      marginTop,
      marginBottom: 24,
      x: {
        domain: labels,
        axis: "top",
        label: null,
        tickRotate: -35,
        tickSize: 0,
      },
      y: { domain: yDomain, label: null, tickSize: 0 },
      color: {
        type: "linear",
        domain: [-1, 0, 1],
        range: ["#b00e28", "#f6ecd5", "#3f8c52"],
        legend: true,
        label: "Pearson r (−1 = gegenläufig, 0 = kein Zusammenhang, +1 = gleichgerichtet)",
        ticks: [-1, -0.5, 0, 0.5, 1],
      },
      style: {
        fontFamily: "Inter Variable, Inter, sans-serif",
        fontSize: "12px",
        color: "#1c1c1c",
      },
      marks: [
        Plot.cell(cells, {
          x: "x",
          y: "y",
          fill: "r",
          inset: 1,
          rx: 3,
          tip: true,
          title: (d: Cell) =>
            `${d.y}\n× ${d.x}\nr = ${
              Number.isNaN(d.r) ? "–" : d.r.toFixed(3).replace(".", ",")
            }\n${fmtInt(d.n)} Antworten`,
        }),
        Plot.text(cells, {
          x: "x",
          y: "y",
          text: (d: Cell) =>
            Number.isNaN(d.r) ? "–" : d.r.toFixed(2).replace(".", ",").replace("0,", ",").replace("-,", "−,"),
          fill: (d: Cell) => (Math.abs(d.r) > 0.55 ? "white" : "#1c1c1c"),
          fontWeight: 600,
        } as never),
      ],
    }),
    [cells, labels, yDomain, marginLeft, marginTop],
  );

  return (
    <figure>
      <PlotFigure options={options} />
      <table className="sr-only">
        <thead>
          <tr><th></th>{labels.map((l) => <th key={l}>{l}</th>)}</tr>
        </thead>
        <tbody>
          {labels.map((row, i) => (
            <tr key={row}>
              <td>{row}</td>
              {labels.map((_, j) => {
                const c = cells.find((x) => x.xi === j && x.yi === i);
                return <td key={j}>{c && !Number.isNaN(c.r) ? c.r.toFixed(2) : "–"}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
