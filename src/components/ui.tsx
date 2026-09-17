import type { CSSProperties, ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

const KLECKS_PFAD =
  "M25 3.5c8.6.3 17.8 5.2 19.2 14.6 1.5 9.8-4 21.5-14.4 24.9C19.7 46.3 6.6 41.5 4.3 30.7 2 19.6 12.2 3 25 3.5z";
// Nachbarn unterscheiden sich durch Drehung des einen Pfads, nie durch einen neuen.
const KLECKS_DREHUNG = [undefined, "rotate(70deg)", "rotate(150deg) scaleX(-1)"];

/** Farbklecks mit Icon. Dekorativ, die Bedeutung trägt der Text daneben. */
export function Klecks({ flaeche, text, icon: Icon, dicht, variante = 0 }: {
  flaeche: string;
  text: string;
  icon: Icon;
  dicht?: boolean;
  variante?: number;
}) {
  const size = dicht ? 38 : 46;
  return (
    <span
      aria-hidden
      className="relative inline-grid shrink-0 place-items-center"
      style={{ width: size, height: size, color: text }}
    >
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full" style={{ transform: KLECKS_DREHUNG[variante % 3] }}>
        <path d={KLECKS_PFAD} fill={flaeche} />
      </svg>
      <Icon size={dicht ? 18 : 22} className="relative" />
    </span>
  );
}

/** Kategoriezeile: Icon plus Name, 14 px, 600, in der Farbe aus className oder farbe.
 *  Ohne Icon, wo ein Klecks daneben es schon zeigt. */
export function KategorieZeile({ icon: Icon, farbe, className, children }: {
  icon?: Icon;
  farbe?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", className)}
      style={farbe ? { color: farbe } : undefined}
    >
      {Icon && <Icon size={16} aria-hidden className="shrink-0" />}
      {children}
    </span>
  );
}

/** Kennzahl: die Zahl zuerst, Beschriftung darunter in Satzschreibung. Lining
 *  und gleich breite Ziffern, damit Nachbarn auf einer Grundlinie stehen. */
export function Kennzahl({ wert, label, className, labelClassName }: {
  wert: ReactNode;
  label: ReactNode;
  className?: string;
  labelClassName?: string;
}) {
  return (
    <div>
      <div className={cn("whitespace-nowrap font-display text-3xl font-semibold leading-tight lining-nums tabular-nums", className)}>
        {wert}
      </div>
      <div className={cn("mt-1 text-sm text-ink-muted", labelClassName)}>{label}</div>
    </div>
  );
}

/** CSS-Maske für eine Datei unter public/, damit die Form eine Token-Farbe annimmt. */
function maske(datei: string, position: string): CSSProperties {
  const url = `url(${import.meta.env.BASE_URL}${datei})`;
  return {
    maskImage: url,
    WebkitMaskImage: url,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskPosition: position,
    WebkitMaskPosition: position,
  };
}

/** Die Moosburger Rose, gefärbt über die Hintergrundklasse (etwa bg-red-700). */
export function Rose({ className }: { className?: string }) {
  return <span aria-hidden className={cn("inline-block shrink-0", className)} style={maske("logo.svg", "center")} />;
}

/** Überschrift mit dem Handschrift-Wort groß und durchscheinend dahinter. Das
 *  Wort ist aria-hidden, der zugängliche Name bleibt der Titel. */
export function SeitenTitel({ script, as: Tag = "h1", className, scriptClassName, children }: {
  script?: string;
  as?: "h1" | "h2";
  className?: string;
  scriptClassName?: string;
  children: ReactNode;
}) {
  return (
    // Die Handschrift reicht weit in den Titel; der Abstand oben hält sie frei
    // von allem, was darüber steht.
    <Tag className={cn("headline relative", script && "mt-[0.85em]", className)}>
      {script && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -left-[0.05em] -top-[0.42em] origin-bottom-left -rotate-6 select-none whitespace-nowrap font-script text-[1.45em] font-normal leading-none text-gold-500/55",
            scriptClassName,
          )}
        >
          {script}
        </span>
      )}
      <span className="relative">{children}</span>
    </Tag>
  );
}

/** Kopf der Übersicht. Ab xl die Federzeichnung als goldene Maske, rechts unten
 *  angeschnitten. Beschnitten wird nur ihr Rahmen, nie der Titel. */
export function SeitenKopf({ titel, script, zeichnung, className, children }: {
  titel: ReactNode;
  script: string;
  zeichnung: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <header className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-hidden xl:block">
        <div
          className="absolute -bottom-24 -right-28 h-[480px] w-[715px] select-none bg-gold-500 opacity-30"
          style={maske(zeichnung, "right bottom")}
        />
      </div>
      <Rose className="relative mb-2 hidden h-16 w-16 bg-red-700 sm:block" />
      <SeitenTitel script={script} className={className}>
        {titel}
      </SeitenTitel>
      {children && <div className="relative mt-5 max-w-xl text-lg text-ink-soft">{children}</div>}
    </header>
  );
}
