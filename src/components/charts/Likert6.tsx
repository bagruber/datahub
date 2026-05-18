import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { distributionOnScale } from "@/lib/aggregate";
import { divergingStack } from "@/lib/diverging";
import { fmtInt, fmtPct } from "@/lib/format";
import { INK, LIKERT6_RAMP, RADIUS, STROKE } from "@/lib/palette";
import { useIsMobile } from "@/lib/useIsMobile";
import { ChartFrame } from "./ChartFrame";
import { ChartTable } from "./ChartTable";
import type { Codebook, Dataset } from "@/lib/data";

type Item = { source: string; label: string; group?: string };

type Props = {
  records: Dataset["records"];
  codebook: Codebook;
  items: Item[];
  title?: string;
  endpoints?: { left: string; right: string };
};

const SCALE = [1, 2, 3, 4, 5, 6];

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
    const { counts, shares, n } = distributionOnScale(records, it.source, SCALE);
    // 6-point scale, no neutral. Negative = ratings 3,2,1 (idx 2,1,0); positive = 4,5,6 (idx 3,4,5).
    const segs = divergingStack(shares, { negative: [2, 1, 0], positive: [3, 4, 5] });
    segs.forEach((seg) => {
      out.push({
        item: it.label,
        rating: SCALE[seg.idx],
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

export function Likert6({ records, codebook, items, endpoints }: Props) {
  void codebook;
  const isMobile = useIsMobile();
  const left = endpoints?.left ?? "sehr schlecht";
  const right = endpoints?.right ?? "sehr gut";
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
        range: LIKERT6_RAMP,
        legend: true,
        label: "Bewertung (1 = sehr schlecht … 6 = sehr gut)",
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

  const tableRows = items.map((it) => {
    const r = rows.filter((x) => x.item === it.label).sort((a, b) => a.rating - b.rating);
    return [it.label, ...r.map((d) => fmtPct(d.share))];
  });

  return (
    <ChartFrame caption={{ left, right }} table={<ChartTable headers={["Merkmal", ...SCALE.map(String)]} rows={tableRows} />}>
      <PlotFigure options={options} />
    </ChartFrame>
  );
}
