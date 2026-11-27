import { useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "@/lib/Plot";
import { divergingStack } from "@/lib/diverging";
import { fmtInt, fmtPct } from "@/lib/format";
import { BALKEN, EINZEL, INK, INK_MUTED, KERBE, NEUTRAL, SERIE } from "@/lib/palette";
import { useIsMobile } from "@/lib/useIsMobile";
import { ChartFrame } from "./ChartFrame";
import { ChartTable } from "./ChartTable";
import { Skalenleiste } from "./Skalenleiste";
import type { Dataset } from "@/lib/data";

type Option = { value: number; label: string; color: string };

type Props = {
  records: Dataset["records"];
  source: string;
  /** Three options in display order: [left, center/neutral, right]. */
  options: Option[];
  title?: string;
};

/** Zwei Seiten einer Wahl, keine Wertung: Isar-Blau gegen Gold statt Rot gegen
 *  Blau, das wie schlecht gegen gut gelesen würde. Die Mitte bleibt neutral.
 *  Die Farben im Datensatz werden wie überall ignoriert. */
const FARBEN = [EINZEL, NEUTRAL, SERIE[2]] as const;

// Zeilenmaße wie bei den Likert-Diagrammen. Ohne Band-Padding ist das Band
// genau eine Zeile hoch, der Balken genau BALKEN.
const ZEILE = 44;
const INSET_UNTEN = 24;
const INSET_OBEN = ZEILE - INSET_UNTEN - BALKEN;
const BALKEN_UNTEN = ZEILE - INSET_UNTEN;

type Segment = { idx: number; label: string; anzahl: number; anteil: number; n: number; x1: number; x2: number };

/** Eine Wahl zwischen zwei Optionen mit unentschiedener Mitte, gebaut wie eine
 *  Likert-Zeile: Die Mitte des neutralen Balkens liegt auf der Mittellinie,
 *  die Anteile beider Seiten stehen außen, der neutrale darunter. */
export function Diverging3({ records, source, options }: Props) {
  const isMobile = useIsMobile();

  const segmente: Segment[] = useMemo(() => {
    let n = 0;
    const counts = options.map(() => 0);
    for (const r of records) {
      const i = options.findIndex((o) => o.value === r[source]);
      if (i < 0) continue;
      n++;
      counts[i]++;
    }
    const anteile = counts.map((c) => (n === 0 ? 0 : c / n));
    return divergingStack(anteile, { negative: [0], center: 1, positive: [2] }).map((seg) => ({
      idx: seg.idx,
      label: options[seg.idx].label,
      anzahl: counts[seg.idx],
      anteil: anteile[seg.idx],
      n,
      x1: seg.x1,
      x2: seg.x2,
    }));
  }, [records, source, options]);

  const extent = useMemo(() => {
    const m = segmente.reduce((a, s) => Math.max(a, Math.abs(s.x1), Math.abs(s.x2)), 0);
    return Math.max(0.5, Math.ceil(m * 10) / 10);
  }, [segmente]);

  const fontPx = isMobile ? 11 : 13;
  const balkenMitte = (INSET_OBEN - INSET_UNTEN) / 2;

  const plotOptions: Plot.PlotOptions = useMemo(() => {
    const seite = (idx: number) => segmente.filter((s) => s.idx === idx);
    return {
      height: ZEILE,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 56,
      marginRight: 56,
      x: { domain: [-extent, extent], axis: null, label: null },
      y: { domain: ["alle"], axis: null, padding: 0 },
      color: { type: "ordinal", domain: options.map((o) => o.label), range: [...FARBEN] },
      style: { fontFamily: "var(--font-sans)", fontSize: `${fontPx}px`, color: INK },
      marks: [
        Plot.barX(segmente, {
          x1: "x1",
          x2: "x2",
          y: () => "alle",
          fill: "label",
          insetTop: INSET_OBEN,
          insetBottom: INSET_UNTEN,
          insetLeft: 0.5,
          insetRight: 0.5,
          tip: true,
          title: (d: Segment) => `${d.label}\n${fmtInt(d.anzahl)} von ${fmtInt(d.n)}\n${fmtPct(d.anteil)}`,
        }),
        // Kerben über und unter dem Balken, wie bei Likert.
        Plot.tickX([0], { x: 0, y: () => "alle", insetTop: INSET_OBEN - 5, insetBottom: ZEILE - INSET_OBEN + 1, stroke: KERBE }),
        Plot.tickX([0], { x: 0, y: () => "alle", insetTop: BALKEN_UNTEN + 1, insetBottom: ZEILE - BALKEN_UNTEN - 5, stroke: KERBE }),
        // Beide Seiten gleich gewichtet: keine ist die „gute“.
        Plot.text(seite(0), {
          x: -extent,
          y: () => "alle",
          text: (d: Segment) => fmtPct(d.anteil),
          textAnchor: "end",
          dx: -6,
          dy: balkenMitte,
          fontWeight: 600,
          fontSize: fontPx,
          fill: INK,
        }),
        Plot.text(seite(2), {
          x: extent,
          y: () => "alle",
          text: (d: Segment) => fmtPct(d.anteil),
          textAnchor: "start",
          dx: 6,
          dy: balkenMitte,
          fontWeight: 600,
          fontSize: fontPx,
          fill: INK,
        }),
        Plot.text(seite(1), {
          x: 0,
          y: () => "alle",
          text: (d: Segment) => `${fmtPct(d.anteil)} ${d.label}`,
          dy: balkenMitte + 20,
          fontSize: Math.max(11, fontPx - 1),
          fill: INK_MUTED,
        }),
      ],
    };
  }, [segmente, extent, options, fontPx, balkenMitte]);

  return (
    <ChartFrame
      table={
        <ChartTable
          headers={["Option", "Anzahl", "Anteil"]}
          rows={options.map((o, i) => {
            const s = segmente.find((x) => x.idx === i);
            return [o.label, fmtInt(s?.anzahl ?? 0), fmtPct(s?.anteil ?? 0)];
          })}
        />
      }
    >
      <Skalenleiste ramp={FARBEN} links={options[0].label} rechts={options[2].label} kerbe />
      <PlotFigure options={plotOptions} />
    </ChartFrame>
  );
}
