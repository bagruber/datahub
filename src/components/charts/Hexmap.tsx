import { useMemo, useState } from "react";
import type { WahlEbene, WahlGebiet, WahlGeometrie, WahlListe } from "@/lib/chartSpec";
import { CREAM, INK, INK_LINE } from "@/lib/palette";
import { isDark, mix } from "@/lib/oklab";
import { GEWINN, VERLUST, schwankung, spanne, wert } from "@/lib/wahlskala";
import { cn } from "@/lib/cn";
import { ChartFrame } from "./ChartFrame";
import { ChartTable } from "./ChartTable";

type Ansicht = "staerkste" | "sitze" | "liste" | "veraenderung";

type Hinweis = { text: string; ebene?: string; liste?: string };

type Props = {
  geometrie: WahlGeometrie;
  ebenen: WahlEbene[];
  hinweise?: Hinweis[];
};

const ANSICHTEN: { id: Ansicht; label: string }[] = [
  { id: "staerkste", label: "Stärkste Liste" },
  { id: "sitze", label: "Sitzverteilung" },
  { id: "liste", label: "Eine Liste" },
  { id: "veraenderung", label: "Gewinn und Verlust" },
];

/** Ohne Liste angetreten ist kein kleiner Wert, sondern gar keiner — deshalb
 *  eine Schraffur und nicht die unterste Stufe derselben Skala. */
const MUSTER = "wahlkarte-ohne";

/**
 * Hexagon-Kartogramm einer Wahl. Die Fläche einer Gemeinde ist die Größe ihres
 * Rats, ein Sechseck ein Sitz. Über dieselbe Geometrie laufen vier Ansichten —
 * das Layout bleibt stehen, nur die Färbung wechselt. Verschöbe sich die Karte
 * beim Umschalten, ließen sich zwei Ansichten nicht mehr vergleichen.
 */
export function Hexmap({ geometrie, ebenen, hinweise = [] }: Props) {
  const [ansicht, setAnsicht] = useState<Ansicht>("staerkste");
  const [ebeneId, setEbeneId] = useState(ebenen[0].id);
  const [listeId, setListeId] = useState<string | null>(null);
  const [gezeigt, setGezeigt] = useState<string | null>(null);

  // Wo es einen prüfbaren Vorwahlvergleich gibt. Ein Knopf, der auf eine leere
  // Karte führt, ist ein Versprechen, das die Daten nicht halten.
  const mitVergleich = useMemo(
    () => ebenen.filter((e) => e.gebiete.some((g) => g.ergebnis.some((r) => r.veraenderung != null))),
    [ebenen],
  );

  const proListe = ansicht === "liste" || ansicht === "veraenderung";
  const erlaubte = ansicht === "veraenderung" ? mitVergleich : ebenen;
  // Sitze fallen nur im Gemeinderat an; die anderen Ebenen färben zwar, tragen
  // aber keine Sitzverteilung je Gemeinde.
  const ebene = proListe ? (erlaubte.find((e) => e.id === ebeneId) ?? erlaubte[0] ?? ebenen[0]) : ebenen[0];
  const liste = ebene.listen.find((l) => l.id === listeId) ?? ebene.listen[0];

  const gebiete = useMemo(() => new Map(ebene.gebiete.map((g) => [g.ags, g])), [ebene]);
  const gruppen = useMemo(() => new Map(ebene.listen.map((l) => [l.id, l])), [ebene]);
  // Die Sitzansicht färbt Feld für Feld nach Einzellisten, nicht nach Gruppen —
  // die Aufteilung im Schwesterprojekt geht nach den Wahlvorschlägen.
  const einzelfarben = useMemo(
    () => new Map(ebene.gebiete.flatMap((g) => g.ergebnis.map((e) => [e.id, e.farbe ?? INK_LINE]))),
    [ebene],
  );

  const skala = useMemo(() => spanne(ebene, liste.id), [ebene, liste.id]);
  const wandel = useMemo(() => schwankung(ebene, liste.id), [ebene, liste.id]);

  const eckpunkte = hexPfad(geometrie.radius * 0.92);

  function füllung(gebiet: WahlGebiet | undefined): string {
    if (!gebiet) return `url(#${MUSTER})`;
    if (ansicht === "liste") {
      const anteil = wert(gebiet, liste.id, "anteil");
      if (anteil == null) return `url(#${MUSTER})`;
      return mix(CREAM, liste.farbe, skala.decke ? anteil / skala.decke : 0);
    }
    if (ansicht === "veraenderung") {
      const punkte = wert(gebiet, liste.id, "veraenderung");
      if (punkte == null) return `url(#${MUSTER})`;
      // Die Mitte ist der Grundton: keine Veränderung heißt keine Farbe. Nach
      // oben und unten läuft je ein eigener Ton, damit sich Vorzeichen und
      // Betrag getrennt ablesen lassen.
      return mix(CREAM, punkte >= 0 ? GEWINN : VERLUST, wandel.ausschlag ? Math.abs(punkte) / wandel.ausschlag : 0);
    }
    return stärkste(gebiet)?.farbe ?? INK_LINE;
  }

  /**
   * Die Liste mit den meisten Sitzen — ein einzelner Wahlvorschlag, nicht eine
   * Gruppe. In Wang halten die beiden Listen der Freien Wähler zusammen mehr
   * Sitze als die stärkste Einzelliste; sie sind aber getrennt angetreten, und
   * die Ansicht heißt nicht ohne Grund „Stärkste Liste“.
   */
  function stärkste(gebiet: WahlGebiet) {
    const beste = gebiet.ergebnis.reduce(
      (a, b) =>
        (b.sitze ?? 0) > (a.sitze ?? 0) || ((b.sitze ?? 0) === (a.sitze ?? 0) && (b.anteil ?? 0) > (a.anteil ?? 0))
          ? b
          : a,
      gebiet.ergebnis[0],
    );
    if (!beste) return null;
    const gruppe = beste.gruppe ?? beste.id;
    return {
      id: gruppe,
      name: gruppen.get(gruppe)?.name ?? beste.id,
      farbe: gruppen.get(gruppe)?.farbe ?? beste.farbe ?? INK_LINE,
    };
  }

  const aktiv = gezeigt ? gebiete.get(gezeigt) : null;
  const sichtbareHinweise = hinweise.filter(
    (h) => (!h.ebene || h.ebene === ebene.id) && (!h.liste || !proListe || h.liste === liste.id),
  );

  return (
    <div className="space-y-4">
      <Steuerung
        ansicht={ansicht}
        setAnsicht={setAnsicht}
        ebenen={ebenen}
        erlaubte={erlaubte}
        ebeneId={ebene.id}
        setEbeneId={setEbeneId}
        listen={ebene.listen}
        listeId={liste.id}
        setListeId={setListeId}
        gebietsZahl={ebene.gebiete.length}
        proListe={proListe}
        mitVergleich={mitVergleich.length > 0}
      />

      {sichtbareHinweise.length > 0 && (
        <div className="space-y-2 border-l-2 border-red-500 bg-gold-100 px-3 py-2 text-sm text-ink-soft">
          {sichtbareHinweise.map((h, i) => (
            <p key={i}>{h.text}</p>
          ))}
        </div>
      )}

      <ChartFrame width="wide" table={<Tabelle ebene={ebene} />}>
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
                    fill={einzeln ? (einzelfarben.get(fraktion) ?? `url(#${MUSTER})`) : flaeche}
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

      <figcaption className="max-w-prose text-sm text-ink-soft">{bildunterschrift()}</figcaption>

      <div className="grid gap-6 sm:grid-cols-2">
        <Legende ansicht={ansicht} ebene={ebene} liste={liste} skala={skala} wandel={wandel} stärkste={stärkste} />
        <Ablesung gebiet={aktiv} ansicht={ansicht} />
      </div>

      <Herkunft ebene={ebene} />
    </div>
  );

  function bildunterschrift() {
    const sitze = ebene.gebiete.reduce((s, g) => s + (g.sitze ?? 0), 0);
    if (ansicht === "liste") {
      return (
        `${liste.name}, ${ebene.label}. Die Skala endet bei ${prozent(skala.decke)} — dem geometrischen Mittel aus ` +
        `dem Spitzenwert dieser Liste (${prozent(skala.höchster)}) und einem starken Ergebnis auf dieser Karte ` +
        `(${prozent(skala.stark)}). Damit bleiben schwache Listen untereinander vergleichbar und trotzdem als ` +
        `schwach erkennbar. Angetreten in ${skala.gemeinden} von ${ebene.gebiete.length} Gemeinden, ` +
        `schraffiert die übrigen.`
      );
    }
    if (ansicht === "veraenderung") {
      return (
        `${liste.name}: Gewinn und Verlust in Prozentpunkten gegenüber der ` +
        `${ebene.vergleichswahl ?? "Wahl davor"}, von ${vorzeichen(wandel.tief)} bis ${vorzeichen(wandel.hoch)} ` +
        `Punkten in ${wandel.gemeinden} Gemeinden. Die Fläche bleibt die Größe des Gemeinderats.`
      );
    }
    if (ansicht === "sitze") return `Ein Sechseck ist ein Sitz — ${sitze} in ${ebene.gebiete.length} Gemeinderäten.`;
    return (
      `Je Gemeinde die Liste mit den meisten Sitzen; bei Gleichstand entscheidet der Stimmenanteil. ` +
      `Die Fläche ist die Größe des Gemeinderats, zusammen ${sitze} Sitze.`
    );
  }
}

// ── Teile ──────────────────────────────────────────────────────────────

function Steuerung({
  ansicht,
  setAnsicht,
  ebenen,
  erlaubte,
  ebeneId,
  setEbeneId,
  listen,
  listeId,
  setListeId,
  gebietsZahl,
  proListe,
  mitVergleich,
}: {
  ansicht: Ansicht;
  setAnsicht: (a: Ansicht) => void;
  ebenen: WahlEbene[];
  erlaubte: WahlEbene[];
  ebeneId: string;
  setEbeneId: (id: string) => void;
  listen: WahlListe[];
  listeId: string;
  setListeId: (id: string) => void;
  gebietsZahl: number;
  proListe: boolean;
  mitVergleich: boolean;
}) {
  const sichtbar = ANSICHTEN.filter((a) => a.id !== "veraenderung" || mitVergleich);

  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
      <Segmente
        label="Ansicht"
        optionen={sichtbar.map((a) => ({ id: a.id, label: a.label }))}
        wert={ansicht}
        setzen={(id) => setAnsicht(id as Ansicht)}
      />

      {proListe && (
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
              optionen={ebenen.map((e) => ({
                id: e.id,
                label: e.label,
                // Der Knopf bleibt stehen, ist aber erkennbar außer Betrieb —
                // verschwände er, sprünge die Leiste beim Umschalten.
                aus: !erlaubte.some((x) => x.id === e.id),
              }))}
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
  wert: gewählt,
  setzen,
}: {
  label: string;
  optionen: { id: string; label: string; aus?: boolean }[];
  wert: string;
  setzen: (id: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <span className="eyebrow text-ink-muted">{label}</span>
      <div
        className="inline-flex overflow-hidden rounded-md border border-ink-line bg-white"
        role="radiogroup"
        aria-label={label}
      >
        {optionen.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={o.id === gewählt}
            disabled={o.aus}
            title={o.aus ? "Für diese Wahl liegt kein prüfbarer Vorwahlvergleich vor." : undefined}
            onClick={() => setzen(o.id)}
            className={cn(
              "border-r border-ink-line px-3 py-1.5 text-sm transition-colors last:border-r-0",
              o.id === gewählt ? "bg-ink text-cream" : "text-ink-soft hover:bg-cream-dark",
              o.aus && "cursor-not-allowed text-ink-line hover:bg-white",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

type Zeile = { farbe: string; text: string; wert?: string; anteil?: number; titel?: string; muster?: boolean };

function Legende({
  ansicht,
  ebene,
  liste,
  skala,
  wandel,
  stärkste,
}: {
  ansicht: Ansicht;
  ebene: WahlEbene;
  liste: WahlListe;
  skala: ReturnType<typeof spanne>;
  wandel: ReturnType<typeof schwankung>;
  stärkste: (g: WahlGebiet) => { id: string; name: string; farbe: string } | null;
}) {
  const { mass, zeilen } = useMemo<{ mass: string; zeilen: Zeile[] }>(() => {
    if (ansicht === "liste") {
      return {
        mass: "Stimmenanteil in der Gemeinde",
        zeilen: [
          ...[0, 0.25, 0.5, 0.75, 1].map((t) => ({
            farbe: mix(CREAM, liste.farbe, t),
            text: prozent(skala.decke * t),
          })),
          { farbe: "", text: "nicht angetreten", muster: true },
        ],
      };
    }

    if (ansicht === "veraenderung") {
      return {
        mass: `Prozentpunkte gegenüber der ${ebene.vergleichswahl ?? "Wahl davor"}`,
        zeilen: [-1, -0.5, 0, 0.5, 1].map((t) => ({
          farbe: mix(CREAM, t >= 0 ? GEWINN : VERLUST, Math.abs(t)),
          text: `${vorzeichen(wandel.ausschlag * t)} Punkte`,
        })),
      };
    }

    const nachGewicht = (l: WahlListe) => (ebene.id === "gemeinderat" ? l.sitze : (l.anteil ?? 0));
    const beschriftung = (l: WahlListe) => (ebene.id === "gemeinderat" ? String(l.sitze) : prozent(l.anteil));
    const mass = ebene.id === "gemeinderat" ? "Sitze im Landkreis" : "Stimmenanteil im Landkreis";
    const grösste = Math.max(1, ...ebene.listen.map(nachGewicht));

    // In der Sitzansicht steht jede Zeile der Kreislegende für sich; die
    // Übersicht zeigt dagegen nur, was irgendwo stärkste Liste ist.
    if (ansicht === "sitze") {
      return {
        mass,
        zeilen: [...ebene.listen]
          .sort((a, b) => nachGewicht(b) - nachGewicht(a))
          .map((l) => ({
            farbe: l.farbe,
            text: l.name,
            wert: beschriftung(l),
            anteil: nachGewicht(l) / grösste,
            titel: bestandteile(l),
          })),
      };
    }

    const gebündelt = new Map<string, { farbe: string; name: string; orte: string[] }>();
    for (const gebiet of ebene.gebiete) {
      const beste = stärkste(gebiet);
      if (!beste) continue;
      const eintrag = gebündelt.get(beste.id) ?? { farbe: beste.farbe, name: beste.name, orte: [] };
      eintrag.orte.push(gebiet.name);
      gebündelt.set(beste.id, eintrag);
    }

    return {
      mass,
      zeilen: [...gebündelt.entries()]
        .sort((a, b) => b[1].orte.length - a[1].orte.length)
        .map(([id, e]) => {
          const gruppe = ebene.listen.find((l) => l.id === id);
          return {
            farbe: e.farbe,
            text: e.name,
            anteil: gruppe ? nachGewicht(gruppe) / grösste : 0,
            // Bei vier verfügbaren Farben für einunddreißig örtliche Listen
            // stehen manche Zeilen im selben Ton. Auf der Karte stören sie sich
            // nicht — sie liegen nie nebeneinander —, in der Legende schon.
            // Deshalb steht dort die Gemeinde dabei, solange es eine oder zwei sind.
            wert: e.orte.length <= 2 ? e.orte.join(", ") : `vorn in ${e.orte.length} Gemeinden`,
            titel: `Vorn in: ${e.orte.join(", ")}`,
          };
        }),
    };
  }, [ansicht, ebene, liste, skala, wandel, stärkste]);

  return (
    <div>
      <h4 className="eyebrow text-ink-muted">Legende</h4>
      <p className="mt-1 text-xs uppercase tracking-wide text-ink-muted">{mass}</p>
      <ul className="mt-2 grid gap-1 text-sm">
        {zeilen.map((z, i) => (
          <li
            key={i}
            title={z.titel}
            className={cn("grid grid-cols-[auto_1fr_auto] items-center gap-2", z.anteil != null && "relative pb-1.5")}
          >
            <Feldchen farbe={z.farbe} muster={z.muster ?? false} />
            <span>{z.text}</span>
            {z.wert != null && <span className="whitespace-nowrap tabular-nums text-ink-soft">{z.wert}</span>}
            {/* Der Balken trägt die Größenverhältnisse nach, ohne eine Spalte zu
                belegen: eine dünne Linie unter der Zeile, in der Farbe der
                Liste. Der Name bleibt das, was zuerst gelesen wird. */}
            {z.anteil != null && (
              <span
                aria-hidden
                className="absolute bottom-0 left-[1.4rem] right-0 h-0.5 rounded-full opacity-55"
                style={{
                  background:
                    `linear-gradient(to right, ${z.farbe} ${(z.anteil * 100).toFixed(1)}%,` +
                    ` transparent ${(z.anteil * 100).toFixed(1)}%)`,
                }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Woraus eine zusammengefasste Zeile besteht — für den Titel, nicht die Zeile. */
function bestandteile(l: WahlListe): string | undefined {
  if (!l.teile?.length && !l.unbenannt) return undefined;
  const teile = (l.teile ?? []).map((t) => `${t.name} ${t.sitze}`);
  if (l.unbenannt) teile.push(`${l.unbenannt} ohne Listennamen`);
  return `${l.name}: ${teile.join(", ")}`;
}

function Ablesung({ gebiet, ansicht }: { gebiet: WahlGebiet | null | undefined; ansicht: Ansicht }) {
  const zusammengefasst = gebiet?.ergebnis.some((e) => (e.gruppe ?? e.id) !== e.id) ?? false;

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
                <Feldchen farbe={e.farbe ?? INK_LINE} muster={false} />
                {/* Hier steht der Name des Wahlvorschlags, nicht der seiner
                    Gruppe: die Zusammenfassung ist eine Sache der Legende, die
                    Gemeinde hat ihre eigenen Listen. */}
                <span>{e.id}</span>
                <span className="whitespace-nowrap text-ink-soft">
                  {e.sitze != null ? `${e.sitze} · ` : ""}
                  {prozent(e.anteil)}
                  {ansicht === "veraenderung" && e.veraenderung != null ? ` (${vorzeichen(e.veraenderung)})` : ""}
                </span>
              </li>
            ))}
          </ul>
          {gebiet.genauigkeit === "sammel" && (
            <p className="mt-2 text-sm text-ink-muted">
              Nur amtliche Sammelkategorien — örtliche Listen sind hier nicht einzeln ausgewiesen.
            </p>
          )}
          {zusammengefasst && (
            <p className="mt-2 text-sm text-ink-muted">Einzelne dieser Listen sind in der Legende zusammengefasst.</p>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Woher welche Angabe stammt. Bei zwei Quellen, die verschieden viel wissen,
 * gehört das auf die Seite — und nicht nur in ein README, das niemand aufmacht,
 * der auf die Karte zeigt.
 */
function Herkunft({ ebene }: { ebene: WahlEbene }) {
  const h = ebene.herkunft;
  if (!h) return null;

  const zeilen: [string, string, string][] = [
    [
      "Sitze und Stimmen",
      "Bayerisches Landesamt für Statistik (GENESIS-Online)",
      `alle ${h.gemeinden} Gemeinden. Jede Sitzsumme aus einer Gemeindequelle wird dagegen geprüft; weicht sie ab, ` +
        `wird der Datensatz nicht gebaut.`,
    ],
    [
      "Listennamen",
      "Wahlleitungen der Gemeinden",
      h.listen === h.gemeinden
        ? `alle ${h.gemeinden} Gemeinden.`
        : `${h.listen} von ${h.gemeinden} Gemeinden. Ohne eigene Quelle und daher nur mit amtlichen ` +
          `Sammelkategorien: ${h.ohneListen.join(", ")}.`,
    ],
    [
      "Gewinn und Verlust",
      h.veraenderung ? "Vergleichsgrafik der Wahlleitung" : "—",
      h.veraenderung
        ? `${h.veraenderung} von ${h.gemeinden} Gemeinden, gegenüber der ${h.vergleichswahl}. Gerechnet aus den ` +
          `beiden ausgewiesenen Ergebnissen, nicht aus der Spalte „Gewinn und Verlust“ der Übersichtstabelle: ` +
          `die weicht bei zwei Dritteln der Listen davon ab.`
        : `nicht ausgewiesen. Die Gemeindeseiten führen zwar eine Spalte dafür, aber keinen Vorwahlvergleich, an ` +
          `dem sie sich prüfen ließe — und dieselbe Spalte ist auf den Kreistagsseiten nachweislich falsch.`,
    ],
  ];

  return (
    <div className="border-t border-ink-line pt-4">
      <h4 className="eyebrow text-ink-muted">Woher die Zahlen kommen</h4>
      <dl className="mt-2 grid gap-x-5 gap-y-1.5 text-sm sm:grid-cols-[minmax(9rem,auto)_1fr]">
        {zeilen.map(([was, woher, wieviel]) => (
          <div key={was} className="contents">
            <dt className="font-semibold">{was}</dt>
            <dd className="mb-2 text-ink-soft sm:mb-0">
              <span className="text-ink">{woher}</span> — {wieviel}
            </dd>
          </div>
        ))}
      </dl>
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
    // Die Spalten sind Gruppen, die Zeilen einer Gemeinde sind Einzellisten —
    // „CSU/FW“ gehört in die Spalte „Gemeinsame Wahlvorschläge“. Was in einer
    // Gemeinde mehrere Listen einer Gruppe sind, wird zusammengezählt und benannt.
    const gebündelt = new Map<string, { sitze: number | null; anteil: number | null; namen: string[] }>();
    for (const e of g.ergebnis) {
      const schlüssel = e.gruppe ?? e.id;
      const bisher = gebündelt.get(schlüssel) ?? { sitze: null, anteil: null, namen: [] };
      if (e.sitze != null) bisher.sitze = (bisher.sitze ?? 0) + e.sitze;
      if (e.anteil != null) bisher.anteil = (bisher.anteil ?? 0) + e.anteil;
      if (schlüssel !== e.id) bisher.namen.push(e.id);
      gebündelt.set(schlüssel, bisher);
    }

    return [
      g.name,
      ...(ebene.id === "gemeinderat" ? [String(g.sitze ?? "")] : []),
      ...listen.map((l) => {
        const e = gebündelt.get(l.id);
        if (!e) return "–";
        const zahl = e.sitze != null ? `${e.sitze} (${prozent(e.anteil)})` : prozent(e.anteil);
        return e.namen.length ? `${zahl} · ${e.namen.join(", ")}` : zahl;
      }),
    ];
  });
  return <ChartTable caption={`Ergebnis je Gemeinde, ${ebene.label}`} headers={kopf} rows={zeilen} />;
}

// ── Kleinkram ──────────────────────────────────────────────────────────

function prozent(v: number | null | undefined): string {
  return v == null ? "–" : `${v.toLocaleString("de-DE", { maximumFractionDigits: 1 })} %`;
}

/** Gewinn und Verlust immer mit Vorzeichen — ohne wäre unklar, was gemeint ist. */
function vorzeichen(v: number | null | undefined): string {
  if (v == null) return "–";
  const zahl = v.toLocaleString("de-DE", { maximumFractionDigits: 1 });
  return v > 0 ? `+${zahl}` : zahl;
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
