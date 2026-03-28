import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PreferencesSection } from "@/components/panel/PreferencesSection";
import { PremiumCheckoutButton } from "@/components/panel/PremiumCheckoutButton";

export const metadata: Metadata = {
  title: "Twoje centrum kuchni",
};

export default async function PanelPage({
  searchParams,
}: {
  searchParams: Promise<{ premium?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium, premium_until, display_name")
    .eq("id", user.id)
    .single();

  const { data: prefs } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle();

  const { data: diets } = await supabase
    .from("diet_plans")
    .select("id, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const now = new Date();
  const premiumActive =
    profile?.is_premium === true ||
    (!!profile?.premium_until && new Date(profile.premium_until) > now);

  const sp = await searchParams;
  const premiumBanner =
    sp.premium === "1" ? "Dziękujemy! Subskrypcja Premium powinna być aktywna wkrótce." : null;

  const firstName = profile?.display_name?.split(/\s+/)[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-low/50 to-background px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-screen-2xl">
        {premiumBanner && (
          <p className="mb-6 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary ring-1 ring-primary/20">
            {premiumBanner}
          </p>
        )}

        <header className="flex flex-col gap-6 border-b border-border/60 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-primary">Panel</p>
            <h1 className="font-headline mt-2 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              Twoje Centrum Dowodzenia Kuchnią
            </h1>
            <p className="mt-2 max-w-xl text-lg text-on-surface-variant">
              Witaj{firstName ? `, ${firstName}` : ""}. Tu masz historię planów i preferencje — wracaj do ulubionych
              smaków zamiast do starych błędów.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                premiumActive ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-card text-muted ring-1 ring-border"
              }`}
            >
              {premiumActive ? "Premium aktywne" : "Plan darmowy — 1 plan / tydzień"}
            </span>
            {!premiumActive && <PremiumCheckoutButton />}
          </div>
        </header>

        {!premiumActive && (
          <div className="mt-10 rounded-[1.75rem] border border-primary/20 bg-primary p-8 text-white shadow-xl shadow-primary/15 md:p-10">
            <h2 className="font-headline text-xl font-extrabold md:text-2xl">Odblokuj nielimitowane generowanie</h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/90">
              Jedna kawa miesięcznie za spokój z zakupami i planami na cały rok — bez liczenia tygodniowych limitów.
            </p>
            <div className="mt-6">
              <PremiumCheckoutButton variant="onPrimary" />
            </div>
          </div>
        )}

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <section className="rounded-[1.5rem] border border-border/60 bg-card p-6 shadow-sm sm:p-8">
            <h2 className="font-headline text-xl font-bold text-foreground">Twoje poprzednie plany</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Nie wracaj do starych błędów — wracaj do ulubionych smaków.
            </p>
            <ul className="mt-6 space-y-3">
              {(diets ?? []).length === 0 && (
                <li className="text-sm text-on-surface-variant">Brak planów — stwórz pierwszy w kreatorze.</li>
              )}
              {(diets ?? []).map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/panel/diety/${d.id}`}
                    className="flex items-center justify-between rounded-2xl border border-border/80 bg-surface/50 px-4 py-3 text-sm font-bold transition hover:border-primary/35 hover:bg-primary/5"
                  >
                    <span>{d.title}</span>
                    <time className="text-xs font-semibold text-muted" dateTime={d.created_at}>
                      {new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeZone: "Europe/Warsaw" }).format(
                        new Date(d.created_at)
                      )}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/kreator"
              className="mt-6 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:opacity-95"
            >
              Nowy plan w kreatorze
            </Link>
          </section>

          <PreferencesSection initial={prefs} userId={user.id} />
        </div>
      </div>
    </div>
  );
}
