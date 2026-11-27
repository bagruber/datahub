// Wo die Beschriftungen eines Diagramms mit drei Ellipsen stehen, in Pixeln.
//
// Zahlen stehen im tiefsten Punkt ihres Gebiets. Ist das Gebiet zu schmal für
// die Zahl, steht sie außerhalb aller Formen und zeigt mit einer Linie auf ihr
// Gebiet; eine Zahl, die halb über einer fremden Fläche liegt, wird sonst dem
// falschen Gebiet zugeordnet. Die Namen der Mengen stehen außen an der eigenen
// Ellipse, an der Stelle, die am wenigsten über Formen, Zahlen oder den Rand ragt.

import { bitsAn, type Ellipse, type Zentrum } from "./vennEllipsen";

export type Kasten = { x: number; y: number; w: number; h: number };
export type ZahlOrt = { s: string; x: number; y: number; linie: { x: number; y: number } | null };
export type NameOrt = Kasten;

type Abbildung = { X: (x: number) => number; Y: (y: number) => number; k: number };

/** Geschätzte Breite eines Texts; die Schriften laufen bei rund 0,6 em je Zeichen. */
export const textBreite = (text: string, px: number, fett = false) => text.length * px * (fett ? 0.62 : 0.56);

function ueberlappung(a: Kasten, b: Kasten): number {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

export function platziere({
  ellipsen,
  zentren,
  abbildung,
  breite,
  hoehe,
  zahlen,
  namen,
}: {
  ellipsen: Ellipse[];
  zentren: Record<string, Zentrum | null>;
  abbildung: Abbildung;
  breite: number;
  hoehe: number;
  zahlen: { s: string; text: string; px: number }[];
  namen: { zeile1: string; zeile2: string }[];
}): { zahlen: ZahlOrt[]; namen: NameOrt[] } {
  const { X, Y, k } = abbildung;
  // Pixel zurück ins Modell, um zu fragen, in welchen Formen ein Punkt liegt.
  const imModell = (px: number, py: number) => bitsAn(ellipsen, (px - X(0)) / k, (py - Y(0)) / k);
  const mitte = {
    x: ellipsen.reduce((a, e) => a + X(e.cx), 0) / 3,
    y: ellipsen.reduce((a, e) => a + Y(e.cy), 0) / 3,
  };
  const belegt: Kasten[] = [];
  const frei = (kasten: Kasten) => belegt.every((b) => ueberlappung(kasten, b) === 0);
  const imBild = (kasten: Kasten) => kasten.x >= 2 && kasten.y >= 2 && kasten.x + kasten.w <= breite - 2 && kasten.y + kasten.h <= hoehe - 2;
  /** Anteil der Kastenfläche, der in irgendeiner Form liegt (Stichproben). */
  const inFormen = (kasten: Kasten) => {
    let treffer = 0;
    for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) {
      if (imModell(kasten.x + ((i + 0.5) * kasten.w) / 5, kasten.y + ((j + 0.5) * kasten.h) / 3)) treffer++;
    }
    return treffer / 15;
  };

  // Zuerst die Zahlen, die in ihr Gebiet passen; sie legen fest, was belegt ist.
  const orte: ZahlOrt[] = [];
  const aussen: { s: string; text: string; px: number; z: { x: number; y: number } }[] = [];
  for (const { s, text, px } of zahlen) {
    const z = zentren[s];
    if (!z) continue;
    const w = textBreite(text, px) + 4, h = px + 2;
    const zx = X(z.x), zy = Y(z.y);
    if (z.r * k >= Math.hypot(w / 2, h / 2) * 0.85) {
      orte.push({ s, x: zx, y: zy, linie: null });
      belegt.push({ x: zx - w / 2, y: zy - h / 2, w, h });
    } else {
      aussen.push({ s, text, px, z: { x: zx, y: zy } });
    }
  }

  // Zu schmale Gebiete: vom Mittelpunkt der Formen weg nach außen, bis kein
  // Formrand mehr im Weg ist; bei Kollision den Strahl drehen.
  for (const { s, text, px, z } of aussen) {
    const w = textBreite(text, px) + 4, h = px + 2;
    const grund = Math.atan2(z.y - mitte.y, z.x - mitte.x) || -Math.PI / 2;
    let gewaehlt: { kasten: Kasten; x: number; y: number } | null = null;
    for (const dreh of [0, 0.3, -0.3, 0.6, -0.6, 0.9, -0.9, 1.3, -1.3]) {
      const dx = Math.cos(grund + dreh), dy = Math.sin(grund + dreh);
      let t = 0;
      while (t < 400 && imModell(z.x + dx * t, z.y + dy * t)) t += 3;
      const cx = z.x + dx * (t + 10 + (Math.abs(dx) * w) / 2), cy = z.y + dy * (t + 10 + (Math.abs(dy) * h) / 2);
      const kasten = { x: cx - w / 2, y: cy - h / 2, w, h };
      if (frei(kasten) && imBild(kasten) && inFormen(kasten) === 0) { gewaehlt = { kasten, x: cx, y: cy }; break; }
      if (!gewaehlt) gewaehlt = { kasten, x: cx, y: cy };
    }
    const { kasten, x, y } = gewaehlt!;
    orte.push({ s, x, y, linie: z });
    belegt.push(kasten);
  }

  // Namen: Plätze rund um die eigene Ellipse, außen an ihrem Rand.
  const namensOrte: NameOrt[] = [];
  ellipsen.forEach((e, i) => {
    const { zeile1, zeile2 } = namen[i];
    const w = Math.max(textBreite(zeile1, 13, true), textBreite(zeile2, 11)) + 4, h = 30;
    const c = Math.cos(e.winkel), sn = Math.sin(e.winkel);
    let bester: { kasten: Kasten; wert: number } | null = null;
    for (let n = 0; n < 32; n++) {
      const t = (n / 32) * 2 * Math.PI;
      const qx = X(e.cx + e.a * Math.cos(t) * c - e.b * Math.sin(t) * sn);
      const qy = Y(e.cy + e.a * Math.cos(t) * sn + e.b * Math.sin(t) * c);
      let nx = qx - X(e.cx), ny = qy - Y(e.cy);
      const l = Math.hypot(nx, ny) || 1;
      nx /= l; ny /= l;
      const ax = qx + nx * 8, ay = qy + ny * 8;
      const kasten = { x: ax + nx * (w / 2) - w / 2, y: ay + ny * (h / 2) - h / 2, w, h };
      const rand = Math.max(0, 2 - kasten.x) + Math.max(0, 2 - kasten.y)
        + Math.max(0, kasten.x + kasten.w - breite + 2) + Math.max(0, kasten.y + kasten.h - hoehe + 2);
      const zuMitte = Math.cos(Math.atan2(qy - mitte.y, qx - mitte.x) - Math.atan2(ny, nx));
      const wert = inFormen(kasten) * 100
        + belegt.reduce((a, b) => a + ueberlappung(kasten, b), 0)
        + rand * 20
        + (1 - zuMitte) * 5;
      if (!bester || wert < bester.wert) bester = { kasten, wert };
    }
    namensOrte.push(bester!.kasten);
    belegt.push(bester!.kasten);
  });

  return { zahlen: orte, namen: namensOrte };
}
