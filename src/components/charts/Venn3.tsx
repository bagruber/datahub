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

type Region = "onlyA" | "onlyB" | "onlyC" | "ab" | "ac" | "bc" | "abc";

const REGION_SETS: Record<Region, SetKey[]> = {
  onlyA: ["A"],
  onlyB: ["B"],
  onlyC: ["C"],
  ab: ["A", "B"],
  ac: ["A", "C"],
  bc: ["B", "C"],
  abc: ["A", "B", "C"],
};

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

  // Region label positions (heuristic centroids)
  const tcx = (cxA + cxB + cxC) / 3;
  const tcy = (cyA + cyB + cyC) / 3;
  const minR = Math.min(rA, rB, rC);

  function awayFrom(cx: number, cy: number, r: number, factor = 0.55) {
    const dx = cx - tcx;
    const dy = cy - tcy;
    const len = Math.hypot(dx, dy) || 1;
    return { x: cx + (dx / len) * (r * factor), y: cy + (dy / len) * (r * factor) };
  }
  function pairCentroid(c1x: number, c1y: number, c2x: number, c2y: number, otherX: number, otherY: number) {
    const mx = (c1x + c2x) / 2;
    const my = (c1y + c2y) / 2;
    const dx = mx - otherX;
    const dy = my - otherY;
    const len = Math.hypot(dx, dy) || 1;
    return { x: mx + (dx / len) * minR * 0.18, y: my + (dy / len) * minR * 0.18 };
  }

  const labelPositions: Record<Region, { x: number; y: number }> = {
    onlyA: awayFrom(cxA, cyA, rA),
    onlyB: awayFrom(cxB, cyB, rB),
    onlyC: awayFrom(cxC, cyC, rC),
    ab: pairCentroid(cxA, cyA, cxB, cyB, cxC, cyC),
    ac: pairCentroid(cxA, cyA, cxC, cyC, cxB, cyB),
    bc: pairCentroid(cxB, cyB, cxC, cyC, cxA, cyA),
    abc: { x: tcx, y: tcy },
  };

  const regionCount: Record<Region, number> = {
    onlyA: counts.onlyA,
    onlyB: counts.onlyB,
    onlyC: counts.onlyC,
    ab: counts.abOnly,
    ac: counts.acOnly,
    bc: counts.bcOnly,
    abc: counts.abc,
  };

  // Whether a region "belongs" to the hovered set (for emphasis)
  const isHighlighted = (region: Region): boolean => {
    if (!hoverSet) return false;
    return REGION_SETS[region].includes(hoverSet);
  };

  // Set-name chip positions (above each circle, away from triangle centroid)
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

          {/* Set-name chips (outside each circle) */}
          <Chip x={nameA.x} y={nameA.y} text={labels[0]} borderColor={colors[0]} />
          <Chip x={nameB.x} y={nameB.y} text={labels[1]} borderColor={colors[1]} />
          <Chip x={nameC.x} y={nameC.y} text={labels[2]} borderColor={colors[2]} />

          {/* Region count chips. Skip empty regions to reduce clutter. */}
          {(Object.keys(labelPositions) as Region[]).map((region) => {
            const n = regionCount[region];
            if (n === 0) return null;
            const pos = labelPositions[region];
            const sets = REGION_SETS[region];
            const borderColor =
              sets.length === 1 ? colors[sets[0] === "A" ? 0 : sets[0] === "B" ? 1 : 2] : "#888";
            return (
              <Chip
                key={region}
                x={pos.x}
                y={pos.y}
                text={fmtInt(n)}
                sub={fmtPct(share(n))}
                borderColor={borderColor}
                fontSize={12}
                emphasized={isHighlighted(region)}
              />
            );
          })}
        </svg>

        {/* Side legend with set sizes + ABC intersection */}
        <ul className="grid gap-2 text-sm">
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
                    "w-full grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-2 px-2 py-1.5 rounded-md text-left transition-colors",
                    isHover ? "bg-cream-dark" : "hover:bg-cream-dark",
                  )}
                  style={{ opacity: dim ? 0.5 : 1 }}
                >
                  <span
                    aria-hidden
                    className="inline-block w-3 h-3 rounded-sm shrink-0 self-center"
                    style={{ background: s.color }}
                  />
                  <span className="truncate text-ink">{s.label}</span>
                  <span className="tabular-nums text-ink-soft shrink-0">
                    <span className="font-semibold text-ink">{fmtInt(s.size)}</span>
                    <span className="text-ink-muted text-xs"> ({fmtPct(share(s.size))})</span>
                  </span>
                </button>
              </li>
            );
          })}
          <li className="border-t border-ink-line pt-2 mt-1">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-2 px-2 py-1 text-ink-soft">
              <span aria-hidden className="inline-block w-3 h-3 rounded-sm shrink-0 self-center bg-ink-muted/40" />
              <span className="text-ink-soft">Alle drei</span>
              <span className="tabular-nums shrink-0">
                <span className="font-semibold text-ink">{fmtInt(counts.abc)}</span>
                <span className="text-ink-muted text-xs"> ({fmtPct(share(counts.abc))})</span>
              </span>
            </div>
          </li>
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
