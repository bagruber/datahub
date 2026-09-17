import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowSquareOut, Bug, CaretDown, Code, Envelope, Info, Scroll, X } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { RainbowStripe } from "./RainbowStripe";
import { Rose } from "./ui";

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    "flex items-center whitespace-nowrap border-b-2 pt-0.5 transition-colors",
    isActive ? "border-red-700 font-semibold text-red-700" : "border-transparent text-ink-soft hover:text-ink",
  );
}

/** Variante A ab lg: Stripe an der Oberkante, moosburg.eu, Logo-Platz mit
 *  Werkzeugname, Navigation, „Über das Projekt“. Darunter eine App-Leiste mit
 *  Rosen-Knopf, der dasselbe Panel als Blatt öffnet. Kein backdrop-blur: Er
 *  machte den Kopf zum Bezugsrahmen des fest positionierten Blatts. */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-line bg-cream">
      <RainbowStripe />
      <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-5 px-4 sm:px-6 lg:h-16">
        <a
          href="https://moosburg.eu/"
          className="hidden shrink-0 items-center gap-2 text-[15px] text-ink-soft hover:text-ink lg:flex"
        >
          <Rose className="h-5 w-5 bg-red-700" />
          moosburg.eu
        </a>
        <span aria-hidden className="hidden h-7 w-px bg-ink-line lg:block" />
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <Rose className="hidden h-7 w-7 bg-red-700 lg:inline-block" />
          <span className="font-display text-xl font-semibold">Data Hub</span>
        </Link>

        <nav aria-label="Hauptnavigation" className="ml-auto hidden h-full items-stretch gap-5 text-[15px] lg:flex">
          <NavLink to="/" end className={navClass}>
            Übersicht
          </NavLink>
          <Link to="/#karten" className={navClass({ isActive: false })}>
            Karten
          </Link>
          <NavLink to="/about" className={navClass}>
            Über die Daten
          </NavLink>
        </nav>
        <span aria-hidden className="hidden h-7 w-px bg-ink-line lg:block" />

        <div className="ml-auto lg:ml-0">
          <UeberDasProjekt />
        </div>
      </div>
    </header>
  );
}

const linkZeile = "flex items-center gap-3 rounded-md px-2 py-2 hover:bg-cream-dark";

/** Disclosure, kein Menü: Knopf mit aria-expanded, Esc und Klick außerhalb
 *  schließen, der Fokus kehrt zum Knopf zurück. Ab lg Panel unter dem Knopf,
 *  darunter Blatt von unten. */
function UeberDasProjekt() {
  const [offen, setOffen] = useState(false);
  const knopf = useRef<HTMLButtonElement>(null);
  const bereich = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const { pathname, hash } = useLocation();
  useEffect(() => setOffen(false), [pathname, hash]);

  useEffect(() => {
    if (!offen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOffen(false);
        knopf.current?.focus();
      }
    };
    const onDown = (e: MouseEvent) => {
      if (!bereich.current?.contains(e.target as Node)) setOffen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [offen]);

  return (
    <div ref={bereich} className="relative">
      <button
        ref={knopf}
        type="button"
        aria-expanded={offen}
        aria-controls={panelId}
        onClick={() => setOffen((o) => !o)}
        className="flex h-10 items-center gap-1.5 rounded-lg px-2 text-[15px] text-ink-soft hover:bg-cream-dark hover:text-ink"
      >
        <Rose className="h-7 w-7 bg-red-700 lg:hidden" />
        <Info size={18} aria-hidden className="hidden lg:block" />
        {/* Zwei Spannen statt lg:not-sr-only: Die eigene .sr-only in index.css
            liegt außerhalb der Tailwind-Layer und überstimmt die Variante. */}
        <span className="sr-only lg:hidden">Über das Projekt</span>
        <span className="hidden whitespace-nowrap lg:inline">Über das Projekt</span>
        <CaretDown size={14} aria-hidden className={cn("hidden transition-transform lg:block", offen && "rotate-180")} />
      </button>

      {offen && (
        <>
          <div aria-hidden className="fixed inset-0 z-40 bg-ink/20 lg:hidden" onClick={() => setOffen(false)} />
          <div
            id={panelId}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-xl border border-ink-line bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-lift lg:absolute lg:inset-x-auto lg:bottom-auto lg:right-0 lg:top-full lg:mt-2 lg:w-96 lg:rounded-xl lg:pb-5"
          >
            <div className="flex items-start justify-between gap-3">
              <a href="https://moosburg.eu/" className={cn(linkZeile, "-ml-2 font-semibold text-red-700")}>
                <Rose className="h-[18px] w-[18px] bg-red-700" />
                moosburg.eu, alle Projekte
              </a>
              <button
                type="button"
                onClick={() => {
                  setOffen(false);
                  knopf.current?.focus();
                }}
                aria-label="Schließen"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-cream-dark lg:hidden"
              >
                <X size={20} aria-hidden />
              </button>
            </div>
            <p className="mt-3 font-display text-lg font-semibold">Data Hub Moosburg</p>
            <p className="mt-1 text-sm text-ink-soft">
              Umfragen, amtliche Statistik und Karten aus Moosburg, interaktiv aufbereitet.
            </p>
            <p className="mt-3 rounded-md bg-cream-dark px-3 py-2 text-sm text-ink-soft">
              Privates Projekt, kein Auftritt der Stadt. Verbindlich sind die jeweiligen Quellen.
            </p>
            <ul className="mt-3 text-[15px]">
              <li>
                <Link to="/about" className={linkZeile}>
                  <Scroll size={18} aria-hidden className="text-ink-muted" />
                  Über die Daten
                </Link>
              </li>
              <li>
                <a href="https://moosburg.eu/#impressum" className={linkZeile}>
                  <Envelope size={18} aria-hidden className="text-ink-muted" />
                  Impressum und Kontakt
                </a>
              </li>
              <li>
                <a href="https://github.com/bagruber/datahub/issues" target="_blank" rel="noreferrer" className={linkZeile}>
                  <Bug size={18} aria-hidden className="text-ink-muted" />
                  Fehler melden
                  <ArrowSquareOut size={14} aria-hidden className="text-ink-muted" />
                </a>
              </li>
              <li>
                <a href="https://github.com/bagruber/datahub" target="_blank" rel="noreferrer" className={linkZeile}>
                  <Code size={18} aria-hidden className="text-ink-muted" />
                  Quellcode
                  <ArrowSquareOut size={14} aria-hidden className="text-ink-muted" />
                </a>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
