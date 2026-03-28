import Link from "next/link";
import Image from "next/image";
import { seoDietSpotlights } from "@/data/seo-diet-tags";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const HERO_IMG =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&h=900&fit=crop&q=80";

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative flex min-h-[640px] items-center overflow-hidden px-4 py-16 sm:px-8 lg:min-h-[780px] lg:py-24">
        <div className="absolute right-0 top-0 -z-10 h-full w-1/2 rounded-bl-[80px] bg-surface-low/80 opacity-90 lg:w-[48%]" />
        <div className="mx-auto grid w-full max-w-screen-2xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="z-10 space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              <MaterialIcon name="bolt" className="text-lg" fill />
              Oszczędzasz czas i pieniądze w sklepie
            </div>
            <h1 className="font-headline text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Dieta, która dopasuje się do Twojej{" "}
              <span className="text-primary">lodówki</span> i{" "}
              <span className="text-primary-mid">portfela</span>. W 60 sekund.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
              Przestań zastanawiać się „co na obiad”. AI ułoży dla Ciebie jadłospis z produktów z Twojego ulubionego
              sklepu, uwzględniając Twój budżet i czas.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/kreator"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/25 transition hover:scale-[1.02] active:scale-[0.98]"
              >
                Stwórz mój darmowy plan
                <MaterialIcon name="auto_awesome" className="text-xl" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-8 py-4 text-base font-bold text-[#38485d] transition hover:bg-surface-container-high"
              >
                Zobacz inspiracje
                <MaterialIcon name="menu_book" className="text-xl" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <div className="flex -space-x-3" aria-hidden>
                <div className="h-12 w-12 rounded-full border-4 border-background bg-gradient-to-br from-primary/40 to-primary-mid/50" />
                <div className="h-12 w-12 rounded-full border-4 border-background bg-gradient-to-br from-emerald-200 to-teal-300" />
                <div className="h-12 w-12 rounded-full border-4 border-background bg-gradient-to-br from-sky-200 to-blue-300" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Dołącz do <span className="text-primary">+1500 osób</span>, które przestały marnować jedzenie.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 scale-75 rounded-full bg-primary/10 blur-[100px] transition-transform duration-700" />
            <div className="relative aspect-square rotate-3 overflow-hidden rounded-[2.5rem] shadow-2xl shadow-primary/10 transition-transform duration-500 hover:rotate-0">
              <Image
                src={HERO_IMG}
                alt="Kolorowa miska pełna warzyw i zdrowych składników"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="glass-panel absolute bottom-6 left-6 right-6 flex items-center gap-4 rounded-2xl p-5 shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                  <MaterialIcon name="monitoring" className="text-2xl text-primary" fill />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Analiza w toku</p>
                  <p className="text-sm font-bold text-foreground">Plan dopasowany do sklepu i budżetu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-surface px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl space-y-3">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                Laboratorium w Twojej kieszeni
              </h2>
              <p className="text-lg text-on-surface-variant">
                Zamieniamy „nie wiem co kupić” w konkretną listę i proste przepisy — bez magii, za to z głową.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="h-1 w-12 rounded-full bg-primary" />
              <div className="h-1 w-4 rounded-full bg-primary/25" />
              <div className="h-1 w-4 rounded-full bg-primary/25" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: "shopping_cart" as const,
                title: "Smart shopping",
                body: "Lista zakupów pod Twój sklep: Biedronka, Lidl lub Żabka — mniej zbędnych zakupów i stresu przy kasie.",
                href: "/kreator",
                cta: "Zacznij od sklepu",
              },
              {
                icon: "neurology" as const,
                title: "Generowanie AI",
                body: "Silnik układa tydzień posiłków z polskimi nazwami, realnym czasem gotowania i Twoim celem (forma / masa / zdrowie).",
                href: "/kreator",
                cta: "Zobacz kreator",
              },
              {
                icon: "task_alt" as const,
                title: "Realizacja",
                body: "Kroki krok po kroku, porcje i składniki w gramach oraz „łyżkach” — łatwiej ugotować niż czytać kolejny artykuł.",
                href: "/panel",
                cta: "Panel po zalogowaniu",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="group rounded-2xl border border-border/60 bg-card p-10 shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container transition-transform duration-500 group-hover:scale-110">
                  <MaterialIcon name={card.icon} className="text-4xl text-primary" />
                </div>
                <h3 className="font-headline mb-4 text-2xl font-bold text-foreground">{card.title}</h3>
                <p className="mb-6 leading-relaxed text-on-surface-variant">{card.body}</p>
                <Link
                  href={card.href}
                  className="inline-flex items-center gap-2 font-bold text-primary transition-all group-hover:gap-3"
                >
                  {card.cta}
                  <MaterialIcon name="arrow_forward" className="text-sm" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Sync / trust */}
      <section className="overflow-hidden bg-surface-low/40 px-4 py-20 sm:px-8">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center gap-16 lg:flex-row lg:gap-24">
          <div className="relative w-full lg:w-1/2">
            <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
            <div className="relative rounded-[2rem] bg-card p-8 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <span className="font-headline text-lg font-bold">Twój dzisiejszy miks</span>
                <MaterialIcon name="more_horiz" className="text-on-surface-variant" />
              </div>
              <div className="space-y-5">
                <div className="flex items-center gap-4 rounded-2xl bg-surface p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-sm font-black text-primary">
                    85
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">Plan pod Twój budżet</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full w-[85%] rounded-full bg-primary-mid" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl bg-surface p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-sm font-black text-blue-600">
                    92
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">Czas w kuchni pod kontrolą</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full w-[92%] rounded-full bg-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full space-y-5 lg:w-1/2">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Precyzja danych</p>
            <h2 className="font-headline text-3xl font-bold leading-tight text-foreground md:text-4xl">
              Zsynchronizuj kuchnię z realnym życiem
            </h2>
            <p className="text-lg leading-relaxed text-on-surface-variant">
              Podajesz sklep, budżet i to, co masz w lodówce — dostajesz plan, który da się zrealizować, a nie tylko
              wygląda ładnie na screenie.
            </p>
            <ul className="space-y-3">
              {[
                "Produkty z Biedronki, Lidla i Żabki (bez egzotycznych „must have”).",
                "Kalibracja pod cel: redukcja, masa lub zdrowe utrzymanie.",
                "Lista zakupów i przepisy w jednym miejscu — panel po zalogowaniu.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 font-medium text-foreground">
                  <MaterialIcon name="check_circle" className="mt-0.5 text-primary" fill />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SEO / blog */}
      <section className="mx-auto max-w-screen-2xl px-4 py-20 sm:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-headline text-3xl font-bold text-foreground md:text-4xl">Popularne plany żywieniowe</h2>
            <p className="mt-2 max-w-xl text-lg text-on-surface-variant">
              Wybierz gotowy fundament i dostosuj go pod siebie w kreatorze.
            </p>
          </div>
          <Link href="/blog" className="font-bold text-primary hover:underline">
            Cały blog
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {seoDietSpotlights.map((card) => (
            <Link
              key={card.slug}
              href={`/blog/${card.slug}`}
              className="group flex flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/35 hover:shadow-lg"
            >
              <span className="text-xs font-bold uppercase tracking-wide text-primary">{card.difficulty}</span>
              <h3 className="font-headline mt-2 text-lg font-bold text-foreground group-hover:text-primary">
                {card.tag}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-on-surface-variant">{card.benefit}</p>
              <span className="mt-4 text-sm font-bold text-primary">Czytaj artykuł →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-primary px-4 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-headline text-3xl font-extrabold md:text-4xl">
            Gotowy na dietę, która nie smakuje jak tektura?
          </h2>
          <p className="mx-auto mt-4 text-lg text-white/85">
            Wygeneruj swój pierwszy plan za darmo. Bez podpinania karty.
          </p>
          <Link
            href="/kreator"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-base font-bold text-primary shadow-xl transition hover:scale-[1.02]"
          >
            Sprawdź, co dziś zjesz
          </Link>
        </div>
      </section>
    </div>
  );
}
