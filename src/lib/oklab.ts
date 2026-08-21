// Farbmischung in OKLab statt in sRGB.
//
// Der Unterschied ist hier keine Feinheit: eine sRGB-Blende von Beige nach Grün
// läuft über ein schlammiges Oliv, weil sich Helligkeit und Buntheit
// ungleichmäßig ändern. In OKLab verlaufen beide gleichmäßig, und die Stufen
// einer Skala sehen gleich weit auseinander aus — genau das verlangt eine
// Wertskala, deren Sättigung einen Anteil trägt.

type Lab = [number, number, number];

function toOklab(hex: string): Lab {
  const [r, g, b] = [1, 3, 5].map((i) => linear(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function fromOklab([L, A, B]: Lab): string {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const channels = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return (
    "#" +
    channels
      .map((v) => Math.round(Math.min(1, Math.max(0, gamma(v))) * 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

const linear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const gamma = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

/** Mischt zwei Farben; `t` von 0 (ganz `from`) bis 1 (ganz `to`). */
export function mix(from: string, to: string, t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  const a = toOklab(from);
  const b = toOklab(to);
  return fromOklab(a.map((v, i) => v + (b[i] - v) * clamped) as Lab);
}

/** Reicht die Fläche für helle Schrift? Schwelle über die OKLab-Helligkeit. */
export function isDark(hex: string): boolean {
  return toOklab(hex)[0] < 0.62;
}
