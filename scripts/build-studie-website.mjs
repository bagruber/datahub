// Rechnet die Zahlen der Befragung zu neuen Funktionen für die Studienseite
// aus den Records von website_innovationen_2025 nach und schreibt sie in
// studie_website_2025.json: die Zählungen unter daten.befragung, die Zahlen
// für den Fließtext unter werte["befragung.*"]. Die Studienseite enthält keine
// Einzelantworten, nur diese Aggregate.
//
//   node scripts/build-studie-website.mjs
//
// Der Test in src/lib/studie.test.ts ruft rechne() und vergleicht mit der Datei.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUELLE = "nachgerechnet aus website_innovationen_2025";

// Reihenfolge = Rangfolge im Abschlussbericht. `feld` ist der Präfix in den Records.
export const FUNKTIONEN = [
  { id: "suche", feld: "suche", label: "Moderne Suche" },
  { id: "konto", feld: "account", label: "Persönliches Konto" },
  { id: "karte", feld: "karte", label: "Karte mit Meldefunktion" },
  { id: "chatbot", feld: "chatbot", label: "Chatbot" },
  { id: "community", feld: "community", label: "Community-Funktion" },
];
const ITEMS = ["verstaendnis", "nuetzlichkeit", "nutzungsabsicht", "bedenken", "sinnhaftigkeit"];

const prozent = (anteil, n) => `${Math.round((100 * anteil) / n)} %`;
const summe = (xs) => xs.reduce((a, b) => a + b, 0);

export function rechne(records) {
  const n = records.length;
  const zaehle = (feld, wert) => records.filter((r) => r[feld] === wert).length;

  const funktionen = FUNKTIONEN.map((f) => ({
    id: f.id,
    label: f.label,
    items: Object.fromEntries(
      ITEMS.map((it) => [it, [1, 2, 3, 4, 5].map((k) => zaehle(`${f.feld}_${it}`, k))]),
    ),
    umsetzung: { ja: zaehle(`${f.feld}_umsetzung`, 1), nein: zaehle(`${f.feld}_umsetzung`, 2) },
  }));

  const werte = { "befragung.n": String(n) };
  for (const f of funktionen) {
    const { ja, nein } = f.umsetzung;
    const zustimmung = (it) => prozent(f.items[it][3] + f.items[it][4], summe(f.items[it]));
    werte[`befragung.${f.id}.umsetzung`] = prozent(ja, ja + nein);
    werte[`befragung.${f.id}.nutzung`] = zustimmung("nutzungsabsicht");
    werte[`befragung.${f.id}.bedenken`] = zustimmung("bedenken");
  }
  werte["befragung.wohnort.moosburg"] = String(zaehle("wohnort", 1));
  werte["befragung.haeufigkeit.monatlich"] = prozent(zaehle("frequency", 4), n);
  werte["befragung.sicherheit.sicher"] = prozent(zaehle("digital_security", 4) + zaehle("digital_security", 5), n);

  return { daten: { n, funktionen }, werte };
}

const lies = (datei) => JSON.parse(fs.readFileSync(path.join(ROOT, "public/data", datei), "utf8"));

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { records } = lies("website_innovationen_2025.json");
  const studie = lies("studie_website_2025.json");
  const { daten, werte } = rechne(records);
  studie.daten.befragung = daten;
  for (const [k, wert] of Object.entries(werte)) studie.werte[k] = { wert, quelle: QUELLE };
  fs.writeFileSync(
    path.join(ROOT, "public/data/studie_website_2025.json"),
    JSON.stringify(studie, null, 2) + "\n",
  );
  console.log(`✓ studie_website_2025: ${daten.n} Fragebögen, ${Object.keys(werte).length} Werte`);
}
