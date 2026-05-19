export function Footer() {
  return (
    <footer className="border-t border-ink-line mt-16">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-8 grid gap-3 sm:grid-cols-2 text-sm text-ink-soft">
        <p>
          Data Hub der Stadt Moosburg an der Isar — Bürgerbefragungen und offene Daten.
        </p>
        <p className="sm:text-right">
          <a href="https://moosburg.org" className="underline decoration-dotted hover:decoration-solid">
            moosburg.org
          </a>
        </p>
      </div>
    </footer>
  );
}
