// Die Studienseite setzt Zahlen nur über Platzhalter ein. Dieser Test hält
// sie mit den Daten in Deckung: Die Aggregate der Befragung müssen sich aus
// den Records nachrechnen lassen, und jeder Platzhalter muss einen Wert haben.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { rechne } from "./build-studie-website.mjs";
import { platzhalter } from "../src/lib/studie";

const DATA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/data");
const lies = (datei) => JSON.parse(fs.readFileSync(path.join(DATA, datei), "utf8"));

const studie = lies("studie_website_2025.json");
const { records } = lies("website_innovationen_2025.json");

/** Alle Zeichenketten der Datei, egal wie tief. */
function texte(x) {
  if (typeof x === "string") return [x];
  if (Array.isArray(x)) return x.flatMap(texte);
  if (x && typeof x === "object") return Object.values(x).flatMap(texte);
  return [];
}

describe("studie_website_2025", () => {
  it("Aggregate der Befragung entsprechen den Records", () => {
    const { daten, werte } = rechne(records);
    expect(studie.daten.befragung).toEqual(daten);
    for (const [k, wert] of Object.entries(werte)) expect(studie.werte[k]?.wert, k).toBe(wert);
  });

  it("jeder Platzhalter hat einen Wert", () => {
    const fehlend = texte({ kapitel: studie.kapitel, kennzahlen: studie.kennzahlen })
      .flatMap(platzhalter)
      .filter((k) => !(k in studie.werte));
    expect(fehlend).toEqual([]);
  });

  it("jeder Wert nennt seine Quelle", () => {
    const ohne = Object.entries(studie.werte).filter(([, w]) => !w.quelle).map(([k]) => k);
    expect(ohne).toEqual([]);
  });

  it("enthält keine Einzelantworten", () => {
    expect(studie.records).toBeUndefined();
  });
});
