import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { fmtInt } from "@/lib/format";
import { GITTER, INK, INK_MUTED, NULLLINIE, RADIUS, SERIE } from "@/lib/palette";
import { useIsMobile } from "@/lib/useIsMobile";
import { ChartFrame } from "./ChartFrame";
import { ChartTable } from "./ChartTable";

type Group = { label: string; left: number; right: number };

type Props = {
  groups: Group[];
  leftLabel: string;
  rightLabel: string;
  title?: string;
};

/** Population/age pyramid: horizontal back-to-back bar chart. The left side
 *  is rendered with negative x values so both sides extend outward from a
 *  central zero line. Y-axis is ordered with the FIRST group at the bottom
 *  (the natural pyramid convention: young at bottom, old at top). */
export function Pyramid({
  groups,
  leftLabel,
  rightLabel,
}: Props) {
  const isMobile = useIsMobile();
  const fontPx = isMobile ? 11 : 13;

  // Plot's ordinal y axis renders the first domain entry at the TOP. We want
  // the youngest band at the BOTTOM, so the domain is the reversed group order.
  const yDomain = useMemo(() => groups.map((g) => g.label).slice().reverse(), [groups]);

  // Mirror left values to negative x; right stays positive.
  const data = useMemo(
    () =>
      groups.flatMap((g) => [
        { label: g.label, side: leftLabel, count: g.left, x: -g.left },
        { label: g.label, side: rightLabel, count: g.right, x: g.right },
      ]),
    [groups, leftLabel, rightLabel],
  );

  // Symmetric x domain so the centre line stays centred regardless of which
  // side is heavier.
  const extent = useMemo(() => {
    const m = groups.reduce((a, g) => Math.max(a, g.left, g.right), 0);
    return Math.max(1, Math.ceil(m / 10) * 10);
  }, [groups]);

  const options: Plot.PlotOptions = useMemo(
    () => ({
      height: groups.length * 34 + 60,
      marginLeft: 64,
      marginRight: 16,
      marginTop: 32,
      marginBottom: 36,
      x: {
        domain: [-extent, extent],
        axis: "bottom",
        label: null,
        grid: false,
        ticks: 5,
        tickFormat: (v: number) => fmtInt(Math.abs(v)),
      },
      y: { domain: yDomain, label: null, tickSize: 0 },
      color: {
        type: "ordinal",
        domain: [leftLabel, rightLabel],
        // Zwei Toene aus der Palette statt Blau und Rot nach Geschlecht.
        range: [SERIE[3], SERIE[2]],
        legend: true,
      },
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: `${fontPx}px`,
        color: INK,
      },
      marks: [
        Plot.gridX({ stroke: GITTER, strokeOpacity: 1 }),
        Plot.axisX({ fontSize: fontPx - 1, tickSize: 0, color: INK_MUTED, tickFormat: (v: number) => fmtInt(Math.abs(v)) }),
        Plot.axisY({ fontSize: fontPx - 1, tickSize: 0, color: INK_MUTED }),
        Plot.barX(data, {
          x: "x",
          y: "label",
          fill: "side",
          insetTop: 3,
          insetBottom: 3,
          rx: RADIUS.bar,
          tip: true,
          title: (d: { side: string; label: string; count: number }) =>
            `${d.label} · ${d.side}\n${fmtInt(d.count)}`,
        }),
        Plot.ruleX([0], { stroke: NULLLINIE, strokeWidth: 1 }),
      ],
    }),
    [data, yDomain, groups.length, leftLabel, rightLabel, fontPx, extent],
  );

  // sr-only table: one row per age band, columns = left / right / total.
  const tableRows = groups.map((g) => [g.label, fmtInt(g.left), fmtInt(g.right), fmtInt(g.left + g.right)]);

  return (
    <ChartFrame
      table={
        <ChartTable
          headers={["Altersgruppe", leftLabel, rightLabel, "Gesamt"]}
          rows={tableRows}
        />
      }
    >
      <PlotFigure options={options} />
    </ChartFrame>
  );
}
