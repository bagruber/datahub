import { useState } from "react";
import type { WahlListe } from "@/lib/chartSpec";
import { CREAM, INK, INK_LINE } from "@/lib/palette";
import { ChartFrame } from "./ChartFrame";
import { ChartTable } from "./ChartTable";

type Sitz = [number, number, string, string | null];

type Props = {
  geometrie: { viewBox: number[]; radius: number };
  sitze: Sitz[];
  listen: WahlListe[];
  title?: string;
};

/**
 * Ein Rat als Wabe: ein Sechseck je Sitz, gefärbt nach Fraktion. Anders als auf
 * der Landkreiskarte steht ein Feld hier nicht für einen Sitz, sondern für einen
 * Menschen, jedes trägt den Namen der oder des Gewählten. Die Fraktionen
 * liegen als zusammenhängende Klumpen, damit sich ihre Größe abzählen lässt.
 */
export function Gremium({ geometrie, sitze, listen, title }: Props) {
  const [gezeigt, setGezeigt] = useState<number | null>(null);

  const farben = new Map(listen.map((l) => [l.id, l.farbe]));
  const namen = new Map(listen.map((l) => [l.id, l.name]));
  const grösster = Math.max(...listen.map((l) => l.anteil ?? 0), 1);
  const eckpunkte = hexPfad(geometrie.radius * 0.86);
  const aktiv = gezeigt == null ? null : sitze[gezeigt];

  return (
    <div className="space-y-3">
      <ChartFrame
        width="normal"
        table={
          <ChartTable
            caption={`Sitzverteilung ${title ?? ""}`}
            headers={["Liste", "Sitze", "Anteil", "Veränderung", "Gewählte"]}
            rows={listen.map((l) => [
              l.name,
              l.sitze,
              prozent(l.anteil),
              punkte(l.veraenderung),
              sitze
                .filter((s) => s[2] === l.id && s[3])
                .map((s) => s[3])
                .join(", "),
            ])}
          />
        }
      >
        <svg
          viewBox={geometrie.viewBox.join(" ")}
          width="100%"
          role="img"
          aria-label={`${sitze.length} Sitze, verteilt auf ${listen.length} Listen`}
          style={{ display: "block", height: "auto", maxHeight: "22rem", margin: "0 auto" }}
          onPointerLeave={() => setGezeigt(null)}
          // Ein Zuhörer für die ganze Wabe statt vierzig einzelne. Das ist nicht
          // nur sparsamer, es ist auch das, was zuverlässig auslöst: pointerenter
          // steigt nicht auf, und bei Feldern von dreißig Pixeln rutscht der
          // Zeiger schneller weiter, als React die Paare zusammenbringt.
          onPointerMove={(e) => {
            const ziel = (e.target as SVGElement).getAttribute?.("data-sitz");
            if (ziel != null) setGezeigt(Number(ziel));
          }}
          onFocusCapture={(e) => {
            const ziel = (e.target as SVGElement).getAttribute?.("data-sitz");
            if (ziel != null) setGezeigt(Number(ziel));
          }}
        >
          {sitze.map(([x, y, liste], i) => (
            <path
              key={i}
              data-sitz={i}
              d={`M${x},${y}${eckpunkte}`}
              fill={farben.get(liste) ?? INK_LINE}
              stroke={gezeigt === i ? INK : CREAM}
              strokeWidth={gezeigt === i ? 0.14 : 0.07}
              strokeLinejoin="round"
              tabIndex={0}
              style={{ cursor: "default" }}
            >
              <title>{beschreibung(sitze[i], namen)}</title>
            </path>
          ))}
        </svg>
      </ChartFrame>

      {/* Ein fester Platz für die Ablesung, damit die Karte beim Zeigen nicht
          springt, leer steht dort, worauf man zeigen kann. */}
      <p className="min-h-[1.5rem] text-center text-sm">
        {aktiv ? (
          <>
            <span className="font-semibold">{aktiv[3] ?? "Sitz"}</span>
            <span className="text-ink-soft"> · {namen.get(aktiv[2]) ?? aktiv[2]}</span>
          </>
        ) : (
          <span className="text-ink-muted">Auf ein Sechseck zeigen, jedes ist ein Ratsmitglied.</span>
        )}
      </p>

      <div>
        <p className="text-xs uppercase tracking-wide text-ink-muted">Sitze · Stimmenanteil, gezeigt als Balken</p>
        <ul className="mt-2 grid gap-1 text-sm">
          {listen.map((l) => (
            <li key={l.id} className="relative grid grid-cols-[auto_1fr_auto] items-baseline gap-2 pb-1.5">
              <span
                aria-hidden
                className="inline-block h-3.5 w-3.5 shrink-0 self-center rounded-sm border border-black/25"
                style={{ background: l.farbe }}
              />
              <span title={l.lang ?? undefined}>{l.name}</span>
              <span className="whitespace-nowrap text-ink-soft">
                {l.sitze} · {prozent(l.anteil)}
                {l.veraenderung != null && <span className="text-ink-muted"> ({punkte(l.veraenderung)})</span>}
              </span>
              {/* Die Wabe zählt Sitze, der Balken zeigt Stimmen. Zusammen wird
                  sichtbar, wo eine Liste mehr Sitze holt, als ihr Stimmenanteil
                  vermuten ließe: das gibt eine reine Sitzlegende nicht her. */}
              {l.anteil != null && (
                <span
                  aria-hidden
                  className="absolute bottom-0 left-[1.4rem] right-0 h-0.5 rounded-full opacity-55"
                  style={{ background: balken(l.farbe, l.anteil, grösster) }}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Ein Balken, der bis `anteil` von `grösster` läuft und dann aufhört. */
function balken(farbe: string, anteil: number, grösster: number): string {
  const breite = `${((anteil / Math.max(grösster, 1)) * 100).toFixed(1)}%`;
  return `linear-gradient(to right, ${farbe} ${breite}, transparent ${breite})`;
}

function beschreibung(sitz: Sitz, namen: Map<string, string>): string {
  const liste = namen.get(sitz[2]) ?? sitz[2];
  return sitz[3] ? `${sitz[3]}, ${liste}` : liste;
}

function prozent(v: number | null | undefined): string {
  return v == null ? "–" : `${v.toLocaleString("de-DE", { maximumFractionDigits: 1 })} %`;
}

/** Gewinn und Verlust immer mit Vorzeichen, ohne wäre unklar, was gemeint ist. */
function punkte(v: number | null | undefined): string {
  if (v == null) return "–";
  const zahl = v.toLocaleString("de-DE", { maximumFractionDigits: 1 });
  return v > 0 ? `+${zahl}` : zahl;
}

/** Sechseck mit Ecke oben, als relativer Pfad ab dem Mittelpunkt. */
function hexPfad(radius: number): string {
  const punkteListe = Array.from({ length: 6 }, (_, i) => {
    const winkel = (Math.PI / 180) * (60 * i - 90);
    return [radius * Math.cos(winkel), radius * Math.sin(winkel)] as const;
  });
  let pfad = `m${runde(punkteListe[0][0])},${runde(punkteListe[0][1])}`;
  for (let i = 1; i < 6; i++) {
    pfad += `l${runde(punkteListe[i][0] - punkteListe[i - 1][0])},${runde(punkteListe[i][1] - punkteListe[i - 1][1])}`;
  }
  return pfad + "z";
}

const runde = (v: number) => Math.round(v * 1000) / 1000;
