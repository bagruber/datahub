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
    "Divergierender Stapelbalken: jede Zeile ist ein Merkmal. Schlechte Bewertungen (1–3, rot) wachsen nach links, gute (4–6, grün) nach rechts. Je weiter ein Balken vom Mittel weg liegt, desto eindeutiger die Tendenz.",
  likert5:
    "Divergierender Stapelbalken auf einer 1–5-Skala. Negative Bewertungen (1–2, rot) wachsen nach links, positive (4–5, grün) nach rechts; die neutrale Mitte (3) überlagert die Null-Linie hälftig.",
  price:
    "Preisempfinden statt Qualitätsbewertung: niedrige Werte stehen für „günstig“, hohe für „teuer“. Es gibt kein gut/schlecht — die Skala beschreibt nur die Richtung. Deshalb ein neutraler Blau-Verlauf (hell = günstig, dunkel = teuer) ohne Rot/Grün.",
  bar_v:
    "Senkrechte Balken — bewährt für zeitliche oder geordnete Reihen wie Wochentage oder Uhrzeiten. Die Reihenfolge entspricht dem Sachzusammenhang, nicht der Häufigkeit.",
  diverging3:
    "Divergierender Balken: die linke und rechte Option streben nach außen, die unentschlossene Mitte überlagert die Null-Linie hälftig. Hängt der Balken stark nach einer Seite, dominiert diese Option.",
  radar:
    "Spinnendiagramm. Jede Achse ist eine Dimension; die farbige Fläche zeigt, wie eine Innovation auf allen Dimensionen abschneidet. Größer und weiter außen = besser.",
  correlation:
    "Korrelations-Heatmap. Jede Zelle zeigt, wie stark zwei Bewertungen zusammenhängen — von −1 (gegensätzlich, dunkelrot) über 0 (kein Zusammenhang, hell) bis +1 (gleichgerichtet, dunkelgrün). Die Diagonale ist immer 1.",
  venn2:
    "Flächentreues Venn-Diagramm: jede Kreisfläche ist proportional zur Gruppengröße, die Schnittfläche zur Anzahl gemeinsamer Antworten. Hover über Kreis, Schnittmenge oder Legende zeigt Detailwerte.",
  venn3:
    "Drei-Kreis-Venn: Kreisflächen entsprechen den Gruppengrößen, paarweise Schnittflächen den gemeinsamen Antworten. Die zentrale Schnittmenge zeigt Befragte, die zu allen drei Gruppen zählen. Hover hebt die jeweilige Gruppe hervor.",
  likert5_group:
    "Pro Innovation ein eigener divergierender Stapelbalken. Negative Bewertungen wachsen nach links, positive nach rechts; die neutrale Mitte überlagert die Null-Linie. So lassen sich Innovationen direkt vergleichen.",
};
