import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogArticles, getArticleBySlug } from "@/data/blog";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticleBySlug(slug);
  if (!a) return { title: "Nie znaleziono" };
  return {
    title: a.title,
    description: a.description,
    keywords: a.keywords,
    openGraph: { title: a.title, description: a.description },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = getArticleBySlug(slug);
  if (!a) notFound();

  const paragraphs = a.body.split(/\n\n+/).filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/blog" className="text-sm font-medium text-primary hover:underline">
        ← Blog
      </Link>
      <header className="mt-6">
        <time className="text-sm text-muted" dateTime={a.publishedAt}>
          {a.publishedAt}
        </time>
        <h1 className="mt-2 text-3xl font-bold text-foreground">{a.title}</h1>
        <p className="mt-3 text-lg text-muted">{a.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {a.keywords.map((k) => (
            <span key={k} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {k}
            </span>
          ))}
        </div>
      </header>
      <div className="mt-10 max-w-none text-foreground/90">
        {paragraphs.map((p, i) => (
          <p key={i} className="mb-4 leading-relaxed">
            {p}
          </p>
        ))}
      </div>
      <div className="mt-12 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Stwórz dietę w aplikacji</h2>
        <p className="mt-2 text-sm text-muted">
          Powiązane słowa kluczowe znajdziesz w kreatorze — wybierz cel, typ diety i sklep, a AI przygotuje tydzień posiłków
          oraz listę zakupów.
        </p>
        <Link
          href="/kreator"
          className="mt-4 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Generuj dietę
        </Link>
      </div>
    </article>
  );
}
