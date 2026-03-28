import Link from "next/link";
import { AuthNav } from "./AuthNav";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const nav = [
  { href: "/kreator", label: "Kreator" },
  { href: "/blog", label: "Blog" },
  { href: "/panel", label: "Panel" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/75 shadow-sm shadow-primary/5 backdrop-blur-xl">
      <nav
        className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-3 px-4 sm:h-[4.25rem] sm:px-8"
        aria-label="Główna nawigacja"
      >
        <Link href="/" className="flex items-center gap-2 font-headline text-lg font-extrabold tracking-tight text-primary sm:text-xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <MaterialIcon name="restaurant_menu" className="text-[22px]" fill />
          </span>
          <span className="hidden sm:inline">Generator Diet AI</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {nav.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-bold text-on-surface-variant transition hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/panel"
            className="hidden text-sm font-bold text-on-surface-variant hover:text-primary lg:inline"
          >
            Premium
          </Link>
          <AuthNav />
          <Link
            href="/kreator"
            className="hidden rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-md shadow-primary/20 transition hover:opacity-95 sm:inline-flex sm:items-center sm:gap-2"
          >
            Stwórz plan
            <MaterialIcon name="auto_awesome" className="text-base" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
