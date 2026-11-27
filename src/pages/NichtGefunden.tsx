import { Link } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";
import { useTitel } from "@/lib/useTitel";

/** Unbekannte Adresse: sagen, dass es sie nicht gibt, statt stumm auf die
 *  Startseite zu springen. */
export function NichtGefunden() {
  useTitel("Seite nicht gefunden");
  return (
    <div className="mx-auto max-w-screen-md px-4 sm:px-6 py-16">
      <h1 className="headline text-display-2">Seite nicht gefunden</h1>
      <p className="mt-4 text-ink-soft">Unter dieser Adresse gibt es im Data Hub nichts.</p>
      <Link to="/" className="inline-flex items-center gap-1.5 mt-6 text-red-700 underline decoration-dotted">
        <ArrowLeft aria-hidden className="shrink-0" />
        Zur Übersicht
      </Link>
    </div>
  );
}
