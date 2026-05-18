import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { divergingStack } from "@/lib/diverging";
import { asScalar } from "@/lib/record";
import { fmtInt, fmtPct } from "@/lib/format";
import {
  INK,
  LIKERT5_RAMP,
  LIKERT6_RAMP,
  PRICE5_RAMP,
  PRICE6_RAMP,
  RADIUS,
  STROKE,
} from "@/lib/palette";
import { useIsMobile } from "@/lib/useIsMobile";
import { ChartFrame } from "./ChartFrame";
import { ChartTable } from "./ChartTable";
import { ScaleCaption } from "./ScaleCaption";
import type { Codebook, Dataset } from "@/lib/data";

/**
 * Unified diverging stacked-bar Likert chart.
 *
 * Replaces the per-scale, per-tone duplicates that used to exist (Likert5,
 * Likert6, Price). One component handles:
 *
 *  • 5-point and 6-point scales (more sizes can be added by extending
 *    `divergenceFor`).
 *  • Tone `"evaluative"` — red→green ramp for gut/schlecht-style ratings;
 *    `"neutral"` — blue ramp for axes without a value judgement
 *    (günstig/teuer, gross/klein, …).
 *  • Per-item inversion via `invertItem(i) → boolean`. Used by Likert5Group
 *    for the "Bedenken" dimension where high = bad and we want the chart to
 *    read consistently as "higher = better". The flip is `(scale+1) − rating`.
 *  • Compact density (no ChartFrame, smaller margins) for embedding inside
 *    Likert5Group's per-innovation card.
 *
 * Future scales (e.g. a 4-point or 7-point) can be supported by adding their
 * divergence layout to the `divergenceFor` switch.
 */

export type DivergingTone = "evaluative" | "neutral";
export type DivergingDensity = "standard" | "compact";

export type DivergingItem = { source: string; label: string };

type Props = {
  records: Dataset["records"];
  codebook: Codebook;
  items: DivergingItem[];
  /** Scale step count. Add more by extending `divergenceFor`. */
  scale: 5 | 6;
  tone?: DivergingTone;
  endpoints?: { left: string; right: string };
  density?: DivergingDensity;
  /** Per-item flip (rating' = scale+1 − rating). For inverted dimensions. */
  invertItem?: (i: number) => boolean;
  /** Override the colour-axis legend label (rare). */
  legendLabel?: string;
};

const DEFAULT_ENDPOINTS: Record<DivergingTone, { left: string; right: string }> = {
  evaluative: { left: "sehr schlecht", right: "sehr gut" },
  neutral:    { left: "günstig",       right: "teuer" },
};

function rampFor(tone: DivergingTone, scale: 5 | 6): readonly string[] {
  if (tone === "evaluative") return scale === 5 ? LIKERT5_RAMP : LIKERT6_RAMP;
  return scale === 5 ? PRICE5_RAMP : PRICE6_RAMP;
}

/** Diverging layout per scale size. 5-point has a true neutral that straddles
 *  the centre line; 6-point has no centre and splits between rating 3 and 4. */
function divergenceFor(scale: 5 | 6): { negative: number[]; center?: number; positive: number[] } {
  if (scale === 5) return { negative: [1, 0], center: 2, positive: [3, 4] };
  return { negative: [2, 1, 0], positive: [3, 4, 5] };
}

function defaultLegendFor(tone: DivergingTone, scale: 5 | 6): string {
  if (tone === "neutral") return `Preisempfinden — 1 = günstig, ${scale} = teuer`;
  return scale === 5
    ? "1 = sehr schlecht  ·  3 = neutral  ·  5 = sehr gut"
    : "Bewertung (1 = sehr schlecht … 6 = sehr gut)";
}

type Row = {
  item: string;
  rating: number;
  share: number;
  count: number;
  n: number;
  x1: number;
  x2: number;
};

function buildRows(
  records: Dataset["records"],
  items: DivergingItem[],
  scale: 5 | 6,
  invertItem: ((i: number) => boolean) | undefined,
): Row[] {
  const ratings = Array.from({ length: scale }, (_, i) => i + 1);
  const div = divergenceFor(scale);
  const out: Row[] = [];

  items.forEach((it, idx) => {
    const flipped = invertItem?.(idx) ?? false;
    const flip = (v: number): number => (flipped ? scale + 1 - v : v);

    // Single-pass count using the (possibly flipped) rating.
    const counts = new Map<number, number>(ratings.map((k) => [k, 0]));
    let n = 0;
    for (const r of records) {
      const raw = asScalar(r[it.source]);
      if (raw === null) continue;
      const v = flip(raw);
      if (!counts.has(v)) continue;
      n++;
      counts.set(v, counts.get(v)! + 1);
    }
    const shares = ratings.map((k) => (n === 0 ? 0 : counts.get(k)! / n));
    const segs = divergingStack(shares, div);

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

export function DivergingLikert({
  records,
  codebook,
  items,
  scale,
  tone = "evaluative",
  endpoints,
  density = "standard",
  invertItem,
  legendLabel,
}: Props) {
  void codebook;
  const isMobile = useIsMobile();
  const ratings = useMemo(() => Array.from({ length: scale }, (_, i) => i + 1), [scale]);
  const ramp = rampFor(tone, scale);
  const ep = endpoints ?? DEFAULT_ENDPOINTS[tone];

  const rows = useMemo(
    () => buildRows(records, items, scale, invertItem),
    [records, items, scale, invertItem],
  );
  const itemOrder = useMemo(() => items.map((i) => i.label).reverse(), [items]);

  const compact = density === "compact";
  const marginLeft = compact ? (isMobile ? 100 : 160) : (isMobile ? 110 : 180);
  const marginRight = compact ? 16 : 24;
  const fontPx = compact ? (isMobile ? 10 : 12) : (isMobile ? 11 : 13);
  const axisPx = isMobile ? 10 : 12;
  const rowHeight = compact ? 28 : 30;
  const bandPadding = compact ? 60 : tone === "neutral" ? 70 : 60;

  const extent = useMemo(() => {
    const m = rows.reduce((a, r) => Math.max(a, Math.abs(r.x1), Math.abs(r.x2)), 0);
    return Math.max(0.5, Math.ceil(m * 10) / 10);
  }, [rows]);

  const options: Plot.PlotOptions = useMemo(
    () => ({
      height: itemOrder.length * rowHeight + bandPadding,
      marginLeft,
      marginRight,
      marginTop: 32,
      marginBottom: compact ? 24 : 28,
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
        range: [...ramp],
        legend: true,
        label: legendLabel ?? defaultLegendFor(tone, scale),
      },
      style: {
        fontFamily: "Inter Variable, Inter, sans-serif",
        fontSize: `${fontPx}px`,
        color: INK,
      },
      marks: [
        // Compact density skips the explicit axis (parent's card carries the
        // labels visually; row count is small enough that wrap doesn't help).
        ...(compact ? [] : [Plot.axisY({ lineWidth: isMobile ? 9 : 12, fontSize: axisPx })]),
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
    [
      rows, itemOrder, ratings, ramp, compact, fontPx, marginLeft, marginRight,
      isMobile, axisPx, extent, legendLabel, tone, scale, rowHeight, bandPadding,
    ],
  );

  // Compact mode renders bare (parent owns the card + caption layout).
  if (compact) {
    return (
      <>
        <PlotFigure options={options} />
        <ScaleCaption left={ep.left} right={ep.right} />
      </>
    );
  }

  const tableRows = items.map((it) => {
    const r = rows.filter((x) => x.item === it.label).sort((a, b) => a.rating - b.rating);
    return [it.label, ...r.map((d) => fmtPct(d.share))];
  });

  return (
    <ChartFrame
      caption={{ left: ep.left, right: ep.right }}
      table={<ChartTable headers={["Merkmal", ...ratings.map(String)]} rows={tableRows} />}
    >
      <PlotFigure options={options} />
    </ChartFrame>
  );
}
