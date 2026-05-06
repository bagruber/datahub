import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { divergingStack } from "@/lib/diverging";
import { fmtInt, fmtPct } from "@/lib/format";
import { INK, PRICE5_RAMP, PRICE6_RAMP, RADIUS, STROKE } from "@/lib/palette";
import { useIsMobile } from "@/lib/useIsMobile";
import { ScaleCaption } from "./ScaleCaption";
import type { Codebook, Dataset } from "@/lib/data";

type Item = { source: string; label: string };

type Props = {
  records: Dataset["records"];
  codebook: Codebook;
  items: Item[];
  scale: 5 | 6;
  title?: string;
  endpoints?: { left: string; right: string };
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

/** Same diverging stack idiom as Likert5/6 but with a neutral blue ramp
 *  (light = günstig, dark = teuer). Reading left-of-zero = "rather cheap",
 *  right-of-zero = "rather expensive". No good/bad colour cue. */
function buildRows(records: Dataset["records"], items: Item[], scale: number): Row[] {
  const out: Row[] = [];
  const ratings = Array.from({ length: scale }, (_, i) => i + 1);
  // Diverging split: for odd scales (5) the middle rating straddles 0; for
  // even scales (6) there's no centre and the split sits between 3 and 4.
  const isOdd = scale % 2 === 1;
  const mid = Math.floor(scale / 2); // 5 → 2 (idx of rating 3); 6 → 3 (idx of rating 4)
  const negative = isOdd
    ? Array.from({ length: mid }, (_, i) => mid - 1 - i)
    : Array.from({ length: mid }, (_, i) => mid - 1 - i);
  const center = isOdd ? mid : undefined;
  const positive = Array.from({ length: scale - mid - (isOdd ? 1 : 0) }, (_, i) =>
    (isOdd ? mid + 1 : mid) + i,
  );

  items.forEach((it) => {
    const counts = new Map<number, number>(ratings.map((k) => [k, 0]));
    let n = 0;
    for (const r of records) {
      const v = r[it.source];
      if (typeof v !== "number" || !counts.has(v)) continue;
      n++;
      counts.set(v, counts.get(v)! + 1);
    }
    const shares = ratings.map((k) => (n === 0 ? 0 : counts.get(k)! / n));
    const segs = divergingStack(shares, { negative, center, positive });
    segs.forEach((seg) => {
      const rating = ratings[seg.idx];
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

export function Price({ records, codebook, items, scale, endpoints }: Props) {
  void codebook;
  const left = endpoints?.left ?? "günstig";
  const right = endpoints?.right ?? "teuer";
  const isMobile = useIsMobile();
  const rows = useMemo(() => buildRows(records, items, scale), [records, items, scale]);
  const itemOrder = useMemo(() => items.map((i) => i.label).reverse(), [items]);
  const ramp = scale === 5 ? PRICE5_RAMP : PRICE6_RAMP;
  const ratings = useMemo(() => Array.from({ length: scale }, (_, i) => i + 1), [scale]);

  const marginLeft = isMobile ? 110 : 180;
  const fontPx = isMobile ? 11 : 13;
  const axisPx = isMobile ? 10 : 12;

  const extent = useMemo(() => {
    const m = rows.reduce((a, r) => Math.max(a, Math.abs(r.x1), Math.abs(r.x2)), 0);
    return Math.max(0.5, Math.ceil(m * 10) / 10);
  }, [rows]);

  const options: Plot.PlotOptions = useMemo(
    () => ({
      height: itemOrder.length * 30 + 70,
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
        Plot.ruleX([0], { stroke: INK, strokeWidth: STROKE.centerRule }),
      ],
    }),
    [rows, itemOrder, marginLeft, isMobile, fontPx, axisPx, ratings, ramp, scale, extent],
  );

  return (
    <figure className="mx-auto w-full max-w-2xl">
      <PlotFigure options={options} />
      <ScaleCaption left={left} right={right} />
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
