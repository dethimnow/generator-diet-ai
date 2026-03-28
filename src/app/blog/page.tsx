import Link from "next/link";
import type { Metadata } from "next";
import { blogArticles } from "@/data/blog";

export const metadata: Metadata = {
  title: "Blog — diety, keto, low carb, pudełkowa",
  description: "Artykuły o diecie keto, przeciwzapalnej, lekkostrawnej, nordyckiej i pudełkowej z linkami do kreatora.",
};

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">Blog Generator Diet AI</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Poradniki SEO z wewnętrznymi odniesieniami do kreatora. Każdy tekst to ok. 300–500 słów po polsku.
      </p>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {blogArticles.map((a) => (
          <li key={a.slug}>
            <article className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/30">
              <time className="text-xs text-muted" dateTime={a.publishedAt}>
                {a.publishedAt}
              </time>
              <h2 className="mt-2 text-xl font-semibold text-foreground">
                <Link href={`/blog/${a.slug}`} className="hover:text-primary">
                  {a.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-muted">{a.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {a.keywords.slice(0, 4).map((k) => (
                  <span key={k} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {k}
                  </span>
                ))}
              </div>
              <Link
                href={`/blog/${a.slug}`}
                className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Czytaj artykuł
              </Link>
            </article>
          </li>
        ))}
      </ul>
      <div className="mt-12 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-8 text-center">
        <p className="font-medium text-foreground">Gotowy na własny plan?</p>
        <Link
          href="/kreator"
          className="mt-3 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Otwórz kreator diety
        </Link>
      </div>
    </div>
  );
}
