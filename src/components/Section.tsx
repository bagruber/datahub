import { cn } from "@/lib/cn";

type Props = {
  id?: string;
  title: string;
  text?: string;
  children: React.ReactNode;
  className?: string;
};

export function Section({ id, title, text, children, className }: Props) {
  return (
    <section
      id={id}
      className={cn("py-8 sm:py-10", className)}
      style={{ scrollMarginTop: "var(--leiste-unten, var(--kopf-hoehe))" }}
    >
      <h2 className="headline text-2xl sm:text-3xl mb-3">{title}</h2>
      {text && (
        <p
          className="max-w-prose text-ink-soft mb-6"
          dangerouslySetInnerHTML={{ __html: renderInlineMd(text) }}
        />
      )}
      <div className="space-y-8">{children}</div>
    </section>
  );
}

/** Tiny inline-only markdown: **bold** → <strong>. No HTML allowed in source. */
function renderInlineMd(s: string): string {
  const escaped = s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
