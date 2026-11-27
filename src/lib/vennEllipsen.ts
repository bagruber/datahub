// Drei flächentreue Ellipsen für ein Diagramm mit drei Mengen.
//
// Gezeichnet wird ein Euler-Diagramm, kein Venn-Diagramm: Ein Gebiet, in dem
// niemand liegt, gibt es nicht. Hat niemand nur am Freitag geantwortet, liegt
// die Freitag-Ellipse ganz in den anderen; teilen zwei Mengen nichts, berühren
// sich ihre Formen nicht.
//
// Vorgehen wie bei eulerr: Zuerst Kreise, deren paarweise Überlappungen exakt
// stimmen (Abstand je Paar per Halbierung, Lage per Ausgleich). Davon aus
// verfeinert ein Simplex-Verfahren zu Ellipsen, bis alle sieben Gebiete
// stimmen. Die Flächen werden zeilenweise gerechnet: Jede Ellipse schneidet eine
// Zeile in einem Intervall, die Gebiete sind dann Intervallstücke. Das ist in x
// exakt und schnell genug, um ohne Zeitbudget mit festen Schrittzahlen zu
// suchen. So zeichnet jedes Gerät dasselbe Bild.

export type Ellipse = { cx: number; cy: number; a: number; b: number; winkel: number };
/** Gebiete als Bitmuster: "100" = nur A, "110" = A und B ohne C, "111" = alle. */
export type Gebiete = Record<string, number>;
export type Zentrum = { x: number; y: number; /** Abstand zum Rand des Gebiets. */ r: number };
export type Loesung = {
  ellipsen: [Ellipse, Ellipse, Ellipse];
  box: { x0: number; y0: number; x1: number; y1: number };
  /** Der Punkt je Gebiet mit dem größten Abstand zum Rand, in denselben Einheiten wie die Box. */
  zentren: Record<string, Zentrum | null>;
  /** Größte Abweichung eines Gebiets, in Personen. */
  abweichung: number;
};

export const SCHLUESSEL = ["100", "010", "001", "110", "101", "011", "111"] as const;
const bitFuer = (s: string) => (s[0] === "1" ? 1 : 0) | (s[1] === "1" ? 2 : 0) | (s[2] === "1" ? 4 : 0);

// ── Geometrie ──────────────────────────────────────────────────────────

type Koeff = { cx: number; cy: number; A: number; B: number; C: number; hy: number };

/** Ellipse als quadratische Form: A·u² + B·u·v + C·v² ≤ 1 mit u = x − cx, v = y − cy. */
function koeff(e: Ellipse): Koeff {
  const c = Math.cos(e.winkel), s = Math.sin(e.winkel);
  const ia = 1 / (e.a * e.a), ib = 1 / (e.b * e.b);
  return {
    cx: e.cx,
    cy: e.cy,
    A: c * c * ia + s * s * ib,
    B: 2 * c * s * (ia - ib),
    C: s * s * ia + c * c * ib,
    hy: Math.sqrt(e.a * e.a * s * s + e.b * e.b * c * c),
  };
}

export function box(ellipsen: Ellipse[]) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const e of ellipsen) {
    const c = Math.cos(e.winkel), s = Math.sin(e.winkel);
    const hx = Math.sqrt(e.a * e.a * c * c + e.b * e.b * s * s);
    const hy = Math.sqrt(e.a * e.a * s * s + e.b * e.b * c * c);
    x0 = Math.min(x0, e.cx - hx); x1 = Math.max(x1, e.cx + hx);
    y0 = Math.min(y0, e.cy - hy); y1 = Math.max(y1, e.cy + hy);
  }
  return { x0, y0, x1, y1 };
}

const ENDEN = new Float64Array(6);
const LINKS = new Float64Array(3);
const RECHTS = new Float64Array(3);

/** Flächen nach Bitmuster (Index 1 bis 7), zeilenweise, in x exakt. */
export function flaechenNachBits(ellipsen: Ellipse[], zeilen: number): Float64Array {
  const k = ellipsen.map(koeff);
  const b = box(ellipsen);
  const dy = (b.y1 - b.y0) / zeilen;
  const flaeche = new Float64Array(8);
  for (let z = 0; z < zeilen; z++) {
    const y = b.y0 + (z + 0.5) * dy;
    let n = 0;
    for (let i = 0; i < 3; i++) {
      const e = k[i];
      const v = y - e.cy;
      LINKS[i] = Infinity;
      RECHTS[i] = -Infinity;
      if (Math.abs(v) >= e.hy) continue;
      const p = e.B * v;
      const d = p * p - 4 * e.A * (e.C * v * v - 1);
      if (d <= 0) continue;
      const w = Math.sqrt(d);
      LINKS[i] = e.cx + (-p - w) / (2 * e.A);
      RECHTS[i] = e.cx + (-p + w) / (2 * e.A);
      ENDEN[n++] = LINKS[i];
      ENDEN[n++] = RECHTS[i];
    }
    if (n === 0) continue;
    // Einfügesortierung: höchstens sechs Werte.
    for (let i = 1; i < n; i++) {
      const x = ENDEN[i];
      let j = i - 1;
      while (j >= 0 && ENDEN[j] > x) { ENDEN[j + 1] = ENDEN[j]; j--; }
      ENDEN[j + 1] = x;
    }
    for (let i = 0; i + 1 < n; i++) {
      const l = ENDEN[i], r = ENDEN[i + 1];
      if (r <= l) continue;
      const m = (l + r) / 2;
      const bits = (m > LINKS[0] && m < RECHTS[0] ? 1 : 0) | (m > LINKS[1] && m < RECHTS[1] ? 2 : 0) | (m > LINKS[2] && m < RECHTS[2] ? 4 : 0);
      if (bits) flaeche[bits] += (r - l) * dy;
    }
  }
  return flaeche;
}

function innen(e: Koeff, x: number, y: number): boolean {
  const u = x - e.cx, v = y - e.cy;
  return e.A * u * u + e.B * u * v + e.C * v * v <= 1;
}

/** Bitmuster eines Punkts: in welchen Ellipsen er liegt. */
export function bitsAn(ellipsen: Ellipse[], x: number, y: number): number {
  let bits = 0;
  for (let i = 0; i < 3; i++) if (innen(koeff(ellipsen[i]), x, y)) bits |= 1 << i;
  return bits;
}

// ── Startlage aus Kreisen ──────────────────────────────────────────────

/** Fläche der Linse zweier Kreise mit Abstand d. */
function linse(r1: number, r2: number, d: number): number {
  if (d >= r1 + r2) return 0;
  if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
  const a1 = Math.acos(Math.min(1, Math.max(-1, (d * d + r1 * r1 - r2 * r2) / (2 * d * r1))));
  const a2 = Math.acos(Math.min(1, Math.max(-1, (d * d + r2 * r2 - r1 * r1) / (2 * d * r2))));
  const w = Math.sqrt(Math.max(0, (-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2)));
  return r1 * r1 * a1 + r2 * r2 * a2 - w / 2;
}

/** Abstand, bei dem zwei Kreise die gewünschte Schnittfläche haben. */
function abstandFuer(r1: number, r2: number, ziel: number): number {
  let lo = Math.abs(r1 - r2), hi = r1 + r2;
  for (let i = 0; i < 60; i++) {
    const m = (lo + hi) / 2;
    if (linse(r1, r2, m) > ziel) lo = m; else hi = m;
  }
  return (lo + hi) / 2;
}

type Paar = { i: number; j: number; d: number; art: "getrennt" | "enthalten" | "genau" };

function kreisLage(r: number[], paare: Paar[]): [number, number][] {
  // Punkt 0 im Ursprung, Punkt 1 auf der x-Achse, Punkt 2 frei: drei Parameter.
  const lage = (p: number[]): [number, number][] => [[0, 0], [p[0], 0], [p[1], p[2]]];
  const f = (p: number[]) => {
    const c = lage(p);
    let s = 0;
    for (const q of paare) {
      const d = Math.hypot(c[q.i][0] - c[q.j][0], c[q.i][1] - c[q.j][1]);
      const fehler = q.art === "getrennt" ? Math.min(0, d - q.d) : q.art === "enthalten" ? Math.max(0, d - q.d) : d - q.d;
      s += fehler * fehler;
    }
    return s;
  };
  // Start aus dem Dreieck der Sollabstände, wo es eines gibt.
  const d01 = paare[0].d, d02 = paare[1].d, d12 = paare[2].d;
  const x2 = d01 > 0 ? (d02 * d02 - d12 * d12 + d01 * d01) / (2 * d01) : 0;
  const y2 = Math.sqrt(Math.max(0, d02 * d02 - x2 * x2)) || 0.5 * Math.max(...r);
  return lage(simplex([Math.max(d01, 0.01), x2, y2], f, 400).p);
}

// ── Suche ──────────────────────────────────────────────────────────────

function ausParametern(p: number[]): [Ellipse, Ellipse, Ellipse] {
  const e = (i: number): Ellipse => ({
    cx: p[5 * i],
    cy: p[5 * i + 1],
    a: Math.exp(p[5 * i + 2]),
    b: Math.exp(p[5 * i + 3]),
    winkel: p[5 * i + 4],
  });
  return [e(0), e(1), e(2)];
}

/** Nelder-Mead, knapp gehalten. */
function simplex(start: number[], f: (p: number[]) => number, schritte: number, weite = 0.4): { p: number[]; wert: number } {
  const dim = start.length;
  const punkte: number[][] = [start.slice()];
  for (let i = 0; i < dim; i++) {
    const p = start.slice();
    p[i] += Math.abs(p[i]) * 0.1 + weite;
    punkte.push(p);
  }
  const werte = punkte.map(f);
  for (let s = 0; s < schritte; s++) {
    const reihenfolge = werte.map((_, i) => i).sort((a, b) => werte[a] - werte[b]);
    const best = reihenfolge[0], schlecht = reihenfolge[dim];
    const mitte = new Array(dim).fill(0);
    for (const idx of reihenfolge.slice(0, dim)) for (let i = 0; i < dim; i++) mitte[i] += punkte[idx][i] / dim;
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

/** Abweichung je Gebiet in Personen, nach Angleichen der Gesamtfläche. */
function abweichungen(ellipsen: Ellipse[], soll: Float64Array, gesamt: number, zeilen: number): Float64Array | null {
  const ist = flaechenNachBits(ellipsen, zeilen);
  let summe = 0;
  for (let b = 1; b < 8; b++) summe += ist[b];
  if (summe <= 0) return null;
  const k = gesamt / summe;
  const out = new Float64Array(8);
  for (let b = 1; b < 8; b++) out[b] = ist[b] * k - soll[b];
  return out;
}

function kosten(p: number[], soll: Float64Array, gesamt: number, zeilen: number): number {
  const ellipsen = ausParametern(p);
  // Sehr schiefe Ellipsen sehen nicht mehr nach Mengen aus.
  let strafe = 0;
  for (const e of ellipsen) {
    const v = Math.log(e.a / e.b);
    if (Math.abs(v) > 0.9) strafe += (Math.abs(v) - 0.9) ** 2 * 200;
  }
  const ab = abweichungen(ellipsen, soll, gesamt, zeilen);
  if (!ab) return 1e9;
  let f = 0;
  for (let b = 1; b < 8; b++) {
    // Relativ gewichtet, sonst gehen kleine Gebiete neben großen unter. Ein
    // Gebiet mit null Personen zählt am stärksten: Es darf nicht zu sehen sein.
    f += (ab[b] * ab[b]) / (soll[b] === 0 ? 0.25 : soll[b]);
  }
  return f + strafe;
}

/** Deterministischer Zufall: gleiche Zahlen ergeben dieselbe Zeichnung. */
function zufallsquelle(samen: number) {
  let s = samen;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

/**
 * Sucht drei Ellipsen, deren Gebiete den Zielwerten entsprechen. Gebiete mit
 * null Personen fehlen in der Zeichnung. null heißt: keine Lage gefunden, die
 * höchstens eine Person (bei großen Zahlen ein Prozent) daneben liegt.
 */
export function loeseEllipsen(ziel: Gebiete): Loesung | null {
  const soll = new Float64Array(8);
  for (const s of SCHLUESSEL) soll[bitFuer(s)] = Math.max(0, ziel[s] ?? 0);
  let gesamt = 0;
  for (let b = 1; b < 8; b++) gesamt += soll[b];
  const mengen = [0, 1, 2].map((i) => {
    let m = 0;
    for (let b = 1; b < 8; b++) if (b & (1 << i)) m += soll[b];
    return m;
  });
  // Eine leere Menge hat keine Form; dafür ist das Diagramm nicht gedacht.
  if (gesamt <= 0 || mengen.some((m) => m === 0)) return null;

  // In Personen gerechnet: Fläche 1 = eine Person.
  const r = mengen.map((m) => Math.sqrt(m / Math.PI));
  const paare: Paar[] = ([[0, 1], [0, 2], [1, 2]] as const).map(([i, j]) => {
    let schnitt = 0;
    for (let b = 1; b < 8; b++) if (b & (1 << i) && b & (1 << j)) schnitt += soll[b];
    const kleiner = Math.min(mengen[i], mengen[j]);
    if (schnitt === 0) return { i, j, d: r[i] + r[j], art: "getrennt" as const };
    if (schnitt >= kleiner) return { i, j, d: Math.abs(r[i] - r[j]), art: "enthalten" as const };
    return { i, j, d: abstandFuer(r[i], r[j], schnitt), art: "genau" as const };
  });
  const lage = kreisLage(r, paare);
  const kreise: number[] = [];
  for (let i = 0; i < 3; i++) kreise.push(lage[i][0], lage[i][1], Math.log(r[i]), Math.log(r[i]), 0);

  const zufall = zufallsquelle(42);
  const f = (zeilen: number) => (p: number[]) => kosten(p, soll, gesamt, zeilen);
  const toleranz = Math.max(1, gesamt * 0.01);
  const leerToleranz = Math.max(0.2, gesamt * 0.003);
  const passt = (p: number[]) => {
    const ab = abweichungen(ausParametern(p), soll, gesamt, 400);
    if (!ab) return Infinity;
    let schlimmste = 0;
    for (let b = 1; b < 8; b++) {
      // Ein leeres Gebiet muss so schmal sein, dass es unter der Linie verschwindet.
      const grenze = soll[b] === 0 ? leerToleranz : toleranz;
      schlimmste = Math.max(schlimmste, Math.abs(ab[b]) / grenze);
    }
    return schlimmste;
  };

  // Vom Kreis-Start aus verfeinern, dann gestörte Varianten der besten Lage.
  let beste = simplex(simplex(kreise, f(60), 500, 0.3).p, f(160), 400, 0.15);
  let gueteBeste = passt(beste.p);
  for (let versuch = 0; versuch < 30 && gueteBeste > 1; versuch++) {
    const start = versuch % 2 === 0
      ? beste.p.map((v, j) => v + (zufall() - 0.5) * (j % 5 === 4 ? 1.2 : j % 5 >= 2 ? 0.4 : 0.6 * Math.exp(beste.p[5 * Math.floor(j / 5) + 2])))
      : kreise.map((v, j) => v + (zufall() - 0.5) * (j % 5 === 4 ? Math.PI : j % 5 >= 2 ? 0.3 : 0.8 * r[Math.floor(j / 5)]));
    const kandidat = simplex(simplex(start, f(60), 500, 0.3).p, f(160), 400, 0.15);
    const guete = passt(kandidat.p);
    if (guete < gueteBeste) { beste = kandidat; gueteBeste = guete; }
  }
  if (gueteBeste > 1) return null;

  const ellipsen = ausParametern(beste.p);
  const ab = abweichungen(ellipsen, soll, gesamt, 400)!;
  let abweichung = 0;
  for (let b = 1; b < 8; b++) abweichung = Math.max(abweichung, Math.abs(ab[b]));
  return { ellipsen, box: box(ellipsen), zentren: zentren(ellipsen, soll, 200), abweichung };
}

/** Je Gebiet der Punkt mit dem größten Abstand zum Rand (Chamfer-Distanz). */
function zentren(ellipsen: Ellipse[], soll: Float64Array, n: number): Record<string, Zentrum | null> {
  const k = ellipsen.map(koeff);
  const b = box(ellipsen);
  // Quadratisches Raster, damit der Abstand in beiden Richtungen gleich zählt.
  const seite = Math.max(b.x1 - b.x0, b.y1 - b.y0);
  const zelle = seite / n;
  const x0 = (b.x0 + b.x1) / 2 - seite / 2, y0 = (b.y0 + b.y1) / 2 - seite / 2;
  const bits = new Uint8Array(n * n);
  for (let iy = 0; iy < n; iy++) {
    for (let ix = 0; ix < n; ix++) {
      const x = x0 + (ix + 0.5) * zelle, y = y0 + (iy + 0.5) * zelle;
      bits[iy * n + ix] = (innen(k[0], x, y) ? 1 : 0) | (innen(k[1], x, y) ? 2 : 0) | (innen(k[2], x, y) ? 4 : 0);
    }
  }
  const out: Record<string, Zentrum | null> = {};
  for (const s of SCHLUESSEL) {
    const ziel = bitFuer(s);
    if (soll[ziel] === 0) { out[s] = null; continue; }
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
        if (x < n - 1 && y > 0) m = Math.min(m, d[i - n + 1] + 1.41);
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
        if (x > 0 && y < n - 1) m = Math.min(m, d[i + n - 1] + 1.41);
        d[i] = m;
        if (m > bestD) { bestD = m; bestI = i; }
      }
    }
    out[s] = bestI < 0 ? null : {
      x: x0 + ((bestI % n) + 0.5) * zelle,
      y: y0 + (Math.floor(bestI / n) + 0.5) * zelle,
      r: bestD * zelle,
    };
  }
  return out;
}
