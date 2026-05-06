/** Small "← left  …  right →" caption shown beneath a chart card to
 *  spell out which direction the scale runs. Used by all diverging
 *  charts (Likert5, Likert6, Likert5Group panels, Price). */
export function ScaleCaption({ left, right }: { left: string; right: string }) {
  return (
    <div className="mt-2 flex items-baseline justify-between text-[11px] text-ink-muted px-1">
      <span>← {left}</span>
      <span>{right} →</span>
    </div>
  );
}
