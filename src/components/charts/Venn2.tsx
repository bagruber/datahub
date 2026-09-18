import { useId, useMemo } from "react";
import { layoutVenn2 } from "@/lib/venn";
import { fmtInt, fmtPct } from "@/lib/format";
import { INK, INK_MUTED, SERIE, STROKE } from "@/lib/palette";
import { ChartTable } from "./ChartTable";
import type { Dataset } from "@/lib/data";

type Props = {
  records: Dataset["records"];
  source: string;
  values: number[]; // [codeA, codeB]
  labels: string[]; // [labelA, labelB]
  title?: string;
};

const PAD = 40;
const TARGET_W = 480;

export function Venn2({ records, source, values, labels }: Props) {
  const id = useId().replace(/[:]/g, "");

  const counts = useMemo(() => {
    const [a, b] = values;
    let onlyA = 0;
    let onlyB = 0;
    let both = 0;
    let neither = 0;
    for (const r of records) {
      const v = r[source];
      const arr = Array.isArray(v) ? v : v != null ? [v] : [];
      const hasA = arr.some((x) => x === a);
      const hasB = arr.some((x) => x === b);
      if (hasA && hasB) both++;
      else if (hasA) onlyA++;
      else if (hasB) onlyB++;
      else neither++;
    }
    const totalA = onlyA + both;
    const totalB = onlyB + both;
    const total = onlyA + onlyB + both + neither;
    return { onlyA, onlyB, both, neither, totalA, totalB, total };
  }, [records, source, values]);

  const layout = useMemo(
    () => layoutVenn2(counts.totalA, counts.totalB, counts.both),
    [counts],
  );

  const denom = counts.onlyA + counts.onlyB + counts.both;
  const share = (n: number) => (denom === 0 ? 0 : n / denom);

  if (!layout) {
    return (
      <p className="text-ink-muted text-sm py-8 text-center">
        Nicht genug Daten für ein Venn-Diagramm.
      </p>
    );
  }

  const colorA = SERIE[0];
  const colorB = SERIE[1];

  // Scale layout to viewBox
  const innerW = TARGET_W - PAD * 2;
  const scale = innerW / layout.width;
  const innerH = layout.height * scale;
  const VIEW_H = innerH + PAD * 2;
  const cxA = PAD + layout.cxA * scale;
  const cxB = PAD + layout.cxB * scale;
  const cy = PAD + layout.cy * scale;
  const rA = layout.rA * scale;
  const rB = layout.rB * scale;

  const onlyACenter = { x: cxA - rA * 0.55, y: cy };
  const onlyBCenter = { x: cxB + rB * 0.55, y: cy };
  const bothCenter = { x: (cxA + cxB) / 2, y: cy };

  return (
    <figure>
      <svg
        viewBox={`0 0 ${TARGET_W} ${VIEW_H}`}
        width="100%"
        height={VIEW_H}
        role="img"
        aria-label={`${labels[0]} und ${labels[1]}: die Zahlen stehen in der Tabelle darunter`}
        className="mx-auto block max-w-[520px]"
      >
        <defs>
          {/* Schnittmenge als Schraffur aus beiden Farben statt als Mischfarbe. */}
          <pattern id={`${id}-sch`} width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width={8} height={8} fill="#fbf9f6" />
            <rect width={1.7} height={8} fill={colorA} opacity={0.55} />
            <rect x={4} width={1.7} height={8} fill={colorB} opacity={0.55} />
          </pattern>
          <clipPath id={`${id}-a`}>
            <circle cx={cxA} cy={cy} r={rA} />
          </clipPath>
        </defs>

        <circle cx={cxA} cy={cy} r={rA} fill={colorA} fillOpacity={0.07} />
        <circle cx={cxB} cy={cy} r={rB} fill={colorB} fillOpacity={0.07} />
        <g clipPath={`url(#${id}-a)`}>
          <circle cx={cxB} cy={cy} r={rB} fill={`url(#${id}-sch)`} />
        </g>
        <circle cx={cxA} cy={cy} r={rA} fill="none" stroke={colorA} strokeWidth={STROKE.outline} />
        <circle cx={cxB} cy={cy} r={rB} fill="none" stroke={colorB} strokeWidth={STROKE.outline} />

        {([
          { x: onlyACenter.x, wert: counts.onlyA },
          { x: bothCenter.x, wert: counts.both },
          { x: onlyBCenter.x, wert: counts.onlyB },
        ] as const).map(({ x, wert }, i) =>
          wert === 0 ? null : (
            <g key={i}>
              <text
                x={x}
                y={cy - 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={INK}
                style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, fontVariantNumeric: "lining-nums tabular-nums" }}
              >
                {fmtInt(wert)}
              </text>
              <text x={x} y={cy + 16} textAnchor="middle" fill={INK_MUTED} style={{ fontSize: 11 }}>
                {fmtPct(share(wert))}
              </text>
            </g>
          ),
        )}

        {/* Namen außen an der eigenen Menge, darunter ihre Summe. */}
        <text x={cxA - rA + 2} y={cy - rA - 22} fill={colorA} style={{ fontSize: 13, fontWeight: 700 }}>
          {labels[0]}
        </text>
        <text x={cxA - rA + 2} y={cy - rA - 7} fill={INK_MUTED} style={{ fontSize: 11 }}>
          {fmtInt(counts.onlyA + counts.both)} Antworten
        </text>
        <text x={cxB + rB - 2} y={cy + Math.max(rA, rB) + 18} textAnchor="end" fill={colorB} style={{ fontSize: 13, fontWeight: 700 }}>
          {labels[1]}
        </text>
        <text x={cxB + rB - 2} y={cy + Math.max(rA, rB) + 33} textAnchor="end" fill={INK_MUTED} style={{ fontSize: 11 }}>
          {fmtInt(counts.onlyB + counts.both)} Antworten
        </text>
      </svg>

      {counts.neither > 0 && (
        <p className="mt-1 text-xs text-ink-muted">{fmtInt(counts.neither)} ohne Angabe, nicht abgebildet</p>
      )}
      <ChartTable
        headers={["Gebiet", "Antworten", "Anteil"]}
        rows={[
          [`nur ${labels[0]}`, fmtInt(counts.onlyA), fmtPct(share(counts.onlyA))],
          ["beides", fmtInt(counts.both), fmtPct(share(counts.both))],
          [`nur ${labels[1]}`, fmtInt(counts.onlyB), fmtPct(share(counts.both === 0 ? 0 : counts.onlyB))],
        ]}
      />
    </figure>
  );
}
