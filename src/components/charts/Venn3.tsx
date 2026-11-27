import { useId, useMemo } from "react";
import { fmtInt, fmtPct } from "@/lib/format";
import { INK, INK_MUTED, SERIE, STROKE } from "@/lib/palette";
import { loeseEllipsen, SCHLUESSEL, type Ellipse } from "@/lib/vennEllipsen";
import { platziere } from "@/lib/vennBeschriftung";
import { ChartTable } from "./ChartTable";
import type { Dataset } from "@/lib/data";

type Props = {
  records: Dataset["records"];
  source: string;
  values: number[]; // [codeA, codeB, codeC]
  labels: string[]; // 3 labels
  title?: string;
};

const BREITE = 520;
const HOEHE = 380;
const RAND = 54;

/** Diagramm mit drei Mengen. Probe Diagramme, vorläufig (18.09.2026):
 *  flächentreu über drei Ellipsen, Schnittmengen in Schraffur aus den Farben
 *  ihrer Mengen. Gebiete ohne Antworten fehlen (Euler, nicht Venn). Findet der
 *  Löser keine Lage, stehen schematische Kreise. */
export function Venn3({ records, source, values, labels }: Props) {
  const farben = [SERIE[0], SERIE[1], SERIE[2]];
  const id = useId().replace(/[:]/g, "");

  const zahlen = useMemo(() => {
    let onlyA = 0, onlyB = 0, onlyC = 0, ab = 0, ac = 0, bc = 0, abc = 0, keine = 0;
    const [a, b, c] = values;
    for (const r of records) {
      const v = r[source];
      const arr = Array.isArray(v) ? v : v != null ? [v] : [];
      const hatA = arr.some((x) => x === a);
      const hatB = arr.some((x) => x === b);
      const hatC = arr.some((x) => x === c);
      if (hatA && hatB && hatC) abc++;
      else if (hatA && hatB) ab++;
      else if (hatA && hatC) ac++;
      else if (hatB && hatC) bc++;
      else if (hatA) onlyA++;
      else if (hatB) onlyB++;
      else if (hatC) onlyC++;
      else keine++;
    }
    const gesamt = onlyA + onlyB + onlyC + ab + ac + bc + abc;
    return {
      gebiete: { "100": onlyA, "010": onlyB, "001": onlyC, "110": ab, "101": ac, "011": bc, "111": abc } as Record<string, number>,
      summen: [onlyA + ab + ac + abc, onlyB + ab + bc + abc, onlyC + ac + bc + abc],
      gesamt,
      keine,
    };
  }, [records, source, values]);

  // Die Suche läuft nur, wenn sich die Zahlen ändern — also beim Filtern.
  const loesung = useMemo(() => (zahlen.gesamt > 0 ? loeseEllipsen(zahlen.gebiete) : null), [zahlen]);

  const tabelle = (
    <ChartTable
      headers={["Gebiet", "Antworten", "Anteil"]}
      rows={[
        ...SCHLUESSEL.map((s) => [
          gebietName(s, labels),
          fmtInt(zahlen.gebiete[s]),
          fmtPct(zahlen.gesamt > 0 ? zahlen.gebiete[s] / zahlen.gesamt : 0),
        ]),
        ...labels.map((l, i) => [`${l} insgesamt`, fmtInt(zahlen.summen[i]), fmtPct(zahlen.gesamt > 0 ? zahlen.summen[i] / zahlen.gesamt : 0)]),
      ]}
    />
  );

  if (zahlen.gesamt === 0) {
    return <p className="py-8 text-center text-sm text-ink-muted">Keine Antworten mit Angabe.</p>;
  }

  if (!loesung) {
    // Rückfall: gleich große Kreise, die Zahl trägt die Aussage.
    return (
      <figure>
        <SchematischeKreise labels={labels} farben={farben} gebiete={zahlen.gebiete} summen={zahlen.summen} id={id} />
        <p className="mt-2 text-xs text-ink-muted">Größen nicht maßstäblich</p>
        {tabelle}
      </figure>
    );
  }

  const { box, ellipsen, zentren } = loesung;
  const bw = box.x1 - box.x0;
  const bh = box.y1 - box.y0;
  const k = Math.min((BREITE - 2 * RAND) / bw, (HOEHE - 2 * RAND) / bh);
  const ox = (BREITE - bw * k) / 2 - box.x0 * k;
  const oy = (HOEHE - bh * k) / 2 - box.y0 * k;
  const X = (x: number) => ox + x * k;
  const Y = (y: number) => oy + y * k;

  const ellipseAttr = (e: Ellipse) => ({
    cx: X(e.cx),
    cy: Y(e.cy),
    rx: e.a * k,
    ry: e.b * k,
    transform: `rotate(${(e.winkel * 180) / Math.PI} ${X(e.cx)} ${Y(e.cy)})`,
  });

  const paare: [number, number][] = [[0, 1], [0, 2], [1, 2]];
  const zahlPx = (s: string) => (zahlen.gebiete[s] / zahlen.gesamt > 0.2 ? 18 : 14);
  const orte = platziere({
    ellipsen,
    zentren,
    abbildung: { X, Y, k },
    breite: BREITE,
    hoehe: HOEHE,
    // Gebiete ohne Antworten gibt es in der Zeichnung nicht, also auch keine Zahl.
    zahlen: SCHLUESSEL.filter((s) => zahlen.gebiete[s] > 0).map((s) => ({ s, text: fmtInt(zahlen.gebiete[s]), px: zahlPx(s) })),
    namen: labels.map((l, i) => ({ zeile1: l, zeile2: `${fmtInt(zahlen.summen[i])} Antworten` })),
  });

  return (
    <figure>
      <svg
        viewBox={`0 0 ${BREITE} ${HOEHE}`}
        width="100%"
        className="max-w-[520px]"
        role="img"
        aria-label={`${labels.join(", ")}: die Zahlen stehen in der Tabelle darunter`}
      >
        <defs>
          {paare.map(([i, j]) => (
            <Schraffur key={`${i}${j}`} id={`${id}-m${i}${j}`} farben={[farben[i], farben[j]]} />
          ))}
          <Schraffur id={`${id}-m012`} farben={farben} />
          {ellipsen.map((e, i) => (
            <clipPath key={i} id={`${id}-e${i}`}>
              <ellipse {...ellipseAttr(e)} />
            </clipPath>
          ))}
        </defs>

        {ellipsen.map((e, i) => (
          <ellipse key={`f${i}`} {...ellipseAttr(e)} fill={farben[i]} fillOpacity={0.07} />
        ))}

        {/* Schnittmengen: geschachtelte Clip-Gruppen schneiden die Flächen. */}
        {paare.map(([i, j]) => (
          <g key={`s${i}${j}`} clipPath={`url(#${id}-e${i})`}>
            <g clipPath={`url(#${id}-e${j})`}>
              <rect x={0} y={0} width={BREITE} height={HOEHE} fill={`url(#${id}-m${i}${j})`} />
            </g>
          </g>
        ))}
        <g clipPath={`url(#${id}-e0)`}>
          <g clipPath={`url(#${id}-e1)`}>
            <g clipPath={`url(#${id}-e2)`}>
              <rect x={0} y={0} width={BREITE} height={HOEHE} fill={`url(#${id}-m012)`} />
            </g>
          </g>
        </g>

        {ellipsen.map((e, i) => (
          <ellipse key={`r${i}`} {...ellipseAttr(e)} fill="none" stroke={farben[i]} strokeWidth={STROKE.outline} />
        ))}

        {orte.zahlen.map(({ s, x, y, linie }) => (
          <g key={s}>
            {/* Zu schmales Gebiet: die Zahl steht daneben und zeigt hinein. */}
            {linie && (
              <>
                <line x1={linie.x} y1={linie.y} x2={x} y2={y} stroke={INK_MUTED} strokeWidth={0.75} />
                <circle cx={linie.x} cy={linie.y} r={1.75} fill={INK} />
                <rect x={x - 12} y={y - 9} width={24} height={18} fill="white" opacity={0.85} rx={3} />
              </>
            )}
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={INK}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: zahlPx(s),
                fontVariantNumeric: "lining-nums tabular-nums",
              }}
            >
              {fmtInt(zahlen.gebiete[s])}
            </text>
          </g>
        ))}

        {/* Name in der Mengenfarbe, darunter die Summe — außen an der eigenen
            Form, wo am wenigsten anderes im Weg ist. */}
        {labels.map((l, i) => {
          const kasten = orte.namen[i];
          const x = kasten.x + kasten.w / 2;
          return (
            <g key={l}>
              <text x={x} y={kasten.y + 12} textAnchor="middle" fill={farben[i]} style={{ fontSize: 13, fontWeight: 700 }}>
                {l}
              </text>
              <text x={x} y={kasten.y + 27} textAnchor="middle" fill={INK_MUTED} style={{ fontSize: 11 }}>
                {fmtInt(zahlen.summen[i])} Antworten
              </text>
            </g>
          );
        })}
      </svg>
      {zahlen.keine > 0 && (
        <p className="mt-1 text-xs text-ink-muted">
          {fmtInt(zahlen.keine)} ohne Angabe, nicht abgebildet
        </p>
      )}
      {tabelle}
    </figure>
  );
}

function gebietName(s: string, labels: string[]): string {
  const dabei = labels.filter((_, i) => s[i] === "1");
  if (dabei.length === 1) return `nur ${dabei[0]}`;
  if (dabei.length === labels.length) return "alle drei";
  return dabei.join(" und ");
}

function Schraffur({ id, farben }: { id: string; farben: string[] }) {
  const breite = farben.length * 4;
  return (
    <pattern id={id} width={breite} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width={breite} height={8} fill="#fbf9f6" />
      {farben.map((f, i) => (
        <rect key={i} x={i * 4} width={1.7} height={8} fill={f} opacity={0.55} />
      ))}
    </pattern>
  );
}

/** Rückfall, wenn keine flächentreue Lage gefunden wurde. */
function SchematischeKreise({
  labels, farben, gebiete, summen, id,
}: {
  labels: string[];
  farben: string[];
  gebiete: Record<string, number>;
  summen: number[];
  id: string;
}) {
  const r = 96;
  const cx = BREITE / 2;
  const cy = HOEHE / 2 + 6;
  const versatz = 56;
  const mitten = [
    [cx, cy - versatz],
    [cx - versatz * 0.95, cy + versatz * 0.6],
    [cx + versatz * 0.95, cy + versatz * 0.6],
  ];
  const orte: Record<string, [number, number]> = {
    "100": [cx, cy - versatz - 46],
    "010": [cx - versatz - 40, cy + versatz + 26],
    "001": [cx + versatz + 40, cy + versatz + 26],
    "110": [cx - 46, cy - 16],
    "101": [cx + 46, cy - 16],
    "011": [cx, cy + versatz + 12],
    "111": [cx, cy + 6],
  };
  return (
    <svg viewBox={`0 0 ${BREITE} ${HOEHE}`} width="100%" className="max-w-[520px]" role="img" aria-label={labels.join(", ")}>
      {mitten.map(([x, y], i) => (
        <circle key={`k${id}${i}`} cx={x} cy={y} r={r} fill={farben[i]} fillOpacity={0.06} stroke={farben[i]} strokeWidth={STROKE.outline} />
      ))}
      {SCHLUESSEL.map((s) => (
        <text
          key={s}
          x={orte[s][0]}
          y={orte[s][1]}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={INK}
          style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16 }}
        >
          {fmtInt(gebiete[s])}
        </text>
      ))}
      {labels.map((l, i) => (
        <text
          key={l}
          x={mitten[i][0]}
          y={i === 0 ? mitten[i][1] - r - 10 : mitten[i][1] + r + 16}
          textAnchor="middle"
          fill={farben[i]}
          style={{ fontSize: 13, fontWeight: 700 }}
        >
          {`${l} · ${fmtInt(summen[i])}`}
        </text>
      ))}
    </svg>
  );
}
