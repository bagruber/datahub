// Studie: ein Bericht aus Kapiteln und Blöcken statt eines Datensatzes mit
// Records. Zahlen stehen im Text nur als Platzhalter {{schluessel}} und kommen
// aus `werte`; die der Befragung schreibt scripts/build-studie-website.mjs.

export type Wert = { wert: string; quelle: string };

export type Funktion = {
  id: string;
  label: string;
  /** Je Aussage die Zahl der Antworten auf den Stufen 1 bis 5. */
  items: Record<string, number[]>;
  umsetzung: { ja: number; nein: number };
};

export type Block =
  | { typ: "text"; text: string }
  | { typ: "befunde"; eintraege: { kern: string; text: string }[] }
  | { typ: "teilprojekte"; eintraege: { titel: string; frage: string; kapitel: string }[] }
  | { typ: "hinweis"; titel: string; text: string }
  | { typ: "zeitleiste"; eintraege: { wann: string; was: string }[] }
  | { typ: "methoden"; zeilen: { teil: string; methode: string; wer: string }[] }
  | {
      typ: "verteilung";
      titel: string;
      basis: string;
      quelle: string;
      links: string;
      rechts: string;
      /** Zählungen je Stufe 1 bis 5, aus einer Abbildung abgelesen; `mittel` nennt den Wert-Schlüssel zur Gegenprobe. */
      zeilen: { label: string; pole: string; zaehlung: number[]; mittel: string }[];
    }
  | {
      typ: "ranglisten";
      eintraege: {
        titel: string;
        basis: string;
        quelle: string;
        zeilen: { label: string; wert: number }[];
      }[];
    }
  | { typ: "zitate"; herkunft: string; eintraege: string[] }
  | {
      typ: "personas";
      eintraege: {
        name: string;
        steckbrief: string;
        beduerfnis: string;
        zitat: string;
        nutzung: string;
        sucht: string[];
        wuenscht: string[];
      }[];
    }
  | { typ: "spalten"; titel: string; eintraege: { kopf: string; punkte: string[] }[] }
  | {
      typ: "diagramm";
      art: "umsetzung" | "likert";
      titel: string;
      basis: string;
      item?: string;
      umkehren?: boolean;
      links?: string;
      rechts?: string;
    }
  | { typ: "liste"; titel: string; eintraege: string[] }
  | { typ: "aufklappbar"; titel: string; bloecke: Block[] };

export type Kapitel = { id: string; titel: string; zeile?: string; bloecke: Block[] };

export type Studie = {
  kind: "studie";
  meta: { id: string; title: string; year: number; n: number; description: string };
  zeile: string;
  kennzahlen: { wert: string; label: string }[];
  werte: Record<string, Wert>;
  daten: { befragung: { n: number; funktionen: Funktion[] } };
  kapitel: Kapitel[];
};

const PLATZHALTER = /\{\{([\w.-]+)\}\}/g;

/** Alle Schlüssel, die ein Text verlangt. */
export function platzhalter(text: string): string[] {
  return [...text.matchAll(PLATZHALTER)].map((m) => m[1]);
}

/** Setzt die Werte ein. Ein fehlender Schlüssel bleibt sichtbar stehen,
 *  statt still zu verschwinden; der Test fängt ihn vorher ab. */
export function fuelle(text: string, werte: Record<string, Wert>): string {
  return text.replace(PLATZHALTER, (roh, k: string) => werte[k]?.wert ?? roh);
}

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Inline-Markdown nach dem Einsetzen: **fett** und [Text](https://…).
 *  Quelle ist die eigene JSON-Datei, trotzdem wird zuerst maskiert. */
export function inline(text: string, werte: Record<string, Wert>): string {
  return escape(fuelle(text, werte))
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(
      /\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g,
      '<a href="$2" class="text-red-700 underline decoration-red-700/30 underline-offset-4 hover:decoration-red-700">$1</a>',
    );
}
