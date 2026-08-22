// Was von der Skalenrechnung zur Laufzeit übrig bleibt.
//
// Die Skalen selbst stehen im Datensatz: das Schwesterprojekt bagruber/elections
// rechnet sie beim Bauen aus und schreibt sie zu jeder Legendenzeile. Vorher
// stand die Formel zweimal da, einmal dort in JavaScript und einmal hier in
// TypeScript, und zwei Fassungen einer Formel laufen irgendwann auseinander.
// Hier bleibt der Nachschlag je Gemeinde und die Farbwahl.

import type { WahlGebiet } from "@/lib/chartSpec";

/**
 * Der Wert einer Legendenzeile in einer Gemeinde. Ausgewählt wird immer eine
 * Gruppe; wo eine Gemeinde mehrere Listen derselben Gruppe hat, etwa FW und FWO
 * in Langenbach, werden sie addiert.
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
 * Die Pole für Gewinn und Verlust. Petrol gegen Braun statt der naheliegenden
 * Ampel: Rot und Grün liegen bei Rot-Grün-Blindheit übereinander, dieses Paar
 * hält ΔE 9,7 unter Protanopie und 17,0 bei normalem Sehen. Weil die Richtung
 * damit nicht mehr von selbst spricht, trägt die Legende Vorzeichen.
 */
export const GEWINN = "#01665e";
export const VERLUST = "#8c510a";
