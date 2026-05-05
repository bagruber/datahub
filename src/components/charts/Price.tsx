import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { fmtInt, fmtPct } from "@/lib/format";
import { INK, PRICE5_RAMP, PRICE6_RAMP, RADIUS } from "@/lib/palette";
import { useIsMobile } from "@/lib/useIsMobile";
import type { Codebook, Dataset } from "@/lib/data";

type Item = { source: string; label: string };

type Props = {
  records: Dataset["records"];
  codebook: Codebook;
  items: Item[];
  scale: 5 | 6;
  title?: string;
};

type Row = {
  item: string;
  rating: number;
  share: number;
  count: number;
  n: number;
  x1: number;
  x2: number;
};

/** Build linear (non-diverging) stacked rows. Each item's segments stack
 *  left-to-right from rating 1 to rating N. */
function buildRows(records: Dataset["records"], items: Item[], scale: number): Row[] {
  const out: Row[] = [];
  const ratings = Array.from({ length: scale }, (_, i) => i + 1);
  items.forEach((it) => {
    const counts = new Map<number, number>(ratings.map((k) => [k, 0]));
    let n = 0;
    for (const r of records) {
      const v = r[it.source];
      if (typeof v !== "number" || !counts.has(v)) continue;
      n++;
      counts.set(v, counts.get(v)! + 1);
    }
    let cur = 0;
    for (const rating of ratings) {
      const count = counts.get(rating)!;
      const share = n === 0 ? 0 : count / n;
      out.push({
        item: it.label,
        rating,
        share,
        count,
        n,
        x1: cur,
        x2: cur + share,
      });
      cur += share;
    }
  });
  return out;
}

/** Price perception chart: linear stacked bar from "günstig" (rating 1) to
 *  "teuer" (rating N), single-hue blue ramp. Designed for Preis-Bewertungen
 *  where a diverging Likert with red/green would mislead — extremes here
 *  carry no quality judgement, only direction (cheap vs. expensive). */
export function Price({ records, codebook, items, scale }: Props) {
  void codebook;
  const isMobile = useIsMobile();
  const rows = useMemo(() => buildRows(records, items, scale), [records, items, scale]);
  const itemOrder = useMemo(() => items.map((i) => i.label).reverse(), [items]);
  const ramp = scale === 5 ? PRICE5_RAMP : PRICE6_RAMP;
  const ratings = useMemo(() => Array.from({ length: scale }, (_, i) => i + 1), [scale]);

  const marginLeft = isMobile ? 110 : 180;
  const fontPx = isMobile ? 11 : 13;
  const axisPx = isMobile ? 10 : 12;

  const options: Plot.PlotOptions = useMemo(
    () => ({
      height: itemOrder.length * 30 + 70,
      marginLeft,
      marginRight: 24,
      marginTop: 32,
      marginBottom: 36,
      x: {
        domain: [0, 1],
        axis: "top",
        label: null,
        grid: true,
        ticks: isMobile ? 4 : 5,
        tickFormat: (v: number) => `${Math.round(v * 100)}%`,
      },
      y: { domain: itemOrder, label: null, tickSize: 0 },
      color: {
        type: "ordinal",
        domain: ratings,
        range: ramp,
        legend: true,
        label: `Preisempfinden — 1 = günstig, ${scale} = teuer`,
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
      ],
    }),
    [rows, itemOrder, marginLeft, isMobile, fontPx, axisPx, ratings, ramp, scale],
  );

  return (
    <figure className="mx-auto w-full max-w-2xl">
      <PlotFigure options={options} />
      <div className="mt-2 flex items-baseline justify-between text-[11px] text-ink-muted px-1">
        <span>← günstig</span>
        <span>teuer →</span>
      </div>
      <table className="sr-only">
        <thead>
          <tr>
            <th>Merkmal</th>
            {ratings.map((s) => <th key={s}>{s}</th>)}
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
