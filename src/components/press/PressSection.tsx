import type { PressLink } from "@/lib/data";
import { PressCard } from "./PressCard";

export function PressSection({ press }: { press: PressLink[] }) {
  if (press.length === 0) return null;
  return (
    <section className="py-10 sm:py-12">
      <p className="eyebrow mb-2">Pressestimmen</p>
      <h2 className="headline text-2xl sm:text-3xl mb-5">In den Medien</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {press.map((link, i) => (
          <PressCard key={`${link.outlet}-${i}`} link={link} />
        ))}
      </div>
    </section>
  );
}
