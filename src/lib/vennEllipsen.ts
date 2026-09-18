// Drei flächentreue Ellipsen für ein Venn-Diagramm mit drei Mengen.
//
// Probe Diagramme, vorläufig (18.09.2026): Kreise können die sieben Gebiete
// nicht flächentreu darstellen, achsenparallele Rechtecke auch nicht (gemessen:
// die kleinen Gebiete weichen um rund eine Person ab). Ellipsen schaffen es.
// Die Lage wird gesucht, nicht konstruiert: ein Simplex-Verfahren mit
// Zufallsstarts, begrenzt auf ein Zeitbudget. Findet es nichts Gutes, gibt die
// Funktion null zurück und das Diagramm zeichnet schematische Kreise.

export type Ellipse = { cx: number; cy: number; a: number; b: number; winkel: number };
/** Gebiete als Bitmuster: "100" = nur A, "110" = A und B ohne C, "111" = alle. */
export type Gebiete = Record<string, number>;
export type Loesung = {
  ellipsen: [Ellipse, Ellipse, Ellipse];
  box: { x0: number; y0: number; x1: number; y1: number };
  /** Ein guter Platz für die Zahl je Gebiet, in denselben Einheiten wie die Box. */
  zentren: Record<string, { x: number; y: number } | null>;
  /** Größte Abweichung eines Gebiets, in Personen. */
  abweichung: number;
};

const SCHLUESSEL = ["100", "010", "001", "110", "101", "011", "111"];
const RASTER = 96;

function ausParametern(p: number[]): [Ellipse, Ellipse, Ellipse] {
  const e = (i: number): Ellipse => ({
    cx: p[5 * i],
    cy: p[5 * i + 1],
    a: Math.abs(p[5 * i + 2]) + 0.05,
    b: Math.abs(p[5 * i + 3]) + 0.05,
    winkel: p[5 * i + 4],
  });
  return [e(0), e(1), e(2)];
}

function box(ellipsen: Ellipse[]) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const e of ellipsen) {
    const r = Math.max(e.a, e.b);
    x0 = Math.min(x0, e.cx - r); x1 = Math.max(x1, e.cx + r);
    y0 = Math.min(y0, e.cy - r); y1 = Math.max(y1, e.cy + r);
  }
  return { x0, y0, x1, y1 };
}

/** Zugehörigkeit jedes Rasterpunkts zu den drei Ellipsen, als Bitmuster. */
function maske(ellipsen: Ellipse[], n: number) {
  const b = box(ellipsen);
  const bits = new Uint8Array(n * n);
  const dx = (b.x1 - b.x0) / n;
  const dy = (b.y1 - b.y0) / n;
  const cos = ellipsen.map((e) => Math.cos(e.winkel));
  const sin = ellipsen.map((e) => Math.sin(e.winkel));
  for (let iy = 0; iy < n; iy++) {
    const y = b.y0 + (iy + 0.5) * dy;
    for (let ix = 0; ix < n; ix++) {
      const x = b.x0 + (ix + 0.5) * dx;
      let bit = 0;
      for (let k = 0; k < 3; k++) {
        const e = ellipsen[k];
        const px = x - e.cx, py = y - e.cy;
        const u = (px * cos[k] + py * sin[k]) / e.a;
        const v = (-px * sin[k] + py * cos[k]) / e.b;
        if (u * u + v * v <= 1) bit |= 1 << k;
      }
      bits[iy * n + ix] = bit;
    }
  }
  return { bits, box: b, zelle: dx * dy, dx, dy };
}

const bitFuer = (s: string) => (s[0] === "1" ? 1 : 0) | (s[1] === "1" ? 2 : 0) | (s[2] === "1" ? 4 : 0);

function flaechen(ellipsen: Ellipse[], n: number) {
  const { bits, zelle } = maske(ellipsen, n);
  const summe: Record<number, number> = {};
  for (let i = 0; i < bits.length; i++) {
    const b = bits[i];
    if (b) summe[b] = (summe[b] ?? 0) + 1;
  }
  const out: Record<string, number> = {};
  for (const s of SCHLUESSEL) out[s] = (summe[bitFuer(s)] ?? 0) * zelle;
  return out;
}

function kosten(p: number[], ziel: Gebiete, gesamt: number, n: number): number {
  const ellipsen = ausParametern(p);
  // Sehr schiefe Ellipsen sehen nicht mehr nach Venn aus.
  let strafe = 0;
  for (const e of ellipsen) {
    const v = e.a / e.b;
    if (v > 2.4) strafe += (v - 2.4) ** 2 * 400;
    if (v < 1 / 2.4) strafe += (1 / 2.4 - v) ** 2 * 400;
  }
  const ist = flaechen(ellipsen, n);
  const summe = SCHLUESSEL.reduce((a, s) => a + ist[s], 0);
  if (summe <= 0) return 1e9;
  const k = gesamt / summe;
  // Relativ gewichtet: sonst gehen die kleinen Gebiete neben den großen unter.
  let f = 0;
  for (const s of SCHLUESSEL) {
    const soll = ziel[s];
    f += (ist[s] * k - soll) ** 2 / Math.max(soll, 0.6);
  }
  return f + strafe;
}

/** Nelder-Mead, knapp gehalten: 15 Parameter, feste Schrittzahl. */
function simplex(start: number[], f: (p: number[]) => number, schritte: number): { p: number[]; wert: number } {
  const dim = start.length;
  const punkte: number[][] = [start.slice()];
  for (let i = 0; i < dim; i++) {
    const p = start.slice();
    p[i] += Math.abs(p[i]) * 0.15 + 0.4;
    punkte.push(p);
  }
  let werte = punkte.map(f);
  for (let s = 0; s < schritte; s++) {
    const reihenfolge = werte.map((_, i) => i).sort((a, b) => werte[a] - werte[b]);
    const best = reihenfolge[0], schlecht = reihenfolge[dim];
    const mitte = new Array(dim).fill(0);
    for (let i = 0; i < dim; i++) {
      for (const idx of reihenfolge.slice(0, dim)) mitte[i] += punkte[idx][i] / dim;
    }
    const spiegel = mitte.map((m, i) => m + (m - punkte[schlecht][i]));
    const wSpiegel = f(spiegel);
    if (wSpiegel < werte[best]) {
      const weit = mitte.map((m, i) => m + 2 * (m - punkte[schlecht][i]));
      const wWeit = f(weit);
      if (wWeit < wSpiegel) { punkte[schlecht] = weit; werte[schlecht] = wWeit; }
      else { punkte[schlecht] = spiegel; werte[schlecht] = wSpiegel; }
    } else if (wSpiegel < werte[reihenfolge[dim - 1]]) {
      punkte[schlecht] = spiegel; werte[schlecht] = wSpiegel;
    } else {
      const eng = mitte.map((m, i) => m + 0.5 * (punkte[schlecht][i] - m));
      const wEng = f(eng);
      if (wEng < werte[schlecht]) { punkte[schlecht] = eng; werte[schlecht] = wEng; }
      else {
        for (const idx of reihenfolge.slice(1)) {
          punkte[idx] = punkte[idx].map((v, i) => punkte[best][i] + 0.5 * (v - punkte[best][i]));
          werte[idx] = f(punkte[idx]);
        }
      }
    }
  }
  const beste = werte.map((_, i) => i).sort((a, b) => werte[a] - werte[b])[0];
  return { p: punkte[beste], wert: werte[beste] };
}

/** Ein Platz für die Zahl: der Punkt des Gebiets mit dem größten Abstand zum Rand. */
function zentren(ellipsen: Ellipse[], n: number) {
  const { bits, box: b, dx, dy } = maske(ellipsen, n);
  const out: Record<string, { x: number; y: number } | null> = {};
  for (const s of SCHLUESSEL) {
    const ziel = bitFuer(s);
    // Chamfer-Distanz in zwei Durchläufen, das reicht für eine Platzwahl.
    const d = new Float32Array(n * n);
    for (let i = 0; i < d.length; i++) d[i] = bits[i] === ziel ? Infinity : 0;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const i = y * n + x;
        if (d[i] === 0) continue;
        let m = d[i];
        if (x > 0) m = Math.min(m, d[i - 1] + 1);
        if (y > 0) m = Math.min(m, d[i - n] + 1);
        if (x > 0 && y > 0) m = Math.min(m, d[i - n - 1] + 1.41);
        d[i] = m;
      }
    }
    let bestI = -1, bestD = 0;
    for (let y = n - 1; y >= 0; y--) {
      for (let x = n - 1; x >= 0; x--) {
        const i = y * n + x;
        if (d[i] === 0) continue;
        let m = d[i];
        if (x < n - 1) m = Math.min(m, d[i + 1] + 1);
        if (y < n - 1) m = Math.min(m, d[i + n] + 1);
        if (x < n - 1 && y < n - 1) m = Math.min(m, d[i + n + 1] + 1.41);
        d[i] = m;
        if (m > bestD) { bestD = m; bestI = i; }
      }
    }
    out[s] = bestI < 0 ? null : {
      x: b.x0 + ((bestI % n) + 0.5) * dx,
      y: b.y0 + (Math.floor(bestI / n) + 0.5) * dy,
    };
  }
  return out;
}

/**
 * Sucht drei Ellipsen, deren sieben Gebiete den Zielwerten entsprechen.
 * `budgetMs` begrenzt die Suche; null heißt „nicht gefunden“.
 */
export function loeseEllipsen(ziel: Gebiete, budgetMs = 120): Loesung | null {
  const gesamt = SCHLUESSEL.reduce((a, s) => a + (ziel[s] ?? 0), 0);
  if (gesamt <= 0) return null;
  // Auf Flächenanteile normieren: die Suche rechnet mit Einheiten um 1.
  const anteil: Gebiete = Object.fromEntries(
    SCHLUESSEL.map((s) => [s, ((ziel[s] ?? 0) / gesamt) * 100]),
  );
  const mengen = [
    anteil["100"] + anteil["110"] + anteil["101"] + anteil["111"],
    anteil["010"] + anteil["110"] + anteil["011"] + anteil["111"],
    anteil["001"] + anteil["101"] + anteil["011"] + anteil["111"],
  ];

  // Start: drei Kreise, je nach Mengengröße, im Dreieck um den Ursprung.
  const startWerte = (drehung: number, abstand: number, zufall: () => number): number[] => {
    const p: number[] = [];
    for (let i = 0; i < 3; i++) {
      const r = Math.sqrt(Math.max(mengen[i], 1) / Math.PI);
      const a = drehung + (i * 2 * Math.PI) / 3;
      p.push(
        Math.cos(a) * abstand * r + (zufall() - 0.5) * r,
        Math.sin(a) * abstand * r + (zufall() - 0.5) * r,
        r * (0.8 + zufall() * 0.6),
        r * (0.8 + zufall() * 0.6),
        zufall() * Math.PI,
      );
    }
    return p;
  };

  const ende = Date.now() + budgetMs;
  // Deterministischer Zufall: gleiche Daten ergeben dieselbe Zeichnung.
  let samen = 42;
  const zufall = () => {
    samen = (samen * 1103515245 + 12345) % 2147483648;
    return samen / 2147483648;
  };

  let beste: { p: number[]; wert: number } | null = null;
  let versuch = 0;
  while (Date.now() < ende || versuch === 0) {
    const abstand = 0.4 + (versuch % 4) * 0.25;
    const grob = simplex(startWerte(zufall() * Math.PI, abstand, zufall), (p) => kosten(p, anteil, 100, 52), 220);
    let fein = simplex(grob.p, (p) => kosten(p, anteil, 100, RASTER), 160);
    // Vom besten Fund aus weitersuchen: kleine Störung, nochmal absteigen.
    for (let i = 0; i < 2 && Date.now() < ende; i++) {
      const gestoert = fein.p.map((v, j) => v + (zufall() - 0.5) * (j % 5 === 4 ? 0.4 : 0.6));
      const nochmal = simplex(gestoert, (p) => kosten(p, anteil, 100, RASTER), 140);
      if (nochmal.wert < fein.wert) fein = nochmal;
    }
    if (!beste || fein.wert < beste.wert) beste = fein;
    versuch++;
    if (beste.wert < 0.02) break;
  }
  if (!beste) return null;

  const ellipsen = ausParametern(beste.p);
  const ist = flaechen(ellipsen, 200);
  const summe = SCHLUESSEL.reduce((a, s) => a + ist[s], 0);
  if (summe <= 0) return null;
  const k = gesamt / summe;
  let abweichung = 0;
  for (const s of SCHLUESSEL) abweichung = Math.max(abweichung, Math.abs(ist[s] * k - (ziel[s] ?? 0)));
  // Mehr als ein Prozent daneben: lieber schematisch zeichnen.
  if (abweichung > Math.max(1, gesamt * 0.01)) return null;

  return { ellipsen, box: box(ellipsen), zentren: zentren(ellipsen, 180), abweichung };
}
