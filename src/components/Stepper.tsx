import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

export const STEPPER_HOEHE = 36;

type Props = {
  kapitel: { id: string; title: string }[];
  aktuell: number;
  onSprung: (index: number) => void;
};

/** Kapitel-Stepper in der klebenden Leiste. Die Pfeile springen zur vorigen
 *  oder nächsten Kapitelüberschrift, mehr nicht; der Name ist kein Knopf.
 *  Probe Formsprache, vorläufig (17.09.2026). */
export function Stepper({ kapitel, aktuell, onSprung }: Props) {
  const vorher = kapitel[aktuell - 1];
  const nachher = kapitel[aktuell + 1];
  const titel = kapitel[aktuell]?.title ?? "";

  return (
    <div className="grid h-full grid-cols-[2.75rem_1fr_2.75rem] items-center">
      <Pfeil richtung="zurück" ziel={vorher?.title} onClick={() => onSprung(aktuell - 1)} />
      <p className="truncate px-1 text-center text-sm" title={titel} aria-live="polite">
        <span className="font-semibold text-ink">{titel}</span>{" "}
        <span className="text-ink-muted tabular-nums">
          {aktuell + 1} von {kapitel.length}
        </span>
      </p>
      <Pfeil richtung="vor" ziel={nachher?.title} onClick={() => onSprung(aktuell + 1)} />
    </div>
  );
}

function Pfeil({ richtung, ziel, onClick }: { richtung: "zurück" | "vor"; ziel?: string; onClick: () => void }) {
  const aus = !ziel;
  const Icon = richtung === "vor" ? CaretRight : CaretLeft;
  return (
    <button
      type="button"
      onClick={aus ? undefined : onClick}
      aria-disabled={aus}
      tabIndex={aus ? -1 : undefined}
      aria-label={aus ? (richtung === "vor" ? "Kein weiteres Kapitel" : "Kein voriges Kapitel") : `${richtung === "vor" ? "Nächstes" : "Voriges"} Kapitel: ${ziel}`}
      className={cn(
        "grid h-full w-full place-items-center",
        aus ? "cursor-default text-[#bfb9ab]" : "text-ink-soft hover:bg-ink-line/50 hover:text-ink",
      )}
    >
      <Icon size={18} weight="bold" aria-hidden />
    </button>
  );
}
