import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card py-10 text-sm text-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="max-w-md">
          Generator Diet AI to narzędzie wspierające planowanie posiłków. Nie zastępuje konsultacji z lekarzem ani
          dietetykiem.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/kreator" className="hover:text-primary">
            Kreator
          </Link>
          <Link href="/blog" className="hover:text-primary">
            Blog
          </Link>
          <Link href="/panel" className="hover:text-primary">
            Panel
          </Link>
        </div>
      </div>
      <p className="mx-auto mt-6 max-w-6xl px-4 text-center text-xs text-muted/80 sm:px-6">
        © {new Date().getFullYear()} Generator Diet AI
      </p>
    </footer>
  );
}
