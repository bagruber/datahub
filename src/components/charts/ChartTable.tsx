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
    <table className="sr-only">
      {caption && <caption>{caption}</caption>}
      <thead>
        <tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => <td key={j}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
