// Der Löser muss für jede Filterauswahl der beiden Feste eine flächentreue Lage
// finden, in der Gebiete ohne Antworten nicht zu sehen sind. Die Namen der
// Mengen dürfen sich dabei nicht überdecken.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { MIN_N } from "../src/lib/filters";
import { flaechenNachBits, loeseEllipsen, SCHLUESSEL } from "../src/lib/vennEllipsen";
import { platziere } from "../src/lib/vennBeschriftung";

const DATA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/data");
const bit = (s) => (s[0] === "1" ? 1 : 0) | (s[1] === "1" ? 2 : 0) | (s[2] === "1" ? 4 : 0);

/** Alle Auswahlen aus Alter (beliebige Teilmengen) und Wohnort, ab MIN_N Antworten. */
function faelle(datei) {
  const d = JSON.parse(fs.readFileSync(path.join(DATA, datei), "utf8"));
  const spec = d.sections.flatMap((s) => s.charts ?? []).find((c) => c.type === "venn3");
  const [a, b, c] = spec.values;
  const alter = d.filters.find((f) => f.key === "age");
  const ort = d.filters.find((f) => f.key !== "age");
  const codes = (f) => f.categories ?? f.values;
  const trifft = (f, sel, v) => sel.some((i) => { const k = codes(f)[i]; return Array.isArray(k) ? k.includes(v) : k === v; });
  const out = [];
  const n = alter.labels.length;
  for (let m = 0; m < 1 << n; m++) {
    const as = [...Array(n).keys()].filter((i) => m & (1 << i));
    for (const os of [[], [0], [1]]) {
      const recs = d.records.filter((r) =>
        (as.length === 0 || trifft(alter, as, r[alter.source])) && (os.length === 0 || trifft(ort, os, r[ort.source])));
      if (recs.length < MIN_N) continue;
      const g = Object.fromEntries(SCHLUESSEL.map((s) => [s, 0]));
      for (const r of recs) {
        const v = r[spec.source];
        if (!Array.isArray(v)) continue;
        const s = `${v.includes(a) ? 1 : 0}${v.includes(b) ? 1 : 0}${v.includes(c) ? 1 : 0}`;
        if (s in g) g[s]++;
      }
      out.push([`${datei} Alter [${as}] Ort [${os}]`, g]);
    }
  }
  return out;
}

const alle = [...faelle("christkindlmarkt_2025.json"), ...faelle("volksfest_2024.json")];

describe("loeseEllipsen", () => {
  it.each(alle)("%s: flächentreu, leere Gebiete unsichtbar", (_, g) => {
    const l = loeseEllipsen(g);
    expect(l).not.toBeNull();
    const gesamt = Object.values(g).reduce((x, y) => x + y, 0);
    expect(l.abweichung).toBeLessThanOrEqual(Math.max(1, gesamt * 0.01) + 1e-9);
    const ist = flaechenNachBits(l.ellipsen, 400);
    let summe = 0;
    for (let b = 1; b < 8; b++) summe += ist[b];
    for (const s of SCHLUESSEL) {
      if (g[s] === 0) expect((ist[bit(s)] * gesamt) / summe, s).toBeLessThanOrEqual(Math.max(0.2, gesamt * 0.003));
    }
  });

  it("zeichnet bei gleichen Zahlen dasselbe", () => {
    const g = alle[0][1];
    expect(loeseEllipsen(g)).toEqual(loeseEllipsen(g));
  });

  it("trennt Mengen ohne gemeinsame Antworten", () => {
    const l = loeseEllipsen({ "100": 20, "010": 30, "001": 10, "110": 0, "101": 0, "011": 0, "111": 0 });
    expect(l).not.toBeNull();
    const ist = flaechenNachBits(l.ellipsen, 400);
    expect(ist[3] + ist[5] + ist[6] + ist[7]).toBeLessThan(0.5);
  });

  it("legt eine enthaltene Menge ganz hinein", () => {
    // A liegt ganz in B, C überlappt nur B.
    const l = loeseEllipsen({ "100": 0, "010": 40, "001": 15, "110": 10, "101": 0, "011": 5, "111": 0 });
    expect(l).not.toBeNull();
    expect(l.abweichung).toBeLessThanOrEqual(1);
  });

  it("gibt bei einer leeren Menge auf", () => {
    expect(loeseEllipsen({ "100": 5, "010": 5, "001": 0, "110": 2, "101": 0, "011": 0, "111": 0 })).toBeNull();
  });
});

describe("platziere", () => {
  const BREITE = 520, HOEHE = 380, RAND = 54;
  const ueber = (a, b) =>
    Math.min(a.x + a.w, b.x + b.w) > Math.max(a.x, b.x) && Math.min(a.y + a.h, b.y + b.h) > Math.max(a.y, b.y);

  it.each(alle)("%s: Namen überdecken sich nicht und bleiben im Bild", (_, g) => {
    const l = loeseEllipsen(g);
    const { box } = l;
    const k = Math.min((BREITE - 2 * RAND) / (box.x1 - box.x0), (HOEHE - 2 * RAND) / (box.y1 - box.y0));
    const ox = (BREITE - (box.x1 - box.x0) * k) / 2 - box.x0 * k;
    const oy = (HOEHE - (box.y1 - box.y0) * k) / 2 - box.y0 * k;
    const orte = platziere({
      ellipsen: l.ellipsen,
      zentren: l.zentren,
      abbildung: { X: (x) => ox + x * k, Y: (y) => oy + y * k, k },
      breite: BREITE,
      hoehe: HOEHE,
      zahlen: SCHLUESSEL.filter((s) => g[s] > 0).map((s) => ({ s, text: String(g[s]), px: 14 })),
      namen: ["Freitag", "Samstag", "Sonntag"].map((n) => ({ zeile1: n, zeile2: "100 Antworten" })),
    });
    const n = orte.namen;
    expect(ueber(n[0], n[1]) || ueber(n[0], n[2]) || ueber(n[1], n[2])).toBe(false);
    for (const kasten of n) {
      expect(kasten.x).toBeGreaterThanOrEqual(0);
      expect(kasten.x + kasten.w).toBeLessThanOrEqual(BREITE);
    }
  });
});
