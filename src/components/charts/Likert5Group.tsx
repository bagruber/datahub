import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { divergingStack } from "@/lib/diverging";
import { fmtInt, fmtPct } from "@/lib/format";
import type { Dataset } from "@/lib/data";

type Innovation = { key: string; name: string; sources: string[] };

type Props = {
  records: Dataset["records"];
  dimLabels: string[];
  invertedDims: number[];
  innovations: Innovation[];
  title?: string;
};

const SCALE = [1, 2, 3, 4, 5];
const RAMP_HEX = ["#b00e28", "#d96a4f", "#d6cfc1", "#82b67c", "#3f8c52"];

export function Likert5Group({ records, dimLabels, invertedDims, innovations }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {innovations.map((inn) => (
        <InnovationPanel
          key={inn.key}
          innovation={inn}
          records={records}
          dimLabels={dimLabels}
          invertedDims={invertedDims}
        />
      ))}
    </div>
  );
}

type Row = {
  dim: string;
  rating: number;
  share: number;
  count: number;
  n: number;
  x1: number;
  x2: number;
};

function InnovationPanel({
  innovation,
  records,
  dimLabels,
  invertedDims,
}: {
  innovation: Innovation;
  records: Dataset["records"];
  dimLabels: string[];
  invertedDims: number[];
}) {
  const inverted = useMemo(() => new Set(invertedDims), [invertedDims]);

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    innovation.sources.forEach((src, di) => {
      const counts = new Map<number, number>(SCALE.map((k) => [k, 0]));
      let n = 0;
      for (const r of records) {
        const raw = r[src];
        if (typeof raw !== "number") continue;
        const v = inverted.has(di) ? 6 - raw : raw;
        if (!counts.has(v)) continue;
        n++;
        counts.set(v, counts.get(v)! + 1);
      }
      const shares = SCALE.map((k) => (n === 0 ? 0 : counts.get(k)! / n));
      // 5-point with neutral at index 2 (rating 3).
      const segs = divergingStack(shares, { negative: [1, 0], center: 2, positive: [3, 4] });
      const dim = dimLabels[di] ?? `Dim ${di + 1}`;
      segs.forEach((seg) => {
        const rating = SCALE[seg.idx];
        out.push({
          dim,
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
  }, [innovation, records, dimLabels, inverted]);

  const dimOrder = useMemo(
    () =>
      innovation.sources.map((_, di) => dimLabels[di] ?? `Dim ${di + 1}`).reverse(),
    [innovation.sources, dimLabels],
  );

  const longest = useMemo(() => dimOrder.reduce((m, l) => Math.max(m, l.length), 0), [dimOrder]);
  const marginLeft = Math.min(180, Math.max(110, longest * 7.5));

  const extent = useMemo(() => {
    const m = rows.reduce((a, r) => Math.max(a, Math.abs(r.x1), Math.abs(r.x2)), 0);
    return Math.max(0.5, Math.ceil(m * 10) / 10);
  }, [rows]);

  const options: Plot.PlotOptions = useMemo(
    () => ({
      height: dimOrder.length * 28 + 60,
      marginLeft,
      marginRight: 16,
      marginTop: 32,
      marginBottom: 24,
      x: {
        domain: [-extent, extent],
        axis: "top",
        label: null,
        grid: true,
        ticks: 5,
        tickFormat: (v: number) => `${Math.abs(Math.round(v * 100))}%`,
      },
      y: { domain: dimOrder, label: null, tickSize: 0 },
      color: {
        type: "ordinal",
        domain: SCALE,
        range: RAMP_HEX,
        legend: true,
        label: "1 = stimme gar nicht zu  ·  5 = stimme voll zu",
      },
      style: {
        fontFamily: "Inter Variable, Inter, sans-serif",
        fontSize: "12px",
        color: "#1c1c1c",
      },
      marks: [
        Plot.barX(rows, {
          x1: "x1",
          x2: "x2",
          y: "dim",
          fill: "rating",
          insetTop: 3,
          insetBottom: 3,
          tip: true,
          title: (d: Row) =>
            `${d.dim}\nBewertung ${d.rating}\n${fmtInt(d.count)} von ${fmtInt(d.n)}\n${fmtPct(d.share)}`,
        }),
        Plot.ruleX([0], { stroke: "#1c1c1c", strokeWidth: 1.25 }),
      ],
    }),
    [rows, dimOrder, marginLeft, extent],
  );

  return (
    <figure className="rounded-lg border border-ink-line bg-cream/40 p-3">
      <figcaption className="font-semibold text-ink mb-2 text-sm sm:text-base">
        {innovation.name}
      </figcaption>
      <PlotFigure options={options} />
    </figure>
  );
}
