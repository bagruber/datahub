export function About() {
  return (
    <div className="mx-auto max-w-screen-md px-4 sm:px-6 py-10 sm:py-16">
      <p className="eyebrow mb-3">Über</p>
      <h1 className="headline text-display-2 mb-6">Datenhub Moosburg</h1>
      <div className="prose prose-stone max-w-none text-ink-soft space-y-4">
        <p>
          Diese Seite bündelt Bürgerbefragungen und offene Daten der Stadt Moosburg
          an der Isar. Ziel ist Transparenz: was wurde gefragt, wer hat geantwortet,
          und was sagen die Zahlen.
        </p>
        <p>
          Die Auswertungen sind bewusst zurückhaltend gestaltet — eine Frage, eine
          Grafik, ein Gedanke. Wer tiefer einsteigen möchte, kann jeden Datensatz
          herunterladen oder im Methodik-Hinweis nachlesen, wie die Befragung
          durchgeführt wurde.
        </p>
      </div>
    </div>
  );
}
