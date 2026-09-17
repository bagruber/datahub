type Props = { label: string; value: string; sub?: string };

/** Kennzahl: die Zahl zuerst, Beschriftung darunter in Satzschreibung. */
export function Stat({ label, value, sub }: Props) {
  return (
    <div className="rounded-lg bg-white border border-ink-line p-4 sm:p-5 shadow-soft">
      <p className="font-display text-3xl sm:text-4xl font-semibold leading-tight text-red-700 lining-nums tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-sm text-ink-soft">{label}</p>
      {sub && <p className="text-sm text-ink-muted">{sub}</p>}
    </div>
  );
}
