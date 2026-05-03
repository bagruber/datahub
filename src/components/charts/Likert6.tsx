import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { divergingStack } from "@/lib/diverging";
import { fmtInt, fmtPct } from "@/lib/format";
import type { Codebook, Dataset } from "@/lib/data";

type Item = { source: string; label: string; group?: string };

type Props = {
  records: Dataset["records"];
  codebook: Codebook;
  items: Item[];
  title?: string;
};

const SCALE = [1, 2, 3, 4, 5, 6];
const RAMP_HEX = ["#b00e28", "#d96a4f", "#e8b878", "#c9d39e", "#82b67c", "#3f8c52"];

type Row = {
  item: string;
  rating: number;
  share: number;
  count: number;
  n: number;
  x1: number;
  x2: number;
};

function buildRows(records: Dataset["records"], items: Item[]): Row[] {
  const out: Row[] = [];
  items.forEach((it) => {
    const counts = new Map<number, number>(SCALE.map((k) => [k, 0]));
    let n = 0;
    for (const r of records) {
      const v = r[it.source];
      if (typeof v !== "number" || !counts.has(v)) continue;
      n++;
      counts.set(v, counts.get(v)! + 1);
    }
    const shares = SCALE.map((k) => (n === 0 ? 0 : counts.get(k)! / n));
    // 6-point scale, no neutral. Negative = ratings 3,2,1 (idx 2,1,0); positive = 4,5,6 (idx 3,4,5).
    const segs = divergingStack(shares, { negative: [2, 1, 0], positive: [3, 4, 5] });
    segs.forEach((seg) => {
      const rating = SCALE[seg.idx];
      const count = counts.get(rating)!;
      out.push({
        item: it.label,
        rating,
        share: shares[seg.idx],
        count,
        n,
        x1: seg.x1,
        x2: seg.x2,
      });
    });
  });
  return out;
}

export function Likert6({ records, codebook, items }: Props) {
  void codebook;
  const rows = useMemo(() => buildRows(records, items), [records, items]);
  const itemOrder = useMemo(() => items.map((i) => i.label).reverse(), [items]);
  const longestLabel = useMemo(
    () => itemOrder.reduce((m, l) => Math.max(m, l.length), 0),
    [itemOrder],
  );
  const marginLeft = Math.min(220, Math.max(110, longestLabel * 8));

  const extent = useMemo(() => {
    const m = rows.reduce((a, r) => Math.max(a, Math.abs(r.x1), Math.abs(r.x2)), 0);
    // Round up to nearest 0.1 for clean ticks; never less than 0.5
    return Math.max(0.5, Math.ceil(m * 10) / 10);
  }, [rows]);

  const options: Plot.PlotOptions = useMemo(
    () => ({
      height: itemOrder.length * 30 + 60,
      marginLeft,
      marginRight: 24,
      marginTop: 32,
      marginBottom: 28,
      x: {
        domain: [-extent, extent],
        axis: "top",
        label: null,
        grid: true,
        ticks: 5,
        tickFormat: (v: number) => `${Math.abs(Math.round(v * 100))}%`,
      },
      y: { domain: itemOrder, label: null, tickSize: 0 },
      color: {
        type: "ordinal",
        domain: SCALE,
        range: RAMP_HEX,
        legend: true,
        label: "Bewertung (1 = sehr schlecht … 6 = sehr gut)",
      },
      style: {
        fontFamily: "Inter Variable, Inter, sans-serif",
        fontSize: "13px",
        color: "#1c1c1c",
      },
      marks: [
        Plot.barX(rows, {
          x1: "x1",
          x2: "x2",
          y: "item",
          fill: "rating",
          insetTop: 3,
          insetBottom: 3,
          tip: true,
          title: (d: Row) =>
            `${d.item}\nBewertung ${d.rating}\n${fmtInt(d.count)} von ${fmtInt(d.n)}\n${fmtPct(d.share)}`,
        }),
        Plot.ruleX([0], { stroke: "#1c1c1c", strokeWidth: 1.25 }),
      ],
    }),
    [rows, itemOrder, marginLeft, extent],
  );

  return (
    <figure className="mx-auto w-full max-w-2xl">
      <PlotFigure options={options} />
      <table className="sr-only">
        <thead>
          <tr>
            <th>Merkmal</th>
            {SCALE.map((s) => <th key={s}>{s}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.map((it) => {
            const r = rows.filter((x) => x.item === it.label).sort((a, b) => a.rating - b.rating);
            return (
              <tr key={it.source}>
                <td>{it.label}</td>
                {r.map((d) => <td key={d.rating}>{fmtPct(d.share)}</td>)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </figure>
  );
}
