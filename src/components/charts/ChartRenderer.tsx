import type { ChartSpec, Codebook, Dataset } from "@/lib/data";
import { BarH } from "./BarH";
import { Likert6 } from "./Likert6";
import { Likert5 } from "./Likert5";
import { Diverging3 } from "./Diverging3";
import { Pie } from "./Pie";
import { Likert5Group } from "./Likert5Group";
import { Radar } from "./Radar";
import { Correlation } from "./Correlation";
import { Venn2 } from "./Venn2";
import { Venn3 } from "./Venn3";

type Props = {
  spec: ChartSpec;
  records: Dataset["records"];
  codebook: Codebook;
  /** When the wrapping page already renders a title, suppress the chart's own. */
  suppressTitle?: boolean;
};

export function ChartRenderer({ spec, records, codebook, suppressTitle }: Props) {
  void suppressTitle; // each chart now omits its own caption — kept for future use
  switch (spec.type) {
    case "bar_h":
      return (
        <BarH
          records={records}
          codebook={codebook}
          source={spec.source}
          items={spec.items}
          slots={spec.slots}
          preserveOrder={spec.preserveOrder}
          color={spec.color}
          title={spec.title}
        />
      );
    case "likert6":
      return (
        <Likert6
          records={records}
          codebook={codebook}
          items={spec.items}
          title={spec.title}
        />
      );
    case "likert5":
      return (
        <Likert5
          records={records}
          codebook={codebook}
          items={spec.items}
          title={spec.title}
        />
      );
    case "diverging3":
      return (
        <Diverging3
          records={records}
          source={spec.source}
          options={spec.options}
          title={spec.title}
        />
      );
    case "pie": {
      // If `items` provided, Pie handles grouped slices itself. Otherwise
      // derive labels/values from the codebook so authors can ship just
      // `{type:'pie', source}`.
      if (spec.items && spec.items.length > 0) {
        return (
          <Pie
            records={records}
            source={spec.source}
            items={spec.items}
            title={spec.title}
          />
        );
      }
      const cb = codebook[spec.source] ?? {};
      const cbKeys = Object.keys(cb).map(Number).filter((n) => !Number.isNaN(n));
      const labels = spec.labels ?? cbKeys.map((k) => cb[String(k)]);
      const values = spec.values ?? cbKeys;
      if (labels.length === 0 || values.length === 0) {
        return <UnsupportedChart type={spec.type} note="Keine Kategorien im Codebuch." />;
      }
      return (
        <Pie
          records={records}
          source={spec.source}
          labels={labels}
          values={values}
          colors={spec.colors}
          title={spec.title}
        />
      );
    }
    case "likert5_group":
      return (
        <Likert5Group
          records={records}
          dimLabels={spec.dimLabels}
          invertedDims={spec.invertedDims ?? []}
          innovations={spec.innovations}
          title={spec.title}
        />
      );
    case "radar":
      return (
        <Radar
          records={records}
          dimLabels={spec.dimLabels}
          invertedDims={spec.invertedDims ?? []}
          innovations={spec.innovations}
          title={spec.title}
        />
      );
    case "correlation":
      return (
        <Correlation
          records={records}
          sources={spec.sources}
          title={spec.title}
        />
      );
    case "venn2": {
      // Default to high-contrast red + blue.
      const colors = spec.colors ?? ["#c8102e", "#1f77b4"];
      return (
        <Venn2
          records={records}
          source={spec.source}
          values={spec.values}
          labels={spec.labels}
          colors={colors}
          title={spec.title}
        />
      );
    }
    case "venn3": {
      // Default: yellow + blue + red (high pairwise contrast on cream).
      const colors = spec.colors ?? ["#e2a900", "#1f77b4", "#c8102e"];
      return (
        <Venn3
          records={records}
          source={spec.source}
          values={spec.values}
          labels={spec.labels}
          colors={colors}
          title={spec.title}
        />
      );
    }
    default:
      return <UnsupportedChart type={(spec as { type: string }).type} />;
  }
}

function UnsupportedChart({ type, note }: { type: string; note?: string }) {
  return (
    <div className="rounded-md border border-dashed border-ink-line p-5 text-ink-muted text-sm">
      Charttyp <code className="font-mono text-ink">{type}</code> noch nicht
      verfügbar.
      {note && <span className="block mt-1 text-xs text-ink-muted/80">{note}</span>}
    </div>
  );
}
