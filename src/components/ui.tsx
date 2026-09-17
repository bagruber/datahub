import type { ReactNode } from "react";
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
