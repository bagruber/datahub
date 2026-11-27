import { useTitel } from "@/lib/useTitel";

export function About() {
  useTitel("Über die Daten");
  return (
    <div className="mx-auto max-w-screen-md px-4 sm:px-6 py-10 sm:py-16">
      <h1 className="headline text-display-2 mb-6">Data Hub Moosburg</h1>
      <div className="prose prose-stone max-w-none text-ink-soft space-y-4">
        <p>
          Diese Seite bündelt Umfragen, Statistik und Wahlen zu Moosburg an der Isar.
          Sie ist ein bürgerschaftliches Projekt, kein Auftritt der Stadt; amtlich ist{" "}
          <a href="https://www.moosburg.de" className="text-red-700 underline decoration-dotted">moosburg.de</a>.
          Ziel ist Transparenz: was wurde gefragt, wer hat geantwortet, und was sagen
          die Zahlen.
        </p>
        <p>
          Die Auswertungen sind bewusst zurückhaltend gestaltet — eine Frage, eine
          Grafik, ein Gedanke.
        </p>
      </div>
    </div>
  );
}
