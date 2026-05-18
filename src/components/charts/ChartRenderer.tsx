import { lazy, Suspense } from "react";
import type { ChartSpec, Codebook, Dataset } from "@/lib/data";

// Each chart is lazy-loaded so a dataset page only pulls in the chart code it
// actually uses. Observable Plot + the diverging/SVG components together are
// ~300 KB; visiting Christkindlmarkt no longer downloads Radar/Venn3, etc.
//
// The `.then(m => ({default: m.X}))` shim is because our chart modules export
// named (not default) components — React.lazy requires a `default` export.
const BarH        = lazy(() => import("./BarH").then((m)        => ({ default: m.BarH })));
const BarV        = lazy(() => import("./BarV").then((m)        => ({ default: m.BarV })));
// One shared lazy chunk for the Likert/Price family — they all funnel
// through <DivergingLikert /> with different scale + tone + endpoints.
const DivergingLikert = lazy(() => import("./DivergingLikert").then((m) => ({ default: m.DivergingLikert })));
const Diverging3  = lazy(() => import("./Diverging3").then((m)  => ({ default: m.Diverging3 })));
const Pie         = lazy(() => import("./Pie").then((m)         => ({ default: m.Pie })));
const Likert5Group = lazy(() => import("./Likert5Group").then((m) => ({ default: m.Likert5Group })));
const Radar       = lazy(() => import("./Radar").then((m)       => ({ default: m.Radar })));
const Correlation = lazy(() => import("./Correlation").then((m) => ({ default: m.Correlation })));
const Venn2       = lazy(() => import("./Venn2").then((m)       => ({ default: m.Venn2 })));
const Venn3       = lazy(() => import("./Venn3").then((m)       => ({ default: m.Venn3 })));

type Props = {
  spec: ChartSpec;
  records: Dataset["records"];
  codebook: Codebook;
  /** When the wrapping page already renders a title, suppress the chart's own. */
  suppressTitle?: boolean;
};

/** Skeleton shown while a chart bundle is being fetched. Sized so the
 *  surrounding card height doesn't snap when the chart resolves. */
function ChartFallback() {
  return (
    <div
      className="h-48 sm:h-56 rounded-md bg-cream-dark/60 animate-pulse"
      aria-busy="true"
      aria-label="Diagramm wird geladen"
    />
  );
}

export function ChartRenderer({ spec, records, codebook, suppressTitle }: Props) {
  void suppressTitle;
  return (
    <Suspense fallback={<ChartFallback />}>
      {render(spec, records, codebook)}
    </Suspense>
  );
}

function render(spec: ChartSpec, records: Dataset["records"], codebook: Codebook) {
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
    case "bar_v":
      return (
        <BarV
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
        <DivergingLikert
          records={records}
          codebook={codebook}
          items={spec.items}
          scale={6}
          tone="evaluative"
          endpoints={spec.endpoints}
        />
      );
    case "likert5":
      return (
        <DivergingLikert
          records={records}
          codebook={codebook}
          items={spec.items}
          scale={5}
          tone="evaluative"
          endpoints={spec.endpoints}
        />
      );
    case "price":
      return (
        <DivergingLikert
          records={records}
          codebook={codebook}
          items={spec.items}
          scale={spec.scale}
          tone="neutral"
          endpoints={spec.endpoints}
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
          codebook={codebook}
          dimLabels={spec.dimLabels}
          invertedDims={spec.invertedDims ?? []}
          innovations={spec.innovations}
          title={spec.title}
          endpoints={spec.endpoints}
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
