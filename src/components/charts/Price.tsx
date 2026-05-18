import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { distributionOnScale } from "@/lib/aggregate";
import { divergingStack } from "@/lib/diverging";
import { fmtInt, fmtPct } from "@/lib/format";
import { INK, PRICE5_RAMP, PRICE6_RAMP, RADIUS, STROKE } from "@/lib/palette";
import { useIsMobile } from "@/lib/useIsMobile";
import { ChartFrame } from "./ChartFrame";
import { ChartTable } from "./ChartTable";
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

/** Diverging-stack rows for a Price chart with günstig/teuer endpoints. */
function buildRows(records: Dataset["records"], items: Item[], scale: number): Row[] {
  const out: Row[] = [];
  const ratings = Array.from({ length: scale }, (_, i) => i + 1);
  const isOdd = scale % 2 === 1;
  const mid = Math.floor(scale / 2);
  const negative = Array.from({ length: mid }, (_, i) => mid - 1 - i);
  const center = isOdd ? mid : undefined;
  const positive = Array.from(
    { length: scale - mid - (isOdd ? 1 : 0) },
    (_, i) => (isOdd ? mid + 1 : mid) + i,
  );

  items.forEach((it) => {
    const { counts, shares, n } = distributionOnScale(records, it.source, ratings);
    const segs = divergingStack(shares, { negative, center, positive });
    segs.forEach((seg) => {
      out.push({
        item: it.label,
        rating: ratings[seg.idx],
        share: shares[seg.idx],
        count: counts[seg.idx],
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

  const tableRows = items.map((it) => {
    const r = rows.filter((x) => x.item === it.label).sort((a, b) => a.rating - b.rating);
    return [it.label, ...r.map((d) => fmtPct(d.share))];
  });

  return (
    <ChartFrame caption={{ left, right }} table={<ChartTable headers={["Merkmal", ...ratings.map(String)]} rows={tableRows} />}>
      <PlotFigure options={options} />
    </ChartFrame>
  );
}
