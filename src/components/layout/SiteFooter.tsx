import Link from "next/link";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-surface pt-16 text-on-surface-variant">
      <div className="mx-auto max-w-screen-2xl px-4 pb-10 sm:px-8">
        <div className="mb-14 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="space-y-4">
            <div className="font-headline text-xl font-extrabold text-primary">Generator Diet AI</div>
            <p className="text-sm leading-relaxed">
              Łączymy proste dane (sklep, budżet, lodówka) z planem, który da się ugotować. To nie zastępuje lekarza ani
              dietetyka — wspiera codzienne decyzje w kuchni.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/dethimnow/generator-diet-ai"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container transition hover:bg-primary hover:text-white"
                aria-label="GitHub"
              >
                <MaterialIcon name="code" className="text-sm" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-headline mb-4 font-bold text-foreground">Platforma</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/kreator" className="hover:text-primary">
                  Kreator planu
                </Link>
              </li>
              <li>
                <Link href="/panel" className="hover:text-primary">
                  Panel i historia
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline mb-4 font-bold text-foreground">Firma</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/blog" className="hover:text-primary">
                  Artykuły
                </Link>
              </li>
              <li>
                <a href="mailto:p_madejski@o2.pl" className="hover:text-primary">
                  Kontakt
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline mb-4 font-bold text-foreground">Newsletter</h4>
            <p className="text-sm">Wskazówki meal-prep i przepisy — bez spamu (wkrótce).</p>
            <div className="mt-4 flex gap-2 rounded-full border border-border/50 bg-card p-1.5">
              <input
                type="email"
                readOnly
                placeholder="Twój e-mail"
                className="min-w-0 flex-1 rounded-full border-0 bg-transparent px-4 text-sm outline-none"
                aria-label="E-mail do newslettera"
              />
              <span className="inline-flex items-center rounded-full bg-primary/15 px-4 py-2 text-xs font-bold text-primary sm:text-sm">
                Wkrótce
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 text-xs font-semibold uppercase tracking-wider text-muted md:flex-row">
          <span>© {new Date().getFullYear()} Generator Diet AI</span>
          <div className="flex flex-wrap justify-center gap-6">
            <span className="cursor-default">Polityka prywatności</span>
            <span className="cursor-default">Regulamin</span>
            <span className="cursor-default">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
