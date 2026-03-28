import Link from "next/link";
import { ArrowRight, Sparkles, ShoppingCart, Timer } from "lucide-react";
import { seoDietSpotlights } from "@/data/seo-diet-tags";

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <section className="relative border-b border-border bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-card px-4 py-1 text-xs font-medium text-primary shadow-sm ring-1 ring-border">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              AI + polskie sklepy
            </p>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Generator Diet AI — gotowa dieta w 60 sekund
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted">
              Wpisz swoje dane, wybierz cel i otrzymaj spersonalizowaną dietę na 7 dni + listę zakupów dopasowaną do
              Biedronki, Lidla i Żabki.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/kreator"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-base font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-dark"
              >
                Rozpocznij
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link
                href="/blog"
                className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Przeczytaj poradniki
              </Link>
            </div>
          </div>
          <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
            {[
              { icon: Timer, t: "Kreator krok po kroku", d: "Cel, typ diety, dane, preferencje — jasno i szybko." },
              { icon: ShoppingCart, t: "Lista zakupów", d: "Pogrupowana pod wybrany dyskont i budżet tygodniowy." },
              { icon: Sparkles, t: "Przepisy AI", d: "Polskie nazwy dań i proste kroki z czasem przygotowania." },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40"
              >
                <x.icon className="h-8 w-8 text-primary" aria-hidden />
                <h2 className="mt-3 font-semibold text-foreground">{x.t}</h2>
                <p className="mt-1 text-sm text-muted">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Blog SEO — popularne diety</h2>
            <p className="mt-1 text-muted">Artykuły 300–500 słów z tagami i słowami kluczowymi.</p>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-primary hover:underline">
            Wszystkie wpisy
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {seoDietSpotlights.map((card) => (
            <Link
              key={card.slug}
              href={`/blog/${card.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">{card.difficulty}</span>
              <h3 className="mt-2 text-lg font-semibold text-foreground group-hover:text-primary">{card.tag}</h3>
              <p className="mt-1 text-sm text-muted">{card.searches}</p>
              <p className="mt-2 text-sm font-medium text-foreground/80">{card.duration}</p>
              <span className="mt-3 text-sm font-semibold text-primary">Czytaj →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
