import { useEffect, useRef, useState, type ReactNode } from "react";
import { Stepper, STEPPER_HOEHE } from "./Stepper";

type Kapitel = { id: string; title: string };

export const kapitelAnker = (id: string) => `kapitel-${id}`;

const pixel = (name: string) =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;

/** Die klebende Leiste der Datensatzseiten: oben der Stepper, darunter die
 *  Filter. Nicht zwei klebende Ebenen, sondern eine. */
export function Leiste({ kapitel, children }: { kapitel: Kapitel[]; children?: ReactNode }) {
  const [aktuell, setAktuell] = useState(0);
  const [klebt, setKlebt] = useState(false);
  const marke = useRef<HTMLDivElement>(null);
  const inhalt = useRef<HTMLDivElement>(null);
  const kapitelRef = useRef(kapitel);
  kapitelRef.current = kapitel;
  const mitStepper = kapitel.length > 1;
  const schluessel = kapitel.map((k) => k.id).join("|");

  // Unterkante der Leiste samt Stepper: dieselbe Marke für Anker und Stepper,
  // damit die Leiste keine Überschrift verdeckt.
  useEffect(() => {
    const root = document.documentElement;
    const setzen = () => {
      const h = (inhalt.current?.offsetHeight ?? 0) + (mitStepper ? STEPPER_HOEHE : 0);
      root.style.setProperty("--leiste-unten", `${pixel("--kopf-hoehe") + h}px`);
    };
    setzen();
    const ro = new ResizeObserver(setzen);
    if (inhalt.current) ro.observe(inhalt.current);
    window.addEventListener("resize", setzen);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setzen);
      root.style.removeProperty("--leiste-unten");
    };
  }, [mitStepper]);

  useEffect(() => {
    if (!mitStepper) return;
    let frame = 0;
    const messen = () => {
      frame = 0;
      const kopf = pixel("--kopf-hoehe");
      const unten = pixel("--leiste-unten");
      setKlebt((marke.current?.getBoundingClientRect().top ?? 1) <= kopf);
      const liste = kapitelRef.current;
      let i = 0;
      liste.forEach((k, n) => {
        const el = document.getElementById(kapitelAnker(k.id));
        if (el && el.getBoundingClientRect().top <= unten + 24) i = n;
      });
      const amEnde = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      setAktuell(amEnde ? liste.length - 1 : i);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(messen);
    };
    messen();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [mitStepper, schluessel]);

  if (!mitStepper && !children) return null;
  const stepperZeigen = mitStepper && klebt;

  return (
    <>
      <div ref={marke} aria-hidden />
      <div
        className="sticky top-[var(--kopf-hoehe)] z-20 -mx-[calc(50vw-50%)] bg-cream px-[calc(50vw-50%)]"
        // Der Stepper kommt erst, wenn die Leiste klebt. Der negative Rand hält
        // den Fluss darunter gleich, sonst spränge der Inhalt um seine Höhe.
        style={stepperZeigen ? { marginBottom: -STEPPER_HOEHE } : undefined}
      >
        {stepperZeigen && (
          // Höhe samt Linie fest, damit der negative Rand genau aufgeht.
          <div className="-mx-[calc(50vw-50%)] border-b border-ink-line bg-cream-dark px-[calc(50vw-50%)]" style={{ height: STEPPER_HOEHE }}>
            <Stepper
              kapitel={kapitel}
              aktuell={aktuell}
              onSprung={(n) => document.getElementById(kapitelAnker(kapitel[n].id))?.scrollIntoView({ block: "start" })}
            />
          </div>
        )}
        {children && (
          <div ref={inhalt} className="-mx-[calc(50vw-50%)] border-b border-ink-line px-[calc(50vw-50%)]">
            {children}
          </div>
        )}
      </div>
    </>
  );
}
