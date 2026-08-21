// Die Skalen der Wahlkarte. Sie stecken hier und nicht in der Komponente, weil
// zwei Ansichten und drei Legenden dieselbe Rechnung brauchen — und weil eine
// Skala, die an zwei Stellen verschieden gerechnet wird, irgendwann auseinander
// läuft, ohne dass es jemand merkt.

import type { WahlEbene, WahlGebiet } from "@/lib/chartSpec";

/**
 * Wie stark die Skala einer einzelnen Liste an die Karte gekoppelt wird.
 *
 * 0 hieße: jede Liste bekommt ihre eigene Skala, die bei ihrem eigenen
 * Spitzenwert endet. Dann sieht eine FDP mit sieben Prozent genauso satt aus wie
 * eine CSU mit zweiundvierzig, und der Vergleich zwischen Listen ist verloren.
 * 1 hieße: alle teilen sich eine Skala bis zum stärksten Wert der Karte. Dann
 * bleibt die FDP überall gleich blass, und der Vergleich zwischen Gemeinden ist
 * verloren.
 *
 * 0,5 legt die Obergrenze auf das geometrische Mittel aus beidem. Die FDP
 * erreicht damit an ihrer besten Stelle gut die Hälfte der Skala statt eines
 * Fünftels oder des Ganzen: als schwach erkennbar, aber innerlich abgestuft.
 */
export const KOPPLUNG = 0.5;

/**
 * Der Wert einer Legendenzeile in einer Gemeinde. Ausgewählt wird immer eine
 * Gruppe; wo eine Gemeinde mehrere Listen derselben Gruppe hat — Langenbach hat
 * FW und FWO —, werden sie addiert.
 */
export function wert(
  gebiet: WahlGebiet | undefined,
  listeId: string,
  feld: "anteil" | "veraenderung" | "sitze" = "anteil",
): number | null {
  const treffer = (gebiet?.ergebnis ?? []).filter((e) => (e.gruppe ?? e.id) === listeId);
  const werte = treffer.map((e) => e[feld]).filter((v): v is number => v != null);
  return werte.length ? werte.reduce((a, b) => a + b, 0) : null;
}

/**
 * Was auf dieser Karte als starkes Ergebnis gilt: der Wert, den nur jedes
 * zehnte Gemeindeergebnis übertrifft.
 *
 * Nicht das Maximum. In Hörgertshausen tritt eine einzige Liste an und holt
 * 99,8 Prozent; als Bezugsgröße zöge dieser eine Sonderfall jede Skala so weit
 * hoch, dass nirgends mehr etwas sättigt. Was darüber liegt, läuft ans obere
 * Ende — ganz oben ist ganz oben.
 */
function starkesErgebnis(werte: (number | null)[]): number {
  const sortiert = werte.filter((v): v is number => v != null).sort((a, b) => a - b);
  return sortiert.length ? sortiert[Math.floor((sortiert.length - 1) * 0.9)] : 0;
}

/** Alle Gemeindewerte, nach Gruppen zusammengefasst — der Maßstab der Karte. */
function alleGruppenwerte(ebene: WahlEbene, feld: "anteil" | "veraenderung"): (number | null)[] {
  return ebene.gebiete.flatMap((g) =>
    [...new Set(g.ergebnis.map((e) => e.gruppe ?? e.id))].map((id) => wert(g, id, feld)),
  );
}

export type Spanne = { höchster: number; stark: number; decke: number; gemeinden: number };

/** Die Skala der Ansicht „Eine Liste“. */
export function spanne(ebene: WahlEbene, listeId: string): Spanne {
  const werte = ebene.gebiete.map((g) => wert(g, listeId, "anteil")).filter((v): v is number => v != null);
  const höchster = Math.max(0, ...werte);
  const stark = starkesErgebnis(alleGruppenwerte(ebene, "anteil"));
  return {
    höchster,
    stark,
    decke: höchster > 0 ? höchster ** (1 - KOPPLUNG) * stark ** KOPPLUNG : 0,
    gemeinden: werte.length,
  };
}

export type Schwankung = { ausschlag: number; tief: number | null; hoch: number | null; gemeinden: number };

/**
 * Dasselbe für Gewinn und Verlust. Der Ausschlag ist symmetrisch: eine Skala,
 * die nach oben weiter reicht als nach unten, ließe drei Punkte Verlust
 * kräftiger aussehen als drei Punkte Gewinn.
 */
export function schwankung(ebene: WahlEbene, listeId: string): Schwankung {
  const werte = ebene.gebiete.map((g) => wert(g, listeId, "veraenderung")).filter((v): v is number => v != null);
  if (!werte.length) return { ausschlag: 0, tief: null, hoch: null, gemeinden: 0 };

  const eigener = Math.max(...werte.map(Math.abs));
  const stark = starkesErgebnis(alleGruppenwerte(ebene, "veraenderung").map((v) => (v == null ? null : Math.abs(v))));
  return {
    ausschlag: eigener ** (1 - KOPPLUNG) * stark ** KOPPLUNG,
    tief: Math.min(...werte),
    hoch: Math.max(...werte),
    gemeinden: werte.length,
  };
}

/**
 * Die Pole für Gewinn und Verlust. Petrol gegen Braun statt der naheliegenden
 * Ampel: Rot und Grün liegen bei Rot-Grün-Blindheit übereinander, dieses Paar
 * hält ΔE 9,7 unter Protanopie und 17,0 bei normalem Sehen. Weil die Richtung
 * damit nicht mehr von selbst spricht, trägt die Legende Vorzeichen.
 */
export const GEWINN = "#01665e";
export const VERLUST = "#8c510a";
