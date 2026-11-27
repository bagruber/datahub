import { useEffect, useRef } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

declare global {
  interface Window {
    /** Aus /assets/zaehler.js von moosburg.eu; auf GitHub Pages nicht vorhanden. */
    zaehl?: (pfad: string) => void;
  }
}

export function Layout() {
  // Routenwechsel zählen. Den Einstieg zählt zaehler.js beim Laden selbst,
  // deshalb erst ab dem ersten Wechsel. Der Pfad aus window.location, nicht aus
  // dem Router: Nur er enthält den Basispfad, der /data/ von /datahub/ trennt.
  // Keine Sitzungs-ID im Browser, siehe PLATTFORM.md.
  const { pathname } = useLocation();
  const zuletzt = useRef(window.location.pathname);
  useEffect(() => {
    const pfad = window.location.pathname;
    if (pfad === zuletzt.current) return;
    zuletzt.current = pfad;
    window.zaehl?.(pfad);
  }, [pathname]);

  return (
    <div className="min-h-dvh flex flex-col bg-cream text-ink">
      {/* Erst bei Tastaturfokus sichtbar: an Kopf und Navigation vorbei. Über
          den Rand geschoben statt sr-only, weil das eigene .sr-only in index.css
          ohne Layer jede focus:-Utility überstimmt. */}
      <a
        href="#main"
        className="fixed left-4 top-4 z-50 -translate-y-20 rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-700 shadow-lift focus:translate-y-0"
      >
        Zum Inhalt
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
