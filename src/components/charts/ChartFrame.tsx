import { cn } from "@/lib/cn";
import { ScaleCaption } from "./ScaleCaption";

type Width = "narrow" | "normal" | "wide";

const WIDTH_CLASS: Record<Width, string> = {
  narrow: "mx-auto w-full max-w-md",
  normal: "mx-auto w-full max-w-2xl",
  wide:   "w-full",
};

type Props = {
  children: React.ReactNode;
  /** Adds a `← left  …  right →` caption below the chart body. */
  caption?: { left: string; right: string };
  /** Adds a visually-hidden table beneath the chart for screen readers. */
  table?: React.ReactNode;
  width?: Width;
  className?: string;
};

/** Wraps a chart's body (Plot figure or custom SVG) with the standard shell:
 *  width container, optional ScaleCaption, optional sr-only ChartTable. Every
 *  chart used to repeat this; one place now. */
export function ChartFrame({ children, caption, table, width = "normal", className }: Props) {
  return (
    <figure className={cn(WIDTH_CLASS[width], className)}>
      {/* Nur der Diagrammkörper scrollt, nicht die ganze Seite. Manche Charts
          setzen eine Mindestbreite (BarV: Kategorien × 36px + Ränder). Ohne
          diesen Container schiebt die ein schmales Display auf — man kann dann
          über den Inhalt hinaus nach rechts wischen und herauszoomen.
          Bildunterschrift und Tabelle bleiben bewusst außerhalb. */}
      <div className="overflow-x-auto">{children}</div>
      {caption && <ScaleCaption left={caption.left} right={caption.right} />}
      {table}
    </figure>
  );
}
