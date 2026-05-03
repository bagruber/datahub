import { Link, NavLink } from "react-router-dom";
import { RainbowStripe } from "./RainbowStripe";
import { cn } from "@/lib/cn";

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur border-b border-ink-line">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <span
            aria-hidden
            className="inline-block w-8 h-8 rounded-md bg-red-500 grid place-items-center text-cream font-display font-bold"
          >
            M
          </span>
          <span className="leading-tight">
            <span className="block headline text-[1.05rem] sm:text-[1.2rem]">Datenhub</span>
            <span className="block eyebrow text-[0.65rem]">Moosburg an der Isar</span>
          </span>
        </Link>
        <nav aria-label="Hauptnavigation" className="flex items-center gap-1 sm:gap-2">
          <NavItem to="/">Übersicht</NavItem>
          <NavItem to="/about">Über</NavItem>
        </nav>
      </div>
      <RainbowStripe />
    </header>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          "px-3 py-2 rounded-md text-sm font-semibold transition-colors",
          isActive ? "text-red-700" : "text-ink-soft hover:text-ink",
        )
      }
    >
      {children}
    </NavLink>
  );
}
