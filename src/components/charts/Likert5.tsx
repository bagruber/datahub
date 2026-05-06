import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { divergingStack } from "@/lib/diverging";
import { fmtInt, fmtPct } from "@/lib/format";
import { INK, LIKERT5_RAMP, RADIUS, STROKE } from "@/lib/palette";
import { useIsMobile } from "@/lib/useIsMobile";
import { ScaleCaption } from "./ScaleCaption";
import type { Codebook, Dataset } from "@/lib/data";

type Item = { source: string; label: string };

type Props = {
  records: Dataset["records"];
  codebook: Codebook;
  items: Item[];
  title?: string;
  endpoints?: { left: string; right: string };
};

const SCALE = [1, 2, 3, 4, 5];

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
    // 5-point scale with neutral at index 2 (rating 3 straddles centre).
    const segs = divergingStack(shares, { negative: [1, 0], center: 2, positive: [3, 4] });
    segs.forEach((seg) => {
      const rating = SCALE[seg.idx];
      out.push({
        item: it.label,
        rating,
        share: shares[seg.idx],
        count: counts.get(rating)!,
        n,
        x1: seg.x1,
        x2: seg.x2,
      });
    });
  });
  return out;
}

export function Likert5({ records, codebook, items, endpoints }: Props) {
  void codebook;
  const left = endpoints?.left ?? "sehr schlecht";
  const right = endpoints?.right ?? "sehr gut";
  const isMobile = useIsMobile();
  const rows = useMemo(() => buildRows(records, items), [records, items]);
  const itemOrder = useMemo(() => items.map((i) => i.label).reverse(), [items]);

  const marginLeft = isMobile ? 110 : 180;
  const fontPx = isMobile ? 11 : 13;
  const axisPx = isMobile ? 10 : 12;

  const extent = useMemo(() => {
    const m = rows.reduce((a, r) => Math.max(a, Math.abs(r.x1), Math.abs(r.x2)), 0);
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
        ticks: isMobile ? 4 : 5,
        tickFormat: (v: number) => `${Math.abs(Math.round(v * 100))}%`,
      },
      y: { domain: itemOrder, label: null, tickSize: 0 },
      color: {
        type: "ordinal",
        domain: SCALE,
        range: LIKERT5_RAMP,
        legend: true,
        label: "1 = sehr schlecht  ·  3 = neutral  ·  5 = sehr gut",
      },
      style: {
        fontFamily: "Inter Variable, Inter, sans-serif",
        fontSize: `${fontPx}px`,
        color: INK,
      },
      marks: [
        Plot.axisY({ lineWidth: isMobile ? 9 : 12, fontSize: axisPx }),
        Plot.barX(rows, {
          x1: "x1",
          x2: "x2",
          y: "item",
          fill: "rating",
          insetTop: 3,
          insetBottom: 3,
          rx: RADIUS.bar,
          tip: true,
          title: (d: Row) =>
            `${d.item}\nBewertung ${d.rating}\n${fmtInt(d.count)} von ${fmtInt(d.n)}\n${fmtPct(d.share)}`,
        }),
        Plot.ruleX([0], { stroke: INK, strokeWidth: STROKE.centerRule }),
      ],
    }),
    [rows, itemOrder, marginLeft, extent, isMobile, fontPx, axisPx],
  );

  return (
    <figure className="mx-auto w-full max-w-2xl">
      <PlotFigure options={options} />
      <ScaleCaption left={left} right={right} />
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
