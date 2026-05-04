import { useMemo, useState } from "react";
import { layoutVenn3 } from "@/lib/venn";
import { fmtInt, fmtPct } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Chip } from "@/components/svg/Chip";
import { STROKE } from "@/lib/palette";
import type { Dataset } from "@/lib/data";

type SetKey = "A" | "B" | "C";

type Props = {
  records: Dataset["records"];
  source: string;
  values: number[]; // [codeA, codeB, codeC]
  labels: string[]; // 3 labels
  colors: string[]; // 3 colours
  title?: string;
};

const PAD = 44;
const TARGET_W = 520;


export function Venn3({ records, source, values, labels, colors }: Props) {
  const [hoverSet, setHoverSet] = useState<SetKey | null>(null);

  const counts = useMemo(() => {
    let onlyA = 0, onlyB = 0, onlyC = 0;
    let abOnly = 0, acOnly = 0, bcOnly = 0;
    let abc = 0, neither = 0;
    const [a, b, c] = values;
    for (const r of records) {
      const v = r[source];
      const arr = Array.isArray(v) ? v : v != null ? [v] : [];
      const hasA = arr.some((x) => x === a);
      const hasB = arr.some((x) => x === b);
      const hasC = arr.some((x) => x === c);
      if (hasA && hasB && hasC) abc++;
      else if (hasA && hasB) abOnly++;
      else if (hasA && hasC) acOnly++;
      else if (hasB && hasC) bcOnly++;
      else if (hasA) onlyA++;
      else if (hasB) onlyB++;
      else if (hasC) onlyC++;
      else neither++;
    }
    const setA = onlyA + abOnly + acOnly + abc;
    const setB = onlyB + abOnly + bcOnly + abc;
    const setC = onlyC + acOnly + bcOnly + abc;
    const ab = abOnly + abc;
    const ac = acOnly + abc;
    const bc = bcOnly + abc;
    const denom = onlyA + onlyB + onlyC + abOnly + acOnly + bcOnly + abc;
    return {
      onlyA, onlyB, onlyC, abOnly, acOnly, bcOnly, abc, neither,
      setA, setB, setC, ab, ac, bc, denom,
    };
  }, [records, source, values]);

  const layout = useMemo(
    () => layoutVenn3({
      setA: counts.setA, setB: counts.setB, setC: counts.setC,
      ab: counts.ab, ac: counts.ac, bc: counts.bc,
    }),
    [counts],
  );

  const share = (n: number) => (counts.denom === 0 ? 0 : n / counts.denom);

  if (!layout) {
    return (
      <p className="text-ink-muted text-sm py-8 text-center">
        Nicht genug Daten für ein Venn-Diagramm.
      </p>
    );
  }

  // Scale to viewBox
  const innerW = TARGET_W - PAD * 2;
  const scale = innerW / layout.width;
  const innerH = layout.height * scale;
  const VIEW_H = innerH + PAD * 2;
  const cxA = PAD + layout.cxA * scale;
  const cyA = PAD + layout.cyA * scale;
  const cxB = PAD + layout.cxB * scale;
  const cyB = PAD + layout.cyB * scale;
  const cxC = PAD + layout.cxC * scale;
  const cyC = PAD + layout.cyC * scale;
  const rA = layout.rA * scale;
  const rB = layout.rB * scale;
  const rC = layout.rC * scale;

  // Set-name chip positions (outside each circle, away from triangle centroid)
  const tcx = (cxA + cxB + cxC) / 3;
  const tcy = (cyA + cyB + cyC) / 3;
  function namePos(cx: number, cy: number, r: number) {
    const dx = cx - tcx;
    const dy = cy - tcy;
    const len = Math.hypot(dx, dy) || 1;
    return { x: cx + (dx / len) * (r + 18), y: cy + (dy / len) * (r + 18) };
  }
  const nameA = namePos(cxA, cyA, rA);
  const nameB = namePos(cxB, cyB, rB);
  const nameC = namePos(cxC, cyC, rC);

  const renderCircle = (
    key: SetKey,
    cx: number,
    cy: number,
    r: number,
    color: string,
  ) => {
    const dimmed = hoverSet !== null && hoverSet !== key;
    return (
      <circle
        key={key}
        cx={cx}
        cy={cy}
        r={r}
        fill={color}
        fillOpacity={hoverSet === key ? 0.55 : 0.4}
        stroke={color}
        strokeOpacity={dimmed ? 0.4 : 0.9}
        strokeWidth={STROKE.outline}
        style={{ transition: "fill-opacity 120ms, stroke-opacity 120ms", cursor: "pointer" }}
        onMouseEnter={() => setHoverSet(key)}
      />
    );
  };

  const setEntries: { key: SetKey; label: string; color: string; size: number }[] = [
    { key: "A", label: labels[0], color: colors[0], size: counts.setA },
    { key: "B", label: labels[1], color: colors[1], size: counts.setB },
    { key: "C", label: labels[2], color: colors[2], size: counts.setC },
  ];

  return (
    <figure>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-center">
        <svg
          viewBox={`0 0 ${TARGET_W} ${VIEW_H}`}
          width="100%"
          height={VIEW_H}
          role="img"
          aria-label={`Venn-Diagramm ${labels.join(", ")}`}
          onMouseLeave={() => setHoverSet(null)}
          className="block"
        >
          {/* Circles render in source order; overlaps blend through opacity. */}
          {renderCircle("A", cxA, cyA, rA, colors[0])}
          {renderCircle("B", cxB, cyB, rB, colors[1])}
          {renderCircle("C", cxC, cyC, rC, colors[2])}

          {/* Only set-name chips inside the SVG. Region counts moved to the
              side legend — three circles overlap too densely for inline chips
              to stay legible. */}
          <Chip x={nameA.x} y={nameA.y} text={labels[0]} borderColor={colors[0]} />
          <Chip x={nameB.x} y={nameB.y} text={labels[1]} borderColor={colors[1]} />
          <Chip x={nameC.x} y={nameC.y} text={labels[2]} borderColor={colors[2]} />
        </svg>

        {/* Side legend — 3 set rows (solid square), 3 pairwise rows (split
            square = the Venn2 "both" idiom), and one "Alle drei" row
            (three-thirds square). All 7 region counts are read here. */}
        <ul className="grid gap-1.5 text-sm">
          {/* Sets */}
          {setEntries.map((s) => {
            const isHover = hoverSet === s.key;
            const dim = hoverSet !== null && !isHover;
            return (
              <li key={s.key}>
                <button
                  type="button"
                  onMouseEnter={() => setHoverSet(s.key)}
                  onMouseLeave={() => setHoverSet(null)}
                  onFocus={() => setHoverSet(s.key)}
                  onBlur={() => setHoverSet(null)}
                  className={cn(
                    "w-full grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-2 px-2 py-1 rounded-md text-left transition-colors",
                    isHover ? "bg-cream-dark" : "hover:bg-cream-dark",
                  )}
                  style={{ opacity: dim ? 0.5 : 1 }}
                >
                  <Swatch fill={s.color} />
                  <span className="truncate text-ink">{s.label}</span>
                  <LegendCount n={s.size} share={share(s.size)} />
                </button>
              </li>
            );
          })}
          <li className="border-t border-ink-line pt-1.5 mt-0.5">
            <p className="eyebrow text-[10px] mb-1 px-2">Schnittmengen</p>
          </li>
          {/* Pairwise — split squares */}
          <LegendRow
            half={[colors[0], colors[1]]}
            label={`Nur ${labels[0]} & ${labels[1]}`}
            n={counts.abOnly}
            share={share(counts.abOnly)}
          />
          <LegendRow
            half={[colors[0], colors[2]]}
            label={`Nur ${labels[0]} & ${labels[2]}`}
            n={counts.acOnly}
            share={share(counts.acOnly)}
          />
          <LegendRow
            half={[colors[1], colors[2]]}
            label={`Nur ${labels[1]} & ${labels[2]}`}
            n={counts.bcOnly}
            share={share(counts.bcOnly)}
          />
          {/* Triple */}
          <LegendRow
            thirds={[colors[0], colors[1], colors[2]]}
            label="Alle drei"
            n={counts.abc}
            share={share(counts.abc)}
            emphasized
          />
        </ul>
      </div>
      <table className="sr-only">
        <tbody>
          <tr><td>Nur {labels[0]}</td><td>{fmtInt(counts.onlyA)}</td></tr>
          <tr><td>Nur {labels[1]}</td><td>{fmtInt(counts.onlyB)}</td></tr>
          <tr><td>Nur {labels[2]}</td><td>{fmtInt(counts.onlyC)}</td></tr>
          <tr><td>{labels[0]} & {labels[1]}</td><td>{fmtInt(counts.abOnly)}</td></tr>
          <tr><td>{labels[0]} & {labels[2]}</td><td>{fmtInt(counts.acOnly)}</td></tr>
          <tr><td>{labels[1]} & {labels[2]}</td><td>{fmtInt(counts.bcOnly)}</td></tr>
          <tr><td>Alle drei</td><td>{fmtInt(counts.abc)}</td></tr>
          <tr><td>Keine Angabe</td><td>{fmtInt(counts.neither)}</td></tr>
        </tbody>
      </table>
    </figure>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Legend helpers — local to Venn3 since the swatch idiom (split square,
// thirds square) only makes sense for Venn diagrams.

function Swatch({ fill }: { fill: string }) {
  return (
    <span
      aria-hidden
      className="inline-block w-3.5 h-3.5 rounded-sm shrink-0 self-center"
      style={{ background: fill }}
    />
  );
}

function HalfSwatch({ left, right }: { left: string; right: string }) {
  return (
    <span
      aria-hidden
      className="inline-block w-3.5 h-3.5 rounded-sm shrink-0 self-center"
      style={{ background: `linear-gradient(90deg, ${left} 50%, ${right} 50%)` }}
    />
  );
}

function ThirdsSwatch({ a, b, c }: { a: string; b: string; c: string }) {
  return (
    <span
      aria-hidden
      className="inline-block w-3.5 h-3.5 rounded-sm shrink-0 self-center"
      style={{
        background: `linear-gradient(90deg, ${a} 0 33.33%, ${b} 33.33% 66.66%, ${c} 66.66% 100%)`,
      }}
    />
  );
}

function LegendCount({ n, share }: { n: number; share: number }) {
  return (
    <span className="tabular-nums shrink-0 text-ink-soft">
      <span className="font-semibold text-ink">{fmtInt(n)}</span>
      <span className="text-ink-muted text-xs"> ({fmtPct(share)})</span>
    </span>
  );
}

function LegendRow(props: {
  label: string;
  n: number;
  share: number;
  half?: [string, string];
  thirds?: [string, string, string];
  emphasized?: boolean;
}) {
  const { label, n, share, half, thirds, emphasized } = props;
  return (
    <li>
      <div
        className={cn(
          "grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-2 px-2 py-1 rounded-md",
          emphasized && "bg-cream-dark",
        )}
      >
        {half && <HalfSwatch left={half[0]} right={half[1]} />}
        {thirds && <ThirdsSwatch a={thirds[0]} b={thirds[1]} c={thirds[2]} />}
        <span className={cn("truncate", emphasized ? "text-ink font-semibold" : "text-ink-soft")}>
          {label}
        </span>
        <LegendCount n={n} share={share} />
      </div>
    </li>
  );
}
