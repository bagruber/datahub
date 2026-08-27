// Holt die Wahl-Rohdaten aus dem Schwesterprojekt bagruber/elections
// (Geschwister-Checkout unter ../elections) nach rawdata/wahlen/ und setzt
// jeder Kopie einen Herkunftskopf (_herkunft). Getippt wird hier nichts:
// Abgleich = dieser Skriptlauf, danach node scripts/build-wahlen.mjs.
//
// Idempotent: der Stand im Kopf ist das Commit-Datum der Quelldatei,
// nicht das Laufdatum. Ein zweiter Lauf ändert nichts.
//
//   node scripts/hole-wahlen.mjs

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ELECTIONS = path.resolve(ROOT, "..", "elections");
const ZIEL = path.join(ROOT, "rawdata", "wahlen");
const WAHL = "kommunalwahl2026-freising";

const DATEIEN = [
  [`data/wahlen/${WAHL}-gemeinderat.json`, `${WAHL}-gemeinderat.json`],
  [`data/wahlen/${WAHL}-kreistag.json`, `${WAHL}-kreistag.json`],
  [`data/kartogramm/${WAHL}.json`, `${WAHL}-kartogramm.json`],
];

for (const [quelle, zielname] of DATEIEN) {
  const daten = JSON.parse(fs.readFileSync(path.join(ELECTIONS, quelle), "utf8"));
  const stand = execFileSync("git", ["-C", ELECTIONS, "log", "-1", "--format=%cs", "--", quelle], {
    encoding: "utf8",
  }).trim();
  const kopie = {
    _herkunft: {
      quelle: "bagruber/elections · " + quelle,
      stand,
      skript: "scripts/hole-wahlen.mjs",
      hinweis: "GENERIERT, nicht von Hand ändern. Neu erzeugen: node scripts/hole-wahlen.mjs",
    },
    ...daten,
  };
  fs.writeFileSync(path.join(ZIEL, zielname), JSON.stringify(kopie, null, 1) + "\n");
  console.log("geschrieben:", path.join("rawdata/wahlen", zielname), "· Stand", stand);
}

console.log("jetzt: node scripts/build-wahlen.mjs");
