// Baut public/data/kommunalwahl_2026.json aus den Dateien in rawdata/wahlen/.
//
// Die Rohdaten kommen aus dem Schwesterprojekt bagruber/elections: dort werden
// die amtliche Statistik (GENESIS-Online) und die Veröffentlichungen der
// Wahlleitungen zusammengeführt und gegeneinander geprüft, dort wird auch die
// Hexagon-Aufteilung einmal vorgerechnet. Hier wird daraus nur noch ein
// Datensatz im Format des Data Hubs — gerechnet wird nichts mehr.
//
// Neu laufen lassen, wenn die Dateien in rawdata/wahlen/ erneuert wurden:
//   node scripts/build-wahlen.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAW = path.join(ROOT, "rawdata/wahlen");
const OUT = path.join(ROOT, "public/data/kommunalwahl_2026.json");
const MANIFEST = path.join(ROOT, "public/data/manifest.json");

const ID = "kommunalwahl_2026";
const WAHL = "kommunalwahl2026-freising";

const lies = (datei) => JSON.parse(fs.readFileSync(path.join(RAW, datei), "utf8"));
const gemeinderat = lies(`${WAHL}-gemeinderat.json`);
const kreistag = lies(`${WAHL}-kreistag.json`);
const kartogramm = lies(`${WAHL}-kartogramm.json`);

// Detailansichten. Nur Gemeinden, deren Wahlleitung die Gewählten ausweist —
// ohne Namen bliebe von einer Detailansicht nur eine zweite Sitzverteilung.
const DETAILS = ["09178143", "09178124", "09178144", "09178120"];

// ── Karte ──────────────────────────────────────────────────────────────

/** Ergebnis je Gebiet, auf das reduziert, was die Karte zeichnet. */
function gebiete(datensatz) {
  return datensatz.gemeinden.map((g) => ({
    ags: g.ags,
    name: g.name,
    sitze: g.sitze,
    genauigkeit: g.genauigkeit,
    ergebnis: g.ergebnis.map((e) => ({
      id: e.id,
      sitze: e.sitze,
      anteil: e.anteil,
      ...(e.veraenderung == null ? {} : { veraenderung: e.veraenderung }),
    })),
  }));
}

function listen(datensatz) {
  return datensatz.listen.map((l) => ({
    id: l.id,
    name: l.name ?? l.id,
    farbe: l.farbe,
    sitze: l.sitze,
    gemeinden: l.gemeinden,
  }));
}

const grob = gemeinderat.gemeinden.filter((g) => g.genauigkeit === "sammel");

const karte = {
  type: "hexmap",
  id: "landkreis",
  title: "Landkreis Freising",
  source: "Bayerisches Landesamt für Statistik und die Wahlleitungen",
  geometrie: {
    viewBox: kartogramm.viewBox,
    radius: kartogramm.hex.radius,
    gebiete: kartogramm.gemeinden.map((g) => ({
      ags: g.ags,
      name: g.name,
      felder: g.felder,
      umriss: g.umriss,
      beschriftung: g.beschriftung,
    })),
  },
  ebenen: [
    {
      id: "gemeinderat",
      label: "Gemeinderatswahl",
      gebiete: gebiete(gemeinderat),
      listen: listen(gemeinderat),
    },
    {
      id: "kreistag",
      label: "Kreistagswahl",
      gebiete: gebiete(kreistag),
      listen: listen(kreistag),
    },
  ],
  hinweis:
    grob.length > 0
      ? `In ${grob.length} von ${gemeinderat.gemeinden.length} Gemeinden liegen nur die amtlichen ` +
        `Sammelkategorien vor — örtliche Listen erscheinen dort als „Wählergruppen“ oder ` +
        `„Gemeinsame Wahlvorschläge“: ${grob.map((g) => g.name).join(", ")}.`
      : undefined,
};

// ── Einzelne Räte ──────────────────────────────────────────────────────

function rat(ags) {
  const gemeinde = gemeinderat.gemeinden.find((g) => g.ags === ags);
  const geometrie = kartogramm.gremien[ags];
  if (!gemeinde || !geometrie) throw new Error(`Kein Gremium für ${ags}`);

  const namen = new Map(gemeinderat.listen.map((l) => [l.id, l.name ?? l.id]));
  const farben = new Map(gemeinderat.listen.map((l) => [l.id, l.farbe]));

  return {
    type: "gremium",
    id: `rat-${ags}`,
    title: gemeinde.name,
    source: gemeinde.quelle,
    geometrie: { viewBox: geometrie.viewBox, radius: geometrie.hex.radius },
    sitze: geometrie.sitze,
    listen: gemeinde.ergebnis.map((e) => ({
      id: e.id,
      name: namen.get(e.id) ?? e.id,
      farbe: farben.get(e.id) ?? "#888",
      sitze: e.sitze,
      anteil: e.anteil,
      ...(e.veraenderung == null ? {} : { veraenderung: e.veraenderung }),
    })),
  };
}

// ── Datensatz ──────────────────────────────────────────────────────────

const sitzeGesamt = gemeinderat.gemeinden.reduce((a, g) => a + g.sitze, 0);

const datensatz = {
  meta: {
    id: ID,
    title: "Kommunalwahl",
    year: 2026,
    n: sitzeGesamt,
    description:
      "Die Gemeinde- und Stadtratswahlen vom 8. März 2026 im Landkreis Freising als " +
      "Hexagon-Kartogramm: jede Gemeinde bekommt so viele Sechsecke, wie ihr Rat Sitze hat. " +
      "Die Fläche zeigt damit das Gewicht des Gremiums statt der Quadratkilometer.",
    source: "Landesamt für Statistik und Wahlleitungen",
  },
  kind: "statistik",
  codebook: {},
  filters: [],
  sections: [
    {
      id: "landkreis",
      title: "Der ganze Landkreis",
      order: 1,
      text:
        `440 Sitze in 24 Gemeinderäten. Die Karte zeigt sie auf drei Arten: welche Liste in einer ` +
        `Gemeinde die meisten Sitze hat, wie sich alle 440 Sitze auf die Fraktionen verteilen, und ` +
        `wie stark eine einzelne Liste im Kreis abschneidet. Weil Gemeinderatslisten von Ort zu Ort ` +
        `andere sind, lässt sich die letzte Ansicht auch auf die Kreistagswahl umstellen — die ` +
        `einzige Wahl, bei der alle 24 Gemeinden über dieselben Listen abgestimmt haben.`,
      charts: [karte],
    },
    {
      id: "raete",
      title: "Vier Räte im Einzelnen",
      order: 2,
      text:
        `Ein Sechseck ist hier eine Person: die Räte von Moosburg, Freising, Nandlstadt und Eching, ` +
        `Sitz für Sitz, mit dem Namen der oder des Gewählten. Die Fraktionen liegen als ` +
        `Tortenstücke im Uhrzeigersinn ab zwölf Uhr, die größte zuerst.`,
      charts: DETAILS.map(rat),
    },
  ],
  records: [],
};

fs.writeFileSync(OUT, JSON.stringify(datensatz), "utf8");

// ── Manifest ───────────────────────────────────────────────────────────

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const eintrag = {
  id: ID,
  file: "kommunalwahl_2026.json",
  title: "Kommunalwahl",
  year: 2026,
  n: sitzeGesamt,
  kind: "statistik",
};
manifest.datasets = [eintrag, ...manifest.datasets.filter((d) => d.id !== ID)];
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n", "utf8");

const kb = fs.statSync(OUT).size / 1024;
console.log(
  `kommunalwahl_2026.json  ${gemeinderat.gemeinden.length} Gemeinden  ${sitzeGesamt} Sitze  ` +
    `${DETAILS.length} Räte im Detail  ${kb.toFixed(0)} kB`
);
