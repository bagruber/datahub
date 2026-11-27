import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Props = { explanation: string; label?: string };

const POP_W = 320;
const MARGIN = 12;
const GAP = 8;

export function HelpIcon({ explanation, label = "Erklärung" }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; arrow: "right" | "left" | "below" }>({
    left: 0,
    top: 0,
    arrow: "right",
  });
  const id = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Compute popover position so it never clips off-viewport.
  // Preferred order: left of icon → right of icon → below icon (clamped).
  useLayoutEffect(() => {
    if (!open || !btnRef.current || !popRef.current) return;
    const btn = btnRef.current.getBoundingClientRect();
    const pop = popRef.current;
    const popH = pop.offsetHeight || 100;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const popW = Math.min(POP_W, vw - MARGIN * 2);

    let left: number;
    let top: number;
    let arrow: "right" | "left" | "below";

    if (btn.left - popW - GAP >= MARGIN) {
      left = btn.left - popW - GAP;
      top = btn.top + btn.height / 2 - popH / 2;
      arrow = "right";
    } else if (btn.right + GAP + popW <= vw - MARGIN) {
      left = btn.right + GAP;
      top = btn.top + btn.height / 2 - popH / 2;
      arrow = "left";
    } else {
      left = Math.max(MARGIN, Math.min(btn.right - popW, vw - popW - MARGIN));
      top = btn.bottom + GAP;
      arrow = "below";
    }

    top = Math.max(MARGIN, Math.min(top, vh - popH - MARGIN));
    setPos({ left, top, arrow });
  }, [open, explanation]);

  return (
    <span ref={wrapRef} className="relative inline-block align-middle">
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={label}
        title={explanation}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-grid place-items-center w-6 h-6 rounded-full text-xs font-bold transition-colors",
          open
            ? "bg-red-500 text-cream"
            : "bg-cream-dark text-ink-soft hover:bg-gold-200 hover:text-ink",
        )}
      >
        ?
      </button>
      {open && (
        <span
          ref={popRef}
          id={id}
          role="tooltip"
          style={{
            position: "fixed",
            left: pos.left,
            top: pos.top,
            width: `min(${POP_W}px, calc(100vw - ${MARGIN * 2}px))`,
          }}
          className="z-50 rounded-lg bg-white border border-ink-line shadow-lift p-3 text-sm text-ink leading-relaxed"
          data-arrow={pos.arrow}
        >
          {explanation}
        </span>
      )}
    </span>
  );
}

export const HELP: Record<string, string> = {
  likert6:
    "Jede Zeile ist ein Merkmal. Schlechte Bewertungen (1–3, rot) wachsen nach links, gute (4–6, blau) nach rechts. Außen stehen die Anteile beider Seiten, darunter der Mittelwert.",
  likert5:
    "Jede Zeile ist ein Merkmal. Ablehnung (1–2, rot) wächst nach links, Zustimmung (4–5, blau) nach rechts, die neutrale 3 liegt grau in der Mitte. Außen stehen die Anteile beider Seiten, darunter der Mittelwert.",
  price:
    "Günstig wächst nach links, teuer nach rechts. Das ist keine Wertung, deshalb Gold statt Rot und Blau: hell für günstig, dunkel für teuer.",
  bar_v:
    "Senkrechte Balken — bewährt für zeitliche oder geordnete Reihen wie Wochentage oder Uhrzeiten. Die Reihenfolge entspricht dem Sachzusammenhang, nicht der Häufigkeit.",
  line_series:
    "Liniendiagramm mit einer oder mehreren Reihen über die Zeit. Jede Linie ist eine eigene Kategorie, gemeinsam aufgetragen über die Jahre. Hover zeigt den genauen Wert.",
  stacked_column:
    "Gestapelte Säulen — der Gesamtbalken pro Jahr besteht aus mehreren Teilen, die zusammen 100 % des Werts ergeben. Geeignet für Aufteilungen, bei denen sich die Teile zur Summe ergänzen (z. B. Beschäftigte nach Branche).",
  pyramid:
    "Bevölkerungspyramide. Links und rechts vom Mittelpunkt stehen die zwei Gruppen (etwa männlich und weiblich), nach oben hin steigt das Alter. Symmetrische Pyramiden sind ausgeglichen, einseitige zeigen Schieflagen.",
  diverging3:
    "Links die eine Wahl, rechts die andere, grau in der Mitte die Unentschiedenen. Je weiter der Balken zu einer Seite reicht, desto mehr haben sie gewählt.",
  radar:
    "Spinnendiagramm. Jede Achse ist eine Dimension; die farbige Fläche zeigt, wie eine Innovation auf allen Dimensionen abschneidet. Größer und weiter außen = besser.",
  correlation:
    "Jede Zelle zeigt, wie stark zwei Bewertungen zusammenhängen: −1 gegenläufig (rot), 0 kein Zusammenhang (hell), +1 gleichgerichtet (blau).",
  venn2:
    "Flächentreues Venn-Diagramm: jede Kreisfläche ist proportional zur Gruppengröße, die Schnittfläche zur Anzahl gemeinsamer Antworten. Hover über Kreis, Schnittmenge oder Legende zeigt Detailwerte.",
  venn3:
    "Drei-Kreis-Venn: Kreisflächen entsprechen den Gruppengrößen, paarweise Schnittflächen den gemeinsamen Antworten. Die zentrale Schnittmenge zeigt Befragte, die zu allen drei Gruppen zählen. Hover hebt die jeweilige Gruppe hervor.",
  hexmap:
    "Hexagon-Kartogramm: jede Gemeinde bekommt so viele Sechsecke, wie ihr Rat Sitze hat. Die Fläche zeigt damit das Gewicht des Gremiums statt der Quadratkilometer — Freising ist hier viermal so groß wie Wang, nicht dreimal. Die Umrisse des Landkreises bleiben trotzdem erkennbar. Drei Ansichten teilen dieselbe Aufteilung, es wechselt nur die Farbe.",
  gremium:
    "Ein Rat als Wabe: ein Sechseck je Sitz, gefärbt nach Fraktion. Jedes Feld steht für eine Person — beim Zeigen erscheint ihr Name. Die Fraktionen liegen als zusammenhängende Klumpen, damit sich ihre Größe abzählen lässt.",
  likert5_group:
    "Je Funktion ein eigener Block mit denselben Fragen. Ablehnung wächst nach links, Zustimmung nach rechts, neutral liegt in der Mitte.",
};
