import { useEffect, useRef, useState } from "react";
import * as Plot from "@observablehq/plot";

type Props = {
  options: Plot.PlotOptions;
  className?: string;
  /** Optional title for screen readers. */
  ariaLabel?: string;
};

/** Thin React wrapper around Observable Plot. Measures the host element via
 *  ResizeObserver and re-renders the figure whenever the container width
 *  changes, so charts fill the available space and react to viewport resizes
 *  (e.g. opening dev tools, rotating a phone). */
export function PlotFigure({ options, className, ariaLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = Math.floor(el.getBoundingClientRect().width);
      setWidth((prev) => (prev !== null && Math.abs((prev ?? 0) - w) < 4 ? prev : w));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !width || width < 80) return;
    const fig = Plot.plot({ ...options, width });
    fig.classList.add("plot-figure");
    if (ariaLabel) fig.setAttribute("aria-label", ariaLabel);
    el.replaceChildren(fig);
    return () => {
      fig.remove();
    };
  }, [options, width, ariaLabel]);

  return <div ref={ref} className={className} role="img" />;
}
