import { useMemo, useState } from "react";
import type { WahlEbene, WahlGebiet, WahlGeometrie, WahlListe } from "@/lib/chartSpec";
import { CREAM, INK, INK_LINE } from "@/lib/palette";
import { isDark, mix } from "@/lib/oklab";
import { cn } from "@/lib/cn";
import { ChartFrame } from "./ChartFrame";
import { ChartTable } from "./ChartTable";

type Ansicht = "staerkste" | "sitze" | "liste";

type Props = {
  geometrie: WahlGeometrie;
  ebenen: WahlEbene[];
  hinweis?: string;
};

const ANSICHTEN: { id: Ansicht; label: string }[] = [
  { id: "staerkste", label: "Stärkste Liste" },
  { id: "sitze", label: "Sitzverteilung" },
  { id: "liste", label: "Eine Liste" },
];

/** Ohne Liste angetreten ist kein kleiner Wert, sondern gar keiner — deshalb
 *  eine Schraffur und nicht die unterste Stufe derselben Skala. */
const MUSTER = "wahlkarte-ohne";

/**
 * Hexagon-Kartogramm einer Wahl. Die Fläche einer Gemeinde ist die Größe ihres
 * Rats, ein Sechseck ein Sitz. Über dieselbe Geometrie laufen drei Ansichten —
 * das Layout bleibt stehen, nur die Färbung wechselt. Verschöbe sich die Karte
 * beim Umschalten, ließen sich zwei Ansichten nicht mehr vergleichen.
 */
export function Hexmap({ geometrie, ebenen, hinweis }: Props) {
  const [ansicht, setAnsicht] = useState<Ansicht>("staerkste");
  const [ebeneId, setEbeneId] = useState(ebenen[0].id);
  const [listeId, setListeId] = useState<string | null>(null);
  const [gezeigt, setGezeigt] = useState<string | null>(null);

  // Sitze fallen nur im Gemeinderat an; die anderen Ebenen färben zwar, tragen
  // aber keine Sitzverteilung je Gemeinde.
  const ebene = ansicht === "liste" ? (ebenen.find((e) => e.id === ebeneId) ?? ebenen[0]) : ebenen[0];
  const liste = ebene.listen.find((l) => l.id === listeId) ?? ebene.listen[0];

  const gebiete = useMemo(() => new Map(ebene.gebiete.map((g) => [g.ags, g])), [ebene]);
  const farben = useMemo(() => new Map(ebene.listen.map((l) => [l.id, l.farbe])), [ebene]);
  const namen = useMemo(() => new Map(ebene.listen.map((l) => [l.id, l.name])), [ebene]);

  const höchster = useMemo(
    () => Math.max(0, ...ebene.gebiete.map((g) => anteilVon(g, liste.id) ?? 0)),
    [ebene, liste.id],
  );

  const eckpunkte = hexPfad(geometrie.radius * 0.92);

  function füllung(gebiet: WahlGebiet | undefined): string {
    if (!gebiet) return `url(#${MUSTER})`;
    if (ansicht === "liste") {
      const anteil = anteilVon(gebiet, liste.id);
      if (anteil == null) return `url(#${MUSTER})`;
      return mix(CREAM, liste.farbe, höchster ? anteil / höchster : 0);
    }
    return stärkste(gebiet)?.farbe ?? INK_LINE;
  }

  function stärkste(gebiet: WahlGebiet) {
    const beste = gebiet.ergebnis.reduce(
      (a, b) =>
        (b.sitze ?? 0) > (a.sitze ?? 0) || ((b.sitze ?? 0) === (a.sitze ?? 0) && (b.anteil ?? 0) > (a.anteil ?? 0))
          ? b
          : a,
      gebiet.ergebnis[0],
    );
    return beste ? { id: beste.id, farbe: farben.get(beste.id) ?? INK_LINE } : null;
  }

  const aktiv = gezeigt ? gebiete.get(gezeigt) : null;

  return (
    <div className="space-y-4">
      <Steuerung
        ansicht={ansicht}
        setAnsicht={setAnsicht}
        ebenen={ebenen}
        ebeneId={ebene.id}
        setEbeneId={setEbeneId}
        listen={ebene.listen}
        listeId={liste.id}
        setListeId={setListeId}
        gebietsZahl={ebene.gebiete.length}
      />

      {hinweis && ansicht !== "liste" && (
        <p className="border-l-2 border-red-500 bg-gold-100 px-3 py-2 text-sm text-ink-soft">{hinweis}</p>
      )}

      <ChartFrame
        width="wide"
        table={<Tabelle ebene={ebene} />}
      >
        <svg
          viewBox={geometrie.viewBox.join(" ")}
          width="100%"
          role="img"
          aria-label={`Kartogramm des Gebiets, ${ebene.gebiete.length} Gemeinden`}
          style={{ display: "block", height: "auto", maxHeight: "78vh", margin: "0 auto" }}
          onPointerLeave={() => setGezeigt(null)}
        >
          <defs>
            <pattern id={MUSTER} width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <rect width="7" height="7" fill={CREAM} />
              <line x1="0" y1="0" x2="0" y2="7" stroke={INK_LINE} strokeWidth="2.5" />
            </pattern>
          </defs>

          {geometrie.gebiete.map((form) => {
            const gebiet = gebiete.get(form.ags);
            const flaeche = füllung(gebiet);
            const einzeln = ansicht === "sitze";
            // In der Sitzansicht liegt unter dem Namen jede Fraktionsfarbe
            // gleichzeitig — dort trägt dunkle Schrift auf hellem Rand, statt
            // sich auf eine Flächenhelligkeit zu verlassen, die es nicht gibt.
            const schrift = einzeln ? INK : isDark(flaeche.startsWith("#") ? flaeche : CREAM) ? CREAM : INK;

            return (
              <g
                key={form.ags}
                onPointerEnter={() => setGezeigt(form.ags)}
                onFocus={() => setGezeigt(form.ags)}
                tabIndex={0}
                style={{ outline: "none" }}
              >
                <title>{form.name}</title>
                {form.felder.map(([x, y, fraktion], i) => (
                  <path
                    key={i}
                    d={`M${x},${y}${eckpunkte}`}
                    fill={einzeln ? (farben.get(fraktion) ?? `url(#${MUSTER})`) : flaeche}
                  />
                ))}
                {/* Der Umriss trägt keine Füllung, fängt aber trotzdem den
                    Zeiger — sonst fiele die Ablesung in jeder Fuge aus. */}
                <path
                  d={form.umriss}
                  fill="none"
                  stroke={CREAM}
                  strokeWidth={einzeln ? 7 : 5}
                  strokeLinejoin="round"
                  pointerEvents="all"
                />
                <path
                  d={form.umriss}
                  fill="none"
                  stroke={gezeigt === form.ags ? "#c8102e" : INK}
                  strokeWidth={gezeigt === form.ags ? 4 : einzeln ? 2.6 : 1.8}
                  strokeLinejoin="round"
                  pointerEvents="none"
                />
                {form.beschriftung && form.name.length * geometrie.radius * 0.55 < form.beschriftung.platz && (
                  <text
                    x={form.beschriftung.x}
                    y={form.beschriftung.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={geometrie.radius * 0.66}
                    fill={schrift}
                    stroke={einzeln ? CREAM : "none"}
                    strokeWidth={einzeln ? geometrie.radius * 0.17 : 0}
                    pointerEvents="none"
                    style={{ fontFamily: "inherit", paintOrder: "stroke" }}
                  >
                    {form.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </ChartFrame>

      <figcaption className="text-sm text-ink-soft max-w-prose">
        {bildunterschrift(ansicht, ebene, liste, höchster)}
      </figcaption>

      <div className="grid gap-6 sm:grid-cols-2">
        <Legende
          ansicht={ansicht}
          ebene={ebene}
          liste={liste}
          höchster={höchster}
          stärkste={stärkste}
          namen={namen}
        />
        <Ablesung gebiet={aktiv} namen={namen} farben={farben} />
      </div>
    </div>
  );

  function bildunterschrift(a: Ansicht, e: WahlEbene, l: WahlListe, max: number) {
    const sitze = e.gebiete.reduce((s, g) => s + (g.sitze ?? 0), 0);
    if (a === "liste") {
      const dabei = e.gebiete.filter((g) => anteilVon(g, l.id) != null).length;
      return `${l.name}, ${e.label}. Sättigung von 0 bis ${prozent(max)} — angetreten in ${dabei} von ${
        e.gebiete.length
      } Gemeinden, schraffiert die übrigen. Die Fläche bleibt die Größe des Gemeinderats.`;
    }
    if (a === "sitze") return `Ein Sechseck ist ein Sitz — ${sitze} in ${e.gebiete.length} Gemeinderäten.`;
    return `Je Gemeinde die Liste mit den meisten Sitzen; bei Gleichstand entscheidet der Stimmenanteil. Die Fläche ist die Größe des Gemeinderats, zusammen ${sitze} Sitze.`;
  }
}

// ── Teile ──────────────────────────────────────────────────────────────

function Steuerung({
  ansicht,
  setAnsicht,
  ebenen,
  ebeneId,
  setEbeneId,
  listen,
  listeId,
  setListeId,
  gebietsZahl,
}: {
  ansicht: Ansicht;
  setAnsicht: (a: Ansicht) => void;
  ebenen: WahlEbene[];
  ebeneId: string;
  setEbeneId: (id: string) => void;
  listen: WahlListe[];
  listeId: string;
  setListeId: (id: string) => void;
  gebietsZahl: number;
}) {
  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
      <Segmente
        label="Ansicht"
        optionen={ANSICHTEN.map((a) => ({ id: a.id, label: a.label }))}
        wert={ansicht}
        setzen={(id) => setAnsicht(id as Ansicht)}
      />

      {ansicht === "liste" && (
        <>
          <label className="grid gap-1.5">
            <span className="eyebrow text-ink-muted">Liste</span>
            <select
              value={listeId}
              onChange={(e) => setListeId(e.target.value)}
              className="max-w-xs rounded-md border border-ink-line bg-white px-2 py-1.5 text-base"
            >
              {listen.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                  {l.gemeinden != null && l.gemeinden < gebietsZahl ? ` (${l.gemeinden} Gemeinden)` : ""}
                </option>
              ))}
            </select>
          </label>

          {ebenen.length > 1 && (
            <Segmente
              label="Gemessen an"
              optionen={ebenen.map((e) => ({ id: e.id, label: e.label }))}
              wert={ebeneId}
              setzen={setEbeneId}
            />
          )}
        </>
      )}
    </div>
  );
}

function Segmente({
  label,
  optionen,
  wert,
  setzen,
}: {
  label: string;
  optionen: { id: string; label: string }[];
  wert: string;
  setzen: (id: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <span className="eyebrow text-ink-muted">{label}</span>
      <div className="inline-flex overflow-hidden rounded-md border border-ink-line bg-white" role="radiogroup" aria-label={label}>
        {optionen.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={o.id === wert}
            onClick={() => setzen(o.id)}
            className={cn(
              "border-r border-ink-line px-3 py-1.5 text-sm last:border-r-0 transition-colors",
              o.id === wert ? "bg-ink text-cream" : "text-ink-soft hover:bg-cream-dark",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Legende({
  ansicht,
  ebene,
  liste,
  höchster,
  stärkste,
  namen,
}: {
  ansicht: Ansicht;
  ebene: WahlEbene;
  liste: WahlListe;
  höchster: number;
  stärkste: (g: WahlGebiet) => { id: string; farbe: string } | null;
  namen: Map<string, string>;
}) {
  const einträge = useMemo(() => {
    if (ansicht === "liste") {
      return [0, 0.25, 0.5, 0.75, 1]
        .map((t) => ({ farbe: mix(CREAM, liste.farbe, t), text: prozent(höchster * t), muster: false }))
        .concat([{ farbe: "", text: "nicht angetreten", muster: true }]);
    }
    if (ansicht === "sitze") {
      return [...ebene.listen]
        .sort((a, b) => b.sitze - a.sitze)
        .map((l) => ({ farbe: l.farbe, text: `${l.name} · ${l.sitze} ${l.sitze === 1 ? "Sitz" : "Sitze"}`, muster: false }));
    }

    // Örtliche Listen dürfen sich eine Farbe teilen, solange sie weit
    // auseinander liegen — in der Legende stünden sie dann aber untereinander
    // und sähen wie dieselbe Liste aus. Deshalb nennt sie die Gemeinden dazu.
    const gebündelt = new Map<string, { farbe: string; sitze: number; orte: string[] }>();
    for (const gebiet of ebene.gebiete) {
      const beste = stärkste(gebiet);
      if (!beste) continue;
      const eintrag = gebündelt.get(beste.id) ?? { farbe: beste.farbe, sitze: 0, orte: [] };
      eintrag.sitze += gebiet.ergebnis.find((e) => e.id === beste.id)?.sitze ?? 0;
      eintrag.orte.push(gebiet.name);
      gebündelt.set(beste.id, eintrag);
    }
    return [...gebündelt.entries()]
      .sort((a, b) => b[1].sitze - a[1].sitze)
      .map(([id, e]) => ({
        farbe: e.farbe,
        text: `${namen.get(id) ?? id} · ${e.orte.length > 3 ? `${e.orte.length} Gemeinden` : e.orte.join(", ")}`,
        muster: false,
      }));
  }, [ansicht, ebene, liste, höchster, stärkste, namen]);

  return (
    <div>
      <h4 className="eyebrow text-ink-muted">Legende</h4>
      <ul className="mt-2 grid gap-1 text-sm">
        {einträge.map((e, i) => (
          <li key={i} className="flex items-center gap-2">
            <Feldchen farbe={e.farbe} muster={e.muster} />
            <span>{e.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Ablesung({
  gebiet,
  namen,
  farben,
}: {
  gebiet: WahlGebiet | null | undefined;
  namen: Map<string, string>;
  farben: Map<string, string>;
}) {
  return (
    <div aria-live="polite">
      <h4 className="eyebrow text-ink-muted">Gemeinde</h4>
      {!gebiet ? (
        <p className="mt-2 text-sm text-ink-muted">Auf eine Fläche zeigen.</p>
      ) : (
        <>
          <p className="mt-2 font-semibold">
            {gebiet.name}
            {gebiet.sitze ? ` · ${gebiet.sitze} Sitze` : ""}
          </p>
          <ul className="mt-1 grid gap-1 text-sm">
            {gebiet.ergebnis.map((e) => (
              <li key={e.id} className="grid grid-cols-[auto_1fr_auto] items-baseline gap-2">
                <Feldchen farbe={farben.get(e.id) ?? INK_LINE} muster={false} />
                <span>{namen.get(e.id) ?? e.id}</span>
                <span className="whitespace-nowrap text-ink-soft">
                  {e.sitze != null ? `${e.sitze} · ` : ""}
                  {prozent(e.anteil)}
                </span>
              </li>
            ))}
          </ul>
          {gebiet.genauigkeit === "sammel" && (
            <p className="mt-2 text-sm text-ink-muted">
              Nur amtliche Sammelkategorien — örtliche Listen sind hier nicht einzeln ausgewiesen.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function Feldchen({ farbe, muster }: { farbe: string; muster: boolean }) {
  return (
    <span
      aria-hidden
      className="inline-block h-3.5 w-3.5 shrink-0 self-center rounded-sm border border-black/25"
      style={
        muster
          ? { background: `repeating-linear-gradient(45deg, ${CREAM} 0 2px, ${INK_LINE} 2px 4px)` }
          : { background: farbe }
      }
    />
  );
}

/** Die Zahlen im Klartext — der zweite Kanal neben der Farbe. */
function Tabelle({ ebene }: { ebene: WahlEbene }) {
  const listen = ebene.listen;
  const kopf = ["Gemeinde", ...(ebene.id === "gemeinderat" ? ["Sitze"] : []), ...listen.map((l) => l.name)];
  const zeilen = ebene.gebiete.map((g) => {
    const gefunden = new Map(g.ergebnis.map((e) => [e.id, e]));
    return [
      g.name,
      ...(ebene.id === "gemeinderat" ? [String(g.sitze ?? "")] : []),
      ...listen.map((l) => {
        const e = gefunden.get(l.id);
        if (!e) return "–";
        return e.sitze != null ? `${e.sitze} (${prozent(e.anteil)})` : prozent(e.anteil);
      }),
    ];
  });
  return <ChartTable caption={`Ergebnis je Gemeinde, ${ebene.label}`} headers={kopf} rows={zeilen} />;
}

// ── Kleinkram ──────────────────────────────────────────────────────────

function anteilVon(gebiet: WahlGebiet, listeId: string): number | null {
  return gebiet.ergebnis.find((e) => e.id === listeId)?.anteil ?? null;
}

function prozent(v: number | null | undefined): string {
  return v == null ? "–" : `${v.toLocaleString("de-DE", { maximumFractionDigits: 1 })} %`;
}

/** Sechseck mit Ecke oben, als relativer Pfad ab dem Mittelpunkt. */
function hexPfad(radius: number): string {
  const punkte = Array.from({ length: 6 }, (_, i) => {
    const winkel = (Math.PI / 180) * (60 * i - 90);
    return [radius * Math.cos(winkel), radius * Math.sin(winkel)] as const;
  });
  let pfad = `m${runde(punkte[0][0])},${runde(punkte[0][1])}`;
  for (let i = 1; i < 6; i++) {
    pfad += `l${runde(punkte[i][0] - punkte[i - 1][0])},${runde(punkte[i][1] - punkte[i - 1][1])}`;
  }
  return pfad + "z";
}

const runde = (v: number) => Math.round(v * 100) / 100;
