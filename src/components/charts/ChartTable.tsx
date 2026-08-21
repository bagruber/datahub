type Props = {
  /** Optional caption (typically the chart title). */
  caption?: string;
  headers: ReadonlyArray<string>;
  rows: ReadonlyArray<ReadonlyArray<string | number>>;
};

/** Visually-hidden data table — duplicates a chart's contents for screen
 *  readers without affecting the layout. */
export function ChartTable({ caption, headers, rows }: Props) {
  return (
    // sr-only sitzt auf dem Rahmen, nicht auf der Tabelle: eine Tabelle wächst
    // trotz width:1px auf ihre Inhaltsbreite. Bei dreißig Spalten schiebt sie
    // die Seite auf das Zweieinhalbfache des Fensters, obwohl niemand sie sieht.
    // Ein div hält die Breite und schneidet den Überhang ab.
    <div className="sr-only">
      <table>
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
