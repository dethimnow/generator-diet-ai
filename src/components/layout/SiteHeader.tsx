import Link from "next/link";
import { Leaf } from "lucide-react";
import { AuthNav } from "./AuthNav";

const links = [
  { href: "/blog", label: "Blog" },
  { href: "/kreator", label: "Kreator diety" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Leaf className="h-5 w-5" aria-hidden />
          </span>
          <span className="hidden sm:inline">Generator Diet AI</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-4" aria-label="Główne">
          <AuthNav />
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-2 py-2 text-sm font-medium text-muted transition hover:bg-primary/10 hover:text-primary sm:px-3"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/kreator"
            className="ml-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
          >
            Generuj dietę
          </Link>
        </nav>
      </div>
    </header>
  );
}
