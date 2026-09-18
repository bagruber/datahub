// Setzt die Form einzelner Diagramme in den handgepflegten Datensätzen.
//
// Probe Diagramme, 18.09.2026: Kreisdiagramme mit geordneten Antworten
// (Wartezeit, Häufigkeit) bekommen das Feld `ordnung: true` und werden von der
// App als Anteilsbalken gezeichnet; ungeordnete bleiben Ring. Fragen mit
// derselben Skala dürfen als `reihen` in einer Karte stehen.
//
// Wie apply-section-texts.mjs: idempotent, mehrfach ausführbar.
//
//   node scripts/apply-chart-shapes.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const datei = (name) => join(wurzel, "public", "data", name);

/** Kreisdiagramme, deren Antworten eine Reihenfolge haben. */
const GEORDNET = {
  "christkindlmarkt_2025.json": ["freq"],
};

/** Fragen mit derselben Skala, die in einer Karte untereinander stehen. */
const ZUSAMMEN = {
  "fahrgastumfrage_2023.json": [
    {
      ersetzt: ["wartezeit_hin", "wartezeit_rueck"],
      chart: {
        id: "wartezeit",
        type: "pie",
        ordnung: true,
        title: "Wartezeit am Bahnhof",
        source: "wait_out",
        labels: ["Unter 10 min", "10–30 min", "Über 30 min"],
        values: [1, 2, 3],
        reihen: [
          { source: "wait_out", label: "Hinfahrt" },
          { source: "wait_ret", label: "Rückfahrt" },
        ],
      },
    },
  ],
};

let geaendert = 0;

for (const [name, ids] of Object.entries(GEORDNET)) {
  const pfad = datei(name);
  const daten = JSON.parse(readFileSync(pfad, "utf8"));
  let treffer = 0;
  for (const abschnitt of daten.sections ?? []) {
    for (const chart of abschnitt.charts ?? []) {
      if (ids.includes(chart.id) && chart.ordnung !== true) {
        chart.ordnung = true;
        treffer++;
      }
    }
  }
  if (treffer > 0) {
    writeFileSync(pfad, JSON.stringify(daten));
    geaendert++;
    console.log(`${name}: ${treffer} Diagramm(e) als geordnet markiert`);
  } else {
    console.log(`${name}: schon aktuell`);
  }
}

for (const [name, regeln] of Object.entries(ZUSAMMEN)) {
  const pfad = datei(name);
  const daten = JSON.parse(readFileSync(pfad, "utf8"));
  let treffer = 0;
  for (const regel of regeln) {
    for (const abschnitt of daten.sections ?? []) {
      const charts = abschnitt.charts ?? [];
      const stellen = charts
        .map((c, i) => (regel.ersetzt.includes(c.id) ? i : -1))
        .filter((i) => i >= 0);
      if (stellen.length === 0) continue;
      // Das neue Diagramm steht an der Stelle des ersten ersetzten.
      charts.splice(stellen[0], 0, structuredClone(regel.chart));
      abschnitt.charts = charts.filter((c) => !regel.ersetzt.includes(c.id));
      treffer++;
    }
  }
  if (treffer > 0) {
    writeFileSync(pfad, JSON.stringify(daten));
    geaendert++;
    console.log(`${name}: ${treffer} Karte(n) zusammengelegt`);
  } else {
    console.log(`${name}: schon aktuell`);
  }
}

console.log(geaendert === 0 ? "Nichts zu tun." : `${geaendert} Datei(en) geschrieben.`);
