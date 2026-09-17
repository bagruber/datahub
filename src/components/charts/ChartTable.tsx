type Props = {
  /** Optional caption (typically the chart title). */
  caption?: string;
  headers: ReadonlyArray<string>;
  rows: ReadonlyArray<ReadonlyArray<string | number>>;
};

/** Zahlen des Diagramms als Tabelle. Probe Diagramme, vorläufig (18.09.2026):
 *  aufklappbar für alle statt nur für Screenreader, wie im Haushalt. Zugeklappt
 *  bleibt der Inhalt im DOM und damit für Screenreader erreichbar. */
export function ChartTable({ caption, headers, rows }: Props) {
  if (rows.length === 0) return null;
  return (
    <details className="mt-3">
      <summary className="w-fit cursor-pointer text-xs text-ink-muted hover:text-ink">
        Daten als Tabelle
      </summary>
      {/* Der Rahmen hält die Breite: eine Tabelle mit vielen Spalten schiebt
          sonst die ganze Seite auf. */}
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="border-b border-ink-line text-left text-ink-muted">
            <tr>
              {headers.map((h, i) => (
                <th key={h} className={`py-1 pr-3 font-medium ${i > 0 ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-ink-line/50 last:border-0">
                {row.map((cell, j) => (
                  <td key={j} className={`py-1 pr-3 ${j > 0 ? "text-right tabular-nums" : ""}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
