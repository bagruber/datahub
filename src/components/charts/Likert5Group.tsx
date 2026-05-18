import { useMemo } from "react";
import { DivergingLikert } from "./DivergingLikert";
import type { Codebook, Dataset } from "@/lib/data";

type Innovation = { key: string; name: string; sources: string[] };

type Props = {
  records: Dataset["records"];
  codebook: Codebook;
  dimLabels: string[];
  invertedDims: number[];
  innovations: Innovation[];
  title?: string;
  endpoints?: { left: string; right: string };
};

/** Per-innovation grid of compact 5-point Likerts. Inversion (e.g. "Bedenken"
 *  where high = bad) is applied by index so the chart reads consistently as
 *  "higher = better" across all dimensions. */
export function Likert5Group({
  records,
  codebook,
  dimLabels,
  invertedDims,
  innovations,
  endpoints,
}: Props) {
  const left = endpoints?.left ?? "stimme nicht zu";
  const right = endpoints?.right ?? "stimme voll zu";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {innovations.map((inn) => (
        <InnovationPanel
          key={inn.key}
          name={inn.name}
          items={inn.sources.map((source, i) => ({ source, label: dimLabels[i] ?? `Dim ${i + 1}` }))}
          records={records}
          codebook={codebook}
          invertedDims={invertedDims}
          left={left}
          right={right}
        />
      ))}
    </div>
  );
}

function InnovationPanel({
  name,
  items,
  records,
  codebook,
  invertedDims,
  left,
  right,
}: {
  name: string;
  items: { source: string; label: string }[];
  records: Dataset["records"];
  codebook: Codebook;
  invertedDims: number[];
  left: string;
  right: string;
}) {
  const invertedSet = useMemo(() => new Set(invertedDims), [invertedDims]);
  const invertItem = useMemo(() => (i: number) => invertedSet.has(i), [invertedSet]);

  return (
    <figure className="rounded-lg border border-ink-line bg-cream/40 p-3">
      <figcaption className="font-semibold text-ink mb-2 text-sm sm:text-base">{name}</figcaption>
      <DivergingLikert
        records={records}
        codebook={codebook}
        items={items}
        scale={5}
        tone="evaluative"
        density="compact"
        endpoints={{ left, right }}
        invertItem={invertItem}
      />
    </figure>
  );
}
