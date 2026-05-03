type Props = { label: string; value: string; sub?: string };

export function Stat({ label, value, sub }: Props) {
  return (
    <div className="rounded-lg bg-white border border-ink-line p-4 sm:p-5 shadow-soft">
      <p className="eyebrow">{label}</p>
      <p className="mt-1 font-display text-3xl sm:text-4xl text-red-700">{value}</p>
      {sub && <p className="mt-1 text-sm text-ink-muted">{sub}</p>}
    </div>
  );
}
